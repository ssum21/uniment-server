// tests/api.test.js
const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  test('학교 정보 등록', async () => {
    const response = await request(app)
      .post('/api/users/school-info')
      .send({
        name: "테스트대학교",
        major: "컴퓨터공학",
        admissionYear: 2024
      });
    expect(response.status).toBe(201);
  });
});