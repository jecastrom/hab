const { create } = require('@github/webauthn-json');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (req.method === 'GET') {
      context.res = { body: { challenge: Buffer.from(crypto.randomBytes(32)).toString('base64') } }; // Generate challenge
    } else if (req.method === 'POST') {
      const { attestation } = req.body;
      const verified = await create({ publicKey: attestation });
      if (verified) {
        const users = JSON.parse(await fs.readFile('users.json', 'utf8'));
        const user = users.find(u => u.username === decoded.username);
        user.publicKey = verified.publicKey;
        await fs.writeFile('users.json', JSON.stringify(users));
        context.res = { body: 'Biometric registered' };
      } else {
        context.res = { status: 400, body: 'Registration failed' };
      }
    }
  } catch (e) {
    context.res = { status: 401, body: 'Unauthorized' };
  }
};
