import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const QI_SECTIONS = [
  { id: 'pdsa', title: 'PDSA Cycle', icon: '🔄',
    content: [
      { heading: 'Plan', items: ['State the objective of the test of change', 'Make predictions about what will happen and why', 'Develop a plan: Who? What? When? Where? What data to collect?', 'Plan is based on theory or observation that improvement is possible'] },
      { heading: 'Do', items: ['Carry out the test on a SMALL scale', 'Document problems and unexpected observations', 'Begin data collection and analysis', 'Keep the test small and rapid (days-weeks, not months)'] },
      { heading: 'Study', items: ['Complete the data analysis', 'Compare results to predictions', 'Summarize what was learned', 'Was the change an improvement? How do you know?'] },
      { heading: 'Act', items: ['Adapt the change based on what was learned', 'Options: Adopt (implement), Adapt (modify and re-test), Abandon (try something else)', 'Plan the next cycle', 'Scale up successful changes gradually'] },
    ],
    tips: ['Multiple rapid PDSA cycles > one large project', 'Start small (1 patient, 1 shift, 1 provider)', 'Test predictions — learning from failures is valuable', 'Engage frontline staff from the beginning'] },
  { id: 'rca', title: 'Root Cause Analysis', icon: '🔍',
    content: [
      { heading: 'When to Use RCA', items: ['Sentinel events (patient death, wrong-site surgery, retained foreign body)', 'Near-miss events with potential for harm', 'Patterns of recurring errors', 'Required by TJC (The Joint Commission) for sentinel events'] },
      { heading: '5 Whys Technique', items: ['Ask "Why?" repeatedly to drill down to root cause', 'Example: Med error → nurse distracted → multiple patients → staffing shortage → budget cuts', 'Go beyond individual blame to SYSTEM factors', 'Usually 4-6 levels of "why" reach the root'] },
      { heading: 'Fishbone (Ishikawa) Diagram', items: ['Categories: People, Process, Equipment, Environment, Materials, Management', 'Brainstorm causes in each category', 'Identify the most likely root causes', 'Develop specific corrective actions for each'] },
      { heading: 'Swiss Cheese Model (Reason)', items: ['Multiple layers of defense, each with "holes" (weaknesses)', 'Error occurs when holes align through all layers', 'Solution: add/strengthen barriers (redundancy)', 'System design prevents errors rather than relying on individuals'] },
    ],
    tips: ['Focus on systems, not individuals', 'Ask "What?" and "Why?" not "Who?"', 'Involve all stakeholders in the analysis', 'Strong actions: physical/systemic changes. Weak actions: retraining, policies'] },
  { id: 'safety', title: 'Patient Safety', icon: '🛡️',
    content: [
      { heading: 'High-Reliability Organization (HRO) Principles', items: ['Preoccupation with failure — report near-misses', 'Reluctance to simplify — don\'t accept easy explanations', 'Sensitivity to operations — situational awareness', 'Commitment to resilience — plan for errors, recover quickly', 'Deference to expertise — let frontline staff speak up'] },
      { heading: 'Safety Culture Elements', items: ['Just culture: distinguish between human error (console), at-risk behavior (coach), and reckless behavior (discipline)', 'Psychological safety: staff feel safe reporting errors', 'Non-punitive reporting systems (PSAs, safety huddles)', 'Learning from events: closed-loop feedback'] },
      { heading: 'Common Safety Interventions', items: ['SBAR communication (Situation, Background, Assessment, Recommendation)', 'Timeouts (preprocedural verification)', 'Checklists (WHO Surgical Safety Checklist reduced mortality 47%)', 'Handoff standardization (I-PASS: Illness, Patient summary, Action list, Situation awareness, Synthesis)', 'Medication reconciliation at transitions', 'Read-back for verbal/phone orders'] },
    ],
    tips: ['Human error is inevitable — design systems to catch errors', 'Closed-loop communication: sender → receiver → receiver repeats back → sender confirms', 'CUS words: "I\'m Concerned / Uncomfortable / this is a Safety issue" — anyone can escalate'] },
];

function QualityImprovementView() {
  const [activeId, setActiveId] = useState(null);
  const active = QI_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">📋 Quality Improvement</h2>
        <p className="text-xs opacity-40 mt-0.5">PDSA, root cause analysis & patient safety</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>
            {active.content.map((sec, si) => (
              <div key={si} className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--accent)', color: '#fff' }}>{si + 1}</span>
                  {sec.heading}
                </h3>
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-0.5">
                    <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>▸</span>
                    <span className="opacity-70 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            ))}
            {active.tips && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
                <h3 className="font-black text-sm mb-3" style={{ color: '#f59e0b' }}>💡 Tips</h3>
                {active.tips.map((t, i) => (
                  <div key={i} className="flex gap-2 text-xs py-0.5"><span style={{ color: '#f59e0b' }}>▸</span><span className="opacity-70 leading-relaxed">{t}</span></div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QI_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-xs opacity-40 mt-1">{s.content.length} sections</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QualityImprovementView;
