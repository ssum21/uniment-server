// routes/credits.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const User = require('../models/User');
const mongoose = require('mongoose');
const GraduationRequirement = require('../models/GraduationRequirement');

// 학점 정보 조회 (userId를 파라미터로 받도록 수정)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ObjectId 유효성 검사
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "유효하지 않은 userId 형식입니다."
      });
    }

    // 사용자 존재 여부 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "사용자를 찾을 수 없습니다."
      });
    }

    const credits = await Credit.find({ userId });
    
    // 카테고리별로 데이터 정리
    const organizedCredits = {
      전체: { required: 0, current: 0, remaining: 0 },
      전공: { required: 0, current: 0, remaining: 0 },
      교양: { required: 0, current: 0, remaining: 0 },
      기타: { required: 0, current: 0, remaining: 0 }
    };

    credits.forEach(credit => {
      const category = credit.category;
      organizedCredits[category].required += credit.credits.required;
      organizedCredits[category].current += credit.credits.current;
      organizedCredits[category].remaining = 
        organizedCredits[category].required - organizedCredits[category].current;
    });

    res.json(organizedCredits);
  } catch (error) {
    console.error('학점 조회 중 오류:', error);
    res.status(500).json({ 
      message: "학점 정보 조회 중 오류가 발생했습니다.",
      error: error.message 
    });
  }
});
// 학점 정보 추가/수정
router.post('/credits', async (req, res) => {
  try {
    const { userId, category, subCategory, required, current } = req.body;
    
    const credit = await Credit.findOneAndUpdate(
      { userId, category, subCategory },
      {
        credits: {
          required,
          current,
          remaining: required - current
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(credit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 학점 요약 정보 조회 API
router.get('/credits/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 전체 학점 정보 조회
    const credits = await Credit.find({ userId });
    
    // 전체 학점 계산
    let totalRequired = 0;
    let totalCurrent = 0;
    
    credits.forEach(credit => {
      if (credit.category === '전체') {
        totalRequired = credit.credits.required;
        totalCurrent = credit.credits.current;
      }
    });

    // 졸업 요건 조회
    const requirement = await GraduationRequirement.findOne({
      university: user.academicInfo.university,
      major: user.academicInfo.major,
      'admissionYearRange.start': { $lte: user.academicInfo.admissionYear },
      'admissionYearRange.end': { $gte: user.academicInfo.admissionYear }
    });

    // 대학/학과별 필요 과목 수 계산
    const requiredCourses = requirement ? requirement.requiredCourses.length : 0;
    
    // 사용자의 이수 과목 수 조회
    const userCourses = await UserCourse.findOne({ userId });
    const completedCourses = userCourses ? userCourses.courses.length : 0;

    res.json({
      totalCredits: {
        current: totalCurrent,
        required: totalRequired,
        remaining: totalRequired - totalCurrent
      },
      courses: {
        completed: completedCourses,
        required: requiredCourses,
        remaining: requiredCourses - completedCourses
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 초기 학점 설정 API 추가
router.post('/initialize', async (req, res) => {
  try {
    const { userId, university, major } = req.body;
    
    // 이미 초기화된 학점 정보가 있는지 확인
    const existingCredits = await Credit.findOne({ 
      userId, 
      category: '전체' 
    });
    
    if (existingCredits) {
      return res.status(400).json({ 
        message: "이미 학점 정보가 초기화되어 있습니다." 
      });
    }

    // 사용자 정보 조회로 입학년도 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "사용자를 찾을 수 없습니다." 
      });
    }

    // 해당 학과의 졸업 요건 조회 (입학년도 기준)
    const requirement = await GraduationRequirement.findOne({
      university,
      major,
      'admissionYearRange.start': { $lte: user.academicInfo.admissionYear },
      'admissionYearRange.end': { $gte: user.academicInfo.admissionYear }
    });

    if (!requirement) {
      return res.status(404).json({ 
        message: "해당 학과의 졸업 요건을 찾을 수 없습니다." 
      });
    }

    // 기본 학점 정보 생성
    const credits = [
      {
        userId,
        category: '전체',
        subCategory: '필수',
        credits: {
          required: requirement.totalCredits,
          current: 0,
          remaining: requirement.totalCredits
        }
      },
      {
        userId,
        category: '전공',
        subCategory: '필수',
        credits: {
          required: requirement.majorRequirements.required + 
                   requirement.majorRequirements.basic + 
                   requirement.majorRequirements.elective,
          current: 0,
          remaining: requirement.majorRequirements.required + 
                    requirement.majorRequirements.basic + 
                    requirement.majorRequirements.elective
        }
      },
      {
        userId,
        category: '교양',
        subCategory: '필수',
        credits: {
          required: requirement.generalRequirements.required + 
                   requirement.generalRequirements.distributed + 
                   requirement.generalRequirements.free,
          current: 0,
          remaining: requirement.generalRequirements.required + 
                    requirement.generalRequirements.distributed + 
                    requirement.generalRequirements.free
        }
      }
    ];

    await Credit.insertMany(credits);

    res.status(201).json({
      message: "학점 정보가 초기화되었습니다.",
      credits
    });
  } catch (error) {
    console.error('학점 초기화 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;