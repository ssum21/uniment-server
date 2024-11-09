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

// 이메일로 사용자 조회
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 모든 사용자 조회
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;