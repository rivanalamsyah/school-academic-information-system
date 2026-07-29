const { getDB } = require('./utils/db');

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

exports.handler = async () => {
  try {
    const db = getDB();
    return jsonResponse(true, db.documents || []);
  } catch (err) {
    console.error('public-documents error', err && err.message);
    return jsonResponse(false, 'Terjadi kesalahan pada server.', 500);
  }
};
