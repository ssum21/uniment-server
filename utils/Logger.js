class Logger {
  static logInfo(message) {
    console.log(`INFO: ${message}`);
  }

  static logWarning(message) {
    console.warn(`WARNING: ${message}`);
  }

  static logError(message) {
    console.error(`ERROR: ${message}`);
  }
}

module.exports = Logger; 