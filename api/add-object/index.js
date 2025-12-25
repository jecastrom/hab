const fetch = require('node-fetch');

module.exports = async function (context, req) {
  context.log('=== Admin API called ===');
  context.log('Request body:', req.body);

  const token = process.env.GITHUB_TOKEN;
  context.log('Token exists:', !!token); // true/false – checks if token is loaded

  if (!token) {
    context.log('ERROR: No GITHUB_TOKEN found in environment variables');
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent } = req.body || {};
  context.log('Received code:', code);
  context.log('Received name:', name);
  context.log('JSON file uploaded:', !!jsonContent);

  if (!code || !name) {
    context.log('ERROR: Missing code or name');
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  const owner = "jecastrom";  // ← Replace with exact username (case-sensitive!)
  const repo = "hab";         // ← Replace with exact repo name (case-sensitive!)
  const branch = "main";

  context.log('Target repo:', `${owner}/${repo}`);
  context.log('Branch:', branch);

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // Get current index.html
    context.log('Fetching index.html from GitHub...');
    const indexRes = await fetch(`${baseUrl}/contents/index.html?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin' }
    });

    if (!indexRes.ok) {
      const errText = await indexRes.text();
      context.log('ERROR fetching index.html:', indexRes.status, errText);
      throw new Error(`Konnte index.html nicht laden (Status: ${indexRes.status})`);
    }

    const indexData = await indexRes.json();
    context.log('Successfully loaded index.html, SHA:', indexData.sha);
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // Add to dropdown
    const optionLine = `        <option value="${code}">${name}</option>`;
    htmlContent = htmlContent.replace(
      /(<!-- Neue Objekte hier einfügen \(siehe Hinweis oben\) -->\n)/,
      `$1${' '.repeat(8)}${optionLine}\n`
    );
    context.log('Added dropdown option');

    // Add to objectFiles map
    const mapLine = `      ${code}: '${code}.json',`;
    htmlContent = htmlContent.replace(
      /(\/\/ Neue Objekte hier einfügen \(siehe Hinweis oben\)\n)/,
      `$1${' '.repeat(6)}${mapLine}\n`
    );
    context.log('Added objectFiles entry');

    // Commit updated index.html
    context.log('Committing updated index.html...');
    await commitFile('index.html', htmlContent, indexData.sha, token, owner, repo, branch);

    // Optional: Create JSON file if uploaded
    if (jsonContent) {
      context.log('Committing new JSON file:', `${code}.json`);
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(`${code}.json`, jsonDecoded, null, token, owner, repo, branch);
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei).` };
    }

    context.log('=== Success! ===');
  } catch (e) {
    context.log('CRITICAL ERROR:', e.message);
    context.log('Stack:', e.stack);
    context.res = { status: 500, body: `Fehler: ${e.message}` };
  }
};

async function commitFile(path, content, sha, token, owner, repo, branch) {
  context.log(`Committing file: ${path}`);
  const body = {
    message: `Admin: Neues Objekt "${path}" hinzufügen`,
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
    context.log('Commit failed:', res.status, err);
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }
  context.log(`Successfully committed ${path}`);
}
