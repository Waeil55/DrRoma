import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const LAB_REFERENCE_DATA = [
  { name: 'Hemoglobin', cat: 'Hematology', male: '13.517.5 g/dL', female: '12.016.0 g/dL', critical: '< 7 or > 20 g/dL', notes: 'Decreased in anemia, hemorrhage; increased in polycythemia vera, dehydration, chronic hypoxia.' },
  { name: 'WBC', cat: 'Hematology', male: '4,50011,000 /L', female: '4,50011,000 /L', critical: '< 2,000 or > 30,000 /L', notes: 'Leukocytosis: infection, inflammation, malignancy. Leukopenia: bone marrow failure, chemo, autoimmune.' },
  { name: 'Platelets', cat: 'Hematology', male: '150,000400,000 /L', female: '150,000400,000 /L', critical: '< 50,000 or > 1,000,000 /L', notes: 'Low: ITP, TTP, DIC, HIT, bone marrow suppression. High: reactive thrombocytosis, myeloproliferative disorders.' },
  { name: 'Sodium', cat: 'Electrolytes', male: '136145 mEq/L', female: '136145 mEq/L', critical: '< 120 or > 160 mEq/L', notes: 'Hyponatremia: SIADH, diuretics, heart failure. Hypernatremia: dehydration, diabetes insipidus. Correct slowly to avoid osmotic demyelination.' },
  { name: 'Potassium', cat: 'Electrolytes', male: '3.55.0 mEq/L', female: '3.55.0 mEq/L', critical: '< 2.5 or > 6.5 mEq/L', notes: 'Hypokalemia  arrhythmias, U waves, weakness. Hyperkalemia  peaked T, wide QRS, sine wave  cardiac arrest. Check for hemolysis artifact.' },
  { name: 'Calcium (total)', cat: 'Electrolytes', male: '8.510.5 mg/dL', female: '8.510.5 mg/dL', critical: '< 6.0 or > 13.0 mg/dL', notes: 'Correct for albumin: add 0.8 for each 1 g/dL albumin below 4. Hypercalcemia: "stones, bones, groans, moans". Hypocalcemia: tetany, Chvostek/Trousseau.' },
  { name: 'Magnesium', cat: 'Electrolytes', male: '1.72.2 mg/dL', female: '1.72.2 mg/dL', critical: '< 1.0 or > 4.0 mg/dL', notes: 'Low Mg causes refractory hypokalemia and hypocalcemia. High Mg: loss of deep tendon reflexes, respiratory depression.' },
  { name: 'Glucose (fasting)', cat: 'Chemistry', male: '70100 mg/dL', female: '70100 mg/dL', critical: '< 40 or > 500 mg/dL', notes: 'Fasting  126 = diabetes. 100125 = pre-diabetes. Hypoglycemia: Whipple triad  symptoms, low glucose, relief with glucose.' },
  { name: 'HbA1c', cat: 'Chemistry', male: '< 5.7%', female: '< 5.7%', critical: '> 14%', notes: 'Reflects 23 month average glucose. 5.76.4% = pre-diabetes.  6.5% = diabetes. May be falsely low/high with hemoglobinopathies or high RBC turnover.' },
  { name: 'Creatinine', cat: 'Renal', male: '0.71.3 mg/dL', female: '0.61.1 mg/dL', critical: '> 10 mg/dL', notes: 'Elevated in AKI and CKD. Affected by muscle mass, diet, drugs (trimethoprim blocks secretion). Use eGFR for staging.' },
  { name: 'BUN', cat: 'Renal', male: '720 mg/dL', female: '720 mg/dL', critical: '> 100 mg/dL', notes: 'BUN:Cr > 20:1 suggests pre-renal azotemia. Elevated by GI bleed, high protein diet, steroids. Low in liver failure, malnutrition.' },
  { name: 'ALT (SGPT)', cat: 'Hepatic', male: '756 U/L', female: '756 U/L', critical: '> 1000 U/L', notes: 'More specific for liver than AST. Very high (>1000): viral hepatitis, acetaminophen toxicity, ischemic hepatitis. Mild elevation: NAFLD, drugs, alcohol.' },
  { name: 'AST (SGOT)', cat: 'Hepatic', male: '1040 U/L', female: '1040 U/L', critical: '> 1000 U/L', notes: 'AST:ALT > 2:1 suggests alcoholic liver disease. Also elevated in MI, rhabdomyolysis, hemolysis. Less specific than ALT for liver.' },
  { name: 'Bilirubin (total)', cat: 'Hepatic', male: '0.11.2 mg/dL', female: '0.11.2 mg/dL', critical: '> 15 mg/dL (neonates)', notes: 'Direct (conjugated): biliary obstruction, hepatocellular disease. Indirect (unconjugated): hemolysis, Gilbert syndrome. Jaundice visible > 2.5.' },
  { name: 'Albumin', cat: 'Hepatic', male: '3.55.0 g/dL', female: '3.55.0 g/dL', critical: '< 1.5 g/dL', notes: 'Half-life 21 days  reflects chronic liver synthetic function. Low in nephrotic syndrome, malnutrition, inflammation. Corrects calcium interpretation.' },
  { name: 'TSH', cat: 'Endocrine', male: '0.44.0 mIU/L', female: '0.44.0 mIU/L', critical: '< 0.01 or > 50 mIU/L', notes: 'Best initial test for thyroid. High TSH + low T4 = primary hypothyroidism. Low TSH + high T4 = hyperthyroidism. Check free T4 to confirm.' },
  { name: 'Free T4', cat: 'Endocrine', male: '0.81.8 ng/dL', female: '0.81.8 ng/dL', critical: '< 0.4 or > 5.0 ng/dL', notes: 'Not affected by TBG changes (pregnancy, estrogen, hepatitis). High: Graves, toxic nodule. Low: Hashimoto, secondary hypothyroidism.' },
  { name: 'Troponin I', cat: 'Cardiac', male: '< 0.04 ng/mL', female: '< 0.04 ng/mL', critical: '> 0.4 ng/mL (10 URL)', notes: 'Rise 36 hrs, peak 1224 hrs, normalize 714 days. Use high-sensitivity assay with serial measurements. Also elevated in PE, myocarditis, renal failure.' },
  { name: 'BNP', cat: 'Cardiac', male: '< 100 pg/mL', female: '< 100 pg/mL', critical: '> 900 pg/mL', notes: 'Below 100 = HF unlikely. 100400 = grey zone. >400 = HF likely. Higher cutoff in elderly, renal failure, AF. Low in obesity.' },
  { name: 'CRP', cat: 'Inflammatory', male: '< 1.0 mg/dL', female: '< 1.0 mg/dL', critical: '> 10.0 mg/dL', notes: 'Nonspecific acute phase reactant. Rises within 6 hrs of inflammation. Useful for infection, autoimmune flares, post-op complications.' },
  { name: 'ESR', cat: 'Inflammatory', male: '015 mm/hr', female: '020 mm/hr', critical: '> 100 mm/hr', notes: 'Highly unspecific but very elevated (>100) in temporal arteritis, multiple myeloma, endocarditis, osteomyelitis. Slower to rise/fall than CRP.' },
  { name: 'PT/INR', cat: 'Coagulation', male: 'PT 1113.5 sec; INR 1.0', female: 'PT 1113.5 sec; INR 1.0', critical: 'INR > 5.0', notes: 'Extrinsic pathway (factor VII). Monitors warfarin therapy (target INR 23 for most indications, 2.53.5 for mechanical valves). Elevated in liver disease, vit K deficiency.' },
  { name: 'aPTT', cat: 'Coagulation', male: '2535 seconds', female: '2535 seconds', critical: '> 70 seconds', notes: 'Intrinsic pathway (factors VIII, IX, XI, XII). Monitors unfractionated heparin (target 1.52.5 control). Elevated in hemophilia A/B, lupus anticoagulant.' },
  { name: 'D-Dimer', cat: 'Coagulation', male: '< 0.5 g/mL', female: '< 0.5 g/mL', critical: '> 4.0 g/mL', notes: 'High sensitivity, low specificity for VTE. Useful to rule out PE/DVT (if low pre-test probability). Elevated in DIC, post-op, pregnancy, cancer, infection.' },
  { name: 'Iron', cat: 'Hematology', male: '65175 g/dL', female: '50170 g/dL', critical: '> 350 g/dL (toxicity)', notes: 'Low: IDA (also low ferritin, high TIBC). High: hemochromatosis, transfusions. Diurnal variation  highest in morning. Check with ferritin, TIBC, transferrin sat.' },
  { name: 'Lipase', cat: 'Chemistry', male: '0160 U/L', female: '0160 U/L', critical: '> 3 upper limit', notes: 'More specific for pancreatitis than amylase. Stays elevated longer. Also elevated in renal failure, bowel obstruction, some malignancies.' },
  { name: 'Lactate', cat: 'Chemistry', male: '0.52.0 mmol/L', female: '0.52.0 mmol/L', critical: '> 4.0 mmol/L', notes: 'Type A (hypoxic): shock, sepsis, cardiac arrest. Type B (non-hypoxic): liver failure, metformin, malignancy. Clearance guides resuscitation.' },
  { name: 'ABG pH', cat: 'Blood Gas', male: '7.357.45', female: '7.357.45', critical: '< 7.1 or > 7.6', notes: 'Acidemia < 7.35; alkalemia > 7.45. Use with pCO and HCO to determine respiratory vs metabolic, then check compensation and anion gap.' },
  { name: 'pCO', cat: 'Blood Gas', male: '3545 mmHg', female: '3545 mmHg', critical: '< 20 or > 70 mmHg', notes: 'Respiratory component. High = respiratory acidosis (hypoventilation, COPD, opioids). Low = respiratory alkalosis (hyperventilation, anxiety, PE, sepsis).' },
  { name: 'HCO', cat: 'Blood Gas', male: '2226 mEq/L', female: '2226 mEq/L', critical: '< 10 or > 40 mEq/L', notes: 'Metabolic component. Low = metabolic acidosis (check anion gap: MUDPILES). High = metabolic alkalosis (vomiting, diuretics, Cushing). Kidneys compensate slowly (days).' },
];

const categories = ['All', ...new Set(LAB_REFERENCE_DATA.map(l => l.cat))];

export default function LabReferenceView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [sex, setSex] = useState('male');

  const filtered = LAB_REFERENCE_DATA.filter(l => {
    if (category !== 'All' && l.cat !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.notes.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}> Lab Reference</h2>
          <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            {filtered.length} lab{filtered.length !== 1 ? 's' : ''}  Normal ranges
          </p>
        </div>
        {/* Sex toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.2rem' }}>
          <button
            onClick={() => setSex('male')}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              background: sex === 'male' ? 'var(--accent, #6366f1)' : 'transparent',
              color: sex === 'male' ? '#fff' : '#888',
              transition: 'all 0.2s',
            }}
          >
             Male
          </button>
          <button
            onClick={() => setSex('female')}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              background: sex === 'female' ? 'var(--accent, #6366f1)' : 'transparent',
              color: sex === 'female' ? '#fff' : '#888',
              transition: 'all 0.2s',
            }}
          >
             Female
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search labs or notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
          color: 'inherit', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
              background: category === c ? 'var(--accent, #6366f1)' : 'rgba(255,255,255,0.08)',
              color: category === c ? '#fff' : '#aaa',
              transition: 'all 0.2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Lab cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((l, i) => {
          const isOpen = expanded === i;
          const range = sex === 'female' ? l.female : l.male;
          return (
            <div
              key={l.name}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, flex: 1, fontSize: '0.95rem' }}>{l.name}</span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  background: 'rgba(16,185,129,0.12)', color: '#10b981',
                }}>
                  {range}
                </span>
                <ChevronDown size={16} style={{
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.5,
                }} />
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.75rem',
                }}>
                  {/* Critical values */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: 10,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    marginBottom: '0.75rem',
                  }}>
                    <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                      Critical: {l.critical}
                    </span>
                  </div>
                  {/* Notes */}
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#ccc', margin: '0 0 0.75rem' }}>
                    {l.notes}
                  </p>
                  {/* Male / Female grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{
                      padding: '0.5rem 0.75rem', borderRadius: 10,
                      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.2rem', fontWeight: 600 }}> Male</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{l.male}</div>
                    </div>
                    <div style={{
                      padding: '0.5rem 0.75rem', borderRadius: 10,
                      background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.2rem', fontWeight: 600 }}> Female</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{l.female}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No labs found.</p>
        )}
      </div>
    </div>
  );
}
