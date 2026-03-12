const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ studentId: 1 });

module.exports = mongoose.model('Document', documentSchema);
