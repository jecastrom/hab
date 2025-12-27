const { get } = require('@github/webauthn-json');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = async function (context, req) {
  try {
    if (req.method === 'GET') {
      // Generate challenge for client
      const challenge = crypto.randomBytes(32).toString('base64');
      context.res = { body: { challenge } };
    } else if (req.method === 'POST') {
      const { assertion } = req.body; // From client get()
      const options = {
        publicKey: assertion,
        // Load expected from users.json (based on prior registration)
        // For simplicity, assume username from query or prior token; adjust as needed
        // Example: Fetch user publicKey by username if provided
        username = req.body.username; // Pass username with assertion
        const users = JSON.parse(await fs.readFile('users.json', 'utf8'));
        const user = users.find(u => u.username === username);
        if (!user || !user.publicKey) throw new Error('No biometric registered');
        options.expected = user.publicKey; // Stored during registration
      };
      const verified = await get(options);
      if (verified) {
        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        context.res = { body: { token } };
      } else {
        context.res = { status: 401, body: 'Authentication failed' };
      }
    } else {
      context.res = { status: 405, body: 'Method not allowed' };
    }
  } catch (e) {
    context.res = { status: 500, body: 'Error: ' + e.message };
  }
};
