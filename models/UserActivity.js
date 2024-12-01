const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activities: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    type: {
      type: String,
      enum: ['대외활동', '인턴십', '봉사활동', '기타'],
      default: '대외활동'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserActivity', userActivitySchema); 