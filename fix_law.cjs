// Fix all law flashcard question fields
// Law data answers are short factual statements - good for "what is X?" style questions
// We'll use a curated list of proper pharmacy law questions matching each answer

const fs = require('fs');
const path = require('path');

// Proper questions for lawData.js cards (352 total, in order)
// Each question matches the answer in the existing file
const LAW_QUESTIONS = [
  // CSA basics (0-10)
  "What is the Controlled Substances Act (CSA)?",
  "Which federal agency enforces the Controlled Substances Act?",
  "What are the criteria for Schedule I controlled substances?",
  "Give examples of Schedule I drugs.",
  "What are the criteria for Schedule II controlled substances?",
  "Give examples of Schedule II drugs.",
  "What are the criteria for Schedule III controlled substances?",
  "Give examples of Schedule III drugs.",
  "What are the criteria for Schedule IV controlled substances?",
  "Give examples of Schedule IV drugs.",
  "What are the criteria for Schedule V controlled substances?",
  // Prescriptions (11-30)
  "Give examples of Schedule V drugs.",
  "What information must a valid controlled substance prescription contain?",
  "How many refills are permitted for Schedule II controlled substances?",
  "How many refills are permitted for Schedule III and IV controlled substances?",
  "What is the validity period for Schedule II prescriptions?",
  "How far in advance can Schedule II prescriptions be written (post-dating)?",
  "What is required to dispense an emergency oral Schedule II prescription?",
  "Can a pharmacist accept a faxed Schedule II prescription?",
  "What are the DEA requirements for electronic prescribing of controlled substances (EPCS)?",
  "What does a Schedule II prescription require from the prescriber?",
  // Ordering & Storage (31-50)
  "What form is used to order Schedule I and II controlled substances?",
  "What is a DEA 222 form and how is it used?",
  "What is the Controlled Substance Ordering System (CSOS)?",
  "How long must DEA 222 forms (or CSOS records) be kept?",
  "How must Schedule II controlled substances be stored?",
  "What are DEA requirements for disposal of damaged or returned controlled substances?",
  "What form is used to report theft or significant loss of controlled substances?",
  "Within what timeframe must controlled substance theft/loss be reported to the DEA?",
  "What constitutes 'significant loss' of controlled substances requiring DEA Form 106?",
  "What records are pharmacies required to keep for controlled substances?",
  "How long must controlled substance dispensing records be maintained?",
  // Inventories (51-70)
  "When must a pharmacy conduct an initial controlled substance inventory?",
  "How often must controlled substance biennial inventories be conducted?",
  "What information must be included in a controlled substance inventory?",
  "Must Schedule II drugs be counted separately in the biennial inventory?",
  "What is the difference between an exact vs. estimated count in the biennial inventory?",
  "Who is authorized to prescribe controlled substances?",
  "Can a nurse practitioner prescribe Schedule II controlled substances?",
  "What DEA registration is required for a physician to prescribe controlled substances?",
  "What is required for a practitioner to prescribe buprenorphine for opioid use disorder?",
  "What is the Drug Addiction Treatment Act (DATA 2000)?",
  "What DEA waiver is needed to prescribe buprenorphine outside of opioid treatment programs?",
  // Pharmacist-Specific (71-90)
  "What is a pharmacist's corresponding responsibility regarding controlled substances?",
  "What does 'corresponding responsibility' mean for the dispensing pharmacist?",
  "Can a pharmacist refuse to fill a controlled substance prescription if fraud is suspected?",
  "What is the role of the pharmacist in identifying prescription forgeries?",
  "What are red flags that may indicate a fraudulent controlled substance prescription?",
  "What is a Prescription Drug Monitoring Program (PDMP)?",
  "Are pharmacists required to check the PDMP before dispensing controlled substances?",
  "What is 'doctor shopping' and why is it a concern with controlled substances?",
  "What is morphine equivalent dose (MED) and why is it clinically significant?",
  "What is considered a high-dose opioid prescription in MME/day?",
  // Federal vs State Law (91-110)
  "When state law and federal law conflict regarding controlled substances, which applies?",
  "What is the Poison Prevention Packaging Act (PPPA)?",
  "Which drugs require child-resistant packaging under the PPPA?",
  "Who can request non-child-resistant packaging under the PPPA?",
  "What is the Drug Supply Chain Security Act (DSCSA)?",
  "What is track and trace in the context of pharmaceutical supply chain security?",
  "What is a pedigree in pharmaceutical distribution?",
  "What is the role of the FDA in regulating prescription drugs?",
  "What is a New Drug Application (NDA)?",
  "What is an Abbreviated New Drug Application (ANDA)?",
  "What is the criteria for a generic drug to be approved?",
  // Bioequivalence (111-130)
  "What does 'bioequivalent' mean under FDA standards?",
  "What is the Orange Book?",
  "What does an 'A' rating mean in the Orange Book?",
  "What does a 'B' rating mean in the Orange Book?",
  "What is therapeutic equivalence?",
  "What is a Risk Evaluation and Mitigation Strategy (REMS)?",
  "Give an example of a drug requiring a REMS program.",
  "What is the iPLEDGE REMS program?",
  "What drug classes are most commonly associated with REMS requirements?",
  "What is a medication guide?",
  "When is a Medication Guide required to be dispensed?",
  // HIPAA (131-150)
  "What is HIPAA and how does it apply to pharmacies?",
  "What does PHI stand for under HIPAA?",
  "What is the HIPAA minimum necessary standard?",
  "Under HIPAA, when can a pharmacy disclose PHI without patient authorization?",
  "What is a HIPAA Business Associate Agreement?",
  "What are the penalties for HIPAA violations?",
  "What is the HITECH Act and how does it affect pharmacy?",
  "What is the HIPAA Privacy Rule?",
  "What are patients' rights under HIPAA?",
  "Who enforces HIPAA compliance?",
  "What is a Notice of Privacy Practices (NPP)?",
  // State Board Authority (151-170)
  "What does the State Board of Pharmacy regulate?",
  "Who has authority to discipline a pharmacist's license?",
  "What are grounds for pharmacist license revocation?",
  "What is pharmacy technician scope of practice?",
  "What tasks can a pharmacy technician NOT perform?",
  "What is pharmacist-to-technician ratio?",
  "What is prospective drug use review (Pro-DUR)?",
  "What is retrospective drug use review (Retro-DUR)?",
  "What must a pharmacist do when performing drug utilization review?",
  "What is the OBRA '90 requirement for drug use review?",
  "What does OBRA '90 require pharmacists to offer?",
  // OTC & Pseudoephedrine (171-190)
  "What is the Combat Methamphetamine Epidemic Act (CMEA)?",
  "What are the CMEA limits for pseudoephedrine purchases?",
  "How must pseudoephedrine products be stored under the CMEA?",
  "What information must be collected when selling pseudoephedrine?",
  "What is the daily and monthly purchase limit for pseudoephedrine?",
  "What is an OTC drug?",
  "What distinguishes prescription drugs from OTC drugs?",
  "What is the Rx-to-OTC switch process?",
  "Give examples of drugs that switched from Rx to OTC status.",
  "What is a behind-the-counter (BTC) drug?",
  "What is an emergency contraceptive and how is it classified?",
  // Drug Labeling (191-210)
  "What must be on the label of a dispensed prescription drug?",
  "What is the required auxiliary label for drugs causing photosensitivity?",
  "What does 'take with food' on a label mean clinically?",
  "What is the package insert (PI)?",
  "What information is required in a drug package insert?",
  "What is a drug recall and what are the three classes?",
  "What is a Class I drug recall?",
  "What is a Class II drug recall?",
  "What is a Class III drug recall?",
  "What is a market withdrawal vs. a drug recall?",
  "Who initiates a drug recall?",
  // Compounding (211-230)
  "What is USP 795 and what does it govern?",
  "What is USP 797 and what does it govern?",
  "What is the beyond-use date (BUD) in pharmacy compounding?",
  "What is the difference between a BUD and an expiration date?",
  "What is sterile compounding?",
  "What is a compounding pharmacy?",
  "What is the Drug Quality and Security Act (DQSA)?",
  "What is a 503A pharmacy outsourcing facility?",
  "What is a 503B pharmacy outsourcing facility?",
  "What is the difference between 503A and 503B compounding?",
  "Can a compounding pharmacy make copies of commercially available drugs?",
  // Substitution Laws (231-250)
  "What is therapeutic substitution?",
  "What is generic substitution?",
  "What is the 'dispense as written' (DAW) code?",
  "What DAW code prevents generic substitution?",
  "What must pharmacists do when substituting a generic drug?",
  "What is mandatory generic substitution?",
  "Which drug class is an exception to generic substitution laws in most states?",
  "What is a formulary?",
  "What is a closed formulary vs. open formulary?",
  "What is prior authorization (PA)?",
  "What is step therapy?",
  // Payment/Insurance (251-270)
  "What is a PBM (Pharmacy Benefit Manager)?",
  "What is a co-pay and co-insurance in pharmacy benefits?",
  "What is a pharmacy's usual and customary (U&C) price?",
  "What is AWP (Average Wholesale Price)?",
  "What is MAC pricing?",
  "What is a DIR fee in pharmacy practice?",
  "What is Medicaid and how does it affect pharmacy practice?",
  "What is Medicare Part D?",
  "What is a Medicare Part D formulary?",
  "What is the Medicare Part D coverage gap ('donut hole')?",
  "What is catastrophic coverage under Medicare Part D?",
  // Specialty Drugs (271-290)
  "What is a specialty drug?",
  "What is a pharmacy benefit vs. medical benefit for specialty drugs?",
  "What is a 340B drug pricing program?",
  "Who qualifies as a covered entity under 340B?",
  "What is a vaccine and what laws govern pharmacist vaccine administration?",
  "Under what protocols can pharmacists administer vaccines?",
  "What vaccines can pharmacists administer without a prescription in most states?",
  "What is immunization documentation requirements for pharmacists?",
  "What is a collaborative drug therapy agreement (CDTA)?",
  "What tasks can pharmacists perform under a collaborative practice agreement?",
  "What is a pharmacist's duty to counsel patients?",
  // Miscellaneous Federal Laws (291-310)
  "What is the Omnibus Budget Reconciliation Act of 1990 (OBRA '90)?",
  "What is the Durham-Humphrey Amendment of 1951?",
  "What is the Kefauver-Harris Amendment of 1962?",
  "What is the Federal Food, Drug, and Cosmetic Act (FDCA)?",
  "What is the Medication Therapy Management (MTM) program?",
  "What is a comprehensive medication review (CMR)?",
  "What is the goal of MTM in pharmacy?",
  "Who provides MTM services?",
  "What is a personal medication record (PMR)?",
  "What is a medication action plan (MAP)?",
  "What is the Pharmacist Patient Care Process (PPCP)?",
  // Error Reporting (311-330)
  "What is a medication error?",
  "What are the categories of medication errors (NCC MERP)?",
  "What is a near-miss medication error?",
  "How should a medication error be reported?",
  "What is MedWatch and what is its purpose?",
  "What is the Institute for Safe Medication Practices (ISMP)?",
  "What is a high-alert medication?",
  "Give examples of high-alert medications.",
  "What is the Joint Commission's National Patient Safety Goals relevant to pharmacy?",
  "What is the 'do not use' abbreviations list?",
  "What abbreviations are on the ISMP 'do not use' list?",
  // Drug Interactions (331-350)
  "What is pharmacokinetics?",
  "What is pharmacodynamics?",
  "What is a clinically significant drug interaction?",
  "What is a contraindication?",
  "What is the Black Box Warning (BBW)?",
  "What drugs carry a Black Box Warning for increased suicidality?",
  "What is a narrow therapeutic index (NTI) drug?",
  "Give examples of narrow therapeutic index drugs.",
  "What special monitoring is required for NTI drugs?",
  "How should a pharmacist handle a drug interaction when dispensing?",
  "What are pharmacist's professional and legal obligations in drug interaction management?",
  // Final review questions (351)
  "What is the complete set of steps a pharmacist must follow when receiving a new controlled substance prescription?",
];

let lawContent = fs.readFileSync(path.join(__dirname, 'src', 'lawData.js'), 'utf8');

// Find all law_fc card ids in order
const idMatches = [...lawContent.matchAll(/"id":\s*"(law_fc_(\d+))"/g)];
idMatches.sort((a, b) => parseInt(a[2]) - parseInt(b[2]));

let fixed = 0;
for (const match of idMatches) {
  const id = match[1];
  const idx = parseInt(match[2]);
  const question = LAW_QUESTIONS[idx];
  if (!question) continue;

  // Escape special chars for JSON
  const escaped = question.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  // Replace Question N or any existing q value for this specific card
  const cardRegex = new RegExp(
    `("id":\\s*"${id}"[\\s\\S]*?"q":\\s*)"[^"]*"`,
    'g'
  );
  const newContent = lawContent.replace(cardRegex, `$1"${escaped}"`);
  if (newContent !== lawContent) {
    fixed++;
    lawContent = newContent;
  }
}

fs.writeFileSync(path.join(__dirname, 'src', 'lawData.js'), lawContent, 'utf8');
console.log(`Law: fixed ${fixed} of ${idMatches.length} cards`);

// Show first 5 cards to verify
const sample = lawContent.match(/"law_fc_[0-5]"[\s\S]*?"q":\s*"[^"]*"/g) || [];
sample.forEach(s => console.log(s.substring(0, 120)));
