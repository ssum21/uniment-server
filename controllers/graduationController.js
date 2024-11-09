// controllers/graduationController.js
const GraduationRequirement = require('../models/GraduationRequirement');

exports.getGraduationStatus = async (req, res) => {
  try {
    // 졸업 요건 데이터 조회
    const requirements = await GraduationRequirement.findOne({
      userId: req.query.userId  // 실제로는 인증된 사용자 ID 사용
    });

    if (!requirements) {
      return res.status(404).json({
        message: "졸업 요건 정보를 찾을 수 없습니다."
      });
    }

    // 졸업 상태 계산
    const status = calculateGraduationStatus(requirements);
    res.json(status);

  } catch (error) {
    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
      error: error.message
    });
  }
};

function calculateGraduationStatus(requirements) {
  const { total, major, general } = requirements.requirements;
  
  return {
    totalCredits: {
      required: total.required,
      current: total.current,
      remaining: total.required - total.current
    },
    majorCredits: {
      required: major.required,
      current: major.current,
      remaining: major.required - major.current
    },
    generalCredits: {
      required: general.required,
      current: general.current,
      remaining: general.required - general.current
    },
    status: {
      overall: calculateOverallStatus(total.current, total.required),
      percentage: (total.current / total.required) * 100
    }
  };
}