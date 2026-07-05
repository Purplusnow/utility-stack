import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const appPath = path.join(root, "app.js");
const stylesPath = path.join(root, "styles.css");
const qrVendorPath = path.join(root, "vendor", "qrcode-generator", "qrcode.js");
const appSource = fs.readFileSync(appPath, "utf8");
const assetVersion = Math.floor(fs.statSync(appPath).mtimeMs);
const stylesVersion = Math.floor(fs.statSync(stylesPath).mtimeMs);
const qrVendorVersion = Math.floor(fs.statSync(qrVendorPath).mtimeMs);
const siteUrl = "https://tools.koreanblog.xyz";
const categoryOrder = ["Image", "Decision", "Data", "Developer", "Text", "Finance", "Business", "SEO", "Security", "Time", "Converters", "Writing", "Education", "Network", "Health", "Generators"];

const contentDir = path.join(root, "scripts", "content");
const toolContent = {};
for (const file of fs.readdirSync(contentDir)) {
  if (file.endsWith(".json") && file !== "ko-decision.json") {
    Object.assign(toolContent, JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8")));
  }
}
const koToolContent = JSON.parse(fs.readFileSync(path.join(contentDir, "ko-decision.json"), "utf8"));

function makeClassList() {
  return {
    add() {},
    remove() {},
    contains: () => false,
    toggle: () => false
  };
}

function makeElement() {
  return {
    style: { setProperty() {} },
    dataset: {},
    classList: makeClassList(),
    innerHTML: "",
    textContent: "",
    appendChild: (child) => child,
    prepend: (child) => child,
    remove() {},
    addEventListener() {},
    setAttribute() {},
    getAttribute: () => "",
    getBoundingClientRect: () => ({ top: 120 }),
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    scrollIntoView() {}
  };
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  Math,
  Date,
  JSON,
  Blob: class Blob {},
  URL: {
    createObjectURL: () => "blob:build",
    revokeObjectURL: () => {}
  },
  URLSearchParams,
  FileReader: class FileReader {},
  Image: class Image {},
  crypto: {
    randomUUID: () => "11111111-2222-4333-8444-555555555555",
    getRandomValues: (typedArray) => typedArray
  },
  localStorage: {
    getItem: () => null,
    setItem() {},
    removeItem() {}
  },
  navigator: {
    clipboard: { writeText: async () => {} }
  },
  history: {
    scrollRestoration: "auto"
  },
  location: {
    hash: "",
    search: "",
    pathname: "/",
    href: siteUrl
  },
  document: {
    body: makeElement(),
    documentElement: makeElement(),
    createElement: () => makeElement(),
    getElementById: () => makeElement(),
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    addEventListener() {}
  },
  window: {
    innerHeight: 800,
    visualViewport: { height: 800, addEventListener() {} },
    addEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    getComputedStyle: () => ({ display: "block" }),
    scrollTo() {}
  }
};

sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.history = sandbox.history;
sandbox.window.location = sandbox.location;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(`${appSource}\nthis.__build = { tools, toolMetadata, slugify };`, sandbox, {
  filename: "app.js"
});

const { tools, toolMetadata, slugify } = sandbox.__build;
const categories = new Map();

fs.rmSync(path.join(root, "tools"), { recursive: true, force: true });
fs.rmSync(path.join(root, "categories"), { recursive: true, force: true });
fs.rmSync(path.join(root, "ko"), { recursive: true, force: true });

for (const tool of tools) {
  const meta = toolMetadata(tool);
  if (!categories.has(tool.category)) categories.set(tool.category, []);
  categories.get(tool.category).push({ tool, meta });
}

function orderedCategoryEntries() {
  return [...categories.entries()].sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderLayout({ title, description, canonicalPath, body, schema, assetPrefix = "", lang = "en", alternates = [] }) {
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const alternateLinks = alternates.map(([hreflang, url]) => `  <link rel="alternate" hreflang="${hreflang}" href="${url}">`).join("\n");
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
${alternateLinks}
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${siteUrl}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${siteUrl}/og-image.png">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0f766e">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${assetPrefix}styles.css?v=${stylesVersion}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4640178123605595" crossorigin="anonymous"></script>
</head>
<body>
  ${body}
  <script>window.UtilityStackAssets = { qrLibrary: "${assetPrefix}vendor/qrcode-generator/qrcode.js?v=${qrVendorVersion}" };</script>
  <script src="${assetPrefix}app.js?v=${assetVersion}"></script>
</body>
</html>
`;
}

function renderHeader(assetPrefix = "") {
  return `<header class="site-header">
    <a class="brand" href="${assetPrefix}index.html" aria-label="UtilityStack home">
      <span class="brand-mark">U</span>
      <span>UtilityStack</span>
    </a>
    <div class="header-actions">
      <label class="language-control" for="language-select">
        <span>Language</span>
        <select id="language-select" aria-label="Select language"></select>
      </label>
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme">◐</button>
    </div>
  </header>`;
}

function renderAppShell({ heading, subheading, assetPrefix = "", extraSections = "" }) {
  return `${renderHeader(assetPrefix)}
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(subheading)}</p>
        <div class="search-wrap">
          <input id="tool-search" type="search" placeholder="Search tools: JSON, loan, word, invoice..." autocomplete="off" aria-label="Search tools">
        </div>
      </div>
    </section>
    <section class="layout">
      <aside class="sidebar" aria-label="Tool navigation">
        <div class="side-block">
          <h2>Categories</h2>
          ${orderedCategoryEntries().map(([category, entries]) => {
            const anchor = entries[0]?.tool.anchor || slugify(category);
            return `<a href="#${anchor}" data-category-anchor="${anchor}">${escapeHtml(category)} tools</a>`;
          }).join("")}
        </div>
        <div class="side-block">
          <h2>Pinned tools</h2>
          <div id="pinned-tools" class="recent-list">Pin tools you use often.</div>
        </div>
        <div class="side-block">
          <h2>Recently used</h2>
          <div id="recent-tools" class="recent-list">No recently used tools yet.</div>
        </div>
      </aside>
      <div class="content">
        <section class="tool-grid" id="tool-grid" aria-label="Tool list"></section>
        <section class="tool-workspace" id="tool-workspace" aria-live="polite"></section>
      </div>
    </section>
    ${extraSections}
  </main>
  <footer class="site-footer">
    <span>UtilityStack</span>
    <span>Free browser-based tools. No uploads, no accounts.</span>
    <span class="footer-links"><a href="${assetPrefix}privacy/">Privacy</a><a href="${assetPrefix}terms/">Terms</a></span>
  </footer>`;
}

const contentHeadings = {
  en: { about: "About this tool", howTo: "How to use", faq: "Frequently asked questions", related: "Related tools" },
  ko: { about: "이 도구 소개", howTo: "사용 방법", faq: "자주 묻는 질문", related: "관련 도구" }
};

function relatedTools(tool, limit = 6) {
  return tools
    .filter((item) => item.category === tool.category && item.id !== tool.id)
    .slice(0, limit)
    .map((item) => ({ slug: toolMetadata(item).slug, title: item.title }));
}

function toolContentSections(tool, content, { lang = "en" } = {}) {
  if (!content) return "";
  const headings = contentHeadings[lang] || contentHeadings.en;
  const related = relatedTools(tool);
  return `
    <section class="content-page tool-seo-content">
      <h2>${headings.about}</h2>
      <p>${escapeHtml(content.intro)}</p>
      <h2>${headings.howTo}</h2>
      <ol>${content.howTo.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      <h2>${headings.faq}</h2>
      ${content.faqs.map((faq) => `<h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>`).join("")}
      ${related.length ? `<h2>${headings.related}</h2><ul class="related-tools">${related.map((item) => `<li><a href="/tools/${item.slug}/">${escapeHtml(item.title)}</a></li>`).join("")}</ul>` : ""}
    </section>
  `;
}

function faqSchema(content, url) {
  if (!content?.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a }
    }))
  };
}

function breadcrumbSchema(tool, meta, url) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "UtilityStack", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: `${tool.category} Tools`, item: `${siteUrl}/categories/${meta.categorySlug || slugify(tool.category)}/` },
      { "@type": "ListItem", position: 3, name: tool.title, item: url }
    ]
  };
}

function renderPrivacyPage(assetPrefix = "../") {
  return `${renderHeader(assetPrefix)}
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <h1>Privacy</h1>
        <p>UtilityStack is designed around browser-based tools, minimal data collection, and no account requirement.</p>
      </div>
    </section>
    <section class="content-page">
      <h2>Browser-Based Processing</h2>
      <p>Most UtilityStack tools run directly in your browser. For file, image, text, JSON, CSV, JWT, password, and QR tools, your input does not need to be uploaded to our servers to produce the result.</p>
      <h2>Files And Pasted Content</h2>
      <p>When a tool says files stay local, the file is processed by your browser for that tool workflow. You can use those tools without creating an account or sending the file to a UtilityStack backend.</p>
      <h2>Third-Party Resources</h2>
      <p>Some pages may load third-party resources such as fonts, ads, analytics, or small client-side libraries. Those providers may receive standard browser request data such as IP address, user agent, and page URL.</p>
      <h2>Advertising</h2>
      <p>UtilityStack may use advertising to keep tools free. Ads should not block tool usage, and ad providers may use cookies or similar technologies according to their own policies.</p>
      <h2>No Accounts</h2>
      <p>UtilityStack does not require user accounts for the tools currently provided. We do not ask for passwords, payment details, or personal profiles to use the utilities.</p>
      <h2>Contact</h2>
      <p>For privacy questions, contact the site owner through the repository or domain contact channel once the public launch domain is configured.</p>
    </section>
  </main>
  <footer class="site-footer">
    <span>UtilityStack</span>
    <span>Private by design. Browser-based tools with no account required.</span>
    <span class="footer-links"><a href="${assetPrefix}index.html">Home</a><a href="${assetPrefix}terms/">Terms</a></span>
  </footer>`;
}

function renderTermsPage(assetPrefix = "../") {
  return `${renderHeader(assetPrefix)}
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <h1>Terms</h1>
        <p>UtilityStack provides free browser-based tools for convenience, calculation, formatting, and file workflows.</p>
      </div>
    </section>
    <section class="content-page">
      <h2>Use Of Tools</h2>
      <p>UtilityStack tools are provided for general productivity and informational use. You are responsible for reviewing outputs before relying on them in financial, legal, business, tax, medical, or security-sensitive decisions.</p>
      <h2>No Professional Advice</h2>
      <p>Calculators and generators can help with estimates and drafts, but they are not professional advice. Consult a qualified professional when decisions involve material risk or compliance obligations.</p>
      <h2>Accuracy And Availability</h2>
      <p>We try to keep tools fast and useful, but results may contain errors, assumptions, rounding differences, or browser-specific behavior. Tools may change, break, or become unavailable without notice.</p>
      <h2>Your Content</h2>
      <p>You should only process content that you have the right to use. Do not use UtilityStack to process unlawful, harmful, or infringing material.</p>
      <h2>Third-Party Services</h2>
      <p>Pages may include third-party resources such as fonts, ads, analytics, or client-side libraries. Those services are governed by their own terms and privacy policies.</p>
      <h2>Limitation Of Liability</h2>
      <p>UtilityStack is provided as-is. To the maximum extent allowed by law, the site owner is not liable for losses arising from use of, or inability to use, the tools.</p>
    </section>
  </main>
  <footer class="site-footer">
    <span>UtilityStack</span>
    <span>Free browser-based tools. Review results before relying on them.</span>
    <span class="footer-links"><a href="${assetPrefix}index.html">Home</a><a href="${assetPrefix}privacy/">Privacy</a></span>
  </footer>`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function toolSchema(tool, meta) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: `${tool.category}Application`,
    operatingSystem: "Any",
    url: `${siteUrl}/tools/${meta.slug}/`,
    description: tool.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

function categorySchema(category, entries) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category} Tools`,
    url: `${siteUrl}/categories/${slugify(category)}/`,
    description: `Free ${category.toLowerCase()} tools from UtilityStack.`,
    hasPart: entries.map(({ tool, meta }) => ({
      "@type": "SoftwareApplication",
      name: tool.title,
      url: `${siteUrl}/tools/${meta.slug}/`
    }))
  };
}

for (const tool of tools) {
  const meta = toolMetadata(tool);
  const title = `${tool.title} - Free Online Tool | UtilityStack`;
  const description = `${tool.description} Use this free ${tool.category.toLowerCase()} tool directly in your browser.`;
  const content = toolContent[tool.id];
  const koContent = koToolContent[tool.id];
  const url = `${siteUrl}/tools/${meta.slug}/`;
  const koUrl = `${siteUrl}/ko/tools/${meta.slug}/`;
  const alternates = koContent
    ? [["en", url], ["ko", koUrl], ["x-default", url]]
    : [];
  const schema = [toolSchema(tool, meta), breadcrumbSchema(tool, meta, url), faqSchema(content, url)].filter(Boolean);
  const html = renderLayout({
    title,
    description,
    canonicalPath: `/tools/${meta.slug}/`,
    assetPrefix: "../../",
    schema,
    alternates,
    body: renderAppShell({
      heading: tool.title,
      subheading: tool.description,
      assetPrefix: "../../",
      extraSections: toolContentSections(tool, content)
    })
  });
  writeFile(path.join(root, "tools", meta.slug, "index.html"), html);

  if (koContent) {
    const koSchema = [
      { ...toolSchema(tool, meta), name: koContent.title, url: koUrl, description: koContent.description, inLanguage: "ko" },
      faqSchema(koContent, koUrl)
    ].filter(Boolean);
    const koHtml = renderLayout({
      title: `${koContent.title} - 무료 온라인 도구 | UtilityStack`,
      description: koContent.description,
      canonicalPath: `/ko/tools/${meta.slug}/`,
      assetPrefix: "../../../",
      lang: "ko",
      alternates: [["en", url], ["ko", koUrl], ["x-default", url]],
      schema: koSchema,
      body: renderAppShell({
        heading: koContent.heading,
        subheading: koContent.description,
        assetPrefix: "../../../",
        extraSections: toolContentSections(tool, koContent, { lang: "ko" })
      })
    });
    writeFile(path.join(root, "ko", "tools", meta.slug, "index.html"), koHtml);
  }
}

for (const [category, entries] of categories) {
  const slug = slugify(category);
  const title = `${category} Tools - Free Online Utilities | UtilityStack`;
  const description = `Free ${category.toLowerCase()} tools for quick browser-based calculations, conversions, formatting, and generation.`;
  const html = renderLayout({
    title,
    description,
    canonicalPath: `/categories/${slug}/`,
    assetPrefix: "../../",
    schema: categorySchema(category, entries),
    body: renderAppShell({
      heading: `${category} Tools`,
      subheading: description,
      assetPrefix: "../../"
    })
  });
  writeFile(path.join(root, "categories", slug, "index.html"), html);
}

writeFile(path.join(root, "privacy", "index.html"), renderLayout({
  title: "Privacy - UtilityStack",
  description: "How UtilityStack handles browser-based processing, local files, ads, and privacy for free online tools.",
  canonicalPath: "/privacy/",
  assetPrefix: "../",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy",
    url: `${siteUrl}/privacy/`,
    description: "UtilityStack privacy information for browser-based tools."
  },
  body: renderPrivacyPage("../")
}));

writeFile(path.join(root, "terms", "index.html"), renderLayout({
  title: "Terms - UtilityStack",
  description: "Terms for using UtilityStack browser-based tools, calculators, generators, and file utilities.",
  canonicalPath: "/terms/",
  assetPrefix: "../",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms",
    url: `${siteUrl}/terms/`,
    description: "UtilityStack terms of use for free online tools."
  },
  body: renderTermsPage("../")
}));

const urls = [
  "/",
  "/privacy/",
  "/terms/",
  ...tools.map((tool) => `/tools/${toolMetadata(tool).slug}/`),
  ...tools.filter((tool) => koToolContent[tool.id]).map((tool) => `/ko/tools/${toolMetadata(tool).slug}/`),
  ...[...categories.keys()].map((category) => `/categories/${slugify(category)}/`)
];

const lastmod = new Date().toISOString().slice(0, 10);
writeFile(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`);

writeFile(path.join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);

console.log(`Generated ${tools.length} tool pages, ${categories.size} category pages, privacy page, terms page, sitemap.xml, and robots.txt.`);
