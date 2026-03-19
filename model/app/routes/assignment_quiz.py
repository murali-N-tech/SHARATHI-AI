import json
import uuid
import threading
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
import requests

from app.config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    MAX_RETRIES,
    PREFETCH_CACHE,
    USE_GROQ,
    GROQ_MODEL,
    GROQ_API_URL,
    groq_post,
)
from app.models import AssignmentQuizRequest
from app.prompts.assignment_quiz import ASSIGNMENT_QUIZ_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string
from app.utils.quiz_logic import get_level_description, auto_adjust_assignment_level
from app.db.mongo import load_session_history, save_question
from app.utils.crypto_utils import encrypt_json, decrypt_json, is_encrypted

router = APIRouter(prefix="/assignment-quiz", tags=["assignment-quiz"])


def _transform_backend_to_frontend_with_difficulty(backend_data: dict) -> dict:
    """Transform backend JSON to frontend shape, including difficulty.

    Backend keys: question_id, question_text, options, correct_option_index, difficulty, hint, explanation, code_context
    Frontend keys: id, question, options, correctIndex, difficulty, hint, explanation, code_context
    """
    return {
        "id": backend_data.get("question_id", ""),
        "question": backend_data.get("question_text", ""),
        "options": backend_data.get("options", []),
        "correctIndex": backend_data.get("correct_option_index"),
        "difficulty": backend_data.get("difficulty"),
        "hint": backend_data.get("hint", ""),
        "code_context": backend_data.get("code_context"),
        "explanation": backend_data.get("explanation", ""),
    }


def _call_groq_api(prompt: str, temperature: float) -> str:
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_completion_tokens": 2000,
    }
    resp = groq_post(payload, timeout=30)
    result = resp.json()
    return result["choices"][0]["message"]["content"]


def _call_ollama_api(prompt: str, temperature: float) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": temperature},
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["response"]


def _generate_assignment_quiz_core(req: AssignmentQuizRequest, session_id: str):
    # Load persisted history for duplicate detection only
    stored = load_session_history(session_id)
    combined_history = stored + [
        h.dict() if hasattr(h, "dict") else h for h in req.history
    ]

    # Auto-adjust difficulty using assignment-specific logic
    adjusted_level = auto_adjust_assignment_level(req.level, req.history)

    print("[ASSIGNMENT QUIZ] Starting generation...")
    print(f"  Questions in history (combined): {len(combined_history)}")
    print(f"  Original Level: {req.level} → Adjusted Level: {adjusted_level}")

    topics_json = json.dumps(req.topics, ensure_ascii=False)

    prompt = ASSIGNMENT_QUIZ_PROMPT_TEMPLATE.format(
        topics_json=topics_json,
        level_description=get_level_description(adjusted_level),
        level_int=adjusted_level,
        history_json=json.dumps(combined_history, indent=2),
    )

    last_error = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            final_prompt = prompt
            if last_error:
                final_prompt += f"\nPREVIOUS ERROR:\n{last_error}\nFIX AND REGENERATE."

            temperature = min(0.7, 0.3 + attempt * 0.1)

            if USE_GROQ:
                print(f"\n[ASSIGNMENT QUIZ ATTEMPT {attempt}/{MAX_RETRIES}] 🟦 Using Groq API")
                raw_response = _call_groq_api(final_prompt, temperature)
            else:
                print(f"\n[ASSIGNMENT QUIZ ATTEMPT {attempt}/{MAX_RETRIES}] 🟢 Using Ollama API")
                raw_response = _call_ollama_api(final_prompt, temperature)

            cleaned_response = clean_json_string(raw_response)
            parsed = json.loads(cleaned_response)

            # Required fields
            required_fields = [
                "question_id",
                "question_text",
                "options",
                "correct_option_index",
                "difficulty",
                "hint",
                "explanation",
            ]
            for field in required_fields:
                if field not in parsed:
                    raise ValueError(f"Missing required field: {field}")

            # question_id
            if not isinstance(parsed.get("question_id"), str) or not parsed["question_id"].strip():
                raise ValueError("question_id must be a non-empty string")

            # question_text
            if not isinstance(parsed.get("question_text"), str) or not parsed["question_text"].strip():
                raise ValueError("question_text must be a non-empty string")

            # options
            if not isinstance(parsed.get("options"), list) or len(parsed["options"]) != 4:
                raise ValueError("options must be exactly 4 items")
            if not all(isinstance(opt, str) for opt in parsed["options"]):
                raise ValueError("all options must be strings")

            # correct_option_index
            correct_idx = parsed.get("correct_option_index")
            if not isinstance(correct_idx, int):
                raise ValueError("correct_option_index must be an integer")
            if correct_idx == -1:
                parsed["correct_option_index"] = 0
                correct_idx = 0
            if correct_idx not in (0, 1, 2, 3):
                raise ValueError("correct_option_index must be 0-3")

            # difficulty
            difficulty = parsed.get("difficulty")
            if not isinstance(difficulty, int) or difficulty < 1 or difficulty > 5:
                raise ValueError("difficulty must be an integer between 1 and 5")

            # hint & explanation
            if not isinstance(parsed.get("hint"), str) or not parsed["hint"].strip():
                raise ValueError("hint must be a non-empty string")
            if not isinstance(parsed.get("explanation"), str) or not parsed["explanation"].strip():
                raise ValueError("explanation must be a non-empty string")

            # code_context: optional str or null
            code_context = parsed.get("code_context")
            if code_context is not None and not isinstance(code_context, str):
                raise ValueError("code_context must be string or null")

            # Duplicate detection using stored+history
            from app.utils.semantic import exact_repeat, semantic_repeat

            if exact_repeat(parsed["question_text"], combined_history):
                raise ValueError("Exact duplicate question")
            if attempt <= 3 and semantic_repeat(parsed["question_text"], combined_history):
                raise ValueError("Semantic duplicate question")

            # Persist asked question so it appears in history next time
            save_question(
                session_id,
                parsed["question_text"],
                options=parsed.get("options", []),
                correct_option_index=parsed.get("correct_option_index"),
            )

            print(f"[ASSIGNMENT QUIZ SUCCESS] Question generated on attempt {attempt}")
            return parsed, attempt, adjusted_level

        except Exception as e:
            last_error = str(e)
            print(f"[ASSIGNMENT QUIZ ERROR] Attempt {attempt}/{MAX_RETRIES}: {last_error}")
            if attempt == MAX_RETRIES:
                print(f"[ASSIGNMENT QUIZ FAILED] Max retries reached. Final error: {last_error}")

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries: {last_error}")


def _prefetch_next(req_copy: AssignmentQuizRequest, session_id: str):
    try:
        PREFETCH_CACHE[session_id] = _generate_assignment_quiz_core(req_copy, session_id)
    except Exception as e:
        print(f"[ASSIGNMENT QUIZ PREFETCH ERROR] {e}")


@router.post("")
async def generate_assignment_quiz(payload: Dict[str, Any]):
    """Generate an adaptive assignment quiz question based on topics.

    Supports both plain JSON AssignmentQuizRequest bodies and encrypted
    envelopes of the form {"iv": "...", "ciphertext": "..."}. When an
    encrypted request is used, the "data" field in the response will also be
    encrypted using the same symmetric scheme.
    """

    try:
        if is_encrypted(payload):
            decrypted = decrypt_json(payload)
            req = AssignmentQuizRequest(**decrypted)
            use_encrypted_response = True
        else:
            req = AssignmentQuizRequest(**payload)
            use_encrypted_response = False
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid assignment quiz request payload: {e}")

    session_id = req.session_id or str(uuid.uuid4())

    api_provider = "Groq" if USE_GROQ else "Ollama"
    print("\n" + "=" * 60)
    print(f"[ASSIGNMENT QUIZ REQUEST] API Provider: {api_provider}")
    print(f"  Level: {req.level}")
    print(f"  Topics count: {len(req.topics)}")
    print(f"  Session ID: {session_id}")
    print("=" * 60 + "\n")

    # Check prefetch cache first
    if session_id in PREFETCH_CACHE:
        parsed, attempt, adjusted_level = PREFETCH_CACHE.pop(session_id)
        correct_idx = parsed.get("correct_option_index")
        if correct_idx not in (0, 1, 2, 3):
            print(
                f"[ASSIGNMENT QUIZ WARNING] Cached data has invalid correct_option_index: {correct_idx}, regenerating..."
            )
            parsed, attempt, adjusted_level = _generate_assignment_quiz_core(req, session_id)

        response_data = _transform_backend_to_frontend_with_difficulty(parsed)
        if use_encrypted_response:
            response_data = encrypt_json(response_data)

        return {
            "status": "success",
            "session_id": session_id,
            "attempts_used": attempt,
            "level": adjusted_level,
            "data": response_data,
        }

    # Generate new question
    parsed, attempt, adjusted_level = _generate_assignment_quiz_core(req, session_id)

    correct_idx = parsed.get("correct_option_index")
    if correct_idx not in (0, 1, 2, 3):
        print(
            f"[ASSIGNMENT QUIZ CRITICAL] Generated question has invalid correct_option_index: {correct_idx}"
        )
        raise RuntimeError("Invalid question generated")

    # Build plain response data first for logging
    plain_response = _transform_backend_to_frontend_with_difficulty(parsed)

    # Safe logging: never let logging crash the request even if keys are missing
    try:
        print("\n[ASSIGNMENT QUIZ RESPONSE] Sending to frontend:")
        print(f"  Session ID: {session_id}")
        print(f"  Level: {adjusted_level}")
        print(f"  Question: {plain_response.get('question', '')[:80]}...")
        print("=" * 60 + "\n")
    except Exception as log_err:
        print(f"[ASSIGNMENT QUIZ RESPONSE LOG ERROR] {log_err}")

    # Optionally encrypt only the data block
    response_data = encrypt_json(plain_response) if use_encrypted_response else plain_response

    # Prefetch next
    threading.Thread(
        target=_prefetch_next,
        args=(req.copy(deep=True), session_id),
        daemon=True,
    ).start()

    return {
        "status": "success",
        "session_id": session_id,
        "attempts_used": attempt,
        "level": adjusted_level,
        "data": response_data,
    }
