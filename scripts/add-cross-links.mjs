#!/usr/bin/env node
/**
 * Cross-link script: scans all MDX content files and adds hyperlinks
 * when they mention location names that exist as place pages on the site.
 *
 * Rules:
 * - Only links the FIRST occurrence of each place name per file
 * - Skips existing links, code blocks, JSX component attributes
 * - Skips headings, image-only lines, and JSX tag lines
 * - Sorts place names longest-first to avoid partial-match conflicts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const PLACES_DIR = path.join(CONTENT_DIR, 'places');

// ─── Simple frontmatter title parser ─────────────────────────────────────────

function parseTitleFromFrontmatter(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/m);
  if (!fmMatch) return null;
  const yaml = fmMatch[1];
  // Match: title: "value", title: 'value', or title: value
  const m = yaml.match(/^title:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(.*?))\s*$/m);
  if (!m) return null;
  return (m[1] ?? m[2] ?? m[3] ?? '').trim();
}

// ─── Build the place map ──────────────────────────────────────────────────────

function buildPlaceMap() {
  const map = new Map(); // name → url

  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.name.endsWith('.mdx')) {
        const content = fs.readFileSync(full, 'utf-8');
        const title = parseTitleFromFrontmatter(content);
        if (title) {
          const url =
            '/' +
            path
              .relative(PLACES_DIR, full)
              .replace(/\\/g, '/')
              .replace(/\.mdx$/, '');
          map.set(title, url);
        }
      }
    }
  }

  scan(PLACES_DIR);

  // Manual aliases for place titles that have descriptive prefixes,
  // alternate spellings, or common short-form names used in prose.
  const aliases = {
    // Germany
    Munich: '/europe/germany/munich',
    Düsseldorf: '/europe/germany/dusseldorf',
    // Italy
    Rome: '/europe/italy/rome',
    // Tanzania
    Moshi: '/africa/tanzania/moshi',
    Kilimanjaro: '/africa/tanzania/mt-kilimanjaro',
    'Mt Kilimanjaro': '/africa/tanzania/mt-kilimanjaro',
    'Mount Kilimanjaro': '/africa/tanzania/mt-kilimanjaro',
    Serengeti: '/africa/tanzania/serengeti-national-park',
    'Serengeti National Park': '/africa/tanzania/serengeti-national-park',
    Kendwa: '/africa/tanzania/kendwa',
    'Stone Town': '/africa/tanzania/zanzibar/stone-town',
    // Uganda
    Bwindi: '/africa/uganda/bwindi-impenetrable-forest-national-park',
    // Greece
    Kos: '/europe/greece/kos',
    // Costa Rica
    'La Fortuna': '/north-america/costa-rica/la-fortuna',
    Monteverde: '/north-america/costa-rica/monteverde',
    Pacuare: '/north-america/costa-rica/pacuare',
    // Mexico
    Palenque: '/north-america/mexico/palenque',
    Yaxchilan: '/north-america/mexico/yaxchilan',
    'Chichen Itza': '/north-america/mexico/chichen-itza',
    // Jordan
    'Little Petra': '/asia/jordan/little-petra',
    Madaba: '/asia/jordan/madaba',
    // Switzerland
    Meyrin: '/europe/switzerland/meyrin',
    CERN: '/europe/switzerland/meyrin',
    // France
    'Le Châtelard': '/europe/france/le-chatelard',
    Chamonix: '/europe/france/chamonix',
    // Canada
    'Niagara Falls': '/north-america/canada/niagara-falls',
    // Ireland
    Galway: '/europe/ireland/galway',
    // UK
    Exeter: '/europe/united-kingdom/devon/exeter',
    Bushmills: '/europe/united-kingdom/northern-ireland/bushmills',
    Cowes: '/europe/united-kingdom/england/isle-of-wight/cowes',
    // Bosnia
    Konjic: '/europe/bosnia-and-herzegovina/konjic',
    // Sweden
    Abisko: '/europe/sweden/norbotten/abisko-ostra',
    Hemavan: '/europe/sweden/vasterbotten/hemavan',
    Gothenburg: '/europe/sweden/vastra-gotaland/gothenburg',
    Göteborg: '/europe/sweden/vastra-gotaland/gothenburg',
    // Ecuador
    'Isla Santa Cruz': '/south-america/ecuador/isla-santa-cruz',
    'Isla Isabela': '/south-america/ecuador/isla-isabela',
    'Isla Floreana': '/south-america/ecuador/isla-floreana',
    // Other
    Fénis: '/europe/italy/fenis',
  };

  for (const [alias, url] of Object.entries(aliases)) {
    if (!map.has(alias)) {
      map.set(alias, url);
    }
  }

  return map;
}

// ─── Names to skip (too ambiguous or too short) ───────────────────────────────

const SKIP_NAMES = new Set([
  // Common English words
  'Nice',   // adjective
  'Side',   // noun/verb
  'Split',  // verb/noun
  'Tuna',   // fish
  'Par',    // golf/average
  'Ale',    // drink
  // Very short (≤3 chars)
  'Vik',
  'Ryd',
  'Bala',
  'Tong',
  'Mora',
  // Drafts / non-real pages
  'Indonesia — draft',
  'Kazakhstan — draft',
  // Overly descriptive titles that don't appear in prose as-is
  'Terrain of Costa Rica',
  'Bonampak Ruins & Temple of the Murals',
  'Mayan Ruins of Yaxchilan',
  'Visit the Ruins of Chichen Itza',
  'Explore the town of Le Châtelard',
  'Exploring Chamonix, Mont Blanc and Aiguille du Midi',
  'Explore Palenque and it\'s Ruins',
  'Explore Rome',
  'Discover Munich',
  'Visit Düsseldorf',
  'Visit the beautiful island of Kos',
  'VIsiting CERN at the village of Meyrin',
  'Traveling to Galway & Isles of Aran',
  'Adventures in La Fortuna',
  'Monteverde | Cloud Forests and Adventures',
  'Pacuare & Whitewater Rafting',
  'Bushmills & The Giant\'s Causeway',
  'Cowes & East Cowes',
  'Konjic and Stara Ćuprija',
  'Madeba & the Church of the Map',
  'Hiking the Machame Route to Kilimanjaro\'s summit',
  'Safaris in the Serengeti National Park',
  'Moshi - Gateway to Kilimanjaro',
  'Kendwa Beach, Zanzibar',
  'Exeter & Castle Drogo',
  'Castello di Fénis in Fénis',
  'Siq al-Barid (Little Petra)',
  'Niagara Falls, Ontario',
  'American Museum of Natural History',
  'Intrepid Sea, Air & Space Museum',
  'Busch Gardens Williamsburg',
  'Chesapeake Bay Bridge-Tunnel',
  'Jamestown Beach Campsites',
  'Maryland Forest, Park & Wildlife camping',
  'Washington Monument',
  'Delaware Memorial Bridge',
  'Kennedy Space Center',
  'Poiana Braşov',
]);

// ─── Line-level linkification ─────────────────────────────────────────────────

/**
 * Replaces first occurrences of place names in a line with markdown links.
 * `linked` is a Set tracking which names have already been linked in this file.
 */
function linkifyLine(line, sortedNames, placeMap, currentUrl, linked) {
  const shields = [];

  const shield = (str) => {
    const idx = shields.length;
    shields.push(str);
    return `\x00S${idx}\x00`;
  };

  let result = line;

  // 1. Protect existing markdown links: [text](url) and ![alt](url)
  result = result.replace(/!?\[(?:[^\]]*)\]\((?:[^)]*)\)/g, shield);

  // 2. Apply place name replacements (longest first, first-occurrence-per-file)
  for (const name of sortedNames) {
    if (linked.has(name)) continue; // Already linked earlier in this file

    const url = placeMap.get(name);
    if (!url || url === currentUrl) continue;

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the name when not preceded by [ / or \w, and not followed by \w or ]
    const regex = new RegExp(`(?<![\\[/\\w])${escaped}(?![\\w\\]])`, 'g');

    let matched = false;
    result = result.replace(regex, (match) => {
      if (!matched) {
        matched = true;
        const link = `[${name}](${url})`;
        return shield(link); // Protect the newly created link
      }
      // Subsequent occurrences on the same line: link them too (rare)
      return shield(`[${name}](${url})`);
    });

    if (matched) {
      linked.add(name); // Mark as linked for this file
    }
  }

  // 3. Restore all shields
  // Run multiple passes in case of nested references (shouldn't happen but safe)
  let prev = '';
  while (prev !== result) {
    prev = result;
    result = result.replace(/\x00S(\d+)\x00/g, (_, i) => shields[parseInt(i, 10)]);
  }

  return result;
}

// ─── File processor ───────────────────────────────────────────────────────────

function processFile(filePath, sortedNames, placeMap) {
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Extract frontmatter
  const fmMatch = raw.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/);
  if (!fmMatch) return null;

  const frontmatter = fmMatch[1];
  const body = raw.slice(frontmatter.length);

  // Determine this file's own URL (for place files, to avoid self-linking)
  let currentUrl = null;
  if (filePath.includes(`${path.sep}places${path.sep}`) || filePath.includes('/places/')) {
    currentUrl =
      '/' +
      path
        .relative(PLACES_DIR, filePath)
        .replace(/\\/g, '/')
        .replace(/\.mdx$/, '');
  }

  // Per-file tracking of which place names have been linked
  const linked = new Set();

  let inCodeBlock = false;
  let anyChange = false;
  const newLines = [];

  for (const line of body.split('\n')) {
    const trimmed = line.trim();

    // ── Code block toggle ──
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      newLines.push(line);
      continue;
    }
    if (inCodeBlock) {
      newLines.push(line);
      continue;
    }

    // ── Skip JSX tag lines (open/close tags) ──
    if (trimmed.startsWith('<')) {
      newLines.push(line);
      continue;
    }

    // ── Skip JSX prop assignment lines (e.g. `    title="..."`) ──
    // These look like: optional whitespace, identifier, = or {
    if (/^\s{2,}\w[\w-]*\s*[=]/.test(line)) {
      newLines.push(line);
      continue;
    }

    // ── Skip headings ──
    if (trimmed.startsWith('#')) {
      newLines.push(line);
      continue;
    }

    // ── Skip horizontal rules ──
    if (/^(\*\s*){3,}$|^(-\s*){3,}$|^(=\s*){3,}$/.test(trimmed)) {
      newLines.push(line);
      continue;
    }

    // ── Skip image-only lines ──
    if (trimmed.startsWith('![') || trimmed.startsWith('![ ')) {
      newLines.push(line);
      continue;
    }

    // ── Skip empty lines ──
    if (!trimmed) {
      newLines.push(line);
      continue;
    }

    // ── Process this prose line ──
    const newLine = linkifyLine(line, sortedNames, placeMap, currentUrl, linked);
    if (newLine !== line) anyChange = true;
    newLines.push(newLine);
  }

  if (!anyChange) return null;

  return frontmatter + newLines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const placeMap = buildPlaceMap();

// Build sorted name list (longest first, skipping ambiguous/short)
const sortedNames = [...placeMap.keys()]
  .filter((name) => !SKIP_NAMES.has(name) && name.length >= 4)
  .sort((a, b) => b.length - a.length);

console.log(`Place names available for linking: ${sortedNames.length}`);

// Collect all MDX files
function collectMdx(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMdx(full, files);
    else if (entry.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

const allFiles = collectMdx(CONTENT_DIR);
console.log(`Scanning ${allFiles.length} MDX files…\n`);

let modified = 0;
const dryRun = process.argv.includes('--dry-run');

for (const filePath of allFiles) {
  const newContent = processFile(filePath, sortedNames, placeMap);
  if (newContent) {
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
    }
    const rel = path.relative(ROOT, filePath);
    console.log(`  ${dryRun ? '[dry] ' : ''}${rel}`);
    modified++;
  }
}

console.log(`\n${dryRun ? 'Would modify' : 'Modified'} ${modified} files.`);
