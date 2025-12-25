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

    // 1. Dropdown: Neue Option vor dem letzten </select> einfügen
    let selectFound = false;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('</select>')) {
        lines.splice(i, 0, `        <option value="${code}">${name}</option>`);
        selectFound = true;
        break;
      }
    }
    if (!selectFound) throw new Error('</select> nicht gefunden');

    // 2. objectFiles: Neue Zeile vor der schließenden } einfügen
    let objectFilesFound = false;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '}') {
        lines.splice(i, 0, `      ${code}: '${code}.json',`);
        objectFilesFound = true;
        break;
      }
    }
    if (!objectFilesFound) throw new Error('Schließende } von objectFiles nicht gefunden');

    const updatedHtml = lines.join('\n');

    // Commit updated index.html
    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    // Optional JSON file
    if (jsonContent) {
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(context, `${code}.json`, jsonDecoded, null, token, owner, repo, branch);
      context.res = { status: 200, body: `Erfolg! Objekt "${name}" (${code}) hinzugefügt inklusive JSON-Datei.` };
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
