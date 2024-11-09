// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true  // 중복 방지
  },
  courseName: {
    type: String,
    required: true
  },
  targetYear: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  professor: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  courseTime: String,
  courseType: {
    type: String,
    enum: ['전공필수', '전공선택', '전공기초', '교양필수', '교양선택']
  },
  language: String,
  description: String
}, { 
  timestamps: true,
  collection: 'courses'  // 컬렉션 이름 명시적 지정
});

module.exports = mongoose.model('Course', courseSchema);