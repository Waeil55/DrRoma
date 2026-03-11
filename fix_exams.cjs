// Fix all exam wrong answers across drugData.js, lawData.js, Counseling.js
// Also adds Medical Sciences exams to Diseases.js
const fs = require('fs');
const path = require('path');

// ─── DRUG EXAMS ──────────────────────────────────────────────────────────────
// Each exam question has the correct answer as option[0] (the full drug info).
// We need 3 plausible wrong answers — real drug info from other drugs in the set.
// Strategy: extract all correct answers, then for each question pick 3 others at random (seeded by index).

function fixDrugExams() {
  const filePath = path.join(__dirname, 'src', 'drugData.js');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all correct answers (option[0]) from the exam section
  const correctAnswers = [];
  const correctRegex = /"options":\s*\[\s*"([\s\S]*?)(?<!\\)",/g;
  let m;
  while ((m = correctRegex.exec(content)) !== null) {
    correctAnswers.push(m[1]);
  }

  // For each exam question, replace the 3 wrong options with real answers from other drugs
  let newContent = content;
  let questionIndex = 0;

  const wrongOptRegex = /"options":\s*\[\s*("[\s\S]*?(?<!\\)")\s*,\s*"Incorrect Option A"\s*,\s*"Incorrect Option B"\s*,\s*"Incorrect Option C"\s*\]/g;

  newContent = newContent.replace(wrongOptRegex, (match, correctOpt) => {
    // Pick 3 other answers that are different from the current correct one
    const pool = correctAnswers.filter((a, i) => i !== questionIndex);
    // Deterministic selection using question index
    const i1 = (questionIndex * 7 + 1) % pool.length;
    const i2 = (questionIndex * 11 + 5) % pool.length;
    const i3 = (questionIndex * 13 + 9) % pool.length;

    // Make sure they're all different
    const w1 = pool[i1];
    const w2 = pool[i2 === i1 ? (i2 + 1) % pool.length : i2];
    const w3 = pool[i3 === i1 || i3 === i2 ? (i3 + 2) % pool.length : i3];

    questionIndex++;
    return `"options": [\n      ${correctOpt},\n      ${JSON.stringify(w1)},\n      ${JSON.stringify(w2)},\n      ${JSON.stringify(w3)}\n    ]`;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Drug exams fixed: ${questionIndex} questions`);
}

// ─── LAW EXAMS ───────────────────────────────────────────────────────────────
function fixLawExams() {
  const filePath = path.join(__dirname, 'src', 'lawData.js');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all law exam correct answers
  const correctAnswers = [];
  const correctRegex = /"options":\s*\[\s*"([\s\S]*?)(?<!\\)",/g;
  let m;
  while ((m = correctRegex.exec(content)) !== null) {
    correctAnswers.push(m[1]);
  }

  let newContent = content;
  let questionIndex = 0;

  const wrongOptRegex = /"options":\s*\[\s*("[\s\S]*?(?<!\\)")\s*,\s*"Incorrect Option A"\s*,\s*"Incorrect Option B"\s*,\s*"Incorrect Option C"\s*\]/g;

  newContent = newContent.replace(wrongOptRegex, (match, correctOpt) => {
    const pool = correctAnswers.filter((a, i) => i !== questionIndex);
    const i1 = (questionIndex * 7 + 1) % pool.length;
    const i2 = (questionIndex * 11 + 5) % pool.length;
    const i3 = (questionIndex * 13 + 9) % pool.length;
    const w1 = pool[i1];
    const w2 = pool[i2 === i1 ? (i2 + 1) % pool.length : i2];
    const w3 = pool[i3 === i1 || i3 === i2 ? (i3 + 2) % pool.length : i3];
    questionIndex++;
    return `"options": [\n      ${correctOpt},\n      ${JSON.stringify(w1)},\n      ${JSON.stringify(w2)},\n      ${JSON.stringify(w3)}\n    ]`;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Law exams fixed: ${questionIndex} questions`);
}

// ─── COUNSELING EXAMS ─────────────────────────────────────────────────────────
function fixCounselingExams() {
  const filePath = path.join(__dirname, 'src', 'Counseling.js');
  const content = fs.readFileSync(filePath, 'utf8');

  const correctAnswers = [];
  const correctRegex = /"options":\s*\[\s*"([\s\S]*?)(?<!\\)",/g;
  let m;
  while ((m = correctRegex.exec(content)) !== null) {
    correctAnswers.push(m[1]);
  }

  let newContent = content;
  let questionIndex = 0;

  const wrongOptRegex = /"options":\s*\[\s*("[\s\S]*?(?<!\\)")\s*,\s*"Incorrect Option A"\s*,\s*"Incorrect Option B"\s*,\s*"Incorrect Option C"\s*\]/g;

  newContent = newContent.replace(wrongOptRegex, (match, correctOpt) => {
    const pool = correctAnswers.filter((a, i) => i !== questionIndex);
    const i1 = (questionIndex * 7 + 1) % pool.length;
    const i2 = (questionIndex * 11 + 5) % pool.length;
    const i3 = (questionIndex * 13 + 9) % pool.length;
    const w1 = pool[i1];
    const w2 = pool[i2 === i1 ? (i2 + 1) % pool.length : i2];
    const w3 = pool[i3 === i1 || i3 === i2 ? (i3 + 2) % pool.length : i3];
    questionIndex++;
    return `"options": [\n      ${correctOpt},\n      ${JSON.stringify(w1)},\n      ${JSON.stringify(w2)},\n      ${JSON.stringify(w3)}\n    ]`;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Counseling exams fixed: ${questionIndex} questions`);
}

// ─── MEDICAL SCIENCES EXAMS ───────────────────────────────────────────────────
function addDiseasesExams() {
  const exams = [
    // CARDIOVASCULAR
    { q: "First-line antihypertensive drug classes include all EXCEPT:", options: ["Digoxin", "Thiazide diuretics", "ACE inhibitors", "Calcium channel blockers"], correct: 0 },
    { q: "Which is TRUE about heart failure with reduced ejection fraction (HFrEF)?", options: ["EF is <40% and requires ACE inhibitors + beta-blockers + MRA", "EF is >50% and treated only with diuretics", "It is caused exclusively by valvular disease", "Digoxin is the first-line agent"], correct: 0 },
    { q: "The CHA₂DS₂-VASc score is used to assess:", options: ["Stroke risk in atrial fibrillation", "Heart failure severity", "Coronary artery disease risk", "DVT risk after surgery"], correct: 0 },
    { q: "A patient with a STEMI should receive emergent:", options: ["Primary percutaneous coronary intervention (PCI) or thrombolytics", "IV heparin infusion alone", "Oral aspirin dose and discharge", "Beta-blocker only"], correct: 0 },
    { q: "Which statin mechanism best explains its cardiovascular protective effects?", options: ["Inhibits HMG-CoA reductase → ↓ LDL + plaque stabilization", "Blocks PCSK9 receptors directly", "Inhibits bile acid absorption", "Activates lipoprotein lipase"], correct: 0 },

    // RESPIRATORY
    { q: "Which medication is the rescue inhaler in asthma?", options: ["Albuterol (SABA)", "Salmeterol (LABA)", "Fluticasone (ICS)", "Tiotropium (LAMA)"], correct: 0 },
    { q: "COPD is confirmed by spirometry showing:", options: ["FEV1/FVC < 0.70 post-bronchodilator", "FEV1/FVC >0.85 with air trapping", "Reversible airflow obstruction", "Reduced TLC and FRC"], correct: 0 },
    { q: "The most common organism causing community-acquired pneumonia (CAP) is:", options: ["Streptococcus pneumoniae", "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "Staphylococcus aureus"], correct: 0 },
    { q: "Which antibiotic combination is recommended for outpatient mild CAP?", options: ["Amoxicillin or azithromycin", "Vancomycin + piperacillin-tazobactam", "Metronidazole + ciprofloxacin", "Ceftriaxone + gentamicin"], correct: 0 },

    // ENDOCRINE
    { q: "Metformin works primarily by:", options: ["Decreasing hepatic glucose production", "Stimulating insulin secretion from beta-cells", "Blocking glucagon receptors", "Increasing urinary glucose excretion"], correct: 0 },
    { q: "DKA is characterized by:", options: ["Anion gap metabolic acidosis + ketones + hyperglycemia", "Hyperosmolar state without ketosis", "Hypoglycemia and respiratory alkalosis", "Normal anion gap acidosis"], correct: 0 },
    { q: "First-line treatment for hypothyroidism is:", options: ["Levothyroxine (T4 replacement)", "Propylthiouracil (PTU)", "Methimazole", "Radioactive iodine (RAI)"], correct: 0 },
    { q: "Cushing's syndrome is caused by:", options: ["Excess cortisol (most commonly from exogenous steroids)", "Deficiency of cortisol and aldosterone", "Excess aldosterone secretion", "Low thyroid hormone levels"], correct: 0 },
    { q: "Allopurinol is used for gout because it:", options: ["Inhibits xanthine oxidase → reduces uric acid synthesis", "Increases renal excretion of uric acid", "Neutralizes urate crystals in joints", "Blocks COX-2 to reduce joint pain"], correct: 0 },

    // NEUROLOGY
    { q: "Levodopa/carbidopa is first-line for Parkinson's disease because:", options: ["It is the most effective at replacing dopamine in substantia nigra", "It has no side effects", "It reverses disease progression", "It works by blocking acetylcholine"], correct: 0 },
    { q: "Cholinesterase inhibitors are used in Alzheimer's disease because:", options: ["They increase acetylcholine levels in the brain", "They slow amyloid plaque formation", "They restore dopamine signaling", "They reduce tau protein buildup"], correct: 0 },
    { q: "The time window for IV tPA in ischemic stroke is:", options: ["Within 4.5 hours of symptom onset", "Within 24 hours of symptom onset", "Within 1 hour of symptom onset", "Within 12 hours for all patients"], correct: 0 },
    { q: "First-line treatment for absence seizures is:", options: ["Ethosuximide", "Phenytoin", "Carbamazepine", "Topiramate"], correct: 0 },
    { q: "Which drug is contraindicated in migraines with basilar aura?", options: ["Triptans (relative contraindication)", "Acetaminophen", "NSAIDs", "Antiemetics"], correct: 0 },

    // GI
    { q: "PPIs work by:", options: ["Irreversibly blocking H⁺/K⁺-ATPase (proton pump) in gastric parietal cells", "Blocking H2 histamine receptors", "Neutralizing stomach acid", "Stimulating bicarbonate secretion"], correct: 0 },
    { q: "H. pylori eradication standard of care is:", options: ["Triple therapy: PPI + clarithromycin + amoxicillin × 14 days", "Single antibiotic monotherapy for 7 days", "PPI alone for 8 weeks", "Bismuth quadruple therapy only"], correct: 0 },
    { q: "Crohn's disease differs from ulcerative colitis in that:", options: ["It can affect the entire GI tract with transmural inflammation and skip lesions", "It is limited to the colon and rectum only", "It never causes fistulas", "It only affects the stomach"], correct: 0 },
    { q: "A complication of cirrhosis that requires lactulose or rifaximin treatment is:", options: ["Hepatic encephalopathy", "Esophageal varices", "Spontaneous bacterial peritonitis", "Hepatorenal syndrome"], correct: 0 },

    // RENAL
    { q: "The most common causes of CKD are:", options: ["Diabetes mellitus and hypertension", "Glomerulonephritis and lupus", "Polycystic kidney disease and recurrent UTIs", "NSAIDs and contrast dye"], correct: 0 },
    { q: "In a patient with CKD stage 4 (GFR 15–29), which drug should be dose-adjusted or avoided?", options: ["Metformin (hold when GFR <30)", "Amlodipine", "Atorvastatin", "Lisinopril"], correct: 0 },
    { q: "First-line treatment for uncomplicated cystitis in a non-pregnant woman:", options: ["Nitrofurantoin × 5 days OR TMP-SMX × 3 days", "Ciprofloxacin × 7 days", "Amoxicillin × 10 days", "Cephalexin × 14 days"], correct: 0 },

    // INFECTIOUS DISEASE
    { q: "The Surviving Sepsis Campaign Hour-1 Bundle includes:", options: ["Blood cultures → broad-spectrum antibiotics → 30 mL/kg IV crystaloid", "Narrow-spectrum antibiotics after diagnosis", "Vasopressors as first intervention", "Antipyretics only"], correct: 0 },
    { q: "MRSA bacteremia is best treated with:", options: ["Vancomycin IV", "Amoxicillin-clavulanate", "Cefazolin", "Azithromycin"], correct: 0 },
    { q: "C. difficile colitis is best treated with:", options: ["Fidaxomicin or oral vancomycin + stop offending antibiotic", "IV metronidazole", "IV vancomycin", "Oral ciprofloxacin"], correct: 0 },
    { q: "HIV antiretroviral therapy backbone typically consists of:", options: ["2 NRTIs + 1 integrase inhibitor (INSTI)", "1 NNRTI + 2 protease inhibitors", "3 NRTIs alone", "1 entry inhibitor + 1 fusion inhibitor"], correct: 0 },
    { q: "Hepatitis C is now curable with:", options: ["Direct-acting antivirals (DAAs) with >95% cure rates", "Pegylated interferon + ribavirin", "Sofosbuvir alone for 4 weeks", "Liver transplant only"], correct: 0 },

    // PSYCHIATRY
    { q: "SSRIs are first-line for major depression because:", options: ["They selectively inhibit serotonin reuptake with favorable side effect profile", "They have no drug interactions", "They work faster than other antidepressants", "They also block dopamine reuptake"], correct: 0 },
    { q: "Lithium is used in bipolar disorder and requires monitoring of:", options: ["Serum lithium levels, renal function, and thyroid function", "Liver enzymes and CBC only", "Blood pressure and heart rate", "Blood glucose and HbA1c"], correct: 0 },
    { q: "Second-generation (atypical) antipsychotics differ from first-generation in that:", options: ["They have lower EPS risk but higher metabolic side effects (weight gain, diabetes)", "They cause more QT prolongation", "They are less effective for positive symptoms", "They have no dopamine activity"], correct: 0 },
    { q: "First-line pharmacotherapy for ADHD is:", options: ["Stimulants: methylphenidate or amphetamine salts", "SSRIs", "Benzodiazepines", "Mood stabilizers"], correct: 0 },

    // PHARMACOLOGY
    { q: "A narrow therapeutic index drug requires close monitoring because:", options: ["Small dose changes can cause toxicity or subtherapeutic effects", "It has complex renal excretion only", "Patients metabolize it differently based on diet", "It is always a controlled substance"], correct: 0 },
    { q: "Rifampin is a potent CYP450 inducer. Taking it with warfarin will:", options: ["Decrease warfarin levels → ↓ anticoagulant effect → need higher dose", "Increase warfarin levels → bleeding risk", "Have no effect on warfarin", "Cause immediate drug toxicity"], correct: 0 },
    { q: "Serotonin syndrome is caused by:", options: ["Excess serotonergic activity (e.g., SSRI + MAOI combination)", "Excess dopamine activity", "Deficiency of serotonin receptors", "Anticholinergic drug overdose"], correct: 0 },
    { q: "The antidote for opioid overdose is:", options: ["Naloxone (Narcan) — competitive opioid receptor antagonist", "Flumazenil — benzodiazepine antagonist", "N-acetylcysteine — acetaminophen antidote", "Atropine — anticholinergic antidote"], correct: 0 },
    { q: "Loop diuretics work by blocking which transporter?", options: ["Na-K-2Cl cotransporter in the thick ascending loop of Henle", "Na-Cl cotransporter in the distal convoluted tubule", "Na-H exchanger in the proximal tubule", "Aquaporin channels in the collecting duct"], correct: 0 },
    { q: "The reversal agent for direct thrombin inhibitor dabigatran is:", options: ["Idarucizumab (Praxbind)", "Andexanet alfa (factor Xa reversal)", "Vitamin K", "Fresh frozen plasma only"], correct: 0 },
    { q: "Which drug is the antidote for acetaminophen overdose?", options: ["N-acetylcysteine (NAC)", "Naloxone", "Flumazenil", "Activated charcoal alone"], correct: 0 },
    { q: "Digoxin toxicity is worsened by hypokalemia because:", options: ["K⁺ and digoxin compete for the same Na/K-ATPase binding site; low K⁺ → more digoxin binding → toxicity", "Hypokalemia slows digoxin metabolism", "Low K⁺ directly increases digoxin renal absorption", "Hypokalemia causes digoxin protein binding changes"], correct: 0 },
    { q: "Which antibiotic class has concentration-dependent killing?", options: ["Aminoglycosides and fluoroquinolones — once-daily dosing maximizes Cmax/MIC", "Beta-lactams — time-above-MIC matters", "Tetracyclines — AUC/MIC is key", "Clindamycin — requires continuous infusion"], correct: 0 },
    { q: "QT prolongation is a concern with which drug class?", options: ["Fluoroquinolones, macrolides, antipsychotics, antiarrhythmics", "ACE inhibitors and ARBs", "Beta-blockers and calcium channel blockers", "Diuretics and statins"], correct: 0 },
    { q: "The Beers Criteria lists medications potentially inappropriate in:", options: ["Adults ≥65 years (associated with falls, delirium, ADRs)", "Pediatric patients under 12 years", "Patients with CKD stage 3+", "Pregnant women in all trimesters"], correct: 0 },
    { q: "Anaphylaxis first-line treatment is:", options: ["Epinephrine IM (0.3 mg in lateral thigh)", "IV diphenhydramine", "IV corticosteroids", "Inhaled albuterol"], correct: 0 },
  ];

  const filePath = path.join(__dirname, 'src', 'Diseases.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Build exam questions JSON
  const examQs = exams.map((e, i) => {
    const opts = e.options.map(o => JSON.stringify(o)).join(',\n      ');
    return `  {
    "id": "diseases_ex_${i}",
    "q": ${JSON.stringify(e.q)},
    "options": [
      ${opts}
    ],
    "correct": ${e.correct}
  }`;
  }).join(',\n');

  const examBlock = `
export const diseasesExams = [{
  id: "builtin_exam_diseases",
  title: "Medical Sciences Exam",
  icon: "CheckSquare",
  color: "#06b6d4",
  isBuiltIn: true,
  isBuiltin: true,
  questions: [
${examQs}
]
}];`;

  // Replace the empty diseasesExams export
  const newContent = content.replace(
    /export const diseasesExams = \[\];/,
    examBlock
  );

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Medical Sciences exams added: ${exams.length} questions`);
}

// Run all fixes
fixDrugExams();
fixLawExams();
fixCounselingExams();
addDiseasesExams();
console.log('All done!');
