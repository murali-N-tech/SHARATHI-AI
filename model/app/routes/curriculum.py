from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import requests
import json

from app.config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    USE_GROQ,
    GROQ_API_KEY,
    GROQ_MODEL,
    GROQ_API_URL
)
from app.prompts.curriculum_prompt import CURRICULUM_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string
from app.utils.validation import validate_curriculum
from app.utils.pdf_processing import extract_text_from_pdf

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


@router.post("/generate_curriculum")
async def generate_curriculum(
    prompt: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None)
):
    """
    Generate curriculum from:
    - Prompt only
    - PDF only
    - Prompt + PDF
    """

    # --------------------------------------------------
    # 0. Basic validation
    # --------------------------------------------------
    if not prompt and not pdf_file:
        raise HTTPException(
            status_code=400,
            detail="Either a prompt or a PDF file is required"
        )

    user_prompt = (prompt or "").strip()
    context_text = ""

    # --------------------------------------------------
    # 1. Extract text from PDF (if provided)
    # --------------------------------------------------
    if pdf_file:
        if not pdf_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )

        file_bytes = await pdf_file.read()
        context_text = extract_text_from_pdf(file_bytes)

        if not context_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded PDF"
            )

    # --------------------------------------------------
    # 2. Build enhanced prompt
    # --------------------------------------------------
    if not user_prompt:
        user_prompt = "Generate a structured learning curriculum based on the provided document."

    enhanced_prompt = f"USER INSTRUCTIONS:\n{user_prompt}\n\n"

    if context_text:
        enhanced_prompt += (
            "CONTEXT FROM UPLOADED DOCUMENT:\n"
            f"{context_text}\n\n"
            "Analyze the document above and generate a clear, progressive learning curriculum.\n\n"
        )

    final_prompt = CURRICULUM_PROMPT_TEMPLATE.format(
        user_input=enhanced_prompt
    )

    # --------------------------------------------------
    # 3. Call LLM (Groq or Ollama)
    # --------------------------------------------------
    try:
        if USE_GROQ:
            print("[CURRICULUM] Using Groq API")

            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "user", "content": final_prompt}
                ],
                "temperature": 0.5,
                "max_completion_tokens": 2000
            }

            resp = requests.post(
                GROQ_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )

            if resp.status_code >= 400:
                print("[GROQ ERROR]", resp.text)

            resp.raise_for_status()

            content = (
                resp.json()
                .get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )

            parsed = json.loads(clean_json_string(content))

        else:
            print("[CURRICULUM] Using Ollama API")

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

            parsed = json.loads(
                clean_json_string(resp.json().get("response", ""))
            )

        # --------------------------------------------------
        # 4. Validate output
        # --------------------------------------------------
        if not validate_curriculum(parsed):
            raise HTTPException(
                status_code=422,
                detail="Generated curriculum structure is invalid"
            )

        return {
            "status": "success",
            "data": parsed
        }

    except HTTPException:
        raise

    except Exception as e:
        print("[CURRICULUM ERROR]", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to generate curriculum"
        )
