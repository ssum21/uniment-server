// utils/graduationHelper.js
async function updateGraduationRequirements(userId, course) {
    const requirement = await GraduationRequirement.findOne({ userId });
    
    // 과목 유형에 따라 요건 업데이트
    switch(course.courseType.mainCategory) {
      case '전공필수':
        requirement.requirements.majorRequired.current += course.credit;
        break;
      case '전공선택':
        requirement.requirements.majorElective.current += course.credit;
        break;
      // ... 기타 케이스 처리
    }
  
    // 총 학점 업데이트
    requirement.requirements.totalCredits.current += course.credit;
    
    await requirement.save();
  }