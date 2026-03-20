import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const COMM_FRAMEWORKS = [
  { id: 'spikes', title: 'SPIKES Protocol', icon: '', description: 'Breaking bad news',
    steps: [
      { letter: 'S', title: 'Setting', desc: 'Private setting, sit down, involve significant others per patient preference. "Warning shot" that serious information is coming.' },
      { letter: 'P', title: 'Perception', desc: 'Assess what patient already knows/suspects. "What is your understanding of your condition so far?"' },
      { letter: 'I', title: 'Invitation', desc: 'Ask permission and assess desire for information. "Would you like me to explain the test results in detail?"' },
      { letter: 'K', title: 'Knowledge', desc: 'Share information in clear, simple language. Avoid jargon. Give information in small chunks. Use "warning shots": "I\'m sorry to tell you that..."' },
      { letter: 'E', title: 'Emotions', desc: 'Respond to patient\'s emotional reaction with empathy. Allow silence. "I can see this is very difficult news."' },
      { letter: 'S', title: 'Strategy & Summary', desc: 'Summarize discussion, outline next steps and plan. "Here is what we can do from here..." Arrange follow-up.' },
    ],
    extras: [],
  },
  { id: 'mi', title: 'Motivational Interviewing', icon: '', description: 'OARS technique for behavior change',
    steps: [
      { letter: 'O', title: 'Open-ended questions', desc: '"Tell me about your experience with..." (not yes/no)' },
      { letter: 'A', title: 'Affirmations', desc: 'Acknowledge strengths and efforts. "It took courage to come in today."' },
      { letter: 'R', title: 'Reflective listening', desc: 'Mirror back what patient says to show understanding. "It sounds like you\'re worried about..."' },
      { letter: 'S', title: 'Summarizing', desc: 'Collect and link patient\'s statements. "So what I\'m hearing is..."' },
    ],
    extras: [
      'Explore ambivalence (pros/cons of change)',
      'Develop discrepancy between current behavior and goals',
      'Roll with resistance (don\'t argue)',
      'Support self-efficacy ("What do you think would work for you?")',
      '"On a scale of 1-10, how important is this change to you?" → explore both sides',
    ],
  },
  { id: 'consent', title: 'Informed Consent', icon: '', description: 'Elements of valid consent',
    steps: [
      { letter: 'D', title: 'Disclosure', desc: 'Diagnosis, proposed treatment, risks, benefits, alternatives (including no treatment), and prognosis.' },
      { letter: 'U', title: 'Understanding', desc: 'Patient must demonstrate understanding. Teach-back method: "Can you explain back what we discussed?"' },
      { letter: 'V', title: 'Voluntariness', desc: 'Decision made freely without coercion or undue influence.' },
      { letter: 'C', title: 'Capacity', desc: 'Patient can understand information, appreciate consequences, reason about options, and communicate a choice.' },
      { letter: 'D', title: 'Decision', desc: 'Patient makes and communicates a choice.' },
      { letter: 'D', title: 'Documentation', desc: 'Signed consent form, note in chart documenting discussion.' },
    ],
    extras: [
      'Exceptions to informed consent: emergency (implied consent), therapeutic privilege (rare), waiver (patient declines info)',
      'Minors: generally need parental consent. Exceptions: emancipated minors, emergencies, STIs, contraception, substance abuse, mental health (varies by state)',
      'Capacity ≠ competency (legal determination by court)',
      'Capacity can fluctuate — reassess as needed (delirium, medications, time of day)',
    ],
  },
];

export default function CommunicationSkillsView() {
  const [activeId, setActiveId] = useState(null);
  const active = COMM_FRAMEWORKS.find(f => f.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Communication Skills</h2>
        <p className="text-xs opacity-40 mt-0.5">SPIKES, motivational interviewing & consent</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div>
                <h2 className="font-black">{active.icon} {active.title}</h2>
                <p className="text-xs opacity-40">{active.description}</p>
              </div>
            </div>
            {active.steps.map((step, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex gap-4" style={{ border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>
                  {step.letter}
                </div>
                <div>
                  <h3 className="font-black">{step.title}</h3>
                  <p className="text-sm opacity-70 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
            {active.extras.length > 0 && (
              <div className="glass rounded-2xl p-5" style={{ background: '#10b98108', border: '1px solid #10b98120' }}>
                <h3 className="font-black text-sm mb-3" style={{ color: '#10b981' }}> Key Points</h3>
                {active.extras.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1">
                    <span className="shrink-0 mt-0.5" style={{ color: '#10b981' }}>▸</span>
                    <span className="opacity-70 leading-relaxed">{e}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMM_FRAMEWORKS.map(f => (
              <button key={f.id} onClick={() => setActiveId(f.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-black">{f.title}</h3>
                <p className="text-xs opacity-40 mt-1">{f.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
