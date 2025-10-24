const fs = require('fs');
const logFile = 'access.log';

function logAccess(ip, path, code) {
  const line = `[${new Date().toISOString()}] ${ip} ${path} ${code}\n`;
  fs.appendFile(logFile, line, () => {});
}

function logError(msg) {
  const line = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
  fs.appendFile(logFile, line, () => {});
}

module.exports = {
  logAccess,
  logError,
};
