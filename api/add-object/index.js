const fs = require('fs').promises;

module.exports = async function (context, req) {
    const rawCode = req.body && req.body.code ? req.body.code : "";
    
    // Sanitize: remove non-alphanumeric and create keys
    const displayCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const idCode = displayCode.toLowerCase();

    if (!displayCode) {
        context.res = {
            status: 400,
            body: "Invalid code. Please provide an alphanumeric value."
        };
        return;
    }

    const dataPath = 'C:/home/data/objects.json';

    try {
        const data = await fs.readFile(dataPath, 'utf8');
        let objects = JSON.parse(data);

        // Check for duplicates
        if (objects.some(obj => obj.id === idCode)) {
            context.res = {
                status: 409,
                body: "Object already exists."
            };
            return;
        }

        // Add new entry
        objects.push({ id: idCode, display: displayCode });

        // Save file
        await fs.writeFile(dataPath, JSON.stringify(objects, null, 2), 'utf8');

        context.res = {
            status: 200,
            body: { message: "Object added successfully", id: idCode, display: displayCode }
        };
    } catch (error) {
        context.log.error("Error updating objects.json:", error);
        context.res = {
            status: 500,
            body: "Error writing to data file."
        };
    }
};