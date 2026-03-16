import { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const OSCE_STATIONS = [
  { id: 'abdominal_exam', title: 'Abdominal Examination', cat: 'Clinical Exam', time: '8 min',
    steps: [
      { phase: 'Introduction', items: ['Wash hands / gel', 'Introduce yourself, confirm patient identity', 'Explain examination, obtain consent', 'Position: supine, 1 pillow, arms by sides', 'Expose abdomen (xiphoid to symphysis pubis)'] },
      { phase: 'Inspection', items: ['Shape: flat, distended, scaphoid', 'Skin: scars (draw in mind — Kocher, Lanz, midline, laparoscopic ports)', 'Visible masses, pulsations (AAA)', 'Symmetry, hernias (cough impulse)', 'Stoma: type and location if present'] },
      { phase: 'Palpation', items: ['Ask about pain first — palpate painful area LAST', 'Light palpation all 9 regions systematically', 'Deep palpation: masses, tenderness, guarding, rigidity', 'Liver: start from RIF, palpate on inspiration, quantify finger-breadths below costal margin', 'Spleen: start from RIF, move to LUQ on inspiration (Traube space percussion)', 'Kidneys: bimanual ballot — ballotable = renal mass', 'Aorta: width above umbilicus (>3 cm = aneurysm)'] },
      { phase: 'Percussion', items: ['All 9 regions', 'Liver span (6-12 cm in MCL)', 'Shifting dullness (ascites): percuss from midline laterally until dull, ask patient to roll, wait 10 sec, re-percuss', 'Spleen: Traube space (resonance lost = splenomegaly)'] },
      { phase: 'Auscultation', items: ['Bowel sounds (listen for 30 sec before saying absent)', 'Bruits: aortic (epigastric), renal (flanks), iliac/femoral', 'Succussion splash (gastric outlet obstruction — if indicated)'] },
      { phase: 'Completion', items: ['Thank patient, cover them', 'State: "To complete my examination I would examine the hernial orifices, external genitalia, perform a DRE, and dipstick the urine"', 'Summarize findings to examiner'] },
    ]},
  { id: 'respiratory_exam', title: 'Respiratory Examination', cat: 'Clinical Exam', time: '8 min',
    steps: [
      { phase: 'Introduction', items: ['Wash hands', 'Introduce, identity, consent', 'Position: sitting at 45°, adequate exposure'] },
      { phase: 'General Inspection', items: ['End of bed: respiratory distress, accessory muscle use, O₂, nebulizer, inhalers, sputum pot', 'Hands: clubbing, tar staining, CO₂ retention flap (asterixis)', 'Pulse: rate, bounding (CO₂ retention)', 'Face: central cyanosis (tongue), Horner syndrome (Pancoast tumor)', 'Neck: JVP, tracheal position (2 finger-breadths in suprasternal notch), lymphadenopathy'] },
      { phase: 'Anterior Chest', items: ['Inspect: scars, deformity (barrel chest, pectus), chest wall movement', 'Palpate: apex beat, chest expansion (≥5 cm normal)', 'Percussion: compare both sides systematically', 'Auscultation: vesicular vs bronchial breathing, added sounds (crackles, wheeze, rub)'] },
      { phase: 'Posterior Chest', items: ['Inspect: scars, kyphosis/scoliosis', 'Palpate: chest expansion posteriorly', 'Percussion: compare both sides, include axillae', 'Auscultation: breath sounds, vocal resonance ("99")'] },
      { phase: 'Completion', items: ['Peripheral O₂ saturation', '"I would like to check the sputum pot, perform peak flow, review CXR and ABG"', 'Thank patient, summarize'] },
    ]},
  { id: 'cardio_exam', title: 'Cardiovascular Examination', cat: 'Clinical Exam', time: '8 min',
    steps: [
      { phase: 'Introduction', items: ['Wash hands', 'Introduce, identity, consent', 'Position: 45°, expose chest'] },
      { phase: 'General Inspection', items: ['End of bed: comfort, breathlessness, scars (sternotomy)', 'Hands: clubbing, splinter hemorrhages, Osler nodes, Janeway lesions, tendon xanthomata', 'Radial pulse: rate, rhythm, radio-radial delay', 'Blood pressure (both arms if aortic dissection suspected)', 'Face: malar flush (mitral stenosis), pallor, xanthelasma', 'JVP: height (>4 cm above sternal angle = elevated), waveform (giant V waves = TR)'] },
      { phase: 'Praecordium', items: ['Inspect: scars, visible pulsations, deformities', 'Palpate: apex beat (5th ICS MCL) — character: tapping (MS), heaving (LVH), displaced (dilated LV)', 'Parasternal heave (RVH)', 'Thrills (palpable murmur) — aortic, pulmonary, mitral areas'] },
      { phase: 'Auscultation', items: ['Bell (low-pitched) + Diaphragm (high-pitched)', 'Aortic area (R 2nd ICS): aortic stenosis (ejection systolic, radiates to carotids)', 'Pulmonary area (L 2nd ICS): pulmonary stenosis, S2 splitting', 'Tricuspid area (L lower sternal edge)', 'Mitral area (apex): mitral regurgitation (pansystolic), mitral stenosis (low-pitched rumble)', 'Extra sounds: S3 (heart failure), S4 (stiff ventricle)', 'Sit forward: aortic regurgitation (early diastolic murmur, expiration)', 'Left lateral: mitral stenosis (mid-diastolic rumble, bell at apex)'] },
      { phase: 'Completion', items: ['Auscultate lung bases (pulmonary edema)', 'Check peripheral edema (sacral, ankles)', '"Complete with ECG, CXR, echocardiogram"', 'Thank patient, summarize'] },
    ]},
  { id: 'neuro_upper', title: 'Upper Limb Neurological Exam', cat: 'Clinical Exam', time: '8 min',
    steps: [
      { phase: 'Introduction', items: ['Wash hands', 'Introduce, identity, consent', 'Position: sitting, arms exposed'] },
      { phase: 'Inspection', items: ['Wasting (thenar, hypothenar, small muscles, forearm)', 'Fasciculations (LMN sign)', 'Scars, deformity (ulnar claw, wrist drop)'] },
      { phase: 'Tone', items: ['Relax arm — passively move wrist, elbow, shoulder', 'Assess for spasticity (clasp-knife) vs rigidity (lead-pipe)', 'Cogwheel rigidity = rigidity + tremor (Parkinsonism)'] },
      { phase: 'Power', items: ['Shoulder abduction (C5, deltoid)', 'Elbow flexion (C5/6, biceps)', 'Elbow extension (C7, triceps)', 'Wrist extension (C6/7, extensor carpi radialis)', 'Finger extension (C7, extensor digitorum)', 'Finger abduction (T1, dorsal interossei, ulnar nerve)', 'Thumb opposition (median nerve, opponens pollicis)', 'MRC scale: 0-5'] },
      { phase: 'Reflexes', items: ['Biceps (C5/6)', 'Triceps (C7)', 'Supinator (C6)', 'Finger jerks (C8)', 'Grade: 0 absent, 1+ diminished, 2+ normal, 3+ brisk, 4+ clonus'] },
      { phase: 'Sensation', items: ['Light touch: cotton wool (compare sides, dermatomes)', 'Pin-prick: neurotip', 'Proprioception: DIP of index finger', 'Vibration: 128 Hz tuning fork on DIP → wrist → elbow'] },
      { phase: 'Coordination', items: ['Finger-nose test (intention tremor, past-pointing = cerebellar)', 'Dysdiadochokinesia (rapid alternating movements)', 'Fine motor: undo buttons'] },
      { phase: 'Completion', items: ['Check for Hoffmann sign (UMN)', '"Complete with lower limb examination, cranial nerves"', 'Summarize: UMN vs LMN pattern'] },
    ]},
];

export default function OSCEPrepView({ settings, addToast }) {
  const [activeId, setActiveId] = useState(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const active = OSCE_STATIONS.find(s => s.id === activeId);

  const startAIExaminer = async () => {
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setAiMode(true);
    setAiChat([{ role: 'examiner', text: `Welcome to OSCE Station: ${active.title}. You have ${active.time}. I am your examiner. Please begin by introducing yourself to the patient and starting your examination. I will observe and give you a scenario.` }]);
  };

  const sendAiMsg = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const newChat = [...aiChat, { role: 'student', text: aiInput }];
    setAiChat(newChat); setAiInput(''); setAiLoading(true);

    const chatHistory = newChat.map(m => `${m.role === 'examiner' ? 'Examiner' : 'Student'}: ${m.text}`).join('\n');
    let response = '';
    try {
      await callAIStreaming(
        `You are an OSCE examiner for the station "${active.title}". 
You are examining a medical student. Be realistic and professional.
Respond to what the student says/does. Give brief examiner observations, findings when they examine correctly, or redirect if they miss important steps.
If they ask a question, answer as the patient/examiner appropriately.
Keep responses under 80 words.

Conversation so far:
${chatHistory}

Examiner response:`,
        chunk => { response += chunk; },
        settings, 150
      );
      setAiChat(c => [...c, { role: 'examiner', text: response }]);
    } catch { addToast('AI error', 'error'); }
    setAiLoading(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🩺 OSCE Prep</h2>
        <p className="text-xs opacity-40 mt-0.5">Practice clinical examination stations</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveId(null); setAiMode(false); setAiChat([]); }} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div className="flex-1">
                <h2 className="font-black">{active.title}</h2>
                <p className="text-xs opacity-40">{active.cat} · {active.time}</p>
              </div>
              {!aiMode && (
                <button onClick={startAIExaminer} className="glass px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1" style={{ border: '1px solid var(--accent)/30', color: 'var(--accent)' }}>
                  <Sparkles size={12} /> AI Examiner
                </button>
              )}
            </div>

            {aiMode ? (
              <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid var(--border)', minHeight: 400 }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {aiChat.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div className="rounded-2xl px-4 py-2.5 max-w-[80%] text-sm" style={{
                        background: m.role === 'student' ? 'var(--accent)' : 'var(--surface,var(--card))',
                        color: m.role === 'student' ? '#fff' : 'inherit',
                        border: m.role === 'examiner' ? '1px solid var(--border)' : 'none'
                      }}>
                        <span className="text-xs font-black opacity-50 block mb-1">{m.role === 'examiner' ? '🩺 Examiner' : '🧑‍⚕️ You'}</span>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && <div className="flex justify-start"><div className="glass rounded-2xl px-4 py-2 text-sm opacity-50">Examiner is observing…</div></div>}
                </div>
                <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAiMsg()}
                    placeholder="Describe what you're doing / respond to examiner…"
                    className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                  <button onClick={sendAiMsg} disabled={aiLoading} className="btn-accent px-4 rounded-xl font-black text-sm">
                    {aiLoading ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            ) : (
              active.steps.map((phase, pi) => (
                <div key={pi} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="font-black text-sm flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--accent)', color: '#fff' }}>{pi + 1}</span>
                    {phase.phase}
                  </h3>
                  <div className="space-y-1.5">
                    {phase.items.map((item, ii) => (
                      <div key={ii} className="flex items-start gap-2 text-xs py-0.5">
                        <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>▫</span>
                        <span className="opacity-70 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          OSCE_STATIONS.map(s => (
            <button key={s.id} onClick={() => setActiveId(s.id)}
              className="w-full glass rounded-2xl p-5 text-left transition-all card-hover"
              style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black">{s.title}</h3>
              <p className="text-xs opacity-40 mt-1">{s.cat} · {s.time} · {s.steps.length} phases</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
