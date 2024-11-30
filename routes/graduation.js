// routes/graduation.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const mongoose = require('mongoose'); // 추가
const User = require('../models/User');
const UserCourse = require('../models/UserCourse');
const GraduationRequirement = require('../models/GraduationRequirement');

router.get('/graduation-status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId가 필요합니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 해당 학교/학과의 졸업요건 조회
    const requirement = await GraduationRequirement.findOne({
      university: user.academicInfo.university,
      major: user.academicInfo.major
    });

    if (!requirement) {
      return res.status(404).json({ message: "졸업요건 정보를 찾을 수 없습니다." });
    }

    // 사용자의 이수 과목 조회 및 계산
    const userCourses = await UserCourse.findOne({ userId }).populate('courses.courseId');
    
    const totalEarned = userCourses?.courses.reduce((sum, course) => {
      return course.status === '수강완료' ? sum + course.courseId.credits : sum;
    }, 0) || 0;

    // 이전 학기 학점 계산
    const previousSemesterCredits = userCourses?.courses.reduce((sum, course) => {
      const currentSemester = new Date().getMonth() >= 8 ? 2 : 1;
      return (course.status === '수강완료' && course.semester < currentSemester) 
        ? sum + course.courseId.credits : sum;
    }, 0) || 0;

    // 학점 증감 계산
    const creditChange = totalEarned - previousSemesterCredits;

    res.json({
      totalCredits: {
        current: totalEarned,
        required: requirement.totalCredits,
        remaining: requirement.totalCredits - totalEarned,
        change: creditChange.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;