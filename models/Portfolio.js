// models/Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['어학성적', '자격증', '수상경력', '인턴십/현장실습', 
           '봉사활동', '프로젝트경험', '연구논문', '기타학습활동']
  },
  title: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: function() {
      return this.type === '어학성적';
    }
  },
  date: {
    type: Date,
    required: true
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);