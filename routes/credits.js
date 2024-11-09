// routes/credits.js
const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');

// 학점 정보 조회
router.get('/credits', async (req, res) => {
  try {
    const { userId } = req.query;
    const credits = await Credit.find({ userId });
    
    // 카테고리별로 데이터 정리
    const organizedCredits = {
      전체: { required: 0, current: 0, remaining: 0 },
      전공: { required: 0, current: 0, remaining: 0 },
      교양: { required: 0, current: 0, remaining: 0 },
      기타: { required: 0, current: 0, remaining: 0 }
    };

    credits.forEach(credit => {
      const category = credit.category;
      organizedCredits[category].required += credit.credits.required;
      organizedCredits[category].current += credit.credits.current;
      organizedCredits[category].remaining = 
        organizedCredits[category].required - organizedCredits[category].current;
    });

    res.json(organizedCredits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 학점 정보 추가/수정
router.post('/credits', async (req, res) => {
  try {
    const { userId, category, subCategory, required, current } = req.body;
    
    const credit = await Credit.findOneAndUpdate(
      { userId, category, subCategory },
      {
        credits: {
          required,
          current,
          remaining: required - current
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(credit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;