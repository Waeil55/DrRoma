import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const PSYCH_TOOLS = [
  { id: 'phq9', title: 'PHQ-9 (Depression)', icon: '😔', description: 'Patient Health Questionnaire-9',
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling/staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself—or that you are a failure',
      'Trouble concentrating on things',
      'Moving or speaking slowly, or being fidgety/restless',
      'Thoughts that you would be better off dead or hurting yourself',
    ],
    options: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    interpret: score => {
      if (score <= 4) return { severity: 'Minimal', color: '#10b981', action: 'Monitor, no treatment needed' };
      if (score <= 9) return { severity: 'Mild', color: '#f59e0b', action: 'Watchful waiting, repeat PHQ-9' };
      if (score <= 14) return { severity: 'Moderate', color: '#f97316', action: 'Consider counseling, pharmacotherapy' };
      if (score <= 19) return { severity: 'Moderately Severe', color: '#ef4444', action: 'Active treatment: pharmacotherapy +/- psychotherapy' };
      return { severity: 'Severe', color: '#dc2626', action: 'Immediate pharmacotherapy + psychotherapy, consider referral' };
    },
  },
  { id: 'gad7', title: 'GAD-7 (Anxiety)', icon: '😰', description: 'Generalized Anxiety Disorder-7',
    questions: [
      'Feeling nervous, anxious or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
    options: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    interpret: score => {
      if (score <= 4) return { severity: 'Minimal', color: '#10b981', action: 'Monitor' };
      if (score <= 9) return { severity: 'Mild', color: '#f59e0b', action: 'Watchful waiting' };
      if (score <= 14) return { severity: 'Moderate', color: '#f97316', action: 'Consider counseling, pharmacotherapy' };
      return { severity: 'Severe', color: '#ef4444', action: 'Active treatment recommended' };
    },
  },
  { id: 'cage', title: 'CAGE (Alcohol)', icon: '🍺', description: 'Cut-Annoyed-Guilty-Eye-opener',
    questions: [
      'Have you ever felt you should Cut down on your drinking?',
      'Have people Annoyed you by criticizing your drinking?',
      'Have you ever felt bad or Guilty about your drinking?',
      'Have you ever had a drink first thing in the morning (Eye-opener)?',
    ],
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 },
    ],
    interpret: score => {
      if (score === 0) return { severity: 'Low Risk', color: '#10b981', action: 'No concern' };
      if (score === 1) return { severity: 'Low Risk', color: '#f59e0b', action: 'Monitor' };
      if (score <= 3) return { severity: 'High Suspicion', color: '#f97316', action: 'Further evaluation for alcohol use disorder' };
      return { severity: 'Very High Suspicion', color: '#ef4444', action: 'Strongly suggestive of alcohol dependence' };
    },
  },
  { id: 'mdq', title: 'MDQ (Bipolar)', icon: '🎭', description: 'Mood Disorder Questionnaire',
    questions: [
      'Felt so good or hyper that others thought you were not your normal self',
      'Were so irritable that you shouted at people or started fights',
      'Felt much more self-confident than usual',
      'Got much less sleep than usual and found you didn\'t really miss it',
      'Were much more talkative or spoke faster than usual',
      'Thoughts raced through your head and couldn\'t slow your mind down',
      'Were so easily distracted that you had trouble concentrating',
      'Had much more energy than usual',
      'Were much more active or did many more things than usual',
      'Were much more social or outgoing than usual',
      'Were much more interested in sex than usual',
      'Did things that were unusual for you or others might think were excessive/risky',
      'Spending money got you or your family into trouble',
    ],
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 },
    ],
    interpret: score => {
      if (score < 7) return { severity: 'Negative Screen', color: '#10b981', action: 'Bipolar disorder unlikely based on this screen' };
      return { severity: 'Positive Screen', color: '#ef4444', action: 'Further evaluation for bipolar disorder recommended — screen is suggestive, NOT diagnostic' };
    },
  },
];

export default function PsychiatryScreeningView() {
  const [activeId, setActiveId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const tool = PSYCH_TOOLS.find(t => t.id === activeId);

  const handleAnswer = (qi, val) => {
    setAnswers(prev => ({ ...prev, [qi]: val }));
    setShowResult(false);
  };

  const totalScore = tool ? tool.questions.reduce((sum, _, qi) => sum + (answers[qi] ?? 0), 0) : 0;
  const maxScore = tool ? tool.questions.length * Math.max(...tool.options.map(o => o.value)) : 0;
  const result = tool && showResult ? tool.interpret(totalScore) : null;
  const allAnswered = tool ? tool.questions.every((_, qi) => answers[qi] !== undefined) : false;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🧠 Psychiatry Screening</h2>
        <p className="text-xs opacity-40 mt-0.5">Validated screening instruments</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {tool ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveId(null); setAnswers({}); setShowResult(false); }} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div>
                <h2 className="font-black">{tool.icon} {tool.title}</h2>
                <p className="text-xs opacity-40">{tool.description}</p>
              </div>
            </div>
            {tool.questions.map((q, qi) => (
              <div key={qi} className="glass rounded-2xl p-4" style={{ border: `1px solid ${answers[qi] !== undefined ? 'var(--accent)' : 'var(--border)'}` }}>
                <p className="text-sm font-bold mb-3">{qi + 1}. {q}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.options.map(opt => (
                    <button key={opt.value} onClick={() => handleAnswer(qi, opt.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                      style={answers[qi] === opt.value ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border)' }}>
                      {opt.label} ({opt.value})
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {allAnswered && !showResult && (
              <button onClick={() => setShowResult(true)}
                className="w-full py-3 rounded-2xl font-black text-white transition-all"
                style={{ background: 'var(--accent)' }}>
                Calculate Score
              </button>
            )}
            {result && (
              <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up" style={{ border: `2px solid ${result.color}` }}>
                <div className="text-center">
                  <div className="text-4xl font-black" style={{ color: result.color }}>{totalScore}/{maxScore}</div>
                  <div className="text-lg font-black mt-1" style={{ color: result.color }}>{result.severity}</div>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-sm opacity-70">{result.action}</p>
                </div>
                <p className="text-xs opacity-30 text-center">Screening tool only — not a diagnosis. Clinical correlation required.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PSYCH_TOOLS.map(t => (
              <button key={t.id} onClick={() => { setActiveId(t.id); setAnswers({}); setShowResult(false); }}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{t.icon}</div>
                <h3 className="font-black">{t.title}</h3>
                <p className="text-xs opacity-40 mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
