import Certificate from "../models/certificateModel.js";
import User from "../models/userModel.js";
import CustomDomain from "../models/customDomainModel.js";
import mongoose from "mongoose";

// Generate unique credential ID
const generateCredentialId = (programTitle) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = programTitle.split(" ").map(w => w[0]).join("").toUpperCase();
  const year = new Date().getFullYear();
  return `SF-${year}-${prefix}-${timestamp}${random}`;
};

// Generate certificate when program is completed
export const generateCertificate = async (req, res) => {
  try {
    const { userId, programTitle, grade, skills, color } = req.body;

    if (!userId || !programTitle || !grade) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, programTitle, grade",
      });
    }

    // Resolve user identifier: allow either MongoDB ObjectId or email
    let userObjectId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else {
      const user = await User.findOne({ email: userId.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found for given email",
        });
      }
      userObjectId = user._id;
    }

    // Check if certificate already exists for this program and user
    const existingCertificate = await Certificate.findOne({
      userId: userObjectId,
      title: programTitle,
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already exists for this program",
        certificate: existingCertificate,
      });
    }

    // Generate unique credential ID
    const credentialId = generateCredentialId(programTitle);

    // Create new certificate
    const certificate = new Certificate({
      userId: userObjectId,
      title: programTitle,
      issuer: "SARATHI",
      date: new Date(),
      grade: grade,
      credentialId: credentialId,
      status: "earned",
      skills: skills || [],
      color: color || "from-blue-500 to-cyan-500",
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      certificate: certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error generating certificate",
      error: error.message,
    });
  }
};

// Get all certificates for a user
export const getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;

    // Resolve user identifier from route param: support ObjectId or email
    let userObjectId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else {
      const user = await User.findOne({ email: userId.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found for given email",
        });
      }
      userObjectId = user._id;
    }

    const certificates = await Certificate.find({
      userId: userObjectId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates: certificates,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

// Get certificate by credential ID (for verification page)
export const verifyCertificate = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const normalizedId = (credentialId || "").trim();

    console.log("Verifying certificate with credentialId:", normalizedId);

    const certificate = await Certificate.findOne({
      credentialId: normalizedId,
    }).populate("userId", "name email");

    if (!certificate) {
      console.warn("Certificate not found for credentialId:", normalizedId);
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      certificate: certificate,
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying certificate",
      error: error.message,
    });
  }
};

// Check if user completed all 5 programs and create certificates
export const checkAndCreateCertificates = async (req, res) => {
  try {
    const { userId, completedPrograms, domainId } = req.body;

    if (!userId || !Array.isArray(completedPrograms)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId (can be email) and completedPrograms array",
      });
    }

    // Resolve user identifier: allow either MongoDB ObjectId or email
    let userObjectId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else {
      const user = await User.findOne({ email: userId.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found for given email",
        });
      }
      userObjectId = user._id;
    }

    // Optional domain association: validate and convert if provided
    let domainObjectId = null;
    if (domainId) {
      if (!mongoose.Types.ObjectId.isValid(domainId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid domainId format",
        });
      }
      domainObjectId = new mongoose.Types.ObjectId(domainId);
    }

    // Check if all 5 programs are completed
    if (completedPrograms.length !== 5) {
      return res.status(200).json({
        success: true,
        message: `${completedPrograms.length}/5 programs completed. Certificate will be generated when all programs are complete.`,
        certificatesCreated: false,
      });
    }

    // If a domainId is provided, create a SINGLE certificate for that domain
    if (domainObjectId) {
      try {
        const domain = await CustomDomain.findById(domainObjectId);
        if (!domain) {
          return res.status(404).json({
            success: false,
            message: "Custom domain not found for given domainId",
          });
        }

        // Check if a certificate for this user+domain already exists
        const existingDomainCert = await Certificate.findOne({
          userId: userObjectId,
          domainId: domainObjectId,
        });

        if (existingDomainCert) {
          return res.status(200).json({
            success: true,
            message: "Certificate already exists for this domain",
            certificatesCreated: false,
            certificate: existingDomainCert,
          });
        }

        const title = `${domain.name} Mastery`;
        const credentialId = generateCredentialId(title);

        const newCertificate = new Certificate({
          userId: userObjectId,
          title,
          issuer: "SARATHI",
          date: new Date(),
          grade: "A+",
          credentialId,
          status: "earned",
          skills: [],
          color: "from-blue-500 to-cyan-500",
          domainId: domainObjectId,
        });

        await newCertificate.save();

        return res.status(200).json({
          success: true,
          message: "All 5 programs completed for this domain! Certificate generated.",
          certificatesCreated: true,
          count: 1,
          certificates: [newCertificate],
        });
      } catch (innerError) {
        console.error("Error creating domain certificate:", innerError);
        return res.status(500).json({
          success: false,
          message: "Error creating domain certificate",
          error: innerError.message,
        });
      }
    }

    // Fallback: original behavior (no domainId) - create certificates for core programs
    const certificatesData = [
      {
        title: "Python Fundamentals",
        grade: "A+",
        skills: ["Variables", "Loops", "Functions", "Error Handling"],
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Web Development Basics",
        grade: "A",
        skills: ["HTML5", "CSS3", "Responsive Design", "DOM"],
        color: "from-orange-500 to-red-500",
      },
      {
        title: "JavaScript Mastery",
        grade: "A",
        skills: ["ES6+", "Async/Await", "DOM Manipulation", "APIs"],
        color: "from-yellow-500 to-amber-500",
      },
      {
        title: "Database Design",
        grade: "A+",
        skills: ["SQL", "Indexing", "Normalization", "Optimization"],
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Full Stack Integration",
        grade: "A+",
        skills: ["MERN Stack", "Deployment", "Security", "Performance"],
        color: "from-green-500 to-emerald-500",
      },
    ];

    const createdCertificates = [];

    for (const certData of certificatesData) {
      // Check if certificate already exists
      const existingCert = await Certificate.findOne({
        userId: userObjectId,
        title: certData.title,
      });

      if (!existingCert) {
        const credentialId = generateCredentialId(certData.title);
        const newCertificate = new Certificate({
          userId: userObjectId,
          title: certData.title,
          issuer: "SARATHI",
          date: new Date(),
          grade: certData.grade,
          credentialId: credentialId,
          status: "earned",
          skills: certData.skills,
          color: certData.color,
        });

        await newCertificate.save();
        createdCertificates.push(newCertificate);
      }
    }

    return res.status(200).json({
      success: true,
      message: "All 5 programs completed! Certificates generated.",
      certificatesCreated: true,
      count: createdCertificates.length,
      certificates: createdCertificates,
    });
  } catch (error) {
    console.error("Error checking and creating certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error creating certificates",
      error: error.message,
    });
  }
};
