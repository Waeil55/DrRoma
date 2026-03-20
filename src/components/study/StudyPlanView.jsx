import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function StudyPlanView({ flashcards, exams, settings, addToast }) {
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(() => { try { return JSON.parse(localStorage.getItem('mariam_study_plan') || 'null'); } catch { return null; } });
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [weakSubjects, setWeakSubjects] = useState('');
  const [goalScore, setGoalScore] = useState(80);

  const generate = async () => {
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setGenerating(true);
    const deckSummary = flashcards.filter(f => !f.isBuiltin).map(f => `${f.title}: ${f.cards?.length || 0} cards`).join(', ');
    const examSummary = exams.filter(e => !e.isBuiltin).map(e => `${e.title} (last: ${e.lastScore ?? 'not attempted'}%)`).join(', ');
    const daysUntil = examDate ? Math.ceil((new Date(examDate) - new Date()) / 86400000) : 30;
    try {
      let out = '';
      await callAIStreaming(
        `Create a detailed, personalized ${daysUntil}-day medical study plan as JSON.

Context:
- Days until exam: ${daysUntil}
- Study hours per day: ${hoursPerDay}
- Target score: ${goalScore}%
- Flashcard decks: ${deckSummary || 'General medicine'}
- Exam performance: ${examSummary || 'Not attempted yet'}
- Weak subjects: ${weakSubjects || 'None specified'}

Return JSON with the exact shape:
{
  "overview": "2-sentence plan summary",
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation Review",
      "focus": "Top 3 subjects for this week",
      "days": [
        { "day": "Monday", "tasks": [{"subject": "Cardiology", "activity": "Review 30 flashcards", "duration": 45, "priority": "high"}] }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "milestones": [{"week": 2, "goal": "Complete all Cardiology cards", "metric": "100 cards reviewed"}]
}

Create ${Math.min(4, Math.ceil(daysUntil / 7))} weeks. Keep tasks realistic.`,
        chunk => { out += chunk; },
        settings, 2000
      );
      const jsonMatch = out.match(/\{[\s\S]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.generatedAt = Date.now();
        parsed.examDate = examDate;
        setPlan(parsed);
        localStorage.setItem('mariam_study_plan', JSON.stringify(parsed));
        addToast('Study plan generated ', 'success');
      } else throw new Error('Invalid JSON response');
    } catch (e) { addToast('Plan generation failed: ' + e.message, 'error'); }
    setGenerating(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-black text-xl flex items-center gap-2"> Study Plan</h2>
          {plan && <button onClick={() => { setPlan(null); localStorage.removeItem('mariam_study_plan'); }} className="text-xs opacity-40 hover:opacity-70">Clear</button>}
        </div>
        <p className="text-xs opacity-40">AI-powered personalized study schedule</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {!plan ? (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm opacity-70">Configure Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black opacity-50 uppercase tracking-widest block mb-2">Exam Date</label>
                  <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-black opacity-50 uppercase tracking-widest block mb-2">Target Score: {goalScore}%</label>
                  <input type="range" min={50} max={100} step={5} value={goalScore} onChange={e => setGoalScore(+e.target.value)}
                    className="w-full mt-3" />
                </div>
                <div>
                  <label className="text-xs font-black opacity-50 uppercase tracking-widest block mb-2">Hours / Day: {hoursPerDay}h</label>
                  <input type="range" min={1} max={12} step={0.5} value={hoursPerDay} onChange={e => setHoursPerDay(+e.target.value)}
                    className="w-full mt-3" />
                </div>
                <div>
                  <label className="text-xs font-black opacity-50 uppercase tracking-widest block mb-2">Weak Subjects</label>
                  <input value={weakSubjects} onChange={e => setWeakSubjects(e.target.value)}
                    placeholder="e.g. Cardiology, Pharmacology…"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <button onClick={generate} disabled={generating}
                className="btn-accent w-full py-3 rounded-xl font-black flex items-center justify-center gap-2">
                {generating ? <><Loader2 size={16} className="animate-spin" /> Generating Plan…</> : <><Sparkles size={16} /> Generate AI Study Plan</>}
              </button>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Your Decks</h3>
              <div className="space-y-2">
                {flashcards.filter(f => !f.isBuiltin).slice(0, 8).map(f => {
                  const due = f.cards?.filter(c => !c.nextReview || c.nextReview <= Date.now()).length || 0;
                  const total = f.cards?.length || 0;
                  const pct = total > 0 ? Math.round((f.cards?.filter(c => c.lastReview).length / total) * 100) : 0;
                  return (
                    <div key={f.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-bold truncate">{f.title}</span>
                          <span className="text-xs opacity-40 shrink-0">{due} due</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : 'var(--accent)', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                      <span className="text-xs font-black w-8 text-right" style={{ color: 'var(--accent)' }}>{pct}%</span>
                    </div>
                  );
                })}
                {flashcards.filter(f => !f.isBuiltin).length === 0 && <p className="text-xs opacity-40">No custom decks yet — upload documents to create them.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview */}
            <div className="glass rounded-2xl p-5 relative overflow-hidden" style={{ border: '1px solid var(--accent)/30' }}>
              <div className="bg-mesh absolute inset-0 opacity-10" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-black"> Your Study Plan</h3>
                    {plan.examDate && <p className="text-xs opacity-40 mt-0.5">Exam: {new Date(plan.examDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>}
                  </div>
                  <button onClick={generate} disabled={generating} className="glass px-3 py-1.5 rounded-xl text-xs font-black shrink-0" style={{ color: 'var(--accent)' }}>
                    {generating ? <Loader2 size={12} className="animate-spin" /> : '↺ Regenerate'}
                  </button>
                </div>
                <p className="text-sm opacity-70 leading-relaxed">{plan.overview}</p>
              </div>
            </div>

            {/* Milestones */}
            {plan.milestones?.length > 0 && (
              <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Milestones</h3>
                <div className="space-y-2">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--surface,var(--card))' }}>
                      <div className="w-8 h-8 rounded-xl btn-accent flex items-center justify-center text-xs font-black shrink-0">W{m.week}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{m.goal}</p>
                        <p className="text-xs opacity-40">{m.metric}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week-by-week */}
            {plan.weeks?.map(week => (
              <div key={week.week} className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-4" style={{ background: 'var(--accent)/08', borderBottom: '1px solid var(--border)' }}>
                  <h3 className="font-black">Week {week.week}: {week.theme}</h3>
                  <p className="text-xs opacity-50 mt-0.5">Focus: {week.focus}</p>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {week.days?.map((day, di) => (
                    <div key={di} className="px-5 py-3">
                      <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">{day.day}</div>
                      <div className="space-y-1.5">
                        {day.tasks?.map((task, ti) => (
                          <div key={ti} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: 'var(--surface,var(--card))' }}>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIORITY_COLORS[task.priority] || '#6366f1' }} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold">{task.subject}</span>
                              <span className="text-xs opacity-50 ml-2">{task.activity}</span>
                            </div>
                            <span className="text-xs opacity-40 shrink-0">{task.duration} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Tips */}
            {plan.tips?.length > 0 && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Study Tips</h3>
                <div className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span style={{ color: 'var(--accent)' }}></span>
                      <span className="opacity-70 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
