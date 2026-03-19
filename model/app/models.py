from pydantic import BaseModel, Field
from typing import List, Optional


class QuizHistoryItem(BaseModel):
    question_text: str
    user_answer: str
    was_correct: bool


class QuizRequest(BaseModel):
    domain_name: str
    program_name: str
    level: int  # 1-5
    session_id: Optional[str] = None
    history: List[QuizHistoryItem] = []


class AssignmentQuizRequest(BaseModel):
    """Request model for assignment-based adaptive quizzes.

    topics: list of topic titles or objects (will be serialized to JSON for the prompt)
    level: current difficulty level (1-5)
    history: same structure as QuizRequest.history, used for level adjustment
    """

    topics: List[object]
    level: int  # 1-5
    session_id: Optional[str] = None
    history: List[QuizHistoryItem] = []


class StatisticsQuestion(BaseModel):
    question_id: str
    question_text: str
    options: List[str]
    correct_option_index: int
    user_answer_index: int
    is_correct: bool
    time_taken_seconds: float = Field(ge=0)


class StatisticsLevelPayload(BaseModel):
    level_id: str
    level_name: str
    difficulty_score: int
    questions: List[StatisticsQuestion]


class StatisticsTestData(BaseModel):
    domain_name: str
    program_name: str
    level: StatisticsLevelPayload


class StatisticsApiRequest(BaseModel):
    test_data: StatisticsTestData


class TopicConfidence(BaseModel):
    topic: str
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: Optional[str] = None


class TopicBreakdownItem(BaseModel):
    topic: str
    question_count: int
    correct_count: int
    avg_time_seconds: float
    accuracy_percent: float


class StatisticsSummary(BaseModel):
    accuracy_percent: float
    avg_time_seconds: float
    speed_profile: str  # "Fast", "Balanced", "Slow"
    behavior_insights: List[str]


class StatisticsApiResponse(BaseModel):
    domain_name: str
    program_name: str
    level_id: str
    summary: StatisticsSummary
    strong_topics: List[TopicConfidence]
    weak_topics: List[TopicConfidence]
    recommendations: List[str]
    topic_breakdown: List[TopicBreakdownItem]


class NextLevelSubtopic(BaseModel):
    order: int
    title: str
    type: str  # "Remediation", "Practice", "Extension"
    objective: str
    estimated_time_minutes: int


class NextLevelTopicsRequest(BaseModel):
    domain_name: str
    program_name: str
    current_level_id: str
    next_level_id: str
    strong_topics: List[TopicConfidence]
    weak_topics: List[TopicConfidence]
    summary: StatisticsSummary


class NextLevelTopicsResponse(BaseModel):
    domain_name: str
    program_name: str
    current_level_id: str
    next_level_id: str
    balance_strategy: Optional[str] = None
    subtopics: List[NextLevelSubtopic]
