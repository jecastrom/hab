const fs = require('fs').promises;

module.exports = async function (context, req) {
    const idToDelete = req.body && req.body.id ? req.body.id.toLowerCase() : "";

    if (!idToDelete) {
        context.res = {
            status: 400,
            body: "Please provide the 'id' of the object to delete."
        };
        return;
    }

    const dataPath = 'C:/home/data/objects.json';

    try {
        const data = await fs.readFile(dataPath, 'utf8');
        let objects = JSON.parse(data);

        const originalLength = objects.length;
        // Filter out the object with the matching id
        objects = objects.filter(obj => obj.id !== idToDelete);

        if (objects.length === originalLength) {
            context.res = {
                status: 404,
                body: "Object not found."
            };
            return;
        }

        // Save the updated list
        await fs.writeFile(dataPath, JSON.stringify(objects, null, 2), 'utf8');

        context.res = {
            status: 200,
            body: { message: `Object '${idToDelete}' deleted successfully.` }
        };
    } catch (error) {
        context.log.error("Error updating objects.json:", error);
        context.res = {
            status: 500,
            body: "Error writing to data file."
        };
    }
};