const STORAGE_KEY = "utilitystack_recent_tools";
let qrLibraryPromise = null;

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
    id: "sentence-counter",
    category: "Writing",
    anchor: "writing",
    title: "Sentence Counter",
    description: "Count sentences, words, and average words per sentence.",
    fields: [
      { id: "text", label: "Text", type: "textarea", value: "UtilityStack is fast. It helps you finish small tasks quickly." }
    ],
    calculate(values) {
      const text = String(values.text || "").trim();
      const sentences = text ? (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).length : 0;
      const words = text ? text.split(/\s+/).length : 0;
      return metrics([["Sentences", sentences], ["Words", words], ["Avg words", sentences ? (words / sentences).toFixed(1) : "0"]]);
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
    id: "grade-percentage-calculator",
    category: "Education",
    anchor: "education",
    title: "Grade Percentage Calculator",
    description: "Calculate grade percentage from earned and total points.",
    fields: [
      { id: "earned", label: "Earned points", type: "number", value: 87, step: 0.01 },
      { id: "total", label: "Total points", type: "number", value: 100, step: 0.01 }
    ],
    calculate(values) {
      const total = num(values.total);
      if (total <= 0) return error("Total points must be greater than zero.");
      const percentage = num(values.earned) / total;
      const letter = percentage >= 0.9 ? "A" : percentage >= 0.8 ? "B" : percentage >= 0.7 ? "C" : percentage >= 0.6 ? "D" : "F";
      return metrics([["Percentage", pct(percentage)], ["Letter", letter], ["Points", `${num(values.earned)}/${total}`]]);
    }
  },
  {
    id: "study-timer-planner",
    category: "Education",
    anchor: "education",
    title: "Study Timer Planner",
    description: "Plan study blocks with breaks.",
    fields: [
      { id: "total", label: "Total minutes", type: "number", value: 120, step: 1 },
      { id: "block", label: "Study block minutes", type: "number", value: 25, step: 1 },
      { id: "break", label: "Break minutes", type: "number", value: 5, step: 1 }
    ],
    calculate(values) {
      const total = Math.max(1, num(values.total));
      const cycle = Math.max(1, num(values.block) + num(values.break));
      const cycles = Math.floor(total / cycle);
      const study = cycles * num(values.block) + Math.max(0, total - cycles * cycle);
      return metrics([["Cycles", cycles], ["Study minutes", Math.round(study)], ["Break minutes", Math.max(0, Math.round(total - study))]]);
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
    id: "ip-to-integer-converter",
    category: "Network",
    anchor: "network",
    title: "IP to Integer Converter",
    description: "Convert an IPv4 address to a numeric value.",
    fields: [
      { id: "ip", label: "IPv4 address", type: "text", value: "192.168.1.1" }
    ],
    calculate(values) {
      const parts = String(values.ip || "").split(".").map((part) => Number(part));
      if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return error("Enter a valid IPv4 address.");
      const integer = parts.reduce((sum, part) => (sum << 8) + part, 0) >>> 0;
      return metrics([["Integer", integer.toLocaleString("en-US")], ["Hex", `0x${integer.toString(16).toUpperCase()}`], ["IP", parts.join(".")]]);
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
    id: "lorem-ipsum-generator",
    category: "Text",
    anchor: "text",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs for layouts.",
    fields: [
      { id: "paragraphs", label: "Paragraphs", type: "number", value: 3, step: 1 }
    ],
    calculate(values) {
      const count = Math.min(20, Math.max(1, Math.floor(num(values.paragraphs))));
      const paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo non nibh facilisis gravida.";
      return output(Array.from({ length: count }, () => paragraph).join("\n\n"));
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
    id: "list-randomizer",
    category: "Data",
    anchor: "data",
    title: "List Randomizer",
    description: "Shuffle a list of lines into a random order.",
    fields: [
      { id: "items", label: "Items", type: "textarea", value: "Alpha\nBeta\nGamma\nDelta" }
    ],
    calculate(values) {
      const items = String(values.items || "").split(/\r?\n/).filter(Boolean);
      for (let index = items.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
      }
      return output(items.join("\n"));
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
const recentTools = document.getElementById("recent-tools");
const themeToggle = document.getElementById("theme-toggle");
let activeTool = null;

const highValueCategories = new Set(["Finance", "Business", "SEO", "Image", "Data"]);
const categoryOrder = ["Image", "Data", "Developer", "Text", "Finance", "Business", "SEO", "Security", "Time", "Converters", "Writing", "Education", "Network", "Health", "Generators"];
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
  if (["Developer", "Data", "Security", "Writing"].includes(tool.category)) return "medium";
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
  const message = {
    "local-file": "Files are processed in your browser. They do not need to be uploaded to our servers.",
    "private-input": "Input is processed in your browser. No account is required, and pasted content does not need server upload.",
    browser: "Runs in your browser with no account required."
  }[level];
  return `
    <div class="privacy-note" data-privacy-level="${level}">
      <strong>Private by design</strong>
      <span>${message}</span>
    </div>
  `;
}

function toolMetadata(tool) {
  const slug = slugify(tool.id || tool.title);
  const categorySlug = slugify(tool.category);
  const intent = toolIntent(tool);
  const opportunity = toolOpportunity(tool);
  return {
    slug,
    categorySlug,
    intent,
    tier: toolTier(tool),
    priority: opportunity.score >= 80 ? "flagship" : highValueCategories.has(tool.category) || tool.custom ? "primary" : "standard",
    opportunity,
    searchText: `${tool.title} ${tool.category} ${tool.description} ${slug} ${categorySlug} ${intent} ${opportunity.demand} ${opportunity.moat}`.toLowerCase()
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
  const tokens = normalized.split(/\s+/).filter(Boolean);
  let score = toolRank(tool);
  if (title === normalized || slug === normalized) score += 120;
  if (title.startsWith(normalized) || slug.startsWith(normalized)) score += 90;
  if (title.includes(normalized) || slug.includes(normalized)) score += 70;
  if (category.includes(normalized)) score += 35;
  if (description.includes(normalized)) score += 25;
  for (const token of tokens) {
    if (title.includes(token)) score += 24;
    if (slug.includes(token)) score += 20;
    if (category.includes(token)) score += 10;
    if (description.includes(token)) score += 8;
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
    .filter(({ tool, score }) => score > toolRank(tool) || toolMetadata(tool).searchText.includes(normalized))
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title))
    .map(({ tool }) => tool);
}

function findToolBySlug(slug) {
  const normalized = slugify(slug);
  return tools.find((tool) => tool.id === normalized || toolMetadata(tool).slug === normalized);
}

function initialToolSlugFromLocation() {
  const pathMatch = location.pathname.match(/\/tools\/([^/]+)\/?$/);
  if (pathMatch) return pathMatch[1];
  const params = new URLSearchParams(location.search);
  return params.get("tool") || "";
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

function metrics(items) {
  return `<div class="result-grid">${items.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
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
    effectiveRpm: pageviews ? revenue / pageviews * 1000 : 0,
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
      const principal = Math.min(balance, mortgagePayment - interest);
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
  const months = Math.round(years * 12);
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

function passwordStrengthMarkup(password) {
  const analysis = analyzePassword(password);
  return `
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
    const expStatus = jwtTimeStatus(payload.exp, "Expires");
    return `
      ${metrics([
        ["Algorithm", decoded.header.alg || "-"],
        ["Type", decoded.header.typ || "JWT"],
        ["Subject", payload.sub || "-"],
        ["Issuer", payload.iss || "-"],
        ["Audience", Array.isArray(payload.aud) ? payload.aud.join(", ") : payload.aud || "-"],
        ["Expiry", expStatus]
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
    <div class="diff-view" aria-label="Text diff result">
      ${operations.map((item) => `
        <div class="diff-row diff-${item.type}">
          <span>${item.type === "added" ? "+" : item.type === "removed" ? "-" : " "}</span>
          <code>${escapeHtml(item.text || " ")}</code>
        </div>
      `).join("")}
    </div>
    <a class="download-button" href="${href}" download="text-diff.patch">Download diff</a>
  `;
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
        <h2>No matching tools</h2>
        <p>Try a simpler search like JSON, image, CSV, regex, password, or calculator.</p>
      </section>
    `;
    return;
  }
  const groups = items.reduce((acc, tool) => {
    acc[tool.category] = acc[tool.category] || [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  toolGrid.innerHTML = Object.entries(groups).sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  }).map(([category, categoryTools]) => {
    const anchor = categoryTools[0]?.anchor || category.toLowerCase();
    const sortedTools = options.preserveOrder ? categoryTools : categoryTools.slice().sort((a, b) => toolRank(b) - toolRank(a));
    return `
      <section class="category-section" id="${anchor}">
        <div class="category-heading">
          <h2>${category}</h2>
          <span>${categoryTools.length} ${categoryTools.length === 1 ? "tool" : "tools"}</span>
        </div>
        <div class="tool-card-list">
          ${sortedTools.map((tool) => {
            const meta = toolMetadata(tool);
            return `
            <article class="tool-card" data-tool-card="${tool.id}" data-tool-slug="${meta.slug}" data-tool-intent="${meta.intent}" data-tool-tier="${meta.tier}" data-tool-priority="${meta.priority}" data-opportunity-score="${meta.opportunity.score}">
              <span>${tool.category}</span>
              <h3>${tool.title}</h3>
              <p>${tool.description}</p>
              <div class="tool-signals">
                <span>${meta.opportunity.score}</span>
                <span>${meta.opportunity.demand}</span>
                <span>${meta.opportunity.moat}</span>
              </div>
              <button type="button" data-tool-id="${tool.id}">Open tool</button>
            </article>
          `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function fieldMarkup(field) {
  if (field.type === "textarea") {
    return `<label><span>${field.label}</span><textarea id="${field.id}" name="${field.id}" rows="7">${escapeHtml(field.value || "")}</textarea></label>`;
  }
  if (field.type === "select") {
    return `<label><span>${field.label}</span><select id="${field.id}" name="${field.id}">${field.options.map(([value, label]) => `<option value="${value}" ${value === field.value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
  }
  return `<label><span>${field.label}</span><input id="${field.id}" name="${field.id}" type="${field.type}" value="${escapeAttr(field.value ?? "")}" step="${field.step || "any"}"></label>`;
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
          <span>${tool.category}</span>
          <h2>${tool.title}</h2>
          <p>${tool.description}</p>
        </div>
      </div>
      ${privacyNotice(tool)}
      ${imageToolMarkup(tool)}
      <div class="how-to">
        <h3>How to use</h3>
        <ol>
          <li>Choose a PNG, JPG, WebP, or AVIF image from your device.</li>
          <li>Adjust output settings for size, quality, format, or pixel style.</li>
          <li>Download the processed image when the preview is ready.</li>
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
          <span>${tool.category}</span>
          <h2>${tool.title}</h2>
          <p>${tool.description}</p>
        </div>
      </div>
      ${privacyNotice(tool)}
      ${fileToolMarkup(tool)}
      <div class="how-to">
        <h3>How to use</h3>
        <ol>
          <li>Upload a file or paste content into the input box.</li>
          <li>Adjust the options when available.</li>
          <li>Copy or download the processed result.</li>
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
          <span>${tool.category}</span>
          <h2>${tool.title}</h2>
          <p>${tool.description}</p>
        </div>
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
        <h3>How to use</h3>
        <ol>
          <li>Enter a URL or any text.</li>
          <li>Choose the QR size and error correction level.</li>
          <li>Download the generated SVG file.</li>
        </ol>
      </div>
    </article>
  `;
}

function openTool(toolId, options = {}) {
  const tool = tools.find((item) => item.id === toolId) || tools[0];
  activeTool = tool;
  document.querySelectorAll(".tool-card.is-active").forEach((card) => {
    card.classList.remove("is-active");
  });

  const triggerCard = options.card || document.querySelector(`[data-tool-card="${tool.id}"]`);
  if (triggerCard) {
    triggerCard.classList.add("is-active");
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
  } else {
    workspace.innerHTML = `
      <article class="active-tool">
        <div class="active-tool-header">
          <div>
            <span>${tool.category}</span>
            <h2>${tool.title}</h2>
            <p>${tool.description}</p>
          </div>
        </div>
        ${privacyNotice(tool)}
        <form class="tool-form" id="active-tool-form">${tool.fields.map(fieldMarkup).join("")}</form>
        <div class="tool-result" id="tool-result"></div>
        <div class="how-to">
          <h3>How to use</h3>
          <ol>
            <li>Enter your values in the tool fields.</li>
            <li>Review the result that updates automatically.</li>
            <li>Copy the output when you need to paste it elsewhere.</li>
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
  } else {
    calculateActive(tool);
  }
  if (options.scroll) {
    const target = triggerCard || workspace;
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
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
      pixelSvgUrl = URL.createObjectURL(new Blob([svgResult.svg], { type: "image/svg+xml" }));
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

      const resizedUrl = URL.createObjectURL(blob);
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
  const url = URL.createObjectURL(blob);
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
      <pre class="tool-output">${escapeHtml(formatted)}</pre>
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
      .then(() => updateQrTool())
      .catch(() => {
        result.innerHTML = error("QR code library could not be loaded. Reload the page and try again.");
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
        <a class="download-button" href="${href}" download="qr-code.svg">Download QR code</a>
      </div>
    `;
  } catch (err) {
    result.innerHTML = error(err.message);
  }
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
  return svg
    .replace("<svg ", `<svg width="${size}" height="${size}" `)
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 5)));
  renderRecent();
}

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderRecent() {
  const recent = getRecent().map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  recentTools.innerHTML = recent.length
    ? recent.map((tool) => `<button type="button" data-tool-id="${tool.id}">${tool.title}</button>`).join("")
    : "No recently used tools yet.";
}

function initTheme() {
  const saved = localStorage.getItem("utilitystack_theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
}

function lockAdFrames() {
  const containers = document.querySelectorAll(".ad-frame, .ad-section, .ad-slot");
  containers.forEach((element) => {
    element.style.setProperty("height", "96px", "important");
    element.style.setProperty("max-height", "96px", "important");
    element.style.setProperty("overflow", "hidden", "important");
  });
}

toolGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool-id]");
  if (button) {
    openTool(button.dataset.toolId, {
      card: button.closest(".tool-card"),
      scroll: true
    });
  }
});

recentTools.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tool-id]");
  if (button) openTool(button.dataset.toolId, { scroll: true });
});

workspace.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  await navigator.clipboard.writeText(button.dataset.copy);
  button.textContent = "Copied";
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
  if (event.target.closest("#active-tool-form") && activeTool) {
    calculateActive(activeTool);
  }
});

workspace.addEventListener("change", (event) => {
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
  localStorage.setItem("utilitystack_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

initTheme();
renderCards();
renderRecent();
lockAdFrames();
const initialTool = findToolBySlug(initialToolSlugFromLocation());
if (initialTool) {
  openTool(initialTool.id, { scroll: false });
}
if (!location.hash) {
  window.scrollTo({ top: 0, left: 0 });
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      lockAdFrames();
      window.scrollTo({ top: 0, left: 0 });
    }, 0);
  });
}
