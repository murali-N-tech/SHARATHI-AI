import mongoose from 'mongoose';

const domainProgressSchema = new mongoose.Schema({
  domainId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedCourses: {
    type: Number,
    default: 0
  },
  totalCourses: {
    type: Number,
    default: 0
  },
  finalAssessmentCompleted: {
    type: Boolean,
    default: false
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for unique user-domain tracking
domainProgressSchema.index({ domainId: 1, email: 1 }, { unique: true });

const DomainProgress = mongoose.model('DomainProgress', domainProgressSchema);

export default DomainProgress;
