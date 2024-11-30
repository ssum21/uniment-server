// routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const User = require('../models/User');
const mongoose = require('mongoose');
const { updateGraduationStatus } = require('../utils/graduationHelper');

// 전체 과목 목록 조회
router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find()
      .select('courseCode courseName credits courseType language')
      .sort('courseCode');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 과목 검색 (과목명으로)
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    const courses = await Course.find({
      courseName: { $regex: keyword, $options: 'i' }
    }).select('courseCode courseName credits courseType language');
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
    const { userId, courseId } = req.body;
    
    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    let userCourse = await UserCourse.findOne({ userId: userId });
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: '과목을 찾을 수 없습니다.' });
    }

    if (!userCourse) {
      // 새로운 UserCourse 문서 생성
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      // 기본값 설정
      const university = user.academicInfo?.university || '미정';
      const major = user.academicInfo?.major || '미정';

      userCourse = new UserCourse({
        userId: userId,
        university: university,
        major: major,
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
      status: '수강중'
    });

    await userCourse.save();
    
    // 추업 요건 업데이트
    await updateGraduationStatus(userId, course, 'add');
    
    // 추가된 과목 정보와 함께 응답
    const populatedUserCourse = await UserCourse.findById(userCourse._id)
      .populate('courses.courseId');
    
    res.status(201).json({
      message: '과목이 추가되었습니다.',
      course: populatedUserCourse.courses[populatedUserCourse.courses.length - 1]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 특정 대학의 전체 과목 조회
router.get('/:university/all', async (req, res) => {
  try {
    const { university } = req.params;
    const { major } = req.query;
    
    const query = { university };
    if (major) query.major = major;

    const courses = await Course.find(query)
      .select('courseCode courseName credits courseType language major')
      .sort('courseCode');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 대학의 과목 검색
router.get('/:university/search', async (req, res) => {
  try {
    const { university } = req.params;
    const { keyword, major } = req.query;
    
    const query = {
      university,
      $or: [
        { courseName: { $regex: keyword, $options: 'i' } },
        { courseCode: { $regex: keyword, $options: 'i' } }
      ]
    };
    if (major) query.major = major;

    const courses = await Course.find(query)
      .select('courseCode courseName credits courseType language major');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자 수강 과목 삭제 라우트 추가
router.delete('/user/remove-course', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    const userCourse = await UserCourse.findOne({ userId });
    if (!userCourse) {
      return res.status(404).json({ message: '수강 정보를 찾을 수 없습니다.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '과목을 찾을 수 없습니다.' });
    }

    // 과목 삭제
    userCourse.courses = userCourse.courses.filter(
      course => course.courseId.toString() !== courseId
    );

    await userCourse.save();
    
    // 졸업 요건 업데이트
    await updateGraduationStatus(userId, course, 'remove');

    res.json({ message: '과목이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 사용자가 추가한 과목 목록 조회 (간단한 형식)
router.get('/list/user/:userId', async (req, res) => {
  try {
    const userCourses = await UserCourse.findOne({ userId: req.params.userId })
      .populate({
        path: 'courses.courseId',
        select: 'courseCode courseName credits courseType language major'
      });

    if (!userCourses || !userCourses.courses) {
      return res.json([]);
    }

    // 필요한 형식으로 데이터 변환
    const formattedCourses = userCourses.courses.map(course => ({
      _id: course.courseId._id,
      courseCode: course.courseId.courseCode,
      courseName: course.courseId.courseName,
      credits: course.courseId.credits,
      courseType: course.courseId.courseType,
      language: course.courseId.language,
      major: course.courseId.major
    }));

    res.json(formattedCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 사용자가 추가한 과목 삭제 API
router.delete('/list/user/:userId/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }

    const userCourse = await UserCourse.findOne({ userId });
    if (!userCourse) {
      return res.status(404).json({ message: '수강 정보를 찾을 수 없습니다.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '과목을 찾을 수 없습니다.' });
    }

    // 과목이 실제로 사용자의 수강 목록에 있는지 확인
    const courseExists = userCourse.courses.some(
      c => c.courseId.toString() === courseId
    );

    if (!courseExists) {
      return res.status(404).json({ message: '해당 과목이 수강 목록에 없습니다.' });
    }

    // 과목 삭제
    userCourse.courses = userCourse.courses.filter(
      c => c.courseId.toString() !== courseId
    );

    await userCourse.save();

    // 업데이트된 과목 목록 조회
    const updatedUserCourse = await UserCourse.findOne({ userId })
      .populate({
        path: 'courses.courseId',
        select: 'courseCode courseName credits courseType language major'
      });

    const formattedCourses = updatedUserCourse.courses.map(course => ({
      _id: course.courseId._id,
      courseCode: course.courseId.courseCode,
      courseName: course.courseId.courseName,
      credits: course.courseId.credits,
      courseType: course.courseId.courseType,
      language: course.courseId.language,
      major: course.courseId.major
    }));

    res.json({
      message: '과목이 성공적으로 삭제되었습니다.',
      updatedCourses: formattedCourses
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;