const mongoose = require('mongoose');
const Credit = require('../models/Credit');
const User = require('../models/User');
require('dotenv').config();

async function initializeDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 기존 데이터 삭제
    await User.deleteMany({});
    await Credit.deleteMany({});
    
    // 1. 테스트 유저 생성
    const user = await User.create({
      name: "홍길동",
      email: "hong@test.com",
      schoolInfo: {
        name: "테스트대학교",
        major: "컴퓨터공학",
        admissionYear: 2024
      }
    });

    // 2. 기본 학점 요건 설정
    const creditRequirements = [
      {
        userId: user._id,
        category: '전체',
        subCategory: '필수',
        credits: {
          required: 130,
          current: 67,
          remaining: 130 - 67  // 명시적으로 계산
        }
      },
      {
        userId: user._id,
        category: '전공',
        subCategory: '필수',
        credits: {
          required: 45,
          current: 33,
          remaining: 45 - 33
        }
      },
      {
        userId: user._id,
        category: '전공',
        subCategory: '선택',
        credits: {
          required: 21,
          current: 12,
          remaining: 21 - 12
        }
      }
    ];

    // 하나씩 생성하여 에러 추적이 용이하게 함
    for (const requirement of creditRequirements) {
      await Credit.create(requirement);
      console.log(`${requirement.category} ${requirement.subCategory} 데이터 생성 완료`);
    }

    console.log('모든 초기 데이터 설정 완료');
    
    // 생성된 데이터 확인
    const credits = await Credit.find({ userId: user._id });
    console.log('생성된 학점 데이터:', credits);

  } catch (error) {
    console.error('초기 데이터 설정 실패:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDB();