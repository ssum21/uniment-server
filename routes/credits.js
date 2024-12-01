// routes/credits.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const User = require('../models/User');
const mongoose = require('mongoose');
const GraduationRequirement = require('../models/GraduationRequirement');
const UserCourse = require('../models/UserCourse');

// 학요 학점 계산 함수
function getRequiredCredits(requirement, category, subCategory) {
  if (!requirement) return 0;

  if (category === '전공') {
    switch(subCategory) {
      case '기초': return requirement.majorRequirements?.basic || 0;
      case '필수': return requirement.majorRequirements?.required || 0;
      case '선택': return requirement.majorRequirements?.elective || 0;
    }
  } else if (category === '교양') {
    switch(subCategory) {
      case '필수': return requirement.generalRequirements?.required || 0;
      case '배분이수': return requirement.generalRequirements?.distributed || 0;
      case '자유이수': return requirement.generalRequirements?.free || 0;
    }
  }
  return 0;
}

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
      전공: {
        전체: { required: 0, current: 0, remaining: 0, progress: 0 },
        기초: { required: 0, current: 0, remaining: 0, progress: 0 },
        필수: { required: 0, current: 0, remaining: 0, progress: 0 },
        선택: { required: 0, current: 0, remaining: 0, progress: 0 }
      },
      교양: {
        전체: { required: 0, current: 0, remaining: 0, progress: 0 },
        필수: { required: 0, current: 0, remaining: 0, progress: 0 },
        배분: { required: 0, current: 0, remaining: 0, progress: 0 },
        자유: { required: 0, current: 0, remaining: 0, progress: 0 }
      },
      기타: { required: 0, current: 0, remaining: 0, progress: 0 }
    };

    credits.forEach(credit => {
      const { category, subCategory } = credit;
      
      // 전체 학점 업데이트
      if (category === '전체') {
        organizedCredits.전체.required += credit.credits.required;
        organizedCredits.전체.current += credit.credits.current;
        organizedCredits.전체.remaining = 
          organizedCredits.전체.required - organizedCredits.전체.current;
      }
      // 전공 카테고리 업데이트
      else if (category === '전공') {
        // 전공 전체
        organizedCredits.전공.전체.required += credit.credits.required;
        organizedCredits.전공.전체.current += credit.credits.current;
        organizedCredits.전공.전체.remaining = 
          organizedCredits.전공.전체.required - organizedCredits.전공.전체.current;

        // 전공 세부 카테고리
        if (subCategory && organizedCredits.전공[subCategory]) {
          organizedCredits.전공[subCategory].required = credit.credits.required;
          organizedCredits.전공[subCategory].current = credit.credits.current;
          organizedCredits.전공[subCategory].remaining = 
            credit.credits.required - credit.credits.current;
        }
      }
      // 교양 카테고리 업데���트
      else if (category === '교양') {
        // 교양 전체
        organizedCredits.교양.전체.required += credit.credits.required;
        organizedCredits.교양.전체.current += credit.credits.current;
        organizedCredits.교양.전체.remaining = 
          organizedCredits.교양.전체.required - organizedCredits.교양.전체.current;

        // 교양 세부 카테고리
        if (subCategory && organizedCredits.교양[subCategory]) {
          organizedCredits.교양[subCategory].required = credit.credits.required;
          organizedCredits.교양[subCategory].current = credit.credits.current;
          organizedCredits.교양[subCategory].remaining = 
            credit.credits.required - credit.credits.current;
        }
      }
      // 기타 카테고리 업데이트
      else if (category === '기타') {
        organizedCredits.기타.required += credit.credits.required;
        organizedCredits.기타.current += credit.credits.current;
        organizedCredits.기타.remaining = 
          organizedCredits.기타.required - organizedCredits.기타.current;
      }
    });

    // progress 값 계산
    Object.keys(organizedCredits).forEach(mainCategory => {
      if (typeof organizedCredits[mainCategory] === 'object' && !organizedCredits[mainCategory].progress) {
        if (organizedCredits[mainCategory].required > 0) {
          organizedCredits[mainCategory].progress = 
            organizedCredits[mainCategory].current / organizedCredits[mainCategory].required;
        }
        
        // 세부 카테고리의 progress 계산
        if (mainCategory === '전공' || mainCategory === '교양') {
          Object.keys(organizedCredits[mainCategory]).forEach(subCategory => {
            if (organizedCredits[mainCategory][subCategory].required > 0) {
              organizedCredits[mainCategory][subCategory].progress = 
                organizedCredits[mainCategory][subCategory].current / 
                organizedCredits[mainCategory][subCategory].required;
            }
          });
        }
      }
    });

    res.json(organizedCredits);
  } catch (error) {
    console.error('학점 정보 조회 중 오류:', error);
    res.status(500).json({ message: error.message });
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
    const existingCredits = await Credit.findOne({ userId });
    if (existingCredits) {
      return res.status(400).json({ message: '이미 초기화된 학점 정보가 있습니다.' });
    }

    // 경희대학교 컴퓨터공학과 졸업요건 설정
    if (university === '경희대학교' && major === '컴퓨터공학과') {
      const credits = [
        // 전체 학점
        {
          userId,
          category: '전체',
          subCategory: '필수',
          credits: {
            required: 130,  // 총 졸업 ��수 학점
            current: 0,
            remaining: 130
          }
        },
        // 전공 기초
        {
          userId,
          category: '전공',
          subCategory: '기초',
          credits: {
            required: 18,
            current: 0,
            remaining: 18
          }
        },
        // 전공 필수
        {
          userId,
          category: '전공',
          subCategory: '필수',
          credits: {
            required: 48,
            current: 0,
            remaining: 48
          }
        },
        // 전공 선택
        {
          userId,
          category: '전공',
          subCategory: '선택',
          credits: {
            required: 30,
            current: 0,
            remaining: 30
          }
        },
        // 교양 필수
        {
          userId,
          category: '교양',
          subCategory: '필수',
          credits: {
            required: 17,
            current: 0,
            remaining: 17
          }
        },
        // 교양 배분
        {
          userId,
          category: '교양',
          subCategory: '배분',
          credits: {
            required: 12,
            current: 0,
            remaining: 12
          }
        },
        // 교양 자유
        {
          userId,
          category: '교양',
          subCategory: '자유',
          credits: {
            required: 3,
            current: 0,
            remaining: 3
          }
        },
        // 기타
        {
          userId,
          category: '기타',
          subCategory: '일반',
          credits: {
            required: 2,
            current: 0,
            remaining: 2
          }
        }
      ];

      // 학점 정보 일괄 생성
      await Credit.insertMany(credits);

      res.status(201).json({
        message: '학점 정보가 초기화되었습니다.',
        credits
      });
    } else {
      res.status(400).json({ 
        message: '지원하지 않는 대학/학과입니다.' 
      });
    }
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
          case '교양필수':
            detailedCredits.교양.필수.current += credits;
            break;
          case '배분이수':
            detailedCredits.교양.배분.current += credits;
            break;
          case '자유이수':
            detailedCredits.교양.자유.current += credits;
            break;
          default:
            console.warn(`알 수 없는 과목 유형: ${mainCategory}`);
        }

        // 남은 학점 계산 업데이트
        detailedCredits.전체.학점.remaining = 
          detailedCredits.전체.학점.required - detailedCredits.전체.학점.current;

        // 각 카테고리별 남은 학점 계산
        detailedCredits.전공.기초.remaining = 
          detailedCredits.전공.기초.required - detailedCredits.전공.기초.current;
        detailedCredits.전공.필수.remaining = 
          detailedCredits.전공.필수.required - detailedCredits.전공.필수.current;
        detailedCredits.전공.선택.remaining = 
          detailedCredits.전공.선택.required - detailedCredits.전공.선택.current;
        detailedCredits.교양.필수.remaining = 
          detailedCredits.교양.필수.required - detailedCredits.교양.필수.current;
        detailedCredits.교양.배분.remaining = 
          detailedCredits.교양.배분.required - detailedCredits.교양.배분.current;
        detailedCredits.교양.자유.remaining = 
          detailedCredits.교양.자유.required - detailedCredits.교양.자유.current;
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
        subCategory = '배분이수';  // '배분'에서 '배분이수'로 수정
        break;
      case '자유이수':
        category = '교양';
        subCategory = '자유이수';  // '자유'에서 '자유이수'로 수정
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
        subCategory = '배분이수';
        break;
      case '자유이수':
        category = '교양';
        subCategory = '자유이수';
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