module.exports = async function (context, req) {
  context.log('=== Admin API called ===');
  context.log('Request body:', req.body || 'no body');

  const token = process.env.GITHUB_TOKEN;
  context.log('Token loaded:', !!token);

  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent } = req.body || {};
  context.log('Code:', code, 'Name:', name, 'JSON present:', !!jsonContent);

  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  const owner = "jecastrom";
  const repo = "hab";
  const branch = "main";

  try {
    context.log('Fetching index.html...');
    const indexRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'swa-admin',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!indexRes.ok) {
      const errText = await indexRes.text();
      throw new Error(`index.html laden fehlgeschlagen (Status ${indexRes.status}): ${errText || 'Keine Details'}`);
    }

    const indexData = await indexRes.json();
    let lines = Buffer.from(indexData.content, 'base64').toString('utf8').split('\n');

    // Dropdown insert
    let objectSelectStart = lines.findIndex(line => line.trim().includes('<select id="object"'));
    if (objectSelectStart === -1) throw new Error('Objekt-Select nicht gefunden (suche nach id="object")');

    let objectSelectEnd = lines.slice(objectSelectStart).findIndex(line => line.trim() === '</select>') + objectSelectStart;
    if (objectSelectEnd === -1) throw new Error('Schließendes </select> nicht gefunden');

    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // objectFiles insert
    let objectFilesStart = lines.findIndex(line => line.trim().startsWith('const objectFiles = {'));
    if (objectFilesStart === -1) throw new Error('const objectFiles = { nicht gefunden');

    let objectFilesEnd = lines.slice(objectFilesStart).findIndex(line => line.trim() === '}') + objectFilesStart;
    if (objectFilesEnd === -1) throw new Error('Schließende } für objectFiles nicht gefunden');

    lines.splice(objectFilesEnd, 0, `      ${code}: '${code}.json',`);

    const updatedHtml = lines.join('\n');
    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
        await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
        context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
      } catch (jsonErr) {
        context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (JSON-Datei fehlgeschlagen: ${jsonErr.message || 'Unbekannt'}).` };
      }
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei).` };
    }
  } catch (e) {
    const msg = e.message || 'Unbekannter Fehler (keine Nachricht)';
    context.log('Caught error:', msg, e);
    context.res = { status: 500, body: `Fehler: ${msg}` };
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
    const errMsg = err.message || 'Unbekannter Commit-Fehler';
    context.log('Commit failed:', res.status, err);
    throw new Error(errMsg);
  }
  context.log(`${path} committed`);
}
