const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };

  let store;
  try {
    store = getStore('memos');
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
      const { memo } = JSON.parse(event.body);
      let memos = [];
      try {
        memos = await store.get('list', { type: 'json' }) || [];
      } catch (e) {
        memos = [];
      }
      memos.unshift(memo);
      await store.setJSON('list', memos);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // 削除
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      let memos = [];
      try {
        memos = await store.get('list', { type: 'json' }) || [];
      } catch (e) {
        memos = [];
      }
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
