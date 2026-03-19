import os
import json
import base64
import hashlib
from typing import Any, Dict

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


_SECRET = os.getenv("QUIZ_ENCRYPTION_SECRET", "dev-quiz-secret")
_SALT = os.getenv("QUIZ_ENCRYPTION_SALT", "quiz-salt")
_ITERATIONS = int(os.getenv("QUIZ_ENCRYPTION_ITERATIONS", "100000"))


def _get_key() -> bytes:
    """Derive a 256-bit AES key from the shared secret using PBKDF2-HMAC-SHA256.

    The same parameters must be mirrored on the frontend when deriving the key.
    """

    return hashlib.pbkdf2_hmac(
        "sha256",
        _SECRET.encode("utf-8"),
        _SALT.encode("utf-8"),
        _ITERATIONS,
        dklen=32,
    )


def is_encrypted(envelope: Any) -> bool:
    """Quick check whether an incoming payload looks like an encrypted envelope."""

    return (
        isinstance(envelope, dict)
        and "iv" in envelope
        and "ciphertext" in envelope
        and isinstance(envelope.get("iv"), str)
        and isinstance(envelope.get("ciphertext"), str)
    )


def encrypt_json(data: Dict[str, Any]) -> Dict[str, str]:
    """Encrypt a JSON-serialisable object and return an envelope.

    Envelope shape:
    {
      "iv": "base64",
      "ciphertext": "base64"
    }
    """

    key = _get_key()
    aesgcm = AESGCM(key)
    iv = os.urandom(12)  # 96‑bit nonce for AES-GCM
    plaintext = json.dumps(data, separators=(",", ":")).encode("utf-8")
    ciphertext = aesgcm.encrypt(iv, plaintext, None)

    return {
        "iv": base64.b64encode(iv).decode("ascii"),
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
    }


def decrypt_json(envelope: Dict[str, Any]) -> Dict[str, Any]:
    """Decrypt an envelope produced by encrypt_json back into a Python object."""

    if not is_encrypted(envelope):
        raise ValueError("Payload does not look like an encrypted envelope")

    iv_b64 = envelope["iv"]
    ct_b64 = envelope["ciphertext"]

    iv = base64.b64decode(iv_b64)
    ciphertext = base64.b64decode(ct_b64)

    key = _get_key()
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(iv, ciphertext, None)

    return json.loads(plaintext.decode("utf-8"))
