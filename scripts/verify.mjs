import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const appPath = path.join(root, "app.js");
const indexPath = path.join(root, "index.html");
const sitemapPath = path.join(root, "sitemap.xml");
const robotsPath = path.join(root, "robots.txt");
const privacyPath = path.join(root, "privacy", "index.html");
const termsPath = path.join(root, "terms", "index.html");
const qrVendorPath = path.join(root, "vendor", "qrcode-generator", "qrcode.js");
const appSource = fs.readFileSync(appPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const output = [];
const failures = [];

function fail(message) {
  failures.push(message);
}

function ok(message) {
  output.push(`OK ${message}`);
}

function makeClassList() {
  const classes = new Set();
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
    toggle: (name, force) => {
      if (force === undefined) {
        if (classes.has(name)) classes.delete(name);
        else classes.add(name);
        return classes.has(name);
      }
      if (force) classes.add(name);
      else classes.delete(name);
      return Boolean(force);
    }
  };
}

function makeElement() {
  return {
    children: [],
    style: { setProperty() {}, removeProperty() {} },
    dataset: {},
    className: "",
    classList: makeClassList(),
    value: "",
    checked: false,
    innerHTML: "",
    textContent: "",
    files: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    prepend(child) {
      this.children.unshift(child);
      return child;
    },
    remove() {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) {
      this[name] = value;
    },
    getAttribute(name) {
      return this[name];
    },
    getBoundingClientRect() {
      return { top: 120 };
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    closest() {
      return null;
    },
    scrollIntoView() {},
    select() {},
    click() {}
  };
}

const storage = new Map();
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
  btoa: (value) => Buffer.from(value, "binary").toString("base64"),
  Math,
  Date,
  JSON,
  URLSearchParams,
  Blob: class Blob {},
  Intl,
  URL: {
    createObjectURL: () => "blob:verify",
    revokeObjectURL: () => {}
  },
  FileReader: class FileReader {},
  Image: class Image {},
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  },
  document: {
    body: makeElement(),
    documentElement: makeElement(),
    createElement: () => makeElement(),
    createTextNode: (text) => ({ textContent: text }),
    getElementById: () => makeElement(),
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: {
    innerHeight: 800,
    visualViewport: { height: 800, addEventListener: () => {} },
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    getComputedStyle: () => ({ display: "block" }),
    requestAnimationFrame: (callback) => callback(),
    scrollTo: () => {}
  },
  navigator: {
    clipboard: { writeText: async () => {} }
  },
  crypto: {
    randomUUID: () => "11111111-2222-4333-8444-555555555555",
    getRandomValues: (typedArray) => {
      for (let i = 0; i < typedArray.length; i += 1) {
        typedArray[i] = (i * 37 + 17) % 256;
      }
      return typedArray;
    }
  },
  history: {
    scrollRestoration: "auto",
    replaceState: () => {},
    pushState: () => {}
  },
  location: {
    hash: "",
    search: "",
    pathname: "/",
    href: "http://127.0.0.1/"
  }
};

sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.history = sandbox.history;
sandbox.window.location = sandbox.location;
sandbox.requestAnimationFrame = sandbox.window.requestAnimationFrame;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(`${appSource}\nthis.__verify = { tools, languages, translations, privacyCopy, titleTerms, localizedCategory, localizedToolTitle, localizedToolTitleFor, localizedToolDescription, localizedSearchText, toolMetadata, toolOpportunity, toolPrivacyLevel, privacyNotice, imageToolMarkup, parseCsv, csvEscape, normalizeCsvHeaders, csvQualityProfile, jsonSummary, jsonPaths, jsonTypeCounts, jsonErrorLocation, lineDiff, collectRegexMatches, searchTools, searchScore, toolRank, markdownToHtml, markdownStats, safeHexColor, colorizeQrSvg, qrContentType, analyzePassword, passwordWarnings, decodeJwt, jwtTimeStatus, cronExpressionFromValues, parseCronExpression, cronNextRuns, salesTaxSummary, profitMarginSummary, adRevenueSummary, discountSummary, breakEvenSummary, roiSummary, tipSummary, invoiceNumberSummary, compoundInterestSummary, retirementSummary, savingsGoalSummary, creditCardPayoffSummary, debtPayoffSummary, loanAmortizationSummary, mortgageAffordabilitySummary, rentVsBuySummary, takeHomePaySummary };`, sandbox, {
  filename: "app.js"
});

const { tools, languages, translations, privacyCopy, titleTerms, localizedCategory, localizedToolTitle, localizedToolTitleFor, localizedToolDescription, localizedSearchText, toolMetadata, toolOpportunity, toolPrivacyLevel, privacyNotice, imageToolMarkup, parseCsv, csvEscape, normalizeCsvHeaders, csvQualityProfile, jsonSummary, jsonPaths, jsonTypeCounts, jsonErrorLocation, lineDiff, collectRegexMatches, searchTools, searchScore, toolRank, markdownToHtml, markdownStats, safeHexColor, colorizeQrSvg, qrContentType, analyzePassword, passwordWarnings, decodeJwt, jwtTimeStatus, cronExpressionFromValues, parseCronExpression, cronNextRuns, salesTaxSummary, profitMarginSummary, adRevenueSummary, discountSummary, breakEvenSummary, roiSummary, tipSummary, invoiceNumberSummary, compoundInterestSummary, retirementSummary, savingsGoalSummary, creditCardPayoffSummary, debtPayoffSummary, loanAmortizationSummary, mortgageAffordabilitySummary, rentVsBuySummary, takeHomePaySummary } = sandbox.__verify;
const knownCustomTools = new Set([
  "file-word-counter",
  "file-json-formatter",
  "file-csv-cleaner",
  "file-csv-columns",
  "qr-code",
  "image-resizer",
  "image-compressor",
  "image-converter",
  "image-square",
  "image-asset-pack",
  "image-pixel-art"
]);
const expectedCategoryAnchors = ["image", "decision", "data", "dev", "text", "finance", "business", "seo", "security", "time", "converters", "writing", "education", "network", "health", "generators"];
const retiredToolIds = new Set([
  "sentence-counter",
  "grade-percentage-calculator",
  "study-timer-planner",
  "ip-to-integer-converter",
  "lorem-ipsum-generator",
  "list-randomizer"
]);

function sidebarCategoryAnchors(html) {
  const block = html.match(/<h2>Categories<\/h2>([\s\S]*?)<\/div>/)?.[1] || "";
  return [...block.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
}

if (!Array.isArray(tools)) fail("tools must be an array.");
else ok(`${tools.length} tools loaded`);

for (const retiredToolId of retiredToolIds) {
  if (tools.some((tool) => tool.id === retiredToolId)) fail(`${retiredToolId} should stay retired from the public tool list.`);
}

const ids = new Set();
const categories = new Map();
const requiredToolFields = ["id", "category", "anchor", "title", "description"];
const customTools = [];
const standardTools = [];

for (const tool of tools) {
  for (const field of requiredToolFields) {
    if (!tool[field]) fail(`${tool.id || "unknown"} is missing ${field}.`);
  }

  if (ids.has(tool.id)) fail(`Duplicate tool id: ${tool.id}`);
  ids.add(tool.id);
  categories.set(tool.category, (categories.get(tool.category) || 0) + 1);

  if (tool.custom) customTools.push(tool);
  else standardTools.push(tool);

  if (typeof toolMetadata !== "function") {
    fail("toolMetadata() must be available.");
  } else {
    const meta = toolMetadata(tool);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) fail(`${tool.id} has invalid slug: ${meta.slug}`);
    if (!meta.categorySlug) fail(`${tool.id} is missing category slug.`);
    if (!["convert", "calculate", "generate", "check", "format", "utility"].includes(meta.intent)) fail(`${tool.id} has invalid intent: ${meta.intent}`);
    if (!["high", "medium", "base"].includes(meta.tier)) fail(`${tool.id} has invalid tier: ${meta.tier}`);
    if (!["flagship", "primary", "standard"].includes(meta.priority)) fail(`${tool.id} has invalid priority: ${meta.priority}`);
    if (!meta.opportunity || meta.opportunity.score < 0 || meta.opportunity.score > 100) fail(`${tool.id} has invalid opportunity score.`);
    if (!["proven", "commercial", "category", "long-tail"].includes(meta.opportunity.demand)) fail(`${tool.id} has invalid demand class.`);
    if (!["file-workflow", "advanced-output", "multi-input", "basic"].includes(meta.opportunity.moat)) fail(`${tool.id} has invalid moat class.`);
    if (!meta.searchText.includes(tool.title.toLowerCase())) fail(`${tool.id} search text is missing title.`);

    const toolPage = path.join(root, "tools", meta.slug, "index.html");
    if (!fs.existsSync(toolPage)) {
      fail(`${tool.id} is missing generated tool page at tools/${meta.slug}/index.html.`);
    } else {
      const toolHtml = fs.readFileSync(toolPage, "utf8");
      if (!toolHtml.includes(tool.title)) fail(`${tool.id} generated page is missing title.`);
      if (!toolHtml.includes('id="language-select"')) fail(`${tool.id} generated page is missing language selector.`);
      if (!toolHtml.includes('id="pinned-tools"')) fail(`${tool.id} generated page is missing pinned tools sidebar.`);
      if (!toolHtml.includes("../../app.js?v=")) fail(`${tool.id} generated page must load versioned ../../app.js.`);
      if (!toolHtml.includes('qrLibrary: "../../vendor/qrcode-generator/qrcode.js?v=')) fail(`${tool.id} generated page must configure the vendored QR code library.`);
      if (toolHtml.includes("cdn.jsdelivr.net/npm/qrcode-generator")) fail(`${tool.id} generated page must not load QR code generation from a CDN.`);
      if (toolHtml.includes('<script src="../../vendor/qrcode-generator/qrcode.js')) fail(`${tool.id} generated page must lazy-load QR code generation.`);
      if (!toolHtml.includes(`https://tools.koreanblog.xyz/tools/${meta.slug}/`)) fail(`${tool.id} generated page is missing canonical URL.`);
    }
  }
}

for (const tool of customTools) {
  if (!knownCustomTools.has(tool.custom)) {
    fail(`${tool.id} references unknown custom tool type ${tool.custom}.`);
  }
}

const imageResizer = tools.find((tool) => tool.custom === "image-resizer");
if (!imageResizer) fail("Image Resizer tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(imageResizer);
  if (!markup.includes("resize-preset")) fail("Image Resizer is missing preset control.");
  if (!markup.includes("lock-ratio")) fail("Image Resizer is missing ratio lock control.");
  if (!markup.includes("Open Graph 1200 x 630")) fail("Image Resizer is missing social image preset.");
  ok("Image Resizer quality controls found");
}

const imageCompressor = tools.find((tool) => tool.custom === "image-compressor");
if (!imageCompressor) fail("Image Compressor tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(imageCompressor);
  if (!markup.includes("target-size")) fail("Image Compressor is missing target size control.");
  if (!markup.includes("never-upscale")) fail("Image Compressor is missing never-upscale control.");
  if (!markup.includes("Max width")) fail("Image Compressor is missing max-width control.");
  ok("Image Compressor quality controls found");
}

const imageConverter = tools.find((tool) => tool.custom === "image-converter");
if (!imageConverter) fail("Image Format Converter tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(imageConverter);
  if (!markup.includes("jpeg-bg")) fail("Image Format Converter is missing JPG background control.");
  if (!markup.includes("resize-width")) fail("Image Format Converter is missing output width control.");
  if (!markup.includes("lock-ratio")) fail("Image Format Converter is missing aspect ratio lock.");
  if (!markup.includes('value="image/webp" selected')) fail("Image Format Converter should default to WebP output.");
  if (!markup.includes('value="image/avif"')) fail("Image Format Converter should offer AVIF output.");
  ok("Image Format Converter quality controls found");
}

const squareImageMaker = tools.find((tool) => tool.custom === "image-square");
if (!squareImageMaker) fail("Square Image Maker tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(squareImageMaker);
  if (!markup.includes("square-fit")) fail("Square Image Maker is missing fit mode control.");
  if (!markup.includes("square-padding")) fail("Square Image Maker is missing padding control.");
  if (!markup.includes("square-radius")) fail("Square Image Maker is missing corner radius control.");
  ok("Square Image Maker quality controls found");
}

const imageAssetPack = tools.find((tool) => tool.custom === "image-asset-pack");
if (!imageAssetPack) fail("Image Asset Pack Generator tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(imageAssetPack);
  if (!markup.includes("asset-pack")) fail("Image Asset Pack Generator is missing pack control.");
  if (!markup.includes("asset-fit")) fail("Image Asset Pack Generator is missing fit control.");
  if (!markup.includes("asset-bg")) fail("Image Asset Pack Generator is missing background control.");
  if (!markup.includes("asset-padding")) fail("Image Asset Pack Generator is missing padding control.");
  if (!appSource.includes("renderImageAssetPack")) fail("Image Asset Pack Generator should render asset packs.");
  if (!appSource.includes("Download metadata HTML")) fail("Image Asset Pack Generator should offer metadata HTML download.");
  if (!appSource.includes("manifest.webmanifest")) fail("Image Asset Pack Generator should offer web manifest download.");
  ok("Image Asset Pack Generator quality controls found");
}

const pixelArtConverter = tools.find((tool) => tool.custom === "image-pixel-art");
if (!pixelArtConverter) fail("Pixel Art Converter tool is missing.");
else if (typeof imageToolMarkup !== "function") fail("imageToolMarkup() must be available.");
else {
  const markup = imageToolMarkup(pixelArtConverter);
  if (!markup.includes("pixel-preset")) fail("Pixel Art Converter is missing preset control.");
  if (!markup.includes("pixel-width")) fail("Pixel Art Converter is missing grid width control.");
  if (!markup.includes("pixel-scale")) fail("Pixel Art Converter is missing export scale control.");
  if (!markup.includes("pixel-palette")) fail("Pixel Art Converter is missing palette control.");
  if (!markup.includes("pixel-dither")) fail("Pixel Art Converter is missing dithering control.");
  if (!markup.includes("pixel-flatten")) fail("Pixel Art Converter is missing background flatten control.");
  if (!markup.includes("pixel-grid")) fail("Pixel Art Converter is missing grid overlay control.");
  if (!markup.includes("pixel-grid-color")) fail("Pixel Art Converter is missing grid color control.");
  if (!markup.includes("pixel-sprite-columns")) fail("Pixel Art Converter is missing sprite columns control.");
  if (!markup.includes("pixel-sprite-rows")) fail("Pixel Art Converter is missing sprite rows control.");
  if (!appSource.includes("Download SVG mosaic")) fail("Pixel Art Converter should offer SVG mosaic download.");
  if (!appSource.includes("Download frame CSV")) fail("Pixel Art Converter should offer sprite frame CSV download.");
  if (!appSource.includes("Download palette CSS")) fail("Pixel Art Converter should offer palette CSS download.");
  if (!appSource.includes("Download GPL palette")) fail("Pixel Art Converter should offer GPL palette download.");
  if (!appSource.includes("createPixelArtSvg")) fail("Pixel Art Converter should create vector SVG output.");
  ok("Pixel Art Converter quality controls found");
}

if (typeof parseCsv !== "function") fail("parseCsv() must be available.");
else {
  const parsed = parseCsv(`name,notes
Alex,"Uses commas, safely"
Sam,"Line one
Line two"`);
  if (parsed.length !== 3) fail("parseCsv() should parse header plus two data rows.");
  if (parsed[1]?.[1] !== "Uses commas, safely") fail("parseCsv() should preserve commas inside quoted fields.");
  if (parsed[2]?.[1] !== "Line one\nLine two") fail("parseCsv() should preserve newlines inside quoted fields.");
  try {
    parseCsv('name,notes\nAlex,"broken');
    fail("parseCsv() should reject unclosed quoted fields.");
  } catch {
    ok("CSV parser handles quoted fields and invalid quotes");
  }
}

if (typeof csvEscape !== "function") fail("csvEscape() must be available.");
else if (csvEscape('a,b"c') !== '"a,b""c"') fail("csvEscape() should quote commas and double quotes.");

if (typeof normalizeCsvHeaders !== "function" || typeof csvQualityProfile !== "function") fail("CSV cleaner quality helpers must be available.");
else {
  const headers = normalizeCsvHeaders([" Name ", "Name", "", "Role"]);
  if (headers[0] !== "name" || headers[1] !== "name_2" || headers[2] !== "column_3") fail("normalizeCsvHeaders() should produce unique machine-friendly headers.");
  const profile = csvQualityProfile([
    ["name", "role"],
    ["Alex", "Designer"],
    ["Sam", ""]
  ], { rawRows: 4, nonEmptyRows: 3, duplicateRows: 1, removedColumns: 0, normalizedHeaders: true });
  if (profile.missingCells !== 1) fail("csvQualityProfile() should count missing cells.");
  if (profile.duplicateRows !== 1) fail("csvQualityProfile() should preserve duplicate-row stats.");
  ok("CSV cleaner quality helpers found");
}

if (typeof jsonSummary !== "function") fail("jsonSummary() must be available.");
else {
  const summary = jsonSummary({ name: "UtilityStack", nested: { tools: [1, 2] } });
  if (summary.type !== "Object") fail("jsonSummary() should identify objects.");
  if (summary.topLevel !== "2 keys") fail("jsonSummary() should count top-level object keys.");
  if (summary.depth < 3) fail("jsonSummary() should calculate nested depth.");
  ok("JSON summary metrics found");
}

if (typeof jsonPaths !== "function" || typeof jsonTypeCounts !== "function") fail("JSON inspector helpers must be available.");
else {
  const sample = { name: "UtilityStack", nested: { tools: [1, true, null] } };
  const paths = jsonPaths(sample);
  const counts = jsonTypeCounts(sample);
  if (!paths.some((item) => item.path === "$.nested.tools[1]" && item.type === "boolean")) fail("jsonPaths() should list nested array paths.");
  if (counts.array < 1 || counts.object < 2 || counts.scalar < 4) fail("jsonTypeCounts() should count JSON value types.");
  ok("JSON inspector helpers found");
}

if (typeof jsonErrorLocation !== "function") fail("jsonErrorLocation() must be available.");
else {
  const location = jsonErrorLocation("{\n  \"name\": bad\n}", new Error("Unexpected token b in JSON at position 12"));
  if (!location || location.line !== 2 || location.column < 1) fail("jsonErrorLocation() should map parser position to line and column.");
}

const jsonFileFormatter = tools.find((tool) => tool.id === "json-file-formatter");
if (!jsonFileFormatter?.description.includes("clear parse errors")) fail("JSON File Formatter description should mention clear parse errors.");
const jsonFormatterTool = tools.find((tool) => tool.id === "json-formatter");
if (!jsonFormatterTool?.description.includes("inspect JSON paths")) fail("JSON Formatter Inspector description should mention path inspection.");
if (!appSource.includes("json-inspection-report.json")) fail("JSON Formatter Inspector should offer inspection report download.");
const compoundTool = tools.find((tool) => tool.id === "compound-interest-calculator");
if (!compoundTool?.description.includes("yearly breakdown")) fail("Compound Interest Calculator description should mention yearly breakdown.");
const retirementTool = tools.find((tool) => tool.id === "retirement-calculator");
if (!retirementTool?.description.includes("inflation-adjusted")) fail("Retirement Calculator description should mention inflation-adjusted income.");
const loanTool = tools.find((tool) => tool.id === "loan-payment-calculator");
if (!loanTool?.description.includes("amortization summary")) fail("Loan Payment Calculator description should mention amortization summary.");
const creditCardTool = tools.find((tool) => tool.id === "credit-card-payoff-calculator");
if (!creditCardTool?.description.includes("interest saved")) fail("Credit Card Payoff Calculator description should mention interest saved.");
const debtPayoffTool = tools.find((tool) => tool.id === "debt-payoff-planner");
if (!debtPayoffTool?.description.includes("avalanche and snowball")) fail("Debt Payoff Planner description should mention avalanche and snowball.");
const mortgageTool = tools.find((tool) => tool.id === "mortgage-affordability-calculator");
if (!mortgageTool?.description.includes("DTI")) fail("Mortgage Affordability Calculator description should mention DTI.");
const rentVsBuyTool = tools.find((tool) => tool.id === "rent-vs-buy-calculator");
if (!rentVsBuyTool?.description.includes("home appreciation")) fail("Rent vs Buy Calculator description should mention home appreciation.");
const takeHomePayTool = tools.find((tool) => tool.id === "take-home-pay-calculator");
if (!takeHomePayTool?.description.includes("pre-tax deductions")) fail("Take Home Pay Calculator description should mention pre-tax deductions.");
const savingsTool = tools.find((tool) => tool.id === "savings-goal-calculator");
if (!savingsTool?.description.includes("timeline")) fail("Savings Goal Calculator description should mention timeline.");
const salesTaxTool = tools.find((tool) => tool.id === "sales-tax-calculator");
if (!salesTaxTool?.description.includes("scenarios")) fail("Sales Tax Calculator description should mention scenarios.");
const profitMarginTool = tools.find((tool) => tool.id === "profit-margin-calculator");
if (!profitMarginTool?.description.includes("target margin")) fail("Profit Margin Calculator description should mention target margin.");
const adRevenueTool = tools.find((tool) => tool.id === "cpm-rpm-calculator");
if (!adRevenueTool?.description.includes("fill rate")) fail("CPM RPM Calculator description should mention fill rate.");
const discountTool = tools.find((tool) => tool.id === "discount-calculator");
if (!discountTool?.description.includes("stacked discounts")) fail("Discount Calculator description should mention stacked discounts.");
const invoiceTool = tools.find((tool) => tool.id === "invoice-number-generator");
if (!invoiceTool?.description.includes("reset rules")) fail("Invoice Number Generator description should mention reset rules.");
if (!invoiceTool?.description.includes("check digits")) fail("Invoice Number Generator description should mention check digits.");
const breakEvenTool = tools.find((tool) => tool.id === "break-even-calculator");
if (!breakEvenTool?.description.includes("profit targets")) fail("Break Even Calculator description should mention profit targets.");
const roiTool = tools.find((tool) => tool.id === "roi-calculator");
if (!roiTool?.description.includes("annualized return")) fail("ROI Calculator description should mention annualized return.");
const tipTool = tools.find((tool) => tool.id === "tip-calculator");
if (!tipTool?.description.includes("service charge")) fail("Tip Calculator description should mention service charge.");
const csvCleaner = tools.find((tool) => tool.id === "csv-cleaner");
if (!csvCleaner?.description.includes("quoted commas")) fail("CSV Cleaner description should mention quoted comma support.");
if (!csvCleaner?.description.includes("quality report")) fail("CSV Cleaner description should mention quality report.");
if (!appSource.includes("csv-normalize-headers")) fail("CSV Cleaner should offer header normalization.");
if (!appSource.includes("csv-remove-duplicates")) fail("CSV Cleaner should offer duplicate removal.");
if (!appSource.includes("csv-quality-report.json")) fail("CSV Cleaner should offer quality report download.");
const csvToJson = tools.find((tool) => tool.id === "csv-to-json-converter");
if (!csvToJson?.description.includes("downloadable JSON")) fail("CSV to JSON description should mention downloadable JSON.");
const jsonToCsv = tools.find((tool) => tool.id === "json-to-csv-converter");
if (!jsonToCsv?.description.includes("downloadable")) fail("JSON to CSV description should mention downloadable output.");
const textDiff = tools.find((tool) => tool.id === "text-diff-checker");
if (!textDiff?.description.includes("added, removed, and unchanged")) fail("Text Diff Checker description should mention readable diff output.");
const regexTester = tools.find((tool) => tool.id === "regex-tester");
if (!regexTester?.description.includes("match highlighting")) fail("Regex Tester description should mention match highlighting.");
const markdownPreview = tools.find((tool) => tool.id === "markdown-preview");
if (!markdownPreview?.description.includes("downloadable HTML")) fail("Markdown Preview description should mention downloadable HTML.");
const qrTool = tools.find((tool) => tool.id === "qr-code-generator");
if (!qrTool?.description.includes("colors")) fail("QR Code Generator description should mention color customization.");
const passwordGenerator = tools.find((tool) => tool.id === "password-generator");
if (!passwordGenerator?.description.includes("entropy")) fail("Password Generator description should mention entropy.");
const passwordChecker = tools.find((tool) => tool.id === "password-strength-checker");
if (!passwordChecker?.description.includes("common-pattern warnings")) fail("Password Strength Checker description should mention common-pattern warnings.");
const jwtDecoder = tools.find((tool) => tool.id === "jwt-decoder");
if (!jwtDecoder?.description.includes("expiry details")) fail("JWT Decoder description should mention expiry details.");
const cronTool = tools.find((tool) => tool.id === "cron-expression-builder");
if (!cronTool?.description.includes("next run previews")) fail("Cron Expression Builder description should mention next run previews.");
if (!cronTool?.fields.some((field) => field.id === "customExpression")) fail("Cron Expression Builder should allow custom expressions.");
if (!cronTool?.fields.some((field) => field.id === "previewCount")) fail("Cron Expression Builder should allow preview count control.");
if (!appSource.includes("cron-next-runs.csv")) fail("Cron Expression Builder should offer next-run CSV download.");
if (!appSource.includes("Copy cron expression")) fail("Cron Expression Builder should offer expression copy action.");
const brandColorSystem = tools.find((tool) => tool.id === "color-palette-generator");
if (!brandColorSystem?.description.includes("CSS variables")) fail("Brand Color System Generator description should mention CSS variables.");
if (!brandColorSystem?.description.includes("contrast checks")) fail("Brand Color System Generator description should mention contrast checks.");
if (!appSource.includes("Download Tailwind tokens")) fail("Brand Color System Generator should offer Tailwind token download.");
if (!appSource.includes("Download CSS variables")) fail("Brand Color System Generator should offer CSS variable download.");

if (typeof cronExpressionFromValues !== "function" || typeof parseCronExpression !== "function" || typeof cronNextRuns !== "function") fail("Cron helper functions must be available.");
else {
  const expression = cronExpressionFromValues({ schedule: "weekday", minute: 30, hour: 9 });
  if (expression !== "30 9 * * 1-5") fail("Cron weekday preset should generate weekday business-hour expressions.");
  const parsed = parseCronExpression("*/15 9-17 * * 1-5");
  if (parsed.error) fail(`Cron parser should accept steps and ranges: ${parsed.error}`);
  const runs = cronNextRuns(parsed, 3);
  if (runs.length !== 3) fail("Cron preview should return requested upcoming runs.");
  if (parseCronExpression("bad cron").error === undefined) fail("Cron parser should reject invalid expressions.");
  ok("Cron expression preview helpers found");
}

if (typeof lineDiff !== "function") fail("lineDiff() must be available.");
else {
  const diff = lineDiff(["a", "b", "c"], ["a", "B", "c", "d"]);
  if (!diff.some((item) => item.type === "removed" && item.text === "b")) fail("lineDiff() should mark removed lines.");
  if (!diff.some((item) => item.type === "added" && item.text === "B")) fail("lineDiff() should mark added lines.");
  if (!diff.some((item) => item.type === "same" && item.text === "a")) fail("lineDiff() should keep unchanged lines.");
  ok("Text diff algorithm found");
}

if (typeof collectRegexMatches !== "function") fail("collectRegexMatches() must be available.");
else {
  const matches = collectRegexMatches(/\b(tool)s?\b/gi, "Tools and toolkits need tools.");
  if (matches.length !== 2) fail("collectRegexMatches() should find global matches.");
  if (matches[0]?.groups?.[0]?.toLowerCase() !== "tool") fail("collectRegexMatches() should capture groups.");
  ok("Regex match collector found");
}

if (typeof searchTools !== "function") fail("searchTools() must be available.");
else {
  const imageResults = searchTools("image resize");
  if (imageResults[0]?.id !== "image-resize-calculator") fail("Search should rank Image Resizer first for image resize.");
  const csvResults = searchTools("quoted csv");
  if (!csvResults.some((tool) => tool.id === "csv-cleaner")) fail("Search should find CSV Cleaner for quoted csv.");
  const koreanLoanResults = searchTools("대출");
  if (!koreanLoanResults.some((tool) => tool.id === "loan-payment-calculator")) fail("Search should find loan tools by Korean localized title.");
  const koreanPasswordResults = searchTools("비밀번호");
  if (!koreanPasswordResults.some((tool) => tool.id === "password-generator")) fail("Search should find password tools by Korean localized title.");
  const coffeeResults = searchTools("커피쏘기");
  if (!coffeeResults.some((tool) => tool.id === "ladder-draw" || tool.id === "roulette-picker")) fail("Search should find decision tools for coffee payer use cases.");
  const rouletteResults = searchTools("룰렛");
  if (rouletteResults[0]?.id !== "roulette-picker") fail("Search should rank Roulette Picker first for Korean roulette queries.");
  const spanishCalculatorResults = searchTools("calculadora");
  if (!spanishCalculatorResults.some((tool) => tool.id === "loan-payment-calculator")) fail("Search should use localized titles across languages.");
  const noResults = searchTools("zzzzzz-no-tool");
  if (noResults.length) fail("Search should return no tools for nonsense queries.");
  if (!localizedSearchText(tools.find((tool) => tool.id === "loan-payment-calculator")).includes("대출 상환 계산기")) fail("Localized search text should include Korean tool titles.");
  if (!localizedSearchText(tools.find((tool) => tool.id === "ladder-draw")).includes("사다리 타기")) fail("Localized search text should include Korean decision tool titles.");
  ok("ranked search found");
}

if (typeof searchScore !== "function" || typeof toolRank !== "function") fail("search scoring helpers must be available.");
const imageCategoryIndex = appSource.indexOf('"Image", "Data", "Developer"');
if (imageCategoryIndex === -1) fail("Default category order should prioritize Image, Data, and Developer clusters.");
if (!appSource.includes("form.elements.namedItem(field.id)")) fail("Form value reader should use namedItem() to avoid field-name collisions.");

if (typeof toolOpportunity !== "function") fail("toolOpportunity() must be available.");
else {
  const mortgage = tools.find((tool) => tool.id === "mortgage-affordability-calculator");
  const jsonFormatter = tools.find((tool) => tool.id === "json-formatter");
  const simple = tools.find((tool) => tool.id === "line-sorter");
  if (toolOpportunity(mortgage).score < 80) fail("Mortgage calculator should be scored as a flagship opportunity.");
  if (toolMetadata(jsonFormatter).opportunity.demand !== "proven") fail("JSON Formatter should be marked as proven demand.");
  if (toolOpportunity(simple).score >= toolOpportunity(mortgage).score) fail("Simple text utilities should not outrank flagship finance tools.");
  if (!appSource.includes("data-opportunity-score")) fail("Tool cards should expose opportunity score for QA and product tuning.");
  ok("opportunity scoring found");
}

if (typeof toolPrivacyLevel !== "function" || typeof privacyNotice !== "function") fail("privacy helpers must be available.");
else {
  const imageTool = tools.find((tool) => tool.custom === "image-resizer");
  const jwtTool = tools.find((tool) => tool.id === "jwt-decoder");
  const tipToolForPrivacy = tools.find((tool) => tool.id === "tip-calculator");
  if (toolPrivacyLevel(imageTool) !== "local-file") fail("Image tools should be marked as local-file privacy level.");
  if (toolPrivacyLevel(jwtTool) !== "private-input") fail("JWT Decoder should be marked as private-input privacy level.");
  if (toolPrivacyLevel(tipToolForPrivacy) !== "browser") fail("Simple calculators should use browser privacy level.");
  const notice = privacyNotice(jwtTool);
  if (!notice.includes("Private by design") || !notice.includes("does not need server upload")) fail("Privacy notice should use accurate browser-processing language.");
  if (!privacyCopy?.ko?.title || !privacyCopy.ko.messages?.browser?.includes("브라우저")) fail("Privacy notice should include Korean localized copy.");
  for (const [code] of languages) {
    if (!privacyCopy[code]?.title || !privacyCopy[code]?.messages?.browser || !privacyCopy[code]?.messages?.["local-file"] || !privacyCopy[code]?.messages?.["private-input"]) {
      fail(`${code} privacy copy should localize all privacy notice levels.`);
    }
  }
  if (!appSource.includes("${privacyNotice(tool)}")) fail("Active tool renderers should include privacy notice.");
  ok("privacy messaging found");
}

if (typeof markdownToHtml !== "function" || typeof markdownStats !== "function") fail("Markdown helpers must be available.");
else {
  const html = markdownToHtml("# Title\n\n- item\n\n```js\nconst x = 1;\n```\n\n[OpenAI](https://openai.com)");
  if (!html.includes("<h1>Title</h1>")) fail("Markdown Preview should render headings.");
  if (!html.includes("<ul><li>item</li></ul>")) fail("Markdown Preview should render lists.");
  if (!html.includes("<pre><code>const x = 1;")) fail("Markdown Preview should render code blocks.");
  if (!html.includes('href="https://openai.com"')) fail("Markdown Preview should render safe links.");
  const stats = markdownStats("# Title\n\n- item", html);
  if (stats.headings !== 1 || stats.lists !== 1) fail("Markdown stats should count headings and list items.");
  ok("Markdown preview renderer found");
}

if (typeof safeHexColor !== "function" || typeof colorizeQrSvg !== "function" || typeof qrContentType !== "function") fail("QR helper functions must be available.");
else {
  if (safeHexColor("red", "#000000") !== "#000000") fail("safeHexColor() should reject non-hex colors.");
  if (qrContentType("https://example.com") !== "URL") fail("qrContentType() should detect URLs.");
  const colored = colorizeQrSvg('<svg fill="#ffffff"><path fill="#000000"/></svg>', 320, "#111827", "#ffffff");
  if (!colored.includes('width="320"') || !colored.includes('fill="#111827"')) fail("colorizeQrSvg() should apply size and foreground color.");
  ok("QR customization helpers found");
}

if (typeof analyzePassword !== "function" || typeof passwordWarnings !== "function") fail("Password helper functions must be available.");
else {
  const strong = analyzePassword("CorrectHorseBatteryStaple!42");
  const weakWarnings = passwordWarnings("password123", [{}, {}]);
  if (strong.entropy < 80) fail("analyzePassword() should estimate strong entropy for long mixed passwords.");
  if (!weakWarnings.some((warning) => warning.includes("common password"))) fail("passwordWarnings() should flag common password words.");
  ok("Password analysis helpers found");
}

if (typeof decodeJwt !== "function" || typeof jwtTimeStatus !== "function") fail("JWT helper functions must be available.");
else {
  const decoded = decodeJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE5MDAwMDAwMDB9.signature");
  if (decoded.header.alg !== "HS256") fail("decodeJwt() should decode JWT header.");
  if (decoded.payload.sub !== "123") fail("decodeJwt() should decode JWT payload.");
  if (!jwtTimeStatus(decoded.payload.exp, "Expires").includes("valid")) fail("jwtTimeStatus() should report future expiry as valid.");
  ok("JWT decode helpers found");
}

if (typeof salesTaxSummary !== "function") fail("Sales tax helper must be available.");
else {
  const summary = salesTaxSummary({ price: 100, tax: 8, quantity: 2, discount: 10, mode: "add" });
  const inclusive = salesTaxSummary({ price: 108, tax: 8, quantity: 1, discount: 0, mode: "remove" });
  if (summary.error) fail(`Sales tax should calculate with default-like values: ${summary.error}`);
  if (Math.abs(summary.taxableAmount - 180) > 0.001) fail("Sales tax should apply quantity and discount.");
  if (Math.abs(inclusive.taxableAmount - 100) > 0.001) fail("Sales tax remove mode should recover pre-tax price.");
  if (summary.scenarios.length !== 3) fail("Sales tax should include three scenario rows.");
  if (!summary.csv.includes("Tax rate,Subtotal,Taxable amount,Sales tax,Total")) fail("Sales tax CSV should include a header.");
  ok("Sales tax helpers found");
}

if (typeof profitMarginSummary !== "function") fail("Profit margin helper must be available.");
else {
  const summary = profitMarginSummary({ cost: 40, price: 75, fee: 2.9, fixedFee: 0.3, discount: 0, targetMargin: 40 });
  const discounted = profitMarginSummary({ cost: 40, price: 75, fee: 2.9, fixedFee: 0.3, discount: 10, targetMargin: 40 });
  if (summary.error) fail(`Profit margin should calculate with default values: ${summary.error}`);
  if (summary.netProfit < 30 || summary.netProfit > 35) fail("Profit margin net profit should account for fees.");
  if (discounted.netProfit >= summary.netProfit) fail("Discounts should reduce net profit.");
  if (summary.targetPrice <= summary.breakEvenPrice) fail("Target margin price should be above break-even price.");
  if (!summary.csv.includes("Scenario,Net revenue,Net profit,Margin,Markup")) fail("Profit margin CSV should include a header.");
  ok("Profit margin helpers found");
}

if (typeof adRevenueSummary !== "function") fail("Ad revenue helper must be available.");
else {
  const summary = adRevenueSummary({ visitors: 50000, pages: 1.4, rpm: 20, fill: 95, revenue: 1200 });
  const trafficLift = adRevenueSummary({ visitors: 62500, pages: 1.4, rpm: 20, fill: 95, revenue: 1200 });
  if (summary.error) fail(`Ad revenue should calculate with default values: ${summary.error}`);
  if (summary.revenue < 1200 || summary.revenue > 1400) fail("Ad revenue projection should be in the expected range.");
  if (trafficLift.revenue <= summary.revenue) fail("Higher traffic should increase projected revenue.");
  if (summary.visitorsFor10k <= summary.visitors) fail("Visitors for $10k should exceed current visitors for defaults.");
  if (!summary.csv.includes("Scenario,Visitors,Pageviews,Filled pageviews,Revenue")) fail("Ad revenue CSV should include a header.");
  ok("Ad revenue helpers found");
}

if (typeof discountSummary !== "function") fail("Discount helper must be available.");
else {
  const summary = discountSummary({ price: 120, discount: 25, coupon: 10, quantity: 2, tax: 8 });
  const noCoupon = discountSummary({ price: 120, discount: 25, coupon: 0, quantity: 2, tax: 8 });
  if (summary.error) fail(`Discount should calculate with default-like values: ${summary.error}`);
  if (Math.abs(summary.saleSubtotal - 162) > 0.001) fail("Discount should apply stacked percentage discounts.");
  if (summary.total <= summary.saleSubtotal) fail("Discount should add tax when tax is provided.");
  if (summary.savings <= noCoupon.savings) fail("Extra coupon should increase savings.");
  if (!summary.csv.includes("Scenario,Effective discount,Original subtotal,Sale subtotal,Tax,Total")) fail("Discount CSV should include a header.");
  ok("Discount helpers found");
}

if (typeof invoiceNumberSummary !== "function") fail("Invoice number helper must be available.");
else {
  const invoice = invoiceNumberSummary(
    { prefix: "INV", client: "ACME Co", sequence: 42, padding: 4, count: 3, separator: "-", dateFormat: "yyyymmdd" },
    new Date("2026-06-08T00:00:00Z")
  );
  if (invoice.current !== "INV-ACMECO-20260608-0042") fail("Invoice number should apply prefix, client, date, and padding.");
  if (invoice.next !== "INV-ACMECO-20260608-0043") fail("Invoice number should calculate next number.");
  if (invoice.items.length !== 3) fail("Invoice number should generate requested count.");
  if (!invoice.csv.includes("Index,Invoice number,Next invoice number,Period key")) fail("Invoice number CSV should include a header.");
  if (!invoice.policy.includes("Invoice Numbering Policy")) fail("Invoice number should generate policy notes.");
  const checked = invoiceNumberSummary(
    { prefix: "INV", client: "ACME Co", sequence: 42, padding: 4, count: 1, separator: "-", dateFormat: "yyyymmdd", resetRule: "monthly", checksum: "mod10" },
    new Date("2026-06-08T00:00:00Z")
  );
  if (!/\d$/.test(checked.current)) fail("Invoice check digit should append a digit.");
  ok("Invoice number helpers found");
}

if (typeof breakEvenSummary !== "function") fail("Break-even helper must be available.");
else {
  const summary = breakEvenSummary({ fixed: 5000, price: 50, variable: 20, targetProfit: 2500, conversion: 3 });
  const priceLift = breakEvenSummary({ fixed: 5000, price: 55, variable: 20, targetProfit: 2500, conversion: 3 });
  if (summary.error) fail(`Break-even should calculate with default values: ${summary.error}`);
  if (summary.breakEvenUnits !== 167) fail("Break-even units should use contribution margin.");
  if (summary.targetUnits <= summary.breakEvenUnits) fail("Target profit units should exceed break-even units.");
  if (priceLift.targetUnits >= summary.targetUnits) fail("Higher price should reduce target units.");
  if (!summary.csv.includes("Scenario,Break-even units,Target units,Revenue needed,Leads needed")) fail("Break-even CSV should include a header.");
  ok("Break-even helpers found");
}

if (typeof roiSummary !== "function") fail("ROI helper must be available.");
else {
  const summary = roiSummary({ cost: 1000, return: 1350, months: 12, cashflow: 50, reinvested: 20 });
  const upside = roiSummary({ cost: 1000, return: 1500, months: 12, cashflow: 50, reinvested: 20 });
  if (summary.error) fail(`ROI should calculate with default-like values: ${summary.error}`);
  if (summary.roi < 0.9 || summary.roi > 1.0) fail("ROI should include final value and cash flow.");
  if (upside.roi <= summary.roi) fail("Higher final value should improve ROI.");
  if (!summary.csv.includes("Scenario,Total return,Profit,ROI,Annualized ROI,Payback months")) fail("ROI CSV should include a header.");
  if (!summary.scenarios.some((scenario) => scenario.label === "Return -10%")) fail("ROI should include downside scenario.");
  ok("ROI helpers found");
}

if (typeof tipSummary !== "function") fail("Tip helper must be available.");
else {
  const summary = tipSummary({ bill: 100, tip: 20, people: 2, tax: 8, service: 5, rounding: "up", tipBase: "preTax" });
  const postTax = tipSummary({ bill: 100, tip: 20, people: 2, tax: 8, service: 5, rounding: "none", tipBase: "postTax" });
  if (summary.error) fail(`Tip should calculate with default-like values: ${summary.error}`);
  if (summary.tipAmount !== 20) fail("Tip should calculate pre-tax tip amount.");
  if (postTax.tipAmount <= summary.tipAmount) fail("Post-tax tip base should increase tip amount when tax is present.");
  if (!summary.csv.includes("Scenario,Tip,Tax,Service charge,Total,Per person")) fail("Tip CSV should include a header.");
  if (summary.scenarios.length !== 4) fail("Tip should include standard tip scenario rows.");
  ok("Tip helpers found");
}

if (typeof compoundInterestSummary !== "function") fail("Compound interest helper must be available.");
else {
  const flat = compoundInterestSummary({ start: 10000, monthly: 500, rate: 8, years: 10, increase: 0 });
  const increased = compoundInterestSummary({ start: 10000, monthly: 500, rate: 8, years: 10, increase: 3 });
  if (flat.error) fail(`Compound interest should calculate with default values: ${flat.error}`);
  if (flat.futureValue < 100000 || flat.futureValue > 130000) fail("Compound future value should be in the expected range.");
  if (flat.yearlyRows.length !== 10) fail("Compound interest should produce one row per year.");
  if (increased.futureValue <= flat.futureValue) fail("Contribution increases should raise future value.");
  if (!flat.csv.includes("Year,Total contributed,Estimated gain,Balance")) fail("Compound interest CSV should include a header.");
  ok("Compound interest helpers found");
}

if (typeof retirementSummary !== "function") fail("Retirement helper must be available.");
else {
  const summary = retirementSummary({
    currentAge: 35,
    retireAge: 65,
    currentSavings: 75000,
    monthly: 900,
    returnRate: 7,
    inflation: 2.5,
    incomeNeed: 70000,
    withdrawalRate: 4,
    otherIncome: 18000
  });
  const higherContribution = retirementSummary({
    currentAge: 35,
    retireAge: 65,
    currentSavings: 75000,
    monthly: 1400,
    returnRate: 7,
    inflation: 2.5,
    incomeNeed: 70000,
    withdrawalRate: 4,
    otherIncome: 18000
  });
  if (summary.error) fail(`Retirement should calculate with default values: ${summary.error}`);
  if (summary.years !== 30) fail("Retirement should calculate years to retirement.");
  if (summary.projectedSavings <= 0 || summary.targetNestEgg <= 0) fail("Retirement should calculate projected savings and target nest egg.");
  if (higherContribution.projectedSavings <= summary.projectedSavings) fail("Higher retirement contributions should increase projected savings.");
  if (!summary.scenarios.some((scenario) => scenario.label === "+25% contribution")) fail("Retirement should include contribution scenario.");
  if (!summary.csv.includes("Scenario,Projected savings,Target nest egg,Gap,Status")) fail("Retirement CSV should include scenario header.");
  ok("Retirement helpers found");
}

if (typeof savingsGoalSummary !== "function") fail("Savings goal helper must be available.");
else {
  const summary = savingsGoalSummary({ goal: 10000, current: 1500, months: 18, monthly: 450, rate: 4 });
  const faster = savingsGoalSummary({ goal: 10000, current: 1500, months: 18, monthly: 800, rate: 4 });
  if (summary.error) fail(`Savings goal should calculate with default values: ${summary.error}`);
  if (summary.monthlyNeeded < 400 || summary.monthlyNeeded > 500) fail("Savings monthly needed should be in the expected range.");
  if (faster.reachMonth >= summary.reachMonth) fail("Higher monthly savings should reach the goal sooner.");
  if (!summary.csv.includes("Month,Contributed,Interest,Balance,Remaining")) fail("Savings goal CSV should include a header.");
  if (!summary.timeline.length) fail("Savings goal should include timeline rows.");
  ok("Savings goal helpers found");
}

if (typeof creditCardPayoffSummary !== "function") fail("Credit card payoff helper must be available.");
else {
  const summary = creditCardPayoffSummary({
    balance: 8500,
    apr: 24.99,
    minimumRate: 2,
    minimumFloor: 35,
    extra: 150,
    targetMonths: 24
  });
  const minimumOnly = creditCardPayoffSummary({
    balance: 8500,
    apr: 24.99,
    minimumRate: 2,
    minimumFloor: 35,
    extra: 0,
    targetMonths: 24
  });
  if (summary.error) fail(`Credit card payoff should calculate with default values: ${summary.error}`);
  if (summary.payoffMonths >= minimumOnly.payoffMonths) fail("Extra credit card payments should reduce payoff months.");
  if (summary.interestSaved <= 0) fail("Credit card payoff should show interest saved.");
  if (summary.targetPayment <= 0) fail("Credit card payoff should calculate target payoff payment.");
  if (!summary.csv.includes("Month,Payment,Interest,Principal,Balance")) fail("Credit card payoff CSV should include a header.");
  ok("Credit card payoff helpers found");
}

if (typeof debtPayoffSummary !== "function") fail("Debt payoff helper must be available.");
else {
  const summary = debtPayoffSummary({
    debts: "Visa, 5200, 24.99, 140\nStore card, 1800, 29.99, 60\nAuto loan, 12500, 7.5, 310\nStudent loan, 9000, 5.25, 120",
    extra: 300,
    strategy: "avalanche"
  });
  const snowballPrimary = debtPayoffSummary({
    debts: "Visa, 5200, 24.99, 140\nStore card, 1800, 29.99, 60\nAuto loan, 12500, 7.5, 310\nStudent loan, 9000, 5.25, 120",
    extra: 300,
    strategy: "snowball"
  });
  if (summary.error) fail(`Debt payoff should calculate with default values: ${summary.error}`);
  if (summary.primary.label !== "Avalanche") fail("Debt payoff should honor avalanche as primary strategy.");
  if (snowballPrimary.primary.label !== "Snowball") fail("Debt payoff should honor snowball as primary strategy.");
  if (summary.avalanche.months <= 0 || summary.snowball.months <= 0) fail("Debt payoff should calculate payoff months.");
  if (!summary.primary.csv.includes("Month,Payment,Interest,Principal,Remaining balance")) fail("Debt payoff CSV should include a header.");
  if (!summary.primary.payoffOrder.length) fail("Debt payoff should include payoff order.");
  ok("Debt payoff helpers found");
}

if (typeof loanAmortizationSummary !== "function") fail("Loan amortization helper must be available.");
else {
  const base = loanAmortizationSummary(250000, 6.5, 30, 0);
  const extra = loanAmortizationSummary(250000, 6.5, 30, 200);
  if (base.monthlyPayment < 1500 || base.monthlyPayment > 1700) fail("Loan payment should be in the expected range.");
  if (extra.payoffMonths >= base.payoffMonths) fail("Extra loan payments should reduce payoff time.");
  if (extra.interestSaved <= 0) fail("Extra loan payments should show interest saved.");
  if (!extra.csv.includes("Month,Payment,Principal,Interest")) fail("Loan amortization CSV should include a header.");
  ok("Loan amortization helpers found");
}

if (typeof mortgageAffordabilitySummary !== "function") fail("Mortgage affordability helper must be available.");
else {
  const summary = mortgageAffordabilitySummary({
    income: 90000,
    debt: 500,
    down: 40000,
    rate: 6.75,
    years: 30,
    taxRate: 1.1,
    insurance: 150,
    dti: 43
  });
  const tight = mortgageAffordabilitySummary({
    income: 90000,
    debt: 500,
    down: 40000,
    rate: 6.75,
    years: 30,
    taxRate: 1.1,
    insurance: 150,
    dti: 36
  });
  if (summary.error) fail(`Mortgage affordability should calculate with default values: ${summary.error}`);
  if (summary.homePrice < 250000 || summary.homePrice > 500000) fail("Mortgage affordability home price should be in a realistic range.");
  if (tight.homePrice >= summary.homePrice) fail("Lower DTI should reduce affordable home price.");
  if (!summary.csv.includes("Scenario,Home price,Loan amount")) fail("Mortgage affordability CSV should include a header.");
  if (!summary.scenarios.some((scenario) => scenario.label === "Conservative")) fail("Mortgage affordability should include scenario rows.");
  ok("Mortgage affordability helpers found");
}

if (typeof rentVsBuySummary !== "function") fail("Rent vs buy helper must be available.");
else {
  const summary = rentVsBuySummary({
    homePrice: 450000,
    downPayment: 90000,
    mortgageRate: 6.75,
    years: 7,
    rent: 2400,
    rentGrowth: 3,
    appreciation: 3,
    investmentReturn: 5,
    propertyTax: 1.1,
    maintenance: 1,
    insurance: 150,
    sellingCost: 6
  });
  const lowerRent = rentVsBuySummary({
    homePrice: 450000,
    downPayment: 90000,
    mortgageRate: 6.75,
    years: 7,
    rent: 1800,
    rentGrowth: 3,
    appreciation: 3,
    investmentReturn: 5,
    propertyTax: 1.1,
    maintenance: 1,
    insurance: 150,
    sellingCost: 6
  });
  if (summary.error) fail(`Rent vs buy should calculate with default values: ${summary.error}`);
  if (summary.yearlyRows.length !== 7) fail("Rent vs buy should produce one row per comparison year.");
  if (summary.monthlyMortgage < 2000 || summary.monthlyMortgage > 3000) fail("Rent vs buy monthly mortgage should be in the expected range.");
  if (lowerRent.rentNetWorth <= summary.rentNetWorth) fail("Lower rent should improve renter net worth.");
  if (!summary.csv.includes("Year,Rent net worth,Buy net worth")) fail("Rent vs buy CSV should include a header.");
  ok("Rent vs buy helpers found");
}

if (typeof takeHomePaySummary !== "function") fail("Take home pay helper must be available.");
else {
  const summary = takeHomePaySummary({
    salary: 90000,
    frequency: "biweekly",
    federal: 14,
    state: 5,
    fica: 7.65,
    retirement: 6,
    health: 250,
    postTax: 0
  });
  const raise = takeHomePaySummary({
    salary: 99000,
    frequency: "biweekly",
    federal: 14,
    state: 5,
    fica: 7.65,
    retirement: 6,
    health: 250,
    postTax: 0
  });
  if (summary.error) fail(`Take home pay should calculate with default values: ${summary.error}`);
  if (summary.payPeriods !== 26) fail("Take home pay should support biweekly pay periods.");
  if (summary.netPerPaycheck < 2000 || summary.netPerPaycheck > 3000) fail("Take home paycheck should be in the expected range.");
  if (raise.netAnnual <= summary.netAnnual) fail("Higher salary should increase net annual pay.");
  if (!summary.csv.includes("Scenario,Gross annual,Gross paycheck")) fail("Take home pay CSV should include a header.");
  if (!summary.scenarios.some((scenario) => scenario.label === "+1% retirement")) fail("Take home pay should include retirement scenario rows.");
  ok("Take home pay helpers found");
}

for (const tool of standardTools) {
  if (!Array.isArray(tool.fields) || typeof tool.calculate !== "function") {
    fail(`${tool.id} must have fields and calculate().`);
    continue;
  }

  const values = Object.fromEntries(tool.fields.map((field) => [field.id, field.value ?? ""]));
  let result = "";
  try {
    result = tool.calculate(values);
  } catch (error) {
    fail(`${tool.id} threw with default values: ${error.message}`);
    continue;
  }

  if (typeof result !== "string" || result.trim().length === 0) {
    fail(`${tool.id} returned empty output with default values.`);
  }

  if (tool.id === "csv-to-json-converter") {
    if (!result.includes('download="converted.json"')) fail("CSV to JSON should offer a converted.json download.");
    if (!result.includes("Rows")) fail("CSV to JSON should include result metrics.");
  }

  if (tool.id === "json-to-csv-converter") {
    if (!result.includes('download="converted.csv"')) fail("JSON to CSV should offer a converted.csv download.");
    if (!result.includes("Columns")) fail("JSON to CSV should include column metrics.");
  }

  if (tool.id === "cron-expression-builder") {
    if (!result.includes("data-table")) fail("Cron Expression Builder should render a next-run table.");
    if (!result.includes('download="cron-next-runs.csv"')) fail("Cron Expression Builder should offer next-run CSV export.");
    if (!result.includes("Browser local time")) fail("Cron Expression Builder should clarify local timezone behavior.");
  }

  if (tool.id === "text-diff-checker") {
    if (!result.includes("diff-view")) fail("Text Diff Checker should render a readable diff view.");
    if (!result.includes('download="text-diff.patch"')) fail("Text Diff Checker should offer a patch download.");
  }

  if (tool.id === "regex-tester") {
    if (!result.includes("regex-preview")) fail("Regex Tester should render a highlighted preview.");
    if (!result.includes('download="regex-matches.json"')) fail("Regex Tester should offer JSON match download.");
  }

  if (tool.id === "markdown-preview") {
    if (!result.includes("markdown-preview")) fail("Markdown Preview should render a visual preview.");
    if (!result.includes('download="preview.html"')) fail("Markdown Preview should offer HTML download.");
  }

  if (tool.id === "password-generator") {
    if (!result.includes("Entropy")) fail("Password Generator should show entropy.");
    if (!result.includes("Copy result")) fail("Password Generator should keep copy output.");
  }

  if (tool.id === "password-strength-checker") {
    if (!result.includes("Warnings")) fail("Password Strength Checker should show warning count.");
    if (!result.includes("Entropy")) fail("Password Strength Checker should show entropy.");
  }

  if (tool.id === "jwt-decoder") {
    if (!result.includes("jwt-panels")) fail("JWT Decoder should show header and payload panels.");
    if (!result.includes("does not verify the signature")) fail("JWT Decoder should show signature verification warning.");
    if (!result.includes('download="decoded-jwt.json"')) fail("JWT Decoder should offer decoded JSON download.");
  }

  if (tool.id === "json-formatter") {
    if (!result.includes("data-table")) fail("JSON Formatter Inspector should render path table.");
    if (!result.includes('download="formatted.json"')) fail("JSON Formatter Inspector should offer formatted JSON download.");
    if (!result.includes('download="json-inspection-report.json"')) fail("JSON Formatter Inspector should offer inspection report download.");
    if (!result.includes("Paths")) fail("JSON Formatter Inspector should show path count.");
  }

  if (tool.id === "loan-payment-calculator") {
    if (!result.includes("data-table")) fail("Loan Payment Calculator should render an amortization table.");
    if (!result.includes('download="loan-amortization.csv"')) fail("Loan Payment Calculator should offer amortization CSV download.");
    if (!result.includes("Payoff time")) fail("Loan Payment Calculator should show payoff timing.");
  }

  if (tool.id === "credit-card-payoff-calculator") {
    if (!result.includes("data-table")) fail("Credit Card Payoff Calculator should render payoff table.");
    if (!result.includes('download="credit-card-payoff.csv"')) fail("Credit Card Payoff Calculator should offer CSV download.");
    if (!result.includes("Interest saved")) fail("Credit Card Payoff Calculator should show interest saved.");
  }

  if (tool.id === "debt-payoff-planner") {
    if (!result.includes("data-table")) fail("Debt Payoff Planner should render payoff tables.");
    if (!result.includes('download="debt-payoff-plan.csv"')) fail("Debt Payoff Planner should offer CSV download.");
    if (!result.includes("Best strategy")) fail("Debt Payoff Planner should show best strategy.");
  }

  if (tool.id === "compound-interest-calculator") {
    if (!result.includes("data-table")) fail("Compound Interest Calculator should render a yearly breakdown table.");
    if (!result.includes('download="compound-interest.csv"')) fail("Compound Interest Calculator should offer CSV download.");
    if (!result.includes("Return share")) fail("Compound Interest Calculator should show return share.");
  }

  if (tool.id === "retirement-calculator") {
    if (!result.includes("data-table")) fail("Retirement Calculator should render scenario and timeline tables.");
    if (!result.includes('download="retirement-plan.csv"')) fail("Retirement Calculator should offer CSV download.");
    if (!result.includes("Projected gap")) fail("Retirement Calculator should show projected gap.");
  }

  if (tool.id === "sales-tax-calculator") {
    if (!result.includes("data-table")) fail("Sales Tax Calculator should render a scenario table.");
    if (!result.includes('download="sales-tax.csv"')) fail("Sales Tax Calculator should offer CSV download.");
    if (!result.includes("Effective rate")) fail("Sales Tax Calculator should show effective rate.");
  }

  if (tool.id === "profit-margin-calculator") {
    if (!result.includes("data-table")) fail("Profit Margin Calculator should render a scenario table.");
    if (!result.includes('download="profit-margin.csv"')) fail("Profit Margin Calculator should offer CSV download.");
    if (!result.includes("Target price")) fail("Profit Margin Calculator should show target price.");
  }

  if (tool.id === "cpm-rpm-calculator") {
    if (!result.includes("data-table")) fail("CPM RPM Calculator should render a scenario table.");
    if (!result.includes('download="ad-revenue-scenarios.csv"')) fail("CPM RPM Calculator should offer CSV download.");
    if (!result.includes("Visitors for $10k/mo")) fail("CPM RPM Calculator should show $10k visitor target.");
  }

  if (tool.id === "discount-calculator") {
    if (!result.includes("data-table")) fail("Discount Calculator should render a scenario table.");
    if (!result.includes('download="discount-scenarios.csv"')) fail("Discount Calculator should offer CSV download.");
    if (!result.includes("Effective discount")) fail("Discount Calculator should show effective discount.");
  }

  if (tool.id === "invoice-number-generator") {
    if (!result.includes("data-table")) fail("Invoice Number Generator should render a preview table.");
    if (!result.includes('download="invoice-numbers.csv"')) fail("Invoice Number Generator should offer CSV download.");
    if (!result.includes('download="invoice-number-policy.md"')) fail("Invoice Number Generator should offer policy notes download.");
    if (!result.includes("Reset policy")) fail("Invoice Number Generator should show reset policy.");
    if (!result.includes("Check digit")) fail("Invoice Number Generator should show check digit.");
    if (!result.includes("Copy current invoice")) fail("Invoice Number Generator should offer copy action.");
  }

  if (tool.id === "break-even-calculator") {
    if (!result.includes("data-table")) fail("Break Even Calculator should render a scenario table.");
    if (!result.includes('download="break-even-scenarios.csv"')) fail("Break Even Calculator should offer CSV download.");
    if (!result.includes("Leads needed")) fail("Break Even Calculator should show leads needed.");
  }

  if (tool.id === "roi-calculator") {
    if (!result.includes("data-table")) fail("ROI Calculator should render a scenario table.");
    if (!result.includes('download="roi-scenarios.csv"')) fail("ROI Calculator should offer CSV download.");
    if (!result.includes("Annualized ROI")) fail("ROI Calculator should show annualized ROI.");
  }

  if (tool.id === "tip-calculator") {
    if (!result.includes("data-table")) fail("Tip Calculator should render a scenario table.");
    if (!result.includes('download="tip-scenarios.csv"')) fail("Tip Calculator should offer CSV download.");
    if (!result.includes("Effective tip")) fail("Tip Calculator should show effective tip.");
  }

  if (tool.id === "savings-goal-calculator") {
    if (!result.includes("data-table")) fail("Savings Goal Calculator should render a timeline table.");
    if (!result.includes('download="savings-goal.csv"')) fail("Savings Goal Calculator should offer CSV download.");
    if (!result.includes("Monthly gap")) fail("Savings Goal Calculator should show monthly gap.");
  }

  if (tool.id === "mortgage-affordability-calculator") {
    if (!result.includes("data-table")) fail("Mortgage Affordability Calculator should render scenario table.");
    if (!result.includes('download="mortgage-affordability.csv"')) fail("Mortgage Affordability Calculator should offer CSV download.");
    if (!result.includes("Cash to close")) fail("Mortgage Affordability Calculator should show cash to close.");
  }

  if (tool.id === "rent-vs-buy-calculator") {
    if (!result.includes("data-table")) fail("Rent vs Buy Calculator should render yearly comparison table.");
    if (!result.includes('download="rent-vs-buy-scenarios.csv"')) fail("Rent vs Buy Calculator should offer CSV download.");
    if (!result.includes("Break-even year")) fail("Rent vs Buy Calculator should show break-even year.");
  }

  if (tool.id === "take-home-pay-calculator") {
    if (!result.includes("data-table")) fail("Take Home Pay Calculator should render scenario table.");
    if (!result.includes('download="take-home-pay-scenarios.csv"')) fail("Take Home Pay Calculator should offer CSV download.");
    if (!result.includes("Net per paycheck")) fail("Take Home Pay Calculator should show net paycheck.");
  }
}

if (!indexSource.includes("app.js?v=")) fail("index.html must load versioned app.js.");
else ok("index.html loads versioned app.js");
if (!indexSource.includes("styles.css?v=")) fail("index.html must load versioned styles.css.");
else ok("index.html loads versioned styles.css");

if (!Array.isArray(languages) || languages.length !== 16) fail("Language selector should support exactly 16 languages.");
else {
  const codes = languages.map(([code]) => code);
  for (const code of codes) {
    if (!translations[code]) fail(`Missing translation pack for ${code}.`);
    if (!translations[code]?.homeHeading || !translations[code]?.openTool || !translations[code]?.closeTool || !translations[code]?.categoriesMap) fail(`${code} translation pack is missing required UI strings.`);
  }
  if (translations.ko.categoriesMap.Finance !== "금융") fail("Korean translation pack should localize Finance.");
  if (translations.ar.categoriesMap.Time !== "الوقت") fail("Arabic translation pack should localize Time.");
  const loanToolForTitle = tools.find((tool) => tool.id === "loan-payment-calculator");
  const pixelToolForTitle = tools.find((tool) => tool.id === "pixel-art-converter");
  for (const code of codes.filter((code) => code !== "en")) {
    if (!titleTerms[code] || !Object.keys(titleTerms[code]).length) fail(`${code} should include tool title translation terms.`);
    const localizedLoanTitle = localizedToolTitleFor(loanToolForTitle, code);
    if (!localizedLoanTitle || localizedLoanTitle === loanToolForTitle.title) fail(`${code} should localize Loan Payment Calculator title.`);
    const localizedPixelTitle = localizedToolTitleFor(pixelToolForTitle, code);
    if (!localizedPixelTitle || localizedPixelTitle === pixelToolForTitle.title) fail(`${code} should localize Pixel Art Converter title.`);
  }
  if (!localizedToolTitleFor(loanToolForTitle, "es").includes("Calculadora")) fail("Spanish tool titles should use Spanish terms.");
  if (!localizedToolTitleFor(loanToolForTitle, "fr").includes("Calculateur")) fail("French tool titles should use French terms.");
  if (!localizedToolTitleFor(loanToolForTitle, "ar").includes("حاسبة")) fail("Arabic tool titles should use Arabic terms.");
  ok("16-language UI packs found");
}

if (!indexSource.includes('id="language-select"')) fail("index.html should include a language selector.");
if (!indexSource.includes('id="pinned-tools"')) fail("index.html should include pinned tools sidebar.");
if (!appSource.includes("LANGUAGE_STORAGE_KEY")) fail("Language preference should be stored locally.");
if (!appSource.includes("PINNED_STORAGE_KEY") || !appSource.includes("data-pin-tool-id") || !appSource.includes("renderPinned")) fail("Pinned tool shortcuts should be persisted and rendered.");
if (!appSource.includes("★") || !appSource.includes("☆") || !appSource.includes("aria-label=")) fail("Pinned tool actions should use accessible star icon buttons.");
if (!appSource.includes("toggleTool") || !appSource.includes("closeTool") || !appSource.includes("aria-expanded")) fail("Tool cards should toggle between open and close states.");
if (!appSource.includes("pinned-section") || !appSource.includes("renderToolCard")) fail("Pinned tools should be surfaced as a top tool-grid section.");
if (!appSource.includes("renderDecisionTool") || !appSource.includes("data-decision-action") || !stylesSource.includes(".decision-stage")) fail("Decision tools should use dedicated interactive UI instead of generic calculator forms.");
if (!appSource.includes("decisionCopy") || !appSource.includes("decisionFieldLabel") || !appSource.includes("커피 쏘기") || !appSource.includes("소진 전까지 중복 없음")) fail("Decision tools should localize buttons, examples, and option labels.");
const coinFlipTool = tools.find((tool) => tool.id === "coin-flip");
if (!coinFlipTool || coinFlipTool.fields.some((field) => field.id === "headsLabel" || field.id === "tailsLabel")) fail("Coin Flip should stay a simple heads/tails tool without custom label fields.");
if (!appSource.includes("function coinFaceLabels") || !appSource.includes("[\"앞면\", \"뒷면\"]")) fail("Coin Flip should use localized front/back coin faces.");
if (!appSource.includes("function ladderStageMarkup") || !appSource.includes("ladder-label-row") || !stylesSource.includes(".ladder-board")) fail("Ladder Draw should render an actual participant-to-outcome ladder board.");
if (!stylesSource.includes("#facc15") || !stylesSource.includes(".pinned-section")) fail("Favorite stars and pinned sections should use a clear yellow treatment.");
if (!appSource.includes("document.documentElement.dir")) fail("Language switching should support text direction.");
if (!appSource.includes("localizedToolDescription")) fail("Tool cards should use localized descriptions.");
if (!appSource.includes("categoryIntro(localizedCategory(tool.category), localizedToolTitle(tool))")) fail("Localized descriptions should use localized tool titles, not English originals.");
const koreanLoanIntro = translations.ko.categoryIntro("금융", localizedToolTitleFor(tools.find((tool) => tool.id === "loan-payment-calculator"), "ko"));
const koreanBatchimIntro = translations.ko.categoryIntro("이미지", "픽셀 팩");
if (koreanLoanIntro.includes("Loan Payment Calculator")) fail("Korean tool descriptions should not mix English tool titles.");
if (koreanLoanIntro.includes("을(를)") || !koreanLoanIntro.includes("대출 상환 계산기를")) fail("Korean tool descriptions should use natural object particles.");
if (!koreanBatchimIntro.includes("픽셀 팩을")) fail("Korean object particle helper should handle final consonants.");
if (appSource.includes("scrollToCategory(location.hash")) fail("Initial page load should not auto-scroll to a stale category hash.");
if (!appSource.includes("history.replaceState(null, \"\", `${location.pathname}${location.search}`)")) fail("Initial page load should clear stale category hashes before scrolling to top.");
const homeCategoryAnchors = sidebarCategoryAnchors(indexSource);
if (homeCategoryAnchors.join(",") !== expectedCategoryAnchors.join(",")) fail("Homepage sidebar category order should match rendered category order.");
if (!stylesSource.includes("--sidebar-frame-height") || !stylesSource.includes("overflow-y: auto")) fail("Desktop sidebar should scroll independently within a measured viewport frame.");
if (!stylesSource.includes("overscroll-behavior: contain")) fail("Desktop sidebar should contain scroll chaining.");
if (!appSource.includes("updateSidebarFrameHeight") || !appSource.includes("visualViewport")) fail("App code should size the sidebar frame to the visible browser viewport.");

if (!fs.existsSync(qrVendorPath)) fail("Vendored QR code library is missing.");
else ok("vendored QR code library found");

if (!indexSource.includes('qrLibrary: "vendor/qrcode-generator/qrcode.js?v=')) fail("index.html must configure the vendored QR code library.");
if (indexSource.includes("cdn.jsdelivr.net/npm/qrcode-generator")) fail("index.html must not load QR code generation from a CDN.");
if (indexSource.includes('<script src="vendor/qrcode-generator/qrcode.js')) fail("index.html must lazy-load QR code generation.");

if (!indexSource.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) fail("index.html should keep the AdSense auto ads script.");
if (indexSource.includes("adsbygoogle\"") || indexSource.includes("ad-frame") || indexSource.includes("data-ad-slot")) fail("index.html should not reserve a manual AdSense slot.");
if (appSource.includes("lockAdFrames") || appSource.includes(".ad-frame")) fail("App code should not reserve or clamp ad slot space.");
ok("AdSense auto ads script found without reserved slots");

if (!indexSource.includes("application/ld+json")) fail("index.html is missing structured data.");
else ok("structured data marker found");

if (!indexSource.includes('href="privacy/"')) fail("index.html footer should link to Privacy page.");
if (!indexSource.includes('href="terms/"')) fail("index.html footer should link to Terms page.");

const headerMarkup = indexSource.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "";
if (headerMarkup.includes("<nav")) fail("Top header should not include shortcut navigation.");
if (!headerMarkup.includes("UtilityStack")) fail("Top header should keep the brand.");
if (!headerMarkup.includes("theme-toggle")) fail("Top header should keep the theme toggle.");
if (headerMarkup.includes('href="#top"')) fail("Homepage brand link should not use #top because it hides the hero under the sticky header.");
else ok("minimal top header found");

for (const category of categories.keys()) {
  const categorySlug = category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const categoryPage = path.join(root, "categories", categorySlug, "index.html");
  if (!fs.existsSync(categoryPage)) fail(`${category} is missing generated category page.`);
  else {
    const categoryHtml = fs.readFileSync(categoryPage, "utf8");
    const categoryTool = tools.find((tool) => tool.category === category);
    const anchor = categoryTool?.anchor || categorySlug;
    if (!categoryHtml.includes(`href="#${anchor}"`)) fail(`${category} category page sidebar should link to the in-page ${anchor} section.`);
    if (!categoryHtml.includes('id="language-select"')) fail(`${category} category page is missing language selector.`);
    if (!categoryHtml.includes('id="pinned-tools"')) fail(`${category} category page is missing pinned tools sidebar.`);
    const categoryAnchors = sidebarCategoryAnchors(categoryHtml);
    if (categoryAnchors.join(",") !== expectedCategoryAnchors.join(",")) fail(`${category} category page sidebar order should match rendered category order.`);
    if (categoryHtml.includes(`href="../../categories/${categorySlug}/"`)) fail(`${category} category page sidebar should not navigate away from the current tool list.`);
  }
}

if (!fs.existsSync(sitemapPath)) fail("sitemap.xml is missing. Run the static build.");
else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes("https://tools.koreanblog.xyz/privacy/")) fail("sitemap.xml should include privacy page.");
  if (!sitemap.includes("https://tools.koreanblog.xyz/terms/")) fail("sitemap.xml should include terms page.");
  for (const tool of tools) {
    const { slug } = toolMetadata(tool);
    if (!sitemap.includes(`/tools/${slug}/`)) fail(`sitemap.xml is missing /tools/${slug}/.`);
  }
  ok("sitemap.xml includes generated tool URLs");
}

if (!fs.existsSync(robotsPath)) fail("robots.txt is missing.");
else ok("robots.txt found");

for (const launchFile of ["404.html", "ads.txt", "favicon.ico", "favicon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "og-image.png", "site.webmanifest"]) {
  if (!fs.existsSync(path.join(root, launchFile))) fail(`${launchFile} is missing.`);
}
ok("launch files found (404, ads.txt, icons, og image, manifest)");

{
  const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (!indexHtml.includes('rel="canonical"')) fail("index.html should declare a canonical URL.");
  if (!indexHtml.includes('property="og:image"')) fail("index.html should declare og:image.");
  if (!indexHtml.includes('rel="icon"')) fail("index.html should link a favicon.");
  const sampleToolPage = path.join(root, "tools", toolMetadata(tools[0]).slug, "index.html");
  const toolHtml = fs.readFileSync(sampleToolPage, "utf8");
  if (!toolHtml.includes('property="og:image"')) fail("Generated tool pages should declare og:image.");
  if (!toolHtml.includes('rel="icon"')) fail("Generated tool pages should link a favicon.");
  ok("head metadata includes canonical, og:image, and icons");
}

{
  const sampleToolPage = path.join(root, "tools", toolMetadata(tools[0]).slug, "index.html");
  const toolHtml = fs.readFileSync(sampleToolPage, "utf8");
  if (!toolHtml.includes("Frequently asked questions")) fail("Tool pages should include FAQ content sections.");
  if (!toolHtml.includes('"FAQPage"')) fail("Tool pages should include FAQPage structured data.");
  if (!toolHtml.includes('"BreadcrumbList"')) fail("Tool pages should include BreadcrumbList structured data.");
  if (!toolHtml.includes("related-tools")) fail("Tool pages should cross-link related tools.");
  let missingContent = 0;
  for (const tool of tools) {
    const html = fs.readFileSync(path.join(root, "tools", toolMetadata(tool).slug, "index.html"), "utf8");
    if (!html.includes("Frequently asked questions")) missingContent += 1;
  }
  if (missingContent) fail(`${missingContent} tool pages are missing FAQ content sections.`);
  ok("all tool pages include unique content sections and structured data");
}

{
  const koSlugs = ["ladder-draw", "coin-flip", "dice-roller", "roulette-picker"];
  for (const slug of koSlugs) {
    const koPage = path.join(root, "ko", "tools", slug, "index.html");
    if (!fs.existsSync(koPage)) fail(`Korean page /ko/tools/${slug}/ is missing.`);
    else {
      const koHtml = fs.readFileSync(koPage, "utf8");
      if (!koHtml.includes('lang="ko"')) fail(`/ko/tools/${slug}/ should declare lang="ko".`);
      if (!koHtml.includes('hreflang="en"') || !koHtml.includes('hreflang="ko"')) fail(`/ko/tools/${slug}/ should declare hreflang alternates.`);
    }
    const enPage = fs.readFileSync(path.join(root, "tools", slug, "index.html"), "utf8");
    if (!enPage.includes(`hreflang="ko"`)) fail(`/tools/${slug}/ should link its Korean alternate.`);
  }
  ok("Korean decision tool pages exist with hreflang alternates");
}

if (!appSource.includes("data-share-tool") || !appSource.includes("applySharedStateFromUrl")) fail("Tools should support shareable state URLs.");
else ok("shareable state URLs supported");

if (!fs.existsSync(privacyPath)) fail("privacy/index.html is missing. Run the static build.");
else {
  const privacy = fs.readFileSync(privacyPath, "utf8");
  if (!privacy.includes("Browser-Based Processing")) fail("Privacy page should explain browser-based processing.");
  if (!privacy.includes("Third-Party Resources")) fail("Privacy page should disclose third-party resources.");
  if (!privacy.includes("Ads should not block tool usage")) fail("Privacy page should describe advertising stance.");
  ok("privacy page found");
}

if (!fs.existsSync(termsPath)) fail("terms/index.html is missing. Run the static build.");
else {
  const terms = fs.readFileSync(termsPath, "utf8");
  if (!terms.includes("No Professional Advice")) fail("Terms page should explain no professional advice.");
  if (!terms.includes("Accuracy And Availability")) fail("Terms page should explain accuracy and availability.");
  if (!terms.includes("Limitation Of Liability")) fail("Terms page should explain limitation of liability.");
  ok("terms page found");
}

ok(`${standardTools.length} standard tools verified with default inputs`);
ok(`${customTools.length} custom tools registered`);
ok(`${categories.size} categories: ${[...categories.entries()].map(([name, count]) => `${name} ${count}`).join(", ")}`);

if (failures.length) {
  console.error(failures.map((message) => `FAIL ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(output.join("\n"));
}
