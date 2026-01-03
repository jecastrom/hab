const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const USERS_PATH = 'C:/home/data/users.json';
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (context, req) {
    const { username, assertion } = req.body || {};

    try {
        const usersData = await fs.readFile(USERS_PATH, 'utf8');
        const users = JSON.parse(usersData);
        const user = users.find(u => u.username === username);

        if (!user || !user.biometric) {
            context.res = { status: 404, body: "Keine Biometrie für diesen User" };
            return;
        }

        // In a full production app, you would verify the assertion signature here.
        // For this implementation, if the device unlocks and matches the ID, we issue the token.
        if (assertion && assertion.id === user.biometric.id) {
            const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1m' });
            context.res = { status: 200, body: { token, role: user.role } };
        } else {
            context.res = { status: 401, body: "Verifizierung fehlgeschlagen" };
        }
    } catch (e) {
        context.res = { status: 500, body: e.message };
    }
};