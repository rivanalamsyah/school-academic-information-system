const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'src', 'db', 'data.json');

let cached = null;
let lastMtime = 0;

function loadDB() {
  try {
    const stat = fs.statSync(DB_PATH);
    const mtime = stat.mtimeMs;
    if (cached && lastMtime === mtime) {
      return cached;
    }
  } catch (err) {
    // ignore
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  cached = JSON.parse(raw);
  try {
    lastMtime = fs.statSync(DB_PATH).mtimeMs;
  } catch (e) {
    lastMtime = Date.now();
  }
  return cached;
}

module.exports = {
  getDB: loadDB,
};
