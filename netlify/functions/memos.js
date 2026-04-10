const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };

  let store;
  try {
    store = getStore({
      name: 'memos',
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
      const { memo } = JSON.parse(event.body);
      let memos = [];
      try { memos = await store.get('list', { type: 'json' }) || []; } catch { memos = []; }
      memos.unshift(memo);
      await store.setJSON('list', memos);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      let memos = [];
      try { memos = await store.get('list', { type: 'json' }) || []; } catch { memos = []; }
      const filtered = memos.filter(m => m.id !== id);
      await store.setJSON('list', filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (err) {
    console.error('Memos error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'サーバーエラー: ' + err.message }) };
  }
};
