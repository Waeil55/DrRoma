import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const PULM_SECTIONS = [
  { id: 'asthma', title: 'Asthma', icon: '',
    items: [
      { term: 'Asthma Classification & Stepwise', def: 'Intermittent: symptoms ≤2 days/wk, ≤2 nights/mo, FEV₁ >80%. Mild persistent: >2 days/wk. Moderate persistent: daily symptoms, FEV₁ 60-80%. Severe persistent: throughout day, FEV₁ <60%.', detail: 'Stepwise therapy: Step 1: PRN SABA (albuterol). Step 2: low-dose ICS. Step 3: low-dose ICS + LABA or medium-dose ICS. Step 4: medium-dose ICS + LABA. Step 5: high-dose ICS + LABA + add-on (LAMA, biologic). Step 6: high-dose ICS + LABA + oral corticosteroid or biologic.', pearl: 'GINA 2023 update: do NOT use SABA alone (even in Step 1). Preferred: PRN low-dose ICS-formoterol (budesonide-formoterol) as both reliever AND controller (SMART approach). Reduces severe exacerbations vs SABA alone. Biologics for severe uncontrolled: Tezepelumab (anti-TSLP, broadest phenotype coverage), Dupilumab (anti-IL-4/IL-13, Type 2 high/eosinophilic + elevated FeNO), Mepolizumab/Benralizumab (anti-IL-5, eosinophilic), Omalizumab (anti-IgE, allergic asthma).' },
      { term: 'Acute Exacerbation', def: 'Progressive dyspnea, wheezing, chest tightness, cough. ↓ peak flow. Triggers: URI (rhinovirus #1), allergens, exercise, cold air, NSAID/ASA, beta-blockers, GERD, poor adherence.', detail: 'Mild-moderate: albuterol neb Q20 min × 3, ipratropium if severe, oral prednisone 40-60 mg × 5 days (no taper needed). Severe/imminent arrest: continuous albuterol neb, ipratropium, IV magnesium sulfate 2g, systemic steroids, consider epinephrine IM, intubation if failing.', pearl: 'Red flags for near-fatal asthma: silent chest (no air movement), altered consciousness, bradycardia, cyanosis, PaCO₂ normal or rising (should be LOW in acute asthma — respiratory alkalosis expected). A "normal" blood gas in severe asthma = IMPENDING RESPIRATORY FAILURE (patient is tiring). Intubate early. Post-intubation: low RR, high I:E ratio, permissive hypercapnia to avoid breath stacking and auto-PEEP.' },
    ]},
  { id: 'copd', title: 'COPD', icon: '',
    items: [
      { term: 'COPD Diagnosis & Classification', def: 'FEV₁/FVC <0.70 post-bronchodilator. GOLD classification by FEV₁: GOLD 1 (≥80%), GOLD 2 (50-79%), GOLD 3 (30-49%), GOLD 4 (<30%). ABE grouping by symptoms and exacerbation history.', detail: 'Risk factors: smoking (#1), alpha-1 antitrypsin deficiency (consider in early-onset, lower-lobe emphysema, liver disease, family history — check AAT level). Phenotypes: emphysema (pink puffer — hyperinflation, thin, pursed-lip breathing, preserved oxygenation) vs chronic bronchitis (blue bloater — productive cough, cyanotic, overweight, cor pulmonale).', pearl: 'GOLD 2024 ABE groups: Group A (few symptoms, 0-1 exacerbations): bronchodilator PRN. Group B (more symptoms, 0-1 exacerbations): LABA + LAMA. Group E (≥2 moderate or ≥1 severe exacerbation): LABA + LAMA ± ICS (add ICS if eosinophils ≥300). Triple therapy (ICS + LABA + LAMA): IMPACT and ETHOS trials showed reduced exacerbations and mortality. ICS increases pneumonia risk — consider blood eosinophils to guide ICS use (benefit if eos ≥300, avoid if <100).' },
      { term: 'Acute Exacerbation (AECOPD)', def: 'Increased dyspnea, sputum volume, and/or sputum purulence. Most common triggers: viral URI, bacterial infection (H. influenzae, M. catarrhalis, S. pneumoniae), air pollution.', detail: 'Treatment: short-acting bronchodilators (albuterol + ipratropium), systemic corticosteroids (prednisone 40 mg × 5 days — REDUCE trial), antibiotics if increased sputum purulence + ≥1 other cardinal symptom (azithromycin or amoxicillin-clavulanate for outpatient; fluoroquinolone for inpatient or risk factors for Pseudomonas).', pearl: 'NIV (BiPAP) for AECOPD with respiratory acidosis (pH <7.35, PaCO₂ >45): reduces intubation and mortality — NNT of 5! Start early. Contraindications: inability to protect airway, hemodynamic instability, facial deformity. Oxygen target: 88-92% SpO₂ (avoid hyperoxia → ↑ CO₂ from Haldane effect + V/Q mismatch). Long-term supplemental O₂ prolongs survival if PaO₂ ≤55 or SpO₂ ≤88% (NOTT, MRC trials).' },
    ]},
  { id: 'ild', title: 'Interstitial Lung Disease', icon: '',
    items: [
      { term: 'Idiopathic Pulmonary Fibrosis', def: 'Most common and most deadly IIP. Mean survival 3-5 years. UIP (Usual Interstitial Pneumonia) pattern on HRCT: basilar-predominant honeycombing, traction bronchiectasis, reticulation, minimal ground-glass.', detail: 'Diagnosis: HRCT + clinical context (age >60, male, smoker/ex-smoker) may be sufficient for probable UIP pattern. Surgical lung biopsy if uncertain HRCT. Restrictive PFTs: ↓ FVC, ↓ DLCO, normal/increased FEV₁/FVC ratio.', pearl: 'Treatment: antifibrotics — pirfenidone or nintedanib (both slow FVC decline by ~50%, neither cures). Start early (don\'t wait for severe disease). Lung transplant referral at diagnosis for eligible patients. AVOID steroids (ineffective and harmful in IPF — unlike many other ILDs). Acute exacerbation of IPF: rapid deterioration, high mortality (~50%), supportive care ± high-dose steroids (limited evidence). Key DDx: hypersensitivity pneumonitis (HP — exposure history, upper-lobe predominant, mosaic attenuation), sarcoidosis, CTD-ILD.' },
      { term: 'Sarcoidosis', def: 'Non-caseating granulomas, multisystem. Bilateral hilar lymphadenopathy (BHL) classic. African Americans, Northern Europeans, women. Age 25-35 peak. Löfgren syndrome: BHL + erythema nodosum + periarticular ankle inflammation + fever.', detail: 'Staging: Stage 0 (normal CXR), I (BHL only — most resolve spontaneously), II (BHL + infiltrates), III (infiltrates, no BHL), IV (fibrosis). Diagnosis: clinical + imaging + biopsy (non-caseating granulomas) + exclude other causes (TB, fungal).', pearl: 'Treatment: most patients do NOT need treatment (self-limited). Treat if: progressive lung disease, cardiac sarcoid (arrhythmias, HF), neurosarcoid, hypercalcemia, severe ocular/skin disease. First-line: prednisone 20-40 mg, taper over months. Steroid-sparing: methotrexate, azathioprine, mycophenolate. Anti-TNF (infliximab) for refractory. Monitor: PFTs, ACE levels (correlate with granuloma burden but NOT useful for diagnosis), 24h urine calcium, ECG, ophthalmologic exam.' },
    ]},
  { id: 'pleural', title: 'Pleural Disease & PE', icon: '',
    items: [
      { term: 'Pleural Effusion', def: 'Light\'s criteria for exudate (any ONE): protein ratio >0.5, LDH ratio >0.6, LDH >2/3 upper limit of normal. Transudative: HF (#1), cirrhosis (hepatic hydrothorax), nephrotic syndrome. Exudative: infection (parapneumonic/empyema), malignancy, PE, TB, autoimmune, pancreatitis.', detail: 'Complicated parapneumonic/empyema: pH <7.2, glucose <60, LDH >1000, positive Gram stain/culture, loculation, frank pus. Treatment: chest tube drainage ± intrapleural fibrinolytics (tPA + DNase — MIST2 trial). VATS if tube fails.', pearl: 'Key fluid analyses: Low glucose (<60): RA, empyema, TB, malignancy, lupus. Elevated amylase: pancreatitis, esophageal rupture, malignancy. Milky/chylous (triglycerides >110): chylothorax (thoracic duct injury — post-surgical, lymphoma, trauma). ADA >40: highly suggestive of TB in endemic areas. Lymphocyte-predominant: TB, malignancy, lymphoma, sarcoidosis. Eosinophilic (>10%): previous taps (air/blood in pleural space), parasites, drug reaction, EGPA.' },
      { term: 'Pulmonary Embolism', def: 'DVT → PE (most from proximal LE DVT). Wells score: high probability (>6), moderate (2-6), low (<2). D-dimer: high sensitivity, low specificity — useful to RULE OUT in low-probability patients (age-adjusted: age × 10 in patients >50).', detail: 'Diagnosis: CTPA (CT pulmonary angiography) — gold standard. V/Q scan if CT contraindicated (contrast allergy, CKD). Echo: RV dilation/dysfunction (not diagnostic but prognostic). PESI/sPESI: risk-stratify (hemodynamically stable PE).', pearl: 'Treatment: anticoagulation × 3-6 months (provoked — surgery/immobilization), consider indefinite for unprovoked or recurrent. DOACs preferred (rivaroxaban or apixaban — no bridging needed). Massive PE (SBP <90 or cardiac arrest): systemic thrombolysis (alteplase 100 mg IV over 2h) OR catheter-directed therapy OR surgical embolectomy. Submassive PE (stable + RV dysfunction/elevated troponin): anticoagulation + close monitoring ± escalation if deteriorates. IVC filter: only if anticoagulation absolutely contraindicated (active hemorrhage). Retrievable filter — remove when anticoagulation can resume.' },
    ]},
];

export default function PulmonologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = PULM_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Pulmonology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Asthma, COPD, ILD & pleural disease</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>
            {active.items.map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-2" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black" style={{ color: 'var(--accent)' }}>{item.term}</h3>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#06b6d408', border: '1px solid #06b6d420', color: '#06b6d4' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PULM_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-xs opacity-40 mt-1">{s.items.length} topics</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
