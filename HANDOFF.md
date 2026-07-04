# UtilityStack Handoff

Last updated: 2026-07-04

## Project Identity

- Project name: UtilityStack
- GitHub repository: `https://github.com/Purplusnow/utility-stack`
- Current local path: `/Users/kevin/dev/utility-stack`
- Branch: `main`
- Product type: static, browser-based utility website
- Target deployment: GitHub Pages or another static host

This project is independent from any previous `btc-report` or similarly named workspace. Use this repository as the source of truth.

## Current Git State

Important recent commits:

- `bcfb464` Initial UtilityStack static site
- `5486661` Enhance rent vs buy calculator
- `2699801` Merge remote utility-stack repository

The remote repository was created on GitHub as `utility-stack`. A temporary nested local repository was accidentally created during setup and was removed. The correct project root for this workspace is `/Users/kevin/dev/utility-stack`.

## Current Product State

- 74 tools
- 15 categories
- Static tool pages under `tools/`
- Static category pages under `categories/`
- `privacy/`, `terms/`, `sitemap.xml`, and `robots.txt` exist
- QR code generation is vendored under `vendor/qrcode-generator/`, configured by static pages, and lazy-loaded only when the QR tool opens
- Client-side privacy positioning is important: browser-based, no upload where possible, no account required
- Main implementation is still concentrated in `app.js`
- Static generation is handled by `scripts/build-static.mjs`
- Verification is handled by `scripts/verify.mjs`

## Runtime Commands

Preferred bundled Node path:

```bash
/Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

Verify:

```bash
/Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify.mjs
```

Build static pages:

```bash
/Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build-static.mjs
```

If normal Node.js is available:

```bash
npm run verify
npm run build
```

## Last Verified Result

The latest verification passed after the developer utility upgrade:

- OK 74 tools loaded
- OK 63 standard tools verified with default inputs
- OK 11 custom tools registered
- OK 15 categories
- OK sitemap, robots, privacy, and terms

## Recent Image Cluster Upgrade

The latest product pass added a stronger developer workflow and preserved the high-intent browser image upgrades.

Added:

- `Cron Expression Builder` now supports presets, custom 5-field expressions, human-readable schedule summaries, next-run previews, local-time warnings, copy action, and CSV export
- New `Pixel Art Converter` tool with presets, pixel grid width, export scale, palette reduction, dithering, grid overlay, palette JSON, SVG mosaic export, sprite frame CSV, and local downloads
- New `Image Asset Pack Generator` for favicon, app icon, Open Graph, social, metadata HTML, and web manifest outputs from one image
- `Image Format Converter` now supports resize controls, aspect ratio lock, AVIF output option, quality, and transparent-background flattening controls
- `Color Palette Generator` was upgraded into `Brand Color System Generator` with accessible palette scales, contrast checks, CSS variables, Tailwind tokens, and JSON export
- `Invoice Number Generator` was upgraded with reset policies, optional Mod 10 check digits, period keys, policy notes, and richer CSV output
- `CSV Cleaner` was upgraded with header normalization, duplicate-row removal, empty-column handling, missing-value profiling, and downloadable quality reports
- `JSON Formatter` was upgraded into `JSON Formatter Inspector` with path inspection, type counts, structured report download, and richer file formatter output
- Verification now covers Cron preview helpers, pixel art controls, and stronger format converter controls
- Static `/tools/pixel-art-converter/` page and sitemap entry

## Recent Debt Cleanup

The most recent maintenance pass cleared high-impact technical and planning debt before the next feature push.

Added:

- Vendored `qrcode-generator@1.4.4` for the QR Code Generator workflow
- Static page generation now configures the local QR dependency for lazy loading
- Verification now fails if QR generation regresses to a CDN dependency
- Third-party notices document for vendored browser dependencies
- Updated project handoff path, date, and current-state notes

## Recent Feature Work

The most recent product improvement upgraded the `Rent vs Buy Calculator` into a stronger finance flagship tool.

Added:

- Loan term input
- Buyer closing cost input
- HOA / other monthly owner cost input
- Closing costs included in initial buyer cash
- Mortgage payment stops after payoff
- First-year owner monthly cost
- Break-even rent
- Sensitivity table for rent, appreciation, and mortgage rate changes
- CSV output including annual rows plus sensitivity scenarios

## Commercial Direction

The product goal is a global English utility site with stronger-than-average flagship tools, not just a large tool count.

Current strategic priorities:

- Improve the top 20 flagship tools before adding many more small tools
- Prioritize Finance, Image, Data, and Developer clusters
- Keep trust messages visible and accurate
- Prefer non-intrusive ads
- Avoid interstitials, forced ad watching, and flows that interrupt tool usage

Useful next candidates:

- Upgrade `Take Home Pay Calculator` with richer paycheck breakdowns and scenario comparisons
- Upgrade CSV/JSON tools into more practical data-cleaning workflows
- Improve image tools with clearer previews, export controls, and specialized creative workflows
- Begin modularizing `app.js` once feature velocity slows

## Working Style Requested

When the user says "계속 진행", act like a product/engineering lead:

- Choose the most commercially meaningful next improvement
- Implement it directly
- Run verification
- Regenerate static pages when needed
- Report in Korean
- Include a feature spec table
- Include a Before / After summary table
- Include verification results
- Keep changes practical and commercially focused

It is acceptable to remove or simplify weak features if that improves the product.

## Important Files

```text
app.js                    Tool definitions, renderers, calculations, and most client behavior
styles.css                Site styling
index.html                Homepage shell
scripts/build-static.mjs  Static page generator
scripts/verify.mjs        Automated verification
COMMERCIAL_PLAN.md        Product and monetization notes
README.md                 Public project overview
tools/                    Generated tool pages
categories/               Generated category pages
privacy/                  Privacy page
terms/                    Terms page
```

## Before Continuing On Another Device

After cloning or pulling:

```bash
git status --short --branch
git log --oneline -5
```

Then run:

```bash
npm run verify
```

or use the bundled Node command above if `node` is not available.
