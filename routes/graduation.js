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

    const requirement = await GraduationRequirement.findOne({
      university: user.academicInfo.university,
      major: user.academicInfo.major,
      'admissionYearRange.start': { $lte: user.academicInfo.admissionYear },
      'admissionYearRange.end': { $gte: user.academicInfo.admissionYear }
    });

    // 사용자의 이수 과목 조회
    const userCourses = await UserCourse.findOne({ userId })
      .populate('courses.courseId');

    // 각 카테고리별 이수 학점 계산
    const credits = {
      major: {
        basic: 0,
        required: 0,
        elective: 0
      },
      general: {
        required: 0,
        distributed: 0,
        free: 0
      }
    };

    userCourses?.courses.forEach(course => {
      if (course.status === '수강완료') {
        const courseType = course.courseId.courseType;
        switch(courseType.mainCategory) {
          case '전공기초':
            credits.major.basic += course.courseId.credits;
            break;
          case '전공필수':
            credits.major.required += course.courseId.credits;
            break;
          case '전공선택':
            credits.major.elective += course.courseId.credits;
            break;
          case '필수교양':
            credits.general.required += course.courseId.credits;
            break;
          case '배분이수':
            credits.general.distributed += course.courseId.credits;
            break;
          case '자유이수':
            credits.general.free += course.courseId.credits;
            break;
        }
      }
    });

    const totalEarned = Object.values(credits.major).reduce((a, b) => a + b, 0) +
                       Object.values(credits.general).reduce((a, b) => a + b, 0);

    res.json({
      totalCredits: {
        required: requirement.totalCredits,
        current: totalEarned,
        remaining: requirement.totalCredits - totalEarned
      },
      major: {
        basic: {
          required: requirement.majorRequirements.basic,
          current: credits.major.basic,
          remaining: requirement.majorRequirements.basic - credits.major.basic
        },
        required: {
          required: requirement.majorRequirements.required,
          current: credits.major.required,
          remaining: requirement.majorRequirements.required - credits.major.required
        },
        elective: {
          required: requirement.majorRequirements.elective,
          current: credits.major.elective,
          remaining: requirement.majorRequirements.elective - credits.major.elective
        }
      },
      general: {
        required: {
          required: requirement.generalRequirements.required,
          current: credits.general.required,
          remaining: requirement.generalRequirements.required - credits.general.required
        },
        distributed: {
          required: requirement.generalRequirements.distributed,
          current: credits.general.distributed,
          remaining: requirement.generalRequirements.distributed - credits.general.distributed
        },
        free: {
          required: requirement.generalRequirements.free,
          current: credits.general.free,
          remaining: requirement.generalRequirements.free - credits.general.free
        }
      },
      status: {
        overall: totalEarned >= requirement.totalCredits ? '완료' : '진행중',
        percentage: Math.round((totalEarned / requirement.totalCredits) * 100 * 10) / 10
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: error.message,
      details: "졸업 상태 조회 중 오류가 발생했습니다."
    });
  }
});

// 졸업요건 등록 API
router.post('/requirements', async (req, res) => {
  try {
    const { university, major, requirements } = req.body;
    
    const graduationRequirement = new GraduationRequirement({
      university,
      major,
      totalCredits: requirements.totalCredits,
      requirements: {
        major: {
          basic: requirements.major.basic,
          required: requirements.major.required,
          elective: requirements.major.elective
        },
        general: {
          required: requirements.general.required,
          distributed: requirements.general.distributed,
          free: requirements.general.free
        }
      }
    });

    const savedRequirement = await graduationRequirement.save();
    res.status(201).json(savedRequirement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;