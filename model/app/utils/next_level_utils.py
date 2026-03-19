from app.models import (
    StatisticsApiResponse,
    NextLevelTopicsRequest,
)


def build_next_level_request_from_statistics(
    stats: StatisticsApiResponse,
    next_level_id: str,
) -> NextLevelTopicsRequest:
    """Convert a StatisticsApiResponse into a NextLevelTopicsRequest.

    This lets you pipe the output of /statistics/analyze directly
    into /next-level/topics.
    """
    return NextLevelTopicsRequest(
        domain_name=stats.domain_name,
        program_name=stats.program_name,
        current_level_id=stats.level_id,
        next_level_id=next_level_id,
        strong_topics=stats.strong_topics,
        weak_topics=stats.weak_topics,
        summary=stats.summary,
    )
