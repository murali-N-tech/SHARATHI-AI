from fastapi import APIRouter, HTTPException
import requests
import json
import uuid
import threading
from typing import Any, Dict

from app.config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    MAX_RETRIES,
    PREFETCH_CACHE,
    USE_GROQ,
    GROQ_MODEL,
    GROQ_API_URL,
    get_random_api_key,
    groq_post,
    report_key_failure,
    db,
)
from app.models import QuizRequest
from app.prompts.quiz_prompt import QUIZ_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string
from app.utils.quiz_logic import get_level_description, auto_adjust_level
from app.utils.semantic import exact_repeat, semantic_repeat
from app.db.mongo import load_session_history, save_question
from app.utils.crypto_utils import encrypt_json, decrypt_json, is_encrypted
import re

router = APIRouter(prefix="/quiz", tags=["quiz"])

def clean_option_text(option: str) -> str:
    """Remove 'Option A:', 'Option B:', etc. prefixes from option text"""
    # Match patterns like "Option A: ", "Option B: ", "(A) ", "(a) ", "A. ", etc.
    cleaned = re.sub(r'^(?:Option\s+[A-Z]:|[A-Z]\.|[A-Z]\)|\([A-Z]\))\s*', '', option, flags=re.IGNORECASE)
    return cleaned.strip()

def transform_backend_to_frontend(backend_data: dict) -> dict:
    """Transform backend response format to frontend format
    
    Backend format: correct_option_index, question_text, code_context
    Frontend format: correctIndex, question, code_context
    """
    return {
        "id": backend_data.get("question_id", ""),
        "question": backend_data.get("question_text", ""),
        "options": backend_data.get("options", []),
        "correctIndex": backend_data.get("correct_option_index"),  # Validated, guaranteed 0-3
        "hint": backend_data.get("hint", ""),
        "code_context": backend_data.get("code_context"),
        "explanation": backend_data.get("explanation", "")
    }

def call_groq_api(prompt: str, temperature: float) -> str:
    """Call Groq API and return the response text"""
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        # Use max_completion_tokens as per Groq chat completions API
        "max_completion_tokens": 2000,
    }
    # Use groq_post helper which rotates keys on 429 and reports failures
    resp = groq_post(payload, timeout=30)
    result = resp.json()
    return result["choices"][0]["message"]["content"]

def call_ollama_api(prompt: str, temperature: float) -> str:
    """Call Ollama API and return the response text"""
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": temperature}
        },
        timeout=30
    )
    response.raise_for_status()
    return response.json()["response"]

def generate_quiz_core(req: QuizRequest, session_id: str):
    """Core quiz generation logic"""
    # Load persisted history and combine with request history
    stored = load_session_history(session_id)
    combined_history = stored + [h.dict() if hasattr(h, 'dict') else h for h in req.history]

    # Auto-adjust difficulty
    adjusted_level = auto_adjust_level(req.level, combined_history)
    
    print(f"[QUIZ CORE] Starting generation...")
    print(f"  Questions in history: {len(combined_history)}")
    print(f"  Original Level: {req.level} → Adjusted Level: {adjusted_level}")

    # Format prompt
    prompt = QUIZ_PROMPT_TEMPLATE.format(
        domain_name=req.domain_name,
        program_name=req.program_name,
        level_description=get_level_description(adjusted_level),
        level_int=adjusted_level,
        history_json=json.dumps(combined_history, indent=2)
    )

    last_error = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            final_prompt = prompt
            if last_error:
                final_prompt += f"\nPREVIOUS ERROR:\n{last_error}\nFIX AND REGENERATE."

            temperature = min(0.7, 0.3 + attempt * 0.1)
            
            # Choose API based on configuration
            if USE_GROQ:
                print(f"\n[ATTEMPT {attempt}/{MAX_RETRIES}] 🟦 Using Groq API")
                print(f"  Model: {GROQ_MODEL}")
                print(f"  Temperature: {temperature:.2f}")
                raw_response = call_groq_api(final_prompt, temperature)
                print(f"  Status: ✅ Response received from Groq ({len(raw_response)} chars)")
            else:
                print(f"\n[ATTEMPT {attempt}/{MAX_RETRIES}] 🟢 Using Ollama API")
                print(f"  Model: {OLLAMA_MODEL}")
                print(f"  Temperature: {temperature:.2f}")
                raw_response = call_ollama_api(final_prompt, temperature)
                print(f"  Status: ✅ Response received from Ollama ({len(raw_response)} chars)")
            
            cleaned_response = clean_json_string(raw_response)
            
            print(f"\n[ATTEMPT {attempt}] RAW RESPONSE:\n{raw_response[:500]}")
            print(f"[ATTEMPT {attempt}] CLEANED RESPONSE:\n{cleaned_response[:500]}")
            
            parsed = json.loads(cleaned_response)
            print(parsed)
            
            print(f"[ATTEMPT {attempt}] PARSED JSON: correct_option_index = {parsed.get('correct_option_index')}")
            
            # ===== SCHEMA VALIDATION (matches quiz_prompt.py schema) =====
            # Required fields check
            required_fields = ["question_id", "question_text", "options", "correct_option_index", "hint", "explanation"]
            for field in required_fields:
                if field not in parsed:
                    raise ValueError(f"Missing required field: {field}")
            
            # question_id validation
            if not isinstance(parsed.get("question_id"), str) or not parsed.get("question_id").strip():
                raise ValueError("question_id must be a non-empty string")
            
            # question_text validation
            if not isinstance(parsed.get("question_text"), str) or not parsed.get("question_text").strip():
                raise ValueError("question_text must be a non-empty string")
            
            # options validation (exactly 4, all strings)
            if not isinstance(parsed.get("options"), list) or len(parsed["options"]) != 4:
                raise ValueError("options must be exactly 4 items")
            if not all(isinstance(opt, str) for opt in parsed["options"]):
                raise ValueError("all options must be strings")
            
            # CLEANING: Remove "Option A:", "Option B:" prefixes from options
            parsed["options"] = [clean_option_text(opt) for opt in parsed["options"]]
            
            # correct_option_index validation (0-3, must be int)
            correct_idx = parsed.get("correct_option_index")
            if not isinstance(correct_idx, int):
                raise ValueError(f"correct_option_index must be an integer, got {type(correct_idx).__name__}")
            
            # HARDENING: If model returns -1, auto-correct to 0 (first option)
            if correct_idx == -1:
                print(f"[HARDENING] Model returned -1 for correct_option_index, auto-correcting to 0")
                parsed["correct_option_index"] = 0
                correct_idx = 0
            
            if correct_idx not in (0, 1, 2, 3):
                raise ValueError(f"correct_option_index must be 0-3, got {correct_idx}")
            
            # hint validation (must be string)
            if not isinstance(parsed.get("hint"), str) or not parsed.get("hint").strip():
                raise ValueError("hint must be a non-empty string")
            
            # explanation validation (must be string)
            if not isinstance(parsed.get("explanation"), str) or not parsed.get("explanation").strip():
                raise ValueError("explanation must be a non-empty string")
            
            # code_context validation (optional, can be string or null)
            code_context = parsed.get("code_context")
            if code_context is not None and not isinstance(code_context, str):
                raise ValueError(f"code_context must be string or null, got {type(code_context).__name__}")


            if exact_repeat(parsed["question_text"], combined_history):
                raise ValueError("Exact duplicate question")

            # After 3 retries, relax semantic duplication check (more lenient)
            if attempt <= 3 and semantic_repeat(parsed["question_text"], combined_history):
                raise ValueError("Semantic duplicate question")

            # Persist this question in Mongo so the session history knows
            # exactly which questions (and correct answers) have been asked.
            save_question(
                session_id,
                parsed["question_text"],
                options=parsed.get("options", []),
                correct_option_index=parsed.get("correct_option_index"),
            )
            print(f"[SUCCESS] ✅ Question generated successfully on attempt {attempt}")
            print(f"  Question ID: {parsed['question_id']}")
            print(f"  Correct Answer Index: {parsed['correct_option_index']}")
            print(f"  Semantic Check: {'Relaxed (attempt > 3)' if attempt > 3 else 'Strict'}")
            return parsed, attempt

        except Exception as e:
            last_error = str(e)
            print(f"[QUIZ ERROR] Attempt {attempt}/{MAX_RETRIES}: {last_error}")
            if attempt == MAX_RETRIES:
                print(f"[QUIZ FAILED] Max retries reached. Final error: {last_error}")


    raise RuntimeError(f"Failed after {MAX_RETRIES} retries: {last_error}")

def prefetch_next(req_copy: QuizRequest, session_id: str):
    """Prefetch next question in background"""
    try:
        PREFETCH_CACHE[session_id] = generate_quiz_core(req_copy, session_id)
    except Exception as e:
        print(f"[PREFETCH ERROR] {e}")

@router.post("")
async def generate_quiz_question(payload: Dict[str, Any]):
    """Generate an adaptive quiz question.

    The endpoint supports both plain JSON bodies matching QuizRequest and
    encrypted envelopes of the form {"iv": "...", "ciphertext": "..."}.

    If the request body is encrypted, the response question payload will also
    be encrypted using the same symmetric scheme so that the actual question
    text and correct answer index are not visible in transit.
    """

    # Detect and decrypt encrypted payloads; otherwise treat as plain JSON.
    try:
        if is_encrypted(payload):
            decrypted = decrypt_json(payload)
            req = QuizRequest(**decrypted)
            use_encrypted_response = True
        else:
            req = QuizRequest(**payload)
            use_encrypted_response = False
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid quiz request payload: {e}")

    session_id = req.session_id or str(uuid.uuid4())
    # If a program_name was provided, try to fetch an assignment and include its topics
    try:
        if getattr(req, "program_name", None):
            assign_query = {"$or": [{"test_key": req.program_name}, {"assignment_name": req.program_name}, {"program_name": req.program_name}]}
            assignment_doc = db.get_collection("assignments").find_one(assign_query)
            if assignment_doc:
                topics = assignment_doc.get("topics") or assignment_doc.get("data") or []
                try:
                    topics_json = json.dumps(topics, ensure_ascii=False)
                except Exception:
                    topics_json = str(topics)
                # append topics JSON to program_name so prompt can access them
                req.program_name = f"{req.program_name} | TOPICS: {topics_json}"
    except Exception as e:
        print(f"[QUIZ] Warning: could not load assignment topics: {e}")
    
    # Debug: Log API configuration at start
    api_provider = "Groq" if USE_GROQ else "Ollama"
    print(f"\n{'='*60}")
    print(f"[QUIZ REQUEST] API Provider: {api_provider}")
    if USE_GROQ:
        print(f"  Model: {GROQ_MODEL}")
        print(f"  API: {GROQ_API_URL}")
    else:
        print(f"  Model: {OLLAMA_MODEL}")
        print(f"  API: {OLLAMA_URL}")
    print(f"  Domain: {req.domain_name} | Program: {req.program_name} | Level: {req.level}")
    print(f"  Session ID: {session_id}")
    print(f"{'='*60}\n")

    # Check prefetch cache first
    if session_id in PREFETCH_CACHE:
        parsed, attempt = PREFETCH_CACHE.pop(session_id)
        # Final validation check on cached data
        correct_idx = parsed.get("correct_option_index")
        if correct_idx not in (0, 1, 2, 3):
            print(f"[WARNING] Cached data has invalid correct_option_index: {correct_idx}, regenerating...")
            parsed, attempt = generate_quiz_core(req, session_id)
        
        # Transform to frontend format
        response_data = transform_backend_to_frontend(parsed)
        if use_encrypted_response:
            response_data = encrypt_json(response_data)

        return {
            "status": "success",
            "session_id": session_id,
            "attempts_used": attempt,
            "data": response_data,
        }

    # Generate new question
    parsed, attempt = generate_quiz_core(req, session_id)
    
    # Final safety check before sending
    correct_idx = parsed.get("correct_option_index")
    if correct_idx not in (0, 1, 2, 3):
        print(f"[CRITICAL] Generated question has invalid correct_option_index: {correct_idx}")
        raise RuntimeError("Invalid question generated")

    # Transform to frontend format
    plain_response = transform_backend_to_frontend(parsed)

    # Log using plain (unencrypted) data for observability
    try:
        print(f"\n[RESPONSE] Sending to frontend:")
        print(f"  Session ID: {session_id}")
        print(f"  Question: {plain_response['question'][:80]}...")
        print(f"  Correct Answer: {plain_response['options'][plain_response['correctIndex']]}")
        print(f"  Attempts used: {attempt}")
        print(f"{'='*60}\n")
    except Exception as log_err:
        # Never fail the request due to logging issues
        print(f"[RESPONSE LOG ERROR] {log_err}")

    # Optionally encrypt only the data block
    response_data = encrypt_json(plain_response) if use_encrypted_response else plain_response

    # Prefetch next in background
    threading.Thread(
        target=prefetch_next,
        args=(req.copy(deep=True), session_id),
        daemon=True
    ).start()

    return {
        "status": "success",
        "session_id": session_id,
        "attempts_used": attempt,
        "data": response_data,
    }

