// Madhya Pradesh districts with approximate centroids (lat, lon)
export interface MPDistrict {
  id: string;
  nameHi: string;
  nameEn: string;
  lat: number;
  lon: number;
}

export const MP_DISTRICTS: MPDistrict[] = [
  { id: 'bhopal', nameHi: 'भोपाल', nameEn: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { id: 'indore', nameHi: 'इंदौर', nameEn: 'Indore', lat: 22.7196, lon: 75.8577 },
  { id: 'jabalpur', nameHi: 'जबलपुर', nameEn: 'Jabalpur', lat: 23.1815, lon: 79.9864 },
  { id: 'gwalior', nameHi: 'ग्वालियर', nameEn: 'Gwalior', lat: 26.2183, lon: 78.1828 },
  { id: 'ujjain', nameHi: 'उज्जैन', nameEn: 'Ujjain', lat: 23.1765, lon: 75.7885 },
  { id: 'sagar', nameHi: 'सागर', nameEn: 'Sagar', lat: 23.8388, lon: 78.7378 },
  { id: 'dewas', nameHi: 'देवास', nameEn: 'Dewas', lat: 22.9676, lon: 76.0534 },
  { id: 'satna', nameHi: 'सतना', nameEn: 'Satna', lat: 24.5667, lon: 80.8167 },
  { id: 'ratlam', nameHi: 'रतलाम', nameEn: 'Ratlam', lat: 23.3315, lon: 75.0367 },
  { id: 'rewa', nameHi: 'रीवा', nameEn: 'Rewa', lat: 24.5373, lon: 81.3042 },
  { id: 'morena', nameHi: 'मुरैना', nameEn: 'Morena', lat: 26.4974, lon: 78.0007 },
  { id: 'singrauli', nameHi: 'सिंगरौली', nameEn: 'Singrauli', lat: 24.1997, lon: 82.6753 },
  { id: 'burhanpur', nameHi: 'बुरहानपुर', nameEn: 'Burhanpur', lat: 21.3009, lon: 76.2294 },
  { id: 'khandwa', nameHi: 'खंडवा', nameEn: 'Khandwa', lat: 21.8257, lon: 76.3522 },
  { id: 'bhind', nameHi: 'भिंड', nameEn: 'Bhind', lat: 26.5648, lon: 78.7875 },
  { id: 'chhindwara', nameHi: 'छिंदवाड़ा', nameEn: 'Chhindwara', lat: 22.0574, lon: 78.9382 },
  { id: 'guna', nameHi: 'गुना', nameEn: 'Guna', lat: 24.6469, lon: 77.3110 },
  { id: 'shivpuri', nameHi: 'शिवपुरी', nameEn: 'Shivpuri', lat: 25.4358, lon: 77.6586 },
  { id: 'vidisha', nameHi: 'विदिशा', nameEn: 'Vidisha', lat: 23.5251, lon: 77.8081 },
  { id: 'chhatarpur', nameHi: 'छतरपुर', nameEn: 'Chhatarpur', lat: 24.9180, lon: 79.5941 },
  { id: 'damoh', nameHi: 'दमोह', nameEn: 'Damoh', lat: 23.8327, lon: 79.4419 },
  { id: 'mandsaur', nameHi: 'मंदसौर', nameEn: 'Mandsaur', lat: 24.0728, lon: 75.0682 },
  { id: 'khargone', nameHi: 'खरगोन', nameEn: 'Khargone', lat: 21.8236, lon: 75.6107 },
  { id: 'neemuch', nameHi: 'नीमच', nameEn: 'Neemuch', lat: 24.4716, lon: 74.8742 },
  { id: 'hoshangabad', nameHi: 'नर्मदापुरम', nameEn: 'Narmadapuram', lat: 22.7475, lon: 77.7244 },
  { id: 'betul', nameHi: 'बैतूल', nameEn: 'Betul', lat: 21.9010, lon: 77.9000 },
  { id: 'sehore', nameHi: 'सीहोर', nameEn: 'Sehore', lat: 23.2000, lon: 77.0851 },
  { id: 'raisen', nameHi: 'रायसेन', nameEn: 'Raisen', lat: 23.3306, lon: 77.7811 },
  { id: 'rajgarh', nameHi: 'राजगढ़', nameEn: 'Rajgarh', lat: 24.0094, lon: 76.7253 },
  { id: 'shajapur', nameHi: 'शाजापुर', nameEn: 'Shajapur', lat: 23.4271, lon: 76.2746 },
  { id: 'jhabua', nameHi: 'झाबुआ', nameEn: 'Jhabua', lat: 22.7677, lon: 74.5925 },
  { id: 'dhar', nameHi: 'धार', nameEn: 'Dhar', lat: 22.6013, lon: 75.2978 },
  { id: 'barwani', nameHi: 'बड़वानी', nameEn: 'Barwani', lat: 22.0307, lon: 74.9046 },
  { id: 'tikamgarh', nameHi: 'टीकमगढ़', nameEn: 'Tikamgarh', lat: 24.7456, lon: 78.8324 },
  { id: 'panna', nameHi: 'पन्ना', nameEn: 'Panna', lat: 24.7234, lon: 80.1818 },
  { id: 'katni', nameHi: 'कटनी', nameEn: 'Katni', lat: 23.8343, lon: 80.3894 },
  { id: 'mandla', nameHi: 'मंडला', nameEn: 'Mandla', lat: 22.5984, lon: 80.3711 },
  { id: 'seoni', nameHi: 'सिवनी', nameEn: 'Seoni', lat: 22.0869, lon: 79.5430 },
  { id: 'balaghat', nameHi: 'बालाघाट', nameEn: 'Balaghat', lat: 21.8137, lon: 80.1855 },
  { id: 'dindori', nameHi: 'डिंडोरी', nameEn: 'Dindori', lat: 22.9447, lon: 81.0775 },
  { id: 'umaria', nameHi: 'उमरिया', nameEn: 'Umaria', lat: 23.5252, lon: 80.8364 },
  { id: 'shahdol', nameHi: 'शहडोल', nameEn: 'Shahdol', lat: 23.2925, lon: 81.3604 },
  { id: 'anuppur', nameHi: 'अनूपपुर', nameEn: 'Anuppur', lat: 23.1037, lon: 81.6911 },
  { id: 'sidhi', nameHi: 'सीधी', nameEn: 'Sidhi', lat: 24.4090, lon: 81.8800 },
  { id: 'datia', nameHi: 'दतिया', nameEn: 'Datia', lat: 25.6660, lon: 78.4604 },
  { id: 'sheopur', nameHi: 'श्योपुर', nameEn: 'Sheopur', lat: 25.6711, lon: 76.6960 },
  { id: 'ashoknagar', nameHi: 'अशोकनगर', nameEn: 'Ashoknagar', lat: 24.5743, lon: 77.7311 },
  { id: 'agar-malwa', nameHi: 'आगर मालवा', nameEn: 'Agar Malwa', lat: 23.7115, lon: 76.0152 },
  { id: 'alirajpur', nameHi: 'अलीराजपुर', nameEn: 'Alirajpur', lat: 22.3137, lon: 74.3641 },
  { id: 'niwari', nameHi: 'निवाड़ी', nameEn: 'Niwari', lat: 25.3611, lon: 78.8909 },
];

export function nearestDistrict(lat: number, lon: number): MPDistrict {
  let best = MP_DISTRICTS[0];
  let bestDist = Infinity;
  for (const d of MP_DISTRICTS) {
    const dl = d.lat - lat;
    const dn = d.lon - lon;
    const dist = dl * dl + dn * dn;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}
