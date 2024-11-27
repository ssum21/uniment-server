// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 학교 정보 등록
router.post('/school-info', async (req, res) => {
  try {
    // 학교 정보 저장 로직
    const { name, major, admissionYear } = req.body;
    // DB 저장 로직
    res.status(201).json({ message: "학교 정보 등록 성공" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 학점 정보 등록
router.post('/credits', async (req, res) => {
  try {
    // 학점 정보 저장 로직
    const { category, current, total } = req.body;
    // DB 저장 로직
    res.status(201).json({ message: "학점 정보 등록 성공" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 이메일로 사용자 정보 조회 API
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      schoolInfo: user.schoolInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 모든 사용자 조회
router.get('/all', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 전체 사용자 수 조회
router.get('/total-count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ 
      totalUsers: count,
      message: '전체 사용자 수 조회 성공'
    });
  } catch (error) {
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
});


// ID로 사용자 정보 조회 API
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      schoolInfo: user.schoolInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;