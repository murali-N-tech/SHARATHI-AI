import json
import requests
from fastapi import APIRouter, HTTPException
from app.config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    USE_GROQ,
    GROQ_MODEL,
    GROQ_API_URL,
    groq_post,
)
from app.models import (
    StatisticsTestData,
    StatisticsApiResponse,
    StatisticsSummary,
)
from app.prompts.statistics_prompt import STATISTICS_SYSTEM_PROMPT, build_statistics_prompt

router = APIRouter(prefix="/statistics", tags=["statistics"])



def _compute_summary(test_data: StatisticsTestData) -> dict:
    """Compute summary statistics with edge case handling."""
    q = test_data.level.questions
    total = len(q)

    if total == 0:
        return {
            "accuracy_percent": 0.0,
            "avg_time_seconds": 0.0,
            "speed_profile": "Balanced",
            "behavior_insights": ["No questions attempted."],
        }

    correct = sum(1 for i in q if i.is_correct)
    accuracy = correct / total * 100
    avg_time = sum(i.time_taken_seconds for i in q) / total

    if avg_time <= 3:
        speed = "Fast"
    elif avg_time <= 8:
        speed = "Balanced"
    else:
        speed = "Slow"

    insights = []
    if accuracy >= 90:
        insights.append("Excellent performance; ready for advanced topics.")
    elif accuracy >= 70:
        insights.append("Good understanding of core concepts.")
    elif accuracy >= 50:
        insights.append("Moderate performance; needs more practice.")
    else:
        insights.append("Low accuracy; revisit fundamentals urgently.")

    if speed == "Fast" and accuracy < 70:
        insights.append("Quick answers but lower accuracy; read carefully.")
    elif speed == "Slow" and accuracy >= 70:
        insights.append("Slower pace but accurate; refine time management.")
    elif speed == "Slow" and accuracy < 70:
        insights.append("Slow pace and low accuracy; need focused practice.")

    return {
        "accuracy_percent": round(accuracy, 2),
        "avg_time_seconds": round(avg_time, 2),
        "speed_profile": speed,
        "behavior_insights": insights[:2] or ["Neutral performance."],
    }


@router.post("/analyze", response_model=StatisticsApiResponse)
def analyze_statistics(req: StatisticsTestData):
    """Analyze test data and return strengths, weaknesses, and recommendations."""
    from app.utils.text_processing import clean_json_string

    try:
        test_data = req
        if not test_data.domain_name or not test_data.program_name:
            raise ValueError("domain_name and program_name are required")

        if len(test_data.level.questions) == 0:
            return StatisticsApiResponse(
                domain_name=test_data.domain_name,
                program_name=test_data.program_name,
                level_id=test_data.level.level_id,
                summary=StatisticsSummary(
                    accuracy_percent=0.0,
                    avg_time_seconds=0.0,
                    speed_profile="Balanced",
                    behavior_insights=["No questions attempted."],
                ),
                strong_topics=[],
                weak_topics=[],
                recommendations=[
                    "Start by reviewing the topic overview.",
                    "Take the first quiz to assess your baseline.",
                    "Focus on foundational concepts.",
                    "Review examples and practice problems.",
                    "Track your progress over time.",
                ],
                topic_breakdown=[],
            )

        questions_json = json.dumps(
            [q.model_dump() for q in test_data.level.questions], ensure_ascii=False
        )
        summary_dict = _compute_summary(test_data)
        summary_json = json.dumps(summary_dict, ensure_ascii=False)

        prompt = build_statistics_prompt(
            domain_name=test_data.domain_name,
            program_name=test_data.program_name,
            level_id=test_data.level.level_id,
            difficulty_score=test_data.level.difficulty_score,
            questions_json=questions_json,
            summary_json=summary_json,
        )
        # Call LLM via Groq or Ollama, same pattern as other routes
        if USE_GROQ:
            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": STATISTICS_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_completion_tokens": 1500,
            }
            resp = groq_post(payload, timeout=30)
            raw_text = resp.json().get("choices", [])[0].get("message", {}).get("content", "")
        else:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.3},
                },
                timeout=30,
            )
            resp.raise_for_status()
            raw_text = resp.json().get("response", "")

        text = clean_json_string(raw_text)
        data = json.loads(text)

        if "strong_topics" not in data:
            data["strong_topics"] = []
        if "weak_topics" not in data:
            data["weak_topics"] = []
        if "recommendations" not in data or len(data["recommendations"]) != 5:
            data["recommendations"] = [
                "Review weak topics thoroughly.",
                "Practice regularly on challenging concepts.",
                "Use active learning strategies.",
                "Take timed practice tests.",
                "Seek help on difficult topics.",
            ]
        if "topic_breakdown" not in data:
            data["topic_breakdown"] = []

        return StatisticsApiResponse(**data)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from AI model: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e) or "Statistics analysis failed")
