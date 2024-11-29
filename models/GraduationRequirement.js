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
  totalCredits: {
    type: Number,
    default: 130
  },
  majorRequirements: {
    basic: { type: Number, default: 18 },    // 전공기초
    required: { type: Number, default: 9 },   // 전공필수
    elective: { type: Number, default: 52 }   // 전공선택
  },
  generalRequirements: {
    required: { type: Number, default: 17 },  // 필수교양
    distributed: { type: Number, default: 12 }, // 배분이수
    free: { type: Number, default: 3 }        // 자유이수
  }
});

graduationRequirementSchema.index({ university: 1, major: 1 }, { unique: true });

module.exports = mongoose.model('GraduationRequirement', graduationRequirementSchema);