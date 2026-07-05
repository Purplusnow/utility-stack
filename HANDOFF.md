# UtilityStack Handoff

Last updated: 2026-07-05

## Growth Pass: Share URLs, SEO Content, Korean Pages, Flagship Depth (2026-07-05, third pass)

- **Shareable state URLs**: every form-based tool serializes changed inputs to query params via `buildShareUrl()`/`applySharedStateFromUrl()` (generic, DOM defaultValue-based, in app.js near initialToolSlugFromLocation). A "Copy share link" button sits in every tool header. Opening `/tools/{slug}/?field=value` prefills and recalculates. Decision tools restore setup (not outcomes).
- **SEO content layer**: `scripts/content/*.json` hold per-tool intro/howTo/faqs for all 72 tools (agent-written, code-verified). `build-static.mjs` renders an About/How-to/FAQ/Related-tools section on every tool page plus FAQPage + BreadcrumbList JSON-LD. Editing content = edit JSON + rebuild.
- **Korean decision pages**: `/ko/tools/{ladder-draw,coin-flip,dice-roller,roulette-picker}/` generated from `scripts/content/ko-decision.json` with lang=ko, hreflang alternates both ways (x-default → en), Korean FAQPage JSON-LD, sitemap entries (95 URLs total). app.js defaults to Korean UI on `/ko/` paths when no stored language preference.
- **Flagship depth**: CSS bar charts (`growthChartMarkup`) on loan/compound-interest/retirement calculators; JSON syntax highlighting (`syntaxHighlightJson`, operates on escaped HTML — quotes are `&quot;`); regex tester presets (REGEX_PRESETS + change handler); text diff side-by-side (`diffPairs` aligns removed/added runs); JWT expiry badge (`jwtExpiryBadge`); QR PNG download (`attachQrPngDownload`).
- **Bug fixed en route**: `colorizeQrSvg` was emitting duplicate width/height attributes → invalid XML → QR SVG failed strict parsers (including PNG conversion via Image). Now strips existing dimensions from the opening tag first.
- verify.mjs now asserts: FAQ sections + FAQPage/BreadcrumbList on all tool pages, ko pages with hreflang, share-URL support (57 OK).

## Production Domain (2026-07-05)

- Production URL: `https://tools.koreanblog.xyz` (subdomain of the owner's koreanblog.xyz)
- `siteUrl` constant in `scripts/build-static.mjs:13` drives canonical/OG/sitemap/robots everywhere — change it there and rebuild if the domain ever changes
- `CNAME` file at repo root contains `tools.koreanblog.xyz` for GitHub Pages custom-domain binding
- DNS still needs a CNAME record: `tools` → `<github-username>.github.io`, then enable "Enforce HTTPS" in Pages settings after the cert issues

## Decision Tools Delight Pass (2026-07-05, second pass)

The four Decision tools were rebuilt with real interactive experiences, plus a site-wide design/UX polish pass:

- Ladder Draw: genuine ladder topology (random rungs, non-colliding), pairings derived from actual path traversal, SVG board with per-participant colored path tracing animation, hidden rungs until start, suspense headline, "Draw again". Supports up to 16 participants.
- Roulette Picker: SVG segmented wheel with radial labels + pointer pin, 4s cubic-ease spin that lands exactly on the winning segment (cumulative rotation across re-spins), "Spin again".
- Coin Flip: 3D two-faced coin (rotateX flip with result-determined landing face), squash shadow, localized faces preserved.
- Dice Roller: dice cycle random values while rolling, stop left-to-right with settle pop, total revealed at the end.
- Orchestration: run tokens cancel stale animations, action button disables during run and relabels to "again" variants (en/ko in decisionCopy.again).
- Site-wide polish from CEO-eye audits: outline tool-card buttons + hover states everywhere, emphasized primary metric in .result-grid (first cell accent), zebra/hover tables with uppercase headers, search focus ring, monospace textareas, per-textarea Clear buttons (form-scoped lookup — beware duplicate ids like #text vs category sections), "Reset to defaults" on standard tool forms (uses native form reset + recalc), drag-and-drop file dropzones (.file-field), password strength meter bar.

## Launch Readiness Pass (2026-07-05)

A full pre-launch quality pass was completed:

- Added launch assets: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png`, `site.webmanifest`, `404.html`, `ads.txt`
- All pages (index + generated) now include canonical, og:url, og:image, twitter:card, favicon links, manifest, and theme-color
- Generated tool/category pages now load the AdSense auto-ads script (previously index-only)
- Sitemap entries now include `lastmod`
- Removed internal opportunity-score badges ("95 / proven / file-workflow") from public tool cards
- Responsive fix: below 920px the sidebar now renders after the tool grid (category links become chips), so the first screen shows tools
- Dark-mode fixes (dice tiles), global `:focus-visible` outlines
- Hardened `localStorage` access (private mode no longer crashes the app), copy buttons revert after 2s and handle clipboard errors, blob URLs from image tools are revoked (memory leak fix), plus calculator edge-case guards (sales tax >100%, mortgage term rounding, rent-vs-buy final-year principal)
- `scripts/verify.mjs` now checks launch files and head metadata (58 OK)

Known deferred (post-launch): decision-tool strings fall back to English in 14 of 16 languages; tool descriptions outside English use templated copy; static page H1s don't switch language.

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
