const fs = require('fs').promises;
const path = require('path');

module.exports = async function (context, req) {
    const id = req.query.id;

    if (!id) {
        context.res = { status: 400, body: "ID missing in query." };
        return;
    }

    const filePath = path.join('C:/home/data', `${id.toLowerCase()}.json`);

    try {
        const content = await fs.readFile(filePath, 'utf8');
        context.res = {
            status: 200,
            body: JSON.parse(content),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.res = {
            status: 404,
            body: "Data file not found."
        };
    }
};