module.exports = async function (context, req) {
  context.log('=== Admin API called ===');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent } = req.body || {};
  if (!code || !name) {
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  const owner = "jecastrom";
  const repo = "hab";
  const branch = "main";

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const indexRes = await fetch(`${baseUrl}/contents/index.html?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'swa-admin',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!indexRes.ok) throw new Error(`index.html laden fehlgeschlagen (${indexRes.status})`);

    const indexData = await indexRes.json();
    let lines = Buffer.from(indexData.content, 'base64').toString('utf8').split('\n');

    // 1. Find the line with <select id="object">
    let objectSelectStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().includes('<select id="object"')) {
        objectSelectStart = i;
        break;
      }
    }
    if (objectSelectStart === -1) throw new Error('Objekt-Select (id="object") nicht gefunden');

    // Find the next </select> after that line
    let objectSelectEnd = -1;
    for (let i = objectSelectStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === '</select>') {
        objectSelectEnd = i;
        break;
      }
    }
    if (objectSelectEnd === -1) throw new Error('Schließendes </select> für Objekt-Select nicht gefunden');

    // Insert the new option just before </select>
    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // 2. objectFiles block
    let objectFilesClose = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '}') {
        // Check if previous line has one of the existing objects or the comment
        if (lines[i-1]?.trim().match(/(hab|keh|kwf|\/\/ Neue Objekte)/)) {
          objectFilesClose = i;
          break;
        }
      }
    }
    if (objectFilesClose === -1) throw new Error('objectFiles-Block nicht gefunden');

    lines.splice(objectFilesClose, 0, `      ${code}: '${code}.json',`);

    const updatedHtml = lines.join('\n');

    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
        await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
        context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
      } catch (jsonErr) {
        context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (JSON-Datei fehlgeschlagen – bitte manuell hochladen).` };
      }
    } else {
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt (ohne JSON-Datei).` };
    }
  } catch (e) {
    context.res = { status: 500, body: `Fehler: ${e.message}` };
  }
};

async function commitFile(context, path, content, sha, token, owner, repo, branch) {
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
}
