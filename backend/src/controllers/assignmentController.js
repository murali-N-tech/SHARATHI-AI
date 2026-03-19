import Assignment from '../models/assignmentModel.js';

// Generate a random alphanumeric test key
const generateTestKey = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
};

// Store assignment payload ensuring unique test_key
export const storeAssignment = async (req, res) => {
  try {
    const payload = req.body || {};

    // Accept either full wrapper { status, data, test_key } or direct data object
    const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;

    const assignmentName = data.assignment_name || data.assignmentName || data.title || data.name;
    const description = data.description || '';
    const topics = Array.isArray(data.topics) ? data.topics : [];
    const totalQuestions = 15;
    const difficultyLevel = data.difficulty_level || data.difficulty || '';
    const userPrompt = data.user_prompt || data.userPrompt || data.prompt || '';

    if (!assignmentName || !topics.length) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields: assignment_name and topics (non-empty array) are required' });
    }

    // Strip any client-provided test_key values from the raw payload
    const cleanedPayload = JSON.parse(JSON.stringify(payload));
    try {
      if (cleanedPayload.test_key) delete cleanedPayload.test_key;
      if (cleanedPayload.testKey) delete cleanedPayload.testKey;
      if (cleanedPayload.data && typeof cleanedPayload.data === 'object') {
        if (cleanedPayload.data.test_key) delete cleanedPayload.data.test_key;
        if (cleanedPayload.data.testKey) delete cleanedPayload.data.testKey;
      }
    } catch (e) {
      // ignore cleaning errors
    }

    // Always generate a fresh unique test_key server-side
    let testKeyCandidate = generateTestKey();
    let exists = await Assignment.findOne({ test_key: testKeyCandidate });
    let attempts = 0;
    while (exists && attempts < 20) {
      testKeyCandidate = generateTestKey();
      exists = await Assignment.findOne({ test_key: testKeyCandidate });
      attempts++;
    }
    if (exists) {
      return res.status(500).json({ status: 'error', message: 'Could not generate unique test_key, try again' });
    }

    const assignment = new Assignment({
      assignment_name: assignmentName,
      description,
      topics,
      total_questions: totalQuestions,
      difficulty_level: difficultyLevel,
      test_key: testKeyCandidate,
      user_prompt: userPrompt,
      // store cleaned payload without client-provided keys
      raw_payload: cleanedPayload,
    });

    const saved = await assignment.save();

    return res.status(201).json({ status: 'success', data: saved, test_key: saved.test_key });
  } catch (err) {
    console.error('Error storing assignment:', err);
    // Handle duplicate key rare case
    if (err.code === 11000 && err.keyPattern && err.keyPattern.test_key) {
      return res.status(500).json({ status: 'error', message: 'test_key collision, try again' });
    }
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// GET /api/assignments - list all assignments
export const listAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ status: 'success', data: assignments });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// GET /api/assignments/:id - get single assignment by Mongo _id
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ status: 'error', message: 'Assignment not found' });
    }

    return res.json({ status: 'success', data: assignment });
  } catch (err) {
    console.error('Error fetching assignment by id:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// GET /api/assignments/by-key/:testKey - get topics for an assignment by its public test_key
export const getAssignmentTopicsByTestKey = async (req, res) => {
  try {
    const { testKey } = req.params;

    if (!testKey) {
      return res.status(400).json({ status: 'error', message: 'testKey is required' });
    }

    const assignment = await Assignment.findOne({ test_key: testKey }).lean();
    if (!assignment) {
      return res.status(404).json({ status: 'error', message: 'Assignment not found' });
    }

    const topics = Array.isArray(assignment.topics) ? assignment.topics : [];

    return res.json({
      status: 'success',
      data: {
        assignment_id: assignment._id,
        assignment_name: assignment.assignment_name,
        test_key: assignment.test_key,
        topics,
      },
    });
  } catch (err) {
    console.error('Error fetching assignment topics by test_key:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

export default { storeAssignment, listAssignments };
