module.exports = async function (context, req) {
  context.log('=== Admin API called ===');
  context.log('Request body:', req.body);

  const token = process.env.GITHUB_TOKEN;
  context.log('Token exists:', !!token);

  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent } = req.body || {};
  context.log('Received code:', code);
  context.log('Received name:', name);
  context.log('JSON uploaded:', !!jsonContent);

  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  const owner = "jecastrom";  // Replace with exact (case-sensitive)
  const repo = "hab";         // Replace with exact (case-sensitive)
  const branch = "main";

  context.log('Target repo:', `${owner}/${repo}@${branch}`);

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    context.log('Fetching index.html...');
    const indexRes = await fetch(`${baseUrl}/contents/index.html?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'swa-admin',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!indexRes.ok) {
      const errText = await indexRes.text();
      context.log('Fetch failed:', indexRes.status, errText);
      throw new Error(`index.html laden fehlgeschlagen (${indexRes.status}): ${errText}`);
    }

    const indexData = await indexRes.json();
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // Add to dropdown
    const optionLine = `        <option value="${code}">${name}</option>`;
    htmlContent = htmlContent.replace(
      /(<!-- Neue Objekte hier einfügen \(siehe Hinweis oben\) -->\n)/,
      `$1${' '.repeat(8)}${optionLine}\n`
    );
    context.log('Added dropdown option');

    // Add to objectFiles
    const mapLine = `      ${code}: '${code}.json',`;
    htmlContent = htmlContent.replace(
      /(\/\/ Neue Objekte hier einfügen \(siehe Hinweis oben\)\n)/,
      `$1${' '.repeat(6)}${mapLine}\n`
    );
    context.log('Added objectFiles entry');

    // Commit updated index.html
    context.log('Committing index.html...');
    await commitFile('index.html', htmlContent, indexData.sha, token, owner, repo, branch);
    context.log('index.html committed');

    // Optional JSON file
    if (jsonContent) {
      context.log('Committing JSON file...');
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(`${code}.json`, jsonDecoded, null, token, owner, repo, branch);
      context.log('JSON committed');
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei).` };
    }

    context.log('=== Success ===');
  } catch (e) {
    context.log('ERROR:', e.message, e.stack);
    context.res = { status: 500, body: `Fehler: ${e.message || 'Unbekannter Fehler'} (Details: ${e.stack || 'Keine Details'})` };
  }
};

async function commitFile(path, content, sha, token, owner, repo, branch) {
  context.log(`Preparing commit for ${path}`);
  const body = {
    message: `Admin: Neues Objekt ${path} hinzufügen`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  context.log('Sending commit request');
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
    context.log('Commit failed:', res.status, err);
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }

  context.log(`${path} committed successfully`);
}
