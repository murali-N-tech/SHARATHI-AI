from sklearn.metrics.pairwise import cosine_similarity
from app.config import SEMANTIC_THRESHOLD, embedding_model
from typing import List, Any

def exact_repeat(question: str, history: List[Any]) -> bool:
    """Check if question is an exact match"""
    q = question.lower().strip()
    for h in history:
        h_text = h.get("question_text") if isinstance(h, dict) else h.question_text
        if q == h_text.lower().strip():
            return True
    return False

def semantic_repeat(question: str, history: List[Any]) -> bool:
    """Check if question is semantically similar to history"""
    if not history:
        return False
    
    # Extract question texts from history items
    history_texts = []
    for h in history:
        if isinstance(h, dict):
            history_texts.append(h.get("question_text", ""))
        else:
            history_texts.append(h.question_text)
    
    texts = history_texts + [question]
    embeddings = embedding_model.encode(texts)

    new_emb = embeddings[-1].reshape(1, -1)
    hist_embs = embeddings[:-1]

    similarity = cosine_similarity(new_emb, hist_embs)[0].max()
    return similarity >= SEMANTIC_THRESHOLD
