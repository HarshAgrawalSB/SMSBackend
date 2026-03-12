const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
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
      default: ''
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
    },
    enrollmentAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'DROPPED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

studentSchema.index({ programId: 1 });
studentSchema.index({ enrollmentAdvisor: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ leadId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Student', studentSchema);
