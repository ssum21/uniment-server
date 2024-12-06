class Utility {
  static generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

module.exports = Utility; 