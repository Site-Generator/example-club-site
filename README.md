# Example Club — site content

This repo holds **Example Club's** website content only: `club.json` and
`images/`. Edit them via [Pages CMS](https://pagescms.org) (see `.pages.yml`)
or directly on GitHub.

**Do not hand-edit anything under `generator/`.** That folder is a synced
copy of the shared [club-site-generator-core](../club-site-generator-core)
engine, pulled in via `git subtree`. Engine bugs/features are fixed there and
propagated here — a local edit under `generator/` risks a conflict the next
time that sync runs.

**Want a custom design for this club only?** Add a `custom-template/` folder
here at the repo root (sibling to `club.json`, not inside `generator/`),
mirroring `generator/template/`'s structure — e.g. `custom-template/style.css`
or `custom-template/sections/officers.html`. The build uses any file found
there instead of the built-in default, and falls back to the default for
anything you don't override. This is the supported way to diverge from the
shared design; it never conflicts with future engine syncs.

## Building locally

```bash
npm --prefix generator install
CLUB_DATA_DIR=.. CLUB_SLUG=example-club node generator/build.js
npm --prefix generator run preview   # serves generator/dist/ via wrangler dev
```

## Deploying

This repo's Cloudflare Workers project is configured with:
- Root directory: `generator/`
- Build variables: `CLUB_SLUG=example-club`, `CLUB_DATA_DIR=..`
- Build command: `node build.js`
- Deploy command: `npm run deploy`
