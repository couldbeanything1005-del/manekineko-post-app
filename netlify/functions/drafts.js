const GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_GIST;
const FILE_NAME = 'manekineko-data.json';

async function readAll() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'manekineko-app'
    }
  });
  if (!res.ok) throw new Error('読み込みエラー: ' + res.status);
  const gist = await res.json();
  const raw = gist.files[FILE_NAME]?.content || '{"memos":[],"drafts":[]}';
  return JSON.parse(raw);
}

async function writeAll(data) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'manekineko-app'
    },
    body: JSON.stringify({
      files: { [FILE_NAME]: { content: JSON.stringify(data) } }
    })
  });
  if (!res.ok) throw new Error('書き込みエラー: ' + res.status);
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };

  if (!GIST_ID || !GITHUB_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GITHUB_GIST_IDとGITHUB_TOKEN_GISTが未設定です' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const data = await readAll();
      return { statusCode: 200, headers, body: JSON.stringify(data.drafts || []) };
    }

    if (event.httpMethod === 'POST') {
      const { draft } = JSON.parse(event.body);
      const data = await readAll();
      data.drafts = data.drafts || [];
      data.drafts.unshift(draft);
      await writeAll(data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      const data = await readAll();
      data.drafts = (data.drafts || []).filter(d => d.id !== id);
      await writeAll(data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    console.error('Drafts error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
