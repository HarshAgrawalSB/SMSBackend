const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

activitySchema.index({ studentId: 1 });
activitySchema.index({ leadId: 1 });
activitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
