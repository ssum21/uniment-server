// scripts/initializeResumes.js
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
require('dotenv').config();

async function initializeResumes() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 자기소개서 데이터 삭제
    await Resume.deleteMany({});
    console.log('기존 자기소개서 데이터 삭제 완료');

    // 샘플 자기소개서 데이터
    const resumesData = [
      {
        userId: '672f04989fe771f0fffba2d6',
        company: { name: '카카오엔터프라이즈', position: '소프트웨어 엔지니어', jobType: '정규직' },
        content: {
          introduction: '저는 책임감이 강한 개발자입니다.',
          motivation: '카카오의 혁신에 기여하고 싶습니다.',
          strength: '협업 능력이 뛰어납니다.',
          futureGoals: '지속적으로 성장하여 회사에 기여하고 싶습니다.'
        },
        status: '작성중'
      },
      {
        userId: '672f04989fe771f0fffba2d6',
        company: { name: '네이버', position: '데이터 분석가', jobType: '인턴' },
        content: {
          introduction: '데이터로 가치를 창출하는 것에 관심이 많습니다.',
          motivation: '네이버에서 데이터를 통한 혁신을 이루고 싶습니다.',
          strength: '데이터 분석 및 문제 해결 능력이 뛰어납니다.',
          futureGoals: '데이터 분야에서 전문가가 되고 싶습니다.'
        },
        status: '작성완료'
      }
    ];

    // 데이터 삽입
    const result = await Resume.insertMany(resumesData);
    console.log(`${result.length}개 자기소개서 항목이 추가되었습니다.`);

    const newCount = await Resume.countDocuments();
    console.log('현재 총 자기소개서 항목 수:', newCount);
  } catch (error) {
    console.error('자기소개서 초기화 중 에러 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

// 스크립트 실행
console.log('자기소개서 데이터 초기화 시작...');
initializeResumes();
