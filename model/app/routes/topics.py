from fastapi import APIRouter, Request, HTTPException
import requests
import json
from app.config import OLLAMA_URL, OLLAMA_MODEL, USE_GROQ, GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL
from app.prompts.topics_prompt import TOPICS_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string
from app.utils.validation import validate_curriculum

router = APIRouter(prefix="/topics", tags=["topics"])

@router.post("/generate_topics")
async def generate_topics(request: Request):
    """
    Generate a list of topics/subtopics to be assessed from a user prompt.
    
    Request body:
    {
        "prompt": "User description of what they want to assess"
    }
    
    Returns:
    {
        "status": "success",
        "data": {
            "main_topic": "...",
            "total_topics": 10,
            "topics": [
                {
                    "topic_id": 1,
                    "title": "...",
                    "description": "...",
                    "difficulty": "Beginner",
                    "suggested_questions": 5
                },
                ...
            ]
        }
    }
    """
    data = await request.json()
    user_input = data.get("prompt")
    
    if not user_input:
        raise HTTPException(status_code=400, detail="Prompt required")
    
    final_prompt = TOPICS_PROMPT_TEMPLATE.format(user_input=user_input)
    
    try:
        # Choose API provider based on configuration flag
        if USE_GROQ:
            print("[TOPICS] Using Groq API for topics generation")
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": final_prompt}],
                "temperature": 0.6,
                "max_completion_tokens": 2000
            }
            resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if resp.status_code >= 400:
                print("[GROQ TOPICS ERROR] Status:", resp.status_code)
                print("[GROQ TOPICS ERROR] Body:\n", resp.text)
            resp.raise_for_status()
            # Groq returns choices -> message -> content
            groq_content = resp.json().get("choices", [])[0].get("message", {}).get("content", "")
            parsed = json.loads(clean_json_string(groq_content))
        else:
            print("[TOPICS] Using Ollama API for topics generation")
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": final_prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.6}
                },
                timeout=30
            )
            resp.raise_for_status()
            parsed = json.loads(clean_json_string(resp.json().get("response", "")))
        
        # Basic validation
        if isinstance(parsed, dict) and "topics" in parsed:
            return {"status": "success", "data": parsed}
        else:
            return {"status": "error", "message": "Invalid topics structure"}
            
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Topics generation request timed out")
    except json.JSONDecodeError as e:
        print(f"[TOPICS] JSON Decode Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse topics response")
    except Exception as e:
        print(f"[TOPICS] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Topics generation failed: {str(e)}")
