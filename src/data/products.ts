export interface Product {
  id: string;
  name: string;
  arabicName: string;
  category: "rings" | "chains" | "bracelets" | "earrings" | "sets";
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

export const GOVERNORATES = [
  { name: "القاهرة", shipping: 45 },
  { name: "الجيزة", shipping: 45 },
  { name: "الإسكندرية", shipping: 50 },
  { name: "القليوبية", shipping: 50 },
  { name: "الدقهلية (المنصورة)", shipping: 55 },
  { name: "الشرقية (الزقازيق)", shipping: 55 },
  { name: "الغربية (طنطا)", shipping: 55 },
  { name: "المنوفية", shipping: 55 },
  { name: "البحيرة", shipping: 55 },
  { name: "دمياط", shipping: 55 },
  { name: "بورسعيد", shipping: 55 },
  { name: "الإسماعيلية", shipping: 55 },
  { name: "السويس", shipping: 55 },
  { name: "كفر الشيخ", shipping: 55 },
  { name: "الفيوم", shipping: 60 },
  { name: "بني سويف", shipping: 60 },
  { name: "المنيا", shipping: 65 },
  { name: "أسيوط", shipping: 65 },
  { name: "سوهاج", shipping: 70 },
  { name: "قنا", shipping: 70 },
  { name: "الأقصر", shipping: 75 },
  { name: "أسوان", shipping: 75 },
  { name: "البحر الأحمر (الغردقة)", shipping: 75 },
  { name: "جنوب سيناء (شرم الشيخ)", shipping: 80 },
];
