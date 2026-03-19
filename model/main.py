import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import mcq, curriculum, quiz, statistics, next_level, topics, pdf_processing
from app.routes import assignment, assignment_quiz

# Initialize FastAPI app
app = FastAPI(title="Adaptive Quiz Engine", version="1.0.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# ==========================================
# CORS CONFIGURATION
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# INCLUDE ROUTERS
# ==========================================
app.include_router(mcq.router)
app.include_router(curriculum.router)
app.include_router(quiz.router)
app.include_router(statistics.router)
app.include_router(next_level.router)
app.include_router(topics.router)
app.include_router(assignment.router)
app.include_router(assignment_quiz.router)
app.include_router(pdf_processing.router)
# ==========================================
# HEALTH CHECK
# ==========================================
@app.get("/health")
async def health():
    return {"status": "healthy"}

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    # Bind to 0.0.0.0 so the service is reachable on the LAN/IP
    uvicorn.run(app, host="0.0.0.0", port=8000)
