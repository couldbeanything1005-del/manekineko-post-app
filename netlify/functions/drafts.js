const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };

  let store;
  try {
    store = getStore('drafts');
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ストレージ初期化エラー: ' + e.message }) };
  }

  try {
    // 一覧取得
    if (event.httpMethod === 'GET') {
      let data;
      try {
        data = await store.get('list', { type: 'json' });
      } catch (e) {
        data = null;
      }
      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    // 保存
    if (event.httpMethod === 'POST') {
      const { draft } = JSON.parse(event.body);
      let drafts = [];
      try {
        drafts = await store.get('list', { type: 'json' }) || [];
      } catch (e) {
        drafts = [];
      }
      drafts.unshift(draft);
      await store.setJSON('list', drafts);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // 削除
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      let drafts = [];
      try {
        drafts = await store.get('list', { type: 'json' }) || [];
      } catch (e) {
        drafts = [];
      }
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
