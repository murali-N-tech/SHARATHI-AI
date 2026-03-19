from fastapi import APIRouter, Request, HTTPException
import requests
import json
import secrets
import string
from app.config import OLLAMA_URL, OLLAMA_MODEL, USE_GROQ, GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL
from app.prompts.assignment_prompt import ASSIGNMENT_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string

router = APIRouter(prefix="/assignment", tags=["assignment"])

def generate_test_key(length=12):
    """Generate a random alphanumeric test key"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def validate_assignment_structure(data):
    """Validate the assignment JSON structure"""
    required_keys = ["assignment_name", "description", "topics", "total_questions", "difficulty_level"]
    if not all(key in data for key in required_keys):
        return False
    
    if not isinstance(data["topics"], list) or len(data["topics"]) == 0:
        return False
    
    for topic in data["topics"]:
        topic_keys = ["id", "title", "description", "difficulty"]
        if not all(key in topic for key in topic_keys):
            return False
    
    return True

@router.post("/generate_topics")
async def generate_assignment_topics(request: Request):
    """Generate topic list for an assignment based on user prompt"""
    data = await request.json()
    user_prompt = data.get("prompt")
    
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    final_prompt = ASSIGNMENT_PROMPT_TEMPLATE.format(user_input=user_prompt)
    
    try:
        # Choose API provider based on configuration flag
        if USE_GROQ:
            print("[ASSIGNMENT] Using Groq API for topic generation")
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": final_prompt}],
                "temperature": 0.5,
                "max_completion_tokens": 2000
            }
            resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if resp.status_code >= 400:
                print("[GROQ ASSIGNMENT ERROR] Status:", resp.status_code)
                print("[GROQ ASSIGNMENT ERROR] Body:\n", resp.text)
            resp.raise_for_status()
            # Groq returns choices -> message -> content
            groq_content = resp.json().get("choices", [])[0].get("message", {}).get("content", "")
            parsed = json.loads(clean_json_string(groq_content))
        else:
            print("[ASSIGNMENT] Using Ollama API for topic generation")
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": final_prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.5}
                },
                timeout=30
            )
            resp.raise_for_status()
            parsed = json.loads(clean_json_string(resp.json().get("response", "")))
        
        # Validate the structure
        if validate_assignment_structure(parsed):
            # Generate unique test key
            test_key = generate_test_key()
            
            # Add test key to response
            parsed["test_key"] = test_key
            parsed["user_prompt"] = user_prompt
            
            print(f"[ASSIGNMENT] Generated topics for assignment with test_key: {test_key}")
            
            return {
                "status": "success",
                "data": parsed,
                "test_key": test_key
            }
        else:
            raise ValueError("Invalid assignment structure from LLM")
            
    except Exception as e:
        print(f"[ASSIGNMENT ERROR] {str(e)}")
        return {
            "status": "error",
            "message": "Failed to generate assignment topics",
            "error": str(e)
        }
