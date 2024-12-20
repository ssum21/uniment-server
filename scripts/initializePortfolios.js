// scripts/initializePortfolios.js
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
require('dotenv').config();

async function initializePortfolios() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // MongoDB URI 확인
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 포트폴리오 데이터 삭제
    await Portfolio.deleteMany({});
    console.log('기존 포트폴리오 데이터 삭제 완료');

    // 샘플 포트폴리오 데이터
    const portfoliosData = [
      {
        userId: '672f04989fe771f0fffba2d6',
        type: '어학 성적 (TOEIC, TOEFL, OPIC 등)',
        title: 'TOEIC',
        achievement: {
          type: '점수',
          score: 780
        },
        date: new Date('2025-10-05'),
        memo: '카카오엔터프라이즈 지원 예정'
      },
      {
        userId: '672f04989fe771f0fffba2d6',
        type: '자격증 (기사, 한능검, 운전 면허 등)',
        title: '정보처리기사',
        achievement: {
          type: '합격여부',
          passed: true
        },
        date: new Date('2024-05-15'),
        memo: '네이버 기술직 지원 예정'
      },
      {
        userId: '672f04989fe771f0fffba2d6',
        type: '수상 경력 (공모전, 대회 수상 등)',
        title: '프로그래밍 대회 1위',
        achievement: {
          type: '합격여부',
          passed: true
        },
        date: new Date('2023-09-10'),
        memo: '학교 주최 대회에서 수상'
      }
    ];

    // 데이터 삽입
    const result = await Portfolio.insertMany(portfoliosData);
    console.log(`${result.length}개 포트폴리오 항목이 추가되었습니다.`);

    // 삽입 후 총 데이터 수 확인
    const newCount = await Portfolio.countDocuments();
    console.log('현재 총 포트폴리오 항목 수:', newCount);

  } catch (error) {
    console.error('포트폴리오 초기화 중 에러 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

// 스크립트 실행
console.log('포트폴리오 데이터 초기화 시작...');
initializePortfolios();
