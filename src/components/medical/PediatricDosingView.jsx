import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PEDS_DRUGS = [
  { name: 'Amoxicillin', indication: 'Otitis media, pharyngitis, UTI', standardDose: '25 mg/kg/dose TID or 45 mg/kg/dose BID (high dose)', maxDose: '500 mg/dose (standard), 1000 mg/dose (high)', formulations: ['250 mg/5 mL suspension', '400 mg/5 mL suspension', '500 mg capsule'], notes: 'High dose (90 mg/kg/day) for resistant S. pneumoniae. Give with food to reduce GI upset.' },
  { name: 'Ibuprofen', indication: 'Fever, pain, inflammation', standardDose: '10 mg/kg/dose Q6-8h', maxDose: '400 mg/dose, 40 mg/kg/day', formulations: ['100 mg/5 mL suspension', '200 mg tablet'], notes: 'Avoid if dehydrated (AKI risk). Not recommended <6 months. Can alternate with acetaminophen.' },
  { name: 'Acetaminophen (Paracetamol)', indication: 'Fever, mild pain', standardDose: '15 mg/kg/dose Q4-6h', maxDose: '75 mg/kg/day or 1000 mg/dose', formulations: ['160 mg/5 mL suspension', '325 mg tablet', '500 mg tablet'], notes: 'Hepatotoxic in overdose. Consider weight-based dosing carefully. Rectal route available.' },
  { name: 'Ceftriaxone', indication: 'Meningitis, sepsis, severe infections', standardDose: '50-100 mg/kg/day IV/IM (daily or divided BID for meningitis)', maxDose: '2 g/dose (4 g/day for meningitis)', formulations: ['250 mg vial', '1 g vial', '2 g vial'], notes: 'AVOID in neonates <28 days with hyperbilirubinemia (displaces bilirubin from albumin). Do not co-administer with calcium-containing IV solutions.' },
  { name: 'Ondansetron', indication: 'Nausea/vomiting, gastroenteritis', standardDose: '0.15 mg/kg/dose Q8h (max 3 doses)', maxDose: '4 mg/dose', formulations: ['4 mg/5 mL oral solution', '4 mg ODT tablet'], notes: 'Very effective for gastroenteritis vomiting. Single dose often sufficient. QTc prolongation at high doses.' },
  { name: 'Prednisolone', indication: 'Asthma exacerbation, croup', standardDose: 'Asthma: 1-2 mg/kg/day (3-5 days). Croup: 1-2 mg/kg single dose', maxDose: '60 mg/day (asthma), 60 mg single dose (croup)', formulations: ['15 mg/5 mL solution', '5 mg tablet'], notes: 'Dexamethasone 0.6 mg/kg single dose often preferred for croup. No taper needed if <5 days.' },
  { name: 'Albuterol (Salbutamol)', indication: 'Asthma, bronchospasm, wheezing', standardDose: 'MDI: 4-8 puffs via spacer Q20min × 3, then Q1-4h. Neb: 2.5-5 mg Q20min × 3', maxDose: 'Continuous nebulization 10-20 mg/hr in severe exacerbation', formulations: ['MDI 90 mcg/puff', 'Nebulizer solution 2.5 mg/3 mL, 5 mg/mL'], notes: 'Always use spacer with MDI in children. Side effects: tachycardia, tremor, hypokalemia.' },
  { name: 'Epinephrine (Adrenaline)', indication: 'Anaphylaxis, severe croup, cardiac arrest', standardDose: 'Anaphylaxis: 0.01 mg/kg IM (0.01 mL/kg of 1:1000). Cardiac arrest: 0.01 mg/kg IV (0.1 mL/kg of 1:10,000)', maxDose: '0.5 mg IM (anaphylaxis), 1 mg IV (cardiac arrest)', formulations: ['1:1000 (1 mg/mL) IM — anaphylaxis', '1:10,000 (0.1 mg/mL) IV — cardiac arrest', 'EpiPen Jr 0.15 mg (<30 kg), EpiPen 0.3 mg (>30 kg)'], notes: 'IM anterolateral thigh ALWAYS for anaphylaxis. Can repeat Q5-15 min. Do NOT give IV 1:1000 (fatal).' },
];

const parseDose = (doseStr) => {
  const match = doseStr.match(/([\d.]+)\s*mg\/kg/);
  return match ? parseFloat(match[1]) : null;
};

export default function PediatricDosingView() {
  const [weight, setWeight] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filtered = PEDS_DRUGS.filter(d => !search || (d.name + ' ' + d.indication).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Pediatric Dosing</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black opacity-40 block mb-1">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight…"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="text-xs font-black opacity-40 block mb-1">Search drug</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Drug name…"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[5, 10, 15, 20, 25, 30, 40, 50].map(w => (
            <button key={w} onClick={() => setWeight(String(w))}
              className="px-2.5 py-1 rounded-lg text-xs font-black shrink-0 transition-all"
              style={String(w) === weight ? { background: 'var(--accent)', color: '#fff' } : { opacity: .4 }}>
              {w} kg
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filtered.map(drug => {
          const isOpen = expanded === drug.name;
          const w = parseFloat(weight);
          const dose = parseDose(drug.standardDose);
          const calcDose = (w && dose) ? (w * dose).toFixed(1) : null;
          return (
            <div key={drug.name} className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setExpanded(e => e === drug.name ? null : drug.name)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm">{drug.name}</h3>
                  <p className="text-xs opacity-40 mt-0.5">{drug.indication}</p>
                </div>
                {calcDose && (
                  <span className="px-3 py-1 rounded-xl text-xs font-black shrink-0" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>
                    {calcDose} mg/dose
                  </span>
                )}
                <ChevronDown size={14} className="opacity-40 transition-transform shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 space-y-3 animate-fade-in-up">
                  {w > 0 && dose && (
                    <div className="glass rounded-xl p-4 text-center" style={{ background: 'var(--accent)/05', border: '1px solid var(--accent)/20' }}>
                      <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{calcDose} mg/dose</div>
                      <p className="text-xs opacity-50 mt-1">Based on {w} kg × {dose} mg/kg</p>
                    </div>
                  )}
                  <div><span className="text-xs font-black opacity-40">Standard Dose:</span><p className="text-xs opacity-70 mt-0.5">{drug.standardDose}</p></div>
                  <div><span className="text-xs font-black opacity-40">Max Dose:</span><p className="text-xs opacity-70 mt-0.5">{drug.maxDose}</p></div>
                  <div>
                    <span className="text-xs font-black opacity-40">Formulations:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {drug.formulations.map((f, i) => <span key={i} className="px-2 py-0.5 rounded-lg text-xs" style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>{f}</span>)}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                    <span className="text-xs font-black" style={{ color: '#f59e0b' }}> Notes</span>
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">{drug.notes}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No drugs found</p></div>}
      </div>
    </div>
  );
}
