// utils/graduationHelper.js
const GraduationRequirement = require('../models/GraduationRequirement');
const User = require('../models/User');

async function updateGraduationStatus(userId, course, action = 'add') {
  try {
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 해당 사용자의 졸업 요건 조회
    const requirement = await GraduationRequirement.findOne({
      university: user.academicInfo.university,
      major: user.academicInfo.major,
      'admissionYearRange.start': { $lte: user.academicInfo.admissionYear },
      'admissionYearRange.end': { $gte: user.academicInfo.admissionYear }
    });

    if (!requirement) {
      throw new Error('졸업 요건 정보를 찾을 수 없습니다.');
    }

    // 학점 계산을 위한 multiplier 설정
    const multiplier = action === 'add' ? 1 : -1;

    // 과목 유형에 따라 해당하는 카테고리 업데이트
    switch(course.courseType) {
      case '전공기초':
        requirement.majorRequirements.basic += course.credits * multiplier;
        break;
      case '전공필수':
        requirement.majorRequirements.required += course.credits * multiplier;
        break;
      case '전공선택':
        requirement.majorRequirements.elective += course.credits * multiplier;
        break;
      case '교양필수':
        requirement.generalRequirements.required += course.credits * multiplier;
        break;
      case '교양선택':
      case '배분이수':
        requirement.generalRequirements.distributed += course.credits * multiplier;
        break;
      case '자유이수':
        requirement.generalRequirements.free += course.credits * multiplier;
        break;
    }

    await requirement.save();
    return requirement;
  } catch (error) {
    console.error('졸업 요건 업데이트 중 오류 발생:', error);
    throw error;
  }
}

module.exports = { updateGraduationStatus };