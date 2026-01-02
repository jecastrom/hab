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

        if (req.method === 'POST') {
            const { credential } = req.body;
            const usersData = await fs.readFile(USERS_PATH, 'utf8');
            const users = JSON.parse(usersData);
            const userIndex = users.findIndex(u => u.username === decoded.username);

            if (userIndex !== -1) {
                // Save the biometric credential to the user object
                users[userIndex].biometric = credential;
                await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
                context.res = { status: 200, body: "Biometrie registriert" };
            } else {
                context.res = { status: 404, body: "Benutzer nicht gefunden" };
            }
        }
    } catch (e) {
        context.res = { status: 401, body: "Fehler: " + e.message };
    }
};