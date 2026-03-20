/**
 * MARIAM PRO  QuestionVarietyEngine
 * Generates diverse exam questions across Bloom's taxonomy levels
 * and multiple question format types.
 */

export const COGNITIVE_LEVELS = {
  REMEMBER:    'remember',
  UNDERSTAND:  'understand',
  APPLY:       'apply',
  ANALYZE:     'analyze',
  EVALUATE:    'evaluate',
  CREATE:      'create',
};

export const QUESTION_TYPES = {
  MCQ:             'mcq',           // Multiple-choice (4 options)
  MCQ_MULTI:       'mcq_multi',     // Multiple correct answers
  TRUE_FALSE:      'true_false',
  SHORT_ANSWER:    'short_answer',
  FILL_BLANK:      'fill_blank',
  MATCHING:        'matching',
  ORDERING:        'ordering',
  CASE_BASED:      'case_based',    // Scenario + sub-questions
  CALCULATION:     'calculation',
  DIAGRAM_LABEL:   'diagram_label',
};

/** Dimension weights by subject type */
export const SUBJECT_PROFILES = {
  medicine: {
    case_based:   0.30,
    mcq:          0.35,
    short_answer: 0.15,
    true_false:   0.10,
    matching:     0.10,
  },
  pharmacology: {
    mcq:          0.40,
    case_based:   0.25,
    matching:     0.15,
    fill_blank:   0.10,
    true_false:   0.10,
  },
  law: {
    mcq:          0.50,
    true_false:   0.20,
    short_answer: 0.20,
    case_based:   0.10,
  },
  default: {
    mcq:          0.50,
    true_false:   0.20,
    short_answer: 0.20,
    fill_blank:   0.10,
  },
};

/**
 * Build a system-prompt suffix that instructs the AI to vary question types
 * according to the given subject profile.
 *
 * @param {string} subject    - e.g. 'medicine', 'pharmacology'
 * @param {number} count      - total questions requested
 * @param {string} cogLevel   - COGNITIVE_LEVELS value (optional)
 * @returns {string}
 */
export function buildVarietyInstruction(subject = 'default', count = 10, cogLevel = null) {
  const profile = SUBJECT_PROFILES[subject] || SUBJECT_PROFILES.default;

  const distribution = Object.entries(profile)
    .map(([type, weight]) => `   ${Math.max(1, Math.round(weight * count))}  ${type}`)
    .join('\n');

  const levelClause = cogLevel
    ? `\nTarget Bloom's taxonomy level: ${cogLevel.toUpperCase()}.`
    : '';

  return `
## Question Variety Requirements${levelClause}
Distribute the ${count} questions as follows (adjust 1 to hit exact count):
${distribution}

Rules:
- MCQ must have exactly 4 options (AD), one clearly correct.
- Case-based must have a clinical/legal scenario  3 sentences then sub-questions.
- Fill-in-the-blank: use ___ (3 underscores) for the blank.
- Matching: provide two columns (Term | Definition), 56 pairs.
- Ordering: provide steps out of order, ask to arrange correctly.
- True/False: include a brief 1-sentence justification in the answer.
- Each question must include a "difficulty" field: easy | medium | hard.
`;
}

/**
 * Select a random weighted question type from a profile.
 * Useful for single-question generation calls.
 *
 * @param {string} subject
 * @returns {string} QUESTION_TYPES value
 */
export function pickQuestionType(subject = 'default') {
  const profile = SUBJECT_PROFILES[subject] || SUBJECT_PROFILES.default;
  const rand = Math.random();
  let cumulative = 0;
  for (const [type, weight] of Object.entries(profile)) {
    cumulative += weight;
    if (rand <= cumulative) return type;
  }
  return QUESTION_TYPES.MCQ;
}

/** All testable question dimensions per domain (Phase 3.1 spec) */
export const QUESTION_DIMENSIONS = {
  pharmacology: [
    'brand_name', 'generic_name', 'drug_class', 'mechanism_of_action',
    'primary_indication', 'secondary_indications', 'dosing_form',
    'route_of_administration', 'onset_of_action', 'duration_of_action',
    'common_side_effects', 'serious_adverse_effects', 'black_box_warning',
    'contraindications', 'drug_interactions', 'pregnancy_category',
    'monitoring_parameters', 'patient_counseling', 'reversal_agent',
    'comparison_to_similar_drugs', 'clinical_vignette_application',
    'pharmacokinetics_absorption', 'pharmacokinetics_distribution',
    'pharmacokinetics_metabolism', 'pharmacokinetics_excretion',
    'overdose_presentation', 'overdose_management',
  ],
  clinical: [
    'diagnosis', 'pathophysiology', 'risk_factors', 'epidemiology',
    'presenting_symptoms', 'physical_exam_findings', 'diagnostic_workup',
    'gold_standard_test', 'imaging_of_choice', 'lab_interpretation',
    'first_line_treatment', 'second_line_treatment', 'surgical_indications',
    'complications', 'prognosis', 'prevention', 'screening_guidelines',
    'differential_diagnosis', 'clinical_vignette', 'next_best_step',
  ],
  counseling: [
    'theory_author', 'core_concept', 'technique_name', 'technique_application',
    'diagnosis_criteria', 'dsm5_criteria', 'treatment_approach',
    'evidence_base', 'contraindications', 'ethical_consideration',
    'cultural_consideration', 'case_vignette', 'compare_theories',
    'therapeutic_relationship', 'termination_criteria',
  ],
  law: [
    'statute_name', 'key_provision', 'exception', 'penalty',
    'application_scenario', 'comparison_statute', 'landmark_case',
    'jurisdictional_variation', 'ethical_obligation', 'reporting_duty',
  ],
  general: [
    'definition', 'example', 'application', 'comparison', 'cause_and_effect',
    'historical_context', 'current_relevance', 'critical_analysis',
    'synthesis', 'evaluation', 'multi_step_reasoning', 'case_study',
  ],
};

/** Difficulty tiers with cognitive level arrays */
export const DIFFICULTY_TIERS = {
  easy:   ['definition', 'recall', 'identification', 'listing'],
  medium: ['comparison', 'application', 'explanation', 'classification'],
  hard:   ['clinical_vignette', 'multi_step_reasoning', 'synthesis', 'evaluation', 'next_best_step'],
  insane: ['usmle_step3_vignette', 'multi_patient_management', 'ethics_conflict', 'complex_case_chain'],
};

/**
 * Stateful anti-repetition engine.
 * Tracks what dimensions/levels have been asked and rotates through them.
 */
export class QuestionVarietyEngine {
  constructor() {
    this.history = [];
    this.entityHistory = [];
  }

  getNextPromptDirective(totalAsked, difficulty = 'medium', domainHint = 'general') {
    const dims = QUESTION_DIMENSIONS[domainHint] || QUESTION_DIMENSIONS.general;
    const levels = DIFFICULTY_TIERS[difficulty] || DIFFICULTY_TIERS.medium;

    // Count usage of each dimension
    const dimCounts = {};
    dims.forEach(d => { dimCounts[d] = 0; });
    this.history.forEach(h => { if (dimCounts[h.dimension] !== undefined) dimCounts[h.dimension]++; });

    // Pick least-used dimension
    const sorted = [...dims].sort((a, b) => (dimCounts[a] || 0) - (dimCounts[b] || 0));
    const targetDimension = sorted[0];

    // Pick cognitive level not used 2+ times in last 3
    const last3Levels = this.history.slice(-3).map(h => h.cognitiveLevel);
    const levelCounts = {};
    last3Levels.forEach(l => { levelCounts[l] = (levelCounts[l] || 0) + 1; });
    const available = levels.filter(l => (levelCounts[l] || 0) < 2);
    const targetLevel = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : levels[Math.floor(Math.random() * levels.length)];

    this.history.push({ dimension: targetDimension, cognitiveLevel: targetLevel, index: totalAsked });

    const last3Dims = this.history.slice(-4, -1).map(h => h.dimension);
    const instruction = [
      `Question ${totalAsked + 1} MUST test: [${targetDimension}] at cognitive level [${targetLevel}].`,
      `DO NOT ask about: [${last3Dims.join(', ')}].`,
      `Previous question types used: ${JSON.stringify(dimCounts)}.`,
      `Force yourself to pick a COMPLETELY DIFFERENT angle.`,
    ].join('\n');

    return { dimension: targetDimension, cognitiveLevel: targetLevel, instruction };
  }
}

export default { COGNITIVE_LEVELS, QUESTION_TYPES, QUESTION_DIMENSIONS, DIFFICULTY_TIERS, SUBJECT_PROFILES, buildVarietyInstruction, pickQuestionType, QuestionVarietyEngine };
