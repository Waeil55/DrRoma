import { useState } from 'react';

const IMAGE_QUIZ_QUESTIONS = [
  { id: 1, desc: 'A 45-year-old woman presents with a "butterfly-shaped" erythematous rash across both cheeks and the bridge of the nose, sparing the nasolabial folds. She also reports joint pain and fatigue.',
    finding: 'Malar (butterfly) rash', diagnosis: 'Systemic Lupus Erythematosus (SLE)',
    explanation: 'The malar rash is a hallmark of SLE, present in ~50% of patients. It spares the nasolabial folds (differentiating from rosacea). Check ANA (sensitive) and anti-dsDNA (specific). Also assess for renal involvement (proteinuria).',
    category: 'Dermatology' },
  { id: 2, desc: 'A 22-year-old male presents with a well-circumscribed, annular pink plaque with raised borders and central clearing on his trunk. He noticed a larger "herald patch" appeared a week before multiple smaller lesions in a "Christmas tree" distribution.',
    finding: 'Herald patch + secondary eruption in Christmas tree distribution', diagnosis: 'Pityriasis Rosea',
    explanation: 'Self-limiting condition (6-8 weeks). Herald patch precedes generalized eruption by 1-2 weeks. Distribution follows skin tension lines (Langer lines) = "Christmas tree" on back. Treatment: supportive, UV light may help.',
    category: 'Dermatology' },
  { id: 3, desc: 'A 65-year-old man on warfarin presents with painful purple discoloration of his toes bilaterally. Pulses are palpable. He recently underwent cardiac catheterization.',
    finding: 'Blue/purple toes with palpable pulses (post-catheterization)', diagnosis: 'Cholesterol Crystal Embolism (Trash Foot / Blue Toe Syndrome)',
    explanation: 'Atherosclerotic plaque disruption during catheterization showers cholesterol crystals to distal arteries. Palpable pulses distinguish from thrombotic occlusion. May see livedo reticularis, eosinophilia,  ESR. Treatment: supportive, statins.',
    category: 'Vascular' },
  { id: 4, desc: 'A 70-year-old presents with sudden onset of painless, complete vision loss in the right eye described as "a curtain coming down." Fundoscopy shows a pale retina with a "cherry red spot" at the macula.',
    finding: 'Pale retina with cherry red spot', diagnosis: 'Central Retinal Artery Occlusion (CRAO)',
    explanation: 'Embolic occlusion of central retinal artery. Cherry red spot = fovea (thin retina, choroidal vessels visible) against pale infarcted retina. Ophthalmologic emergency  treatment within 90 min: ocular massage, paracentesis, thrombolytics. Check carotids (embolic source).',
    category: 'Ophthalmology' },
  { id: 5, desc: 'A 35-year-old male presents with tender red nodules on his shins bilaterally. He has had a persistent cough for 3 weeks. CXR shows bilateral hilar lymphadenopathy.',
    finding: 'Tender pretibial nodules + bilateral hilar lymphadenopathy', diagnosis: 'Erythema Nodosum (likely Sarcoidosis  Lfgren Syndrome)',
    explanation: 'Lfgren syndrome = classic triad: bilateral hilar lymphadenopathy + erythema nodosum + polyarthralgia/fever. Acute presentation of sarcoidosis with good prognosis. EN is also seen with strep, TB, IBD, oral contraceptives, sulfonamides.',
    category: 'Rheumatology' },
  { id: 6, desc: 'A 50-year-old woman presents with progressive symmetric thickening and tightening of the skin on her fingers (sclerodactyly) and face. She has Raynaud phenomenon and telangiectasias on her face.',
    finding: 'Sclerodactyly + Raynaud + facial skin tightening + telangiectasia', diagnosis: 'Systemic Sclerosis (Scleroderma)  Limited (CREST)',
    explanation: 'CREST: Calcinosis, Raynaud, Esophageal dysmotility, Sclerodactyly, Telangiectasia. Anti-centromere antibody positive. Diffuse type: anti-Scl-70 (topoisomerase), worse prognosis, pulmonary fibrosis, renal crisis.',
    category: 'Rheumatology' },
  { id: 7, desc: 'A 28-year-old presents with a painless, hard, irregular lump in the anterior neck that moves with swallowing. Labs show normal TSH. Ultrasound shows a hypervascular solid nodule with microcalcifications.',
    finding: 'Solid thyroid nodule with microcalcifications, hypervascular', diagnosis: 'Papillary Thyroid Carcinoma (most likely)',
    explanation: 'Most common thyroid cancer (80%). Microcalcifications (psammoma bodies) and irregular borders on US are concerning. FNA biopsy  Bethesda classification. Psammoma bodies also seen in serous ovarian cystadenocarcinoma, meningioma, mesothelioma.',
    category: 'Endocrinology' },
  { id: 8, desc: 'A 3-year-old child presents with a large, firm abdominal mass crossing the midline. CT shows a mass arising from the adrenal gland with calcifications and encasement of major vessels.',
    finding: 'Adrenal mass crossing midline in a child', diagnosis: 'Neuroblastoma',
    explanation: 'Most common extracranial solid tumor in children. Arises from neural crest cells (adrenal medulla most common). CROSSES MIDLINE (vs Wilms tumor which does NOT).  homovanillic acid (HVA) and vanillylmandelic acid (VMA) in urine. Prognosis varies by age and MYCN amplification.',
    category: 'Pediatrics' },
];

export default function ImageQuizView() {
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [guess, setGuess] = useState('');
  const q = IMAGE_QUIZ_QUESTIONS[current];

  const checkAnswer = () => {
    const isCorrect = guess.toLowerCase().includes(q.diagnosis.split('(')[0].trim().toLowerCase().split(' ').slice(0, 2).join(' '));
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setShowAnswer(true);
  };

  const nextQ = () => {
    setCurrent(c => (c + 1) % IMAGE_QUIZ_QUESTIONS.length);
    setShowAnswer(false);
    setGuess('');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl flex items-center gap-2"> Clinical Vignette Quiz</h2>
          <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>{score.correct}/{score.total}</span>
        </div>
        <p className="text-xs opacity-40 mt-0.5">Visual diagnosis from clinical descriptions</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-40">Question {current + 1} of {IMAGE_QUIZ_QUESTIONS.length}</span>
          <span className="px-2 py-0.5 rounded-lg text-xs font-black" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>{q.category}</span>
        </div>

        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3"> Clinical Vignette</h3>
          <p className="text-sm opacity-80 leading-relaxed">{q.desc}</p>
        </div>

        {!showAnswer ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black opacity-40 block mb-2">Your Diagnosis</label>
              <input value={guess} onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guess.trim() && checkAnswer()}
                placeholder="Type your diagnosis"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid var(--border)' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={checkAnswer} disabled={!guess.trim()}
                className="btn-accent flex-1 py-3 rounded-xl font-black">Submit Answer</button>
              <button onClick={() => setShowAnswer(true)}
                className="glass px-4 py-3 rounded-xl font-black text-sm" style={{ border: '1px solid var(--border)' }}>Show Answer</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ background: '#10b98108', border: '1px solid #10b98130' }}>
              <h3 className="font-black text-sm mb-1" style={{ color: '#10b981' }}> Key Finding</h3>
              <p className="text-sm opacity-80">{q.finding}</p>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--accent)/30' }}>
              <h3 className="font-black text-sm mb-1" style={{ color: 'var(--accent)' }}> Diagnosis</h3>
              <p className="text-lg font-black">{q.diagnosis}</p>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-2"> Explanation</h3>
              <p className="text-sm opacity-70 leading-relaxed">{q.explanation}</p>
            </div>
            <button onClick={nextQ} className="btn-accent w-full py-3 rounded-xl font-black">
              Next Question 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
