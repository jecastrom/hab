const path = require('path');
const { verifyToken } = require(path.join(__dirname, '../scripts/auth'));
const { Octokit } = require('@octokit/rest');

module.exports = async function (context, req) {
  context.log.info(`Delete-object invoked for code: ${req.body?.code}`);

  if (!verifyToken(req, context.res, 'admin')) {
    context.res = { status: 401, body: 'Unauthorized or invalid token' };
    return;
  }

  const { code } = req.body || {};
  if (!code) {
    context.res = { status: 400, body: 'Missing required field: code' };
    return;
  }

  try {
    if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN missing in env vars');

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const { data: file } = await octokit.repos.getContent({
      owner: 'jecastrom',
      repo: 'hab',
      path: 'index.html',
      branch: 'main'
    });

    const content = Buffer.from(file.content, 'base64').toString();
    let lines = content.split('\n');

    // Remove from dropdown
    const optionIndex = lines.findIndex(line => line.includes(`value="${code}"`));
    if (optionIndex === -1) throw new Error('Option not found');
    lines.splice(optionIndex, 1);

    // Remove from objectFiles
    const entryIndex = lines.findIndex(line => line.trim().startsWith(`${code}:`));
    if (entryIndex === -1) throw new Error('Entry not found');
    lines.splice(entryIndex, 1);

    const updatedContent = lines.join('\n');

    await octokit.repos.createOrUpdateFileContents({
      owner: 'jecastrom',
      repo: 'hab',
      path: 'index.html',
      message: `Delete object: ${code}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: file.sha,
      branch: 'main'
    });

    context.res = { status: 200, body: `Object ${code} deleted successfully` };
  } catch (e) {
    context.log.error(`Delete-object error: ${e.message} | Stack: ${e.stack}`);
    const status = e.response ? e.response.status : 500;
    const body = e.message.includes('GITHUB_TOKEN') ? 'Invalid or missing GitHub token' :
                 e.response ? `GitHub API error: ${e.response.data.message}` :
                 'Server error - check logs';
    context.res = { status, body };
  }
};