/**
 * Live in-browser demo logic for the GitHub Pages landing page.
 * Mirrors the core detection logic from src/index.ts.
 */

function parseJSON(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}

function detectMissed(translations, baseLanguage, whitelist) {
  const baseMap = translations[baseLanguage] || {};
  const otherLangs = Object.keys(translations).filter(l => l !== baseLanguage);
  const missed = [];

  for (const key of Object.keys(baseMap)) {
    if (whitelist.has(key)) continue;
    const baseValue = baseMap[key];
    if (typeof baseValue !== 'string' || baseValue.trim() === '') continue;

    const untranslatedIn = otherLangs.filter(lang => {
      const val = translations[lang]?.[key];
      return val === baseValue || val === undefined || val === null || val === '';
    });

    if (untranslatedIn.length > 0) {
      missed.push({ key, value: baseValue, languages: untranslatedIn });
    }
  }
  return missed;
}

function runDemo() {
  const enRaw = document.getElementById('editor-en').value;
  const deRaw = document.getElementById('editor-de').value;
  const frRaw = document.getElementById('editor-fr').value;
  const itRaw = document.getElementById('editor-it').value;
  const esRaw = document.getElementById('editor-es').value;
  const whitelistRaw = document.getElementById('whitelist-input').value;

  const en = parseJSON(enRaw);
  const de = parseJSON(deRaw);
  const fr = parseJSON(frRaw);
  const it = parseJSON(itRaw);
  const es = parseJSON(esRaw);

  const resultsEl = document.getElementById('demo-results');
  const bodyEl    = document.getElementById('results-body');
  const badgeEl   = document.getElementById('results-badge');

  if (!en || !de || !fr || !it || !es) {
    bodyEl.innerHTML = '<p style="color:#ff6b6b;font-size:0.9rem;">⚠️  One or more JSON files are invalid. Check your syntax.</p>';
    resultsEl.classList.remove('hidden');
    badgeEl.textContent = 'JSON Error';
    badgeEl.className = 'results-badge fail';
    return;
  }

  const whitelist = new Set(
    whitelistRaw.split(',').map(k => k.trim()).filter(Boolean)
  );

  const translations = { en, de, fr, it, es };
  const missed = detectMissed(translations, 'en', whitelist);

  const totalKeys = Object.keys(en).length;
  const wlCount   = Object.keys(en).filter(k => whitelist.has(k)).length;
  const pct = totalKeys > 0 ? ((missed.length / totalKeys) * 100).toFixed(1) : '0.0';

  let html = '';

  if (missed.length === 0) {
    html += `<div class="result-ok">✅ All ${totalKeys} translation keys look good — no missing translations found!</div>`;
  } else {
    missed.forEach(({ key, value, languages }) => {
      html += `
        <div class="result-row">
          <div class="result-icon">❌</div>
          <div>
            <div class="result-key">${escHtml(key)}</div>
            <div class="result-val">"${escHtml(value)}"</div>
            <div class="result-langs">Untranslated in: ${languages.join(', ')}</div>
          </div>
        </div>`;
    });
  }

  html += `
    <div class="result-summary">
      <span>Total keys: <strong>${totalKeys}</strong></span>
      <span>Whitelisted: <strong>${wlCount}</strong></span>
      <span>Missing: <strong style="color:${missed.length > 0 ? '#ff6b6b' : '#00d4aa'}">${missed.length}</strong> (${pct}%)</span>
    </div>`;

  bodyEl.innerHTML = html;

  if (missed.length > 0) {
    badgeEl.textContent = `${missed.length} Missing`;
    badgeEl.className = 'results-badge fail';
  } else {
    badgeEl.textContent = 'All Good ✓';
    badgeEl.className = 'results-badge pass';
  }

  resultsEl.classList.remove('hidden');
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Auto-run on load as a nice first impression
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(runDemo, 500);
});
