import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ETHICS_SECTIONS = [
  { id: 'principles', title: 'Core Ethical Principles', icon: '',
    items: [
      { term: 'Autonomy', def: 'Respect for patient\'s right to make their own decisions. Informed consent is the practical application.', detail: 'Patients can refuse ANY treatment, even life-saving. Requires capacity: understand, appreciate, reason, communicate. Advance directives extend autonomy when patient cannot decide.', pearl: 'A competent patient\'s refusal of treatment must be respected, even if the physician disagrees. "Competent" is a legal term; "capacity" is the clinical assessment.' },
      { term: 'Beneficence', def: 'Duty to act in the patient\'s best interest. Obligation to provide benefit while minimizing harm.', detail: 'Differs from non-maleficence: beneficence = actively doing good. Includes: treating disease, providing comfort, sharing information. Must balance with patient autonomy.', pearl: 'Paternalism = overriding autonomy "for the patient\'s good." Generally unacceptable. Exception: emergency treatment of incapacitated patient.' },
      { term: 'Non-maleficence', def: '"First, do no harm" (primum non nocere). Duty to avoid causing unnecessary harm or suffering.', detail: 'Risk-benefit analysis: acceptable harm may be tolerated if benefits outweigh (e.g., chemotherapy side effects). Double effect: foreseen but unintended harm (e.g., morphine for pain → hastens death).', pearl: 'Doctrine of Double Effect: action is ethical if: (1) action itself is good/neutral, (2) good effect is intended, (3) bad effect is foreseen but not intended, (4) good outweighs bad.' },
      { term: 'Justice', def: 'Fair distribution of healthcare resources. Treat similar patients similarly. Address health disparities.', detail: 'Distributive justice: allocation of scarce resources (organ transplantation, ICU beds, ventilators in pandemic). Procedural justice: fair processes for decision-making.', pearl: 'Triage in disaster: utilitarian approach (greatest good for greatest number) — differs from individual patient care. Allocation frameworks: lottery, first-come, sickest-first, youngest-first, maximize life-years.' },
    ]},
  { id: 'eol', title: 'End-of-Life Ethics', icon: '',
    items: [
      { term: 'Advance Directives', def: 'Legal documents expressing treatment preferences when patient lacks capacity.', detail: 'Living will: specifies treatments desired/refused. Healthcare proxy (DPOA): designates decision-maker. POLST (Physician Orders for Life-Sustaining Treatment): medical orders for seriously ill patients.', pearl: 'Healthcare proxy overrides living will if they conflict. Encourage patients to discuss values (not just specific treatments) with their proxy.' },
      { term: 'DNR / DNAR / AND', def: 'Do Not Resuscitate / Do Not Attempt Resuscitation / Allow Natural Death. No CPR if cardiac/respiratory arrest.', detail: 'DNR ≠ "do nothing." Full medical care continues (antibiotics, pressors, intubation for reversible causes) unless specified otherwise. Must be discussed, not assumed. Can be reversed by patient at any time.', pearl: 'Common misunderstanding: DNR does NOT mean comfort care only. It specifically means no CPR/defibrillation. All other treatments should be discussed separately.' },
      { term: 'Withdrawal of Care', def: 'Discontinuing life-sustaining treatment when it no longer serves the patient\'s goals. Ethically equivalent to withholding.', detail: 'Withdrawing = withholding (ethically and legally). Not considered killing or euthanasia. Based on patient\'s wishes (autonomy) or surrogate decision. Includes: extubation, stopping vasopressors, stopping dialysis, removing feeding tubes.', pearl: 'Ethical: Withdrawing care is not "giving up." It\'s shifting goals from cure to comfort. Ensure adequate symptom management during withdrawal. Family should be prepared for what to expect.' },
      { term: 'Brain Death', def: 'Irreversible cessation of ALL brain functions including brainstem. Legal death. Requires formal assessment.', detail: 'Criteria: known cause, exclude confounders (hypothermia, drugs, metabolic), absent brainstem reflexes (pupillary, corneal, oculocephalic, oculovestibular, gag, cough), absent respiratory drive (apnea test). Confirmatory: EEG, cerebral angiography (if clinical exam confounded).', pearl: 'Brain death = dead. No ethical obligation to continue treatment (including ventilator). Organ donation should be considered. Family may need time to process — compassion is key.' },
    ]},
  { id: 'special', title: 'Special Ethical Situations', icon: '',
    items: [
      { term: 'Confidentiality & Exceptions', def: 'Patient information is confidential. Exceptions exist for safety and legal requirements.', detail: 'Exceptions to confidentiality: duty to warn (Tarasoff — imminent threat to identifiable third party), reportable diseases, child/elder abuse, gunshot/stab wounds, impaired drivers.', pearl: 'Tarasoff duty: if patient makes credible threat against identifiable person, physician must take reasonable steps to protect (warn intended victim, notify police, hospitalize).' },
      { term: 'Minors & Consent', def: 'Generally need parental consent. Exceptions: emancipated minor, mature minor, emergency, specific conditions.', detail: 'Emancipated: married, military, self-supporting, parent themselves. Mature minor: case-by-case, demonstrates understanding. Specific conditions (most states): STI/HIV, contraception, substance abuse, mental health, pregnancy-related care.', pearl: 'In emergency: treat first, consent later (implied consent). If parents refuse life-saving treatment for child: get court order. Child\'s best interest trumps parental autonomy.' },
      { term: 'Futility', def: 'Treatment that will not achieve its medical goal. Quantitative: <1% chance. Qualitative: won\'t benefit the patient.', detail: 'Unilateral withdrawal of "futile" care is controversial. Ethics committee consultation recommended. California: Futile Treatment statute. Some states allow physicians to withdraw futile therapy after proper process.', pearl: 'Better term: "non-beneficial" rather than "futile." Emphasize goals-of-care discussion. Focus on what CAN be done (comfort, dignity) rather than what cannot.' },
      { term: 'Conscientious Objection', def: 'Physician refuses to provide treatment based on moral/religious beliefs.', detail: 'Acceptable IF: doesn\'t abandon patient, provides timely referral, doesn\'t impose beliefs on patient. Must inform patient of all options even if personally opposed.', pearl: 'Emergency exception: must treat regardless of personal beliefs if no alternative provider available. Patient\'s right to care > physician\'s right to refuse.' },
    ]},
];

function MedicalEthicsView() {
  const [activeId, setActiveId] = useState(null);
  const active = ETHICS_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Medical Ethics</h2>
        <p className="text-xs opacity-40 mt-0.5">Ethical frameworks & clinical dilemmas</p>
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
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#8b5cf608', border: '1px solid #8b5cf620', color: '#8b5cf6' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ETHICS_SECTIONS.map(s => (
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

export default MedicalEthicsView;
