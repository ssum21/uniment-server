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
    enum: [
      '어학 성적 (TOEIC, TOEFL, OPIC 등)',
      '자격증 (기사, 한능검, 운전 면허 등)',
      '수상 경력 (공모전, 대회 수상 등)',
      '인턴십/현장 실습 (인턴 경험, 현장 실습 등)',
      '봉사 활동 (사회봉사, 해외 봉사 등)',
      '프로젝트 경험 (학과 프로젝트, 개인/팀 프로젝트 등)',
      '연구 논문 (학술지 게재, 학회 발표 등)',
      '기타 학습 활동 (온라인 코스 독서, 세미나 참여 등)'
    ]
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
  },
  image: {
    data: String,  // Base64 형식의 이미지 데이터
    contentType: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);