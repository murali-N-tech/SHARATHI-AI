// API calls for certificate management

import { BACKEND_API } from '../lib/apiConfig';

// API base (allow env override, otherwise use centralized BACKEND_API)
const API_BASE_URL = import.meta.env.VITE_API_URL || `${BACKEND_API}/api`;

/**
 * Get user identifier from localStorage (email preferred)
 */
const getUserIdFromStorage = () => {
  const userString = localStorage.getItem('userData');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      // Use email as primary identifier, with fallbacks
      return user.email || user.id || user._id || user.sub;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if all 5 programs are completed and create certificates
 */
export const checkAndGenerateCertificates = async (completedPrograms, domainId) => {
  try {
    const userId = getUserIdFromStorage();
    if (!userId) {
      console.error('❌ User ID not found in localStorage');
      return null;
    }

    console.log('📤 Sending certificate request with userId (email):', userId, 'programs:', completedPrograms.length, 'domainId:', domainId);

    const response = await fetch(`${API_BASE_URL}/certificates/check-and-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        completedPrograms: completedPrograms,
        domainId: domainId,
      }),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error checking and generating certificates:', error);
    return null;
  }
};

/**
 * Generate a single certificate for a program
 */
export const generateCertificate = async (programTitle, grade, skills, color) => {
  try {
    const userId = getUserIdFromStorage();
    if (!userId) {
      console.error('User ID not found in localStorage');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        programTitle: programTitle,
        grade: grade,
        skills: skills,
        color: color,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate certificate');
    }

    return data;
  } catch (error) {
    console.error('Error generating certificate:', error);
    return null;
  }
};

/**
 * Get all certificates for the current user
 */
export const getUserCertificates = async () => {
  try {
    const userId = getUserIdFromStorage();
    if (!userId) {
      console.error('User ID not found in localStorage');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/certificates/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch certificates');
    }

    return data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return null;
  }
};

/**
 * Verify a certificate by credential ID
 */
export const verifyCertificate = async (credentialId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/certificates/verify/${credentialId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Certificate not found');
    }

    return data;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return null;
  }
};
