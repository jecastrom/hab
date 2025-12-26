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

    // Check if code already exists in dropdown or objectFiles
    if (lines.some(line => line.trim().includes(`value="${code}"`)) || lines.some(line => line.trim().includes(`${code}: '${code}.json'`))) {
      context.res = { status: 400, body: `Fehler: Objekt "${name}" (${code}) existiert bereits.` };
      return;
    }

    // 1. Dropdown: Insert before </select> of id="object"
    let objectSelectStart = lines.findIndex(line => line.trim().includes('<select id="object"'));
    if (objectSelectStart === -1) throw new Error('Objekt-Select (id="object") nicht gefunden');

    let objectSelectEnd = lines.slice(objectSelectStart).findIndex(line => line.trim() === '</select>') + objectSelectStart;
    if (objectSelectEnd === -1) throw new Error('Schließendes </select> nicht gefunden');

    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // 2. objectFiles: Insert at the end before the closing }; , with comma on previous if needed
    let objectFilesStart = lines.findIndex(line => line.trim().startsWith('const objectFiles = {'));
    if (objectFilesStart === -1) throw new Error('const objectFiles = { nicht gefunden');

    let objectFilesEnd = lines.slice(objectFilesStart).findIndex(line => line.trim() === '};') + objectFilesStart;
    if (objectFilesEnd === -1) throw new Error('Schließende }; für objectFiles nicht gefunden');

    if (objectFilesEnd - objectFilesStart > 1) {
      let lastEntryIndex = objectFilesEnd - 1;
      while (lastEntryIndex > objectFilesStart && lines[lastEntryIndex].trim() === '') lastEntryIndex--;
      lines[lastEntryIndex] = lines[lastEntryIndex].replace(/$/, ',');  // Add comma if missing
    }

    lines.splice(objectFilesEnd, 0, `      ${code}: '${code}.json'`);

    const updatedHtml = lines.join('\n');

    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    let jsonMsg = '';
    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
        await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
        jsonMsg = ' inklusive JSON-Datei';
      } catch (jsonErr) {
        jsonMsg = ' (JSON-Datei fehlgeschlagen – bitte manuell hochladen)';
      }
    } else {
      jsonMsg = ' (ohne JSON-Datei)';
    }

    context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt${jsonMsg}. Ignoriere "failed" E-Mails von GitHub – das ist normal und die Änderungen sind live.` };
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
