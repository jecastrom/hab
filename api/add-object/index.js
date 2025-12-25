const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent } = req.body || {};
  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  const owner = "jecastrom"; // ← Ersetze das!
  const repo = "hab";         // ← Ersetze das!
  const branch = "main";

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Get current index.html
    const indexRes = await fetch(`${baseUrl}/contents/index.html?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin' }
    });
    if (!indexRes.ok) throw new Error('Konnte index.html nicht laden');
    const indexData = await indexRes.json();
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // Add to dropdown (HTML)
    const optionLine = `        <option value="${code}">${name}</option>`;
    htmlContent = htmlContent.replace(
      /(<!-- Neue Objekte hier einfügen \(siehe Hinweis oben\) -->\n)/,
      `$1${' '.repeat(8)}${optionLine}\n`
    );

    // Add to objectFiles (JS)
    const mapLine = `      ${code}: '${code}.json',`;
    htmlContent = htmlContent.replace(
      /(\/\/ Neue Objekte hier einfügen \(siehe Hinweis oben\)\n)/,
      `$1${' '.repeat(6)}${mapLine}\n`
    );

    // 2. Commit updated index.html
    await commitFile('index.html', htmlContent, indexData.sha, token, owner, repo, branch);

    // 3. Only if jsonContent provided → create the JSON file
    if (jsonContent) {
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(`${code}.json`, jsonDecoded, null, token, owner, repo, branch);
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei. Seite wird in Kürze aktualisiert.` };
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei). Du kannst die Datei später hochladen.` };
    }
  } catch (e) {
    context.res = { status: 500, body: `Fehler: ${e.message}` };
    context.log('Error:', e);
  }
};

async function commitFile(path, content, sha, token, owner, repo, branch) {
  const body = {
    message: `Admin: Neues Objekt ${path} hinzufügen`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }
}
