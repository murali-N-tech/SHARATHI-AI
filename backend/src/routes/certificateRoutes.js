import express from "express";
import {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  checkAndCreateCertificates,
} from "../controllers/certificateController.js";

const router = express.Router();

// Generate a certificate for a completed program
router.post("/generate", generateCertificate);

// Get all certificates for a user
router.get("/user/:userId", getUserCertificates);

// Verify certificate by credential ID (public route)
router.get("/verify/:credentialId", verifyCertificate);

// Check if all 5 programs are completed and create certificates
router.post("/check-and-create", checkAndCreateCertificates);

export default router;
