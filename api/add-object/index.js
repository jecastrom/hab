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

  const owner = "jecastrom";  // ← Already correct!
  const repo = "hab";         // ← Already correct!
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
      throw new Error(`index.html laden fehlgeschlagen (${indexRes.status})`);
    }

    const indexData = await indexRes.json();
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // More flexible replace for dropdown (ignores extra spaces/tabs)
    const dropdownMarker = '<!-- Neue Objekte hier einfügen (siehe Hinweis oben) -->';
    if (!htmlContent.includes(dropdownMarker)) {
      throw new Error('Dropdown-Marker nicht gefunden in index.html');
    }
    const optionLine = `        <option value="${code}">${name}</option>`;
    htmlContent = htmlContent.replace(
      new RegExp(`(${dropdownMarker}\\s*\\n)`),
      `$1        ${optionLine}\n`
    );
    context.log('Dropdown option added');

    // More flexible replace for objectFiles
    const mapMarker = '// Neue Objekte hier einfügen (siehe Hinweis oben)';
    if (!htmlContent.includes(mapMarker)) {
      throw new Error('objectFiles-Marker nicht gefunden in index.html');
    }
    const mapLine = `      ${code}: '${code}.json',`;
    htmlContent = htmlContent.replace(
      new RegExp(`(${mapMarker}\\s*\\n)`),
      `$1      ${mapLine}\n`
    );
    context.log('objectFiles entry added');

    // Commit updated index.html
    context.log('Committing updated index.html...');
    await commitFile(context, 'index.html', htmlContent, indexData.sha, token, owner, repo, branch);

    // Optional JSON file
    if (jsonContent) {
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei).` };
    }

    context.log('=== All done successfully ===');
  } catch (e) {
    context.log('ERROR:', e.message);
    context.res = { status: 500, body: `Fehler: ${e.message}` };
  }
};

async function commitFile(context, path, content, sha, token, owner, repo, branch) {
  context.log(`Committing ${path}...`);
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
    context.log('Commit failed:', err);
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }
  context.log(`${path} committed`);
}
