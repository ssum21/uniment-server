const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const Credit = require('../models/Credit');
require('dotenv').config();

async function syncCredits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 모든 사용자의 학점 정보 초기화
    await Credit.deleteMany({});
    console.log('기존 학점 정보 삭제 완료');

    // 모든 사용자 조회
    const users = await User.find({});
    
    for (const user of users) {
      // 사용자의 수강 과목 조회
      const userCourses = await UserCourse.findOne({ userId: user._id })
        .populate('courses.courseId');
      
      if (userCourses) {
        for (const courseEntry of userCourses.courses) {
          if (courseEntry.status === '수강완료') {
            await updateCredits(user._id, courseEntry.courseId);
          }
        }
      }
    }

    console.log('모든 사용자의 학점 정보가 동기화되었습니다.');
  } catch (error) {
    console.error('학점 동기화 중 오류:', error);
  } finally {
    await mongoose.disconnect();
  }
}

syncCredits(); 