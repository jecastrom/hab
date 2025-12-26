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
      let sha = null;
      const fileRes = await fetch(`https://api.github.com/repos/jecastrom/hab/contents/${code}.json?ref=main`, {
        headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin' }
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        sha = fileData.sha;  // Get SHA for update
      }
      await commitFile(context, `${code}.json`, jsonDecoded, sha, token, "jecastrom", "hab", "main");
      context.res = { status: 200, body: `Erfolg! JSON-Datei für Objekt "${code}" hochgeladen.` };
    } catch (e) {
      context.res = { status: 500, body: `Fehler beim Upload: ${e.message || 'Unbekannt'}` };
    }
    return;
  }

  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  // Rest of the normal add mode code (keep as is)
  // ... (the full add logic from your current file)
};

async function commitFile(context, path, content, sha, token, owner, repo, branch) {
  context.log('Committing ' + path);
  const body = {
    message: `Admin: Neues Objekt "${path}" hinzufügen`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'swa-admin',
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }
  context.log(path + ' committed successfully');
}
