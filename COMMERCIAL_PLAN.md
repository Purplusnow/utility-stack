# UtilityStack Commercial Plan

## Mission

Build a fast, trustworthy utility site for global search traffic. Every tool should solve a concrete task, work in the browser, and produce a useful result without signup.

## Product Strategy

1. Prioritize high-intent tools.
   - Best: upload, process, preview, download.
   - Good: generate, clean, format, validate, calculate.
   - Weak: toy calculators with no reusable output.

2. Win with privacy and speed.
   - Keep files local in the browser when possible.
   - Avoid accounts, uploads, and server-side queues.
   - Keep pages simple enough to load fast on mobile.

3. Build SEO pages, not just tools.
   - Each tool needs a stable slug.
   - Each tool needs metadata, FAQ, related tools, and schema.
   - Category hubs should link to the strongest tools first.

4. Monetize without hurting intent.
   - Ads should not block the tool.
   - Preferred placements: top banner, after first result, below related tools.
   - Avoid forced interstitials or "watch ad to use" flows.

## Near-Term Execution

### Tool Opportunity Matrix

Every tool now gets an internal opportunity score from 0 to 100. The score is not a live keyword-volume substitute; it is a product prioritization proxy until Search Console, Keyword Planner, Ahrefs, or Semrush data is available.

Scoring inputs:

- Demand class: proven, commercial, category, long-tail.
- RPM class: high, medium, base.
- Moat class: file-workflow, advanced-output, multi-input, basic.
- Quality class: advanced, solid, basic.

Priority rules:

- 80+ score: flagship. Promote, improve, and build supporting SEO pages first.
- 65-79 score: primary. Keep improving if it belongs to a strong cluster.
- Under 65: standard. Maintain, but do not over-invest until search data proves demand.

Current flagship clusters:

- Finance: mortgage, loan, compound interest, tip, sales tax, savings goal, discount.
- Business: profit margin, break-even, ROI, invoice number, ad revenue.
- Data and developer: JSON, CSV, regex, password, QR.
- Image: resize, compress, convert, square maker.

### Phase 1: Stabilize the MVP

- Split tool definitions and renderers out of the single app file.
- Add tool metadata: slug, search intent, monetization tier, and priority.
- Improve mobile navigation.
- Vendor critical dependencies, starting with QR generation.
- Add a repeatable verification script.

### Phase 2: Build High-Value Tool Clusters

Priority clusters:

- Image tools: compressor, resizer, format converter, square maker, cropper.
- Data tools: CSV cleaner, CSV column extractor, CSV to JSON, JSON to CSV, JSON file formatter.
- Document-light tools: invoice generator, receipt generator, quote generator.
- Developer tools: JSON formatter, JWT decoder, regex tester, cron builder, UUID generator.
- Finance/business tools: loan, salary, ROI, margin, break-even, tax, discount.

### Phase 3: SEO Architecture

- Generate `/tools/{slug}/` pages.
- Generate `/categories/{category}/` hubs.
- Generate sitemap.xml.
- Add SoftwareApplication schema per tool.
- Add FAQ schema for the top 50 tools.
- Add internal related-tool links.

### Phase 4: Growth Loop

- Ship 10 to 20 tools per batch.
- Verify all tools after each batch.
- Promote only tools with working output and clear intent.
- Double down on categories that are easiest to rank and highest RPM.

## Quality Bar

A tool is publishable only if:

- It has a clear visitor-facing title and description.
- It works with default input.
- It handles invalid input gracefully.
- It produces copyable or downloadable output when relevant.
- It works on mobile without horizontal overflow.
- It does not require server upload unless explicitly planned.

## Current Product Risks

- `app.js` is too large and should be split soon.
- CSV parsing is simple and should be upgraded before promoting CSV tools heavily.
- QR generation depends on a CDN and should be vendored.
- Single-page architecture limits SEO growth.
- Mobile navigation is functional but too tall.
