// routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
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

// 특정 대학/학과의 과목 목록 조회
router.get('/university/:universityName/major/:majorName', async (req, res) => {
  try {
    const { universityName, majorName } = req.params;
    const courses = await Course.find({
      university: universityName,
      major: majorName
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자의 수강 과목 등록
router.post('/user/register', async (req, res) => {
  try {
    const { userId, university, major, courses } = req.body;
    
    const userCourse = new UserCourse({
      userId,
      university,
      major,
      courses: courses.map(course => ({
        courseId: course.courseId,
        semester: course.semester,
        grade: course.grade
      }))
    });
    
    await userCourse.save();
    res.status(201).json(userCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 사용자의 수강 과목 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const userCourses = await UserCourse.find({ userId: req.params.userId })
      .populate('courses.courseId');
    res.json(userCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 대학/학과의 수강 가능한 과목 목록 조회 (기존 코드 수정)
router.get('/available', async (req, res) => {
  try {
    const { university, major } = req.query;
    if (!university || !major) {
      return res.status(400).json({ message: '대학과 학과 정보가 필요합니다.' });
    }

    const courses = await Course.find({
      university: university,
      major: major,
      isAvailable: true
    }).select('courseCode courseName credits professor courseTime courseType');

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자 수강 과목 추가 (기존 코드 수정)
router.post('/user/add-course', async (req, res) => {
  try {
    const { userId, courseId, semester } = req.body;
    
    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    let userCourse = await UserCourse.findOne({ userId: userId });
    
    if (!userCourse) {
      // 새로운 UserCourse 문서 생성
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      userCourse = new UserCourse({
        userId: userId,
        university: user.academicInfo.university,
        major: user.academicInfo.major,
        courses: []
      });
    }

    // 이미 추가된 과목인지 확인
    const isDuplicate = userCourse.courses.some(
      course => course.courseId.toString() === courseId
    );

    if (isDuplicate) {
      return res.status(400).json({ message: '이미 추가된 과목입니다.' });
    }

    // 과목 추가
    userCourse.courses.push({
      courseId: courseId,
      semester: semester,
      status: '수강중'
    });

    await userCourse.save();
    
    // 추가된 과목 정보와 함께 응답
    const populatedUserCourse = await UserCourse.findById(userCourse._id)
      .populate('courses.courseId');
    
    res.status(201).json({
      message: '과목이 추가되었습니다.',
      course: populatedUserCourse.courses[populatedUserCourse.courses.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;