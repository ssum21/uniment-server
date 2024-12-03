// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');  // JWT 모듈 추가
const graduationRouter = require('./routes/graduation'); 
const portfolioRouter = require('./routes/portfolio');
const resumesRouter = require('./routes/resumes');  // 수정된 부분
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');
const authRouter = require('./routes/auth');
const universityRouter = require('./routes/university');
const creditsRouter = require('./routes/credits');
const activitiesRouter = require('./routes/activities');
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API 라우트 설정
app.use('/api', graduationRouter);  // graduation 라우터 연결
app.use('/api', portfolioRouter);  // portfolio 라우터 연결
app.use('/api/resumes', resumesRouter);  // 수정된 부분
app.use('/api', userRouter);        // user 라우터 연결
app.use('/api/graduation', graduationRouter);
app.use('/api/portfolio', portfolioRouter); // portfolio 라우터 연결
app.use('/api/courses', courseRouter);
app.use('/api/users', userRouter);
app.use('/api/resume', resumesRouter);
app.use('/api/auth', authRouter);
app.use('/api', universityRouter);  // university 라우터를 /api 경로에 연결
app.use('/api/credits', creditsRouter);
app.use('/api/activities', activitiesRouter);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));


// 프로세스 종료 시 MongoDB 연결 종료
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

// MongoDB 연결 설정
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// 데이터베이스 연결 함수
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB 연결 성공!");
    return client.db("uniment"); // uniment 데이터베이스 사용
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    process.exit(1);
  }
}

// API 라우트 설정
async function setupRoutes() {
  const db = await connectDB();

  // 라우터 연결 - 위치 이동
  app.use('/api', graduationRouter);  // graduation 라우터 연결
  app.use('/api', portfolioRouter);  // portfolio 라우터 연결
  app.use('/api', resumeRouter);      // resume 라우터 연결
  app.use('/api', userRouter);        // user 라우터 연결
  app.use('/api/portfolio', portfolioRouter); // portfolio 라우터 연결

  // 사용자 관련 API
  app.post('/api/users', async (req, res) => {
    try {
      const collection = db.collection('users');
      const result = await collection.insertOne(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // 학점 정보 관련 API
  app.post('/api/credits', async (req, res) => {
    try {
      const collection = db.collection('credits');
      const result = await collection.insertOne(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // 포트폴리오 관련 API
  app.post('/api/portfolios', async (req, res) => {
    try {
      const collection = db.collection('portfolios');
      const result = await collection.insertOne(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // 테스트용 API
  app.get('/test', (req, res) => {
    res.json({ message: '서버 연결 성공!' });
  });
}

// 서버 시작
const PORT = process.env.PORT || 5555;

// JWT 검증 함수
function verifyJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  try {
    // 테스트 토큰 생성
    jwt.sign({ test: true }, process.env.JWT_SECRET);
    console.log('JWT_SECRET 검증 성공');
  } catch (error) {
    console.error('JWT_SECRET 검증 실패:', error);
    throw error;
  }
}

// 서버 시작 함수 수정
async function startServer() {
  try {
    // JWT 환경변수 검증
    verifyJwtSecret();
    
    // MongoDB 연결
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
      console.log('환경변수 설정 상태:');
      console.log('- JWT_SECRET:', '설정됨');
      console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '설정됨' : '미설정');
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

// 서버 시작
startServer();

// 프로세스 종료 시 DB 연결 종료
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});

// Firebase 초기화 부분을 조건부로 변경
if (process.env.FIREBASE_ENABLED === 'true') {
  const admin = require('firebase-admin');
  try {
    const serviceAccount = require('./firebase-credentials.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase 초기화 성공');
  } catch (error) {
    console.warn('Firebase 초기화 실패:', error.message);
  }
}