# i18n Missing Translations Detector

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-6c63ff?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-00d4aa?style=for-the-badge)
![CI](https://img.shields.io/github/actions/workflow/status/AaqibhafeezKhan/i18n-Translations-missing-script/ci.yml?style=for-the-badge&label=CI)

**A zero-config CLI tool that catches untranslated i18n keys before they reach production.**

[🌐 Live Demo](https://aaqibhafeezkhan.github.io/i18n-Translations-missing-script/) · [📦 Sample Data](./sample/) · [🚀 Quick Start](#quick-start)

</div>

---

## What does it do?

When managing a multi-language app, it's easy to accidentally ship a translation
key that still holds the English value in all other languages. This tool scans
every `<lang>.json` file in your i18n folder and surfaces exactly those keys.

**Example — `msg.error` is "missed" in all languages:**

```json
// en.json  →  "msg.error": "Something went wrong."
// de.json  →  "msg.error": "Something went wrong."   ← same as EN ✖
// fr.json  →  "msg.error": "Something went wrong."   ← same as EN ✖
// it.json  →  "msg.error": "Something went wrong."   ← same as EN ✖
```

---

## Features

| Feature | Details |
|---|---|
| ⚡ **Zero config** | Works out-of-the-box — just point it at your i18n folder |
| 🌐 **Any languages** | Pass any comma-separated list of codes via `--langs` |
| 📋 **Whitelist support** | Exclude keys like "Ok" that are intentionally identical |
| 📊 **Structured JSON report** | Stats + per-key details written to a report file |
| 🚦 **CI-ready exit code** | Exits `1` when issues are found — blocks broken deployments |
| 🎨 **Colourised output** | Beautiful terminal output with summary table |

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/AaqibhafeezKhan/i18n-Translations-missing-script.git
cd i18n-Translations-missing-script
npm install

# 2. Run against the built-in sample (see sample/ folder)
npm run sample

# 3. Point at your own project
npx ts-node ./src/index.ts --path ./src/assets/i18n --verbose
```

---

## CLI Options

```
Usage: ts-node ./src/index.ts [options]

  --path      <dir>    Path to folder containing <lang>.json files  (default: ./i18n)
  --langs     <list>   Comma-separated language codes               (default: en,de,fr,it)
  --base      <lang>   Reference / base language code               (default: en)
  --whitelist <file>   JSON file with array of keys to ignore
  --output    <file>   Output report path                           (default: missed-translations.json)
  --verbose            Print every missed key to the console
  --help               Show this help
```

### Example with all options

```bash
npx ts-node ./src/index.ts \
  --path    ./src/assets/i18n \
  --langs   en,de,fr,it,es,pt \
  --base    en \
  --whitelist ./whitelist.json \
  --output  ./reports/missed.json \
  --verbose
```

---

## Sample Data

The `sample/` directory contains a ready-to-run demonstration:

```
sample/
├── i18n/
│   ├── en.json    ← base language (25 keys)
│   ├── de.json    ← German  (2 keys intentionally untranslated)
│   ├── fr.json    ← French  (3 keys intentionally untranslated)
│   └── it.json    ← Italian (2 keys intentionally untranslated)
└── whitelist.json ← 6 keys ignored (e.g. "Ok", "Yes", "No")
```

Run it with:

```bash
npm run sample
```

Expected output — the tool will find missed keys and write a report to
`sample/missed-translations.json`.

---

## Whitelist

Some words are correctly identical across languages (e.g. "Ok", brand names,
numeric values). List them in a JSON array and pass it via `--whitelist`:

```json
// whitelist.json
["btn.ok", "btn.yes", "btn.no", "form.email"]
```

```bash
ts-node ./src/index.ts --path ./i18n --whitelist ./whitelist.json
```

---

## Output Report

The tool writes a structured JSON report at the path specified by `--output`:

```json
{
  "generatedAt": "2026-04-10T12:00:00.000Z",
  "languages": ["en", "de", "fr", "it"],
  "baseLanguage": "en",
  "totalKeys": 25,
  "missedCount": 3,
  "whitelistedCount": 6,
  "missed": [
    {
      "key": "msg.error",
      "value": "Something went wrong. Please try again.",
      "languages": ["de", "fr", "it"]
    }
  ]
}
```

---

## CI Integration

Add a step to your GitHub Actions workflow to block PRs with missing translations:

```yaml
- name: 🔍 Check missing translations
  run: |
    npm ci
    npm run build
    node dist/index.js \
      --path ./src/assets/i18n \
      --whitelist ./whitelist.json \
      --verbose
```

The script exits with code `1` if any missed translations are found, failing the
CI check automatically.

---

## Scripts

| Command | Description |
|---|---|
| `npm run sample` | Run the tool against the built-in sample data |
| `npm run dev` | Run in watch mode (auto-restarts on file change) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | TypeScript type-check without emitting |
| `npm run check` | Single run of the script |

---

## Project Structure

```
i18n-Translations-missing-script/
├── src/
│   └── index.ts            ← Main CLI script
├── sample/
│   ├── i18n/               ← Sample translation files
│   │   ├── en.json
│   │   ├── de.json
│   │   ├── fr.json
│   │   └── it.json
│   └── whitelist.json      ← Sample whitelist
├── docs/                   ← GitHub Pages site
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .github/
│   └── workflows/
│       └── ci.yml          ← CI + Pages deployment
├── tsconfig.json
├── package.json
└── README.md
```

---

## Notes

- Words like **"Ok"**, **"Yes"**, **"No"** often translate the same across languages —
  add them to a whitelist rather than flagging them as errors.
- The tool checks for **missing**, **empty**, or **identical-to-base** values in
  non-base languages.
- Exit code `1` makes it drop-in safe for any CI/CD pipeline.

---

## License

ISC © [AaqibhafeezKhan](https://github.com/AaqibhafeezKhan)
