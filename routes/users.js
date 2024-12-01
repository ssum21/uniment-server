// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const Credit = require('../models/Credit');
const UserCourse = require('../models/UserCourse');
const Portfolio = require('../models/Portfolio');
const UserActivity = require('../models/UserActivity');

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
router.get('/total/count', async (req, res) => {
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

// 사용자의 학교 정보 조회
router.get('/:userId/academic-info', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (!user.academicInfo) {
      return res.status(404).json({ message: '등록된 학교 정보가 없습니다.' });
    }

    res.json({
      academicInfo: user.academicInfo,
      message: '학교 정보 조회 성공'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자의 학교 정보 업데이트
router.put('/:userId/academic-info', async (req, res) => {
  try {
    const { university, major, admissionYear } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        academicInfo: {
          university,
          major,
          admissionYear
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      message: '학교 정보가 업데이트되었습니다.',
      academicInfo: updatedUser.academicInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 회원 탈퇴 API
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
    }

    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 관련된 모든 데이터 삭제
    await Promise.all([
      // 사용자 정보 삭제
      User.findByIdAndDelete(userId),
      // 학점 정보 삭제
      Credit.deleteMany({ userId }),
      // 수강 과목 정보 삭제
      UserCourse.deleteMany({ userId }),
      // 포트폴리오 정보 삭제
      Portfolio.deleteMany({ userId }),
      // 대외활동 정보 삭제
      UserActivity.deleteMany({ userId })
    ]);

    res.json({ 
      message: '회원 탈퇴가 완료되었습니다.',
      deletedUserId: userId 
    });

  } catch (error) {
    console.error('회원 탈퇴 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;