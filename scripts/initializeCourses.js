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
        courseCode: "CSE103-02",
        courseName: "객체지향프로그래밍",
        targetYear: 1,
        capacity: 100,
        professor: "이대호",
        credits: 3.0,
        courseTime: "- (온라인)",
        courseType: "전공필수",
        language: "한국어",
        description: "소프트웨어융합대학/전자공학과 전공(다전공 포함) 학생은 수강 불가"
      },
      {
        courseCode: "SWCON253-00",
        courseName: "기계학습",
        targetYear: 2,
        capacity: 60,
        professor: "이원희",
        credits: 3.0,
        courseTime: "화 10:30-11:45 (전136)\n목 10:30-11:45 (전136)",
        courseType: "전공필수",
        language: "영어(부분)",
        description: "필수 선이수 교과: 웹/파이선프로그래밍, 미적분학, 선형대수"
      },
      // ... (중간 생략, 나머지 과목들도 동일한 형식으로 추가)
      {
        courseCode: "EE211-03",
        courseName: "확률및랜덤변수",
        targetYear: 2,
        capacity: 60,
        professor: "최민석",
        credits: 3.0,
        courseTime: "화 15:00-16:15 (전226)\n목 15:00-16:15 (전226)",
        courseType: "전공기초",
        language: "한국어",
        description: ""
      }
     ];
      // ... 더 많은 과목 데이터
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
// 실행 결과
// 데이터 초기화 시작...
// MongoDB URI: mongodb://localhost:27017/uniment
// MongoDB 연결 성공
// 현재 과목 수: 0 
// 기존 데이터 삭제 완료
// 10개 과목 추가됨
