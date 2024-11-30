// models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company: { 
    type: String, 
    required: true 
  },
  position: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ['취업', '대학원', '인턴십', '기타'],
    required: true
  },
  applicationDate: { 
    type: Date, 
    required: true 
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['작성중', '지원완료', '서류합격', '최종합격', '불합격'],
    default: '작성중'
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
