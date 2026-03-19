from app.utils.text_processing import clean_json_string

NEXT_LEVEL_SYSTEM_PROMPT = (
    "You are a strict curriculum planning API. "
    "You only output valid JSON, no markdown, no extra text."
)


def build_next_level_prompt(
    domain_name: str,
    program_name: str,
    current_level_id: str,
    next_level_id: str,
    strong_topics_json: str,
    weak_topics_json: str,
    summary_json: str,
) -> str:
    """Build the next-level topics generation prompt for the LLM."""
    return f"""<|system|>
{NEXT_LEVEL_SYSTEM_PROMPT}
<|end|>
<|user|>
Design the next level subtopics dynamically.

Domain: {domain_name}
Program: {program_name}
Current Level: {current_level_id}
Next Level: {next_level_id}

STRONG_TOPICS_JSON:
{strong_topics_json}

WEAK_TOPICS_JSON:
{weak_topics_json}

CURRENT_LEVEL_SUMMARY_JSON:
{summary_json}

Instructions:
1. Analyze the actual weak_topics and strong_topics counts (may be 0 or more).
2. Balance subtopics dynamically:
   - If NO weak topics: 100% extension (build on strengths)
   - If NO strong topics: 100% remediation (fix weaknesses)
   - If both exist: ~60% remediation (weak areas) + ~40% extension (strong areas)
   - Adjust percentages if weak_topics count is very high (>5) or very low (<2)
3. Produce 10–15 subtopics for the next level.
4. Sequence subtopics from foundational to advanced.
5. Keep titles concise and technical (no sentences).
6. Provide an objective for each subtopic (one sentence).
7. Tag subtopics with type: "Remediation" | "Practice" | "Extension".
8. Estimate time_minutes based on speed_profile and topic complexity.

EDGE CASES:
- If 0 weak_topics: focus 100% on extension/advanced topics from strong areas.
- If 0 strong_topics: focus 100% on remediation/foundational topics.
- If speed_profile is "Slow": increase estimated_time_minutes by 20%.
- If speed_profile is "Fast": decrease estimated_time_minutes by 15%.
- If accuracy_percent < 30%: include extra remediation topics at start.

STRICT OUTPUT JSON SCHEMA:
{{
  "domain_name": "string",
  "program_name": "string",
  "current_level_id": "string",
  "next_level_id": "string",
  "balance_strategy": "string (description of remediation % vs extension %)",
  "subtopics": [
    {{
      "order": number (1, 2, 3, ...),
      "title": "string",
      "type": "Remediation" | "Practice" | "Extension",
      "objective": "string (one sentence)",
      "estimated_time_minutes": number
    }},
    ... (10–15 total)
  ]
}}

Rules:
- Output ONLY raw JSON.
- subtopics length must be between 10 and 15 inclusive.
- order must start at 1 and be sequential with no gaps.
- type distribution must match balance_strategy percentages.
- If weak_topics is empty, do NOT force remediation; use only Extension/Practice.
- If strong_topics is empty, do NOT force extension; use only Remediation/Practice.
<|end|>
<|assistant|>
""".strip()
