import Session from '../models/quizSessionModel.js';

// Create or store a quiz session document
export const createQuizSession = async (req, res) => {
  try {
    const { email, domainId, sessionId, payload, attemptedAt, testKey } = req.body;

    if (!sessionId || !payload) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: sessionId, payload',
      });
    }

    // Derive score and pass/fail from payload if possible
    let scorePercent = null;
    let passed = false;
    try {
      const questionsSource = Array.isArray(payload?.questions)
        ? payload.questions
        : (payload?.analytics?.level?.questions || []);

      const total = Array.isArray(questionsSource) ? questionsSource.length : 0;
      if (total > 0) {
        const correct = questionsSource.reduce((acc, q) => {
          const isCorrect =
            typeof q?.is_correct === 'boolean'
              ? q.is_correct
              : q?.user_answer_index === q?.correct_option_index;
          return acc + (isCorrect ? 1 : 0);
        }, 0);

        scorePercent = (correct / total) * 100;

        const PASSING_PERCENT = Number(process.env.MIN_PASS_PERCENT || 60);
        passed = scorePercent >= PASSING_PERCENT;
      }
    } catch (scoreErr) {
      console.error('Error computing quiz session score:', scoreErr);
    }

    const doc = new Session({
      email: email || null,
      domainId: domainId || null,
      testKey: testKey || null,
      sessionId,
      payload,
      attemptedAt: attemptedAt ? new Date(attemptedAt) : undefined,
      scorePercent,
      passed,
    });

    const saved = await doc.save();

    return res.status(201).json({
      status: 'success',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating quiz session:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Attach or update statistics analysis for a given quiz session
// Body: { sessionId, analysis, email?, domainId?, programId? }
export const saveQuizAnalysis = async (req, res) => {
  try {
    const { sessionId, analysis, email, domainId } = req.body || {};

    if (!sessionId || !analysis) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: sessionId, analysis',
      });
    }

    // Always target by sessionId so analysis attaches to the
    // same document created when the quiz was submitted. We still
    // update email/domain/program fields, but do not over-constrain
    // the filter to avoid creating duplicate docs.
    const filter = { sessionId };

    const update = {
      $set: {
        analysis,
        email: email || null,
        domainId: domainId || null,
      },
      $setOnInsert: {
        sessionId,
        payload: {},
      },
    };

    const result = await Session.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error saving quiz analysis:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get quiz sessions by query (domainId, programId, email, testKey optional)
export const getQuizSessions = async (req, res) => {
  try {
    const { domainId, programId, email, testKey } = req.query;
    console.log('getQuizSessions query:', { domainId, programId, email, testKey });

    const filter = {};
    if (domainId) filter.domainId = domainId;
    if (email) filter.email = decodeURIComponent(email);
    if (programId) {
      filter['payload.programId'] = programId;
    }
    if (testKey) {
      filter.testKey = testKey;
    }
    
    console.log('Query filter:', JSON.stringify(filter, null, 2));

    console.log('Attempting to find sessions...');
    const sessions = await Session.find(filter).sort({ attemptedAt: -1 }).limit(200);
    console.log('Sessions found:', sessions.length);
    if (sessions.length > 0) {
      console.log('First session:', JSON.stringify(sessions[0], null, 2));
    }

    return res.status(200).json({ status: 'success', data: sessions });
  } catch (error) {
    console.error('Error fetching quiz sessions:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Get completed levels for a specific course/program
// Query params: domainId, programId (program slug), email
// Returns: { status, completedLevels: [...], totalAttempts: N }
export const getCompletedLevels = async (req, res) => {
  try {
    let { domainId, programId, email } = req.query;

    // Decode URL-encoded parameters
    if (email) {
      email = decodeURIComponent(email);
    }

    if (!domainId || !programId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required query parameters: domainId, programId, email',
      });
    }

    console.log('getCompletedLevels query:', { domainId, programId, email });

    const filter = {
      domainId,
      email,
      'payload.programId': programId,
    };

    console.log('Query filter:', JSON.stringify(filter, null, 2));

    const sessions = await Session.find(filter).sort({ attemptedAt: -1 }).limit(200);
    console.log('Sessions found:', sessions.length);

    // Extract all unique levels from payload.level
    const completedLevels = [];
    const levelSet = new Set();

    sessions.forEach(session => {
      const level = session?.payload?.level;
      if (typeof level !== 'undefined' && level !== null && level !== '') {
        const levelNum = Number(level);
        if (!Number.isNaN(levelNum) && !levelSet.has(levelNum)) {
          levelSet.add(levelNum);
          completedLevels.push({
            level: levelNum,
            attemptedAt: session.attemptedAt,
          });
        }
      }
    });

    // Sort by level ascending
    completedLevels.sort((a, b) => a.level - b.level);

    return res.status(200).json({
      status: 'success',
      completedLevels,
      totalAttempts: sessions.length,
      uniqueLevelsCompleted: completedLevels.length,
    });
  } catch (error) {
    console.error('Error fetching completed levels:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};
