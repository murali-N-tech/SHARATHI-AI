// Symmetric AES-GCM encryption utilities for quiz APIs
// NOTE: This is obfuscation of network payloads, not a replacement for HTTPS.

const SECRET = import.meta.env.VITE_QUIZ_ENCRYPTION_SECRET || "dev-quiz-secret";
const SALT = import.meta.env.VITE_QUIZ_ENCRYPTION_SALT || "quiz-salt";
const ITERATIONS = Number(import.meta.env.VITE_QUIZ_ENCRYPTION_ITERATIONS || 100000);

let cachedKeyPromise = null;

async function getKey() {
  if (cachedKeyPromise) return cachedKeyPromise;

  cachedKeyPromise = (async () => {
    const enc = new TextEncoder();
    const secretData = enc.encode(SECRET);
    const saltData = enc.encode(SALT);

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      secretData,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltData,
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  })();

  return cachedKeyPromise;
}

function bufToBase64(buf) {
  let binary = "";
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuf(b64) {
  const binary = window.atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a JSON-serialisable object into an envelope:
 * { iv: base64, ciphertext: base64 }
 */
export async function encryptPayload(obj) {
  const key = await getKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(obj));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return {
    iv: bufToBase64(iv),
    ciphertext: bufToBase64(new Uint8Array(ciphertext)),
  };
}

/**
 * Decrypt an envelope produced by encryptPayload back to an object.
 */
export async function decryptPayload(envelope) {
  if (!envelope || typeof envelope !== "object") {
    throw new Error("decryptPayload: invalid envelope");
  }
  if (!("iv" in envelope) || !("ciphertext" in envelope)) {
    throw new Error("decryptPayload: envelope missing iv/ciphertext");
  }

  const key = await getKey();
  const iv = base64ToBuf(envelope.iv);
  const ciphertext = base64ToBuf(envelope.ciphertext);

  const plaintextBuf = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  const json = dec.decode(plaintextBuf);
  return JSON.parse(json);
}

export function isEncryptedEnvelope(envelope) {
  return (
    !!envelope &&
    typeof envelope === "object" &&
    typeof envelope.iv === "string" &&
    typeof envelope.ciphertext === "string"
  );
}
