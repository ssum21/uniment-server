const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

async function uploadImageToFirebase(imageFile) {
  try {
    const bucket = admin.storage().bucket();
    const fileName = `portfolio-images/${uuidv4()}-${imageFile.originalname}`;
    
    // 이미지 업로드
    const file = bucket.file(fileName);
    await file.save(imageFile.buffer, {
      metadata: {
        contentType: imageFile.mimetype
      }
    });

    // 공개 URL 생성
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Firebase 이미지 업로드 실패:', error);
    throw error;
  }
}

module.exports = { uploadImageToFirebase }; 