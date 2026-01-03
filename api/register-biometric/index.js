const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const USERS_PATH = 'C:/home/data/users.json';
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (context, req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { context.res = { status: 401, body: "Kein Token" }; return; }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const usersData = await fs.readFile(USERS_PATH, 'utf8');
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(u => u.username === decoded.username);

        if (userIndex === -1) {
            context.res = { status: 404, body: "User nicht gefunden" };
            return;
        }

        // Handle both Registration (credential) and Deactivation (action: delete)
        if (req.method === 'POST') {
            if (req.body.action === 'delete') {
                delete users[userIndex].biometric;
                await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
                context.res = { status: 200, body: "Biometrie entfernt" };
            } else if (req.body.credential) {
                users[userIndex].biometric = req.body.credential;
                await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
                context.res = { status: 200, body: "Biometrie registriert" };
            }
        }
    } catch (e) {
        context.res = { status: 500, body: "Fehler: " + e.message };
    }
};