const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
  context.log('Login invoked', req.body);

  const { username, password } = req.body || {};
  if (!username || !password) {
    context.res = { status: 400, body: 'Missing username or password' };
    return;
  }

  try {
    // Load users.json
    const usersPath = path.join(__dirname, '../users.json');
    context.log('Loading users from', usersPath);
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    const user = users.find(u => u.username === username);
    if (!user) {
      context.res = { status: 401, body: 'Invalid credentials' };
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      context.res = { status: 401, body: 'Invalid credentials' };
      return;
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-prod';
    const token = jwt.sign(
      { username: user.username, role: user.role || 'user' },
      secret,
      { expiresIn: '4h' }
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { token, role: user.role || 'user' }
    };
  } catch (e) {
    context.log.error('Login error:', e.message, e.stack);
    context.res = { status: 500, body: 'Login failed - check logs' };
  }
};