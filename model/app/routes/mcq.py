from fastapi import APIRouter, Request
import requests
import json
from app.config import OLLAMA_URL, OLLAMA_MODEL, USE_GROQ, GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL
from app.prompts.mcq_prompt import PHI3_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string
from app.utils.validation import validate_mcq

router = APIRouter(prefix="/mcq", tags=["mcq"])

@router.post("/generate_mcq")
async def create_mcq(request: Request):
    """Generate Multiple Choice Questions"""
    data = await request.json()
    topic, subtopic, difficulty, n = (
        data.get("topic"),
        data.get("subtopic"),
        data.get("difficulty"),
        int(data.get("n", 1))
    )
    
    final_prompt = PHI3_PROMPT_TEMPLATE.format(
        topic=topic,
        subtopic=subtopic,
        difficulty=difficulty,
        n=n
    )
    
    try:
        # Choose provider based on configuration
        if USE_GROQ:
            print("[MCQ] Using Groq API for MCQ generation")
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": final_prompt}],
                "temperature": 0.5,
                "max_completion_tokens": 1500
            }
            resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if resp.status_code >= 400:
                print("[GROQ MCQ ERROR] Status:", resp.status_code)
                print("[GROQ MCQ ERROR] Body:\n", resp.text)
            resp.raise_for_status()
            groq_content = resp.json().get("choices", [])[0].get("message", {}).get("content", "")
            parsed = json.loads(clean_json_string(groq_content))
        else:
            print("[MCQ] Using Ollama API for MCQ generation")
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": final_prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=30
            )
            resp.raise_for_status()
            parsed = json.loads(clean_json_string(resp.json().get("response", "")))
        raw = parsed.get("mcqs", []) if isinstance(parsed, dict) else parsed
        if isinstance(raw, dict):
            raw = [raw]
        valid = [q for q in raw if validate_mcq(q)]
        if valid:
            return {"status": "success", "data": valid}
    except Exception as e:
        print(e)
    return {"status": "error", "message": "Failed to generate MCQs"}
