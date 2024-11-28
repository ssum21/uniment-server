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
      { name: '전자공학과', department: '전자정보대학' },
      { name: '기계공학과', department: '공과대학' }
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
      { name: '미디어학과', department: '정보통신대학' },
      { name: '전자공학과', department: '정보통신대학' }
    ]
  },
  {
    name: '중앙대학교',
    maxGPA: 4.5,
    totalCredits: 132,
    majorCredits: 66,
    generalCredits: 66,
    majors: [
      { name: '소프트웨어학부', department: '소프트웨어대학' },
      { name: '컴퓨터공학부', department: '공과대학' },
      { name: '전자전기공학부', department: '공과대학' }
    ]
  },
  {
    name: '한국과학기술원(KAIST)',
    maxGPA: 4.3,
    totalCredits: 136,
    majorCredits: 72,
    generalCredits: 64,
    majors: [
      { name: '전산학부', department: '전산학부' },
      { name: '전기및전자공학부', department: '전기및전자공학부' },
      { name: '기계공학과', department: '기계공학과' }
    ]
  },
  {
    name: '경북대학교',
    maxGPA: 4.3,
    totalCredits: 130,
    majorCredits: 66,
    generalCredits: 64,
    majors: [
      { name: '컴퓨터학부', department: 'IT대학' },
      { name: '전자공학부', department: 'IT대학' },
      { name: '전기공학과', department: 'IT대학' }
    ]
  }
];

async function initializeUniversities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');
    
    await University.deleteMany({});
    console.log('기존 대학 데이터 삭제 완료');
    
    const result = await University.insertMany(universities);
    console.log(`${result.length}개 대학 정보 추가 완료`);
    
    process.exit(0);
  } catch (error) {
    console.error('초기화 실패:', error);
    process.exit(1);
  }
}

initializeUniversities(); 