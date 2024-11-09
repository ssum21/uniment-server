// models/GraduationRequirement.js
const mongoose = require('mongoose');

const graduationRequirementSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  requirements: {
    totalCredits: {
      required: Number,
      current: Number
    },
    majorRequired: {
      required: Number,
      current: Number
    },
    majorElective: {
      required: Number,
      current: Number
    },
    generalRequired: {
      required: Number,
      current: Number
    },
    generalElective: {
      required: Number,
      current: Number
    },
    foreignLanguage: {
      required: Number,
      current: Number
    },
    swRequired: {
      required: Number,
      current: Number
    }
  }
});

module.exports = mongoose.model('GraduationRequirement', graduationRequirementSchema);