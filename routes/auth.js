const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 일반 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 잘못되었습니다.'
      });
    }

    try {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 잘못되었습니다.'
        });
      }
    } catch (passwordError) {
      console.error('비밀번호 비교 중 오류:', passwordError);
      return res.status(500).json({
        success: false,
        message: '비밀번호 확인 중 오류가 발생했습니다.'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET이 설정되지 않았습니다.');
      return res.status(500).json({
        success: false,
        message: '서버 설정 오류가 발생했습니다.'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 회원가입 API
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }

    const user = new User({
      email,
      password,
      name,
      socialType: 'local'
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 소셜 로그인 API
router.post('/social-login', async (req, res) => {
  try {
    const { socialType, socialId, email, name } = req.body;
    
    let user = await User.findOne({ 
      $or: [
        { socialId, socialType },
        { email }
      ]
    });

    if (!user) {
      user = await User.create({
        socialType,
        socialId,
        email,
        name,
        password: Math.random().toString(36)
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    schoolInfo: user.schoolInfo,
    socialType: user.socialType
  };
}

module.exports = router; 