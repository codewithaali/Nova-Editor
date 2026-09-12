
const STORAGE_DOCS_KEY = 'novaEditor_documents';
const STORAGE_ACTIVE_KEY = 'novaEditor_activeDocId';
const STORAGE_THEME_KEY = 'novaEditor_theme';

const editorContent   = document.getElementById('editorContent');
const wordCountEl     = document.getElementById('wordCount');
const charCountEl     = document.getElementById('charCount');
const docWordLabelEl  = document.getElementById('docWordLabel');

const fontFamilySelect   = document.getElementById('fontFamilySelect');
const fontIncreaseBtn    = document.getElementById('fontIncreaseBtn');
const fontDecreaseBtn    = document.getElementById('fontDecreaseBtn');
const fontSizeValueEl    = document.getElementById('fontSizeValue');
const lineHeightIncreaseBtn = document.getElementById('lineHeightIncreaseBtn');
const lineHeightDecreaseBtn = document.getElementById('lineHeightDecreaseBtn');
const lineHeightValueEl  = document.getElementById('lineHeightValue');

const textColorInput = document.getElementById('textColorInput');
const bgColorInput    = document.getElementById('bgColorInput');

const saveBtn  = document.getElementById('saveBtn');
const loadBtn  = document.getElementById('loadBtn');
const copyTextBtn = document.getElementById('copyTextBtn');
const statusMsgEl = document.getElementById('statusMsg');

const newDocBtn       = document.getElementById('newDocBtn');
const newDocBtnMobile = document.getElementById('newDocBtnMobile');

const searchDocsInput       = document.getElementById('searchDocsInput');
const searchDocsInputMobile = document.getElementById('searchDocsInputMobile');

const docTree        = document.getElementById('docTree');
const docTreeMobile  = document.getElementById('docTreeMobile');
const docList        = document.getElementById('docList'); 

const currentDocLabel        = document.getElementById('currentDocLabel');
const currentDocLabelMobile  = document.getElementById('currentDocLabelMobile');
const mobileDocNameEl        = document.getElementById('mobileDocName');

const voiceBtn        = document.getElementById('voiceBtn');
const voiceIcon       = document.getElementById('voiceIcon');
const voiceLabel      = document.getElementById('voiceLabel');
const voiceBtnMobile  = document.getElementById('voiceBtnMobile');
const voiceLabelMobile = document.getElementById('voiceLabelMobile');

const themeToggleBtn       = document.getElementById('themeToggleBtn');
const themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');

const taCollapseBtn   = document.getElementById('taCollapseBtn');
const textAnalysisCard = document.getElementById('textAnalysisCard');
const waveformEl      = document.getElementById('waveform');

const settingsBtn = document.getElementById('settingsBtn');
const toastEl     = document.getElementById('toastNotification');

let documents = [];
let activeDocId = null;

function loadDocumentsFromStorage() {
  const saved = localStorage.getItem(STORAGE_DOCS_KEY);
  if (saved) {
    try {
      documents = JSON.parse(saved);
    } catch (e) {
      documents = [];
    }
  }
  if (!documents || documents.length === 0) {
    documents = [{
      id: 'doc-1',
      name: 'Untitled_Doc_1.txt',
      content: '',
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.7
    }];
  }
  activeDocId = localStorage.getItem(STORAGE_ACTIVE_KEY) || documents[0].id;
  if (!documents.find(d => d.id === activeDocId)) {
    activeDocId = documents[0].id;
  }
}

function getActiveDoc() {
  return documents.find(d => d.id === activeDocId) || documents[0];
}

function persistDocuments() {
  localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(documents));
  localStorage.setItem(STORAGE_ACTIVE_KEY, activeDocId);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function docButtonsHTML() {
  return documents.map(doc => `
    <li>
      <button class="tree-node doc-node ${doc.id === activeDocId ? 'active' : ''}" type="button" data-doc-id="${doc.id}">
        <i class="fa-solid fa-file-lines doc-icon"></i>
        <span class="doc-name">${escapeHtml(doc.name)}</span>
      </button>
    </li>`).join('');
}

function renderDocTree() {
  if (docList) {
    docList.innerHTML = docButtonsHTML();
  }

  const mobileRoot = document.getElementById('docListMobileRoot');
  if (mobileRoot) {
    mobileRoot.innerHTML = `
      <li class="tree-folder">
        <button class="tree-node folder-node" type="button" data-toggle="folder">
          <i class="fa-solid fa-chevron-down chevron"></i>
          <i class="fa-solid fa-folder-open folder-icon"></i>
          <span>Folders</span>
        </button>
        <ul class="tree-children list-unstyled">
          <li class="tree-folder">
            <button class="tree-node folder-node" type="button" data-toggle="folder">
              <i class="fa-solid fa-chevron-down chevron"></i>
              <i class="fa-solid fa-folder-open folder-icon"></i>
              <span>Folders</span>
            </button>
            <ul class="tree-children list-unstyled doc-list">
              ${docButtonsHTML()}
            </ul>
          </li>
        </ul>
      </li>
      <li class="tree-folder">
        <button class="tree-node folder-node" type="button" data-toggle="folder">
          <i class="fa-solid fa-chevron-right chevron"></i>
          <i class="fa-solid fa-folder folder-icon"></i>
          <span>Folders</span>
        </button>
        <ul class="tree-children list-unstyled collapsed"></ul>
      </li>`;
  }
}

function updateDocLabels() {
  const doc = getActiveDoc();
  if (currentDocLabel) currentDocLabel.textContent = doc.name;
  if (currentDocLabelMobile) currentDocLabelMobile.textContent = doc.name;
  if (mobileDocNameEl) mobileDocNameEl.textContent = doc.name;
}
  
function handleTreeClick(e) {
  const folderBtn = e.target.closest('[data-toggle="folder"]');
  if (folderBtn) {
    toggleFolder(folderBtn);
    return;
  }
  const docBtn = e.target.closest('[data-doc-id]');
  if (docBtn) {
    selectDocument(docBtn.dataset.docId);
  }
}

function toggleFolder(btn) {
  const childList = btn.nextElementSibling;
  if (!childList) return;
  childList.classList.toggle('collapsed');
  const chevron = btn.querySelector('.chevron');
  if (chevron) {
    chevron.classList.toggle('fa-chevron-down');
    chevron.classList.toggle('fa-chevron-right');
  }
}

if (docTree) docTree.addEventListener('click', handleTreeClick);
if (docTreeMobile) docTreeMobile.addEventListener('click', handleTreeClick);

function applyDocToEditor(doc) {
  editorContent.innerHTML = doc.content || '';
  editorContent.style.fontFamily = doc.fontFamily;
  editorContent.style.fontSize = doc.fontSize + 'px';
  editorContent.style.lineHeight = doc.lineHeight;

  fontFamilySelect.value = doc.fontFamily;
  fontSizeValueEl.textContent = doc.fontSize;
  lineHeightValueEl.textContent = doc.lineHeight.toFixed(1);

  updateCounters();
  refreshEmptyState();
}

function selectDocument(id) {
  if (id === activeDocId) return;
  syncEditorIntoActiveDoc();

  activeDocId = id;
  renderDocTree();
  updateDocLabels();
  applyDocToEditor(getActiveDoc());
  closeMobileSidebarIfOpen();
}

function syncEditorIntoActiveDoc() {
  const doc = getActiveDoc();
  if (!doc) return;
  doc.content = editorContent.innerHTML;
  doc.fontFamily = fontFamilySelect.value;
  doc.fontSize = parseInt(fontSizeValueEl.textContent, 10);
  doc.lineHeight = parseFloat(lineHeightValueEl.textContent);
}

function nextDocName() {
  let n = 1;
  const usedNumbers = documents.map(d => {
    const match = d.name.match(/Untitled_Doc_(\d+)\.txt/);
    return match ? parseInt(match[1], 10) : 0;
  });
  while (usedNumbers.includes(n)) n++;
  return `Untitled_Doc_${n}.txt`;
}

function createNewDocument() {
  syncEditorIntoActiveDoc();

  const newDoc = {
    id: 'doc-' + Date.now(),
    name: nextDocName(),
    content: '',
    fontFamily: 'Georgia, serif',
    fontSize: 16,
    lineHeight: 1.7
  };
  documents.push(newDoc);
  activeDocId = newDoc.id;

  renderDocTree();
  updateDocLabels();
  applyDocToEditor(newDoc);
  editorContent.focus();
  closeMobileSidebarIfOpen();
  showToast('New document created');
}

if (newDocBtn) newDocBtn.addEventListener('click', createNewDocument);
if (newDocBtnMobile) newDocBtnMobile.addEventListener('click', createNewDocument);

function filterDocs(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('.doc-node').forEach(btn => {
    const name = btn.querySelector('.doc-name').textContent.toLowerCase();
    const li = btn.closest('li');
    li.classList.toggle('hidden-by-search', q.length > 0 && !name.includes(q));
  });
}

if (searchDocsInput) {
  searchDocsInput.addEventListener('input', (e) => filterDocs(e.target.value));
}
if (searchDocsInputMobile) {
  searchDocsInputMobile.addEventListener('input', (e) => filterDocs(e.target.value));
}

try { document.execCommand('styleWithCSS', false, true); } catch (e) {}

document.querySelectorAll('.fmt-btn[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    editorContent.focus();
    const cmd = btn.dataset.cmd;
    document.execCommand(cmd, false, null);
    updateToolbarActiveStates();
  });
});

document.getElementById('clearFormatBtn').addEventListener('click', () => {
  editorContent.focus();
  document.execCommand('removeFormat', false, null);
  updateToolbarActiveStates();
});

function updateToolbarActiveStates() {
  ['bold', 'italic', 'underline', 'strikeThrough'].forEach(cmd => {
    const btn = document.querySelector(`.fmt-btn[data-cmd="${cmd}"]`);
    if (!btn) return;
    try { btn.classList.toggle('active', document.queryCommandState(cmd)); }
    catch (e) { 

     }
  });
  ['justifyLeft', 'justifyCenter', 'justifyRight'].forEach(cmd => {
    const btn = document.querySelector(`.fmt-btn[data-cmd="${cmd}"]`);
    if (!btn) return;
    try { btn.classList.toggle('active', document.queryCommandState(cmd)); }
    catch (e) { 

     }
  });
}
document.addEventListener('selectionchange', () => {
  if (document.activeElement === editorContent) updateToolbarActiveStates();
});

/* Font family */
fontFamilySelect.addEventListener('change', () => {
  const value = fontFamilySelect.value;
  editorContent.style.fontFamily = value;   
  editorContent.focus();
  document.execCommand('fontName', false, value); 
});

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

function setFontSize(size) {
  const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
  fontSizeValueEl.textContent = clamped;
  editorContent.style.fontSize = clamped + 'px';
}
fontIncreaseBtn.addEventListener('click', () => {
  setFontSize(parseInt(fontSizeValueEl.textContent, 10) + 1);
});
fontDecreaseBtn.addEventListener('click', () => {
  setFontSize(parseInt(fontSizeValueEl.textContent, 10) - 1);
});

const MIN_LINE_HEIGHT = 1.0;
const MAX_LINE_HEIGHT = 3.0;

function setLineHeight(value) {
  const clamped = Math.max(MIN_LINE_HEIGHT, Math.min(MAX_LINE_HEIGHT, value));
  const rounded = Math.round(clamped * 10) / 10;
  lineHeightValueEl.textContent = rounded.toFixed(1);
  editorContent.style.lineHeight = rounded;
}
lineHeightIncreaseBtn.addEventListener('click', () => {
  setLineHeight(parseFloat(lineHeightValueEl.textContent) + 0.1);
});
lineHeightDecreaseBtn.addEventListener('click', () => {
  setLineHeight(parseFloat(lineHeightValueEl.textContent) - 0.1);
});

/* Text color */
textColorInput.addEventListener('input', () => {
  editorContent.focus();
  document.execCommand('foreColor', false, textColorInput.value);
});

/* Background / highlight color */
bgColorInput.addEventListener('input', () => {
  editorContent.focus();
  document.execCommand('hiliteColor', false, bgColorInput.value);
});

function showStatus(message) {
  statusMsgEl.textContent = message;
  statusMsgEl.classList.add('show');
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => statusMsgEl.classList.remove('show'), 2200);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

saveBtn.addEventListener('click', () => {
  syncEditorIntoActiveDoc();
  persistDocuments();
  showStatus('Saved ✓');
  showToast(`"${getActiveDoc().name}" saved`);
});

loadBtn.addEventListener('click', () => {
  loadDocumentsFromStorage();
  renderDocTree();
  updateDocLabels();
  applyDocToEditor(getActiveDoc());
  showStatus('Loaded ✓');
  showToast(`"${getActiveDoc().name}" loaded`);
});

copyTextBtn.addEventListener('click', async () => {
  const text = editorContent.innerText || editorContent.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const range = document.createRange();
    range.selectNodeContents(editorContent);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
  }
  copyTextBtn.classList.add('copied');
  setTimeout(() => copyTextBtn.classList.remove('copied'), 1200);
  showToast('Text copied to clipboard');
});

function updateCounters() {
  const text = editorContent.innerText || editorContent.textContent || '';
  const trimmed = text.trim();
  const words = trimmed.length ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  wordCountEl.textContent = words;
  charCountEl.textContent = chars;
  docWordLabelEl.textContent = `Words ${words} | Characters: ${chars}`;
}

function refreshEmptyState() {
  if (editorContent.innerText.trim() === '') {
    editorContent.innerHTML = '';
  }
}

editorContent.addEventListener('input', () => {
  updateCounters();
  refreshEmptyState();
  pulseWaveform();
});

function buildWaveform() {
  if (!waveformEl) return;
  waveformEl.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const bar = document.createElement('span');
    bar.className = 'bar';
    waveformEl.appendChild(bar);
  }
}

let waveformTimer;
function pulseWaveform() {
  if (!waveformEl) return;
  waveformEl.classList.add('is-active');
  waveformEl.querySelectorAll('.bar').forEach(bar => {
    bar.style.height = (15 + Math.random() * 80) + '%';
  });
  clearTimeout(waveformTimer);
  waveformTimer = setTimeout(() => {
    waveformEl.classList.remove('is-active');
    waveformEl.querySelectorAll('.bar').forEach(bar => { bar.style.height = '20%'; });
  }, 900);
}

if (taCollapseBtn) {
  taCollapseBtn.addEventListener('click', () => {
    textAnalysisCard.classList.toggle('collapsed');
  });
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

function insertTextAtCursor(text) {
  editorContent.focus();
  if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
    document.execCommand('insertText', false, text);
  } else {
    editorContent.textContent += text;
  }
}

function setVoiceUI(listening) {
  isListening = listening;
  const label = listening ? 'Listening… (tap to stop)' : 'Start Voice Typing (Awaiting)';
  const icon = listening ? 'fa-microphone-lines' : 'fa-microphone';

  [voiceBtn, voiceBtnMobile].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('is-listening', listening);
  });
  if (voiceLabel) voiceLabel.textContent = label;
  if (voiceLabelMobile) voiceLabelMobile.textContent = label;
  if (voiceIcon) {
    voiceIcon.classList.remove('fa-microphone', 'fa-microphone-lines');
    voiceIcon.classList.add(icon);
  }
}

function startVoice() {
  if (!SpeechRecognitionAPI) {
    showToast('Voice typing is not supported in this browser. Try Chrome or Edge.');
    return;
  }
  if (!recognition) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      if (transcript) {
        insertTextAtCursor(transcript);
        updateCounters();
        pulseWaveform();
      }
    };
    recognition.onerror = () => { stopVoice(); };
    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch (e) { /* already stopping */ }
      }
    };
  }
  try {
    recognition.start();
    setVoiceUI(true);
    showToast('Voice typing started');
  } catch (e) {

  }
}

function stopVoice() {
  setVoiceUI(false);
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }
}

function toggleVoice() {
  if (isListening) stopVoice(); else startVoice();
}

if (voiceBtn) voiceBtn.addEventListener('click', toggleVoice);
if (voiceBtnMobile) voiceBtnMobile.addEventListener('click', toggleVoice);

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.setAttribute('data-theme', 'light');
  } else {
    document.body.removeAttribute('data-theme');
  }
  localStorage.setItem(STORAGE_THEME_KEY, theme);
}

function toggleTheme() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    showToast('Settings panel coming soon');
  });
}

function closeMobileSidebarIfOpen() {
  const el = document.getElementById('sidebarOffcanvas');
  if (!el || !window.bootstrap) return;
  const instance = bootstrap.Offcanvas.getInstance(el);
  if (instance) instance.hide();
}

function init() {
  loadDocumentsFromStorage();

  const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  renderDocTree();
  updateDocLabels();
  applyDocToEditor(getActiveDoc());

  buildWaveform();
}

document.addEventListener('DOMContentLoaded', init);