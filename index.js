// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const graduationRouter = require('./routes/graduation'); 
const portfolioRouter = require('./routes/portfolio');
const resumeRouter = require('./routes/resume');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');
const authRouter = require('./routes/auth');
const connectDB = require('./config/db');
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
app.use('/api/courses', courseRouter);
app.use('/api/users', userRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/graduation', graduationRouter);

// JWT 검증 함수
function verifyJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  try {
    jwt.sign({ test: true }, process.env.JWT_SECRET);
    console.log('JWT_SECRET 검증 성공');
  } catch (error) {
    console.error('JWT_SECRET 검증 실패:', error);
    throw error;
  }
}

// 서버 시작
const PORT = process.env.PORT || 5555;

async function startServer() {
  try {
    // 환경변수 검증
    verifyJwtSecret();
    
    // MongoDB 연결 (config/db.js 사용)
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
  await mongoose.disconnect();
  process.exit(0);
});
