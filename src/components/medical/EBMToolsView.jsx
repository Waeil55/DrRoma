import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

export default function EBMToolsView({ settings, addToast }) {
  const [tab, setTab] = useState('nnt'); // nnt | pico | appraise
  const [nntForm, setNntForm] = useState({ cer: '', eer: '' });
  const [nntResult, setNntResult] = useState(null);
  const [picoForm, setPicoForm] = useState({ p: '', i: '', c: '', o: '' });
  const [picoResult, setPicoResult] = useState('');
  const [picoLoading, setPicoLoading] = useState(false);
  const [appraiseStudy, setAppraiseStudy] = useState('');
  const [appraiseResult, setAppraiseResult] = useState('');
  const [appraiseLoading, setAppraiseLoading] = useState(false);

  const calcNNT = () => {
    const cer = parseFloat(nntForm.cer) / 100;
    const eer = parseFloat(nntForm.eer) / 100;
    if (isNaN(cer) || isNaN(eer) || cer === eer) { setNntResult(null); return; }
    const arr = Math.abs(cer - eer);
    const nnt = Math.ceil(1 / arr);
    const rr = eer / cer;
    const rrr = Math.abs(1 - rr);
    setNntResult({
      arr: (arr * 100).toFixed(1) + '%',
      nnt,
      rr: rr.toFixed(2),
      rrr: (rrr * 100).toFixed(1) + '%',
      benefit: eer < cer,
    });
  };

  const generatePICO = async () => {
    if (!picoForm.p.trim()) { addToast('Fill in the Patient/Population field', 'warn'); return; }
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setPicoLoading(true); setPicoResult('');
    try {
      await callAIStreaming(
        `Using the PICO framework, formulate a clinical question and suggest search strategy.
P (Patient/Population): ${picoForm.p}
I (Intervention): ${picoForm.i || 'Not specified'}
C (Comparison): ${picoForm.c || 'Standard of care'}
O (Outcome): ${picoForm.o || 'Not specified'}

Provide:
1. Well-formed clinical question
2. Search strategy (MeSH terms, Boolean operators)
3. Study type to look for (RCT, cohort, etc.)
4. Key databases to search
5. 2-3 example studies that might answer this question

Keep response concise (200 words).`,
        chunk => { setPicoResult(p => p + chunk); },
        settings, 400
      );
    } catch (e) { addToast('PICO generation failed', 'error'); }
    setPicoLoading(false);
  };

  const appraiseStudyFn = async () => {
    if (!appraiseStudy.trim()) return;
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setAppraiseLoading(true); setAppraiseResult('');
    try {
      await callAIStreaming(
        `Critically appraise this clinical study abstract/description:

"${appraiseStudy}"

Evaluate using CASP (Critical Appraisal Skills Programme) criteria:
1. Study design validity
2. Risk of bias assessment
3. Sample size adequacy
4. Statistical significance vs clinical significance
5. Confounders and limitations
6. Generalizability (external validity)
7. Overall level of evidence (Oxford CEBM)
8. Bottom line: Is this evidence strong enough to change practice?

Keep response under 300 words. Be balanced — note strengths AND weaknesses.`,
        chunk => { setAppraiseResult(p => p + chunk); },
        settings, 500
      );
    } catch (e) { addToast('Appraisal failed', 'error'); }
    setAppraiseLoading(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">📊 EBM Tools</h2>
        <div className="flex gap-2 mt-3">
          {[['nnt', 'NNT Calculator'], ['pico', 'PICO Builder'], ['appraise', 'Study Appraisal']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
              style={tab === id ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {tab === 'nnt' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Number Needed to Treat (NNT)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black opacity-40 block mb-2">Control Event Rate (%)</label>
                  <input type="number" value={nntForm.cer} onChange={e => setNntForm(p => ({ ...p, cer: e.target.value }))}
                    placeholder="e.g. 20" className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                  <p className="text-xs opacity-30 mt-1">Event rate in placebo/control group</p>
                </div>
                <div>
                  <label className="text-xs font-black opacity-40 block mb-2">Experimental Event Rate (%)</label>
                  <input type="number" value={nntForm.eer} onChange={e => setNntForm(p => ({ ...p, eer: e.target.value }))}
                    placeholder="e.g. 15" className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                  <p className="text-xs opacity-30 mt-1">Event rate in treatment group</p>
                </div>
              </div>
              <button onClick={calcNNT} className="btn-accent w-full py-3 rounded-xl font-black">Calculate</button>
            </div>
            {nntResult && (
              <div className="glass rounded-2xl p-6 text-center animate-scale-in" style={{ border: '1px solid var(--accent)/30' }}>
                <div className="text-4xl font-black mb-2" style={{ color: 'var(--accent)' }}>NNT = {nntResult.nnt}</div>
                <p className="text-sm opacity-60 mb-4">
                  {nntResult.benefit
                    ? `Treat ${nntResult.nnt} patients to prevent 1 additional event`
                    : `${nntResult.nnt} patients treated per 1 additional harm (NNH)`}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-lg font-black" style={{ color: '#10b981' }}>{nntResult.arr}</div>
                    <div className="text-xs opacity-40">ARR</div>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-lg font-black" style={{ color: '#3b82f6' }}>{nntResult.rr}</div>
                    <div className="text-xs opacity-40">RR</div>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-lg font-black" style={{ color: '#8b5cf6' }}>{nntResult.rrr}</div>
                    <div className="text-xs opacity-40">RRR</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'pico' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">PICO Framework</h3>
              {[
                { key: 'p', label: 'P — Patient / Population', placeholder: 'e.g. Adult patients with type 2 diabetes' },
                { key: 'i', label: 'I — Intervention', placeholder: 'e.g. SGLT2 inhibitors' },
                { key: 'c', label: 'C — Comparison', placeholder: 'e.g. Metformin alone' },
                { key: 'o', label: 'O — Outcome', placeholder: 'e.g. HbA1c reduction, CV events' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-black opacity-50 block mb-1">{f.label}</label>
                  <input value={picoForm[f.key]} onChange={e => setPicoForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                </div>
              ))}
              <button onClick={generatePICO} disabled={picoLoading}
                className="btn-accent w-full py-3 rounded-xl font-black flex items-center justify-center gap-2">
                {picoLoading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Build PICO Question</>}
              </button>
            </div>
            {picoResult && (
              <div className="glass rounded-2xl p-5 animate-fade-in-up" style={{ border: '1px solid var(--border)' }}>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{picoResult}</p>
              </div>
            )}
          </>
        )}

        {tab === 'appraise' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Critical Appraisal</h3>
              <textarea value={appraiseStudy} onChange={e => setAppraiseStudy(e.target.value)}
                rows={6} placeholder="Paste a study abstract or describe the study design, methods, results, and conclusions…"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ border: '1px solid var(--border)' }} />
              <button onClick={appraiseStudyFn} disabled={appraiseLoading || !appraiseStudy.trim()}
                className="btn-accent w-full py-3 rounded-xl font-black flex items-center justify-center gap-2">
                {appraiseLoading ? <><Loader2 size={16} className="animate-spin" /> Appraising…</> : <><Sparkles size={16} /> Appraise Study</>}
              </button>
            </div>
            {appraiseResult && (
              <div className="glass rounded-2xl p-5 animate-fade-in-up" style={{ border: '1px solid var(--border)' }}>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{appraiseResult}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
