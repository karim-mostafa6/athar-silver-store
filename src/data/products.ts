export interface StoreCategory {
  id: string;
  label: string;
  icon?: string;
  slug?: string;
  description?: string;
  bannerImage?: string;
  englishTitle?: string;
  isFeatured?: boolean;
}

export const DEFAULT_CATEGORIES: StoreCategory[] = [
  { id: "rings", label: "خواتم وسوليتير", slug: "rings", englishTitle: "RINGS & SOLITAIRES" },
  { id: "chains", label: "سلاسل إيطالي", slug: "chains", englishTitle: "ITALIAN CHAINS" },
  { id: "bracelets", label: "أساور وتنس", slug: "bracelets", englishTitle: "BRACELETS & TENNIS" },
  { id: "sets", label: "أطقم ملكية", slug: "sets", englishTitle: "ROYAL GIFT SETS" },
  { id: "earrings", label: "أقراط وحلقان", slug: "earrings", englishTitle: "EARRINGS" },
];

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  englishTitle?: string;
  subtitle?: string;
  content: string;
  bannerImage?: string;
  metaDescription?: string;
  isPublished: boolean;
  showInFooter?: boolean;
  footerLabel?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_CUSTOM_PAGES: CustomPage[] = [
  {
    id: "page-about",
    slug: "about",
    title: "عن أَثَـر • صياغة تخلد الحكاية",
    englishTitle: "ABOUT ATHAR • THE LEGACY",
    subtitle: "نصنع من الفضة الإسترليني عيار 925 بصمة وذكرى تتوارثها الأجيال... الأثر لا يُهدى بل يُترك",
    bannerImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    showInFooter: true,
    footerLabel: "عن أَثَر",
    content: `مرحباً بك في دار "أَثَر" للفضة الإسترليني عيار 925.

تأسس براند "أَثَر" ليقدم مفهوماً استثنائياً وجديداً كلياً في عالم المجوهرات الفضية الراقية. نحن نؤمن بأن كل قطعة مجوهرات تقتنيها أو تهديها لمن تحب ليست مجرد زينة عابرة، بل هي حكاية حية، وبصمة متألقة، وذكرى تدوم عبر السنين. ومن هنا انطلق شعارنا الراسخ: "الأثر لا يُهدى بل يُترك".

نقاء الفضة 925 المعتمد:
ننتقي بدقة بالغة سبائك الفضة الإسترليني عيار 925 الإيطالية والسويسرية الأصلية، وتُختم كل قطعة بختم النقاء الدولي لضمان أصالتها، وتُرفق معها بطاقة الضمان الملكي المعتمدة.

معالجة الروديوم الإيطالي والبلاتين:
تخضع كافة قطع أَثَر لمعالجة طلائية متطورة بطبقات الروديوم البلاتيني الفاخر، مما يمنحها بريقاً ماسياً ساحراً ويحميها تماماً من الخدوش أو التأكسد وتغير اللون.

تجربة الإهداء الملكي المتكاملة:
لأننا نعتني بأدق تفاصيل الفخامة، تأتي كل قطعة داخل علبة مخملية أنيقة مبطنة، مع كيس هدايا فاخر من أَثَر، ومنديل تنظيف وتلميع إيطالي مجاني، لتكون جاهزة لتقديمها كأرقى هدية تليق بأحبائك.`,
  },
  {
    id: "page-care",
    slug: "care",
    title: "دليل العناية بالفضة الإسترليني 925",
    englishTitle: "SILVER CARE GUIDE",
    subtitle: "خطوات بسيطة وتوصيات احترافية للحفاظ على بريق ولمعان قطعتك الفضية مدى الحياة",
    bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    showInFooter: true,
    footerLabel: "العناية بالفضة",
    content: `الفضة الإسترليني عيار 925 معدن نفيس ونبيل يتميز ببريقه المتلألئ، ومع العناية الصحيحة ستحتفظ قطعتك بأناقتها ورونقها الأصلي لأجيال قادمة.

1. العطور والمستحضرات الكيميائية:
يُوصى دائماً بارتداء قطعتك الفضية بعد الانتهاء تماماً من رش العطور ووضع الكريمات ومستحضرات التجميل. تجنب ملامسة الفضة للمنظفات المنزلية أو الكلور في حمامات السباحة، حيث أن المواد الكيميائية قد تؤثر تدريجياً على لمعان طبقة الروديوم.

2. التخزين الآمن والمثالي:
عند عدم ارتداء مجوهراتك، يُفضل حفظها داخل علبة "أَثَر" المخملية المبطنة الأصلية في مكان جاف ومعتدل الحرارة وبعيداً عن أشعة الشمس المباشرة والرطوبة العالية.

3. التنظيف اليومي اللطيف:
استخدم منديل تلميع الفضة الاحترافي المرفق مجاناً مع طلبيتك لمسح القطعة برفق بعد كل استخدام، لإزالة أي آثار طبيعية للزيوت أو الأتربة واستعادة بريقها الأخاذ فوراً.

4. خدمة التلميع والصيانة المجانية مدى الحياة:
نحن نعتز بكل عميل من عائلة أَثَر، ولذلك نوفر لك خدمة التلميع والتنظيف الاحترافي المجانية لجميع قطعك في أي وقت لتبقى قطعتك دائماً كما لو كانت جديدة تماماً.`,
  },
  {
    id: "page-returns",
    slug: "returns",
    title: "سياسة الاستبدال والاسترجاع والضمان",
    englishTitle: "RETURNS & EXCHANGE POLICY",
    subtitle: "تسوق بثقة تامة وأمان مطلق مع حق المعاينة الفورية والاستبدال السلس خلال 14 يوماً",
    bannerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    showInFooter: true,
    footerLabel: "الاستبدال والاسترجاع",
    content: `في متجر أَثَر، نسعى دائماً لتقديم تجربة تسوق ملكية تمنحك الثقة وراحة البال المطلقة.

حق المعاينة الكاملة عند الاستلام:
يتيح لك متجر أَثَر فحص ومعاينة الشحنة بالكامل أثناء تواجد مندوب الشحن، والتأكد من مطابقة القطعة والمقاس والجودة بنسبة 100% قبل سداد قيمة الطلب.

مهلة الاستبدال والاسترجاع (14 يوماً):
إذا رغبت في استبدال المقاس أو استبدال القطعة بتصميم آخر، أو حتى الاسترجاع لأي سبب مصنعي، يمنحك متجر أَثَر مهلة 14 يوماً من تاريخ استلام الطلب.

شروط الاستبدال والاسترجاع:
1. أن تكون القطعة بحالتها الأصلية غير المستخدمة ودون أي خدوش.
2. الحفاظ على العلبة المخملية الأصلية، وكيس الهدايا، وكارت الضمان المعتمد المرفق.
3. في حالة استبدال المقاس، يتم التنسيق وتوصيل المقاس الجديد لباب بيتك بأسرع وقت.
4. في حالة وجود أي عيب مصنعي (وهو أمر نادر جداً لخضوع كافة القطع لفحص دقيق)، نتحمل نحن كافة تكاليف الشحن كاملة مع استبدال فوري أو استرداد كامل للمبلغ.`,
  },
  {
    id: "page-warranty",
    slug: "warranty",
    title: "وثيقة الضمان الملكي المعتمد",
    englishTitle: "LIFETIME ROYAL WARRANTY",
    subtitle: "ضمان رسمي مدى الحياة على أصالة الفضة الإسترليني عيار 925 ودقة ونقاء الأحجار",
    bannerImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    showInFooter: true,
    footerLabel: "سياسة الضمان",
    content: `شهادة الضمان الملكي من دار أَثَر:

كل قطعة من مجوهرات "أَثَر" تصدر معها بطاقة ضمان رسمي معتمد تُوثق معايير الجودة الفائقة المتبعة في صياغتها.

بنود الضمان الملكي:
1. ضمان عيار الفضة مدى الحياة:
نضمن رسمياً وبشكل قاطع أن كافة قطعنا مصنوعة من الفضة الإسترليني عيار 925 الإيطالية والسويسرية الحقيقية بنقاء 92.5% من الفضة الخالصة، ومختومة بختم النقاء الدولي الرسمي.

2. نقاء الأحجار وتثبيتها:
نستخدم أرقى أحجار الزركون السويسري الماسي بدرجة نقاء AAA والأحجار الكريمة الطبيعية المختارة، مع تثبيت يدوي ميكرو-سيتينج مقاوم للسقوط.

3. الصيانة والتلميع المجاني مدى الحياة:
يحصل حامل كارت الضمان على خدمة تلميع وتنظيف احترافي دوري مجاناً في أي وقت طوال فترة اقتناء القطعة.

4. كيفية الاستفادة من الضمان:
فقط تواصل مع فريق خدمة العملاء عبر الواتساب المعتمد مع ذكر رقم الطلب أو تقديم كارت الضمان، وسنقوم بخدمتك وتلبية طلبك بأعلى مستويات الاحترافية.`,
  },
  {
    id: "page-contact",
    slug: "contact",
    title: "تواصل مع دار أَثَـر للفضة",
    englishTitle: "CONTACT & CUSTOMER CARE",
    subtitle: "فريق خدمة العملاء الملكي في انتظارك للإجابة على استفساراتك وتخصيص طلباتك على مدار الساعة",
    bannerImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    showInFooter: true,
    footerLabel: "تواصل معنا",
    content: `يسعدنا دائماً الترحيب بك والتواصل معك في دار أَثَر. سواء كان لديك استفسار عن مواصفات قطعة معينة، أو رغبة في استشارة لاختيار مقاس الخاتم المناسب، أو طلب تغليف مخصص لمناسبة خاصة، فإن فريقنا المتخصص يسعد بخدمتك.

قنوات التواصل الرسمية:
• واتساب المبيعات والدعم الفوري: متاح على مدار الساعة للرد على استفساراتك وتأكيد طلباتك ومتابعة الشحنات.
• البريد الإلكتروني الرسمي: theathar.eg@gmail.com
• حساب إنستجرام: @theathar.eg لمتابعة أحدث التشكيلات والكواليس الحصرية.

أوقات العمل وخدمة العملاء:
نعمل يومياً طوال أيام الأسبوع من الساعة 10:00 صباحاً وحتى الساعة 11:00 مساءً بتوقيت القاهرة.

الشحن والتوصيل:
شحن سريع وتغطية شاملة لكافة محافظات جمهورية مصر العربية حتى باب البيت، مع التنسيق الهاتفي المسبق لميعاد التسليم المناسب لك.`,
  },
];

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  category: string;
  collections?: string[]; // المجموعات والكولكشن التابع لها
  gender: "men" | "women" | "unisex";
  purity: string; // e.g. "فضة إسترليني عيار 925"
  price: number;
  originalPrice?: number;
  costPrice?: number; // تكلفة القطعة لحساب هامش الربح
  sku?: string; // كود الباركود / التتبع
  stockQuantity?: number; // عدد القطع المتوفرة بالمخزن
  stoneType?: string; // نوع الحجر (زركون، عقيق، صدف...)
  platingOptions?: string[]; // خيارات الطلاء المتوفرة
  customBadge?: string; // شارة ترويجية مخصصة
  metaTitle?: string;
  metaDescription?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  features: string[];
  sizes?: string[];
  defaultSize?: string;
  weightGrams: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  customEngravingAvailable?: boolean;
  customEngravingMaxChars?: number;
  warrantyDuration?: string;
  internalNotes?: string;
  returnPolicyNote?: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "ath-01",
    name: "Classic Cuban Curb Silver Chain",
    arabicName: "سلسلة كبح كوبية فضة إيطالي ثقيلة 925",
    category: "chains",
    gender: "men",
    purity: "فضة إسترليني عيار 925 معتمدة",
    price: 1850,
    originalPrice: 2200,
    rating: 4.9,
    reviewsCount: 38,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611591475102-4a008c3d82a1?auto=format&fit=crop&w=800&q=80",
    ],
    description: "سلسلة كبح رجالية كلاسيكية بتشطيب إيطالي فاخر. صُنعت بحرفية عالية من الفضة الإسترليني عيار 925 مع قفل أمان متين وملمس ناعم على الرقبة.",
    features: [
      "فضة إيطالية أصلية مختومة عيار 925",
      "مطلية بالروديوم النقي لمقاومة الاكسدة ولمعان دائم",
      "قفل بوكس متين ومحكم لراحة وأمان تام",
      "تأتي مع علبة مخملية فاخرة وشهادة ضمان معتمدة",
    ],
    sizes: ["50 سم", "55 سم", "60 سم"],
    defaultSize: "55 سم",
    weightGrams: 32.5,
    isBestSeller: true,
    inStock: true,
    tags: ["سلاسل رجالي", "فضة إيطالي", "كوبان", "عيار 925"],
  },
  {
    id: "ath-02",
    name: "Swiss Zircon Solitaire Royal Ring",
    arabicName: "خاتم سوليتير ملكي فضة 925 بزركون سويسري",
    category: "rings",
    gender: "women",
    purity: "فضة إسترليني عيار 925 نقية",
    price: 1250,
    originalPrice: 1550,
    rating: 5.0,
    reviewsCount: 64,
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    ],
    description: "خاتم سوليتير بتصميم ملكي ساحر مرصع بحجر زركون سويسري قطع بريليانت عالي البريق يعكس الضوء بنقاء الماس، مع تطعيمات جانبية ناعمة.",
    features: [
      "فضة إسترليني 925 مطلية بطبقة من الروديوم الأبيض الفاخر",
      "فص رئيسي بريليانت بقطع ألماسي عالي النقاء 1.5 قيراط",
      "فصوص جانبية مثبتة بإحكام بتقنية Micro-pave",
      "مثالي كهدية مميزة أو شبكة فضة راقية",
    ],
    sizes: ["6", "7", "8", "9"],
    defaultSize: "7",
    weightGrams: 5.2,
    isBestSeller: true,
    isNew: true,
    inStock: true,
    tags: ["خواتم نسائية", "سوليتير", "زركون", "هدايا"],
  },
  {
    id: "ath-03",
    name: "Sparkling Diamond Tennis Bracelet",
    arabicName: "إسوارة تنس فضة 925 مرصعة بأحجار زركون متلألئة",
    category: "bracelets",
    gender: "women",
    purity: "فضة إسترليني عيار 925",
    price: 2100,
    originalPrice: 2600,
    rating: 4.9,
    reviewsCount: 42,
    images: [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
    ],
    description: "إسوارة التنس الأيقونية بتصميم عصري من الفضة النقية. صف متصل من أحجار الزركون المختارة بعناية يمنح معصمك بريقاً مبهراً في كافة المناسبات.",
    features: [
      "حزام مرن ومتين من الفضة 925",
      "قفل مزدوج (Double-Safety Clasp) لمنع السقوط",
      "طلاء روديوم بلاتيني يحافظ على بياض ولمعان الإسوارة",
      "تأتي مع قماش تلميع خاص لحفظ الرونق",
    ],
    sizes: ["16 سم", "18 سم", "20 سم"],
    defaultSize: "18 سم",
    weightGrams: 14.8,
    isBestSeller: true,
    inStock: true,
    tags: ["أساور نسائي", "تنس", "زركون سويسري"],
  },
  {
    id: "ath-04",
    name: "Yemeni Onyx Imperial Men Ring",
    arabicName: "خاتم رجالي عقيق يماني أسود فضة ثقيلة منقوشة",
    category: "rings",
    gender: "men",
    purity: "فضة إسترليني عيار 925 ثقيلة",
    price: 1680,
    originalPrice: 1950,
    rating: 4.8,
    reviewsCount: 29,
    images: [
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "خاتم هيبة وفخامة بحجر عقيق يماني أسود طبيعي مصقول. الصياغة اليدوية بالنقوش العثمانية الدقيقة تعكس الأصالة والذوق الرفيع.",
    features: [
      "حجر عقيق طبيعي أصلي بلون أسود فحمي لامع",
      "فضة ثقيلة مصمتة عيار 925",
      "نقوش جانبية مفرغة ومؤكسدة تبرز التفاصيل التراثية",
      "مريح جداً عند الارتداء اليومي",
    ],
    sizes: ["18", "20", "22", "24"],
    defaultSize: "20",
    weightGrams: 16.4,
    isNew: true,
    inStock: true,
    tags: ["خواتم رجالي", "عقيق يماني", "نقش عثماني"],
  },
  {
    id: "ath-05",
    name: "Tree of Life Diamond Cut Pendant",
    arabicName: "سلسلة ودلاية شجرة الحياة فضة 925 مرصعة",
    category: "chains",
    gender: "women",
    purity: "فضة إسترليني عيار 925",
    price: 990,
    originalPrice: 1250,
    rating: 4.9,
    reviewsCount: 51,
    images: [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    ],
    description: "رمز النمو والأمل متجسد في دلاية شجرة الحياة المتقنة بأغصان مرصعة بأحجار زركون بيضاء نقية مع سلسلة فضية رفيعة وناعمة.",
    features: [
      "تصميم رمزي عصري محفور بدقة ميكرونية",
      "سلسلة إيطالية ناعمة بطول قابل للتعديل",
      "حماية كاملة من تغير اللون مع ضمان النقاء",
      "تغليف هدية راقٍ يشمل بطاقة إهداء خاصة",
    ],
    sizes: ["45 سم (قابل للتعديل)"],
    defaultSize: "45 سم (قابل للتعديل)",
    weightGrams: 6.8,
    isBestSeller: false,
    inStock: true,
    tags: ["سلاسل نسائي", "دلايات", "شجرة الحياة"],
  },
  {
    id: "ath-06",
    name: "Minimalist Modern Huggie Hoop Earrings",
    arabicName: "حلق هوب فضة 925 عصري مرصع بخط زركون",
    category: "earrings",
    gender: "women",
    purity: "فضة إسترليني عيار 925",
    price: 850,
    originalPrice: 1050,
    rating: 4.7,
    reviewsCount: 33,
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "أقراط هوب ناعمة جداً للإطلالات اليومية والمسائية. قفل عملي محكم يضمن ثبات الحلق وخفة وزنه لراحة قصوى طوال اليوم.",
    features: [
      "آمن تماماً للبشرة الحساسة ولا يسبب أي تحسس (Hypoallergenic)",
      "قفل كليك آمن وسريع الارتداء",
      "حبيبات زركون نقية عاكسة للضوء",
      "فضة 925 خالية من النيكل والرصاص",
    ],
    weightGrams: 3.4,
    isNew: true,
    inStock: true,
    tags: ["حلقان", "هوب", "مودرن", "يومي"],
  },
  {
    id: "ath-07",
    name: "Braided Leather & Silver Magnetic Bangle",
    arabicName: "إسوارة جلد طبيعي مجدول مع فضة 925 وقفل مغناطيسي",
    category: "bracelets",
    gender: "men",
    purity: "فضة إسترليني 925 مع جلد طبيعي",
    price: 1390,
    originalPrice: 1650,
    rating: 4.8,
    reviewsCount: 22,
    images: [
      "https://images.unsplash.com/photo-1611591475102-4a008c3d82a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    ],
    description: "المزيج المثالي بين فخامة الجلد الطبيعي الإيطالي وقوة الفضة الإسترليني عيار 925. قطعة شبابية جريئة تعطي لمسة أناقة ملفتة.",
    features: [
      "جلد طبيعي مجدول فاخر بلون أسود مات لا يتشقق",
      "قطعة وسطية وقفل من الفضة 925 المصقولة",
      "مغناطيس نيوديميوم قوي مع مزلاج أمان",
      "مناسبة للإطلالات الكاجوال والرسمية",
    ],
    sizes: ["19 سم", "21 سم"],
    defaultSize: "21 سم",
    weightGrams: 18.2,
    inStock: true,
    tags: ["أساور رجالي", "جلد طبيعي", "فضة 925"],
  },
  {
    id: "ath-08",
    name: "Royal Athar Bridal Luxury Set",
    arabicName: "طقم أثر الملكي الكامل (سلسلة + خاتم + إسوارة + حلق)",
    category: "sets",
    gender: "women",
    purity: "فضة إسترليني عيار 925 مطلية بلاتين",
    price: 4950,
    originalPrice: 5900,
    rating: 5.0,
    reviewsCount: 47,
    images: [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "التحفة الأبرز في كولكشن أثر. طقم متكامل مصمم خصيصاً للمناسبات الكبرى وشبكة الفضة الفاخرة، يجمع بين الرقي اللامتناهي والبريق الأخّاذ.",
    features: [
      "طقم مكون من 4 قطع متناغمة بحرفية استثنائية",
      "مرصع بأكثر من 180 فص زركون سويسري عالي النقاء",
      "مطلي بـ 3 طبقات من البلاتين والروديوم لمنع الخدوش",
      "يأتي في صندوق خشبي مبطن بالقطيفة الفاخرة مع كارت ضمان معتمد",
    ],
    sizes: ["مقاس حر قابل للتعديل"],
    defaultSize: "مقاس حر قابل للتعديل",
    weightGrams: 48.0,
    isBestSeller: true,
    isNew: true,
    inStock: true,
    tags: ["أطقم كاملة", "أطقم شبكة", "هدايا زواج", "طقم ملكي"],
  },
  {
    id: "ath-09",
    name: "Sterling Silver Rope Chain",
    arabicName: "سلسلة حبل إيطالية مجدولة فضة 925 ناعمة",
    category: "chains",
    gender: "unisex",
    purity: "فضة إسترليني عيار 925",
    price: 1150,
    originalPrice: 1400,
    rating: 4.8,
    reviewsCount: 19,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611591475102-4a008c3d82a1?auto=format&fit=crop&w=800&q=80",
    ],
    description: "سلسلة الحبل المجدولة (Rope Chain) بتصميم انسيابي مريح. تعكس الضوء مع كل حركة، ويمكن ارتداؤها منفردة أو مع دلاية مميزة.",
    features: [
      "جدائل فضية متداخلة ببريق ماسي Diamond-cut",
      "مناسبة للرجال والنساء (Unisex)",
      "وزن متوازن ومريح للارتداء طوال اليوم",
      "قفل لوبستر إيطالي متين",
    ],
    sizes: ["45 سم", "50 سم", "55 سم"],
    defaultSize: "50 سم",
    weightGrams: 15.6,
    inStock: true,
    tags: ["سلاسل ناعمة", "حبل مجدول", "يونيسكس"],
  },
  {
    id: "ath-10",
    name: "Infinity Silver Promise Ring",
    arabicName: "خاتم إنفينيتي اللانهاية فضة 925 مرصع",
    category: "rings",
    gender: "women",
    purity: "فضة إسترليني عيار 925",
    price: 890,
    originalPrice: 1100,
    rating: 4.9,
    reviewsCount: 36,
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    ],
    description: "رمز الحب الأبدي في خاتم رشيق يحمل علامة اللانهاية مرصعة بالكامل بفصوص زركون نقية. خيار مثالي لهدايا أعياد الميلاد والذكرى السنوية.",
    features: [
      "تصميم إنفينيتي انسيابي مريح على الأصابع",
      "مرصع بزركون نقي مثبت بحرفية",
      "مقاوم للماء والعطور ومحمي بالروديوم",
      "تغليف هدية فوري جاهز للتقديم",
    ],
    sizes: ["6", "7", "8"],
    defaultSize: "7",
    weightGrams: 4.1,
    inStock: true,
    tags: ["خواتم", "إنفينيتي", "هدايا حب"],
  },
  {
    id: "ath-11",
    name: "Tiger Eye Stone Men Silver Ring",
    arabicName: "خاتم رجالي حجر عين النمر فضة 925 مصقولة",
    category: "rings",
    gender: "men",
    purity: "فضة إسترليني عيار 925 أصلية",
    price: 1550,
    originalPrice: 1800,
    rating: 4.8,
    reviewsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "حجر عين النمر البني المتموج بظلال طبيعية ساحرة محاط بهيكل متين من الفضة الإسترليني عيار 925 ليمنحك حضوراً واثقاً ومميزاً.",
    features: [
      "حجر عين نمر طبيعي بدرجات البني والعسلي",
      "هيكل فضة ثقيل مصقول بدقة ومريح للارتداء",
      "مقاوم للخدش وتغير اللون",
      "مختوم بختم عيار 925 الرسمي",
    ],
    sizes: ["19", "21", "23"],
    defaultSize: "21",
    weightGrams: 14.5,
    inStock: true,
    tags: ["خواتم رجالي", "عين النمر", "أحجار كريمة"],
  },
  {
    id: "ath-12",
    name: "Freshwater Pearl Silver Drop Earrings",
    arabicName: "حلق متدلي لؤلؤ طبيعي وفضة إسترليني 925",
    category: "earrings",
    gender: "women",
    purity: "فضة إسترليني 925 مع لؤلؤ طبيعي",
    price: 1120,
    originalPrice: 1350,
    rating: 4.9,
    reviewsCount: 27,
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
    ],
    description: "تناغم راقٍ بين بريق الفضة ولمعان حبات اللؤلؤ الطبيعي العذب. تصميم متدلي يضفي نعومة وأنوثة طاغية على أي إطلالة مسائية.",
    features: [
      "لؤلؤ زراعي طبيعي حقيقي بلمعان صدفي رائع",
      "أذرع متدلية من الفضة 925 المرنة والمريحة",
      "خفيف على شحمة الأذن دون أي إجهاد",
      "ضمان أصالة اللؤلؤ والفضة مدى الحياة",
    ],
    weightGrams: 4.9,
    isNew: true,
    inStock: true,
    tags: ["حلقان", "لؤلؤ طبيعي", "مناسبات"],
  },
];

export interface GovernorateInfo {
  name: string;
  region: "cairo" | "alex_coast" | "delta" | "canal_sinai" | "upper_egypt";
  regionName: string;
  shipping: number;
  deliveryEstimate: string;
}

export const GOVERNORATES: GovernorateInfo[] = [
  // القاهرة الكبرى
  { name: "القاهرة", region: "cairo", regionName: "القاهرة الكبرى", shipping: 45, deliveryEstimate: "خلال 24-48 ساعة" },
  { name: "الجيزة", region: "cairo", regionName: "القاهرة الكبرى", shipping: 45, deliveryEstimate: "خلال 24-48 ساعة" },
  { name: "القليوبية", region: "cairo", regionName: "القاهرة الكبرى", shipping: 50, deliveryEstimate: "خلال 24-48 ساعة" },

  // الإسكندرية والساحل
  { name: "الإسكندرية", region: "alex_coast", regionName: "الإسكندرية والساحل", shipping: 50, deliveryEstimate: "خلال 24-48 ساعة" },
  { name: "مطروح (الساحل الشمالي)", region: "alex_coast", regionName: "الإسكندرية والساحل", shipping: 75, deliveryEstimate: "خلال 2-3 أيام" },

  // الدلتا والوجه البحري
  { name: "الدقهلية (المنصورة)", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "الشرقية (الزقازيق)", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "الغربية (طنطا)", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "المنوفية", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "البحيرة", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "كفر الشيخ", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "دمياط", region: "delta", regionName: "الدلتا والوجه البحري", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },

  // مدن القناة وسيناء
  { name: "بورسعيد", region: "canal_sinai", regionName: "مدن القناة وسيناء", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "الإسماعيلية", region: "canal_sinai", regionName: "مدن القناة وسيناء", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "السويس", region: "canal_sinai", regionName: "مدن القناة وسيناء", shipping: 55, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "جنوب سيناء (شرم الشيخ)", region: "canal_sinai", regionName: "مدن القناة وسيناء", shipping: 80, deliveryEstimate: "خلال 3-4 أيام" },
  { name: "شمال سيناء", region: "canal_sinai", regionName: "مدن القناة وسيناء", shipping: 80, deliveryEstimate: "خلال 3-4 أيام" },

  // صعيد مصر والجنوب
  { name: "الفيوم", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 60, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "بني سويف", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 60, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "المنيا", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 65, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "أسيوط", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 65, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "سوهاج", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 70, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "قنا", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 70, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "الأقصر", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 75, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "أسوان", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 75, deliveryEstimate: "خلال 3-4 أيام" },
  { name: "البحر الأحمر (الغردقة)", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 75, deliveryEstimate: "خلال 2-3 أيام" },
  { name: "الوادي الجديد", region: "upper_egypt", regionName: "صعيد مصر والجنوب", shipping: 85, deliveryEstimate: "خلال 3-5 أيام" },
];
