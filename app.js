// --- 状態管理 ---
let selectedPostType = 'diary';
let selectedImageBase64 = null;
let selectedImageMediaType = null;

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
  initTypeSelector();
  initImagePicker();
  initMemoCounter();
  document.getElementById('generateBtn').addEventListener('click', generateDraft);
  document.getElementById('copyBtn').addEventListener('click', copyDraft);
  document.getElementById('retryBtn').addEventListener('click', resetForm);
  document.getElementById('saveMemoBtn').addEventListener('click', saveMemo);
  renderSavedMemos();
});

// --- 投稿タイプ選択 ---
function initTypeSelector() {
  const buttons = document.querySelectorAll('.type-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPostType = btn.dataset.type;
    });
  });
  document.querySelector('[data-type="diary"]').classList.add('selected');
}

// --- 画像選択 ---
function initImagePicker() {
  const fileInput = document.getElementById('imageInput');
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeBtn = document.getElementById('removeImage');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('画像は5MB以下のものを選択してください。');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const [, base64] = dataUrl.split(',');
      selectedImageBase64 = base64;
      selectedImageMediaType = file.type || 'image/jpeg';
      previewImg.src = dataUrl;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    fileInput.value = '';
    selectedImageBase64 = null;
    selectedImageMediaType = null;
    preview.classList.remove('show');
    previewImg.src = '';
  });
}

// --- メモ文字数カウンター ---
function initMemoCounter() {
  const memo = document.getElementById('memo');
  const counter = document.getElementById('charCounter');
  memo.addEventListener('input', () => {
    counter.textContent = `${memo.value.length}文字`;
  });
}

// --- メモ保存 ---
function saveMemo() {
  const memo = document.getElementById('memo').value.trim();
  if (!memo) {
    alert('メモを入力してください。');
    return;
  }

  const saved = getSavedMemos();
  const newMemo = {
    id: Date.now(),
    text: memo,
    type: selectedPostType,
    date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saved.unshift(newMemo);
  localStorage.setItem('manekineko_memos', JSON.stringify(saved));
  renderSavedMemos();

  const btn = document.getElementById('saveMemoBtn');
  btn.textContent = '✅ 保存しました';
  setTimeout(() => { btn.textContent = '💾 メモを保存'; }, 2000);
}

// --- 保存済みメモ取得 ---
function getSavedMemos() {
  try {
    return JSON.parse(localStorage.getItem('manekineko_memos') || '[]');
  } catch {
    return [];
  }
}

// --- 保存済みメモ表示 ---
function renderSavedMemos() {
  const saved = getSavedMemos();
  const card = document.getElementById('savedMemosCard');
  const list = document.getElementById('savedMemosList');

  if (saved.length === 0) {
    card.classList.remove('show');
    return;
  }

  card.classList.add('show');
  list.innerHTML = saved.map(memo => `
    <div class="memo-item" data-id="${memo.id}">
      <div class="memo-item-header">
        <span class="memo-item-date">${memo.date}</span>
        <span class="memo-item-type">${memo.type === 'diary' ? '📔 日常・日記' : '🚕 サービス紹介'}</span>
      </div>
      <div class="memo-item-text">${escapeHtml(memo.text)}</div>
      <div class="memo-item-actions">
        <button class="btn-load-memo" onclick="loadMemo(${memo.id})">📂 読み込む</button>
        <button class="btn-delete-memo" onclick="deleteMemo(${memo.id})">🗑 削除</button>
      </div>
    </div>
  `).join('');
}

// --- メモ読み込み ---
function loadMemo(id) {
  const saved = getSavedMemos();
  const memo = saved.find(m => m.id === id);
  if (!memo) return;

  document.getElementById('memo').value = memo.text;
  document.getElementById('charCounter').textContent = `${memo.text.length}文字`;

  // 投稿タイプも復元
  const buttons = document.querySelectorAll('.type-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === memo.type);
  });
  selectedPostType = memo.type;

  // 上にスクロール
  document.getElementById('memo').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- メモ削除 ---
function deleteMemo(id) {
  if (!confirm('このメモを削除しますか？')) return;
  const saved = getSavedMemos().filter(m => m.id !== id);
  localStorage.setItem('manekineko_memos', JSON.stringify(saved));
  renderSavedMemos();
}

// --- HTMLエスケープ ---
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- 下書き生成 ---
async function generateDraft() {
  const memo = document.getElementById('memo').value.trim();

  if (!memo) {
    alert('メモを入力してください。');
    return;
  }

  setLoading(true);
  hideResult();
  hideError();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memo,
        postType: selectedPostType,
        imageBase64: selectedImageBase64,
        imageMediaType: selectedImageMediaType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '生成に失敗しました');
    }

    showResult(data.draft);
  } catch (err) {
    showError(err.message || 'エラーが発生しました。もう一度お試しください。');
  } finally {
    setLoading(false);
  }
}

// --- UI操作 ---
function setLoading(isLoading) {
  const btn = document.getElementById('generateBtn');
  const loadingEl = document.getElementById('loading');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? '生成中...' : '🐾 下書きを作成する';
  loadingEl.classList.toggle('show', isLoading);
}

function showResult(draft) {
  const resultCard = document.getElementById('resultCard');
  const draftText = document.getElementById('draftText');
  draftText.textContent = draft;
  resultCard.classList.add('show');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const copyBtn = document.getElementById('copyBtn');
  copyBtn.textContent = '📋 コピーする';
  copyBtn.classList.remove('copied');
}

function hideResult() {
  document.getElementById('resultCard').classList.remove('show');
}

function showError(message) {
  const errorEl = document.getElementById('errorMsg');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function hideError() {
  document.getElementById('errorMsg').classList.remove('show');
}

// --- コピー ---
async function copyDraft() {
  const text = document.getElementById('draftText').textContent;
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✅ コピーしました！';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 コピーする';
      btn.classList.remove('copied');
    }, 2000);
  } catch {
    alert('コピーできませんでした。テキストを手動で選択してコピーしてください。');
  }
}

// --- やり直し ---
function resetForm() {
  hideResult();
  hideError();
  document.getElementById('memo').scrollIntoView({ behavior: 'smooth' });
}
