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
  // デフォルト選択
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

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('画像は5MB以下のものを選択してください。');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      // base64部分だけ抽出
      const [header, base64] = dataUrl.split(',');
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

// --- 下書き生成 ---
async function generateDraft() {
  const memo = document.getElementById('memo').value.trim();

  if (!memo) {
    alert('メモを入力してください。');
    return;
  }

  // UI: ローディング開始
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

  // スクロール
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // コピーボタンをリセット
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
