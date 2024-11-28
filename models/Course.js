// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true
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
    required: true,
    enum: ['전공필수', '전공선택', '교양필수', '교양선택']
  },
  language: {
    type: String,
    enum: ['한국어', '영어']
  },
  university: {
    type: String,
    required: true,
    default: '경희대학교'
  },
  major: {
    type: String,
    required: true,
    default: '컴퓨터공학과'
  }
});

module.exports = mongoose.model('Course', courseSchema);