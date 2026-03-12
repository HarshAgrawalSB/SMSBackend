const mongoose = require('mongoose');

const LEAD_STATUS = [
  'NEW_LEAD',
  'CONTACTED',
  'INFORMATION_SESSION_ATTENDED',
  'APPLICATION_SUBMITTED',
  'ENROLLED',
  'LOST'
];

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    interestedProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      default: null
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'campaign', 'other'],
      default: 'website'
    },
    assignedAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: LEAD_STATUS,
      default: 'NEW_LEAD'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

leadSchema.index({ status: 1 });
leadSchema.index({ assignedAdvisor: 1 });
leadSchema.index({ email: 1 });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.LEAD_STATUS = LEAD_STATUS;
