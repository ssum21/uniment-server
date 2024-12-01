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
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE327",
        courseName: "소프트웨어공학",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "소프트웨어융합학과",
        courseCode: "SWCON401",
        courseName: "소프트웨어융합캡스톤디자인",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE304",
        courseName: "알고리즘",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "SWCON201",
        courseName: "오픈소스SW개발방법및도구",
        credits: 3.0,
        courseType: "전공선택",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE301",
        courseName: "운영체제",
        credits: 3.0,
        courseType: "전공필수",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "SWCON104",
        courseName: "웹/파이선프로그래밍",
        credits: 3.0,
        courseType: "전공필수",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE204",
        courseName: "자료구조",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE340",
        courseName: "실전기계학습",
        credits: 3.0,
        courseType: "전공선택",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE302",
        courseName: "컴퓨터네트워크",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE331",
        courseName: "딥러닝",
        credits: 3.0,
        courseType: "전공선택",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "CSE201",
        courseName: "이산구조",
        credits: 3.0,
        courseType: "전공필수",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "EE211",
        courseName: "확률및랜덤변수",
        credits: 3.0,
        courseType: "전공필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "컴퓨터공학과",
        courseCode: "SWCON492",
        courseName: "풀스택서비스네트워킹",
        credits: 3.0,
        courseType: "전공선택",
        language: "영어(부분)"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEC1403",
        courseName: "대학영어",
        credits: 2.0,
        courseType: "교양필수",
        language: "영어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEC1105",
        courseName: "성찰과표현",
        credits: 3.0,
        courseType: "교양필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEC2001",
        courseName: "주제연구",
        credits: 3.0,
        courseType: "교양필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEC0103",
        courseName: "빅뱅에서문명까지",
        credits: 3.0,
        courseType: "교양필수",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEC1104",
        courseName: "세계와시민",
        credits: 3.0,
        courseType: "교양필수",
        language: "한국어"
      },
      // 교양배분
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1103",
        courseName: "마음의탄생:뇌,의식,마음",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11015",
        courseName: "만성질병과건강관리",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1104",
        courseName: "몸과생명",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1105",
        courseName: "몸의발견",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1987",
        courseName: "문명감염그리고진화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1208",
        courseName: "불편한진실:기후변화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1106",
        courseName: "생명,영원한블루오션",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1113",
        courseName: "스마트식생활과건강",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1240",
        courseName: "우주:별을잊은그대에게",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1215",
        courseName: "원자의춤",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1119",
        courseName: "진화와인간본성",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1966",
        courseName: "질병의진화적이해:우리는왜아픈걸까",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11027",
        courseName: "폭력의진화:통섭적관점",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1235",
        courseName: "하천문화의이해와르네상스",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11017",
        courseName: "Exploring Industry, Ideology, and Identity through the Marvel Cinematic Universe",
        credits: 3.0,
        courseType: "교양배분",
        language: "영어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1301",
        courseName: "가면의축제:동서양연희의문명사",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1353",
        courseName: "고전과여성",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1989",
        courseName: "고전명작과예술의문명사",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1801",
        courseName: "고전읽기:그리스비극",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1835",
        courseName: "고전읽기:박경리토지",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1819",
        courseName: "고전읽기:프로이트",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1305",
        courseName: "공감의인류학:감정이입과의인화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1603",
        courseName: "국화와칼:만들어진일본의전통",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1664",
        courseName: "그리스신화와철학",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1996",
        courseName: "그림속의인문학",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11026",
        courseName: "근대의시선과공간:뮤지엄과엑스포",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11021",
        courseName: "글,그림그리고문화콘텐츠",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1861",
        courseName: "글로벌라틴아메리카",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1994",
        courseName: "라틴어와서구문명",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1358",
        courseName: "명작에취하다:예술 감상법",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1311",
        courseName: "미디어아트와문화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1337",
        courseName: "불교와정신분석학",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1650",
        courseName: "삼국지인문학",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1865",
        courseName: "수사학과영작문",
        credits: 3.0,
        courseType: "교양배분",
        language: "영어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1868",
        courseName: "언어와문학의이해",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1656",
        courseName: "영화로보는스포츠문화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1349",
        courseName: "영화와문학",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1940",
        courseName: "예술치료의원리와실제",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1363",
        courseName: "음식과문화:글로벌&로컬트렌드와이슈",
        credits: 3.0,
        courseType: "교양배분",
        language: "영어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1325",
        courseName: "인문학과문화콘텐츠",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1951",
        courseName: "패션디자인의세계",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1873",
        courseName: "하이쿠의세계",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1501",
        courseName: "On Justice",
        credits: 3.0,
        courseType: "교양배분",
        language: "영어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11040",
        courseName: "고전읽기:칼세이건",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1860",
        courseName: "국가폭력과트라우마",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1468",
        courseName: "대학생을위한실용금융",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1511",
        courseName: "두얼굴의인류사:전쟁과평화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1454",
        courseName: "디아스포라",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11011",
        courseName: "마음챙김과비폭력대화",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1736",
        courseName: "만화로세상보기",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11019",
        courseName: "문명패러다임의혁명:서구근대화과정의현재적이해",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1419",
        courseName: "법,질서,국가",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1663",
        courseName: "시민생활과법",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1665",
        courseName: "영화로읽는도시인문학:환동해도시와문화지리",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1432",
        courseName: "예술을통한공동체만들기",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1666",
        courseName: "유럽문화와도시문명",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1435",
        courseName: "정치학적사유의원리",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED11020",
        courseName: "청춘을위한영화예찬",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1528",
        courseName: "평화와갈등",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1440",
        courseName: "행복이란무엇인가",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GED1628",
        courseName: "황하와장강:중국역사의발자취",
        credits: 3.0,
        courseType: "교양배분",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11054",
        courseName: "공학과경영",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1330",
        courseName: "글로벌세미나",
        credits: 2.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "IPE102",
        courseName: "기업윤리와사회적책임",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11003",
        courseName: "기초러시아어",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11002",
        courseName: "기초스페인어",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11001",
        courseName: "기초일본어",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11000",
        courseName: "기초중국어",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE11004",
        courseName: "기초프랑스어",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1333",
        courseName: "독립연구1",
        credits: 2.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1343",
        courseName: "빅데이터를통한세상바로알기:R로배우는데이터분석코딩",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1127",
        courseName: "사물인터넷과미래사회",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1953",
        courseName: "새로운생명체:인공지능",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1980",
        courseName: "소프트웨어개발자를위한C프로그래밍",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1954",
        courseName: "소프트웨어적사유",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1957",
        courseName: "신입생워크숍2:스타트업",
        credits: 2.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1344",
        courseName: "앱인벤터로배우는코딩세상",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1671",
        courseName: "운동과체중관리",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1983",
        courseName: "인공지능을위한수학",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "GEE1982",
        courseName: "지구를생각하는인공지능",
        credits: 1.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "교양",
        courseCode: "IPE401",
        courseName: "지식재산창업",
        credits: 3.0,
        courseType: "교양자유",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "자연계열",
        courseCode: "AMTH1003",
        courseName: "고급미분적분학",
        credits: 3.0,
        courseType: "전공기초",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "자연계열",
        courseCode: "AMTH1001",
        courseName: "미분방정식",
        credits: 3.0,
        courseType: "전공기초",
        language: "한국어"
      },
      {
        university: "경희대학교",
        major: "자연계열",
        courseCode: "AMTH1005",
        courseName: "통계학",
        credits: 3.0,
        courseType: "전공기초",
        language: "한국어"
      }
    
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
