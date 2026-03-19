import express from 'express';
import {
  createCustomDomain,
  getUserCustomDomains,
  getCustomDomainById,
  updateCustomDomain,
  deleteCustomDomain,
} from '../controllers/customDomainController.js';

const router = express.Router();

// Create a new custom domain
router.post('/', createCustomDomain);

// Get all custom domains for a user
router.get('/user/:userId', getUserCustomDomains);

// Get a specific custom domain
router.get('/:id', getCustomDomainById);

// Update a custom domain
router.put('/:id', updateCustomDomain);

// Delete a custom domain
router.delete('/:id', deleteCustomDomain);

export default router;
