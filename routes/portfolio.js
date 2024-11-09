// routes/portfolio.js
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');

// 포트폴리오 추가
// POST /api/portfolio
router.post('/', async (req, res) => {
    try {
      console.log('Request body:', req.body); // 디버깅용 로그
      
      const portfolio = new Portfolio({
        userId: req.body.userId,
        type: req.body.type,
        title: req.body.title,
        score: req.body.score,
        date: req.body.date,
        description: req.body.description
      });  
  
      console.log('Created portfolio object:', portfolio);  // 생성된 객체 로깅

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
    const portfolios = await Portfolio.find({ userId: req.params.userId });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 포트폴리오 삭제
router.delete('/:portfolioId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.portfolioId);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 시험 정보 조회
const getTestInfo = async (title, score) => {
  // 시험 정보 조회 로직
  return { title, score };
};

module.exports = router;