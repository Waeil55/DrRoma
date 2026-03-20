const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const funcIdx = content.indexOf('function MedicinesView');
if (funcIdx < 0) { console.error('MedicinesView not found'); process.exit(1); }

const newComponents = `/* === SYMPTOMS EXPLORER VIEW === */
function SymptomsView({ settings }) {
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [quizState, setQuizState] = useState({ index: 0, revealed: false, selected: null });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const systems = ['All', ...Array.from(new Set(SYMPTOMS_DB_FULL.map(s => s.system || 'Other').filter(Boolean))).sort()];
  const filtered = SYMPTOMS_DB_FULL.filter(s => {
    const matchSystem = selectedSystem === 'All' || s.system === selectedSystem;
    const q = search.toLowerCase();
    return matchSystem && (!q || (s.symptom || s.name || '').toLowerCase().includes(q) || (s.aliases || []).some(a => a.toLowerCase().includes(q)));
  });

  const STABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'differentials', label: 'DDx', icon: GitBranch },
    { id: 'approach', label: 'Workup', icon: Clipboard },
    { id: 'questions', label: 'Questions', icon: CheckSquare },
  ];

  const resetQuiz = () => setQuizState({ index: 0, revealed: false, selected: null });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black">Symptom Analyzer</h1>
            <p className="text-xs opacity-50">{SYMPTOMS_DB_FULL.length} symptoms with full DDx + MCQs</p>
          </div>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setSelectedSymptom(null); }}
            placeholder="Search symptom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {systems.map(sys => (
            <button key={sys} onClick={() => { setSelectedSystem(sys); setSelectedSymptom(null); }}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: selectedSystem === sys ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)', border: \`1px solid \${selectedSystem === sys ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}\`, color: selectedSystem === sys ? '#f59e0b' : undefined }}>
              {sys}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {(!isMobile || !selectedSymptom) && (
          <div className={\`\${isMobile ? 'w-full' : 'w-72'} shrink-0 overflow-y-auto border-r\`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {filtered.length === 0 && <p className="text-center text-sm opacity-40 p-8">No symptoms found</p>}
            {filtered.map(sym => (
              <button key={sym.id} onClick={() => { setSelectedSymptom(sym); setActiveTab('overview'); resetQuiz(); }}
                className="w-full text-left p-3 border-b flex items-start gap-3 transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: selectedSymptom?.id === sym.id ? 'rgba(245,158,11,0.1)' : '' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Thermometer className="w-4 h-4" style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{sym.symptom || sym.name}</p>
                  <p className="text-xs opacity-50">{sym.system || ''}</p>
                  {sym.redFlags?.length > 0 && <span className="text-xs font-bold" style={{ color: '#ef4444' }}>⚠ {sym.redFlags.length} red flags</span>}
                </div>
              </button>
            ))}
          </div>
        )}
        {selectedSymptom && (
          <div className={\`flex-1 overflow-y-auto \${isMobile ? 'w-full' : ''}\`}>
            {isMobile && (
              <button onClick={() => setSelectedSymptom(null)} className="flex items-center gap-2 p-3 text-sm opacity-60">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="p-4">
              <h2 className="text-2xl font-black">{selectedSymptom.symptom || selectedSymptom.name}</h2>
              <p className="text-xs opacity-50 mt-1">{selectedSymptom.icd10 && \`ICD-10: \${selectedSymptom.icd10} · \`}{selectedSymptom.system}</p>
              {selectedSymptom.clinicalImportance && <p className="text-sm opacity-70 mt-2 leading-relaxed">{selectedSymptom.clinicalImportance}</p>}
              <div className="flex gap-1 mt-4 mb-4 overflow-x-auto hide-scrollbar">
                {STABS.map(t => (
                  <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'questions') resetQuiz(); }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: activeTab === t.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: \`1px solid \${activeTab === t.id ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}\`, color: activeTab === t.id ? '#f59e0b' : undefined }}>
                    <t.icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                ))}
              </div>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {selectedSymptom.redFlags?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>⚠ Red Flags</p>
                      {selectedSymptom.redFlags.map((f, i) => <div key={i} className="flex items-start gap-2 text-sm"><span className="text-red-400 shrink-0">•</span>{f}</div>)}
                    </div>
                  )}
                  {selectedSymptom.characterization && Object.entries(selectedSymptom.characterization).map(([key, val]) => (
                    <div key={key} className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
                      <p className="text-xs font-bold uppercase opacity-60 mb-2">{key}</p>
                      {typeof val === 'object' && !Array.isArray(val)
                        ? Object.entries(val).map(([k, v]) => <div key={k} className="flex gap-2 text-xs mb-1"><span className="font-semibold opacity-80">{k}:</span><span className="opacity-60">{v}</span></div>)
                        : <p className="text-xs opacity-70">{String(val)}</p>}
                    </div>
                  ))}
                  {selectedSymptom.mnemonics?.map((m, i) => (
                    <div key={i} className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(139,92,246,0.3)' }}>
                      <p className="text-sm font-black">{m.mnemonic}</p>
                      <p className="text-xs opacity-60 mt-1">{m.meaning}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'differentials' && selectedSymptom.differentials && (
                <div className="space-y-4">
                  {Object.entries(selectedSymptom.differentials).map(([urgency, items]) => {
                    const colors = { emergent: '#ef4444', urgent: '#f59e0b', nonUrgent: '#10b981' };
                    const color = colors[urgency] || '#6366f1';
                    return (
                      <div key={urgency} className="glass rounded-2xl p-4" style={{ border: \`1px solid \${color}40\` }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color }}>{urgency.replace(/([A-Z])/g, ' $1').trim()}</p>
                        {(items || []).map((item, i) => (
                          <div key={i} className="rounded-xl p-3 text-xs mb-2" style={{ background: \`\${color}0a\`, border: \`1px solid \${color}20\` }}>
                            <p className="font-bold text-sm mb-1">{item.condition}</p>
                            {item.features && <p className="opacity-70 mb-1"><span className="font-semibold">Features: </span>{item.features}</p>}
                            {item.test && <p className="opacity-70 mb-1"><span className="font-semibold">Test: </span>{item.test}</p>}
                            {item.management && <p className="opacity-70"><span className="font-semibold">Tx: </span>{item.management}</p>}
                            {item.mortality && <p style={{ color: '#ef4444' }} className="font-semibold mt-1">Mortality: {item.mortality}</p>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
              {activeTab === 'approach' && selectedSymptom.diagnosticApproach && (
                <div className="space-y-3">
                  {Object.entries(selectedSymptom.diagnosticApproach).map(([step, items]) => (
                    <div key={step} className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#6366f1' }}>{step.replace(/([A-Z])/g, ' $1').trim()}</p>
                      {Array.isArray(items) ? items.map((item, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span className="opacity-40">•</span>{item}</div>) : <p className="text-sm opacity-70">{String(items)}</p>}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'questions' && (() => {
                const qs = selectedSymptom.questions || [];
                if (qs.length === 0) return <p className="text-center text-sm opacity-40 p-8">No questions for this symptom yet.</p>;
                const q = qs[quizState.index % qs.length];
                const isCorrect = quizState.selected === q.correctAnswer;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>MCQ Bank</p>
                      <span className="text-xs opacity-50">{(quizState.index % qs.length) + 1} / {qs.length}</span>
                    </div>
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                      <p className="text-sm font-semibold leading-relaxed mb-4">{q.stem}</p>
                      <div className="space-y-2">
                        {q.choices?.map(ch => {
                          const isSel = quizState.selected === ch.id;
                          const isRight = ch.id === q.correctAnswer;
                          let bg = 'rgba(255,255,255,0.05)', bord = '1px solid rgba(255,255,255,0.1)';
                          if (quizState.revealed) {
                            if (isRight) { bg = 'rgba(16,185,129,0.15)'; bord = '1px solid rgba(16,185,129,0.5)'; }
                            else if (isSel) { bg = 'rgba(239,68,68,0.15)'; bord = '1px solid rgba(239,68,68,0.5)'; }
                          } else if (isSel) { bg = 'rgba(245,158,11,0.15)'; bord = '1px solid rgba(245,158,11,0.5)'; }
                          return (
                            <button key={ch.id} onClick={() => { if (!quizState.revealed) setQuizState(s => ({...s, selected: ch.id, revealed: true})); }}
                              className="w-full text-left rounded-xl p-3 text-sm" style={{ background: bg, border: bord }}>
                              <span className="font-bold mr-2">{ch.id}.</span>{ch.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {quizState.revealed && q.explanation && (
                      <div className="glass rounded-2xl p-4 text-sm" style={{ border: \`1px solid \${isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}\` }}>
                        <p className="font-bold mb-2" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                        <p className="opacity-90">{q.explanation.correct}</p>
                        {q.explanation.keyTakeaway && <p className="text-xs opacity-70 mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}><span className="font-bold">Key Takeaway: </span>{q.explanation.keyTakeaway}</p>}
                      </div>
                    )}
                    {quizState.revealed && (
                      <button onClick={() => setQuizState({ index: quizState.index + 1, revealed: false, selected: null })}
                        className="w-full rounded-xl py-2.5 text-sm font-bold" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}>
                        Next Question →
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {!selectedSymptom && !isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <Thermometer className="w-16 h-16 mb-4" />
            <p className="text-lg font-bold">Select a symptom</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* === COUNSELING & THERAPY EXPLORER VIEW === */
function CounselingTherapyView({ settings }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [quizState, setQuizState] = useState({ index: 0, revealed: false, selected: null });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const types = ['All', 'modality', 'condition'];
  const filtered = COUNSELING_THERAPY_DB.filter(entry => {
    const matchType = filterType === 'All' || entry.type === filterType;
    const q = search.toLowerCase();
    return matchType && (!q || entry.name.toLowerCase().includes(q) || (entry.founder || '').toLowerCase().includes(q) || (entry.conditions || []).some(c => c.toLowerCase().includes(q)));
  });

  const CTABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'techniques', label: 'Techniques', icon: Wand2 },
    { id: 'evidence', label: 'Evidence', icon: CheckCircle2 },
    { id: 'questions', label: 'Questions', icon: CheckSquare },
  ];

  const resetQuiz = () => setQuizState({ index: 0, revealed: false, selected: null });
  const typeColor = t => t === 'modality' ? '#6366f1' : '#f59e0b';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black">Counseling & Therapy</h1>
            <p className="text-xs opacity-50">{COUNSELING_THERAPY_DB.filter(e => e.type === 'modality').length} approaches · {COUNSELING_THERAPY_DB.filter(e => e.type === 'condition').length} conditions</p>
          </div>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
            placeholder="Search therapy, condition, founder..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex gap-2">
          {[['All','All'],['modality','Therapy'],['condition','Conditions']].map(([val,label]) => (
            <button key={val} onClick={() => { setFilterType(val); setSelected(null); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: filterType === val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: \`1px solid \${filterType === val ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}\`, color: filterType === val ? '#6366f1' : undefined }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {(!isMobile || !selected) && (
          <div className={\`\${isMobile ? 'w-full' : 'w-72'} shrink-0 overflow-y-auto border-r\`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {filtered.length === 0 && <p className="text-center text-sm opacity-40 p-8">No entries found</p>}
            {filtered.map(entry => (
              <button key={entry.id} onClick={() => { setSelected(entry); setActiveTab('overview'); resetQuiz(); }}
                className="w-full text-left p-3 border-b flex items-start gap-3 transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: selected?.id === entry.id ? 'rgba(99,102,241,0.1)' : '' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: \`\${typeColor(entry.type)}22\` }}>
                  {entry.type === 'modality' ? <Wand2 className="w-4 h-4" style={{ color: typeColor(entry.type) }} /> : <Brain className="w-4 h-4" style={{ color: typeColor(entry.type) }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">{entry.name}</p>
                  <p className="text-xs opacity-50 truncate">{entry.type === 'modality' ? (entry.founder || '') : (entry.icd10 || '')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className={\`flex-1 overflow-y-auto \${isMobile ? 'w-full' : ''}\`}>
            {isMobile && <button onClick={() => setSelected(null)} className="flex items-center gap-2 p-3 text-sm opacity-60"><ChevronLeft className="w-4 h-4" /> Back</button>}
            <div className="p-4">
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: \`\${typeColor(selected.type)}22\`, color: typeColor(selected.type) }}>{selected.type === 'modality' ? 'Therapy' : 'Condition'}</span>
              <h2 className="text-xl font-black mt-2">{selected.name}</h2>
              {selected.founder && <p className="text-xs opacity-50 mt-1">By: {selected.founder}</p>}
              {selected.theoreticalBasis && <p className="text-sm opacity-70 mt-2 leading-relaxed">{selected.theoreticalBasis}</p>}
              <div className="flex gap-1 mt-4 mb-4 overflow-x-auto hide-scrollbar">
                {CTABS.map(t => (
                  <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'questions') resetQuiz(); }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: activeTab === t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: \`1px solid \${activeTab === t.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}\`, color: activeTab === t.id ? '#6366f1' : undefined }}>
                    <t.icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                ))}
              </div>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {selected.coreAssumptions?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>Core Assumptions</p>
                      {selected.coreAssumptions.map((a, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span className="opacity-40">•</span>{a}</div>)}
                    </div>
                  )}
                  {selected.dsmCriteria && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>DSM-5 Criteria</p>
                      {selected.dsmCriteria.required && <p className="text-xs opacity-70 mb-2 italic">{selected.dsmCriteria.required}</p>}
                      {(selected.dsmCriteria.symptoms || []).map((s, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span className="opacity-40">•</span>{s}</div>)}
                    </div>
                  )}
                  {selected.keyFacts?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>Key Facts</p>
                      {selected.keyFacts.map((f, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span style={{ color: '#10b981' }}>✓</span>{f}</div>)}
                    </div>
                  )}
                  {selected.mnemonics?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(139,92,246,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#8b5cf6' }}>Mnemonics</p>
                      {selected.mnemonics.map((m, i) => <div key={i} className="mb-3"><p className="text-sm font-black">{m.mnemonic}</p><p className="text-xs opacity-60 mt-0.5">{m.meaning}</p></div>)}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'techniques' && (
                <div className="space-y-3">
                  {(selected.keyTechniques || selected.coreModules || selected.stagesOfChange || []).map((item, i) => (
                    <div key={i} className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                      <p className="font-bold text-sm">{item.name || item.stage}</p>
                      <p className="text-xs opacity-60 mt-1 leading-relaxed">{item.description || ''}</p>
                    </div>
                  ))}
                  {selected.cognitiveDistortions?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#ef4444' }}>Cognitive Distortions</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.cognitiveDistortions.map((d, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{d}</span>)}
                      </div>
                    </div>
                  )}
                  {selected.defenseMechanisms && Object.entries(selected.defenseMechanisms).map(([level, mechs]) => (
                    <div key={level} className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                      <p className="text-xs font-bold uppercase opacity-60 mb-2">{level}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mechs.map((m, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>{m}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  {selected.evidence && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>Evidence Base</p>
                      <p className="text-sm opacity-80">{selected.evidence}</p>
                      {selected.duration && <p className="text-xs opacity-50 mt-2">Duration: {selected.duration}</p>}
                    </div>
                  )}
                  {selected.conditions?.length > 0 && (
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>Indications</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.conditions.map((c, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>{c}</span>)}
                      </div>
                    </div>
                  )}
                  {selected.treatment && Object.entries(selected.treatment).map(([k, v]) => (
                    <div key={k} className="glass rounded-2xl p-3" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                      <p className="text-xs font-bold uppercase opacity-60 mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                      {Array.isArray(v) ? v.map((item, i) => <div key={i} className="flex items-start gap-2 text-xs mb-1"><span className="opacity-40">•</span>{item}</div>) : <p className="text-xs opacity-70">{typeof v === 'string' ? v : JSON.stringify(v)}</p>}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'questions' && (() => {
                const qs = selected.questions || [];
                if (qs.length === 0) return <p className="text-center text-sm opacity-40 p-8">No questions yet.</p>;
                const q = qs[quizState.index % qs.length];
                const isCorrect = quizState.selected === q.correctAnswer;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>MCQ Bank</p>
                      <span className="text-xs opacity-50">{(quizState.index % qs.length) + 1} / {qs.length}</span>
                    </div>
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                      <p className="text-sm font-semibold leading-relaxed mb-4">{q.stem}</p>
                      <div className="space-y-2">
                        {q.choices?.map(ch => {
                          const isSel = quizState.selected === ch.id;
                          const isRight = ch.id === q.correctAnswer;
                          let bg = 'rgba(255,255,255,0.05)', bord = '1px solid rgba(255,255,255,0.1)';
                          if (quizState.revealed) {
                            if (isRight) { bg = 'rgba(16,185,129,0.15)'; bord = '1px solid rgba(16,185,129,0.5)'; }
                            else if (isSel) { bg = 'rgba(239,68,68,0.15)'; bord = '1px solid rgba(239,68,68,0.5)'; }
                          } else if (isSel) { bg = 'rgba(99,102,241,0.15)'; bord = '1px solid rgba(99,102,241,0.5)'; }
                          return (
                            <button key={ch.id} onClick={() => { if (!quizState.revealed) setQuizState(s => ({...s, selected: ch.id, revealed: true})); }}
                              className="w-full text-left rounded-xl p-3 text-sm" style={{ background: bg, border: bord }}>
                              <span className="font-bold mr-2">{ch.id}.</span>{ch.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {quizState.revealed && q.explanation && (
                      <div className="glass rounded-2xl p-4 text-sm" style={{ border: \`1px solid \${isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}\` }}>
                        <p className="font-bold mb-2" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                        <p className="opacity-90">{q.explanation.correct}</p>
                        {q.explanation.keyTakeaway && <p className="text-xs opacity-70 mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}><span className="font-bold">Key Takeaway: </span>{q.explanation.keyTakeaway}</p>}
                      </div>
                    )}
                    {quizState.revealed && (
                      <button onClick={() => setQuizState({ index: quizState.index + 1, revealed: false, selected: null })}
                        className="w-full rounded-xl py-2.5 text-sm font-bold" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
                        Next Question →
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {!selected && !isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <Brain className="w-16 h-16 mb-4" />
            <p className="text-lg font-bold">Select an entry</p>
          </div>
        )}
      </div>
    </div>
  );
}

`;

const newContent = content.slice(0, funcIdx) + newComponents + content.slice(funcIdx);
fs.writeFileSync('src/App.jsx', newContent, 'utf8');
console.log('SUCCESS: inserted SymptomsView and CounselingTherapyView');
console.log('Insertion point:', funcIdx);
console.log('New file size (chars):', newContent.length);
