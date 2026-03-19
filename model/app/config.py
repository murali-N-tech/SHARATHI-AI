# Configuration file for the application
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import os
from pathlib import Path
try:
	from dotenv import load_dotenv
	# Load .env from project root (model/.env)
	env_path = Path(__file__).resolve().parents[1] / ".env"
	if env_path.exists():
		load_dotenv(env_path)
except Exception:
	# dotenv is optional; if not installed, environment vars must be set externally
	pass

"""Central configuration for model service (LLM + Mongo + quiz).

Includes provider toggles for Ollama, Groq and (optionally) Gemini so that
route modules like `pdf_processing` can feature-flag different backends
without causing import-time errors if a provider isn't used.
"""

# =========================
# OLLAMA CONFIG
# =========================
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3"

# =========================
# GEMINI CONFIG (Optional)
# =========================
# These are used only in pdf_processing when USE_GEMINI is enabled.
USE_GEMINI = os.getenv("USE_GEMINI", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

# =========================
# GROQ CONFIG (Alternative to Ollama)
# =========================
USE_GROQ = os.getenv("USE_GROQ", "false").lower() == "true"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")  # or llama2-70b-4096
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Support multiple GROQ API keys via comma-separated env var `GROQ_API_KEYS`.
# If not provided, fall back to single `GROQ_API_KEY` for compatibility.
import random

_groq_keys_env = os.getenv("GROQ_API_KEYS", "").strip()
if _groq_keys_env:
	GROQ_API_KEYS = [k.strip() for k in _groq_keys_env.split(",") if k.strip()]
elif GROQ_API_KEY:
	GROQ_API_KEYS = [GROQ_API_KEY]
else:
	GROQ_API_KEYS = []

def get_random_api_key(service: str = "GROQ") -> str | None:
	"""Return a random API key for the given service or None if unavailable.

	Currently only supports 'GROQ' (case-insensitive). This keeps backward
	compatibility by falling back to `GROQ_API_KEY` when `GROQ_API_KEYS` is not set.
	"""
	svc = (service or "").upper()
	if svc == "GROQ":
		# Prefer keys that are not in the exception set (tracked separately)
		try:
			_exceptions = GROQ_EXCEPTIONS
		except NameError:
			_exceptions = set()

		available = [k for k in GROQ_API_KEYS if k and k not in _exceptions]
		if not available and GROQ_API_KEY and GROQ_API_KEY not in _exceptions:
			available = [GROQ_API_KEY]

		if not available:
			return None

		choice = random.choice(available)

		# Log which key was chosen (masked for safety)
		def _mask(k: str) -> str:
			if not k:
				return "(empty)"
			k = str(k)
			if len(k) <= 8:
				return k
			return f"{k[:4]}...{k[-4:]}"

		print(f"[GROQ KEY] Selected key: {_mask(choice)}")
		return choice
	return None


# Failure tracking for GROQ keys: when a key hits rate-limits or other
# unrecoverable errors we increment its failure count. After
# `GROQ_MAX_FAILURES` the key is moved into `GROQ_EXCEPTIONS` and will be
# excluded from future selections until the process restarts.
import threading
GROQ_FAILURE_COUNTS: dict = {}
GROQ_EXCEPTIONS: set = set()
_groq_lock = threading.Lock()
GROQ_MAX_FAILURES = int(os.getenv("GROQ_MAX_FAILURES", "10"))

def report_key_failure(key: str, increment: int = 1) -> None:
	"""Record a failure for `key`. If failures reach GROQ_MAX_FAILURES,
	add the key to `GROQ_EXCEPTIONS` so it won't be selected.
	"""
	if not key:
		return
	with _groq_lock:
		GROQ_FAILURE_COUNTS[key] = GROQ_FAILURE_COUNTS.get(key, 0) + increment
		count = GROQ_FAILURE_COUNTS[key]
		masked = (key[:4] + "..." + key[-4:]) if len(key) > 8 else key
		print(f"[GROQ KEY] Failure recorded for {masked}: {count}/{GROQ_MAX_FAILURES}")
		if count >= GROQ_MAX_FAILURES:
			GROQ_EXCEPTIONS.add(key)
			# Also remove from GROQ_API_KEYS if present to avoid future selection
			try:
				GROQ_API_KEYS.remove(key)
			except Exception:
				pass
			print(f"[GROQ KEY] Marked key as excluded after {count} failures: {masked}")


def groq_post(payload: dict, timeout: int = 30):
	"""Issue a POST to `GROQ_API_URL` rotating through available keys on
	rate-limit (429) errors. Returns a successful `requests.Response` or
	raises the last exception encountered.
	"""
	import requests
	import random as _rnd

	with _groq_lock:
		candidates = [k for k in GROQ_API_KEYS if k and k not in GROQ_EXCEPTIONS]
		if not candidates and GROQ_API_KEY and GROQ_API_KEY not in GROQ_EXCEPTIONS:
			candidates = [GROQ_API_KEY]

	if not candidates:
		raise RuntimeError("No GROQ API keys available")

	# Try keys in a random order; on 429 mark key failure and continue.
	_rnd.shuffle(candidates)
	last_exc = None

	for key in candidates:
		headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
		try:
			resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=timeout)
			if resp.status_code == 429:
				# Record a failure for this key and try the next one
				report_key_failure(key)
				print(f"[GROQ POST] Key rate-limited, trying next key (masked: {key[:4]}...{key[-4:]})")
				last_exc = requests.exceptions.HTTPError(f"429 for key {key}")
				continue
			if resp.status_code >= 400:
				print("[GROQ ERROR] Status:", resp.status_code)
				print("[GROQ ERROR] Body:\n", resp.text)
			resp.raise_for_status()
			return resp
		except requests.exceptions.HTTPError as e:
			# If it's a 429 we've already recorded it; otherwise keep as last_exc
			last_exc = e
		except Exception as e:
			last_exc = e

	# If we got here, no key succeeded
	raise last_exc or RuntimeError("All GROQ keys failed")

# =========================
# MONGODB CONFIG
# =========================
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "adaptive_quiz")
COLLECTION = os.getenv("COLLECTION", "sessions")

# =========================
# QUIZ CONFIG
# =========================
MAX_RETRIES = 5
SEMANTIC_THRESHOLD = 0.85

# =========================
# PERSISTENT STATE
# =========================
mongo = MongoClient(MONGO_URL)
db = mongo[DB_NAME]
sessions = db[COLLECTION]

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

PREFETCH_CACHE = {}
