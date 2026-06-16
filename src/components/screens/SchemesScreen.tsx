import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Landmark, Phone, ExternalLink, Mail, Search, Building2, User } from 'lucide-react';

interface Scheme {
  nameHi: string;
  nameEn: string;
  authority: string;
  benefitHi: string;
  benefitEn: string;
  eligibilityHi: string;
  eligibilityEn: string;
  applyUrl?: string;
  helpline?: string;
  category: 'central' | 'state' | 'insurance' | 'credit' | 'irrigation' | 'mechanization';
}

const SCHEMES: Scheme[] = [
  {
    nameHi: 'पीएम किसान सम्मान निधि (PM-KISAN)',
    nameEn: 'PM Kisan Samman Nidhi',
    authority: 'Govt. of India',
    benefitHi: '₹6,000 प्रति वर्ष (3 किश्तों में सीधे खाते में)',
    benefitEn: '₹6,000/year in 3 installments directly to bank account',
    eligibilityHi: 'सभी भूमिधारी किसान परिवार',
    eligibilityEn: 'All landholding farmer families',
    applyUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 1800-115-526',
    category: 'central',
  },
  {
    nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    nameEn: 'Pradhan Mantri Fasal Bima Yojana',
    authority: 'Govt. of India',
    benefitHi: 'फसल नुकसान पर बीमा कवर; प्रीमियम खरीफ 2%, रबी 1.5%, बागवानी 5%',
    benefitEn: 'Crop loss insurance; premium 2% kharif, 1.5% rabi, 5% horticulture',
    eligibilityHi: 'सभी किसान (ऋणी व गैर-ऋणी)',
    eligibilityEn: 'All farmers (loanee & non-loanee)',
    applyUrl: 'https://pmfby.gov.in',
    helpline: '14447',
    category: 'insurance',
  },
  {
    nameHi: 'किसान क्रेडिट कार्ड (KCC)',
    nameEn: 'Kisan Credit Card',
    authority: 'NABARD / Banks',
    benefitHi: '4% ब्याज पर ₹3 लाख तक का अल्पकालीन ऋण',
    benefitEn: 'Short-term loan up to ₹3 lakh at 4% interest',
    eligibilityHi: 'सभी किसान, बटाईदार, पशुपालक, मत्स्य पालक',
    eligibilityEn: 'All farmers, tenants, animal & fish rearers',
    applyUrl: 'https://www.pmkisan.gov.in/Documents/Kcc.pdf',
    helpline: '1800-180-1551',
    category: 'credit',
  },
  {
    nameHi: 'मुख्यमंत्री किसान कल्याण योजना (MP)',
    nameEn: 'CM Kisan Kalyan Yojana (MP)',
    authority: 'Govt. of Madhya Pradesh',
    benefitHi: '₹6,000 प्रति वर्ष (PM-KISAN के अतिरिक्त) = कुल ₹12,000/वर्ष',
    benefitEn: '₹6,000/year in addition to PM-KISAN = total ₹12,000/year',
    eligibilityHi: 'मध्य प्रदेश के PM-KISAN पंजीकृत किसान',
    eligibilityEn: 'MP farmers registered under PM-KISAN',
    applyUrl: 'https://saara.mp.gov.in',
    helpline: '0755-2558823',
    category: 'state',
  },
  {
    nameHi: 'मुख्यमंत्री कृषक उद्यमी योजना',
    nameEn: 'CM Krishak Udyami Yojana',
    authority: 'Govt. of Madhya Pradesh',
    benefitHi: 'कृषि उद्यम हेतु ऋण व अनुदान सहायता',
    benefitEn: 'Loan & subsidy for agri-enterprise setup',
    eligibilityHi: 'किसान परिवार के 18-40 वर्ष के युवा',
    eligibilityEn: 'Youth (18-40 yrs) from farmer families',
    applyUrl: 'https://samast.mponline.gov.in',
    helpline: '0755-2700800',
    category: 'state',
  },
  {
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना (PMKSY)',
    nameEn: 'PM Krishi Sinchayee Yojana',
    authority: 'Govt. of India',
    benefitHi: 'ड्रिप/स्प्रिंकलर पर 55% (सामान्य) व 45% (अन्य) अनुदान',
    benefitEn: '55% subsidy (SF/MF) & 45% (others) on drip/sprinkler',
    eligibilityHi: 'सभी किसान',
    eligibilityEn: 'All farmers',
    applyUrl: 'https://pmksy.gov.in',
    helpline: '011-23381092',
    category: 'irrigation',
  },
  {
    nameHi: 'कृषि यंत्र अनुदान योजना (MP)',
    nameEn: 'Farm Mechanization Subsidy (MP)',
    authority: 'MP Agriculture Engineering',
    benefitHi: 'ट्रैक्टर, रोटावेटर, हार्वेस्टर आदि पर 40-50% अनुदान',
    benefitEn: '40-50% subsidy on tractor, rotavator, harvester etc.',
    eligibilityHi: 'मध्य प्रदेश के पंजीकृत किसान',
    eligibilityEn: 'Registered MP farmers',
    applyUrl: 'https://farmer.mpdage.org',
    helpline: '0755-2550495',
    category: 'mechanization',
  },
  {
    nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    nameEn: 'Soil Health Card Scheme',
    authority: 'Govt. of India',
    benefitHi: 'निःशुल्क मृदा परीक्षण व पोषक तत्व अनुशंसा',
    benefitEn: 'Free soil testing & nutrient recommendation',
    eligibilityHi: 'सभी किसान',
    eligibilityEn: 'All farmers',
    applyUrl: 'https://soilhealth.dac.gov.in',
    helpline: '011-23382651',
    category: 'central',
  },
  {
    nameHi: 'परंपरागत कृषि विकास योजना (PKVY)',
    nameEn: 'Paramparagat Krishi Vikas Yojana',
    authority: 'Govt. of India',
    benefitHi: '3 वर्ष में ₹50,000 प्रति हेक्टेयर जैविक खेती हेतु',
    benefitEn: '₹50,000/ha over 3 years for organic farming',
    eligibilityHi: '50 किसानों का समूह (क्लस्टर)',
    eligibilityEn: 'Cluster of 50 farmers',
    applyUrl: 'https://pgsindia-ncof.gov.in',
    helpline: '011-23070495',
    category: 'central',
  },
  {
    nameHi: 'ई-नाम (eNAM)',
    nameEn: 'e-National Agriculture Market',
    authority: 'Govt. of India',
    benefitHi: 'ऑनलाइन मंडी प्लेटफॉर्म; पारदर्शी भाव व व्यापार',
    benefitEn: 'Online mandi platform; transparent prices & trade',
    eligibilityHi: 'सभी किसान, व्यापारी, FPO',
    eligibilityEn: 'All farmers, traders, FPOs',
    applyUrl: 'https://enam.gov.in',
    helpline: '1800-270-0224',
    category: 'central',
  },
  {
    nameHi: 'भावांतर भुगतान योजना (MP)',
    nameEn: 'Bhavantar Bhugtan Yojana (MP)',
    authority: 'Govt. of Madhya Pradesh',
    benefitHi: 'MSP व मंडी भाव के अंतर का भुगतान सीधे किसान को',
    benefitEn: 'Pays farmers the gap between MSP and market price',
    eligibilityHi: 'अधिसूचित फसल के MP किसान',
    eligibilityEn: 'MP farmers of notified crops',
    applyUrl: 'https://mpeuparjan.nic.in',
    helpline: '0755-2550495',
    category: 'state',
  },
  {
    nameHi: 'पीएम कुसुम (सोलर पंप)',
    nameEn: 'PM-KUSUM (Solar Pump)',
    authority: 'MNRE, Govt. of India',
    benefitHi: 'सोलर पंप पर 60% तक अनुदान; ग्रिड को बिजली बेचने का विकल्प',
    benefitEn: 'Up to 60% subsidy on solar pumps; sell power to grid',
    eligibilityHi: 'किसान, FPO, सहकारी समितियाँ',
    eligibilityEn: 'Farmers, FPOs, cooperatives',
    applyUrl: 'https://pmkusum.mnre.gov.in',
    helpline: '011-24365666',
    category: 'irrigation',
  },
];

interface Contact {
  nameHi: string;
  nameEn: string;
  designationHi: string;
  designationEn: string;
  phone?: string;
  email?: string;
  type: 'central' | 'state' | 'kvk' | 'helpline';
}

const CONTACTS: Contact[] = [
  {
    nameHi: 'किसान कॉल सेंटर (Kisan Call Centre)',
    nameEn: 'Kisan Call Centre',
    designationHi: 'राष्ट्रीय कृषि हेल्पलाइन (सुबह 6 - रात 10)',
    designationEn: 'National Agri Helpline (6 AM – 10 PM)',
    phone: '1800-180-1551',
    type: 'helpline',
  },
  {
    nameHi: 'PM-KISAN हेल्पलाइन',
    nameEn: 'PM-KISAN Helpline',
    designationHi: 'भुगतान/पंजीकरण संबंधित',
    designationEn: 'Payment / Registration related',
    phone: '155261',
    email: 'pmkisan-ict@gov.in',
    type: 'helpline',
  },
  {
    nameHi: 'फसल बीमा हेल्पलाइन (PMFBY)',
    nameEn: 'Crop Insurance Helpline (PMFBY)',
    designationHi: 'दावा/शिकायत',
    designationEn: 'Claims / Grievance',
    phone: '14447',
    type: 'helpline',
  },
  {
    nameHi: 'कृषि संचालनालय, मध्य प्रदेश',
    nameEn: 'Directorate of Agriculture, MP',
    designationHi: 'राज्य कृषि कार्यालय, भोपाल',
    designationEn: 'State Agriculture Office, Bhopal',
    phone: '0755-2558823',
    email: 'dir.agriculture.mp@mp.gov.in',
    type: 'state',
  },
  {
    nameHi: 'किसान कल्याण एवं कृषि विकास विभाग (MP)',
    nameEn: 'Dept. of Farmer Welfare & Agri Development (MP)',
    designationHi: 'विंध्याचल भवन, भोपाल',
    designationEn: 'Vindhyachal Bhavan, Bhopal',
    phone: '0755-2441574',
    email: 'mpkrishi@mp.gov.in',
    type: 'state',
  },
  {
    nameHi: 'मंडी बोर्ड हेल्पलाइन (MP)',
    nameEn: 'Mandi Board Helpline (MP)',
    designationHi: 'मंडी भाव/शिकायत',
    designationEn: 'Mandi prices / Grievance',
    phone: '0755-2550495',
    type: 'state',
  },
  {
    nameHi: 'कृषि विज्ञान केंद्र (KVK) – भोपाल',
    nameEn: 'Krishi Vigyan Kendra (KVK) – Bhopal',
    designationHi: 'जिला स्तरीय कृषि सलाह केंद्र',
    designationEn: 'District-level Agri Advisory Centre',
    phone: '0755-2526068',
    type: 'kvk',
  },
  {
    nameHi: 'जवाहरलाल नेहरू कृषि विश्वविद्यालय, जबलपुर',
    nameEn: 'JNKVV, Jabalpur',
    designationHi: 'राज्य कृषि विश्वविद्यालय',
    designationEn: 'State Agricultural University',
    phone: '0761-2681706',
    email: 'vc@jnkvv.org',
    type: 'state',
  },
  {
    nameHi: 'राजमाता विजयाराजे सिंधिया कृषि विवि, ग्वालियर',
    nameEn: 'RVSKVV, Gwalior',
    designationHi: 'राज्य कृषि विश्वविद्यालय',
    designationEn: 'State Agricultural University',
    phone: '0751-2970120',
    type: 'state',
  },
  {
    nameHi: 'ICAR मुख्यालय, नई दिल्ली',
    nameEn: 'ICAR HQ, New Delhi',
    designationHi: 'भारतीय कृषि अनुसंधान परिषद',
    designationEn: 'Indian Council of Agricultural Research',
    phone: '011-25843301',
    email: 'ddg.exten@icar.gov.in',
    type: 'central',
  },
  {
    nameHi: 'NABARD हेल्पलाइन',
    nameEn: 'NABARD Helpline',
    designationHi: 'कृषि ऋण व ग्रामीण विकास',
    designationEn: 'Agri credit & rural development',
    phone: '1800-200-1199',
    type: 'central',
  },
  {
    nameHi: 'IFFCO किसान सेवा',
    nameEn: 'IFFCO Kisan Service',
    designationHi: 'उर्वरक व कृषि सलाह',
    designationEn: 'Fertilizer & agri advisory',
    phone: '1800-103-1967',
    type: 'helpline',
  },
];

const CATEGORY_LABEL: Record<string, { hi: string; en: string }> = {
  all: { hi: 'सभी', en: 'All' },
  central: { hi: 'केंद्र', en: 'Central' },
  state: { hi: 'राज्य (MP)', en: 'State (MP)' },
  insurance: { hi: 'बीमा', en: 'Insurance' },
  credit: { hi: 'ऋण', en: 'Credit' },
  irrigation: { hi: 'सिंचाई', en: 'Irrigation' },
  mechanization: { hi: 'यंत्र', en: 'Machinery' },
};

const SchemesScreen: React.FC = () => {
  const { t, language, setCurrentScreen } = useApp();
  const [tab, setTab] = useState<'schemes' | 'contacts'>('schemes');
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filteredSchemes = SCHEMES.filter(s => {
    const matchCat = category === 'all' || s.category === category;
    const q = query.trim().toLowerCase();
    const matchQ = !q || s.nameHi.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const filteredContacts = CONTACTS.filter(c => {
    const q = query.trim().toLowerCase();
    return !q || c.nameHi.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-6">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
              <Landmark className="w-6 h-6" />
              {t('सरकारी योजनाएँ', 'Govt. Schemes')}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {t('सब्सिडी, अनुदान व अधिकारी संपर्क', 'Subsidies, grants & official contacts')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-primary-foreground/10 rounded-xl p-1">
          <button
            onClick={() => setTab('schemes')}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'schemes' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/90'}`}
          >
            {t('योजनाएँ', 'Schemes')}
          </button>
          <button
            onClick={() => setTab('contacts')}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'contacts' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/90'}`}
          >
            {t('अधिकारी संपर्क', 'Officials')}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 -mt-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('खोजें...', 'Search...')}
            className="pl-9"
          />
        </div>

        {tab === 'schemes' && (
          <>
            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Object.keys(CATEGORY_LABEL).map(key => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${category === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'}`}
                >
                  {language === 'hi' ? CATEGORY_LABEL[key].hi : CATEGORY_LABEL[key].en}
                </button>
              ))}
            </div>

            {/* Scheme cards */}
            <div className="space-y-3">
              {filteredSchemes.map((s, idx) => (
                <div key={idx} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-sm leading-snug">
                      {language === 'hi' ? s.nameHi : s.nameEn}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                      {language === 'hi' ? CATEGORY_LABEL[s.category].hi : CATEGORY_LABEL[s.category].en}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {s.authority}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="font-medium text-success">{t('लाभ: ', 'Benefit: ')}</span>
                      <span className="text-foreground">{language === 'hi' ? s.benefitHi : s.benefitEn}</span>
                    </p>
                    <p>
                      <span className="font-medium text-primary">{t('पात्रता: ', 'Eligibility: ')}</span>
                      <span className="text-foreground">{language === 'hi' ? s.eligibilityHi : s.eligibilityEn}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {s.applyUrl && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(s.applyUrl, '_blank', 'noopener')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t('आवेदन', 'Apply')}
                      </Button>
                    )}
                    {s.helpline && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => (window.location.href = `tel:${s.helpline?.split('/')[0].trim()}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {s.helpline}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredSchemes.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {t('कोई योजना नहीं मिली', 'No schemes found')}
                </p>
              )}
            </div>
          </>
        )}

        {tab === 'contacts' && (
          <div className="space-y-3">
            {filteredContacts.map((c, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-snug">
                      {language === 'hi' ? c.nameHi : c.nameEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'hi' ? c.designationHi : c.designationEn}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone.split('/')[0].trim()}`}
                          className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                        >
                          <Phone className="w-3 h-3" /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="inline-flex items-center gap-1 text-xs font-medium bg-accent/15 text-accent px-2.5 py-1 rounded-full break-all"
                        >
                          <Mail className="w-3 h-3" /> {c.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t('कोई संपर्क नहीं मिला', 'No contacts found')}
              </p>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-warning/10 rounded-2xl p-3 border border-warning/30">
          <p className="text-xs text-warning">
            {t(
              '⚠️ जानकारी संदर्भ हेतु है। नवीनतम पात्रता व दरों के लिए संबंधित विभाग की आधिकारिक वेबसाइट देखें।',
              '⚠️ Information is indicative. Please verify the latest eligibility and rates on the respective official website.'
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

export default SchemesScreen;
