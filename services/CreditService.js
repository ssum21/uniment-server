class CreditService {
  constructor() {
    this.Credit = require('../models/Credit');
    this.User = require('../models/User');
  }

  async getUserCredits(userId) {
    return await this.Credit.find({ userId });
  }

  async updateCredits(userId, course, action = 'add') {
    // updateCredits 함수의 로직을 여기로 이동
  }
}

module.exports = new CreditService();