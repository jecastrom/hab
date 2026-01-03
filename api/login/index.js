const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
    const { username, password } = req.body || {};
    const USERS_PATH = 'C:/home/data/users.json';
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-use-env-variable';

    try {
        const usersData = await fs.readFile(USERS_PATH, 'utf8');
        const users = JSON.parse(usersData);
        const user = users.find(u => u.username === username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            context.res = { status: 401, body: "Ungültige Anmeldedaten" };
            return;
        }

        // Generate token with 8h expiry
        const token = jwt.sign(
            { username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1m' }
        );

        context.res = {
            status: 200,
            body: { token, role: user.role, username: user.username }
        };
    } catch (err) {
        context.res = { status: 500, body: "Serverfehler beim Login" };
    }
};