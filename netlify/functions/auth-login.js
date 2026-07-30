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

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return jsonResponse(false, 'Method Not Allowed', 405);
    }

    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (err) {
      return jsonResponse(false, 'Invalid JSON body', 400);
    }

    const { username, password } = body;
    if (!username || !password) {
      return jsonResponse(false, 'Username dan password harus diisi.', 400);
    }

    const db = getDB();
    const user = db.users.find((u) => u.username === username);
    if (!user) return jsonResponse(false, 'Username atau password salah.', 401);
    if (!user.active) return jsonResponse(false, 'Akun Anda dinonaktifkan.', 403);

    // Plaintext password check for demo purposes only
    if (user.password !== password) return jsonResponse(false, 'Username atau password salah.', 401);

    // Return public user fields only
    const publicUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: user.avatar || '/default-avatar.png',
    };

    return jsonResponse(true, { user: publicUser }, 200);
  } catch (err) {
    console.error('auth-login error', err && err.message);
    return jsonResponse(false, 'Terjadi kesalahan pada server.', 500);
  }
}
