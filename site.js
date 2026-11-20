const languageButton = document.querySelector('#language');
const categorySelect = document.querySelector('#category-select');
const scenarioSelect = document.querySelector('#scenario-select');
const syntheticConfirm = document.querySelector('#synthetic-confirm');
const submitButton = document.querySelector('#submit-report');
const form = document.querySelector('#demo-form');
const message = document.querySelector('#form-message');
const preview = document.querySelector('#scenario-preview');
const receiptList = document.querySelector('#receipt-list');
const emptyReceipts = document.querySelector('#empty-receipts');
const receiptCount = document.querySelector('#receipt-count');
let language = document.documentElement.lang || 'el';
let catalog = { categories: {}, scenarios: {} };
let reports = [];

function text(key) {
  return document.querySelector(`[data-copy="${key}"]`)?.dataset[language] || '';
}

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
  submitButton.disabled = !category || !scenarioSelect.value || !syntheticConfirm.checked;
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
    status.textContent = language === 'el' ? 'DEMO' : 'DEMO';
    top.append(title, status);
    const id = document.createElement('code');
    id.textContent = report.id;
    const note = document.createElement('small');
    note.textContent = language === 'el' ? 'Τοπικό · δεν διαβιβάστηκε' : 'Local · not transmitted';
    item.append(top, id, note);
    receiptList.append(item);
  });
  receiptCount.textContent = String(reports.length).padStart(2, '0');
  emptyReceipts.hidden = reports.length > 0;
}

function showMessage(key, isError = false) {
  const messages = {
    ready: { el: 'Τοπικός server έτοιμος. Χρησιμοποίησε μόνο τα φανταστικά παραδείγματα.', en: 'Local server ready. Use fictional examples only.' },
    unavailable: { el: 'Ο τοπικός server δεν είναι διαθέσιμος. Εκκίνησέ τον με python3 app.py.', en: 'Local server unavailable. Start it with python3 app.py.' },
    required: { el: 'Επίλεξε παράδειγμα και επιβεβαίωσε ότι είναι φανταστικό.', en: 'Choose a scenario and confirm it is fictional.' },
    submitted: { el: 'Δημιουργήθηκε τοπικός demo αριθμός. Δεν στάλθηκε πουθενά.', en: 'Local demo ID created. Nothing was sent.' },
    failed: { el: 'Δεν δημιουργήθηκε demo αριθμός. Έλεγξε ξανά τη σύνδεση.', en: 'The demo ID was not created. Check the connection and retry.' },
  };
  message.textContent = messages[key][language];
  message.classList.toggle('is-error', isError);
}

categorySelect.addEventListener('change', () => {
  renderScenarios();
  renderPreview();
  message.textContent = '';
});
scenarioSelect.addEventListener('change', renderPreview);
syntheticConfirm.addEventListener('change', () => {
  submitButton.disabled = !scenarioSelect.value || !syntheticConfirm.checked;
});
languageButton.addEventListener('click', () => {
  language = language === 'el' ? 'en' : 'el';
  localizeStaticContent();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submitButton.disabled = true;
  showMessage('ready');
  try {
    const result = await api('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioSelect.value, confirmed_synthetic: syntheticConfirm.checked }),
    });
    reports.unshift(result.report);
    renderReceipts();
    showMessage('submitted');
    syntheticConfirm.checked = false;
  } catch (error) {
    showMessage(error.message === 'Failed to fetch' ? 'unavailable' : 'failed', true);
  } finally {
    submitButton.disabled = !scenarioSelect.value || !syntheticConfirm.checked;
  }
});

async function initialize() {
  localizeStaticContent();
  try {
    [catalog, { reports }] = await Promise.all([api('/api/scenarios'), api('/api/reports')]);
    renderCategories();
    renderScenarios();
    renderPreview();
    renderReceipts();
    showMessage('ready');
  } catch {
    categorySelect.disabled = true;
    scenarioSelect.disabled = true;
    submitButton.disabled = true;
    showMessage('unavailable', true);
  }
}

initialize();
