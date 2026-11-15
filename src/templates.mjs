// Page templates. Plain functions that return HTML strings.
// `root` is the relative path back to the site root ("./" or "../../"), so the
// built site works at any URL: a domain root, a sub-folder, or your own server.

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400..600&display=swap';

function contactLinks(site, root) {
  const links = [{ label: 'GitHub', href: `https://github.com/${site.github}` }];
  if (site.linkedin) links.push({ label: 'LinkedIn', href: site.linkedin });
  if (site.email) links.push({ label: 'Email', href: `mailto:${site.email}` });
  if (site.hasResume) links.push({ label: 'Resume (PDF)', href: `${root}resume.pdf` });
  return links;
}

// `pagePath` is the page's path on the live site ("/" or "/projects/slug/"). Pass null for
// pages that shouldn't be indexed, like the 404 page.
function layout({ site, root, pagePath, title, description, body }) {
  const links = contactLinks(site, root);
  const pageUrl = site.url && pagePath ? site.url + pagePath : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${
  pageUrl
    ? `<link rel="canonical" href="${esc(pageUrl)}">
<meta property="og:url" content="${esc(pageUrl)}">`
    : '<meta name="robots" content="noindex">'
}
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${root}styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header wrap">
  <a class="site-name" href="${root}">${esc(site.name)}</a>
  <nav aria-label="Main">
    <a href="${root}#projects">Projects</a>
    <a href="${root}#about">About</a>
    ${site.hasResume ? `<a href="${root}resume.pdf">Resume</a>` : ''}
    <a href="https://github.com/${esc(site.github)}">GitHub</a>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer" id="contact">
  <div class="wrap footer-inner">
    <p class="footer-name">${esc(site.name)}</p>
    <ul class="link-row">
      ${links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n      ')}
    </ul>
  </div>
</footer>
</body>
</html>
`;
}

// ---------- shared project pieces ----------

const stackList = (p) =>
  `<ul class="stack" aria-label="Tech stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;

const sampleBadge = (p) => (p.sample ? ' <span class="badge">Sample entry</span>' : '');

// A project with a write-up links to its own page; one without links to GitHub.
const projectHref = (p, root) => (p.hasWriteup ? `${root}projects/${p.slug}/` : p.github);

function projectLinks(p, root, { writeup = true } = {}) {
  const items = [];
  if (writeup && p.hasWriteup) items.push(`<a href="${root}projects/${p.slug}/">Read the write-up</a>`);
  items.push(`<a href="${esc(p.github)}">Code on GitHub</a>`);
  if (p.demo) items.push(`<a href="${esc(p.demo)}">Live demo</a>`);
  return `<ul class="link-row">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

const year = (p) => (p.date ? p.date.slice(0, 4) : '');

// ---------- home ----------

function featuredEntry(p, root) {
  return `<article class="featured">
      <div class="featured-main">
        <h3><a href="${esc(projectHref(p, root))}">${esc(p.title)}</a>${sampleBadge(p)}</h3>
        <p class="prose">${esc(p.summary)}</p>
      </div>
      <div class="featured-side">
        ${stackList(p)}
        ${projectLinks(p, root)}
      </div>
    </article>`;
}

function listRow(p, root) {
  return `<li class="row">
        <h3><a href="${esc(projectHref(p, root))}">${esc(p.title)}</a>${sampleBadge(p)}</h3>
        <p class="row-summary prose">${esc(p.summary)}</p>
        <p class="row-stack">${p.stack.map(esc).join(', ')}</p>
        <p class="row-year">${esc(year(p))}</p>
      </li>`;
}

function experienceItem(e) {
  return `<li>
          <p class="exp-role">${esc(e.role)}</p>
          <p class="exp-where">${[e.org, e.period].filter(Boolean).map(esc).join(', ')}</p>
          ${e.note ? `<p class="exp-note prose">${esc(e.note)}</p>` : ''}
        </li>`;
}

export function homePage({ site, featured, rest, aboutHtml }) {
  const root = './';
  const links = contactLinks(site, root);
  const none = featured.length + rest.length === 0;

  const body = `<section class="hero wrap" aria-label="Introduction">
  <div class="court">
    <div class="court-top">
      <h1>${esc(site.name)}</h1>
      <p class="lede">${esc(site.tagline)}</p>
    </div>
    <p class="court-cell">${esc(site.status)}</p>
    <ul class="court-cell link-row">
      ${links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="wrap section" id="projects">
  ${
    none
      ? `<h2>Projects</h2>
  <p class="prose">No projects yet. Add a Markdown file to content/projects/ and rebuild.</p>`
      : ''
  }
  ${
    featured.length
      ? `<h2>Featured projects</h2>
  <div class="featured-list">
    ${featured.map((p) => featuredEntry(p, root)).join('\n    ')}
  </div>`
      : ''
  }
  ${
    rest.length
      ? `<h2${featured.length ? ' class="h2-follow"' : ''}>${featured.length ? 'More projects' : 'Projects'}</h2>
  <ul class="rows">
      ${rest.map((p) => listRow(p, root)).join('\n      ')}
  </ul>`
      : ''
  }
</section>

<section class="wrap section about" id="about">
  <div>
    <h2>About</h2>
    <div class="prose bio">
      ${aboutHtml}
    </div>
  </div>
  <div>
    <h2>Experience</h2>
    <ul class="experience">
        ${site.experience.map(experienceItem).join('\n        ')}
    </ul>
  </div>
</section>`;

  return layout({ site, root, pagePath: '/', title: `${site.name}, ${site.titleSuffix}`, description: site.tagline, body });
}

// ---------- project page ----------

export function projectPage({ site, project: p }) {
  const root = '../../';
  const body = `<article class="wrap project">
  <p class="back"><a href="${root}#projects">All projects</a></p>
  <header class="project-head">
    <h1>${esc(p.title)}${sampleBadge(p)}</h1>
    <p class="lede">${esc(p.summary)}</p>
  </header>
  <div class="project-body">
    <aside class="project-meta" aria-label="Project details">
      ${stackList(p)}
      ${projectLinks(p, root, { writeup: false })}
      ${year(p) ? `<p class="project-year">${esc(year(p))}</p>` : ''}
    </aside>
    <div class="prose writeup">
      ${p.html}
    </div>
  </div>
</article>`;

  return layout({ site, root, pagePath: `/projects/${p.slug}/`, title: `${p.title} | ${site.name}`, description: p.summary, body });
}

// ---------- 404 ----------

export function notFoundPage({ site }) {
  // Served for any missing URL, at any depth, so links here are absolute.
  const body = `<section class="wrap section">
  <h1 class="h1-small">Page not found</h1>
  <p class="prose">That address doesn't match a page on this site. <a href="/">Go to the home page</a>.</p>
</section>`;
  return layout({ site, root: '/', pagePath: null, title: `Page not found | ${site.name}`, description: 'Page not found.', body });
}
