# UtilityStack

UtilityStack is a static, browser-based utility site for calculators, converters, developer tools, image tools, text tools, and business workflows.

The project is intentionally independent from other local projects. It can be hosted as plain static files on GitHub Pages, Cloudflare Pages, Netlify, or any static host.

## Current Status

- 72 utility tools
- 15 category hub pages
- Static `/tools/{slug}/` pages
- Static `/categories/{slug}/` pages
- Privacy and Terms pages
- `sitemap.xml` and `robots.txt`
- Browser-first privacy messaging
- Automated verification for core tool behavior

## Local Commands

Use the bundled Node runtime if system `node` is unavailable:

```bash
/Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/verify.mjs
/Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build-static.mjs
```

With a normal Node.js install:

```bash
npm run verify
npm run build
```

## Project Structure

```text
app.js                  Main tool definitions, renderers, and client behavior
styles.css              Site styling
index.html              Static homepage shell
scripts/build-static.mjs Static page generator
scripts/verify.mjs      Automated verification
tools/                  Generated tool pages
categories/             Generated category pages
privacy/                Privacy page
terms/                  Terms page
COMMERCIAL_PLAN.md      Product and monetization roadmap
```

## Quality Bar

Every promoted tool should:

- Work with default input
- Handle invalid input clearly
- Produce useful copyable or downloadable output when relevant
- Avoid server upload when local browser processing is enough
- Be represented in static SEO pages and the sitemap
- Pass `scripts/verify.mjs`

## Deployment

The site is static. After local development:

1. Run the static build.
2. Run verification.
3. Push this repository to GitHub.
4. Enable GitHub Pages or another static host.
5. Connect the final domain.

