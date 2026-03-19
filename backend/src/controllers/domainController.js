import Domain from '../models/domainModel.js';

/**
 * Create or update a single domain
 */
export const createDomain = async (req, res) => {
  try {
    const { id, title, icon, color, bg, programs } = req.body;

    if (!id || !title || !icon || !color || !bg || !programs) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Upsert: find by id and update, or create if not found
    const domain = await Domain.findOneAndUpdate(
      { id },
      { id, title, icon, color, bg, programs },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: 'Domain created/updated successfully',
      data: domain,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create/update domain' });
  }
};

/**
 * Create or update multiple domains (bulk)
 */
export const createDomains = async (req, res) => {
  try {
    const domains = req.body; // expect array of domain objects

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Expected an array of domains' });
    }

    // Validate each domain
    for (const domain of domains) {
      if (!domain.id || !domain.title || !domain.icon || !domain.color || !domain.bg || !domain.programs) {
        return res.status(400).json({ error: 'All fields are required for each domain' });
      }
    }

    // Bulk upsert using bulkWrite
    const operations = domains.map((domain) => ({
      updateOne: {
        filter: { id: domain.id },
        update: { $set: domain },
        upsert: true,
      },
    }));

    const result = await Domain.bulkWrite(operations);

    return res.status(201).json({
      message: 'Domains created/updated successfully',
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      data: domains,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create/update domains' });
  }
};

/**
 * Get all domains
 */
export const getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Domains retrieved successfully',
      count: domains.length,
      data: domains,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve domains' });
  }
};

/**
 * Get a single domain by ID
 */
export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await Domain.findOne({ id });

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    return res.status(200).json({
      message: 'Domain retrieved successfully',
      data: domain,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve domain' });
  }
};

/**
 * Update a domain by ID
 */
export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const domain = await Domain.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    return res.status(200).json({
      message: 'Domain updated successfully',
      data: domain,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update domain' });
  }
};

/**
 * Delete a domain by ID
 */
export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await Domain.findOneAndDelete({ id });

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    return res.status(200).json({
      message: 'Domain deleted successfully',
      data: domain,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete domain' });
  }
};
