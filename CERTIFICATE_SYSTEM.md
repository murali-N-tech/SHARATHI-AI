# Certificate Generation System - Implementation Guide

## Overview
When a student completes all 5/5 programs and passes the final assessment, the system automatically generates digital certificates via the backend API.

## How It Works

### 1. **Frontend Detection** (CustomDomainDetails.jsx)
- Tracks completion status of all courses/programs
- Detects when `finalAssessmentCompleted` becomes true
- Automatically calls the certificate generation API

### 2. **API Call Flow**
```javascript
// Triggered when all 5 programs are completed:
const result = await checkAndGenerateCertificates(completedPrograms);
```

This calls the `/api/certificates/check-and-create` endpoint with:
- `userId` - From localStorage
- `completedPrograms` - Array of completed program IDs

### 3. **Backend Processing** (certificateController.js)
- Verifies all 5 programs are completed
- For each program, checks if certificate already exists
- If not, creates new certificate with unique credential ID
- Returns success message and certificate data

### 4. **Certificate Data Structure**
```json
{
  "userId": "user_id",
  "title": "Program Name",
  "issuer": "SARATHI",
  "date": "2024-12-19",
  "grade": "A+",
  "credentialId": "SF-2024-PN-XXXX",
  "status": "earned",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "color": "from-blue-500 to-cyan-500"
}
```

### 5. **Duplicate Prevention**
The system checks if a certificate already exists for a user and program:
```javascript
const existingCert = await Certificate.findOne({
  userId: userId,
  title: programTitle
});
```
If it exists, it returns the existing certificate without creating a new one.

### 6. **User Experience**
- ✅ Toast notification appears: "🎉 Certificates Generated!"
- ✅ Auto-redirects to `/student/certificates` page after 3 seconds
- ✅ User can view all earned certificates with QR codes
- ✅ Certificates can be downloaded or shared

## API Endpoints

### 1. Check & Create All Certificates
```
POST /api/certificates/check-and-create
Body: { userId: string, completedPrograms: array }
Response: { success: true, certificatesCreated: true, certificates: [] }
```

### 2. Get User Certificates
```
GET /api/certificates/user/:userId
Response: { success: true, count: number, certificates: [] }
```

### 3. Verify Certificate (QR Code)
```
GET /api/certificates/verify/:credentialId
Response: { success: true, certificate: {...} }
```

### 4. Generate Single Certificate
```
POST /api/certificates/generate
Body: { userId, programTitle, grade, skills, color }
Response: { success: true, certificate: {...} }
```

## Files Modified/Created

### Backend
- ✅ `/backend/src/models/certificateModel.js` - Certificate schema
- ✅ `/backend/src/controllers/certificateController.js` - Certificate logic
- ✅ `/backend/src/routes/certificateRoutes.js` - API endpoints
- ✅ `/backend/index.js` - Added certificate routes

### Frontend
- ✅ `/frontend/src/utils/certificateApi.js` - API utility functions
- ✅ `/frontend/src/pages/student/CustomDomainDetails.jsx` - Integration
- ✅ `/frontend/src/pages/student/Certificates.jsx` - Certificate display

## Integration Points

### When Student Completes Final Assessment:
1. `finalAssessmentCompleted` state changes to true
2. useEffect hook detects the change
3. Calls `checkAndGenerateCertificates()`
4. Toast notification displays
5. Page redirects to certificates page

### Reading from localStorage:
```javascript
const userString = localStorage.getItem('user');
const user = JSON.parse(userString);
const userId = user.id || user._id;
```

## Testing

To test the certificate generation:

1. **Complete all 5 programs** in a custom domain
2. **Take the final assessment** and pass it
3. **Check the console** for success messages
4. **View certificates page** - should show generated certificates
5. **Scan QR code** - should verify certificate details

## Environment Variables

Make sure these are set in your `.env`:
- `MONGODB_URI` - Database connection
- `PORT` - Backend port (default: 5000)

## Notes

- Certificates are stored in MongoDB with user association
- Credential IDs are unique and auto-generated
- Users can't get duplicate certificates for the same program
- Certificate colors and skills are customizable
- QR codes link to the public verification endpoint
