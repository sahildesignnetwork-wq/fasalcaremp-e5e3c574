import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Landmark, Calculator, ExternalLink, Phone, CheckCircle2, AlertTriangle, Sparkles, IndianRupee } from 'lucide-react';

interface LoanScheme {
  id: string;
  nameHi: string;
  nameEn: string;
  bank: string;
  type: 'kcc' | 'term' | 'gold' | 'tractor' | 'agri-infra' | 'shg';
  minRate: number;
  maxRate: number;
  effectiveRate?: number; // after interest subvention
  tenureHi: string;
  tenureEn: string;
  maxAmountHi: string;
  maxAmountEn: string;
  benefitsHi: string[];
  benefitsEn: string[];
  eligibilityHi: string;
  eligibilityEn: string;
  link: string;
  helpline?: string;
  recommended?: boolean;
}

const SCHEMES: LoanScheme[] = [
  {
    id: 'kcc',
    nameHi: 'किसान क्रेडिट कार्ड (KCC)',
    nameEn: 'Kisan Credit Card (KCC)',
    bank: 'All Banks / RBI',
    type: 'kcc',
    minRate: 7,
    maxRate: 9,
    effectiveRate: 4,
    tenureHi: '5 साल (हर साल नवीनीकरण)',
    tenureEn: '5 years (renewed yearly)',
    maxAmountHi: '₹3 लाख तक',
    maxAmountEn: 'Up to ₹3 lakh',
    benefitsHi: [
      'समय पर चुकाने पर मात्र 4% ब्याज (3% सब्सिडी + 2% छूट)',
      '₹1.6 लाख तक बिना गारंटी',
      'पशुपालन व मत्स्य पालन भी कवर',
      'दुर्घटना बीमा ₹50,000 तक',
    ],
    benefitsEn: [
      'Only 4% interest on timely repayment (3% subvention + 2% prompt rebate)',
      'No collateral up to ₹1.6 lakh',
      'Covers animal husbandry & fisheries',
      'Accident insurance up to ₹50,000',
    ],
    eligibilityHi: 'सभी किसान – स्वामित्व/बटाईदार/किरायेदार। आयु 18–75 वर्ष।',
    eligibilityEn: 'All farmers – owner/sharecropper/tenant. Age 18–75 years.',
    link: 'https://pmkisan.gov.in/Documents/Kcc.pdf',
    helpline: '1800-180-1551',
    recommended: true,
  },
  {
    id: 'agri-gold',
    nameHi: 'कृषि स्वर्ण ऋण',
    nameEn: 'Agri Gold Loan',
    bank: 'SBI / BoB / PNB / Canara',
    type: 'gold',
    minRate: 7,
    maxRate: 9.5,
    tenureHi: '12 महीने (बुलेट रिपेमेंट)',
    tenureEn: '12 months (bullet repayment)',
    maxAmountHi: 'सोने की कीमत का 75% तक',
    maxAmountEn: 'Up to 75% of gold value',
    benefitsHi: [
      'तुरंत स्वीकृति (1-2 घंटे में)',
      'कोई आय प्रमाण नहीं',
      'सबसे कम ब्याज दर',
      'फसल के बाद एकमुश्त चुकाएँ',
    ],
    benefitsEn: [
      'Instant approval (1-2 hours)',
      'No income proof required',
      'Lowest interest rate',
      'Repay lump-sum after harvest',
    ],
    eligibilityHi: 'सोने के आभूषण (18-22 कैरेट) वाला कोई भी किसान',
    eligibilityEn: 'Any farmer with gold jewellery (18-22 carat)',
    link: 'https://sbi.co.in/web/agri-rural/agriculture-banking/gold-loan',
  },
  {
    id: 'kalia-pmegp',
    nameHi: 'मुद्रा / PMEGP (कृषि सहायक व्यवसाय)',
    nameEn: 'Mudra / PMEGP (Agri Allied)',
    bank: 'All PSU & Private Banks',
    type: 'term',
    minRate: 8.5,
    maxRate: 12,
    tenureHi: '3–7 साल',
    tenureEn: '3–7 years',
    maxAmountHi: '₹10 लाख (मुद्रा) / ₹25 लाख (PMEGP)',
    maxAmountEn: '₹10 lakh (Mudra) / ₹25 lakh (PMEGP)',
    benefitsHi: [
      'डेयरी, मुर्गी पालन, मधुमक्खी पालन हेतु',
      'PMEGP में 25–35% सब्सिडी',
      'कोई जमानत नहीं (₹10 लाख तक)',
    ],
    benefitsEn: [
      'For dairy, poultry, beekeeping',
      '25–35% subsidy under PMEGP',
      'No collateral up to ₹10 lakh',
    ],
    eligibilityHi: 'आयु 18+, परियोजना रिपोर्ट आवश्यक',
    eligibilityEn: 'Age 18+, project report required',
    link: 'https://www.kviconline.gov.in/pmegpeportal/',
    helpline: '1800-180-1551',
  },
  {
    id: 'tractor',
    nameHi: 'ट्रैक्टर ऋण',
    nameEn: 'Tractor Loan',
    bank: 'SBI / Mahindra Finance / HDFC',
    type: 'tractor',
    minRate: 9,
    maxRate: 14,
    tenureHi: '5–7 साल',
    tenureEn: '5–7 years',
    maxAmountHi: 'ट्रैक्टर कीमत का 85–90%',
    maxAmountEn: '85–90% of tractor cost',
    benefitsHi: [
      'मासिक/अर्धवार्षिक किस्त विकल्प',
      'PSU बैंक की दर सबसे कम',
      'महिला किसानों को 0.25% छूट',
    ],
    benefitsEn: [
      'Monthly/half-yearly EMI options',
      'PSU banks offer lowest rate',
      '0.25% discount for women farmers',
    ],
    eligibilityHi: 'न्यूनतम 2 एकड़ ज़मीन, आयु 21–65',
    eligibilityEn: 'Minimum 2 acres land, age 21–65',
    link: 'https://sbi.co.in/web/agri-rural/agriculture-banking/farm-mechanisation/new-tractor-loan',
  },
  {
    id: 'aif',
    nameHi: 'कृषि अवसंरचना कोष (AIF)',
    nameEn: 'Agri Infrastructure Fund (AIF)',
    bank: 'NABARD / All Banks',
    type: 'agri-infra',
    minRate: 9,
    maxRate: 11,
    effectiveRate: 6,
    tenureHi: '7 साल (2 साल मोरेटोरियम)',
    tenureEn: '7 years (2-yr moratorium)',
    maxAmountHi: '₹2 करोड़ तक',
    maxAmountEn: 'Up to ₹2 crore',
    benefitsHi: [
      '3% ब्याज सब्सिडी (7 साल)',
      'गोदाम, कोल्ड स्टोरेज, प्रसंस्करण हेतु',
      'CGTMSE गारंटी मुफ्त',
    ],
    benefitsEn: [
      '3% interest subvention (7 yrs)',
      'For warehouses, cold storage, processing',
      'Free CGTMSE credit guarantee',
    ],
    eligibilityHi: 'किसान, FPO, PACS, स्टार्टअप',
    eligibilityEn: 'Farmers, FPOs, PACS, startups',
    link: 'https://agriinfra.dac.gov.in/',
    recommended: true,
  },
  {
    id: 'shg',
    nameHi: 'SHG / जॉइंट लायबिलिटी ग्रुप ऋण',
    nameEn: 'SHG / Joint Liability Group Loan',
    bank: 'NABARD / NRLM',
    type: 'shg',
    minRate: 7,
    maxRate: 10,
    tenureHi: '1–3 साल',
    tenureEn: '1–3 years',
    maxAmountHi: '₹10 लाख/समूह तक',
    maxAmountEn: 'Up to ₹10 lakh/group',
    benefitsHi: [
      'समूह गारंटी – कोई व्यक्तिगत जमानत नहीं',
      'महिला समूहों को 4–5% रियायती दर',
      'बैंक लिंकेज सब्सिडी',
    ],
    benefitsEn: [
      'Group guarantee – no personal collateral',
      '4–5% concessional rate for women SHGs',
      'Bank linkage subsidy',
    ],
    eligibilityHi: '10–20 सदस्यों का समूह, 6 माह पुराना',
    eligibilityEn: 'Group of 10–20 members, 6 months old',
    link: 'https://aajeevika.gov.in/',
  },
];

const FinanceScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('3');

  const emi = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = (parseFloat(years) || 0) * 12;
    if (!P || !r || !n) return { emi: 0, total: 0, interest: 0 };
    const e = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi: e, total: e * n, interest: e * n - P };
  }, [amount, rate, years]);

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              {t('किसान फाइनेंस', 'Kisan Finance')}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {t('KCC, ऋण व ब्याज सलाह', 'KCC, loans & interest advice')}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 -mt-4 space-y-4">
        {/* Smart Advice */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-primary/20">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('स्मार्ट सलाह', 'Smart Advice')}
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>{t('पहले KCC बनवाएँ – सबसे सस्ता (केवल 4% ब्याज)।', 'Get a KCC first – cheapest option (only 4% interest).')}</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>{t('समय पर चुकाएँ – 3% ब्याज सब्सिडी मिलेगी।', 'Repay on time – get 3% interest subvention.')}</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>{t('₹1.6 लाख तक कोई गारंटी नहीं।', 'No collateral required up to ₹1.6 lakh.')}</span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span>{t('साहूकार से न लें – ब्याज 24–60% होता है। बैंक/सहकारी समिति चुनें।', 'Avoid moneylenders – they charge 24–60%. Choose banks/cooperatives.')}</span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span>{t('बड़ा निवेश (कोल्ड स्टोरेज/गोदाम) हेतु AIF चुनें – 3% सब्सिडी।', 'For big investments (cold storage/warehouse), choose AIF – 3% subsidy.')}</span>
            </li>
          </ul>
        </div>

        <Tabs defaultValue="schemes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schemes">{t('ऋण योजनाएँ', 'Loan Schemes')}</TabsTrigger>
            <TabsTrigger value="emi">{t('EMI कैलकुलेटर', 'EMI Calculator')}</TabsTrigger>
          </TabsList>

          {/* Schemes */}
          <TabsContent value="schemes" className="space-y-3 mt-4">
            {SCHEMES.map(s => (
              <div
                key={s.id}
                className={`bg-card rounded-2xl p-4 shadow-md border ${s.recommended ? 'border-success/50' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {language === 'hi' ? s.nameHi : s.nameEn}
                    </h3>
                    <p className="text-xs text-muted-foreground">{s.bank}</p>
                  </div>
                  {s.recommended && (
                    <Badge className="bg-success text-success-foreground text-[10px]">
                      {t('अनुशंसित', 'Recommended')}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="bg-primary/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{t('ब्याज दर', 'Interest')}</p>
                    <p className="text-sm font-bold text-primary">{s.minRate}-{s.maxRate}%</p>
                    {s.effectiveRate && (
                      <p className="text-[9px] text-success">
                        {t(`प्रभावी ${s.effectiveRate}%`, `Eff. ${s.effectiveRate}%`)}
                      </p>
                    )}
                  </div>
                  <div className="bg-accent/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{t('अवधि', 'Tenure')}</p>
                    <p className="text-xs font-semibold text-foreground">
                      {language === 'hi' ? s.tenureHi : s.tenureEn}
                    </p>
                  </div>
                  <div className="bg-success/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{t('अधिकतम', 'Max')}</p>
                    <p className="text-xs font-semibold text-foreground">
                      {language === 'hi' ? s.maxAmountHi : s.maxAmountEn}
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-foreground mb-1">{t('लाभ:', 'Benefits:')}</p>
                  <ul className="space-y-1">
                    {(language === 'hi' ? s.benefitsHi : s.benefitsEn).map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                        <span className="text-success">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] text-muted-foreground mb-3">
                  <span className="font-semibold text-foreground">{t('पात्रता: ', 'Eligibility: ')}</span>
                  {language === 'hi' ? s.eligibilityHi : s.eligibilityEn}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(s.link, '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    {t('आवेदन करें', 'Apply Now')}
                  </Button>
                  {s.helpline && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${s.helpline}`, '_self')}
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      {s.helpline}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* EMI Calculator */}
          <TabsContent value="emi" className="mt-4">
            <div className="bg-card rounded-2xl p-4 shadow-md border border-border space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                {t('EMI कैलकुलेटर', 'EMI Calculator')}
              </h3>

              <div>
                <Label className="text-xs">{t('ऋण राशि (₹)', 'Loan Amount (₹)')}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label className="text-xs">{t('ब्याज दर (% सालाना)', 'Interest Rate (% p.a.)')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  placeholder="7"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t('KCC: 4-7% | Gold: 7-9% | Tractor: 9-14%', 'KCC: 4-7% | Gold: 7-9% | Tractor: 9-14%')}
                </p>
              </div>
              <div>
                <Label className="text-xs">{t('अवधि (साल)', 'Tenure (years)')}</Label>
                <Input
                  type="number"
                  value={years}
                  onChange={e => setYears(e.target.value)}
                  placeholder="3"
                />
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-success/10 rounded-xl p-4 mt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('मासिक EMI', 'Monthly EMI')}</p>
                    <p className="text-base font-bold text-primary flex items-center justify-center">
                      <IndianRupee className="w-3.5 h-3.5" />{fmt(emi.emi)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('कुल ब्याज', 'Total Interest')}</p>
                    <p className="text-base font-bold text-warning flex items-center justify-center">
                      <IndianRupee className="w-3.5 h-3.5" />{fmt(emi.interest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('कुल भुगतान', 'Total Payable')}</p>
                    <p className="text-base font-bold text-foreground flex items-center justify-center">
                      <IndianRupee className="w-3.5 h-3.5" />{fmt(emi.total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 rounded-lg p-3 mt-3 border border-warning/30">
                <p className="text-xs text-warning-foreground">
                  <span className="font-semibold">{t('सुझाव: ', 'Tip: ')}</span>
                  {t(
                    'EMI आपकी मासिक आय का 40% से ज़्यादा न हो। समय पर भुगतान से CIBIL स्कोर बेहतर बनेगा व अगला ऋण आसानी से मिलेगा।',
                    'Keep EMI under 40% of monthly income. Timely repayment improves CIBIL score and helps get future loans easily.'
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinanceScreen;
