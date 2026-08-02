# club-site-generator-core

The core for all the sites created using the site generator.

The shared static-site generator engine behind every club's website. This repo
contains **no club data** — `build.js`, the JSON schema, and the HTML/CSS
templates only. Each club's actual content (`club.json`, `images/`) lives in
its own dedicated repo, which pulls this engine in via `git subtree` under a
`generator/` subfolder. If you're looking for a specific club's content or
site, you're in the wrong repo — go to that club's own `<slug>-site` repo.

## What's here

```
build.js               # reads club.json, validates it, renders HTML, optimizes+strips images
club.schema.json        # ajv schema every club.json must satisfy
wrangler.jsonc          # Cloudflare Workers config (assets.directory = dist)
scripts/
  club-target.js         # slug -> Worker name resolution, shared by build.js + deploy.js
  deploy.js               # wrangler deploy wrapper
  _dev-static-server.js   # throwaway local preview server (not part of build/deploy)
template/                # page.html, app-shell.html, style.css, app-shell.css, sections/*.html
```

## Building locally

This repo has no club data of its own, so building requires pointing it at
some `club.json` — either a throwaway fixture for testing the engine itself,
or (via `CLUB_DATA_DIR`) at a real club repo's data:

```bash
npm install
mkdir -p clubs/test-fixture
echo '{ "clubName": "Test Fixture" }' > clubs/test-fixture/club.json
node build.js --club=test-fixture
```

## CLI / environment variables

`build.js` and `scripts/deploy.js` both resolve a club slug the same way (see
`scripts/club-target.js`):
1. `--club=<slug>` flag
2. `CLUB_SLUG` environment variable
3. Falls back to `example-club` (build.js only; deploy.js requires one to be set)

Once a slug is resolved, where its `club.json`/`images/` actually live is
controlled by `CLUB_DATA_DIR`:
- **Unset** (default): looks in this repo's own `clubs/<slug>/` — useful only
  for local engine testing, since this repo doesn't ship real club data.
- **Set** (e.g. `CLUB_DATA_DIR=..`): resolves relative to this repo's own
  directory. In a club repo where this engine sits at `generator/` and
  `club.json` sits one level up at the repo root, `CLUB_DATA_DIR=..` is what
  every real Cloudflare project sets.

## Image metadata

Every uploaded raster image (jpg/png/webp/tiff/gif) is re-encoded through
`sharp` before it lands in `dist/images/` — not just the ones being resized
for exceeding `MAX_WIDTH`. `sharp` drops EXIF/ICC/GPS metadata by default
unless `.withMetadata()` is called, so this strips things like a photo's
camera model or embedded GPS location before it becomes a publicly served
file, even for small images that don't need resizing. Dimensions, format,
and animation (GIF/WEBP) are preserved — this is a metadata-only pass, not a
quality change. SVGs are copied through as-is (not run through sharp).

## Letting one club customize its design

A club that wants a genuinely custom look (not just the `theme` colors/fonts
in `club.json`) can add a `custom-template/` folder at its own repo root
(sibling to `club.json`, **not** inside `generator/`), mirroring `template/`'s
structure. `build.js` checks there first for every template file it loads —
`page.html`, `app-shell.html`, `style.css`, `app-shell.css`,
`sections/*.html` — and only falls back to this repo's built-in version for
files the club didn't override. A club can override just one file (e.g. only
`style.css`) and keep using the default for everything else.

This is the supported way for a club to diverge from the shared design.
Editing files under `generator/` directly instead is unsupported — a future
`git subtree pull` there is a real git merge and can produce conflicts;
`custom-template/` never syncs from here at all, so it's conflict-free by
construction.

## Propagating a fix to every club

Pushing a change here does **not** automatically update any club repo. Each
club repo pulls this engine in via `git subtree`, so after pushing a fix here,
someone with push access to every club repo needs to run, per club repo:

```bash
git subtree pull --prefix=generator <this-repo-url> main --squash
git push
```

That loop (and the roster of club repo URLs) lives in the separate, private
`club-fleet-tools` repo — deliberately not here, since anything committed to
this repo's `main` branch ends up copied into every club's `generator/` folder,
and the roster shouldn't be visible to every club's officers.
