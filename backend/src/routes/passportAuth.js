import express from 'express';
import passport from 'passport';
import { googleCallback, logout } from '../controllers/passportAuthController.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/api' }), googleCallback);

router.get('/logout', logout);

export default router;
