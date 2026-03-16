import { useState } from 'react';

const PAIN_DATA = {
  ladder: [
    { step: 1, title: 'Non-Opioid Analgesics', color: '#10b981',
      drugs: [
        { name: 'Acetaminophen', dose: '500-1000 mg Q6h', max: '3-4g/day (2g/day if liver disease)', notes: 'First-line. No anti-inflammatory effect. Hepatotoxicity risk.' },
        { name: 'Ibuprofen', dose: '200-800 mg Q6-8h', max: '3.2g/day', notes: 'NSAID. GI bleeding, renal impairment, CV risk. Avoid in CKD, HF, GI bleed hx.' },
        { name: 'Ketorolac', dose: '15-30 mg IV Q6h', max: '5 days maximum', notes: 'Potent NSAID. Only short-term. Same contraindications as oral NSAIDs.' },
        { name: 'Celecoxib', dose: '100-200 mg BID', max: '400mg/day', notes: 'COX-2 selective. Less GI risk, similar CV risk. Good for arthritis.' },
      ]},
    { step: 2, title: 'Weak Opioids + Non-Opioid', color: '#f59e0b',
      drugs: [
        { name: 'Tramadol', dose: '50-100 mg Q4-6h', max: '400mg/day', notes: 'Weak mu-agonist + NE/5-HT reuptake inhibitor. Seizure risk. Serotonin syndrome with SSRIs.' },
        { name: 'Codeine', dose: '15-60 mg Q4-6h', max: '360mg/day', notes: 'Prodrug (→ morphine via CYP2D6). Ultra-rapid metabolizers: toxicity risk. Poor metabolizers: no effect.' },
      ]},
    { step: 3, title: 'Strong Opioids + Non-Opioid', color: '#ef4444',
      drugs: [
        { name: 'Morphine', dose: '5-15 mg PO Q4h', max: 'No ceiling; titrate to effect', notes: 'Gold standard. Active metabolite M6G accumulates in renal failure. Histamine release.' },
        { name: 'Oxycodone', dose: '5-15 mg PO Q4-6h', max: 'Titrate to effect', notes: 'Fewer histamine effects than morphine. Available as ER formulation (OxyContin).' },
        { name: 'Hydromorphone', dose: '1-4 mg PO Q4-6h or 0.5-1 mg IV', max: 'Titrate to effect', notes: '5-7× more potent than morphine. No active metabolites — preferred in renal failure.' },
        { name: 'Fentanyl', dose: 'Patch: 12-25 mcg/hr Q72h', max: 'Titrate', notes: '80-100× morphine potency. Transdermal, IV, buccal. NOT for opioid-naïve patients (patches).' },
      ]},
  ],
  equivalence: [
    { drug: 'Morphine PO', factor: 1 },
    { drug: 'Morphine IV', factor: 3 },
    { drug: 'Oxycodone PO', factor: 1.5 },
    { drug: 'Hydromorphone PO', factor: 4 },
    { drug: 'Hydromorphone IV', factor: 20 },
    { drug: 'Fentanyl transdermal (mcg/hr)', factor: 'Fentanyl patch mcg/hr ≈ morphine PO mg/day ÷ 2' },
    { drug: 'Tramadol PO', factor: 0.1 },
    { drug: 'Codeine PO', factor: 0.15 },
  ],
  adjuvants: [
    { cat: 'Neuropathic Pain', drugs: 'Gabapentin (100-3600 mg/day), Pregabalin (50-600 mg/day), Duloxetine (30-120 mg/day), Amitriptyline (10-75 mg qHS)', notes: 'First-line for neuropathic pain. Gabapentin/Pregabalin for DPN, PHN, fibromyalgia. Duloxetine for DPN, fibromyalgia, musculoskeletal.' },
    { cat: 'Bone Pain', drugs: 'Bisphosphonates, Denosumab, Radiation therapy, NSAIDs', notes: 'Bone mets: radiation for focal pain. Bisphosphonates reduce skeletal events.' },
    { cat: 'Spasticity', drugs: 'Baclofen (5-20 mg TID), Tizanidine (2-8 mg TID), Diazepam, Dantrolene', notes: 'Baclofen: GABA-B agonist. Do NOT abruptly discontinue (withdrawal seizures). Intrathecal baclofen pump for severe spasticity.' },
    { cat: 'Procedural Pain', drugs: 'Lidocaine (local/IV), Ketamine (sub-dissociative 0.1-0.3 mg/kg), N₂O, Propofol', notes: 'IV lidocaine: 1.5 mg/kg bolus can be opioid-sparing. Ketamine: maintains airway reflexes, useful in opioid-tolerant patients.' },
  ],
};

function PainManagementView() {
  const [tab, setTab] = useState('ladder');
  const tabs = [{ id: 'ladder', label: 'WHO Ladder' }, { id: 'equiv', label: 'Equivalence' }, { id: 'adjuvant', label: 'Adjuvants' }];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">💊 Pain Management</h2>
        <div className="flex gap-1 mt-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tab === t.id ? 'text-white' : 'opacity-50'}`}
              style={tab === t.id ? { background: 'var(--accent)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {tab === 'ladder' && (
          <div className="space-y-4 animate-fade-in-up">
            {PAIN_DATA.ladder.map(step => (
              <div key={step.step} className="glass rounded-2xl p-5" style={{ border: `1px solid ${step.color}30` }}>
                <h3 className="font-black flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black" style={{ background: step.color }}>{step.step}</span>
                  {step.title}
                </h3>
                <div className="space-y-3">
                  {step.drugs.map(d => (
                    <div key={d.name} className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                      <div className="font-black text-sm" style={{ color: step.color }}>{d.name}</div>
                      <div className="text-xs opacity-70 mt-1">Dose: {d.dose}</div>
                      <div className="text-xs opacity-50">Max: {d.max}</div>
                      <div className="text-xs opacity-40 mt-1">{d.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'equiv' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Opioid Equianalgesic Table</h3>
              <p className="text-xs opacity-40 mb-3">Approximately equivalent to Morphine 30 mg PO (factor = relative potency to morphine PO)</p>
              <div className="space-y-2">
                {PAIN_DATA.equivalence.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface,var(--card))' }}>
                    <span className="text-sm font-bold">{e.drug}</span>
                    <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>{typeof e.factor === 'number' ? `×${e.factor}` : e.factor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid #ef444420', background: '#ef444405' }}>
              <h3 className="font-black text-sm mb-2" style={{ color: '#ef4444' }}>⚠️ Conversion Safety</h3>
              {[
                'When rotating opioids, reduce calculated equianalgesic dose by 25-50% (incomplete cross-tolerance)',
                'Methadone conversion is NOT linear — use specific conversion ratios (highly variable, requires specialist)',
                'Always consider renal/hepatic function, drug interactions, and patient factors',
                'Breakthrough dose: typically 10-20% of total 24h opioid as Q1-2h PRN',
              ].map((t, i) => (
                <div key={i} className="flex gap-2 text-xs py-0.5"><span style={{ color: '#ef4444' }}>▸</span><span className="opacity-70 leading-relaxed">{t}</span></div>
              ))}
            </div>
          </div>
        )}

        {tab === 'adjuvant' && (
          <div className="space-y-4 animate-fade-in-up">
            {PAIN_DATA.adjuvants.map((adj, i) => (
              <div key={i} className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm mb-2" style={{ color: 'var(--accent)' }}>{adj.cat}</h3>
                <p className="text-sm opacity-70 mb-2">{adj.drugs}</p>
                <p className="text-xs opacity-50 leading-relaxed">{adj.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PainManagementView;
