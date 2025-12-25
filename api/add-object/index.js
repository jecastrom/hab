const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async function (context, req) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    context.res = { status: 500, body: "Server configuration error" };
    return;
  }

  const { code, name, jsonContent } = req.body; // jsonContent is base64 if file uploaded
  if (!code || !name) {
    context.res = { status: 400, body: "Missing code or name" };
    return;
  }

  const owner = "jecastrom"; // Replace with your username or org
  const repo = "hab";        // Replace with repo name
  const branch = "main";                // or your default branch

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Get current index.html SHA and content
    const indexRes = await fetch(`${baseUrl}/contents/index.html?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin' }
    });
    const indexData = await indexRes.json();
    let htmlContent = Buffer.from(indexData.content, 'base64').toString('utf8');

    // Add to dropdown
    const optionLine = `        <option value="${code}">${name}</option>`;
    htmlContent = htmlContent.replace(
      /(<!-- Neue Objekte hier einfügen $$ siehe Hinweis oben $$ -->\n)/,
      `$1${' '.repeat(8)}${optionLine}\n`
    );

    // Add to objectFiles
    const mapLine = `      ${code}: '${code}.json',`;
    htmlContent = htmlContent.replace(
      /(\/\/ Neue Objekte hier einfügen $$ siehe Hinweis oben $$\n)/,
      `$1${' '.repeat(6)}${mapLine}\n`
    );

    // 2. Commit updated index.html
    await commitFile('index.html', htmlContent, indexData.sha, token, owner, repo, branch);

    // 3. If JSON file provided, create it
    if (jsonContent) {
      const jsonDecoded = Buffer.from(jsonContent, 'base64').toString('utf8');
      await commitFile(`${code}.json`, jsonDecoded, null, token, owner, repo, branch); // null SHA = create new
    }

    context.res = { status: 200, body: "Success! Changes committed – deploying soon." };
  } catch (e) {
    context.res = { status: 500, body: `Error: ${e.message}` };
  }
};

async function commitFile(path, content, sha, token, owner, repo, branch) {
  const body = {
    message: `Admin: Add new object ${path}`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'swa-admin' },
    body: JSON.stringify(body)
  });
}
