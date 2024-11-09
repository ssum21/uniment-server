// scripts/checkUserId.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUserId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 이메일로 사용자 찾기
    const user = await User.findOne({ email: 'hong@test.com' });
    
    if (user) {
      console.log('사용자 ID:', user._id);
      console.log('사용자 정보:', user);
    } else {
      console.log('사용자를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserId();