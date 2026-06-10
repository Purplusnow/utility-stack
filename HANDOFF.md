# UtilityStack Handoff

Last updated: 2026-06-10

## Project Identity

- Project name: UtilityStack
- GitHub repository: `https://github.com/Purplusnow/utility-stack`
- Local path used in the previous session: `/Users/kevin/Dev/utilitystack`
- Branch: `main`
- Product type: static, browser-based utility website
- Target deployment: GitHub Pages or another static host

This project is independent from any previous `btc-report` or similarly named workspace. Use this repository as the source of truth.

## Current Git State

Important recent commits:

- `bcfb464` Initial UtilityStack static site
- `5486661` Enhance rent vs buy calculator
- `2699801` Merge remote utility-stack repository

The remote repository was created on GitHub as `utility-stack`. A temporary nested local repository named `utility-stack/` was accidentally created inside the project during setup and was removed. The correct project root is the outer `utilitystack` directory.

## Current Product State

- 72 tools
- 15 categories
- Static tool pages under `tools/`
- Static category pages under `categories/`
- `privacy/`, `terms/`, `sitemap.xml`, and `robots.txt` exist
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

The latest verification passed after the Rent vs Buy Calculator upgrade:

- OK 72 tools loaded
- OK 63 standard tools verified with default inputs
- OK 9 custom tools registered
- OK 15 categories
- OK sitemap, robots, privacy, and terms

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
- Improve image tools with clearer previews and export controls
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

