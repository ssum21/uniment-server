// routes/portfolio.js
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const mongoose = require('mongoose');

// 포트폴리오 추가
// POST /api/portfolio
router.post('/', async (req, res) => {
    try {
      // 요청 본문 로그
      console.log('Request body:', req.body);

      // 필수 필드 확인 및 유효성 검사
      const { userId, type, title, date, description } = req.body;
      if (!userId || !type || !title || !date) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
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
        date,
        description,
        score: req.body.score // 선택적 필드
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

module.exports = router;
