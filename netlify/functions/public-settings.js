import { getDB } from './utils/db.js';

function jsonResponse(success, dataOrMessage, status = 200) {
  if (success) {
    return {
      statusCode: status,
      body: JSON.stringify({ success: true, data: dataOrMessage }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  return {
    statusCode: status,
    body: JSON.stringify({ success: false, message: dataOrMessage }),
    headers: { 'Content-Type': 'application/json' },
  };
}

export async function handler() {
  try {
    const db = getDB();
    return jsonResponse(true, db.settings || {});
  } catch (err) {
    console.error('public-settings error', err && err.message);
    return jsonResponse(false, 'Terjadi kesalahan pada server.', 500);
  }
}
