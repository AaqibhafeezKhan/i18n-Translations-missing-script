#!/usr/bin/env node
/**
 * i18n-Translations-missing-script
 * Detects keys that are NOT translated (same value across all language files).
 *
 * Usage:
 *   ts-node ./src/index.ts [options]
 *
 * Options:
 *   --path      <dir>   Path to the i18n folder  (default: ./i18n)
 *   --langs     <list>  Comma-separated language codes to check (default: en,de,fr,it)
 *   --base      <lang>  The reference / base language   (default: en)
 *   --whitelist <file>  JSON file with an array of keys to ignore
 *   --output    <file>  Where to write the report        (default: missed-translations.json)
 *   --verbose           Print per-key results to stdout
 *   --help              Show this help text
 */

import { promises as fs } from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TranslationMap {
  [key: string]: string;
}

interface MissedTranslation {
  key: string;
  value: string;
  languages: string[]; // languages that repeat the base value
}

interface Report {
  generatedAt: string;
  i18nPath: string;
  languages: string[];
  baseLanguage: string;
  totalKeys: number;
  missedCount: number;
  whitelistedCount: number;
  missed: MissedTranslation[];
}

// ─── CLI argument parser ───────────────────────────────────────────────────────

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') { args['help'] = true; continue; }
    if (arg === '--verbose') { args['verbose'] = true; continue; }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function printHelp(): void {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║       i18n Missing Translations Detector  v2.0.0        ║
  ╚══════════════════════════════════════════════════════════╝

  Usage:
    npm run sample
    ts-node ./src/index.ts [options]

  Options:
    --path      <dir>    Path to folder containing <lang>.json files (default: ./i18n)
    --langs     <list>   Comma-separated language codes              (default: en,de,fr,it)
    --base      <lang>   Reference / base language code              (default: en)
    --whitelist <file>   JSON file with array of keys to ignore
    --output    <file>   Output report path                          (default: missed-translations.json)
    --verbose            Print every missed key to the console
    --help               Show this help

  Example:
    ts-node ./src/index.ts --path ./sample/i18n --whitelist ./sample/whitelist.json --verbose
`);
}

// ─── File helpers ─────────────────────────────────────────────────────────────

async function readJSON<T>(filePath: string): Promise<T> {
  const buffer = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(buffer) as T;
}

async function loadLanguageFile(
  i18nPath: string,
  lang: string
): Promise<TranslationMap> {
  const filePath = path.join(i18nPath, `${lang}.json`);
  try {
    return await readJSON<TranslationMap>(filePath);
  } catch {
    console.error(`  ✖  Could not load language file: ${filePath}`);
    return {};
  }
}

async function loadWhitelist(whitelistPath?: string): Promise<Set<string>> {
  if (!whitelistPath) return new Set();
  try {
    const list = await readJSON<string[]>(whitelistPath);
    console.log(`  ✔  Whitelist loaded — ${list.length} key(s) ignored`);
    return new Set(list);
  } catch {
    console.warn(`  ⚠  Whitelist file not found or invalid: ${whitelistPath}`);
    return new Set();
  }
}

// ─── Core detection logic ─────────────────────────────────────────────────────

/**
 * A key is "missed" (untranslated) when its value in one or more
 * non-base languages is IDENTICAL to the base-language value.
 */
function detectMissed(
  translations: Record<string, TranslationMap>,
  baseLanguage: string,
  whitelist: Set<string>
): MissedTranslation[] {
  const baseMap = translations[baseLanguage] ?? {};
  const otherLangs = Object.keys(translations).filter(l => l !== baseLanguage);

  const missed: MissedTranslation[] = [];

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

// ─── Output helpers ───────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';

function banner(): void {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗`);
  console.log(`║       i18n Missing Translations Detector  v2.0.0        ║`);
  console.log(`╚══════════════════════════════════════════════════════════╝${RESET}\n`);
}

function printVerbose(missed: MissedTranslation[]): void {
  missed.forEach(({ key, value, languages }) => {
    console.log(
      `  ${RED}✖${RESET} ${BOLD}${key}${RESET} → "${YELLOW}${value}${RESET}"  (untranslated in: ${languages.join(', ')})`
    );
  });
}

function printSummary(report: Report): void {
  const pct = report.totalKeys > 0
    ? ((report.missedCount / report.totalKeys) * 100).toFixed(1)
    : '0.0';

  console.log(`\n${BOLD}── Summary ────────────────────────────────────────────────${RESET}`);
  console.log(`  Languages checked : ${report.languages.join(', ')}`);
  console.log(`  Base language     : ${report.baseLanguage}`);
  console.log(`  Total keys        : ${report.totalKeys}`);
  console.log(`  Whitelisted       : ${YELLOW}${report.whitelistedCount}${RESET}`);
  console.log(`  Missing           : ${report.missedCount > 0 ? RED : GREEN}${report.missedCount}${RESET} (${pct}%)`);
  console.log(`  Report written to : ${CYAN}${report.i18nPath}${RESET}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args['help']) {
    printHelp();
    return;
  }

  banner();

  const i18nPath      = path.resolve((args['path']  as string) ?? './i18n');
  const baseLang      = (args['base']  as string) ?? 'en';
  const langsArg      = (args['langs'] as string) ?? 'en,de,fr,it';
  const languages     = langsArg.split(',').map(l => l.trim()).filter(Boolean);
  const whitelistPath = args['whitelist'] as string | undefined;
  const outputPath    = path.resolve((args['output'] as string) ?? 'missed-translations.json');
  const verbose       = Boolean(args['verbose']);

  console.log(`  📂  i18n path  : ${i18nPath}`);
  console.log(`  🌐  Languages  : ${languages.join(', ')}`);
  console.log(`  🔑  Base lang  : ${baseLang}\n`);

  // Load all language maps
  const translations: Record<string, TranslationMap> = {};
  for (const lang of languages) {
    translations[lang] = await loadLanguageFile(i18nPath, lang);
  }

  // Load whitelist
  const whitelist = await loadWhitelist(whitelistPath);

  // Count whitelisted keys
  const baseMap = translations[baseLang] ?? {};
  const whitelistedCount = Object.keys(baseMap).filter(k => whitelist.has(k)).length;

  // Detect missed translations
  const missed = detectMissed(translations, baseLang, whitelist);

  if (verbose && missed.length > 0) {
    console.log(`\n${BOLD}── Missed Keys ────────────────────────────────────────────${RESET}`);
    printVerbose(missed);
  }

  // Build report
  const report: Report = {
    generatedAt: new Date().toISOString(),
    i18nPath: outputPath,
    languages,
    baseLanguage: baseLang,
    totalKeys: Object.keys(baseMap).length,
    missedCount: missed.length,
    whitelistedCount,
    missed,
  };

  // Write report
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');

  printSummary(report);

  if (report.missedCount > 0) {
    process.exit(1); // Non-zero exit so CI pipelines can catch it
  }
}

run().catch(err => {
  console.error('\n  ✖  Fatal error:', err);
  process.exit(1);
});
