const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;

module.exports = async function (context, req) {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(await fs.readFile('users.json', 'utf8'));
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.hashedPassword)) {
      const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
      context.res = { body: { token } };
    } else {
      context.res = { status: 401, body: 'Unauthorized' };
    }
  } catch (e) {
    context.res = { status: 500, body: 'Server error' };
  }
};
