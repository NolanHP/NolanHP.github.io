// Static site build. Reads content/, writes plain HTML/CSS to dist/.
// Run: node build.mjs   (or: npm run build)

import { readFile, writeFile, mkdir, rm, readdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { homePage, projectPage, notFoundPage } from './src/templates.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const MAX_FEATURED = 3;

class ContentError extends Error {}

// ---------- front matter ----------
// Supports the small subset this site needs:
//   key: text            key: "quoted text"
//   key: true / false    key: [one, two, three]
// Lines starting with # and blank lines are ignored.

function parseValue(raw) {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner === '' ? [] : inner.split(',').map((s) => unquote(s.trim()));
  }
  return unquote(v);
}

function unquote(s) {
  const q = s[0];
  if (s.length >= 2 && (q === '"' || q === "'") && s.at(-1) === q) return s.slice(1, -1);
  return s;
}

function parseFile(text, file) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new ContentError(`${file}: must start with a front matter block between two --- lines.`);
  const data = {};
  m[1].split('\n').forEach((line, i) => {
    if (line.trim() === '' || line.trim().startsWith('#')) return;
    const kv = line.match(/^([A-Za-z_][\w-]*):(.*)$/);
    if (!kv) throw new ContentError(`${file}, front matter line ${i + 1}: expected "key: value", got "${line}".`);
    data[kv[1]] = parseValue(kv[2]);
  });
  return { data, body: m[2].trim() };
}

// ---------- projects ----------

function validateProject(p, file) {
  const problems = [];
  const text = (k) => typeof p[k] === 'string' && p[k] !== '';
  if (!text('title')) problems.push('title is required');
  if (!text('summary')) problems.push('summary is required');
  if (!Array.isArray(p.stack) || p.stack.length === 0) problems.push('stack is required, e.g. stack: [Python, FastAPI]');
  if (!text('github') || !/^https:\/\//.test(p.github)) problems.push('github is required and must start with https://');
  if (p.demo && !/^https?:\/\//.test(p.demo)) problems.push('demo must be a full URL');
  if (p.date && !/^\d{4}(-\d{2}){0,2}$/.test(p.date)) problems.push('date must look like 2026, 2026-11 or 2026-11-14');
  if (problems.length) throw new ContentError(`${file}:\n  - ${problems.join('\n  - ')}`);
}

async function loadProjects() {
  const dir = path.join(CONTENT, 'projects');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
  const projects = [];
  for (const f of files) {
    const rel = `content/projects/${f}`;
    // The file name becomes the URL, and GitHub Pages URLs are case-sensitive.
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(f)) {
      throw new ContentError(`${rel}: rename using only lowercase letters, numbers and hyphens, e.g. expense-splitter.md.`);
    }
    const { data, body } = parseFile(await readFile(path.join(dir, f), 'utf8'), rel);
    validateProject(data, rel);
    projects.push({
      ...data,
      slug: f.replace(/\.md$/, ''),
      featured: data.featured === true,
      sample: data.sample === true,
      date: data.date || '',
      hasWriteup: body !== '',
      html: body === '' ? '' : marked.parse(body),
    });
  }
  // Newest first; projects without a date go last. Ties keep filename order.
  projects.sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));
  return projects;
}

// ---------- build ----------

async function write(rel, html) {
  const out = path.join(DIST, rel);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

export async function build() {
  const site = JSON.parse(await readFile(path.join(CONTENT, 'site.json'), 'utf8'));
  const about = parseFile(await readFile(path.join(CONTENT, 'about.md'), 'utf8'), 'content/about.md');
  const projects = await loadProjects();
  const notes = [];

  site.url = (site.url || '').replace(/\/+$/, '');
  // Exact-case check: GitHub Pages is case-sensitive, so Resume.pdf would 404 at /resume.pdf.
  const publicFiles = existsSync(PUBLIC) ? await readdir(PUBLIC) : [];
  site.hasResume = publicFiles.includes('resume.pdf');
  const miscased = publicFiles.find((f) => f !== 'resume.pdf' && f.toLowerCase() === 'resume.pdf');
  if (miscased) notes.push(`public/${miscased} must be named exactly resume.pdf (lowercase) to be linked.`);
  else if (!site.hasResume) notes.push('No public/resume.pdf, so the Resume link is hidden.');
  if (!site.email) notes.push('"email" is empty in content/site.json, so the Email link is hidden.');
  if (!site.linkedin) notes.push('"linkedin" is empty in content/site.json, so the LinkedIn link is hidden.');

  let featured = projects.filter((p) => p.featured);
  if (featured.length > MAX_FEATURED) {
    notes.push(`${featured.length} projects are marked featured; only the ${MAX_FEATURED} newest are shown as featured.`);
    featured = featured.slice(0, MAX_FEATURED);
  }
  const rest = projects.filter((p) => !featured.includes(p));
  const samples = projects.filter((p) => p.sample).length;
  if (samples) notes.push(`${samples} sample project(s) are still published. Delete them from content/projects/ when you add real ones.`);

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  if (existsSync(PUBLIC)) await cp(PUBLIC, DIST, { recursive: true });
  await cp(path.join(ROOT, 'src', 'styles.css'), path.join(DIST, 'styles.css'));

  await write('index.html', homePage({ site, featured, rest, aboutHtml: marked.parse(about.body) }));
  for (const p of projects.filter((p) => p.hasWriteup)) {
    await write(`projects/${p.slug}/index.html`, projectPage({ site, project: p }));
  }
  await write('404.html', notFoundPage({ site }));

  console.log(`Built ${projects.length} project(s) into dist/`);
  for (const n of notes) console.log(`  note: ${n}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build().catch((err) => {
    console.error(err instanceof ContentError || err instanceof SyntaxError ? `Build failed.\n${err.message}` : err);
    process.exit(1);
  });
}
