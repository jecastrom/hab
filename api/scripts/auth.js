// api/scripts/auth.js
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-here';  // Set in Azure App Settings > Configuration

// Load users.json securely (from root)
function loadUsers() {
  try {
    const usersPath = path.join(__dirname, '../users.json');  // Relative to scripts/
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (e) {
    console.error('Error loading users.json:', e.message);
    return [];
  }
}

// Verify JWT token and optional role
function verifyToken(req, res, requiredRole = null) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res = { status: 401, body: 'Missing or invalid Authorization header' };
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (requiredRole && decoded.role !== requiredRole) {
      res = { status: 403, body: 'Insufficient permissions' };
      return false;
    }
    return true;  // Valid token and role
  } catch (e) {
    res = { status: 401, body: `Token error: ${e.message}` };
    return false;
  }
}

module.exports = { verifyToken, loadUsers };  // Export for reuse