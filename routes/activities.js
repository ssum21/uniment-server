const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

// 사용자의 대외활동 개수 조회 API
router.get('/count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "유효하지 않은 userId 형식입니다."
      });
    }

    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // UserActivity 모델에서 해당 사용자의 활동 개수 직접 조회
    const userActivity = await UserActivity.findOne({ userId });
    const count = userActivity ? userActivity.activities.length : 0;

    res.json({ 
      count,
      message: '대외활동 개수 조회 성공'
    });

  } catch (error) {
    console.error('대외활동 개수 조회 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 