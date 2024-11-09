// routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const mongoose = require('mongoose');

// 전체 과목 조회
router.get('/all', async (req, res) => {
  try {
    console.log('과목 조회 요청 받음');
    const courses = await Course.find({})
      .select('courseCode courseName targetYear capacity professor credits courseTime courseType language description')
      .sort({ courseCode: 1 });  // 학수번호 기준 정렬
    
    console.log(`총 ${courses.length}개 과목 조회됨`);
    res.json(courses);
  } catch (error) {
    console.error('과목 조회 중 에러:', error);
    res.status(500).json({ message: error.message });
  }
});

// 과목 검색
router.get('/search', async (req, res) => {
  try {
    const { keyword, type } = req.query;
    
    const query = {};
    if (keyword) {
      query.$or = [
        { courseName: { $regex: keyword, $options: 'i' } },
        { courseCode: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (type) {
      query.courseType = type;
    }
    
    const courses = await Course.find(query);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ID로 특정 과목 조회
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '과목을 찾을 수 없습니다.' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 과목 추가 API
router.post('/courses', async (req, res) => {
  try {
    const course = new Course({
      courseCode: req.body.courseCode,
      courseName: req.body.courseName,
      targetYear: req.body.targetYear,
      credit: req.body.credit,
      professor: req.body.professor,
      courseTime: req.body.courseTime,
      courseType: {
        mainCategory: req.body.mainCategory,
        subCategory: req.body.subCategory
      },
      language: req.body.language,
      description: req.body.description
    });

    const savedCourse = await course.save();
    await updateGraduationRequirements(req.body.userId, savedCourse);
    
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;