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
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // 1. Dropdown: Füge neue Option vor dem schließenden </select> ein
    const selectCloseRegex = /<\/select>/i;
    const optionLine = `        <option value="${code}">${name}</option>\n        `;
    if (selectCloseRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(selectCloseRegex, `${optionLine}</select>`);
      context.log('Dropdown-Option hinzugefügt (vor </select>)');
    } else {
      throw new Error('</select>-Tag nicht gefunden – Dropdown konnte nicht aktualisiert werden');
    }

    // 2. objectFiles: Füge neue Zeile vor dem schließenden } ein
    const objectFilesCloseRegex = /\}\s*;?\s*$/m;  // Findet das letzte } am Ende des objectFiles
    const mapLine = `      ${code}: '${code}.json',\n`;
    if (objectFilesCloseRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(objectFilesCloseRegex, `${mapLine}    }`);
      context.log('objectFiles-Eintrag hinzugefügt (vor letztem })');
    } else {
      throw new Error('Schließende } von objectFiles nicht gefunden');
    }

    // Commit updated index.html
    await commitFile(context, 'index.html', htmlContent, indexData.sha, token, owner, repo, branch);

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
