const fs = require('fs').promises;
const path = require('path');

module.exports = async function (context, req) {
    // Standardize ID from body
    const idToDelete = req.body && req.body.id ? req.body.id.toLowerCase() : "";

    if (!idToDelete) {
        context.res = { status: 400, body: "Please provide the 'id' of the object to delete." };
        return;
    }

    const directoryPath = 'C:/home/data/';
    const listPath = path.join(directoryPath, 'objects.json');
    const objectFilePath = path.join(directoryPath, `${idToDelete}.json`);

    try {
        // 1. Update the objects.json list
        const data = await fs.readFile(listPath, 'utf8');
        let objects = JSON.parse(data);
        const originalLength = objects.length;
        objects = objects.filter(obj => obj.id !== idToDelete);

        if (objects.length === originalLength) {
            context.res = { status: 404, body: "Object not found in list." };
            return;
        }

        await fs.writeFile(listPath, JSON.stringify(objects, null, 2), 'utf8');

        // 2. Delete the associated data file if it exists
        try {
            await fs.unlink(objectFilePath);
            context.log(`Deleted file: ${objectFilePath}`);
        } catch (err) {
            context.log.warn(`File ${idToDelete}.json not found, but removed from list.`);
        }

        context.res = {
            status: 200,
            body: { message: `Successfully deleted '${idToDelete}' and its data file.` }
        };
    } catch (error) {
        context.res = { status: 500, body: "Server error: " + error.message };
    }
};