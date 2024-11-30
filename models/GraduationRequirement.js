// models/GraduationRequirement.js
const mongoose = require('mongoose');

const graduationRequirementSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  admissionYearRange: {
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  },
  totalCredits: {
    type: Number,
    default: 130
  },
  majorRequirements: {
    basic: { type: Number, default: 18 },
    required: { type: Number, default: 9 },
    elective: { type: Number, default: 52 }
  },
  generalRequirements: {
    required: { type: Number, default: 17 },
    distributed: { type: Number, default: 12 },
    free: { type: Number, default: 3 }
  }
});

graduationRequirementSchema.index(
  { university: 1, major: 1, 'admissionYearRange.start': 1, 'admissionYearRange.end': 1 },
  { unique: true }
);

module.exports = mongoose.model('GraduationRequirement', graduationRequirementSchema);