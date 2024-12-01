const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// 자기소개서 목록 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId })
      .sort('-applicationDate')
      .select('company position type applicationDate status tags');
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 자기소개서 상세 조회
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }
    
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: '자기소개서를 찾을 수 없습니다.' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새 자기소개서 작성
router.post('/', async (req, res) => {
  try {
    const resume = new Resume({
      userId: req.body.userId,
      company: req.body.company,
      position: req.body.position,
      type: req.body.type,
      applicationDate: req.body.applicationDate,
      content: req.body.content,
      tags: req.body.tags
    });

    const savedResume = await resume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 자기소개서 수정
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: '자기소개서를 찾을 수 없습니다.' });
    }

    resume.content = req.body.content;
    resume.updatedAt = new Date();
    
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 자기소개서 삭제
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: '자기소개서를 찾을 수 없습니다.' });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: '자기소개서가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자의 자기소개서 개수 조회
router.get('/count/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: '유효하지 않은 userId 형식입니다.' });
    }

    const count = await Resume.countDocuments({ userId: req.params.userId });
    
    res.json({ 
      count,
      message: '자기소개서 개수 조회 성공'
    });
  } catch (error) {
    console.error('자기소개서 개수 조회 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 