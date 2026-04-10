// --- 状態管理 ---
let selectedPostType = 'diary';
const MAX_IMAGES = 5;
let selectedImages = []; // [{ base64, mediaType, dataUrl }]
let cachedMemos = [];
let cachedDrafts = [];
let currentDraftText = ''; // 現在表示中の下書きテキスト

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
  initTypeSelector();
  initImagePicker();
  initMemoCounter();
  initDraftEditor();
  document.getElementById('generateBtn').addEventListener('click', generateDraft);
  document.getElementById('copyBtn').addEventListener('click', copyDraft);
  document.getElementById('retryBtn').addEventListener('click', resetForm);
  document.getElementById('saveMemoBtn').addEventListener('click', saveMemo);
  document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
  document.getElementById('refreshBtn').addEventListener('click', refreshAll);
  document.getElementById('hashtagBtn').addEventListener('click', generateHashtags);
  document.getElementById('copyHashtagBtn').addEventListener('click', copyHashtags);
  document.getElementById('instagramBtn').addEventListener('click', openInstagram);
  document.getElementById('seasonalBtn').addEventListener('click', generateSeasonalIdeas);
  document.querySelectorAll('.btn-tone').forEach(btn => {
    btn.addEventListener('click', () => adjustTone(btn.dataset.tone));
  });
  renderSavedMemos();
  renderSavedDrafts();
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

// =============================================
// 下書き編集機能
// =============================================

function initDraftEditor() {
  const editBtn = document.getElementById('editDraftBtn');
  const doneBtn = document.getElementById('editDoneBtn');
  const cancelBtn = document.getElementById('editCancelBtn');
  const editTextarea = document.getElementById('draftEditText');
  const editCounter = document.getElementById('draftEditCounter');

  editBtn.addEventListener('click', () => {
    // 表示→編集モードに切り替え
    editTextarea.value = currentDraftText;
    editCounter.textContent = currentDraftText.length;
    document.getElementById('draftViewMode').style.display = 'none';
    document.getElementById('draftEditMode').style.display = 'block';
    editTextarea.focus();
  });

  editTextarea.addEventListener('input', () => {
    editCounter.textContent = editTextarea.value.length;
  });

  doneBtn.addEventListener('click', () => {
    // 編集内容を確定
    currentDraftText = editTextarea.value;
    document.getElementById('draftText').textContent = currentDraftText;
    document.getElementById('draftEditMode').style.display = 'none';
    document.getElementById('draftViewMode').style.display = 'block';
  });

  cancelBtn.addEventListener('click', () => {
    // キャンセル→元に戻す
    document.getElementById('draftEditMode').style.display = 'none';
    document.getElementById('draftViewMode').style.display = 'block';
  });
}

// =============================================
// メモ保存・一覧（サーバー）
// =============================================

async function saveMemo() {
  const memoText = document.getElementById('memo').value.trim();
  if (!memoText) {
    alert('メモを入力してください。');
    return;
  }

  const btn = document.getElementById('saveMemoBtn');
  btn.textContent = '保存中...';
  btn.disabled = true;

  const newMemo = {
    id: Date.now(),
    text: memoText,
    type: selectedPostType,
    date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };

  try {
    const res = await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo: newMemo })
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(resData.error || `HTTP ${res.status}`);
    btn.textContent = '✅ 保存しました';
    await renderSavedMemos();
  } catch (e) {
    alert('保存に失敗しました: ' + e.message);
    btn.textContent = '💾 メモを保存';
  } finally {
    btn.disabled = false;
    setTimeout(() => { btn.textContent = '💾 メモを保存'; }, 2000);
  }
}

async function fetchSavedMemos() {
  const res = await fetch('/api/memos');
  if (!res.ok) throw new Error('取得失敗');
  return await res.json();
}

async function renderSavedMemos() {
  const card = document.getElementById('savedMemosCard');
  const list = document.getElementById('savedMemosList');

  if (cachedMemos.length > 0) {
    card.classList.add('show');
    list.innerHTML = buildMemoListHtml(cachedMemos);
  } else {
    list.innerHTML = '<div class="memo-loading">読み込み中...</div>';
  }

  try {
    const memos = await fetchSavedMemos();
    cachedMemos = memos;

    if (memos.length === 0) {
      card.classList.remove('show');
      return;
    }

    card.classList.add('show');
    list.innerHTML = buildMemoListHtml(memos);
  } catch {
    if (cachedMemos.length === 0) {
      card.classList.remove('show');
    }
  }
}

function buildMemoListHtml(memos) {
  return memos.map(memo => `
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

function loadMemo(id) {
  const memo = cachedMemos.find(m => m.id === id);
  if (!memo) return;

  document.getElementById('memo').value = memo.text;
  document.getElementById('charCounter').textContent = `${memo.text.length}文字`;

  const buttons = document.querySelectorAll('.type-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === memo.type);
  });
  selectedPostType = memo.type;

  document.getElementById('memo').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteMemo(id) {
  if (!confirm('このメモを削除しますか？')) return;

  try {
    const res = await fetch('/api/memos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('削除失敗');
    await renderSavedMemos();
  } catch {
    alert('削除に失敗しました。もう一度お試しください。');
  }
}

// =============================================
// 下書き保存・一覧（サーバー）
// =============================================

async function saveDraft() {
  if (!currentDraftText) return;

  const btn = document.getElementById('saveDraftBtn');
  btn.textContent = '保存中...';
  btn.disabled = true;

  const newDraft = {
    id: Date.now(),
    text: currentDraftText,
    type: selectedPostType,
    date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };

  try {
    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft: newDraft })
    });
    if (!res.ok) throw new Error('保存失敗');
    btn.textContent = '✅ 保存しました！';
    await renderSavedDrafts();
  } catch {
    alert('保存に失敗しました。もう一度お試しください。');
    btn.textContent = '💾 下書きを保存する';
  } finally {
    btn.disabled = false;
    setTimeout(() => { btn.textContent = '💾 下書きを保存する'; }, 2000);
  }
}

async function fetchSavedDrafts() {
  const res = await fetch('/api/drafts');
  if (!res.ok) throw new Error('取得失敗');
  return await res.json();
}

async function renderSavedDrafts() {
  const card = document.getElementById('savedDraftsCard');
  const list = document.getElementById('savedDraftsList');

  try {
    const drafts = await fetchSavedDrafts();
    cachedDrafts = drafts;

    if (drafts.length === 0) {
      card.classList.remove('show');
      return;
    }

    card.classList.add('show');
    list.innerHTML = buildDraftListHtml(drafts);
  } catch {
    if (cachedDrafts.length === 0) {
      card.classList.remove('show');
    }
  }
}

function buildDraftListHtml(drafts) {
  return drafts.map(draft => `
    <div class="memo-item" data-id="${draft.id}">
      <div class="memo-item-header">
        <span class="memo-item-date">${draft.date}</span>
        <span class="memo-item-type">${draft.type === 'diary' ? '📔 日常・日記' : '🚕 サービス紹介'}</span>
      </div>
      <div class="memo-item-text">${escapeHtml(draft.text)}</div>
      <div class="memo-item-actions">
        <button class="btn-load-memo" onclick="copyDraftFromList(${draft.id})">📋 コピー</button>
        <button class="btn-instagram-list" onclick="openInstagramFromList(${draft.id})">📸 Instagram</button>
        <button class="btn-delete-memo" onclick="deleteDraft(${draft.id})">🗑 削除</button>
      </div>
    </div>
  `).join('');
}

async function openInstagramFromList(id) {
  const draft = cachedDrafts.find(d => d.id === id);
  if (!draft) return;
  try { await navigator.clipboard.writeText(draft.text); } catch {}
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  if (isIOS || isAndroid) {
    window.location.href = 'instagram://';
    setTimeout(() => { window.open('https://www.instagram.com/', '_blank'); }, 1500);
  } else {
    window.open('https://www.instagram.com/', '_blank');
  }
}

async function copyDraftFromList(id) {
  const draft = cachedDrafts.find(d => d.id === id);
  if (!draft) return;
  try {
    await navigator.clipboard.writeText(draft.text);
    alert('コピーしました！');
  } catch {
    alert('コピーできませんでした。');
  }
}

async function deleteDraft(id) {
  if (!confirm('この下書きを削除しますか？')) return;

  try {
    const res = await fetch('/api/drafts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('削除失敗');
    await renderSavedDrafts();
  } catch {
    alert('削除に失敗しました。もう一度お試しください。');
  }
}

// =============================================
// 画像リサイズ
// =============================================

const INSTA_MAX_SIZE = 1080;
const INSTA_QUALITY = 0.85;

function resizeImageForInstagram(img) {
  let { width, height } = img;

  if (width > INSTA_MAX_SIZE || height > INSTA_MAX_SIZE) {
    const ratio = Math.min(INSTA_MAX_SIZE / width, INSTA_MAX_SIZE / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', INSTA_QUALITY);
  return { dataUrl, width, height };
}

// --- HTMLエスケープ ---
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// =============================================
// 下書き生成
// =============================================

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

// =============================================
// UI操作
// =============================================

function setLoading(isLoading) {
  const btn = document.getElementById('generateBtn');
  const loadingEl = document.getElementById('loading');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? '生成中...' : '🐾 下書きを作成する';
  loadingEl.classList.toggle('show', isLoading);
}

function showResult(draft) {
  currentDraftText = draft;

  // 表示モードで開く
  document.getElementById('draftViewMode').style.display = 'block';
  document.getElementById('draftEditMode').style.display = 'none';

  const resultCard = document.getElementById('resultCard');
  const draftText = document.getElementById('draftText');
  draftText.textContent = draft;
  resultCard.classList.add('show');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 保存ボタンをリセット
  const saveBtn = document.getElementById('saveDraftBtn');
  saveBtn.textContent = '💾 下書きを保存する';
  saveBtn.disabled = false;

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

async function copyDraft() {
  const text = currentDraftText;
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

function resetForm() {
  hideResult();
  hideError();
  currentDraftText = '';
  document.getElementById('hashtagResult').style.display = 'none';
  document.getElementById('memo').scrollIntoView({ behavior: 'smooth' });
}

// =============================================
// トーン調整
// =============================================

async function adjustTone(toneInstruction) {
  if (!currentDraftText) return;

  const loadingEl = document.getElementById('toneLoading');
  const btns = document.querySelectorAll('.btn-tone');
  loadingEl.style.display = 'block';
  btns.forEach(b => b.disabled = true);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'tone', currentDraft: currentDraftText, toneInstruction })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    currentDraftText = data.draft;
    document.getElementById('draftText').textContent = data.draft;
  } catch (e) {
    alert('調整に失敗しました: ' + e.message);
  } finally {
    loadingEl.style.display = 'none';
    btns.forEach(b => b.disabled = false);
  }
}

// =============================================
// ハッシュタグ生成
// =============================================

async function generateHashtags() {
  const memo = document.getElementById('memo').value.trim();
  const btn = document.getElementById('hashtagBtn');
  btn.textContent = '生成中...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'hashtags', postType: selectedPostType, memo: memo || 'まねきねこ 福祉タクシー' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('hashtagText').textContent = data.hashtags;
    document.getElementById('hashtagResult').style.display = 'block';
  } catch (e) {
    alert('ハッシュタグの生成に失敗しました: ' + e.message);
  } finally {
    btn.textContent = '＃ ハッシュタグを生成';
    btn.disabled = false;
  }
}

async function copyHashtags() {
  const text = document.getElementById('hashtagText').textContent;
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyHashtagBtn');
    btn.textContent = '✅ コピーしました！';
    setTimeout(() => { btn.textContent = '📋 ハッシュタグをコピー'; }, 2000);
  } catch {
    alert('コピーできませんでした。');
  }
}

// =============================================
// Instagramで開く
// =============================================

async function openInstagram() {
  if (currentDraftText) {
    try {
      await navigator.clipboard.writeText(currentDraftText);
    } catch {}
  }
  // モバイルはアプリへ、PCはWebへ
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  if (isIOS || isAndroid) {
    window.location.href = 'instagram://';
    setTimeout(() => { window.open('https://www.instagram.com/', '_blank'); }, 1500);
  } else {
    window.open('https://www.instagram.com/', '_blank');
  }
  const btn = document.getElementById('instagramBtn');
  btn.textContent = '✅ テキストをコピーしました！';
  setTimeout(() => { btn.textContent = '📸 Instagramで開く'; }, 2500);
}

// =============================================
// 季節の投稿アイデア
// =============================================

async function generateSeasonalIdeas() {
  const btn = document.getElementById('seasonalBtn');
  const resultEl = document.getElementById('seasonalResult');
  btn.textContent = '生成中...';
  btn.disabled = true;
  resultEl.innerHTML = '<div class="seasonal-loading">アイデアを考えています...</div>';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'seasonal' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const items = data.suggestions.split(/\n(?=\d\.)/).filter(s => s.trim());
    resultEl.innerHTML = items.map(item => {
      const match = item.match(/【(.+?)】\n?(.*)/s);
      const title = match ? match[1] : item;
      const desc = match ? match[2].trim() : '';
      return `
        <div class="seasonal-item">
          <div class="seasonal-item-title">【${title}】</div>
          <div class="seasonal-item-desc">${escapeHtml(desc)}</div>
          <button class="btn-use-idea" onclick="useSeasonalIdea('${escapeHtml(desc || title).replace(/'/g, "\\'")}')">このアイデアを使う</button>
        </div>`;
    }).join('');
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#c62828;font-size:13px">取得に失敗しました: ${e.message}</div>`;
  } finally {
    btn.textContent = 'アイデアを見る';
    btn.disabled = false;
  }
}

function useSeasonalIdea(text) {
  document.getElementById('memo').value = text;
  document.getElementById('charCounter').textContent = `${text.length}文字`;
  document.getElementById('memo').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- 手動更新 ---
async function refreshAll() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  btn.disabled = true;
  try {
    await Promise.all([renderSavedMemos(), renderSavedDrafts()]);
  } finally {
    btn.classList.remove('spinning');
    btn.disabled = false;
  }
}
