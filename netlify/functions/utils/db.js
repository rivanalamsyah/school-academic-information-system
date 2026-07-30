import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export function getDB() {
  return loadDB();
}
