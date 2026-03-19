import express from 'express';
import { updateDomainProgress, getDomainProgress, getUserAllDomainProgress, completeFinalAssessment, getDomainProgressByDomainId, getDomainProgressByDomainIdOnly } from '../controllers/domainProgressController.js';

const router = express.Router();

// POST: Update or create domain progress
router.post('/update', updateDomainProgress);

// POST: Mark final assessment as completed
router.post('/complete-final-assessment', completeFinalAssessment);

// GET: Fetch progress for specific domain by domainId and email
router.get('/domain/:domainId', getDomainProgressByDomainId);

// GET: Fetch all progress for a domain (all users)
router.get('/domain-all/:domainId', getDomainProgressByDomainIdOnly);

// GET: Fetch progress for specific domain (legacy, by query params)
router.get('/', getDomainProgress);

// GET: Fetch all progress for a user
router.get('/user/all', getUserAllDomainProgress);

export default router;
