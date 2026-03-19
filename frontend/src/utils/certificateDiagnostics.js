/**
 * DEBUG: Certificate System Diagnostics
 * Add this to check if everything is properly connected
 */
import { BACKEND_API } from '../lib/apiConfig';

export const checkCertificateSetup = () => {
  console.log('=== CERTIFICATE SYSTEM DIAGNOSTICS ===');
  
  // Check 1: User data in localStorage
  console.log('\n1️⃣  Checking localStorage userData...');
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const user = JSON.parse(userDataStr);
      console.log('✅ userData found:', {
        id: user.id,
        name: user.name,
        email: user.email
      });
      if (!user.id) {
        console.warn('⚠️  userData.id is missing!');
      }
    } catch (e) {
      console.error('❌ Failed to parse userData:', e);
    }
  } else {
    console.error('❌ userData not found in localStorage');
  }

  // Check 2: API endpoint
  console.log('\n2️⃣  Checking API endpoint...');
  const apiUrl = `${BACKEND_API}/api/certificates/check-and-create`;
  console.log(`API URL: ${apiUrl}`);

  // Check 3: Test API call
  console.log('\n3️⃣  Testing API call...');
  testCertificateAPI();
};

const testCertificateAPI = async () => {
  try {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      console.error('❌ Cannot test - userData not found');
      return;
    }

    const user = JSON.parse(userDataStr);
    const userId = user.id || user._id;

    if (!userId) {
      console.error('❌ Cannot test - userId not found');
      return;
    }

    console.log('📤 Sending test request...');
    const response = await fetch(`${BACKEND_API}/api/certificates/check-and-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        completedPrograms: ['prog1', 'prog2', 'prog3', 'prog4', 'prog5'],
      }),
    });

    console.log(`📥 Response status: ${response.status}`);
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.error('❌ API returned error:', data);
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

// Run diagnostics on import
if (typeof window !== 'undefined') {
  window.checkCertificateSetup = checkCertificateSetup;
  console.log('🔧 Diagnostics available: window.checkCertificateSetup()');
}
