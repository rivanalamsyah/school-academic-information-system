const fs = require('fs');
const path = require('path');

// Resolve path relative to repository root when Netlify builds the function bundle.
const DB_PATH = path.resolve(__dirname, '../../../src/db/data.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read DB file at', DB_PATH, err);
    // Return minimal structure to avoid crashes in functions
    return {
      settings: {},
      news: [],
      gallery: [],
      documents: [],
      teachers: [],
      users: [],
    };
  }
}

module.exports = { readDB };
