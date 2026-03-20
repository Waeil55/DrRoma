import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const PALLIATIVE_SECTIONS = [
  { id: 'symptom', title: 'Symptom Management', icon: '',
    items: [
      { term: 'Pain', def: 'See WHO Analgesic Ladder. Key: "Total Pain" concept  physical + psychological + social + spiritual.', detail: 'Opioid-nave: start morphine 5-10 mg PO Q4h + PRN. Titrate 25-50% daily until controlled. Always prescribe laxative with opioids.', pearl: 'Opioid-induced constipation: senna + docusate (start with opioid). If refractory: methylnaltrexone (peripheral mu-antagonist, doesn\'t cross BBB). Never "wait and see"  prescribe prophylactically.' },
      { term: 'Dyspnea', def: 'Subjective sensation of breathlessness. Very distressing symptom.', detail: 'Non-pharmacologic: fan directed at face, positioning (upright/leaning forward), oxygen (if hypoxic, questionable if normoxic), pursed-lip breathing.', pearl: 'Low-dose morphine (2-5 mg PO Q4h) is first-line pharmacotherapy for dyspnea in palliative care. Does NOT cause respiratory depression at these doses. Anxiolytics (lorazepam 0.5-1 mg) if anxiety component.' },
      { term: 'Nausea/Vomiting', def: 'Identify etiology and target therapy. Multiple pathways: CTZ, vestibular, vagal, cortical.', detail: 'Opioid-induced: ondansetron 4 mg Q8h, metoclopramide 10 mg Q6h. Bowel obstruction: dexamethasone  octreotide (+NGT if needed). Increased ICP: dexamethasone.', pearl: 'Metoclopramide: prokinetic + antiemetic. Avoid in complete bowel obstruction ( peristalsis against obstruction  worse pain). Use haloperidol 0.5-2 mg instead.' },
      { term: 'Delirium / Terminal Agitation', def: 'Very common at end of life (up to 88%). Distressing to family.', detail: 'Workup reversible causes (same as any delirium). Terminal agitation may not have treatable cause.', pearl: 'Haloperidol 0.5-2 mg Q4h PRN is first-line. Midazolam 1-2 mg SQ Q1h PRN for refractory terminal agitation. Palliative sedation (continuous): propofol or midazolam infusion  for intractable suffering, ethically distinct from euthanasia.' },
      { term: 'Death Rattle', def: 'Noisy breathing from secretions pooling in pharynx. Common in last hours-days. Usually more distressing to family than patient.', detail: 'Reposition (lateral). Anticholinergics to dry secretions: glycopyrrolate 0.2 mg SQ Q4h, hyoscine (scopolamine) patch, atropine eye drops 1% sublingual.', pearl: 'Reassure family that patient is not "drowning" or suffering  the sound is from loss of swallowing reflex, not from distress. Suctioning is usually ineffective and uncomfortable.' },
    ]},
  { id: 'goals', title: 'Goals of Care Discussion', icon: '',
    items: [
      { term: 'REMAP Framework', def: 'Structured approach to serious illness conversations.', detail: 'R  Reframe (why this conversation matters now)\nE  Expect emotion (acknowledge, empathize)\nM  Map values ("What\'s most important to you?")\nA  Align with values (connect care plan to stated values)\nP  Plan (propose plan consistent with values)', pearl: '"I wish" statements: "I wish the situation were different"  shows empathy without giving false hope. Acknowledge uncertainty: "I hope for the best but want to prepare for the worst."' },
      { term: 'Prognostic Disclosure', def: 'Communicate expected trajectory with sensitivity.', detail: 'Ask permission: "Would it be helpful if I shared what I expect might happen?" Use time-based language: "hours to days," "days to weeks," "weeks to months." Avoid exact numbers.', pearl: 'Surprise question: "Would I be surprised if this patient died in the next 12 months?" If no  initiate palliative care/GOC discussion. 70-80% sensitivity for 12-month mortality.' },
      { term: 'Code Status Discussion', def: 'Frame as recommendation in context of overall goals, not a menu of options.', detail: '"Given what you\'ve told me about your goals, I would recommend that we focus fully on your comfort and not attempt CPR, as it would very unlikely help and could cause suffering."', pearl: 'Avoid: "Do you want us to do everything?" (implies anything less is abandonment). Instead: frame as what you CAN do, not what you\'re taking away. "We will do everything to keep you comfortable."' },
    ]},
  { id: 'hospice', title: 'Hospice & End-of-Life', icon: '',
    items: [
      { term: 'Hospice Eligibility', def: 'Prognosis 6 months if disease runs its natural course. Patient elects comfort focus.', detail: 'Medicare Hospice Benefit: covers drugs for terminal dx, nursing, social work, chaplain, aide, DME, bereavement support. Patient can revoke at any time.', pearl: 'Hospice  giving up. Early palliative care + hospice improves quality of life AND survival in some studies (Temel NEJM 2010: early palliative care in metastatic NSCLC  2.7 months longer survival).' },
      { term: 'Signs of Imminent Death', def: 'Days to hours before death. Important for family preparation.', detail: 'Breathing changes: Cheyne-Stokes, apneic periods, terminal secretions (death rattle). Decreased consciousness, mottling (livedo reticularis) starting peripherally, cool extremities, decreased urine output, loss of swallowing reflex.', pearl: 'Educate family: these are normal dying processes, not signs of suffering. Hearing may be last sense to go  continue talking, providing comfort. Physical presence is the most important thing.' },
      { term: 'Comfort Medications at End of Life', def: 'Essential medications to manage symptoms actively during dying process.', detail: 'Comfort kit (Hospice Emergency Kit): morphine liquid (pain/dyspnea), lorazepam (anxiety/seizure), haloperidol (nausea/agitation), atropine drops (secretions), acetaminophen suppository (fever/pain), bisacodyl suppository (constipation).', pearl: 'Oral route preferred as long as swallowing intact  switch to SQ/SL/PR when unable to swallow. Discontinue all non-essential medications. Continue opioids even in last hours  withdrawal adds suffering.' },
    ]},
];

function PalliativeCareView() {
  const [activeId, setActiveId] = useState(null);
  const active = PALLIATIVE_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Palliative Care</h2>
        <p className="text-xs opacity-40 mt-0.5">Symptom management & goals of care</p>
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
                <p className="text-sm opacity-80 leading-relaxed">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed whitespace-pre-line">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#a855f708', border: '1px solid #a855f720', color: '#a855f7' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PALLIATIVE_SECTIONS.map(s => (
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

export default PalliativeCareView;
