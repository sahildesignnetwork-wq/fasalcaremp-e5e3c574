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
  | 'popDetail';
