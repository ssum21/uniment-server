// routes/credits.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const User = require('../models/User');
const mongoose = require('mongoose');
const GraduationRequirement = require('../models/GraduationRequirement');
const UserCourse = require('../models/UserCourse');

// 학점 정보 조회 (userId를 파라미터로 받도록 수정)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "유효하지 않은 userId 형식입니다."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "사용자를 찾을 수 없습니다."
      });
    }

    const credits = await Credit.find({ userId });
    
    const organizedCredits = {
      전체: { required: 0, current: 0, remaining: 0, progress: 0 },
      전공: { required: 0, current: 0, remaining: 0, progress: 0 },
      교양: { required: 0, current: 0, remaining: 0, progress: 0 },
      기타: { required: 0, current: 0, remaining: 0, progress: 0 }
    };

    credits.forEach(credit => {
      const category = credit.category;
      organizedCredits[category].required += credit.credits.required;
      organizedCredits[category].current += credit.credits.current;
      organizedCredits[category].remaining = 
        organizedCredits[category].required - organizedCredits[category].current;
    });

    // progress 값 계산 (0~1 사이)
    Object.keys(organizedCredits).forEach(category => {
      const { required, current } = organizedCredits[category];
      organizedCredits[category].progress = required > 0 ? 
        Math.min(current / required, 1) : 0;
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

router.get('/:userId/detailed', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 사용자 존재 여부 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 졸업 요건 조회
    const requirement = await GraduationRequirement.findOne({
      university: user.academicInfo.university,
      major: user.academicInfo.major,
      'admissionYearRange.start': { $lte: user.academicInfo.admissionYear },
      'admissionYearRange.end': { $gte: user.academicInfo.admissionYear }
    });

    // 사용자의 이수 과목 조회
    const userCourses = await UserCourse.findOne({ userId })
      .populate('courses.courseId');

    // 카테고리별 상세 학점 계산
    const detailedCredits = {
      전체: {
        학점: { current: 0, required: requirement?.totalCredits || 140 },
        평점: { current: 0, required: 4.5 }
      },
      전공: {
        기초: { current: 0, required: requirement?.majorRequirements.basic || 18 },
        필수: { current: 0, required: requirement?.majorRequirements.required || 30 },
        선택: { current: 0, required: requirement?.majorRequirements.elective || 24 }
      },
      교양: {
        필수: { current: 0, required: requirement?.generalRequirements.required || 12 },
        배분: { current: 0, required: requirement?.generalRequirements.distributed || 18 },
        자유: { current: 0, required: requirement?.generalRequirements.free || 6 }
      },
      기타: {
        외국어: { current: 0, required: requirement?.otherRequirements?.foreign || 6 },
        SW: { current: 0, required: requirement?.otherRequirements?.software || 6 },
        논문: { current: 0, required: requirement?.otherRequirements?.thesis || 0 }
      }
    };

    // 이수 과목들의 학점을 카테고리별로 합산
    userCourses?.courses.forEach(course => {
      if (course.status === '수강완료') {
        const { mainCategory, subCategory } = course.courseId.courseType;
        const credits = course.courseId.credits;
        
        // 전체 학점 업데이트
        detailedCredits.전체.학점.current += credits;
        
        // 카테고리별 학점 업데이트
        switch(mainCategory) {
          case '전공기초':
            detailedCredits.전공.기초.current += credits;
            break;
          case '전공필수':
            detailedCredits.전공.필수.current += credits;
            break;
          case '전공선택':
            detailedCredits.전공.선택.current += credits;
            break;
          // ... 기타 카테고리들도 같은 방식으로 처리
        }
      }
    });

    res.json(detailedCredits);
  } catch (error) {
    console.error('상세 학점 조회 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 수동 학점 업데이트 API
router.post('/:userId/manual-update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseType, credits } = req.body;

    // 사용자와 졸업요건 정보 조회
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

    if (!requirement) {
      return res.status(404).json({ message: "졸업요건 정보를 찾을 수 없습니다." });
    }

    // 카테고리 결정 (기존 switch문과 동일)
    let category, subCategory;
    switch(courseType) {
      case '전공기초':
        category = '전공';
        subCategory = '기초';
        break;
      case '전공필수':
        category = '전공';
        subCategory = '필수';
        break;
      case '전공선택':
        category = '전공';
        subCategory = '선택';
        break;
      case '교양필수':
        category = '교양';
        subCategory = '필수';
        break;
      case '배분이수':
        category = '교양';
        subCategory = '배분';
        break;
      case '자유이수':
        category = '교양';
        subCategory = '자유';
        break;
    }

    // 해당 카테고리 학점 업데이트 또는 생성
    let creditDoc = await Credit.findOne({
      userId,
      category,
      subCategory
    });

    if (creditDoc) {
      creditDoc.credits.current += credits;
      creditDoc.credits.remaining = creditDoc.credits.required - creditDoc.credits.current;
      await creditDoc.save();
    } else {
      // 새로운 카테고리 생성
      const requiredCredits = getRequiredCredits(requirement, category, subCategory);
      creditDoc = await Credit.create({
        userId,
        category,
        subCategory,
        credits: {
          required: requiredCredits,
          current: credits,
          remaining: requiredCredits - credits
        }
      });
    }

    // 전체 학점 업데이트 또는 생성
    let totalCredit = await Credit.findOne({
      userId,
      category: '전체',
      subCategory: '필수'
    });

    if (totalCredit) {
      totalCredit.credits.current += credits;
      totalCredit.credits.remaining = totalCredit.credits.required - totalCredit.credits.current;
      await totalCredit.save();
    } else {
      totalCredit = await Credit.create({
        userId,
        category: '전체',
        subCategory: '필수',
        credits: {
          required: requirement.totalCredits,
          current: credits,
          remaining: requirement.totalCredits - credits
        }
      });
    }

    res.json({
      message: '학점이 성공적으로 업데이트되었습니다.',
      updatedCredits: {
        category: creditDoc,
        total: totalCredit
      }
    });

  } catch (error) {
    console.error('수동 학점 업데이트 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 수동 학점 차감 API
router.post('/:userId/manual-decrease', async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseType, credits } = req.body;

    // 사용자와 졸업요건 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 카테고리 결정
    let category, subCategory;
    switch(courseType) {
      case '전공기초':
        category = '전공';
        subCategory = '기초';
        break;
      case '전공필수':
        category = '전공';
        subCategory = '필수';
        break;
      case '전공선택':
        category = '전공';
        subCategory = '선택';
        break;
      case '교양필수':
        category = '교양';
        subCategory = '필수';
        break;
      case '배분이수':
        category = '교양';
        subCategory = '배분';
        break;
      case '자유이수':
        category = '교양';
        subCategory = '자유';
        break;
    }

    // 해당 카테고리 학점 차감
    let creditDoc = await Credit.findOne({
      userId,
      category,
      subCategory
    });

    if (creditDoc) {
      creditDoc.credits.current = Math.max(0, creditDoc.credits.current - credits);
      creditDoc.credits.remaining = creditDoc.credits.required - creditDoc.credits.current;
      await creditDoc.save();
    }

    // 전체 학점 차감
    let totalCredit = await Credit.findOne({
      userId,
      category: '전체',
      subCategory: '필수'
    });

    if (totalCredit) {
      totalCredit.credits.current = Math.max(0, totalCredit.credits.current - credits);
      totalCredit.credits.remaining = totalCredit.credits.required - totalCredit.credits.current;
      await totalCredit.save();
    }

    res.json({
      message: '학점이 성공적으로 차감되었습니다.',
      updatedCredits: {
        category: creditDoc,
        total: totalCredit
      }
    });

  } catch (error) {
    console.error('수동 학점 차감 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;