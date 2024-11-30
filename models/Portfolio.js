// models/Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  achievement: {
    type: {
      type: String,
      enum: ['점수', '합격여부'],
      required: true
    },
    score: {
      type: Number,
      required: function() {
        return this.achievement.type === '점수';
      }
    },
    passed: {
      type: Boolean,
      required: function() {
        return this.achievement.type === '합격여부';
      }
    }
  },
  date: {
    type: Date,
    required: true
  },
  memo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);