#!/usr/bin/env node
"use strict";

// Shared by build.js so every consumer resolves the same club slug and data
// directory the same way.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CLUBS_DIR = path.join(ROOT, "clubs");

const DEFAULT_SLUG = "example-club";

// Resolves which club slug is in play, in order of precedence:
//   1. an explicit --club=<slug> flag (already parsed by the caller)
//   2. the CLUB_SLUG build variable (set per CI workflow)
//   3. DEFAULT_SLUG, so plain `node build.js` still works locally
function resolveSlug(explicit) {
    if (explicit) return explicit;
    if (process.env.CLUB_SLUG) return process.env.CLUB_SLUG;
    return DEFAULT_SLUG;
}

// Resolves where a given club's club.json/images live. Defaults to the
// legacy multi-club layout (this repo's own clubs/<slug>/), but in a
// per-club repo (where club.json sits at the repo root, sibling to the
// git-subtree-pulled copy of this engine) the CI workflow instead sets
// CLUB_DATA_DIR=.. so build.js finds it there. Resolved relative to ROOT
// (this engine's own directory), not the process cwd.
function clubDataDir(slug) {
    if (process.env.CLUB_DATA_DIR) return path.resolve(ROOT, process.env.CLUB_DATA_DIR);
    return path.join(CLUBS_DIR, slug);
}

function assertClubExists(slug) {
    const clubJsonPath = path.join(clubDataDir(slug), "club.json");
    if (!fs.existsSync(clubJsonPath)) {
        console.error(`✖ No club found for slug "${slug}" — expected ${clubJsonPath}`);
        process.exit(1);
    }
}

module.exports = {
    ROOT,
    CLUBS_DIR,
    DEFAULT_SLUG,
    resolveSlug,
    clubDataDir,
    assertClubExists,
};
