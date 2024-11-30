const mongoose = require('mongoose');
require('dotenv').config();

// GraduationRequirement 모델 스키마 정의
const graduationRequirementSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  admissionYearRange: {
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  },
  totalCredits: {
    type: Number,
    default: 130
  },
  majorRequirements: {
    basic: { type: Number, default: 18 },
    required: { type: Number, default: 9 },
    elective: { type: Number, default: 52 }
  },
  generalRequirements: {
    required: { type: Number, default: 17 },
    distributed: { type: Number, default: 12 },
    free: { type: Number, default: 3 }
  }
});

// 복합 유니크 인덱스 추가
graduationRequirementSchema.index({
  university: 1,
  major: 1,
  'admissionYearRange.start': 1,
  'admissionYearRange.end': 1
}, { unique: true });

const GraduationRequirement = mongoose.model('GraduationRequirement', graduationRequirementSchema);


const requirements = [
    {
      university: '경희대학교',
      major: '컴퓨터공학과',
      admissionYearRange: {
        start: 2021,
        end: 2023
      },
      totalCredits: 140,
      majorRequirements: {
        basic: 18,
        required: 21,
        elective: 55
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '컴퓨터공학과',
      admissionYearRange: {
        start: 2024,
        end: 2099
      },
      totalCredits: 130,
      majorRequirements: {
        basic: 18,
        required: 21,
        elective: 45
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '소프트웨어융합학과',
      admissionYearRange: {
        start: 2021,
        end: 2023
      },
      totalCredits: 140,
      majorRequirements: {
        basic: 15,
        required: 24,
        elective: 55
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '소프트웨어융합학과',
      admissionYearRange: {
        start: 2024,
        end: 2099
      },
      totalCredits: 130,
      majorRequirements: {
        basic: 15,
        required: 24,
        elective: 45
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '전자공학과',
      admissionYearRange: {
        start: 2021,
        end: 2023
      },
      totalCredits: 140,
      majorRequirements: {
        basic: 21,
        required: 24,
        elective: 49
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '전자공학과',
      admissionYearRange: {
        start: 2024,
        end: 2099
      },
      totalCredits: 130,
      majorRequirements: {
        basic: 21,
        required: 24,
        elective: 39
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '기계공학과',
      admissionYearRange: {
        start: 2021,
        end: 2023
      },
      totalCredits: 140,
      majorRequirements: {
        basic: 24,
        required: 21,
        elective: 49
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    },
    {
      university: '경희대학교',
      major: '기계공학과',
      admissionYearRange: {
        start: 2024,
        end: 2099
      },
      totalCredits: 130,
      majorRequirements: {
        basic: 24,
        required: 21,
        elective: 39
      },
      generalRequirements: {
        required: 19,
        distributed: 18,
        free: 9
      }
    }
  ]; 

async function seedGraduationRequirements() {
  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGODB_URI, {
      // deprecated 옵션 제거
    });
    console.log('MongoDB 연결 성공');

    // 컬렉션이 존재하는지 확인
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'graduationrequirements');
    
    if (collectionExists) {
      // 컬렉션 자체를 삭제 (인덱스도 함께 삭제됨)
      await mongoose.connection.db.dropCollection('graduationrequirements');
      console.log('기존 컬렉션 삭제 완료');
    }

    // 새 데이터 입력
    const result = await GraduationRequirement.insertMany(requirements);
    console.log(`${result.length}개의 졸업요건 데이터가 성공적으로 등록되었습니다.`);

    // 데이터 확인
    const count = await GraduationRequirement.countDocuments();
    console.log(`현재 데이터베이스에 ${count}개의 졸업요건이 있습니다.`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB 연결 종료');
    }
  }
}

// 스크립트 실행
seedGraduationRequirements().then(() => {
  console.log('졸업요건 데이터 시딩이 완료되었습니다.');
  process.exit(0);
}).catch(error => {
  console.error('스크립트 실행 중 오류 발생:', error);
  process.exit(1);
});
