const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  let store;
  try {
    store = getStore('memos');
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ストレージ初期化エラー: ' + e.message }) };
  }

  try {
    // 一覧取得
    if (event.httpMethod === 'GET') {
      const data = await store.get('list', { type: 'json' });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(data || [])
      };
    }

    // 保存
    if (event.httpMethod === 'POST') {
      const { memo } = JSON.parse(event.body);
      const memos = await store.get('list', { type: 'json' }) || [];
      memos.unshift(memo);
      await store.setJSON('list', memos);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ok: true })
      };
    }

    // 削除
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      const memos = await store.get('list', { type: 'json' }) || [];
      const filtered = memos.filter(m => m.id !== id);
      await store.setJSON('list', filtered);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ok: true })
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (err) {
    console.error('Memos error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
