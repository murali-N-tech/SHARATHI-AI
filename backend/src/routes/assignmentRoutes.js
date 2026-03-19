import express from 'express';
import { storeAssignment, listAssignments, getAssignmentById, getAssignmentTopicsByTestKey } from '../controllers/assignmentController.js';

const router = express.Router();

// GET /api/assignments  - list all assignments
router.get('/', listAssignments);

// GET /api/assignments/topics/:testKey - get topics for an assignment by its public test key
router.get('/topics/:testKey', getAssignmentTopicsByTestKey);

// GET /api/assignments/:id - get a single assignment by id
router.get('/:id', getAssignmentById);

// POST /api/assignments  - store generated assignment JSON
router.post('/', storeAssignment);

export default router;
