# Uniment-Server

## 소개
Uniment-Server는 대학생들의 학업 및 진로 관리를 위한 종합 플랫폼의 백엔드 서버입니다. MongoDB와 Express.js를 기반으로 구축되었으며, 학점 관리부터 포트폴리오 및 자기소개서 관리까지 통합된 서비스를 제공합니다.

## 주요 기능

### 1. 학사 정보 관리
- 대학별 졸업 요건 관리
- 학점 계산 및 트래킹 
- 수강 과목 관리

### 2. 포트폴리오 관리
- 어학 성적, 자격증, 수상 경력 등 관리
- 카테고리별 분류 및 검색
- 성과 트래킹

### 3. 자기소개서 관리 
- 기업별 자기소개서 작성 및 관리
- 버전 관리 및 히스토리 추적
- 템플릿 기반 작성 지원

## 기술 스택

### Backend
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());
```

### Database
- MongoDB with Mongoose
- 데이터 모델링 및 정규화

```javascript
async function initializeUniversities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB 연결 성공');
        await University.deleteMany({});
        const result = await University.insertMany(universities);
        console.log(`${result.length}개 대학 정보 추가 완료`);
    } catch (error) {
        console.error('초기화 실패:', error);
        process.exit(1);
    }
}
```

### API
- RESTful API 설계
- 모듈화된 라우터 구조

```javascript
app.use('/api/graduation', graduationRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/credits', creditsRouter);
```

## 강점

### 1. 확장성 있는 아키텍처
- 모듈화된 코드 구조
- 마이크로서비스 지향 설계
- 유연한 API 구조

### 2. 실시간 데이터 동기화

```javascript
router.get('/credits/summary', async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await User.findById(userId);
        const credits = await Credit.find({ userId });
        let totalRequired = 0;
        let totalCurrent = 0;
        credits.forEach(credit => {
            if (credit.category === '전체') {
                totalRequired = credit.credits.required;
                totalCurrent = credit.credits.current;
            }
        });
        res.json({
            totalCredits: {
                current: totalCurrent,
                required: totalRequired,
                remaining: totalRequired - totalCurrent
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

### 3. 대학별 맞춤 정보

```javascript
router.get('/universities/:name', async (req, res) => {
    try {
        const university = await University.findOne({ name: req.params.name });
        res.json({
            name: university.name,
            credits: {
                total: university.totalCredits,
                major: university.majorCredits,
                general: university.generalCredits
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

## 설치 및 실행

### 환경 변수 설정
`.env` 파일을 생성하고 다음 값을 추가하세요:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
FIREBASE_ENABLED=true
FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 서버 실행
```bash
npm start
```

## API 문서

### 자기소개서 API

#### 엔드포인트

- `GET /api/resumes/user/:userId`: 사용자의 자기소개서 목록 조회
- `GET /api/resumes/:id`: 특정 자기소개서 상세 조회
- `POST /api/resumes`: 새 자기소개서 작성
- `PUT /api/resumes/:id`: 자기소개서 수정
- `DELETE /api/resumes/:id`: 자기소개서 삭제
- `GET /api/resumes/count/:userId`: 사용자의 자기소개서 개수 조회

```javascript
// 자기소개서 작성 예시
POST /api/resumes
{
  "userId": "user_id",
  "company": "회사명",
  "position": "지원 포지션",
  "type": "신입",
  "applicationDate": "2024-03-20",
  "content": "자기소개서 내용",
  "tags": ["태그1", "태그2"]
}
```

### 학점 관리 API

#### 엔드포인트

- `POST /api/credits`: 학점 정보 추가/수정
- `GET /api/credits/summary`: 학점 요약 정보 조회
  - 필수 이수 학점
  - 전체 이수 학점
  - 남은 학점 계산
  - 이수 과목 수 통계

```javascript
// 학점 요약 조회 예시
GET /api/credits/summary?userId=user_id
Response:
{
  "totalCredits": {
    "current": 85,
    "required": 130,
    "remaining": 45
  },
  "courses": {
    "completed": 28,
    "required": 42,
    "remaining": 14
  }
}
```

### 졸업 요건 API

- `POST /api/requirements`: 졸업 요건 등록
  - 대학/학과별 졸업 요건 설정
  - 전공/교양 필수 학점 관리
  - 세부 이수 요건 설정

```javascript
// 졸업 요건 등록 예시
POST /api/requirements
{
  "university": "대학명",
  "major": "전공명",
  "requirements": {
    "totalCredits": 130,
    "major": {
      "basic": 18,
      "required": 45,
      "elective": 21
    },
    "general": {
      "required": 15,
      "distributed": 21,
      "free": 10
    }
  }
}
```

### 대학 정보 API
#### 엔드포인트

- `GET /api/universities/names`: 모든 대학 목록 조회
- `GET /api/universities/:name`: 특정 대학 정보 조회

- `GET /api/universities/:name/majors`: 특정 대학의 전공 목록 조회

```javascript
// 대학 정보 조회 예시
GET /api/universities/경희대학교
Response:
{
  "name": "경희대학교",
  "credits": {
    "total": 130,
    "major": 66,
    "general": 64
  }
}
```

### 인증 및 보안

- 모든 API는 JWT 기반 인증 필요

- CORS 설정으로 허용된 출처만 접근 가능

```javascript
// 인증 헤더 예시
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### 에러 처리

모든 API는 다음과 같은 표준화된 에러 응답 포맷을 사용합니다:
{
  "message": "에러 메시지",
  "status": 400,
  "details": "상세 에러 정보"
}


### API 테스트
API 테스트는 Jest와 Supertest를 사용하여 수행할 수 있습니다:

// API 테스트 예시
const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  test('학교 정보 등록', async () => {
    const response = await request(app)
      .post('/api/users/school-info')
      .send({
        name: "테스트대학교",
        major: "컴퓨터공학",
        admissionYear: 2024
      });
    expect(response.status).toBe(201);
  });
});


## 기여 가이드
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스
Apache License 2.0

## 연락처
- Email: ssumuss@khu.ac.kr


---
이 프로젝트는 대학생들의 학업과 진로 관리를 돕기 위한 오픈소스 프로젝트입니다. 많은 기여와 피드백을 환영합니다.
