import CustomDomain from '../models/customDomainModel.js';

export const createCustomDomain = async (req, res) => {
  try {
    const { userId, name, userPrompt, mainTopic, courses, description } = req.body;

    if (!userId || !name || !userPrompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, name, userPrompt',
      });
    }

    const customDomain = new CustomDomain({
      userId,
      name,
      userPrompt,
      mainTopic: mainTopic || name,
      description: description || '',
      courses: courses || [],
      icon: 'Sparkles',
      color: 'hsl(48, 96%, 53%)',
      difficulty: 3,
      progress: 0,
      isCustom: true,
    });

    const savedDomain = await customDomain.save();

    return res.status(201).json({
      status: 'success',
      message: 'Custom domain created successfully',
      data: savedDomain,
    });
  } catch (error) {
    console.error('Error creating custom domain:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getUserCustomDomains = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing userId parameter',
      });
    }

    const customDomains = await CustomDomain.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: customDomains,
    });
  } catch (error) {
    console.error('Error fetching user custom domains:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getCustomDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    const customDomain = await CustomDomain.findById(id);

    if (!customDomain) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom domain not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: customDomain,
    });
  } catch (error) {
    console.error('Error fetching custom domain:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const updateCustomDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customDomain = await CustomDomain.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!customDomain) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom domain not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Custom domain updated successfully',
      data: customDomain,
    });
  } catch (error) {
    console.error('Error updating custom domain:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const deleteCustomDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const customDomain = await CustomDomain.findByIdAndDelete(id);

    if (!customDomain) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom domain not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Custom domain deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting custom domain:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};
