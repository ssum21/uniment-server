// scripts/initializeCourses.js
const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function initializeCourses() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // URI 확인
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 데이터 확인
    const count = await Course.countDocuments();
    console.log('현재 과목 수:', count);

    // 기존 데이터 삭제
    await Course.deleteMany({});
    console.log('기존 데이터 삭제 완료');

    // 테스트 데이터 생성
    const coursesData = [
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE103",
        courseName: "객체지향프로그래밍",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "SWCON253",
        courseName: "기계학습",
        credits: 3.0,
        courseType: "전공선택",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "EE209",
        courseName: "논리회로",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE305",
        courseName: "데이터베이스",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "SWCON103",
        courseName: "디자인적사고",
        credits: 3.0,
        courseType: "전공선택",
        language: "한국어"
      }
      // 추가 과목 데이터...
    ];

    // 데이터 삽입
    const result = await Course.insertMany(coursesData);
    console.log(`${result.length}개 과목 추가됨`);

    // 삽입 결과 확인
    const newCount = await Course.countDocuments();
    console.log('현재 총 과목 수:', newCount);

  } catch (error) {
    console.error('초기화 중 에러 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

// 스크립트 실행
console.log('데이터 초기화 시작...');
initializeCourses();
