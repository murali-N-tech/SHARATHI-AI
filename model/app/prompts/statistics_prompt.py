from app.utils.text_processing import clean_json_string

STATISTICS_SYSTEM_PROMPT = (
    "You are a strict assessment analytics API. "
    "You only output valid JSON, no markdown, no extra text."
)


def build_statistics_prompt(
    domain_name: str,
    program_name: str,
    level_id: str,
    difficulty_score: int,
    questions_json: str,
    summary_json: str,
) -> str:
    """Build the statistics analysis prompt for the LLM."""
    return f"""<|system|>
{STATISTICS_SYSTEM_PROMPT}
<|end|>
<|user|>
You are analyzing a finished level test. Handle all edge cases gracefully.

Domain: {domain_name}
Program: {program_name}
Level: {level_id} (difficulty_score={difficulty_score})

RAW_QUESTIONS_JSON:
{questions_json}

SERVER_SUMMARY_JSON:
{summary_json}

Instructions:
1. Parse all questions and infer the most likely subtopic per question using question_text.
2. Aggregate performance by subtopic (accuracy + speed).
3. Identify ALL strong_topics and ALL weak_topics (sorted by confidence descending).
   - Strong: accuracy >= 75% OR (accuracy >= 60% AND speed is Fast)
   - Weak: accuracy < 50% OR (accuracy < 75% AND speed is Slow)
   - Neutral topics: don't include (but include if only 1-2 total)
4. Generate EXACTLY 5 personalized recommendations based on speed, accuracy patterns, and weak topics.

EDGE CASES TO HANDLE:
- If 0 questions: return empty arrays for strong/weak topics, generic recommendations
- If all correct (100%): recommend advanced extensions
- If all wrong (0%): recommend foundational review
- If only 1 question: infer 1 topic, generate cautious recommendations
- If speed_profile is Slow AND accuracy is high: recommend time management
- If speed_profile is Fast AND accuracy is low: recommend careful reading

STRICT OUTPUT JSON SCHEMA:
{{
  "domain_name": "string",
  "program_name": "string",
  "level_id": "string",
  "summary": {{
    "accuracy_percent": number,
    "avg_time_seconds": number,
    "speed_profile": "Fast" | "Balanced" | "Slow",
    "behavior_insights": ["string", "string"]
  }},
  "strong_topics": [
    {{ "topic": "string", "confidence": number (0-1), "rationale": "string" }},
    ... (ANY number, 0 or more)
  ],
  "weak_topics": [
    {{ "topic": "string", "confidence": number (0-1), "rationale": "string" }},
    ... (ANY number, 0 or more)
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2",
    "actionable recommendation 3",
    "actionable recommendation 4",
    "actionable recommendation 5"
  ],
  "topic_breakdown": [
    {{
      "topic": "string",
      "question_count": number,
      "correct_count": number,
      "avg_time_seconds": number,
      "accuracy_percent": number
    }},
    ... (ALL inferred topics)
  ]
}}

Rules:
- Output ONLY a single JSON object (no markdown fences).
- confidence must be 0.0–1.0.
- strong_topics and weak_topics can have 0 or more entries (not limited to 3).
- topic_breakdown must include ALL inferred topics.
- If questions is empty, return empty arrays and generic recommendations.
- If only 1 subtopic exists, include it in strong_topics or weak_topics appropriately.
- recommendations must always be exactly 5, even in edge cases.
<|end|>
<|assistant|>
""".strip()
