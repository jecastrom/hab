module.exports = async function (context, req) {
  context.log('=== Admin API called ===');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent, uploadOnly } = req.body || {};
  if (uploadOnly) {
    if (!code || !jsonContent) {
      context.res = { status: 400, body: "Fehler: Code und JSON-Datei sind erforderlich für Upload-only" };
      return;
    }

    try {
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(context, `${code}.json`, jsonDecoded, null, token, "jecastrom", "hab", "main");
      context.res = { status: 200, body: `Erfolg! JSON-Datei für Objekt "${code}" hochgeladen.` };
    } catch (e) {
      context.res = { status: 500, body: `Fehler beim Upload: ${e.message}` };
    }
    return;
  }

  // Normal add mode
  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  // Your existing add logic here... (keep the rest as is)
}
