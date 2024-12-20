const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: {
    type: String,
    enum: ['전체', '전공', '교양', '기타'],
    required: true
  },
  subCategory: {
    type: String,
    enum: ['필수', '기초', '선택', '배분', '자유', '전체', '기타'],
    required: true
  },
  credits: {
    required: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Credit', creditSchema);