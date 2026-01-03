import { Crop } from '@/types';

export const crops: Crop[] = [
  // Kharif Crops
  { id: 'soybean', nameHi: 'सोयाबीन', nameEn: 'Soybean', icon: '🫘', season: 'kharif' },
  { id: 'rice', nameHi: 'धान', nameEn: 'Rice (Paddy)', icon: '🌾', season: 'kharif', popDocument: '/pop/paddy.docx' },
  { id: 'maize', nameHi: 'मक्का', nameEn: 'Maize', icon: '🌽', season: 'kharif', popDocument: '/pop/maize.docx' },
  { id: 'cotton', nameHi: 'कपास', nameEn: 'Cotton', icon: '🧶', season: 'kharif', popDocument: '/pop/cotton.docx' },
  { id: 'pigeon_pea', nameHi: 'अरहर', nameEn: 'Pigeon Pea (Arhar)', icon: '🫛', season: 'kharif', popDocument: '/pop/pigeonpea.docx' },
  { id: 'black_gram', nameHi: 'उड़द', nameEn: 'Black Gram (Urad)', icon: '⚫', season: 'kharif', popDocument: '/pop/blackgram.docx' },
  { id: 'green_gram', nameHi: 'मूंग', nameEn: 'Green Gram (Moong)', icon: '🟢', season: 'kharif', popDocument: '/pop/moong.docx' },
  { id: 'groundnut', nameHi: 'मूंगफली', nameEn: 'Groundnut', icon: '🥜', season: 'kharif', popDocument: '/pop/groundnut.docx' },
  { id: 'sesame', nameHi: 'तिल', nameEn: 'Sesame (Til)', icon: '🌰', season: 'kharif', popDocument: '/pop/sesame.docx' },
  { id: 'sorghum', nameHi: 'ज्वार', nameEn: 'Sorghum (Jowar)', icon: '🌿', season: 'kharif', popDocument: '/pop/sorghum.docx' },

  // Rabi Crops
  { id: 'wheat', nameHi: 'गेहूं', nameEn: 'Wheat', icon: '🌾', season: 'rabi', popDocument: '/pop/wheat.docx' },
  { id: 'gram', nameHi: 'चना', nameEn: 'Gram (Chickpea)', icon: '🟤', season: 'rabi', popDocument: '/pop/gram.docx' },
  { id: 'mustard', nameHi: 'सरसों', nameEn: 'Mustard', icon: '🌼', season: 'rabi', popDocument: '/pop/mustard.docx' },
  { id: 'lentil', nameHi: 'मसूर', nameEn: 'Lentil', icon: '🟠', season: 'rabi', popDocument: '/pop/lentil.docx' },
  { id: 'pea', nameHi: 'मटर', nameEn: 'Pea', icon: '🟩', season: 'rabi', popDocument: '/pop/pea.docx' },
  { id: 'barley', nameHi: 'जौ', nameEn: 'Barley', icon: '🌾', season: 'rabi', popDocument: '/pop/barley.docx' },
  { id: 'linseed', nameHi: 'अलसी', nameEn: 'Linseed (Alsi)', icon: '🌱', season: 'rabi', popDocument: '/pop/linseed.docx' },
  { id: 'oat', nameHi: 'जई', nameEn: 'Oat', icon: '🥣', season: 'rabi', popDocument: '/pop/oat.docx' },

  // Horticulture Crops
  { id: 'tomato', nameHi: 'टमाटर', nameEn: 'Tomato', icon: '🍅', season: 'horticulture', popDocument: '/pop/tomato.docx' },
  { id: 'onion', nameHi: 'प्याज', nameEn: 'Onion', icon: '🧅', season: 'horticulture', popDocument: '/pop/onion.docx' },
  { id: 'potato', nameHi: 'आलू', nameEn: 'Potato', icon: '🥔', season: 'horticulture', popDocument: '/pop/potato.docx' },
  { id: 'chili', nameHi: 'मिर्च', nameEn: 'Chili', icon: '🌶️', season: 'horticulture', popDocument: '/pop/chilli.docx' },
  { id: 'brinjal', nameHi: 'बैंगन', nameEn: 'Brinjal', icon: '🍆', season: 'horticulture', popDocument: '/pop/brinjal.docx' },
  { id: 'okra', nameHi: 'भिंडी', nameEn: 'Okra', icon: '🥒', season: 'horticulture', popDocument: '/pop/okra.docx' },
  { id: 'citrus', nameHi: 'नींबू वर्ग', nameEn: 'Citrus', icon: '🍊', season: 'horticulture', popDocument: '/pop/citrus.docx' },
  { id: 'guava', nameHi: 'अमरूद', nameEn: 'Guava', icon: '🍐', season: 'horticulture', popDocument: '/pop/guava.docx' },
  { id: 'papaya', nameHi: 'पपीता', nameEn: 'Papaya', icon: '🥭', season: 'horticulture', popDocument: '/pop/papaya.docx' },
  { id: 'banana', nameHi: 'केला', nameEn: 'Banana', icon: '🍌', season: 'horticulture' },
];

export const seasonLabels = {
  kharif: { hi: 'खरीफ फसलें', en: 'Kharif Crops', icon: '🌧️' },
  rabi: { hi: 'रबी फसलें', en: 'Rabi Crops', icon: '❄️' },
  horticulture: { hi: 'बागवानी फसलें', en: 'Horticulture Crops', icon: '🌿' },
};

export const getCropsBySeason = (season: 'kharif' | 'rabi' | 'horticulture') => {
  return crops.filter(crop => crop.season === season);
};
