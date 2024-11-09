// scripts/testConnection.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공!');
    
    // 데이터베이스 목록 확인
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('사용 가능한 데이터베이스:', databases);
    
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();