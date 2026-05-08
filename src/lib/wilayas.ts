import type { Wilaya } from './types';

/**
 * The 58 Algerian wilayas — official ordering + trilingual names.
 * Source: Ministère de l'Intérieur (2020 reform, including the 10 new southern wilayas).
 */
export const WILAYAS: Wilaya[] = [
  { code:  1, nameAr: 'أدرار',              nameFr: 'Adrar',               nameEn: 'Adrar' },
  { code:  2, nameAr: 'الشلف',              nameFr: 'Chlef',               nameEn: 'Chlef' },
  { code:  3, nameAr: 'الأغواط',            nameFr: 'Laghouat',            nameEn: 'Laghouat' },
  { code:  4, nameAr: 'أم البواقي',         nameFr: 'Oum El Bouaghi',      nameEn: 'Oum El Bouaghi' },
  { code:  5, nameAr: 'باتنة',              nameFr: 'Batna',               nameEn: 'Batna' },
  { code:  6, nameAr: 'بجاية',              nameFr: 'Béjaïa',              nameEn: 'Béjaïa' },
  { code:  7, nameAr: 'بسكرة',              nameFr: 'Biskra',              nameEn: 'Biskra' },
  { code:  8, nameAr: 'بشار',               nameFr: 'Béchar',              nameEn: 'Béchar' },
  { code:  9, nameAr: 'البليدة',            nameFr: 'Blida',               nameEn: 'Blida' },
  { code: 10, nameAr: 'البويرة',            nameFr: 'Bouira',              nameEn: 'Bouira' },
  { code: 11, nameAr: 'تمنراست',            nameFr: 'Tamanrasset',         nameEn: 'Tamanrasset' },
  { code: 12, nameAr: 'تبسة',               nameFr: 'Tébessa',             nameEn: 'Tébessa' },
  { code: 13, nameAr: 'تلمسان',             nameFr: 'Tlemcen',             nameEn: 'Tlemcen' },
  { code: 14, nameAr: 'تيارت',              nameFr: 'Tiaret',              nameEn: 'Tiaret' },
  { code: 15, nameAr: 'تيزي وزو',           nameFr: 'Tizi Ouzou',          nameEn: 'Tizi Ouzou' },
  { code: 16, nameAr: 'الجزائر',            nameFr: 'Alger',               nameEn: 'Algiers' },
  { code: 17, nameAr: 'الجلفة',             nameFr: 'Djelfa',              nameEn: 'Djelfa' },
  { code: 18, nameAr: 'جيجل',               nameFr: 'Jijel',               nameEn: 'Jijel' },
  { code: 19, nameAr: 'سطيف',               nameFr: 'Sétif',               nameEn: 'Sétif' },
  { code: 20, nameAr: 'سعيدة',              nameFr: 'Saïda',               nameEn: 'Saïda' },
  { code: 21, nameAr: 'سكيكدة',             nameFr: 'Skikda',              nameEn: 'Skikda' },
  { code: 22, nameAr: 'سيدي بلعباس',        nameFr: 'Sidi Bel Abbès',      nameEn: 'Sidi Bel Abbès' },
  { code: 23, nameAr: 'عنابة',              nameFr: 'Annaba',              nameEn: 'Annaba' },
  { code: 24, nameAr: 'قالمة',              nameFr: 'Guelma',              nameEn: 'Guelma' },
  { code: 25, nameAr: 'قسنطينة',            nameFr: 'Constantine',         nameEn: 'Constantine' },
  { code: 26, nameAr: 'المدية',             nameFr: 'Médéa',               nameEn: 'Médéa' },
  { code: 27, nameAr: 'مستغانم',            nameFr: 'Mostaganem',          nameEn: 'Mostaganem' },
  { code: 28, nameAr: 'المسيلة',            nameFr: 'M\'Sila',             nameEn: 'M\'Sila' },
  { code: 29, nameAr: 'معسكر',              nameFr: 'Mascara',             nameEn: 'Mascara' },
  { code: 30, nameAr: 'ورقلة',              nameFr: 'Ouargla',             nameEn: 'Ouargla' },
  { code: 31, nameAr: 'وهران',              nameFr: 'Oran',                nameEn: 'Oran' },
  { code: 32, nameAr: 'البيّض',             nameFr: 'El Bayadh',           nameEn: 'El Bayadh' },
  { code: 33, nameAr: 'إليزي',              nameFr: 'Illizi',              nameEn: 'Illizi' },
  { code: 34, nameAr: 'برج بوعريريج',       nameFr: 'Bordj Bou Arréridj',  nameEn: 'Bordj Bou Arréridj' },
  { code: 35, nameAr: 'بومرداس',            nameFr: 'Boumerdès',           nameEn: 'Boumerdès' },
  { code: 36, nameAr: 'الطارف',             nameFr: 'El Tarf',             nameEn: 'El Tarf' },
  { code: 37, nameAr: 'تندوف',              nameFr: 'Tindouf',             nameEn: 'Tindouf' },
  { code: 38, nameAr: 'تيسمسيلت',           nameFr: 'Tissemsilt',          nameEn: 'Tissemsilt' },
  { code: 39, nameAr: 'الوادي',             nameFr: 'El Oued',             nameEn: 'El Oued' },
  { code: 40, nameAr: 'خنشلة',              nameFr: 'Khenchela',           nameEn: 'Khenchela' },
  { code: 41, nameAr: 'سوق أهراس',          nameFr: 'Souk Ahras',          nameEn: 'Souk Ahras' },
  { code: 42, nameAr: 'تيبازة',             nameFr: 'Tipaza',              nameEn: 'Tipaza' },
  { code: 43, nameAr: 'ميلة',               nameFr: 'Mila',                nameEn: 'Mila' },
  { code: 44, nameAr: 'عين الدفلى',         nameFr: 'Aïn Defla',           nameEn: 'Aïn Defla' },
  { code: 45, nameAr: 'النعامة',            nameFr: 'Naâma',               nameEn: 'Naâma' },
  { code: 46, nameAr: 'عين تموشنت',         nameFr: 'Aïn Témouchent',      nameEn: 'Aïn Témouchent' },
  { code: 47, nameAr: 'غرداية',             nameFr: 'Ghardaïa',            nameEn: 'Ghardaïa' },
  { code: 48, nameAr: 'غليزان',             nameFr: 'Relizane',            nameEn: 'Relizane' },
  { code: 49, nameAr: 'تيميمون',            nameFr: 'Timimoun',            nameEn: 'Timimoun' },
  { code: 50, nameAr: 'برج باجي مختار',     nameFr: 'Bordj Badji Mokhtar', nameEn: 'Bordj Badji Mokhtar' },
  { code: 51, nameAr: 'أولاد جلال',         nameFr: 'Ouled Djellal',       nameEn: 'Ouled Djellal' },
  { code: 52, nameAr: 'بني عباس',           nameFr: 'Béni Abbès',          nameEn: 'Béni Abbès' },
  { code: 53, nameAr: 'عين صالح',           nameFr: 'In Salah',            nameEn: 'In Salah' },
  { code: 54, nameAr: 'عين قزام',           nameFr: 'In Guezzam',          nameEn: 'In Guezzam' },
  { code: 55, nameAr: 'تقرت',               nameFr: 'Touggourt',           nameEn: 'Touggourt' },
  { code: 56, nameAr: 'جانت',               nameFr: 'Djanet',              nameEn: 'Djanet' },
  { code: 57, nameAr: 'المغير',             nameFr: 'El M\'Ghair',         nameEn: 'El M\'Ghair' },
  { code: 58, nameAr: 'المنيعة',            nameFr: 'El Meniaa',           nameEn: 'El Meniaa' },
];

export function wilayaName(w: Wilaya, locale: string): string {
  if (locale === 'fr') return w.nameFr;
  if (locale === 'en') return w.nameEn;
  return w.nameAr;
}
