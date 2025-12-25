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

    // 1. Objekt-Dropdown: Neue Option vor </select> des id="object" einfügen
    let objectSelectStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().includes('<select id="object"')) {
        objectSelectStart = i;
        break;
      }
    }
    if (objectSelectStart === -1) throw new Error('Objekt-Select (id="object") nicht gefunden');

    let objectSelectEnd = -1;
    for (let i = objectSelectStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === '</select>') {
        objectSelectEnd = i;
        break;
      }
    }
    if (objectSelectEnd === -1) throw new Error('Schließendes </select> für Objekt-Select nicht gefunden');
    lines.splice(objectSelectEnd, 0, `        <option value="${code}">${name}</option>`);

    // 2. objectFiles: Suche nach "const objectFiles = {" und füge vor der nächsten } ein
    let objectFilesStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('const objectFiles = {')) {
        objectFilesStart = i;
        break;
      }
    }
    if (objectFilesStart === -1) throw new Error('const objectFiles = { nicht gefunden');

    let objectFilesEnd = -1;
    for (let i = objectFilesStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === '}') {
        objectFilesEnd = i;
        break;
      }
    }
    if (objectFilesEnd === -1) throw new Error('Schließende } für objectFiles nicht gefunden');
    lines.splice(objectFilesEnd, 0, `      ${code}: '${code}.json',`);

    const updatedHtml = lines.join('\n');

    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    if (jsonContent) {
      try {
        const jsonDecoded = Buffer.from
