const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const mongoose = require('mongoose'); // mongoose 추가

// Resume 조회
router.get('/:id', async (req, res) => {
  try {
    // ObjectId 유효성 검사 추가
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

// Resume 생성
router.post('/', async (req, res) => {
  try {
    const resume = new Resume({
      userId: req.body.userId,
      company: req.body.company,
      content: req.body.content,
      status: req.body.status || '작성중'
    });

    const savedResume = await resume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resume 수정
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ message: '자기소개서를 찾을 수 없습니다.' });
    }

    res.json(updatedResume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resume 삭제
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: '자기소개서를 찾을 수 없습니다.' });
    }

    res.json({ message: '자기소개서가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;