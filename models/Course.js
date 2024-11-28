// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  courseType: {
    mainCategory: {
      type: String,
      enum: ['전공', '교양'],
      required: true
    },
    subCategory: {
      type: String,
      enum: ['필수', '선택'],
      required: true
    }
  },
  targetYear: Number,
  professor: String,
  description: String
});

module.exports = mongoose.model('Course', courseSchema);