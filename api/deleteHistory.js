// api/deleteHistory.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const HISTORY_PATH = process.env.HISTORY_PATH || 'public/dataHistory.json';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function getFile() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${HISTORY_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'mangaweb-history-script' }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed get file: ' + res.statusText);
  return res.json();
}

async function putFile(contentBase64, message, sha) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${HISTORY_PATH}`;
  const body = { message, content: contentBase64, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'mangaweb-history-script', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Failed put file: ' + res.status + ' ' + txt);
  }
  return res.json();
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { id, clearAll } = req.body;

    const file = await getFile();
    let historyObj = { history: [] };
    let sha = null;
    if (file) {
      sha = file.sha;
      const decoded = Buffer.from(file.content, 'base64').toString('utf8');
      try { historyObj = JSON.parse(decoded); } catch (e) { /* ignore */ }
    }

    if (clearAll) {
      historyObj.history = [];
    } else if (id) {
      historyObj.history = (historyObj.history || []).filter(h => h.id !== id);
    } else {
      return res.status(400).json({ error: 'Missing id or clearAll' });
    }

    const updatedStr = JSON.stringify(historyObj, null, 2);
    const contentBase64 = Buffer.from(updatedStr, 'utf8').toString('base64');
    const commit = await putFile(contentBase64, clearAll ? `Clear history` : `Delete history ${id}`, sha);
    return res.status(200).json({ ok: true, commit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};