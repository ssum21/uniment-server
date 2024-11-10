// models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  company: {
    name: String,
    position: String,
    jobType: String
  },
  content: {
    introduction: String,
    motivation: String,
    strength: String,
    futureGoals: String
  },
  status: {
    type: String,
    enum: ['작성중', '작성완료', '제출완료', '서류합격', '최종합격', '불합격'], // '작성완료' 추가
    default: '작성중'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Resume', resumeSchema);
