class CourseService {
  constructor() {
    this.Course = require('../models/Course');
    this.UserCourse = require('../models/UserCourse');
  }

  async getAllCourses() {
    return await this.Course.find()
      .select('courseCode courseName credits courseType language')
      .sort('courseCode');
  }

  async searchCourses(keyword) {
    return await this.Course.find({
      courseName: { $regex: keyword, $options: 'i' }
    }).select('courseCode courseName credits courseType language');
  }

  async getCourseById(id) {
    return await this.Course.findById(id);
  }
}

module.exports = new CourseService();