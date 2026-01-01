import { Crop } from '@/types';

export const crops: Crop[] = [
  // Kharif Crops
  { id: 'soybean', nameHi: 'सोयाबीन', nameEn: 'Soybean', icon: '🫘', season: 'kharif' },
  { id: 'rice', nameHi: 'धान', nameEn: 'Rice (Paddy)', icon: '🌾', season: 'kharif' },
  { id: 'maize', nameHi: 'मक्का', nameEn: 'Maize', icon: '🌽', season: 'kharif' },
  { id: 'cotton', nameHi: 'कपास', nameEn: 'Cotton', icon: '🧶', season: 'kharif' },
  { id: 'pigeon_pea', nameHi: 'अरहर', nameEn: 'Pigeon Pea (Arhar)', icon: '🫛', season: 'kharif' },
  { id: 'black_gram', nameHi: 'उड़द', nameEn: 'Black Gram (Urad)', icon: '⚫', season: 'kharif' },
  { id: 'green_gram', nameHi: 'मूंग', nameEn: 'Green Gram (Moong)', icon: '🟢', season: 'kharif' },
  { id: 'groundnut', nameHi: 'मूंगफली', nameEn: 'Groundnut', icon: '🥜', season: 'kharif' },
  { id: 'sesame', nameHi: 'तिल', nameEn: 'Sesame (Til)', icon: '🌰', season: 'kharif' },
  { id: 'sorghum', nameHi: 'ज्वार', nameEn: 'Sorghum (Jowar)', icon: '🌿', season: 'kharif' },

  // Rabi Crops
  { id: 'wheat', nameHi: 'गेहूं', nameEn: 'Wheat', icon: '🌾', season: 'rabi' },
  { id: 'gram', nameHi: 'चना', nameEn: 'Gram (Chickpea)', icon: '🟤', season: 'rabi' },
  { id: 'mustard', nameHi: 'सरसों', nameEn: 'Mustard', icon: '🌼', season: 'rabi' },
  { id: 'lentil', nameHi: 'मसूर', nameEn: 'Lentil', icon: '🟠', season: 'rabi' },
  { id: 'pea', nameHi: 'मटर', nameEn: 'Pea', icon: '🟩', season: 'rabi' },
  { id: 'barley', nameHi: 'जौ', nameEn: 'Barley', icon: '🌾', season: 'rabi' },
  { id: 'linseed', nameHi: 'अलसी', nameEn: 'Linseed (Alsi)', icon: '🌱', season: 'rabi' },
  { id: 'oat', nameHi: 'जई', nameEn: 'Oat', icon: '🥣', season: 'rabi' },
  { id: 'garlic', nameHi: 'लहसुन', nameEn: 'Garlic', icon: '🧄', season: 'rabi' },
  { id: 'onion_rabi', nameHi: 'प्याज', nameEn: 'Onion', icon: '🧅', season: 'rabi' },

  // Horticulture Crops
  { id: 'tomato', nameHi: 'टमाटर', nameEn: 'Tomato', icon: '🍅', season: 'horticulture' },
  { id: 'onion', nameHi: 'प्याज', nameEn: 'Onion', icon: '🧅', season: 'horticulture' },
  { id: 'potato', nameHi: 'आलू', nameEn: 'Potato', icon: '🥔', season: 'horticulture' },
  { id: 'chili', nameHi: 'मिर्च', nameEn: 'Chili', icon: '🌶️', season: 'horticulture' },
  { id: 'brinjal', nameHi: 'बैंगन', nameEn: 'Brinjal', icon: '🍆', season: 'horticulture' },
  { id: 'okra', nameHi: 'भिंडी', nameEn: 'Okra', icon: '🥒', season: 'horticulture' },
  { id: 'citrus', nameHi: 'नींबू वर्ग', nameEn: 'Citrus', icon: '🍊', season: 'horticulture' },
  { id: 'guava', nameHi: 'अमरूद', nameEn: 'Guava', icon: '🍐', season: 'horticulture' },
  { id: 'papaya', nameHi: 'पपीता', nameEn: 'Papaya', icon: '🥭', season: 'horticulture' },
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
