const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
  context.log.info('Login invoked with body:', JSON.stringify(req.body));

  const { username, password } = req.body || {};
  if (!username || !password) {
    context.res = { status: 400, body: { message: 'Missing username or password' } };
    return;
  }

  try {
    const usersPath = path.join(__dirname, '../users.json');
    context.log.info('Loading users from:', usersPath);

    if (!fs.existsSync(usersPath)) {
      throw new Error('users.json not found');
    }

    const usersData = fs.readFileSync(usersPath, 'utf8');
    if (!usersData.trim()) {
      throw new Error('users.json is empty');
    }

    const users = JSON.parse(usersData);

    const user = users.find(u => u.username === username);
    if (!user) {
      context.res = { status: 401, body: { message: 'Invalid credentials' } };
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      context.res = { status: 401, body: { message: 'Invalid credentials' } };
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET missing');
    }

    const token = jwt.sign({ username, role: user.role || 'user' }, secret, { expiresIn: '4h' });

    context.res = { status: 200, body: { token, role: user.role || 'user' } };
  } catch (e) {
    context.log.error('Login error:', e.message, e.stack);
    context.res = { status: 500, body: { message: 'Server error - check logs' } };
  }
};