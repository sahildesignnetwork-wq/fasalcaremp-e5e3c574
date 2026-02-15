export type Language = 'hi' | 'en';

export type CropSeason = 'kharif' | 'rabi' | 'horticulture';

export interface Crop {
  id: string;
  nameHi: string;
  nameEn: string;
  icon: string;
  season: CropSeason;
  popDocument?: string; // Path to Package of Practices document
}

export type Severity = 'low' | 'medium' | 'high';

export interface DiseaseResult {
  id: string;
  diseaseNameHi: string;
  diseaseNameEn: string;
  confidence: number;
  severity: Severity;
  imageUrl: string;
}

export interface Advisory {
  causeHi: string;
  causeEn: string;
  preventionHi: string[];
  preventionEn: string[];
  organicTreatmentHi: string[];
  organicTreatmentEn: string[];
  chemicalTreatmentHi?: {
    name: string;
    dosage: string;
    interval: string;
  }[];
  chemicalTreatmentEn?: {
    name: string;
    dosage: string;
    interval: string;
  }[];
}

export interface PackageOfPractice {
  cropId: string;
  sections: {
    titleHi: string;
    titleEn: string;
    contentHi: string;
    contentEn: string;
  }[];
}

export type AppScreen = 
  | 'splash' 
  | 'language' 
  | 'home' 
  | 'cropSelect' 
  | 'camera' 
  | 'analyzing' 
  | 'result' 
  | 'advisory' 
  | 'feedback'
  | 'pop'
  | 'popDetail'
  | 'login'
  | 'news'
  | 'newsDetail'
  | 'adminNews';

export interface AgriNews {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  source: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
