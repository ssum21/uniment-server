// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const mongoose = require('mongoose');
const cors = require('cors');
const graduationRouter = require('./routes/graduation'); 
const portfolioRouter = require('./routes/portfolio');
const resumeRouter = require('./routes/resume');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// API 라우트 설정
app.use('/api', graduationRouter);  // graduation 라우터 연결
app.use('/api', portfolioRouter);  // portfolio 라우터 연결
app.use('/api', resumeRouter);      // resume 라우터 연결
app.use('/api', userRouter);        // user 라우터 연결
app.use('/api/portfolio', portfolioRouter); // portfolio 라우터 연결
app.use('/api/courses', courseRouter);
app.use('/api/users', userRouter);

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

async function startServer() {
  try {
    await setupRoutes();
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
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