module.exports = async function (context, req) {
  context.log('=== Admin API called ===');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.log('Error: No GITHUB_TOKEN found');
    context.res = { status: 500, body: "Server-Fehler: Kein GitHub-Token konfiguriert" };
    return;
  }

  const { code, name, jsonContent, uploadOnly } = req.body || {};
  if (uploadOnly) {
    if (!code || !jsonContent) {
      context.log('Error: Missing code or jsonContent in uploadOnly');
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
        sha = fileData.sha;
      }
      await commitFile(context, `${code}.json`, jsonDecoded, sha, token, "jecastrom", "hab", "main");
      context.res = { status: 200, body: `Erfolg! JSON-Datei für Objekt "${code}" hochgeladen.` };
    } catch (e) {
      context.log('Upload error:', e.message);
      context.res = { status: 500, body: `Fehler beim Upload: ${e.message || 'Unbekannt'}` };
    }
    return;
  }

  if (!code || !name) {
    context.log('Error: Missing code or name in normal add');
    context.res = { status: 400, body: "Fehler: Code und Name sind erforderlich" };
    return;
  }

  // Normal add mode (always add the object, file optional)
  try {
    const indexRes = await fetch(`https://api.github.com/repos/jecastrom/hab/contents/index.html?ref=main`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'swa-admin',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!indexRes.ok) throw new Error(`index.html laden fehlgeschlagen (${indexRes.status})`);

    const indexData = await indexRes.json();
    let lines = Buffer.from(indexData.content, 'base64').toString('utf8').split('\n');

    // Add to dropdown
    let objectSelectStart = lines.findIndex(line => line.trim().includes('<select id="object"'));
    if (objectSelectStart === -1) throw new Error('Objekt-Select (id="object") nicht gefunden');

    let objectSelectEnd = lines.slice(objectSelectStart).findIndex(line => line.trim() === '</select>') + objectSelectStart;
    if (objectSelectEnd === -1) throw new Error('Schließendes </select> nicht gefunden');

    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // Add to objectFiles
    let objectFilesStart = lines.findIndex(line => line.trim().startsWith('const objectFiles = {'));
    if (objectFilesStart === -1) throw new Error('const objectFiles = { nicht gefunden');

    let objectFilesEnd = lines.slice(objectFilesStart).findIndex(line => line.trim() === '};') + objectFilesStart;
    if (objectFilesEnd === -1) throw new Error('Schließende }; für objectFiles nicht gefunden');

    if (objectFilesEnd - objectFilesStart > 1) {
      let lastEntryIndex = objectFilesEnd - 1;
      while (lines[lastEntryIndex].trim() === '') lastEntryIndex--;
      lines[lastEntryIndex] = lines[lastEntryIndex].replace(/$/, ',');  // Add comma if missing
    }

    lines.splice(objectFilesEnd, 0, `      ${code}: '${code}.json'`);

    const updatedHtml = lines.join('\n');

    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, "jecastrom", "hab", "main");

    let jsonMsg = '';
    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
        await commitFile(context, `${code}.json`, jsonDecoded, null, token, "jecastrom", "hab", "main");
        jsonMsg = ' inklusive JSON-Datei';
      } catch (jsonErr) {
        jsonMsg = ' (JSON-Datei fehlgeschlagen – bitte manuell hochladen)';
      }
    } else {
      jsonMsg = ' (ohne JSON-Datei)';
    }

    context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt${jsonMsg}.` };
  } catch (e) {
    context.res = { status: 500, body: `Fehler: ${e.message}` };
  }
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

// Test comment
