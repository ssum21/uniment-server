const mongoose = require('mongoose');

const userCourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  courses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    status: {
      type: String,
      enum: ['수강중', '수강완료', '재수강'],
      default: '수강중'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserCourse', userCourseSchema); 