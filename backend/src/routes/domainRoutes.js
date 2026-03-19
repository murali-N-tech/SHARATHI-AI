import express from 'express';
import {
  createDomain,
  createDomains,
  getAllDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
} from '../controllers/domainController.js';

const router = express.Router();

/**
 * POST /api/domains
 * Create a single domain or bulk create multiple domains
 * Body: { id, title, icon, color, bg, programs } or [{ ... }, { ... }, ...]
 */
router.post('/create', (req, res, next) => {
  if (Array.isArray(req.body)) {
    return createDomains(req, res);
  }
  return createDomain(req, res);
});

/**
 * GET /api/domains
 * Get all domains
 */
router.get('/', getAllDomains);

/**
 * GET /api/domains/:id
 * Get a single domain by id
 */
router.get('/:id', getDomainById);

/**
 * PUT /api/domains/:id
 * Update a domain by id
 */
router.put('/:id', updateDomain);

/**
 * DELETE /api/domains/:id
 * Delete a domain by id
 */
router.delete('/:id', deleteDomain);

export default router;
