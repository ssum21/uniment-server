// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true,
    index: true
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
    type: String,
    required: true
  },
  language: {
    type: String,
    default: '한국어'
  },
  major: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// 대학-과목코드 복합 유니크 인덱스
courseSchema.index({ university: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);