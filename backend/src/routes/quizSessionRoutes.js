import express from 'express';
import { createQuizSession, getQuizSessions, getCompletedLevels, saveQuizAnalysis } from '../controllers/quizSessionController.js';

const router = express.Router();

// Store a completed quiz session
router.post('/', createQuizSession);

// Store or update analyzed insights for a quiz session
router.post('/analysis', saveQuizAnalysis);

// Get quiz sessions (query: ?domainId=&programId=&email=)
router.get('/', getQuizSessions);

// Get completed levels for a specific course (query: ?domainId=&programId=&email=)
router.get('/levels/completed', getCompletedLevels);

export default router;
