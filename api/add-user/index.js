const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const USERS_PATH = 'C:/home/data/users.json';
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (context, req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { context.res = { status: 401, body: "Nicht autorisiert" }; return; }

    try {
        // 1. Verify that the requester is an ADMIN
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            context.res = { status: 403, body: "Nur Admins können Benutzer erstellen" };
            return;
        }

        const { newUsername, newPassword, newRole } = req.body;
        if (!newUsername || !newPassword || !newRole) {
            context.res = { status: 400, body: "Daten unvollständig" };
            return;
        }

        // 2. Read existing users
        const data = await fs.readFile(USERS_PATH, 'utf8');
        const users = JSON.parse(data);

        // 3. Check if user already exists
        if (users.find(u => u.username === newUsername.toLowerCase())) {
            context.res = { status: 409, body: "Benutzer existiert bereits" };
            return;
        }

        // 4. Hash password and add user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users.push({
            username: newUsername.toLowerCase(),
            password: hashedPassword,
            role: newRole // 'admin' or 'standard'
        });

        // 5. Save back to data folder
        await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));

        context.res = { status: 200, body: "Benutzer erfolgreich erstellt" };
    } catch (e) {
        context.res = { status: 500, body: "Fehler: " + e.message };
    }
};