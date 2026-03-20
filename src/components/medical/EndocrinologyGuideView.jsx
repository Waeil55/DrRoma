import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ENDO_SECTIONS = [
  { id: 'dka', title: 'DKA & HHS', icon: '',
    items: [
      { term: 'Diabetic Ketoacidosis (DKA)', def: 'Glucose >250, pH <7.3, bicarb <18, anion gap >12, positive ketones. Usually Type 1 DM (can occur in Type 2).', detail: 'Triggers (5 I\'s): Infection, Insulin missed, Infarction (MI), Intoxication, Initial presentation (new diagnosis). Presentation: Kussmaul breathing, fruity breath (acetone), abdominal pain, nausea/vomiting, AMS.', pearl: 'DKA treatment protocol: (1) Volume: NS 1-1.5L/hr first 1-2h, then 250-500 mL/hr. (2) Insulin: regular insulin 0.1 U/kg bolus → 0.1 U/kg/hr drip. (3) Potassium: if K <3.3 → hold insulin, replete K first. If K 3.3-5.3 → add 20-40 mEq/L to each liter of fluids. If K >5.3 → hold K, recheck Q2h. (4) When glucose <200 → add D5 to fluids, ↓ insulin to 0.02-0.05 U/kg/hr.' },
      { term: 'Hyperosmolar Hyperglycemic State (HHS)', def: 'Glucose >600, osmolality >320, pH >7.3, minimal/no ketones. Usually Type 2 DM. MORE lethal than DKA (mortality 10-20%).', detail: 'Develops over days-weeks (vs DKA hours-days). Severe dehydration (avg 9L deficit). Altered mental status. No significant acidosis (enough insulin to prevent ketosis, not enough to control glucose).', pearl: 'HHS treatment: aggressive fluid resuscitation is priority #1 (much greater fluid deficit than DKA). NS 1-1.5L first hour → switch to 1/2 NS if corrected Na normal/high. Insulin: lower doses than DKA (0.05-0.1 U/kg/hr) — rapid glucose correction risks cerebral edema. Correct slowly. Watch for thromboembolism (dehydration = hypercoagulable).' },
      { term: 'Hypoglycemia', def: 'Whipple\'s triad: (1) symptoms (tremor, diaphoresis, confusion, seizure), (2) low glucose (<70 mg/dL), (3) resolution with glucose correction.', detail: 'Causes: excess insulin/sulfonylurea (most common), insulinoma, adrenal insufficiency, sepsis, liver failure, alcohol, non-islet cell tumor. Workup: check insulin, C-peptide, proinsulin, beta-hydroxybutyrate, sulfonylurea screen during hypoglycemic episode.', pearl: 'Insulin:C-peptide patterns: Exogenous insulin: ↑insulin, ↓C-peptide. Insulinoma: ↑insulin, ↑C-peptide. Sulfonylurea: ↑insulin, ↑C-peptide, + sulfonylurea screen. Treatment: conscious → oral glucose (15g carbs, recheck 15 min). Unconscious → IV D50 (25g) or glucagon 1 mg IM/SQ.' },
    ]},
  { id: 'thyroid', title: 'Thyroid Disorders', icon: '',
    items: [
      { term: 'Hypothyroidism', def: 'High TSH, low free T4 (primary). Low TSH, low free T4 (central/secondary). Most common cause: Hashimoto\'s thyroiditis (anti-TPO antibodies).', detail: 'Symptoms: fatigue, cold intolerance, weight gain, constipation, dry skin, bradycardia, delayed DTRs, myxedema. Treatment: levothyroxine (start low in elderly/cardiac patients: 25-50 mcg). Full replacement: ~1.6 mcg/kg/day.', pearl: 'Myxedema coma: life-threatening hypothyroidism. Hypothermia, AMS, bradycardia, hypotension, hyponatremia, hypoglycemia. Treatment: IV levothyroxine (200-400 mcg loading dose) + IV hydrocortisone (stress-dose steroids before T4 — may unmask adrenal insufficiency). ICU admission. Mortality 30-60%.' },
      { term: 'Hyperthyroidism', def: 'Low TSH, high free T4/T3 (primary). Graves\' disease (most common): TSI (thyroid-stimulating immunoglobulin), diffuse goiter, exophthalmos, pretibial myxedema.', detail: 'Other causes: toxic multinodular goiter, toxic adenoma, thyroiditis (transient), exogenous T4. Diagnosis: TSH + free T4. If TSH suppressed: radioactive iodine uptake (RAIU) — high = Graves/toxic nodule, low = thyroiditis/exogenous.', pearl: 'Thyroid storm: life-threatening thyrotoxicosis. Fever >104°F, tachycardia, AMS, GI symptoms (N/V/D), cardiac failure. Treatment order matters: (1) propranolol (symptom control), (2) PTU (blocks new hormone synthesis + peripheral T4→T3 conversion), (3) iodine (Lugol\'s/SSKI) 1 HOUR AFTER PTU (blocks release; if given before PTU → fuel for more hormone), (4) hydrocortisone (blocks T4→T3 + treats relative adrenal insufficiency), (5) cooling measures.' },
      { term: 'Thyroid Nodules', def: 'Common (50% of adults by US). Most are benign. Evaluation: TSH first. If TSH low → RAIU (hot nodule → rarely malignant). If TSH normal/high → US features guide FNA.', detail: 'US features concerning for malignancy: hypoechoic, microcalcifications, irregular margins, taller-than-wide, extrathyroidal extension. Bethesda classification of FNA: I (nondiagnostic→repeat), II (benign), III (AUS/FLUS), IV (follicular neoplasm), V (suspicious), VI (malignant).', pearl: 'Bethesda III-IV: molecular testing (Afirma, ThyroSeq) helps decide surgery vs surveillance. Most common thyroid cancer: papillary (80%) — excellent prognosis, "Orphan Annie" nuclei, psammoma bodies, lymphatic spread. Medullary thyroid carcinoma: from C cells (calcitonin), associated with MEN2A/2B — always check calcitonin and RET proto-oncogene.' },
    ]},
  { id: 'adrenal', title: 'Adrenal Disorders', icon: '',
    items: [
      { term: 'Adrenal Insufficiency', def: 'Primary (Addison\'s): low cortisol, HIGH ACTH, hyperpigmentation, hyperkalemia. Secondary: low cortisol, LOW ACTH, NO hyperpigmentation, no hyperkalemia.', detail: 'Primary causes: autoimmune (80% in developed countries), TB (most common worldwide), adrenal hemorrhage (Waterhouse-Friderichsen — meningococcal sepsis), metastases, medications (ketoconazole, etomidate). Secondary: chronic steroid use (most common overall), pituitary tumors.', pearl: 'Adrenal crisis: acute, life-threatening. Hypotension/shock unresponsive to fluids/pressors. Treatment: IV hydrocortisone 100 mg bolus → 50 mg Q8h + aggressive NS resuscitation. DO NOT wait for cortisol results to treat if clinically suspected. Random cortisol <3 mcg/dL during stress = diagnostic. ACTH stimulation test: cortisol <18 at 30-60 min post-cosyntropin = insufficient.' },
      { term: 'Cushing\'s Syndrome', def: 'Cortisol excess. Central obesity, moon facies, buffalo hump, striae (purple/wide), thin skin, proximal myopathy, HTN, hyperglycemia, osteoporosis.', detail: 'Screening: 24h urine free cortisol, late-night salivary cortisol, or 1 mg overnight dexamethasone suppression test (cortisol >1.8 at 8 AM = positive). Localization: ACTH level → if ACTH-dependent (pituitary = Cushing\'s disease 70%, ectopic ACTH 15%) vs ACTH-independent (adrenal tumor 15%).', pearl: 'High-dose dex suppression test: suppression = pituitary Cushing\'s disease (responds to feedback). No suppression = ectopic ACTH (lung small cell, carcinoid — doesn\'t respond to feedback). Inferior petrosal sinus sampling (IPSS): gold standard for differentiating pituitary from ectopic if equivocal. Hypokalemia + metabolic alkalosis in Cushing\'s → suspect ectopic ACTH (very high cortisol overwhelms 11β-HSD2 → mineralocorticoid effect).' },
      { term: 'Pheochromocytoma', def: 'Catecholamine-secreting tumor from chromaffin cells (adrenal medulla). "Rule of 10s": 10% bilateral, 10% extra-adrenal (paraganglioma), 10% malignant, 10% pediatric.', detail: 'Classic triad: episodic headache, sweating, tachycardia/palpitations + severe HTN. Diagnosis: 24h urine fractionated metanephrines and catecholamines, OR plasma free metanephrines (preferred screening). Imaging: CT/MRI adrenals after biochemical confirmation.', pearl: 'CRITICAL: alpha-blockade FIRST (phenoxybenzamine or doxazosin for 10-14 days), THEN add beta-blocker. If beta-blocker given first → unopposed alpha stimulation → hypertensive crisis. Preop: alpha-block → volume expansion → then beta-block. Associated with MEN2A (with medullary thyroid Ca + hyperparathyroidism), MEN2B, VHL, NF1, SDH mutations.' },
    ]},
  { id: 'calcium', title: 'Calcium Disorders', icon: '',
    items: [
      { term: 'Hypercalcemia', def: 'Corrected Ca = measured Ca + 0.8 × (4.0 - albumin). Most common causes: primary hyperparathyroidism (outpatient) and malignancy (inpatient).', detail: '"Stones, bones, groans, thrones, and psychiatric overtones": nephrolithiasis, bone pain/fractures, abdominal pain/constipation/pancreatitis, polyuria/polydipsia, confusion/depression.', pearl: 'PTH-dependent (↑PTH): primary hyperparathyroidism (adenoma 85%, hyperplasia 15%). PTH-independent (↓PTH): malignancy (PTHrP, osteolytic mets, 1,25-vit D from lymphoma), granulomatous disease (sarcoid — ↑ 1,25-vit D), vitamin D intoxication, milk-alkali, thiazides. Treatment of acute hypercalcemia: NS 200-300 mL/hr → furosemide (ONLY after volume repleted) → calcitonin (rapid but transient) → zoledronic acid (onset 2-4 days, duration weeks) → denosumab if refractory.' },
      { term: 'Hypocalcemia', def: 'Corrected Ca <8.5 mg/dL OR ionized Ca <4.5 mg/dL. Always check albumin and magnesium.', detail: 'Causes: hypoparathyroidism (post-surgical most common), vitamin D deficiency, CKD (↓ 1,25-vit D), hypomagnesemia (impairs PTH secretion AND function — must correct Mg first), pancreatitis, hungry bone syndrome post-parathyroidectomy.', pearl: 'Severe/symptomatic (tetany, seizures, laryngospasm, QTc prolongation): IV calcium gluconate 1-2 g in 50 mL D5W over 10-20 min → continuous infusion 0.5-1.5 mg/kg/hr. Chvostek sign: tap facial nerve → twitch. Trousseau sign: inflate BP cuff >SBP for 3 min → carpal spasm (more specific). ALWAYS check and correct magnesium — hypoMg makes hypoCa refractory to treatment.' },
    ]},
];

export default function EndocrinologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = ENDO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Endocrinology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">DKA/HHS, thyroid, adrenal & calcium disorders</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENDO_SECTIONS.map(s => (
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
