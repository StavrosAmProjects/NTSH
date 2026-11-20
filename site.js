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
    : (language === 'el' ? 'Επίλεξε μια περίπτωση για να δεις το παράδειγμα.' : 'Choose a scenario to see the example.');
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
    status.textContent = language === 'el' ? 'ΔΟΚΙΜΗ' : 'DEMO';
    top.append(title, status);
    const id = document.createElement('code');
    id.textContent = report.id;
    const hash = document.createElement('small');
    hash.textContent = report.evidence
      ? `SHA-256 · ${report.evidence.sha256}`
      : (language === 'el' ? 'Χωρίς φωτογραφία' : 'No photo');
    const note = document.createElement('small');
    note.textContent = language === 'el'
      ? 'Τοπική δοκιμή. Δεν στάλθηκε σε αρχή. Η φωτογραφία δεν επαληθεύτηκε.'
      : 'Local demo. Not sent to an authority. Photo not verified.';
    item.append(top, id, hash, note);
    receiptList.append(item);
  });
  receiptCount.textContent = String(reports.length).padStart(2, '0');
  emptyReceipts.hidden = reports.length > 0;
}

function setCameraStatus(elMessage, enMessage, isError = false) {
  cameraStatus.dataset.el = elMessage;
  cameraStatus.dataset.en = enMessage;
  cameraStatus.textContent = cameraStatus.dataset[language];
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
  setCameraStatus(
    'Για να δοκιμάσεις τη λήψη, επίτρεψε την πρόσβαση στην κάμερα. Η φωτογραφία δεν θα επαληθευτεί.',
    'Allow camera access to try the capture. The photo will not be verified.'
  );
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus(
      'Η κάμερα δεν είναι διαθέσιμη σε αυτή τη σελίδα. Άνοιξε τη δοκιμή από το localhost με ενημερωμένο browser.',
      'Camera access is unavailable on this page. Open the demo through localhost in an up-to-date browser.',
      true
    );
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.hidden = false;
    await cameraVideo.play();
    setCameraStatus(
      'Η κάμερα λειτουργεί. Η φωτογραφία θα είναι συμπιεσμένο δείγμα, όχι το πρωτότυπο.',
      'The camera is on. The photo will be a compressed sample, not the original.'
    );
  } catch {
    cameraStream = null;
    setCameraStatus(
      'Δεν επιτράπηκε η πρόσβαση στην κάμερα. Έλεγξε τις ρυθμίσεις του browser και δοκίμασε ξανά.',
      'Camera access was denied. Check your browser settings and try again.',
      true
    );
  }
  updateControls();
}

async function sendCapturedImage() {
  if (!capturedImage || !idempotencyKey || submitting) return;
  submitting = true;
  submissionFailed = false;
  updateControls();
  setCameraStatus(
    'Η φωτογραφία στέλνεται στην εφαρμογή που τρέχει σε αυτόν τον υπολογιστή, για να υπολογιστεί το ψηφιακό της αποτύπωμα. Δεν πάει σε αρμόδια αρχή.',
    'Sending the photo to the demo running on this computer to calculate its file hash. It is not sent to an authority.'
  );
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
    setCameraStatus(
      'Η εφαρμογή δεν ολοκλήρωσε τη διαδικασία. Η φωτογραφία παραμένει σε αυτή τη σελίδα. Δοκίμασε ξανά.',
      'The demo did not finish processing the photo. It is still on this page. Try again.',
      true
    );
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
    setCameraStatus('Δεν δημιουργήθηκε η φωτογραφία. Δοκίμασε ξανά.', 'The photo could not be created. Try again.', true);
    return;
  }
  if (capturedImage.size > 4 * 1024 * 1024) {
    capturedImage = null;
    setCameraStatus('Η φωτογραφία είναι μεγαλύτερη από 4 MiB. Δοκίμασε ξανά.', 'The photo is larger than 4 MiB. Try again.', true);
    updateControls();
    return;
  }
  idempotencyKey = crypto.randomUUID();
  previewUrl = URL.createObjectURL(capturedImage);
  cameraPreview.src = previewUrl;
  cameraPreview.hidden = false;
  stopCamera();
  setCameraStatus(
    'Έτοιμη η δοκιμαστική φωτογραφία. Δεν είναι το πρωτότυπο και δεν έχει επαληθευτεί. Δημιουργείται η τοπική απόδειξη.',
    'Demo photo ready. It is not the original and has not been verified. Creating the local receipt.'
  );
  await sendCapturedImage();
}

function showMessage(key, isError = false) {
  const messages = {
    ready: { el: 'Έτοιμη η δοκιμή. Χρησιμοποίησε μόνο τα φανταστικά παραδείγματα.', en: 'The demo is ready. Please use the fictional examples only.' },
    unavailable: { el: 'Δεν μπορώ να συνδεθώ με την τοπική εφαρμογή. Άνοιξέ την με python3 app.py και δοκίμασε ξανά.', en: 'Could not connect to the local app. Start it with python3 app.py and try again.' },
    submitted: { el: 'Δημιουργήθηκε δοκιμαστική απόδειξη. Υπολογίστηκε το ψηφιακό αποτύπωμα και η φωτογραφία διαγράφηκε από την εφαρμογή. Δεν στάλθηκε σε αρχή.', en: 'Demo receipt created. The file hash was calculated and the photo was discarded. Nothing was sent to an authority.' },
    failed: { el: 'Δεν δημιουργήθηκε η απόδειξη. Μπορείς να δοκιμάσεις ξανά.', en: 'No receipt was created. You can try again.' },
  };
  message.dataset.key = key;
  message.textContent = messages[key][language];
  message.classList.toggle('is-error', isError);
}

categorySelect.addEventListener('change', () => {
  renderScenarios();
  renderPreview();
  message.textContent = '';
  delete message.dataset.key;
});
scenarioSelect.addEventListener('change', () => {
  renderPreview();
  updateControls();
});
syntheticConfirm.addEventListener('change', updateControls);
languageButton.addEventListener('click', () => {
  const currentMessage = message.dataset.key;
  const isError = message.classList.contains('is-error');
  language = language === 'el' ? 'en' : 'el';
  localizeStaticContent();
  if (currentMessage) showMessage(currentMessage, isError);
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
