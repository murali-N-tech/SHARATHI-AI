from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
import io
import json
import requests
from app.config import (
    USE_GEMINI, GEMINI_API_KEY, GEMINI_MODEL,
    USE_GROQ, GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL,
    OLLAMA_URL, OLLAMA_MODEL
)
from app.prompts.difficulty_prompt import DIFFICULTY_PROMPT_TEMPLATE
from app.utils.text_processing import clean_json_string

router = APIRouter(prefix="/pdf", tags=["pdf-processing"])

# =========================
# INTERNAL HELPER FUNCTIONS
# =========================

def extract_text_from_bytes(file_bytes: bytes) -> str:
    """
    Reads PDF bytes and returns the raw text content.
    
    Args:
        file_bytes: PDF file as bytes
        
    Returns:
        Extracted text from all pages
    """
    try:
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)
        text_content = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
                
        return "\n".join(text_content)
    except Exception as e:
        print(f"[PDF] Read Error: {e}")
        return ""


def generate_difficulty_rich_text(data: dict) -> str:
    """
    Converts the Difficulty JSON into an HTML string (Rich Text).
    
    Structure:
    <h3>Easy Concepts</h3><ul><li>...</li></ul>
    <h3>Medium Concepts</h3>...
    
    Args:
        data: Dictionary with difficulty levels as keys
        
    Returns:
        HTML formatted string
    """
    if not data:
        return "<p>No topics found.</p>"
    
    html = ""
    levels = ["easy", "medium", "hard", "advanced"]
    
    for level in levels:
        topics = data.get(level, [])
        if topics:
            title = level.capitalize()
            html += f"<h3>{title} Concepts</h3><ul>"
            for topic in topics:
                html += f"<li>{topic}</li>"
            html += "</ul>"
            
    return html


def format_prompt_for_curriculum(data: dict) -> str:
    """
    Formats the difficulty levels into a string for curriculum generation.
    
    Args:
        data: Dictionary with difficulty levels as keys
        
    Returns:
        Formatted string for next AI step
    """
    formatted_str = "Create a detailed curriculum based on these categorized topics:\n\n"
    levels = ["easy", "medium", "hard", "advanced"]
    
    for level in levels:
        topics = data.get(level, [])
        if topics:
            topics_str = ", ".join(topics)
            formatted_str += f"**{level.upper()}**: {topics_str}\n\n"
            
    return formatted_str


def call_gemini_api(prompt: str) -> dict:
    """
    Call Gemini API for PDF processing.
    
    Args:
        prompt: The prompt to send to Gemini
        
    Returns:
        Parsed JSON response
    """
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content(prompt)
        return json.loads(response.text)
        
    except Exception as e:
        print(f"[GEMINI] API Error: {e}")
        raise


def call_groq_api(prompt: str) -> dict:
    """
    Call Groq API as an alternative to Gemini.
    
    Args:
        prompt: The prompt to send to Groq
        
    Returns:
        Parsed JSON response
    """
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.6,
            "max_completion_tokens": 3000
        }
        
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        
        if resp.status_code >= 400:
            print(f"[GROQ PDF] Error Status: {resp.status_code}")
            print(f"[GROQ PDF] Error Body: {resp.text}")
        
        resp.raise_for_status()
        groq_content = resp.json().get("choices", [])[0].get("message", {}).get("content", "")
        return json.loads(clean_json_string(groq_content))
        
    except Exception as e:
        print(f"[GROQ] API Error: {e}")
        raise


def call_ollama_api(prompt: str) -> dict:
    """
    Call Ollama API as a local alternative.
    
    Args:
        prompt: The prompt to send to Ollama
        
    Returns:
        Parsed JSON response
    """
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.6}
            },
            timeout=120
        )
        
        resp.raise_for_status()
        return json.loads(clean_json_string(resp.json().get("response", "")))
        
    except Exception as e:
        print(f"[OLLAMA] API Error: {e}")
        raise


# =========================
# MAIN ROUTES
# =========================

@router.post("/process_document_difficulty")
async def process_pdf_to_difficulty(file: UploadFile = File(...)):
    """
    Process a PDF document and categorize topics by difficulty level.
    
    Steps:
    1. Accepts PDF file upload
    2. Extracts text from PDF
    3. AI analyzes and categorizes topics as Easy, Medium, Hard, Advanced
    4. Returns JSON data, Rich Text HTML, and formatted prompt for curriculum
    
    Request:
        file: PDF file upload
        
    Returns:
        {
            "status": "success",
            "data": {
                "topics_json": {...},
                "rich_text": "HTML string",
                "prompt_for_curriculum": "formatted string"
            }
        }
    """
    
    # 1. Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # 2. Read and extract text
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_bytes(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File reading failed: {str(e)}"
        )
    
    if not raw_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. The file may be empty or image-based."
        )

    # 3. Prepare prompt for difficulty classification
    # Limit text to prevent token overflow
    text_limit = 30000
    prompt = DIFFICULTY_PROMPT_TEMPLATE.format(raw_text=raw_text[:text_limit])

    # 4. Call AI API based on configuration
    parsed_json = {}
    try:
        if USE_GEMINI and GEMINI_API_KEY:
            print("[PDF] Using Gemini API for difficulty categorization")
            parsed_json = call_gemini_api(prompt)
            
        elif USE_GROQ and GROQ_API_KEY:
            print("[PDF] Using Groq API for difficulty categorization")
            parsed_json = call_groq_api(prompt)
            
        else:
            print("[PDF] Using Ollama API for difficulty categorization")
            parsed_json = call_ollama_api(prompt)
            
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="AI processing request timed out. Try with a smaller document."
        )
    except json.JSONDecodeError as e:
        print(f"[PDF] JSON Decode Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response. The model may have returned invalid JSON."
        )
    except Exception as e:
        print(f"[PDF] Processing Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI processing failed: {str(e)}"
        )

    # 5. Validate response structure
    required_keys = ["easy", "medium", "hard", "advanced"]
    if not all(key in parsed_json for key in required_keys):
        raise HTTPException(
            status_code=500,
            detail="AI response missing required difficulty levels"
        )

    # 6. Process results
    rich_text_html = generate_difficulty_rich_text(parsed_json)
    next_step_prompt = format_prompt_for_curriculum(parsed_json)

    return {
        "status": "success",
        "data": {
            "topics_json": parsed_json,
            "rich_text": rich_text_html,
            "prompt_for_curriculum": next_step_prompt
        }
    }


@router.post("/extract_text")
async def extract_pdf_text(file: UploadFile = File(...)):
    """
    Simple endpoint to extract raw text from a PDF.
    
    Request:
        file: PDF file upload
        
    Returns:
        {
            "status": "success",
            "data": {
                "text": "extracted text",
                "page_count": 10,
                "character_count": 50000
            }
        }
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_bytes(file_bytes)
        
        if not raw_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )
        
        # Calculate page count
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)
        page_count = len(reader.pages)
        
        return {
            "status": "success",
            "data": {
                "text": raw_text,
                "page_count": page_count,
                "character_count": len(raw_text)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text extraction failed: {str(e)}"
        )
