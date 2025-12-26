module.exports = async function (context, req) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.res = { status: 500, body: "Server-Fehler: Kein Token" };
    return;
  }

  const { codes } = req.body || {}; // array of codes to delete
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    context.res = { status: 400, body: "Fehler: Keine Codes zum Löschen angegeben" };
    return;
  }

  const owner = "jecastrom";
  const repo = "hab";
  const branch = "main";

  try {
    const indexRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'admin' }
    });
    if (!indexRes.ok) throw new Error("index.html nicht geladen");

    const indexData = await indexRes.json();
    let lines = Buffer.from(indexData.content, 'base64').toString('utf8').split('\n');

    // Remove from dropdown
    lines = lines.filter(line => !codes.some(code => line.trim().includes(`value="${code}"`)));

    // Remove from objectFiles
    lines = lines.filter(line => !codes.some(code => line.trim() === `      ${code}: '${code}.json',`));

    const updatedHtml = lines.join('\n');
    await commitFile(context, 'index.html', updatedHtml, indexData.sha, token, owner, repo, branch);

    // Delete JSON files
    for (const code of codes) {
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${code}.json?ref=${branch}`, {
          headers: { Authorization: `token ${token}`, 'User-Agent': 'admin' }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${code}.json`, {
            method: 'DELETE',
            headers: { Authorization: `token ${token}`, 'User-Agent': 'admin' },
            body: JSON.stringify({ message: `Admin: Objekt ${code} löschen`, sha: fileData.sha, branch })
          });
        }
      } catch (e) {
        context.log(`JSON ${code}.json nicht gefunden oder bereits gelöscht`);
      }
    }

    context.res = { status: 200, body: `Erfolg! ${codes.length} Objekt(e) gelöscht.` };
  } catch (e) {
    context.res = { status: 500, body: `Fehler: ${e.message}` };
  }
};

async function commitFile(context, path, content, sha, token, owner, repo, branch) {
  const body = {
    message: `Admin: Änderung an ${path}`,
    content: Buffer.from(content).toString('base64'),
    branch,
    sha
  };

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'admin', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Commit fehlgeschlagen');
  }
}
