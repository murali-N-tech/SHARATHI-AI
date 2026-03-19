import json
import requests
from fastapi import APIRouter, HTTPException, Request
from app.config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    USE_GROQ,
    GROQ_MODEL,
    GROQ_API_URL,
    groq_post,
)
from app.models import (
    NextLevelTopicsRequest,
    NextLevelSubtopic,
    NextLevelTopicsResponse,
)
from app.prompts.next_level_prompt import NEXT_LEVEL_SYSTEM_PROMPT, build_next_level_prompt
from app.utils.text_processing import clean_json_string

router = APIRouter(prefix="/next-level", tags=["next-level"])


@router.post("/topics", response_model=NextLevelTopicsResponse)
async def generate_next_level_topics(request: Request):
    """Generate next-level subtopics based on current performance."""
    try:
        body = await request.json()
        # Normalize and drop any extra fields (like recommendations, topic_breakdown)
        current_level_id = body.get("current_level_id") or body.get("level_id")
        next_level_id = body.get("next_level_id")
        # Auto-derive next_level_id if not provided, e.g. L1 -> L2
        if not next_level_id and isinstance(current_level_id, str) and current_level_id.startswith("L"):
            try:
                level_num = int(current_level_id[1:])
                next_level_id = f"L{level_num + 1}"
            except ValueError:
                pass

        payload = {
            "domain_name": body.get("domain_name"),
            "program_name": body.get("program_name"),
            "current_level_id": current_level_id,
            "next_level_id": next_level_id,
            "strong_topics": body.get("strong_topics", []),
            "weak_topics": body.get("weak_topics", []),
            "summary": body.get("summary"),
        }
        req = NextLevelTopicsRequest(**payload)
        if not req.domain_name or not req.program_name:
            raise ValueError("domain_name and program_name are required")

        # Edge case: No topics at all
        if len(req.strong_topics) == 0 and len(req.weak_topics) == 0:
            return NextLevelTopicsResponse(
                domain_name=req.domain_name,
                program_name=req.program_name,
                current_level_id=req.current_level_id,
                next_level_id=req.next_level_id,
                balance_strategy=(
                    "Neutral: No prior performance data; starting with foundational topics."
                ),
                subtopics=[
                    NextLevelSubtopic(
                        order=i + 1,
                        title=f"Foundation Topic {i + 1}",
                        type="Practice",
                        objective=(
                            f"Build foundational understanding of core concept {i + 1}."
                        ),
                        estimated_time_minutes=15,
                    )
                    for i in range(10)
                ],
            )

        strong_json = json.dumps(
            [t.model_dump() for t in req.strong_topics], ensure_ascii=False
        )
        weak_json = json.dumps(
            [t.model_dump() for t in req.weak_topics], ensure_ascii=False
        )
        summary_json = json.dumps(req.summary.model_dump(), ensure_ascii=False)

        prompt = build_next_level_prompt(
            domain_name=req.domain_name,
            program_name=req.program_name,
            current_level_id=req.current_level_id,
            next_level_id=req.next_level_id,
            strong_topics_json=strong_json,
            weak_topics_json=weak_json,
            summary_json=summary_json,
        )

        if USE_GROQ:
            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": NEXT_LEVEL_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,
                "max_completion_tokens": 1500,
            }
            resp = groq_post(payload, timeout=30)
            raw_text = (
                resp.json().get("choices", [])[0]
                .get("message", {})
                .get("content", "")
            )
        else:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.4},
                },
                timeout=30,
            )
            resp.raise_for_status()
            raw_text = resp.json().get("response", "")

        text = clean_json_string(raw_text)
        data = json.loads(text)

        if "subtopics" not in data:
            data["subtopics"] = []

        # Ensure 10–15 subtopics
        if len(data["subtopics"]) < 10:
            for i in range(len(data["subtopics"]), 10):
                data["subtopics"].append(
                    {
                        "order": i + 1,
                        "title": f"Core Concept {i + 1}",
                        "type": "Practice",
                        "objective": f"Master core concept {i + 1}.",
                        "estimated_time_minutes": 15,
                    }
                )
        elif len(data["subtopics"]) > 15:
            data["subtopics"] = data["subtopics"][:15]

        # Re-order sequentially
        for i, subtopic in enumerate(data["subtopics"]):
            subtopic["order"] = i + 1

        return NextLevelTopicsResponse(**data)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from AI model: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e) or "Next level generation failed")
