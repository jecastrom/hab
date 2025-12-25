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

  let jsonSuccess = false;

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

    // Add to object dropdown
    let objectSelectEnd = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '</select>' && lines[i-3]?.trim().includes('id="object"')) {
        objectSelectEnd = i;
        break;
      }
    }
    if (objectSelectEnd === -1) throw new Error('Objekt-Select nicht gefunden');
    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // Add to objectFiles
    let objectFilesClose = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '}') {
        if (lines[i-1]?.trim().match(/(hab|keh|kwf|Neue Objekte)/)) {
          objectFilesClose = i;
          break;
        }
      }
    }
    if (objectFilesClose === -1) throw new Error('objectFiles-Block nicht gefunden');
    lines.splice(objectFilesClose, 0, `      ${code}: '${code}.json',`);

    const updatedHtml = lines.join('\n');
    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    // Try to upload JSON file (optional)
    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
        await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
        jsonSuccess = true;
      } catch (jsonErr) {
        context.log('JSON file upload failed:', jsonErr.message);
        // Don't fail the whole operation
      }
    }

    const jsonMsg = jsonSuccess ? 'inklusive JSON-Datei' : '(JSON-Datei konnte nicht hochgeladen werden – bitte manuell hinzufügen)';
    context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt ${jsonMsg}.` };
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
