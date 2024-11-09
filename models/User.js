const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  schoolInfo: {
    name: String, // 학교명
    major: String, // 전공
    admissionYear: Number // 입학년도
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);