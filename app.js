// --- 状態管理 ---
let selectedPostType = 'diary';
const MAX_IMAGES = 5;
let selectedImages = []; // [{ base64, mediaType, dataUrl }]

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

// --- 画像選択（複数枚対応） ---
function initImagePicker() {
  const fileInput = document.getElementById('imageInput');
  const removeAllBtn = document.getElementById('removeAllImages');

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = MAX_IMAGES - selectedImages.length;
    if (files.length > remaining) {
      alert(`画像は最大${MAX_IMAGES}枚までです。あと${remaining}枚選択できます。`);
      fileInput.value = '';
      return;
    }

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        alert(`「${file.name}」は20MBを超えています。スキップします。`);
        continue;
      }
      processImageFile(file);
    }
    fileInput.value = '';
  });

  removeAllBtn.addEventListener('click', () => {
    selectedImages = [];
    renderImagePreviews();
  });
}

function processImageFile(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      if (selectedImages.length >= MAX_IMAGES) return;
      const resized = resizeImageForInstagram(img);
      const [, base64] = resized.dataUrl.split(',');
      selectedImages.push({ base64, mediaType: 'image/jpeg', dataUrl: resized.dataUrl });
      renderImagePreviews();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function removeImage(index) {
  selectedImages.splice(index, 1);
  renderImagePreviews();
}

function renderImagePreviews() {
  const area = document.getElementById('imagePreviewArea');
  const grid = document.getElementById('imagePreviewGrid');
  const countEl = document.getElementById('imageCount');
  const picker = document.getElementById('imagePicker');

  if (selectedImages.length === 0) {
    area.classList.remove('show');
    picker.classList.remove('hidden');
    return;
  }

  area.classList.add('show');
  countEl.textContent = `${selectedImages.length}/${MAX_IMAGES}枚`;

  if (selectedImages.length >= MAX_IMAGES) {
    picker.classList.add('hidden');
  } else {
    picker.classList.remove('hidden');
  }

  grid.innerHTML = selectedImages.map((img, i) => `
    <div class="image-thumb">
      <img src="${img.dataUrl}" alt="画像${i + 1}" />
      <button class="image-thumb-remove" onclick="removeImage(${i})">✕</button>
      <span class="image-thumb-num">${i + 1}</span>
    </div>
  `).join('');
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

// --- 画像リサイズ（Instagram最適化） ---
const INSTA_MAX_SIZE = 1080;
const INSTA_QUALITY = 0.85;

function resizeImageForInstagram(img) {
  let { width, height } = img;
  let wasResized = false;

  if (width > INSTA_MAX_SIZE || height > INSTA_MAX_SIZE) {
    const ratio = Math.min(INSTA_MAX_SIZE / width, INSTA_MAX_SIZE / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    wasResized = true;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', INSTA_QUALITY);
  const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);

  return { dataUrl, width, height, wasResized, sizeKB };
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
        images: selectedImages.map(img => ({ base64: img.base64, mediaType: img.mediaType })),
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
