'use strict';

/* ==========================================================================
   مولّد قوالب لاتك — LaTeX Starter
   منتج هندسة عكسية: تحويل مشروع Next.js + React + TypeScript + Tailwind
   إلى HTML + CSS + JavaScript نقي دون أي إطار عمل أو بناء.
   --------------------------------------------------------------------------
   هذا الجزء: تعريفات الخيارات والبيانات الثابتة (مرآة لِـ lib/latex-options.ts).
   ========================================================================== */

/* ---------- الدوال المساعدة العامة (من assets/js/utils.js) ---------- */

const { escapeHtml, slugify, sanitizeFileName, saveBlob, copyToClipboard } =
  typeof module !== 'undefined' && module.exports
    ? require('./utils.js')
    : (typeof window !== 'undefined' ? window : globalThis).LX;

/* مكتبة JSZip الموردة محليًا (assets/js/vendor/jszip.min.js): كائن عام في المتصفح، ووحدة في Node */
const JSZipLib =
  typeof module !== 'undefined' && module.exports
    ? require('./vendor/jszip.min.js')
    : (typeof window !== 'undefined' ? window.JSZip : null);

/* ---------- أنواع القيم المسموحة (توثيق فقط) ----------
   Engine: pdflatex | xelatex | lualatex
   LangMode: english | arabic | multi
   LangCode: en | ar | fr | de | es | tr
   PdfArabic: arabtex | arabi
   LangPackage: polyglossia | babel
   DocClass: article|report|book|letter|beamer|scrartcl|scrreprt|scrbook
   Vocalize: novocalize | vocalize | fullvocalize
----------------------------------------------------------- */

const ENGINES = [
  { value: 'pdflatex', label: 'pdfLaTeX', hint: 'الأسرع والأكثر شيوعًا، دعم العربية محدود' },
  { value: 'xelatex', label: 'XeLaTeX', hint: 'يونيكود وخطوط النظام، الأنسب للعربية' },
  { value: 'lualatex', label: 'LuaLaTeX', hint: 'يونيكود مع إمكانات برمجية متقدمة' },
];

const LANG_MODES = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'العربية' },
  { value: 'multi', label: 'متعددة اللغات' },
];

const LANGS = {
  en: { label: 'الإنجليزية', native: 'English', babel: 'english', poly: 'english' },
  ar: { label: 'العربية', native: 'العربية', babel: 'arabic', poly: 'arabic' },
  fr: { label: 'الفرنسية', native: 'Français', babel: 'french', poly: 'french' },
  de: { label: 'الألمانية', native: 'Deutsch', babel: 'ngerman', poly: 'german' },
  es: { label: 'الإسبانية', native: 'Español', babel: 'spanish', poly: 'spanish' },
  tr: { label: 'التركية', native: 'Türkçe', babel: 'turkish', poly: 'turkish' },
};

const LANG_CODES = Object.keys(LANGS);

const PDF_ARABIC = [
  { value: 'arabi', label: 'Arabi', hint: 'babel + pdfLaTeX، إدخال UTF-8 مباشر' },
  { value: 'arabtex', label: 'ArabTeX', hint: 'الحزمة الكلاسيكية، نص عربي داخل arabtext' },
];

const LANG_PACKAGES = [
  { value: 'polyglossia', label: 'Polyglossia', hint: 'الحزمة الموصى بها للمحركات الحديثة' },
  { value: 'babel', label: 'babel', hint: 'الحزمة القياسية مع babelprovide' },
];

const VOCALIZE = [
  { value: 'novocalize', label: 'بدون تشكيل', hint: '\\novocalize' },
  { value: 'vocalize', label: 'تشكيل جزئي', hint: '\\vocalize' },
  { value: 'fullvocalize', label: 'تشكيل كامل', hint: '\\fullvocalize' },
];

const DOC_CLASSES = [
  { value: 'article', label: 'article — مقالة', icon: '📄' },
  { value: 'report', label: 'report — تقرير', icon: '📑' },
  { value: 'book', label: 'book — كتاب', icon: '📖' },
  { value: 'letter', label: 'letter — خطاب', icon: '✉️' },
  { value: 'beamer', label: 'beamer — عرض تقديمي', icon: '🖥️' },
  { value: 'scrartcl', label: 'scrartcl — مقالة (KOMA)', icon: '📃' },
  { value: 'scrreprt', label: 'scrreprt — تقرير (KOMA)', icon: '🗂️' },
  { value: 'scrbook', label: 'scrbook — كتاب (KOMA)', icon: '📚' },
];

const CHAPTER_CLASSES = ['report', 'book', 'scrreprt', 'scrbook'];
const ABSTRACT_CLASSES = ['article', 'report', 'scrartcl', 'scrreprt'];
const FRONTMATTER_CLASSES = ['book', 'scrbook'];
const SPLIT_CLASSES = ['report', 'book', 'scrreprt', 'scrbook'];
const COLUMN_CLASSES = ['article', 'report', 'book', 'scrartcl', 'scrreprt', 'scrbook'];

function fontSizesFor(docClass) {
  if (docClass === 'beamer') return ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '17pt', '20pt'];
  if (docClass === 'scrartcl' || docClass === 'scrreprt' || docClass === 'scrbook')
    return ['10pt', '11pt', '12pt', '14pt'];
  return ['10pt', '11pt', '12pt'];
}

const PAPERS = [
  { value: 'a4paper', label: 'A4 (210×297 مم)', icon: '📄' },
  { value: 'a5paper', label: 'A5 (148×210 مم)', icon: '📃' },
  { value: 'b5paper', label: 'B5 (176×250 مم)', icon: '🗒️' },
  { value: 'letterpaper', label: 'Letter (8.5×11 بوصة)', icon: '✉️' },
  { value: 'legalpaper', label: 'Legal (8.5×14 بوصة)', icon: '📜' },
  { value: 'executivepaper', label: 'Executive (7.25×10.5 بوصة)', icon: '🗃️' },
];

const MARGINS = [
  { value: '2cm', label: 'ضيقة — 2 سم', icon: '🗜️' },
  { value: '2.5cm', label: 'عادية — 2.5 سم', icon: '📄' },
  { value: '3cm', label: 'واسعة — 3 سم', icon: '🖼️' },
  { value: '1in', label: 'بوصة واحدة', icon: '📏' },
];

const SPACINGS = [
  { value: '1', label: 'مفرد', icon: '▬▬▬' },
  { value: '1.15', label: '1.15', icon: '▬\u2009▬\u2009▬' },
  { value: '1.5', label: '1.5 سطر', icon: '▬ ▬ ▬' },
  { value: '2', label: 'مزدوج', icon: '▬\u00A0\u00A0▬\u00A0\u00A0▬' },
];

const BEAMER_THEMES = [
  { value: 'default', label: 'default', icon: '🎨' },
  { value: 'Madrid', label: 'Madrid', icon: '💃' },
  { value: 'Warsaw', label: 'Warsaw', icon: '🏰' },
  { value: 'CambridgeUS', label: 'CambridgeUS', icon: '🎓' },
  { value: 'Berlin', label: 'Berlin', icon: '🐻' },
  { value: 'Copenhagen', label: 'Copenhagen', icon: '🚲' },
  { value: 'Singapore', label: 'Singapore', icon: '🦁' },
];

const ASPECTS = [
  { value: '169', label: '16:9', icon: '🖥️' },
  { value: '43', label: '4:3', icon: '📺' },
  { value: '1610', label: '16:10', icon: '💻' },
];

/* أيقونة ارتفاع لكل حجم خط: الشريط يطول مع تكبّر الحجم */
const PT_ICONS = {
  '8pt': '▁', '9pt': '▂', '10pt': '▃', '11pt': '▄',
  '12pt': '▅', '14pt': '▆', '17pt': '▇', '20pt': '█',
};

const FONT_ROLES = [
  { id: 'rm', label: 'Roman', hint: 'النص الأساسي — \\rmfamily' },
  { id: 'sf', label: 'Sans Serif', hint: 'بدون زوائد — \\sffamily' },
  { id: 'tt', label: 'Typewriter', hint: 'آلة كاتبة — \\ttfamily' },
];

const PDF_FONTS = {
  rm: [
    { id: 'cm', label: 'Computer Modern (الافتراضي)' },
    { id: 'lmodern', label: 'Latin Modern', lines: ['\\usepackage{lmodern}'] },
    { id: 'times', label: 'Times (mathptmx)', lines: ['\\usepackage{mathptmx}'] },
    { id: 'palatino', label: 'Palatino (mathpazo)', lines: ['\\usepackage{mathpazo}'] },
    { id: 'charter', label: 'Charter', lines: ['\\usepackage{charter}'] },
    { id: 'bookman', label: 'Bookman', lines: ['\\usepackage{bookman}'] },
    { id: 'libertine', label: 'Linux Libertine', lines: ['\\usepackage{libertine}'] },
  ],
  sf: [
    { id: 'cm', label: 'Computer Modern Sans (الافتراضي)' },
    { id: 'lmss', label: 'Latin Modern Sans', lines: ['\\renewcommand{\\sfdefault}{lmss}'] },
    { id: 'helvet', label: 'Helvetica', lines: ['\\usepackage[scaled=0.92]{helvet}'] },
    { id: 'avant', label: 'Avant Garde', lines: ['\\usepackage{avant}'] },
    { id: 'cabin', label: 'Cabin', lines: ['\\usepackage{cabin}'] },
  ],
  tt: [
    { id: 'cm', label: 'Computer Modern Typewriter (الافتراضي)' },
    { id: 'lmtt', label: 'Latin Modern Mono', lines: ['\\renewcommand{\\ttdefault}{lmtt}'] },
    { id: 'courier', label: 'Courier', lines: ['\\usepackage{courier}'] },
    { id: 'beramono', label: 'Bera Mono', lines: ['\\usepackage[scaled=0.85]{beramono}'] },
    { id: 'inconsolata', label: 'Inconsolata', lines: ['\\usepackage[varqu,varl]{inconsolata}'] },
  ],
};

const UNI_FONTS = {
  rm: [
    { id: 'default', label: 'Latin Modern Roman (الافتراضي)' },
    { id: 'termes', label: 'TeX Gyre Termes (Times)', family: 'TeX Gyre Termes' },
    { id: 'pagella', label: 'TeX Gyre Pagella (Palatino)', family: 'TeX Gyre Pagella' },
    { id: 'bonum', label: 'TeX Gyre Bonum (Bookman)', family: 'TeX Gyre Bonum' },
    { id: 'libertinus', label: 'Libertinus Serif', family: 'Libertinus Serif' },
    { id: 'stix', label: 'STIX Two Text', family: 'STIX Two Text' },
    { id: 'noto-serif', label: 'Noto Serif', family: 'Noto Serif' },
  ],
  sf: [
    { id: 'default', label: 'Latin Modern Sans (الافتراضي)' },
    { id: 'heros', label: 'TeX Gyre Heros (Helvetica)', family: 'TeX Gyre Heros' },
    { id: 'adventor', label: 'TeX Gyre Adventor (Avant Garde)', family: 'TeX Gyre Adventor' },
    { id: 'libertinus-sans', label: 'Libertinus Sans', family: 'Libertinus Sans' },
    { id: 'noto-sans', label: 'Noto Sans', family: 'Noto Sans' },
  ],
  tt: [
    { id: 'default', label: 'Latin Modern Mono (الافتراضي)' },
    { id: 'cursor', label: 'TeX Gyre Cursor (Courier)', family: 'TeX Gyre Cursor' },
    { id: 'inconsolata', label: 'Inconsolata', family: 'Inconsolata' },
    { id: 'dejavu-mono', label: 'DejaVu Sans Mono', family: 'DejaVu Sans Mono' },
    { id: 'noto-mono', label: 'Noto Sans Mono', family: 'Noto Sans Mono' },
  ],
};

const ARABIC_FONTS = [
  { id: 'amiri', label: 'Amiri — نسخ كلاسيكي', family: 'Amiri' },
  { id: 'noto-naskh', label: 'Noto Naskh Arabic — نسخ', family: 'Noto Naskh Arabic' },
  { id: 'scheherazade', label: 'Scheherazade New — نسخ', family: 'Scheherazade New' },
  { id: 'lateef', label: 'Lateef — نستعليق خفيف', family: 'Lateef' },
  { id: 'noto-sans', label: 'Noto Sans Arabic — بدون زوائد', family: 'Noto Sans Arabic' },
  { id: 'noto-kufi', label: 'Noto Kufi Arabic — كوفي', family: 'Noto Kufi Arabic' },
  { id: 'cairo', label: 'Cairo — بدون زوائد', family: 'Cairo' },
  { id: 'tajawal', label: 'Tajawal — بدون زوائد', family: 'Tajawal' },
  { id: 'traditional', label: 'Traditional Arabic (خط ويندوز)', family: 'Traditional Arabic' },
  { id: 'arial', label: 'Arial (خط النظام)', family: 'Arial' },
  { id: 'dejavu-mono', label: 'DejaVu Sans Mono — ثابت العرض', family: 'DejaVu Sans Mono' },
];

const PACKAGE_GROUPS = [
  { id: 'essential', label: 'الأساسية' },
  { id: 'math', label: 'الرياضيات' },
  { id: 'tables', label: 'الجداول والأشكال' },
  { id: 'graphics', label: 'الرسوم' },
  { id: 'layout', label: 'التنسيق والتخطيط' },
  { id: 'code', label: 'الشيفرة والخوارزميات' },
  { id: 'refs', label: 'المراجع والاقتباسات' },
];

const noBeamer = (cfg) => (cfg.docClass === 'beamer' ? 'غير مناسبة للعروض التقديمية' : null);

const PACKAGES = [
  {
    id: 'geometry', label: 'geometry', description: 'ضبط الهوامش وأبعاد الصفحة',
    group: 'essential', order: 10, disabled: noBeamer,
    line: (cfg) => {
      const opts = [`margin=${cfg.margin}`];
      if (cfg.orientation === 'landscape') opts.push('landscape');
      return `\\usepackage[${opts.join(', ')}]{geometry}`;
    },
  },
  {
    id: 'graphicx', label: 'graphicx', description: 'إدراج الصور بـ \\includegraphics',
    group: 'essential', order: 20,
    line: () => '\\usepackage{graphicx}',
  },
  {
    id: 'xcolor', label: 'xcolor', description: 'الألوان في النصوص والجداول',
    group: 'essential', order: 30,
    line: () => '\\usepackage[dvipsnames]{xcolor}',
  },
  {
    id: 'microtype', label: 'microtype', description: 'تحسين توزيع الحروف والمسافات',
    group: 'essential', order: 40,
    disabled: (cfg) => (cfg.engine === 'xelatex' ? 'دعمها محدود في XeLaTeX' : null),
    line: () => '\\usepackage{microtype}',
  },
  {
    id: 'hyperref', label: 'hyperref', description: 'روابط وفهارس قابلة للنقر داخل PDF',
    group: 'essential', order: 90,
    line: () => '\\usepackage{hyperref}',
    config: () => [
      '\\hypersetup{',
      '  colorlinks=true,',
      '  linkcolor=blue,',
      '  urlcolor=blue,',
      '  citecolor=blue',
      '}',
    ],
  },
  {
    id: 'amsmath', label: 'amsmath', description: 'بيئات المعادلات الأساسية',
    group: 'math', order: 50,
    line: () => '\\usepackage{amsmath}',
  },
  {
    id: 'amssymb', label: 'amssymb', description: 'رموز رياضية إضافية',
    group: 'math', order: 51,
    line: () => '\\usepackage{amssymb}',
  },
  {
    id: 'amsthm', label: 'amsthm', description: 'النظريات والبراهين',
    group: 'math', order: 52,
    line: () => '\\usepackage{amsthm}',
  },
  {
    id: 'mathtools', label: 'mathtools', description: 'امتداد لـ amsmath بأدوات إضافية',
    group: 'math', order: 53,
    line: () => '\\usepackage{mathtools}',
  },
  {
    id: 'bm', label: 'bm', description: 'رموز رياضية بخط عريض',
    group: 'math', order: 54,
    line: () => '\\usepackage{bm}',
  },
  {
    id: 'siunitx', label: 'siunitx', description: 'الوحدات والأرقام العلمية',
    group: 'math', order: 55,
    line: () => '\\usepackage{siunitx}',
  },
  {
    id: 'booktabs', label: 'booktabs', description: 'جداول احترافية بخطوط أنيقة',
    group: 'tables', order: 60,
    line: () => '\\usepackage{booktabs}',
  },
  {
    id: 'array', label: 'array', description: 'تحكم أدق في أعمدة الجداول',
    group: 'tables', order: 61,
    line: () => '\\usepackage{array}',
  },
  {
    id: 'tabularx', label: 'tabularx', description: 'جداول بعرض مرن',
    group: 'tables', order: 62,
    line: () => '\\usepackage{tabularx}',
  },
  {
    id: 'multirow', label: 'multirow', description: 'دمج الخلايا عموديًا',
    group: 'tables', order: 63,
    line: () => '\\usepackage{multirow}',
  },
  {
    id: 'longtable', label: 'longtable', description: 'جداول تمتد على عدة صفحات',
    group: 'tables', order: 64,
    line: () => '\\usepackage{longtable}',
  },
  {
    id: 'caption', label: 'caption', description: 'تخصيص عناوين الجداول والأشكال',
    group: 'tables', order: 65,
    line: () => '\\usepackage{caption}',
  },
  {
    id: 'subcaption', label: 'subcaption', description: 'أشكال فرعية داخل شكل واحد',
    group: 'tables', order: 66,
    line: () => '\\usepackage{subcaption}',
  },
  {
    id: 'float', label: 'float', description: 'التحكم في موضع الأشكال بالخيار [H]',
    group: 'tables', order: 67,
    line: () => '\\usepackage{float}',
  },
  {
    id: 'tikz', label: 'TikZ', description: 'رسم المخططات والأشكال البيانية',
    group: 'graphics', order: 70,
    line: () => '\\usepackage{tikz}',
  },
  {
    id: 'pgfplots', label: 'pgfplots', description: 'رسوم بيانية للدوال والبيانات',
    group: 'graphics', order: 71,
    line: () => '\\usepackage{pgfplots}',
    config: () => ['\\pgfplotsset{compat=newest}'],
  },
  {
    id: 'tcolorbox', label: 'tcolorbox', description: 'صناديق ملونة للتنبيهات والأمثلة',
    group: 'graphics', order: 72,
    line: () => '\\usepackage[most]{tcolorbox}',
  },
  {
    id: 'fancyhdr', label: 'fancyhdr', description: 'رأس وتذييل مخصّصان للصفحات',
    group: 'layout', order: 80, disabled: noBeamer,
    line: () => '\\usepackage{fancyhdr}',
    config: () => [
      '\\setlength{\\headheight}{15pt}',
      '\\pagestyle{fancy}',
      '\\fancyhf{}',
      '\\fancyhead[C]{\\nouppercase{\\leftmark}}',
      '\\fancyfoot[C]{\\thepage}',
    ],
  },
  {
    id: 'setspace', label: 'setspace', description: 'المسافة بين الأسطر (يُضاف تلقائيًا عند تغيير التباعد)',
    group: 'layout', order: 81,
    line: () => '\\usepackage{setspace}',
    config: (cfg) => {
      if (cfg.spacing === '1') return [];
      if (cfg.spacing === '1.5') return ['\\onehalfspacing'];
      if (cfg.spacing === '2') return ['\\doublespacing'];
      return [`\\setstretch{${cfg.spacing}}`];
    },
  },
  {
    id: 'enumitem', label: 'enumitem', description: 'تخصيص القوائم النقطية والمرقمة',
    group: 'layout', order: 82,
    line: () => '\\usepackage{enumitem}',
  },
  {
    id: 'titlesec', label: 'titlesec', description: 'تخصيص شكل العناوين',
    group: 'layout', order: 83, disabled: noBeamer,
    line: () => '\\usepackage{titlesec}',
  },
  {
    id: 'multicol', label: 'multicol', description: 'أعمدة متعددة داخل الصفحة',
    group: 'layout', order: 84,
    line: () => '\\usepackage{multicol}',
  },
  {
    id: 'appendix', label: 'appendix', description: 'إدارة الملاحق',
    group: 'layout', order: 85, disabled: noBeamer,
    line: () => '\\usepackage{appendix}',
  },
  {
    id: 'lipsum', label: 'lipsum', description: 'نص تجريبي بالأمر \\lipsum',
    group: 'layout', order: 86,
    line: () => '\\usepackage{lipsum}',
  },
  {
    id: 'listings', label: 'listings', description: 'عرض الشيفرة البرمجية',
    group: 'code', order: 75,
    line: () => '\\usepackage{listings}',
    config: () => ['\\lstset{basicstyle=\\ttfamily\\small, breaklines=true, frame=single}'],
  },
  {
    id: 'algorithm2e', label: 'algorithm2e', description: 'كتابة الخوارزميات',
    group: 'code', order: 76,
    line: () => '\\usepackage[ruled, vlined]{algorithm2e}',
  },
  {
    id: 'csquotes', label: 'csquotes', description: 'علامات اقتباس صحيحة حسب اللغة',
    group: 'refs', order: 87,
    line: () => '\\usepackage{csquotes}',
  },
  {
    id: 'biblatex', label: 'biblatex', description: 'مراجع حديثة مع biber',
    group: 'refs', order: 88,
    line: () => '\\usepackage[backend=biber, style=numeric]{biblatex}',
    config: () => ['% \\addbibresource{references.bib}'],
  },
  {
    id: 'natbib', label: 'natbib', description: 'مراجع كلاسيكية مع BibTeX',
    group: 'refs', order: 89,
    line: () => '\\usepackage[numbers]{natbib}',
  },
  {
    id: 'cleveref', label: 'cleveref', description: 'إحالات ذكية بالأمر \\cref',
    group: 'refs', order: 95,
    line: () => '\\usepackage{cleveref}',
  },
];

const DEFAULT_PACKAGES = [
  'geometry', 'graphicx', 'xcolor', 'microtype', 'hyperref', 'amsmath', 'amssymb', 'booktabs',
];

const defaultConfig = {
  mode: 'arabic',
  mainLang: 'en',
  extraLangs: ['ar'],
  engine: 'xelatex',
  pdfArabic: 'arabi',
  langPkg: 'polyglossia',
  vocalize: 'novocalize',
  numerals: 'eastern',
  docClass: 'article',
  fontSize: '12pt',
  paper: 'a4paper',
  margin: '2.5cm',
  orientation: 'portrait',
  columns: 1,
  sides: 'oneside',
  spacing: '1',
  beamerTheme: 'Madrid',
  aspect: '169',
  pdfFonts: { rm: 'cm', sf: 'cm', tt: 'cm' },
  uniFonts: { rm: 'default', sf: 'default', tt: 'default' },
  arabicFonts: { rm: 'amiri', sf: 'noto-sans', tt: 'dejavu-mono' },
  packages: [...DEFAULT_PACKAGES],
  titlePage: true,
  abstract: true,
  toc: false,
  sample: true,
  fileName: 'main',
  title: '',
  author: '',
  splitProject: false,
  projectName: 'my-thesis',
};

/* ==========================================================================
   الجزء الثاني: مولّد LaTeX (مرآة لِـ lib/latex-generator.ts) + باني ZIP
   + مُلوِّن الصياغة. هذه الكتلة نقية (لا DOM) وقابلة للاختبار في Node.
   ========================================================================== */

const ROLES = ['rm', 'sf', 'tt'];

function pickFont(list, id) {
  return list.find((f) => f.id === id) ?? list[0];
}

/* ---------- نصوص العيّنة بست لغات ---------- */

const TEXTS = {
  en: {
    title: 'Document Title',
    author: 'Author Name',
    abstract:
      'This document is a starting template generated for you. Replace this text with a short summary of your work.',
    intro: 'Introduction',
    introText:
      'This is the first section of your document. Write your content here, add citations and cross-references, and compile with your chosen engine.',
    math: 'Mathematics',
    mathText: "Displayed equations are numbered automatically, as in Euler's identity:",
    conclusion: 'Conclusion',
    conclusionText: 'Summarize your findings here.',
    outline: 'Outline',
    opening: 'Dear Sir or Madam,',
    closing: 'Sincerely,',
    recipient: ['Recipient Name', 'Street Address', 'City'],
    sender: ['Your Name', 'Your Address', 'City'],
    signature: 'Your Name',
  },
  ar: {
    title: 'عنوان الوثيقة',
    author: 'اسم المؤلف',
    abstract: 'هذه الوثيقة قالب مبدئي تم إنشاؤه لك. استبدل هذا النص بملخص موجز لعملك.',
    intro: 'مقدمة',
    introText:
      'هذا هو القسم الأول من وثيقتك. اكتب محتواك هنا، وأضف المراجع والإحالات، ثم قم بالترجمة باستخدام المحرك الذي اخترته.',
    math: 'الرياضيات',
    mathText: 'تُرقَّم المعادلات المستقلة تلقائيًا، كما في متطابقة أويلر:',
    conclusion: 'خاتمة',
    conclusionText: 'لخّص نتائجك هنا.',
    outline: 'المحتويات',
    opening: 'السيد المحترم،',
    closing: 'وتفضلوا بقبول فائق الاحترام،',
    recipient: ['اسم المستلم', 'العنوان', 'المدينة'],
    sender: ['اسمك', 'عنوانك', 'المدينة'],
    signature: 'اسمك',
  },
  fr: {
    title: 'Titre du document',
    author: "Nom de l'auteur",
    abstract:
      'Ce document est un modèle de départ généré pour vous. Remplacez ce texte par un bref résumé de votre travail.',
    intro: 'Introduction',
    introText:
      "Ceci est la première section de votre document. Écrivez votre contenu ici, ajoutez des références, puis compilez avec le moteur choisi.",
    math: 'Mathématiques',
    mathText: "Les équations hors ligne sont numérotées automatiquement, comme l'identité d'Euler :",
    conclusion: 'Conclusion',
    conclusionText: 'Résumez vos résultats ici.',
    outline: 'Plan',
    opening: 'Madame, Monsieur,',
    closing: 'Cordialement,',
    recipient: ['Nom du destinataire', 'Adresse', 'Ville'],
    sender: ['Votre nom', 'Votre adresse', 'Ville'],
    signature: 'Votre nom',
  },
  de: {
    title: 'Dokumenttitel',
    author: 'Name des Autors',
    abstract:
      'Dieses Dokument ist eine automatisch erzeugte Startvorlage. Ersetzen Sie diesen Text durch eine kurze Zusammenfassung Ihrer Arbeit.',
    intro: 'Einleitung',
    introText:
      'Dies ist der erste Abschnitt Ihres Dokuments. Schreiben Sie hier Ihren Inhalt, fügen Sie Verweise hinzu und kompilieren Sie mit der gewählten Engine.',
    math: 'Mathematik',
    mathText: 'Abgesetzte Gleichungen werden automatisch nummeriert, wie die Eulersche Identität:',
    conclusion: 'Fazit',
    conclusionText: 'Fassen Sie hier Ihre Ergebnisse zusammen.',
    outline: 'Gliederung',
    opening: 'Sehr geehrte Damen und Herren,',
    closing: 'Mit freundlichen Grüßen,',
    recipient: ['Name des Empfängers', 'Straße', 'Stadt'],
    sender: ['Ihr Name', 'Ihre Adresse', 'Stadt'],
    signature: 'Ihr Name',
  },
  es: {
    title: 'Título del documento',
    author: 'Nombre del autor',
    abstract:
      'Este documento es una plantilla inicial generada para usted. Sustituya este texto por un breve resumen de su trabajo.',
    intro: 'Introducción',
    introText:
      'Esta es la primera sección de su documento. Escriba aquí su contenido, añada referencias y compile con el motor elegido.',
    math: 'Matemáticas',
    mathText: 'Las ecuaciones destacadas se numeran automáticamente, como la identidad de Euler:',
    conclusion: 'Conclusión',
    conclusionText: 'Resuma aquí sus resultados.',
    outline: 'Índice',
    opening: 'Estimados señores:',
    closing: 'Atentamente,',
    recipient: ['Nombre del destinatario', 'Dirección', 'Ciudad'],
    sender: ['Su nombre', 'Su dirección', 'Ciudad'],
    signature: 'Su nombre',
  },
  tr: {
    title: 'Belge Başlığı',
    author: 'Yazar Adı',
    abstract:
      'Bu belge sizin için oluşturulmuş bir başlangıç şablonudur. Bu metni çalışmanızın kısa bir özetiyle değiştirin.',
    intro: 'Giriş',
    introText:
      'Bu, belgenizin ilk bölümüdür. İçeriğinizi buraya yazın, kaynak ekleyin ve seçtiğiniz motorla derleyin.',
    math: 'Matematik',
    mathText: 'Ayrı satırdaki denklemler otomatik olarak numaralandırılır, Euler özdeşliği gibi:',
    conclusion: 'Sonuç',
    conclusionText: 'Bulgularınızı burada özetleyin.',
    outline: 'İçindekiler',
    opening: 'Sayın yetkili,',
    closing: 'Saygılarımla,',
    recipient: ['Alıcı Adı', 'Adres', 'Şehir'],
    sender: ['Adınız', 'Adresiniz', 'Şehir'],
    signature: 'Adınız',
  },
};

const SPLIT_TEXTS = {
  en: {
    preface: 'Preface',
    prefaceText: 'Write the preface of your work here: its motivation, scope and acknowledgements.',
    appendix: 'Additional Material',
    appendixText: 'Place supporting tables, proofs and extended data here.',
  },
  ar: {
    preface: 'تمهيد',
    prefaceText: 'اكتب هنا تمهيد عملك: دوافعه ونطاقه وكلمات الشكر.',
    appendix: 'مواد إضافية',
    appendixText: 'ضع هنا الجداول الداعمة والبراهين والبيانات الموسعة.',
  },
  fr: {
    preface: 'Préface',
    prefaceText: 'Écrivez ici la préface de votre travail : sa motivation, sa portée et vos remerciements.',
    appendix: 'Matériel complémentaire',
    appendixText: 'Placez ici les tableaux, preuves et données complémentaires.',
  },
  de: {
    preface: 'Vorwort',
    prefaceText: 'Schreiben Sie hier das Vorwort Ihrer Arbeit: Motivation, Umfang und Danksagungen.',
    appendix: 'Zusätzliches Material',
    appendixText: 'Platzieren Sie hier ergänzende Tabellen, Beweise und erweiterte Daten.',
  },
  es: {
    preface: 'Prólogo',
    prefaceText: 'Escriba aquí el prólogo de su trabajo: su motivación, alcance y agradecimientos.',
    appendix: 'Material adicional',
    appendixText: 'Coloque aquí tablas de apoyo, demostraciones y datos ampliados.',
  },
  tr: {
    preface: 'Önsöz',
    prefaceText: 'Çalışmanızın önsözünü buraya yazın: amacı, kapsamı ve teşekkürler.',
    appendix: 'Ek Malzeme',
    appendixText: 'Destekleyici tabloları, ispatları ve genişletilmiş verileri buraya koyun.',
  },
};

const SAMPLE_BIB = `@book{knuth1984,
  author    = {Donald E. Knuth},
  title     = {The {TeXbook}},
  publisher = {Addison-Wesley},
  year      = {1984},
}

@book{lamport1994,
  author    = {Leslie Lamport},
  title     = {{LaTeX}: A Document Preparation System},
  edition   = {2},
  publisher = {Addison-Wesley},
  year      = {1994},
}
`;

/* ---------- دوال مساعدة ---------- */

const TEX_ESCAPES = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  '$': '\\$',
  '#': '\\#',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
};

function escapeTex(s) {
  return s.replace(/[\\&%$#_{}~^]/g, (c) => TEX_ESCAPES[c]);
}

function finish(lines) {
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

/* slugify وsanitizeFileName نُقلا إلى assets/js/utils.js وتُستورد أعلى الملف */

function babelOptions(names, mainName, extra = []) {
  const opts = [...extra];
  if (names.length > 1) opts.push(`main=${mainName}`);
  opts.push(...names);
  return opts.join(', ');
}

/* ---------- حل الإعدادات ---------- */

function resolveConfig(cfg) {
  const main = cfg.mode === 'english' ? 'en' : cfg.mode === 'arabic' ? 'ar' : cfg.mainLang;
  const others = cfg.mode === 'multi' ? cfg.extraLangs.filter((l) => l !== main) : [];
  const langs = [main, ...others];
  const hasArabic = langs.includes('ar');
  let framework;
  if (cfg.engine === 'pdflatex') framework = hasArabic ? cfg.pdfArabic : 'babel';
  else framework = cfg.mode === 'english' ? 'babel' : cfg.langPkg;
  return { main, others, langs, hasArabic, framework };
}

function normalize(cfg) {
  const isBeamer = cfg.docClass === 'beamer';
  const sizes = fontSizesFor(cfg.docClass);
  const split = cfg.splitProject && SPLIT_CLASSES.includes(cfg.docClass);
  const needsBib =
    split && !cfg.packages.includes('biblatex') && !cfg.packages.includes('natbib');
  return {
    ...cfg,
    splitProject: split,
    packages: needsBib ? [...cfg.packages, 'biblatex'] : cfg.packages,
    fontSize: sizes.includes(cfg.fontSize) ? cfg.fontSize : sizes.includes('12pt') ? '12pt' : sizes[0],
    spacing: isBeamer ? '1' : cfg.spacing,
    columns: COLUMN_CLASSES.includes(cfg.docClass) ? cfg.columns : 1,
  };
}

/* ---------- المولّد الرئيسي ---------- */

function generate(input) {
  const cfg = normalize(input);
  const split = cfg.splitProject;
  const bibForced =
    split && !input.packages.includes('biblatex') && !input.packages.includes('natbib');
  const mainFile = `${sanitizeFileName(cfg.fileName)}.tex`;
  const projectName = slugify(cfg.projectName);
  const r = resolveConfig(cfg);
  const { main, others, langs, hasArabic, framework } = r;
  const engine = cfg.engine;
  const isBeamer = cfg.docClass === 'beamer';
  const isLetter = cfg.docClass === 'letter';
  const hasChapter = CHAPTER_CLASSES.includes(cfg.docClass);

  const arabtexAr = (l) => framework === 'arabtex' && l === 'ar';

  const inline = (l, s) => {
    if (arabtexAr(l)) return `\\<${s}>`;
    if (l === main) return s;
    if (framework === 'polyglossia')
      return l === 'ar' ? `\\textarabic{${s}}` : `\\text${LANGS[l].poly}{${s}}`;
    return `\\foreignlanguage{${LANGS[l].babel}}{${s}}`;
  };

  const block = (l, s) => {
    if (arabtexAr(l)) return `\\begin{arabtext}\n${s}\n\\end{arabtext}`;
    if (l === main) return s;
    if (framework === 'polyglossia') {
      const env = l === 'ar' ? 'Arabic' : LANGS[l].poly;
      return `\\begin{${env}}\n${s}\n\\end{${env}}`;
    }
    return `\\begin{otherlanguage}{${LANGS[l].babel}}\n${s}\n\\end{otherlanguage}`;
  };

  const T = TEXTS[main];

  const active = PACKAGES.filter((p) => {
    const forced = p.id === 'setspace' && cfg.spacing !== '1';
    return (cfg.packages.includes(p.id) || forced) && !(p.disabled && p.disabled(cfg));
  }).sort((a, b) => a.order - b.order);
  const has = (id) => active.some((p) => p.id === id);

  /* ---------- document class ---------- */
  const classOpts = [cfg.fontSize];
  if (isBeamer) {
    classOpts.push(`aspectratio=${cfg.aspect}`);
  } else {
    classOpts.push(cfg.paper);
    if (cfg.orientation === 'landscape') classOpts.push('landscape');
    if (cfg.columns === 2) classOpts.push('twocolumn');
    if (!isLetter) classOpts.push(cfg.sides);
  }

  const header = [
    `% !TeX program = ${engine}`,
    '% !TeX encoding = UTF-8',
    '',
    `\\documentclass[${classOpts.join(', ')}]{${cfg.docClass}}`,
    '',
  ];

  const pre = [];
  const section = (title, lines) => {
    if (lines.length === 0) return;
    pre.push(`% ---------- ${title} ----------`, ...lines, '');
  };

  /* ---------- الخطوط واللغات ---------- */
  const latinNames = langs.filter((l) => l !== 'ar').map((l) => LANGS[l].babel);
  const mainBabel = LANGS[main].babel;

  const arabicFamilies = {
    rm: pickFont(ARABIC_FONTS, cfg.arabicFonts.rm).family ?? 'Amiri',
    sf: pickFont(ARABIC_FONTS, cfg.arabicFonts.sf).family ?? 'Noto Sans Arabic',
    tt: pickFont(ARABIC_FONTS, cfg.arabicFonts.tt).family ?? 'DejaVu Sans Mono',
  };
  const languageLines = [];
  let languageAfterPackages = false;

  if (engine === 'pdflatex') {
    const fontLines = ROLES.flatMap((role) => pickFont(PDF_FONTS[role], cfg.pdfFonts[role]).lines ?? []);
    if (framework === 'arabtex') {
      languageLines.push('\\usepackage[T1]{fontenc}', ...fontLines);
      if (latinNames.length > 0) {
        const babelMain = latinNames.includes(mainBabel) ? mainBabel : latinNames[0];
        languageLines.push(`\\usepackage[${babelOptions(latinNames, babelMain)}]{babel}`);
      }
      languageLines.push(
        '\\usepackage{arabtex}',
        '\\usepackage{utf8}',
        '\\setcode{utf8}',
        `\\${cfg.vocalize}`,
      );
    } else if (framework === 'arabi') {
      const names = langs.map((l) => LANGS[l].babel);
      languageLines.push(
        '\\usepackage[utf8]{inputenc}',
        '\\usepackage[LFE,LAE,T1]{fontenc}',
        ...fontLines,
        `\\usepackage[${babelOptions(names, mainBabel)}]{babel}`,
      );
    } else {
      const names = langs.map((l) => LANGS[l].babel);
      languageLines.push(
        '\\usepackage[utf8]{inputenc}',
        '\\usepackage[T1]{fontenc}',
        ...fontLines,
        `\\usepackage[${babelOptions(names, mainBabel)}]{babel}`,
      );
    }
  } else {
    const latin = {
      rm: pickFont(UNI_FONTS.rm, cfg.uniFonts.rm).family,
      sf: pickFont(UNI_FONTS.sf, cfg.uniFonts.sf).family,
      tt: pickFont(UNI_FONTS.tt, cfg.uniFonts.tt).family,
    };
    languageLines.push('\\usepackage{fontspec}');
    if (framework === 'polyglossia') {
      languageAfterPackages = true;
      const arabicOpts = cfg.numerals === 'western' ? '[numerals=maghrib]' : '';
      languageLines.push('\\usepackage{polyglossia}');
      if (main === 'ar') languageLines.push(`\\setmainlanguage${arabicOpts}{arabic}`);
      else languageLines.push(`\\setmainlanguage{${LANGS[main].poly}}`);
      const otherLatin = others.filter((l) => l !== 'ar').map((l) => LANGS[l].poly);
      if (otherLatin.length > 0) languageLines.push(`\\setotherlanguages{${otherLatin.join(', ')}}`);
      if (main !== 'ar' && others.includes('ar'))
        languageLines.push(`\\setotherlanguage${arabicOpts}{arabic}`);
      if (latin.rm) languageLines.push(`\\setmainfont{${latin.rm}}`);
      if (latin.sf) languageLines.push(`\\setsansfont{${latin.sf}}`);
      if (latin.tt) languageLines.push(`\\setmonofont[Scale=MatchLowercase]{${latin.tt}}`);
      if (hasArabic) {
        languageLines.push(
          `\\newfontfamily\\arabicfont[Script=Arabic]{${arabicFamilies.rm}}`,
          `\\newfontfamily\\arabicfontsf[Script=Arabic]{${arabicFamilies.sf}}`,
          `\\newfontfamily\\arabicfonttt[Script=Arabic]{${arabicFamilies.tt}}`,
        );
      }
    } else {
      const latinList = latinNames.length > 0 ? latinNames : ['english'];
      const bidi = hasArabic ? [`bidi=${engine === 'xelatex' ? 'default' : 'basic'}`] : [];
      const babelMain = latinList.includes(mainBabel) ? mainBabel : latinList[0];
      languageLines.push(`\\usepackage[${babelOptions(latinList, babelMain, bidi)}]{babel}`);
      if (hasArabic)
        languageLines.push(`\\babelprovide[import${main === 'ar' ? ', main' : ''}]{arabic}`);
      if (latin.rm) languageLines.push(`\\babelfont{rm}{${latin.rm}}`);
      if (latin.sf) languageLines.push(`\\babelfont{sf}{${latin.sf}}`);
      if (latin.tt) languageLines.push(`\\babelfont{tt}[Scale=MatchLowercase]{${latin.tt}}`);
      if (hasArabic) {
        const renderer = engine === 'lualatex' ? '[Renderer=Harfbuzz]' : '';
        for (const role of ROLES)
          languageLines.push(`\\babelfont[arabic]{${role}}${renderer}{${arabicFamilies[role]}}`);
      }
    }
  }

  const languageTitle = 'Language & fonts';
  if (!languageAfterPackages) section(languageTitle, languageLines);

  /* ---------- الحزم ---------- */
  const packageLines = active.map((p) => p.line(cfg));
  if (isBeamer) packageLines.unshift(`\\usetheme{${cfg.beamerTheme}}`);
  section('Packages', packageLines);

  const configLines = active.flatMap((p) =>
    split && p.id === 'biblatex' ? ['\\addbibresource{bib/references.bib}'] : (p.config ? p.config(cfg) : []),
  );
  section('Settings', configLines);

  if (languageAfterPackages) section(languageTitle, languageLines);

  /* ---------- البيانات الوصفية ---------- */
  const userText = (value, fallback) => {
    const v = value.trim();
    if (!v) return inline(main, fallback);
    const escaped = escapeTex(v);
    return arabtexAr(main) && !/[\u0600-\u06FF]/.test(v) ? escaped : inline(main, escaped);
  };

  const meta = [];
  if (isLetter) {
    meta.push(
      `\\signature{${userText(cfg.author, T.signature)}}`,
      `\\address{${[userText(cfg.author, T.sender[0]), ...T.sender.slice(1).map((s) => inline(main, s))].join(' \\\\ ')}}`,
    );
  } else {
    meta.push(
      `\\title{${userText(cfg.title, T.title)}}`,
      `\\author{${userText(cfg.author, T.author)}}`,
      '\\date{\\today}',
    );
  }
  const metaBlock = ['% ---------- Metadata ----------', ...meta, ''];

  /* ---------- جسم الوثيقة ---------- */
  const body = ['\\begin{document}', ''];
  const extraFiles = [];
  const sec = hasChapter ? 'chapter' : 'section';
  const equation = ['\\begin{equation}', '  e^{i\\pi} + 1 = 0', '\\end{equation}'];

  if (isLetter) {
    body.push(`\\begin{letter}{${T.recipient.map((s) => inline(main, s)).join(' \\\\ ')}}`, '');
    body.push(`\\opening{${inline(main, T.opening)}}`, '');
    body.push(cfg.sample ? block(main, T.introText) : '% Write your letter here', '');
    body.push(`\\closing{${inline(main, T.closing)}}`, '', '\\end{letter}');
  } else if (isBeamer) {
    body.push('\\begin{frame}', '  \\titlepage', '\\end{frame}', '');
    if (cfg.toc) {
      body.push(
        `\\begin{frame}{${inline(main, T.outline)}}`,
        '  \\tableofcontents',
        '\\end{frame}',
        '',
      );
    }
    if (cfg.sample) {
      body.push(
        `\\section{${inline(main, T.intro)}}`,
        `\\begin{frame}{${inline(main, T.intro)}}`,
        block(main, T.introText),
        '\\end{frame}',
        '',
        `\\section{${inline(main, T.math)}}`,
        `\\begin{frame}{${inline(main, T.math)}}`,
        block(main, T.mathText),
        ...equation,
        '\\end{frame}',
        '',
      );
      for (const l of others) {
        body.push(
          `\\begin{frame}{${inline(l, TEXTS[l].intro)}}`,
          block(l, TEXTS[l].introText),
          '\\end{frame}',
          '',
        );
      }
      body.push(
        `\\section{${inline(main, T.conclusion)}}`,
        `\\begin{frame}{${inline(main, T.conclusion)}}`,
        block(main, T.conclusionText),
        '\\end{frame}',
      );
    } else {
      body.push('% Add your frames here');
    }
  } else if (split) {
    const S = SPLIT_TEXTS[main];
    const root = `% !TeX root = ../${mainFile}`;
    const addFile = (path, lines) =>
      extraFiles.push({ path, content: finish([root, '', ...lines]) });
    const text = (l, s, placeholder) => (cfg.sample ? block(l, s) : placeholder);
    const unnumbered = (title) => [
      `\\chapter*{${title}}`,
      `\\addcontentsline{toc}{chapter}{${title}}`,
      '',
    ];
    const hasFront = FRONTMATTER_CLASSES.includes(cfg.docClass);

    if (hasFront) body.push('\\frontmatter', '');
    if (cfg.titlePage) body.push('\\maketitle', '');
    if (cfg.abstract && ABSTRACT_CLASSES.includes(cfg.docClass)) {
      addFile('frontmatter/abstract.tex', [
        '\\begin{abstract}',
        text(main, T.abstract, '% Write your abstract here'),
        '\\end{abstract}',
      ]);
      body.push('\\input{frontmatter/abstract}', '');
    }
    addFile('frontmatter/preface.tex', [
      ...unnumbered(inline(main, S.preface)),
      text(main, S.prefaceText, '% Write your preface here'),
    ]);
    body.push('\\input{frontmatter/preface}', '');
    if (cfg.toc) body.push('\\tableofcontents', '');
    if (hasFront) body.push('\\mainmatter', '');

    const chapterDefs = cfg.sample
      ? [
          { slug: 'introduction', lang: main, title: T.intro, text: T.introText, math: false },
          { slug: 'mathematics', lang: main, title: T.math, text: T.mathText, math: true },
          ...others.map((l) => ({
            slug: LANGS[l].poly,
            lang: l,
            title: TEXTS[l].intro,
            text: TEXTS[l].introText,
            math: false,
          })),
        ]
      : [{ slug: 'introduction', lang: main, title: T.intro, text: '', math: false }];
    chapterDefs.forEach((c, i) => {
      const stem = `chapter-${String(i + 1).padStart(2, '0')}-${c.slug}`;
      addFile(`chapters/${stem}.tex`, [
        `\\chapter{${inline(c.lang, c.title)}}`,
        '',
        text(c.lang, c.text, '% Write your first chapter here'),
        ...(c.math ? ['', ...equation] : []),
      ]);
      body.push(`\\include{chapters/${stem}}`);
    });
    body.push('');

    addFile('appendices/appendix-a.tex', [
      `\\chapter{${inline(main, S.appendix)}}`,
      '',
      text(main, S.appendixText, '% Write your appendix here'),
    ]);
    body.push('\\appendix', '\\include{appendices/appendix-a}', '');

    if (hasFront) body.push('\\backmatter', '');
    addFile('backmatter/conclusion.tex', [
      ...unnumbered(inline(main, T.conclusion)),
      text(main, T.conclusionText, '% Write your conclusion here'),
    ]);
    body.push('\\input{backmatter/conclusion}', '');

    extraFiles.push({ path: 'bib/references.bib', content: SAMPLE_BIB });
    if (has('natbib')) {
      body.push('\\nocite{*}', '\\bibliographystyle{plain}', '\\bibliography{bib/references}');
    } else {
      body.push('\\nocite{*}', '\\printbibliography[heading=bibintoc]');
    }
  } else {
    const hasFront = FRONTMATTER_CLASSES.includes(cfg.docClass);
    if (hasFront) body.push('\\frontmatter', '');
    if (cfg.titlePage) body.push('\\maketitle', '');
    if (cfg.abstract && ABSTRACT_CLASSES.includes(cfg.docClass)) {
      body.push(
        '\\begin{abstract}',
        cfg.sample ? block(main, T.abstract) : '% Write your abstract here',
        '\\end{abstract}',
        '',
      );
    }
    if (cfg.toc) body.push('\\tableofcontents', '');
    if (hasFront) body.push('\\mainmatter', '');

    if (cfg.sample) {
      body.push(
        `\\${sec}{${inline(main, T.intro)}}`,
        block(main, T.introText),
        '',
        `\\${sec}{${inline(main, T.math)}}`,
        block(main, T.mathText),
        ...equation,
        '',
      );
      for (const l of others) {
        body.push(`\\${sec}*{${inline(l, TEXTS[l].intro)}}`, block(l, TEXTS[l].introText), '');
      }
      body.push(`\\${sec}{${inline(main, T.conclusion)}}`, block(main, T.conclusionText), '');
    } else {
      body.push('% Write your content here', '');
    }

    if (has('biblatex')) body.push('% \\printbibliography', '');
    if (has('natbib')) body.push('% \\bibliographystyle{plain}', '% \\bibliography{references}', '');
    if (hasFront) body.push('\\backmatter', '');
    while (body[body.length - 1] === '') body.pop();
  }
  body.push('', '\\end{document}');

  const FOLDER_ORDER = ['frontmatter', 'chapters', 'appendices', 'backmatter', 'bib'];
  const folderRank = (path) => {
    const i = FOLDER_ORDER.indexOf(path.split('/')[0]);
    return i === -1 ? FOLDER_ORDER.length : i;
  };

  let tex;
  let files;
  if (split) {
    const styleFile = finish([
      '\\NeedsTeXFormat{LaTeX2e}',
      '\\ProvidesPackage{style}[2024/01/01 Project style: languages, fonts and packages]',
      '',
      ...pre.map((l) => l.replace(/^\\usepackage/, '\\RequirePackage')),
    ]);
    tex = finish([
      ...header,
      '% ---------- Style (languages, fonts, packages) ----------',
      '\\usepackage{style}',
      '',
      ...metaBlock,
      ...body,
    ]);
    files = [
      { path: mainFile, content: tex },
      { path: 'style.sty', content: styleFile },
      ...[...extraFiles].sort((a, b) => folderRank(a.path) - folderRank(b.path)),
    ];
  } else {
    tex = finish([...header, ...pre, ...metaBlock, ...body]);
    files = [{ path: mainFile, content: tex }];
  }

  /* ---------- أمر الترجمة والملاحظات ---------- */
  const base = mainFile.replace(/\.tex$/i, '');
  const run = `${engine} ${mainFile}`;
  const compile = has('biblatex')
    ? `${run} && biber ${base} && ${run} && ${run}`
    : split && has('natbib')
      ? `${run} && bibtex ${base} && ${run} && ${run}`
      : run;

  const notes = [];
  if (split) {
    notes.push({
      level: 'info',
      text: `المشروع داخل المجلد «${projectName}/»: الحزم والخطوط واللغات في style.sty، والفصول في chapters/، والمقدمة في frontmatter/، والخاتمة في backmatter/، والملاحق في appendices/، والمراجع في bib/. ارفع ملف ZIP في Overleaf عبر New Project ← Upload Project واجعل ${mainFile} الملف الرئيسي.`,
    });
    if (bibForced) {
      notes.push({
        level: 'info',
        text: 'أُضيفت biblatex تلقائيًا لأن مجلد bib/ يحتاج حزمة مراجع. اختر natbib من قسم الحزم إن أردت BibTeX الكلاسيكي.',
      });
    }
  }
  notes.push({
    level: 'info',
    text: `في Overleaf اختر المترجم ${engine === 'pdflatex' ? 'pdfLaTeX' : engine === 'xelatex' ? 'XeLaTeX' : 'LuaLaTeX'} من قائمة Menu، وأبقِ ترميز الملف UTF-8.`,
  });
  if (framework === 'arabtex') {
    notes.push({
      level: 'warn',
      text: 'ArabTeX حزمة قديمة: يُكتب النص العربي داخل بيئة arabtext أو الأمر \\<...>، ولا يعمل معها التحويل الآلي للأرقام والرياضيات داخل النص العربي.',
    });
  }
  if (framework === 'arabi') {
    notes.push({
      level: 'info',
      text: 'Arabi تتطلب حزم arabi وbabel العربية (توزيعة TeX Live تحتوي collection-langarabic).',
    });
  }
  if (engine !== 'pdflatex' && hasArabic) {
    notes.push({
      level: 'warn',
      text: `يجب أن تكون الخطوط العربية «${[...new Set(Object.values(arabicFamilies))].join('، ')}» مثبّتة على النظام (أو متاحة في Overleaf). غيّرها من قسم الخطوط إن لم تتوفر لديك.`,
    });
  }
  if (engine === 'lualatex' && framework === 'polyglossia' && hasArabic) {
    notes.push({
      level: 'info',
      text: 'دعم Polyglossia للعربية في LuaLaTeX يحتاج TeX Live 2022 أو أحدث.',
    });
  }
  if (engine === 'xelatex' && cfg.packages.includes('microtype')) {
    notes.push({ level: 'info', text: 'تم استبعاد microtype لأن دعمها في XeLaTeX محدود.' });
  }
  if (has('biblatex')) {
    notes.push({
      level: 'info',
      text: 'أنشئ ملف references.bib وفعّل السطرين \\addbibresource و\\printbibliography ثم شغّل biber بعد أول ترجمة.',
    });
  }
  if (has('natbib') && has('biblatex')) {
    notes.push({ level: 'warn', text: 'لا تستخدم biblatex وnatbib معًا؛ اختر إحداهما.' });
  }
  if (isBeamer && hasArabic) {
    notes.push({
      level: 'warn',
      text: 'العروض العربية بـ beamer تعمل بأفضل شكل مع XeLaTeX أو LuaLaTeX.',
    });
  }

  return { tex, files, mainFile, isProject: split, projectName, notes, compile, resolved: r };
}

/* ==========================================================================
   باني ZIP عبر مكتبة JSZip الموردة محليًا (assets/js/vendor/jszip.min.js):
   ضغط DEFLATE بمستوى 6، ويعيد Blob في المتصفح وBuffer في Node للاختبارات.
   ========================================================================== */

/** entries: مصفوفة { name: string, data: Uint8Array } */
async function buildZip(entries) {
  const zip = new JSZipLib();
  for (const entry of entries) zip.file(entry.name, entry.data);
  if (typeof window === 'undefined') {
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

/* ==========================================================================
   مُلوِّن صياغة LaTeX (مرآة للـ TOKEN في output-panel.tsx):
   التعليقات أخضر مائل، الأوامر كهرمانية، الأقواس زرقاء.
   ========================================================================== */

const LS_TOKEN = /(%.*$)|(\\(?:[a-zA-Z@]+\*?|[^a-zA-Z\s]))|([{}[\]])/g;

function highlightLatexLine(line) {
  let html = '';
  let last = 0;
  let match;
  LS_TOKEN.lastIndex = 0;
  while ((match = LS_TOKEN.exec(line)) !== null) {
    if (match.index > last) html += escapeHtml(line.slice(last, match.index));
    const cls = match[1] ? 'tok-cmt' : match[2] ? 'tok-cmd' : 'tok-brk';
    html += `<span class="${cls}">${escapeHtml(match[0])}</span>`;
    last = match.index + match[0].length;
  }
  if (last < line.length) html += escapeHtml(line.slice(last));
  return html || '&nbsp;';
}

/* تصدير الكتلة النقية للاختبار في Node. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    pickFont,
    TEXTS,
    SPLIT_TEXTS,
    SAMPLE_BIB,
    escapeTex,
    finish,
    slugify,
    sanitizeFileName,
    babelOptions,
    resolveConfig,
    normalize,
    generate,
    buildZip,
    highlightLatexLine,
  };
}

/* ==========================================================================
   الجزء الثالث: طبقة الواجهة — مرآة لِـ generator.tsx وoption-sections.tsx
   وoutput-panel.tsx وui-kit.tsx، بلا React ولا Tailwind.
   الحالة كائن cfg واحد، وأي تغيير يعيد بناء الأقسام ولوحة الناتج.
   ========================================================================== */

if (typeof document !== 'undefined') {
  boot();
}

function boot() {
  /* ---------- الحالة ---------- */
  let cfg = JSON.parse(JSON.stringify(defaultConfig));
  let selectedPath = '';
  let lastOutput = null;

  const el = {
    settings: document.getElementById('settings'),
    output: document.getElementById('outputPanel'),
  };

  const FRAMEWORK_LABEL = { arabtex: 'ArabTeX', arabi: 'Arabi + babel', polyglossia: 'Polyglossia', babel: 'babel' };
  const EN_LABELS = { pdflatex: 'pdfLaTeX', xelatex: 'XeLaTeX', lualatex: 'LuaLaTeX' };

  /* ---------- أيقونات (هندسة lucide) ---------- */
  const ICON_PATHS = {
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;

  /* ---------- قوالب عناصر الواجهة ---------- */
  const section = (step, title, description, body) => `
    <section class="card" aria-labelledby="sec-${step}">
      <header class="card-head">
        <span class="step-num" aria-hidden="true">${step}</span>
        <div>
          <h2 id="sec-${step}">${title}</h2>
          ${description ? `<p>${description}</p>` : ''}
        </div>
      </header>
      <div class="card-body">${body}</div>
    </section>`;

  const selectField = ({ label, id, act = 'set', key = '', role = '', options, value, hint = '' }) => `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <div class="select-wrap">
        <select id="${id}" class="select" data-act="${act}" data-key="${key}" data-role="${role}">
          ${options.map((o) => `<option value="${escapeHtml(o.value)}"${o.value === value ? ' selected' : ''}>${o.icon ? `${o.icon} ` : ''}${escapeHtml(o.label)}</option>`).join('')}
        </select>
        ${icon('chev')}
      </div>
      ${hint ? `<p class="hint">${escapeHtml(hint)}</p>` : ''}
    </div>`;

  const segmented = ({ legend, name, value, options, act = 'set', key = '', columns = 3, ltr = false }) => `
    <fieldset class="seg">
      <legend>${escapeHtml(legend)}</legend>
      <div class="seg-grid ${columns === 2 ? 'cols2' : 'cols3'}">
        ${options.map((o) => `
        <label class="seg-opt">
          <input class="sr-only" type="radio" name="${name}" id="${name}-${o.value}" value="${escapeHtml(o.value)}" data-act="${act}" data-key="${key}"${o.value === value ? ' checked' : ''}>
          <span class="seg-card">
            <span class="seg-label"${ltr ? ' dir="ltr" style="text-align:start"' : ''}>${escapeHtml(o.label)}</span>
            ${o.hint ? `<span class="seg-hint">${escapeHtml(o.hint)}</span>` : ''}
          </span>
        </label>`).join('')}
      </div>
    </fieldset>`;

  const checkRow = ({ id, checked, disabled = false, label, description = '', act, key = '', arg = '', mono = false }) => `
    <label class="check-row${mono ? ' mono' : ''}${disabled ? ' is-disabled' : ''}" for="${id}">
      <input class="sr-only" type="checkbox" id="${id}" data-act="${act}" data-key="${key}" data-arg="${arg}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>
      <span class="check-box" aria-hidden="true">${icon('check')}</span>
      <span class="cr-text">
        <span class="cr-label"${mono ? ' dir="ltr" style="text-align:start"' : ''}>${escapeHtml(label)}</span>
        ${description ? `<span class="cr-desc">${escapeHtml(description)}</span>` : ''}
      </span>
    </label>`;

  const textField = ({ id, label, key, value, placeholder = '', hint = '', rawHint = '', ltr = false, mono = false }) => `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <input id="${id}" class="text-input${mono ? ' mono' : ''}" type="text" data-act="text" data-key="${key}" value="${escapeHtml(value)}"${placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : ''}${ltr ? ' dir="ltr"' : ''} spellcheck="false">
      ${rawHint || (hint ? `<p class="hint">${escapeHtml(hint)}</p>` : '')}
    </div>`;

  const callout = (text) => `<p class="callout">${icon('info')}<span>${escapeHtml(text)}</span></p>`;

  const slugPreview = (name) =>
    name.trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'latex-project';

  /* ---------- أقسام الإعدادات (مرآة لـ option-sections.tsx) ---------- */

  function secLanguage() {
    const multiPanel = cfg.mode === 'multi' ? `
      <div class="multi-panel">
        ${selectField({
          label: 'اللغة الأساسية', id: 'f-mainLang', key: 'mainLang',
          options: LANG_CODES.map((c) => ({ value: c, label: `${LANGS[c].label} — ${LANGS[c].native}` })),
          value: cfg.mainLang,
        })}
        <fieldset>
          <legend class="legend-sm">لغات إضافية</legend>
          <div class="pkg-grid">
            ${LANG_CODES.filter((c) => c !== cfg.mainLang).map((c) => checkRow({
              id: `extra-${c}`, checked: cfg.extraLangs.includes(c),
              label: LANGS[c].label, description: LANGS[c].native, act: 'extra', arg: c,
            })).join('')}
          </div>
        </fieldset>
      </div>` : '';
    return section(1, 'لغة الوثيقة', 'اختر اللغة التي ستُكتب بها الوثيقة.',
      segmented({ legend: 'اللغة', name: 'mode', value: cfg.mode, options: LANG_MODES, key: 'mode' }) + multiPanel);
  }

  function secEngine() {
    const r = resolveConfig(cfg);
    const showFramework = cfg.engine === 'pdflatex' ? r.hasArabic : cfg.mode !== 'english';
    let body = segmented({ legend: 'المحرك', name: 'engine', value: cfg.engine, options: ENGINES, key: 'engine', ltr: true });
    if (showFramework) {
      if (cfg.engine === 'pdflatex') {
        body += segmented({
          legend: 'طريقة دعم العربية مع pdfLaTeX', name: 'pdf-arabic', value: cfg.pdfArabic,
          options: PDF_ARABIC, key: 'pdfArabic', columns: 2, ltr: true,
        });
        if (cfg.pdfArabic === 'arabtex') {
          body += selectField({
            label: 'التشكيل في ArabTeX', id: 'f-vocalize', key: 'vocalize',
            options: VOCALIZE.map((v) => ({ value: v.value, label: `${v.label} — ${v.hint}` })),
            value: cfg.vocalize,
          });
        }
      } else {
        body += segmented({
          legend: r.hasArabic ? `طريقة دعم العربية مع ${cfg.engine === 'xelatex' ? 'XeLaTeX' : 'LuaLaTeX'}` : 'حزمة اللغات',
          name: 'lang-pkg', value: cfg.langPkg, options: LANG_PACKAGES, key: 'langPkg', columns: 2, ltr: true,
        });
      }
    } else {
      body += callout(cfg.engine === 'pdflatex'
        ? 'للوثائق الإنجليزية يكفي babel مع pdfLaTeX.'
        : 'للوثائق الإنجليزية تُستخدم babel مع fontspec لاختيار الخط.');
    }
    return section(2, 'محرك الترجمة', 'المحرك يحدد الحزم والخطوط المتاحة لدعم اللغات.', body);
  }

  function secDocument() {
    const isBeamer = cfg.docClass === 'beamer';
    const isLetter = cfg.docClass === 'letter';
    const canColumns = COLUMN_CLASSES.includes(cfg.docClass);
    let pageFields = `
      ${selectField({ label: 'حجم الخط', id: 'f-fontSize', key: 'fontSize', options: fontSizesFor(cfg.docClass).map((s) => ({ value: s, label: s, icon: PT_ICONS[s] || '' })), value: cfg.fontSize })}
      ${selectField({ label: 'حجم الورقة', id: 'f-paper', key: 'paper', options: PAPERS, value: cfg.paper })}
      ${selectField({ label: 'اتجاه الصفحة', id: 'f-orientation', key: 'orientation', options: [{ value: 'portrait', label: 'طولي', icon: '▯' }, { value: 'landscape', label: 'عرضي', icon: '▭' }], value: cfg.orientation })}
      ${selectField({ label: 'الهوامش', id: 'f-margin', key: 'margin', options: MARGINS, value: cfg.margin })}
      ${canColumns ? selectField({ label: 'الأعمدة', id: 'f-columns', key: 'columns', options: [{ value: '1', label: 'عمود واحد', icon: '▮' }, { value: '2', label: 'عمودان', icon: '▮▮' }], value: String(cfg.columns) }) : ''}
      ${!isLetter ? selectField({ label: 'الطباعة', id: 'f-sides', key: 'sides', options: [{ value: 'oneside', label: 'وجه واحد', icon: '📄' }, { value: 'twoside', label: 'وجهان', icon: '📖' }], value: cfg.sides }) : ''}
      ${selectField({ label: 'تباعد الأسطر', id: 'f-spacing', key: 'spacing', options: SPACINGS, value: cfg.spacing })}`;
    if (isBeamer) {
      pageFields = `
        ${selectField({ label: 'حجم الخط', id: 'f-fontSize', key: 'fontSize', options: fontSizesFor(cfg.docClass).map((s) => ({ value: s, label: s, icon: PT_ICONS[s] || '' })), value: cfg.fontSize })}
        ${selectField({ label: 'نسبة الشريحة', id: 'f-aspect', key: 'aspect', options: ASPECTS, value: cfg.aspect })}
        ${selectField({ label: 'سمة العرض', id: 'f-beamerTheme', key: 'beamerTheme', options: BEAMER_THEMES, value: cfg.beamerTheme })}`;
    }
    const body = `
      ${selectField({ label: 'نوع الوثيقة', id: 'f-docClass', key: 'docClass', options: DOC_CLASSES, value: cfg.docClass })}
      <div class="grid2">${pageFields}</div>`;
    return section(3, 'الوثيقة والصفحة', 'نوع الوثيقة وحجم الخط والورقة.', body);
  }

  function fontGroup(title, lists, value, key) {
    return `
      <fieldset>
        <legend class="legend-md">${escapeHtml(title)}</legend>
        <div class="stack">
          ${FONT_ROLES.map((role) => selectField({
            label: role.label, id: `f-${key}-${role.id}`, act: 'font', key, role: role.id,
            options: lists[role.id].map((f) => ({ value: f.id, label: f.label })),
            value: value[role.id], hint: role.hint,
          })).join('')}
        </div>
      </fieldset>`;
  }

  function secFonts() {
    const r = resolveConfig(cfg);
    const pdf = cfg.engine === 'pdflatex';
    const latin = fontGroup('الخط اللاتيني', pdf ? PDF_FONTS : UNI_FONTS, pdf ? cfg.pdfFonts : cfg.uniFonts, pdf ? 'pdfFonts' : 'uniFonts');
    const arabic = !pdf && r.hasArabic
      ? fontGroup('الخط العربي', { rm: ARABIC_FONTS, sf: ARABIC_FONTS, tt: ARABIC_FONTS }, cfg.arabicFonts, 'arabicFonts')
      : '';
    let body = `<div class="fonts-grid">${latin}${arabic}</div>`;
    if (!pdf && r.hasArabic && r.framework === 'polyglossia') {
      body += `<div class="grid2">${selectField({
        label: 'الأرقام العربية', id: 'f-numerals', key: 'numerals',
        options: [{ value: 'eastern', label: 'هندية ١٢٣' }, { value: 'western', label: 'لاتينية 123' }],
        value: cfg.numerals,
      })}</div>`;
    }
    if (pdf && r.hasArabic) {
      body += callout(r.framework === 'arabi'
        ? 'مع Arabi يُستخدم خط الحزمة العربي المدمج، ولا يمكن اختيار خطوط النظام. استخدم XeLaTeX أو LuaLaTeX لاختيار خط عربي.'
        : 'مع ArabTeX يُستخدم خط ArabTeX المدمج (النسخ)، ولا يمكن اختيار خطوط النظام. استخدم XeLaTeX أو LuaLaTeX لاختيار خط عربي.');
    }
    return section(4, 'الخطوط', 'اختر الخط اللاتيني والعربي لكل عائلة: Roman وSans Serif وTypewriter.', body);
  }

  function secPackages() {
    const spacingForced = cfg.spacing !== '1' && cfg.docClass !== 'beamer';
    const toolbar = `
      <div class="pkg-toolbar">
        <button type="button" class="mini-btn" data-act="pkg-defaults">الحزم الأساسية فقط</button>
        <button type="button" class="mini-btn" data-act="pkg-clear">إلغاء الكل</button>
        <span class="pkg-count">${cfg.packages.length} محددة</span>
      </div>`;
    const groups = PACKAGE_GROUPS.map((g) => `
      <fieldset>
        <legend class="legend-xs">${escapeHtml(g.label)}</legend>
        <div class="pkg-grid">
          ${PACKAGES.filter((p) => p.group === g.id).map((p) => {
            const reason = p.disabled ? p.disabled(cfg) : null;
            const forced = p.id === 'setspace' && spacingForced;
            return checkRow({
              id: `pkg-${p.id}`, mono: true, label: p.label,
              description: reason ?? p.description,
              checked: !reason && (forced || cfg.packages.includes(p.id)),
              disabled: Boolean(reason) || forced,
              act: 'pkg', arg: p.id,
            });
          }).join('')}
        </div>
      </fieldset>`).join('');
    return section(5, 'الحزم', 'اختر الحزم التي ستُضاف إلى مقدمة الوثيقة. بعضها يتعطل تلقائيًا إذا لم يناسب نوع الوثيقة أو المحرك.',
      toolbar + `<div class="stack-lg">${groups}</div>`);
  }

  function secContent() {
    const isBeamer = cfg.docClass === 'beamer';
    const isLetter = cfg.docClass === 'letter';
    const canAbstract = ABSTRACT_CLASSES.includes(cfg.docClass);
    const fields = `
      <div class="grid2">
        ${!isLetter ? textField({
          id: 'f-title', label: 'عنوان الوثيقة', key: 'title', value: cfg.title,
          placeholder: 'مثال: عنوان الوثيقة', hint: 'يُترك فارغًا لاستخدام عنوان تجريبي.',
        }) : ''}
        ${textField({
          id: 'f-author', label: isLetter ? 'اسم المرسل' : 'الكاتب', key: 'author', value: cfg.author,
          placeholder: 'مثال: اسم المؤلف',
          hint: isLetter ? 'يظهر في التوقيع والعنوان.' : 'يُترك فارغًا لاستخدام اسم تجريبي.',
        })}
      </div>`;
    const checks = `
      <div class="pkg-grid">
        ${checkRow({ id: 'content-sample', checked: cfg.sample, label: 'نص تجريبي', description: 'أقسام ومعادلة وفقرات بلغة الوثيقة', act: 'flag', key: 'sample' })}
        ${!isLetter && !isBeamer ? checkRow({ id: 'content-title', checked: cfg.titlePage, label: 'العنوان والمؤلف', description: 'يضيف \\maketitle', act: 'flag', key: 'titlePage' }) : ''}
        ${canAbstract ? checkRow({ id: 'content-abstract', checked: cfg.abstract, label: 'ملخص', description: 'بيئة abstract', act: 'flag', key: 'abstract' }) : ''}
        ${!isLetter ? checkRow({ id: 'content-toc', checked: cfg.toc, label: 'فهرس المحتويات', description: 'يضيف \\tableofcontents', act: 'flag', key: 'toc' }) : ''}
      </div>`;
    return section(6, 'محتوى القالب', 'العنوان والكاتب وما الذي تريد أن تجده في الوثيقة عند فتحها.', fields + checks);
  }

  function secProject() {
    const eligible = SPLIT_CLASSES.includes(cfg.docClass);
    if (!eligible) {
      return section(7, 'هيكل المشروع',
        'للتقارير والكتب: تجزئة الوثيقة إلى ملفات ومجلدات مستقلة وتنزيلها كملف ZIP.',
        callout('هذا الخيار متاح عند اختيار report أو book (أو نسختيهما في KOMA: scrreprt وscrbook) من نوع الوثيقة.'));
    }
    let body = segmented({
      legend: 'طريقة التنظيم', name: 'structure', value: cfg.splitProject ? 'split' : 'single',
      options: [
        { value: 'single', label: 'ملف واحد', hint: 'كل شيء داخل ملف .tex واحد' },
        { value: 'split', label: 'مشروع متعدد الملفات', hint: 'مجلدات وملف style.sty' },
      ],
      act: 'projectMode', columns: 2,
    });
    if (cfg.splitProject) {
      body += `
        ${textField({
          id: 'f-projectName', label: 'اسم مجلد المشروع', key: 'projectName', value: cfg.projectName,
          placeholder: 'my-thesis', ltr: true, mono: true,
          rawHint: `<p class="hint">المجلد الذي توضع فيه كل الملفات: <span id="projHint" dir="ltr">${escapeHtml(slugPreview(cfg.projectName))}</span>/ (أحرف لاتينية وأرقام وشرطات فقط).</p>`,
        })}
        ${callout('style.sty للحزم والخطوط واللغات، وfrontmatter/ للمقدمة والملخص، وchapters/ لكل فصل في ملف، وappendices/ للملاحق، وbackmatter/ للفصول الختامية، وbib/ للمراجع (references.bib).')}`;
    }
    return section(7, 'هيكل المشروع',
      'للتقارير والكتب: تجزئة الوثيقة إلى ملفات ومجلدات مستقلة وتنزيلها كملف ZIP.', body);
  }

  function renderSettings() {
    const focusedId = document.activeElement && document.activeElement.id ? document.activeElement.id : '';
    el.settings.innerHTML = secLanguage() + secEngine() + secDocument() + secFonts() + secPackages() + secContent() + secProject();
    if (focusedId) {
      const target = el.settings.querySelector(`[id="${CSS.escape(focusedId)}"]`);
      if (target) target.focus();
    }
  }

  /* ---------- لوحة الناتج (مرآة لـ output-panel.tsx) ---------- */

  function activeFileOf(output) {
    return output.files.find((f) => f.path === selectedPath) ?? output.files[0];
  }

  function summaryOf(cfgLocal, output) {
    const { resolved } = output;
    const items = [
      cfgLocal.engine,
      cfgLocal.docClass,
      resolved.langs.map((l) => LANGS[l].poly).join(' + '),
      FRAMEWORK_LABEL[resolved.framework],
      cfgLocal.docClass === 'beamer' ? cfgLocal.beamerTheme : cfgLocal.paper,
      cfgLocal.fontSize,
    ];
    if (output.isProject) items.push('multi-file');
    if (cfgLocal.engine !== 'pdflatex' && resolved.hasArabic) {
      const found = ARABIC_FONTS.find((f) => f.id === cfgLocal.arabicFonts.rm);
      items.push(found ? found.label.split(' —')[0] : '');
    }
    return items.filter(Boolean);
  }

  function outputHtml(output) {
    const activeFile = activeFileOf(output);
    const lines = activeFile.content.replace(/\n$/, '').split('\n');
    const rows = lines
      .map((line, i) =>
        `<div class="code-line"><span class="ln" aria-hidden="true">${i + 1}</span><span class="code-text">${highlightLatexLine(line)}</span></div>`)
      .join('');

    const tabs = output.isProject ? `
      <div class="code-tabs" dir="ltr" role="tablist" aria-label="ملفات المشروع">
        ${output.files.map((f) => `
          <button type="button" role="tab" aria-selected="${f.path === activeFile.path}" class="code-tab${f.path === activeFile.path ? ' active' : ''}" data-action="tab" data-path="${escapeHtml(f.path)}">${escapeHtml(f.path)}</button>`).join('')}
      </div>` : '';

    return `
      <div class="card out-top">
        <div class="out-file-row">
          <div class="field field-grow">
            <label for="f-fileName">اسم الملف</label>
            <div class="input-group" dir="ltr">
              <input id="f-fileName" class="text-input mono" type="text" data-act="text" data-key="fileName" value="${escapeHtml(cfg.fileName)}" dir="ltr" spellcheck="false" placeholder="main" aria-label="اسم الملف بدون الامتداد">
              <span class="input-suffix" title="يُضاف الامتداد تلقائيًا عند التحميل" aria-hidden="true">.tex</span>
            </div>
          </div>
          <div class="out-btns">
            <button type="button" class="btn outline" id="btnCopy" data-action="copy">${icon('copy')}<span>نسخ</span></button>
            ${output.isProject
              ? `<button type="button" class="btn primary" id="btnDownload" data-action="download-zip">${icon('archive')}<span>تحميل ZIP</span></button>`
              : `<button type="button" class="btn primary" id="btnDownload" data-action="download">${icon('download')}<span>تحميل</span></button>`}
          </div>
        </div>
        <ul class="chips" aria-label="ملخص الإعدادات">
          ${summaryOf(cfg, output).map((s) => `<li dir="auto">${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>

      <div class="code-shell">
        ${tabs}
        <div class="code-bar">
          <span class="code-path" dir="ltr">${escapeHtml(output.isProject ? `${output.projectName}/${activeFile.path}` : activeFile.path)}</span>
          <span class="code-lines">${lines.length} lines</span>
        </div>
        <div class="code-view" dir="ltr" tabindex="0" role="region" aria-label="معاينة كود LaTeX">
          <div class="w-max">${rows}</div>
        </div>
      </div>

      <details class="compile-card" open>
        <summary>${icon('terminal')}<span>الترجمة وملاحظات التوافق</span></summary>
        <div class="compile-body">
          <div class="cmd-row">
            <code dir="ltr">${escapeHtml(output.compile)}</code>
            <button type="button" class="btn outline icon-only" id="btnCopyCmd" data-action="copy-cmd" aria-label="نسخ أمر الترجمة">${icon('copy')}</button>
          </div>
          <ul class="notes">
            ${output.notes.map((n) => `<li class="note-${n.level}">${icon(n.level === 'warn' ? 'alert' : 'info')}<span>${escapeHtml(n.text)}</span></li>`).join('')}
          </ul>
        </div>
      </details>
      <p class="sr-only" role="status" aria-live="polite" id="copyStatus"></p>`;
  }

  function renderOutput() {
    const output = generate(cfg);
    lastOutput = output;
    if (!output.files.some((f) => f.path === selectedPath)) selectedPath = '';
    el.output.innerHTML = outputHtml(output);
  }

  function renderAll() {
    renderSettings();
    renderOutput();
  }

  /* ---------- تحديث الحالة ---------- */

  function patch(partial) {
    cfg = { ...cfg, ...partial };
    renderAll();
  }

  function patchText(key, value) {
    if (key === 'fileName') {
      const clean = sanitizeFileName(value);
      const pos = document.activeElement && document.activeElement.id === 'f-fileName'
        ? document.activeElement.selectionStart : null;
      cfg = { ...cfg, fileName: clean };
      renderOutput();
      const input = document.getElementById('f-fileName');
      if (input) {
        if (input.value !== clean) input.value = clean;
        if (pos !== null) {
          input.focus();
          const p = Math.min(pos, clean.length);
          input.setSelectionRange(p, p);
        }
      }
      return;
    }
    cfg = { ...cfg, [key]: value };
    if (key === 'projectName') {
      const hint = document.getElementById('projHint');
      if (hint) hint.textContent = slugPreview(value);
    }
    renderOutput();
  }

  function setDocClass(docClass) {
    const sizes = fontSizesFor(docClass);
    const fontSize = sizes.includes(cfg.fontSize) ? cfg.fontSize : sizes.includes('12pt') ? '12pt' : sizes[0];
    patch({ docClass, fontSize });
  }

  function togglePackage(id, on) {
    let next = on ? [...cfg.packages, id] : cfg.packages.filter((p) => p !== id);
    if (on && id === 'biblatex') next = next.filter((p) => p !== 'natbib');
    if (on && id === 'natbib') next = next.filter((p) => p !== 'biblatex');
    patch({ packages: next });
  }

  function onSettingsChange(target) {
    const act = target.dataset.act;
    if (act === 'set') {
      const key = target.dataset.key;
      const value = target.value;
      if (key === 'docClass') setDocClass(value);
      else if (key === 'mainLang') patch({ mainLang: value, extraLangs: cfg.extraLangs.filter((l) => l !== value) });
      else if (key === 'columns') patch({ columns: value === '2' ? 2 : 1 });
      else patch({ [key]: value });
    } else if (act === 'flag') {
      patch({ [target.dataset.key]: target.checked });
    } else if (act === 'extra') {
      const code = target.dataset.arg;
      patch({ extraLangs: target.checked ? [...cfg.extraLangs, code] : cfg.extraLangs.filter((x) => x !== code) });
    } else if (act === 'pkg') {
      togglePackage(target.dataset.arg, target.checked);
    } else if (act === 'font') {
      const key = target.dataset.key;
      patch({ [key]: { ...cfg[key], [target.dataset.role]: target.value } });
    } else if (act === 'projectMode') {
      patch({ splitProject: target.value === 'split' });
    }
  }

  /* ---------- النسخ والتنزيل ---------- */

  const timers = {};
  function flashCopy(btnId, copiedHtml, defaultHtml) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.innerHTML = copiedHtml;
    const status = document.getElementById('copyStatus');
    if (status) status.textContent = 'تم النسخ إلى الحافظة';
    if (timers[btnId]) clearTimeout(timers[btnId]);
    timers[btnId] = setTimeout(() => {
      const b = document.getElementById(btnId);
      if (b) b.innerHTML = defaultHtml;
    }, 2000);
  }

  const COPY_HTML = `${icon('copy')}<span>نسخ</span>`;
  const COPIED_HTML = `${icon('check')}<span>تم النسخ</span>`;
  const ICON_COPY_HTML = icon('copy');
  const ICON_CHECK_HTML = icon('check');

  async function copyTex() {
    if (lastOutput && (await copyToClipboard(activeFileOf(lastOutput).content))) {
      flashCopy('btnCopy', COPIED_HTML, COPY_HTML);
    }
  }

  async function copyCommand() {
    if (lastOutput && (await copyToClipboard(lastOutput.compile))) {
      flashCopy('btnCopyCmd', ICON_CHECK_HTML, ICON_COPY_HTML);
    }
  }

  /* saveBlob وcopyToClipboard نُقلا إلى assets/js/utils.js */

  function downloadSingle() {
    saveBlob(new Blob([lastOutput.tex], { type: 'application/x-tex;charset=utf-8' }), lastOutput.mainFile);
  }

  async function downloadZip() {
    const enc = new TextEncoder();
    const entries = lastOutput.files.map((f) => ({
      name: `${lastOutput.projectName}/${f.path}`,
      data: enc.encode(f.content),
    }));
    saveBlob(await buildZip(entries), `${lastOutput.projectName}.zip`);
  }

  /* ---------- ربط الأحداث (تفويض واحد لكل حاوية) ---------- */

  el.settings.addEventListener('change', (e) => {
    if (e.target.dataset && e.target.dataset.act) onSettingsChange(e.target);
  });
  el.settings.addEventListener('input', (e) => {
    if (e.target.dataset && e.target.dataset.act === 'text') patchText(e.target.dataset.key, e.target.value);
  });
  el.settings.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act="pkg-defaults"],[data-act="pkg-clear"]');
    if (!btn) return;
    if (btn.dataset.act === 'pkg-defaults') patch({ packages: [...DEFAULT_PACKAGES] });
    else patch({ packages: [] });
  });
  el.output.addEventListener('input', (e) => {
    if (e.target.dataset && e.target.dataset.act === 'text') patchText(e.target.dataset.key, e.target.value);
  });
  el.output.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    switch (btn.dataset.action) {
      case 'copy': copyTex(); break;
      case 'copy-cmd': copyCommand(); break;
      case 'download': downloadSingle(); break;
      case 'download-zip': downloadZip(); break;
      case 'tab':
        selectedPath = btn.dataset.path;
        renderOutput();
        break;
    }
  });

  renderAll();
}
