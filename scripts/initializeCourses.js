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
        courseCode: "CSE103-00",
        courseName: "객체지향프로그래밍",
        targetYear: 1,
        capacity: 150,
        professor: "이대호",
        credits: 3.0,
        courseTime: "월 15:00-16:50 (전205)\n수 15:00-16:50 (전205)",
        courseType: "전공필수",
        language: "한국어",
        description: "본인 노트북으로 실습(필요시 대여 가능), 실감미디어기술, 게임공학 마이크로디그로 교과목"
      },
      {
        courseCode: "CSE103-01",
        courseName: "객체지향프로그래밍",
        targetYear: 1,
        capacity: 100,
        professor: "최진우",
        credits: 3.0,
        courseTime: "화 13:00-14:50 (B09)\n목 13:00-14:50 (B09)",
        courseType: "전공필수",
        language: "영어(부분)",
        description: "본인 노트북으로 실습(필요시 대여 가능), 실감미디어기술, 게임공학 마이크로디그로 교과목"
      },
      {
        courseCode: "CSE305-00",
        courseName: "데이터베이스",
        targetYear: 3,
        capacity: 60,
        professor: "이영구",
        credits: 3.0,
        courseTime: "화 15:00-16:15 (전103)\n목 15:00-16:15 (전103)",
        courseType: "전공필수",
        language: "한국어",
        description: "노트북 지참"
      },
      {
        courseCode: "CSE305-01",
        courseName: "데이터베이스",
        targetYear: 3,
        capacity: 70,
        professor: "김태연",
        credits: 3.0,
        courseTime: "화 10:30-11:45 (B09)\n목 10:30-11:45 (B09)",
        courseType: "전공필수",
        language: "한국어",
        description: "노트북 지참"
      },
      {
        courseCode: "SWCON103-00",
        courseName: "디자인적사고",
        targetYear: 1,
        capacity: 50,
        professor: "조명아",
        credits: 3.0,
        courseTime: "화 13:30-17:20 (전211-1)",
        courseType: "전공선택",
        language: "한국어",
        description: "디자인소프트웨어 마이크로디그리 교과목"
      },
      {
        courseCode: "SWCON103-01",
        courseName: "디자인적사고",
        targetYear: 1,
        capacity: 30,
        professor: "박광훈",
        credits: 3.0,
        courseTime: "수 09:00-12:50 (B05)",
        courseType: "전공선택",
        language: "한국어",
        description: "디자인소프트웨어 마이크로디그리 교과목"
      },
      {
        courseCode: "CSE327-00",
        courseName: "소프트웨어공학",
        targetYear: 3,
        capacity: 70,
        professor: "허의남",
        credits: 3.0,
        courseTime: "월 15:00-16:15 (B09)\n수 15:00-16:15 (B09)",
        courseType: "전공필수",
        language: "한국어",
        description: "노트북 지참"
      },
      {
        courseCode: "CSE304-00",
        courseName: "알고리즘",
        targetYear: 3,
        capacity: 90,
        professor: "한치근",
        credits: 3.0,
        courseTime: "월 13:00-14:50 (B09)\n수 13:00-14:50 (B09)",
        courseType: "전공필수",
        language: "한국어",
        description: "선수과목:자료구조 / 본인 노트북으로 실습"
      },
      {
        courseCode: "SWCON104-00",
        courseName: "웹/파이선프로그래밍",
        targetYear: 1,
        capacity: 150,
        professor: "이성원",
        credits: 3.0,
        courseTime: "월 13:00-14:50 (전205)\n수 13:00-14:50 (전205)",
        courseType: "전공필수",
        language: "영어(부분)",
        description: "본인 노트북으로 실습 (필요시 대여 가능)"
      },
      {
        courseCode: "CSE204-00",
        courseName: "자료구조",
        targetYear: 2,
        capacity: 54,
        professor: "박성배",
        credits: 3.0,
        courseTime: "월 13:00-14:50 (B01)\n수 13:00-14:50 (B01)",
        courseType: "전공필수",
        language: "한국어",
        description: "선수과목:객체지향프로그래밍 / 노트북으로 실습"
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
