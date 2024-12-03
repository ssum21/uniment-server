// routes/portfolio.js
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const mongoose = require('mongoose');
const multer = require('multer');
const { uploadImageToFirebase } = require('../utils/firebase');

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 포트폴리오 추가
// POST /api/portfolio
router.post('/', async (req, res) => {
    try {
      // 요청 본문 로그
      console.log('Request body:', req.body);

      // 필수 필드 확인 및 유효성 검사
      const { 
        userId,
        type,        // 포트폴리오 유형 (8가지 중 하나)
        title,       // 포트폴리오 종류 (예: "TOEIC")
        achievement, // 정량적 성과 (점수 또는 합격여부)
        date,        // 취득/수행 날짜
        memo,        // 메모
        imageUrl    // Firebase Storage URL
      } = req.body;

      // 필수 필드 검증
      if (!userId || !type || !title || !achievement || !date) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
      }

      // achievement 형식 검증
      if (!['점수', '합격여부'].includes(achievement.type)) {
        return res.status(400).json({ message: '잘못된 성과 유형입니다.' });
      }

      // userId가 MongoDB ObjectId 형식인지 확인
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
      }

      // 새로운 포트폴리오 객체 생성
      const portfolio = new Portfolio({
        userId,
        type,
        title,
        achievement,
        date,
        memo,
        image: imageUrl
      });

      // 생성된 객체 로깅
      console.log('Created portfolio object:', portfolio);

      // 포트폴리오 저장
      const savedPortfolio = await portfolio.save();
      console.log('Saved portfolio:', savedPortfolio);  // 저장된 데이터 로깅

      res.status(201).json(savedPortfolio);
    } catch (error) {
      console.error('Error creating portfolio:', error);  // 에러 로깅
      res.status(400).json({ message: error.message });
    }
});

// 이미지가 포함된 포트폴리오 추가
router.post('/with-image', upload.single('image'), async (req, res) => {
  try {
    const { userId, type, title, achievement, date, memo } = req.body;

    // 이미지 업로드 및 URL 획득
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImageToFirebase(req.file);
    }

    const portfolio = new Portfolio({
      userId,
      type,
      title,
      achievement,
      date,
      memo,
      image: imageUrl
    });

    const savedPortfolio = await portfolio.save();
    res.status(201).json(savedPortfolio);

  } catch (error) {
    console.error('포트폴리오 생성 중 오류:', error);
    res.status(400).json({ message: error.message });
  }
});

// 포트폴리오 목록 조회 list
router.get('/user/list', async (req, res) => {
  try {
    // userId가 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
    }

    const portfolios = await Portfolio.find({ userId: req.params.userId });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 포트폴리오 목록 조회
router.get('/user/:userId', async (req, res) => {
  try {
    // userId가 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
    }

    const portfolios = await Portfolio.find({ userId: req.params.userId });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 포트폴리오 삭제
router.delete('/:portfolioId', async (req, res) => {
  try {
    // portfolioId가 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: '유효하지 않은 portfolioId 형식입니다.' });
    }

    const portfolio = await Portfolio.findByIdAndDelete(req.params.portfolioId);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자의 포트폴리오 개수 조회
router.get('/count/:userId', async (req, res) => {
  try {
    // userId가 MongoDB ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
    }
    const count = await Portfolio.countDocuments({ userId: req.params.userId });
    
    res.json({ 
      count,
      message: '포트폴리오 개수 조회 성공'
    });
  } catch (error) {
    console.error('포트폴리오 개수 조회 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
