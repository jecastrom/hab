const path = require('path');
const { verifyToken } = require(path.join(__dirname, '../scripts/auth'));
const { Octokit } = require('@octokit/rest');

module.exports = async function (context, req) {
  context.log.info(`Add-object invoked with body: ${JSON.stringify(req.body)}`);

  if (!verifyToken(req, context.res, 'admin')) {
    context.res = { status: 401, body: 'Unauthorized or invalid token' };
    return;
  }

  const { code, name } = req.body;
  if (!code || !name) {
    context.res = { status: 400, body: 'Missing required fields: code and name' };
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

    // Add to dropdown
    const dropdownStart = lines.findIndex(line => line.includes('<select id="object" class="controls">'));
    if (dropdownStart === -1) throw new Error('Dropdown not found');
    const dropdownEnd = lines.findIndex((line, idx) => idx > dropdownStart && line.includes('</select>'));
    if (dropdownEnd === -1) throw new Error('Closing </select> not found');
    lines.splice(dropdownEnd, 0, `  <option value="${code}">${name}</option>`);

    // Add to objectFiles
    const objectFilesStart = lines.findIndex(line => line.trim().startsWith('const objectFiles = {'));
    if (objectFilesStart === -1) throw new Error('objectFiles not found');
    const objectFilesEnd = lines.findIndex((line, idx) => idx > objectFilesStart && line.trim() === '};');
    if (objectFilesEnd === -1) throw new Error('Closing }; not found');
    if (objectFilesEnd - objectFilesStart > 1) {
      let lastEntryIndex = objectFilesEnd - 1;
      while (lines[lastEntryIndex].trim() === '') lastEntryIndex--;
      if (!lines[lastEntryIndex].trim().endsWith(',')) lines[lastEntryIndex] = lines[lastEntryIndex].replace(/$/, ',');
    }
    lines.splice(objectFilesEnd, 0, `  ${code}: '${code}.json'`);

    const updatedContent = lines.join('\n');

    await octokit.repos.createOrUpdateFileContents({
      owner: 'jecastrom',
      repo: 'hab',
      path: 'index.html',
      message: `Add object: ${code}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: file.sha,
      branch: 'main'
    });

    context.res = { status: 200, body: 'Object added successfully' };
  } catch (e) {
    context.log.error(`Add-object error: ${e.message} | Stack: ${e.stack}`);
    const status = e.response ? e.response.status : 500;
    const body = e.message.includes('GITHUB_TOKEN') ? 'Invalid or missing GitHub token' :
                 e.response ? `GitHub API error: ${e.response.data.message}` :
                 'Server error - check logs';
    context.res = { status, body };
  }
};