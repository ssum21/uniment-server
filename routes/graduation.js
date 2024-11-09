// routes/graduation.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const mongoose = require('mongoose'); // 추가

router.get('/graduation-status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // userId 유효성 검사 추가
    if (!userId) {
      return res.status(400).json({ message: "userId가 필요합니다." });
    }

    // 임시 테스트용 응답 추가 (데이터베이스에 데이터가 없을 때 사용)
    const testData = {
      totalCredits: {
        required: 130,
        current: 67,
        remaining: 63
      },
      majorCredits: {
        required: 66,
        current: 45,
        remaining: 21
      },
      generalCredits: {
        required: 64,
        current: 22,
        remaining: 42
      },
      status: {
        overall: "진행중",
        percentage: 51.5
      }
    };

    // 실제 데이터베이스 조회 시도
    let credits;
    try {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        // ObjectId인 경우
        credits = await Credit.find({ userId: new mongoose.Types.ObjectId(userId) });
      } else {
        // 문자열 ID인 경우
        credits = await Credit.find({ userId: userId });
      }
    } catch (dbError) {
      console.log("데이터베이스 조회 실패:", dbError);
      // 개발 단계에서는 테스트 데이터 반환
      return res.json(testData);
    }

    // 데이터가 없으면 테스트 데이터 반환
    if (!credits || credits.length === 0) {
      return res.json(testData);
    }

    const graduationStatus = {
      totalCredits: { required: 0, current: 0, remaining: 0 },
      majorCredits: { required: 0, current: 0, remaining: 0 },
      generalCredits: { required: 0, current: 0, remaining: 0 }
    };

    credits.forEach(credit => {
      switch(credit.category) {
        case '전체':
          graduationStatus.totalCredits.required += credit.credits.required;
          graduationStatus.totalCredits.current += credit.credits.current;
          break;
        case '전공':
          graduationStatus.majorCredits.required += credit.credits.required;
          graduationStatus.majorCredits.current += credit.credits.current;
          break;
        case '교양':
          graduationStatus.generalCredits.required += credit.credits.required;
          graduationStatus.generalCredits.current += credit.credits.current;
          break;
      }
    });

    // remaining 값 계산
    for (let key in graduationStatus) {
      graduationStatus[key].remaining = 
        graduationStatus[key].required - graduationStatus[key].current;
    }

    // 전체 진행률 계산
    const totalPercentage = 
      (graduationStatus.totalCredits.current / graduationStatus.totalCredits.required) * 100;

    res.json({
      ...graduationStatus,
      status: {
        overall: totalPercentage >= 100 ? '완료' : '진행중',
        percentage: Math.round(totalPercentage * 10) / 10
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

module.exports = router;