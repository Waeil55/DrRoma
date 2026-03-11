// Script to fix drugData.js question fields
// Extracts brand name from each answer and maps to correct generic drug name

const fs = require('fs');
const path = require('path');

// Generic name mapping by brand name (extracted from answers in order)
// Format: "Brand text from answer" -> "Generic name to use as question"
const BRAND_TO_GENERIC = {
  'Tylenol': 'Acetaminophen',
  'Zovirax': 'Acyclovir',
  'Humira': 'Adalimumab',
  'ProAir HFA': 'Albuterol sulfate (HFA)',
  'Fosamax': 'Alendronate',
  'Zyloprim': 'Allopurinol',
  'Xanax': 'Alprazolam',
  'Pacerone': 'Amiodarone',
  'Elavil': 'Amitriptyline',
  'Norvasc': 'Amlodipine',
  'Amoxil': 'Amoxicillin',
  'Augmentin': 'Amoxicillin/Clavulanate',
  'Arimidex': 'Anastrozole',
  'Eliquis': 'Apixaban',
  'Abilify': 'Aripiprazole',
  'Bayer': 'Aspirin 81 mg',
  'Ecotrin': 'Aspirin 81 mg',
  'Tenormin': 'Atenolol',
  'Lipitor': 'Atorvastatin',
  'Astelin': 'Azelastine nasal',
  'Zithromax': 'Azithromycin',
  'Z-Pak': 'Azithromycin',
  'Lioresal': 'Baclofen',
  'Lotensin': 'Benazepril',
  'Tessalon': 'Benzonatate',
  'Perles': 'Benzonatate',
  'Bisoprolol': 'Bisoprolol/Hydrochlorothiazide',
  'Symbicort': 'Budesonide/Formoterol',
  'Suboxone': 'Buprenorphine/Naloxone',
  'Zubsolv': 'Buprenorphine/Naloxone',
  'Wellbutrin': 'Bupropion XL',
  'Aplenzin': 'Bupropion XL',
  'Zyban': 'Bupropion XL',
  'BuSpar': 'Buspirone',
  'Invokana': 'Canagliflozin',
  'Tegretol': 'Carbamazepine',
  'Coreg': 'Carvedilol',
  'Omnicef': 'Cefdinir',
  'Celebrex': 'Celecoxib',
  'Keflex': 'Cephalexin',
  'Zyrtec': 'Cetirizine',
  'Chlorthalidone': 'Chlorthalidone',
  'Vitamin D3': 'Cholecalciferol (Vitamin D3)',
  'D-Vi-Sol': 'Cholecalciferol (Vitamin D3)',
  'Cipro': 'Ciprofloxacin',
  'Celexa': 'Citalopram',
  'Cleocin': 'Clindamycin oral',
  'Temovate': 'Clobetasol topical',
  'Klonopin': 'Clonazepam',
  'Catapres': 'Clonidine',
  'Plavix': 'Clopidogrel',
  'Tylenol #3': 'Acetaminophen/Codeine',
  'Cyanocobalamin': 'Cyanocobalamin (Vitamin B12)',
  'Flexeril': 'Cyclobenzaprine',
  'Restasis': 'Cyclosporine ophthalmic',
  'Pradaxa': 'Dabigatran',
  'Farxiga': 'Dapagliflozin',
  'Pristiq': 'Desvenlafaxine',
  'Focalin': 'Dexmethylphenidate ER',
  'Valium': 'Diazepam',
  'Voltaren': 'Diclofenac oral',
  'Bentyl': 'Dicyclomine',
  'Cardizem': 'Diltiazem ER',
  'Colace': 'Docusate sodium',
  'Aricept': 'Donepezil',
  'Cardura': 'Doxazosin',
  'Vibramycin': 'Doxycycline',
  'Trulicity': 'Dulaglutide',
  'Cymbalta': 'Duloxetine',
  'Vasotec': 'Enalapril',
  'EpiPen': 'Epinephrine',
  'Lexapro': 'Escitalopram',
  'Nexium': 'Esomeprazole',
  'Estrace': 'Estradiol oral',
  'NuvaRing': 'Etonogestrel/Ethinyl estradiol vaginal ring',
  'Zetia': 'Ezetimibe',
  'Pepcid': 'Famotidine',
  'Tricor': 'Fenofibrate',
  'Ferrous sulfate': 'Ferrous sulfate',
  'Proscar': 'Finasteride',
  'Propecia': 'Finasteride',
  'Diflucan': 'Fluconazole',
  'Prozac': 'Fluoxetine',
  'Flonase': 'Fluticasone nasal',
  'Flovent': 'Fluticasone propionate HFA',
  'Advair': 'Fluticasone/Salmeterol',
  'Folic acid': 'Folic acid',
  'Lasix': 'Furosemide',
  'Neurontin': 'Gabapentin',
  'Amaryl': 'Glimepiride',
  'Glucotrol': 'Glipizide',
  'Intuniv': 'Guanfacine ER',
  'Hydralazine': 'Hydralazine',
  'Hydrochlorothiazide': 'Hydrochlorothiazide',
  'Norco': 'Hydrocodone',
  'Vicodin': 'Hydrocodone',
  'Hydrocortisone': 'Hydrocortisone topical',
  'Plaquenil': 'Hydroxychloroquine',
  'Atarax': 'Hydroxyzine',
  'Vistaril': 'Hydroxyzine',
  'Motrin': 'Ibuprofen',
  'Advil': 'Ibuprofen',
  'Indocin': 'Indomethacin',
  'NovoLOG': 'Insulin aspart',
  'Tresiba': 'Insulin degludec',
  'Lantus': 'Insulin glargine',
  'Humalog': 'Insulin lispro',
  'Combivent': 'Ipratropium/Albuterol',
  'Avapro': 'Irbesartan',
  'Imdur': 'Isosorbide mononitrate',
  'Nizoral': 'Ketoconazole topical',
  'Labetalol': 'Labetalol',
  'Lamictal': 'Lamotrigine',
  'Prevacid': 'Lansoprazole',
  'Xalatan': 'Latanoprost',
  'Keppra': 'Levetiracetam',
  'Xyzal': 'Levocetirizine',
  'Levaquin': 'Levofloxacin',
  'Synthroid': 'Levothyroxine',
  'Levoxyl': 'Levothyroxine',
  'Lidoderm': 'Lidocaine patch',
  'Tradjenta': 'Linagliptin',
  'Victoza': 'Liraglutide',
  'Vyvanse': 'Lisdexamfetamine',
  'Prinivil': 'Lisinopril',
  'Zestril': 'Lisinopril',
  'Claritin': 'Loratadine',
  'Ativan': 'Lorazepam',
  'Cozaar': 'Losartan',
  'Lovastatin': 'Lovastatin',
  'Mevacor': 'Lovastatin',
  'Antivert': 'Meclizine',
  'Mobic': 'Meloxicam',
  'Glucophage': 'Metformin',
  'Robaxin': 'Methocarbamol',
  'Trexall': 'Methotrexate',
  'Rheumatrex': 'Methotrexate',
  'Ritalin': 'Methylphenidate',
  'Concerta': 'Methylphenidate',
  'Medrol': 'Methylprednisolone',
  'Lopressor': 'Metoprolol',
  'Toprol': 'Metoprolol',
  'Flagyl': 'Metronidazole',
  'Myrbetriq': 'Mirabegron',
  'Remeron': 'Mirtazapine',
  'Nasonex': 'Mometasone nasal',
  'Singulair': 'Montelukast',
  'MS Contin': 'Morphine ER',
  'Bactroban': 'Mupirocin',
  'Naprosyn': 'Naproxen',
  'Bystolic': 'Nebivolol',
  'Adalat': 'Nifedipine',
  'Procardia': 'Nifedipine',
  'Macrodantin': 'Nitrofurantoin',
  'Macrobid': 'Nitrofurantoin',
  'Nitro-Dur': 'Nitroglycerin',
  'Nitrostat': 'Nitroglycerin',
  'Pamelor': 'Nortriptyline',
  'Mycostatin': 'Nystatin topical',
  'Nystop': 'Nystatin topical',
  'Zyprexa': 'Olanzapine',
  'Benicar': 'Olmesartan',
  'Prilosec': 'Omeprazole',
  'Zofran': 'Ondansetron',
  'Tamiflu': 'Oseltamivir',
  'Trileptal': 'Oxcarbazepine',
  'Ditropan': 'Oxybutynin',
  'OxyContin': 'Oxycodone',
  'Roxicodone': 'Oxycodone',
  'Protonix': 'Pantoprazole',
  'Paxil': 'Paroxetine',
  'Penicillin': 'Penicillin VK',
  'Adipex-P': 'Phentermine',
  'Actos': 'Pioglitazone',
  'Klor-Con': 'Potassium chloride',
  'Mirapex': 'Pramipexole',
  'Pravachol': 'Pravastatin',
  'Orapred': 'Prednisolone',
  'Pediapred': 'Prednisolone',
  'Deltasone': 'Prednisone',
  'Lyrica': 'Pregabalin',
  'Prometrium': 'Progesterone',
  'Phenergan': 'Promethazine',
  'Inderal': 'Propranolol',
  'Seroquel': 'Quetiapine',
  'Altace': 'Ramipril',
  'Risperdal': 'Risperidone',
  'Xarelto': 'Rivaroxaban',
  'Maxalt': 'Rizatriptan',
  'Requip': 'Ropinirole',
  'Crestor': 'Rosuvastatin',
  'Zoloft': 'Sertraline',
  'Viagra': 'Sildenafil',
  'Revatio': 'Sildenafil',
  'Zocor': 'Simvastatin',
  'Januvia': 'Sitagliptin',
  'Aldactone': 'Spironolactone',
  'CaroSpir': 'Spironolactone',
  'Carafate': 'Sucralfate',
  'Imitrex': 'Sumatriptan',
  'Flomax': 'Tamsulosin',
  'Terazosin': 'Terazosin',
  'AndroGel': 'Testosterone',
  'Androderm': 'Testosterone',
  'Armour Thyroid': 'Thyroid desiccated',
  'Betimol': 'Timolol ophthalmic',
  'Timoptic': 'Timolol ophthalmic',
  'Spiriva': 'Tiotropium',
  'HandiHaler': 'Tiotropium',
  'Zanaflex': 'Tizanidine',
  'Topamax': 'Topiramate',
  'Tramadol': 'Tramadol',
  'Ultram': 'Tramadol',
  'Trazodone': 'Trazodone',
  'Desyrel': 'Trazodone',
  'Nasacort': 'Triamcinolone nasal',
  'Triamcinolone': 'Triamcinolone topical',
  'Dyazide': 'Triamterene/Hydrochlorothiazide',
  'Maxzide': 'Triamterene/Hydrochlorothiazide',
  'Bactrim': 'Trimethoprim/Sulfamethoxazole',
  'Septra': 'Trimethoprim/Sulfamethoxazole',
  'Valacyclovir': 'Valacyclovir',
  'Valtrex': 'Valacyclovir',
  'Diovan': 'Valsartan',
  'Chantix': 'Varenicline',
  'Effexor': 'Venlafaxine',
  'Calan': 'Verapamil',
  'Coumadin': 'Warfarin',
  'Ambien': 'Zolpidem',
  'Intermezzo': 'Zolpidem',
};

function getBrandFromAnswer(answer) {
  // Extract brand name from "Brand: BrandName\n..." pattern
  const match = answer.match(/Brand:\s*([^\n]+)/);
  if (!match) return null;
  const brandRaw = match[1].trim();
  // Remove "N/A" or "N/A (BrandName)" patterns
  if (brandRaw.startsWith('N/A (')) {
    const inner = brandRaw.match(/N\/A\s*\(([^)]+)\)/);
    return inner ? inner[1].trim() : null;
  }
  if (brandRaw === 'N/A') return null;
  // Handle "Brand1, Brand2" - take first
  const firstBrand = brandRaw.split(',')[0].trim();
  return firstBrand;
}

function getGenericName(brand) {
  if (!brand) return null;
  // Direct lookup
  if (BRAND_TO_GENERIC[brand]) return BRAND_TO_GENERIC[brand];
  // Try partial match
  for (const [key, val] of Object.entries(BRAND_TO_GENERIC)) {
    if (brand.includes(key) || key.includes(brand)) return val;
  }
  return null;
}

// Read the drugData.js file as text
const filePath = path.join(__dirname, 'src', 'drugData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find all card objects and fix q fields
let fixedCount = 0;
let notFoundCount = 0;
const notFound = [];

// Match each card object - look for the pattern "q": "Question N",\n   "a": "Brand: ..."
content = content.replace(
  /"q":\s*"Question \d+",\s*\n(\s*)"a":\s*"(Brand:[^"]+(?:"[^"]*"[^"]*)*?)"/g,
  (match, indent, answerText) => {
    // Unescape the answer to find the brand
    const unescaped = answerText.replace(/\\n/g, '\n');
    const brand = getBrandFromAnswer(unescaped);
    const generic = getGenericName(brand);
    if (generic) {
      fixedCount++;
      return `"q": "${generic}",\n${indent}"a": "${answerText}"`;
    } else {
      notFoundCount++;
      notFound.push({ brand, answer: unescaped.substring(0, 60) });
      return match; // leave unchanged
    }
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Fixed: ${fixedCount} cards`);
console.log(`Not found: ${notFoundCount} cards`);
if (notFound.length > 0) {
  console.log('Could not map these brands:');
  notFound.forEach(n => console.log(`  Brand: "${n.brand}" | ${n.answer}`));
}
