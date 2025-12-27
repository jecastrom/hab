const { create } = require('@github/webauthn-json');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = async function (context, req) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (req.method === 'GET') {
      // Generate challenge for client
      const challenge = crypto.randomBytes(32).toString('base64');
      context.res = { body: { challenge } };
    } else if (req.method === 'POST') {
      const { publicKeyCredential } = req.body; // From client create()
      const options = {
        publicKey: publicKeyCredential,
        // Validate origin, challenge, etc. (add your app's RP ID)
        rpName: 'YourApp',
        userVerification: 'preferred'
      };
      const verified = await create(options);
      if (verified) {
        const users = JSON.parse(await fs.readFile('users.json', 'utf8'));
        const user = users.find(u => u.username === decoded.username);
        if (user) {
          user.publicKey = verified; // Store the full verified credential (public key + metadata)
          await fs.writeFile('users.json', JSON.stringify(users));
          context.res = { body: 'Biometric registered successfully' };
        } else {
          context.res = { status: 404, body: 'User not found' };
        }
      } else {
        context.res = { status: 400, body: 'Registration failed' };
      }
    } else {
      context.res = { status: 405, body: 'Method not allowed' };
    }
  } catch (e) {
    context.res = { status: 401, body: 'Unauthorized or error: ' + e.message };
  }
};
