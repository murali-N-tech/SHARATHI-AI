# Certificate API - Error Fixes Applied

## Issues Found & Fixed ✅

### 1. **Wrong API Base URL**
- **Issue**: API was pointing to `http://localhost:5000/api` 
- **Fix**: Changed to `http://localhost:9000/api` (correct backend port)
- **File**: `frontend/src/utils/certificateApi.js`

### 2. **Wrong localStorage Key for User**
- **Issue**: Was looking for `localStorage.getItem('user')`
- **Fix**: Changed to `localStorage.getItem('userData')` (correct key from Google OAuth)
- **File**: `frontend/src/utils/certificateApi.js`

### 3. **Added Better Error Logging**
- Added detailed console logs to track API calls
- Added error handling with descriptive messages
- Helps identify where the problem occurs if it fails again

## How to Test

### Method 1: Using Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `window.checkCertificateSetup()`
4. This will run diagnostics and show:
   - ✅ If userData is in localStorage
   - ✅ If API endpoint is reachable
   - ✅ Sample API response

### Method 2: Manual Testing
1. Complete all 5 programs in a custom domain
2. Take the final assessment
3. Open DevTools Console (F12)
4. Look for messages like:
   - `📤 Sending certificate request with userId: ...`
   - `📥 Response status: 200`
   - `✓ Certificates generated successfully!`

### Method 3: Check Network Tab
1. Open DevTools → Network tab
2. Complete all programs and take final assessment
3. Look for POST request to `/api/certificates/check-and-create`
4. Check response for status 200 and certificate data

## Expected Console Output

When everything works:
```
📤 Sending certificate request with userId: abc123... programs: 5
📥 Response status: 200
📥 Response data: {
  success: true,
  message: "All 5 programs completed! Certificates generated.",
  certificatesCreated: true,
  count: 5,
  certificates: [...]
}
✓ Certificates generated successfully!
```

## Still Having Issues?

1. **Check Backend Running**
   - Make sure backend is running on port 9000
   - Check: `http://localhost:9000/api/domains` (should return data)

2. **Check Database Connected**
   - MongoDB must be running and connected
   - Check backend logs for connection errors

3. **Check User Logged In**
   - Must be logged in with Google OAuth
   - Check localStorage has `userData` with `id` field

4. **Check Certificates Collection**
   - In MongoDB, check if `certificates` collection exists
   - Should have documents after completion

## Files Modified

- ✅ `frontend/src/utils/certificateApi.js` - Fixed API URL and localStorage key
- ✅ `frontend/src/pages/student/CustomDomainDetails.jsx` - Added better logging
- ✅ `frontend/src/utils/certificateDiagnostics.js` - Created diagnostics tool (NEW)

## Next Steps

1. Clear browser cache (Ctrl+Shift+Del)
2. Restart backend server
3. Test again with diagnostics tool
4. Check console logs for specific errors
