const languageButton = document.querySelector('#language');
const categorySelect = document.querySelector('#category-select');
const scenarioSelect = document.querySelector('#scenario-select');
const syntheticConfirm = document.querySelector('#synthetic-confirm');
const form = document.querySelector('#demo-form');
const message = document.querySelector('#form-message');
const preview = document.querySelector('#scenario-preview');
const receiptList = document.querySelector('#receipt-list');
const emptyReceipts = document.querySelector('#empty-receipts');
const receiptCount = document.querySelector('#receipt-count');
const startCameraButton = document.querySelector('#start-camera');
const captureButton = document.querySelector('#capture-photo');
const retakeButton = document.querySelector('#retake-photo');
const retryButton = document.querySelector('#retry-upload');
const cameraVideo = document.querySelector('#camera-video');
const cameraPreview = document.querySelector('#camera-preview');
const captureCanvas = document.querySelector('#capture-canvas');
const cameraStatus = document.querySelector('#camera-status');
let language = document.documentElement.lang || 'el';
let catalog = { categories: {}, scenarios: {} };
let reports = [];
let cameraStream = null;
let capturedImage = null;
let previewUrl = null;
let idempotencyKey = null;
let submissionFailed = false;
let submitting = false;

function localizeStaticContent() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-el][data-en]').forEach((node) => {
    node.innerHTML = node.dataset[language];
  });
  document.querySelectorAll('[data-el-aria][data-en-aria]').forEach((node) => {
    node.setAttribute('aria-label', node.getAttribute(`data-${language}-aria`));
  });
  languageButton.textContent = language === 'el' ? 'EN' : 'ΕΛ';
  renderCategories();
  renderScenarios();
  renderPreview();
  renderReceipts();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'request_failed');
  return body;
}

function addOption(select, value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function renderCategories() {
  const previous = categorySelect.value;
  categorySelect.replaceChildren();
  addOption(categorySelect, '', language === 'el' ? 'Διάλεξε κατηγορία' : 'Choose a category');
  Object.entries(catalog.categories).forEach(([id, labels]) => addOption(categorySelect, id, labels[language]));
  categorySelect.value = Object.hasOwn(catalog.categories, previous) ? previous : '';
  categorySelect.disabled = !Object.keys(catalog.categories).length;
}

function renderScenarios() {
  const previous = scenarioSelect.value;
  const category = catalog.categories[categorySelect.value];
  scenarioSelect.replaceChildren();
  addOption(scenarioSelect, '', category
    ? (language === 'el' ? 'Διάλεξε παράδειγμα' : 'Choose a scenario')
    : (language === 'el' ? 'Πρώτα διάλεξε κατηγορία' : 'Choose a category first'));
  Object.entries(catalog.scenarios)
    .filter(([, scenario]) => scenario.category === categorySelect.value)
    .forEach(([id, scenario]) => addOption(scenarioSelect, id, scenario.title[language]));
  scenarioSelect.value = catalog.scenarios[previous]?.category === categorySelect.value ? previous : '';
  scenarioSelect.disabled = !category;
  updateControls();
}

function renderPreview() {
  const scenario = catalog.scenarios[scenarioSelect.value];
  const paragraph = preview.querySelector('p');
  paragraph.textContent = scenario
    ? scenario.summary[language]
    : (language === 'el' ? 'Η περιγραφή του επιλεγμένου παραδείγματος θα εμφανιστεί εδώ.' : 'The selected example will appear here.');
  preview.classList.toggle('has-scenario', Boolean(scenario));
}

function renderReceipts() {
  receiptList.replaceChildren();
  reports.forEach((report) => {
    const item = document.createElement('li');
    const top = document.createElement('div');
    top.className = 'receipt-top';
    const title = document.createElement('strong');
    title.textContent = report.scenario_title[language];
    const status = document.createElement('span');
    status.className = 'receipt-status';
    status.textContent = 'DEMO';
    top.append(title, status);
    const id = document.createElement('code');
    id.textContent = report.id;
    const hash = document.createElement('small');
    hash.textContent = report.evidence
      ? `SHA-256 · ${report.evidence.sha256}`
      : (language === 'el' ? 'Χωρίς εικόνα' : 'No image');
    const note = document.createElement('small');
    note.textContent = language === 'el'
      ? 'Τοπικό · δεν διαβιβάστηκε · προέλευση εικόνας μη επαληθευμένη'
      : 'Local · not transmitted · image source unverified';
    item.append(top, id, hash, note);
    receiptList.append(item);
  });
  receiptCount.textContent = String(reports.length).padStart(2, '0');
  emptyReceipts.hidden = reports.length > 0;
}

function setCameraStatus(messageText, isError = false) {
  cameraStatus.textContent = messageText;
  cameraStatus.classList.toggle('is-error', isError);
}

function updateControls() {
  const ready = Boolean(scenarioSelect.value && syntheticConfirm.checked);
  startCameraButton.disabled = !ready || Boolean(capturedImage || cameraStream || submitting);
  captureButton.disabled = !ready || !cameraStream || Boolean(capturedImage || submitting);
  retakeButton.hidden = !capturedImage;
  retakeButton.disabled = submitting;
  retryButton.hidden = !capturedImage || !submissionFailed;
  retryButton.disabled = submitting;
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  cameraVideo.srcObject = null;
  cameraVideo.hidden = true;
  updateControls();
}

function clearCapture() {
  capturedImage = null;
  idempotencyKey = null;
  submissionFailed = false;
  cameraPreview.hidden = true;
  cameraPreview.removeAttribute('src');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  stopCamera();
  setCameraStatus(language === 'el'
    ? 'Χρειάζεται άδεια κάμερας. Η λήψη θα είναι μη επαληθευμένο δείγμα browser.'
    : 'Camera permission is needed. This will be an unverified browser sample.');
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus(language === 'el'
      ? 'Η κάμερα δεν υποστηρίζεται σε αυτό το browser ή origin. Χρησιμοποίησε localhost και σύγχρονο browser.'
      : 'Camera is unavailable in this browser or origin. Use localhost and a current browser.', true);
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.hidden = false;
    await cameraVideo.play();
    setCameraStatus(language === 'el'
      ? 'Η κάμερα είναι ενεργή. Η λήψη browser δεν είναι C2PA ή native αποδεικτικό.'
      : 'Camera is active. Browser capture is not C2PA or native evidence.');
  } catch {
    cameraStream = null;
    setCameraStatus(language === 'el'
      ? 'Δεν δόθηκε πρόσβαση στην κάμερα. Έλεγξε τις άδειες browser και ξαναδοκίμασε.'
      : 'Camera access was not granted. Check browser permissions and try again.', true);
  }
  updateControls();
}

async function sendCapturedImage() {
  if (!capturedImage || !idempotencyKey || submitting) return;
  submitting = true;
  submissionFailed = false;
  updateControls();
  setCameraStatus(language === 'el'
    ? 'Υπολογίζεται hash στον τοπικό server. Δεν γίνεται διαβίβαση σε Αρχή.'
    : 'Hashing on the local server. No authority delivery is occurring.');
  try {
    const result = await api('/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': capturedImage.type,
        'X-Scenario-ID': scenarioSelect.value,
        'X-Confirmed-Synthetic': String(syntheticConfirm.checked),
        'Idempotency-Key': idempotencyKey,
      },
      body: capturedImage,
    });
    reports = [result.report, ...reports.filter((report) => report.id !== result.report.id)].slice(0, 50);
    renderReceipts();
    showMessage('submitted');
    syntheticConfirm.checked = false;
    clearCapture();
  } catch {
    submissionFailed = true;
    showMessage('failed', true);
    setCameraStatus(language === 'el'
      ? 'Δεν έγινε τοπικός υπολογισμός. Η εικόνα παραμένει μόνο σε αυτή τη σελίδα· μπορείς να επαναλάβεις.'
      : 'Local hashing failed. The image remains only in this page; you can retry.', true);
  } finally {
    submitting = false;
    updateControls();
  }
}

async function capturePhoto() {
  if (!cameraStream || !cameraVideo.videoWidth || submitting) return;
  const scale = Math.min(1, 1600 / cameraVideo.videoWidth, 1600 / cameraVideo.videoHeight);
  captureCanvas.width = Math.round(cameraVideo.videoWidth * scale);
  captureCanvas.height = Math.round(cameraVideo.videoHeight * scale);
  captureCanvas.getContext('2d', { alpha: false }).drawImage(cameraVideo, 0, 0, captureCanvas.width, captureCanvas.height);
  capturedImage = await new Promise((resolve) => captureCanvas.toBlob(resolve, 'image/jpeg', 0.88));
  if (!capturedImage) {
    setCameraStatus(language === 'el' ? 'Δεν δημιουργήθηκε εικόνα. Δοκίμασε ξανά.' : 'Could not create image. Try again.', true);
    return;
  }
  if (capturedImage.size > 4 * 1024 * 1024) {
    capturedImage = null;
    setCameraStatus(language === 'el' ? 'Το δείγμα είναι μεγαλύτερο από 4 MiB. Δοκίμασε ξανά.' : 'The image sample exceeds 4 MiB. Try again.', true);
    updateControls();
    return;
  }
  idempotencyKey = crypto.randomUUID();
  previewUrl = URL.createObjectURL(capturedImage);
  cameraPreview.src = previewUrl;
  cameraPreview.hidden = false;
  stopCamera();
  setCameraStatus(language === 'el'
    ? 'Δείγμα browser έτοιμο. Δεν είναι πρωτότυπο ούτε επαληθευμένο. Δημιουργείται τοπικό demo.'
    : 'Browser sample ready. It is not original or verified. Creating a local demo.');
  await sendCapturedImage();
}

function showMessage(key, isError = false) {
  const messages = {
    ready: { el: 'Τοπικός server έτοιμος. Χρησιμοποίησε μόνο τα φανταστικά παραδείγματα.', en: 'Local server ready. Use fictional examples only.' },
    unavailable: { el: 'Ο τοπικός server δεν είναι διαθέσιμος. Εκκίνησέ τον με python3 app.py.', en: 'Local server unavailable. Start it with python3 app.py.' },
    submitted: { el: 'Δημιουργήθηκε τοπικός demo αριθμός. Υπολογίστηκε hash· η εικόνα απορρίφθηκε. Δεν στάλθηκε σε Αρχή.', en: 'Local demo ID created. Hash calculated; image bytes discarded. Nothing was sent to an authority.' },
    failed: { el: 'Δεν δημιουργήθηκε demo αριθμός. Μπορείς να επαναλάβεις τον τοπικό υπολογισμό.', en: 'No demo ID was created. You can retry the local hash operation.' },
  };
  message.textContent = messages[key][language];
  message.classList.toggle('is-error', isError);
}

categorySelect.addEventListener('change', () => {
  renderScenarios();
  renderPreview();
  message.textContent = '';
});
scenarioSelect.addEventListener('change', () => {
  renderPreview();
  updateControls();
});
syntheticConfirm.addEventListener('change', updateControls);
languageButton.addEventListener('click', () => {
  language = language === 'el' ? 'en' : 'el';
  localizeStaticContent();
});
startCameraButton.addEventListener('click', openCamera);
captureButton.addEventListener('click', capturePhoto);
retakeButton.addEventListener('click', () => {
  clearCapture();
  updateControls();
});
retryButton.addEventListener('click', sendCapturedImage);
form.addEventListener('submit', (event) => event.preventDefault());

async function initialize() {
  localizeStaticContent();
  try {
    [catalog, { reports }] = await Promise.all([api('/api/v1/scenarios'), api('/api/v1/reports')]);
    renderCategories();
    renderScenarios();
    renderPreview();
    renderReceipts();
    showMessage('ready');
  } catch {
    categorySelect.disabled = true;
    scenarioSelect.disabled = true;
    startCameraButton.disabled = true;
    captureButton.disabled = true;
    showMessage('unavailable', true);
  }
}

window.addEventListener('pagehide', stopCamera);
initialize();
