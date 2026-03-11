// Generates real Medical Sciences flashcard content for Diseases.js
const fs = require('fs');
const path = require('path');

const cards = [
  // CARDIOVASCULAR
  { q: "What is hypertension?", a: "Persistently elevated blood pressure ≥130/80 mmHg. Primary (essential) has no identifiable cause; secondary has an underlying cause (renal disease, hyperaldosteronism, etc.)." },
  { q: "First-line medications for hypertension", a: "Thiazide diuretics, ACE inhibitors, ARBs, or calcium channel blockers. In diabetes or CKD: ACE inhibitors or ARBs preferred." },
  { q: "What is heart failure?", a: "Inability of the heart to pump sufficient blood to meet metabolic needs. Classified by ejection fraction: HFrEF (<40%) or HFpEF (≥50%)." },
  { q: "Mainstay treatment for HFrEF", a: "ACE inhibitor (or ARNI), beta-blocker, MRA (spironolactone), and SGLT2 inhibitor. Loop diuretics for symptom relief." },
  { q: "What is atrial fibrillation?", a: "Irregular, often rapid heart rhythm from chaotic atrial electrical activity. Causes: HTN, valve disease, HF, thyrotoxicosis. Risk: stroke." },
  { q: "CHA₂DS₂-VASc score", a: "Stroke risk calculator in AFib. Score ≥2 in men or ≥3 in women → anticoagulation recommended (warfarin or DOAC)." },
  { q: "What is angina pectoris?", a: "Chest pain/pressure from myocardial ischemia due to reduced coronary blood flow. Stable: predictable with exertion. Unstable: at rest, more dangerous." },
  { q: "Pathophysiology of acute MI", a: "Rupture of atherosclerotic plaque → thrombus formation → coronary artery occlusion → myocardial necrosis. STEMI: complete occlusion. NSTEMI: partial." },
  { q: "What is deep vein thrombosis (DVT)?", a: "Blood clot in deep vein (usually leg). Risk: Virchow's triad — stasis, endothelial injury, hypercoagulability. Complication: pulmonary embolism." },
  { q: "What is hyperlipidemia?", a: "Elevated blood lipids (LDL, triglycerides, total cholesterol) or low HDL. Major risk factor for atherosclerosis and cardiovascular disease." },

  // RESPIRATORY
  { q: "What is asthma?", a: "Chronic inflammatory airway disease with reversible bronchoconstriction. Triggers: allergens, exercise, cold air, infections. Characterized by wheezing, SOB, cough." },
  { q: "Asthma controller vs. reliever medications", a: "Controllers: inhaled corticosteroids (ICS), LABAs. Reliever (rescue): SABAs (albuterol). Severe: oral steroids, biologics (omalizumab)." },
  { q: "What is COPD?", a: "Progressive, irreversible airflow obstruction from emphysema and/or chronic bronchitis. Caused primarily by smoking. FEV1/FVC <0.7 on spirometry." },
  { q: "COPD pharmacotherapy stepwise approach", a: "SABA/SAMA PRN → LAMA (tiotropium) → LAMA+LABA → LAMA+LABA+ICS. Roflumilast for frequent exacerbators." },
  { q: "What is pneumonia?", a: "Infection of lung parenchyma (alveoli). Community-acquired (CAP): Streptococcus pneumoniae most common. HAP/VAP: gram-negatives and MRSA." },
  { q: "What is pulmonary embolism (PE)?", a: "Blood clot in pulmonary artery, usually from DVT. Symptoms: sudden dyspnea, plupeuritic chest pain, tachycardia. Life-threatening emergency." },
  { q: "What is tuberculosis (TB)?", a: "Infection by Mycobacterium tuberculosis. Latent TB: no symptoms, not contagious. Active TB: fever, night sweats, bloody cough. Treated with RIPE regimen." },

  // ENDOCRINE
  { q: "What is type 1 diabetes mellitus?", a: "Autoimmune destruction of pancreatic β-cells → absolute insulin deficiency. Requires lifelong insulin therapy. DKA is life-threatening complication." },
  { q: "What is type 2 diabetes mellitus?", a: "Insulin resistance + relative insulin deficiency. Most common form. Risk factors: obesity, inactivity, family history. HbA1c target typically <7%." },
  { q: "Mechanism of action of metformin", a: "Decreases hepatic glucose production (inhibits gluconeogenesis), improves insulin sensitivity. First-line for T2DM. Does not cause hypoglycemia alone." },
  { q: "What is diabetic ketoacidosis (DKA)?", a: "Complication of T1DM (or T2DM). Absolute insulin deficiency → lipolysis → ketone production → anion gap metabolic acidosis. Treat: IV fluids, insulin, K⁺ replacement." },
  { q: "What is hyperthyroidism?", a: "Excess thyroid hormone. Causes: Graves' disease (most common), toxic nodule, thyroiditis. Symptoms: tachycardia, weight loss, heat intolerance, tremor." },
  { q: "What is hypothyroidism?", a: "Insufficient thyroid hormone. Most common cause: Hashimoto's thyroiditis. Symptoms: fatigue, weight gain, cold intolerance, bradycardia, constipation." },
  { q: "What is Cushing's syndrome?", a: "Excess cortisol. Causes: exogenous corticosteroids (most common), pituitary adenoma (Cushing's disease), adrenal tumor. Features: moon face, buffalo hump, striae." },
  { q: "What is Addison's disease?", a: "Primary adrenal insufficiency — destruction of adrenal cortex → deficiency of cortisol and aldosterone. Crisis: hypotension, hyponatremia, hyperkalemia." },
  { q: "What is gout?", a: "Monosodium urate crystal deposition in joints from hyperuricemia. Acute: extreme joint pain (great toe most common). Chronic: tophi, kidney stones." },
  { q: "Acute gout treatment vs. urate-lowering therapy", a: "Acute: NSAIDs, colchicine, or corticosteroids. Chronic prevention: allopurinol or febuxostat (xanthine oxidase inhibitors). Start after acute attack resolves." },

  // NEUROLOGICAL
  { q: "What is epilepsy?", a: "Recurrent, unprovoked seizures from abnormal neuronal activity. Focal seizures: one brain area. Generalized: both hemispheres (tonic-clonic, absence)." },
  { q: "First-line anticonvulsants by seizure type", a: "Focal: lamotrigine, levetiracetam, carbamazepine. Generalized tonic-clonic: valproate (caution in women), levetiracetam, lamotrigine. Absence: ethosuximide." },
  { q: "What is Parkinson's disease?", a: "Progressive dopamine neuron loss in substantia nigra. Cardinal features: bradykinesia, resting tremor, rigidity, postural instability. Non-motor: dementia, depression." },
  { q: "Parkinson's disease pharmacotherapy", a: "Levodopa/carbidopa = gold standard. Also: dopamine agonists (pramipexole, ropinirole), MAO-B inhibitors (rasagiline, selegiline), COMT inhibitors." },
  { q: "What is Alzheimer's disease?", a: "Most common dementia. Progressive neurodegeneration with amyloid plaques and neurofibrillary tangles. Symptoms: memory loss, confusion, personality changes." },
  { q: "Pharmacotherapy for Alzheimer's disease", a: "Mild-moderate: cholinesterase inhibitors (donepezil, rivastigmine, galantamine). Moderate-severe: memantine (NMDA antagonist). Lecanemab for early AD." },
  { q: "What is a stroke?", a: "Ischemic (87%): clot blocks brain artery → infarction. Hemorrhagic: bleeding into brain. Time-sensitive: 'time is brain'. IV tPA within 4.5h for ischemic." },
  { q: "What is migraine?", a: "Recurrent severe headache, often unilateral, with nausea/vomiting, photophobia. Triggered by stress, hormones, foods. Aura in ~25%." },
  { q: "Migraine acute vs. preventive treatment", a: "Acute: triptans (first-line), NSAIDs, anti-emetics. Preventive (≥4/mo): beta-blockers (propranolol), topiramate, valproate, amitriptyline, CGRP antagonists." },
  { q: "What is multiple sclerosis (MS)?", a: "Autoimmune demyelination of CNS. Relapsing-remitting most common. Symptoms: visual disturbances (optic neuritis), weakness, fatigue, spasticity, bladder dysfunction." },

  // GASTROINTESTINAL
  { q: "What is GERD?", a: "Gastroesophageal reflux disease — acid reflux causing heartburn, regurgitation. Complications: esophagitis, Barrett's esophagus, adenocarcinoma." },
  { q: "GERD pharmacotherapy stepwise approach", a: "Lifestyle changes → antacids PRN → H2 blockers (famotidine) → PPIs (omeprazole, pantoprazole). PPIs most effective; use lowest effective dose." },
  { q: "What is peptic ulcer disease (PUD)?", a: "Ulcers in stomach (gastric) or duodenum. Most common causes: H. pylori infection, NSAID use. Symptoms: epigastric pain, nausea, GI bleeding." },
  { q: "H. pylori eradication regimen", a: "Triple therapy: PPI + clarithromycin + amoxicillin × 14 days. Quadruple (if clarithromycin resistance): PPI + bismuth + metronidazole + tetracycline." },
  { q: "What is Crohn's disease?", a: "Transmural inflammation anywhere in GI tract (mouth to anus), most commonly terminal ileum. Skip lesions, cobblestone appearance, fistulas, granulomas." },
  { q: "What is ulcerative colitis (UC)?", a: "Continuous mucosal inflammation of colon only, starting from rectum. Symptoms: bloody diarrhea, urgency. Complications: toxic megacolon, colon cancer." },
  { q: "IBD pharmacotherapy overview", a: "Mild-moderate: mesalamine (UC only), budesonide. Moderate-severe: corticosteroids, azathioprine/6-MP, biologics (TNF-α inhibitors: infliximab, adalimumab)." },
  { q: "What is irritable bowel syndrome (IBS)?", a: "Functional GI disorder with abdominal pain + altered bowel habits (IBS-C, IBS-D, or mixed) without structural abnormality. Diagnosis of exclusion." },
  { q: "What is cirrhosis?", a: "End-stage liver fibrosis from chronic damage (alcohol, NAFLD, hepatitis B/C). Complications: portal hypertension, ascites, varices, hepatic encephalopathy, HCC." },

  // RENAL
  { q: "What is chronic kidney disease (CKD)?", a: "Progressive loss of kidney function. Classified by GFR (stages 1-5). Causes: DM, HTN most common. Complications: anemia, hyperkalemia, metabolic acidosis, bone disease." },
  { q: "How does CKD affect drug dosing?", a: "Renally cleared drugs accumulate → reduce dose or extend interval. Use eGFR to adjust. Avoid NSAIDs, contrast dye. Monitor metformin (hold if GFR<30), digoxin." },
  { q: "What is acute kidney injury (AKI)?", a: "Sudden ↓ in kidney function. Pre-renal (volume depletion, most common), intrinsic renal (ATN, nephritis), post-renal (obstruction). Diagnose by ↑ creatinine." },
  { q: "What is nephrotic syndrome?", a: "Massive proteinuria (>3.5g/day), hypoalbuminemia, edema, hyperlipidemia. Causes: minimal change disease (children), focal segmental glomerulosclerosis (adults)." },
  { q: "What is a urinary tract infection (UTI)?", a: "Bacterial infection of urinary tract. Cystitis (lower): dysuria, frequency, urgency. Pyelonephritis (upper): fever, flank pain, systemic illness. Most common: E. coli." },
  { q: "UTI treatment by type", a: "Uncomplicated cystitis: nitrofurantoin or TMP-SMX × 3 days. Pyelonephritis: fluoroquinolone × 7-14 days or IV ceftriaxone. Consider culture/sensitivity." },

  // INFECTIOUS DISEASES
  { q: "What is sepsis?", a: "Life-threatening organ dysfunction caused by dysregulated host response to infection. Septic shock: sepsis + vasopressors needed + lactate >2 mmol/L despite fluids." },
  { q: "Sepsis management (Surviving Sepsis Bundle)", a: "Hour-1: blood cultures → broad-spectrum antibiotics → 30 mL/kg IV crystalloid if hypotensive → vasopressors if needed → lactate measurement." },
  { q: "What is MRSA?", a: "Methicillin-resistant Staphylococcus aureus — resistant to beta-lactams. Skin/soft tissue: TMP-SMX or doxycycline. Serious infections: vancomycin, linezolid, or daptomycin." },
  { q: "What is Clostridioides difficile (C. diff) infection?", a: "Colitis from C. diff toxin, often after antibiotic use (disrupts gut flora). Symptoms: watery diarrhea, abdominal pain. Treatment: fidaxomicin or vancomycin oral. Stop offending antibiotic." },
  { q: "What is HIV/AIDS?", a: "HIV destroys CD4+ T-cells → immunodeficiency → AIDS (CD4 <200/μL). Transmitted via blood, sex, mother-to-child. Treated with ART (antiretroviral therapy)." },
  { q: "Antiretroviral therapy (ART) backbone", a: "2 NRTIs + 1 INSTI (integrase inhibitor, e.g., dolutegravir). Bictegravir/TAF/FTC (Biktarvy) or dolutegravir/abacavir/3TC (Triumeq) common options." },
  { q: "What is hepatitis B?", a: "Viral liver infection (HBV). Acute: usually resolves. Chronic (HBsAg >6 months): cirrhosis, HCC risk. Vaccine-preventable. Treat: tenofovir or entecavir." },
  { q: "What is hepatitis C?", a: "Bloodborne RNA virus (HCV). Most become chronic. Curable with direct-acting antivirals (DAAs): sofosbuvir/velpatasvir (Epclusa) × 12 weeks, >95% cure rates." },

  // MENTAL HEALTH
  { q: "What is major depressive disorder (MDD)?", a: "Persistent depressed mood or anhedonia × ≥2 weeks + ≥4 somatic symptoms. Treated with SSRIs/SNRIs first-line. Severe: add therapy, consider TMS or ECT." },
  { q: "SSRI mechanism of action", a: "Selectively inhibit serotonin reuptake transporter (SERT) → ↑ synaptic serotonin. Examples: fluoxetine, sertraline, escitalopram. First-line for depression and anxiety." },
  { q: "What is bipolar disorder?", a: "Mood disorder with episodes of mania/hypomania alternating with depression. Bipolar I: full mania. Bipolar II: hypomania + depression. Risk: suicide especially during depression." },
  { q: "Bipolar disorder pharmacotherapy", a: "Mood stabilizers: lithium (evidence for suicide reduction), valproate, lamotrigine (bipolar depression). Atypical antipsychotics: quetiapine, olanzapine, aripiprazole." },
  { q: "What is schizophrenia?", a: "Psychotic disorder with positive symptoms (hallucinations, delusions, disorganized speech) and negative symptoms (flat affect, alogia, avolition, anhedonia)." },
  { q: "Antipsychotic medications: first vs. second generation", a: "FGA (typical): haloperidol, chlorpromazine — high EPS risk. SGA (atypical): risperidone, olanzapine, quetiapine — lower EPS but metabolic side effects." },
  { q: "What is generalized anxiety disorder (GAD)?", a: "Excessive, uncontrollable worry about multiple topics ≥6 months + physical symptoms (muscle tension, insomnia, fatigue). First-line: SSRIs, SNRIs, buspirone." },
  { q: "What is PTSD?", a: "Post-traumatic stress disorder after trauma exposure. Symptoms: flashbacks, nightmares, avoidance, hypervigilance, negative cognitions. First-line: trauma-focused psychotherapy + SSRI/SNRI." },
  { q: "What is ADHD?", a: "Attention-deficit/hyperactivity disorder. Inattentive, hyperactive-impulsive, or combined type. First-line pharmacotherapy: stimulants (methylphenidate, amphetamines). Non-stimulant: atomoxetine." },
  { q: "What is insomnia disorder?", a: "Difficulty initiating/maintaining sleep ≥3 nights/week causing daytime impairment. First-line: CBT-I. Pharmacotherapy: melatonin receptor agonist (ramelteon), Z-drugs, doxepin." },

  // HEMATOLOGY
  { q: "What is iron deficiency anemia?", a: "Most common anemia worldwide. Cause: blood loss (women), malabsorption, poor diet. Labs: ↓ Hgb, ↓ MCV (microcytic), ↓ ferritin, ↑ TIBC. Treat: oral iron." },
  { q: "What is vitamin B12 deficiency anemia?", a: "Macrocytic (megaloblastic) anemia + neurological symptoms (subacute combined degeneration). Cause: pernicious anemia (anti-intrinsic factor Ab), malabsorption. Treat: B12 IM or high-dose oral." },
  { q: "What is sickle cell disease?", a: "Autosomal recessive HbS mutation → red cell sickling under hypoxia → hemolysis, vaso-occlusion. Painful crises, organ damage, stroke. Treat: hydroxyurea, transfusions, SCT." },
  { q: "What is deep vein thrombosis — anticoagulation overview?", a: "Initial: LMWH, fondaparinux, or DOAC. Long-term: DOAC (rivaroxaban, apixaban) or warfarin. Duration: 3 months for provoked; indefinite for unprovoked or high-risk." },

  // MUSCULOSKELETAL
  { q: "What is rheumatoid arthritis (RA)?", a: "Autoimmune symmetric polyarthritis primarily affecting small joints. Positive RF and anti-CCP. Systemic: fatigue, nodules, vasculitis. Treat: DMARDs (methotrexate first-line) + biologics." },
  { q: "What is osteoarthritis (OA)?", a: "Degenerative joint disease — cartilage loss, bone changes. Weight-bearing joints: knees, hips. Non-pharmacologic: exercise, weight loss. Pharmacologic: acetaminophen, NSAIDs, intra-articular steroids." },
  { q: "What is osteoporosis?", a: "Low bone density → fracture risk. T-score ≤ -2.5. Risk: postmenopausal women, corticosteroids, age. Screen with DEXA. Treat: bisphosphonates, calcium + vitamin D." },
  { q: "What is systemic lupus erythematosus (SLE)?", a: "Multi-system autoimmune disease. Butterfly rash, arthritis, nephritis, serositis, positive ANA. Drug-induced lupus: hydralazine, procainamide, isoniazid." },

  // DERMATOLOGY
  { q: "What is psoriasis?", a: "Chronic autoimmune skin condition. Plaques: well-demarcated, silvery-scaled, erythematous, commonly on elbows/knees/scalp. Treat: topical steroids, vitamin D analogs; severe: biologics." },
  { q: "What is atopic dermatitis (eczema)?", a: "Chronic inflammatory skin disease with pruritic lesions. Associated with asthma, allergic rhinitis. Treat: emollients, topical steroids, topical calcineurin inhibitors, dupilumab (severe)." },
  { q: "What is cellulitis?", a: "Bacterial skin/soft tissue infection (non-purulent). Most common: Streptococcus pyogenes, S. aureus. Treatment: dicloxacillin or cephalexin; MRSA suspected: TMP-SMX or doxycycline." },

  // ONCOLOGY BASICS
  { q: "What are the hallmarks of cancer?", a: "Sustained proliferative signaling, evading growth suppressors, resisting cell death, enabling replicative immortality, inducing angiogenesis, activating invasion/metastasis, avoiding immune destruction." },
  { q: "Common chemotherapy side effects by category", a: "Myelosuppression (neutropenia → infection risk), nausea/vomiting (5-HT3 antagonists for prevention), alopecia, mucositis, peripheral neuropathy, cardiotoxicity (anthracyclines)." },
  { q: "What are the common hormone-driven cancers?", a: "Breast cancer (ER+/PR+: tamoxifen or aromatase inhibitors), prostate cancer (androgen deprivation therapy: GnRH agonists + anti-androgens), endometrial cancer." },
  { q: "Drug pharmacokinetics — 4 key processes (ADME)", a: "Absorption: drug enters systemic circulation. Distribution: spreads to tissues (affected by protein binding, lipophilicity). Metabolism: liver (CYP450). Excretion: kidney (GFR, tubular secretion)." },

  // PHARMACOLOGY ESSENTIALS
  { q: "What is the therapeutic index (TI)?", a: "TI = TD50/ED50. Narrow TI drugs require close monitoring (lithium, warfarin, digoxin, phenytoin, aminoglycosides). Small dose changes can cause toxicity or subtherapeutic effect." },
  { q: "What is cytochrome P450 (CYP450)?", a: "Major drug-metabolizing enzyme system in liver. CYP3A4: metabolizes ~50% of drugs. Inducers ↓ drug levels (rifampin, carbamazepine). Inhibitors ↑ drug levels (azole antifungals, macrolides)." },
  { q: "What is a drug-drug interaction?", a: "Pharmacokinetic: one drug alters absorption, distribution, metabolism, or excretion of another. Pharmacodynamic: additive, synergistic, or antagonistic effects on target." },
  { q: "What is nephrotoxicity from drugs?", a: "Drug-induced kidney injury. Common culprits: NSAIDs (afferent arteriole constriction), aminoglycosides (proximal tubule damage), contrast dye, vancomycin. Monitor SCr/BUN." },
  { q: "What is QT prolongation?", a: "Delayed ventricular repolarization on ECG. Risk: torsades de pointes (potentially fatal arrhythmia). Common culprits: fluoroquinolones, macrolides, antipsychotics, methadone, antiarrhythmics." },
  { q: "What are anticholinergic side effects?", a: "Urinary retention, constipation, dry mouth, blurred vision, confusion/delirium, tachycardia. Anticholinergic drugs: diphenhydramine, tricyclics, oxybutynin, benztropine, some antipsychotics." },
  { q: "What is serotonin syndrome?", a: "Excess serotonergic activity. Triad: mental status changes, autonomic instability (hyperthermia, tachycardia), neuromuscular abnormalities (clonus, hyperreflexia). Causes: SSRIs + MAOIs, linezolid, tramadol." },
  { q: "What is Stevens-Johnson syndrome (SJS)?", a: "Severe cutaneous drug reaction with mucosal involvement, epidermal detachment <10% BSA. TEN: >30% BSA. Common culprits: allopurinol, anticonvulsants (carbamazepine, lamotrigine), sulfonamides." },
  { q: "What is pharmacogenomics?", a: "Study of genetic variation affecting drug response. Example: CYP2D6 poor metabolizers → ↑ codeine toxicity. HLA-B*5701 → abacavir hypersensitivity. TPMT testing before thiopurines." },
  { q: "What is the minimum inhibitory concentration (MIC)?", a: "Lowest antibiotic concentration that inhibits visible bacterial growth. Used to determine susceptibility: susceptible (S), intermediate (I), or resistant (R). PK/PD determines dosing strategy." },
  { q: "Time-dependent vs. concentration-dependent antibiotics", a: "Time-dependent (β-lactams): efficacy from time above MIC → frequent dosing or extended infusion. Concentration-dependent (aminoglycosides, fluoroquinolones): efficacy from Cmax/MIC → once-daily dosing." },
  { q: "What are beta-lactam antibiotics?", a: "Penicillins, cephalosporins, carbapenems, monobactams. Inhibit cell wall synthesis (PBP binding). Beta-lactamases inactivate them. Combination with beta-lactamase inhibitors (clavulanate, tazobactam) overcomes." },
  { q: "What is the renin-angiotensin-aldosterone system (RAAS)?", a: "Kidney releases renin → cleaves angiotensinogen to Ang I → ACE converts to Ang II → vasoconstriction + aldosterone release → Na/water retention. ACE inhibitors and ARBs block this." },
  { q: "What is the difference between ACE inhibitors and ARBs?", a: "ACE inhibitors: block conversion of Ang I → Ang II; cause dry cough (bradykinin). ARBs: block Ang II at AT1 receptor; no cough. Both avoid in pregnancy (teratogenic)." },
  { q: "What is HbA1c and its clinical significance?", a: "Glycated hemoglobin reflecting average blood glucose over 2-3 months. Target <7% for most diabetics. Higher targets (7.5-8%) for elderly or those with frequent hypoglycemia." },
  { q: "What is the insulin sliding scale concept?", a: "Reactive insulin dosing based on current blood glucose. Replaced by basal-bolus regimen: basal insulin (glargine/detemir) 24h + rapid-acting (lispro/aspart) with meals + correction doses." },
  { q: "What is opioid-induced constipation (OIC)?", a: "Opioids bind μ-receptors in GI tract → reduced motility, increased sphincter tone → constipation. Unlike other opioid side effects, tolerance does NOT develop. Treat: stimulant laxatives (senna)." },
  { q: "What is naloxone and how does it work?", a: "Opioid antagonist — competitively blocks μ, κ, and δ receptors. Reverses opioid overdose (respiratory depression). Short half-life → may need repeat doses. Available as Narcan nasal spray." },
  { q: "What is drug tolerance?", a: "Reduced response to a drug after repeated exposure, requiring higher doses. Pharmacokinetic tolerance: increased metabolism. Pharmacodynamic tolerance: receptor downregulation or desensitization." },
  { q: "What is physical dependence vs. addiction?", a: "Physical dependence: physiological adaptation requiring drug to avoid withdrawal. Addiction: compulsive drug-seeking behavior despite harm. Physical dependence can occur WITHOUT addiction." },
  { q: "What is the role of prostaglandins in inflammation?", a: "COX-1 and COX-2 convert arachidonic acid to prostaglandins → pain, fever, inflammation. NSAIDs inhibit COX → anti-inflammatory, analgesic, antipyretic. COX-1 inhibition → GI and platelet effects." },
  { q: "What is the mechanism of statin drugs?", a: "HMG-CoA reductase inhibitors → ↓ cholesterol synthesis in liver → upregulation of LDL receptors → ↓ LDL. Also pleiotropic effects: anti-inflammatory, plaque stabilization." },
  { q: "What is warfarin's mechanism and monitoring?", a: "Vitamin K antagonist → inhibits clotting factors II, VII, IX, X (and protein C, S). Monitored with INR (target 2-3 for most indications). Many drug and food interactions (vitamin K-rich foods)." },
  { q: "What are direct oral anticoagulants (DOACs)?", a: "Apixaban/rivaroxaban: Factor Xa inhibitors. Dabigatran: direct thrombin inhibitor. Advantages over warfarin: predictable dosing, fewer interactions, no INR monitoring. Reversal agents available." },
  { q: "What is the mechanism of loop diuretics?", a: "Block Na-K-2Cl cotransporter in thick ascending loop of Henle → prevent Na/water reabsorption → diuresis. Examples: furosemide, bumetanide, torsemide. Also lose K⁺ and Mg²⁺." },
  { q: "What is the mechanism of thiazide diuretics?", a: "Block Na-Cl cotransporter in distal convoluted tubule. Less potent than loop diuretics. Examples: hydrochlorothiazide, chlorthalidone. First-line for HTN; also for hypercalciuria (calcium stones)." },
  { q: "What is hypokalemia?", a: "Serum K⁺ <3.5 mEq/L. Causes: loop/thiazide diuretics, vomiting, diarrhea, hyperaldosteronism. Symptoms: muscle weakness, cramps, arrhythmias (↑ digoxin toxicity risk). Treat: KCl supplementation." },
  { q: "What is digoxin toxicity?", a: "Narrow TI. Toxicity: nausea, visual disturbances (yellow-green halos), bradycardia, heart block, arrhythmias. Worsened by hypokalemia, renal failure, hypomagnesemia. Treat: digoxin-immune Fab." },
  { q: "What are bisphosphonate counseling key points?", a: "For osteoporosis: take on empty stomach with 8oz water, remain upright ≥30 min, avoid food/meds for 30 min. Adverse effects: esophageal irritation, osteonecrosis of jaw (rare), atypical femur fractures." },
  { q: "What is proton pump inhibitor (PPI) long-term concerns?", a: "Chronic use risks: C. diff infection, community-acquired pneumonia, Mg²⁺ deficiency, osteoporosis/fractures, B12 deficiency, chronic kidney disease. Use lowest effective dose." },
  { q: "What is the opioid conversion concept?", a: "Converting between opioids using morphine milligram equivalents (MME). Example: 30 mg oral morphine = 20 mg oral oxycodone = 7.5mg oral hydromorphone. Reduce 25-50% for incomplete cross-tolerance." },
  { q: "What is benzodiazepine withdrawal?", a: "Life-threatening: seizures, delirium tremens. Never abrupt discontinuation. Symptoms: anxiety, insomnia, tremor, diaphoresis. Long-acting benzo (chlordiazepoxide, diazepam) tapering for alcohol withdrawal." },
  { q: "What is the mechanism of beta-blockers?", a: "Competitively block β1 (cardiac: ↓ HR, contractility), β2 (bronchospasm in asthmatics), or both. Uses: HTN, heart failure, angina, arrhythmias, post-MI, migraine prophylaxis, tremor, anxiety." },
  { q: "What is the mechanism of calcium channel blockers (CCBs)?", a: "Dihydropyridines (amlodipine, nifedipine): selective vascular smooth muscle → vasodilation → ↓ BP. Non-DHPs (diltiazem, verapamil): also cardiac → ↓ HR + contractility." },
  { q: "What is pharmacovigilance?", a: "Ongoing monitoring of medication safety after approval (post-marketing surveillance). Pharmacists report adverse events via MedWatch (FDA). Identifies rare/delayed adverse effects not seen in trials." },
  { q: "What is a boxed (black box) warning?", a: "FDA's strongest drug warning in prescribing information. Indicates serious or life-threatening risks. Example: fluoroquinolones → tendonitis/tendon rupture; SSRIs → suicidality in pediatric patients." },
  { q: "What is pharmacokinetics in special populations?", a: "Elderly: ↓ renal clearance, ↑ fat, ↓ albumin → drug accumulation. Pediatrics: different metabolism (immature CYP). Pregnancy: ↑ renal clearance, ↑ plasma volume. Obese: ↑ Vd for lipophilic drugs." },
  { q: "What is the mechanism of ACE inhibitors in heart failure?", a: "Block ACE → ↓ Ang II → vasodilation (↓ afterload), ↓ aldosterone → ↓ preload. Prevent ventricular remodeling, reducing hospitalizations and mortality in HFrEF." },
  { q: "What is cardiogenic shock?", a: "Severe heart failure causing ↓ cardiac output → end-organ hypoperfusion despite adequate volume. Most common cause: massive MI. Treat: inotropes, vasopressors, mechanical support (IABP), revascularization." },
  { q: "What is anaphylaxis?", a: "Severe, life-threatening systemic allergic reaction. Triggers: drugs (penicillin), food (peanuts), insect venom. Symptoms: urticaria, angioedema, bronchospasm, hypotension. Treatment: epinephrine IM immediately." },
  { q: "What is drug-induced lupus (DIL)?", a: "Lupus-like syndrome from drugs: hydralazine (most common), procainamide, isoniazid, minocycline, TNF-α inhibitors. Anti-histone antibodies. Resolves on discontinuation." },
  { q: "What are ADRs (adverse drug reactions)?", a: "Type A (predictable): dose-dependent, extension of pharmacologic effect (e.g., bleeding from anticoagulants). Type B (unpredictable): idiosyncratic, immune-mediated (allergies, SJS). Type C/D/E also described." },
  { q: "What is polypharmacy and its risks?", a: "Use of ≥5 medications simultaneously. Risks: drug-drug interactions, additive ADRs, non-adherence, falls (especially in elderly), inappropriate prescribing. Regular medication reconciliation essential." },
  { q: "What is the Beers Criteria?", a: "AGS list of medications potentially inappropriate in adults ≥65 years. Includes benzodiazepines, diphenhydramine, NSAIDs, tricyclics, muscle relaxants. Associated with falls, delirium, ADRs." },
  { q: "What is medication adherence?", a: "Extent to which patient takes medication as prescribed. Factors: side effects, cost, complexity, beliefs, forgetfulness. Poor adherence is major cause of treatment failure. Pharmacist counseling improves adherence." },
  { q: "What is immunotherapy in cancer?", a: "Harnessing immune system to fight cancer. Checkpoint inhibitors (PD-1/PD-L1, CTLA-4 blockers: pembrolizumab, nivolumab) remove 'brakes' on T-cells. Immune-related adverse events (irAEs): colitis, pneumonitis, endocrinopathies." },
  { q: "What is targeted therapy in cancer?", a: "Drugs targeting specific cancer mutations (e.g., imatinib for BCR-ABL in CML, trastuzumab for HER2+ breast cancer, erlotinib for EGFR-mutant NSCLC). More selective than chemotherapy." },
  { q: "What is the difference between bacterial and viral infections?", a: "Bacteria: prokaryotes, treated with antibiotics. Viruses: intracellular parasites using host machinery, treated with antivirals. Antibiotics do NOT treat viral infections. Misuse contributes to antimicrobial resistance." },
  { q: "What is antimicrobial stewardship?", a: "Program to optimize antibiotic use, reduce resistance, and minimize adverse effects. Key: right antibiotic, dose, route, duration. De-escalate based on culture; avoid broad-spectrum when narrow-spectrum appropriate." },
];

// Generate the complete Diseases.js file
const cardsJson = cards.map((c, i) => `  {
    "id": "diseases_fc_${i}",
    "q": ${JSON.stringify(c.q)},
    "a": ${JSON.stringify(c.a)},
    "nextReview": 0
  }`).join(',\n');

const content = `
export const diseasesFlashcards = [{
  id: "builtin_diseases",
  title: "Medical Sciences Flashcards",
  icon: "Layers",
  color: "#06b6d4",
  isBuiltIn: true,
  isBuiltin: true,
  cards: [
${cardsJson}
]
}];

export const diseasesExams = [];
export const diseasesCases = [];
`;

fs.writeFileSync(path.join(__dirname, 'src', 'Diseases.js'), content, 'utf8');
console.log(`Written ${cards.length} real Medical Sciences flashcards to Diseases.js`);
