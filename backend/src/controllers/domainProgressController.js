import DomainProgress from '../models/domainProgressModel.js';

export const updateDomainProgress = async (req, res) => {
  try {
    const { domainId, email, progress, completedCourses, totalCourses } = req.body;

    if (!domainId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'domainId and email are required'
      });
    }

    // Find and update or create if doesn't exist
    const updated = await DomainProgress.findOneAndUpdate(
      { domainId, email },
      {
        domainId,
        email,
        progress: progress || 0,
        completedCourses: completedCourses || 0,
        totalCourses: totalCourses || 0,
        lastUpdatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`✓ Updated progress for ${email} in domain ${domainId}: ${progress}%`);

    return res.status(200).json({
      status: 'success',
      message: 'Domain progress updated',
      data: updated
    });
  } catch (error) {
    console.error('Error updating domain progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update domain progress',
      error: error.message
    });
  }
};

export const getDomainProgress = async (req, res) => {
  try {
    const { domainId, email } = req.query;

    if (!domainId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'domainId and email are required'
      });
    }

    const decodedEmail = decodeURIComponent(email);
    const progress = await DomainProgress.findOne({ domainId, email: decodedEmail });

    return res.status(200).json({
      status: 'success',
      data: progress || {
        domainId,
        email: decodedEmail,
        progress: 0,
        completedCourses: 0,
        totalCourses: 0
      }
    });
  } catch (error) {
    console.error('Error fetching domain progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch domain progress',
      error: error.message
    });
  }
};

export const getUserAllDomainProgress = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'email is required'
      });
    }

    const decodedEmail = decodeURIComponent(email);
    const progressList = await DomainProgress.find({ email: decodedEmail }).sort({ lastUpdatedAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: progressList
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
};

export const getDomainProgressByDomainId = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { email } = req.query;

    if (!domainId) {
      return res.status(400).json({
        status: 'error',
        message: 'domainId is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'email is required'
      });
    }

    const decodedEmail = decodeURIComponent(email);
    const progress = await DomainProgress.findOne({ domainId, email: decodedEmail });

    return res.status(200).json({
      status: 'success',
      data: progress || {
        domainId,
        email: decodedEmail,
        progress: 0,
        completedCourses: 0,
        totalCourses: 0,
        finalAssessmentCompleted: false
      }
    });
  } catch (error) {
    console.error('Error fetching domain progress by domainId:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch domain progress',
      error: error.message
    });
  }
};

export const getDomainProgressByDomainIdOnly = async (req, res) => {
  try {
    const { domainId } = req.params;

    if (!domainId) {
      return res.status(400).json({
        status: 'error',
        message: 'domainId is required'
      });
    }

    const allDomainProgress = await DomainProgress.find({ domainId }).sort({ lastUpdatedAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: allDomainProgress,
      count: allDomainProgress.length
    });
  } catch (error) {
    console.error('Error fetching all progress for domain:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch domain progress',
      error: error.message
    });
  }
};

export const completeFinalAssessment = async (req, res) => {
  try {
    const { domainId, email } = req.body;

    if (!domainId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'domainId and email are required'
      });
    }

    // Find and update domain progress to mark final assessment as completed
    const updated = await DomainProgress.findOneAndUpdate(
      { domainId, email },
      {
        finalAssessmentCompleted: true,
        lastUpdatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`✓ Final assessment completed for ${email} in domain ${domainId}`);

    return res.status(200).json({
      status: 'success',
      message: 'Final assessment marked as completed',
      data: updated
    });
  } catch (error) {
    console.error('Error marking final assessment as completed:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to mark final assessment as completed',
      error: error.message
    });
  }
};
