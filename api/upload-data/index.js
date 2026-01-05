const fs = require('fs').promises;
const path = require('path');

module.exports = async function (context, req) {
    const id = req.body.id;
    const data = req.body.data;
    const override = req.body.override || false;

    if (!id || !data) {
        context.res = { status: 400, body: "ID or Data missing." };
        return;
    }

    const filePath = path.join('C:/home/data', `${id.toLowerCase()}.json`);

    try {
        // Check if file exists to handle the override logic
        let fileExists = false;
        try {
            await fs.access(filePath);
            fileExists = true;
        } catch (e) {
            fileExists = false;
        }

        if (fileExists && !override) {
            context.res = { 
                status: 409, 
                body: "File already exists." 
            };
            return;
        }

        // Save the processed JSON.TEST. Test more
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

        context.res = {
            status: 200,
            body: { message: `File ${id}.json saved successfully.` }
        };
    } catch (error) {
        context.res = { status: 500, body: error.message };
    }
};