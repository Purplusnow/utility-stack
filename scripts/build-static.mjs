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
const localeCodes = ["en", "ko", "ja", "zh", "es", "fr", "de", "pt", "it", "nl", "ru", "ar", "hi", "id", "vi", "th"];
const localizedToolContent = { ko: koToolContent };

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
vm.runInContext(`${appSource}\nthis.__build = { tools, toolMetadata, slugify, languages, translations, localizedToolTitleFor, localizedCategoryFor };`, sandbox, {
  filename: "app.js"
});

const { tools, toolMetadata, slugify, languages, translations, localizedToolTitleFor, localizedCategoryFor } = sandbox.__build;
const categories = new Map();

fs.rmSync(path.join(root, "tools"), { recursive: true, force: true });
fs.rmSync(path.join(root, "categories"), { recursive: true, force: true });
for (const [code] of languages) {
  if (code !== "en") fs.rmSync(path.join(root, code), { recursive: true, force: true });
}

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

function t(code, key) {
  return translations[code]?.[key] || translations.en[key] || key;
}

function localizedCategory(category, code) {
  return localizedCategoryFor(category, code);
}

function localizedTitle(tool, code) {
  return localizedToolTitleFor(tool, code);
}

function localePath(code, pathPart = "") {
  return code === "en" ? pathPart : `/${code}${pathPart}`;
}

function localizedToolUrl(tool, code) {
  return `${siteUrl}${localePath(code, `/tools/${toolMetadata(tool).slug}/`)}`;
}

function localizedToolPath(tool, code) {
  return localePath(code, `/tools/${toolMetadata(tool).slug}/`);
}

function localizedAssetPrefix(code) {
  return code === "en" ? "../../" : "../../../";
}

function localizedRelatedHref(slug, code) {
  return code === "en" ? `/tools/${slug}/` : `/${code}/tools/${slug}/`;
}

function languageLabel(code) {
  return {
    en: "Language",
    ko: "언어",
    ja: "言語",
    zh: "语言",
    es: "Idioma",
    fr: "Langue",
    de: "Sprache",
    pt: "Idioma",
    it: "Lingua",
    nl: "Taal",
    ru: "Язык",
    ar: "اللغة",
    hi: "भाषा",
    id: "Bahasa",
    vi: "Ngôn ngữ",
    th: "ภาษา"
  }[code] || "Language";
}

function categoryLinkLabel(category, code) {
  const name = localizedCategory(category, code);
  if (code === "en") return `${name} tools`;
  if (["ko", "ja", "zh", "th", "hi"].includes(code)) return `${name} ${t(code, "categorySuffix")}`;
  return name;
}

const seoCopy = {
  en: {
    titleSuffix: "Free Online Tool",
    freeOnline: "Free Online Tool",
    appCategory: (category) => `${category}Application`,
    description: (title, category) => `${title} is a free ${category.toLowerCase()} tool that runs directly in your browser with no account required.`,
    about: (title, category) => `${title} helps you complete a ${category.toLowerCase()} task quickly in the browser. It keeps the workflow focused on practical inputs, clear results, and copyable output so you can finish the job without installing software or creating an account.`,
    howTo: (title) => [`Open ${title} and review the default example.`, "Replace the sample values with your own inputs.", "Check the updated result in the tool workspace.", "Copy, download, or share the result when the tool provides that option."],
    faqs: (title) => [
      ["Is this tool free?", `Yes. ${title} is free to use in your browser.`],
      ["Do I need an account?", "No. UtilityStack tools are designed to run without sign-up."],
      ["Is my input uploaded?", "Most tools process input directly in your browser. File and private-input tools are labeled when local processing matters."],
      ["Can I share this setup?", "When a share button is available, it copies a link with the current settings so someone else can open the same setup."]
    ]
  },
  ko: {
    titleSuffix: "무료 온라인 도구",
    freeOnline: "무료 온라인 도구",
    appCategory: (category) => `${category} 도구`,
    description: (title, category) => `${title}는 계정 없이 브라우저에서 바로 사용할 수 있는 무료 ${category} 도구입니다.`,
    about: (title, category) => `${title}는 ${category} 작업을 빠르게 처리하기 위한 브라우저 기반 도구입니다. 설치나 회원가입 없이 값을 입력하고, 결과를 확인하고, 필요한 경우 복사하거나 공유할 수 있도록 흐름을 단순하게 유지했습니다.`,
    howTo: (title) => [`${title}를 열고 기본 예시를 확인하세요.`, "샘플 값을 실제 입력값으로 바꾸세요.", "도구 영역에서 갱신된 결과를 확인하세요.", "필요하면 결과를 복사하거나 공유 링크를 사용하세요."],
    faqs: (title) => [
      ["무료로 사용할 수 있나요?", `네. ${title}는 브라우저에서 무료로 사용할 수 있습니다.`],
      ["계정이 필요한가요?", "아니요. UtilityStack 도구는 회원가입 없이 바로 사용할 수 있도록 설계했습니다."],
      ["입력값이 서버로 업로드되나요?", "대부분의 처리는 브라우저 안에서 이루어집니다. 파일이나 민감한 입력을 다루는 도구에는 로컬 처리 안내가 표시됩니다."],
      ["설정을 공유할 수 있나요?", "공유 버튼이 있는 도구는 현재 입력값을 담은 링크를 복사해 같은 설정을 다른 사람이 열 수 있게 합니다."]
    ]
  },
  ja: {
    titleSuffix: "無料オンラインツール",
    freeOnline: "無料オンラインツール",
    appCategory: (category) => `${category}ツール`,
    description: (title, category) => `${title} は、アカウント不要でブラウザから直接使える無料の ${category} ツールです。`,
    about: (title, category) => `${title} は、${category} の作業をブラウザ上で素早く片づけるためのツールです。インストールや登録をせずに入力、結果確認、コピーや共有まで進められます。`,
    howTo: (title) => [`${title} を開き、初期例を確認します。`, "サンプル値を自分の入力に置き換えます。", "ツール領域で更新された結果を確認します。", "必要に応じて結果をコピーまたは共有します。"],
    faqs: (title) => [["無料ですか？", `はい。${title} は無料で使えます。`], ["アカウントは必要ですか？", "いいえ。登録なしで利用できます。"], ["入力はアップロードされますか？", "多くの処理はブラウザ内で行われます。"], ["設定を共有できますか？", "共有ボタンがある場合、現在の設定を含むリンクをコピーできます。"]]
  },
  zh: {
    titleSuffix: "免费在线工具",
    freeOnline: "免费在线工具",
    appCategory: (category) => `${category}工具`,
    description: (title, category) => `${title} 是一款免费的 ${category} 工具，可直接在浏览器中使用，无需账户。`,
    about: (title, category) => `${title} 帮助你在浏览器中快速完成 ${category} 任务。无需安装或注册，即可输入数据、查看结果，并在需要时复制或分享。`,
    howTo: (title) => [`打开 ${title} 并查看默认示例。`, "用你的实际内容替换示例值。", "在工具区域查看更新后的结果。", "需要时复制结果或分享当前设置。"],
    faqs: (title) => [["这个工具免费吗？", `是的，${title} 可以免费使用。`], ["需要账户吗？", "不需要。UtilityStack 工具无需注册。"], ["输入会上传吗？", "大多数处理直接在浏览器中完成。"], ["可以分享设置吗？", "如果有分享按钮，可复制包含当前设置的链接。"]]
  },
  es: {
    titleSuffix: "Herramienta online gratis",
    freeOnline: "Herramienta online gratis",
    appCategory: (category) => `Herramienta de ${category}`,
    description: (title, category) => `${title} es una herramienta gratuita de ${category} que funciona directamente en el navegador, sin cuenta.`,
    about: (title, category) => `${title} te ayuda a completar tareas de ${category} desde el navegador. Mantiene un flujo práctico: introducir datos, revisar resultados y copiar o compartir la salida sin instalar software.`,
    howTo: (title) => [`Abre ${title} y revisa el ejemplo inicial.`, "Sustituye los valores de muestra por tus datos.", "Comprueba el resultado actualizado en el área de la herramienta.", "Copia, descarga o comparte el resultado cuando esté disponible."],
    faqs: (title) => [["¿Es gratis?", `Sí. ${title} es gratis.`], ["¿Necesito una cuenta?", "No. Puedes usar la herramienta sin registrarte."], ["¿Se suben mis datos?", "La mayoría de las herramientas procesan los datos en tu navegador."], ["¿Puedo compartir la configuración?", "Si hay botón de compartir, copia un enlace con los valores actuales."]]
  },
  fr: {
    titleSuffix: "Outil en ligne gratuit",
    freeOnline: "Outil en ligne gratuit",
    appCategory: (category) => `Outil ${category}`,
    description: (title, category) => `${title} est un outil ${category} gratuit utilisable directement dans le navigateur, sans compte.`,
    about: (title, category) => `${title} vous aide à traiter une tâche ${category} rapidement dans le navigateur. Le flux reste simple: saisir les valeurs, vérifier le résultat, puis copier ou partager si nécessaire.`,
    howTo: (title) => [`Ouvrez ${title} et consultez l'exemple par défaut.`, "Remplacez les valeurs par vos propres données.", "Vérifiez le résultat mis à jour dans l'espace de l'outil.", "Copiez, téléchargez ou partagez le résultat si l'option existe."],
    faqs: (title) => [["Est-ce gratuit ?", `Oui. ${title} est gratuit.`], ["Faut-il un compte ?", "Non. L'outil fonctionne sans inscription."], ["Mes données sont-elles envoyées ?", "La plupart des traitements se font dans votre navigateur."], ["Puis-je partager la configuration ?", "Le bouton de partage copie un lien avec les paramètres actuels."]]
  },
  de: {
    titleSuffix: "Kostenloses Online-Tool",
    freeOnline: "Kostenloses Online-Tool",
    appCategory: (category) => `${category}-Tool`,
    description: (title, category) => `${title} ist ein kostenloses ${category}-Tool, das direkt im Browser ohne Konto funktioniert.`,
    about: (title, category) => `${title} hilft dir, eine ${category}-Aufgabe direkt im Browser zu erledigen. Eingabe, Ergebnisprüfung und Kopieren oder Teilen bleiben ohne Installation und Konto möglich.`,
    howTo: (title) => [`Öffne ${title} und prüfe das Beispiel.`, "Ersetze die Beispielwerte durch deine Daten.", "Sieh dir das aktualisierte Ergebnis im Toolbereich an.", "Kopiere, lade herunter oder teile das Ergebnis, wenn verfügbar."],
    faqs: (title) => [["Ist das Tool kostenlos?", `Ja. ${title} ist kostenlos nutzbar.`], ["Brauche ich ein Konto?", "Nein. Die Nutzung ist ohne Anmeldung möglich."], ["Werden Eingaben hochgeladen?", "Die meisten Tools verarbeiten Eingaben im Browser."], ["Kann ich Einstellungen teilen?", "Wenn verfügbar, kopiert der Teilen-Button einen Link mit den aktuellen Werten."]]
  },
  pt: {
    titleSuffix: "Ferramenta online gratuita",
    freeOnline: "Ferramenta online gratuita",
    appCategory: (category) => `Ferramenta de ${category}`,
    description: (title, category) => `${title} é uma ferramenta gratuita de ${category} que roda direto no navegador, sem conta.`,
    about: (title, category) => `${title} ajuda a concluir tarefas de ${category} no navegador. O fluxo é direto: inserir dados, revisar o resultado e copiar ou compartilhar quando precisar.`,
    howTo: (title) => [`Abra ${title} e veja o exemplo inicial.`, "Substitua os valores de exemplo pelos seus dados.", "Confira o resultado atualizado na área da ferramenta.", "Copie, baixe ou compartilhe o resultado quando disponível."],
    faqs: (title) => [["É grátis?", `Sim. ${title} é gratuito.`], ["Preciso de conta?", "Não. A ferramenta funciona sem cadastro."], ["Meus dados são enviados?", "A maioria das ferramentas processa dados no navegador."], ["Posso compartilhar a configuração?", "Quando houver botão de compartilhamento, ele copia um link com os valores atuais."]]
  },
  it: {
    titleSuffix: "Strumento online gratuito",
    freeOnline: "Strumento online gratuito",
    appCategory: (category) => `Strumento ${category}`,
    description: (title, category) => `${title} è uno strumento ${category} gratuito che funziona direttamente nel browser, senza account.`,
    about: (title, category) => `${title} aiuta a completare attività ${category} nel browser. Inserisci i dati, controlla il risultato e copia o condividi quando serve.`,
    howTo: (title) => [`Apri ${title} e guarda l'esempio iniziale.`, "Sostituisci i valori di esempio con i tuoi dati.", "Controlla il risultato aggiornato nell'area dello strumento.", "Copia, scarica o condividi il risultato quando disponibile."],
    faqs: (title) => [["È gratis?", `Sì. ${title} è gratuito.`], ["Serve un account?", "No. Puoi usarlo senza registrazione."], ["I dati vengono caricati?", "La maggior parte degli strumenti elabora i dati nel browser."], ["Posso condividere la configurazione?", "Il pulsante di condivisione copia un link con i valori attuali."]]
  },
  nl: {
    titleSuffix: "Gratis online tool",
    freeOnline: "Gratis online tool",
    appCategory: (category) => `${category}-tool`,
    description: (title, category) => `${title} is een gratis ${category}-tool die direct in de browser werkt, zonder account.`,
    about: (title, category) => `${title} helpt je een ${category}-taak snel in de browser af te ronden. Je voert waarden in, controleert het resultaat en kopieert of deelt wanneer nodig.`,
    howTo: (title) => [`Open ${title} en bekijk het voorbeeld.`, "Vervang de voorbeeldwaarden door je eigen invoer.", "Controleer het bijgewerkte resultaat in de toolruimte.", "Kopieer, download of deel het resultaat wanneer dat kan."],
    faqs: (title) => [["Is dit gratis?", `Ja. ${title} is gratis.`], ["Heb ik een account nodig?", "Nee. Je gebruikt de tool zonder registratie."], ["Wordt mijn invoer geüpload?", "De meeste tools verwerken invoer in je browser."], ["Kan ik deze instellingen delen?", "Deelknoppen kopiëren een link met de huidige waarden."]]
  },
  ru: {
    titleSuffix: "Бесплатный онлайн-инструмент",
    freeOnline: "Бесплатный онлайн-инструмент",
    appCategory: (category) => `Инструмент ${category}`,
    description: (title, category) => `${title} — бесплатный инструмент ${category}, который работает прямо в браузере без учетной записи.`,
    about: (title, category) => `${title} помогает быстро выполнить задачу ${category} в браузере. Вы вводите данные, проверяете результат и при необходимости копируете или делитесь им.`,
    howTo: (title) => [`Откройте ${title} и посмотрите пример.`, "Замените пример своими данными.", "Проверьте обновленный результат в рабочей области.", "Скопируйте, скачайте или поделитесь результатом, если доступно."],
    faqs: (title) => [["Это бесплатно?", `Да. ${title} можно использовать бесплатно.`], ["Нужна учетная запись?", "Нет. Регистрация не требуется."], ["Данные загружаются на сервер?", "Большинство инструментов обрабатывает данные в браузере."], ["Можно поделиться настройками?", "Кнопка обмена копирует ссылку с текущими значениями."]]
  },
  ar: {
    titleSuffix: "أداة مجانية على الإنترنت",
    freeOnline: "أداة مجانية على الإنترنت",
    appCategory: (category) => `أداة ${category}`,
    description: (title, category) => `${title} أداة ${category} مجانية تعمل مباشرة في المتصفح من دون حساب.`,
    about: (title, category) => `تساعدك ${title} على إنجاز مهمة ${category} بسرعة داخل المتصفح. أدخل القيم، راجع النتيجة، ثم انسخها أو شاركها عند الحاجة.`,
    howTo: (title) => [`افتح ${title} وراجع المثال الافتراضي.`, "استبدل القيم التجريبية ببياناتك.", "راجع النتيجة المحدثة في مساحة الأداة.", "انسخ أو حمّل أو شارك النتيجة عند توفر ذلك."],
    faqs: (title) => [["هل الأداة مجانية؟", `نعم. ${title} مجانية الاستخدام.`], ["هل أحتاج إلى حساب؟", "لا. يمكن استخدامها من دون تسجيل."], ["هل يتم رفع بياناتي؟", "تتم معظم المعالجة داخل المتصفح."], ["هل يمكنني مشاركة الإعدادات؟", "زر المشاركة ينسخ رابطا بالقيم الحالية."]]
  },
  hi: {
    titleSuffix: "मुफ्त ऑनलाइन टूल",
    freeOnline: "मुफ्त ऑनलाइन टूल",
    appCategory: (category) => `${category} टूल`,
    description: (title, category) => `${title} एक मुफ्त ${category} टूल है जो बिना खाते के सीधे ब्राउज़र में चलता है।`,
    about: (title, category) => `${title} ब्राउज़र में ${category} कार्य जल्दी पूरा करने में मदद करता है। मान दर्ज करें, परिणाम देखें, और जरूरत होने पर कॉपी या साझा करें।`,
    howTo: (title) => [`${title} खोलें और डिफ़ॉल्ट उदाहरण देखें।`, "उदाहरण मानों को अपने इनपुट से बदलें।", "टूल क्षेत्र में अपडेट परिणाम देखें।", "उपलब्ध होने पर परिणाम कॉपी, डाउनलोड या साझा करें।"],
    faqs: (title) => [["क्या यह मुफ्त है?", `हाँ। ${title} मुफ्त है।`], ["क्या खाता चाहिए?", "नहीं। पंजीकरण की जरूरत नहीं है।"], ["क्या इनपुट अपलोड होता है?", "अधिकतर टूल इनपुट को ब्राउज़र में प्रोसेस करते हैं।"], ["क्या सेटअप साझा कर सकता हूँ?", "शेयर बटन मौजूदा मानों वाला लिंक कॉपी करता है।"]]
  },
  id: {
    titleSuffix: "Alat online gratis",
    freeOnline: "Alat online gratis",
    appCategory: (category) => `Alat ${category}`,
    description: (title, category) => `${title} adalah alat ${category} gratis yang berjalan langsung di browser tanpa akun.`,
    about: (title, category) => `${title} membantu menyelesaikan tugas ${category} di browser. Masukkan nilai, tinjau hasil, lalu salin atau bagikan jika diperlukan.`,
    howTo: (title) => [`Buka ${title} dan lihat contoh awal.`, "Ganti nilai contoh dengan input Anda.", "Periksa hasil yang diperbarui di area alat.", "Salin, unduh, atau bagikan hasil jika tersedia."],
    faqs: (title) => [["Apakah gratis?", `Ya. ${title} gratis digunakan.`], ["Apakah perlu akun?", "Tidak. Alat dapat digunakan tanpa pendaftaran."], ["Apakah input diunggah?", "Sebagian besar alat memproses input di browser."], ["Bisakah membagikan pengaturan?", "Tombol bagikan menyalin tautan dengan nilai saat ini."]]
  },
  vi: {
    titleSuffix: "Công cụ trực tuyến miễn phí",
    freeOnline: "Công cụ trực tuyến miễn phí",
    appCategory: (category) => `Công cụ ${category}`,
    description: (title, category) => `${title} là công cụ ${category} miễn phí chạy trực tiếp trong trình duyệt, không cần tài khoản.`,
    about: (title, category) => `${title} giúp hoàn thành tác vụ ${category} ngay trong trình duyệt. Nhập dữ liệu, xem kết quả, rồi sao chép hoặc chia sẻ khi cần.`,
    howTo: (title) => [`Mở ${title} và xem ví dụ mặc định.`, "Thay giá trị mẫu bằng dữ liệu của bạn.", "Kiểm tra kết quả cập nhật trong khu vực công cụ.", "Sao chép, tải xuống hoặc chia sẻ kết quả nếu có."],
    faqs: (title) => [["Có miễn phí không?", `Có. ${title} miễn phí.`], ["Có cần tài khoản không?", "Không. Bạn có thể dùng mà không cần đăng ký."], ["Dữ liệu có được tải lên không?", "Hầu hết công cụ xử lý dữ liệu trong trình duyệt."], ["Có thể chia sẻ thiết lập không?", "Nút chia sẻ sao chép liên kết chứa giá trị hiện tại."]]
  },
  th: {
    titleSuffix: "เครื่องมือออนไลน์ฟรี",
    freeOnline: "เครื่องมือออนไลน์ฟรี",
    appCategory: (category) => `เครื่องมือ ${category}`,
    description: (title, category) => `${title} เป็นเครื่องมือ ${category} ฟรีที่ทำงานในเบราว์เซอร์โดยไม่ต้องมีบัญชี`,
    about: (title, category) => `${title} ช่วยทำงานด้าน ${category} ได้รวดเร็วในเบราว์เซอร์ ใส่ค่า ตรวจผลลัพธ์ แล้วคัดลอกหรือแชร์ได้เมื่อจำเป็น`,
    howTo: (title) => [`เปิด ${title} และดูตัวอย่างเริ่มต้น`, "แทนค่าตัวอย่างด้วยข้อมูลของคุณ", "ตรวจผลลัพธ์ที่อัปเดตในพื้นที่เครื่องมือ", "คัดลอก ดาวน์โหลด หรือแชร์ผลลัพธ์เมื่อมีตัวเลือก"],
    faqs: (title) => [["ใช้งานฟรีไหม?", `ใช่ ${title} ใช้งานได้ฟรี`], ["ต้องมีบัญชีไหม?", "ไม่ต้องลงทะเบียน"], ["ข้อมูลถูกอัปโหลดไหม?", "เครื่องมือส่วนใหญ่ประมวลผลในเบราว์เซอร์"], ["แชร์การตั้งค่าได้ไหม?", "ปุ่มแชร์จะคัดลอกลิงก์พร้อมค่าปัจจุบัน"]]
  }
};

function localeSeo(code) {
  return seoCopy[code] || seoCopy.en;
}

function localizedGeneratedContent(tool, code) {
  const explicit = localizedToolContent[code]?.[tool.id];
  if (explicit) return explicit;
  const explicitEnglish = toolContent[tool.id];
  if (code === "en" && explicitEnglish) return explicitEnglish;
  const title = localizedTitle(tool, code);
  const category = localizedCategory(tool.category, code);
  const copy = localeSeo(code);
  return {
    title,
    heading: title,
    description: copy.description(title, category),
    intro: copy.about(title, category),
    howTo: copy.howTo(title, category),
    faqs: copy.faqs(title, category).map(([q, a]) => ({ q, a }))
  };
}

function renderLayout({ title, description, canonicalPath, body, schema, assetPrefix = "", lang = "en", alternates = [] }) {
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const alternateLinks = alternates.map(([hreflang, url]) => `  <link rel="alternate" hreflang="${hreflang}" href="${url}">`).join("\n");
  return `<!DOCTYPE html>
<html lang="${lang}"${lang === "ar" ? ' dir="rtl"' : ""}>
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
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y7L09HLWY8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y7L09HLWY8');
    gtag('event', 'conversion', {'send_to': 'AW-10836544398/mYjfCKSrmN0ZEI6Xoq8o'});
  </script>
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

function renderHeader(assetPrefix = "", lang = "en") {
  return `<header class="site-header">
    <a class="brand" href="${assetPrefix}index.html" aria-label="UtilityStack home">
      <span class="brand-mark">U</span>
      <span>UtilityStack</span>
    </a>
    <div class="header-actions">
      <label class="language-control" for="language-select">
        <span>${escapeHtml(languageLabel(lang))}</span>
        <select id="language-select" aria-label="Select language"></select>
      </label>
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme">◐</button>
    </div>
  </header>`;
}

function renderAppShell({ heading, subheading, assetPrefix = "", extraSections = "", lang = "en" }) {
  return `${renderHeader(assetPrefix, lang)}
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(subheading)}</p>
        <div class="search-wrap">
          <input id="tool-search" type="search" placeholder="${escapeHtml(t(lang, "searchPlaceholder"))}" autocomplete="off" aria-label="${escapeHtml(t(lang, "searchPlaceholder"))}">
        </div>
      </div>
    </section>
    <section class="layout">
      <aside class="sidebar" aria-label="Tool navigation">
        <div class="side-block">
          <h2>${escapeHtml(t(lang, "categories"))}</h2>
          ${orderedCategoryEntries().map(([category, entries]) => {
            const anchor = entries[0]?.tool.anchor || slugify(category);
            return `<a href="#${anchor}" data-category-anchor="${anchor}">${escapeHtml(categoryLinkLabel(category, lang))}</a>`;
          }).join("")}
        </div>
        <div class="side-block">
          <h2>${escapeHtml(t(lang, "pinned"))}</h2>
          <div id="pinned-tools" class="recent-list">${escapeHtml(t(lang, "noPinned"))}</div>
        </div>
        <div class="side-block">
          <h2>${escapeHtml(t(lang, "recent"))}</h2>
          <div id="recent-tools" class="recent-list">${escapeHtml(t(lang, "noRecent"))}</div>
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
    <span>${escapeHtml(t(lang, "footer"))}</span>
    <span class="footer-links"><a href="${assetPrefix}privacy/">${escapeHtml(t(lang, "privacy"))}</a><a href="${assetPrefix}terms/">${escapeHtml(t(lang, "terms"))}</a></span>
  </footer>`;
}

const contentHeadings = {
  en: { about: "About this tool", howTo: "How to use", faq: "Frequently asked questions", related: "Related tools" },
  ko: { about: "이 도구 소개", howTo: "사용 방법", faq: "자주 묻는 질문", related: "관련 도구" },
  ja: { about: "このツールについて", howTo: "使い方", faq: "よくある質問", related: "関連ツール" },
  zh: { about: "关于此工具", howTo: "使用方法", faq: "常见问题", related: "相关工具" },
  es: { about: "Acerca de esta herramienta", howTo: "Cómo usar", faq: "Preguntas frecuentes", related: "Herramientas relacionadas" },
  fr: { about: "À propos de cet outil", howTo: "Mode d'emploi", faq: "Questions fréquentes", related: "Outils associés" },
  de: { about: "Über dieses Tool", howTo: "So funktioniert es", faq: "Häufige Fragen", related: "Ähnliche Tools" },
  pt: { about: "Sobre esta ferramenta", howTo: "Como usar", faq: "Perguntas frequentes", related: "Ferramentas relacionadas" },
  it: { about: "Informazioni sullo strumento", howTo: "Come usare", faq: "Domande frequenti", related: "Strumenti correlati" },
  nl: { about: "Over deze tool", howTo: "Hoe te gebruiken", faq: "Veelgestelde vragen", related: "Gerelateerde tools" },
  ru: { about: "Об инструменте", howTo: "Как использовать", faq: "Частые вопросы", related: "Похожие инструменты" },
  ar: { about: "حول هذه الأداة", howTo: "طريقة الاستخدام", faq: "الأسئلة الشائعة", related: "أدوات ذات صلة" },
  hi: { about: "इस टूल के बारे में", howTo: "कैसे उपयोग करें", faq: "अक्सर पूछे जाने वाले प्रश्न", related: "संबंधित टूल" },
  id: { about: "Tentang alat ini", howTo: "Cara menggunakan", faq: "Pertanyaan umum", related: "Alat terkait" },
  vi: { about: "Giới thiệu công cụ", howTo: "Cách dùng", faq: "Câu hỏi thường gặp", related: "Công cụ liên quan" },
  th: { about: "เกี่ยวกับเครื่องมือนี้", howTo: "วิธีใช้", faq: "คำถามที่พบบ่อย", related: "เครื่องมือที่เกี่ยวข้อง" }
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
      ${related.length ? `<h2>${headings.related}</h2><ul class="related-tools">${related.map((item) => {
        const relatedTool = tools.find((candidate) => toolMetadata(candidate).slug === item.slug);
        const title = relatedTool ? localizedTitle(relatedTool, lang) : item.title;
        return `<li><a href="${localizedRelatedHref(item.slug, lang)}">${escapeHtml(title)}</a></li>`;
      }).join("")}</ul>` : ""}
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

function toolSchema(tool, meta, { lang = "en", url = `${siteUrl}/tools/${meta.slug}/`, name = tool.title, description = tool.description } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: localeSeo(lang).appCategory(localizedCategory(tool.category, lang)),
    operatingSystem: "Any",
    url,
    description,
    inLanguage: lang,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

function localizedBreadcrumbSchema(tool, meta, url, lang) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "UtilityStack", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: `${localizedCategory(tool.category, lang)} ${t(lang, "categorySuffix")}`, item: `${siteUrl}/categories/${meta.categorySlug || slugify(tool.category)}/` },
      { "@type": "ListItem", position: 3, name: localizedTitle(tool, lang), item: url }
    ]
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
  const alternates = [
    ...localeCodes.map((code) => [code, localizedToolUrl(tool, code)]),
    ["x-default", localizedToolUrl(tool, "en")]
  ];

  for (const code of localeCodes) {
    const content = localizedGeneratedContent(tool, code);
    const titleText = content?.title || localizedTitle(tool, code);
    const description = content?.description || localeSeo(code).description(titleText, localizedCategory(tool.category, code));
    const title = `${titleText} - ${localeSeo(code).titleSuffix} | UtilityStack`;
    const canonicalPath = localizedToolPath(tool, code);
    const url = `${siteUrl}${canonicalPath}`;
    const schema = [
      toolSchema(tool, meta, { lang: code, url, name: titleText, description }),
      localizedBreadcrumbSchema(tool, meta, url, code),
      faqSchema(content, url)
    ].filter(Boolean);
    const html = renderLayout({
      title,
      description,
      canonicalPath,
      assetPrefix: localizedAssetPrefix(code),
      lang: code,
      schema,
      alternates,
      body: renderAppShell({
        heading: content?.heading || titleText,
        subheading: description,
        assetPrefix: localizedAssetPrefix(code),
        lang: code,
        extraSections: toolContentSections(tool, content, { lang: code })
      })
    });
    const outputPath = code === "en"
      ? path.join(root, "tools", meta.slug, "index.html")
      : path.join(root, code, "tools", meta.slug, "index.html");
    writeFile(outputPath, html);
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
  ...localeCodes
    .filter((code) => code !== "en")
    .flatMap((code) => tools.map((tool) => `/${code}/tools/${toolMetadata(tool).slug}/`)),
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

console.log(`Generated ${tools.length * localeCodes.length} localized tool pages, ${categories.size} category pages, privacy page, terms page, sitemap.xml, and robots.txt.`);
