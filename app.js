const STORAGE_KEY = "utilitystack_recent_tools";
const PINNED_STORAGE_KEY = "utilitystack_pinned_tools";
let qrLibraryPromise = null;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, disabled cookies); the app still works without it.
  }
}

let trackedObjectUrls = [];

function trackObjectUrl(url) {
  trackedObjectUrls.push(url);
  return url;
}

function releaseObjectUrls() {
  trackedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  trackedObjectUrls = [];
}

const tools = [
  {
    id: "loan-payment-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Loan Payment Calculator",
    description: "Calculate loan payments with payoff timing, extra payments, amortization summary, and CSV download.",
    fields: [
      { id: "principal", label: "Loan amount", type: "number", value: 250000, step: 1000 },
      { id: "rate", label: "Annual interest %", type: "number", value: 6.5, step: 0.1 },
      { id: "years", label: "Term years", type: "number", value: 30, step: 1 },
      { id: "extra", label: "Extra monthly payment", type: "number", value: 0, step: 25 }
    ],
    calculate(values) {
      return renderLoanPayment(values);
    }
  },
  {
    id: "credit-card-payoff-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Credit Card Payoff Calculator",
    description: "Plan credit card payoff with APR, minimum payments, extra payments, interest saved, payoff timeline, and CSV download.",
    fields: [
      { id: "balance", label: "Card balance", type: "number", value: 8500, step: 100 },
      { id: "apr", label: "APR %", type: "number", value: 24.99, step: 0.1 },
      { id: "minimumRate", label: "Minimum payment %", type: "number", value: 2, step: 0.1 },
      { id: "minimumFloor", label: "Minimum payment floor", type: "number", value: 35, step: 5 },
      { id: "extra", label: "Extra monthly payment", type: "number", value: 150, step: 25 },
      { id: "targetMonths", label: "Target payoff months", type: "number", value: 24, step: 1 }
    ],
    calculate(values) {
      return renderCreditCardPayoff(values);
    }
  },
  {
    id: "debt-payoff-planner",
    category: "Finance",
    anchor: "finance",
    title: "Debt Payoff Planner",
    description: "Compare debt avalanche and snowball payoff strategies with multiple balances, APRs, minimum payments, timeline, and CSV download.",
    fields: [
      { id: "debts", label: "Debts: name, balance, APR %, minimum payment", type: "textarea", value: "Visa, 5200, 24.99, 140\nStore card, 1800, 29.99, 60\nAuto loan, 12500, 7.5, 310\nStudent loan, 9000, 5.25, 120" },
      { id: "extra", label: "Extra monthly payoff budget", type: "number", value: 300, step: 25 },
      { id: "strategy", label: "Primary strategy", type: "select", value: "avalanche", options: [["avalanche", "Avalanche: highest APR first"], ["snowball", "Snowball: smallest balance first"]] }
    ],
    calculate(values) {
      return renderDebtPayoffPlanner(values);
    }
  },
  {
    id: "compound-interest-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Compound Interest Calculator",
    description: "Project compound growth with contributions, yearly breakdown, return share, and CSV download.",
    fields: [
      { id: "start", label: "Initial amount", type: "number", value: 10000, step: 100 },
      { id: "monthly", label: "Monthly contribution", type: "number", value: 500, step: 50 },
      { id: "rate", label: "Annual return %", type: "number", value: 8, step: 0.1 },
      { id: "years", label: "Years", type: "number", value: 10, step: 1 },
      { id: "increase", label: "Annual contribution increase %", type: "number", value: 0, step: 0.5 }
    ],
    calculate(values) {
      return renderCompoundInterest(values);
    }
  },
  {
    id: "retirement-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Retirement Calculator",
    description: "Estimate retirement readiness with inflation-adjusted income needs, withdrawal rate, contribution scenarios, projected gap, and CSV download.",
    fields: [
      { id: "currentAge", label: "Current age", type: "number", value: 35, step: 1 },
      { id: "retireAge", label: "Retirement age", type: "number", value: 65, step: 1 },
      { id: "currentSavings", label: "Current retirement savings", type: "number", value: 75000, step: 1000 },
      { id: "monthly", label: "Monthly contribution", type: "number", value: 900, step: 50 },
      { id: "returnRate", label: "Annual return %", type: "number", value: 7, step: 0.1 },
      { id: "inflation", label: "Inflation %", type: "number", value: 2.5, step: 0.1 },
      { id: "incomeNeed", label: "Desired annual income today", type: "number", value: 70000, step: 1000 },
      { id: "withdrawalRate", label: "Withdrawal rate %", type: "number", value: 4, step: 0.1 },
      { id: "otherIncome", label: "Other annual retirement income", type: "number", value: 18000, step: 1000 }
    ],
    calculate(values) {
      return renderRetirement(values);
    }
  },
  {
    id: "sales-tax-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Sales Tax Calculator",
    description: "Calculate sales tax with quantity, discount, inclusive pricing, scenarios, and CSV download.",
    fields: [
      { id: "price", label: "Price", type: "number", value: 99, step: 0.01 },
      { id: "tax", label: "Tax rate %", type: "number", value: 8.875, step: 0.001 },
      { id: "quantity", label: "Quantity", type: "number", value: 1, step: 1 },
      { id: "discount", label: "Discount %", type: "number", value: 0, step: 0.1 },
      { id: "mode", label: "Mode", type: "select", value: "add", options: [["add", "Add tax"], ["remove", "Remove tax"]] }
    ],
    calculate(values) {
      return renderSalesTax(values);
    }
  },
  {
    id: "profit-margin-calculator",
    category: "Business",
    anchor: "business",
    title: "Profit Margin Calculator",
    description: "Calculate net profit with fees, discounts, target margin pricing, scenarios, and CSV download.",
    fields: [
      { id: "cost", label: "Cost", type: "number", value: 40, step: 0.01 },
      { id: "price", label: "Selling price", type: "number", value: 75, step: 0.01 },
      { id: "fee", label: "Platform fee %", type: "number", value: 2.9, step: 0.1 },
      { id: "fixedFee", label: "Fixed fee", type: "number", value: 0.3, step: 0.01 },
      { id: "discount", label: "Discount %", type: "number", value: 0, step: 0.1 },
      { id: "targetMargin", label: "Target margin %", type: "number", value: 40, step: 1 }
    ],
    calculate(values) {
      return renderProfitMargin(values);
    }
  },
  {
    id: "invoice-number-generator",
    category: "Business",
    anchor: "business",
    title: "Invoice Number Generator",
    description: "Design invoice numbering policies with date formats, reset rules, check digits, next-number previews, policy notes, and CSV download.",
    fields: [
      { id: "prefix", label: "Prefix", type: "text", value: "INV" },
      { id: "client", label: "Client code", type: "text", value: "ACME" },
      { id: "sequence", label: "Sequence", type: "number", value: 42, step: 1 },
      { id: "padding", label: "Number padding", type: "number", value: 4, step: 1 },
      { id: "count", label: "Generate count", type: "number", value: 5, step: 1 },
      { id: "separator", label: "Separator", type: "select", value: "-", options: [["-", "Dash"], ["_", "Underscore"], ["", "None"]] },
      { id: "dateFormat", label: "Date format", type: "select", value: "yyyymm", options: [["yyyymm", "YYYYMM"], ["yyyymmdd", "YYYYMMDD"], ["yyyy", "YYYY"], ["none", "No date"]] },
      { id: "resetRule", label: "Reset rule", type: "select", value: "monthly", options: [["never", "Never reset"], ["monthly", "Reset monthly"], ["yearly", "Reset yearly"], ["client", "Separate by client"]] },
      { id: "checksum", label: "Check digit", type: "select", value: "none", options: [["none", "None"], ["mod10", "Mod 10 digit"]] }
    ],
    calculate(values) {
      return renderInvoiceNumbers(values);
    }
  },
  {
    id: "json-formatter",
    category: "Developer",
    anchor: "dev",
    title: "JSON Formatter Inspector",
    description: "Format, validate, minify, inspect JSON paths, summarize types, and download structured JSON reports in your browser.",
    fields: [
      { id: "json", label: "JSON input", type: "textarea", value: '{"name":"UtilityStack","tools":10}' },
      { id: "mode", label: "Mode", type: "select", value: "pretty", options: [["pretty", "Pretty print"], ["minify", "Minify"]] }
    ],
    calculate(values) {
      try {
        const parsed = JSON.parse(values.json);
        return renderJsonInspector(parsed, values.mode === "minify" ? "minify" : "pretty");
      } catch (err) {
        return jsonErrorMarkup(String(values.json || ""), err);
      }
    }
  },
  {
    id: "base64-encoder-decoder",
    category: "Developer",
    anchor: "dev",
    title: "Base64 Encoder Decoder",
    description: "Encode or decode Base64 strings safely on-device.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "Hello UtilityStack" },
      { id: "mode", label: "Mode", type: "select", value: "encode", options: [["encode", "Encode"], ["decode", "Decode"]] }
    ],
    calculate(values) {
      try {
        return output(values.mode === "decode" ? decodeURIComponent(escape(atob(values.text))) : btoa(unescape(encodeURIComponent(values.text))));
      } catch {
        return error("Input is not valid Base64.");
      }
    }
  },
  {
    id: "uuid-generator",
    category: "Developer",
    anchor: "dev",
    title: "UUID Generator",
    description: "Generate random UUID v4 values.",
    fields: [
      { id: "count", label: "How many", type: "number", value: 5, step: 1 }
    ],
    calculate(values) {
      const count = Math.min(Math.max(Math.floor(num(values.count)), 1), 50);
      const ids = Array.from({ length: count }, () => crypto.randomUUID());
      return output(ids.join("\n"));
    }
  },
  {
    id: "word-character-counter",
    category: "Text",
    anchor: "text",
    title: "Word Counter",
    description: "Count words, characters, sentences, and estimated reading time.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "Paste text here to count words and characters." }
    ],
    calculate(values) {
      const text = values.text || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const sentences = (text.match(/[.!?]+/g) || []).length;
      return metrics([["Words", words], ["Characters", chars], ["Sentences", sentences], ["Reading time", `${Math.max(1, Math.ceil(words / 225))} min`]]);
    }
  },
  {
    id: "text-file-word-counter",
    category: "Text",
    anchor: "text",
    title: "Text File Word Counter",
    description: "Upload or paste a text file and count words, characters, lines, and reading time.",
    custom: "file-word-counter",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "case-converter",
    category: "Text",
    anchor: "text",
    title: "Case Converter",
    description: "Convert text into title case, uppercase, lowercase, or slug case.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "make boring tools useful" },
      { id: "mode", label: "Mode", type: "select", value: "title", options: [["title", "Title case"], ["upper", "UPPERCASE"], ["lower", "lowercase"], ["slug", "slug-case"]] }
    ],
    calculate(values) {
      const text = values.text || "";
      const converted = {
        title: text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
        upper: text.toUpperCase(),
        lower: text.toLowerCase(),
        slug: text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      }[values.mode];
      return output(converted);
    }
  },
  {
    id: "percentage-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Percentage Calculator",
    description: "Calculate percentages, percentage change, and totals.",
    fields: [
      { id: "value", label: "Value", type: "number", value: 200, step: 0.01 },
      { id: "percent", label: "Percent", type: "number", value: 15, step: 0.01 },
      { id: "mode", label: "Mode", type: "select", value: "of", options: [["of", "What is X% of Y?"], ["increase", "Increase by X%"], ["decrease", "Decrease by X%"]] }
    ],
    calculate(values) {
      const value = num(values.value);
      const percent = num(values.percent) / 100;
      if (values.mode === "increase") {
        return metrics([["Original", money(value)], ["Increase", money(value * percent)], ["Total", money(value * (1 + percent))]]);
      }
      if (values.mode === "decrease") {
        return metrics([["Original", money(value)], ["Decrease", money(value * percent)], ["Total", money(value * (1 - percent))]]);
      }
      return metrics([["Result", money(value * percent)], ["Percent", `${(percent * 100).toFixed(2)}%`], ["Base value", money(value)]]);
    }
  },
  {
    id: "bmi-calculator",
    category: "Health",
    anchor: "health",
    title: "BMI Calculator",
    description: "Calculate body mass index from height and weight.",
    fields: [
      { id: "height", label: "Height", type: "number", value: 175, step: 0.1 },
      { id: "weight", label: "Weight", type: "number", value: 72, step: 0.1 },
      { id: "unit", label: "Unit", type: "select", value: "metric", options: [["metric", "cm / kg"], ["imperial", "in / lb"]] }
    ],
    calculate(values) {
      const height = num(values.height);
      const weight = num(values.weight);
      if (height <= 0 || weight <= 0) return error("Enter a positive height and weight.");
      const bmi = values.unit === "imperial"
        ? (weight / (height * height)) * 703
        : weight / ((height / 100) ** 2);
      const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obesity";
      return metrics([["BMI", bmi.toFixed(1)], ["Category", category], ["Formula", values.unit === "imperial" ? "lb / in" : "kg / m"]]);
    }
  },
  {
    id: "length-converter",
    category: "Converters",
    anchor: "converters",
    title: "Length Converter",
    description: "Convert meters, kilometers, feet, inches, and miles.",
    fields: [
      { id: "amount", label: "Amount", type: "number", value: 10, step: 0.01 },
      { id: "from", label: "From", type: "select", value: "meter", options: [["meter", "Meters"], ["kilometer", "Kilometers"], ["foot", "Feet"], ["inch", "Inches"], ["mile", "Miles"]] },
      { id: "to", label: "To", type: "select", value: "foot", options: [["meter", "Meters"], ["kilometer", "Kilometers"], ["foot", "Feet"], ["inch", "Inches"], ["mile", "Miles"]] }
    ],
    calculate(values) {
      const factors = { meter: 1, kilometer: 1000, foot: 0.3048, inch: 0.0254, mile: 1609.344 };
      const meters = num(values.amount) * factors[values.from];
      const converted = meters / factors[values.to];
      return metrics([["Result", converted.toLocaleString("en-US", { maximumFractionDigits: 6 })], ["From", values.from], ["To", values.to]]);
    }
  },
  {
    id: "temperature-converter",
    category: "Converters",
    anchor: "converters",
    title: "Temperature Converter",
    description: "Convert Celsius, Fahrenheit, and Kelvin.",
    fields: [
      { id: "amount", label: "Temperature", type: "number", value: 25, step: 0.1 },
      { id: "from", label: "From", type: "select", value: "c", options: [["c", "Celsius"], ["f", "Fahrenheit"], ["k", "Kelvin"]] },
      { id: "to", label: "To", type: "select", value: "f", options: [["c", "Celsius"], ["f", "Fahrenheit"], ["k", "Kelvin"]] }
    ],
    calculate(values) {
      const input = num(values.amount);
      const celsius = values.from === "f" ? (input - 32) * 5 / 9 : values.from === "k" ? input - 273.15 : input;
      const outputValue = values.to === "f" ? celsius * 9 / 5 + 32 : values.to === "k" ? celsius + 273.15 : celsius;
      return metrics([["Result", outputValue.toFixed(2)], ["From", values.from.toUpperCase()], ["To", values.to.toUpperCase()]]);
    }
  },
  {
    id: "url-encoder-decoder",
    category: "Developer",
    anchor: "dev",
    title: "URL Encoder Decoder",
    description: "Encode or decode URL components.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "https://example.com/search?q=free tools" },
      { id: "mode", label: "Mode", type: "select", value: "encode", options: [["encode", "Encode"], ["decode", "Decode"]] }
    ],
    calculate(values) {
      try {
        return output(values.mode === "decode" ? decodeURIComponent(values.text) : encodeURIComponent(values.text));
      } catch {
        return error("Input is not a valid encoded URL component.");
      }
    }
  },
  {
    id: "regex-tester",
    category: "Developer",
    anchor: "dev",
    title: "Regex Tester",
    description: "Test regex patterns with match highlighting, groups, indexes, and downloadable results.",
    fields: [
      { id: "preset", label: "Preset", type: "select", value: "", options: [
        ["", "Custom pattern"],
        ["email", "Email address"],
        ["url", "URL"],
        ["ipv4", "IPv4 address"],
        ["date", "Date (YYYY-MM-DD)"],
        ["hexcolor", "Hex color"],
        ["number", "Number"]
      ] },
      { id: "pattern", label: "Pattern", type: "text", value: "\\btools?\\b" },
      { id: "flags", label: "Flags", type: "text", value: "gi" },
      { id: "text", label: "Text", type: "textarea", value: "Free tools make repeated tasks faster." }
    ],
    calculate(values) {
      return renderRegexResult(values.pattern, values.flags, values.text);
    }
  },
  {
    id: "hex-rgb-converter",
    category: "Developer",
    anchor: "dev",
    title: "Hex RGB Converter",
    description: "Convert HEX colors to RGB values.",
    fields: [
      { id: "hex", label: "Hex color", type: "text", value: "#0f766e" }
    ],
    calculate(values) {
      let hex = String(values.hex || "").trim().replace(/^#/, "");
      if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return error("Enter a valid 3 or 6 digit hex color.");
      const red = parseInt(hex.slice(0, 2), 16);
      const green = parseInt(hex.slice(2, 4), 16);
      const blue = parseInt(hex.slice(4, 6), 16);
      return output(`rgb(${red}, ${green}, ${blue})`);
    }
  },
  {
    id: "remove-duplicate-lines",
    category: "Text",
    anchor: "text",
    title: "Remove Duplicate Lines",
    description: "Remove repeated lines while preserving the first occurrence.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "apple\nbanana\napple\norange\nbanana" }
    ],
    calculate(values) {
      const seen = new Set();
      const lines = String(values.text || "").split(/\r?\n/).filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
      return output(lines.join("\n"));
    }
  },
  {
    id: "whitespace-remover",
    category: "Text",
    anchor: "text",
    title: "Whitespace Remover",
    description: "Trim text, collapse spaces, or remove all whitespace.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "  Clean    this   text\\nwithout extra spaces.  " },
      { id: "mode", label: "Mode", type: "select", value: "collapse", options: [["trim", "Trim edges"], ["collapse", "Collapse spaces"], ["remove", "Remove all whitespace"]] }
    ],
    calculate(values) {
      const text = String(values.text || "");
      const cleaned = {
        trim: text.trim(),
        collapse: text.trim().replace(/\s+/g, " "),
        remove: text.replace(/\s+/g, "")
      }[values.mode];
      return output(cleaned);
    }
  },
  {
    id: "text-diff-checker",
    category: "Text",
    anchor: "text",
    title: "Text Diff Checker",
    description: "Compare two text blocks with readable added, removed, and unchanged line output.",
    fields: [
      { id: "left", label: "Original text", type: "textarea", value: "line one\nline two\nline three" },
      { id: "right", label: "Changed text", type: "textarea", value: "line one\nline 2\nline three\nline four" }
    ],
    calculate(values) {
      return renderTextDiff(String(values.left || ""), String(values.right || ""));
    }
  },
  {
    id: "meta-title-checker",
    category: "SEO",
    anchor: "seo",
    title: "Meta Title Checker",
    description: "Check title length for search result readability.",
    fields: [
      { id: "title", label: "Meta title", type: "text", value: "Free Online Tools - UtilityStack" }
    ],
    calculate(values) {
      const title = String(values.title || "");
      const length = title.length;
      const status = length < 30 ? "Too short" : length <= 60 ? "Good" : "Too long";
      return metrics([["Characters", length], ["Recommended", "30-60"], ["Status", status]]);
    }
  },
  {
    id: "meta-description-checker",
    category: "SEO",
    anchor: "seo",
    title: "Meta Description Checker",
    description: "Check meta description length and search snippet fit.",
    fields: [
      { id: "description", label: "Meta description", type: "textarea", value: "Use free calculators, converters, generators, and developer tools directly in your browser." }
    ],
    calculate(values) {
      const description = String(values.description || "");
      const length = description.length;
      const status = length < 120 ? "Too short" : length <= 160 ? "Good" : "Too long";
      return metrics([["Characters", length], ["Recommended", "120-160"], ["Status", status]]);
    }
  },
  {
    id: "robots-txt-generator",
    category: "SEO",
    anchor: "seo",
    title: "Robots.txt Generator",
    description: "Generate a simple robots.txt file.",
    fields: [
      { id: "sitemap", label: "Sitemap URL", type: "text", value: "https://example.com/sitemap.xml" },
      { id: "allow", label: "Allow path", type: "text", value: "/" },
      { id: "disallow", label: "Disallow path", type: "text", value: "/admin/" }
    ],
    calculate(values) {
      return output(`User-agent: *\nAllow: ${values.allow || "/"}\nDisallow: ${values.disallow || ""}\n\nSitemap: ${values.sitemap || ""}`);
    }
  },
  {
    id: "qr-code-generator",
    category: "Generators",
    anchor: "generators",
    title: "QR Code Generator",
    description: "Generate customizable QR codes with colors, margin, size, error correction, and SVG download.",
    custom: "qr-code",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "ladder-draw",
    category: "Decision",
    anchor: "decision",
    title: "Ladder Draw",
    description: "Draw fair random pairings for coffee runs, chores, prizes, teams, or order selection.",
    aliases: ["ladder game", "coffee payer", "coffee run", "사다리", "사다리타기", "커피쏘기", "커피내기", "순서정하기", "벌칙"],
    fields: [
      { id: "names", label: "People or teams", type: "textarea", value: "Alex\nSam\nJordan\nTaylor" },
      { id: "outcomes", label: "Outcomes or prizes", type: "textarea", value: "Buys coffee\nFree pass\nPick lunch\nChoose playlist" },
      { id: "mode", label: "Mode", type: "select", value: "shuffle", options: [["shuffle", "Shuffle pairings"], ["single", "Pick one winner"]] }
    ],
    calculate(values) {
      return renderLadderDraw(values);
    }
  },
  {
    id: "coin-flip",
    category: "Decision",
    anchor: "decision",
    title: "Coin Flip",
    description: "Flip one or many virtual coins for quick yes/no decisions.",
    aliases: ["heads or tails", "random choice", "동전", "동전던지기", "앞면", "뒷면", "찬반", "둘 중 하나"],
    fields: [
      { id: "count", label: "Number of flips", type: "number", value: 1, step: 1 }
    ],
    calculate(values) {
      return renderCoinFlip(values);
    }
  },
  {
    id: "dice-roller",
    category: "Decision",
    anchor: "decision",
    title: "Dice Roller",
    description: "Roll dice for turn order, tabletop games, raffles, or random scoring.",
    aliases: ["dice", "random number", "주사위", "주사위 굴리기", "순서정하기", "랜덤 숫자"],
    fields: [
      { id: "dice", label: "Dice count", type: "number", value: 2, step: 1 },
      { id: "sides", label: "Sides per die", type: "number", value: 6, step: 1 },
      { id: "modifier", label: "Modifier", type: "number", value: 0, step: 1 }
    ],
    calculate(values) {
      return renderDiceRoller(values);
    }
  },
  {
    id: "roulette-picker",
    category: "Decision",
    anchor: "decision",
    title: "Roulette Picker",
    description: "Pick a random item from a list for lunch, coffee, tasks, names, or ideas.",
    aliases: ["random picker", "wheel picker", "lunch picker", "coffee picker", "룰렛", "룰렛돌리기", "랜덤뽑기", "점심", "커피", "메뉴"],
    fields: [
      { id: "items", label: "Items", type: "textarea", value: "Americano\nLatte\nCold brew\nTea\nSomeone buys snacks" },
      { id: "draws", label: "Draws", type: "number", value: 1, step: 1 },
      { id: "withoutReplacement", label: "Repeat items", type: "select", value: "no", options: [["no", "No repeats"], ["yes", "Allow repeats"]] }
    ],
    calculate(values) {
      return renderRoulettePicker(values);
    }
  },
  {
    id: "password-generator",
    category: "Security",
    anchor: "security",
    title: "Password Generator",
    description: "Generate secure passwords with entropy, character mix, and copy-ready output.",
    fields: [
      { id: "length", label: "Length", type: "number", value: 16, step: 1 },
      { id: "symbols", label: "Include symbols", type: "select", value: "yes", options: [["yes", "Yes"], ["no", "No"]] }
    ],
    calculate(values) {
      const length = Math.min(Math.max(Math.floor(num(values.length)), 8), 64);
      const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const symbols = "!@#$%^&*()-_=+[]{};:,.?";
      const chars = values.symbols === "yes" ? alphabet + symbols : alphabet;
      const bytes = new Uint32Array(length);
      crypto.getRandomValues(bytes);
      const password = Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
      return passwordResultMarkup(password, chars.length);
    }
  },
  {
    id: "password-strength-checker",
    category: "Security",
    anchor: "security",
    title: "Password Strength Checker",
    description: "Estimate password strength with entropy, character variety, and common-pattern warnings.",
    fields: [
      { id: "password", label: "Password", type: "text", value: "CorrectHorseBatteryStaple!42" }
    ],
    calculate(values) {
      return passwordStrengthMarkup(String(values.password || ""));
    }
  },
  {
    id: "unix-timestamp-converter",
    category: "Time",
    anchor: "time",
    title: "Unix Timestamp Converter",
    description: "Convert Unix timestamps into readable dates.",
    fields: [
      { id: "timestamp", label: "Unix timestamp", type: "number", value: 1780838400, step: 1 },
      { id: "unit", label: "Unit", type: "select", value: "seconds", options: [["seconds", "Seconds"], ["milliseconds", "Milliseconds"]] }
    ],
    calculate(values) {
      const timestamp = num(values.timestamp);
      const date = new Date(values.unit === "milliseconds" ? timestamp : timestamp * 1000);
      if (Number.isNaN(date.getTime())) return error("Enter a valid timestamp.");
      return metrics([["UTC", date.toISOString()], ["Local", date.toLocaleString("en-US")], ["Year", date.getFullYear()]]);
    }
  },
  {
    id: "date-difference-calculator",
    category: "Time",
    anchor: "time",
    title: "Date Difference Calculator",
    description: "Calculate days between two dates.",
    fields: [
      { id: "start", label: "Start date", type: "date", value: "2026-01-01" },
      { id: "end", label: "End date", type: "date", value: "2026-12-31" }
    ],
    calculate(values) {
      const start = new Date(values.start);
      const end = new Date(values.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return error("Enter valid dates.");
      const diffDays = Math.round((end - start) / 86400000);
      return metrics([["Days", diffDays], ["Weeks", (diffDays / 7).toFixed(2)], ["Direction", diffDays >= 0 ? "Forward" : "Backward"]]);
    }
  },
  {
    id: "age-calculator",
    category: "Time",
    anchor: "time",
    title: "Age Calculator",
    description: "Calculate age from a birth date.",
    fields: [
      { id: "birthdate", label: "Birth date", type: "date", value: "1990-01-01" },
      { id: "asof", label: "As of date", type: "date", value: "2026-06-07" }
    ],
    calculate(values) {
      const birthdate = new Date(values.birthdate);
      const asof = new Date(values.asof);
      if (Number.isNaN(birthdate.getTime()) || Number.isNaN(asof.getTime())) return error("Enter valid dates.");
      let years = asof.getFullYear() - birthdate.getFullYear();
      const beforeBirthday = asof.getMonth() < birthdate.getMonth() || (asof.getMonth() === birthdate.getMonth() && asof.getDate() < birthdate.getDate());
      if (beforeBirthday) years -= 1;
      const days = Math.floor((asof - birthdate) / 86400000);
      return metrics([["Age", years], ["Total days", days.toLocaleString("en-US")], ["Birth year", birthdate.getFullYear()]]);
    }
  },
  {
    id: "weight-converter",
    category: "Converters",
    anchor: "converters",
    title: "Weight Converter",
    description: "Convert kilograms, pounds, ounces, and grams.",
    fields: [
      { id: "amount", label: "Amount", type: "number", value: 10, step: 0.01 },
      { id: "from", label: "From", type: "select", value: "kg", options: [["kg", "Kilograms"], ["g", "Grams"], ["lb", "Pounds"], ["oz", "Ounces"]] },
      { id: "to", label: "To", type: "select", value: "lb", options: [["kg", "Kilograms"], ["g", "Grams"], ["lb", "Pounds"], ["oz", "Ounces"]] }
    ],
    calculate(values) {
      const grams = { kg: 1000, g: 1, lb: 453.59237, oz: 28.349523125 };
      const converted = (num(values.amount) * grams[values.from]) / grams[values.to];
      return metrics([["Result", converted.toLocaleString("en-US", { maximumFractionDigits: 6 })], ["From", values.from], ["To", values.to]]);
    }
  },
  {
    id: "markdown-preview",
    category: "Developer",
    anchor: "dev",
    title: "Markdown Preview",
    description: "Preview Markdown with headings, lists, code, links, metrics, and downloadable HTML.",
    fields: [
      { id: "markdown", label: "Markdown", type: "textarea", value: "# Hello\n\nThis is **bold** and this is [a link](https://example.com)." }
    ],
    calculate(values) {
      return renderMarkdownPreview(values.markdown);
    }
  },
  {
    id: "json-file-formatter",
    category: "Developer",
    anchor: "dev",
    title: "JSON File Formatter",
    description: "Format JSON files with structure stats, minify mode, downloads, and clear parse errors.",
    custom: "file-json-formatter",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "csv-to-json-converter",
    category: "Data",
    anchor: "data",
    title: "CSV to JSON Converter",
    description: "Convert CSV with quoted commas and multiline fields into downloadable JSON.",
    fields: [
      { id: "csv", label: "CSV", type: "textarea", value: "name,role,notes\nAlex,Designer,\"Uses commas, safely\"\nSam,Developer,\"Ships clean data\"" }
    ],
    calculate(values) {
      const rows = parseCsv(String(values.csv || ""));
      if (rows.length < 2) return error("Enter a header row and at least one data row.");
      const headers = rows[0].map((header) => header.trim());
      const data = rows.slice(1).map((row) => {
        return Object.fromEntries(headers.map((header, index) => [header, (row[index] || "").trim()]));
      });
      const json = JSON.stringify(data, null, 2);
      return fileResultMarkup(json, "converted.json", [
        ["Rows", data.length],
        ["Columns", headers.length],
        ["Output", "JSON"],
        ["Size", formatBytes(new Blob([json]).size)]
      ]);
    }
  },
  {
    id: "json-to-csv-converter",
    category: "Data",
    anchor: "data",
    title: "JSON to CSV Converter",
    description: "Convert JSON arrays into downloadable, properly escaped CSV with consistent headers.",
    fields: [
      { id: "json", label: "JSON", type: "textarea", value: '[{"name":"Alex","role":"Designer"},{"name":"Sam","role":"Developer"}]' }
    ],
    calculate(values) {
      try {
        const data = JSON.parse(values.json);
        if (!Array.isArray(data) || !data.length || typeof data[0] !== "object") return error("Enter a JSON array of objects.");
        const headers = [...new Set(data.flatMap((item) => Object.keys(item)))];
        const rows = [headers.map(csvEscape).join(","), ...data.map((item) => headers.map((header) => csvEscape(item[header])).join(","))];
        const csv = rows.join("\n");
        return fileResultMarkup(csv, "converted.csv", [
          ["Rows", data.length],
          ["Columns", headers.length],
          ["Output", "CSV"],
          ["Size", formatBytes(new Blob([csv]).size)]
        ]);
      } catch (err) {
        return error(err.message);
      }
    }
  },
  {
    id: "csv-cleaner",
    category: "Data",
    anchor: "data",
    title: "CSV Cleaner",
    description: "Clean CSV with quoted commas, trim cells, normalize headers, remove duplicates, profile missing values, and download a quality report.",
    custom: "file-csv-cleaner",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "csv-column-extractor",
    category: "Data",
    anchor: "data",
    title: "CSV Column Extractor",
    description: "Extract selected columns from CSV, including files with quoted commas and multiline fields.",
    custom: "file-csv-columns",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "data-size-converter",
    category: "Converters",
    anchor: "converters",
    title: "Data Size Converter",
    description: "Convert bytes, KB, MB, GB, and TB.",
    fields: [
      { id: "amount", label: "Amount", type: "number", value: 1024, step: 0.01 },
      { id: "from", label: "From", type: "select", value: "mb", options: [["b", "Bytes"], ["kb", "KB"], ["mb", "MB"], ["gb", "GB"], ["tb", "TB"]] },
      { id: "to", label: "To", type: "select", value: "gb", options: [["b", "Bytes"], ["kb", "KB"], ["mb", "MB"], ["gb", "GB"], ["tb", "TB"]] }
    ],
    calculate(values) {
      const factors = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 };
      const converted = (num(values.amount) * factors[values.from]) / factors[values.to];
      return metrics([["Result", converted.toLocaleString("en-US", { maximumFractionDigits: 6 })], ["From", values.from.toUpperCase()], ["To", values.to.toUpperCase()]]);
    }
  },
  {
    id: "aspect-ratio-calculator",
    category: "Image",
    anchor: "image",
    title: "Aspect Ratio Calculator",
    description: "Resize dimensions while keeping the same aspect ratio.",
    fields: [
      { id: "width", label: "Original width", type: "number", value: 1920, step: 1 },
      { id: "height", label: "Original height", type: "number", value: 1080, step: 1 },
      { id: "newWidth", label: "New width", type: "number", value: 1280, step: 1 }
    ],
    calculate(values) {
      const width = num(values.width);
      const height = num(values.height);
      const newWidth = num(values.newWidth);
      if (width <= 0 || height <= 0 || newWidth <= 0) return error("Enter positive dimensions.");
      const newHeight = newWidth * height / width;
      return metrics([["New width", Math.round(newWidth)], ["New height", Math.round(newHeight)], ["Ratio", `${width}:${height}`]]);
    }
  },
  {
    id: "image-resize-calculator",
    category: "Image",
    anchor: "image",
    title: "Image Resizer",
    description: "Upload an image, resize it in your browser, and download the result.",
    custom: "image-resizer",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "image-compressor",
    category: "Image",
    anchor: "image",
    title: "Image Compressor",
    description: "Compress an image in your browser and download a smaller file.",
    custom: "image-compressor",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "image-format-converter",
    category: "Image",
    anchor: "image",
    title: "Image Format Converter",
    description: "Convert images between PNG, JPG, WebP, and AVIF locally with resize, quality, and transparent-background controls.",
    custom: "image-converter",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "square-image-maker",
    category: "Image",
    anchor: "image",
    title: "Square Image Maker",
    description: "Turn any image into a centered square image for profiles and social posts.",
    custom: "image-square",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "image-asset-pack-generator",
    category: "Image",
    anchor: "image",
    title: "Image Asset Pack Generator",
    description: "Generate favicon, app icon, Open Graph, social, and launch image packs from one source image locally.",
    custom: "image-asset-pack",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "pixel-art-converter",
    category: "Image",
    anchor: "image",
    title: "Pixel Art Converter",
    description: "Turn images into pixel art locally with grid size, palette reduction, dithering, export scale, and download controls.",
    custom: "image-pixel-art",
    fields: [],
    calculate() {
      return "";
    }
  },
  {
    id: "color-palette-generator",
    category: "Image",
    anchor: "image",
    title: "Brand Color System Generator",
    description: "Generate accessible brand palettes with CSS variables, Tailwind tokens, JSON, contrast checks, and copy-ready swatches.",
    fields: [
      { id: "hex", label: "Base hex color", type: "text", value: "#2563eb" },
      { id: "name", label: "Token prefix", type: "text", value: "brand" },
      { id: "mode", label: "Palette mode", type: "select", value: "balanced", options: [["balanced", "Balanced UI scale"], ["vivid", "Vivid marketing scale"], ["muted", "Muted SaaS scale"]] }
    ],
    calculate(values) {
      return renderBrandColorSystem(values);
    }
  },
  {
    id: "roi-calculator",
    category: "Business",
    anchor: "business",
    title: "ROI Calculator",
    description: "Analyze ROI with time period, recurring cash flow, annualized return, payback, scenarios, and CSV download.",
    fields: [
      { id: "cost", label: "Investment cost", type: "number", value: 1000, step: 0.01 },
      { id: "return", label: "Final value", type: "number", value: 1350, step: 0.01 },
      { id: "months", label: "Investment period months", type: "number", value: 12, step: 1 },
      { id: "cashflow", label: "Monthly cash flow", type: "number", value: 0, step: 10 },
      { id: "reinvested", label: "Reinvested cash flow %", type: "number", value: 0, step: 1 }
    ],
    calculate(values) {
      return renderRoi(values);
    }
  },
  {
    id: "break-even-calculator",
    category: "Business",
    anchor: "business",
    title: "Break Even Calculator",
    description: "Model break-even units with profit targets, conversion needs, scenarios, and CSV download.",
    fields: [
      { id: "fixed", label: "Fixed costs", type: "number", value: 5000, step: 1 },
      { id: "price", label: "Price per unit", type: "number", value: 50, step: 0.01 },
      { id: "variable", label: "Variable cost per unit", type: "number", value: 20, step: 0.01 },
      { id: "targetProfit", label: "Target profit", type: "number", value: 2500, step: 100 },
      { id: "conversion", label: "Conversion rate %", type: "number", value: 3, step: 0.1 }
    ],
    calculate(values) {
      return renderBreakEven(values);
    }
  },
  {
    id: "discount-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Discount Calculator",
    description: "Calculate stacked discounts with quantity, sales tax, savings rate, scenarios, and CSV download.",
    fields: [
      { id: "price", label: "Original price", type: "number", value: 120, step: 0.01 },
      { id: "discount", label: "Discount %", type: "number", value: 25, step: 0.01 },
      { id: "coupon", label: "Extra coupon %", type: "number", value: 0, step: 0.1 },
      { id: "quantity", label: "Quantity", type: "number", value: 1, step: 1 },
      { id: "tax", label: "Sales tax %", type: "number", value: 0, step: 0.1 }
    ],
    calculate(values) {
      return renderDiscount(values);
    }
  },
  {
    id: "tip-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Tip Calculator",
    description: "Calculate tips with tax, service charge, split payments, rounding, scenarios, and CSV download.",
    fields: [
      { id: "bill", label: "Bill amount", type: "number", value: 86.5, step: 0.01 },
      { id: "tip", label: "Tip %", type: "number", value: 18, step: 0.1 },
      { id: "people", label: "People", type: "number", value: 2, step: 1 },
      { id: "tax", label: "Tax %", type: "number", value: 8.875, step: 0.001 },
      { id: "service", label: "Service charge %", type: "number", value: 0, step: 0.1 },
      { id: "rounding", label: "Round total", type: "select", value: "none", options: [["none", "No rounding"], ["up", "Round up"], ["nearest", "Nearest dollar"]] },
      { id: "tipBase", label: "Tip base", type: "select", value: "preTax", options: [["preTax", "Pre-tax"], ["postTax", "Post-tax"]] }
    ],
    calculate(values) {
      return renderTip(values);
    }
  },
  {
    id: "reading-time-calculator",
    category: "Writing",
    anchor: "writing",
    title: "Reading Time Calculator",
    description: "Estimate reading time from word count and reading speed.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "Paste an article here to estimate how long it takes to read." },
      { id: "wpm", label: "Words per minute", type: "number", value: 225, step: 1 }
    ],
    calculate(values) {
      const words = String(values.text || "").trim() ? String(values.text).trim().split(/\s+/).length : 0;
      const wpm = Math.max(1, num(values.wpm));
      const minutes = words / wpm;
      return metrics([["Words", words], ["Minutes", minutes.toFixed(2)], ["Rounded", `${Math.max(1, Math.ceil(minutes))} min`]]);
    }
  },
  {
    id: "gpa-calculator",
    category: "Education",
    anchor: "education",
    title: "GPA Calculator",
    description: "Calculate weighted GPA from grades and credits.",
    fields: [
      { id: "grades", label: "Grades and credits", type: "textarea", value: "4.0,3\n3.7,4\n3.3,3" }
    ],
    calculate(values) {
      const rows = String(values.grades || "").split(/\r?\n/).map((row) => row.split(",").map(num)).filter((row) => row.length >= 2);
      const credits = rows.reduce((sum, [, credit]) => sum + credit, 0);
      if (!credits) return error("Enter rows like grade,credits.");
      const points = rows.reduce((sum, [grade, credit]) => sum + grade * credit, 0);
      return metrics([["GPA", (points / credits).toFixed(2)], ["Credits", credits], ["Classes", rows.length]]);
    }
  },
  {
    id: "cidr-calculator",
    category: "Network",
    anchor: "network",
    title: "CIDR Calculator",
    description: "Calculate subnet mask and usable host count from CIDR.",
    fields: [
      { id: "cidr", label: "CIDR prefix", type: "number", value: 24, step: 1 }
    ],
    calculate(values) {
      const cidr = Math.min(32, Math.max(0, Math.floor(num(values.cidr))));
      const mask = (0xffffffff << (32 - cidr)) >>> 0;
      const parts = [24, 16, 8, 0].map((shift) => (mask >>> shift) & 255);
      const total = 2 ** (32 - cidr);
      const usable = cidr >= 31 ? total : Math.max(0, total - 2);
      return metrics([["Subnet mask", parts.join(".")], ["Addresses", total.toLocaleString("en-US")], ["Usable hosts", usable.toLocaleString("en-US")]]);
    }
  },
  {
    id: "mortgage-affordability-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Mortgage Affordability Calculator",
    description: "Estimate affordable home price with DTI, interest rate, taxes, insurance, and closing cash.",
    fields: [
      { id: "income", label: "Annual income", type: "number", value: 90000, step: 1000 },
      { id: "debt", label: "Monthly debt", type: "number", value: 500, step: 50 },
      { id: "down", label: "Down payment", type: "number", value: 40000, step: 1000 },
      { id: "rate", label: "Interest rate %", type: "number", value: 6.75, step: 0.125 },
      { id: "years", label: "Loan term years", type: "number", value: 30, step: 1 },
      { id: "taxRate", label: "Property tax % / year", type: "number", value: 1.1, step: 0.05 },
      { id: "insurance", label: "Insurance / month", type: "number", value: 150, step: 10 },
      { id: "dti", label: "Max total DTI %", type: "number", value: 43, step: 1 }
    ],
    calculate(values) {
      return renderMortgageAffordability(values);
    }
  },
  {
    id: "rent-vs-buy-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Rent vs Buy Calculator",
    description: "Compare renting and buying with loan terms, closing costs, rent growth, home appreciation, investment return, equity, and CSV scenarios.",
    fields: [
      { id: "homePrice", label: "Home price", type: "number", value: 450000, step: 5000 },
      { id: "downPayment", label: "Down payment", type: "number", value: 90000, step: 5000 },
      { id: "mortgageRate", label: "Mortgage rate %", type: "number", value: 6.75, step: 0.125 },
      { id: "loanTerm", label: "Loan term years", type: "number", value: 30, step: 1 },
      { id: "years", label: "Compare years", type: "number", value: 7, step: 1 },
      { id: "rent", label: "Current rent / month", type: "number", value: 2400, step: 50 },
      { id: "rentGrowth", label: "Rent growth % / year", type: "number", value: 3, step: 0.1 },
      { id: "appreciation", label: "Home appreciation % / year", type: "number", value: 3, step: 0.1 },
      { id: "investmentReturn", label: "Investment return % / year", type: "number", value: 5, step: 0.1 },
      { id: "closingCost", label: "Buyer closing costs %", type: "number", value: 3, step: 0.1 },
      { id: "propertyTax", label: "Property tax % / year", type: "number", value: 1.1, step: 0.05 },
      { id: "maintenance", label: "Maintenance % / year", type: "number", value: 1, step: 0.1 },
      { id: "insurance", label: "Home insurance / month", type: "number", value: 150, step: 10 },
      { id: "hoa", label: "HOA / other costs / month", type: "number", value: 0, step: 25 },
      { id: "sellingCost", label: "Selling cost %", type: "number", value: 6, step: 0.1 }
    ],
    calculate(values) {
      return renderRentVsBuy(values);
    }
  },
  {
    id: "hourly-to-salary-calculator",
    category: "Business",
    anchor: "business",
    title: "Hourly to Salary Calculator",
    description: "Convert hourly rate into weekly, monthly, and annual pay.",
    fields: [
      { id: "rate", label: "Hourly rate", type: "number", value: 35, step: 0.01 },
      { id: "hours", label: "Hours per week", type: "number", value: 40, step: 0.5 }
    ],
    calculate(values) {
      const weekly = num(values.rate) * num(values.hours);
      return metrics([["Weekly", money(weekly)], ["Monthly", money(weekly * 52 / 12)], ["Annual", money(weekly * 52)]]);
    }
  },
  {
    id: "take-home-pay-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Take Home Pay Calculator",
    description: "Estimate net pay by paycheck with pre-tax deductions, federal and state tax rates, FICA estimate, scenarios, and CSV download.",
    fields: [
      { id: "salary", label: "Annual gross pay", type: "number", value: 90000, step: 1000 },
      { id: "frequency", label: "Pay frequency", type: "select", value: "biweekly", options: [["weekly", "Weekly"], ["biweekly", "Biweekly"], ["semimonthly", "Semi-monthly"], ["monthly", "Monthly"], ["annual", "Annual"]] },
      { id: "federal", label: "Federal tax estimate %", type: "number", value: 14, step: 0.1 },
      { id: "state", label: "State/local tax estimate %", type: "number", value: 5, step: 0.1 },
      { id: "fica", label: "Payroll tax estimate %", type: "number", value: 7.65, step: 0.01 },
      { id: "retirement", label: "Pre-tax retirement %", type: "number", value: 6, step: 0.5 },
      { id: "health", label: "Pre-tax benefits / month", type: "number", value: 250, step: 25 },
      { id: "postTax", label: "Post-tax deductions / month", type: "number", value: 0, step: 25 }
    ],
    calculate(values) {
      return renderTakeHomePay(values);
    }
  },
  {
    id: "savings-goal-calculator",
    category: "Finance",
    anchor: "finance",
    title: "Savings Goal Calculator",
    description: "Plan a savings goal with interest, target date, monthly gap, timeline, and CSV download.",
    fields: [
      { id: "goal", label: "Savings goal", type: "number", value: 10000, step: 100 },
      { id: "current", label: "Current savings", type: "number", value: 1500, step: 100 },
      { id: "months", label: "Target months", type: "number", value: 18, step: 1 },
      { id: "monthly", label: "Planned monthly savings", type: "number", value: 450, step: 25 },
      { id: "rate", label: "Annual interest %", type: "number", value: 4, step: 0.1 }
    ],
    calculate(values) {
      return renderSavingsGoal(values);
    }
  },
  {
    id: "cpm-rpm-calculator",
    category: "Business",
    anchor: "business",
    title: "CPM RPM Calculator",
    description: "Forecast ad revenue with visitors, pageviews, RPM, fill rate, scenarios, and CSV download.",
    fields: [
      { id: "visitors", label: "Monthly visitors", type: "number", value: 50000, step: 1000 },
      { id: "pages", label: "Pages per visitor", type: "number", value: 1.4, step: 0.1 },
      { id: "rpm", label: "Page RPM", type: "number", value: 20, step: 0.5 },
      { id: "fill", label: "Ad fill rate %", type: "number", value: 95, step: 1 },
      { id: "revenue", label: "Known revenue", type: "number", value: 1200, step: 0.01 }
    ],
    calculate(values) {
      return renderAdRevenue(values);
    }
  },
  {
    id: "html-entity-encoder-decoder",
    category: "Developer",
    anchor: "dev",
    title: "HTML Entity Encoder Decoder",
    description: "Encode or decode common HTML entities.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "<strong>Hello & welcome</strong>" },
      { id: "mode", label: "Mode", type: "select", value: "encode", options: [["encode", "Encode"], ["decode", "Decode"]] }
    ],
    calculate(values) {
      const entityMap = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#039;": "'" };
      if (values.mode === "decode") {
        return output(String(values.text || "").replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (entity) => entityMap[entity]));
      }
      return output(escapeHtml(values.text || ""));
    }
  },
  {
    id: "jwt-decoder",
    category: "Developer",
    anchor: "dev",
    title: "JWT Decoder",
    description: "Decode JWT header, payload, claims, and expiry details without verifying the signature.",
    fields: [
      { id: "token", label: "JWT", type: "textarea", value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlV0aWxpdHlTdGFjayJ9.signature" }
    ],
    calculate(values) {
      return renderJwtDecode(values.token);
    }
  },
  {
    id: "cron-expression-builder",
    category: "Developer",
    anchor: "dev",
    title: "Cron Expression Builder",
    description: "Build cron expressions with presets, readable summaries, next run previews, and CSV export.",
    fields: [
      { id: "schedule", label: "Schedule", type: "select", value: "weekday", options: [["five", "Every 5 minutes"], ["hourly", "Every hour"], ["daily", "Every day"], ["weekday", "Weekdays"], ["weekly", "Every week"], ["monthly", "Every month"], ["custom", "Custom expression"]] },
      { id: "customExpression", label: "Custom expression", type: "text", value: "0 9 * * 1-5" },
      { id: "minute", label: "Minute", type: "number", value: 0, step: 1 },
      { id: "hour", label: "Hour", type: "number", value: 9, step: 1 },
      { id: "dayOfMonth", label: "Day of month", type: "number", value: 1, step: 1 },
      { id: "weekday", label: "Weekday", type: "select", value: 1, options: [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"], [0, "Sunday"]] },
      { id: "previewCount", label: "Next runs", type: "number", value: 8, step: 1 }
    ],
    calculate(values) {
      return renderCronExpression(values);
    }
  },
  {
    id: "line-sorter",
    category: "Text",
    anchor: "text",
    title: "Line Sorter",
    description: "Sort lines alphabetically or reverse alphabetically.",
    fields: [
      { id: "text", label: "Lines", type: "textarea", value: "banana\napple\norange\nkiwi" },
      { id: "order", label: "Order", type: "select", value: "asc", options: [["asc", "A to Z"], ["desc", "Z to A"]] }
    ],
    calculate(values) {
      const lines = String(values.text || "").split(/\r?\n/).filter((line) => line.length);
      lines.sort((a, b) => values.order === "desc" ? b.localeCompare(a) : a.localeCompare(b));
      return output(lines.join("\n"));
    }
  },
  {
    id: "find-and-replace",
    category: "Text",
    anchor: "text",
    title: "Find and Replace",
    description: "Replace text matches in a block of text.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "The quick brown fox jumps over the brown dog." },
      { id: "find", label: "Find", type: "text", value: "brown" },
      { id: "replace", label: "Replace with", type: "text", value: "red" }
    ],
    calculate(values) {
      const find = String(values.find || "");
      if (!find) return output(values.text || "");
      const replaced = String(values.text || "").split(find).join(values.replace || "");
      return output(replaced);
    }
  },
  {
    id: "countdown-calculator",
    category: "Time",
    anchor: "time",
    title: "Countdown Calculator",
    description: "Calculate time remaining until a future date.",
    fields: [
      { id: "target", label: "Target date", type: "date", value: "2026-12-31" }
    ],
    calculate(values) {
      const target = new Date(values.target);
      const now = new Date();
      if (Number.isNaN(target.getTime())) return error("Enter a valid target date.");
      const diff = target - now;
      const days = Math.ceil(diff / 86400000);
      return metrics([["Days left", days], ["Weeks left", (days / 7).toFixed(2)], ["Status", diff >= 0 ? "Upcoming" : "Past"]]);
    }
  }
];

const toolGrid = document.getElementById("tool-grid");
const workspace = document.getElementById("tool-workspace");
const search = document.getElementById("tool-search");
const pinnedTools = document.getElementById("pinned-tools");
const recentTools = document.getElementById("recent-tools");
const themeToggle = document.getElementById("theme-toggle");
const languageSelect = document.getElementById("language-select");
let activeTool = null;

const LANGUAGE_STORAGE_KEY = "utilitystack_language";
const languages = [
  ["en", "English"],
  ["ko", "한국어"],
  ["ja", "日本語"],
  ["zh", "中文"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["pt", "Português"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["ru", "Русский"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["id", "Indonesia"],
  ["vi", "Tiếng Việt"],
  ["th", "ไทย"]
];
const languageCodes = new Set(languages.map(([code]) => code));
const decisionCopy = {
  en: {
    empty: "Set the options, then run the decision.",
    running: "Running...",
    coinAria: "Coin result",
    rouletteIdle: "SPIN",
    ladderIdle: "READY",
    actions: {
      "ladder-draw": "Draw ladder",
      "coin-flip": "Flip coin",
      "dice-roller": "Roll dice",
      "roulette-picker": "Spin roulette"
    },
    again: {
      "ladder-draw": "Draw again",
      "coin-flip": "Flip again",
      "dice-roller": "Roll again",
      "roulette-picker": "Spin again"
    },
    fields: {
      "ladder-draw": {
        names: "Participants",
        outcomes: "Outcomes",
        mode: "Mode"
      },
      "coin-flip": {
        count: "Flip count"
      },
      "dice-roller": {
        dice: "Dice",
        sides: "Sides",
        modifier: "Modifier"
      },
      "roulette-picker": {
        items: "Roulette items",
        picks: "Draw count",
        withoutReplacement: "Repeat rule"
      }
    },
    values: {
      "ladder-draw": {
        names: "Mina\nJules\nKai\nSam",
        outcomes: "Pays for coffee\nSafe today\nPicks lunch\nBrings snacks"
      },
      "roulette-picker": {
        items: "Americano\nLatte\nCold brew\nTea\nBring snacks"
      }
    },
    options: {
      "ladder-draw": {
        mode: {
          shuffle: "Shuffle all matches",
          single: "Pick one person"
        }
      },
      "roulette-picker": {
        withoutReplacement: {
          no: "No repeats until exhausted",
          yes: "Allow repeats"
        }
      }
    }
  },
  ko: {
    empty: "옵션을 정한 뒤 실행 버튼을 눌러 결과를 확인하세요.",
    running: "진행 중...",
    coinAria: "동전 던지기 결과",
    rouletteIdle: "시작",
    ladderIdle: "준비",
    actions: {
      "ladder-draw": "사다리 타기",
      "coin-flip": "동전 던지기",
      "dice-roller": "주사위 굴리기",
      "roulette-picker": "룰렛 돌리기"
    },
    again: {
      "ladder-draw": "다시 타기",
      "coin-flip": "다시 던지기",
      "dice-roller": "다시 굴리기",
      "roulette-picker": "다시 돌리기"
    },
    fields: {
      "ladder-draw": {
        names: "참가자",
        outcomes: "결과",
        mode: "진행 방식"
      },
      "coin-flip": {
        count: "던질 횟수"
      },
      "dice-roller": {
        dice: "주사위 개수",
        sides: "면 수",
        modifier: "보정값"
      },
      "roulette-picker": {
        items: "룰렛 항목",
        picks: "뽑을 개수",
        withoutReplacement: "중복 규칙"
      }
    },
    values: {
      "ladder-draw": {
        names: "민수\n지아\n현우\n서연",
        outcomes: "커피 쏘기\n오늘은 패스\n점심 메뉴 고르기\n간식 사오기"
      },
      "roulette-picker": {
        items: "아메리카노\n라테\n콜드브루\n차\n간식 사오기"
      }
    },
    options: {
      "ladder-draw": {
        mode: {
          shuffle: "전체 매칭 섞기",
          single: "한 명만 뽑기"
        }
      },
      "roulette-picker": {
        withoutReplacement: {
          no: "소진 전까지 중복 없음",
          yes: "중복 허용"
        }
      }
    }
  }
};

function koreanObjectMarker(text) {
  const normalized = String(text || "").trim();
  const lastHangul = [...normalized].reverse().find((char) => {
    const code = char.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3;
  });
  if (!lastHangul) return "를";
  return (lastHangul.charCodeAt(0) - 0xac00) % 28 === 0 ? "를" : "을";
}

const translations = {
  en: {
    homeHeading: "Free Online Tools",
    searchPlaceholder: "Search tools: JSON, loan, word, invoice...",
    categories: "Categories",
    pinned: "Pinned tools",
    noPinned: "Pin tools you use often.",
    recent: "Recently used",
    noRecent: "No recently used tools yet.",
    noMatchesTitle: "No matching tools",
    noMatchesBody: "Try a simpler search like JSON, image, CSV, regex, password, or calculator.",
    openTool: "Open tool",
    closeTool: "Close tool",
    pinTool: "Pin",
    unpinTool: "Unpin",
    resetDefaults: "Reset to defaults",
    shareLink: "Copy share link",
    shareCopied: "Link copied!",
    shareHint: "Share this setup as a link — anyone who opens it sees your inputs",
    howToUse: "How to use",
    enterValues: "Enter your values in the tool fields.",
    reviewResult: "Review the result that updates automatically.",
    copyOutput: "Copy the output when you need to paste it elsewhere.",
    privacy: "Privacy",
    terms: "Terms",
    footer: "Free browser-based tools. No uploads, no accounts.",
    toolsWord: "Tools",
    toolSingular: "tool",
    toolPlural: "tools",
    categorySuffix: "tools",
    categoryIntro: (category, title) => `Use this ${category.toLowerCase()} tool directly in your browser: ${title}.`,
    categoriesMap: {}
  },
  ko: {
    homeHeading: "무료 온라인 도구",
    searchPlaceholder: "도구 검색: JSON, 대출, 단어, 인보이스...",
    categories: "카테고리",
    pinned: "고정 도구",
    noPinned: "자주 쓰는 도구를 고정하세요.",
    recent: "최근 사용",
    noRecent: "최근 사용한 도구가 아직 없습니다.",
    noMatchesTitle: "일치하는 도구가 없습니다",
    noMatchesBody: "JSON, 이미지, CSV, 정규식, 비밀번호, 계산기처럼 더 간단한 검색어를 입력해보세요.",
    openTool: "도구 열기",
    closeTool: "도구 닫기",
    pinTool: "고정",
    unpinTool: "해제",
    resetDefaults: "기본값으로 재설정",
    shareLink: "공유 링크 복사",
    shareCopied: "링크 복사됨!",
    shareHint: "지금 설정을 링크로 공유 — 받은 사람에게 같은 화면이 열립니다",
    howToUse: "사용 방법",
    enterValues: "도구 입력란에 값을 입력하세요.",
    reviewResult: "자동으로 갱신되는 결과를 확인하세요.",
    copyOutput: "필요할 때 결과를 복사해 붙여넣으세요.",
    privacy: "개인정보",
    terms: "이용약관",
    footer: "브라우저에서 바로 쓰는 무료 도구. 업로드도 계정도 필요 없습니다.",
    toolsWord: "도구",
    toolSingular: "개 도구",
    toolPlural: "개 도구",
    categorySuffix: "도구",
    categoryIntro: (category, title) => `${title}${koreanObjectMarker(title)} 브라우저에서 바로 사용할 수 있는 ${category} 도구입니다.`,
    categoriesMap: { Finance: "금융", Business: "비즈니스", Developer: "개발자", Text: "텍스트", Health: "건강", Converters: "변환", SEO: "SEO", Generators: "생성", Security: "보안", Time: "시간", Data: "데이터", Image: "이미지", Writing: "글쓰기", Education: "교육", Network: "네트워크" }
  },
  ja: {
    homeHeading: "無料オンラインツール",
    searchPlaceholder: "ツール検索: JSON、ローン、単語、請求書...",
    categories: "カテゴリ",
    recent: "最近使ったツール",
    noRecent: "最近使ったツールはまだありません。",
    noMatchesTitle: "一致するツールがありません",
    noMatchesBody: "JSON、画像、CSV、正規表現、パスワード、計算機などで検索してください。",
    openTool: "ツールを開く",
    closeTool: "ツールを閉じる",
    howToUse: "使い方",
    enterValues: "入力欄に値を入力します。",
    reviewResult: "自動更新される結果を確認します。",
    copyOutput: "必要なときに結果をコピーします。",
    privacy: "プライバシー",
    terms: "利用規約",
    footer: "ブラウザで使える無料ツール。アップロードもアカウントも不要です。",
    toolsWord: "ツール",
    toolSingular: "ツール",
    toolPlural: "ツール",
    categorySuffix: "ツール",
    categoryIntro: (category, title) => `${title} はブラウザで直接使える ${category} ツールです。`,
    categoriesMap: { Finance: "金融", Business: "ビジネス", Developer: "開発者", Text: "テキスト", Health: "健康", Converters: "変換", SEO: "SEO", Generators: "生成", Security: "セキュリティ", Time: "時間", Data: "データ", Image: "画像", Writing: "文章", Education: "教育", Network: "ネットワーク" }
  },
  zh: {
    homeHeading: "免费在线工具",
    searchPlaceholder: "搜索工具：JSON、贷款、字数、发票...",
    categories: "分类",
    recent: "最近使用",
    noRecent: "还没有最近使用的工具。",
    noMatchesTitle: "没有匹配的工具",
    noMatchesBody: "试试 JSON、图片、CSV、正则、密码或计算器等关键词。",
    openTool: "打开工具",
    closeTool: "关闭工具",
    howToUse: "使用方法",
    enterValues: "在工具字段中输入数值。",
    reviewResult: "查看自动更新的结果。",
    copyOutput: "需要时复制输出结果。",
    privacy: "隐私",
    terms: "条款",
    footer: "免费的浏览器工具。无需上传，无需账户。",
    toolsWord: "工具",
    toolSingular: "个工具",
    toolPlural: "个工具",
    categorySuffix: "工具",
    categoryIntro: (category, title) => `${title} 是可直接在浏览器中使用的${category}工具。`,
    categoriesMap: { Finance: "金融", Business: "商业", Developer: "开发者", Text: "文本", Health: "健康", Converters: "转换", SEO: "SEO", Generators: "生成器", Security: "安全", Time: "时间", Data: "数据", Image: "图片", Writing: "写作", Education: "教育", Network: "网络" }
  },
  es: {
    homeHeading: "Herramientas online gratis",
    searchPlaceholder: "Buscar herramientas: JSON, préstamo, palabras, factura...",
    categories: "Categorías",
    recent: "Usadas recientemente",
    noRecent: "Aún no hay herramientas recientes.",
    noMatchesTitle: "No hay herramientas coincidentes",
    noMatchesBody: "Prueba una búsqueda simple como JSON, imagen, CSV, regex, contraseña o calculadora.",
    openTool: "Abrir herramienta",
    closeTool: "Cerrar herramienta",
    howToUse: "Cómo usar",
    enterValues: "Introduce tus valores en los campos.",
    reviewResult: "Revisa el resultado que se actualiza automáticamente.",
    copyOutput: "Copia el resultado cuando lo necesites.",
    privacy: "Privacidad",
    terms: "Términos",
    footer: "Herramientas gratuitas en el navegador. Sin subidas ni cuentas.",
    toolsWord: "Herramientas",
    toolSingular: "herramienta",
    toolPlural: "herramientas",
    categorySuffix: "herramientas",
    categoryIntro: (category, title) => `Usa esta herramienta de ${category.toLowerCase()} directamente en tu navegador: ${title}.`,
    categoriesMap: { Finance: "Finanzas", Business: "Negocios", Developer: "Desarrollo", Text: "Texto", Health: "Salud", Converters: "Convertidores", SEO: "SEO", Generators: "Generadores", Security: "Seguridad", Time: "Tiempo", Data: "Datos", Image: "Imagen", Writing: "Escritura", Education: "Educación", Network: "Red" }
  },
  fr: {
    homeHeading: "Outils en ligne gratuits",
    searchPlaceholder: "Rechercher: JSON, prêt, mots, facture...",
    categories: "Catégories",
    recent: "Récents",
    noRecent: "Aucun outil récent pour le moment.",
    noMatchesTitle: "Aucun outil trouvé",
    noMatchesBody: "Essayez JSON, image, CSV, regex, mot de passe ou calculatrice.",
    openTool: "Ouvrir l'outil",
    closeTool: "Fermer l'outil",
    howToUse: "Mode d'emploi",
    enterValues: "Saisissez vos valeurs dans les champs.",
    reviewResult: "Consultez le résultat mis à jour automatiquement.",
    copyOutput: "Copiez le résultat quand vous en avez besoin.",
    privacy: "Confidentialité",
    terms: "Conditions",
    footer: "Outils gratuits dans le navigateur. Aucun envoi, aucun compte.",
    toolsWord: "Outils",
    toolSingular: "outil",
    toolPlural: "outils",
    categorySuffix: "outils",
    categoryIntro: (category, title) => `Utilisez cet outil ${category.toLowerCase()} directement dans votre navigateur: ${title}.`,
    categoriesMap: { Finance: "Finance", Business: "Business", Developer: "Développeur", Text: "Texte", Health: "Santé", Converters: "Convertisseurs", SEO: "SEO", Generators: "Générateurs", Security: "Sécurité", Time: "Temps", Data: "Données", Image: "Image", Writing: "Rédaction", Education: "Éducation", Network: "Réseau" }
  },
  de: {
    homeHeading: "Kostenlose Online-Tools",
    searchPlaceholder: "Tools suchen: JSON, Kredit, Wörter, Rechnung...",
    categories: "Kategorien",
    recent: "Zuletzt verwendet",
    noRecent: "Noch keine zuletzt verwendeten Tools.",
    noMatchesTitle: "Keine passenden Tools",
    noMatchesBody: "Versuche JSON, Bild, CSV, Regex, Passwort oder Rechner.",
    openTool: "Tool öffnen",
    closeTool: "Tool schließen",
    howToUse: "So funktioniert es",
    enterValues: "Gib deine Werte in die Felder ein.",
    reviewResult: "Prüfe das automatisch aktualisierte Ergebnis.",
    copyOutput: "Kopiere das Ergebnis bei Bedarf.",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    footer: "Kostenlose Browser-Tools. Keine Uploads, keine Konten.",
    toolsWord: "Tools",
    toolSingular: "Tool",
    toolPlural: "Tools",
    categorySuffix: "Tools",
    categoryIntro: (category, title) => `Nutze dieses ${category}-Tool direkt im Browser: ${title}.`,
    categoriesMap: { Finance: "Finanzen", Business: "Business", Developer: "Entwickler", Text: "Text", Health: "Gesundheit", Converters: "Konverter", SEO: "SEO", Generators: "Generatoren", Security: "Sicherheit", Time: "Zeit", Data: "Daten", Image: "Bild", Writing: "Schreiben", Education: "Bildung", Network: "Netzwerk" }
  },
  pt: {
    homeHeading: "Ferramentas online gratuitas",
    searchPlaceholder: "Buscar ferramentas: JSON, empréstimo, palavras, fatura...",
    categories: "Categorias",
    recent: "Recentes",
    noRecent: "Ainda não há ferramentas recentes.",
    noMatchesTitle: "Nenhuma ferramenta encontrada",
    noMatchesBody: "Tente JSON, imagem, CSV, regex, senha ou calculadora.",
    openTool: "Abrir ferramenta",
    closeTool: "Fechar ferramenta",
    howToUse: "Como usar",
    enterValues: "Digite seus valores nos campos.",
    reviewResult: "Confira o resultado atualizado automaticamente.",
    copyOutput: "Copie o resultado quando precisar.",
    privacy: "Privacidade",
    terms: "Termos",
    footer: "Ferramentas gratuitas no navegador. Sem uploads, sem contas.",
    toolsWord: "Ferramentas",
    toolSingular: "ferramenta",
    toolPlural: "ferramentas",
    categorySuffix: "ferramentas",
    categoryIntro: (category, title) => `Use esta ferramenta de ${category.toLowerCase()} diretamente no navegador: ${title}.`,
    categoriesMap: { Finance: "Finanças", Business: "Negócios", Developer: "Desenvolvedor", Text: "Texto", Health: "Saúde", Converters: "Conversores", SEO: "SEO", Generators: "Geradores", Security: "Segurança", Time: "Tempo", Data: "Dados", Image: "Imagem", Writing: "Escrita", Education: "Educação", Network: "Rede" }
  },
  it: {
    homeHeading: "Strumenti online gratuiti",
    searchPlaceholder: "Cerca strumenti: JSON, prestito, parole, fattura...",
    categories: "Categorie",
    recent: "Recenti",
    noRecent: "Nessuno strumento recente.",
    noMatchesTitle: "Nessuno strumento trovato",
    noMatchesBody: "Prova JSON, immagine, CSV, regex, password o calcolatrice.",
    openTool: "Apri strumento",
    closeTool: "Chiudi strumento",
    howToUse: "Come usare",
    enterValues: "Inserisci i valori nei campi.",
    reviewResult: "Controlla il risultato aggiornato automaticamente.",
    copyOutput: "Copia il risultato quando ti serve.",
    privacy: "Privacy",
    terms: "Termini",
    footer: "Strumenti gratuiti nel browser. Nessun upload, nessun account.",
    toolsWord: "Strumenti",
    toolSingular: "strumento",
    toolPlural: "strumenti",
    categorySuffix: "strumenti",
    categoryIntro: (category, title) => `Usa questo strumento ${category.toLowerCase()} direttamente nel browser: ${title}.`,
    categoriesMap: { Finance: "Finanza", Business: "Business", Developer: "Sviluppo", Text: "Testo", Health: "Salute", Converters: "Convertitori", SEO: "SEO", Generators: "Generatori", Security: "Sicurezza", Time: "Tempo", Data: "Dati", Image: "Immagine", Writing: "Scrittura", Education: "Istruzione", Network: "Rete" }
  },
  nl: {
    homeHeading: "Gratis online tools",
    searchPlaceholder: "Zoek tools: JSON, lening, woorden, factuur...",
    categories: "Categorieën",
    recent: "Recent gebruikt",
    noRecent: "Nog geen recent gebruikte tools.",
    noMatchesTitle: "Geen passende tools",
    noMatchesBody: "Probeer JSON, afbeelding, CSV, regex, wachtwoord of calculator.",
    openTool: "Tool openen",
    closeTool: "Tool sluiten",
    howToUse: "Hoe te gebruiken",
    enterValues: "Vul je waarden in de velden in.",
    reviewResult: "Bekijk het automatisch bijgewerkte resultaat.",
    copyOutput: "Kopieer het resultaat wanneer nodig.",
    privacy: "Privacy",
    terms: "Voorwaarden",
    footer: "Gratis browsertools. Geen uploads, geen accounts.",
    toolsWord: "Tools",
    toolSingular: "tool",
    toolPlural: "tools",
    categorySuffix: "tools",
    categoryIntro: (category, title) => `Gebruik deze ${category.toLowerCase()}-tool direct in je browser: ${title}.`,
    categoriesMap: { Finance: "Financiën", Business: "Zakelijk", Developer: "Ontwikkelaar", Text: "Tekst", Health: "Gezondheid", Converters: "Converters", SEO: "SEO", Generators: "Generators", Security: "Beveiliging", Time: "Tijd", Data: "Data", Image: "Afbeelding", Writing: "Schrijven", Education: "Onderwijs", Network: "Netwerk" }
  },
  ru: {
    homeHeading: "Бесплатные онлайн-инструменты",
    searchPlaceholder: "Поиск: JSON, кредит, слова, счет...",
    categories: "Категории",
    recent: "Недавние",
    noRecent: "Недавних инструментов пока нет.",
    noMatchesTitle: "Инструменты не найдены",
    noMatchesBody: "Попробуйте JSON, изображение, CSV, regex, пароль или калькулятор.",
    openTool: "Открыть",
    closeTool: "Закрыть",
    howToUse: "Как использовать",
    enterValues: "Введите значения в поля.",
    reviewResult: "Проверьте результат, который обновляется автоматически.",
    copyOutput: "Скопируйте результат при необходимости.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    footer: "Бесплатные инструменты в браузере. Без загрузок и аккаунтов.",
    toolsWord: "Инструменты",
    toolSingular: "инструмент",
    toolPlural: "инструментов",
    categorySuffix: "инструменты",
    categoryIntro: (category, title) => `Используйте инструмент ${category.toLowerCase()} прямо в браузере: ${title}.`,
    categoriesMap: { Finance: "Финансы", Business: "Бизнес", Developer: "Разработка", Text: "Текст", Health: "Здоровье", Converters: "Конвертеры", SEO: "SEO", Generators: "Генераторы", Security: "Безопасность", Time: "Время", Data: "Данные", Image: "Изображения", Writing: "Письмо", Education: "Образование", Network: "Сеть" }
  },
  ar: {
    homeHeading: "أدوات مجانية على الإنترنت",
    searchPlaceholder: "ابحث: JSON، قرض، كلمات، فاتورة...",
    categories: "الفئات",
    recent: "المستخدمة مؤخرا",
    noRecent: "لا توجد أدوات مستخدمة مؤخرا بعد.",
    noMatchesTitle: "لا توجد أدوات مطابقة",
    noMatchesBody: "جرب JSON أو الصور أو CSV أو regex أو كلمة المرور أو الحاسبة.",
    openTool: "افتح الأداة",
    closeTool: "إغلاق الأداة",
    howToUse: "طريقة الاستخدام",
    enterValues: "أدخل القيم في حقول الأداة.",
    reviewResult: "راجع النتيجة التي تتحدث تلقائيا.",
    copyOutput: "انسخ النتيجة عند الحاجة.",
    privacy: "الخصوصية",
    terms: "الشروط",
    footer: "أدوات مجانية داخل المتصفح. بلا رفع ملفات أو حسابات.",
    toolsWord: "أدوات",
    toolSingular: "أداة",
    toolPlural: "أدوات",
    categorySuffix: "أدوات",
    categoryIntro: (category, title) => `استخدم أداة ${category} مباشرة في المتصفح: ${title}.`,
    categoriesMap: { Finance: "المالية", Business: "الأعمال", Developer: "المطور", Text: "النص", Health: "الصحة", Converters: "التحويل", SEO: "SEO", Generators: "المولدات", Security: "الأمان", Time: "الوقت", Data: "البيانات", Image: "الصور", Writing: "الكتابة", Education: "التعليم", Network: "الشبكة" }
  },
  hi: {
    homeHeading: "मुफ्त ऑनलाइन टूल",
    searchPlaceholder: "टूल खोजें: JSON, ऋण, शब्द, इनवॉइस...",
    categories: "श्रेणियां",
    recent: "हाल ही में उपयोग",
    noRecent: "अभी कोई हालिया टूल नहीं है।",
    noMatchesTitle: "कोई मिलता-जुलता टूल नहीं",
    noMatchesBody: "JSON, image, CSV, regex, password या calculator जैसे सरल शब्द खोजें।",
    openTool: "टूल खोलें",
    closeTool: "टूल बंद करें",
    howToUse: "कैसे उपयोग करें",
    enterValues: "टूल फ़ील्ड में मान दर्ज करें।",
    reviewResult: "अपने-आप अपडेट होने वाला परिणाम देखें।",
    copyOutput: "ज़रूरत होने पर परिणाम कॉपी करें।",
    privacy: "गोपनीयता",
    terms: "शर्तें",
    footer: "मुफ्त ब्राउज़र-आधारित टूल। कोई अपलोड नहीं, कोई खाता नहीं।",
    toolsWord: "टूल",
    toolSingular: "टूल",
    toolPlural: "टूल",
    categorySuffix: "टूल",
    categoryIntro: (category, title) => `${title} को सीधे ब्राउज़र में उपयोग करें: ${category} टूल।`,
    categoriesMap: { Finance: "वित्त", Business: "व्यवसाय", Developer: "डेवलपर", Text: "टेक्स्ट", Health: "स्वास्थ्य", Converters: "कन्वर्टर", SEO: "SEO", Generators: "जनरेटर", Security: "सुरक्षा", Time: "समय", Data: "डेटा", Image: "चित्र", Writing: "लेखन", Education: "शिक्षा", Network: "नेटवर्क" }
  },
  id: {
    homeHeading: "Alat online gratis",
    searchPlaceholder: "Cari alat: JSON, pinjaman, kata, invoice...",
    categories: "Kategori",
    recent: "Baru digunakan",
    noRecent: "Belum ada alat yang baru digunakan.",
    noMatchesTitle: "Tidak ada alat yang cocok",
    noMatchesBody: "Coba JSON, gambar, CSV, regex, kata sandi, atau kalkulator.",
    openTool: "Buka alat",
    closeTool: "Tutup alat",
    howToUse: "Cara menggunakan",
    enterValues: "Masukkan nilai di kolom alat.",
    reviewResult: "Tinjau hasil yang diperbarui otomatis.",
    copyOutput: "Salin hasil saat diperlukan.",
    privacy: "Privasi",
    terms: "Ketentuan",
    footer: "Alat gratis berbasis browser. Tanpa unggahan, tanpa akun.",
    toolsWord: "Alat",
    toolSingular: "alat",
    toolPlural: "alat",
    categorySuffix: "alat",
    categoryIntro: (category, title) => `Gunakan alat ${category.toLowerCase()} ini langsung di browser: ${title}.`,
    categoriesMap: { Finance: "Keuangan", Business: "Bisnis", Developer: "Developer", Text: "Teks", Health: "Kesehatan", Converters: "Konverter", SEO: "SEO", Generators: "Generator", Security: "Keamanan", Time: "Waktu", Data: "Data", Image: "Gambar", Writing: "Penulisan", Education: "Pendidikan", Network: "Jaringan" }
  },
  vi: {
    homeHeading: "Công cụ trực tuyến miễn phí",
    searchPlaceholder: "Tìm công cụ: JSON, khoản vay, từ, hóa đơn...",
    categories: "Danh mục",
    recent: "Dùng gần đây",
    noRecent: "Chưa có công cụ dùng gần đây.",
    noMatchesTitle: "Không tìm thấy công cụ",
    noMatchesBody: "Thử JSON, hình ảnh, CSV, regex, mật khẩu hoặc máy tính.",
    openTool: "Mở công cụ",
    closeTool: "Đóng công cụ",
    howToUse: "Cách dùng",
    enterValues: "Nhập giá trị vào các trường.",
    reviewResult: "Xem kết quả được cập nhật tự động.",
    copyOutput: "Sao chép kết quả khi cần.",
    privacy: "Quyền riêng tư",
    terms: "Điều khoản",
    footer: "Công cụ miễn phí chạy trong trình duyệt. Không tải lên, không cần tài khoản.",
    toolsWord: "Công cụ",
    toolSingular: "công cụ",
    toolPlural: "công cụ",
    categorySuffix: "công cụ",
    categoryIntro: (category, title) => `Dùng công cụ ${category.toLowerCase()} này ngay trong trình duyệt: ${title}.`,
    categoriesMap: { Finance: "Tài chính", Business: "Kinh doanh", Developer: "Lập trình", Text: "Văn bản", Health: "Sức khỏe", Converters: "Chuyển đổi", SEO: "SEO", Generators: "Tạo nội dung", Security: "Bảo mật", Time: "Thời gian", Data: "Dữ liệu", Image: "Hình ảnh", Writing: "Viết", Education: "Giáo dục", Network: "Mạng" }
  },
  th: {
    homeHeading: "เครื่องมือออนไลน์ฟรี",
    searchPlaceholder: "ค้นหาเครื่องมือ: JSON, เงินกู้, คำ, ใบแจ้งหนี้...",
    categories: "หมวดหมู่",
    recent: "ใช้ล่าสุด",
    noRecent: "ยังไม่มีเครื่องมือที่ใช้ล่าสุด",
    noMatchesTitle: "ไม่พบเครื่องมือที่ตรงกัน",
    noMatchesBody: "ลองค้นหา JSON, รูปภาพ, CSV, regex, รหัสผ่าน หรือเครื่องคิดเลข",
    openTool: "เปิดเครื่องมือ",
    closeTool: "ปิดเครื่องมือ",
    howToUse: "วิธีใช้",
    enterValues: "ป้อนค่าลงในช่องของเครื่องมือ",
    reviewResult: "ตรวจผลลัพธ์ที่อัปเดตอัตโนมัติ",
    copyOutput: "คัดลอกผลลัพธ์เมื่อต้องการ",
    privacy: "ความเป็นส่วนตัว",
    terms: "เงื่อนไข",
    footer: "เครื่องมือฟรีในเบราว์เซอร์ ไม่ต้องอัปโหลด ไม่ต้องมีบัญชี",
    toolsWord: "เครื่องมือ",
    toolSingular: "เครื่องมือ",
    toolPlural: "เครื่องมือ",
    categorySuffix: "เครื่องมือ",
    categoryIntro: (category, title) => `ใช้เครื่องมือ ${category} นี้ได้โดยตรงในเบราว์เซอร์: ${title}`,
    categoriesMap: { Finance: "การเงิน", Business: "ธุรกิจ", Developer: "นักพัฒนา", Text: "ข้อความ", Health: "สุขภาพ", Converters: "ตัวแปลง", SEO: "SEO", Generators: "ตัวสร้าง", Security: "ความปลอดภัย", Time: "เวลา", Data: "ข้อมูล", Image: "รูปภาพ", Writing: "การเขียน", Education: "การศึกษา", Network: "เครือข่าย" }
  }
};
Object.entries({
  ja: ["固定ツール", "よく使うツールを固定します。", "固定", "解除"],
  zh: ["固定工具", "固定常用工具。", "固定", "取消固定"],
  es: ["Herramientas fijadas", "Fija las herramientas que usas a menudo.", "Fijar", "Quitar"],
  fr: ["Outils épinglés", "Épinglez les outils utilisés souvent.", "Épingler", "Retirer"],
  de: ["Angeheftete Tools", "Hefte häufig genutzte Tools an.", "Anheften", "Lösen"],
  pt: ["Ferramentas fixadas", "Fixe as ferramentas que você usa muito.", "Fixar", "Desafixar"],
  it: ["Strumenti fissati", "Fissa gli strumenti che usi spesso.", "Fissa", "Rimuovi"],
  nl: ["Vastgezette tools", "Zet vaak gebruikte tools vast.", "Vastzetten", "Losmaken"],
  ru: ["Закрепленные инструменты", "Закрепите часто используемые инструменты.", "Закрепить", "Открепить"],
  ar: ["أدوات مثبتة", "ثبت الأدوات التي تستخدمها كثيرا.", "تثبيت", "إلغاء التثبيت"],
  hi: ["पिन किए गए टूल", "अक्सर उपयोग किए जाने वाले टूल पिन करें।", "पिन करें", "हटाएं"],
  id: ["Alat disematkan", "Sematkan alat yang sering digunakan.", "Sematkan", "Lepas"],
  vi: ["Công cụ ghim", "Ghim các công cụ bạn dùng thường xuyên.", "Ghim", "Bỏ ghim"],
  th: ["เครื่องมือที่ปักหมุด", "ปักหมุดเครื่องมือที่ใช้บ่อย", "ปักหมุด", "เลิกปักหมุด"]
}).forEach(([code, [pinned, noPinned, pinTool, unpinTool]]) => {
  Object.assign(translations[code], { pinned, noPinned, pinTool, unpinTool });
});

Object.entries({
  en: "Decision",
  ko: "결정",
  ja: "決定",
  zh: "决策",
  es: "Decisiones",
  fr: "Décision",
  de: "Entscheidung",
  pt: "Decisão",
  it: "Decisione",
  nl: "Beslissing",
  ru: "Выбор",
  ar: "القرار",
  hi: "निर्णय",
  id: "Keputusan",
  vi: "Quyết định",
  th: "การตัดสินใจ"
}).forEach(([code, label]) => {
  translations[code].categoriesMap.Decision = label;
});

const privacyCopy = {
  en: {
    title: "Private by design",
    messages: {
      "local-file": "Files are processed in your browser. They do not need to be uploaded to our servers.",
      "private-input": "Input is processed in your browser. No account is required, and pasted content does not need server upload.",
      browser: "Runs in your browser with no account required."
    }
  },
  ko: {
    title: "처음부터 개인정보 보호",
    messages: {
      "local-file": "파일은 브라우저 안에서 처리됩니다. 서버로 업로드할 필요가 없습니다.",
      "private-input": "입력값은 브라우저 안에서 처리됩니다. 계정이 필요 없고, 붙여넣은 내용도 서버 업로드가 필요 없습니다.",
      browser: "계정 없이 브라우저에서 바로 실행됩니다."
    }
  },
  ja: {
    title: "プライバシー重視設計",
    messages: {
      "local-file": "ファイルはブラウザ内で処理されます。サーバーへアップロードする必要はありません。",
      "private-input": "入力内容はブラウザ内で処理されます。アカウントは不要で、貼り付けた内容をサーバーへアップロードする必要もありません。",
      browser: "アカウント不要でブラウザ内で実行されます。"
    }
  },
  zh: {
    title: "隐私优先设计",
    messages: {
      "local-file": "文件会在你的浏览器中处理，不需要上传到服务器。",
      "private-input": "输入内容会在你的浏览器中处理。无需账户，粘贴内容也无需上传服务器。",
      browser: "无需账户，直接在浏览器中运行。"
    }
  },
  es: {
    title: "Privacidad desde el diseño",
    messages: {
      "local-file": "Los archivos se procesan en tu navegador. No hace falta subirlos a nuestros servidores.",
      "private-input": "La entrada se procesa en tu navegador. No necesitas cuenta y el contenido pegado no requiere subida al servidor.",
      browser: "Funciona en tu navegador sin necesidad de cuenta."
    }
  },
  fr: {
    title: "Confidentialité intégrée",
    messages: {
      "local-file": "Les fichiers sont traités dans votre navigateur. Ils n'ont pas besoin d'être envoyés à nos serveurs.",
      "private-input": "Les saisies sont traitées dans votre navigateur. Aucun compte n'est requis et le contenu collé n'a pas besoin d'être envoyé au serveur.",
      browser: "Fonctionne dans votre navigateur sans compte."
    }
  },
  de: {
    title: "Datenschutz von Anfang an",
    messages: {
      "local-file": "Dateien werden in deinem Browser verarbeitet. Sie müssen nicht auf unsere Server hochgeladen werden.",
      "private-input": "Eingaben werden in deinem Browser verarbeitet. Kein Konto erforderlich, und eingefügte Inhalte müssen nicht auf den Server hochgeladen werden.",
      browser: "Läuft ohne Konto direkt in deinem Browser."
    }
  },
  pt: {
    title: "Privacidade desde o início",
    messages: {
      "local-file": "Os arquivos são processados no seu navegador. Não precisam ser enviados aos nossos servidores.",
      "private-input": "A entrada é processada no seu navegador. Não é preciso criar conta, e o conteúdo colado não precisa ser enviado ao servidor.",
      browser: "Funciona no navegador sem precisar de conta."
    }
  },
  it: {
    title: "Privacy fin dalla progettazione",
    messages: {
      "local-file": "I file vengono elaborati nel tuo browser. Non devono essere caricati sui nostri server.",
      "private-input": "I dati inseriti vengono elaborati nel tuo browser. Non serve un account e il contenuto incollato non deve essere caricato sul server.",
      browser: "Funziona nel browser senza bisogno di account."
    }
  },
  nl: {
    title: "Privacy vanaf het ontwerp",
    messages: {
      "local-file": "Bestanden worden in je browser verwerkt. Ze hoeven niet naar onze servers te worden geupload.",
      "private-input": "Invoer wordt in je browser verwerkt. Er is geen account nodig en geplakte inhoud hoeft niet naar de server te worden geupload.",
      browser: "Werkt in je browser zonder account."
    }
  },
  ru: {
    title: "Конфиденциальность по умолчанию",
    messages: {
      "local-file": "Файлы обрабатываются в вашем браузере. Их не нужно загружать на наши серверы.",
      "private-input": "Ввод обрабатывается в вашем браузере. Учетная запись не требуется, а вставленный контент не нужно загружать на сервер.",
      browser: "Работает в браузере без учетной записи."
    }
  },
  ar: {
    title: "الخصوصية من الأساس",
    messages: {
      "local-file": "تتم معالجة الملفات داخل متصفحك. لا حاجة إلى رفعها إلى خوادمنا.",
      "private-input": "تتم معالجة الإدخال داخل متصفحك. لا تحتاج إلى حساب، ولا يلزم رفع المحتوى الملصق إلى الخادم.",
      browser: "يعمل داخل متصفحك من دون الحاجة إلى حساب."
    }
  },
  hi: {
    title: "डिज़ाइन से ही निजी",
    messages: {
      "local-file": "फ़ाइलें आपके ब्राउज़र में ही प्रोसेस होती हैं। उन्हें हमारे सर्वर पर अपलोड करने की जरूरत नहीं है।",
      "private-input": "इनपुट आपके ब्राउज़र में ही प्रोसेस होता है। खाता जरूरी नहीं है, और पेस्ट की गई सामग्री को सर्वर पर अपलोड करने की जरूरत नहीं है।",
      browser: "बिना खाते के सीधे आपके ब्राउज़र में चलता है।"
    }
  },
  id: {
    title: "Privasi sejak awal",
    messages: {
      "local-file": "File diproses di browser Anda. File tidak perlu diunggah ke server kami.",
      "private-input": "Input diproses di browser Anda. Tidak perlu akun, dan konten yang ditempel tidak perlu diunggah ke server.",
      browser: "Berjalan di browser tanpa perlu akun."
    }
  },
  vi: {
    title: "Riêng tư ngay từ thiết kế",
    messages: {
      "local-file": "Tệp được xử lý trong trình duyệt của bạn. Không cần tải lên máy chủ của chúng tôi.",
      "private-input": "Dữ liệu nhập được xử lý trong trình duyệt của bạn. Không cần tài khoản và nội dung dán vào không cần tải lên máy chủ.",
      browser: "Chạy trong trình duyệt mà không cần tài khoản."
    }
  },
  th: {
    title: "ออกแบบมาเพื่อความเป็นส่วนตัว",
    messages: {
      "local-file": "ไฟล์จะถูกประมวลผลในเบราว์เซอร์ของคุณ ไม่จำเป็นต้องอัปโหลดไปยังเซิร์ฟเวอร์ของเรา",
      "private-input": "ข้อมูลที่ป้อนจะถูกประมวลผลในเบราว์เซอร์ของคุณ ไม่ต้องมีบัญชี และไม่จำเป็นต้องอัปโหลดเนื้อหาที่วางไปยังเซิร์ฟเวอร์",
      browser: "ทำงานในเบราว์เซอร์โดยไม่ต้องมีบัญชี"
    }
  }
};

const titleTerms = {
  ko: {
    "Loan Payment": "대출 상환", "Credit Card Payoff": "신용카드 상환", "Debt Payoff": "부채 상환", "Compound Interest": "복리", "Sales Tax": "판매세", "Profit Margin": "이익률", "Invoice Number": "인보이스 번호", "JSON Formatter Inspector": "JSON 포매터 검사기", "Base64 Encoder Decoder": "Base64 인코더/디코더", "Word Counter": "단어 카운터", "Text File Word Counter": "텍스트 파일 단어 카운터", "Case Converter": "대소문자 변환기", "Percentage": "백분율", "Length": "길이", "Temperature": "온도", "URL Encoder Decoder": "URL 인코더/디코더", "Regex": "정규식", "Hex RGB": "HEX RGB", "Remove Duplicate Lines": "중복 줄 제거", "Whitespace": "공백", "Text Diff": "텍스트 비교", "Meta Title": "메타 제목", "Meta Description": "메타 설명", "Robots.txt": "Robots.txt", "QR Code": "QR 코드", "Password Strength": "비밀번호 강도", "Password": "비밀번호", "Unix Timestamp": "Unix 타임스탬프", "Date Difference": "날짜 차이", "Age": "나이", "Weight": "무게", "Markdown": "Markdown", "JSON File": "JSON 파일", "CSV to JSON": "CSV to JSON", "JSON to CSV": "JSON to CSV", "CSV Column": "CSV 열", "CSV": "CSV", "Data Size": "데이터 크기", "Aspect Ratio": "종횡비", "Image Format": "이미지 포맷", "Image Asset Pack": "이미지 에셋 팩", "Pixel Art": "픽셀아트", "Brand Color System": "브랜드 색상 시스템", "Square Image": "정사각형 이미지", "Break Even": "손익분기점", "Reading Time": "읽기 시간", "Grade Percentage": "성적 백분율", "Study Timer": "학습 타이머", "IP to Integer": "IP 정수 변환", "Mortgage Affordability": "주택담보대출 구매력", "Rent vs Buy": "임대 vs 구매", "Hourly to Salary": "시급 연봉 변환", "Take Home Pay": "실수령액", "Savings Goal": "저축 목표", "CPM RPM": "CPM RPM", "HTML Entity": "HTML 엔티티", "JWT": "JWT", "Cron Expression": "Cron 표현식", "Lorem Ipsum": "Lorem Ipsum", "Line Sorter": "줄 정렬기", "Find and Replace": "찾기 및 바꾸기", "List Randomizer": "목록 랜덤화", "Countdown": "카운트다운", "Retirement": "은퇴", "Discount": "할인", "Sentence": "문장", "Calculator": "계산기", "Converter": "변환기", "Generator": "생성기", "Checker": "검사기", "Planner": "플래너", "Formatter": "포매터", "Decoder": "디코더", "Encoder": "인코더", "Tester": "테스터", "Preview": "미리보기", "Cleaner": "클리너", "Extractor": "추출기", "Resizer": "리사이저", "Compressor": "압축기", "Maker": "메이커", "Counter": "카운터", "Remover": "제거기", "Tip": "팁", "ROI": "ROI", "BMI": "BMI", "GPA": "GPA", "CIDR": "CIDR"
  },
  ja: {
    "Loan Payment": "ローン返済", "Credit Card Payoff": "クレジットカード返済", "Debt Payoff": "債務返済", "Compound Interest": "複利", "Sales Tax": "消費税", "Profit Margin": "利益率", "Invoice Number": "請求書番号", "JSON Formatter Inspector": "JSONフォーマット検査", "Base64 Encoder Decoder": "Base64エンコード/デコード", "Word Counter": "単語カウンター", "Text File Word Counter": "テキストファイル単語カウンター", "Case Converter": "文字種変換", "Percentage": "パーセンテージ", "Length": "長さ", "Temperature": "温度", "URL Encoder Decoder": "URLエンコード/デコード", "Regex": "正規表現", "Remove Duplicate Lines": "重複行削除", "Whitespace": "空白", "Text Diff": "テキスト差分", "Meta Title": "メタタイトル", "Meta Description": "メタ説明", "QR Code": "QRコード", "Password Strength": "パスワード強度", "Password": "パスワード", "Unix Timestamp": "Unixタイムスタンプ", "Date Difference": "日付差分", "Age": "年齢", "Weight": "重さ", "JSON File": "JSONファイル", "CSV Column": "CSV列", "Data Size": "データサイズ", "Aspect Ratio": "アスペクト比", "Image Format": "画像形式", "Image Asset Pack": "画像アセットパック", "Pixel Art": "ピクセルアート", "Brand Color System": "ブランドカラーシステム", "Square Image": "正方形画像", "Break Even": "損益分岐点", "Reading Time": "読了時間", "Grade Percentage": "成績パーセント", "Study Timer": "学習タイマー", "IP to Integer": "IP整数変換", "Mortgage Affordability": "住宅ローン購入可能額", "Rent vs Buy": "賃貸 vs 購入", "Hourly to Salary": "時給から年収", "Take Home Pay": "手取り給与", "Savings Goal": "貯蓄目標", "HTML Entity": "HTMLエンティティ", "Cron Expression": "Cron式", "Line Sorter": "行ソーター", "Find and Replace": "検索と置換", "List Randomizer": "リストランダム化", "Countdown": "カウントダウン", "Retirement": "退職", "Discount": "割引", "Sentence": "文", "Calculator": "計算機", "Converter": "変換", "Generator": "生成", "Checker": "チェック", "Planner": "プランナー", "Formatter": "フォーマッター", "Tester": "テスター", "Preview": "プレビュー", "Cleaner": "クリーナー", "Extractor": "抽出", "Resizer": "リサイズ", "Compressor": "圧縮", "Maker": "メーカー", "Counter": "カウンター", "Remover": "削除", "Tip": "チップ"
  },
  zh: {
    "Loan Payment": "贷款还款", "Credit Card Payoff": "信用卡还款", "Debt Payoff": "债务还款", "Compound Interest": "复利", "Sales Tax": "销售税", "Profit Margin": "利润率", "Invoice Number": "发票编号", "JSON Formatter Inspector": "JSON 格式化检查器", "Base64 Encoder Decoder": "Base64 编码/解码", "Word Counter": "字数统计", "Text File Word Counter": "文本文件字数统计", "Case Converter": "大小写转换", "Percentage": "百分比", "Length": "长度", "Temperature": "温度", "URL Encoder Decoder": "URL 编码/解码", "Regex": "正则表达式", "Remove Duplicate Lines": "删除重复行", "Whitespace": "空白", "Text Diff": "文本差异", "Meta Title": "Meta 标题", "Meta Description": "Meta 描述", "QR Code": "二维码", "Password Strength": "密码强度", "Password": "密码", "Unix Timestamp": "Unix 时间戳", "Date Difference": "日期差", "Age": "年龄", "Weight": "重量", "JSON File": "JSON 文件", "CSV Column": "CSV 列", "Data Size": "数据大小", "Aspect Ratio": "宽高比", "Image Format": "图片格式", "Image Asset Pack": "图片素材包", "Pixel Art": "像素艺术", "Brand Color System": "品牌色彩系统", "Square Image": "方形图片", "Break Even": "盈亏平衡", "Reading Time": "阅读时间", "Grade Percentage": "成绩百分比", "Study Timer": "学习计时", "IP to Integer": "IP 转整数", "Mortgage Affordability": "房贷承受力", "Rent vs Buy": "租房 vs 买房", "Hourly to Salary": "时薪转年薪", "Take Home Pay": "税后收入", "Savings Goal": "储蓄目标", "HTML Entity": "HTML 实体", "Cron Expression": "Cron 表达式", "Line Sorter": "行排序", "Find and Replace": "查找和替换", "List Randomizer": "列表随机排序", "Countdown": "倒计时", "Retirement": "退休", "Discount": "折扣", "Sentence": "句子", "Calculator": "计算器", "Converter": "转换器", "Generator": "生成器", "Checker": "检查器", "Planner": "规划器", "Formatter": "格式化器", "Tester": "测试器", "Preview": "预览", "Cleaner": "清理器", "Extractor": "提取器", "Resizer": "调整大小", "Compressor": "压缩器", "Maker": "制作器", "Counter": "计数器", "Remover": "删除器", "Tip": "小费"
  }
};
const fallbackRomanceTitleTerms = {
  "Loan Payment": "Loan Payment", "Credit Card Payoff": "Credit Card Payoff", "Debt Payoff": "Debt Payoff", "Compound Interest": "Compound Interest", "Sales Tax": "Sales Tax", "Profit Margin": "Profit Margin", "Invoice Number": "Invoice Number", "JSON Formatter Inspector": "JSON Formatter Inspector", "Word Counter": "Word Counter", "Case Converter": "Case Converter", "URL Encoder Decoder": "URL Encoder Decoder", "Remove Duplicate Lines": "Remove Duplicate Lines", "Text Diff": "Text Diff", "Meta Title": "Meta Title", "Meta Description": "Meta Description", "QR Code": "QR Code", "Password Strength": "Password Strength", "Unix Timestamp": "Unix Timestamp", "Date Difference": "Date Difference", "JSON File": "JSON File", "CSV Column": "CSV Column", "Data Size": "Data Size", "Aspect Ratio": "Aspect Ratio", "Image Format": "Image Format", "Image Asset Pack": "Image Asset Pack", "Pixel Art": "Pixel Art", "Brand Color System": "Brand Color System", "Square Image": "Square Image", "Break Even": "Break Even", "Reading Time": "Reading Time", "Grade Percentage": "Grade Percentage", "Study Timer": "Study Timer", "IP to Integer": "IP to Integer", "Mortgage Affordability": "Mortgage Affordability", "Rent vs Buy": "Rent vs Buy", "Hourly to Salary": "Hourly to Salary", "Take Home Pay": "Take Home Pay", "Savings Goal": "Savings Goal", "HTML Entity": "HTML Entity", "Cron Expression": "Cron Expression", "Line Sorter": "Line Sorter", "Find and Replace": "Find and Replace", "List Randomizer": "List Randomizer", "Countdown": "Countdown", "Retirement": "Retirement", "Discount": "Discount", "Sentence": "Sentence", "Calculator": "Calculator", "Converter": "Converter", "Generator": "Generator", "Checker": "Checker", "Planner": "Planner", "Formatter": "Formatter", "Tester": "Tester", "Preview": "Preview", "Cleaner": "Cleaner", "Extractor": "Extractor", "Resizer": "Resizer", "Compressor": "Compressor", "Maker": "Maker", "Counter": "Counter", "Remover": "Remover", "Tip": "Tip"
};
["es", "fr", "de", "pt", "it", "nl", "ru", "ar", "hi", "id", "vi", "th"].forEach((code) => {
  titleTerms[code] = { ...fallbackRomanceTitleTerms };
});
Object.assign(titleTerms.es, { "Loan Payment": "Pago de préstamo", "Credit Card Payoff": "Pago de tarjeta de crédito", "Debt Payoff": "Pago de deudas", "Compound Interest": "Interés compuesto", "Sales Tax": "Impuesto sobre ventas", "Profit Margin": "Margen de beneficio", "Invoice Number": "Número de factura", "Word Counter": "Contador de palabras", "Case Converter": "Convertidor de mayúsculas", "Password Strength": "Fortaleza de contraseña", "Date Difference": "Diferencia de fechas", "Data Size": "Tamaño de datos", "Aspect Ratio": "Relación de aspecto", "Image Format": "Formato de imagen", "Image Asset Pack": "Paquete de recursos de imagen", "Pixel Art": "Pixel art", "Brand Color System": "Sistema de color de marca", "Break Even": "Punto de equilibrio", "Reading Time": "Tiempo de lectura", "Study Timer": "Temporizador de estudio", "Mortgage Affordability": "Capacidad hipotecaria", "Rent vs Buy": "Alquilar vs comprar", "Hourly to Salary": "Hora a salario", "Take Home Pay": "Salario neto", "Savings Goal": "Meta de ahorro", "Cron Expression": "Expresión Cron", "Line Sorter": "Ordenador de líneas", "Find and Replace": "Buscar y reemplazar", "List Randomizer": "Aleatorizador de listas", "Calculator": "Calculadora", "Converter": "Convertidor", "Generator": "Generador", "Checker": "Verificador", "Planner": "Planificador", "Formatter": "Formateador", "Tester": "Probador", "Preview": "Vista previa", "Cleaner": "Limpiador", "Extractor": "Extractor", "Resizer": "Redimensionador", "Compressor": "Compresor", "Maker": "Creador", "Counter": "Contador", "Remover": "Eliminador", "Countdown": "Cuenta regresiva", "Discount": "Descuento", "Retirement": "Jubilación", "Sentence": "Oraciones", "Tip": "Propina" });
Object.assign(titleTerms.fr, { "Loan Payment": "Paiement de prêt", "Credit Card Payoff": "Remboursement de carte", "Debt Payoff": "Remboursement de dette", "Compound Interest": "Intérêt composé", "Sales Tax": "Taxe de vente", "Profit Margin": "Marge bénéficiaire", "Invoice Number": "Numéro de facture", "Word Counter": "Compteur de mots", "Case Converter": "Convertisseur de casse", "Password Strength": "Force du mot de passe", "Date Difference": "Différence de dates", "Data Size": "Taille des données", "Aspect Ratio": "Format d'image", "Image Format": "Format d'image", "Image Asset Pack": "Pack d'images", "Pixel Art": "Pixel art", "Brand Color System": "Système couleur de marque", "Break Even": "Seuil de rentabilité", "Reading Time": "Temps de lecture", "Study Timer": "Minuteur d'étude", "Mortgage Affordability": "Capacité hypothécaire", "Rent vs Buy": "Louer vs acheter", "Hourly to Salary": "Horaire en salaire", "Take Home Pay": "Salaire net", "Savings Goal": "Objectif d'épargne", "Cron Expression": "Expression Cron", "Line Sorter": "Trieur de lignes", "Find and Replace": "Rechercher et remplacer", "List Randomizer": "Mélangeur de liste", "Calculator": "Calculateur", "Converter": "Convertisseur", "Generator": "Générateur", "Checker": "Vérificateur", "Planner": "Planificateur", "Formatter": "Formateur", "Tester": "Testeur", "Preview": "Aperçu", "Cleaner": "Nettoyeur", "Extractor": "Extracteur", "Resizer": "Redimensionneur", "Compressor": "Compresseur", "Maker": "Créateur", "Counter": "Compteur", "Remover": "Suppresseur", "Countdown": "Compte à rebours", "Discount": "Remise", "Retirement": "Retraite", "Sentence": "Phrases", "Tip": "Pourboire" });
Object.assign(titleTerms.de, { "Loan Payment": "Kreditzahlung", "Credit Card Payoff": "Kreditkarten-Tilgung", "Debt Payoff": "Schuldentilgung", "Compound Interest": "Zinseszins", "Sales Tax": "Umsatzsteuer", "Profit Margin": "Gewinnmarge", "Invoice Number": "Rechnungsnummer", "Word Counter": "Wortzähler", "Case Converter": "Groß-/Kleinschreibung", "Password Strength": "Passwortstärke", "Date Difference": "Datumsdifferenz", "Data Size": "Datengröße", "Aspect Ratio": "Seitenverhältnis", "Image Format": "Bildformat", "Image Asset Pack": "Bild-Asset-Paket", "Pixel Art": "Pixelkunst", "Brand Color System": "Markenfarbsystem", "Break Even": "Break-even", "Reading Time": "Lesezeit", "Study Timer": "Lern-Timer", "Mortgage Affordability": "Hypotheken-Leistbarkeit", "Rent vs Buy": "Mieten vs Kaufen", "Hourly to Salary": "Stundenlohn zu Gehalt", "Take Home Pay": "Nettoeinkommen", "Savings Goal": "Sparziel", "Cron Expression": "Cron-Ausdruck", "Line Sorter": "Zeilensortierer", "Find and Replace": "Suchen und Ersetzen", "List Randomizer": "Listen-Zufallsgenerator", "Calculator": "Rechner", "Converter": "Konverter", "Generator": "Generator", "Checker": "Prüfer", "Planner": "Planer", "Formatter": "Formatierer", "Tester": "Tester", "Preview": "Vorschau", "Cleaner": "Bereiniger", "Extractor": "Extraktor", "Resizer": "Größenänderer", "Compressor": "Kompressor", "Maker": "Ersteller", "Counter": "Zähler", "Remover": "Entferner", "Countdown": "Countdown", "Discount": "Rabatt", "Retirement": "Rente", "Sentence": "Satz", "Tip": "Trinkgeld" });
Object.assign(titleTerms.pt, { "Loan Payment": "Pagamento de empréstimo", "Credit Card Payoff": "Pagamento de cartão", "Debt Payoff": "Pagamento de dívidas", "Compound Interest": "Juros compostos", "Sales Tax": "Imposto sobre vendas", "Profit Margin": "Margem de lucro", "Invoice Number": "Número da fatura", "Word Counter": "Contador de palavras", "Case Converter": "Conversor de maiúsculas", "Password Strength": "Força da senha", "Date Difference": "Diferença de datas", "Data Size": "Tamanho de dados", "Aspect Ratio": "Proporção", "Image Format": "Formato de imagem", "Image Asset Pack": "Pacote de imagens", "Pixel Art": "Pixel art", "Brand Color System": "Sistema de cores da marca", "Break Even": "Ponto de equilíbrio", "Reading Time": "Tempo de leitura", "Study Timer": "Temporizador de estudo", "Mortgage Affordability": "Capacidade hipotecária", "Rent vs Buy": "Alugar vs comprar", "Hourly to Salary": "Hora para salário", "Take Home Pay": "Salário líquido", "Savings Goal": "Meta de poupança", "Cron Expression": "Expressão Cron", "Line Sorter": "Ordenador de linhas", "Find and Replace": "Localizar e substituir", "List Randomizer": "Aleatorizador de lista", "Calculator": "Calculadora", "Converter": "Conversor", "Generator": "Gerador", "Checker": "Verificador", "Planner": "Planejador", "Formatter": "Formatador", "Tester": "Testador", "Preview": "Prévia", "Cleaner": "Limpador", "Extractor": "Extrator", "Resizer": "Redimensionador", "Compressor": "Compressor", "Maker": "Criador", "Counter": "Contador", "Remover": "Removedor", "Countdown": "Contagem regressiva", "Discount": "Desconto", "Retirement": "Aposentadoria", "Sentence": "Frases", "Tip": "Gorjeta" });
Object.assign(titleTerms.it, { "Loan Payment": "Pagamento prestito", "Credit Card Payoff": "Estinzione carta", "Debt Payoff": "Estinzione debiti", "Compound Interest": "Interesse composto", "Sales Tax": "Imposta sulle vendite", "Profit Margin": "Margine di profitto", "Invoice Number": "Numero fattura", "Word Counter": "Contatore parole", "Case Converter": "Convertitore maiuscole", "Password Strength": "Forza password", "Date Difference": "Differenza date", "Data Size": "Dimensione dati", "Aspect Ratio": "Proporzioni", "Image Format": "Formato immagine", "Image Asset Pack": "Pacchetto immagini", "Pixel Art": "Pixel art", "Brand Color System": "Sistema colori brand", "Break Even": "Punto di pareggio", "Reading Time": "Tempo di lettura", "Study Timer": "Timer studio", "Mortgage Affordability": "Accessibilità mutuo", "Rent vs Buy": "Affitto vs acquisto", "Hourly to Salary": "Ora a stipendio", "Take Home Pay": "Stipendio netto", "Savings Goal": "Obiettivo risparmio", "Cron Expression": "Espressione Cron", "Line Sorter": "Ordinatore righe", "Find and Replace": "Trova e sostituisci", "List Randomizer": "Randomizzatore lista", "Calculator": "Calcolatore", "Converter": "Convertitore", "Generator": "Generatore", "Checker": "Verificatore", "Planner": "Pianificatore", "Formatter": "Formatore", "Tester": "Tester", "Preview": "Anteprima", "Cleaner": "Pulitore", "Extractor": "Estrattore", "Resizer": "Ridimensionatore", "Compressor": "Compressore", "Maker": "Creatore", "Counter": "Contatore", "Remover": "Rimozione", "Countdown": "Conto alla rovescia", "Discount": "Sconto", "Retirement": "Pensione", "Sentence": "Frasi", "Tip": "Mancia" });
Object.assign(titleTerms.nl, { "Loan Payment": "Leningbetaling", "Credit Card Payoff": "Creditcard aflossen", "Debt Payoff": "Schuldaflossing", "Compound Interest": "Samengestelde rente", "Sales Tax": "Omzetbelasting", "Profit Margin": "Winstmarge", "Invoice Number": "Factuurnummer", "Word Counter": "Woordenteller", "Case Converter": "Hoofdletterconverter", "Password Strength": "Wachtwoordsterkte", "Date Difference": "Datumverschil", "Data Size": "Datagrootte", "Aspect Ratio": "Beeldverhouding", "Image Format": "Afbeeldingsformaat", "Image Asset Pack": "Afbeeldingspakket", "Pixel Art": "Pixelkunst", "Brand Color System": "Merkkleursysteem", "Break Even": "Break-even", "Reading Time": "Leestijd", "Study Timer": "Studietimer", "Mortgage Affordability": "Hypotheek haalbaarheid", "Rent vs Buy": "Huren vs kopen", "Hourly to Salary": "Uurloon naar salaris", "Take Home Pay": "Nettoloon", "Savings Goal": "Spaardoel", "Cron Expression": "Cron-expressie", "Line Sorter": "Regelsorteerder", "Find and Replace": "Zoeken en vervangen", "List Randomizer": "Lijst-randomizer", "Calculator": "Calculator", "Converter": "Converter", "Generator": "Generator", "Checker": "Checker", "Planner": "Planner", "Formatter": "Formatter", "Tester": "Tester", "Preview": "Voorbeeld", "Cleaner": "Opschoner", "Extractor": "Extractor", "Resizer": "Formaatwijziger", "Compressor": "Compressor", "Maker": "Maker", "Counter": "Teller", "Remover": "Verwijderaar", "Countdown": "Aftellen", "Discount": "Korting", "Retirement": "Pensioen", "Sentence": "Zinnen", "Tip": "Fooi" });
Object.assign(titleTerms.ru, { "Loan Payment": "Платеж по кредиту", "Credit Card Payoff": "Погашение карты", "Debt Payoff": "Погашение долга", "Compound Interest": "Сложный процент", "Sales Tax": "Налог с продаж", "Profit Margin": "Маржа прибыли", "Invoice Number": "Номер счета", "Word Counter": "Счетчик слов", "Case Converter": "Конвертер регистра", "Password Strength": "Надежность пароля", "Date Difference": "Разница дат", "Data Size": "Размер данных", "Aspect Ratio": "Соотношение сторон", "Image Format": "Формат изображения", "Image Asset Pack": "Пакет изображений", "Pixel Art": "Пиксель-арт", "Brand Color System": "Система цветов бренда", "Break Even": "Точка безубыточности", "Reading Time": "Время чтения", "Study Timer": "Учебный таймер", "Mortgage Affordability": "Доступность ипотеки", "Rent vs Buy": "Аренда vs покупка", "Hourly to Salary": "Почасовая в зарплату", "Take Home Pay": "Чистая зарплата", "Savings Goal": "Цель накоплений", "Cron Expression": "Cron-выражение", "Line Sorter": "Сортировка строк", "Find and Replace": "Найти и заменить", "List Randomizer": "Перемешивание списка", "Calculator": "Калькулятор", "Converter": "Конвертер", "Generator": "Генератор", "Checker": "Проверка", "Planner": "Планировщик", "Formatter": "Форматтер", "Tester": "Тестер", "Preview": "Предпросмотр", "Cleaner": "Очистка", "Extractor": "Извлечение", "Resizer": "Изменение размера", "Compressor": "Сжатие", "Maker": "Создатель", "Counter": "Счетчик", "Remover": "Удаление", "Countdown": "Обратный отсчет", "Discount": "Скидка", "Retirement": "Пенсия", "Sentence": "Предложения", "Tip": "Чаевые" });
Object.assign(titleTerms.ar, { "Loan Payment": "سداد القرض", "Credit Card Payoff": "سداد بطاقة الائتمان", "Debt Payoff": "سداد الديون", "Compound Interest": "الفائدة المركبة", "Sales Tax": "ضريبة المبيعات", "Profit Margin": "هامش الربح", "Invoice Number": "رقم الفاتورة", "Word Counter": "عداد الكلمات", "Case Converter": "محول حالة الأحرف", "Password Strength": "قوة كلمة المرور", "Date Difference": "فرق التاريخ", "Data Size": "حجم البيانات", "Aspect Ratio": "نسبة العرض", "Image Format": "تنسيق الصورة", "Image Asset Pack": "حزمة أصول الصور", "Pixel Art": "فن البكسل", "Brand Color System": "نظام ألوان العلامة", "Break Even": "نقطة التعادل", "Reading Time": "وقت القراءة", "Study Timer": "مؤقت الدراسة", "Mortgage Affordability": "قدرة الرهن", "Rent vs Buy": "الإيجار مقابل الشراء", "Hourly to Salary": "من الساعة إلى الراتب", "Take Home Pay": "صافي الراتب", "Savings Goal": "هدف الادخار", "Cron Expression": "تعبير Cron", "Line Sorter": "مرتب الأسطر", "Find and Replace": "بحث واستبدال", "List Randomizer": "عشوائية القائمة", "Calculator": "حاسبة", "Converter": "محول", "Generator": "مولد", "Checker": "فاحص", "Planner": "مخطط", "Formatter": "منسق", "Tester": "مختبر", "Preview": "معاينة", "Cleaner": "منظف", "Extractor": "مستخرج", "Resizer": "مغير الحجم", "Compressor": "ضاغط", "Maker": "منشئ", "Counter": "عداد", "Remover": "مزيل", "Countdown": "عد تنازلي", "Discount": "خصم", "Retirement": "تقاعد", "Sentence": "جمل", "Tip": "إكرامية" });
Object.assign(titleTerms.hi, { "Loan Payment": "ऋण भुगतान", "Credit Card Payoff": "क्रेडिट कार्ड भुगतान", "Debt Payoff": "ऋण चुकौती", "Compound Interest": "चक्रवृद्धि ब्याज", "Sales Tax": "बिक्री कर", "Profit Margin": "लाभ मार्जिन", "Invoice Number": "इनवॉइस नंबर", "Word Counter": "शब्द काउंटर", "Case Converter": "केस कन्वर्टर", "Password Strength": "पासवर्ड मजबूती", "Date Difference": "तारीख अंतर", "Data Size": "डेटा आकार", "Aspect Ratio": "आस्पेक्ट रेशियो", "Image Format": "चित्र फ़ॉर्मेट", "Image Asset Pack": "चित्र एसेट पैक", "Pixel Art": "पिक्सेल आर्ट", "Brand Color System": "ब्रांड रंग सिस्टम", "Break Even": "ब्रेक ईवन", "Reading Time": "पढ़ने का समय", "Study Timer": "अध्ययन टाइमर", "Mortgage Affordability": "मॉर्गेज क्षमता", "Rent vs Buy": "किराया vs खरीद", "Hourly to Salary": "घंटे से वेतन", "Take Home Pay": "घर ले जाने वाला वेतन", "Savings Goal": "बचत लक्ष्य", "Cron Expression": "Cron अभिव्यक्ति", "Line Sorter": "लाइन सॉर्टर", "Find and Replace": "खोजें और बदलें", "List Randomizer": "सूची रैंडमाइज़र", "Calculator": "कैलकुलेटर", "Converter": "कन्वर्टर", "Generator": "जनरेटर", "Checker": "चेकर", "Planner": "प्लानर", "Formatter": "फ़ॉर्मैटर", "Tester": "टेस्टर", "Preview": "पूर्वावलोकन", "Cleaner": "क्लीनर", "Extractor": "एक्सट्रैक्टर", "Resizer": "रीसाइज़र", "Compressor": "कंप्रेसर", "Maker": "मेकर", "Counter": "काउंटर", "Remover": "रिमूवर", "Countdown": "काउंटडाउन", "Discount": "छूट", "Retirement": "सेवानिवृत्ति", "Sentence": "वाक्य", "Tip": "टिप" });
Object.assign(titleTerms.id, { "Loan Payment": "Pembayaran pinjaman", "Credit Card Payoff": "Pelunasan kartu kredit", "Debt Payoff": "Pelunasan utang", "Compound Interest": "Bunga majemuk", "Sales Tax": "Pajak penjualan", "Profit Margin": "Margin laba", "Invoice Number": "Nomor invoice", "Word Counter": "Penghitung kata", "Case Converter": "Konverter huruf", "Password Strength": "Kekuatan kata sandi", "Date Difference": "Selisih tanggal", "Data Size": "Ukuran data", "Aspect Ratio": "Rasio aspek", "Image Format": "Format gambar", "Image Asset Pack": "Paket aset gambar", "Pixel Art": "Seni piksel", "Brand Color System": "Sistem warna merek", "Break Even": "Titik impas", "Reading Time": "Waktu baca", "Study Timer": "Timer belajar", "Mortgage Affordability": "Keterjangkauan hipotek", "Rent vs Buy": "Sewa vs beli", "Hourly to Salary": "Jam ke gaji", "Take Home Pay": "Gaji bersih", "Savings Goal": "Target tabungan", "Cron Expression": "Ekspresi Cron", "Line Sorter": "Pengurut baris", "Find and Replace": "Cari dan ganti", "List Randomizer": "Pengacak daftar", "Calculator": "Kalkulator", "Converter": "Konverter", "Generator": "Generator", "Checker": "Pemeriksa", "Planner": "Perencana", "Formatter": "Pemformat", "Tester": "Penguji", "Preview": "Pratinjau", "Cleaner": "Pembersih", "Extractor": "Ekstraktor", "Resizer": "Pengubah ukuran", "Compressor": "Kompresor", "Maker": "Pembuat", "Counter": "Penghitung", "Remover": "Penghapus", "Countdown": "Hitung mundur", "Discount": "Diskon", "Retirement": "Pensiun", "Sentence": "Kalimat", "Tip": "Tip" });
Object.assign(titleTerms.vi, { "Loan Payment": "Thanh toán khoản vay", "Credit Card Payoff": "Trả nợ thẻ tín dụng", "Debt Payoff": "Trả nợ", "Compound Interest": "Lãi kép", "Sales Tax": "Thuế bán hàng", "Profit Margin": "Biên lợi nhuận", "Invoice Number": "Số hóa đơn", "Word Counter": "Đếm từ", "Case Converter": "Đổi chữ hoa thường", "Password Strength": "Độ mạnh mật khẩu", "Date Difference": "Chênh lệch ngày", "Data Size": "Kích thước dữ liệu", "Aspect Ratio": "Tỷ lệ khung hình", "Image Format": "Định dạng ảnh", "Image Asset Pack": "Gói tài nguyên ảnh", "Pixel Art": "Pixel art", "Brand Color System": "Hệ màu thương hiệu", "Break Even": "Điểm hòa vốn", "Reading Time": "Thời gian đọc", "Study Timer": "Hẹn giờ học", "Mortgage Affordability": "Khả năng mua nhà", "Rent vs Buy": "Thuê vs mua", "Hourly to Salary": "Giờ sang lương", "Take Home Pay": "Lương thực nhận", "Savings Goal": "Mục tiêu tiết kiệm", "Cron Expression": "Biểu thức Cron", "Line Sorter": "Sắp xếp dòng", "Find and Replace": "Tìm và thay thế", "List Randomizer": "Trộn danh sách", "Calculator": "Máy tính", "Converter": "Bộ chuyển đổi", "Generator": "Bộ tạo", "Checker": "Bộ kiểm tra", "Planner": "Bộ lập kế hoạch", "Formatter": "Bộ định dạng", "Tester": "Bộ thử", "Preview": "Xem trước", "Cleaner": "Bộ làm sạch", "Extractor": "Bộ trích xuất", "Resizer": "Đổi kích thước", "Compressor": "Nén", "Maker": "Bộ tạo", "Counter": "Bộ đếm", "Remover": "Bộ xóa", "Countdown": "Đếm ngược", "Discount": "Giảm giá", "Retirement": "Nghỉ hưu", "Sentence": "Câu", "Tip": "Tiền tip" });
Object.assign(titleTerms.th, { "Loan Payment": "การชำระเงินกู้", "Credit Card Payoff": "ชำระบัตรเครดิต", "Debt Payoff": "ชำระหนี้", "Compound Interest": "ดอกเบี้ยทบต้น", "Sales Tax": "ภาษีขาย", "Profit Margin": "อัตรากำไร", "Invoice Number": "เลขใบแจ้งหนี้", "Word Counter": "ตัวนับคำ", "Case Converter": "ตัวแปลงตัวพิมพ์", "Password Strength": "ความแข็งแรงรหัสผ่าน", "Date Difference": "ส่วนต่างวันที่", "Data Size": "ขนาดข้อมูล", "Aspect Ratio": "อัตราส่วนภาพ", "Image Format": "รูปแบบภาพ", "Image Asset Pack": "ชุดไฟล์ภาพ", "Pixel Art": "พิกเซลอาร์ต", "Brand Color System": "ระบบสีแบรนด์", "Break Even": "จุดคุ้มทุน", "Reading Time": "เวลาอ่าน", "Study Timer": "ตัวจับเวลาเรียน", "Mortgage Affordability": "ความสามารถจำนอง", "Rent vs Buy": "เช่า vs ซื้อ", "Hourly to Salary": "รายชั่วโมงเป็นเงินเดือน", "Take Home Pay": "รายได้สุทธิ", "Savings Goal": "เป้าหมายออม", "Cron Expression": "นิพจน์ Cron", "Line Sorter": "เรียงบรรทัด", "Find and Replace": "ค้นหาและแทนที่", "List Randomizer": "สุ่มรายการ", "Calculator": "เครื่องคิดเลข", "Converter": "ตัวแปลง", "Generator": "ตัวสร้าง", "Checker": "ตัวตรวจสอบ", "Planner": "ตัววางแผน", "Formatter": "ตัวจัดรูปแบบ", "Tester": "ตัวทดสอบ", "Preview": "ดูตัวอย่าง", "Cleaner": "ตัวล้าง", "Extractor": "ตัวดึงข้อมูล", "Resizer": "ปรับขนาด", "Compressor": "บีบอัด", "Maker": "ตัวสร้าง", "Counter": "ตัวนับ", "Remover": "ตัวลบ", "Countdown": "นับถอยหลัง", "Discount": "ส่วนลด", "Retirement": "เกษียณ", "Sentence": "ประโยค", "Tip": "ทิป" });

Object.entries({
  ko: { "Ladder Draw": "사다리 타기", "Coin Flip": "동전 던지기", "Dice Roller": "주사위 굴리기", "Roulette Picker": "룰렛 선택기" },
  ja: { "Ladder Draw": "あみだくじ", "Coin Flip": "コイン投げ", "Dice Roller": "サイコロ", "Roulette Picker": "ルーレット選択" },
  zh: { "Ladder Draw": "梯子抽签", "Coin Flip": "抛硬币", "Dice Roller": "掷骰子", "Roulette Picker": "轮盘选择器" },
  es: { "Ladder Draw": "Sorteo de escalera", "Coin Flip": "Lanzar moneda", "Dice Roller": "Lanzador de dados", "Roulette Picker": "Ruleta de selección" },
  fr: { "Ladder Draw": "Tirage en échelle", "Coin Flip": "Pile ou face", "Dice Roller": "Lanceur de dés", "Roulette Picker": "Roulette de choix" },
  de: { "Ladder Draw": "Leiter-Auslosung", "Coin Flip": "Münzwurf", "Dice Roller": "Würfelroller", "Roulette Picker": "Roulette-Auswahl" },
  pt: { "Ladder Draw": "Sorteio de escada", "Coin Flip": "Cara ou coroa", "Dice Roller": "Rolador de dados", "Roulette Picker": "Roleta de escolha" },
  it: { "Ladder Draw": "Sorteggio a scala", "Coin Flip": "Lancio moneta", "Dice Roller": "Lancia dadi", "Roulette Picker": "Roulette scelta" },
  nl: { "Ladder Draw": "Ladderloting", "Coin Flip": "Munt opgooien", "Dice Roller": "Dobbelsteenroller", "Roulette Picker": "Roulettekiezer" },
  ru: { "Ladder Draw": "Жеребьевка лестницей", "Coin Flip": "Подброс монеты", "Dice Roller": "Бросок кубиков", "Roulette Picker": "Рулетка выбора" },
  ar: { "Ladder Draw": "سحب السلم", "Coin Flip": "رمي العملة", "Dice Roller": "رمي النرد", "Roulette Picker": "اختيار بالروليت" },
  hi: { "Ladder Draw": "लैडर ड्रॉ", "Coin Flip": "सिक्का उछाल", "Dice Roller": "पासा रोलर", "Roulette Picker": "रूलेट चयन" },
  id: { "Ladder Draw": "Undian tangga", "Coin Flip": "Lempar koin", "Dice Roller": "Pelempar dadu", "Roulette Picker": "Pemilih roulette" },
  vi: { "Ladder Draw": "Bốc thăm bậc thang", "Coin Flip": "Tung xu", "Dice Roller": "Gieo xúc xắc", "Roulette Picker": "Vòng quay chọn" },
  th: { "Ladder Draw": "จับฉลากบันได", "Coin Flip": "โยนเหรียญ", "Dice Roller": "ทอยลูกเต๋า", "Roulette Picker": "วงล้อสุ่มเลือก" }
}).forEach(([code, terms]) => {
  Object.assign(titleTerms[code], terms);
});

const highValueCategories = new Set(["Finance", "Business", "SEO", "Image", "Data", "Decision"]);
const categoryOrder = ["Image", "Decision", "Data", "Developer", "Text", "Finance", "Business", "SEO", "Security", "Time", "Converters", "Writing", "Education", "Network", "Health", "Generators"];
let currentLanguage = languageCodes.has(storageGet(LANGUAGE_STORAGE_KEY)) ? storageGet(LANGUAGE_STORAGE_KEY) : "en";
if (!languageCodes.has(storageGet(LANGUAGE_STORAGE_KEY)) && location.pathname.startsWith("/ko/")) {
  currentLanguage = "ko";
}
const provenDemandTools = new Set([
  "mortgage-affordability-calculator",
  "rent-vs-buy-calculator",
  "take-home-pay-calculator",
  "loan-payment-calculator",
  "credit-card-payoff-calculator",
  "debt-payoff-planner",
  "compound-interest-calculator",
  "retirement-calculator",
  "tip-calculator",
  "password-generator",
  "word-character-counter",
  "json-formatter",
  "regex-tester",
  "qr-code-generator",
  "image-resize-calculator",
  "image-compressor",
  "image-format-converter",
  "csv-cleaner",
  "csv-to-json-converter",
  "json-to-csv-converter"
]);
const businessIntentTools = new Set([
  "profit-margin-calculator",
  "break-even-calculator",
  "roi-calculator",
  "take-home-pay-calculator",
  "invoice-number-generator",
  "cpm-rpm-calculator",
  "sales-tax-calculator",
  "discount-calculator",
  "savings-goal-calculator",
  "retirement-calculator",
  "credit-card-payoff-calculator",
  "debt-payoff-planner",
  "rent-vs-buy-calculator"
]);
const advancedOutputWords = ["download", "csv", "scenario", "breakdown", "preview", "amortization", "timeline", "batch", "table", "analysis"];

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toolIntent(tool) {
  const text = `${tool.id} ${tool.title}`.toLowerCase();
  if (tool.custom?.startsWith("image-") || text.includes("converter") || text.includes("convert")) return "convert";
  if (text.includes("calculator") || text.includes("calculate")) return "calculate";
  if (text.includes("generator") || text.includes("generate")) return "generate";
  if (text.includes("checker") || text.includes("validator") || text.includes("tester")) return "check";
  if (text.includes("formatter") || text.includes("cleaner") || text.includes("sorter")) return "format";
  return "utility";
}

function toolTier(tool) {
  if (tool.custom?.startsWith("image-") || ["Finance", "Business", "SEO"].includes(tool.category)) return "high";
  if (["Developer", "Data", "Security", "Writing", "Decision"].includes(tool.category)) return "medium";
  return "base";
}

function toolOpportunity(tool) {
  const text = `${tool.id} ${tool.title} ${tool.description}`.toLowerCase();
  const hasAdvancedOutput = advancedOutputWords.some((word) => text.includes(word));
  const demandScore = provenDemandTools.has(tool.id)
    ? 36
    : businessIntentTools.has(tool.id)
      ? 29
      : ["Image", "Developer", "Data", "Finance", "Business"].includes(tool.category)
        ? 23
        : 15;
  const rpmScore = toolTier(tool) === "high" ? 24 : toolTier(tool) === "medium" ? 17 : 10;
  const moatScore = tool.custom ? 22 : hasAdvancedOutput ? 18 : tool.fields?.length >= 4 ? 14 : 7;
  const qualityScore = hasAdvancedOutput ? 13 : tool.custom ? 12 : tool.fields?.length >= 3 ? 9 : 5;
  const score = Math.min(100, demandScore + rpmScore + moatScore + qualityScore);
  return {
    score,
    demand: demandScore >= 36 ? "proven" : demandScore >= 29 ? "commercial" : demandScore >= 23 ? "category" : "long-tail",
    moat: moatScore >= 20 ? "file-workflow" : moatScore >= 18 ? "advanced-output" : moatScore >= 14 ? "multi-input" : "basic",
    rpm: rpmScore >= 24 ? "high" : rpmScore >= 17 ? "medium" : "base",
    quality: qualityScore >= 13 ? "advanced" : qualityScore >= 9 ? "solid" : "basic"
  };
}

function toolPrivacyLevel(tool) {
  const sensitiveIds = new Set([
    "jwt-decoder",
    "password-generator",
    "password-strength-checker",
    "json-formatter",
    "regex-tester",
    "markdown-preview",
    "invoice-number-generator"
  ]);
  if (tool.custom?.startsWith("file-") || tool.custom?.startsWith("image-")) return "local-file";
  if (tool.custom === "qr-code" || sensitiveIds.has(tool.id) || ["Data", "Developer", "Security"].includes(tool.category)) return "private-input";
  return "browser";
}

function renderBrandColorSystem(values) {
  const base = normalizeHex(values.hex);
  if (!base) return error("Enter a valid 3 or 6 digit hex color.");
  const prefix = slugify(values.name || "brand").replace(/-/g, "") || "brand";
  const mode = values.mode || "balanced";
  const palette = brandPalette(base, mode);
  const tokens = Object.fromEntries(palette.map((item) => [`${prefix}-${item.step}`, item.hex]));
  const css = brandPaletteCss(prefix, palette);
  const tailwind = brandPaletteTailwind(prefix, palette);
  const json = JSON.stringify({ prefix, mode, base, colors: tokens }, null, 2);
  const contrastRows = [
    ["Base on white", base, "#ffffff"],
    ["Base on black", base, "#000000"],
    ["Dark text on 50", "#111827", palette[0].hex],
    ["White text on 700", "#ffffff", palette[7].hex],
    ["White text on 900", "#ffffff", palette[9].hex]
  ].map(([label, foreground, background]) => {
    const ratio = contrastRatio(foreground, background);
    return { label, foreground, background, ratio, status: ratio >= 4.5 ? "AA pass" : ratio >= 3 ? "Large text" : "Low" };
  });

  return `
    <div class="brand-system-result">
      <div class="palette-strip">
        ${palette.map((item) => `
          <div class="brand-swatch" style="background:${item.hex}; color:${contrastRatio("#111827", item.hex) >= 4.5 ? "#111827" : "#ffffff"}">
            <strong>${item.step}</strong>
            <span>${item.hex}</span>
          </div>
        `).join("")}
      </div>
      <div class="result-grid">
        <div><span>Base</span><strong>${base}</strong></div>
        <div><span>Mode</span><strong>${mode}</strong></div>
        <div><span>Tokens</span><strong>${palette.length}</strong></div>
        <div><span>Prefix</span><strong>${prefix}</strong></div>
      </div>
      <table class="data-table">
        <thead><tr><th>Check</th><th>Foreground</th><th>Background</th><th>Ratio</th><th>Status</th></tr></thead>
        <tbody>
          ${contrastRows.map((row) => `<tr><td>${row.label}</td><td>${row.foreground}</td><td>${row.background}</td><td>${row.ratio.toFixed(2)}:1</td><td>${row.status}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="metadata-snippet">
        <span>CSS variables</span>
        <pre>${escapeHtml(css)}</pre>
      </div>
      <div class="download-actions">
        <a class="download-button" href="${dataHref("text/css", css)}" download="${prefix}-tokens.css">Download CSS variables</a>
        <a class="download-button secondary" href="${dataHref("application/json", tailwind)}" download="${prefix}-tailwind-colors.json">Download Tailwind tokens</a>
        <a class="download-button secondary" href="${dataHref("application/json", json)}" download="${prefix}-color-system.json">Download JSON</a>
      </div>
    </div>
  `;
}

function normalizeHex(value) {
  let hex = String(value || "").trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : "";
}

function brandPalette(base, mode) {
  const hsl = hexToHsl(base);
  const chroma = mode === "muted" ? 0.55 : mode === "vivid" ? 1.2 : 0.85;
  const lightness = [96, 90, 82, 70, 58, 48, 40, 32, 24, 16];
  const saturation = Math.max(12, Math.min(96, hsl.s * chroma));
  return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step, index) => ({
    step,
    hex: hslToHex(hsl.h, saturation, lightness[index])
  }));
}

function brandPaletteCss(prefix, palette) {
  return [
    ":root {",
    ...palette.map((item) => `  --${prefix}-${item.step}: ${item.hex};`),
    "}"
  ].join("\n");
}

function brandPaletteTailwind(prefix, palette) {
  return JSON.stringify({
    [prefix]: Object.fromEntries(palette.map((item) => [item.step, item.hex]))
  }, null, 2);
}

function hexToHsl(hex) {
  const [red, green, blue] = hexToRgb(hex).map((value) => value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: lightness * 100 };
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue = max === red
    ? (green - blue) / delta + (green < blue ? 6 : 0)
    : max === green
      ? (blue - red) / delta + 2
      : (red - green) / delta + 4;
  return { h: hue * 60, s: saturation * 100, l: lightness * 100 };
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;
  const [red, green, blue] = hue < 60 ? [c, x, 0]
    : hue < 120 ? [x, c, 0]
      : hue < 180 ? [0, c, x]
        : hue < 240 ? [0, x, c]
          : hue < 300 ? [x, 0, c]
            : [c, 0, x];
  return rgbToHex((red + m) * 255, (green + m) * 255, (blue + m) * 255);
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex) {
  return hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function dataHref(type, value) {
  return `data:${type};charset=utf-8,${encodeURIComponent(value)}`;
}

function privacyNotice(tool) {
  const level = toolPrivacyLevel(tool);
  const copy = privacyCopy[currentLanguage] || privacyCopy.en;
  const fallbackCopy = privacyCopy.en;
  const title = copy.title || fallbackCopy.title;
  const message = copy.messages?.[level] || fallbackCopy.messages[level];
  return `
    <div class="privacy-note" data-privacy-level="${level}">
      <strong>${title}</strong>
      <span>${message}</span>
    </div>
  `;
}

function toolMetadata(tool) {
  const slug = slugify(tool.id || tool.title);
  const categorySlug = slugify(tool.category);
  const intent = toolIntent(tool);
  const opportunity = toolOpportunity(tool);
  const aliases = Array.isArray(tool.aliases) ? tool.aliases.join(" ") : "";
  return {
    slug,
    categorySlug,
    intent,
    tier: toolTier(tool),
    priority: opportunity.score >= 80 ? "flagship" : highValueCategories.has(tool.category) || tool.custom ? "primary" : "standard",
    opportunity,
    searchText: `${tool.title} ${tool.category} ${tool.description} ${aliases} ${slug} ${categorySlug} ${intent} ${opportunity.demand} ${opportunity.moat}`.toLowerCase()
  };
}

function toolRank(tool) {
  const meta = toolMetadata(tool);
  let rank = meta.opportunity.score;
  if (meta.tier === "high") rank += 30;
  if (meta.tier === "medium") rank += 15;
  if (meta.priority === "flagship") rank += 35;
  if (meta.priority === "primary") rank += 20;
  if (tool.custom) rank += 12;
  if (["Image", "Data", "Developer", "Text"].includes(tool.category)) rank += 8;
  return rank;
}

function searchScore(tool, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return toolRank(tool);
  const meta = toolMetadata(tool);
  const title = tool.title.toLowerCase();
  const slug = meta.slug;
  const category = tool.category.toLowerCase();
  const description = tool.description.toLowerCase();
  const localizedTitle = localizedToolTitle(tool).toLowerCase();
  const localizedCategoryName = localizedCategory(tool.category).toLowerCase();
  const localizedDescription = localizedToolDescription(tool).toLowerCase();
  const localizedCorpus = localizedSearchText(tool, meta);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  let score = toolRank(tool);
  if (title === normalized || localizedTitle === normalized || slug === normalized) score += 120;
  if (title.startsWith(normalized) || localizedTitle.startsWith(normalized) || slug.startsWith(normalized)) score += 90;
  if (title.includes(normalized) || localizedTitle.includes(normalized) || slug.includes(normalized)) score += 70;
  if (category.includes(normalized) || localizedCategoryName.includes(normalized)) score += 35;
  if (description.includes(normalized) || localizedDescription.includes(normalized)) score += 25;
  if (localizedCorpus.includes(normalized)) score += 30;
  for (const token of tokens) {
    if (title.includes(token)) score += 24;
    if (localizedTitle.includes(token)) score += 28;
    if (slug.includes(token)) score += 20;
    if (category.includes(token)) score += 10;
    if (localizedCategoryName.includes(token)) score += 12;
    if (description.includes(token)) score += 8;
    if (localizedDescription.includes(token)) score += 10;
    if (localizedCorpus.includes(token)) score += 8;
    if (meta.intent.includes(token)) score += 8;
  }
  return score;
}

function searchTools(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tools.slice().sort((a, b) => toolRank(b) - toolRank(a));
  }
  return tools
    .map((tool) => ({ tool, score: searchScore(tool, normalized) }))
    .filter(({ tool, score }) => {
      const meta = toolMetadata(tool);
      return score > toolRank(tool) || meta.searchText.includes(normalized) || localizedSearchText(tool, meta).includes(normalized);
    })
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title))
    .map(({ tool }) => tool);
}

function findToolBySlug(slug) {
  const normalized = slugify(slug);
  return tools.find((tool) => tool.id === normalized || toolMetadata(tool).slug === normalized);
}

function locale() {
  return translations[currentLanguage] || translations.en;
}

function textFor(key) {
  return locale()[key] ?? translations.en[key] ?? key;
}

function localizedCategory(category) {
  return localizedCategoryFor(category, currentLanguage);
}

function localizedCategoryFor(category, language = currentLanguage) {
  return translations[language]?.categoriesMap?.[category] || category;
}

function categoryForAnchor(anchor) {
  return tools.find((tool) => tool.anchor === anchor)?.category || "";
}

function localizedToolTitle(tool) {
  return localizedToolTitleFor(tool, currentLanguage);
}

function localizedToolTitleFor(tool, language = currentLanguage) {
  if (!tool) return "";
  if (language === "en") return tool.title;
  const terms = titleTerms[language] || {};
  const orderedTerms = Object.keys(terms).sort((a, b) => b.length - a.length);
  return orderedTerms.reduce((title, term) => title.replaceAll(term, terms[term]), tool.title);
}

function localizedToolDescription(tool) {
  if (!tool) return "";
  if (currentLanguage === "en") return tool.description;
  return locale().categoryIntro(localizedCategory(tool.category), localizedToolTitle(tool));
}

function localizedToolDescriptionFor(tool, language = currentLanguage) {
  if (!tool) return "";
  if (language === "en") return tool.description;
  const localizedTitle = localizedToolTitleFor(tool, language);
  const localizedCategoryName = localizedCategoryFor(tool.category, language);
  const intro = translations[language]?.categoryIntro || translations.en.categoryIntro;
  return intro(localizedCategoryName, localizedTitle);
}

function localizedSearchText(tool, meta = toolMetadata(tool)) {
  const parts = [
    meta.searchText,
    tool.title,
    tool.category,
    tool.description
  ];
  for (const [code] of languages) {
    parts.push(
      localizedToolTitleFor(tool, code),
      localizedCategoryFor(tool.category, code),
      localizedToolDescriptionFor(tool, code)
    );
  }
  return parts.join(" ").toLowerCase();
}

function localizedToolCount(count) {
  const noun = count === 1 ? textFor("toolSingular") : textFor("toolPlural");
  if (["ko", "zh", "ja", "th", "hi"].includes(currentLanguage)) {
    return `${count} ${noun}`;
  }
  return `${count} ${noun}`;
}

function localizedCategoryLink(anchor, fallbackText) {
  const category = categoryForAnchor(anchor);
  if (!category) return fallbackText;
  return `${localizedCategory(category)} ${textFor("categorySuffix")}`;
}

function populateLanguageSelect() {
  if (!languageSelect) return;
  languageSelect.innerHTML = languages
    .map(([code, label]) => `<option value="${code}" ${code === currentLanguage ? "selected" : ""}>${label}</option>`)
    .join("");
}

function applyLocale() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.setAttribute("aria-label", textFor("categories"));
  }
  if (search) {
    search.placeholder = textFor("searchPlaceholder");
  }

  const sideBlocks = document.querySelectorAll(".side-block");
  const categoryHeading = sideBlocks[0]?.querySelector("h2");
  const pinnedHeading = sideBlocks[1]?.querySelector("h2");
  const recentHeading = sideBlocks[2]?.querySelector("h2");
  if (categoryHeading) categoryHeading.textContent = textFor("categories");
  if (pinnedHeading) pinnedHeading.textContent = textFor("pinned");
  if (recentHeading) recentHeading.textContent = textFor("recent");
  document.querySelectorAll('.sidebar a[href^="#"]').forEach((link) => {
    const anchor = link.getAttribute("href").slice(1);
    link.textContent = localizedCategoryLink(anchor, link.textContent);
  });

  const footerSpans = document.querySelectorAll(".site-footer > span");
  if (footerSpans[1]) footerSpans[1].textContent = textFor("footer");
  const footerLinks = document.querySelectorAll(".footer-links a");
  if (footerLinks[0]) footerLinks[0].textContent = textFor("privacy");
  if (footerLinks[1]) footerLinks[1].textContent = textFor("terms");

  const pathCategory = location.pathname.match(/\/categories\/([^/]+)\/?$/)?.[1];
  const pathTool = findToolBySlug(initialToolSlugFromLocation());
  const heroTitle = document.querySelector(".hero-copy h1");
  const heroCopy = document.querySelector(".hero-copy p");
  if (heroTitle && pathTool) {
    heroTitle.textContent = localizedToolTitle(pathTool);
    if (heroCopy) heroCopy.textContent = localizedToolDescription(pathTool);
  } else if (heroTitle && pathCategory) {
    const category = tools.find((tool) => toolMetadata(tool).categorySlug === pathCategory)?.category;
    if (category) heroTitle.textContent = `${localizedCategory(category)} ${textFor("toolsWord")}`;
  } else if (heroTitle) {
    heroTitle.textContent = textFor("homeHeading");
  }
}

function initialToolSlugFromLocation() {
  const pathMatch = location.pathname.match(/\/tools\/([^/]+)\/?$/);
  if (pathMatch) return pathMatch[1];
  const params = new URLSearchParams(location.search);
  return params.get("tool") || "";
}

function shareableFormElements(form) {
  return [...form.elements].filter((el) => el.name && !["file", "reset", "submit", "button"].includes(el.type));
}

function buildShareUrl(tool) {
  const form = document.getElementById("active-tool-form");
  const params = new URLSearchParams();
  if (form) {
    shareableFormElements(form).forEach((el) => {
      if (el.type === "checkbox") {
        if (el.checked !== el.defaultChecked) params.set(el.name, el.checked ? "1" : "0");
        return;
      }
      if (el.tagName === "SELECT") {
        const defaultOption = [...el.options].find((option) => option.defaultSelected) || el.options[0];
        if (el.value !== (defaultOption?.value ?? "")) params.set(el.name, el.value);
        return;
      }
      if (el.value !== el.defaultValue) params.set(el.name, el.value);
    });
  }
  const query = params.toString();
  return `${location.origin}/tools/${toolMetadata(tool).slug}/${query ? `?${query}` : ""}`;
}

function applySharedStateFromUrl(tool) {
  const params = new URLSearchParams(location.search);
  params.delete("tool");
  const form = document.getElementById("active-tool-form");
  if (!form || ![...params.keys()].length) return;
  let applied = false;
  shareableFormElements(form).forEach((el) => {
    if (!params.has(el.name)) return;
    const value = params.get(el.name);
    if (el.type === "checkbox") {
      el.checked = value === "1";
    } else {
      el.value = value;
    }
    applied = true;
  });
  if (!applied) return;
  if (tool.category === "Decision") {
    refreshDecisionIdleStage();
  } else if (tool.custom?.startsWith("file-")) {
    updateFileTool();
  } else if (tool.custom === "qr-code") {
    updateQrTool();
  } else if (tool.custom?.startsWith("image-")) {
    updateImageTool();
  } else {
    calculateActive(tool);
  }
}

function shareButtonMarkup() {
  return `<button class="share-button" type="button" data-share-tool title="${escapeAttr(textFor("shareHint"))}">${textFor("shareLink")}</button>`;
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function num(value) {
  return Number.parseFloat(value) || 0;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function pct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function slugPart(value) {
  return String(value || "X").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12) || "X";
}

function randomInt(max) {
  const limit = Math.max(1, Math.floor(max));
  const array = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
    return array[0] % limit;
  }
  return Math.floor(Math.random() * limit);
}

function shuffleItems(items) {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function listLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function metrics(items) {
  return `<div class="result-grid">${items.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
}

function growthChartMarkup(rows, options) {
  if (!rows?.length) return "";
  const max = Math.max(...rows.map((row) => Math.max(0, options.total(row))));
  if (!(max > 0)) return "";
  const labelStep = Math.ceil(rows.length / 12);
  const bars = rows.map((row, index) => {
    const total = Math.max(0, options.total(row));
    const base = Math.max(0, Math.min(total, options.base ? options.base(row) : 0));
    const totalPct = (total / max) * 100;
    const basePct = total > 0 ? (base / total) * 100 : 0;
    const label = index % labelStep === 0 || index === rows.length - 1 ? String(options.label(row)) : "";
    return `
      <div class="chart-bar" title="${escapeAttr(options.title(row))}">
        <div class="chart-bar-fill" style="height:${totalPct.toFixed(2)}%">
          ${options.base ? `<div class="chart-bar-base" style="height:${basePct.toFixed(2)}%"></div>` : ""}
        </div>
        <span class="chart-bar-label">${escapeHtml(label)}</span>
      </div>
    `;
  }).join("");
  const legend = options.legend
    ? `<div class="chart-legend">${options.legend.map(([kind, text]) => `<span class="chart-legend-item"><i class="legend-${kind}"></i>${escapeHtml(text)}</span>`).join("")}</div>`
    : "";
  return `
    <div class="growth-chart" role="img" aria-label="${escapeAttr(options.aria || "Chart")}">
      ${legend}
      <div class="chart-bars">${bars}</div>
    </div>
  `;
}

function renderLadderDraw(values) {
  const summary = ladderDrawSummary(values);
  if (summary.error) return error(summary.error);
  if (summary.mode === "single") {
    return `
      ${metrics([["Winner", escapeHtml(summary.winner)], ["Outcome", escapeHtml(summary.outcome)], ["Pool size", summary.poolSize]])}
      ${output(summary.text)}
    `;
  }
  const rows = summary.pairings.map(([name, outcome], index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(outcome)}</td>
    </tr>
  `).join("");
  return `
    ${metrics([["Participants", summary.participants], ["Outcomes", summary.outcomes], ["First result", escapeHtml(summary.pick)]])}
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>Outcome</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${output(summary.text)}
  `;
}

function generateLadder(columns) {
  const levels = Math.max(6, Math.min(16, columns * 3));
  const rungs = [];
  const gapCovered = Array.from({ length: Math.max(0, columns - 1) }, () => false);
  for (let level = 0; level < levels; level += 1) {
    let previous = false;
    for (let gap = 0; gap < columns - 1; gap += 1) {
      if (!previous && randomInt(100) < 40) {
        rungs.push({ level, gap });
        gapCovered[gap] = true;
        previous = true;
      } else {
        previous = false;
      }
    }
  }
  gapCovered.forEach((covered, gap) => {
    if (covered) return;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const level = randomInt(levels);
      const clash = rungs.some((rung) => rung.level === level && Math.abs(rung.gap - gap) <= 1);
      if (!clash) {
        rungs.push({ level, gap });
        return;
      }
    }
  });
  return { columns, levels, rungs };
}

function traceLadder(ladder, startColumn) {
  const points = [{ level: -1, column: startColumn }];
  let column = startColumn;
  for (let level = 0; level < ladder.levels; level += 1) {
    const goRight = ladder.rungs.some((rung) => rung.level === level && rung.gap === column);
    const goLeft = !goRight && ladder.rungs.some((rung) => rung.level === level && rung.gap === column - 1);
    if (goRight || goLeft) {
      points.push({ level, column });
      column += goRight ? 1 : -1;
      points.push({ level, column });
    }
  }
  points.push({ level: ladder.levels, column });
  return { start: startColumn, end: column, points };
}

function ladderDrawSummary(values) {
  const names = listLines(values.names);
  const outcomes = listLines(values.outcomes);
  if (!names.length) return { error: "Enter at least one person or team." };
  if (!outcomes.length) return { error: "Enter at least one outcome." };
  if (names.length > 16) return { error: "Ladder draw supports up to 16 participants." };

  const columns = names.length;
  const ladder = generateLadder(columns);
  const bottomLabels = Array.from({ length: columns }, (_, index) => outcomes[index % outcomes.length]);
  const paths = Array.from({ length: columns }, (_, index) => traceLadder(ladder, index));
  const pairings = paths.map((path) => [names[path.start], bottomLabels[path.end]]);

  if (values.mode === "single") {
    const winnerColumn = randomInt(columns);
    const winner = names[winnerColumn];
    const outcome = bottomLabels[paths[winnerColumn].end];
    return {
      mode: "single",
      names,
      outcomeLabels: outcomes,
      winner,
      outcome,
      pick: `${winner} -> ${outcome}`,
      poolSize: names.length,
      text: `${winner} -> ${outcome}`,
      ladder: { ...ladder, paths: [paths[winnerColumn]], topLabels: names, bottomLabels, winnerColumn }
    };
  }

  return {
    mode: "shuffle",
    pairings,
    names,
    outcomeLabels: outcomes,
    participants: names.length,
    outcomes: outcomes.length,
    pick: pairings[0]?.join(" -> ") || "",
    text: pairings.map(([name, outcome]) => `${name} -> ${outcome}`).join("\n"),
    ladder: { ...ladder, paths, topLabels: names, bottomLabels }
  };
}

function renderCoinFlip(values) {
  const summary = coinFlipSummary(values);
  return `
    ${metrics([["Result", escapeHtml(summary.result)], [escapeHtml(summary.labels[0]), summary.heads], [escapeHtml(summary.labels[1]), summary.tails], ["Flips", summary.count]])}
    ${output(summary.text)}
  `;
}

function coinFaceLabels() {
  return currentLanguage === "ko" ? ["앞면", "뒷면"] : ["Heads", "Tails"];
}

function coinFlipSummary(values) {
  const count = Math.min(100, Math.max(1, Math.floor(num(values.count))));
  const labels = coinFaceLabels();
  const flips = Array.from({ length: count }, () => labels[randomInt(2)]);
  const heads = flips.filter((item) => item === labels[0]).length;
  return {
    labels,
    flips,
    result: flips[0],
    heads,
    tails: count - heads,
    count,
    text: flips.map((item, index) => `${index + 1}. ${item}`).join("\n")
  };
}

function renderDiceRoller(values) {
  const summary = diceRollerSummary(values);
  return `
    ${metrics([["Total", summary.total], ["Rolls", summary.rolls.join(", ")], ["Dice", `${summary.dice}d${summary.sides}`], ["Modifier", summary.modifierLabel]])}
    ${output(summary.text)}
  `;
}

function diceRollerSummary(values) {
  const dice = Math.min(100, Math.max(1, Math.floor(num(values.dice))));
  const sides = Math.min(1000, Math.max(2, Math.floor(num(values.sides))));
  const modifier = Math.floor(num(values.modifier));
  const rolls = Array.from({ length: dice }, () => randomInt(sides) + 1);
  const subtotal = rolls.reduce((sum, value) => sum + value, 0);
  const total = subtotal + modifier;
  const modifierLabel = modifier ? `${modifier > 0 ? "+" : ""}${modifier}` : "0";
  return {
    dice,
    sides,
    modifier,
    modifierLabel,
    rolls,
    subtotal,
    total,
    text: `${dice}d${sides}${modifier ? ` ${modifierLabel}` : ""}\nRolls: ${rolls.join(", ")}\nTotal: ${total}`
  };
}

function renderRoulettePicker(values) {
  const summary = roulettePickerSummary(values);
  if (summary.error) return error(summary.error);
  return `
    ${metrics([["Pick", escapeHtml(summary.pick)], ["Draws", summary.picks.length], ["Pool size", summary.poolSize], ["Repeats", summary.allowRepeats ? "Allowed" : "No repeats until exhausted"]])}
    ${output(summary.text)}
  `;
}

function roulettePickerSummary(values) {
  const items = listLines(values.items);
  if (!items.length) return { error: "Enter at least one item." };
  const draws = Math.min(100, Math.max(1, Math.floor(num(values.draws))));
  const allowRepeats = values.withoutReplacement === "yes";
  const pool = shuffleItems(items);
  const picks = [];
  for (let index = 0; index < draws; index += 1) {
    if (allowRepeats) {
      picks.push(items[randomInt(items.length)]);
    } else {
      picks.push(pool[index % pool.length]);
    }
  }
  return {
    items,
    picks,
    pick: picks[0],
    winnerIndex: items.indexOf(picks[0]),
    poolSize: items.length,
    allowRepeats,
    text: picks.map((item, index) => `${index + 1}. ${item}`).join("\n")
  };
}

function renderSalesTax(values) {
  const summary = salesTaxSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${pct(scenario.rate)}</td>
      <td>${money(scenario.subtotal)}</td>
      <td>${money(scenario.taxAmount)}</td>
      <td>${money(scenario.total)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Subtotal", money(summary.subtotal)],
      ["Discount amount", money(summary.discountAmount)],
      ["Taxable amount", money(summary.taxableAmount)],
      ["Sales tax", money(summary.taxAmount)],
      ["Total", money(summary.total)],
      ["Effective rate", pct(summary.effectiveRate)]
    ])}
    <div class="result-grid">
      <div><span>Price per item</span><strong>${money(summary.pricePerItem)}</strong></div>
      <div><span>Total per item</span><strong>${money(summary.totalPerItem)}</strong></div>
      <div><span>Quantity</span><strong>${summary.quantity.toLocaleString("en-US")}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tax rate</th>
            <th>Subtotal</th>
            <th>Sales tax</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="sales-tax.csv">Download tax scenarios CSV</a>
  `;
}

function salesTaxSummary(values) {
  const price = num(values.price);
  const rate = num(values.tax) / 100;
  const quantity = Math.max(1, Math.floor(num(values.quantity) || 1));
  const discountRate = Math.min(0.99, Math.max(0, num(values.discount) / 100));
  if (price < 0) return { error: "Price cannot be negative." };
  if (rate < 0) return { error: "Tax rate cannot be negative." };
  if (rate > 1) return { error: "Tax rate should be 100% or less." };

  const gross = price * quantity;
  let subtotal = gross;
  let taxableAmount = gross * (1 - discountRate);
  let total = taxableAmount * (1 + rate);
  let taxAmount = taxableAmount * rate;

  if (values.mode === "remove") {
    total = gross * (1 - discountRate);
    taxableAmount = rate === -1 ? 0 : total / (1 + rate);
    taxAmount = total - taxableAmount;
    subtotal = taxableAmount / (1 - discountRate || 1);
  }

  const discountAmount = Math.max(0, subtotal - taxableAmount);
  const scenarioRates = [...new Set([Math.max(0, rate - 0.02), rate, rate + 0.02])];
  const scenarios = scenarioRates.map((scenarioRate) => {
    const scenarioTax = taxableAmount * scenarioRate;
    return {
      rate: scenarioRate,
      subtotal,
      taxAmount: scenarioTax,
      total: taxableAmount + scenarioTax
    };
  });
  const csvRows = [
    ["Tax rate", "Subtotal", "Taxable amount", "Sales tax", "Total"],
    ...scenarios.map((scenario) => [scenario.rate, scenario.subtotal, taxableAmount, scenario.taxAmount, scenario.total])
  ];

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
    effectiveRate: total > 0 ? taxAmount / total : 0,
    pricePerItem: quantity ? subtotal / quantity : 0,
    totalPerItem: quantity ? total / quantity : 0,
    quantity,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function renderProfitMargin(values) {
  const summary = profitMarginSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.netRevenue)}</td>
      <td>${money(scenario.netProfit)}</td>
      <td>${pct(scenario.margin)}</td>
      <td>${pct(scenario.markup)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Net revenue", money(summary.netRevenue)],
      ["Net profit", money(summary.netProfit)],
      ["Margin", pct(summary.margin)],
      ["Markup", pct(summary.markup)],
      ["Break-even price", money(summary.breakEvenPrice)],
      ["Target price", money(summary.targetPrice)]
    ])}
    <div class="result-grid">
      <div><span>Fee amount</span><strong>${money(summary.feeAmount)}</strong></div>
      <div><span>Discount amount</span><strong>${money(summary.discountAmount)}</strong></div>
      <div><span>Profit per $100 sales</span><strong>${money(summary.margin * 100)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Net revenue</th>
            <th>Net profit</th>
            <th>Margin</th>
            <th>Markup</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="profit-margin.csv">Download margin scenarios CSV</a>
  `;
}

function profitMarginSummary(values) {
  const cost = num(values.cost);
  const price = num(values.price);
  const feeRate = Math.max(0, num(values.fee) / 100);
  const fixedFee = Math.max(0, num(values.fixedFee));
  const discountRate = Math.min(0.99, Math.max(0, num(values.discount) / 100));
  const targetMargin = Math.min(0.95, Math.max(0, num(values.targetMargin) / 100));
  if (cost < 0) return { error: "Cost cannot be negative." };
  if (price <= 0) return { error: "Selling price must be greater than zero." };

  const base = marginScenario("Current", cost, price, feeRate, fixedFee, discountRate);
  const breakEvenPrice = priceForTargetMargin(cost, feeRate, fixedFee, discountRate, 0);
  const targetPrice = priceForTargetMargin(cost, feeRate, fixedFee, discountRate, targetMargin);
  const scenarios = [
    base,
    marginScenario("5% discount", cost, price, feeRate, fixedFee, Math.min(0.99, discountRate + 0.05)),
    marginScenario("10% discount", cost, price, feeRate, fixedFee, Math.min(0.99, discountRate + 0.1)),
    marginScenario("Target margin", cost, targetPrice, feeRate, fixedFee, discountRate)
  ];
  const csvRows = [
    ["Scenario", "Net revenue", "Net profit", "Margin", "Markup"],
    ...scenarios.map((scenario) => [scenario.label, scenario.netRevenue, scenario.netProfit, scenario.margin, scenario.markup])
  ];

  return {
    ...base,
    breakEvenPrice,
    targetPrice,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function marginScenario(label, cost, price, feeRate, fixedFee, discountRate) {
  const grossRevenue = price * (1 - discountRate);
  const feeAmount = grossRevenue * feeRate + fixedFee;
  const netRevenue = grossRevenue - feeAmount;
  const netProfit = netRevenue - cost;
  return {
    label,
    grossRevenue,
    feeAmount,
    discountAmount: price - grossRevenue,
    netRevenue,
    netProfit,
    margin: netRevenue > 0 ? netProfit / netRevenue : 0,
    markup: cost > 0 ? netProfit / cost : 0
  };
}

function priceForTargetMargin(cost, feeRate, fixedFee, discountRate, targetMargin) {
  const denominator = (1 - discountRate) * (1 - feeRate) * (1 - targetMargin);
  if (denominator <= 0) return 0;
  return (cost + fixedFee) / denominator;
}

function renderAdRevenue(values) {
  const summary = adRevenueSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${scenario.visitors.toLocaleString("en-US")}</td>
      <td>${scenario.pageviews.toLocaleString("en-US")}</td>
      <td>${money(scenario.revenue)}</td>
      <td>${money(scenario.sessionValue)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Projected revenue", money(summary.revenue)],
      ["Pageviews", summary.pageviews.toLocaleString("en-US")],
      ["Effective RPM", money(summary.effectiveRpm)],
      ["Revenue / visitor", money(summary.sessionValue)],
      ["Annual run rate", money(summary.annualRunRate)],
      ["Known revenue RPM", money(summary.knownRevenueRpm)]
    ])}
    <div class="result-grid">
      <div><span>Filled pageviews</span><strong>${summary.filledPageviews.toLocaleString("en-US")}</strong></div>
      <div><span>Visitors for $10k/mo</span><strong>${summary.visitorsFor10k.toLocaleString("en-US")}</strong></div>
      <div><span>RPM lift to $10k/mo</span><strong>${money(summary.rpmFor10k)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Visitors</th>
            <th>Pageviews</th>
            <th>Revenue</th>
            <th>Revenue / visitor</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="ad-revenue-scenarios.csv">Download ad revenue CSV</a>
  `;
}

function adRevenueSummary(values) {
  const visitors = Math.max(0, Math.floor(num(values.visitors)));
  const pages = Math.max(0, num(values.pages));
  const rpm = Math.max(0, num(values.rpm));
  const fillRate = Math.min(1, Math.max(0, num(values.fill) / 100));
  const knownRevenue = Math.max(0, num(values.revenue));
  if (visitors <= 0) return { error: "Monthly visitors must be greater than zero." };
  if (pages <= 0) return { error: "Pages per visitor must be greater than zero." };

  const base = adRevenueScenario("Current", visitors, pages, rpm, fillRate);
  const scenarios = [
    base,
    adRevenueScenario("Traffic +25%", visitors * 1.25, pages, rpm, fillRate),
    adRevenueScenario("RPM +25%", visitors, pages, rpm * 1.25, fillRate),
    adRevenueScenario("Engagement +25%", visitors, pages * 1.25, rpm, fillRate)
  ];
  const revenuePerVisitor = base.sessionValue || 0;
  const visitorsFor10k = revenuePerVisitor ? Math.ceil(10000 / revenuePerVisitor) : 0;
  const rpmFor10k = base.filledPageviews ? 10000 / base.filledPageviews * 1000 : 0;
  const csvRows = [
    ["Scenario", "Visitors", "Pageviews", "Filled pageviews", "Revenue", "Revenue per visitor"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.visitors,
      scenario.pageviews,
      scenario.filledPageviews,
      scenario.revenue,
      scenario.sessionValue
    ])
  ];

  return {
    ...base,
    annualRunRate: base.revenue * 12,
    knownRevenueRpm: base.pageviews ? knownRevenue / base.pageviews * 1000 : 0,
    visitorsFor10k,
    rpmFor10k,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function adRevenueScenario(label, visitors, pages, rpm, fillRate) {
  const roundedVisitors = Math.round(visitors);
  const pageviews = Math.round(roundedVisitors * pages);
  const filledPageviews = Math.round(pageviews * fillRate);
  const revenue = filledPageviews / 1000 * rpm;
  return {
    label,
    visitors: roundedVisitors,
    pageviews,
    filledPageviews,
    revenue,
    effectiveRpm: pageviews > 0 ? revenue / pageviews * 1000 : 0,
    sessionValue: roundedVisitors ? revenue / roundedVisitors : 0
  };
}

function renderDiscount(values) {
  const summary = discountSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${pct(scenario.effectiveDiscount)}</td>
      <td>${money(scenario.saleSubtotal)}</td>
      <td>${money(scenario.taxAmount)}</td>
      <td>${money(scenario.total)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Sale subtotal", money(summary.saleSubtotal)],
      ["Total with tax", money(summary.total)],
      ["You save", money(summary.savings)],
      ["Effective discount", pct(summary.effectiveDiscount)],
      ["Price per item", money(summary.pricePerItem)],
      ["Total per item", money(summary.totalPerItem)]
    ])}
    <div class="result-grid">
      <div><span>Original subtotal</span><strong>${money(summary.originalSubtotal)}</strong></div>
      <div><span>Tax amount</span><strong>${money(summary.taxAmount)}</strong></div>
      <div><span>Quantity</span><strong>${summary.quantity.toLocaleString("en-US")}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Effective discount</th>
            <th>Sale subtotal</th>
            <th>Tax</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="discount-scenarios.csv">Download discount scenarios CSV</a>
  `;
}

function discountSummary(values) {
  const price = num(values.price);
  const discountRate = Math.min(0.99, Math.max(0, num(values.discount) / 100));
  const couponRate = Math.min(0.99, Math.max(0, num(values.coupon) / 100));
  const quantity = Math.max(1, Math.floor(num(values.quantity) || 1));
  const taxRate = Math.max(0, num(values.tax) / 100);
  if (price < 0) return { error: "Original price cannot be negative." };

  const base = discountScenario("Current", price, quantity, taxRate, discountRate, couponRate);
  const scenarios = [
    base,
    discountScenario("No extra coupon", price, quantity, taxRate, discountRate, 0),
    discountScenario("Discount +5%", price, quantity, taxRate, Math.min(0.99, discountRate + 0.05), couponRate),
    discountScenario("Coupon +5%", price, quantity, taxRate, discountRate, Math.min(0.99, couponRate + 0.05))
  ];
  const csvRows = [
    ["Scenario", "Effective discount", "Original subtotal", "Sale subtotal", "Tax", "Total"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.effectiveDiscount,
      scenario.originalSubtotal,
      scenario.saleSubtotal,
      scenario.taxAmount,
      scenario.total
    ])
  ];

  return {
    ...base,
    quantity,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function discountScenario(label, price, quantity, taxRate, discountRate, couponRate) {
  const originalSubtotal = price * quantity;
  const afterDiscount = originalSubtotal * (1 - discountRate);
  const saleSubtotal = afterDiscount * (1 - couponRate);
  const taxAmount = saleSubtotal * taxRate;
  const total = saleSubtotal + taxAmount;
  const savings = originalSubtotal - saleSubtotal;
  const effectiveDiscount = originalSubtotal > 0 ? savings / originalSubtotal : 0;
  return {
    label,
    originalSubtotal,
    saleSubtotal,
    taxAmount,
    total,
    savings,
    effectiveDiscount,
    pricePerItem: quantity ? saleSubtotal / quantity : 0,
    totalPerItem: quantity ? total / quantity : 0
  };
}

function renderBreakEven(values) {
  const summary = breakEvenSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${scenario.breakEvenUnits.toLocaleString("en-US")}</td>
      <td>${scenario.targetUnits.toLocaleString("en-US")}</td>
      <td>${money(scenario.revenueNeeded)}</td>
      <td>${scenario.leadsNeeded.toLocaleString("en-US")}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Break-even units", summary.breakEvenUnits.toLocaleString("en-US")],
      ["Target profit units", summary.targetUnits.toLocaleString("en-US")],
      ["Contribution / unit", money(summary.contribution)],
      ["Contribution margin", pct(summary.contributionMargin)],
      ["Revenue needed", money(summary.revenueNeeded)],
      ["Leads needed", summary.leadsNeeded.toLocaleString("en-US")]
    ])}
    <div class="result-grid">
      <div><span>Break-even revenue</span><strong>${money(summary.breakEvenRevenue)}</strong></div>
      <div><span>Target profit</span><strong>${money(summary.targetProfit)}</strong></div>
      <div><span>Safety price floor</span><strong>${money(summary.variableCost)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Break-even units</th>
            <th>Target units</th>
            <th>Revenue needed</th>
            <th>Leads needed</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="break-even-scenarios.csv">Download break-even CSV</a>
  `;
}

function breakEvenSummary(values) {
  const fixedCost = Math.max(0, num(values.fixed));
  const price = num(values.price);
  const variableCost = Math.max(0, num(values.variable));
  const targetProfit = Math.max(0, num(values.targetProfit));
  const conversionRate = Math.max(0, num(values.conversion) / 100);
  if (price <= 0) return { error: "Price per unit must be greater than zero." };
  if (price <= variableCost) return { error: "Price must be greater than variable cost." };

  const base = breakEvenScenario("Current", fixedCost, price, variableCost, targetProfit, conversionRate);
  const scenarios = [
    base,
    breakEvenScenario("Price +10%", fixedCost, price * 1.1, variableCost, targetProfit, conversionRate),
    breakEvenScenario("Cost +10%", fixedCost, price, variableCost * 1.1, targetProfit, conversionRate),
    breakEvenScenario("Fixed cost -10%", fixedCost * 0.9, price, variableCost, targetProfit, conversionRate)
  ];
  const csvRows = [
    ["Scenario", "Break-even units", "Target units", "Revenue needed", "Leads needed"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.breakEvenUnits,
      scenario.targetUnits,
      scenario.revenueNeeded,
      scenario.leadsNeeded
    ])
  ];

  return {
    ...base,
    fixedCost,
    price,
    variableCost,
    targetProfit,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function breakEvenScenario(label, fixedCost, price, variableCost, targetProfit, conversionRate) {
  const contribution = price - variableCost;
  const contributionMargin = price > 0 ? contribution / price : 0;
  const breakEvenUnits = Math.ceil(fixedCost / contribution);
  const targetUnits = Math.ceil((fixedCost + targetProfit) / contribution);
  const revenueNeeded = targetUnits * price;
  const breakEvenRevenue = breakEvenUnits * price;
  const leadsNeeded = conversionRate > 0 ? Math.ceil(targetUnits / conversionRate) : 0;
  return {
    label,
    contribution,
    contributionMargin,
    breakEvenUnits,
    targetUnits,
    revenueNeeded,
    breakEvenRevenue,
    leadsNeeded
  };
}

function renderRoi(values) {
  const summary = roiSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.totalReturn)}</td>
      <td>${money(scenario.profit)}</td>
      <td>${pct(scenario.roi)}</td>
      <td>${pct(scenario.annualizedRoi)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Net profit", money(summary.profit)],
      ["ROI", pct(summary.roi)],
      ["Annualized ROI", pct(summary.annualizedRoi)],
      ["Total return", money(summary.totalReturn)],
      ["Payback period", summary.paybackLabel],
      ["Monthly profit avg", money(summary.monthlyProfitAverage)]
    ])}
    <div class="result-grid">
      <div><span>Cash flow kept</span><strong>${money(summary.cashFlowKept)}</strong></div>
      <div><span>Cash flow reinvested</span><strong>${money(summary.cashFlowReinvested)}</strong></div>
      <div><span>Profit multiple</span><strong>${summary.profitMultiple.toFixed(2)}x</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Total return</th>
            <th>Profit</th>
            <th>ROI</th>
            <th>Annualized ROI</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="roi-scenarios.csv">Download ROI scenarios CSV</a>
  `;
}

function roiSummary(values) {
  const cost = num(values.cost);
  const finalValue = num(values.return);
  const months = Math.max(1, Math.round(num(values.months)));
  const cashflow = num(values.cashflow);
  const reinvestedRate = Math.min(1, Math.max(0, num(values.reinvested) / 100));
  if (cost <= 0) return { error: "Investment cost must be greater than zero." };
  if (finalValue < 0) return { error: "Final value cannot be negative." };

  const base = roiScenario("Current", cost, finalValue, months, cashflow, reinvestedRate);
  const scenarios = [
    base,
    roiScenario("Return +10%", cost, finalValue * 1.1, months, cashflow, reinvestedRate),
    roiScenario("Return -10%", cost, finalValue * 0.9, months, cashflow, reinvestedRate),
    roiScenario("Cash flow +20%", cost, finalValue, months, cashflow * 1.2, reinvestedRate)
  ];
  const csvRows = [
    ["Scenario", "Total return", "Profit", "ROI", "Annualized ROI", "Payback months"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.totalReturn,
      scenario.profit,
      scenario.roi,
      scenario.annualizedRoi,
      scenario.paybackMonths ?? ""
    ])
  ];

  return {
    ...base,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function roiScenario(label, cost, finalValue, months, cashflow, reinvestedRate) {
  const totalCashFlow = cashflow * months;
  const cashFlowReinvested = totalCashFlow * reinvestedRate;
  const cashFlowKept = totalCashFlow - cashFlowReinvested;
  const totalReturn = finalValue + totalCashFlow;
  const profit = totalReturn - cost;
  const roi = profit / cost;
  const endingMultiple = totalReturn / cost;
  const annualizedRoi = endingMultiple > 0 ? (endingMultiple ** (12 / months)) - 1 : -1;
  const monthlyProfitAverage = profit / months;
  const paybackMonths = cashflow > 0 ? Math.ceil(Math.max(0, cost - finalValue) / cashflow) : null;
  return {
    label,
    totalReturn,
    profit,
    roi,
    annualizedRoi,
    cashFlowKept,
    cashFlowReinvested,
    profitMultiple: endingMultiple,
    monthlyProfitAverage,
    paybackMonths,
    paybackLabel: paybackMonths === null ? "No recurring cash flow" : paybackMonths === 0 ? "Already covered" : `${Math.floor(paybackMonths / 12)}y ${paybackMonths % 12}m`
  };
}

function renderTip(values) {
  const summary = tipSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.tipAmount)}</td>
      <td>${money(scenario.total)}</td>
      <td>${money(scenario.perPerson)}</td>
      <td>${money(scenario.roundingAdjustment)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Tip", money(summary.tipAmount)],
      ["Tax", money(summary.taxAmount)],
      ["Service charge", money(summary.serviceAmount)],
      ["Total", money(summary.total)],
      ["Per person", money(summary.perPerson)],
      ["Effective tip", pct(summary.effectiveTipRate)]
    ])}
    <div class="result-grid">
      <div><span>Tip base</span><strong>${money(summary.tipBaseAmount)}</strong></div>
      <div><span>Rounding adjustment</span><strong>${money(summary.roundingAdjustment)}</strong></div>
      <div><span>People</span><strong>${summary.people.toLocaleString("en-US")}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Tip</th>
            <th>Total</th>
            <th>Per person</th>
            <th>Rounding</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="tip-scenarios.csv">Download tip scenarios CSV</a>
  `;
}

function tipSummary(values) {
  const bill = num(values.bill);
  const tipRate = Math.max(0, num(values.tip) / 100);
  const taxRate = Math.max(0, num(values.tax) / 100);
  const serviceRate = Math.max(0, num(values.service) / 100);
  const people = Math.max(1, Math.floor(num(values.people) || 1));
  if (bill < 0) return { error: "Bill amount cannot be negative." };

  const base = tipScenario("Selected", bill, tipRate, taxRate, serviceRate, people, values.rounding, values.tipBase);
  const scenarios = [0.15, 0.18, 0.2, 0.25].map((rate) => tipScenario(`${Math.round(rate * 100)}% tip`, bill, rate, taxRate, serviceRate, people, values.rounding, values.tipBase));
  const csvRows = [
    ["Scenario", "Tip", "Tax", "Service charge", "Total", "Per person", "Rounding adjustment"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.tipAmount,
      scenario.taxAmount,
      scenario.serviceAmount,
      scenario.total,
      scenario.perPerson,
      scenario.roundingAdjustment
    ])
  ];

  return {
    ...base,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function tipScenario(label, bill, tipRate, taxRate, serviceRate, people, rounding, tipBaseMode) {
  const taxAmount = bill * taxRate;
  const serviceAmount = bill * serviceRate;
  const tipBaseAmount = tipBaseMode === "postTax" ? bill + taxAmount : bill;
  const tipAmount = tipBaseAmount * tipRate;
  const rawTotal = bill + taxAmount + serviceAmount + tipAmount;
  const total = roundBill(rawTotal, rounding);
  const roundingAdjustment = total - rawTotal;
  return {
    label,
    bill,
    tipBaseAmount,
    tipAmount,
    taxAmount,
    serviceAmount,
    total,
    perPerson: total / people,
    people,
    roundingAdjustment,
    effectiveTipRate: bill ? tipAmount / bill : 0
  };
}

function roundBill(total, mode) {
  if (mode === "up") return Math.ceil(total);
  if (mode === "nearest") return Math.round(total);
  return total;
}

function renderInvoiceNumbers(values) {
  const summary = invoiceNumberSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const policyHref = `data:text/markdown;charset=utf-8,${encodeURIComponent(summary.policy)}`;
  const rows = summary.items.map((item) => `
    <tr>
      <td>${item.index}</td>
      <td>${escapeHtml(item.number)}</td>
      <td>${escapeHtml(item.nextNumber)}</td>
      <td>${escapeHtml(item.periodKey)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Current invoice", escapeHtml(summary.current)],
      ["Next invoice", escapeHtml(summary.next)],
      ["Generated count", summary.items.length.toLocaleString("en-US")],
      ["Pattern", escapeHtml(summary.pattern)],
      ["Date stamp", escapeHtml(summary.dateStamp || "-")],
      ["Sequence width", summary.padding],
      ["Reset policy", escapeHtml(summary.resetLabel)],
      ["Check digit", escapeHtml(summary.checksumLabel)]
    ])}
    <pre class="tool-output">${escapeHtml(summary.items.map((item) => item.number).join("\n"))}</pre>
    <button class="copy-button" type="button" data-copy="${escapeAttr(summary.current)}">Copy current invoice</button>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice number</th>
            <th>Next after this</th>
            <th>Period key</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="metadata-snippet">
      <span>Numbering policy</span>
      <pre>${escapeHtml(summary.policy)}</pre>
    </div>
    <div class="download-actions">
      <a class="download-button" href="${href}" download="invoice-numbers.csv">Download invoice numbers CSV</a>
      <a class="download-button secondary" href="${policyHref}" download="invoice-number-policy.md">Download policy notes</a>
    </div>
  `;
}

function invoiceNumberSummary(values, today = new Date()) {
  const separator = values.separator === "_" ? "_" : values.separator === "" ? "" : "-";
  const sequence = Math.max(0, Math.floor(num(values.sequence)));
  const padding = Math.min(12, Math.max(1, Math.floor(num(values.padding) || 4)));
  const count = Math.min(100, Math.max(1, Math.floor(num(values.count) || 1)));
  const dateStamp = invoiceDateStamp(values.dateFormat, today);
  const resetRule = ["never", "monthly", "yearly", "client"].includes(values.resetRule) ? values.resetRule : "never";
  const checksum = values.checksum === "mod10" ? "mod10" : "none";
  const prefix = slugPart(values.prefix);
  const client = slugPart(values.client);
  const parts = [prefix, client, dateStamp].filter(Boolean);
  const periodKey = invoicePeriodKey(resetRule, values.dateFormat, today, client);
  const items = Array.from({ length: count }, (_, index) => {
    const number = invoiceNumber(parts, sequence + index, padding, separator, checksum);
    return {
      index: index + 1,
      number,
      nextNumber: invoiceNumber(parts, sequence + index + 1, padding, separator, checksum),
      periodKey
    };
  });
  const csvRows = [
    ["Index", "Invoice number", "Next invoice number", "Period key", "Reset rule", "Check digit"],
    ...items.map((item) => [item.index, item.number, item.nextNumber, item.periodKey, resetRule, checksum])
  ];
  const pattern = [...parts, "#".repeat(padding), checksum === "mod10" ? "C" : ""].filter(Boolean).join(separator);
  const policy = invoicePolicyMarkdown({
    prefix,
    client,
    dateStamp,
    pattern,
    padding,
    resetRule,
    checksum,
    periodKey,
    current: items[0].number,
    next: items[0].nextNumber
  });

  return {
    current: items[0].number,
    next: items[0].nextNumber,
    items,
    padding,
    dateStamp,
    pattern,
    resetRule,
    resetLabel: invoiceResetLabel(resetRule),
    checksum,
    checksumLabel: checksum === "mod10" ? "Mod 10" : "None",
    policy,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function invoiceDateStamp(format, date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (format === "yyyymmdd") return `${year}${month}${day}`;
  if (format === "yyyy") return year;
  if (format === "none") return "";
  return `${year}${month}`;
}

function invoiceNumber(parts, sequence, padding, separator, checksum = "none") {
  const core = [...parts, String(sequence).padStart(padding, "0")].join(separator);
  if (checksum !== "mod10") return core;
  return [core, invoiceMod10(core)].join(separator);
}

function invoiceMod10(value) {
  const digits = String(value).replace(/\D/g, "");
  const sum = digits.split("").reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10);
}

function invoicePeriodKey(resetRule, dateFormat, date, client) {
  if (resetRule === "client") return client ? `client:${client}` : "client:default";
  if (resetRule === "monthly") return invoiceDateStamp("yyyymm", date);
  if (resetRule === "yearly") return invoiceDateStamp("yyyy", date);
  return dateFormat === "none" ? "continuous" : `continuous:${invoiceDateStamp(dateFormat, date)}`;
}

function invoiceResetLabel(resetRule) {
  return {
    never: "Continuous sequence",
    monthly: "Reset each month",
    yearly: "Reset each year",
    client: "Separate sequence per client"
  }[resetRule] || "Continuous sequence";
}

function invoicePolicyMarkdown(summary) {
  return [
    "# Invoice Numbering Policy",
    "",
    `- Pattern: \`${summary.pattern}\``,
    `- Current invoice: \`${summary.current}\``,
    `- Next invoice: \`${summary.next}\``,
    `- Period key: \`${summary.periodKey}\``,
    `- Reset rule: ${invoiceResetLabel(summary.resetRule)}`,
    `- Sequence padding: ${summary.padding} digits`,
    `- Check digit: ${summary.checksum === "mod10" ? "Mod 10" : "None"}`,
    `- Prefix: ${summary.prefix || "None"}`,
    `- Client code: ${summary.client || "None"}`,
    `- Date stamp: ${summary.dateStamp || "None"}`,
    "",
    "Operational notes:",
    "- Keep the next sequence number in one source of truth.",
    "- Do not reuse skipped or voided invoice numbers unless your accounting policy explicitly allows it.",
    "- Reset only at the period boundary described above.",
    "- Store the generated invoice number on the invoice record before sending it to the customer."
  ].join("\n");
}

function renderCompoundInterest(values) {
  const summary = compoundInterestSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.yearlyRows.map((row) => `
    <tr>
      <td>${row.year}</td>
      <td>${money(row.contributed)}</td>
      <td>${money(row.gain)}</td>
      <td>${money(row.balance)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Future value", money(summary.futureValue)],
      ["Total contributed", money(summary.totalContributed)],
      ["Estimated gain", money(summary.gain)],
      ["Return share", summary.futureValue ? pct(summary.gain / summary.futureValue) : "-"],
      ["Final monthly contribution", money(summary.finalMonthlyContribution)],
      ["Average monthly growth", money(summary.averageMonthlyGrowth)]
    ])}
    ${growthChartMarkup(summary.yearlyRows, {
      total: (row) => row.balance,
      base: (row) => row.contributed,
      label: (row) => row.year,
      title: (row) => `Year ${row.year}: balance ${money(row.balance)} (contributed ${money(row.contributed)}, gain ${money(row.gain)})`,
      legend: [["base", "Contributed"], ["gain", "Growth"]],
      aria: "Balance growth by year"
    })}
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Total contributed</th>
            <th>Estimated gain</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="compound-interest.csv">Download growth CSV</a>
  `;
}

function compoundInterestSummary(values) {
  const start = num(values.start);
  const monthly = num(values.monthly);
  const annualRate = num(values.rate);
  const years = num(values.years);
  const increase = num(values.increase) / 100;
  if (start < 0 || monthly < 0) return { error: "Initial amount and monthly contribution cannot be negative." };
  if (annualRate < -99) return { error: "Annual return is too low to calculate." };
  if (years <= 0) return { error: "Years must be positive." };
  if (increase < -0.99) return { error: "Contribution increase cannot reduce contributions below zero." };

  const months = Math.round(years * 12);
  const monthlyRate = annualRate / 100 / 12;
  let balance = start;
  let totalContributed = start;
  let currentMonthly = monthly;
  const yearlyRows = [];
  const csvRows = [["Year", "Total contributed", "Estimated gain", "Balance"]];

  for (let month = 1; month <= months; month += 1) {
    balance *= 1 + monthlyRate;
    balance += currentMonthly;
    totalContributed += currentMonthly;

    if (month % 12 === 0 || month === months) {
      const year = Math.ceil(month / 12);
      const gain = balance - totalContributed;
      const row = { year, contributed: totalContributed, gain, balance };
      yearlyRows.push(row);
      csvRows.push([year, totalContributed, gain, balance]);
      currentMonthly *= 1 + increase;
    }
  }

  const futureValue = balance;
  const gain = futureValue - totalContributed;
  return {
    futureValue,
    totalContributed,
    gain,
    finalMonthlyContribution: currentMonthly,
    averageMonthlyGrowth: gain / months,
    yearlyRows,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function renderRetirement(values) {
  const summary = retirementSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const scenarioRows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.projectedSavings)}</td>
      <td>${money(scenario.targetNestEgg)}</td>
      <td>${money(scenario.gap)}</td>
      <td>${scenario.status}</td>
    </tr>
  `).join("");
  const timelineRows = summary.timeline.map((row) => `
    <tr>
      <td>${row.age}</td>
      <td>${money(row.contributed)}</td>
      <td>${money(row.growth)}</td>
      <td>${money(row.balance)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Retirement status", summary.status],
      ["Projected savings", money(summary.projectedSavings)],
      ["Target nest egg", money(summary.targetNestEgg)],
      ["Projected gap", money(summary.gap)],
      ["Monthly needed", money(summary.monthlyNeeded)],
      ["Retirement income need", money(summary.futureIncomeNeed)]
    ])}
    <div class="result-grid">
      <div><span>Years to retirement</span><strong>${summary.years}</strong></div>
      <div><span>Inflation-adjusted income</span><strong>${money(summary.futureIncomeNeed)}</strong></div>
      <div><span>Covered by savings</span><strong>${money(summary.sustainableSavingsIncome)}</strong></div>
      <div><span>Other annual income</span><strong>${money(summary.futureOtherIncome)}</strong></div>
      <div><span>Final contribution</span><strong>${money(summary.monthly)}</strong></div>
      <div><span>Withdrawal rate</span><strong>${pct(summary.withdrawalRate)}</strong></div>
    </div>
    ${growthChartMarkup(summary.fullTimeline, {
      total: (row) => row.balance,
      base: (row) => row.contributed,
      label: (row) => row.age,
      title: (row) => `Age ${row.age}: balance ${money(row.balance)} (contributed ${money(row.contributed)}, growth ${money(row.growth)})`,
      legend: [["base", "Contributed"], ["gain", "Growth"]],
      aria: "Retirement savings by age"
    })}
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Scenario</th><th>Projected savings</th><th>Target</th><th>Gap</th><th>Status</th></tr></thead>
        <tbody>${scenarioRows}</tbody>
      </table>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Age</th><th>Contributed</th><th>Growth</th><th>Balance</th></tr></thead>
        <tbody>${timelineRows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="retirement-plan.csv">Download retirement CSV</a>
  `;
}

function retirementSummary(values) {
  const currentAge = Math.floor(num(values.currentAge));
  const retireAge = Math.floor(num(values.retireAge));
  const currentSavings = Math.max(0, num(values.currentSavings));
  const monthly = Math.max(0, num(values.monthly));
  const returnRate = num(values.returnRate);
  const inflation = num(values.inflation);
  const incomeNeed = Math.max(0, num(values.incomeNeed));
  const withdrawalRate = Math.max(0, num(values.withdrawalRate)) / 100;
  const otherIncome = Math.max(0, num(values.otherIncome));
  const years = retireAge - currentAge;

  if (currentAge <= 0 || retireAge <= 0) return { error: "Enter valid ages." };
  if (years <= 0) return { error: "Retirement age must be greater than current age." };
  if (returnRate < -99 || inflation < -99) return { error: "Rates are too low to calculate." };
  if (withdrawalRate <= 0 || withdrawalRate > 0.2) return { error: "Withdrawal rate should be between 0% and 20%." };

  const base = retirementProjection({ currentAge, retireAge, currentSavings, monthly, returnRate, inflation, incomeNeed, withdrawalRate, otherIncome, label: "Base plan" });
  const scenarios = [
    base,
    retirementProjection({ currentAge, retireAge, currentSavings, monthly: monthly * 1.25, returnRate, inflation, incomeNeed, withdrawalRate, otherIncome, label: "+25% contribution" }),
    retirementProjection({ currentAge, retireAge, currentSavings, monthly, returnRate: returnRate - 2, inflation, incomeNeed, withdrawalRate, otherIncome, label: "Return -2%" }),
    retirementProjection({ currentAge, retireAge, currentSavings, monthly, returnRate, inflation: inflation + 1, incomeNeed, withdrawalRate, otherIncome, label: "Inflation +1%" })
  ];
  const csvRows = [
    ["Age", "Contributed", "Growth", "Balance"],
    ...base.fullTimeline.map((row) => [row.age, row.contributed, row.growth, row.balance]),
    [],
    ["Scenario", "Projected savings", "Target nest egg", "Gap", "Status"],
    ...scenarios.map((scenario) => [scenario.label, scenario.projectedSavings, scenario.targetNestEgg, scenario.gap, scenario.status])
  ];
  return {
    ...base,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function retirementProjection({ currentAge, retireAge, currentSavings, monthly, returnRate, inflation, incomeNeed, withdrawalRate, otherIncome, label }) {
  const years = retireAge - currentAge;
  const months = years * 12;
  const monthlyRate = returnRate / 100 / 12;
  let balance = currentSavings;
  let contributed = currentSavings;
  const fullTimeline = [];
  const timeline = [];
  for (let month = 1; month <= months; month += 1) {
    balance *= 1 + monthlyRate;
    balance += monthly;
    contributed += monthly;
    if (month % 12 === 0 || month === months) {
      const age = currentAge + Math.ceil(month / 12);
      const row = { age, contributed, growth: balance - contributed, balance };
      fullTimeline.push(row);
      if (fullTimeline.length <= 5 || age === retireAge || age % 5 === 0) timeline.push(row);
    }
  }
  const inflationFactor = (1 + inflation / 100) ** years;
  const futureIncomeNeed = incomeNeed * inflationFactor;
  const futureOtherIncome = otherIncome * inflationFactor;
  const savingsIncomeNeed = Math.max(0, futureIncomeNeed - futureOtherIncome);
  const targetNestEgg = savingsIncomeNeed / withdrawalRate;
  const projectedSavings = balance;
  const gap = Math.max(0, targetNestEgg - projectedSavings);
  const status = gap <= 0 ? "On track" : "Needs more";
  const sustainableSavingsIncome = projectedSavings * withdrawalRate;
  const monthlyNeeded = gap <= 0 ? 0 : retirementRequiredMonthly(currentSavings, targetNestEgg, returnRate, months);
  return {
    label,
    years,
    monthly,
    withdrawalRate,
    projectedSavings,
    targetNestEgg,
    gap,
    status,
    futureIncomeNeed,
    futureOtherIncome,
    sustainableSavingsIncome,
    monthlyNeeded,
    timeline,
    fullTimeline
  };
}

function retirementRequiredMonthly(currentSavings, targetNestEgg, returnRate, months) {
  const monthlyRate = returnRate / 100 / 12;
  const currentFutureValue = currentSavings * ((1 + monthlyRate) ** months);
  const shortfall = Math.max(0, targetNestEgg - currentFutureValue);
  if (months <= 0) return shortfall;
  if (monthlyRate === 0) return shortfall / months;
  return shortfall / ((((1 + monthlyRate) ** months) - 1) / monthlyRate);
}

function renderSavingsGoal(values) {
  const summary = savingsGoalSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.timeline.map((row) => `
    <tr>
      <td>${row.month}</td>
      <td>${money(row.contributed)}</td>
      <td>${money(row.interest)}</td>
      <td>${money(row.balance)}</td>
      <td>${money(row.remaining)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Monthly needed", money(summary.monthlyNeeded)],
      ["Planned monthly", money(summary.monthly)],
      ["Monthly gap", money(summary.monthlyGap)],
      ["Projected balance", money(summary.projectedBalance)],
      ["Goal status", summary.status],
      ["Reach goal in", summary.reachLabel]
    ])}
    <div class="result-grid">
      <div><span>Remaining today</span><strong>${money(summary.remainingToday)}</strong></div>
      <div><span>Interest earned</span><strong>${money(summary.interestEarned)}</strong></div>
      <div><span>Total new savings</span><strong>${money(summary.totalNewSavings)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Contributed</th>
            <th>Interest</th>
            <th>Balance</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="savings-goal.csv">Download savings plan CSV</a>
  `;
}

function savingsGoalSummary(values) {
  const goal = num(values.goal);
  const current = num(values.current);
  const months = Math.max(1, Math.round(num(values.months)));
  const monthly = Math.max(0, num(values.monthly));
  const annualRate = num(values.rate);
  if (goal <= 0) return { error: "Savings goal must be positive." };
  if (current < 0) return { error: "Current savings cannot be negative." };
  if (annualRate < -99) return { error: "Annual interest is too low to calculate." };

  const monthlyRate = annualRate / 100 / 12;
  const remainingToday = Math.max(0, goal - current);
  const growthFactor = monthlyRate === 0 ? months : (((1 + monthlyRate) ** months) - 1) / monthlyRate;
  const currentFutureValue = current * ((1 + monthlyRate) ** months);
  const monthlyNeeded = Math.max(0, (goal - currentFutureValue) / growthFactor);
  const projected = savingsProjection(current, monthly, monthlyRate, months, goal);
  const reachProjection = savingsProjection(current, monthly, monthlyRate, 600, goal);
  const reachMonth = reachProjection.reachMonth || (current >= goal ? 0 : null);
  const timeline = projected.timeline.filter((row) => row.month <= 12 || row.month === months || row.month % 6 === 0);
  const csvRows = [
    ["Month", "Contributed", "Interest", "Balance", "Remaining"],
    ...projected.timeline.map((row) => [row.month, row.contributed, row.interest, row.balance, row.remaining])
  ];

  return {
    goal,
    current,
    monthly,
    monthlyNeeded,
    monthlyGap: Math.max(0, monthlyNeeded - monthly),
    projectedBalance: projected.balance,
    remainingToday,
    interestEarned: projected.interest,
    totalNewSavings: monthly * months,
    status: projected.balance >= goal ? "On track" : "Needs more",
    reachMonth,
    reachLabel: reachMonth === null ? "Not within 50y" : reachMonth === 0 ? "Already reached" : `${Math.floor(reachMonth / 12)}y ${reachMonth % 12}m`,
    timeline,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function savingsProjection(start, monthly, monthlyRate, months, goal) {
  let balance = start;
  let contributed = 0;
  let interest = 0;
  let reachMonth = start >= goal ? 0 : null;
  const timeline = [];
  for (let month = 1; month <= months; month += 1) {
    const earned = balance * monthlyRate;
    balance += earned + monthly;
    interest += earned;
    contributed += monthly;
    if (reachMonth === null && balance >= goal) reachMonth = month;
    timeline.push({
      month,
      contributed,
      interest,
      balance,
      remaining: Math.max(0, goal - balance)
    });
  }
  return { balance, contributed, interest, reachMonth, timeline };
}

function renderCreditCardPayoff(values) {
  const summary = creditCardPayoffSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.timelineRows.map((row) => `
    <tr>
      <td>${row.month}</td>
      <td>${money(row.payment)}</td>
      <td>${money(row.interest)}</td>
      <td>${money(row.principalPaid)}</td>
      <td>${money(row.balance)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Payoff time", summary.payoffLabel],
      ["Monthly payment now", money(summary.firstPayment)],
      ["Total interest", money(summary.totalInterest)],
      ["Total paid", money(summary.totalPaid)],
      ["Interest saved", money(summary.interestSaved)],
      ["Needed for target", money(summary.targetPayment)]
    ])}
    <div class="result-grid">
      <div><span>Minimum-only payoff</span><strong>${summary.minimumOnlyLabel}</strong></div>
      <div><span>Minimum-only interest</span><strong>${money(summary.minimumOnlyInterest)}</strong></div>
      <div><span>Months saved</span><strong>${summary.monthsSaved.toLocaleString("en-US")}</strong></div>
      <div><span>APR</span><strong>${pct(summary.apr / 100)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Payment</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="credit-card-payoff.csv">Download payoff CSV</a>
  `;
}

function creditCardPayoffSummary(values) {
  const balance = num(values.balance);
  const apr = num(values.apr);
  const minimumRate = Math.max(0, num(values.minimumRate)) / 100;
  const minimumFloor = Math.max(0, num(values.minimumFloor));
  const extra = Math.max(0, num(values.extra));
  const targetMonths = Math.max(1, Math.min(600, Math.round(num(values.targetMonths))));

  if (balance <= 0) return { error: "Enter a positive card balance." };
  if (apr < 0) return { error: "APR cannot be negative." };
  if (minimumRate <= 0 && minimumFloor <= 0) return { error: "Enter a minimum payment rate or floor." };

  const payoff = creditCardPayoffProjection(balance, apr, minimumRate, minimumFloor, extra);
  if (payoff.error) return payoff;
  const minimumOnly = creditCardPayoffProjection(balance, apr, minimumRate, minimumFloor, 0);
  if (minimumOnly.error) return minimumOnly;
  const targetPayment = creditCardFixedPayment(balance, apr, targetMonths);
  const timelineRows = payoff.rows.filter((row) => row.month <= 12 || row.balance <= 0.005 || row.month % 6 === 0);
  const csvRows = [
    ["Month", "Payment", "Interest", "Principal", "Balance"],
    ...payoff.rows.map((row) => [row.month, row.payment, row.interest, row.principalPaid, row.balance])
  ];

  return {
    balance,
    apr,
    firstPayment: payoff.firstPayment,
    totalInterest: payoff.totalInterest,
    totalPaid: payoff.totalPaid,
    payoffMonths: payoff.months,
    payoffLabel: payoff.label,
    minimumOnlyInterest: minimumOnly.totalInterest,
    minimumOnlyMonths: minimumOnly.months,
    minimumOnlyLabel: minimumOnly.label,
    interestSaved: Math.max(0, minimumOnly.totalInterest - payoff.totalInterest),
    monthsSaved: Math.max(0, minimumOnly.months - payoff.months),
    targetPayment,
    timelineRows,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function creditCardPayoffProjection(startBalance, apr, minimumRate, minimumFloor, extra) {
  const monthlyRate = apr / 100 / 12;
  let balance = startBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let firstPayment = 0;
  const rows = [];

  for (let month = 1; month <= 600 && balance > 0.005; month += 1) {
    const interest = balance * monthlyRate;
    const minimumPayment = Math.max(balance * minimumRate, minimumFloor, interest + minimumFloor);
    let payment = Math.min(balance + interest, minimumPayment + extra);
    const principalPaid = payment - interest;
    if (principalPaid <= 0.005) {
      return { error: "Payment is too low to reduce the card balance. Add more monthly payment or lower APR." };
    }
    if (!firstPayment) firstPayment = payment;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPaid += payment;
    rows.push({ month, payment, interest, principalPaid, balance });
  }

  if (balance > 0.005) return { error: "Payoff takes longer than 50 years with these inputs." };
  const months = rows.length;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return {
    rows,
    months,
    label: years ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`,
    firstPayment,
    totalInterest,
    totalPaid
  };
}

function creditCardFixedPayment(balance, apr, months) {
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return balance / months;
  return balance * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
}

function renderDebtPayoffPlanner(values) {
  const summary = debtPayoffSummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.primary.csv)}`;
  const rows = summary.primary.timelineRows.map((row) => `
    <tr>
      <td>${row.month}</td>
      <td>${money(row.payment)}</td>
      <td>${money(row.interest)}</td>
      <td>${money(row.principal)}</td>
      <td>${money(row.remainingBalance)}</td>
    </tr>
  `).join("");
  const payoffRows = summary.primary.payoffOrder.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.month}</td>
      <td>${money(item.interestPaid)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Primary strategy", summary.primary.label],
      ["Debt-free time", summary.primary.payoffLabel],
      ["Total interest", money(summary.primary.totalInterest)],
      ["Total paid", money(summary.primary.totalPaid)],
      ["Best strategy", summary.best.label],
      ["Interest difference", money(Math.abs(summary.interestDifference))]
    ])}
    <div class="result-grid">
      <div><span>Avalanche payoff</span><strong>${summary.avalanche.payoffLabel}</strong></div>
      <div><span>Avalanche interest</span><strong>${money(summary.avalanche.totalInterest)}</strong></div>
      <div><span>Snowball payoff</span><strong>${summary.snowball.payoffLabel}</strong></div>
      <div><span>Snowball interest</span><strong>${money(summary.snowball.totalInterest)}</strong></div>
      <div><span>Starting debt</span><strong>${money(summary.startingDebt)}</strong></div>
      <div><span>Monthly minimums</span><strong>${money(summary.monthlyMinimums)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Debt</th><th>Paid off month</th><th>Interest paid</th></tr></thead>
        <tbody>${payoffRows}</tbody>
      </table>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Payment</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Remaining balance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="debt-payoff-plan.csv">Download payoff CSV</a>
  `;
}

function debtPayoffSummary(values) {
  const debts = parseDebtList(values.debts);
  const extra = Math.max(0, num(values.extra));
  const strategy = values.strategy === "snowball" ? "snowball" : "avalanche";
  if (debts.error) return debts;
  const avalanche = debtPayoffProjection(debts, extra, "avalanche");
  const snowball = debtPayoffProjection(debts, extra, "snowball");
  if (avalanche.error) return avalanche;
  if (snowball.error) return snowball;
  const primary = strategy === "snowball" ? snowball : avalanche;
  const best = avalanche.totalInterest <= snowball.totalInterest ? avalanche : snowball;
  return {
    debts,
    startingDebt: debts.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyMinimums: debts.reduce((sum, debt) => sum + debt.minimum, 0),
    avalanche,
    snowball,
    primary,
    best,
    interestDifference: avalanche.totalInterest - snowball.totalInterest
  };
}

function parseDebtList(source) {
  const rows = parseCsv(String(source || "").trim());
  const debts = rows.map((row, index) => ({
    name: String(row[0] || `Debt ${index + 1}`).trim() || `Debt ${index + 1}`,
    balance: num(row[1]),
    apr: num(row[2]),
    minimum: num(row[3])
  })).filter((debt) => debt.balance > 0);
  if (!debts.length) return { error: "Enter at least one debt as name, balance, APR %, minimum payment." };
  if (debts.some((debt) => debt.apr < 0 || debt.minimum < 0)) return { error: "APR and minimum payments cannot be negative." };
  if (debts.some((debt) => debt.minimum <= 0)) return { error: "Each debt needs a positive minimum payment." };
  return debts;
}

function debtPayoffProjection(inputDebts, extraBudget, strategy) {
  const debts = inputDebts.map((debt, index) => ({ ...debt, index, balance: debt.balance, interestPaid: 0, paidOffMonth: null }));
  const label = strategy === "snowball" ? "Snowball" : "Avalanche";
  const timeline = [];
  const payoffOrder = [];
  let totalInterest = 0;
  let totalPaid = 0;

  for (let month = 1; month <= 600 && debts.some((debt) => debt.balance > 0.005); month += 1) {
    const active = debts.filter((debt) => debt.balance > 0.005);
    let paymentPool = extraBudget;
    let monthInterest = 0;
    let monthPayment = 0;
    let monthPrincipal = 0;

    for (const debt of active) {
      const interest = debt.balance * (debt.apr / 100 / 12);
      debt.balance += interest;
      debt.interestPaid += interest;
      monthInterest += interest;
      totalInterest += interest;
    }

    for (const debt of active) {
      const payment = Math.min(debt.balance, debt.minimum);
      debt.balance -= payment;
      monthPayment += payment;
      monthPrincipal += Math.max(0, payment - (debt.apr / 100 / 12) * Math.max(0, debt.balance));
      totalPaid += payment;
      if (debt.balance <= 0.005 && !debt.paidOffMonth) {
        debt.paidOffMonth = month;
        payoffOrder.push({ name: debt.name, month, interestPaid: debt.interestPaid });
      }
    }

    while (paymentPool > 0.005 && debts.some((debt) => debt.balance > 0.005)) {
      const target = debts
        .filter((debt) => debt.balance > 0.005)
        .sort((a, b) => strategy === "snowball" ? a.balance - b.balance : b.apr - a.apr || a.balance - b.balance)[0];
      const payment = Math.min(target.balance, paymentPool);
      target.balance -= payment;
      paymentPool -= payment;
      monthPayment += payment;
      monthPrincipal += payment;
      totalPaid += payment;
      if (target.balance <= 0.005 && !target.paidOffMonth) {
        target.paidOffMonth = month;
        payoffOrder.push({ name: target.name, month, interestPaid: target.interestPaid });
      }
    }

    const remainingBalance = debts.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
    timeline.push({ month, payment: monthPayment, interest: monthInterest, principal: Math.max(0, monthPayment - monthInterest), remainingBalance });
  }

  const remaining = debts.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
  if (remaining > 0.005) return { error: `${label} payoff takes longer than 50 years. Add more monthly payoff budget.` };
  const months = timeline.length;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const timelineRows = timeline.filter((row) => row.month <= 12 || row.remainingBalance <= 0.005 || row.month % 6 === 0);
  const csvRows = [
    ["Month", "Payment", "Interest", "Principal", "Remaining balance"],
    ...timeline.map((row) => [row.month, row.payment, row.interest, row.principal, row.remainingBalance])
  ];

  return {
    label,
    months,
    payoffLabel: years ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`,
    totalInterest,
    totalPaid,
    payoffOrder,
    timelineRows,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function renderLoanPayment(values) {
  const principal = num(values.principal);
  const annualRate = num(values.rate);
  const years = num(values.years);
  const extra = Math.max(0, num(values.extra));
  if (principal <= 0 || years <= 0) return error("Enter a positive loan amount and term.");
  if (annualRate < 0) return error("Interest rate cannot be negative.");

  try {
    const summary = loanAmortizationSummary(principal, annualRate, years, extra);
    const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
    const rows = summary.yearlyRows.map((row) => `
      <tr>
        <td>${row.year}</td>
        <td>${money(row.principalPaid)}</td>
        <td>${money(row.interestPaid)}</td>
        <td>${money(row.remainingBalance)}</td>
      </tr>
    `).join("");

    return `
      ${metrics([
        ["Monthly payment", money(summary.monthlyPayment)],
        ["Total interest", money(summary.totalInterest)],
        ["Total repayment", money(summary.totalPaid)],
        ["Payoff time", summary.payoffLabel],
        ["Interest share", pct(summary.totalInterest / summary.totalPaid)],
        ["Interest saved", summary.interestSaved > 0 ? money(summary.interestSaved) : "-"]
      ])}
      ${growthChartMarkup(summary.yearlyRows, {
        total: (row) => row.remainingBalance,
        label: (row) => row.year,
        title: (row) => `Year ${row.year}: remaining balance ${money(row.remainingBalance)}, interest paid ${money(row.interestPaid)}`,
        legend: [["gain", "Remaining balance"]],
        aria: "Remaining loan balance by year"
      })}
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Principal paid</th>
              <th>Interest paid</th>
              <th>Remaining balance</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <a class="download-button" href="${href}" download="loan-amortization.csv">Download amortization CSV</a>
    `;
  } catch (err) {
    return error(err.message);
  }
}

function loanAmortizationSummary(principal, annualRate, years, extra = 0) {
  const monthlyRate = annualRate / 100 / 12;
  const scheduledMonths = Math.round(years * 12);
  const monthlyPayment = monthlyRate === 0
    ? principal / scheduledMonths
    : principal * monthlyRate * ((1 + monthlyRate) ** scheduledMonths) / (((1 + monthlyRate) ** scheduledMonths) - 1);
  const baselineTotal = monthlyPayment * scheduledMonths;
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  const yearlyRows = [];
  const csvRows = [["Month", "Payment", "Principal", "Interest", "Remaining balance"]];

  for (let month = 1; month <= scheduledMonths && balance > 0.005; month += 1) {
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(balance, monthlyPayment + extra - interest);
    if (principalPayment <= 0) {
      throw new Error("Payment is too small to reduce the loan balance.");
    }
    const payment = principalPayment + interest;
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interest;
    totalPaid += payment;
    yearPrincipal += principalPayment;
    yearInterest += interest;
    csvRows.push([month, payment, principalPayment, interest, balance]);

    if (month % 12 === 0 || balance <= 0.005) {
      yearlyRows.push({
        year: Math.ceil(month / 12),
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remainingBalance: balance
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const payoffMonths = csvRows.length - 1;
  const payoffYears = Math.floor(payoffMonths / 12);
  const remainingMonths = payoffMonths % 12;
  const payoffLabel = payoffYears ? `${payoffYears}y ${remainingMonths}m` : `${remainingMonths}m`;

  return {
    monthlyPayment,
    totalInterest,
    totalPaid,
    payoffMonths,
    payoffLabel,
    interestSaved: Math.max(0, baselineTotal - principal - totalInterest),
    yearlyRows,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function renderMortgageAffordability(values) {
  const summary = mortgageAffordabilitySummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.homePrice)}</td>
      <td>${money(scenario.loanAmount)}</td>
      <td>${money(scenario.monthlyPiti)}</td>
      <td>${pct(scenario.totalDti)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Affordable home price", money(summary.homePrice)],
      ["Loan amount", money(summary.loanAmount)],
      ["Monthly PITI", money(summary.monthlyPiti)],
      ["Principal & interest", money(summary.principalInterest)],
      ["Total DTI", pct(summary.totalDti)],
      ["Cash to close", money(summary.cashToClose)]
    ])}
    <div class="result-grid">
      <div><span>Property tax / month</span><strong>${money(summary.monthlyTax)}</strong></div>
      <div><span>Insurance / month</span><strong>${money(summary.insurance)}</strong></div>
      <div><span>Remaining DTI room</span><strong>${money(summary.remainingRoom)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Home price</th>
            <th>Loan amount</th>
            <th>Monthly PITI</th>
            <th>Total DTI</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="mortgage-affordability.csv">Download affordability CSV</a>
  `;
}

function mortgageAffordabilitySummary(values) {
  const annualIncome = num(values.income);
  const monthlyDebt = Math.max(0, num(values.debt));
  const downPayment = Math.max(0, num(values.down));
  const annualRate = num(values.rate);
  const years = num(values.years);
  const taxRate = Math.max(0, num(values.taxRate)) / 100;
  const insurance = Math.max(0, num(values.insurance));
  const dti = num(values.dti) / 100;

  if (annualIncome <= 0) return { error: "Enter positive annual income." };
  if (annualRate < 0) return { error: "Interest rate cannot be negative." };
  if (years <= 0) return { error: "Loan term must be positive." };
  if (dti <= 0 || dti > 0.8) return { error: "Enter a total DTI between 1% and 80%." };

  const monthlyIncome = annualIncome / 12;
  const selected = mortgageScenario({
    label: "Selected",
    monthlyIncome,
    monthlyDebt,
    downPayment,
    annualRate,
    years,
    taxRate,
    insurance,
    dti
  });
  if (selected.error) return selected;

  const scenarios = [
    ["Conservative", 0.36],
    ["Standard", 0.43],
    ["Stretch", 0.5]
  ].map(([label, scenarioDti]) => mortgageScenario({
    label,
    monthlyIncome,
    monthlyDebt,
    downPayment,
    annualRate,
    years,
    taxRate,
    insurance,
    dti: scenarioDti
  })).filter((scenario) => !scenario.error);

  const csvRows = [
    ["Scenario", "Home price", "Loan amount", "Monthly PITI", "Principal and interest", "Property tax", "Insurance", "Total DTI"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.homePrice,
      scenario.loanAmount,
      scenario.monthlyPiti,
      scenario.principalInterest,
      scenario.monthlyTax,
      scenario.insurance,
      scenario.totalDti
    ])
  ];

  return {
    ...selected,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function renderRentVsBuy(values) {
  const summary = rentVsBuySummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.yearlyRows.map((row) => `
    <tr>
      <td>${row.year}</td>
      <td>${money(row.rentNetWorth)}</td>
      <td>${money(row.buyNetWorth)}</td>
      <td>${money(row.advantage)}</td>
      <td>${row.winner}</td>
    </tr>
  `).join("");
  const scenarioRows = summary.sensitivityRows.map((row) => `
    <tr>
      <td>${row.label}</td>
      <td>${money(row.rentNetWorth)}</td>
      <td>${money(row.buyNetWorth)}</td>
      <td>${money(row.netAdvantage)}</td>
      <td>${row.winner}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Better option", summary.winner],
      ["Net advantage", money(Math.abs(summary.netAdvantage))],
      ["Buy net worth", money(summary.buyNetWorth)],
      ["Rent net worth", money(summary.rentNetWorth)],
      ["Break-even year", summary.breakEvenYear ? `Year ${summary.breakEvenYear}` : "Not reached"],
      ["Break-even rent", summary.breakEvenRent ? money(summary.breakEvenRent) : "Not reached"]
    ])}
    <div class="result-grid">
      <div><span>Monthly mortgage</span><strong>${money(summary.monthlyMortgage)}</strong></div>
      <div><span>First-year owner cost</span><strong>${money(summary.firstYearOwnerMonthlyCost)}</strong></div>
      <div><span>Initial cash to buy</span><strong>${money(summary.initialBuyerCash)}</strong></div>
      <div><span>Final home value</span><strong>${money(summary.finalHomeValue)}</strong></div>
      <div><span>Remaining loan</span><strong>${money(summary.remainingLoan)}</strong></div>
      <div><span>Owner equity after selling</span><strong>${money(summary.ownerEquityAfterSale)}</strong></div>
      <div><span>Total rent paid</span><strong>${money(summary.totalRentPaid)}</strong></div>
      <div><span>Total owner cash cost</span><strong>${money(summary.totalOwnerCashCost)}</strong></div>
      <div><span>Investment account</span><strong>${money(summary.renterInvestment)}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Rent net worth</th>
            <th>Buy net worth</th>
            <th>Buy advantage</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>${scenarioRows}</tbody>
      </table>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Rent net worth</th>
            <th>Buy net worth</th>
            <th>Buy advantage</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="rent-vs-buy-scenarios.csv">Download rent vs buy CSV</a>
  `;
}

function rentVsBuySummary(values) {
  const homePrice = num(values.homePrice);
  const downPayment = Math.max(0, num(values.downPayment));
  const mortgageRate = num(values.mortgageRate) / 100;
  const loanTerm = Math.max(1, Math.min(50, Math.round(num(values.loanTerm) || 30)));
  const years = Math.max(1, Math.min(40, Math.round(num(values.years))));
  const startingRent = Math.max(0, num(values.rent));
  const rentGrowth = num(values.rentGrowth) / 100;
  const appreciation = num(values.appreciation) / 100;
  const investmentReturn = num(values.investmentReturn) / 100;
  const closingCost = Math.max(0, num(values.closingCost)) / 100;
  const propertyTax = Math.max(0, num(values.propertyTax)) / 100;
  const maintenance = Math.max(0, num(values.maintenance)) / 100;
  const insuranceMonthly = Math.max(0, num(values.insurance));
  const hoaMonthly = Math.max(0, num(values.hoa));
  const sellingCost = Math.max(0, num(values.sellingCost)) / 100;

  if (homePrice <= 0) return { error: "Enter a positive home price." };
  if (downPayment >= homePrice) return { error: "Down payment should be less than the home price for this comparison." };
  if (mortgageRate < 0) return { error: "Mortgage rate cannot be negative." };
  if (startingRent <= 0) return { error: "Enter positive monthly rent." };

  const inputs = {
    homePrice,
    downPayment,
    mortgageRate,
    loanTerm,
    years,
    startingRent,
    rentGrowth,
    appreciation,
    investmentReturn,
    closingCost,
    propertyTax,
    maintenance,
    insuranceMonthly,
    hoaMonthly,
    sellingCost
  };
  const base = rentVsBuyProjection(inputs);
  const sensitivityInputs = [
    ["Base case", {}],
    ["Rent +10%", { startingRent: startingRent * 1.1 }],
    ["Rent -10%", { startingRent: startingRent * 0.9 }],
    ["Appreciation +1%", { appreciation: appreciation + 0.01 }],
    ["Appreciation -1%", { appreciation: appreciation - 0.01 }],
    ["Mortgage rate +1%", { mortgageRate: mortgageRate + 0.01 }]
  ];
  const sensitivityRows = sensitivityInputs.map(([label, overrides]) => {
    const scenario = rentVsBuyProjection({ ...inputs, ...overrides });
    return {
      label,
      rentNetWorth: scenario.rentNetWorth,
      buyNetWorth: scenario.buyNetWorth,
      netAdvantage: scenario.netAdvantage,
      winner: scenario.winner
    };
  });
  const breakEvenRent = rentVsBuyBreakEvenRent(inputs);
  const csvRows = [
    ["Year", "Rent net worth", "Buy net worth", "Buy advantage", "Winner", "Home value", "Remaining loan", "Renter investment"],
    ...base.yearlyRows.map((row) => [row.year, row.rentNetWorth, row.buyNetWorth, row.advantage, row.winner, row.homeValue, row.remainingLoan, row.renterInvestment]),
    [],
    ["Scenario", "Rent net worth", "Buy net worth", "Buy advantage", "Winner"],
    ...sensitivityRows.map((row) => [row.label, row.rentNetWorth, row.buyNetWorth, row.netAdvantage, row.winner])
  ];

  return {
    ...base,
    breakEvenRent,
    sensitivityRows,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function rentVsBuyProjection(inputs) {
  const {
    homePrice,
    downPayment,
    mortgageRate,
    loanTerm,
    years,
    startingRent,
    rentGrowth,
    appreciation,
    investmentReturn,
    closingCost,
    propertyTax,
    maintenance,
    insuranceMonthly,
    hoaMonthly,
    sellingCost
  } = inputs;
  const loanAmount = homePrice - downPayment;
  const loanMonths = loanTerm * 12;
  const monthlyRate = mortgageRate / 12;
  const monthlyMortgage = monthlyRate === 0
    ? loanAmount / loanMonths
    : loanAmount * monthlyRate * ((1 + monthlyRate) ** loanMonths) / (((1 + monthlyRate) ** loanMonths) - 1);
  const closingCosts = homePrice * closingCost;
  const initialBuyerCash = downPayment + closingCosts;
  let balance = loanAmount;
  let rent = startingRent;
  let homeValue = homePrice;
  let renterInvestment = initialBuyerCash;
  let totalRentPaid = 0;
  let totalOwnerCashCost = initialBuyerCash;
  let breakEvenYear = null;
  let firstYearOwnerCost = 0;
  const yearlyRows = [];

  for (let year = 1; year <= years; year += 1) {
    let yearlyOwnerCost = 0;
    for (let month = 1; month <= 12; month += 1) {
      const interest = balance * monthlyRate;
      const mortgagePayment = balance > 0.005 ? Math.min(monthlyMortgage, balance + interest) : 0;
      const principal = Math.min(balance, Math.max(0, mortgagePayment - interest));
      balance = Math.max(0, balance - Math.max(0, principal));
      const ownerCost = mortgagePayment + (homeValue * propertyTax / 12) + (homeValue * maintenance / 12) + insuranceMonthly + hoaMonthly;
      yearlyOwnerCost += ownerCost;
      const monthlyDifference = ownerCost - rent;
      renterInvestment = renterInvestment * (1 + investmentReturn / 12) + Math.max(0, monthlyDifference);
      totalOwnerCashCost += ownerCost;
      totalRentPaid += rent;
      rent *= (1 + rentGrowth / 12);
    }
    if (year === 1) firstYearOwnerCost = yearlyOwnerCost;
    homeValue *= (1 + appreciation);
    const sellingFees = homeValue * sellingCost;
    const ownerEquityAfterSale = Math.max(0, homeValue - balance - sellingFees);
    const rentNetWorth = renterInvestment;
    const buyNetWorth = ownerEquityAfterSale;
    const advantage = buyNetWorth - rentNetWorth;
    const winner = advantage >= 0 ? "Buy" : "Rent";
    if (!breakEvenYear && advantage >= 0) breakEvenYear = year;
    const row = { year, rentNetWorth, buyNetWorth, advantage, winner, homeValue, remainingLoan: balance, renterInvestment };
    yearlyRows.push(row);
  }

  const last = yearlyRows[yearlyRows.length - 1];
  const finalHomeValue = last.homeValue;
  const remainingLoan = last.remainingLoan;
  const ownerEquityAfterSale = last.buyNetWorth;
  const rentNetWorth = last.rentNetWorth;
  const buyNetWorth = last.buyNetWorth;
  const netAdvantage = buyNetWorth - rentNetWorth;

  return {
    monthlyMortgage,
    initialBuyerCash,
    closingCosts,
    firstYearOwnerMonthlyCost: firstYearOwnerCost / 12,
    finalHomeValue,
    remainingLoan,
    ownerEquityAfterSale,
    totalRentPaid,
    totalOwnerCashCost,
    renterInvestment,
    rentNetWorth,
    buyNetWorth,
    netAdvantage,
    winner: netAdvantage >= 0 ? "Buy" : "Rent",
    breakEvenYear,
    yearlyRows
  };
}

function rentVsBuyBreakEvenRent(inputs) {
  let low = 0;
  let high = Math.max(inputs.startingRent * 3, inputs.homePrice / 100);
  let highProjection = rentVsBuyProjection({ ...inputs, startingRent: high });
  for (let attempts = 0; attempts < 20 && highProjection.netAdvantage < 0; attempts += 1) {
    high *= 1.5;
    highProjection = rentVsBuyProjection({ ...inputs, startingRent: high });
  }
  if (highProjection.netAdvantage < 0) return null;

  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    const projection = rentVsBuyProjection({ ...inputs, startingRent: mid });
    if (projection.netAdvantage >= 0) high = mid;
    else low = mid;
  }
  return high;
}

function renderTakeHomePay(values) {
  const summary = takeHomePaySummary(values);
  if (summary.error) return error(summary.error);
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(summary.csv)}`;
  const rows = summary.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money(scenario.grossAnnual)}</td>
      <td>${money(scenario.netAnnual)}</td>
      <td>${money(scenario.netPerPaycheck)}</td>
      <td>${pct(scenario.effectiveTakeHomeRate)}</td>
    </tr>
  `).join("");

  return `
    ${metrics([
      ["Net per paycheck", money(summary.netPerPaycheck)],
      ["Monthly net pay", money(summary.monthlyNet)],
      ["Annual net pay", money(summary.netAnnual)],
      ["Annual taxes", money(summary.totalTax)],
      ["Pre-tax deductions", money(summary.preTaxAnnual)],
      ["Take-home rate", pct(summary.effectiveTakeHomeRate)]
    ])}
    <div class="result-grid">
      <div><span>Gross per paycheck</span><strong>${money(summary.grossPerPaycheck)}</strong></div>
      <div><span>Federal tax estimate</span><strong>${money(summary.federalTax)}</strong></div>
      <div><span>State/local tax estimate</span><strong>${money(summary.stateTax)}</strong></div>
      <div><span>Payroll tax estimate</span><strong>${money(summary.payrollTax)}</strong></div>
      <div><span>Post-tax deductions</span><strong>${money(summary.postTaxAnnual)}</strong></div>
      <div><span>Paychecks per year</span><strong>${summary.payPeriods}</strong></div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Gross annual</th>
            <th>Net annual</th>
            <th>Net paycheck</th>
            <th>Take-home rate</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <a class="download-button" href="${href}" download="take-home-pay-scenarios.csv">Download paycheck CSV</a>
  `;
}

function takeHomePaySummary(values) {
  const salary = num(values.salary);
  const frequency = values.frequency || "biweekly";
  const federalRate = Math.max(0, num(values.federal)) / 100;
  const stateRate = Math.max(0, num(values.state)) / 100;
  const payrollRate = Math.max(0, num(values.fica)) / 100;
  const retirementRate = Math.max(0, num(values.retirement)) / 100;
  const healthMonthly = Math.max(0, num(values.health));
  const postTaxMonthly = Math.max(0, num(values.postTax));
  const periodMap = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 };
  const payPeriods = periodMap[frequency] || 26;

  if (salary <= 0) return { error: "Enter positive annual gross pay." };
  if (federalRate + stateRate + payrollRate > 0.8) return { error: "Tax estimates look too high. Keep combined tax estimates below 80%." };
  if (retirementRate > 0.75) return { error: "Pre-tax retirement estimate should be below 75%." };

  const calculateScenario = (label, grossAnnual, retirementOverride = retirementRate) => {
    const retirementAnnual = grossAnnual * retirementOverride;
    const healthAnnual = healthMonthly * 12;
    const preTaxAnnual = Math.min(grossAnnual, retirementAnnual + healthAnnual);
    const taxableAnnual = Math.max(0, grossAnnual - preTaxAnnual);
    const federalTax = taxableAnnual * federalRate;
    const stateTax = taxableAnnual * stateRate;
    const payrollTax = Math.max(0, grossAnnual - retirementAnnual) * payrollRate;
    const postTaxAnnual = postTaxMonthly * 12;
    const totalTax = federalTax + stateTax + payrollTax;
    const netAnnual = Math.max(0, grossAnnual - preTaxAnnual - totalTax - postTaxAnnual);
    return {
      label,
      grossAnnual,
      retirementAnnual,
      healthAnnual,
      preTaxAnnual,
      taxableAnnual,
      federalTax,
      stateTax,
      payrollTax,
      postTaxAnnual,
      totalTax,
      netAnnual,
      netPerPaycheck: netAnnual / payPeriods,
      grossPerPaycheck: grossAnnual / payPeriods,
      monthlyNet: netAnnual / 12,
      effectiveTakeHomeRate: grossAnnual > 0 ? netAnnual / grossAnnual : 0
    };
  };

  const selected = calculateScenario("Selected", salary);
  const scenarios = [
    selected,
    calculateScenario("5% raise", salary * 1.05),
    calculateScenario("10% raise", salary * 1.1),
    calculateScenario("+1% retirement", salary, Math.min(0.75, retirementRate + 0.01))
  ];
  const csvRows = [
    ["Scenario", "Gross annual", "Gross paycheck", "Pre-tax deductions", "Taxable annual", "Federal tax", "State local tax", "Payroll tax", "Post-tax deductions", "Net annual", "Net paycheck", "Take-home rate"],
    ...scenarios.map((scenario) => [
      scenario.label,
      scenario.grossAnnual,
      scenario.grossPerPaycheck,
      scenario.preTaxAnnual,
      scenario.taxableAnnual,
      scenario.federalTax,
      scenario.stateTax,
      scenario.payrollTax,
      scenario.postTaxAnnual,
      scenario.netAnnual,
      scenario.netPerPaycheck,
      scenario.effectiveTakeHomeRate
    ])
  ];

  return {
    ...selected,
    payPeriods,
    scenarios,
    csv: csvRows.map((row) => row.map(csvEscape).join(",")).join("\n")
  };
}

function mortgageScenario({ label, monthlyIncome, monthlyDebt, downPayment, annualRate, years, taxRate, insurance, dti }) {
  const maxTotalDebt = monthlyIncome * dti;
  const maxHousingPayment = maxTotalDebt - monthlyDebt;
  if (maxHousingPayment <= insurance) {
    return { error: "Existing debt leaves no room for a mortgage payment at this DTI." };
  }
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  const paymentFactor = monthlyRate === 0
    ? 1 / months
    : monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
  const taxFactor = taxRate / 12;
  const loanAmount = Math.max(0, (maxHousingPayment - insurance - downPayment * taxFactor) / (paymentFactor + taxFactor));
  const homePrice = loanAmount + downPayment;
  const principalInterest = loanAmount * paymentFactor;
  const monthlyTax = homePrice * taxFactor;
  const monthlyPiti = principalInterest + monthlyTax + insurance;
  const totalDti = (monthlyPiti + monthlyDebt) / monthlyIncome;

  return {
    label,
    homePrice,
    loanAmount,
    principalInterest,
    monthlyTax,
    insurance,
    monthlyPiti,
    totalDti,
    cashToClose: downPayment + homePrice * 0.03,
    remainingRoom: Math.max(0, maxTotalDebt - monthlyDebt - monthlyPiti)
  };
}

function output(value) {
  return `<pre class="tool-output">${escapeHtml(value)}</pre><button class="copy-button" type="button" data-copy="${escapeAttr(value)}">Copy result</button>`;
}

function error(message) {
  return `<p class="tool-error">${escapeHtml(message)}</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, "&#10;");
}

function renderRegexResult(pattern, flags, text) {
  try {
    const safeFlags = String(flags || "");
    const regex = new RegExp(pattern, safeFlags.includes("g") ? safeFlags : `${safeFlags}g`);
    const sourceText = String(text || "");
    const matches = collectRegexMatches(regex, sourceText);
    const highlighted = highlightRegexMatches(sourceText, matches);
    const report = JSON.stringify(matches.map((match) => ({
      match: match.text,
      index: match.index,
      groups: match.groups
    })), null, 2);
    const href = `data:application/json;charset=utf-8,${encodeURIComponent(report)}`;

    return `
      ${metrics([
        ["Matches", matches.length],
        ["First match", matches[0]?.text || "-"],
        ["Flags", regex.flags || "-"],
        ["Pattern length", String(pattern || "").length],
        ["Text length", sourceText.length],
        ["Groups", Math.max(0, ...matches.map((match) => match.groups.length))]
      ])}
      <div class="regex-preview">${highlighted || "<span class=\"muted-inline\">No text to test.</span>"}</div>
      <div class="match-list">
        ${matches.length ? matches.map((match, index) => `
          <div class="match-row">
            <span>#${index + 1}</span>
            <code>${escapeHtml(match.text)}</code>
            <small>index ${match.index}${match.groups.length ? ` · groups: ${match.groups.map((group) => escapeHtml(group || "")).join(", ")}` : ""}</small>
          </div>
        `).join("") : `<div class="upload-empty">No matches found.</div>`}
      </div>
      <a class="download-button" href="${href}" download="regex-matches.json">Download matches</a>
    `;
  } catch (err) {
    return error(err.message);
  }
}

function collectRegexMatches(regex, text) {
  const matches = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      index: match.index,
      groups: match.slice(1)
    });
    if (match[0] === "") regex.lastIndex += 1;
  }
  return matches;
}

function highlightRegexMatches(text, matches) {
  if (!matches.length) {
    return `<span>${escapeHtml(text)}</span>`;
  }
  let cursor = 0;
  return matches.map((match) => {
    const before = escapeHtml(text.slice(cursor, match.index));
    const highlighted = `<mark>${escapeHtml(match.text || " ")}</mark>`;
    cursor = match.index + match.text.length;
    return `${before}${highlighted}`;
  }).join("") + escapeHtml(text.slice(cursor));
}

function renderMarkdownPreview(markdown) {
  const source = String(markdown || "");
  const html = markdownToHtml(source);
  const stats = markdownStats(source, html);
  const href = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  return `
    ${metrics([
      ["Words", stats.words],
      ["Headings", stats.headings],
      ["Links", stats.links],
      ["Lists", stats.lists],
      ["Code blocks", stats.codeBlocks],
      ["HTML size", formatBytes(new Blob([html]).size)]
    ])}
    <div class="markdown-preview" aria-label="Markdown preview">${html || "<p>No preview content.</p>"}</div>
    <pre class="tool-output">${escapeHtml(html)}</pre>
    <a class="download-button" href="${href}" download="preview.html">Download HTML</a>
  `;
}

function passwordResultMarkup(password, poolSize) {
  const analysis = analyzePassword(password, poolSize);
  return `
    ${metrics([
      ["Password", "Generated"],
      ["Length", password.length],
      ["Entropy", `${analysis.entropy} bits`],
      ["Strength", analysis.label],
      ["Character sets", `${analysis.variety}/4`],
      ["Warnings", analysis.warnings.length || "None"]
    ])}
    ${output(password)}
    ${passwordWarningsMarkup(analysis.warnings)}
  `;
}

function passwordStrengthColor(score) {
  if (score < 40) return "var(--danger)";
  if (score < 70) return "var(--warning)";
  return "var(--accent)";
}

function passwordStrengthMeter(analysis) {
  return `
    <div class="strength-meter" role="img" aria-label="Password strength ${escapeAttr(analysis.label)}">
      <div class="strength-meter-head"><span>Strength</span><strong>${analysis.label}</strong></div>
      <div class="strength-meter-track"><div class="strength-meter-fill" style="width:${analysis.score}%; background:${passwordStrengthColor(analysis.score)}"></div></div>
    </div>
  `;
}

function passwordStrengthMarkup(password) {
  const analysis = analyzePassword(password);
  return `
    ${passwordStrengthMeter(analysis)}
    ${metrics([
      ["Score", analysis.score],
      ["Strength", analysis.label],
      ["Entropy", `${analysis.entropy} bits`],
      ["Length", password.length],
      ["Character sets", `${analysis.variety}/4`],
      ["Warnings", analysis.warnings.length || "None"]
    ])}
    ${passwordWarningsMarkup(analysis.warnings)}
  `;
}

function analyzePassword(password, explicitPoolSize = 0) {
  const text = String(password || "");
  const sets = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /\d/, size: 10 },
    { regex: /[^a-zA-Z0-9]/, size: 32 }
  ];
  const activeSets = sets.filter((set) => set.regex.test(text));
  const poolSize = explicitPoolSize || activeSets.reduce((sum, set) => sum + set.size, 0) || 1;
  const entropy = text.length ? Math.round(text.length * Math.log2(poolSize)) : 0;
  const warnings = passwordWarnings(text, activeSets);
  const score = Math.max(0, Math.min(100, Math.round(entropy * 1.15) - warnings.length * 12));
  const label = score < 40 ? "Weak" : score < 70 ? "Fair" : score < 90 ? "Strong" : "Very strong";
  return { entropy, score, label, variety: activeSets.length, warnings };
}

function passwordWarnings(password, activeSets) {
  const text = String(password || "");
  const lower = text.toLowerCase();
  const warnings = [];
  if (text.length < 12) warnings.push("Use at least 12 characters.");
  if (activeSets.length < 3) warnings.push("Use a mix of letters, numbers, and symbols.");
  if (/(.)\1{2,}/.test(text)) warnings.push("Avoid repeated characters.");
  if (/0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv/.test(lower)) warnings.push("Avoid keyboard or number sequences.");
  if (/password|admin|welcome|letmein|qwerty|iloveyou/.test(lower)) warnings.push("Avoid common password words.");
  return warnings;
}

function passwordWarningsMarkup(warnings) {
  if (!warnings.length) {
    return `<div class="security-note">No common weaknesses detected.</div>`;
  }
  return `
    <div class="security-note security-warning">
      <strong>Warnings</strong>
      <ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderJwtDecode(token) {
  try {
    const decoded = decodeJwt(token);
    const payload = decoded.payload;
    const combined = JSON.stringify({ header: decoded.header, payload }, null, 2);
    const href = `data:application/json;charset=utf-8,${encodeURIComponent(combined)}`;
    return `
      ${metrics([
        ["Algorithm", decoded.header.alg || "-"],
        ["Type", decoded.header.typ || "JWT"],
        ["Subject", payload.sub || "-"],
        ["Issuer", payload.iss || "-"],
        ["Audience", Array.isArray(payload.aud) ? payload.aud.join(", ") : payload.aud || "-"],
        ["Expiry", jwtExpiryBadge(payload)]
      ])}
      <div class="security-note security-warning">
        This decoder does not verify the signature. Use it for inspection only.
      </div>
      <div class="jwt-panels">
        <section>
          <h3>Header</h3>
          <pre class="tool-output">${escapeHtml(JSON.stringify(decoded.header, null, 2))}</pre>
        </section>
        <section>
          <h3>Payload</h3>
          <pre class="tool-output">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
        </section>
      </div>
      ${jwtClaimTimeline(payload)}
      <a class="download-button" href="${href}" download="decoded-jwt.json">Download decoded JWT</a>
    `;
  } catch (err) {
    return error(err.message);
  }
}

function decodeJwt(token) {
  const parts = String(token || "").trim().split(".");
  if (parts.length < 2) {
    throw new Error("Enter a JWT with header and payload.");
  }
  return {
    header: decodeJwtPart(parts[0]),
    payload: decodeJwtPart(parts[1]),
    hasSignature: Boolean(parts[2])
  };
}

function decodeJwtPart(part) {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function jwtExpiryBadge(payload) {
  if (!payload.exp) return "-";
  const date = new Date(Number(payload.exp) * 1000);
  if (Number.isNaN(date.getTime())) return "Invalid";
  const diffMs = date.getTime() - Date.now();
  const expired = diffMs < 0;
  const abs = Math.abs(diffMs);
  const span = abs >= 86400000
    ? `${Math.round(abs / 86400000)}d`
    : abs >= 3600000
      ? `${Math.round(abs / 3600000)}h`
      : `${Math.max(1, Math.round(abs / 60000))}m`;
  return `<span class="status-badge ${expired ? "is-bad" : "is-good"}">${expired ? "EXPIRED" : "VALID"}</span> ${expired ? `${span} ago` : `${span} left`}`;
}

function jwtTimeStatus(value, label) {
  if (!value) {
    return "-";
  }
  const date = new Date(Number(value) * 1000);
  if (Number.isNaN(date.getTime())) {
    return "Invalid";
  }
  const now = Date.now();
  const diffMinutes = Math.round((date.getTime() - now) / 60000);
  const status = diffMinutes < 0 ? "expired" : "valid";
  return `${status} · ${date.toISOString()}`;
}

function jwtClaimTimeline(payload) {
  const items = [
    ["Issued at", payload.iat],
    ["Not before", payload.nbf],
    ["Expires", payload.exp]
  ].filter(([, value]) => value);
  if (!items.length) {
    return "";
  }
  return `
    <div class="result-grid">
      ${items.map(([label, value]) => {
        const date = new Date(Number(value) * 1000);
        return `<div><span>${label}</span><strong>${Number.isNaN(date.getTime()) ? "Invalid" : date.toISOString()}</strong></div>`;
      }).join("")}
    </div>
  `;
}

function renderCronExpression(values) {
  const expression = cronExpressionFromValues(values);
  const parsed = parseCronExpression(expression);
  if (parsed.error) {
    return error(parsed.error);
  }

  const previewCount = Math.min(24, Math.max(1, Math.floor(num(values.previewCount) || 8)));
  const nextRuns = cronNextRuns(parsed, previewCount);
  const csv = [
    ["run", "local_time", "iso_time"],
    ...nextRuns.map((date, index) => [index + 1, cronDateLabel(date), date.toISOString()])
  ].map((row) => row.map(csvEscape).join(",")).join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return `
    ${metrics([
      ["Expression", `<code>${escapeHtml(expression)}</code>`],
      ["Summary", cronHumanDescription(parsed.parts)],
      ["Preview window", nextRuns.length ? `${nextRuns.length} runs` : "No run found in scan window"],
      ["Timezone", "Browser local time"]
    ])}
    <pre class="tool-output">${escapeHtml(expression)}</pre>
    <button class="copy-button" type="button" data-copy="${escapeAttr(expression)}">Copy cron expression</button>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Next run</th><th>ISO time</th></tr>
        </thead>
        <tbody>
          ${nextRuns.map((date, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(cronDateLabel(date))}</td>
              <td><code>${date.toISOString()}</code></td>
            </tr>
          `).join("") || `<tr><td colspan="3">No matching run was found in the next 366 days.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="security-note">
      Standard 5-field cron is shown in browser local time. Some hosts use UTC or add seconds/year fields, so confirm your scheduler's timezone before deployment.
    </div>
    <a class="download-button" href="${csvHref}" download="cron-next-runs.csv">Download next runs CSV</a>
  `;
}

function cronExpressionFromValues(values) {
  if (values.schedule === "custom") {
    return String(values.customExpression || "").trim();
  }
  const minute = clampInt(values.minute, 0, 59);
  const hour = clampInt(values.hour, 0, 23);
  const dayOfMonth = clampInt(values.dayOfMonth, 1, 31);
  const weekday = clampInt(values.weekday, 0, 6);
  const presets = {
    five: "*/5 * * * *",
    hourly: `${minute} * * * *`,
    daily: `${minute} ${hour} * * *`,
    weekday: `${minute} ${hour} * * 1-5`,
    weekly: `${minute} ${hour} * * ${weekday}`,
    monthly: `${minute} ${hour} ${dayOfMonth} * *`
  };
  return presets[values.schedule] || presets.daily;
}

function clampInt(value, min, max) {
  const parsed = Math.floor(num(value));
  return Math.min(max, Math.max(min, parsed));
}

function parseCronExpression(expression) {
  const parts = String(expression || "").trim().split(/\s+/);
  if (parts.length !== 5) {
    return { error: "Enter a standard 5-field cron expression: minute hour day-of-month month weekday." };
  }
  const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
  const labels = ["minute", "hour", "day-of-month", "month", "weekday"];
  const allowed = [];
  for (let index = 0; index < parts.length; index += 1) {
    const parsed = cronAllowedValues(parts[index], ranges[index][0], ranges[index][1], labels[index]);
    if (parsed.error) return parsed;
    allowed.push(parsed.values);
  }
  return { parts, allowed };
}

function cronAllowedValues(part, min, max, label) {
  const raw = String(part || "").trim();
  if (!raw) return { error: `Cron ${label} field is empty.` };
  const values = new Set();
  const addValue = (value) => {
    const normalized = label === "weekday" && value === 7 ? 0 : value;
    if (normalized < min || normalized > max || !Number.isInteger(normalized)) {
      return false;
    }
    values.add(normalized);
    return true;
  };

  for (const chunk of raw.split(",")) {
    const stepMatch = chunk.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    const rangeMatch = chunk.match(/^(\d+)-(\d+)$/);
    const numberMatch = chunk.match(/^\d+$/);
    if (chunk === "*") {
      for (let value = min; value <= max; value += 1) addValue(value);
    } else if (stepMatch) {
      const step = Number(stepMatch[2]);
      if (step < 1) return { error: `Cron ${label} step must be at least 1.` };
      const [start, end] = stepMatch[1] === "*"
        ? [min, max]
        : stepMatch[1].split("-").map((item) => Number(item));
      if (start > end) return { error: `Cron ${label} range must start before it ends.` };
      for (let value = start; value <= end; value += step) {
        if (!addValue(value)) return { error: `Cron ${label} value ${value} is outside ${min}-${max}.` };
      }
    } else if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start > end) return { error: `Cron ${label} range must start before it ends.` };
      for (let value = start; value <= end; value += 1) {
        if (!addValue(value)) return { error: `Cron ${label} value ${value} is outside ${min}-${max}.` };
      }
    } else if (numberMatch) {
      const value = Number(chunk);
      if (!addValue(value)) return { error: `Cron ${label} value ${value} is outside ${min}-${max}.` };
    } else {
      return { error: `Cron ${label} field supports *, numbers, ranges, lists, and steps.` };
    }
  }
  return { values };
}

function cronNextRuns(parsed, count) {
  const runs = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const maxMinutes = 366 * 24 * 60;
  for (let offset = 0; offset < maxMinutes && runs.length < count; offset += 1) {
    if (cronMatches(cursor, parsed.allowed)) {
      runs.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return runs;
}

function cronMatches(date, allowed) {
  const weekday = date.getDay();
  const values = [
    date.getMinutes(),
    date.getHours(),
    date.getDate(),
    date.getMonth() + 1,
    weekday
  ];
  return allowed.every((set, index) => set.has(values[index]));
}

function cronHumanDescription(parts) {
  return [
    cronPartDescription(parts[0], "minute"),
    cronPartDescription(parts[1], "hour"),
    cronPartDescription(parts[2], "day"),
    cronPartDescription(parts[3], "month"),
    cronPartDescription(parts[4], "weekday")
  ].join(" · ");
}

function cronPartDescription(part, label) {
  if (part === "*") return `every ${label}`;
  if (/^\*\/\d+$/.test(part)) return `every ${part.slice(2)} ${label}s`;
  if (/^\d+$/.test(part)) return `${label} ${part}`;
  if (/^\d+-\d+$/.test(part)) return `${label}s ${part}`;
  return `${label}s ${part}`;
}

function cronDateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const list = line.match(/^\s*[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      listItems.push(list[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function markdownStats(source, html) {
  const words = source.trim() ? source.trim().split(/\s+/).length : 0;
  return {
    words,
    headings: (source.match(/^#{1,3}\s+/gm) || []).length,
    links: (source.match(/\[[^\]]+\]\(https?:\/\/[^)\s]+\)/g) || []).length,
    lists: (source.match(/^\s*[-*]\s+/gm) || []).length,
    codeBlocks: (source.match(/```/g) || []).length / 2 | 0,
    htmlLength: html.length
  };
}

function renderTextDiff(leftText, rightText) {
  const left = leftText.split(/\r?\n/);
  const right = rightText.split(/\r?\n/);
  const operations = lineDiff(left, right);
  const added = operations.filter((item) => item.type === "added").length;
  const removed = operations.filter((item) => item.type === "removed").length;
  const unchanged = operations.filter((item) => item.type === "same").length;
  const patch = operations.map((item) => {
    const prefix = item.type === "added" ? "+" : item.type === "removed" ? "-" : " ";
    return `${prefix} ${item.text}`;
  }).join("\n");
  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(patch)}`;

  return `
    ${metrics([
      ["Added", added],
      ["Removed", removed],
      ["Unchanged", unchanged],
      ["Original lines", left.length],
      ["New lines", right.length],
      ["Total rows", operations.length]
    ])}
    <div class="diff-columns">
      <div class="diff-column">
        <h3>Original</h3>
        <div class="diff-view" aria-label="Original text">
          ${diffPairs(operations).map(([leftItem]) => leftItem
            ? `<div class="diff-row diff-${leftItem.type === "removed" ? "removed" : "same"}"><span>${leftItem.type === "removed" ? "-" : " "}</span><code>${escapeHtml(leftItem.text || " ")}</code></div>`
            : `<div class="diff-row diff-filler"><span> </span><code> </code></div>`).join("")}
        </div>
      </div>
      <div class="diff-column">
        <h3>Changed</h3>
        <div class="diff-view" aria-label="Changed text">
          ${diffPairs(operations).map(([, rightItem]) => rightItem
            ? `<div class="diff-row diff-${rightItem.type === "added" ? "added" : "same"}"><span>${rightItem.type === "added" ? "+" : " "}</span><code>${escapeHtml(rightItem.text || " ")}</code></div>`
            : `<div class="diff-row diff-filler"><span> </span><code> </code></div>`).join("")}
        </div>
      </div>
    </div>
    <a class="download-button" href="${href}" download="text-diff.patch">Download diff</a>
  `;
}

function diffPairs(operations) {
  const pairs = [];
  let index = 0;
  while (index < operations.length) {
    const item = operations[index];
    if (item.type === "same") {
      pairs.push([item, item]);
      index += 1;
      continue;
    }
    // Pair consecutive removed/added runs so changed lines sit side by side
    const removedRun = [];
    const addedRun = [];
    while (index < operations.length && operations[index].type === "removed") {
      removedRun.push(operations[index]);
      index += 1;
    }
    while (index < operations.length && operations[index].type === "added") {
      addedRun.push(operations[index]);
      index += 1;
    }
    const length = Math.max(removedRun.length, addedRun.length);
    for (let offset = 0; offset < length; offset += 1) {
      pairs.push([removedRun[offset] || null, addedRun[offset] || null]);
    }
  }
  return pairs;
}

function lineDiff(left, right) {
  const rows = left.length;
  const cols = right.length;
  const table = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = cols - 1; col >= 0; col -= 1) {
      table[row][col] = left[row] === right[col]
        ? table[row + 1][col + 1] + 1
        : Math.max(table[row + 1][col], table[row][col + 1]);
    }
  }

  const result = [];
  let row = 0;
  let col = 0;
  while (row < rows && col < cols) {
    if (left[row] === right[col]) {
      result.push({ type: "same", text: left[row] });
      row += 1;
      col += 1;
    } else if (table[row + 1][col] >= table[row][col + 1]) {
      result.push({ type: "removed", text: left[row] });
      row += 1;
    } else {
      result.push({ type: "added", text: right[col] });
      col += 1;
    }
  }

  while (row < rows) {
    result.push({ type: "removed", text: left[row] });
    row += 1;
  }
  while (col < cols) {
    result.push({ type: "added", text: right[col] });
    col += 1;
  }

  return result;
}

function renderCards(items = tools, options = {}) {
  activeTool = null;
  workspace.innerHTML = "";
  if (!items.length) {
    toolGrid.innerHTML = `
      <section class="empty-state">
        <h2>${textFor("noMatchesTitle")}</h2>
        <p>${textFor("noMatchesBody")}</p>
      </section>
    `;
    return;
  }
  const pinnedIds = getPinned();
  const pinnedItems = !options.preserveOrder && items.length === tools.length
    ? pinnedIds.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean)
    : [];
  const groups = items.reduce((acc, tool) => {
    acc[tool.category] = acc[tool.category] || [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const pinnedSection = pinnedItems.length ? `
    <section class="category-section pinned-section" id="favorites">
      <div class="category-heading">
        <h2>${textFor("pinned")}</h2>
        <span>${localizedToolCount(pinnedItems.length)}</span>
      </div>
      <div class="tool-card-list">
        ${pinnedItems.map(renderToolCard).join("")}
      </div>
    </section>
  ` : "";

  const categorySections = Object.entries(groups).sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  }).map(([category, categoryTools]) => {
    const anchor = categoryTools[0]?.anchor || category.toLowerCase();
    const sortedTools = options.preserveOrder ? categoryTools : categoryTools.slice().sort((a, b) => toolRank(b) - toolRank(a));
    return `
      <section class="category-section" id="${anchor}">
        <div class="category-heading">
          <h2>${localizedCategory(category)}</h2>
          <span>${localizedToolCount(categoryTools.length)}</span>
        </div>
        <div class="tool-card-list">
          ${sortedTools.map(renderToolCard).join("")}
        </div>
      </section>
    `;
  }).join("");

  toolGrid.innerHTML = pinnedSection + categorySections;
}

function renderToolCard(tool) {
  const meta = toolMetadata(tool);
  const pinned = isPinned(tool.id);
  const isActive = activeTool?.id === tool.id;
  return `
    <article class="tool-card ${pinned ? "is-pinned" : ""} ${isActive ? "is-active" : ""}" data-tool-card="${tool.id}" data-tool-slug="${meta.slug}" data-tool-intent="${meta.intent}" data-tool-tier="${meta.tier}" data-tool-priority="${meta.priority}" data-opportunity-score="${meta.opportunity.score}">
      <span>${localizedCategory(tool.category)}</span>
      <h3>${localizedToolTitle(tool)}</h3>
      <p>${localizedToolDescription(tool)}</p>
      <div class="tool-card-actions">
        <button type="button" data-tool-id="${tool.id}" aria-expanded="${isActive}">${textFor(isActive ? "closeTool" : "openTool")}</button>
        <button class="pin-button" type="button" data-pin-tool-id="${tool.id}" aria-pressed="${pinned}" aria-label="${pinned ? textFor("unpinTool") : textFor("pinTool")} ${escapeAttr(localizedToolTitle(tool))}" title="${pinned ? textFor("unpinTool") : textFor("pinTool")}">
          <span aria-hidden="true">${pinned ? "★" : "☆"}</span>
        </button>
      </div>
    </article>
  `;
}

function fieldMarkup(field) {
  if (field.type === "textarea") {
    return `<label><span class="field-head">${field.label}<button type="button" class="clear-field-button" data-clear-field="${field.id}">Clear</button></span><textarea id="${field.id}" name="${field.id}" rows="7">${escapeHtml(field.value || "")}</textarea></label>`;
  }
  if (field.type === "select") {
    return `<label><span>${field.label}</span><select id="${field.id}" name="${field.id}">${field.options.map(([value, label]) => `<option value="${value}" ${value === field.value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
  }
  return `<label><span>${field.label}</span><input id="${field.id}" name="${field.id}" type="${field.type}" value="${escapeAttr(field.value ?? "")}" step="${field.step || "any"}"></label>`;
}

function decisionLocale() {
  return decisionCopy[currentLanguage] || decisionCopy.en;
}

function decisionFieldLabel(tool, field) {
  return decisionLocale().fields?.[tool.id]?.[field.id] || field.label;
}

function decisionFieldValue(tool, field) {
  return decisionLocale().values?.[tool.id]?.[field.id] ?? field.value;
}

function decisionOptionLabel(tool, field, value, label) {
  return decisionLocale().options?.[tool.id]?.[field.id]?.[value] || label;
}

function decisionMetricLabel(key) {
  const labels = {
    en: {
      result: "Result",
      flips: "Flips",
      total: "Total",
      rolls: "Rolls",
      dice: "Dice",
      modifier: "Modifier",
      pick: "Pick",
      draws: "Draws",
      poolSize: "Pool size",
      repeats: "Repeats",
      repeatsAllowed: "Allowed",
      repeatsBlocked: "No repeats until exhausted",
      winner: "Winner",
      outcome: "Outcome",
      participants: "Participants",
      outcomes: "Outcomes",
      firstResult: "First result",
      name: "Name"
    },
    ko: {
      result: "결과",
      flips: "던진 횟수",
      total: "합계",
      rolls: "굴린 값",
      dice: "주사위",
      modifier: "보정값",
      pick: "선택",
      draws: "뽑은 개수",
      poolSize: "후보 수",
      repeats: "중복",
      repeatsAllowed: "허용",
      repeatsBlocked: "소진 전까지 중복 없음",
      winner: "당첨자",
      outcome: "결과",
      participants: "참가자",
      outcomes: "결과 항목",
      firstResult: "첫 결과",
      name: "이름"
    }
  };
  return labels[currentLanguage]?.[key] || labels.en[key] || key;
}

function decisionFieldMarkup(tool, field) {
  const label = decisionFieldLabel(tool, field);
  const value = decisionFieldValue(tool, field);
  if (field.type === "textarea") {
    return `<label><span>${label}</span><textarea name="${field.id}" rows="5">${escapeHtml(value || "")}</textarea></label>`;
  }
  if (field.type === "select") {
    return `<label><span>${label}</span><select name="${field.id}">${field.options.map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${optionValue === value ? "selected" : ""}>${decisionOptionLabel(tool, field, optionValue, optionLabel)}</option>`).join("")}</select></label>`;
  }
  return `<label><span>${label}</span><input name="${field.id}" type="${field.type}" value="${escapeAttr(value ?? "")}" step="${field.step || "any"}"></label>`;
}

function decisionActionLabel(tool) {
  return decisionLocale().actions?.[tool.id] || decisionCopy.en.actions[tool.id] || "Pick";
}

function decisionAgainLabel(tool) {
  return decisionLocale().again?.[tool.id] || decisionCopy.en.again?.[tool.id] || decisionActionLabel(tool);
}

function decisionRunningLabel() {
  return decisionLocale().running || decisionCopy.en.running || "...";
}

function ladderPreviewLines(tool, fieldId, fallback = []) {
  const form = document.getElementById("active-tool-form");
  const liveValue = form?.elements?.[fieldId]?.value;
  const field = tool.fields.find((item) => item.id === fieldId);
  const lines = listLines(liveValue ?? (decisionFieldValue(tool, field || {}) || "")).slice(0, 16);
  return lines.length ? lines : fallback;
}

const LADDER_PATH_COLORS = ["#f97316", "#2563eb", "#10b981", "#e11d48", "#8b5cf6", "#eab308", "#06b6d4", "#f43f5e", "#84cc16", "#a855f7", "#0ea5e9", "#d946ef", "#f59e0b", "#14b8a6", "#6366f1", "#ef4444"];

const LADDER_GEOMETRY = { columnWidth: 76, rowHeight: 26, padding: 14 };

function ladderPointX(column) {
  return LADDER_GEOMETRY.padding + LADDER_GEOMETRY.columnWidth * (column + 0.5);
}

function ladderPointY(level, levels) {
  const usable = LADDER_GEOMETRY.rowHeight * (levels + 1);
  const offset = ((level + 1) / (levels + 1)) * usable;
  return LADDER_GEOMETRY.padding + offset;
}

function ladderBoardSvg(ladder, { revealed = false } = {}) {
  const { columns, levels, rungs, paths = [] } = ladder;
  const width = LADDER_GEOMETRY.padding * 2 + LADDER_GEOMETRY.columnWidth * columns;
  const height = LADDER_GEOMETRY.padding * 2 + LADDER_GEOMETRY.rowHeight * (levels + 1);
  const rails = Array.from({ length: columns }, (_, index) => {
    const x = ladderPointX(index);
    return `<line class="ladder-rail-line" x1="${x}" y1="${LADDER_GEOMETRY.padding}" x2="${x}" y2="${height - LADDER_GEOMETRY.padding}"></line>`;
  }).join("");
  const rungLines = rungs.map((rung) => {
    const y = ladderPointY(rung.level, levels);
    return `<line class="ladder-rung-line" x1="${ladderPointX(rung.gap)}" y1="${y}" x2="${ladderPointX(rung.gap + 1)}" y2="${y}"></line>`;
  }).join("");
  const pathLines = paths.map((path, index) => {
    const color = LADDER_PATH_COLORS[path.start % LADDER_PATH_COLORS.length];
    const points = path.points.map((point) => `${ladderPointX(point.column)},${ladderPointY(point.level, levels)}`).join(" ");
    return `<polyline class="ladder-path" data-path-index="${index}" data-start="${path.start}" data-end="${path.end}" points="${points}" style="stroke:${color}"></polyline>`;
  }).join("");
  return `
    <svg class="ladder-svg" viewBox="0 0 ${width} ${height}" role="img" aria-hidden="true" style="--ladder-width:${width}px">
      ${rails}
      <g class="ladder-rung-group ${revealed ? "is-revealed" : ""}">${rungLines}</g>
      <g class="ladder-path-group">${pathLines}</g>
    </svg>
  `;
}

function ladderStageMarkup(tool, result = {}) {
  const ladder = result.ladder;
  const previewNames = ladderPreviewLines(tool, "names", ["A", "B", "C", "D"]);
  const previewOutcomes = ladderPreviewLines(tool, "outcomes", ["1", "2", "3", "4"]);
  const topLabels = (ladder?.topLabels || previewNames).slice(0, 16);
  const columnCount = Math.max(2, topLabels.length);
  const bottomLabels = ladder
    ? ladder.bottomLabels
    : Array.from({ length: columnCount }, (_, index) => previewOutcomes[index % previewOutcomes.length] || "-");
  const paddedTop = Array.from({ length: columnCount }, (_, index) => topLabels[index] || `#${index + 1}`);
  const board = ladder
    ? ladderBoardSvg(ladder)
    : ladderBoardSvg({ ...generateLadder(columnCount), paths: [] });
  const headline = result.pick || decisionLocale().ladderIdle;

  return `
    <div class="decision-stage ladder-stage ${ladder ? "has-board" : "is-idle"}" data-decision-stage="${tool.id}" style="--ladder-cols:${columnCount}">
      <div class="ladder-scroll">
        <div class="ladder-frame">
          <div class="ladder-label-row ladder-label-top">
            ${paddedTop.map((label, index) => `<span data-ladder-top="${index}" style="--path-color:${LADDER_PATH_COLORS[index % LADDER_PATH_COLORS.length]}">${escapeHtml(label)}</span>`).join("")}
          </div>
          <div class="ladder-board">${board}</div>
          <div class="ladder-label-row ladder-label-bottom">
            ${bottomLabels.map((label, index) => `<span data-ladder-bottom="${index}">${escapeHtml(label)}</span>`).join("")}
          </div>
        </div>
      </div>
      <strong class="decision-headline" data-decision-headline>${escapeHtml(headline)}</strong>
    </div>
  `;
}

const ROULETTE_COLORS = ["#0f766e", "#f97316", "#2563eb", "#eab308", "#e11d48", "#8b5cf6", "#0ea5e9", "#84cc16"];

function rouletteSegmentPath(index, count, radius, center) {
  const segment = (Math.PI * 2) / count;
  const startAngle = index * segment - Math.PI / 2;
  const endAngle = startAngle + segment;
  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  const largeArc = segment > Math.PI ? 1 : 0;
  return `M ${center} ${center} L ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)} Z`;
}

function rouletteWheelSvg(items) {
  const size = 280;
  const center = size / 2;
  const radius = center - 8;
  const count = Math.max(1, items.length);
  const segments = items.map((item, index) => {
    const color = ROULETTE_COLORS[index % ROULETTE_COLORS.length];
    // Avoid identical adjacent colors when the count wraps the palette
    const adjustedColor = count > 1 && index === count - 1 && color === ROULETTE_COLORS[0]
      ? ROULETTE_COLORS[1]
      : color;
    if (count === 1) {
      return `<circle cx="${center}" cy="${center}" r="${radius}" fill="${adjustedColor}"></circle>`;
    }
    return `<path d="${rouletteSegmentPath(index, count, radius, center)}" fill="${adjustedColor}"></path>`;
  }).join("");
  const labels = items.map((item, index) => {
    const segment = 360 / count;
    const angle = index * segment + segment / 2 - 90;
    const text = item.length > 10 ? `${item.slice(0, 9)}…` : item;
    const fontSize = count > 10 ? 10 : count > 6 ? 12 : 14;
    return `
      <text class="roulette-label" x="${center + radius * 0.58}" y="${center}" font-size="${fontSize}"
        transform="rotate(${angle} ${center} ${center})"
        text-anchor="middle" dominant-baseline="middle">${escapeHtml(text)}</text>
    `;
  }).join("");
  return `
    <svg class="roulette-svg" viewBox="0 0 ${size} ${size}" role="img" aria-hidden="true">
      <g class="roulette-rotor" data-roulette-rotor style="transform-origin:${center}px ${center}px">
        ${segments}
        ${labels}
      </g>
      <circle class="roulette-hub" cx="${center}" cy="${center}" r="26"></circle>
      <circle class="roulette-rim" cx="${center}" cy="${center}" r="${radius}"></circle>
    </svg>
  `;
}

function rouletteItemsForStage(tool, result = {}) {
  if (result.items?.length) return result.items;
  const field = tool.fields.find((item) => item.id === "items");
  const form = document.getElementById("active-tool-form");
  const liveValue = form?.elements?.items?.value;
  const items = listLines(liveValue ?? (decisionFieldValue(tool, field || {}) || ""));
  return items.length ? items : ["A", "B", "C", "D"];
}

function decisionStageMarkup(tool, result = {}) {
  if (tool.id === "coin-flip") {
    const labels = coinFaceLabels();
    return `
      <div class="decision-stage coin-stage" data-decision-stage="${tool.id}">
        <div class="coin-scene">
          <div class="coin" data-coin aria-label="${decisionLocale().coinAria}">
            <div class="coin-face coin-face-front">${escapeHtml(labels[0])}</div>
            <div class="coin-face coin-face-back">${escapeHtml(labels[1])}</div>
          </div>
          <div class="coin-shadow" aria-hidden="true"></div>
        </div>
        <strong class="decision-headline" data-decision-headline>${escapeHtml(result.result || "?")}</strong>
      </div>
    `;
  }
  if (tool.id === "dice-roller") {
    const rolls = result.rolls?.length ? result.rolls : ["?", "?"];
    return `
      <div class="decision-stage dice-stage" data-decision-stage="${tool.id}">
        <div class="dice-tray">
          ${rolls.slice(0, 12).map((roll) => `<div class="die" data-die>${escapeHtml(roll)}</div>`).join("")}
          ${rolls.length > 12 ? `<div class="dice-more">+${rolls.length - 12}</div>` : ""}
        </div>
        <strong class="decision-headline" data-decision-headline>${result.total ?? "?"}</strong>
      </div>
    `;
  }
  if (tool.id === "roulette-picker") {
    const items = rouletteItemsForStage(tool, result);
    return `
      <div class="decision-stage roulette-stage" data-decision-stage="${tool.id}">
        <div class="roulette-wrap">
          <div class="roulette-pointer" aria-hidden="true"></div>
          ${rouletteWheelSvg(items)}
        </div>
        <strong class="decision-headline" data-decision-headline>${escapeHtml(result.pick || decisionLocale().rouletteIdle)}</strong>
      </div>
    `;
  }
  return ladderStageMarkup(tool, result);
}

function renderDecisionTool(tool) {
  workspace.innerHTML = `
    <article class="active-tool decision-tool">
      <div class="active-tool-header">
        <div>
          <span>${localizedCategory(tool.category)}</span>
          <h2>${localizedToolTitle(tool)}</h2>
          <p>${localizedToolDescription(tool)}</p>
        </div>
        ${shareButtonMarkup()}
      </div>
      ${privacyNotice(tool)}
      <div class="decision-layout">
        <div class="decision-visual" id="decision-visual">${decisionStageMarkup(tool)}</div>
        <form class="tool-form decision-form" id="active-tool-form">
          ${tool.fields.map((field) => decisionFieldMarkup(tool, field)).join("")}
          <button class="decision-action" type="button" data-decision-action="${tool.id}">${decisionActionLabel(tool)}</button>
        </form>
      </div>
      <div class="tool-result decision-result" id="tool-result">
        <p class="decision-empty">${decisionLocale().empty}</p>
      </div>
    </article>
  `;
}

function readActiveFormValues() {
  const form = document.getElementById("active-tool-form");
  if (!form) return {};
  return [...new FormData(form).entries()].reduce((values, [key, value]) => {
    values[key] = value;
    return values;
  }, {});
}

function decisionSummary(tool, values) {
  return {
    "ladder-draw": ladderDrawSummary,
    "coin-flip": coinFlipSummary,
    "dice-roller": diceRollerSummary,
    "roulette-picker": roulettePickerSummary
  }[tool.id]?.(values) || {};
}

function decisionVisualResult(tool, summary) {
  if (summary.error) return {};
  if (tool.id === "coin-flip") return { result: summary.result };
  if (tool.id === "dice-roller") return { rolls: summary.rolls, total: summary.total };
  if (tool.id === "roulette-picker") return { pick: summary.pick, items: summary.items };
  return {
    pick: summary.pick,
    pairings: summary.pairings,
    winner: summary.winner,
    outcome: summary.outcome,
    ladder: summary.ladder
  };
}

function renderDecisionResult(tool, summary) {
  if (summary.error) return error(summary.error);
  if (tool.id === "coin-flip") {
    return `
      ${metrics([[decisionMetricLabel("result"), escapeHtml(summary.result)], [escapeHtml(summary.labels[0]), summary.heads], [escapeHtml(summary.labels[1]), summary.tails], [decisionMetricLabel("flips"), summary.count]])}
      ${output(summary.text)}
    `;
  }
  if (tool.id === "dice-roller") {
    return `
      ${metrics([[decisionMetricLabel("total"), summary.total], [decisionMetricLabel("rolls"), summary.rolls.join(", ")], [decisionMetricLabel("dice"), `${summary.dice}d${summary.sides}`], [decisionMetricLabel("modifier"), summary.modifierLabel]])}
      ${output(summary.text)}
    `;
  }
  if (tool.id === "roulette-picker") {
    return `
      ${metrics([[decisionMetricLabel("pick"), escapeHtml(summary.pick)], [decisionMetricLabel("draws"), summary.picks.length], [decisionMetricLabel("poolSize"), summary.poolSize], [decisionMetricLabel("repeats"), summary.allowRepeats ? decisionMetricLabel("repeatsAllowed") : decisionMetricLabel("repeatsBlocked")]])}
      ${output(summary.text)}
    `;
  }
  if (summary.mode === "single") {
    return `
      ${metrics([[decisionMetricLabel("winner"), escapeHtml(summary.winner)], [decisionMetricLabel("outcome"), escapeHtml(summary.outcome)], [decisionMetricLabel("poolSize"), summary.poolSize]])}
      ${output(summary.text)}
    `;
  }
  const rows = summary.pairings.map(([name, outcome], index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(outcome)}</td>
    </tr>
  `).join("");
  return `
    ${metrics([[decisionMetricLabel("participants"), summary.participants], [decisionMetricLabel("outcomes"), summary.outcomes], [decisionMetricLabel("firstResult"), escapeHtml(summary.pick)]])}
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>${decisionMetricLabel("name")}</th><th>${decisionMetricLabel("outcome")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${output(summary.text)}
  `;
}

let decisionRunToken = 0;
let decisionAnimating = false;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function decisionRunStale(token, toolId) {
  return token !== decisionRunToken || activeTool?.id !== toolId;
}

function updateDecisionTool({ animate = true } = {}) {
  if (activeTool?.category !== "Decision") return;
  const visual = document.getElementById("decision-visual");
  const result = document.getElementById("tool-result");
  const values = readActiveFormValues();
  const summary = decisionSummary(activeTool, values);
  const token = ++decisionRunToken;
  if (summary.error) {
    if (result) result.innerHTML = error(summary.error);
    return;
  }
  if (!visual || !animate) {
    if (visual) visual.innerHTML = decisionStageMarkup(activeTool, decisionVisualResult(activeTool, summary));
    if (result) result.innerHTML = renderDecisionResult(activeTool, summary);
    return;
  }
  runDecisionAnimation(activeTool, summary, visual, result, token);
}

async function runDecisionAnimation(tool, summary, visual, result, token) {
  const actionButton = document.querySelector("[data-decision-action]");
  if (actionButton) actionButton.disabled = true;
  if (result) result.innerHTML = `<p class="decision-empty">${decisionRunningLabel()}</p>`;
  decisionAnimating = true;
  try {
    if (tool.id === "ladder-draw") await animateLadder(tool, summary, visual, token);
    else if (tool.id === "coin-flip") await animateCoin(tool, summary, visual, token);
    else if (tool.id === "dice-roller") await animateDice(tool, summary, visual, token);
    else if (tool.id === "roulette-picker") await animateRoulette(tool, summary, visual, token);
  } finally {
    decisionAnimating = false;
    const button = document.querySelector("[data-decision-action]");
    if (button && activeTool?.id === tool.id) {
      button.disabled = false;
      button.textContent = decisionAgainLabel(tool);
    }
  }
  if (decisionRunStale(token, tool.id)) return;
  const resultNode = document.getElementById("tool-result");
  if (resultNode) resultNode.innerHTML = renderDecisionResult(tool, summary);
}

async function animateLadder(tool, summary, visual, token) {
  visual.innerHTML = ladderStageMarkup(tool, decisionVisualResult(tool, summary));
  const stage = visual.querySelector(".decision-stage");
  const rungGroup = stage.querySelector(".ladder-rung-group");
  const headline = stage.querySelector("[data-decision-headline]");
  if (headline) {
    headline.textContent = "…";
    headline.classList.remove("is-final");
  }
  await wait(60);
  if (decisionRunStale(token, tool.id)) return;
  rungGroup?.classList.add("is-revealed");
  await wait(460);
  const paths = [...stage.querySelectorAll(".ladder-path")];
  const perPath = paths.length > 8 ? 340 : paths.length > 4 ? 500 : 720;
  for (const path of paths) {
    if (decisionRunStale(token, tool.id) || !path.isConnected) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transitionDuration = `${perPath}ms`;
    path.classList.add("is-tracing");
    const start = Number(path.dataset.start);
    const end = Number(path.dataset.end);
    const topLabel = stage.querySelector(`[data-ladder-top="${start}"]`);
    topLabel?.classList.add("is-traced");
    await wait(30);
    path.style.strokeDashoffset = "0";
    await wait(perPath + 90);
    const bottomLabel = stage.querySelector(`[data-ladder-bottom="${end}"]`);
    if (bottomLabel) {
      bottomLabel.style.setProperty("--path-color", LADDER_PATH_COLORS[start % LADDER_PATH_COLORS.length]);
      bottomLabel.classList.add("is-traced");
    }
  }
  if (decisionRunStale(token, tool.id)) return;
  if (headline) {
    headline.textContent = summary.pick;
    headline.classList.add("is-final");
  }
}

async function animateCoin(tool, summary, visual, token) {
  let coin = visual.querySelector("[data-coin]");
  if (!coin) {
    visual.innerHTML = decisionStageMarkup(tool, {});
    coin = visual.querySelector("[data-coin]");
  }
  const stage = visual.querySelector(".decision-stage");
  const headline = stage.querySelector("[data-decision-headline]");
  if (headline) {
    headline.textContent = "?";
    headline.classList.remove("is-final");
  }
  stage.classList.add("is-flipping");
  const isFront = summary.result === summary.labels[0];
  const current = Number(coin.dataset.rotation || 0);
  const base = current - (current % 360) + 5 * 360;
  const target = base + (isFront ? 0 : 180);
  coin.style.transition = "transform 1.6s cubic-bezier(0.32, 0.94, 0.6, 1)";
  coin.style.transform = `rotateX(${target}deg)`;
  coin.dataset.rotation = String(target);
  await wait(1700);
  stage.classList.remove("is-flipping");
  if (decisionRunStale(token, tool.id) || !stage.isConnected) return;
  if (headline) {
    headline.textContent = summary.count > 1 ? `${summary.result} · ${summary.labels[0]} ${summary.heads} : ${summary.tails} ${summary.labels[1]}` : summary.result;
    headline.classList.add("is-final");
  }
}

async function animateDice(tool, summary, visual, token) {
  visual.innerHTML = decisionStageMarkup(tool, { rolls: summary.rolls });
  const stage = visual.querySelector(".decision-stage");
  const headline = stage.querySelector("[data-decision-headline]");
  const dice = [...stage.querySelectorAll("[data-die]")];
  if (headline) {
    headline.textContent = "?";
    headline.classList.remove("is-final");
  }
  dice.forEach((die) => {
    die.textContent = "?";
    die.classList.add("is-rolling");
  });
  const cycler = window.setInterval(() => {
    dice.forEach((die) => {
      if (die.classList.contains("is-rolling")) {
        die.textContent = String(randomInt(summary.sides) + 1);
      }
    });
  }, 70);
  try {
    const visibleRolls = summary.rolls.slice(0, dice.length);
    for (let index = 0; index < visibleRolls.length; index += 1) {
      await wait(index === 0 ? 620 : 170);
      if (decisionRunStale(token, tool.id) || !stage.isConnected) return;
      const die = dice[index];
      die.textContent = String(visibleRolls[index]);
      die.classList.remove("is-rolling");
      die.classList.add("is-set");
    }
  } finally {
    window.clearInterval(cycler);
  }
  if (decisionRunStale(token, tool.id)) return;
  if (headline) {
    headline.textContent = String(summary.total);
    headline.classList.add("is-final");
  }
}

async function animateRoulette(tool, summary, visual, token) {
  const stage = visual.querySelector(".decision-stage");
  const itemsKey = summary.items.join("");
  let rotor = visual.querySelector("[data-roulette-rotor]");
  if (!stage || !rotor || stage.dataset.itemsKey !== itemsKey) {
    visual.innerHTML = decisionStageMarkup(tool, { items: summary.items });
    visual.querySelector(".decision-stage").dataset.itemsKey = itemsKey;
    rotor = visual.querySelector("[data-roulette-rotor]");
    await wait(40);
  }
  const liveStage = visual.querySelector(".decision-stage");
  const headline = liveStage.querySelector("[data-decision-headline]");
  if (headline) {
    headline.textContent = "…";
    headline.classList.remove("is-final");
  }
  liveStage.classList.remove("has-result");
  const count = summary.items.length;
  const segment = 360 / count;
  const winnerIndex = Math.max(0, summary.winnerIndex);
  const winnerCenter = (winnerIndex + 0.5) * segment;
  const jitter = ((randomInt(61) - 30) / 100) * segment * 0.7;
  const current = Number(rotor.dataset.rotation || 0);
  let target = current - (current % 360) + 5 * 360 - winnerCenter + jitter;
  while (target < current + 3 * 360) target += 360;
  rotor.style.transition = "transform 4s cubic-bezier(0.12, 0.76, 0.18, 1)";
  rotor.style.transform = `rotate(${target}deg)`;
  rotor.dataset.rotation = String(target);
  await wait(4150);
  if (decisionRunStale(token, tool.id) || !liveStage.isConnected) return;
  liveStage.classList.add("has-result");
  if (headline) {
    headline.textContent = summary.pick;
    headline.classList.add("is-final");
  }
}

function refreshDecisionIdleStage() {
  if (activeTool?.category !== "Decision" || decisionAnimating) return;
  const visual = document.getElementById("decision-visual");
  if (visual) {
    visual.innerHTML = decisionStageMarkup(activeTool, {});
  }
  const button = document.querySelector("[data-decision-action]");
  if (button) button.textContent = decisionActionLabel(activeTool);
}

function imageToolMarkup(tool) {
  const isResizer = tool.custom === "image-resizer";
  const isCompressor = tool.custom === "image-compressor";
  const isConverter = tool.custom === "image-converter";
  const isSquare = tool.custom === "image-square";
  const isAssetPack = tool.custom === "image-asset-pack";
  const isPixelArt = tool.custom === "image-pixel-art";
  const emptyText = {
    "image-resizer": "Choose an image to resize it locally in your browser.",
    "image-compressor": "Choose an image to compress it locally in your browser.",
    "image-converter": "Choose an image to convert it locally in your browser.",
    "image-square": "Choose an image to turn it into a centered square.",
    "image-asset-pack": "Choose a logo or image to generate a launch asset pack.",
    "image-pixel-art": "Choose an image to convert it into pixel art."
  }[tool.custom];

  return `
    <form class="tool-form image-tool-form" id="active-tool-form">
      <label class="file-field">
        <span>Image file</span>
        <input id="image-file" name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif">
      </label>
      ${isResizer ? `
        <label>
          <span>Preset</span>
          <select id="resize-preset" name="resizePreset">
            <option value="custom">Custom size</option>
            <option value="1920x1080">Full HD 1920 x 1080</option>
            <option value="1280x720">HD 1280 x 720</option>
            <option value="1080x1080">Square 1080 x 1080</option>
            <option value="1200x630">Open Graph 1200 x 630</option>
            <option value="1080x1920">Story 1080 x 1920</option>
          </select>
        </label>
        <label>
          <span>Output width</span>
          <input id="resize-width" name="resizeWidth" type="number" min="1" step="1" placeholder="Auto">
        </label>
        <label>
          <span>Output height</span>
          <input id="resize-height" name="resizeHeight" type="number" min="1" step="1" placeholder="Auto">
        </label>
        <label class="check-field">
          <input id="lock-ratio" name="lockRatio" type="checkbox" checked>
          <span>Keep original ratio</span>
        </label>
      ` : ""}
      ${isCompressor ? `
        <label>
          <span>Max width</span>
          <input id="resize-width" name="resizeWidth" type="number" min="1" step="1" placeholder="Keep original">
        </label>
        <label>
          <span>Target size KB</span>
          <input id="target-size" name="targetSize" type="number" min="1" step="1" placeholder="Optional">
        </label>
        <label class="check-field">
          <input id="never-upscale" name="neverUpscale" type="checkbox" checked>
          <span>Never upscale small images</span>
        </label>
      ` : ""}
      ${isConverter ? `
        <label>
          <span>Output width</span>
          <input id="resize-width" name="resizeWidth" type="number" min="1" step="1" placeholder="Keep original">
        </label>
        <label>
          <span>Output height</span>
          <input id="resize-height" name="resizeHeight" type="number" min="1" step="1" placeholder="Auto">
        </label>
        <label class="check-field">
          <input id="lock-ratio" name="lockRatio" type="checkbox" checked>
          <span>Keep original ratio</span>
        </label>
        <label>
          <span>JPG background</span>
          <input id="jpeg-bg" name="jpegBg" type="text" value="#ffffff">
        </label>
      ` : ""}
      ${isSquare ? `
        <label>
          <span>Square size</span>
          <input id="square-size" name="squareSize" type="number" min="16" step="1" value="1080">
        </label>
        <label>
          <span>Fit mode</span>
          <select id="square-fit" name="squareFit">
            <option value="contain" selected>Fit entire image</option>
            <option value="cover">Fill square crop</option>
          </select>
        </label>
        <label>
          <span>Padding %</span>
          <input id="square-padding" name="squarePadding" type="number" min="0" max="45" step="1" value="8">
        </label>
        <label>
          <span>Corner radius %</span>
          <input id="square-radius" name="squareRadius" type="number" min="0" max="50" step="1" value="0">
        </label>
        <label>
          <span>Background</span>
          <input id="square-bg" name="squareBg" type="text" value="#ffffff">
        </label>
      ` : ""}
      ${isAssetPack ? `
        <label>
          <span>Pack</span>
          <select id="asset-pack" name="assetPack">
            <option value="launch" selected>Launch kit</option>
            <option value="favicon">Favicon and app icons</option>
            <option value="social">Social cards</option>
            <option value="app">PWA app icons</option>
          </select>
        </label>
        <label>
          <span>Fit mode</span>
          <select id="asset-fit" name="assetFit">
            <option value="contain" selected>Fit with padding</option>
            <option value="cover">Fill crop</option>
          </select>
        </label>
        <label>
          <span>Background</span>
          <input id="asset-bg" name="assetBg" type="text" value="#ffffff">
        </label>
        <label>
          <span>Padding %</span>
          <input id="asset-padding" name="assetPadding" type="number" min="0" max="45" step="1" value="10">
        </label>
        <label>
          <span>Corner radius %</span>
          <input id="asset-radius" name="assetRadius" type="number" min="0" max="50" step="1" value="0">
        </label>
      ` : ""}
      ${isPixelArt ? `
        <label>
          <span>Preset</span>
          <select id="pixel-preset" name="pixelPreset">
            <option value="custom">Custom</option>
            <option value="avatar">Avatar 64 columns / 6x</option>
            <option value="icon" selected>Icon 96 columns / 4x</option>
            <option value="sprite">Sprite 128 columns / 3x</option>
            <option value="poster">Poster 160 columns / 2x</option>
          </select>
        </label>
        <label>
          <span>Pixel grid width</span>
          <input id="pixel-width" name="pixelWidth" type="number" min="8" max="512" step="1" value="96">
        </label>
        <label>
          <span>Export scale</span>
          <input id="pixel-scale" name="pixelScale" type="number" min="1" max="16" step="1" value="4">
        </label>
        <label>
          <span>Palette</span>
          <select id="pixel-palette" name="pixelPalette">
            <option value="0">Keep source colors</option>
            <option value="6" selected>Retro 216 colors</option>
            <option value="4">Arcade 64 colors</option>
            <option value="3">Poster 27 colors</option>
            <option value="2">Game Boy 8 colors</option>
          </select>
        </label>
        <label class="check-field">
          <input id="pixel-dither" name="pixelDither" type="checkbox" checked>
          <span>Use dithering</span>
        </label>
        <label class="check-field">
          <input id="pixel-flatten" name="pixelFlatten" type="checkbox">
          <span>Flatten transparent background</span>
        </label>
        <label>
          <span>Background</span>
          <input id="pixel-bg" name="pixelBg" type="text" value="#ffffff">
        </label>
        <label class="check-field">
          <input id="pixel-grid" name="pixelGrid" type="checkbox">
          <span>Export grid overlay</span>
        </label>
        <label>
          <span>Grid color</span>
          <input id="pixel-grid-color" name="pixelGridColor" type="text" value="#000000">
        </label>
        <label>
          <span>Sprite columns</span>
          <input id="pixel-sprite-columns" name="pixelSpriteColumns" type="number" min="1" max="24" step="1" value="1">
        </label>
        <label>
          <span>Sprite rows</span>
          <input id="pixel-sprite-rows" name="pixelSpriteRows" type="number" min="1" max="24" step="1" value="1">
        </label>
      ` : ""}
      <label>
        <span>Format</span>
        <select id="resize-format" name="resizeFormat">
          <option value="image/png" ${!isCompressor && !isConverter ? "selected" : ""}>PNG</option>
          <option value="image/jpeg" ${isCompressor ? "selected" : ""}>JPG</option>
          <option value="image/webp" ${isConverter ? "selected" : ""}>WebP</option>
          <option value="image/avif">AVIF</option>
        </select>
      </label>
      <label>
        <span>Quality</span>
        <input id="resize-quality" name="resizeQuality" type="number" min="1" max="100" step="1" value="${isCompressor ? 75 : 90}" ${isConverter ? "" : ""}>
      </label>
    </form>
    <div class="tool-result" id="tool-result">
      <div class="upload-empty">${emptyText}</div>
    </div>
  `;
}

function renderImageTool(tool) {
  workspace.innerHTML = `
    <article class="active-tool">
      <div class="active-tool-header">
        <div>
          <span>${localizedCategory(tool.category)}</span>
          <h2>${localizedToolTitle(tool)}</h2>
          <p>${localizedToolDescription(tool)}</p>
        </div>
        ${shareButtonMarkup()}
      </div>
      ${privacyNotice(tool)}
      ${imageToolMarkup(tool)}
      <div class="how-to">
        <h3>${textFor("howToUse")}</h3>
        <ol>
          <li>${textFor("enterValues")}</li>
          <li>${textFor("reviewResult")}</li>
          <li>${textFor("copyOutput")}</li>
        </ol>
      </div>
    </article>
  `;
}

function fileToolMarkup(tool) {
  const accept = {
    "file-csv-cleaner": ".csv,text/csv,text/plain",
    "file-csv-columns": ".csv,text/csv,text/plain",
    "file-json-formatter": ".json,application/json,text/plain",
    "file-word-counter": ".txt,.md,text/plain"
  }[tool.custom] || "text/plain";
  const placeholder = {
    "file-csv-cleaner": "name, role, notes\n Alex , Designer , \"Uses commas, safely\"\n\n Sam , Developer , \"Ships clean data\"",
    "file-csv-columns": "name,role,team,notes\nAlex,Designer,Brand,\"Uses commas, safely\"\nSam,Developer,Platform,\"Ships clean data\"",
    "file-json-formatter": "{\"name\":\"UtilityStack\",\"tools\":64}",
    "file-word-counter": "Paste text here or upload a text file."
  }[tool.custom] || "";

  return `
    <form class="tool-form file-tool-form" id="active-tool-form">
      <label class="file-field">
        <span>Upload file</span>
        <input id="source-file" name="sourceFile" type="file" accept="${accept}">
      </label>
      <label class="file-field">
        <span>Input</span>
        <textarea id="source-text" name="sourceText" rows="9">${escapeHtml(placeholder)}</textarea>
      </label>
      ${tool.custom === "file-json-formatter" ? `
        <label>
          <span>Mode</span>
          <select id="file-mode" name="fileMode">
            <option value="pretty">Pretty print</option>
            <option value="minify">Minify</option>
          </select>
        </label>
      ` : ""}
      ${tool.custom === "file-csv-cleaner" ? `
        <label class="check-field">
          <input id="csv-normalize-headers" name="csvNormalizeHeaders" type="checkbox" checked>
          <span>Normalize headers</span>
        </label>
        <label class="check-field">
          <input id="csv-remove-duplicates" name="csvRemoveDuplicates" type="checkbox" checked>
          <span>Remove duplicate rows</span>
        </label>
        <label class="check-field">
          <input id="csv-keep-empty-columns" name="csvKeepEmptyColumns" type="checkbox">
          <span>Keep empty columns</span>
        </label>
      ` : ""}
      ${tool.custom === "file-csv-columns" ? `
        <label>
          <span>Columns to keep</span>
          <input id="columns" name="columns" type="text" value="name,team">
        </label>
      ` : ""}
    </form>
    <div class="tool-result" id="tool-result"></div>
  `;
}

function renderFileTool(tool) {
  workspace.innerHTML = `
    <article class="active-tool">
      <div class="active-tool-header">
        <div>
          <span>${localizedCategory(tool.category)}</span>
          <h2>${localizedToolTitle(tool)}</h2>
          <p>${localizedToolDescription(tool)}</p>
        </div>
        ${shareButtonMarkup()}
      </div>
      ${privacyNotice(tool)}
      ${fileToolMarkup(tool)}
      <div class="how-to">
        <h3>${textFor("howToUse")}</h3>
        <ol>
          <li>${textFor("enterValues")}</li>
          <li>${textFor("reviewResult")}</li>
          <li>${textFor("copyOutput")}</li>
        </ol>
      </div>
    </article>
  `;
}

function renderQrTool(tool) {
  workspace.innerHTML = `
    <article class="active-tool">
      <div class="active-tool-header">
        <div>
          <span>${localizedCategory(tool.category)}</span>
          <h2>${localizedToolTitle(tool)}</h2>
          <p>${localizedToolDescription(tool)}</p>
        </div>
        ${shareButtonMarkup()}
      </div>
      ${privacyNotice(tool)}
      <form class="tool-form qr-tool-form" id="active-tool-form">
        <label class="file-field">
          <span>Text or URL</span>
          <textarea id="qr-text" name="qrText" rows="5">https://example.com</textarea>
        </label>
        <label>
          <span>Size</span>
          <input id="qr-size" name="qrSize" type="number" min="128" max="1024" step="16" value="320">
        </label>
        <label>
          <span>Margin</span>
          <input id="qr-margin" name="qrMargin" type="number" min="0" max="12" step="1" value="4">
        </label>
        <label>
          <span>Foreground</span>
          <input id="qr-foreground" name="qrForeground" type="text" value="#111827">
        </label>
        <label>
          <span>Background</span>
          <input id="qr-background" name="qrBackground" type="text" value="#ffffff">
        </label>
        <label>
          <span>Error correction</span>
          <select id="qr-level" name="qrLevel">
            <option value="L">Low</option>
            <option value="M" selected>Medium</option>
            <option value="Q">Quartile</option>
            <option value="H">High</option>
          </select>
        </label>
      </form>
      <div class="tool-result" id="tool-result"></div>
      <div class="how-to">
        <h3>${textFor("howToUse")}</h3>
        <ol>
          <li>${textFor("enterValues")}</li>
          <li>${textFor("reviewResult")}</li>
          <li>${textFor("copyOutput")}</li>
        </ol>
      </div>
    </article>
  `;
}

function openTool(toolId, options = {}) {
  const tool = tools.find((item) => item.id === toolId) || tools[0];
  activeTool = tool;

  const triggerCard = options.card || document.querySelector(`[data-tool-card="${tool.id}"]`);
  if (triggerCard) {
    triggerCard.insertAdjacentElement("afterend", workspace);
    workspace.classList.add("is-inline");
  } else {
    toolGrid.insertAdjacentElement("afterend", workspace);
    workspace.classList.remove("is-inline");
  }

  if (tool.custom?.startsWith("image-")) {
    renderImageTool(tool);
  } else if (tool.custom?.startsWith("file-")) {
    renderFileTool(tool);
  } else if (tool.custom === "qr-code") {
    renderQrTool(tool);
  } else if (tool.category === "Decision") {
    renderDecisionTool(tool);
  } else {
    workspace.innerHTML = `
      <article class="active-tool">
        <div class="active-tool-header">
          <div>
            <span>${localizedCategory(tool.category)}</span>
            <h2>${localizedToolTitle(tool)}</h2>
            <p>${localizedToolDescription(tool)}</p>
          </div>
          ${shareButtonMarkup()}
        </div>
        ${privacyNotice(tool)}
        <form class="tool-form" id="active-tool-form">${tool.fields.map(fieldMarkup).join("")}<div class="form-actions"><button type="reset" class="reset-button">${textFor("resetDefaults")}</button></div></form>
        <div class="tool-result" id="tool-result"></div>
        <div class="how-to">
          <h3>${textFor("howToUse")}</h3>
          <ol>
            <li>${textFor("enterValues")}</li>
            <li>${textFor("reviewResult")}</li>
            <li>${textFor("copyOutput")}</li>
          </ol>
        </div>
      </article>
    `;
  }
  addRecent(tool.id);
  if (tool.custom?.startsWith("image-")) {
    updateImageTool();
  } else if (tool.custom?.startsWith("file-")) {
    updateFileTool();
  } else if (tool.custom === "qr-code") {
    updateQrTool();
  } else if (tool.category === "Decision") {
    // Decision tools should wait for an explicit draw/flip/roll/spin action.
  } else {
    calculateActive(tool);
  }
  syncToolCardStates();
  if (options.scroll) {
    const target = triggerCard || workspace;
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function closeTool() {
  activeTool = null;
  workspace.innerHTML = "";
  workspace.classList.remove("is-inline");
  releaseObjectUrls();
  syncToolCardStates();
}

function toggleTool(toolId, options = {}) {
  if (activeTool?.id === toolId) {
    closeTool();
    return;
  }
  openTool(toolId, options);
}

function syncToolCardStates() {
  document.querySelectorAll(".tool-card").forEach((card) => {
    const isActive = activeTool?.id === card.dataset.toolCard;
    card.classList.toggle("is-active", isActive);
    const button = card.querySelector("[data-tool-id]");
    if (button) {
      button.textContent = textFor(isActive ? "closeTool" : "openTool");
      button.setAttribute("aria-expanded", String(isActive));
    }
  });
}

function calculateActive(tool) {
  const form = document.getElementById("active-tool-form");
  const result = document.getElementById("tool-result");
  if (!form || !result) {
    return;
  }

  const values = {};
  tool.fields.forEach((field) => {
    values[field.id] = form.elements.namedItem(field.id)?.value || "";
  });
  result.innerHTML = tool.calculate(values);
}

async function updateImageTool() {
  if (!activeTool?.custom?.startsWith("image-")) {
    return;
  }

  const form = document.getElementById("active-tool-form");
  const result = document.getElementById("tool-result");
  const file = form?.elements.imageFile?.files?.[0];
  const emptyText = {
    "image-resizer": "Choose an image to resize it locally in your browser.",
    "image-compressor": "Choose an image to compress it locally in your browser.",
    "image-converter": "Choose an image to convert it locally in your browser.",
    "image-square": "Choose an image to turn it into a centered square.",
    "image-asset-pack": "Choose a logo or image to generate a launch asset pack.",
    "image-pixel-art": "Choose an image to convert it into pixel art."
  }[activeTool.custom];
  if (!form || !result || !file) {
    if (result) {
      result.innerHTML = `<div class="upload-empty">${emptyText}</div>`;
    }
    return;
  }

  if (!file.type.startsWith("image/")) {
    result.innerHTML = error("Choose a valid image file.");
    return;
  }

  releaseObjectUrls();
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const preset = form.elements.resizePreset?.value || "custom";
    if (activeTool.custom === "image-resizer" && preset !== "custom") {
      const [presetWidth, presetHeight] = preset.split("x").map((value) => Number.parseInt(value, 10));
      if (presetWidth > 0 && presetHeight > 0) {
        form.elements.resizeWidth.value = presetWidth;
        form.elements.resizeHeight.value = presetHeight;
      }
    }

    let requestedWidth = Math.floor(num(form.elements.resizeWidth?.value));
    let requestedHeight = Math.floor(num(form.elements.resizeHeight?.value));
    const squareSize = Math.max(16, Math.floor(num(form.elements.squareSize?.value)) || 1080);
    const ratio = image.width / image.height;
    if (activeTool.custom === "image-asset-pack") {
      renderImageAssetPack(image, file, form, result, imageUrl).catch((err) => {
        URL.revokeObjectURL(imageUrl);
        result.innerHTML = error(err.message || "Could not generate this asset pack.");
      });
      return;
    }
    const keepRatio = form.elements.lockRatio?.checked ?? true;
    if ((activeTool.custom === "image-resizer" || activeTool.custom === "image-converter") && keepRatio) {
      if (requestedWidth > 0 && requestedHeight <= 0) requestedHeight = Math.round(requestedWidth / ratio);
      if (requestedHeight > 0 && requestedWidth <= 0) requestedWidth = Math.round(requestedHeight * ratio);
      if (requestedWidth > 0 && requestedHeight > 0 && preset === "custom") requestedHeight = Math.round(requestedWidth / ratio);
    }

    const neverUpscale = form.elements.neverUpscale?.checked ?? true;
    if (activeTool.custom === "image-compressor" && neverUpscale && requestedWidth > image.width) {
      requestedWidth = image.width;
    }

    const shouldLimitWidth = activeTool.custom === "image-compressor" && requestedWidth > 0 && requestedWidth < image.width;
    const hasWidth = requestedWidth > 0 && activeTool.custom !== "image-pixel-art";
    const hasHeight = requestedHeight > 0 && (activeTool.custom === "image-resizer" || activeTool.custom === "image-converter");
    let outputWidth = activeTool.custom === "image-square" ? squareSize : shouldLimitWidth ? requestedWidth : hasWidth ? requestedWidth : hasHeight ? Math.round(requestedHeight * ratio) : image.width;
    let outputHeight = activeTool.custom === "image-square" ? squareSize : hasHeight ? requestedHeight : Math.round(outputWidth / ratio);
    if ((activeTool.custom === "image-resizer" || activeTool.custom === "image-converter") && keepRatio) {
      if (requestedWidth > 0 && requestedHeight > 0 && preset !== "custom") {
        const scale = Math.min(requestedWidth / image.width, requestedHeight / image.height);
        outputWidth = Math.max(1, Math.round(image.width * scale));
        outputHeight = Math.max(1, Math.round(image.height * scale));
      } else if (requestedWidth > 0) {
        outputWidth = requestedWidth;
        outputHeight = Math.max(1, Math.round(requestedWidth / ratio));
      } else if (requestedHeight > 0) {
        outputHeight = requestedHeight;
        outputWidth = Math.max(1, Math.round(requestedHeight * ratio));
      }
    }
    const format = form.elements.resizeFormat?.value || "image/png";
    const quality = Math.min(1, Math.max(0.01, num(form.elements.resizeQuality?.value) / 100));
    const targetBytes = activeTool.custom === "image-compressor" ? Math.floor(num(form.elements.targetSize?.value) * 1024) : 0;
    const extension = format === "image/jpeg" ? "jpg" : format.split("/")[1];
    const label = {
      "image-resizer": "resized",
      "image-compressor": "compressed",
      "image-converter": "converted",
      "image-square": "square",
      "image-pixel-art": "pixel-art"
    }[activeTool.custom];
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    let pixelPaletteColors = [];
    let pixelSvgUrl = "";
    let pixelSvgName = "";
    let pixelSvgRectCount = 0;

    const canvas = document.createElement("canvas");
  if (activeTool.custom === "image-pixel-art") {
      applyPixelPreset(form);
      const pixelWidth = Math.min(512, Math.max(8, Math.floor(num(form.elements.pixelWidth?.value)) || 96));
      const pixelHeight = Math.max(1, Math.round(pixelWidth / ratio));
      const exportScale = Math.min(16, Math.max(1, Math.floor(num(form.elements.pixelScale?.value)) || 4));
      outputWidth = pixelWidth * exportScale;
      outputHeight = pixelHeight * exportScale;
    }
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (activeTool.custom === "image-pixel-art") {
      const pixelWidth = Math.min(512, Math.max(8, Math.floor(num(form.elements.pixelWidth?.value)) || 96));
      const pixelHeight = Math.max(1, Math.round(pixelWidth / ratio));
      const pixelCanvas = document.createElement("canvas");
      pixelCanvas.width = pixelWidth;
      pixelCanvas.height = pixelHeight;
      const pixelContext = pixelCanvas.getContext("2d");
      const pixelBg = safeHexColor(form.elements.pixelBg?.value, "#ffffff");
      const flattenPixelBackground = format === "image/jpeg" || Boolean(form.elements.pixelFlatten?.checked);
      if (flattenPixelBackground) {
        pixelContext.fillStyle = pixelBg;
        pixelContext.fillRect(0, 0, pixelWidth, pixelHeight);
      }
      pixelContext.imageSmoothingEnabled = true;
      pixelContext.drawImage(image, 0, 0, pixelWidth, pixelHeight);
      const paletteLevels = Math.floor(num(form.elements.pixelPalette?.value));
      const pixelData = pixelContext.getImageData(0, 0, pixelWidth, pixelHeight);
      if (paletteLevels > 0) {
        reducePixelPalette(pixelData, paletteLevels, Boolean(form.elements.pixelDither?.checked));
      }
      pixelPaletteColors = extractPaletteColors(pixelData, 16);
      pixelContext.putImageData(pixelData, 0, 0);
      if (flattenPixelBackground) {
        context.fillStyle = pixelBg;
        context.fillRect(0, 0, outputWidth, outputHeight);
      }
      context.imageSmoothingEnabled = false;
      context.drawImage(pixelCanvas, 0, 0, outputWidth, outputHeight);
      if (form.elements.pixelGrid?.checked) {
        drawPixelGrid(context, outputWidth, outputHeight, Math.min(16, Math.max(1, Math.floor(num(form.elements.pixelScale?.value)) || 4)), safeHexColor(form.elements.pixelGridColor?.value, "#000000"));
      }
      const spriteColumns = Math.min(24, Math.max(1, Math.floor(num(form.elements.pixelSpriteColumns?.value)) || 1));
      const spriteRows = Math.min(24, Math.max(1, Math.floor(num(form.elements.pixelSpriteRows?.value)) || 1));
      const spriteFrame = pixelSpriteFrame(pixelWidth, pixelHeight, spriteColumns, spriteRows, Math.min(16, Math.max(1, Math.floor(num(form.elements.pixelScale?.value)) || 4)));
      const svgResult = createPixelArtSvg(pixelData, {
        scale: Math.min(16, Math.max(1, Math.floor(num(form.elements.pixelScale?.value)) || 4)),
        background: flattenPixelBackground ? pixelBg : "",
        includeGrid: Boolean(form.elements.pixelGrid?.checked),
        gridColor: safeHexColor(form.elements.pixelGridColor?.value, "#000000"),
        spriteColumns,
        spriteRows
      });
      pixelSvgName = `${baseName}-pixel-art-${outputWidth}x${outputHeight}.svg`;
      pixelSvgUrl = trackObjectUrl(URL.createObjectURL(new Blob([svgResult.svg], { type: "image/svg+xml" })));
      pixelSvgRectCount = svgResult.rectCount;
      canvas.dataset.spriteFrame = JSON.stringify(spriteFrame);
    } else if (activeTool.custom === "image-square") {
      context.fillStyle = /^#[0-9a-fA-F]{3,6}$/.test(form.elements.squareBg?.value || "") ? form.elements.squareBg.value : "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);
      const fitMode = form.elements.squareFit?.value || "contain";
      const paddingPercent = Math.min(45, Math.max(0, num(form.elements.squarePadding?.value)));
      const radiusPercent = Math.min(50, Math.max(0, num(form.elements.squareRadius?.value)));
      const padding = fitMode === "cover" ? 0 : outputWidth * paddingPercent / 100;
      const targetWidth = Math.max(1, outputWidth - padding * 2);
      const targetHeight = Math.max(1, outputHeight - padding * 2);
      const scale = fitMode === "cover"
        ? Math.max(outputWidth / image.width, outputHeight / image.height)
        : Math.min(targetWidth / image.width, targetHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = (outputWidth - drawWidth) / 2;
      const drawY = (outputHeight - drawHeight) / 2;
      const radius = outputWidth * radiusPercent / 100;
      if (radius > 0) {
        roundedRectPath(context, drawX, drawY, drawWidth, drawHeight, radius);
        context.save();
        context.clip();
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
        context.restore();
      } else {
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      }
    } else {
      if (format === "image/jpeg") {
        context.fillStyle = /^#[0-9a-fA-F]{3,6}$/.test(form.elements.jpegBg?.value || "") ? form.elements.jpegBg.value : "#ffffff";
        context.fillRect(0, 0, outputWidth, outputHeight);
      }
      context.drawImage(image, 0, 0, outputWidth, outputHeight);
    }

    canvas.toBlob((blob) => {
      URL.revokeObjectURL(imageUrl);
      if (!blob) {
        result.innerHTML = error("Could not resize this image.");
        return;
      }

      const resizedUrl = trackObjectUrl(URL.createObjectURL(blob));
      const originalSize = formatBytes(file.size);
      const resizedSize = formatBytes(blob.size);
      const sizeChange = file.size > 0 ? ((1 - blob.size / file.size) * 100) : 0;
      const changeLabel = sizeChange >= 0 ? `${sizeChange.toFixed(1)}% smaller` : `${Math.abs(sizeChange).toFixed(1)}% larger`;
      const targetLabel = targetBytes > 0
        ? blob.size <= targetBytes ? `Under target by ${formatBytes(targetBytes - blob.size)}` : `Over target by ${formatBytes(blob.size - targetBytes)}`
        : "No target set";
      const megapixels = (outputWidth * outputHeight / 1000000).toFixed(2);
      const downloadName = `${baseName}-${label}-${outputWidth}x${outputHeight}.${extension}`;
      const paletteDownloads = activeTool.custom === "image-pixel-art" ? pixelPaletteDownloads(file.name, pixelPaletteColors) : {};
      const spriteFrame = activeTool.custom === "image-pixel-art" ? JSON.parse(canvas.dataset.spriteFrame || "{}") : {};
      const spriteHref = activeTool.custom === "image-pixel-art" ? `data:text/csv;charset=utf-8,${encodeURIComponent(spriteFrameCsv(spriteFrame))}` : "";
      result.innerHTML = `
        <div class="image-result">
          <div class="image-preview-wrap">
            <img src="${resizedUrl}" alt="Processed image preview" ${activeTool.custom === "image-pixel-art" ? 'class="is-pixel-art"' : ""}>
          </div>
          <div class="result-grid">
            <div><span>Original</span><strong>${image.width} x ${image.height}</strong></div>
            <div><span>Output</span><strong>${outputWidth} x ${outputHeight}</strong></div>
            <div><span>File size</span><strong>${originalSize} -> ${resizedSize}</strong></div>
            <div><span>Change</span><strong>${changeLabel}</strong></div>
            <div><span>Format</span><strong>${extension.toUpperCase()}</strong></div>
            <div><span>Megapixels</span><strong>${megapixels} MP</strong></div>
            ${activeTool.custom === "image-compressor" ? `<div><span>Target</span><strong>${targetLabel}</strong></div>` : ""}
            ${activeTool.custom === "image-compressor" ? `<div><span>Privacy</span><strong>Metadata removed</strong></div>` : ""}
            ${activeTool.custom === "image-compressor" ? `<div><span>Quality</span><strong>${Math.round(quality * 100)}%</strong></div>` : ""}
            ${activeTool.custom === "image-converter" ? `<div><span>Transparency</span><strong>${format === "image/jpeg" ? "Flattened to background" : "Preserved when present"}</strong></div>` : ""}
            ${activeTool.custom === "image-converter" && format === "image/jpeg" ? `<div><span>Background</span><strong>${escapeHtml(form.elements.jpegBg?.value || "#ffffff")}</strong></div>` : ""}
            ${activeTool.custom === "image-converter" ? `<div><span>Quality</span><strong>${format === "image/png" ? "Lossless" : `${Math.round(quality * 100)}%`}</strong></div>` : ""}
            ${activeTool.custom === "image-square" ? `<div><span>Fit mode</span><strong>${form.elements.squareFit?.value === "cover" ? "Fill crop" : "Fit with padding"}</strong></div>` : ""}
            ${activeTool.custom === "image-square" ? `<div><span>Padding</span><strong>${Math.min(45, Math.max(0, num(form.elements.squarePadding?.value)))}%</strong></div>` : ""}
            ${activeTool.custom === "image-square" ? `<div><span>Background</span><strong>${escapeHtml(form.elements.squareBg?.value || "#ffffff")}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Pixel grid</span><strong>${Math.min(512, Math.max(8, Math.floor(num(form.elements.pixelWidth?.value)) || 96))} columns</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Export scale</span><strong>${Math.min(16, Math.max(1, Math.floor(num(form.elements.pixelScale?.value)) || 4))}x</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Palette</span><strong>${form.elements.pixelPalette?.value === "0" ? "Source colors" : `${form.elements.pixelPalette?.value} levels/channel`}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Dithering</span><strong>${form.elements.pixelDither?.checked ? "On" : "Off"}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Grid overlay</span><strong>${form.elements.pixelGrid?.checked ? "Exported" : "Off"}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Palette colors</span><strong>${pixelPaletteColors.length}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>SVG cells</span><strong>${pixelSvgRectCount.toLocaleString()}</strong></div>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<div><span>Sprite frame</span><strong>${spriteFrame.frameWidth} x ${spriteFrame.frameHeight}</strong></div>` : ""}
          </div>
          ${activeTool.custom === "image-pixel-art" ? renderPaletteSwatches(pixelPaletteColors, paletteDownloads) : ""}
          <div class="download-actions">
            <a class="download-button" href="${resizedUrl}" download="${escapeAttr(downloadName)}">Download ${label} image</a>
            ${activeTool.custom === "image-pixel-art" ? `<a class="download-button secondary" href="${pixelSvgUrl}" download="${escapeAttr(pixelSvgName)}">Download SVG mosaic</a>` : ""}
            ${activeTool.custom === "image-pixel-art" ? `<a class="download-button secondary" href="${spriteHref}" download="pixel-art-sprite-frames.csv">Download frame CSV</a>` : ""}
          </div>
        </div>
      `;
    }, format, quality);
  };
  image.onerror = () => {
    URL.revokeObjectURL(imageUrl);
    result.innerHTML = error("Could not read this image.");
  };
  image.src = imageUrl;
}

function createPixelArtSvg(imageData, options = {}) {
  const scale = Math.max(1, Math.floor(options.scale || 1));
  const width = imageData.width * scale;
  const height = imageData.height * scale;
  const rects = [];
  const { data } = imageData;
  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      const alpha = data[offset + 3] / 255;
      if (alpha < 0.04) continue;
      const color = rgbToHex(data[offset], data[offset + 1], data[offset + 2]);
      const opacity = alpha < 0.995 ? ` opacity="${alpha.toFixed(3)}"` : "";
      rects.push(`<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${color}"${opacity}/>`);
    }
  }

  const background = options.background
    ? `<rect width="100%" height="100%" fill="${safeHexColor(options.background, "#ffffff")}"/>`
    : "";
  const grid = options.includeGrid ? pixelSvgGrid(width, height, scale, options.gridColor || "#000000") : "";
  const sprite = pixelSvgSpriteGuides(width, height, options.spriteColumns || 1, options.spriteRows || 1, options.gridColor || "#000000");
  return {
    rectCount: rects.length,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${background}${rects.join("")}${grid}${sprite}</svg>`
  };
}

function applyPixelPreset(form) {
  const preset = form.elements.pixelPreset?.value || "custom";
  if (preset === "custom" || form.dataset.pixelPresetApplied === preset) {
    return;
  }
  const values = {
    avatar: { width: 64, scale: 6, palette: "4", dither: true, columns: 1, rows: 1 },
    icon: { width: 96, scale: 4, palette: "6", dither: true, columns: 1, rows: 1 },
    sprite: { width: 128, scale: 3, palette: "4", dither: false, columns: 4, rows: 1 },
    poster: { width: 160, scale: 2, palette: "6", dither: true, columns: 1, rows: 1 }
  }[preset];
  if (!values) return;
  form.elements.pixelWidth.value = values.width;
  form.elements.pixelScale.value = values.scale;
  form.elements.pixelPalette.value = values.palette;
  form.elements.pixelDither.checked = values.dither;
  form.elements.pixelSpriteColumns.value = values.columns;
  form.elements.pixelSpriteRows.value = values.rows;
  form.dataset.pixelPresetApplied = preset;
}

function pixelSvgGrid(width, height, scale, color) {
  if (scale < 2) return "";
  const safeColor = safeHexColor(color, "#000000");
  const lines = [];
  for (let x = scale; x < width; x += scale) {
    lines.push(`<path d="M${x + 0.5} 0V${height}" stroke="${safeColor}" stroke-opacity="0.35"/>`);
  }
  for (let y = scale; y < height; y += scale) {
    lines.push(`<path d="M0 ${y + 0.5}H${width}" stroke="${safeColor}" stroke-opacity="0.35"/>`);
  }
  return lines.join("");
}

function pixelSvgSpriteGuides(width, height, columns, rows, color) {
  const safeColumns = Math.min(24, Math.max(1, Math.floor(columns) || 1));
  const safeRows = Math.min(24, Math.max(1, Math.floor(rows) || 1));
  if (safeColumns <= 1 && safeRows <= 1) return "";
  const safeColor = safeHexColor(color, "#000000");
  const frameWidth = width / safeColumns;
  const frameHeight = height / safeRows;
  const lines = [];
  for (let column = 1; column < safeColumns; column += 1) {
    const x = Math.round(frameWidth * column) + 0.5;
    lines.push(`<path d="M${x} 0V${height}" stroke="${safeColor}" stroke-opacity="0.75" stroke-width="2"/>`);
  }
  for (let row = 1; row < safeRows; row += 1) {
    const y = Math.round(frameHeight * row) + 0.5;
    lines.push(`<path d="M0 ${y}H${width}" stroke="${safeColor}" stroke-opacity="0.75" stroke-width="2"/>`);
  }
  return lines.join("");
}

function pixelSpriteFrame(pixelWidth, pixelHeight, columns, rows, scale) {
  const safeColumns = Math.min(24, Math.max(1, Math.floor(columns) || 1));
  const safeRows = Math.min(24, Math.max(1, Math.floor(rows) || 1));
  return {
    columns: safeColumns,
    rows: safeRows,
    frameWidth: Math.floor(pixelWidth / safeColumns),
    frameHeight: Math.floor(pixelHeight / safeRows),
    exportFrameWidth: Math.floor(pixelWidth * scale / safeColumns),
    exportFrameHeight: Math.floor(pixelHeight * scale / safeRows)
  };
}

function spriteFrameCsv(frame) {
  return [
    "columns,rows,pixel_frame_width,pixel_frame_height,export_frame_width,export_frame_height",
    [frame.columns, frame.rows, frame.frameWidth, frame.frameHeight, frame.exportFrameWidth, frame.exportFrameHeight].join(",")
  ].join("\n");
}

function extractPaletteColors(imageData, limit = 16) {
  const counts = new Map();
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 16) continue;
    const color = rgbToHex(data[index], data[index + 1], data[index + 2]);
    counts.set(color, (counts.get(color) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([color, count]) => ({ color, count }));
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;
}

function pixelPaletteDownloads(sourceName, colors) {
  const palette = {
    source: sourceName,
    colors
  };
  return {
    json: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(palette, null, 2))}`,
    css: `data:text/css;charset=utf-8,${encodeURIComponent(pixelPaletteCss(colors))}`,
    gpl: `data:text/plain;charset=utf-8,${encodeURIComponent(pixelPaletteGpl(sourceName, colors))}`
  };
}

async function renderImageAssetPack(image, file, form, result, imageUrl) {
  result.innerHTML = `<div class="upload-empty">Generating asset pack...</div>`;
  const pack = form.elements.assetPack?.value || "launch";
  const format = form.elements.resizeFormat?.value || "image/png";
  const quality = Math.min(1, Math.max(0.01, num(form.elements.resizeQuality?.value) / 100));
  const extension = format === "image/jpeg" ? "jpg" : format.split("/")[1];
  const options = {
    fit: form.elements.assetFit?.value || "contain",
    background: safeHexColor(form.elements.assetBg?.value, "#ffffff"),
    paddingPercent: Math.min(45, Math.max(0, num(form.elements.assetPadding?.value))),
    radiusPercent: Math.min(50, Math.max(0, num(form.elements.assetRadius?.value))),
    format,
    quality
  };
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const assets = await Promise.all(assetPackItems(pack).map((item) => renderAssetPackItem(image, item, options, baseName, extension)));
  URL.revokeObjectURL(imageUrl);

  const metadata = assetPackMetadata(assets, extension);
  const metadataHref = `data:text/html;charset=utf-8,${encodeURIComponent(metadata.html)}`;
  const manifestHref = `data:application/manifest+json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata.manifest, null, 2))}`;
  const totalBytes = assets.reduce((sum, asset) => sum + asset.blob.size, 0);
  result.innerHTML = `
    <div class="image-result">
      <div class="result-grid">
        <div><span>Pack</span><strong>${assetPackLabel(pack)}</strong></div>
        <div><span>Assets</span><strong>${assets.length}</strong></div>
        <div><span>Format</span><strong>${extension.toUpperCase()}</strong></div>
        <div><span>Total size</span><strong>${formatBytes(totalBytes)}</strong></div>
        <div><span>Fit mode</span><strong>${options.fit === "cover" ? "Fill crop" : "Fit with padding"}</strong></div>
        <div><span>Background</span><strong>${options.background}</strong></div>
      </div>
      <div class="asset-pack-grid">
        ${assets.map((asset) => `
          <div class="asset-card">
            <div class="asset-preview"><img src="${asset.url}" alt="${escapeAttr(asset.label)} preview"></div>
            <strong>${asset.label}</strong>
            <span>${asset.width} x ${asset.height} - ${formatBytes(asset.blob.size)}</span>
            <a class="download-button secondary" href="${asset.url}" download="${escapeAttr(asset.filename)}">Download</a>
          </div>
        `).join("")}
      </div>
      <div class="metadata-snippet">
        <span>HTML metadata</span>
        <pre>${escapeHtml(metadata.html)}</pre>
      </div>
      <div class="download-actions">
        <a class="download-button" href="${metadataHref}" download="asset-pack-metadata.html">Download metadata HTML</a>
        <a class="download-button secondary" href="${manifestHref}" download="manifest.webmanifest">Download web manifest</a>
      </div>
    </div>
  `;
}

function assetPackItems(pack) {
  const items = {
    favicon: [
      ["favicon-16", "Favicon 16", 16, 16, "icon"],
      ["favicon-32", "Favicon 32", 32, 32, "icon"],
      ["favicon-48", "Favicon 48", 48, 48, "icon"],
      ["apple-touch-icon", "Apple Touch Icon", 180, 180, "icon"],
      ["pwa-192", "PWA Icon 192", 192, 192, "icon"],
      ["pwa-512", "PWA Icon 512", 512, 512, "icon"]
    ],
    social: [
      ["open-graph", "Open Graph", 1200, 630, "social"],
      ["twitter-card", "Twitter Card", 1200, 675, "social"],
      ["square-social", "Square Social", 1080, 1080, "social"],
      ["story", "Story", 1080, 1920, "social"],
      ["youtube-thumbnail", "YouTube Thumbnail", 1280, 720, "social"]
    ],
    app: [
      ["pwa-192", "PWA Icon 192", 192, 192, "icon"],
      ["pwa-512", "PWA Icon 512", 512, 512, "icon"],
      ["maskable-512", "Maskable Icon 512", 512, 512, "maskable"],
      ["app-store", "App Store Icon", 1024, 1024, "icon"]
    ]
  };
  if (pack === "launch") {
    return [...items.favicon, ...items.social.slice(0, 3), ...items.app.slice(2)];
  }
  return items[pack] || items.favicon;
}

function assetPackLabel(pack) {
  return {
    launch: "Launch kit",
    favicon: "Favicon and app icons",
    social: "Social cards",
    app: "PWA app icons"
  }[pack] || "Asset pack";
}

async function renderAssetPackItem(image, item, options, baseName, extension) {
  const [id, label, width, height, purpose] = item;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = options.background;
  context.fillRect(0, 0, width, height);
  const padding = options.fit === "cover" ? 0 : Math.min(width, height) * options.paddingPercent / 100;
  const targetWidth = Math.max(1, width - padding * 2);
  const targetHeight = Math.max(1, height - padding * 2);
  const scale = options.fit === "cover"
    ? Math.max(width / image.width, height / image.height)
    : Math.min(targetWidth / image.width, targetHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;
  const radius = Math.min(width, height) * options.radiusPercent / 100;
  if (radius > 0) {
    roundedRectPath(context, drawX, drawY, drawWidth, drawHeight, radius);
    context.save();
    context.clip();
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    context.restore();
  } else {
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }
  const blob = await canvasToBlob(canvas, options.format, options.quality);
  const url = trackObjectUrl(URL.createObjectURL(blob));
  return {
    id,
    label,
    width,
    height,
    purpose,
    blob,
    url,
    filename: `${baseName}-${id}-${width}x${height}.${extension}`
  };
}

function canvasToBlob(canvas, format, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not export this image."));
    }, format, quality);
  });
}

function assetPackMetadata(assets, extension) {
  const iconAssets = assets.filter((asset) => asset.purpose === "icon" || asset.purpose === "maskable");
  const og = assets.find((asset) => asset.id === "open-graph");
  const twitter = assets.find((asset) => asset.id === "twitter-card");
  const apple = assets.find((asset) => asset.id === "apple-touch-icon");
  const lines = [
    apple ? `<link rel="apple-touch-icon" sizes="${apple.width}x${apple.height}" href="/${apple.filename}">` : "",
    ...iconAssets.map((asset) => `<link rel="icon" type="image/${extension === "jpg" ? "jpeg" : extension}" sizes="${asset.width}x${asset.height}" href="/${asset.filename}">`),
    og ? `<meta property="og:image" content="/${og.filename}">` : "",
    twitter ? `<meta name="twitter:image" content="/${twitter.filename}">` : "",
    `<link rel="manifest" href="/manifest.webmanifest">`
  ].filter(Boolean);
  return {
    html: lines.join("\n"),
    manifest: {
      icons: iconAssets.map((asset) => ({
        src: `/${asset.filename}`,
        sizes: `${asset.width}x${asset.height}`,
        type: `image/${extension === "jpg" ? "jpeg" : extension}`,
        purpose: asset.purpose === "maskable" ? "maskable" : "any"
      }))
    }
  };
}

function pixelPaletteCss(colors) {
  return [
    ":root {",
    ...colors.map(({ color }, index) => `  --pixel-color-${String(index + 1).padStart(2, "0")}: ${color};`),
    "}"
  ].join("\n");
}

function pixelPaletteGpl(sourceName, colors) {
  return [
    "GIMP Palette",
    `Name: UtilityStack Pixel Palette - ${sourceName || "image"}`,
    "Columns: 8",
    "#",
    ...colors.map(({ color }) => {
      const [red, green, blue] = hexToRgb(color);
      return `${red.toString().padStart(3, " ")} ${green.toString().padStart(3, " ")} ${blue.toString().padStart(3, " ")} ${color}`;
    })
  ].join("\n");
}

function hexToRgb(color) {
  const value = safeHexColor(color, "#000000").slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

function renderPaletteSwatches(colors, downloads) {
  if (!colors.length) {
    return "";
  }
  return `
    <div class="palette-panel">
      <div class="palette-swatches">
        ${colors.map(({ color, count }) => `<span class="palette-swatch" title="${color} (${count} pixels)" style="background:${color}"></span>`).join("")}
      </div>
      <div class="download-actions">
        <a class="download-button secondary" href="${downloads.json}" download="pixel-art-palette.json">Download palette JSON</a>
        <a class="download-button secondary" href="${downloads.css}" download="pixel-art-palette.css">Download palette CSS</a>
        <a class="download-button secondary" href="${downloads.gpl}" download="pixel-art-palette.gpl">Download GPL palette</a>
      </div>
    </div>
  `;
}

function drawPixelGrid(context, width, height, scale, color) {
  if (scale < 2) {
    return;
  }
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.35;
  context.lineWidth = 1;
  context.beginPath();
  for (let x = scale; x < width; x += scale) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
  }
  for (let y = scale; y < height; y += scale) {
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
  }
  context.stroke();
  context.restore();
}

function reducePixelPalette(imageData, levels, dither) {
  const { data, width, height } = imageData;
  const step = 255 / Math.max(1, levels - 1);
  const quantize = (value) => Math.round(Math.max(0, Math.min(255, value)) / step) * step;
  const buffer = new Float32Array(data.length);
  for (let index = 0; index < data.length; index += 1) {
    buffer[index] = data[index];
  }

  const addError = (x, y, channel, amount) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const target = (y * width + x) * 4 + channel;
    buffer[target] += amount;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const oldValue = buffer[offset + channel];
        const newValue = quantize(oldValue);
        const errorValue = oldValue - newValue;
        buffer[offset + channel] = newValue;
        if (dither) {
          addError(x + 1, y, channel, errorValue * 7 / 16);
          addError(x - 1, y + 1, channel, errorValue * 3 / 16);
          addError(x, y + 1, channel, errorValue * 5 / 16);
          addError(x + 1, y + 1, channel, errorValue * 1 / 16);
        }
      }
    }
  }

  for (let index = 0; index < data.length; index += 4) {
    data[index] = Math.max(0, Math.min(255, Math.round(buffer[index])));
    data[index + 1] = Math.max(0, Math.min(255, Math.round(buffer[index + 1])));
    data[index + 2] = Math.max(0, Math.min(255, Math.round(buffer[index + 2])));
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function roundedRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

async function updateFileTool(options = {}) {
  if (!activeTool?.custom?.startsWith("file-")) {
    return;
  }

  const form = document.getElementById("active-tool-form");
  const result = document.getElementById("tool-result");
  if (!form || !result) {
    return;
  }

  const file = form.elements.sourceFile?.files?.[0];
  const textarea = form.elements.sourceText;
  if (options.readFile && file && textarea) {
    textarea.value = await file.text();
  }

  const sourceText = textarea?.value || "";
  if (!sourceText.trim()) {
    result.innerHTML = `<div class="upload-empty">Upload a file or paste content to begin.</div>`;
    return;
  }

  try {
    if (activeTool.custom === "file-csv-cleaner") {
      renderCsvCleanerResult(sourceText, result, {
        normalizeHeaders: Boolean(form.elements.csvNormalizeHeaders?.checked),
        removeDuplicates: Boolean(form.elements.csvRemoveDuplicates?.checked),
        keepEmptyColumns: Boolean(form.elements.csvKeepEmptyColumns?.checked)
      });
      return;
    }
    if (activeTool.custom === "file-csv-columns") {
      renderCsvColumnResult(sourceText, form.elements.columns?.value || "", result);
      return;
    }
    if (activeTool.custom === "file-json-formatter") {
      renderJsonFileResult(sourceText, form.elements.fileMode?.value || "pretty", result);
      return;
    }
    if (activeTool.custom === "file-word-counter") {
      renderTextFileStats(sourceText, result);
    }
  } catch (err) {
    result.innerHTML = error(err.message);
  }
}

function renderCsvCleanerResult(sourceText, result, options = {}) {
  const rawRows = parseCsv(sourceText);
  let rows = rawRows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell.length));
  if (!rows.length) {
    result.innerHTML = error("No CSV rows found.");
    return;
  }

  const originalRowCount = rows.length;
  const header = rows[0] || [];
  const body = rows.slice(1);
  const normalizedHeader = options.normalizeHeaders ? normalizeCsvHeaders(header) : header;
  const maxColumns = Math.max(...rows.map((row) => row.length), normalizedHeader.length);
  let keepIndexes = Array.from({ length: maxColumns }, (_, index) => index);
  if (!options.keepEmptyColumns) {
    keepIndexes = keepIndexes.filter((index) => index < normalizedHeader.length || body.some((row) => String(row[index] || "").trim()));
  }
  const seen = new Set();
  const cleanedBody = [];
  let duplicateRows = 0;
  for (const row of body) {
    const normalizedRow = keepIndexes.map((index) => row[index] || "");
    const signature = normalizedRow.join("\u001f");
    if (options.removeDuplicates && seen.has(signature)) {
      duplicateRows += 1;
      continue;
    }
    seen.add(signature);
    cleanedBody.push(normalizedRow);
  }
  rows = [
    keepIndexes.map((index) => normalizedHeader[index] || `column_${index + 1}`),
    ...cleanedBody
  ];
  const profile = csvQualityProfile(rows, {
    rawRows: rawRows.length,
    nonEmptyRows: originalRowCount,
    duplicateRows,
    removedColumns: maxColumns - keepIndexes.length,
    normalizedHeaders: options.normalizeHeaders
  });
  const cleaned = rows.map((cells) => cells.map(csvEscape).join(",")).join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(cleaned)}`;
  const report = JSON.stringify(profile, null, 2);
  const reportHref = `data:application/json;charset=utf-8,${encodeURIComponent(report)}`;
  result.innerHTML = `
    ${metrics([
      ["Rows", profile.rows],
      ["Columns", profile.columns],
      ["Empty rows removed", profile.emptyRowsRemoved],
      ["Duplicate rows removed", profile.duplicateRows],
      ["Empty columns removed", profile.removedColumns],
      ["Missing cells", profile.missingCells],
      ["Size", formatBytes(new Blob([cleaned]).size)]
    ])}
    <pre class="tool-output">${escapeHtml(cleaned)}</pre>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Column</th><th>Missing</th><th>Unique</th><th>Example</th></tr></thead>
        <tbody>
          ${profile.columnsProfile.map((column) => `
            <tr>
              <td>${escapeHtml(column.name)}</td>
              <td>${column.missing} (${column.missingRate})</td>
              <td>${column.unique}</td>
              <td>${escapeHtml(column.example || "-")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="download-actions">
      <a class="download-button" href="${csvHref}" download="cleaned.csv">Download cleaned CSV</a>
      <a class="download-button secondary" href="${reportHref}" download="csv-quality-report.json">Download quality report</a>
    </div>
  `;
}

function normalizeCsvHeaders(headers) {
  const seen = new Map();
  return headers.map((header, index) => {
    const base = slugify(header || `column-${index + 1}`).replace(/-/g, "_") || `column_${index + 1}`;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

function csvQualityProfile(rows, stats) {
  const headers = rows[0] || [];
  const body = rows.slice(1);
  const columnsProfile = headers.map((name, index) => {
    const values = body.map((row) => row[index] || "");
    const present = values.filter((value) => String(value).trim().length);
    return {
      name,
      missing: values.length - present.length,
      missingRate: values.length ? `${Math.round((values.length - present.length) / values.length * 100)}%` : "0%",
      unique: new Set(present).size,
      example: present[0] || ""
    };
  });
  return {
    rows: body.length,
    columns: headers.length,
    rawRows: stats.rawRows,
    emptyRowsRemoved: stats.rawRows - stats.nonEmptyRows,
    duplicateRows: stats.duplicateRows,
    removedColumns: stats.removedColumns,
    normalizedHeaders: stats.normalizedHeaders,
    missingCells: columnsProfile.reduce((sum, column) => sum + column.missing, 0),
    columnsProfile
  };
}

function renderCsvColumnResult(sourceText, columnsText, result) {
  const rows = parseCsv(sourceText)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell.length));
  if (rows.length < 2) {
    result.innerHTML = error("Enter a header row and at least one data row.");
    return;
  }

  const headers = rows[0];
  const requested = columnsText.split(",").map((column) => column.trim()).filter(Boolean);
  const indices = requested.map((column) => headers.indexOf(column)).filter((index) => index >= 0);
  if (!indices.length) {
    result.innerHTML = error("No matching columns found.");
    return;
  }

  const extracted = rows.map((row) => indices.map((index) => csvEscape(row[index] || "")).join(",")).join("\n");
  result.innerHTML = fileResultMarkup(extracted, "columns.csv", [
    ["Rows", rows.length],
    ["Columns", indices.length],
    ["Kept", indices.map((index) => headers[index]).join(", ")],
    ["Missing", requested.filter((column) => !headers.includes(column)).join(", ") || "None"]
  ]);
}

function renderJsonFileResult(sourceText, mode, result) {
  try {
    const parsed = JSON.parse(sourceText);
    result.innerHTML = renderJsonInspector(parsed, mode === "minify" ? "minify" : "pretty");
  } catch (err) {
    result.innerHTML = jsonErrorMarkup(sourceText, err);
  }
}

function renderJsonInspector(parsed, mode) {
  const formatted = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
  const summary = jsonSummary(parsed);
  const paths = jsonPaths(parsed).slice(0, 80);
  const typeCounts = jsonTypeCounts(parsed);
  const report = {
    mode,
    summary,
    typeCounts,
    pathCount: jsonPaths(parsed).length,
    samplePaths: paths
  };
  const formattedHref = `data:application/json;charset=utf-8,${encodeURIComponent(formatted)}`;
  const reportHref = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
  return `
    <div class="file-result">
      ${metrics([
        ["Mode", mode === "minify" ? "Minified" : "Pretty"],
        ["Type", summary.type],
        ["Top level", summary.topLevel],
        ["Depth", summary.depth],
        ["Paths", report.pathCount],
        ["Objects", typeCounts.object],
        ["Arrays", typeCounts.array],
        ["Scalars", typeCounts.scalar],
        ["Size", formatBytes(new Blob([formatted]).size)]
      ])}
      <pre class="tool-output json-highlighted">${syntaxHighlightJson(formatted)}</pre>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Path</th><th>Type</th><th>Preview</th></tr></thead>
          <tbody>
            ${paths.map((item) => `<tr><td>${escapeHtml(item.path)}</td><td>${item.type}</td><td>${escapeHtml(item.preview)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="download-actions">
        <a class="download-button" href="${formattedHref}" download="formatted.json">Download formatted JSON</a>
        <a class="download-button secondary" href="${reportHref}" download="json-inspection-report.json">Download inspection report</a>
      </div>
    </div>
  `;
}

function syntaxHighlightJson(json) {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /(&quot;(?:\\.|[^\\])*?&quot;(?:\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let kind = "number";
      if (match.startsWith("&quot;")) {
        kind = match.endsWith(":") ? "key" : "string";
      } else if (match === "true" || match === "false") {
        kind = "boolean";
      } else if (match === "null") {
        kind = "null";
      }
      return `<span class="json-${kind}">${match}</span>`;
    }
  );
}

function renderTextFileStats(sourceText, result) {
  const words = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const lines = sourceText ? sourceText.split(/\r?\n/).length : 0;
  result.innerHTML = `
    <div class="result-grid">
      <div><span>Words</span><strong>${words}</strong></div>
      <div><span>Characters</span><strong>${sourceText.length}</strong></div>
      <div><span>Lines</span><strong>${lines}</strong></div>
      <div><span>Reading time</span><strong>${Math.max(1, Math.ceil(words / 225))} min</strong></div>
      <div><span>File size</span><strong>${formatBytes(new Blob([sourceText]).size)}</strong></div>
      <div><span>Average line</span><strong>${lines ? Math.round(sourceText.length / lines) : 0} chars</strong></div>
    </div>
  `;
}

function fileResultMarkup(text, filename, metricsItems) {
  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  return `
    <div class="file-result">
      ${metrics(metricsItems)}
      <pre class="tool-output">${escapeHtml(text)}</pre>
      <a class="download-button" href="${href}" download="${filename}">Download ${filename}</a>
    </div>
  `;
}

function jsonSummary(value) {
  if (Array.isArray(value)) {
    return {
      type: "Array",
      topLevel: `${value.length} items`,
      depth: jsonDepth(value)
    };
  }
  if (value && typeof value === "object") {
    return {
      type: "Object",
      topLevel: `${Object.keys(value).length} keys`,
      depth: jsonDepth(value)
    };
  }
  return {
    type: value === null ? "Null" : typeof value,
    topLevel: "Scalar",
    depth: 1
  };
}

function jsonDepth(value) {
  if (!value || typeof value !== "object") {
    return 1;
  }
  const children = Array.isArray(value) ? value : Object.values(value);
  if (!children.length) {
    return 1;
  }
  return 1 + Math.max(...children.map(jsonDepth));
}

function jsonPaths(value, path = "$") {
  const type = jsonValueType(value);
  const preview = jsonPreview(value);
  if (!value || typeof value !== "object") {
    return [{ path, type, preview }];
  }
  const entries = Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.entries(value);
  const current = [{ path, type, preview }];
  return current.concat(entries.flatMap(([key, child]) => {
    const childPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
    return jsonPaths(child, childPath);
  }));
}

function jsonTypeCounts(value) {
  const counts = { object: 0, array: 0, string: 0, number: 0, boolean: 0, null: 0, scalar: 0 };
  for (const item of jsonPaths(value)) {
    if (item.type === "object") counts.object += 1;
    else if (item.type === "array") counts.array += 1;
    else {
      counts[item.type] = (counts[item.type] || 0) + 1;
      counts.scalar += 1;
    }
  }
  return counts;
}

function jsonValueType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value === "object" ? "object" : typeof value;
}

function jsonPreview(value) {
  if (value === null) return "null";
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 77)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "object") return `${Object.keys(value).length} keys`;
  return "";
}

function jsonErrorMarkup(sourceText, err) {
  const location = jsonErrorLocation(sourceText, err);
  const details = location
    ? [["Line", location.line], ["Column", location.column], ["Position", location.position]]
    : [["Status", "Invalid JSON"], ["Characters", sourceText.length], ["Hint", "Check quotes and commas"]];
  return `
    ${error(err.message)}
    ${metrics(details)}
  `;
}

function jsonErrorLocation(sourceText, err) {
  const match = String(err.message || "").match(/position\s+(\d+)/i);
  if (!match) {
    return null;
  }
  const position = Number.parseInt(match[1], 10);
  if (!Number.isFinite(position)) {
    return null;
  }
  const before = String(sourceText || "").slice(0, position);
  const lines = before.split(/\n/);
  return {
    position,
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(sourceText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const text = String(sourceText || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted field.");
  }

  return rows;
}

function updateQrTool() {
  if (activeTool?.custom !== "qr-code") {
    return;
  }

  const form = document.getElementById("active-tool-form");
  const result = document.getElementById("tool-result");
  if (!form || !result) {
    return;
  }

  const text = form.elements.qrText?.value || "";
  const size = Math.min(1024, Math.max(128, Math.floor(num(form.elements.qrSize?.value)) || 320));
  const margin = Math.min(12, Math.max(0, Math.floor(num(form.elements.qrMargin?.value)) || 0));
  const level = form.elements.qrLevel?.value || "M";
  const foreground = safeHexColor(form.elements.qrForeground?.value, "#111827");
  const background = safeHexColor(form.elements.qrBackground?.value, "#ffffff");
  if (!text.trim()) {
    result.innerHTML = `<div class="upload-empty">Enter text or a URL to generate a QR code.</div>`;
    return;
  }

  if (typeof qrcode !== "function") {
    result.innerHTML = `<div class="upload-empty">Loading QR generator...</div>`;
    loadQrLibrary()
      .then(() => {
        if (activeTool?.custom === "qr-code") updateQrTool();
      })
      .catch(() => {
        if (activeTool?.custom === "qr-code" && result.isConnected) {
          result.innerHTML = error("QR code library could not be loaded. Reload the page and try again.");
        }
      });
    return;
  }

  try {
    const qr = qrcode(0, level);
    qr.addData(text);
    qr.make();
    const svg = qr.createSvgTag({
      cellSize: Math.max(2, Math.floor(size / qr.getModuleCount())),
      margin
    });
    const svgWithSize = colorizeQrSvg(svg, size, foreground, background);
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgWithSize)}`;
    const contentType = qrContentType(text);
    result.innerHTML = `
      <div class="qr-result">
        <div class="qr-preview">${svgWithSize}</div>
        <div class="result-grid">
          <div><span>Size</span><strong>${size} x ${size}</strong></div>
          <div><span>Modules</span><strong>${qr.getModuleCount()}</strong></div>
          <div><span>Error correction</span><strong>${level}</strong></div>
          <div><span>Content type</span><strong>${contentType}</strong></div>
          <div><span>Characters</span><strong>${text.length}</strong></div>
          <div><span>Colors</span><strong>${foreground} / ${background}</strong></div>
        </div>
        <div class="download-actions">
          <a class="download-button" href="${href}" download="qr-code.svg">Download SVG</a>
          <a class="download-button secondary is-disabled" data-qr-png href="#" download="qr-code.png">Download PNG</a>
        </div>
      </div>
    `;
    attachQrPngDownload(svgWithSize, size, result);
  } catch (err) {
    result.innerHTML = error(err.message);
  }
}

function attachQrPngDownload(svgString, size, container) {
  const img = new Image();
  img.onload = () => {
    const link = container.querySelector("[data-qr-png]");
    if (!link || !link.isConnected) return;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, size, size);
    try {
      link.href = canvas.toDataURL("image/png");
      link.classList.remove("is-disabled");
    } catch {
      link.remove();
    }
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

function loadQrLibrary() {
  if (typeof qrcode === "function") {
    return Promise.resolve();
  }
  if (qrLibraryPromise) {
    return qrLibraryPromise;
  }

  const configuredSrc = window.UtilityStackAssets?.qrLibrary || "vendor/qrcode-generator/qrcode.js";
  qrLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = configuredSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("QR library load failed."));
    document.head.appendChild(script);
  });

  return qrLibraryPromise;
}

function safeHexColor(value, fallback) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function colorizeQrSvg(svg, size, foreground, background) {
  // The vendored library already emits width/height; duplicates break strict XML parsing (e.g. loading the SVG as an image)
  return svg
    .replace(/<svg([^>]*)>/, (match, attrs) => `<svg${attrs.replace(/\s(?:width|height)="[^"]*"/g, "")} width="${size}" height="${size}">`)
    .replace(/fill="#ffffff"/gi, `fill="${background}"`)
    .replace(/fill="#000000"/gi, `fill="${foreground}"`);
}

function qrContentType(text) {
  const value = String(text || "").trim();
  if (/^https?:\/\//i.test(value)) return "URL";
  if (/^mailto:/i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email";
  if (/^tel:/i.test(value) || /^\+?[0-9][0-9\s().-]{6,}$/.test(value)) return "Phone";
  if (/^wifi:/i.test(value)) return "WiFi";
  return "Text";
}

function addRecent(toolId) {
  const recent = getRecent().filter((id) => id !== toolId);
  recent.unshift(toolId);
  storageSet(STORAGE_KEY, JSON.stringify(recent.slice(0, 5)));
  renderRecent();
}

function getRecent() {
  try {
    return JSON.parse(storageGet(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function getPinned() {
  try {
    return JSON.parse(storageGet(PINNED_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function isPinned(toolId) {
  return getPinned().includes(toolId);
}

function togglePinned(toolId) {
  const activeToolId = activeTool?.id || "";
  const pinned = getPinned();
  const next = pinned.includes(toolId)
    ? pinned.filter((id) => id !== toolId)
    : [toolId, ...pinned].slice(0, 12);
  storageSet(PINNED_STORAGE_KEY, JSON.stringify(next));
  renderPinned();
  renderCards(searchTools(search.value.trim()), { preserveOrder: Boolean(search.value.trim()) });
  if (activeToolId) {
    openTool(activeToolId, { scroll: false });
  }
}

function renderPinned() {
  if (!pinnedTools) return;
  const pinned = getPinned().map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  pinnedTools.innerHTML = pinned.length
    ? pinned.map((tool) => `<button type="button" data-tool-id="${tool.id}">${localizedToolTitle(tool)}</button>`).join("")
    : textFor("noPinned");
}

function renderRecent() {
  const recent = getRecent().map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  recentTools.innerHTML = recent.length
    ? recent.map((tool) => `<button type="button" data-tool-id="${tool.id}">${localizedToolTitle(tool)}</button>`).join("")
    : textFor("noRecent");
}

function initTheme() {
  const saved = storageGet("utilitystack_theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
}

function updateSidebarFrameHeight() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  if (window.matchMedia("(max-width: 920px)").matches) {
    sidebar.style.removeProperty("--sidebar-frame-height");
    return;
  }
  const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
  const top = Math.max(0, sidebar.getBoundingClientRect().top);
  const height = Math.max(240, Math.floor(viewportHeight - top - 16));
  sidebar.style.setProperty("--sidebar-frame-height", `${height}px`);
}

let sidebarFrameRaf = 0;

function queueSidebarFrameHeightUpdate() {
  if (sidebarFrameRaf) return;
  sidebarFrameRaf = window.requestAnimationFrame(() => {
    sidebarFrameRaf = 0;
    updateSidebarFrameHeight();
  });
}

function scrollToCategory(anchor, options = {}) {
  const normalized = String(anchor || "").replace(/^#/, "");
  if (!normalized) return false;
  if (search.value.trim()) {
    search.value = "";
    renderCards();
  }
  window.requestAnimationFrame(() => {
    const target = document.getElementById(normalized);
    if (target) {
      target.scrollIntoView({
        behavior: options.behavior || "smooth",
        block: "start"
      });
    }
  });
  return Boolean(document.getElementById(normalized));
}

toolGrid.addEventListener("click", (event) => {
  const pinButton = event.target.closest("[data-pin-tool-id]");
  if (pinButton) {
    togglePinned(pinButton.dataset.pinToolId);
    return;
  }
  const button = event.target.closest("[data-tool-id]");
  if (button) {
    toggleTool(button.dataset.toolId, {
      card: button.closest(".tool-card"),
      scroll: true
    });
  }
});

pinnedTools?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool-id]");
  if (button) toggleTool(button.dataset.toolId, { scroll: true });
});

recentTools.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool-id]");
  if (button) toggleTool(button.dataset.toolId, { scroll: true });
});

document.querySelector(".sidebar")?.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const anchor = decodeURIComponent(link.getAttribute("href").slice(1));
  event.preventDefault();
  if (scrollToCategory(anchor)) {
    history.replaceState(null, "", `#${anchor}`);
  }
});

workspace.addEventListener("click", async (event) => {
  const decisionButton = event.target.closest("[data-decision-action]");
  if (decisionButton) {
    updateDecisionTool({ animate: true });
    return;
  }
  const shareButton = event.target.closest("[data-share-tool]");
  if (shareButton && activeTool) {
    const url = buildShareUrl(activeTool);
    try {
      await navigator.clipboard.writeText(url);
      shareButton.textContent = textFor("shareCopied");
    } catch {
      window.prompt("Copy this link:", url);
    }
    window.clearTimeout(Number(shareButton.dataset.shareTimer || 0));
    shareButton.dataset.shareTimer = String(window.setTimeout(() => {
      shareButton.textContent = textFor("shareLink");
    }, 2000));
    return;
  }
  const clearButton = event.target.closest("[data-clear-field]");
  if (clearButton) {
    event.preventDefault();
    const form = clearButton.closest("form");
    const field = form?.elements[clearButton.dataset.clearField];
    if (field) {
      field.value = "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.focus();
    }
    return;
  }
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  if (!button.dataset.copyLabel) {
    button.dataset.copyLabel = button.textContent;
  }
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }
  window.clearTimeout(Number(button.dataset.copyTimer || 0));
  button.dataset.copyTimer = String(window.setTimeout(() => {
    button.textContent = button.dataset.copyLabel;
  }, 2000));
});

workspace.addEventListener("reset", (event) => {
  if (!event.target.closest("#active-tool-form") || !activeTool) return;
  window.setTimeout(() => {
    if (activeTool.category === "Decision") {
      refreshDecisionIdleStage();
    } else if (!activeTool.custom) {
      calculateActive(activeTool);
    }
  }, 0);
});

workspace.addEventListener("dragover", (event) => {
  const zone = event.target.closest(".file-field");
  if (!zone) return;
  event.preventDefault();
  zone.classList.add("is-drag-over");
});

workspace.addEventListener("dragleave", (event) => {
  const zone = event.target.closest(".file-field");
  if (zone) zone.classList.remove("is-drag-over");
});

workspace.addEventListener("drop", (event) => {
  const zone = event.target.closest(".file-field");
  if (!zone) return;
  event.preventDefault();
  zone.classList.remove("is-drag-over");
  const input = zone.querySelector('input[type="file"]');
  if (!input || !event.dataTransfer?.files?.length) return;
  input.files = event.dataTransfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});

workspace.addEventListener("input", (event) => {
  if (event.target.closest("#active-tool-form") && activeTool?.custom?.startsWith("image-")) {
    updateImageTool();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.custom?.startsWith("file-")) {
    updateFileTool();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.custom === "qr-code") {
    updateQrTool();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.category === "Decision") {
    refreshDecisionIdleStage();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool) {
    calculateActive(activeTool);
  }
});

const REGEX_PRESETS = {
  email: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
  url: "https?:\\/\\/[^\\s\"'<>]+",
  ipv4: "\\b(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\b",
  date: "\\b\\d{4}-\\d{2}-\\d{2}\\b",
  hexcolor: "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b",
  number: "-?\\d+(?:\\.\\d+)?"
};

workspace.addEventListener("change", (event) => {
  if (activeTool?.id === "regex-tester" && event.target.name === "preset" && REGEX_PRESETS[event.target.value]) {
    const form = document.getElementById("active-tool-form");
    if (form?.elements.pattern) {
      form.elements.pattern.value = REGEX_PRESETS[event.target.value];
    }
  }
  if (event.target.closest("#active-tool-form") && activeTool?.custom?.startsWith("image-")) {
    updateImageTool();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.custom?.startsWith("file-")) {
    updateFileTool({ readFile: event.target.type === "file" });
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.custom === "qr-code") {
    updateQrTool();
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool?.category === "Decision") {
    return;
  }
  if (event.target.closest("#active-tool-form") && activeTool) {
    calculateActive(activeTool);
  }
});

search.addEventListener("input", () => {
  const query = search.value.trim();
  renderCards(searchTools(query), { preserveOrder: Boolean(query) });
});

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  storageSet("utilitystack_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

languageSelect?.addEventListener("change", () => {
  const activeToolId = activeTool?.id || "";
  const nextLanguage = languageCodes.has(languageSelect.value) ? languageSelect.value : "en";
  currentLanguage = nextLanguage;
  storageSet(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyLocale();
  renderCards(searchTools(search.value.trim()), { preserveOrder: Boolean(search.value.trim()) });
  renderPinned();
  renderRecent();
  if (activeToolId) {
    openTool(activeToolId, { scroll: false });
  }
});

initTheme();
populateLanguageSelect();
applyLocale();
renderCards();
renderPinned();
renderRecent();
updateSidebarFrameHeight();
window.addEventListener("resize", queueSidebarFrameHeightUpdate);
window.addEventListener("scroll", queueSidebarFrameHeightUpdate, { passive: true });
window.visualViewport?.addEventListener("resize", queueSidebarFrameHeightUpdate);
const initialTool = findToolBySlug(initialToolSlugFromLocation());
if (initialTool) {
  openTool(initialTool.id, { scroll: false });
  applySharedStateFromUrl(initialTool);
}
if (location.hash) {
  history.replaceState(null, "", `${location.pathname}${location.search}`);
}
window.scrollTo({ top: 0, left: 0 });
window.addEventListener("load", () => {
  window.setTimeout(() => {
    updateSidebarFrameHeight();
    window.scrollTo({ top: 0, left: 0 });
  }, 0);
});
