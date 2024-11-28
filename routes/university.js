const express = require('express');
const router = express.Router();
const University = require('../models/University');

// 모든 대학 정보 조회
router.get('/universities/names', async (req, res) => {
  try {
    const universities = await University.find({}, 'name');
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 대학 정보 조회
router.get('/universities/:name', async (req, res) => {
  try {
    const university = await University.findOne({ name: req.params.name });
    if (!university) {
      return res.status(404).json({ message: '대학교를 찾을 수 없습니다.' });
    }
    res.json({
      name: university.name,
      credits: {
        total: university.totalCredits,
        major: university.majorCredits,
        general: university.generalCredits
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 대학의 전공 목록 조회
router.get('/universities/:name/majors', async (req, res) => {
  try {
    const university = await University.findOne({ name: req.params.name });
    if (!university) {
      return res.status(404).json({ message: '대학교를 찾을 수 없습니다.' });
    }
    res.json(university.majors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 