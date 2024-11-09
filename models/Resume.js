const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: String,  // String 타입으로 유지
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
    enum: ['작성중', '제출완료', '서류합격', '최종합격', '불합격'],
    default: '작성중'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Resume', resumeSchema);