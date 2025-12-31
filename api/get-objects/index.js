const fs = require('fs').promises;
const path = require('path');

module.exports = async function (context, req) {
    const dataPath = 'C:/home/data/objects.json';

    try {
        const data = await fs.readFile(dataPath, 'utf8');
        context.res = {
            status: 200,
            body: JSON.parse(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log.error("Error reading objects.json:", error);
        context.res = {
            status: 500,
            body: "Could not read data file."
        };
    }
};