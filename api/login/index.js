const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-here';  // Set in Azure

module.exports = async function (context, req) {
  context.log.info('Login function invoked');

  const { username, password } = req.body || {};
  if (!username || !password) {
    context.res = { status: 400, body: 'Missing username or password' };
    return;
  }

  try {
    const usersPath = path.join(__dirname, '../users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      context.res = { status: 401, body: 'Invalid username or password' };
      return;
    }

    const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '4h' });

    context.res = { status: 200, body: { token } };
  } catch (e) {
    context.log.error(`Login error: ${e.message}`);
    context.res = { status: 500, body: 'Server error' };
  }
};

// In JWT sign:
jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '4h' });