import type { Category, Supplier, Product } from './types';

/* ------------------------------------------------------------------ */
/*  Categories — 12 realistic medical-equipment categories             */
/* ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  { id: 'c1',  slug: 'diagnostic',  nameAr: 'أجهزة التشخيص',       nameFr: 'Diagnostic',         nameEn: 'Diagnostic',         icon: '🩺', color: '#2a9ed4' },
  { id: 'c2',  slug: 'surgical',    nameAr: 'الأدوات الجراحيّة',    nameFr: 'Chirurgie',          nameEn: 'Surgical',           icon: '🔪', color: '#ef4444' },
  { id: 'c3',  slug: 'imaging',     nameAr: 'التصوير الطبّي',        nameFr: 'Imagerie',           nameEn: 'Imaging',            icon: '📡', color: '#7c6ef2' },
  { id: 'c4',  slug: 'monitoring',  nameAr: 'المراقبة الحيويّة',     nameFr: 'Monitoring',         nameEn: 'Monitoring',         icon: '❤️', color: '#15b886' },
  { id: 'c5',  slug: 'lab',         nameAr: 'أجهزة المخابر',         nameFr: 'Laboratoire',        nameEn: 'Laboratory',         icon: '🧪', color: '#10b981' },
  { id: 'c6',  slug: 'dental',      nameAr: 'طبّ الأسنان',           nameFr: 'Dentaire',           nameEn: 'Dental',             icon: '🦷', color: '#06b6d4' },
  { id: 'c7',  slug: 'ortho',       nameAr: 'العظام والتأهيل',       nameFr: 'Orthopédie',         nameEn: 'Orthopedics',        icon: '🦴', color: '#f59e0b' },
  { id: 'c8',  slug: 'consumables', nameAr: 'المستلزمات الاستهلاكيّة', nameFr: 'Consommables',       nameEn: 'Consumables',        icon: '🧤', color: '#ec4899' },
  { id: 'c9',  slug: 'emergency',   nameAr: 'الطوارئ والإنعاش',      nameFr: 'Urgences',           nameEn: 'Emergency',          icon: '🚑', color: '#ef4444' },
  { id: 'c10', slug: 'ophthalmic',  nameAr: 'طبّ العيون',           nameFr: 'Ophtalmologie',      nameEn: 'Ophthalmology',      icon: '👁️', color: '#a855f7' },
  { id: 'c11', slug: 'sterile',     nameAr: 'التعقيم',              nameFr: 'Stérilisation',      nameEn: 'Sterilization',      icon: '🧼', color: '#14b8a6' },
  { id: 'c12', slug: 'pediatric',   nameAr: 'طبّ الأطفال',           nameFr: 'Pédiatrie',          nameEn: 'Pediatrics',         icon: '👶', color: '#f472b6' },
];

/* ------------------------------------------------------------------ */
/*  Suppliers — 3 verified sample suppliers                            */
/* ------------------------------------------------------------------ */

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', businessName: 'El-Shifa Medical Supply',     wilayaCode: 16, plan: 'gold',  verified: true, rating: 4.8, reviewsCount: 142, memberSince: '2024-03-15' },
  { id: 'sup2', businessName: 'MediLab Constantine',         wilayaCode: 25, plan: 'pro',   verified: true, rating: 4.6, reviewsCount:  89, memberSince: '2024-06-22' },
  { id: 'sup3', businessName: 'Pharma-Equip Oran',           wilayaCode: 31, plan: 'basic', verified: true, rating: 4.4, reviewsCount:  37, memberSince: '2025-01-08' },
];

/* ------------------------------------------------------------------ */
/*  Products — 24 realistic medical products                           */
/* ------------------------------------------------------------------ */

/** Placeholder image: a coloured SVG with the category icon, encoded inline. */
function svgImg(color: string, icon: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='${color}' opacity='0.12'/><rect width='400' height='300' fill='url(%23g)'/><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${color}' stop-opacity='0.20'/><stop offset='100%' stop-color='${color}' stop-opacity='0.05'/></linearGradient></defs><text x='50%' y='55%' font-size='120' text-anchor='middle' dominant-baseline='middle'>${icon}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, '%23').replace(/"/g, "'")}`;
}

function productImages(catId: string): string[] {
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  return [svgImg(cat.color, cat.icon)];
}

export const PRODUCTS: Product[] = [
  // Diagnostic
  {
    id: 'p001', categoryId: 'c1', supplierId: 'sup1',
    nameAr: 'جهاز تخطيط القلب ECG بـ 12 مسرى',
    nameFr: 'Électrocardiographe ECG 12 dérivations',
    nameEn: '12-Lead ECG Machine',
    brand: 'Nihon Kohden',
    descAr: 'جهاز ECG محمول مع شاشة لمس 8 بوصات وذاكرة لـ 200 مريض.',
    descFr: 'ECG portable, écran tactile 8 pouces, mémoire 200 patients.',
    descEn: 'Portable ECG, 8-inch touchscreen, 200-patient memory.',
    specsAr: ['12 مسرى', 'شاشة 8″ لمس', 'بطّاريّة 6 ساعات', 'Wi-Fi + Bluetooth'],
    specsFr: ['12 dérivations', 'Écran tactile 8″', 'Batterie 6 h', 'Wi-Fi + Bluetooth'],
    specsEn: ['12 leads', '8″ touchscreen', '6-hour battery', 'Wi-Fi + Bluetooth'],
    price: 185000, stock: 7, images: productImages('c1'), rating: 4.7, reviewsCount: 23, featured: true, createdAt: '2025-11-02',
  },
  {
    id: 'p002', categoryId: 'c1', supplierId: 'sup2',
    nameAr: 'سماعة طبّيّة احترافيّة',
    nameFr: 'Stéthoscope professionnel',
    nameEn: 'Professional Stethoscope',
    brand: '3M Littmann',
    descAr: 'سماعة بتقنيّة قياس الترددات العالية للاستخدام القلبي.',
    descFr: 'Stéthoscope cardiologique haute fréquence.',
    descEn: 'Cardiology-grade high-frequency stethoscope.',
    specsAr: ['طول 69 سم', 'صدر مزدوج', 'ضمان 7 سنوات'],
    specsFr: ['Longueur 69 cm', 'Pavillon double', 'Garantie 7 ans'],
    specsEn: ['69 cm length', 'Dual-head chestpiece', '7-year warranty'],
    price: 18500, stock: 42, images: productImages('c1'), rating: 4.9, reviewsCount: 67, featured: false, createdAt: '2025-10-18',
  },
  {
    id: 'p003', categoryId: 'c1', supplierId: 'sup3',
    nameAr: 'مقياس ضغط دم إلكتروني',
    nameFr: 'Tensiomètre électronique',
    nameEn: 'Electronic Blood Pressure Monitor',
    brand: 'Omron',
    descAr: 'مقياس ضغط رقمي مع شاشة عريضة وذاكرة لمستخدمَين.',
    descFr: 'Tensiomètre numérique, grand écran, mémoire 2 utilisateurs.',
    descEn: 'Digital BP monitor, large display, 2-user memory.',
    specsAr: ['دقّة ±3 mmHg', 'ذاكرة 120 قراءة', 'كشف عدم انتظام ضربات القلب'],
    specsFr: ['Précision ±3 mmHg', 'Mémoire 120 lectures', 'Détection d\'arythmie'],
    specsEn: ['±3 mmHg accuracy', '120-reading memory', 'Arrhythmia detection'],
    price: 8900, stock: 120, images: productImages('c1'), rating: 4.5, reviewsCount: 88, featured: false, createdAt: '2025-11-20',
  },

  // Surgical
  {
    id: 'p004', categoryId: 'c2', supplierId: 'sup1',
    nameAr: 'طقم أدوات جراحيّة أساسيّة (35 قطعة)',
    nameFr: 'Set chirurgical basique (35 pièces)',
    nameEn: 'Basic Surgical Instrument Set (35 pieces)',
    brand: 'Aesculap',
    descAr: 'طقم كامل من الفولاذ المقاوم للصدأ مع حقيبة تعقيم.',
    descFr: 'Set complet en acier inoxydable avec boîte de stérilisation.',
    descEn: 'Complete stainless-steel set with sterilization case.',
    specsAr: ['35 قطعة', 'فولاذ ألماني', 'حقيبة تعقيم مرفقة'],
    specsFr: ['35 pièces', 'Acier allemand', 'Boîte fournie'],
    specsEn: ['35 pieces', 'German steel', 'Case included'],
    price: 95000, stock: 15, images: productImages('c2'), rating: 4.8, reviewsCount: 31, featured: true, createdAt: '2025-09-12',
  },
  {
    id: 'p005', categoryId: 'c2', supplierId: 'sup2',
    nameAr: 'مقصّ جراحي مستقيم 14 سم',
    nameFr: 'Ciseaux chirurgicaux droits 14 cm',
    nameEn: 'Straight Surgical Scissors 14 cm',
    brand: 'Medline',
    descAr: 'مقصّ دقيق من الفولاذ قابل للتعقيم المتكرّر.',
    descFr: 'Ciseaux précis, stérilisables.',
    descEn: 'Precise autoclavable scissors.',
    specsAr: ['14 سم', 'قابل للتعقيم', 'ضمان سنتين'],
    specsFr: ['14 cm', 'Autoclavable', 'Garantie 2 ans'],
    specsEn: ['14 cm', 'Autoclavable', '2-year warranty'],
    price: 4200, stock: 250, images: productImages('c2'), rating: 4.3, reviewsCount: 54, featured: false, createdAt: '2025-10-05',
  },

  // Imaging
  {
    id: 'p006', categoryId: 'c3', supplierId: 'sup1',
    nameAr: 'جهاز إيكوغرافي (Ultrasound) محمول',
    nameFr: 'Échographe portable',
    nameEn: 'Portable Ultrasound Machine',
    brand: 'Mindray',
    descAr: 'جهاز إيكوغرافي بشاشة 15 بوصة ومستشعرَين.',
    descFr: 'Échographe écran 15″, 2 sondes.',
    descEn: '15-inch screen, 2 probes included.',
    specsAr: ['شاشة 15″', 'مستشعر Convex + Linear', 'بطّاريّة 2 ساعة'],
    specsFr: ['Écran 15″', 'Sondes convex + linéaire', 'Batterie 2 h'],
    specsEn: ['15″ screen', 'Convex + linear probes', '2-hour battery'],
    price: 850000, stock: 3, images: productImages('c3'), rating: 4.9, reviewsCount: 14, featured: true, createdAt: '2025-08-25',
  },
  {
    id: 'p007', categoryId: 'c3', supplierId: 'sup2',
    nameAr: 'منظار أذن جيبي LED',
    nameFr: 'Otoscope de poche LED',
    nameEn: 'Pocket LED Otoscope',
    brand: 'Welch Allyn',
    descAr: 'منظار أذن محمول بإضاءة LED عالية الجودة.',
    descFr: 'Otoscope portable à éclairage LED.',
    descEn: 'Handheld LED otoscope.',
    specsAr: ['إضاءة LED', '3x تكبير', 'بطّاريّة AA'],
    specsFr: ['Éclairage LED', 'Zoom 3×', 'Pile AA'],
    specsEn: ['LED light', '3× zoom', 'AA battery'],
    price: 22500, stock: 28, images: productImages('c3'), rating: 4.6, reviewsCount: 22, featured: false, createdAt: '2025-11-01',
  },

  // Monitoring
  {
    id: 'p008', categoryId: 'c4', supplierId: 'sup1',
    nameAr: 'مونيتور المرضى متعدّد الوظائف',
    nameFr: 'Moniteur patient multi-paramètres',
    nameEn: 'Multi-Parameter Patient Monitor',
    brand: 'Philips',
    descAr: 'مونيتور ICU بشاشة 12 بوصة يقيس 6 مؤشّرات حيويّة.',
    descFr: 'Moniteur ICU 12″, 6 paramètres vitaux.',
    descEn: 'ICU monitor, 12″, 6 vital signs.',
    specsAr: ['ECG + SpO2 + NIBP', 'درجة حرارة × 2', 'CO2', 'التنفّس'],
    specsFr: ['ECG + SpO2 + NIBP', 'Température × 2', 'CO2', 'Respiration'],
    specsEn: ['ECG + SpO2 + NIBP', 'Temp × 2', 'CO2', 'Respiration'],
    price: 320000, stock: 5, images: productImages('c4'), rating: 4.8, reviewsCount: 19, featured: true, createdAt: '2025-09-02',
  },
  {
    id: 'p009', categoryId: 'c4', supplierId: 'sup3',
    nameAr: 'مقياس السكّر بشرائح التحليل',
    nameFr: 'Glucomètre avec bandelettes',
    nameEn: 'Glucose Meter with Strips',
    brand: 'Accu-Chek',
    descAr: 'جهاز قياس سكّر الدم مع 50 شريحة تحليل.',
    descFr: 'Glucomètre avec 50 bandelettes.',
    descEn: 'Glucose meter with 50 test strips.',
    specsAr: ['50 شريحة', 'ذاكرة 500 قراءة', 'قلم وخز'],
    specsFr: ['50 bandelettes', 'Mémoire 500 lectures', 'Autopiqueur'],
    specsEn: ['50 strips', '500-reading memory', 'Lancing device'],
    price: 5500, stock: 180, images: productImages('c4'), rating: 4.4, reviewsCount: 102, featured: false, createdAt: '2025-11-15',
  },
  {
    id: 'p010', categoryId: 'c4', supplierId: 'sup2',
    nameAr: 'مقياس الأكسجين في الدم (Pulse Oximeter)',
    nameFr: 'Oxymètre de pouls',
    nameEn: 'Pulse Oximeter',
    brand: 'Contec',
    descAr: 'مقياس إصبعي لقياس تشبّع الأكسجين ومعدّل النبض.',
    descFr: 'Oxymètre au doigt, SpO2 et pouls.',
    descEn: 'Fingertip SpO2 and pulse-rate monitor.',
    specsAr: ['OLED شاشة ملوّنة', '4 اتجاهات عرض', 'بطّاريّة AAA'],
    specsFr: ['OLED couleur', 'Affichage 4 sens', 'Pile AAA'],
    specsEn: ['Color OLED', '4-way display', 'AAA battery'],
    price: 2800, stock: 340, images: productImages('c4'), rating: 4.5, reviewsCount: 156, featured: false, createdAt: '2025-11-25',
  },

  // Lab
  {
    id: 'p011', categoryId: 'c5', supplierId: 'sup1',
    nameAr: 'مجهر مخبري ثلاثي العينيّات',
    nameFr: 'Microscope de laboratoire trinoculaire',
    nameEn: 'Trinocular Laboratory Microscope',
    brand: 'Olympus',
    descAr: 'مجهر احترافي بتكبير 40x إلى 1000x وكاميرا اختياريّة.',
    descFr: 'Microscope pro 40×–1000×, caméra en option.',
    descEn: 'Professional microscope, 40×–1000×, optional camera.',
    specsAr: ['تكبير حتى 1000x', '3 عدسات', 'إضاءة LED'],
    specsFr: ['Jusqu\'à 1000×', '3 objectifs', 'LED'],
    specsEn: ['Up to 1000×', '3 objectives', 'LED'],
    price: 145000, stock: 8, images: productImages('c5'), rating: 4.7, reviewsCount: 18, featured: false, createdAt: '2025-10-12',
  },
  {
    id: 'p012', categoryId: 'c5', supplierId: 'sup2',
    nameAr: 'جهاز طرد مركزي (Centrifuge) سعة 24 أنبوب',
    nameFr: 'Centrifugeuse 24 tubes',
    nameEn: 'Centrifuge, 24-Tube Capacity',
    brand: 'Hettich',
    descAr: 'طرد مركزي رقمي حتى 4000 دورة/دقيقة.',
    descFr: 'Centrifugeuse numérique jusqu\'à 4000 tr/min.',
    descEn: 'Digital centrifuge up to 4000 RPM.',
    specsAr: ['4000 RPM', '24 أنبوب', 'مؤقّت رقمي'],
    specsFr: ['4000 tr/min', '24 tubes', 'Minuteur numérique'],
    specsEn: ['4000 RPM', '24 tubes', 'Digital timer'],
    price: 75000, stock: 6, images: productImages('c5'), rating: 4.6, reviewsCount: 11, featured: false, createdAt: '2025-09-28',
  },

  // Dental
  {
    id: 'p013', categoryId: 'c6', supplierId: 'sup1',
    nameAr: 'كرسي أسنان كهربائي متكامل',
    nameFr: 'Fauteuil dentaire électrique complet',
    nameEn: 'Complete Electric Dental Chair',
    brand: 'Sirona',
    descAr: 'كرسي أسنان مع ضوء LED وشاشة تحكّم لمس.',
    descFr: 'Fauteuil avec lampe LED et écran tactile.',
    descEn: 'Chair with LED lamp and touch control.',
    specsAr: ['5 مواضع', 'ضوء LED قابل للتوجيه', 'شاشة لمس'],
    specsFr: ['5 positions', 'Lampe LED orientable', 'Écran tactile'],
    specsEn: ['5 positions', 'Adjustable LED lamp', 'Touchscreen'],
    price: 1250000, stock: 2, images: productImages('c6'), rating: 4.9, reviewsCount: 8, featured: true, createdAt: '2025-07-20',
  },
  {
    id: 'p014', categoryId: 'c6', supplierId: 'sup3',
    nameAr: 'جهاز تنظيف الأسنان بالموجات فوق الصوتيّة',
    nameFr: 'Détartreur à ultrasons',
    nameEn: 'Ultrasonic Dental Scaler',
    brand: 'Woodpecker',
    descAr: 'جهاز تنظيف أسنان احترافي بترددات عالية.',
    descFr: 'Détartreur professionnel haute fréquence.',
    descEn: 'Professional high-frequency scaler.',
    specsAr: ['5 رؤوس', 'تردد 28 kHz', 'مضادّ للتسرّب'],
    specsFr: ['5 embouts', '28 kHz', 'Anti-fuite'],
    specsEn: ['5 tips', '28 kHz', 'Anti-leak'],
    price: 42000, stock: 14, images: productImages('c6'), rating: 4.5, reviewsCount: 26, featured: false, createdAt: '2025-10-30',
  },

  // Ortho
  {
    id: 'p015', categoryId: 'c7', supplierId: 'sup2',
    nameAr: 'جبيرة رجل قابلة للتعديل',
    nameFr: 'Attelle de jambe réglable',
    nameEn: 'Adjustable Leg Brace',
    brand: 'DJO Global',
    descAr: 'جبيرة بلاستيكيّة قابلة للتعديل بمقاسات متعدّدة.',
    descFr: 'Attelle plastique réglable, tailles multiples.',
    descEn: 'Adjustable plastic brace, multiple sizes.',
    specsAr: ['3 مقاسات', 'بلاستيك طبّي', 'قابل للغسل'],
    specsFr: ['3 tailles', 'Plastique médical', 'Lavable'],
    specsEn: ['3 sizes', 'Medical plastic', 'Washable'],
    price: 7500, stock: 55, images: productImages('c7'), rating: 4.2, reviewsCount: 34, featured: false, createdAt: '2025-11-08',
  },
  {
    id: 'p016', categoryId: 'c7', supplierId: 'sup1',
    nameAr: 'عكازات طبّيّة من الألومنيوم (زوج)',
    nameFr: 'Béquilles médicales en aluminium (paire)',
    nameEn: 'Aluminum Medical Crutches (pair)',
    brand: 'Drive Medical',
    descAr: 'عكازات خفيفة الوزن قابلة للتعديل.',
    descFr: 'Béquilles légères et réglables.',
    descEn: 'Lightweight adjustable crutches.',
    specsAr: ['ألومنيوم', 'قابل للتعديل', 'تحمّل 120 كغ'],
    specsFr: ['Aluminium', 'Réglable', 'Charge 120 kg'],
    specsEn: ['Aluminum', 'Adjustable', '120 kg capacity'],
    price: 4800, stock: 78, images: productImages('c7'), rating: 4.3, reviewsCount: 41, featured: false, createdAt: '2025-10-22',
  },

  // Consumables
  {
    id: 'p017', categoryId: 'c8', supplierId: 'sup3',
    nameAr: 'قفازات فحص لاتكس (علبة 100)',
    nameFr: 'Gants d\'examen latex (boîte de 100)',
    nameEn: 'Latex Examination Gloves (box of 100)',
    brand: 'Ansell',
    descAr: 'قفازات لاتكس مطاطيّة، بودرة خفيفة، مقاس M.',
    descFr: 'Gants latex légèrement poudrés, taille M.',
    descEn: 'Lightly-powdered latex gloves, size M.',
    specsAr: ['لاتكس', '100 قفاز', 'بودرة خفيفة', 'مقاس M'],
    specsFr: ['Latex', '100 gants', 'Légèrement poudré', 'Taille M'],
    specsEn: ['Latex', '100 gloves', 'Light powder', 'Size M'],
    price: 1850, stock: 1200, images: productImages('c8'), rating: 4.1, reviewsCount: 189, featured: false, createdAt: '2025-11-28',
  },
  {
    id: 'p018', categoryId: 'c8', supplierId: 'sup2',
    nameAr: 'كمّامات طبّيّة 3 طبقات (علبة 50)',
    nameFr: 'Masques chirurgicaux 3 plis (boîte de 50)',
    nameEn: '3-Ply Surgical Masks (box of 50)',
    brand: '3M',
    descAr: 'كمّامات طبّيّة بتقنيّة ترشيح BFE >98%.',
    descFr: 'Masques médicaux, filtration BFE > 98%.',
    descEn: 'Medical-grade masks, BFE > 98%.',
    specsAr: ['3 طبقات', '50 قطعة', 'BFE >98%'],
    specsFr: ['3 plis', '50 pièces', 'BFE > 98%'],
    specsEn: ['3-ply', '50 pieces', 'BFE > 98%'],
    price: 950, stock: 2400, images: productImages('c8'), rating: 4.5, reviewsCount: 312, featured: false, createdAt: '2025-12-01',
  },

  // Emergency
  {
    id: 'p019', categoryId: 'c9', supplierId: 'sup1',
    nameAr: 'جهاز صدمات كهربائيّة (AED) آلي',
    nameFr: 'Défibrillateur automatique (DEA)',
    nameEn: 'Automated External Defibrillator (AED)',
    brand: 'Philips HeartStart',
    descAr: 'جهاز AED محمول مع إرشادات صوتيّة.',
    descFr: 'DEA portable avec guidage vocal.',
    descEn: 'Portable AED with voice prompts.',
    specsAr: ['إرشادات صوتيّة', 'بطّاريّة 4 سنوات', 'حقيبة حمل'],
    specsFr: ['Guidage vocal', 'Batterie 4 ans', 'Sac de transport'],
    specsEn: ['Voice prompts', '4-year battery', 'Carry bag'],
    price: 220000, stock: 6, images: productImages('c9'), rating: 4.9, reviewsCount: 17, featured: true, createdAt: '2025-08-14',
  },
  {
    id: 'p020', categoryId: 'c9', supplierId: 'sup2',
    nameAr: 'حقيبة إسعافات أولية كاملة',
    nameFr: 'Trousse de premiers secours complète',
    nameEn: 'Complete First-Aid Kit',
    brand: 'Medline',
    descAr: 'حقيبة إسعافات أولية تحتوي على أكثر من 120 عنصراً.',
    descFr: 'Trousse complète, plus de 120 articles.',
    descEn: 'Complete kit with over 120 items.',
    specsAr: ['+120 عنصر', 'حقيبة مقاومة للماء', 'دليل استخدام'],
    specsFr: ['+120 articles', 'Sac étanche', 'Guide'],
    specsEn: ['+120 items', 'Waterproof bag', 'User guide'],
    price: 6800, stock: 45, images: productImages('c9'), rating: 4.4, reviewsCount: 62, featured: false, createdAt: '2025-11-18',
  },

  // Ophthalmic
  {
    id: 'p021', categoryId: 'c10', supplierId: 'sup1',
    nameAr: 'جهاز قياس ضغط العين (Tonometer)',
    nameFr: 'Tonomètre oculaire',
    nameEn: 'Ocular Tonometer',
    brand: 'Reichert',
    descAr: 'جهاز قياس ضغط العين بدون تلامس.',
    descFr: 'Tonomètre sans contact.',
    descEn: 'Non-contact tonometer.',
    specsAr: ['بدون تلامس', 'قياس تلقائي', 'شاشة ملوّنة'],
    specsFr: ['Sans contact', 'Mesure auto', 'Écran couleur'],
    specsEn: ['Non-contact', 'Auto-measure', 'Color display'],
    price: 180000, stock: 4, images: productImages('c10'), rating: 4.7, reviewsCount: 9, featured: false, createdAt: '2025-09-18',
  },

  // Sterilization
  {
    id: 'p022', categoryId: 'c11', supplierId: 'sup3',
    nameAr: 'فرن تعقيم (Autoclave) 23 لتر',
    nameFr: 'Autoclave 23 litres',
    nameEn: 'Autoclave 23 L',
    brand: 'Tuttnauer',
    descAr: 'فرن تعقيم بالبخار لطبّ الأسنان والعيادات الصغيرة.',
    descFr: 'Autoclave vapeur pour dentisterie et petites cliniques.',
    descEn: 'Steam autoclave for dental and small clinics.',
    specsAr: ['23 لتر', '134°C', '4 برامج', 'طابعة اختياريّة'],
    specsFr: ['23 L', '134 °C', '4 programmes', 'Imprimante en option'],
    specsEn: ['23 L', '134 °C', '4 programs', 'Optional printer'],
    price: 195000, stock: 5, images: productImages('c11'), rating: 4.6, reviewsCount: 13, featured: false, createdAt: '2025-10-02',
  },
  {
    id: 'p023', categoryId: 'c11', supplierId: 'sup2',
    nameAr: 'أكياس تعقيم ذاتيّة اللصق (200 كيس)',
    nameFr: 'Sachets de stérilisation auto-adhésifs (200)',
    nameEn: 'Self-Seal Sterilization Pouches (200)',
    brand: 'Crosstex',
    descAr: 'أكياس تعقيم مع مؤشّرات لونيّة.',
    descFr: 'Sachets avec indicateurs colorés.',
    descEn: 'Pouches with color indicators.',
    specsAr: ['200 كيس', 'لصق ذاتي', 'مؤشّر لوني'],
    specsFr: ['200 sachets', 'Auto-adhésif', 'Indicateur coloré'],
    specsEn: ['200 pouches', 'Self-seal', 'Color indicator'],
    price: 2200, stock: 160, images: productImages('c11'), rating: 4.4, reviewsCount: 48, featured: false, createdAt: '2025-11-10',
  },

  // Pediatric
  {
    id: 'p024', categoryId: 'c12', supplierId: 'sup1',
    nameAr: 'ميزان إلكتروني للأطفال الرضّع',
    nameFr: 'Pèse-bébé électronique',
    nameEn: 'Electronic Baby Scale',
    brand: 'Seca',
    descAr: 'ميزان إلكتروني دقيق مع وعاء ناعم.',
    descFr: 'Pèse-bébé précis avec plateau souple.',
    descEn: 'Precise electronic scale with soft tray.',
    specsAr: ['دقّة 10 غ', 'سعة 20 كغ', 'شاشة LCD'],
    specsFr: ['Précision 10 g', 'Capacité 20 kg', 'LCD'],
    specsEn: ['10 g accuracy', '20 kg capacity', 'LCD'],
    price: 28500, stock: 12, images: productImages('c12'), rating: 4.7, reviewsCount: 21, featured: false, createdAt: '2025-10-14',
  },
];

/* ------------------------------------------------------------------ */
/*  Lookup helpers                                                     */
/* ------------------------------------------------------------------ */

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
export function findSupplier(id: string): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}

export function productName(p: Product, locale: string): string {
  if (locale === 'fr') return p.nameFr;
  if (locale === 'en') return p.nameEn;
  return p.nameAr;
}
export function productDesc(p: Product, locale: string): string {
  if (locale === 'fr') return p.descFr;
  if (locale === 'en') return p.descEn;
  return p.descAr;
}
export function productSpecs(p: Product, locale: string): string[] {
  if (locale === 'fr') return p.specsFr;
  if (locale === 'en') return p.specsEn;
  return p.specsAr;
}
export function categoryName(c: Category, locale: string): string {
  if (locale === 'fr') return c.nameFr;
  if (locale === 'en') return c.nameEn;
  return c.nameAr;
}
