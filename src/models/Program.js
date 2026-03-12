const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: ''
    },
    fee: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

programSchema.index({ name: 1 });

module.exports = mongoose.model('Program', programSchema);
