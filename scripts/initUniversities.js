const mongoose = require('mongoose');
const University = require('../models/University');
require('dotenv').config();

const universities = [
  {
    name: '경희대학교',
    maxGPA: 4.3,
    totalCredits: 130,
    majorCredits: 66,
    generalCredits: 64,
    majors: [
      { name: '컴퓨터공학과', department: '공과대학' },
      { name: '소프트웨어융합학과', department: '소프트웨어융합대학' },
      // 추가 전공들...
    ]
  },
  {
    name: '아주대학교',
    maxGPA: 4.5,
    totalCredits: 130,
    majorCredits: 70,
    generalCredits: 60,
    majors: [
      { name: '소프트웨어학과', department: '정보통신대학' },
      { name: '사이버보안학과', department: '정보통신대학' },
      // 추가 전공들...
    ]
  },
  // 나머지 대학 정보...
];

async function initializeUniversities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await University.deleteMany({}); // 기존 데이터 삭제
    await University.insertMany(universities);
    console.log('대학 정보 초기화 완료');
    process.exit(0);
  } catch (error) {
    console.error('초기화 실패:', error);
    process.exit(1);
  }
}

initializeUniversities(); 