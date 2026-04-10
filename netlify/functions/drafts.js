const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };

  let store;
  try {
    store = getStore({
      name: 'drafts',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ストレージ初期化エラー: ' + e.message }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      let data;
      try { data = await store.get('list', { type: 'json' }); } catch { data = null; }
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (event.httpMethod === 'POST') {
      const { draft } = JSON.parse(event.body);
      let drafts = [];
      try { drafts = await store.get('list', { type: 'json' }) || []; } catch { drafts = []; }
      drafts.unshift(draft);
      await store.setJSON('list', drafts);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      let drafts = [];
      try { drafts = await store.get('list', { type: 'json' }) || []; } catch { drafts = []; }
      const filtered = drafts.filter(d => d.id !== id);
      await store.setJSON('list', filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (err) {
    console.error('Drafts error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'サーバーエラー: ' + err.message }) };
  }
};
