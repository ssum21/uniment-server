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
const universityRouter = require('./routes/university');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

function verifyJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 정의되지 않았습니다');
  }
  try {
    jwt.sign({ test: true }, process.env.JWT_SECRET);
    console.log('JWT_SECRET 검증 성공');
  } catch (error) {
    console.error('JWT_SECRET 검증 실패:', error);
    throw error;
  }
}

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

function setupRoutes() {
  app.use('/api/users', userRouter);  // userRouter만 이렇게 수정
  app.use('/api', graduationRouter);
  app.use('/api', portfolioRouter);
  app.use('/api', resumeRouter);
  app.use('/api', userRouter);
  app.use('/api', universityRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/auth', authRouter);

  app.get('/test', (req, res) => {
    res.json({ message: '서버 연결 성공!' });
  });
}

async function startServer() {
  try {
    verifyJwtSecret();
    await connectToMongoDB();
    setupRoutes();

    const PORT = process.env.PORT || 5555;
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
      console.log('환경변수 설정 상태:');
      console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '미설정');
      console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '설정됨' : '미설정');
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB 연결 종료 실패:', error);
    process.exit(1);
  }
});

startServer();