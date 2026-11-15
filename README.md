# Portfolio site

A static site. `content/` holds everything you edit; `node build.mjs` turns it into plain HTML and CSS in `dist/`.

```
content/
  site.json          name, tagline, contact links, experience list
  about.md           About text
  projects/*.md      one file per project
public/              copied to the site as-is (resume.pdf, images/, favicon.svg)
src/
  templates.mjs      page HTML
  styles.css         all styling; colors and fonts are variables at the top
build.mjs            the build script
dev.mjs              local preview server
.github/workflows/deploy.yml   builds and deploys on every push to main
```

## Run it locally

Needs Node 20 or newer.

```
npm install       # first time only; commit the package-lock.json it creates
npm run dev       # preview at http://localhost:4000, rebuilds when files change
npm run build     # one-off build into dist/
```

The build prints a note for anything it's hiding (missing resume, empty email) and stops with a message naming the file if a project is missing a required field.

## Add a project

1. Copy `content/projects/_template.md` to a new file in the same folder. The file name becomes the URL: `expense-splitter.md` is published at `/projects/expense-splitter/`.
2. Fill in the front matter (the block between the `---` lines):

   | Field | Required | Notes |
   |---|---|---|
   | `title` | yes | |
   | `summary` | yes | One or two sentences. Shown on the home page and at the top of the project page. |
   | `stack` | yes | `[Python, FastAPI, PostgreSQL]` |
   | `github` | yes | Full `https://` URL |
   | `demo` | no | Adds a "Live demo" link |
   | `date` | no | `2026`, `2026-11` or `2026-11-14`. Newest projects are listed first; the year is displayed. |
   | `featured` | no | `true` puts it in the large Featured section. At most 3 are shown there. |

3. Optionally write the longer write-up in Markdown below the front matter. With a write-up, the project gets its own page. Without one, its title links straight to GitHub.
4. Commit and push.

To remove a project, delete its file. Files starting with `_` are never published, so you can keep drafts as `_draft-name.md`.

Front matter is deliberately simple: one `key: value` per line, lists in `[square, brackets]`, `true`/`false`. A value that contains a comma inside a list needs quotes: `["Postgres, with PostGIS"]`.

The three `sample-*.md` files are placeholders marked `sample: true`, which shows a "Sample entry" badge. Delete them when you have real projects.

## Update your bio, links or resume

- **About text:** edit `content/about.md`.
- **Name, tagline, "Graduating June 2028" line:** edit `content/site.json`.
- **Email and LinkedIn:** fill in `email` and `linkedin` (full URL) in `content/site.json`. Each link appears once its value is set.
- **Experience list:** edit the `experience` array in `content/site.json`. `org`, `period` and `note` can be left as `""`. The tennis coach entry currently has none of them filled in.
- **Resume:** save your PDF as `public/resume.pdf`. The Resume links appear automatically; replace the file to update it.
- **Images for write-ups:** put them in `public/images/` and reference them as `/images/file.png`.

## Deploy (GitHub Pages)

One-time setup:

1. Create a public repository named `NolanHP.github.io` and push this folder to its `main` branch.
2. In the repository, go to Settings, then Pages, and set Source to "GitHub Actions".

After that, every push to `main` builds and publishes the site at `https://nolanhp.github.io`. The Actions tab shows each deploy and any build error.

If you use a different repository name, the site is served from `https://nolanhp.github.io/<repo>/`. Page links are relative so they still work there, but the 404 page's home link and `/images/...` paths in write-ups assume the site is at the root of its domain.

## Move it somewhere else

`dist/` is plain files with no server-side code, so any static host works:

- **Your own server:** `npm run build`, then copy `dist/` to the web root, e.g. `rsync -av --delete dist/ user@host:/var/www/portfolio/`, and point nginx or Caddy at that folder.
- **Cloudflare Pages, Netlify or Vercel:** connect the repository, set the build command to `npm run build` and the output directory to `dist`.

The one outside dependency at runtime is Google Fonts, loaded by a `<link>` in `src/templates.mjs`. To self-host the fonts, download Bricolage Grotesque and Source Serif 4, put the files in `public/fonts/`, add `@font-face` rules to `src/styles.css`, and remove the three font `<link>` lines. Without the fonts the site falls back to system fonts.

## Change the design

Colors, fonts and widths are CSS variables at the top of `src/styles.css`. Page structure is in `src/templates.mjs`; adding a project never requires touching either.
