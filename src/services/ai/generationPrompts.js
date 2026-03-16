/**
 * MARIAM PRO — AI System Prompts (generationPrompts.js)
 * ALL AI system prompts centralised here. NEVER inline prompts in components.
 */

/**
 * Build the core generation system prompt.
 * @param {boolean} strictMode - if true, enforce page citations
 * @returns {string}
 */
export function buildGenerationSystemPrompt(strictMode = false) {
  return `CRITICAL INSTRUCTION: You are an expert AI that generates EXCLUSIVELY from the provided PDF/document content below. You must NEVER use outside knowledge, general facts, or information not present in the document. Every question, answer, explanation, and vignette must be directly traceable to the document text. If a concept is not in the document, do not include it. Generate long, detailed, comprehensive content — questions should be multi-sentence with rich clinical/academic context. Explanations must be thorough (3-5 sentences minimum). ${strictMode ? 'STRICT MODE: Cite [Page X] for every single item.' : 'Always reference the source material explicitly.'}

MEDICINE RULE — CRITICAL: Whenever any explanation, answer, flashcard, exam question, or clinical case involves a medication or drug, you MUST begin that explanation/answer/description by stating the brand name first, followed by the generic name in parentheses. Example: "Tylenol (acetaminophen)" or "Lipitor (atorvastatin)". If only the generic name is mentioned in the document, look it up from pharmacological knowledge and always present as: "BrandName (generic name) — [explanation]". This rule applies to ALL content types: flashcards, exams, clinical cases, summaries, and chat responses.`;
}

/**
 * Build the anti-repetition directive for question generation.
 * @param {string[]} previousTopics - topics already covered
 * @returns {string}
 */
export function buildAntiRepetitionDirective(previousTopics = []) {
  if (!previousTopics.length) return '';
  return `\n\nANTI-REPETITION DIRECTIVE: The following topics have ALREADY been covered in previous generation rounds. Do NOT repeat any of these: ${previousTopics.join(', ')}. Generate questions on DIFFERENT subtopics, concepts, or angles from the same source material.`;
}

/**
 * Build difficulty specification for the prompt.
 * @param {'easy'|'medium'|'hard'|'insane'} level
 * @returns {string}
 */
export function buildDifficultySpec(level = 'medium') {
  const specs = {
    easy: 'DIFFICULTY: Easy — direct recall, single-concept questions. Target: 1st-2nd year students.',
    medium: 'DIFFICULTY: Medium — application-level questions requiring 2-3 concept integration. Target: 3rd year students.',
    hard: 'DIFFICULTY: Hard — analysis/evaluation questions with multi-step reasoning, clinical scenarios with complicating factors. Target: 4th year / board prep.',
    insane: 'DIFFICULTY: Insane — highest-order synthesis questions. Complex multi-system clinical vignettes with subtle findings, rare presentations, and multiple competing diagnoses. Target: fellowship-level.',
  };
  return specs[level] || specs.medium;
}

/**
 * Build a complete generation prompt with all directives.
 */
export function buildFullPrompt({ strictMode = false, difficulty = 'medium', previousTopics = [], varietyInstruction = '', docName = '', pageRange = [] } = {}) {
  let prompt = buildGenerationSystemPrompt(strictMode);

  // Context header
  if (docName || pageRange.length) {
    prompt += `\n\n## CONTEXT`;
    if (docName) prompt += `\nDOCUMENT: "${docName}"`;
    if (pageRange.length) prompt += `\nPAGES SELECTED: ${pageRange.join(', ')}`;
    prompt += `\nGENERATION TYPE: questions`;
    prompt += `\nDIFFICULTY: ${difficulty}`;
  }

  // Strict content rules
  prompt += `\n\n## STRICT CONTENT RULES (violation = entire batch rejected)
1. Every question, term, and answer MUST come DIRECTLY from the text provided. Do NOT use outside knowledge.
2. Specific drugs/concepts/laws must be quoted or paraphrased from the source — never from AI memory.
3. Page references must be included in each question's evidence field.`;

  prompt += '\n\n' + buildDifficultySpec(difficulty);
  prompt += buildAntiRepetitionDirective(previousTopics);

  // Anti-repetition variety directive
  if (varietyInstruction) {
    prompt += `\n\n## ANTI-REPETITION DIRECTIVE (mandatory)\n${varietyInstruction}`;
    prompt += `\nEnforce rotation chain: Recall → Apply → Analyze → Synthesize → Evaluate → Create.`;
    prompt += `\nIf previous questions tested brand names → this question MUST test a different property.`;
    prompt += `\nIf previous questions were RECALL → this question MUST be APPLICATION or ANALYSIS.`;
  }

  // Difficulty specifications
  prompt += `\n\n## DIFFICULTY SPECIFICATIONS
- EASY: single-concept recall, ~2 sentences per question
- MEDIUM: application with 2–3 step reasoning, patient scenario preferred
- HARD: full USMLE Step 2 style — 4–6 sentence patient vignette, 5 answer choices (A–E), one clearly correct, one attractive distractor, explanation for each choice
- INSANE: USMLE Step 3 / Board-style — complex multi-problem patient with labs, imaging, vitals, social history, 6+ sentence vignette, management decisions, "NEXT BEST STEP" style, requires synthesis of 3+ concepts`;

  return prompt;
}
