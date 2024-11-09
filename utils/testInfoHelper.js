// utils/testInfoHelper.js
// 테스트 정보를 조회하는 함수를 구현합니다.

// 테스트 정보를 조회하는 함수
// testName: 테스트 이름
// score: 점수
// return: 테스트 정보 객체

async function getTestInfo(testName, score) {
    // 테스트 정보 데이터베이스
    const testData = {
      'TOEIC': {
        averageScore: 688,
        targetCompanies: ['삼성전자', 'LG전자', 'SK하이닉스'],
        recommendedScore: 800
      },
      'OPIC': {
        averageScore: 'IM2',
        targetCompanies: ['현대자동차', '기아자동차'],
        recommendedScore: 'IH'
      }
      // ... 다른 시험 정보
    };
  
    return testData[testName] || null;
}

module.exports = getTestInfo;
// 이제 포트폴리오 추가 API를 호출하면 어학성적인 경우 테스트 정보를 함께 저장할 수 있습니다.
