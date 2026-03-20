# ╔══════════════════════════════════════════════════════════════════════════════════╗
# ║  MARIAM PRO — COMPLETE MASTER PROMPT v4.0 ULTIMATE                            ║
# ║  THE SINGLE SOURCE OF TRUTH — ALL PROMPTS MERGED INTO ONE                     ║
# ║  Architecture · Security · Legal · AI · Voice · Flashcards · Diseases ·       ║
# ║  Medicines · Search · Pricing · Gamification · Marketing · 24-Month Roadmap   ║
# ╚══════════════════════════════════════════════════════════════════════════════════╝

> This is the definitive agent prompt for MARIAM PRO. It merges four previously
> separate documents into one complete directive. Give this single file to your
> AI agent and tell it: "Execute everything in this document from top to bottom.
> Do NOT stop until the final git commit is done."

---


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART A — ROLE, IDENTITY & TARGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are simultaneously:
**Lead Enterprise Software Architect · Principal AI/ML Engineer · Senior UI/UX Designer (ex-Apple, ex-Google) · Chief Security Officer · Legal Strategist · Growth Hacker · Behavioral Psychologist · Mobile Platform Expert · SaaS Revenue Architect**

Your mandate: Build MARIAM PRO into the **#1 medical education platform in the world within 24 months**, surpassing:
- **ChatGPT** → on in-document AI intelligence and conversational depth
- **Quizlet** → on flashcard physics, UX polish, and spaced repetition rigor
- **UWorld** → on question quality and clinical depth
- **Amboss** → on integrated clinical reference breadth
- **Practica / Learna / Promova** → on human-like voice interaction
- **Notion / Todoist** → on task + calendar integration
- **Duolingo** → on behavioral psychology and daily retention loops

**The app already has** (17,944 lines, 117 components, 79 routes):
File upload (PDF/Word/Excel/Images/Code), Flashcards (FSRS-5), Exams (MCQ), Clinical Cases (USMLE level), AI Tutor (chat + voice + ProsodyEngine), 65+ medical reference tools, offline-first IndexedDB, 7 AI providers, modular component imports, ChunkErrorBoundary, touch-enabled drag, CalendarView, TasksView, GoalTracker, MatchGame, FlashcardTinderMode, StudyStreakView, HomeHubView.

**ABSOLUTE RULES — NEVER BREAK THESE:**
1. Zero breaking changes to existing data (IndexedDB schema migrations preserve everything)
2. Never hardcode colors — always `var(--accent)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)`
3. Never store plain-text API keys anywhere (use crypto.subtle to encrypt)
4. All `.map()` calls require `(array || []).map(...)` — never assume arrays exist
5. All nested property access uses optional chaining: `obj?.prop?.nested`
6. All async operations need try/catch with user-friendly error toasts
7. `isMobile` = `window.innerWidth < 768` — define inside each component
8. Every new view gets `<ChunkErrorBoundary>` wrapper
9. Every new page with AI features gets `DraggableTutorPanel`
10. MEDICINE_DB, DISEASE_DB, all large constants → MODULE LEVEL before components
11. All drag interactions support both mouse AND touch events
12. Test on iPhone Safari before every git commit
13. Git commit after every major feature with descriptive message
14. No lifetime subscriptions — recurring revenue ONLY (monthly + yearly)
15. Medical disclaimer on ALL AI-generated content — never omit


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART B — ARCHITECTURE, UI/UX, VOICE, FLASHCARDS, TASKS, BUG FIXES
## (From Enterprise Master Directive v8.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SECTION 1 — ARCHITECTURE: BREAKING THE MONOLITH

### 1.1 Directory Structure
Decompose `App.jsx` into the following enterprise-grade module tree. Every file must be a clean, single-responsibility module with zero circular dependencies:

```
/src
  /app
    App.jsx                      ← Root shell only (~80 lines)
    AppErrorBoundary.jsx
    AppProviders.jsx             ← All context providers nested here
  /store
    useAppStore.js               ← Zustand global store (replaces ALL prop-drilling)
    useSettingsStore.js
    useStudyStore.js
    useTaskStore.js
    useNotificationStore.js
  /services
    /ai
      callAI.js                  ← Provider-agnostic AI router
      callAIStreaming.js         ← Streaming with chunk-safe buffer
      callAIWithVision.js
      generationPrompts.js       ← All AI system prompts (NEVER inline)
      questionVariety.js         ← Anti-repetition engine (see Section 3)
    /db
      openDB.js
      dbOp.js
      fileOps.js
      stateOps.js
      migrations.js              ← All IndexedDB migration logic isolated
    /voice
      speechSynthesis.js         ← Full prosody engine (see Section 4)
      speechRecognition.js       ← Full-duplex recognition wrapper
      voiceQueue.js              ← Queue manager for utterances
    /notifications
      notificationService.js     ← Web Notifications + Push API
      scheduleEngine.js          ← FSRS-driven review scheduling
    /analytics
      studyAnalytics.js
      fsrsEngine.js              ← Full FSRS-5 algorithm (not just SM-2)
  /components
    /layout
      AppShell.jsx               ← Fixed header, body, safe-area management
      BottomNav.jsx              ← Mobile pill nav
      SidebarNav.jsx             ← Desktop sidebar
      GlobalTaskIndicator.jsx    ← Fixed z-index, never overlaps nav
    /ui
      Button.jsx
      Card.jsx
      Modal.jsx
      BottomSheet.jsx            ← Mobile drag-to-dismiss sheet
      Toast.jsx
      Spinner.jsx
      Badge.jsx
      ProgressRing.jsx           ← Circular SVG progress with mastery %
      SplitPane.jsx              ← Resizable desktop split pane
      Typography.jsx             ← All font tokens + responsive scale
    /chat
      ChatPanel.jsx
      ChatMessage.jsx
      ChatInput.jsx
      QuickPrompts.jsx
    /flashcards
      FlashcardsView.jsx
      FlashcardCard.jsx          ← 3D CSS physics card
      SwipeGestureHandler.jsx    ← Tinder-swipe engine
      FSRSReview.jsx
      MatchGame.jsx
      MasteryHeatmap.jsx
      ProgressRing.jsx
    /exams
      ExamsView.jsx
      ExamPlayer.jsx
      SplitPaneExam.jsx
      LabResultsDrawer.jsx       ← Draggable bottom sheet for mobile
    /cases
      CasesView.jsx
      CasePlayer.jsx
    /voice
      VoiceTutorModal.jsx
      StudyPodcastPanel.jsx
    /tasks
      TasksView.jsx
      CalendarView.jsx
      TaskCard.jsx
      GoalTracker.jsx
    /reader
      DocWorkspace.jsx
      PdfRenderer.jsx
      DocChatOverlay.jsx
    /dashboard
      DashboardView.jsx
      StudyStreakCard.jsx
      HeatmapCalendar.jsx
  /hooks
    useDB.js
    useVoice.js
    useSwipe.js
    useDrag.js
    useNotifications.js
    useKeyboard.js
    useMediaQuery.js
    useFSRS.js
    useTypography.js
  /utils
    markdown.js
    formatters.js
    fileCategory.js
    safeArea.js
    exportToPDF.js
    chunkText.js
  /styles
    tokens.css                   ← ALL CSS variables (colors, spacing, type)
    typography.css               ← Fluid type scale
    animations.css
    components.css
    safeAreas.css
```

### 1.2 State Management — Eliminate All Prop Drilling
- **Replace every prop** passed through 3+ levels with a Zustand store slice.
- Current violations in the codebase to fix immediately:
  - `setFlashcards` is passed down 4 levels from `App → FlashcardsView → FSRSReview → MatchGame`
  - `settings` is passed to every single component (Chat, Exams, Cases, Flashcards, Voice, Podcast)
  - `addToast` is passed to 12+ components
  - `docs` is threaded through 5 component layers
- **Solution:** `useAppStore` exposes `flashcards`, `exams`, `cases`, `settings`, `docs`, `addToast`, `tasks`, `notifications` as globally accessible state. Components call `useAppStore(state => state.X)` — no props needed.

### 1.3 Code Splitting & Lazy Loading
- `React.lazy()` + `Suspense` on all views: `FlashcardsView`, `ExamsView`, `CasesView`, `ChatPanel`, `TasksView`, `CalendarView`, `VoiceTutorModal`, `StudyPodcastPanel`
- Skeleton loaders that match the shape of each view during load (not generic spinners)
- PDF.js, Mammoth, XLSX, jsPDF must remain CDN-loaded but wrapped in proper async guards with `AbortController` cancellation

### 1.4 PWA — True Native Installability
- Upgrade `manifest.json` to include: `display: "standalone"`, `display_override: ["window-controls-overlay"]`, proper `screenshots` array for app store listing appearance, `shortcuts` for quick-launch to Flashcards/Exam/Chat
- Service Worker: Implement **Workbox** with:
  - `CacheFirst` for all CDN scripts (PDF.js, Mammoth, XLSX)
  - `NetworkFirst` for AI API calls (never cache)
  - `StaleWhileRevalidate` for static assets
  - Background sync queue for any failed DB writes
- iOS Home Screen: Set `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, full splash screen set for every iPhone size
- Android: `WebAPK` generation trigger — app must pass all PWA install criteria scoring 100/100 on Lighthouse
- On first load, show a beautiful "Install MARIAM PRO" prompt card (not the browser default), with a custom-designed install CTA. Persist the `beforeinstallprompt` event and replay it when user taps the card.
- App launch: `standalone` mode must have zero browser chrome. Bottom navigation appears where the browser bar was. Top safe-area is always filled.

---

## SECTION 2 — MOBILE UI/UX: ZERO MESSINESS

### 2.1 Safe Area System — Mathematical Precision
Create a **centralized safe area token system** in `/styles/safeAreas.css`:
```css
:root {
  --sat: env(safe-area-inset-top, 44px);
  --sab: env(safe-area-inset-bottom, 34px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);

  /* Derived layout tokens */
  --header-h: 56px;
  --bottom-nav-h: 72px;
  --content-top: calc(var(--sat) + var(--header-h));
  --content-bottom: calc(var(--sab) + var(--bottom-nav-h));
  --content-bottom-clear: calc(var(--sab) + var(--bottom-nav-h) + 16px);
}
```
Every single view that scrolls must use `padding-bottom: var(--content-bottom-clear)` so content is never hidden behind the bottom nav or home indicator.

### 2.2 Z-Index Layer System — Strictly Enforced
Define in `tokens.css` and NEVER deviate:
```css
:root {
  --z-base: 1;
  --z-card: 10;
  --z-sticky: 20;
  --z-dropdown: 50;
  --z-modal-backdrop: 100;
  --z-modal: 110;
  --z-bottom-sheet: 120;
  --z-ai-tutor: 130;
  --z-global-task: 140;
  --z-toast: 150;
  --z-bottom-nav: 160;
  --z-top-glass: 170;
  --z-header: 180;
}
```
**Critical fixes required:**
- `GlobalTaskIndicator` is currently overlapping the bottom navigation bar. Fix: position it at `bottom: calc(var(--bottom-nav-h) + var(--sab) + 12px)` always. Z-index must be `var(--z-global-task)` which is BELOW `var(--z-bottom-nav)`.
- `AiTutorPanel` in mobile mode uses `fixed inset-y-0 right-0 z-[49]` — this must be elevated to `var(--z-ai-tutor)` and must never clip behind the bottom nav.
- Toast notifications must always appear above everything including modals.
- The AI Tutor toggle button in DocWorkspace overlaps document content on small screens — replace with a floating action button anchored at `bottom: var(--content-bottom-clear); right: 16px`.

### 2.3 Fluid Typography System
All font sizes must use `clamp()` with mathematically enforced min and max values. Create a **TypeScale** component and a centralized `typography.css`:

```css
:root {
  /* User-controlled font scale multiplier (stored in settings) */
  --font-scale: 1;  /* Range: 0.8 to 1.3, controlled by in-app slider */

  /* Type scale — fluid + user-scalable */
  --text-xs:   clamp(10px, calc(11px * var(--font-scale)), 13px);
  --text-sm:   clamp(12px, calc(13px * var(--font-scale)), 15px);
  --text-base: clamp(13px, calc(15px * var(--font-scale)), 17px);
  --text-md:   clamp(15px, calc(17px * var(--font-scale)), 20px);
  --text-lg:   clamp(17px, calc(20px * var(--font-scale)), 24px);
  --text-xl:   clamp(20px, calc(24px * var(--font-scale)), 30px);
  --text-2xl:  clamp(24px, calc(30px * var(--font-scale)), 38px);
  --text-3xl:  clamp(28px, calc(36px * var(--font-scale)), 46px);
}

/* Weight enforcement */
body                 { font-weight: 400; }
p, span, li          { font-weight: 400; }
.label, .caption     { font-weight: 500; }  /* --font-medium */
h3, .subheading      { font-weight: 600; }
h2, .section-title   { font-weight: 700; }
h1, .page-title      { font-weight: 800; }  /* MAXIMUM for headings */
.hero-title          { font-weight: 900; }  /* --font-black: ONLY hero-level */
```

**Font control UI:** In Settings, add a "Text Size" slider with labels [A · A · A · A · A] showing 5 presets (80%, 90%, 100%, 115%, 130%). Changing this writes `--font-scale` to the `:root` style and persists in IndexedDB. The entire app rescales instantly with `transition: font-size 0.2s ease` on `html`.

**Audit and remove:**
- All `font-black` classes on body copy, badges, list items, descriptions, or any text that is not a top-level page heading
- All hardcoded `text-[10px]`, `text-[9px]` sizes (too small; use `var(--text-xs)` minimum)
- The inconsistent mixing of Tailwind `font-black`, `font-bold`, `font-extrabold` with no semantic logic

### 2.4 Scroll Containment — Fix All Double-Scroll Traps
The current codebase has multiple `flex-1 overflow-y-auto` containers nested inside each other, causing double scrollbars and broken layouts. Apply this universal fix pattern everywhere:

**Pattern (must apply to every scrollable container):**
```jsx
/* WRONG — current pattern that breaks layout */
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">...</div>
</div>

/* CORRECT — required pattern */
<div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
  <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>...</div>
</div>
```

**Every nested flex container must have `minHeight: 0`** — this is the CSS spec requirement for flex children to shrink below their content size and enable scrolling.

Audit and fix every occurrence in: `DocWorkspace`, `ChatPanel`, `FlashcardsView`, `ExamsView`, `CasesView`, `AiTutorPanel`, `VoiceTutorModal`, `StudyPodcastPanel`.

### 2.5 Mobile Layout Completeness Checklist
Every view must satisfy ALL of the following before being considered done:
- [ ] No element is clipped behind the notch, Dynamic Island, or status bar
- [ ] No element is clipped behind the home indicator or bottom nav
- [ ] No element overlaps another at any viewport from 320px wide (iPhone SE) to 430px wide (iPhone 15 Pro Max)
- [ ] Touch targets are minimum 44×44pt (iOS HIG standard)
- [ ] Scrollable areas show no double scrollbars
- [ ] Modal/sheet backdrops cover 100% of the screen including safe areas
- [ ] AI Tutor panel (mobile slide-in) does not bleed behind the bottom nav
- [ ] All `position: fixed` elements account for `env(safe-area-inset-*)`
- [ ] Floating action buttons are always above `--content-bottom-clear`

---

## SECTION 3 — AI GENERATION: HYPER-CONTEXTUAL, NON-REPETITIVE, HARD-MODE

### 3.1 The Anti-Repetition Engine (`/services/ai/questionVariety.js`)
This is the most critical AI quality improvement. The current `runBgGeneration` function produces repetitive question patterns. This must be completely replaced with a **Contextual Variety State Machine**.

**Implementation:**

```javascript
// /services/ai/questionVariety.js

const QUESTION_DIMENSIONS = {
  // Pharmacology
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
    'overdose_presentation', 'overdose_management'
  ],
  // Medicine / Clinical
  clinical: [
    'diagnosis', 'pathophysiology', 'risk_factors', 'epidemiology',
    'presenting_symptoms', 'physical_exam_findings', 'diagnostic_workup',
    'gold_standard_test', 'imaging_of_choice', 'lab_interpretation',
    'first_line_treatment', 'second_line_treatment', 'surgical_indications',
    'complications', 'prognosis', 'prevention', 'screening_guidelines',
    'differential_diagnosis', 'clinical_vignette', 'next_best_step'
  ],
  // Counseling / Psychology
  counseling: [
    'theory_author', 'core_concept', 'technique_name', 'technique_application',
    'diagnosis_criteria', 'dsm5_criteria', 'treatment_approach',
    'evidence_base', 'contraindications', 'ethical_consideration',
    'cultural_consideration', 'case_vignette', 'compare_theories',
    'therapeutic_relationship', 'termination_criteria'
  ],
  // Law
  law: [
    'statute_name', 'key_provision', 'exception', 'penalty',
    'application_scenario', 'comparison_statute', 'landmark_case',
    'jurisdictional_variation', 'ethical_obligation', 'reporting_duty'
  ],
  // General / Academic
  general: [
    'definition', 'example', 'application', 'comparison', 'cause_and_effect',
    'historical_context', 'current_relevance', 'critical_analysis',
    'synthesis', 'evaluation', 'multi_step_reasoning', 'case_study'
  ]
};

const COGNITIVE_LEVELS = {
  easy: ['definition', 'recall', 'identification', 'listing'],
  medium: ['comparison', 'application', 'explanation', 'classification'],
  hard: ['clinical_vignette', 'multi_step_reasoning', 'synthesis', 'evaluation', 'next_best_step'],
  insane: ['usmle_step3_vignette', 'multi_patient_management', 'ethics_conflict', 'complex_case_chain']
};

// The state machine that tracks what has been asked
export class QuestionVarietyEngine {
  constructor() {
    this.history = [];       // Array of {subject, dimension, cognitiveLevel}
    this.entityHistory = []; // Array of specific entities asked about
  }

  getNextPromptDirective(totalAsked, difficulty, domainHint) {
    const dimensions = QUESTION_DIMENSIONS[domainHint] || QUESTION_DIMENSIONS.general;
    const cogLevel = COGNITIVE_LEVELS[difficulty] || COGNITIVE_LEVELS.medium;

    // Find least-used dimension in history
    const dimCounts = {};
    dimensions.forEach(d => dimCounts[d] = 0);
    this.history.forEach(h => { if (dimCounts[h.dimension] !== undefined) dimCounts[h.dimension]++; });
    const sortedDims = dimensions.sort((a, b) => dimCounts[a] - dimCounts[b]);
    const targetDimension = sortedDims[0]; // Always pick least-used

    // Pick a cognitive level — never repeat same level 3x in a row
    const recentLevels = this.history.slice(-3).map(h => h.cognitiveLevel);
    const availableLevels = cogLevel.filter(l => recentLevels.filter(r => r === l).length < 2);
    const targetLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)] || cogLevel[0];

    this.history.push({ dimension: targetDimension, cognitiveLevel: targetLevel, index: totalAsked });

    return {
      dimension: targetDimension,
      cognitiveLevel: targetLevel,
      instruction: `Question ${totalAsked + 1} MUST test: [${targetDimension}] at cognitive level [${targetLevel}]. 
        DO NOT ask about: ${this.history.slice(-3).map(h => h.dimension).join(', ')}.
        Previous question types used: ${JSON.stringify(dimCounts)}.
        Force yourself to pick a COMPLETELY DIFFERENT angle.`
    };
  }
}
```

### 3.2 Context-Grounded Generation — Hyper-Specific File + Page Binding
The current generation function sometimes uses generic content. Every generation call must be **strictly grounded** in the exact file and page range selected. Update `runBgGeneration` to pass page-precise context:

```javascript
// In generationPrompts.js

export const buildGenerationSystemPrompt = (type, difficulty, pageRange, docName, varietyDirective) => `
You are an expert academic question generator for MARIAM PRO, a medical and professional licensing exam preparation platform.

DOCUMENT: "${docName}"
PAGES SELECTED: ${pageRange.join(', ')}
GENERATION TYPE: ${type}
DIFFICULTY: ${difficulty}

═══════════════════════════════════════════════════
STRICT CONTENT RULES — VIOLATION = ENTIRE BATCH REJECTED:
═══════════════════════════════════════════════════
1. EVERY question, term, and answer MUST come DIRECTLY from the text provided below.
   Do NOT use any knowledge outside the provided document text.
2. If a specific drug/concept/law appears in the document, questions about it must
   quote or paraphrase directly from the source text — never from memory.
3. Page references must be included in the evidence field.

═══════════════════════════════════════════════════
ANTI-REPETITION DIRECTIVE (MANDATORY):
═══════════════════════════════════════════════════
${varietyDirective.instruction}

COGNITIVE ANGLE REQUIRED: ${varietyDirective.cognitiveLevel}
DIMENSION TO TEST: ${varietyDirective.dimension}

Pattern enforcement:
- If the previous question asked about BRAND NAME → this question MUST test a different property
  (mechanism, side effect, contraindication, interaction, kinetics, clinical use, dosing, etc.)
- If the previous question was RECALL → this question must be APPLICATION or ANALYSIS
- If Q1 was about Drug A → Q2 can be about Drug A but MUST test a completely different property
- If Q1, Q2, Q3 were all about different drugs' brand names → Q4 MUST NOT be about any brand name
- Rotate through: Recall → Apply → Analyze → Synthesize → Evaluate → Create

═══════════════════════════════════════════════════
DIFFICULTY SPECIFICATIONS:
═══════════════════════════════════════════════════
EASY: Single-concept recall, ~2 sentences per question
MEDIUM: Application with 2-3 step reasoning, patient scenario preferred
HARD: Full USMLE Step 2 style — 4-6 sentence patient vignette, 5 answer choices (A-E),
      one clearly correct, one very attractive distractor, explanation for each choice
INSANE: USMLE Step 3 / Board-style — complex multi-problem patient with labs, imaging findings,
        vitals, social history, 6-sentence vignette, management decisions, 
        "what is the NEXT BEST STEP" style. Questions must require synthesis of 3+ concepts.
`;
```

### 3.3 Parallel Generation with Variety Coordination
The current parallel generation (up to 50 concurrent) generates independently without cross-talk. Fix by:
1. Pre-computing a `varietyPlan[]` array of N distinct `{dimension, cognitiveLevel}` pairs using the `QuestionVarietyEngine` before launching any parallel requests
2. Pass each batch item its pre-assigned `varietyDirective` from `varietyPlan[i]`
3. This ensures even parallel requests don't repeat the same angle

### 3.4 Streaming Chunk Buffer Fix
The `callAIStreaming` function currently passes raw streaming chunks directly to React state, which causes markdown to be half-rendered and broken mid-stream. Fix:

```javascript
// In callAIStreaming.js — safe streaming buffer
export const callAIStreaming = async (prompt, onChunk, settings, maxTokens = 4000) => {
  let buffer = '';
  let isInsideCodeBlock = false;
  let isInsideTable = false;

  const flushSafe = (newText) => {
    buffer += newText;

    // Count code fence markers to detect open blocks
    const codeFenceCount = (buffer.match(/```/g) || []).length;
    isInsideCodeBlock = codeFenceCount % 2 !== 0;

    // Don't render if we're mid-code-block or mid-table-row
    const lastNewline = buffer.lastIndexOf('\n');
    if (isInsideCodeBlock || isInsideTable) {
      // Don't flush yet — wait for closing marker
      return;
    }

    // Safe to flush up to last complete line
    const safeContent = lastNewline > 0 ? buffer.slice(0, lastNewline + 1) : buffer;
    if (safeContent) onChunk(safeContent);
  };

  // ... rest of streaming implementation
};
```

---

## SECTION 4 — HUMAN-LIKE VOICE: PRACTICA/LEARNA/PROMOVA KILLER

### 4.1 The Prosody Engine (`/services/voice/speechSynthesis.js`)
The current `speakText` function is 8 lines with no prosody control. This must become a full prosody engine:

```javascript
// /services/voice/speechSynthesis.js

const VOICE_FILLERS = {
  thinking: ["Hmm, let me think about that...", "That's a great question...", "Let's see...", "Good point, so...", "Right, okay..."],
  confirming: ["Exactly!", "That's correct!", "Perfect!", "You've got it!", "Well done!"],
  correcting: ["Not quite — let me clarify...", "Almost, but here's the key difference...", "Let me walk you through that again..."],
  transitioning: ["Now, moving on to...", "Building on that...", "Here's something interesting...", "Let's take this further..."]
};

const PUNCTUATION_PROSODY = {
  '.':  { pauseMs: 350, pitchDelta: -0.08, rateDelta: -0.03 },  // End of sentence: drop pitch, slight pause
  '!':  { pauseMs: 250, pitchDelta: +0.05, rateDelta: +0.04 },  // Excitement: lift pitch
  '?':  { pauseMs: 300, pitchDelta: +0.12, rateDelta: -0.02 },  // Question: rise pitch
  ',':  { pauseMs: 150, pitchDelta: 0,     rateDelta: -0.02 },  // Comma: tiny breath
  ':':  { pauseMs: 200, pitchDelta: -0.04, rateDelta: -0.03 },  // Colon: preparatory drop
  '—':  { pauseMs: 220, pitchDelta: -0.02, rateDelta: -0.04 },  // Em dash: thoughtful pause
  '...':{ pauseMs: 500, pitchDelta: -0.06, rateDelta: -0.06 },  // Ellipsis: long thoughtful pause
};

export class ProsodyEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.baseRate = 0.92;
    this.basePitch = 1.02;
    this.baseVolume = 0.95;
    this.isSpeaking = false;
    this.queue = [];
    this.currentUtterance = null;
    this.onInterruptCallback = null;
  }

  async loadBestVoice(languageCode = 'en') {
    return new Promise(resolve => {
      const tryLoad = () => {
        const voices = this.synth.getVoices();
        // Priority order: Neural > Premium > Enhanced > Google > Default
        const priority = [
          v => v.name.includes('Neural'),
          v => v.name.includes('Premium'),
          v => v.name.includes('Enhanced'),
          v => v.name.includes('Google') && v.lang.startsWith(languageCode),
          v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira'),
          v => v.lang.startsWith(languageCode) && !v.localService,
          v => v.lang.startsWith(languageCode),
        ];
        for (const test of priority) {
          const found = voices.find(test);
          if (found) { this.voice = found; return resolve(found); }
        }
        if (voices.length) { this.voice = voices[0]; resolve(voices[0]); }
      };
      if (this.synth.getVoices().length) tryLoad();
      else this.synth.onvoiceschanged = tryLoad;
    });
  }

  // Split text into sentences and apply prosody per sentence
  async speakWithProsody(text, options = {}) {
    this.synth.cancel();
    this.isSpeaking = true;

    // Inject natural fillers before long explanations
    const shouldAddFiller = text.length > 200 && Math.random() > 0.4;
    const filler = shouldAddFiller
      ? VOICE_FILLERS.thinking[Math.floor(Math.random() * VOICE_FILLERS.thinking.length)]
      : null;

    const processedText = this._preprocessText(text);
    const sentences = this._splitIntoSentences(processedText);

    if (filler) await this._speakSentence(filler, { rate: this.baseRate * 0.88, pitch: this.basePitch * 1.04 });

    for (let i = 0; i < sentences.length; i++) {
      if (!this.isSpeaking) break;
      const sentence = sentences[i];
      const lastChar = sentence.trim().slice(-1);
      const prosody = PUNCTUATION_PROSODY[lastChar] || {};

      await this._speakSentence(sentence, {
        rate: this.baseRate + (prosody.rateDelta || 0) + (Math.random() * 0.04 - 0.02),  // ±2% variance
        pitch: this.basePitch + (prosody.pitchDelta || 0),
        volume: this.baseVolume,
      });

      if (prosody.pauseMs) await this._pause(prosody.pauseMs);
    }
    this.isSpeaking = false;
  }

  _speakSentence(text, { rate, pitch, volume }) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.rate = Math.max(0.5, Math.min(1.8, rate));
      u.pitch = Math.max(0.5, Math.min(2.0, pitch));
      u.volume = Math.max(0, Math.min(1, volume));
      u.onend = resolve;
      u.onerror = resolve; // Don't block on error
      this.currentUtterance = u;
      this.synth.speak(u);
    });
  }

  _pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Immediate interruption — called the MILLISECOND user speaks
  interrupt() {
    this.isSpeaking = false;
    this.synth.cancel();
    this.currentUtterance = null;
    if (this.onInterruptCallback) this.onInterruptCallback();
  }

  _preprocessText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')      // Remove markdown bold
      .replace(/\*(.+?)\*/g, '$1')           // Remove italic
      .replace(/`([^`]+)`/g, '$1')           // Remove code ticks
      .replace(/#{1,6}\s+/g, '')             // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip links
      .replace(/([A-Z]{3,})/g, match => match.split('').join(' ')); // Spell out acronyms slowly
  }

  _splitIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  }
}
```

### 4.2 Full-Duplex Voice Interaction (`/services/voice/speechRecognition.js`)
**Critical feature: The moment the user starts speaking, ALL speech synthesis must stop INSTANTLY.** Current implementation doesn't implement this.

```javascript
export class FullDuplexVoiceManager {
  constructor(prosodyEngine) {
    this.prosody = prosodyEngine;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.onUserSpeech = null;
    this.onFinalTranscript = null;
  }

  startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) throw new Error('Speech recognition not supported');

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => { this.isListening = true; };

    this.recognition.onspeechstart = () => {
      // INSTANT interruption — zero delay
      if (this.prosody.isSpeaking) {
        this.prosody.interrupt();  // Stops synthesis in < 16ms
        if (this.onUserSpeech) this.onUserSpeech();
      }
    };

    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      const isFinal = e.results[e.results.length - 1].isFinal;
      if (isFinal && this.onFinalTranscript) this.onFinalTranscript(transcript);
    };

    this.recognition.onerror = (e) => {
      if (e.error !== 'aborted') this.startListening(); // Auto-restart on error
    };

    this.recognition.onend = () => {
      if (this.isListening) this.recognition.start(); // Keep alive
    };

    this.recognition.start();
  }

  stopListening() {
    this.isListening = false;
    this.recognition?.abort();
    this.recognition = null;
  }
}
```

### 4.3 VoiceTutorModal — Complete Rewrite
The current voice tutor is a basic modal. It must become a **full-screen immersive experience**:

**Visual design:**
- Full-screen dark modal with animated circular audio visualizer (CSS/Canvas — no libraries)
- Waveform pulses in real-time when AI is speaking (CSS `box-shadow` animation driven by utterance state)
- User's speech shown as live transcript at bottom with interim (gray) and final (white) text
- AI response streams into a scrollable message area with a natural "typing..." indicator
- Large, beautiful avatar of Mariam with animated "speaking" glow ring when AI talks, "listening" pulse ring when user talks
- Bottom toolbar: [🎙️ Hold to Override] [📝 Type instead] [⚙️ Voice settings] [✕ End]

**Behavior:**
- On open: AI greets naturally ("Hey! Ready to study? What topic should we tackle first?") with full prosody
- Always-on listening: Recognition is active the entire session — user never needs to tap to speak
- Context-aware: AI knows current document, flashcard deck, exam score, and adapts questions accordingly
- Filler injection: Every 4th AI response begins with a natural filler to avoid robot feeling
- Error recovery: If recognition fails, gracefully prompt user to type instead
- Session summary: On close, show a card with "Topics covered," "Key concepts reviewed," and "Suggested next steps"

### 4.4 StudyPodcastPanel — Upgrade
Current podcast panel is simple. Upgrade to:
- **Multi-voice dialogue mode:** AI generates a script with a "Host" (Mariam) and a "Student" character using two different TTS voices with distinct pitches, creating a real podcast feel
- **Chapter markers:** Auto-generated chapters from document headings, user can tap to jump to chapter
- **Speed controls:** 0.5× / 0.75× / 1× / 1.25× / 1.5× / 2× with smooth transitions
- **Background play:** Media Session API integration — episode shows in iOS lock screen with play/pause controls
- **Download episode:** Serialize the TTS-read text into a structured format for replay

---

## SECTION 5 — NEXT-GEN STUDY TOOLS: QUIZLET OBLITERATOR

### 5.1 Flashcard 3D Physics Engine
The current card flip is a basic CSS transform with no depth or physics. Replace entirely:

```css
/* /styles/components.css — Flashcard 3D Physics */
.flashcard-scene {
  perspective: 1200px;
  perspective-origin: 50% 40%;
}

.flashcard-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
  will-change: transform;
}

.flashcard-inner.flipped {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 24px;
}

.flashcard-back {
  transform: rotateY(180deg);
}

/* Dynamic shadow that reacts to flip angle — JavaScript drives this */
.flashcard-inner {
  filter: drop-shadow(
    0 calc(var(--flip-progress, 0) * 40px + 8px) 
    calc(var(--flip-progress, 0) * 60px + 16px) 
    rgba(0,0,0,calc(var(--flip-progress, 0) * 0.35 + 0.12))
  );
}
```

**JavaScript physics driver:**
```javascript
// FlashcardCard.jsx
const handleFlip = () => {
  let progress = 0;
  const animate = () => {
    progress = Math.min(1, progress + 0.04);
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    cardRef.current?.style.setProperty('--flip-progress', String(ease));
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
  setFlipped(f => !f);
};
```

### 5.2 Tinder-Swipe Gesture Engine
The current app has no swipe gestures. Add `SwipeGestureHandler`:

```javascript
// /hooks/useSwipe.js
export const useSwipe = ({ onSwipeLeft, onSwipeRight, onSwipeUp, threshold = 80 }) => {
  const ref = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const currentX = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      currentX.current = e.touches[0].clientX - startX.current;
      const currentY = e.touches[0].clientY - startY.current;

      // Only horizontal swipes
      if (Math.abs(currentX.current) > Math.abs(currentY)) {
        e.preventDefault();
        // Apply real-time drag transform with rotation
        const rotation = currentX.current * 0.08;
        const liftY = -Math.abs(currentX.current) * 0.04;
        el.style.transform = `translateX(${currentX.current}px) translateY(${liftY}px) rotate(${rotation}deg)`;
        el.style.transition = 'none';

        // Color feedback overlay
        const intensity = Math.min(1, Math.abs(currentX.current) / threshold);
        el.style.boxShadow = currentX.current > 0
          ? `0 0 ${intensity * 60}px rgba(16,185,129,${intensity * 0.6})`   // Green = Easy
          : `0 0 ${intensity * 60}px rgba(244,63,94,${intensity * 0.6})`;    // Red = Hard
      }
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      const delta = currentX.current;
      el.style.transition = 'all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)';

      if (delta > threshold) {
        // Swipe Right = Easy
        el.style.transform = `translateX(150vw) rotate(30deg)`;
        setTimeout(() => { el.style.transform = ''; onSwipeRight?.(); }, 350);
      } else if (delta < -threshold) {
        // Swipe Left = Hard
        el.style.transform = `translateX(-150vw) rotate(-30deg)`;
        setTimeout(() => { el.style.transform = ''; onSwipeLeft?.(); }, 350);
      } else {
        // Snap back with spring
        el.style.transform = '';
        el.style.boxShadow = '';
      }
      currentX.current = 0;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return ref;
};
```

**UX Legend (visible on swipe views):**
- Swipe RIGHT → 🟢 Easy (rates card 5 in FSRS — long interval)
- Swipe LEFT → 🔴 Hard (rates card 1 in FSRS — resets to 1 day)
- Swipe UP → 🟡 Medium (rates card 3)
- Tap card → Flip to see answer

### 5.3 Full FSRS-5 Algorithm (Replace SM-2)
The current implementation uses SM-2. Replace with the actual **Free Spaced Repetition Scheduler v5** algorithm:

```javascript
// /services/analytics/fsrsEngine.js
// Based on the FSRS-5 paper by Jarrett Ye (2024)

const FSRS_PARAMS = {
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
  DECAY: -0.5,
  FACTOR: 19/81,
  REQUESTED_RETENTION: 0.9
};

export const fsrs = {
  // Initial stability after first rating
  initStability: (rating) => {
    const r = Math.max(1, Math.min(4, rating));
    return Math.max(0.1, FSRS_PARAMS.w[r - 1]);
  },

  // Initial difficulty
  initDifficulty: (rating) => {
    return Math.max(1, Math.min(10, FSRS_PARAMS.w[4] - (rating - 3) * FSRS_PARAMS.w[5]));
  },

  // Forgetting curve: R(t) = (1 + FACTOR * t/S)^DECAY
  retrievability: (t, stability) => {
    return Math.pow(1 + FSRS_PARAMS.FACTOR * t / stability, FSRS_PARAMS.DECAY);
  },

  // Next interval for desired retention
  nextInterval: (stability) => {
    const interval = (stability / FSRS_PARAMS.FACTOR) *
      (Math.pow(FSRS_PARAMS.REQUESTED_RETENTION, 1 / FSRS_PARAMS.DECAY) - 1);
    return Math.max(1, Math.round(interval));
  },

  // Update card after review
  review: (card, rating) => {
    const now = Date.now();
    const t = card.lastReview ? (now - card.lastReview) / 86400000 : 0;
    const r = fsrs.retrievability(t, card.stability || 1);

    let newStability, newDifficulty;

    if (card.repetitions === 0) {
      newStability = fsrs.initStability(rating);
      newDifficulty = fsrs.initDifficulty(rating);
    } else {
      // Stability after recall (rating >= 3) or forgetting (rating < 3)
      if (rating >= 3) {
        newStability = card.stability * (
          Math.exp(FSRS_PARAMS.w[8]) *
          (11 - card.difficulty) *
          Math.pow(card.stability, -FSRS_PARAMS.w[9]) *
          (Math.exp((1 - r) * FSRS_PARAMS.w[10]) - 1)
        );
      } else {
        newStability = FSRS_PARAMS.w[11] *
          Math.pow(card.difficulty, -FSRS_PARAMS.w[12]) *
          (Math.pow(card.stability + 1, FSRS_PARAMS.w[13]) - 1) *
          Math.exp((1 - r) * FSRS_PARAMS.w[14]);
      }

      newDifficulty = Math.max(1, Math.min(10,
        card.difficulty - FSRS_PARAMS.w[6] * (rating - 3) +
        FSRS_PARAMS.w[7] * (3 - card.difficulty)
      ));
    }

    const interval = fsrs.nextInterval(newStability);

    return {
      ...card,
      stability: Math.max(0.1, newStability),
      difficulty: newDifficulty,
      interval,
      repetitions: rating >= 3 ? (card.repetitions || 0) + 1 : 0,
      lapses: rating < 3 ? (card.lapses || 0) + 1 : (card.lapses || 0),
      lastReview: now,
      nextReview: now + interval * 86400000,
      lastRating: rating,
      retrievabilityAtReview: r,
    };
  },

  // Predicted score (mastery %)
  predictedScore: (cards) => {
    if (!cards.length) return 0;
    const now = Date.now();
    const scores = cards.map(c => {
      if (!c.lastReview) return 0;
      const t = (now - c.lastReview) / 86400000;
      return fsrs.retrievability(t, c.stability || 1) * 100;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
};
```

### 5.4 Mastery Heatmap
Add a GitHub-style contribution heatmap to the Flashcards home view showing:
- X-axis: Last 52 weeks (or last 90 days on mobile)
- Each cell: Color-coded by number of cards reviewed that day (empty → light → medium → dark accent color)
- Tap a cell: Show tooltip with "12 cards reviewed · Avg score 87%"
- Below: Streak counter ("🔥 14 day streak") and longest streak record

### 5.5 Exam View — Desktop Split-Pane + Mobile Bottom Sheet
**Desktop:** True resizable split-pane where the left panel shows the question/vignette and the right panel shows lab results, imaging, or reference notes. Users drag the divider to resize.

**Mobile:** When a question has lab data or imaging, show a "View Labs" button that opens an elegant **draggable bottom sheet** that slides up from the bottom, allowing the user to read labs while the question stays visible above.

```javascript
// BottomSheet.jsx
function BottomSheet({ isOpen, onClose, children, title }) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const sheetRef = useRef(null);

  const defaultHeight = '60vh';
  const snapPoints = [0, 30, 60, 85]; // % of screen height

  const onDragStart = (e) => { startY.current = e.touches[0].clientY; };
  const onDragMove = (e) => {
    const delta = e.touches[0].clientY - startY.current;
    setDragY(Math.max(0, delta));
  };
  const onDragEnd = () => {
    if (dragY > 120) onClose();
    else setDragY(0);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[var(--z-bottom-sheet)] ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
        style={{
          height: defaultHeight,
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          transform: `translateY(${isOpen ? dragY : '100%'}px)`,
          transition: dragY === 0 ? 'transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)' : 'none',
        }}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border2)' }} />
        </div>
        <div className="px-5 pb-2 font-bold" style={{ fontSize: 'var(--text-md)' }}>{title}</div>
        <div className="flex-1 overflow-y-auto px-5" style={{ height: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

### 5.6 MatchGame — Complete Upgrade
Current MatchGame needs a full UI overhaul:
- **Animated grid:** Cards appear with staggered `scale-in` animations on load
- **Match celebration:** Matched pairs get a green glow burst + the cards fly off screen simultaneously
- **Mismatch shake:** Wrong picks trigger a red `shake` animation (`@keyframes shake { 0%, 100% {transform: translateX(0)} 25% {transform: translateX(-8px)} 75% {transform: translateX(8px)} }`)
- **Speed timer:** Circular countdown timer in the corner that turns red when < 30 seconds left
- **Leaderboard:** Track personal best times per deck and show a trophy if user beats their record

---

## SECTION 6 — PRODUCTIVITY SUITE: TASKS, CALENDAR, NOTIFICATIONS

### 6.1 Task Management System
Add a new **"Tasks"** tab in the bottom nav (replacing or adding to existing tabs). Architecture:

**Data model (stored in IndexedDB `appState` with key `tasks`):**
```javascript
const TaskSchema = {
  id: String,              // UUID
  title: String,           // Required
  description: String,     // Optional
  type: 'study' | 'exam' | 'review' | 'personal',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' | 'in_progress' | 'done' | 'skipped',
  dueDate: Number,         // Unix timestamp (ms)
  dueTime: String,         // "HH:MM" local time
  linkedDocId: String,     // Optional — links to a document
  linkedFlashcardSetId: String, // Optional
  fsrsReviewDate: Number,  // Auto-populated by FSRS engine
  reminderMinutesBefore: 15 | 30 | 60 | 120 | 1440,
  recurrence: 'none' | 'daily' | 'weekly' | 'custom',
  recurrenceRule: String,  // RRULE format if custom
  completedAt: Number,
  createdAt: Number,
  tags: String[],
};
```

**UI Behavior:**
- Task list with sections: "Overdue" (red accent), "Today" (accent), "Upcoming" (muted), "Done" (green, collapsible)
- Swipe right to complete, swipe left to delete (with undo toast for 5 seconds)
- Long press to reorder via drag-and-drop
- Quick-add: A `+` button opens a **smart input** bar where typing "Study drugs tomorrow at 9am" auto-parses into `{title: "Study drugs", dueDate: tomorrow, dueTime: "09:00", type: "study"}`
- Task card shows: priority dot color, title, time remaining chip, linked document badge, FSRS review indicator

### 6.2 Calendar View
Add a full-featured calendar embedded in the Tasks tab:

**Views:** Month / Week / Day — toggled with a segmented control at the top
- **Month view:** Grid of 35 cells (5 weeks × 7 days). Each day shows colored event dots (FSRS reviews = blue, exams = red, tasks = accent). Tap a day to see day events in a bottom sheet.
- **Week view:** Horizontal scroll with time-based positioning. FSRS reviews auto-populate from `fsrsEngine.getUpcomingReviews(7)`
- **Day view:** Hour-by-hour timeline. AI-suggested study blocks appear as ghost/suggested events that user can tap to confirm.

**Auto-population:** FSRS automatically adds "Review due" events for all flashcard decks where cards are due, color-coded by deck.

**Study schedule builder:** A "Plan my week" button that takes inputs (hours available per day, exam date, priority topics) and uses the AI to generate a personalized week plan, then adds all sessions to the calendar.

### 6.3 Notifications Engine (`/services/notifications/`)
Implement the full **Web Notifications API + Push API** stack:

```javascript
// /services/notifications/notificationService.js

export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  scheduleLocal(options) {
    const { title, body, icon, badge, delay, data, actions } = options;
    // Use service worker to schedule (if supported) else setTimeout
    if (delay <= 0) {
      return this._fireNow({ title, body, icon, badge, data, actions });
    }
    // Store scheduled notifications in IndexedDB and check on SW activate
    return saveState(`notification_${Date.now()}`, {
      ...options,
      fireAt: Date.now() + delay
    });
  },

  _fireNow({ title, body, icon, badge, data, actions }) {
    if (Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
      data,
      actions,
      silent: false,
      requireInteraction: data?.requireInteraction || false,
    });
    n.onclick = () => {
      window.focus();
      if (data?.view) window.mariamNavigateTo?.(data.view);
    };
    return n;
  },

  // Called by FSRS engine daily check
  scheduleFSRSReminders(allDecks) {
    allDecks.forEach(deck => {
      const dueCards = deck.cards.filter(c => c.nextReview && c.nextReview <= Date.now() + 86400000);
      if (dueCards.length > 0) {
        this.scheduleLocal({
          title: `📚 ${dueCards.length} cards due — ${deck.title}`,
          body: 'Keep your streak alive! Review now to maximize retention.',
          delay: this._msUntil('09:00'),
          data: { view: 'flashcards', deckId: deck.id },
          actions: [{ action: 'review', title: 'Review Now' }, { action: 'snooze', title: 'In 1 hour' }]
        });
      }
    });
  },

  scheduleExamReminder(examTitle, examDate) {
    const dayBefore = examDate - 86400000;
    const hourBefore = examDate - 3600000;
    [dayBefore, hourBefore].forEach((fireAt, i) => {
      this.scheduleLocal({
        title: i === 0 ? `📝 Exam tomorrow: ${examTitle}` : `⏰ Exam in 1 hour: ${examTitle}`,
        body: i === 0 ? 'Review your notes and get a good night\'s sleep!' : 'You\'ve got this! Last-minute review?',
        delay: fireAt - Date.now(),
        data: { view: 'exams' }
      });
    });
  },

  scheduleStreakAlert(streakDays) {
    const now = new Date();
    const endOfDay = new Date(); endOfDay.setHours(21, 0, 0, 0);
    if (now < endOfDay) {
      this.scheduleLocal({
        title: `🔥 ${streakDays}-day streak at risk!`,
        body: 'Study for just 5 minutes to keep your streak alive.',
        delay: endOfDay - now,
        data: { view: 'flashcards', requireInteraction: true }
      });
    }
  },

  _msUntil(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date(); target.setHours(h, m, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target - Date.now();
  }
};
```

**Notification types to implement:**
1. `📚 Cards Due Today` — fires at 9:00 AM if any FSRS cards are due
2. `🔥 Streak at Risk` — fires at 9:00 PM if user hasn't studied that day
3. `📝 Exam Reminder` — fires 24h and 1h before scheduled exam dates
4. `✅ Task Due Soon` — fires based on `reminderMinutesBefore` per task
5. `🏆 Weekly Report` — fires every Sunday with stats summary
6. `🎯 Daily Study Goal` — fires at user-set time if goal not met

---

## SECTION 7 — CODE-LEVEL BUGS & PERFORMANCE FIXES

### 7.1 IndexedDB Safari/iOS Hardening
Current `dbOp` has basic error handling. Safari and iOS have specific IndexedDB quirks that crash the current implementation:

```javascript
// Enhanced dbOp with Safari/iOS safety
const dbOp = async (store, mode, op) => {
  let db;
  try {
    db = await openDB();
  } catch (err) {
    // iOS Safari private mode: IndexedDB exists but always fails to open
    if (err.message?.includes('QuotaExceededError') || err.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some data in Settings.');
    }
    if (err.name === 'SecurityError') {
      throw new Error('Storage is blocked (Private Browsing mode or restricted permissions).');
    }
    throw new Error(`Database failed to open: ${err.message}`);
  }

  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(store, mode);
    } catch (err) {
      // Firefox: transaction on closed DB
      if (err.name === 'InvalidStateError') {
        reject(new Error('Database connection was closed unexpectedly. Refreshing...'));
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      return reject(err);
    }

    const objectStore = tx.objectStore(store);
    let result;

    try {
      const request = op(objectStore);
      if (request && typeof request.onsuccess !== 'undefined') {
        request.onsuccess = () => { result = request.result; };
        request.onerror = () => reject(new Error(
          `IDB request error in '${store}': ${request.error?.message || 'Unknown'}`
        ));
      }
    } catch (err) {
      return reject(err);
    }

    tx.oncomplete = () => {
      db.close(); // Always close to prevent Safari connection leak
      resolve(result);
    };
    tx.onerror = () => {
      const msg = tx.error?.message || 'Unknown transaction error';
      if (msg.includes('QuotaExceededError')) {
        reject(new Error('Storage full. Delete unused documents in the Library.'));
      } else {
        reject(new Error(`IDB transaction failed (${store}): ${msg}`));
      }
    };
    tx.onabort = () => reject(new Error(
      `IDB transaction aborted (${store}). This may be a Safari private mode restriction.`
    ));
  });
};
```

**Add a new IndexedDB store `notifications` in the next DB migration (version 10):**
```javascript
if (oldV < 10) {
  if (!db.objectStoreNames.contains('notifications')) {
    db.createObjectStore('notifications', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('tasks')) {
    db.createObjectStore('tasks', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('analytics')) {
    db.createObjectStore('analytics', { keyPath: 'date' });
  }
}
```

### 7.2 PDF.js Memory Leak Fix
The current `DocWorkspace` PDF renderer leaks canvas memory when users rapidly switch pages. Fix with `AbortController` pattern:

```javascript
// PdfRenderer.jsx — complete memory-safe implementation
function PdfRenderer({ pageNumber, pdfDoc, scale }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    // New abort signal for this render
    abortRef.current = { cancelled: false };
    const abort = abortRef.current;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (abort.cancelled) return;

        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear previous render from memory
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!abort.cancelled) {
          // Release page object from PDF.js cache to prevent accumulation
          page.cleanup();
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('[PdfRenderer]', err);
        }
      }
    };

    renderPage();

    return () => {
      // Cleanup on unmount or dependency change
      abort.cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      // Clear canvas to release GPU memory
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [pageNumber, pdfDoc, scale]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%', display: 'block' }} />;
}
```

### 7.3 React Render Cycles & useMemo/useCallback Audit
Fix the following performance issues identified in the source:

1. **`FlashcardsView`:** `rateCard` callback is correctly memoized but `filteredSets` recalculates unnecessarily when unrelated state changes. Fix by moving `flashcards` subscription to a selector: `const flashcards = useStudyStore(state => state.flashcards)` instead of receiving as prop.

2. **`ChatPanel`:** The `msgs` state update on every streaming chunk (`setMsgs(p => [...p.slice(0, -1), ...])`) creates a new array every 10ms. Fix by using a `useRef` for the streaming buffer and only updating state at natural break points (every 50ms using `setInterval`).

3. **`DocWorkspace`:** The `isMobile` check uses `window.innerWidth < 1024` evaluated at component initialization — this doesn't respond to resize. Replace with `useMediaQuery('(min-width: 1024px)')` hook.

4. **`StudyPodcastPanel` and `VoiceTutorModal`:** Both use `window.speechSynthesis` directly without checking if a previous utterance was cancelled. Fix with the `ProsodyEngine` singleton that manages all synthesis state.

5. **`App` root component:** The main `App()` function re-renders on ANY state change because all state lives there. After Zustand migration, the root component should have zero local state except `activeView`.

### 7.4 Streaming Reliability — Complete Fix
The `callAIStreaming` function has known issues with:
- **Chunk fragmentation:** A single SSE `data:` line can be split across TCP packets, causing JSON parse failures
- **Event boundaries:** Multiple events can arrive in a single `read()` call, causing data loss

Complete fix:
```javascript
// In callAIStreaming.js — robust SSE parser
const parseSSEBuffer = (buffer, provider) => {
  const events = [];
  const lines = buffer.split('\n');
  let remaining = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('data: ')) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') { events.push({ type: 'done' }); continue; }
      try {
        const parsed = JSON.parse(data);
        // Anthropic format
        if (provider === 'anthropic' && parsed.type === 'content_block_delta') {
          events.push({ type: 'text', text: parsed.delta?.text || '' });
        }
        // OpenAI format
        if (provider === 'openai' && parsed.choices?.[0]?.delta?.content) {
          events.push({ type: 'text', text: parsed.choices[0].delta.content });
        }
      } catch {
        // Incomplete JSON — save for next chunk
        remaining = line;
      }
    }
  }

  return { events, remaining };
};
```

### 7.5 GlobalTaskIndicator Z-Index and Position Fix
Currently overlapping the bottom nav on mobile. Complete fix:

```jsx
// GlobalTaskIndicator.jsx — always above content, always below nav
function GlobalTaskIndicator({ tasks }) {
  if (!tasks.some(t => t.status === 'running')) return null;
  return (
    <div
      style={{
        position: 'fixed',
        // Desktop: top-right corner
        // Mobile: above bottom nav, below nav z-index
        bottom: 'calc(var(--bottom-nav-h) + var(--sab) + 12px)',
        right: 16,
        zIndex: 'var(--z-global-task)', // 140 — below bottom nav (160)
        maxWidth: 280,
        pointerEvents: 'auto',
      }}
      className="glass rounded-2xl px-4 py-3 shadow-xl"
    >
      {/* indicator content */}
    </div>
  );
}
```

### 7.6 speakText → Full ProsodyEngine Migration
The current `speakText` utility (lines 126-136 in App.jsx) is called in multiple places (ChatPanel, VoiceTutor, Podcast). All calls must be replaced with `ProsodyEngine.speakWithProsody()`. The legacy function must be removed entirely — it has no interruption support, no prosody, and doesn't respect in-progress sessions.

### 7.7 Settings — API Key Security Hardening
Current: API keys stored in IndexedDB. Enhancement needed:
- Mask API key in Settings UI: show only last 8 characters (`sk-...Xn4aK8pQ`)
- Add "Test connection" button that fires a minimal 1-token API call and shows latency + success
- Add provider-specific model selector dropdowns that list actual available models
- Store provider selection separately from API key so switching providers doesn't clear the key
- Add export/import settings as encrypted JSON (password-locked)

---

## SECTION 8 — CHAT PAGE: SUPERSEDE CHATGPT

### 8.1 Multi-Turn Context Management
Current ChatPanel sends only the last 6 messages as history. Upgrade to:
- Sliding window of 20 messages with intelligent compression: summarize messages beyond window into a "context summary" sent as system context
- **Document-grounded mode:** When "Full Doc" is active, extract only the 3 most relevant sections using keyword matching before sending to AI (prevents token overflow on large documents)
- **Conversation memory:** Store conversation summaries in IndexedDB — revisiting a document shows "Continue previous conversation?" with a summary of what was discussed

### 8.2 Chat UI Redesign
The current chat UI is functional but basic. Upgrade to match and exceed ChatGPT's polish:
- **Message bubbles:** User messages in accent-colored rounded pill (right aligned). AI messages are full-width with the Mariam avatar, using a subtle card background
- **Code blocks:** Syntax-highlighted with a "Copy" button. Language label shown in top-left corner
- **Streaming cursor:** Blinking `│` at the end of the current streaming word (not the end of the whole message)
- **Reaction buttons:** Under each AI message: [👍] [👎] [📋 Copy] [🔊 Read aloud] [🔁 Regenerate]
- **Message search:** A search icon in the chat header that highlights matching messages inline
- **Export conversation:** Download as .txt, .md, or print-formatted PDF

### 8.3 Chat Superpowers (Features ChatGPT doesn't have in context)
Because this chat is document-aware, add:
- **"Explain this passage":** User can highlight text in the document viewer and tap "Ask AI" — the selection is quoted into the chat
- **"Quiz me from this page":** Quick button generates 3 rapid-fire Q&A questions from the current page and plays them inline in chat
- **"Make me a table":** Button that generates a structured comparison table from the current document section and renders it with `UiTable`
- **"Find contradictions":** AI scans the full document and reports any internal contradictions or inconsistencies
- **Sticky system prompt:** User can set a persistent system instruction per document (e.g., "Always answer like you're explaining to a 1st-year medical student")

---

## SECTION 9 — DASHBOARD: DATA-DRIVEN & MOTIVATING

### 9.1 Study Streak System
Implement a full streak system (like Duolingo):
- Track consecutive days studied (any activity counts)
- Streak freeze: User earns 1 freeze per 7-day streak, can use it to protect streak on a missed day
- Streak milestones: 7 days, 14 days, 30 days, 60 days, 100 days → unlock badge displayed on profile
- Streak visualization: A row of flame icons for the last 7 days (lit = studied, dim = missed, shield = freeze used)

### 9.2 Weekly Insights Panel
Every Monday, generate a personalized insights card using AI:
- "You retained 87% of Pharmacology cards this week — that's your best week yet!"
- "Your weakest topic is Contraindications — 3 cards failed 4+ times"
- "Recommended: Review Drug Interactions before your exam on [date]"
- AI generates this summary by analyzing FSRS card ratings + exam scores from the past 7 days

### 9.3 Goal Setting
- User sets a daily study goal (e.g., "Study 20 cards and review 1 chapter per day")
- Dashboard shows progress rings for each goal component
- Completion triggers a celebration animation (confetti burst using CSS `@keyframes`)

---

## SECTION 10 — ACCESSIBILITY & PERFORMANCE STANDARDS

### 10.1 Accessibility Requirements
- All interactive elements have proper `aria-label` attributes
- Focus management: When a modal opens, focus moves to first interactive element; when it closes, focus returns to the trigger
- Color contrast: All text meets WCAG AA (4.5:1 ratio) in all 8 themes
- Keyboard navigation: Every feature is reachable via keyboard (Tab, Enter, Escape, Arrow keys)
- `prefers-reduced-motion`: All animations have a reduced-motion fallback that uses opacity-only transitions

### 10.2 Performance Targets
- First Contentful Paint (FCP): < 1.5 seconds
- Time to Interactive (TTI): < 3 seconds
- Lighthouse PWA score: 100/100
- Memory: After navigating through all views, heap usage must return within 10% of initial size (no leaks)
- Frame rate: All animations must maintain 60fps on mid-range mobile (equivalent to iPhone 11)

### 10.3 Error Boundary Completeness
Current `AppErrorBoundary` wraps the whole app. Add granular boundaries:
- `<ChunkErrorBoundary>` around each lazy-loaded view (catches code-splitting failures)
- `<PdfErrorBoundary>` around the PDF renderer specifically
- `<AiErrorBoundary>` around AI-generated content (shows a "Regenerate" button instead of crashing)
- `<VoiceErrorBoundary>` around voice features (shows "Voice not supported" fallback)

---

## EXECUTION CHECKLIST

### Phase 1: Foundation (Week 1)
- [ ] Create full directory structure
- [ ] Set up Zustand stores (eliminates all prop drilling)
- [ ] Extract all CSS to token files
- [ ] Implement safe area system
- [ ] Implement z-index layer system
- [ ] Fix GlobalTaskIndicator position
- [ ] Fix all double-scroll traps with `min-h-0`
- [ ] Fix `speakText` → `ProsodyEngine` migration
- [ ] Fix IndexedDB Safari hardening

### Phase 2: Voice & AI (Week 2)
- [ ] Build `ProsodyEngine` with full prosody control
- [ ] Build `FullDuplexVoiceManager` with instant interruption
- [ ] Rewrite `VoiceTutorModal` to full-screen immersive
- [ ] Rewrite `StudyPodcastPanel` with multi-voice dialogue
- [ ] Build `QuestionVarietyEngine` anti-repetition system
- [ ] Rewrite `buildGenerationSystemPrompt` with variety directives
- [ ] Fix streaming chunk buffer fragmentation
- [ ] Implement parallel variety planning

### Phase 3: Study Tools (Week 3)
- [ ] 3D CSS physics flashcard engine
- [ ] Tinder swipe gesture system
- [ ] Full FSRS-5 algorithm (replace SM-2)
- [ ] Mastery heatmap component
- [ ] MatchGame upgrade (animations, timer, personal best)
- [ ] Desktop split-pane exam view
- [ ] Mobile bottom-sheet lab drawer
- [ ] `BottomSheet` drag-to-dismiss component

### Phase 4: Productivity (Week 4)
- [ ] Task data model + IndexedDB store
- [ ] Task list UI with swipe gestures
- [ ] Smart task input (NLP parsing)
- [ ] Calendar month/week/day views
- [ ] FSRS auto-populated review events
- [ ] Notification permission + scheduling
- [ ] All 6 notification types
- [ ] Streak system with freeze mechanic
- [ ] Weekly AI insights panel
- [ ] Goal setting + progress rings

### Phase 5: Polish & PWA (Week 5)
- [ ] PWA manifest upgrade (screenshots, shortcuts, window-controls-overlay)
- [ ] Service Worker with Workbox strategies
- [ ] Custom "Install App" prompt card
- [ ] iOS splash screens for all device sizes
- [ ] Chat UI redesign (reactions, streaming cursor, code blocks)
- [ ] Chat superpowers (highlight-to-ask, quiz-me, table generator)
- [ ] Accessibility audit (aria labels, focus management, contrast)
- [ ] Performance optimization (React.lazy, useMemo audit, streaming buffer)
- [ ] Full Lighthouse audit → 100/100 PWA score
- [ ] Memory leak verification (heap profiling)

---

## CRITICAL CONSTRAINTS — NON-NEGOTIABLE

1. **Zero breaking changes to existing data:** The IndexedDB schema migration must preserve ALL existing files, flashcards, exams, and cases.
2. **API key security:** Never log API keys. Never include them in error messages. Never send them to any endpoint other than the chosen AI provider.
3. **Offline first:** The app must be fully functional (except AI generation) without internet: document viewing, flashcard study, exam replay, task management, and calendar must all work offline.
4. **No new npm dependencies:** All new functionality must use Web Platform APIs only (no React Native, no Capacitor, no Cordova). CDN-loaded libraries (Workbox) are acceptable.
5. **Single HTML file deployment:** The app must continue to work when built to a single deployable `index.html` + assets bundle. No server-side rendering. No server required.
6. **All 8 existing themes must work:** Every new component must use `var(--accent)`, `var(--bg)`, `var(--surface)`, etc. — never hardcoded colors.
7. **Existing data modules must survive:** `Counseling.js`, `Diseases.js`, `drugData.js`, `lawData.js` remain as-is. The new architecture adapts to them.
8. **Mobile-first then desktop:** Every new component is designed at 375px width first, then enhanced for 768px, then 1280px+.

---

*End of MARIAM PRO Enterprise Master Directive v8.0 SUPREME*
*Total scope: 5 development phases, 10 major feature sections, 80+ specific code-level fixes*
*Estimated output: ~25,000 lines of modular, enterprise-grade React/JavaScript/CSS*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART C — DISEASE EXPLORER PAGE + UNIVERSAL DRAGGABLE TUTOR
## (Add to every tool — docked on desktop, floating on mobile, touch-draggable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


Key existing patterns you MUST follow and reuse:
- `TutorChat` component (line ~2424) — the AI tutor chat already exists, reuse it everywhere
- `useDrag` hook (line ~2128) — already exists for mouse drag, you will extend it for touch
- `useSwipe` hook (line ~2188) — already exists for touch swipe gestures
- `SplitPane` component (line ~2389) — already exists for resizable panels
- `callAIStreaming` function — use for all AI responses
- `renderAIContent` function — use to render all AI markdown responses
- `MARIAM_IMG` constant — use for tutor avatar
- CSS variables: `var(--accent)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)` — ALWAYS use these, never hardcode colors
- All components use Tailwind + inline styles with CSS variables

The app navigation uses `setView(viewName)` to switch views. The main nav items are already wired in the `App()` function around line 5572.

---

## TASK 1 — UPGRADE `useDrag` TO SUPPORT TOUCH SCREENS

The existing `useDrag` hook only handles mouse events. Extend it to also handle touch events so ALL draggable panels work on mobile/tablet touchscreens.

Find `useDrag` (around line 2128) and update it:

```javascript
function useDrag(onDrag, deps = []) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mouse events
    const onMouseDown = e => { dragging.current = true; startX.current = e.clientX; e.preventDefault(); };
    const onMouseMove = e => { if (dragging.current) onDrag(e.clientX); };
    const onMouseUp = () => { dragging.current = false; };

    // Touch events — NEW
    const onTouchStart = e => { dragging.current = true; startX.current = e.touches[0].clientX; };
    const onTouchMove = e => { if (dragging.current) { e.preventDefault(); onDrag(e.touches[0].clientX); } };
    const onTouchEnd = () => { dragging.current = false; };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, deps);

  return { ref };
}
```

---

## TASK 2 — CREATE `DraggableTutorPanel` COMPONENT

This is the universal reusable draggable tutor that will be added to EVERY tool/view. Create it ONCE, use it everywhere.

Add this new component after the existing `TutorChat` component:

```javascript
/*
 * DraggableTutorPanel — Universal floating + dockable AI tutor
 * Works on both desktop (drag by header) and mobile (drag by handle, touch-enabled)
 * Props:
 *   context     — object passed to TutorChat as the knowledge context
 *   contextLabel — string shown in the tutor greeting ("Ask me about {contextLabel}")
 *   settings    — AI settings object
 *   defaultSide — 'right' | 'left' (default: 'right')
 *   defaultMode — 'docked' | 'floating' (default: 'docked' on desktop, 'floating' on mobile)
 */
function DraggableTutorPanel({ context, contextLabel, settings, defaultSide = 'right', defaultMode }) {
  const isMobile = window.innerWidth < 768;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(defaultMode || (isMobile ? 'floating' : 'docked'));
  const [dockedWidth, setDockedWidth] = useState(360);
  const [floatPos, setFloatPos] = useState({ x: null, y: null });
  const [floatSize, setFloatSize] = useState({ w: 340, h: 480 });
  const panelRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, ox: 0, oy: 0 });

  // Initialize float position to bottom-right corner
  useEffect(() => {
    if (floatPos.x === null) {
      setFloatPos({
        x: window.innerWidth - floatSize.w - 16,
        y: window.innerHeight - floatSize.h - 80
      });
    }
  }, []);

  // Drag handler for floating mode (header drag)
  const startFloatDrag = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const rect = panelRef.current?.getBoundingClientRect();
    dragState.current = { dragging: true, startX: clientX, startY: clientY, ox: rect?.left ?? 0, oy: rect?.top ?? 0 };

    const onMove = (ev) => {
      if (!dragState.current.dragging) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? clientX;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? clientY;
      const nx = dragState.current.ox + (cx - dragState.current.startX);
      const ny = dragState.current.oy + (cy - dragState.current.startY);
      setFloatPos({
        x: Math.max(0, Math.min(window.innerWidth - floatSize.w, nx)),
        y: Math.max(0, Math.min(window.innerHeight - floatSize.h - 60, ny))
      });
    };
    const onUp = () => { dragState.current.dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // Docked width drag handler
  const handleDockedDrag = useCallback(x => {
    setDockedWidth(Math.max(280, Math.min(560, window.innerWidth - x)));
  }, []);
  const startDockedDrag = useDrag(handleDockedDrag, [handleDockedDrag]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[130] flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: 'calc(var(--bottom-nav-h, 72px) + var(--sab, 0px) + 16px)',
          right: 16,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2, var(--accent)))',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(var(--acc-rgb, 99,102,241), 0.4)',
        }}>
        <GraduationCap size={16} />
        <span className="hidden sm:inline">AI Tutor</span>
      </button>
    );
  }

  // FLOATING MODE
  if (mode === 'floating') {
    return createPortal(
      <div
        ref={panelRef}
        className="fixed z-[135] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          left: floatPos.x,
          top: floatPos.y,
          width: floatSize.w,
          height: floatSize.h,
          background: 'var(--surface, var(--card))',
          border: '1px solid var(--border2, var(--border))',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          minWidth: 280,
          minHeight: 320,
        }}>
        {/* Draggable header */}
        <div
          onMouseDown={startFloatDrag}
          onTouchStart={startFloatDrag}
          className="flex items-center gap-2 px-3 py-2.5 shrink-0 cursor-grab active:cursor-grabbing select-none"
          style={{ background: 'var(--surface2, var(--card))', borderBottom: '1px solid var(--border)' }}>
          {/* Drag handle dots */}
          <div className="flex flex-col gap-0.5 opacity-40 shrink-0">
            {[0,1,2].map(i => <div key={i} className="flex gap-0.5">{[0,1].map(j => <div key={j} className="w-1 h-1 rounded-full" style={{ background: 'var(--text)' }} />)}</div>)}
          </div>
          <img src={MARIAM_IMG} className="w-6 h-6 rounded-lg object-cover shrink-0" alt="AI" />
          <span className="text-xs font-black uppercase tracking-widest flex-1 truncate" style={{ color: 'var(--accent)' }}>
            AI Tutor {contextLabel ? `— ${contextLabel.slice(0, 20)}` : ''}
          </span>
          <div className="flex gap-1 shrink-0">
            {!isMobile && (
              <button onClick={() => setMode('docked')} title="Dock panel"
                className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                style={{ background: 'var(--border)' }}>
                <Layout size={11} />
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
              style={{ background: 'var(--border)' }}>
              <X size={11} />
            </button>
          </div>
        </div>
        {/* Chat */}
        <div className="flex-1 min-h-0">
          <TutorChat context={context} settings={settings} contextLabel={contextLabel} />
        </div>
        {/* Resize handle (bottom-right) */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize opacity-30 hover:opacity-70"
          style={{ touchAction: 'none' }}
          onMouseDown={e => {
            e.preventDefault();
            const startW = floatSize.w, startH = floatSize.h, sx = e.clientX, sy = e.clientY;
            const onMove = ev => setFloatSize({ w: Math.max(280, startW + ev.clientX - sx), h: Math.max(320, startH + ev.clientY - sy) });
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
          }}>
          <svg width={16} height={16} viewBox="0 0 16 16" style={{ position: 'absolute', bottom: 3, right: 3 }}>
            <path d="M14 14L14 8M14 14L8 14M14 14L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>,
      document.body
    );
  }

  // DOCKED MODE (desktop side panel)
  return (
    <div className="flex shrink-0" style={{ height: '100%' }}>
      {/* Drag divider */}
      <div
        ref={startDockedDrag.ref}
        className="w-4 cursor-col-resize flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors shrink-0 group"
        style={{ borderLeft: '1px solid var(--border)' }}>
        <GripVertical size={12} className="opacity-20 group-hover:opacity-60" style={{ color: 'var(--text)' }} />
      </div>
      {/* Panel */}
      <div className="flex flex-col" style={{ width: dockedWidth, borderLeft: '1px solid var(--border)', background: 'var(--surface, var(--card))' }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2, var(--card))' }}>
          <img src={MARIAM_IMG} className="w-6 h-6 rounded-lg object-cover shrink-0" alt="AI" />
          <span className="text-xs font-black uppercase tracking-widest flex-1 truncate" style={{ color: 'var(--accent)' }}>AI Tutor</span>
          <button onClick={() => setMode('floating')} title="Float panel"
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            style={{ background: 'var(--border)' }}>
            <Maximize size={11} />
          </button>
          <button onClick={() => setOpen(false)}
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            style={{ background: 'var(--border)' }}>
            <X size={11} />
          </button>
        </div>
        {/* Chat */}
        <div className="flex-1 min-h-0">
          <TutorChat context={context} settings={settings} contextLabel={contextLabel} />
        </div>
      </div>
    </div>
  );
}
```

---

## TASK 3 — CREATE `DiseaseExplorerView` PAGE

This is the main new page. Insert it as a new view between Cases and Tutor in the navigation.

### Data structure
The disease database is built-in (no external file needed). Create a comprehensive `DISEASE_DB` array of at least 120 diseases covering all major systems. Each entry:

```javascript
const DISEASE_DB = [
  {
    id: 'mi',
    name: 'Myocardial Infarction',
    aliases: ['Heart Attack', 'STEMI', 'NSTEMI', 'ACS'],
    system: 'Cardiovascular',
    icd10: 'I21',
    overview: 'Myocardial infarction occurs when blood flow to part of the heart muscle is blocked, causing tissue death...',
    epidemiology: 'Leading cause of death worldwide. Incidence increases with age. More common in men under 65...',
    pathophysiology: 'Atherosclerotic plaque rupture → platelet aggregation → thrombus → coronary artery occlusion → ischemia → necrosis...',
    riskFactors: ['Hypertension', 'Diabetes mellitus', 'Dyslipidemia', 'Smoking', 'Obesity', 'Family history', 'Age >45M / >55F'],
    symptoms: ['Chest pain (crushing, pressure)', 'Radiation to left arm/jaw', 'Diaphoresis', 'Nausea/vomiting', 'Dyspnea', 'Syncope'],
    physicalExam: ['S3 gallop', 'New murmur', 'Hypotension or hypertension', 'Tachycardia', 'Diaphoresis'],
    diagnosis: {
      goldStandard: 'Coronary angiography',
      labs: ['Troponin I/T (rise 3-6h, peak 12-24h)', 'CK-MB', 'BMP', 'CBC', 'Coagulation studies', 'Lipid panel'],
      imaging: ['12-lead ECG (ST elevation ≥1mm in ≥2 contiguous leads for STEMI)', 'Echocardiography', 'Chest X-ray'],
      ecgFindings: 'STEMI: ST elevation. NSTEMI: ST depression, T-wave inversion, or no changes. Evolving: Q waves',
    },
    treatment: {
      acute: ['Aspirin 325mg PO stat', 'Nitroglycerin SL', 'Morphine PRN', 'Oxygen if SaO2 <90%', 'Beta-blocker if no contraindication', 'Heparin anticoagulation'],
      definitive: ['STEMI: Primary PCI within 90 min (door-to-balloon)', 'NSTEMI: PCI within 24-72h', 'Thrombolytics if PCI unavailable within 120 min'],
      longTerm: ['Dual antiplatelet therapy (aspirin + P2Y12 inhibitor)', 'Statin', 'ACE inhibitor / ARB', 'Beta-blocker', 'Cardiac rehab'],
    },
    complications: ['Heart failure', 'Cardiogenic shock', 'Arrhythmias (VF, VT, AF)', 'Mechanical complications (VSD, free wall rupture, papillary muscle rupture)', 'Pericarditis (Dressler syndrome)', 'LV thrombus'],
    prognosis: '30-day mortality ~5-7% with modern treatment. STEMI has higher acute mortality than NSTEMI.',
    prevention: 'Lifestyle modification, control of risk factors, aspirin therapy in high-risk patients',
    differentials: ['Aortic dissection', 'Pulmonary embolism', 'Unstable angina', 'Pericarditis', 'GERD', 'Costochondritis'],
    mnemonics: ['MONA: Morphine, Oxygen, Nitroglycerin, Aspirin (acute MI treatment)', 'TIMI risk score for risk stratification'],
    keyFacts: ['Time is muscle — door-to-balloon goal <90 minutes for STEMI', 'Women and diabetics may present atypically without chest pain'],
    tags: ['emergency', 'cardiology', 'usmle-high-yield'],
  },
  // ... add 119+ more diseases covering:
  // Cardiovascular: HTN, Heart Failure, AF, DVT/PE, Aortic stenosis, Endocarditis
  // Pulmonary: Pneumonia, COPD, Asthma, PTX, Pleural effusion, TB, Sarcoidosis
  // GI: GERD, PUD, IBD (Crohn's/UC), Cirrhosis, Hepatitis, Pancreatitis, Appendicitis, Cholecystitis
  // Neuro: Stroke, TIA, Meningitis, Seizure disorders, MS, Parkinson's, Guillain-Barré
  // Endocrine: DM1/DM2, DKA, HHS, Thyroid disorders, Cushing's, Addison's
  // Renal: AKI, CKD, Nephrotic/Nephritic syndromes, UTI, Pyelonephritis
  // Heme/Onc: Anemia types, Leukemias, Lymphomas, Coagulopathies
  // Infectious: Sepsis, HIV/AIDS, Influenza, COVID-19, Malaria, Common bacterial infections
  // Rheum: RA, SLE, Gout, Fibromyalgia, Polymyalgia rheumatica
  // Psych: Depression, Anxiety, Bipolar, Schizophrenia, PTSD
  // Peds: common pediatric conditions
  // OB/GYN: Preeclampsia, Ectopic pregnancy, Endometriosis
];

const BODY_SYSTEMS = [
  'All', 'Cardiovascular', 'Pulmonary', 'Gastroenterology', 'Neurology',
  'Endocrine', 'Renal/Urology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Psychiatry', 'Pediatrics', 'OB/GYN', 'Dermatology',
  'Orthopedics', 'ENT', 'Ophthalmology', 'Emergency'
];
```

### The DiseaseExplorerView Component

```javascript
function DiseaseExplorerView({ settings }) {
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = window.innerWidth < 768;
  const searchRef = useRef(null);

  // Filter diseases
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASE_DB.filter(d => {
      const matchSystem = selectedSystem === 'All' || d.system === selectedSystem;
      const matchSearch = !q || d.name.toLowerCase().includes(q) ||
        (d.aliases || []).some(a => a.toLowerCase().includes(q)) ||
        d.system.toLowerCase().includes(q) ||
        (d.tags || []).some(t => t.toLowerCase().includes(q));
      return matchSystem && matchSearch;
    });
  }, [search, selectedSystem]);

  // Build tutor context from selected disease
  const tutorContext = selectedDisease ? {
    disease: selectedDisease.name,
    system: selectedDisease.system,
    overview: selectedDisease.overview,
    pathophysiology: selectedDisease.pathophysiology,
    symptoms: selectedDisease.symptoms?.join(', '),
    diagnosis: JSON.stringify(selectedDisease.diagnosis),
    treatment: JSON.stringify(selectedDisease.treatment),
    complications: selectedDisease.complications?.join(', '),
    differentials: selectedDisease.differentials?.join(', '),
  } : null;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'diagnosis', label: 'Diagnosis', icon: Search },
    { id: 'treatment', label: 'Treatment', icon: Pill },
    { id: 'complications', label: 'Complications', icon: AlertCircle },
    { id: 'differentials', label: 'DDx', icon: GitBranch },
    { id: 'mnemonics', label: 'Mnemonics', icon: Brain },
  ];

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ═══ LEFT PANEL: Search + Disease List ═══ */}
      <div className="flex flex-col shrink-0 border-r border-[color:var(--border)]"
        style={{ width: isMobile && selectedDisease ? 0 : isMobile ? '100%' : 300, overflow: 'hidden', transition: 'width 0.3s ease' }}>

        {/* Search header */}
        <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface, var(--card))' }}>
          <div className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search diseases, symptoms, ICD-10…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border2, var(--border))', color: 'var(--text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                <X size={14} />
              </button>
            )}
          </div>
          {/* System filter chips — horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {BODY_SYSTEMS.map(sys => (
              <button key={sys} onClick={() => setSelectedSystem(sys)}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                style={selectedSystem === sys
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface2, var(--card))', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                {sys}
              </button>
            ))}
          </div>
          <p className="text-xs opacity-30 mt-1.5 font-bold">{filtered.length} diseases</p>
        </div>

        {/* Disease list */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 opacity-30">
              <Search size={24} className="mb-2" />
              <p className="text-sm font-bold">No results for "{search}"</p>
            </div>
          ) : filtered.map(d => (
            <button key={d.id} onClick={() => { setSelectedDisease(d); setActiveTab('overview'); }}
              className="w-full text-left px-4 py-3 transition-all"
              style={{
                borderBottom: '1px solid var(--border)',
                background: selectedDisease?.id === d.id ? 'rgba(var(--acc-rgb, 99,102,241), 0.1)' : 'transparent',
                borderLeft: selectedDisease?.id === d.id ? '3px solid var(--accent)' : '3px solid transparent',
              }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: selectedDisease?.id === d.id ? 'var(--accent)' : 'var(--text)' }}>
                    {d.name}
                  </p>
                  <p className="text-xs opacity-40 mt-0.5">{d.system} {d.icd10 ? `· ${d.icd10}` : ''}</p>
                </div>
                {d.tags?.includes('usmle-high-yield') && (
                  <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>HY</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL: Disease Detail + Tutor ═══ */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {!selectedDisease ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40 p-8 text-center">
            <Stethoscope size={48} />
            <p className="text-xl font-black">Select a Disease</p>
            <p className="text-sm">Search and tap any disease to view detailed clinical information</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Disease content */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Disease header */}
              <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface, var(--card))' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {isMobile && (
                      <button onClick={() => setSelectedDisease(null)} className="flex items-center gap-1 text-xs font-bold mb-2 opacity-60">
                        <ChevronLeft size={14} /> Back
                      </button>
                    )}
                    <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>{selectedDisease.name}</h1>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(var(--acc-rgb,99,102,241),0.15)', color: 'var(--accent)' }}>
                        {selectedDisease.system}
                      </span>
                      {selectedDisease.icd10 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'var(--surface2, var(--card))', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                          ICD-10: {selectedDisease.icd10}
                        </span>
                      )}
                      {selectedDisease.aliases?.slice(0, 2).map(a => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-lg opacity-50"
                          style={{ background: 'var(--surface2, var(--card))', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Tab navigation */}
                <div className="flex gap-1 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all"
                      style={activeTab === id
                        ? { background: 'var(--accent)', color: '#fff' }
                        : { background: 'var(--surface2, var(--card))', color: 'var(--text2)', border: '1px solid var(--border)', opacity: 0.7 }}>
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">

                {activeTab === 'overview' && (
                  <>
                    {selectedDisease.overview && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Overview</p>
                        <p className="text-sm leading-relaxed">{selectedDisease.overview}</p>
                      </div>
                    )}
                    {selectedDisease.epidemiology && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Epidemiology</p>
                        <p className="text-sm leading-relaxed">{selectedDisease.epidemiology}</p>
                      </div>
                    )}
                    {selectedDisease.pathophysiology && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Pathophysiology</p>
                        <p className="text-sm leading-relaxed">{selectedDisease.pathophysiology}</p>
                      </div>
                    )}
                    {selectedDisease.riskFactors?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Risk Factors</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDisease.riskFactors.map(r => (
                            <span key={r} className="px-2.5 py-1 rounded-xl text-xs font-bold"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.symptoms?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Signs & Symptoms</p>
                        <div className="space-y-1.5">
                          {selectedDisease.symptoms.map(s => (
                            <div key={s} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.keyFacts?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--accent)/30', background: 'rgba(var(--acc-rgb,99,102,241),0.05)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                          <Zap size={12} /> Key Facts / High-Yield
                        </p>
                        <div className="space-y-2">
                          {selectedDisease.keyFacts.map(f => (
                            <div key={f} className="flex items-start gap-2 text-sm font-medium">
                              <Star size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'diagnosis' && selectedDisease.diagnosis && (
                  <>
                    <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                      <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Gold Standard</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{selectedDisease.diagnosis.goldStandard}</p>
                    </div>
                    {selectedDisease.diagnosis.labs?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Laboratory Studies</p>
                        <div className="space-y-1.5">
                          {selectedDisease.diagnosis.labs.map(l => (
                            <div key={l} className="flex items-start gap-2 text-sm">
                              <FlaskConical size={12} className="shrink-0 mt-0.5" style={{ color: '#06b6d4' }} />
                              {l}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.diagnosis.imaging?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Imaging & Studies</p>
                        <div className="space-y-1.5">
                          {selectedDisease.diagnosis.imaging.map(i => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Camera size={12} className="shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
                              {i}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.diagnosis.ecgFindings && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">ECG Findings</p>
                        <p className="text-sm leading-relaxed">{selectedDisease.diagnosis.ecgFindings}</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'treatment' && selectedDisease.treatment && (
                  <>
                    {selectedDisease.treatment.acute && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>🚨 Acute Management</p>
                        <div className="space-y-1.5">
                          {selectedDisease.treatment.acute.map(t => (
                            <div key={t} className="flex items-start gap-2 text-sm">
                              <Zap size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.treatment.definitive && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(var(--acc-rgb,99,102,241),0.3)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>Definitive Treatment</p>
                        <div className="space-y-1.5">
                          {selectedDisease.treatment.definitive.map(t => (
                            <div key={t} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDisease.treatment.longTerm && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>Long-Term Management</p>
                        <div className="space-y-1.5">
                          {selectedDisease.treatment.longTerm.map(t => (
                            <div key={t} className="flex items-start gap-2 text-sm">
                              <Heart size={12} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'complications' && (
                  <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Complications</p>
                    <div className="space-y-2">
                      {(selectedDisease.complications || []).map(c => (
                        <div key={c} className="flex items-start gap-2 text-sm">
                          <AlertCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                          {c}
                        </div>
                      ))}
                    </div>
                    {selectedDisease.prognosis && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Prognosis</p>
                        <p className="text-sm leading-relaxed">{selectedDisease.prognosis}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'differentials' && (
                  <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Differential Diagnosis</p>
                    <div className="space-y-2">
                      {(selectedDisease.differentials || []).map((d, i) => (
                        <button key={d} onClick={() => {
                          const found = DISEASE_DB.find(dd => dd.name.toLowerCase() === d.toLowerCase() || dd.aliases?.some(a => a.toLowerCase() === d.toLowerCase()));
                          if (found) { setSelectedDisease(found); setActiveTab('overview'); }
                        }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-[var(--surface2,var(--card))]"
                          style={{ border: '1px solid var(--border)' }}>
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: 'rgba(var(--acc-rgb,99,102,241),0.15)', color: 'var(--accent)' }}>
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium">{d}</span>
                          <ChevronRight size={14} className="ml-auto opacity-30" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'mnemonics' && (
                  <div className="space-y-3">
                    {(selectedDisease.mnemonics || []).map(m => (
                      <div key={m} className="glass rounded-2xl p-4"
                        style={{ border: '1px solid rgba(var(--acc-rgb,99,102,241),0.25)', background: 'rgba(var(--acc-rgb,99,102,241),0.05)' }}>
                        <div className="flex items-start gap-3">
                          <Brain size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                          <p className="text-sm leading-relaxed font-medium">{m}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedDisease.mnemonics || selectedDisease.mnemonics.length === 0) && (
                      <div className="empty-state py-8">
                        <p className="text-sm opacity-40">No mnemonics available for this disease</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Docked tutor — desktop only */}
            {!isMobile && (
              <DraggableTutorPanel
                context={tutorContext}
                contextLabel={selectedDisease.name}
                settings={settings}
                defaultMode="docked"
              />
            )}
          </div>
        )}
      </div>

      {/* Floating tutor — mobile */}
      {isMobile && selectedDisease && (
        <DraggableTutorPanel
          context={tutorContext}
          contextLabel={selectedDisease?.name}
          settings={settings}
          defaultMode="floating"
        />
      )}
    </div>
  );
}
```

---

## TASK 4 — ADD DISEASE EXPLORER TO NAVIGATION

In the main `App()` function (around line 5572), find the navigation items array and add the disease view:

1. Add `'diseases'` to the nav items list between `'cases'` and `'chat'` (or `'tutor'`)
2. Add the icon (use `Thermometer` or `Stethoscope` from lucide-react — already imported)
3. Add the route in the view renderer:
```javascript
{view === 'diseases' && <DiseaseExplorerView settings={settings} />}
```
4. Add to bottom mobile nav with label "Diseases"
5. Add to desktop sidebar nav with same label

---

## TASK 5 — ADD `DraggableTutorPanel` TO ALL MEDICAL REFERENCE TOOLS

Find each of these existing view functions and add the `DraggableTutorPanel` at the end:

### Tools to update (all visible in the screenshot):
1. `LabReferenceView` (line ~11615)
2. `DifferentialDiagnosisView` (line ~11701)
3. `MedicalMnemonicsView` (line ~11923)
4. `PrescriptionPadView` (line ~12172)
5. `AnatomyQuickRefView` (line ~13477)
6. `KnowledgeGraphView` (line ~7610)
7. `NotesView` (line ~9200)
8. `StudyTimelineView` (line ~9399)
9. `AchievementsView` (line ~9121)
10. `SmartStudyMode` (line ~8778)
11. `GoalTrackerView` (line ~8908)
12. `AnalyticsView` (line ~7955)
13. `CalendarView` (line ~8095)
14. `TasksView` (line ~1561)
15. `NotificationCenterView` (line ~9775)

### Pattern to apply to EVERY tool above:

**For views that already return a single scrollable div (most of them):**
```jsx
// BEFORE:
return (
  <div className="flex-1 min-h-0 overflow-y-auto ...">
    {/* content */}
  </div>
);

// AFTER:
return (
  <div className="flex-1 min-h-0 flex overflow-hidden">
    <div className="flex-1 min-h-0 overflow-y-auto ...">
      {/* existing content unchanged */}
    </div>
    {/* Desktop docked tutor */}
    {!isMobile && (
      <DraggableTutorPanel
        context={{ tool: 'ToolNameHere', description: 'Brief description of what this tool does' }}
        contextLabel="ToolNameHere"
        settings={settings}
        defaultMode="docked"
      />
    )}
    {/* Mobile floating tutor */}
    {isMobile && (
      <DraggableTutorPanel
        context={{ tool: 'ToolNameHere' }}
        contextLabel="ToolNameHere"
        settings={settings}
        defaultMode="floating"
      />
    )}
  </div>
);
```

**Important:** All these views need `settings` prop passed in. Check each one — add `settings` to their props if missing, and pass it from the parent caller in `App()`.

---

## TASK 6 — VERIFY ALL TOOLS IN THE SCREENSHOT ARE WIRED

Looking at the screenshot, these tools are shown in the home page under "Medical Reference" and "Specialty Guides" and "Tracking & Productivity". Verify ALL of them have working routes:

**Medical Reference (11 tools):**
- Toxicology, Glossary, Pharma Ref, Guidelines, Anatomy, ECG Guide
- Radiology, Handouts, Procedures, EBM Tools, Surg Anatomy

**Specialty Guides (26 tools):**
- Cardiology, Neurology, Pulmonology, GI, Emergency, Critical Care
- Infections, Pathology, Micro Guide, ABG, Dermatology, Ophthalmology
- Nephrology, Endocrinology, Hematology, Rheumatology, Orthopedics, ENT
- Urology, Wound Care, Pain Mgmt, Geriatrics, Palliative, Transfusion
- Abx Steward, Vent Graphs

**Tracking & Productivity (15 tools):**
- Notes, Tasks, Calendar, Goals, Achievements, Analytics
- Progress, Timeline, Graph, Reminders, Psych Screen, Research
- Comm Skills, QI, Ethics

For any tool that currently shows an empty view or placeholder, create a minimal working view with:
1. A title header
2. Relevant content (reference tables, calculators, or AI-generated content)
3. The `DraggableTutorPanel` attached

---

## TASK 7 — ERROR CHECKING & CRASH PREVENTION

Before committing, verify:

1. **No undefined props** — Every component that uses `settings` must receive it
2. **No missing imports** — `DraggableTutorPanel` uses `createPortal` — already imported at top of file
3. **No duplicate function names** — Search for any conflicts with `DraggableTutorPanel` name
4. **Safe array access** — All `.map()` calls must have `|| []` fallback: `(array || []).map(...)`
5. **Safe object access** — All nested property access uses optional chaining: `disease?.symptoms?.length`
6. **isMobile** — Define at top of each component that uses it: `const isMobile = window.innerWidth < 768;`
7. **DISEASE_DB** — Must be defined BEFORE `DiseaseExplorerView` function, at module level
8. **createPortal** — Already imported: `import { createPortal } from 'react-dom';`

---

## TASK 8 — GIT COMMIT

After ALL tasks are complete and the app runs without errors:

```bash
git add -A
git commit -m "feat: Add DiseaseExplorerView + Universal DraggableTutorPanel for all 40+ tools

- New DiseaseExplorerView with 120+ disease database, search, system filter, 6 tabs
- DraggableTutorPanel: dockable + floating, mouse + touch drag, resize handle
- useDrag hook extended with touch event support for mobile
- DraggableTutorPanel added to all medical reference, specialty, and productivity tools
- Disease DDx tab links to related diseases for cross-navigation
- All views verified for prop safety and crash prevention"
git push origin main
```

---

## EXECUTION ORDER

Execute tasks in this exact order:
1. Task 1 (upgrade useDrag) — foundation for touch support
2. Task 2 (DraggableTutorPanel) — must exist before it can be used anywhere
3. Task 3 (DISEASE_DB + DiseaseExplorerView) — the main new page
4. Task 4 (add to navigation) — wire the new page
5. Task 5 (add tutor to all tools) — mass update
6. Task 6 (verify all tools wired) — completeness check
7. Task 7 (error checking) — safety pass
8. Task 8 (git commit) — done

**DO NOT STOP between tasks. Complete all 8 tasks in one session.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART D — MEDICINES EXPLORER PAGE + GLOBAL SEARCH UPGRADE
## (200+ drug database, 6 tabs per drug, searches everything in the app)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- `GlobalSearch` component starts at line ~988 — you will upgrade this
- `DiseaseExplorerView` was just added in the previous session — follow same patterns
- `DraggableTutorPanel` was just added — reuse it on the medicines page
- `TutorChat` component exists — reuse for AI answers
- `callAIStreaming` — use for all AI content
- `renderAIContent` — use to render all AI markdown
- `MARIAM_IMG` — tutor avatar
- `createPortal` already imported from react-dom
- CSS variables: `var(--accent)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)` — ALWAYS use, never hardcode colors
- `ViewWrapper` component wraps all views — use same pattern
- All views are registered in the `App()` function around line 7107

---

## TASK 1 — BUILD THE MEDICINES DATABASE (`MEDICINE_DB`)

Create a comprehensive built-in medicines database at module level (before the `MedicinesView` function). This must be defined ONCE at the top scope so it's available to both the view AND the global search.

**Minimum 200 medicines** covering all major drug classes. Each entry follows this exact schema:

```javascript
const MEDICINE_DB = [
  {
    id: 'aspirin',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    brandNames: ['Bayer', 'Ecotrin', 'Bufferin', 'Excedrin'],
    drugClass: 'NSAID / Antiplatelet',
    category: 'Cardiovascular',
    schedule: 'OTC',
    mechanism: 'Irreversibly inhibits COX-1 and COX-2 enzymes, reducing prostaglandin synthesis. At low doses, inhibits thromboxane A2 in platelets, preventing platelet aggregation.',
    indications: ['Acute MI (325mg stat)', 'Stroke prevention (81mg daily)', 'Pain/fever (325-650mg PRN)', 'Anti-inflammatory (higher doses)', 'Kawasaki disease', 'Colorectal cancer prevention'],
    dosing: {
      adult: 'Pain/fever: 325-650mg PO q4-6h PRN. Antiplatelet: 81mg PO daily. Acute MI: 325mg chewed stat.',
      pediatric: 'AVOID in children <12 (Reye syndrome risk). Exception: Kawasaki disease under specialist guidance.',
      renal: 'Use with caution. Avoid in severe renal impairment (GFR <10).',
      hepatic: 'Avoid in severe hepatic disease.',
      maxDose: '4g/day for pain/fever. No dose limit for 81mg antiplatelet.',
    },
    sideEffects: {
      common: ['GI upset', 'Nausea', 'Heartburn', 'GI bleeding risk'],
      serious: ['Peptic ulcer disease', 'GI hemorrhage', 'Reye syndrome (children)', 'Salicylate toxicity', 'Bronchospasm in aspirin-sensitive asthma'],
      rare: ['Anaphylaxis', 'Tinnitus (toxicity marker)', 'Hepatotoxicity'],
    },
    contraindications: ['Children <12 with viral illness (Reye syndrome)', 'Active peptic ulcer', 'Hemophilia/bleeding disorders', 'Aspirin-exacerbated respiratory disease (AERD)', 'Last trimester pregnancy (premature closure of ductus arteriosus)'],
    interactions: ['Warfarin (↑ bleeding risk)', 'Ibuprofen (antagonizes antiplatelet effect)', 'Methotrexate (↑ toxicity)', 'ACE inhibitors (↓ efficacy)', 'Alcohol (↑ GI bleeding)'],
    monitoring: ['Signs of GI bleeding (dark/tarry stools)', 'Renal function in long-term use', 'Tinnitus (sign of toxicity)'],
    pharmacokinetics: {
      absorption: 'Rapidly absorbed from GI tract. Peak plasma: 1-2h.',
      distribution: 'Widely distributed. Protein binding: 80-90%.',
      metabolism: 'Hepatic hydrolysis to salicylic acid.',
      elimination: 'Renal. Half-life: 15-20min (aspirin), 2-30h (salicylate, dose-dependent).',
    },
    pregnancy: 'Category D (3rd trimester). Avoid in late pregnancy.',
    nursing: 'Excreted in breast milk. Use with caution.',
    blackBoxWarning: null,
    counseling: ['Take with food or milk to reduce GI irritation', 'Do not crush enteric-coated tablets', 'Avoid alcohol while taking', 'Stop 7 days before surgery (antiplatelet effect)'],
    mnemonics: ['ASA = Acetylsalicylic Acid', 'COX inhibitor → less prostaglandin → less pain/fever/inflammation'],
    keyFacts: ['Low-dose (81mg) for antiplatelet, high-dose for anti-inflammatory', 'Irreversible COX inhibition — platelet effect lasts platelet lifespan (~10 days)', 'Antidote for toxicity: sodium bicarbonate (alkalinize urine) + dialysis if severe'],
    tags: ['usmle-high-yield', 'otc', 'antiplatelet', 'nsaid'],
    relatedDrugs: ['ibuprofen', 'clopidogrel', 'warfarin'],
  },

  // ─── CARDIOVASCULAR ───────────────────────────────────────────────
  // Include: Metoprolol, Atenolol, Carvedilol, Lisinopril, Losartan,
  // Amlodipine, Diltiazem, Verapamil, Furosemide, Hydrochlorothiazide,
  // Spironolactone, Digoxin, Amiodarone, Warfarin, Apixaban, Rivaroxaban,
  // Dabigatran, Clopidogrel, Ticagrelor, Nitroglycerin, Isosorbide,
  // Atorvastatin, Rosuvastatin, Simvastatin, Ezetimibe, Niacin

  // ─── ANTIBIOTICS ──────────────────────────────────────────────────
  // Include: Amoxicillin, Augmentin, Ampicillin, Piperacillin-tazobactam,
  // Cephalexin, Cefazolin, Ceftriaxone, Cefepime, Meropenem, Imipenem,
  // Ciprofloxacin, Levofloxacin, Moxifloxacin, Azithromycin, Clarithromycin,
  // Doxycycline, Tetracycline, Vancomycin, Linezolid, Daptomycin,
  // Metronidazole, Clindamycin, TMP-SMX, Nitrofurantoin, Rifampin,
  // Isoniazid, Ethambutol, Pyrazinamide

  // ─── ANALGESICS / PAIN ────────────────────────────────────────────
  // Include: Acetaminophen (Tylenol), Ibuprofen, Naproxen, Ketorolac,
  // Celecoxib, Tramadol, Hydrocodone, Oxycodone, Morphine, Fentanyl,
  // Buprenorphine, Naloxone, Naltrexone, Gabapentin, Pregabalin

  // ─── CNS / PSYCHIATRY ─────────────────────────────────────────────
  // Include: Sertraline, Fluoxetine, Escitalopram, Paroxetine, Venlafaxine,
  // Duloxetine, Bupropion, Mirtazapine, Amitriptyline, Nortriptyline,
  // Lithium, Valproic acid, Carbamazepine, Lamotrigine, Quetiapine,
  // Risperidone, Olanzapine, Aripiprazole, Haloperidol, Clozapine,
  // Alprazolam, Diazepam, Lorazepam, Clonazepam, Zolpidem, Buspirone,
  // Methylphenidate, Amphetamine salts, Atomoxetine, Modafinil

  // ─── ENDOCRINE ────────────────────────────────────────────────────
  // Include: Metformin, Glipizide, Glyburide, Glargine, Aspart, Regular insulin,
  // Sitagliptin, Empagliflozin, Dapagliflozin, Liraglutide, Semaglutide,
  // Levothyroxine, Methimazole, Propylthiouracil, Prednisone, Dexamethasone,
  // Hydrocortisone, Fludrocortisone, Testosterone, Estradiol, Progesterone

  // ─── PULMONARY ────────────────────────────────────────────────────
  // Include: Albuterol, Salmeterol, Formoterol, Tiotropium, Ipratropium,
  // Fluticasone (inhaled), Budesonide, Montelukast, Theophylline,
  // Roflumilast, Omalizumab, Dupilumab, Benralizumab

  // ─── GI ───────────────────────────────────────────────────────────
  // Include: Omeprazole, Pantoprazole, Lansoprazole, Esomeprazole,
  // Ranitidine (historical), Famotidine, Metoclopramide, Ondansetron,
  // Promethazine, Loperamide, Bismuth, Lactulose, Polyethylene glycol,
  // Docusate, Senna, Mesalamine, Infliximab, Adalimumab

  // ─── RENAL / UROLOGY ──────────────────────────────────────────────
  // Include: Tamsulosin, Finasteride, Sildenafil, Tadalafil,
  // Oxybutynin, Mirabegron, Allopurinol, Colchicine, Indomethacin (gout)

  // ─── HEMATOLOGY / ONCOLOGY ────────────────────────────────────────
  // Include: Epoetin alfa, Filgrastim, Darbepoetin, Iron sucrose,
  // Ferrous sulfate, Folic acid, Cyanocobalamin (B12),
  // Methotrexate (oncology), Cyclophosphamide, Doxorubicin,
  // Cisplatin, Carboplatin, Paclitaxel, Docetaxel, Tamoxifen,
  // Anastrozole, Imatinib, Rituximab, Trastuzumab

  // ─── IMMUNOLOGY / RHEUMATOLOGY ────────────────────────────────────
  // Include: Hydroxychloroquine, Sulfasalazine, Leflunomide,
  // Etanercept, Infliximab, Adalimumab, Tocilizumab, Abatacept,
  // Mycophenolate, Azathioprine, Tacrolimus, Cyclosporine

  // ─── NEUROLOGY ────────────────────────────────────────────────────
  // Include: Phenytoin, Levetiracetam, Topiramate, Oxcarbazepine,
  // Phenobarbital, Donepezil, Memantine, Rivastigmine, Carbidopa-levodopa,
  // Pramipexole, Ropinirole, Rasagiline, Selegiline, Sumatriptan,
  // Rizatriptan, Propranolol (migraine prophylaxis), Baclofen, Tizanidine

  // ─── INFECTIOUS DISEASE / ANTIVIRALS ──────────────────────────────
  // Include: Acyclovir, Valacyclovir, Oseltamivir, Remdesivir,
  // Tenofovir, Emtricitabine, Dolutegravir, Ritonavir, Atazanavir,
  // Fluconazole, Itraconazole, Voriconazole, Amphotericin B,
  // Ivermectin, Albendazole, Mebendazole, Chloroquine, Hydroxychloroquine (antimalarial)

  // ─── OBSTETRICS / GYNECOLOGY ──────────────────────────────────────
  // Include: Oxytocin, Misoprostol, Betamethasone (fetal lung maturity),
  // Magnesium sulfate (preeclampsia), Methylergonovine,
  // Combined oral contraceptives, Progestin-only pill, Levonorgestrel (EC),
  // Mifepristone, Clomiphene, Letrozole (infertility)

  // ─── DERMATOLOGY ──────────────────────────────────────────────────
  // Include: Tretinoin, Isotretinoin (Accutane), Benzoyl peroxide,
  // Clindamycin topical, Hydrocortisone cream, Triamcinolone,
  // Clobetasol, Mupirocin, Permethrin, Terbinafine (topical/oral),
  // Tacrolimus (topical), Dupilumab (atopic dermatitis)

  // ─── EMERGENCY / CRITICAL CARE ────────────────────────────────────
  // Include: Epinephrine (anaphylaxis), Atropine, Adenosine,
  // Sodium bicarbonate, Calcium gluconate, Dextrose 50%,
  // Glucagon, Protamine (heparin reversal), Vitamin K (warfarin reversal),
  // Idarucizumab (dabigatran reversal), Andexanet alfa (factor Xa reversal),
  // Activated charcoal, N-acetylcysteine (Tylenol overdose), Flumazenil,
  // Physostigmine, Pralidoxime, Norepinephrine, Dopamine, Vasopressin,
  // Dobutamine, Phenylephrine
];

const DRUG_CATEGORIES = [
  'All', 'Cardiovascular', 'Antibiotics', 'Analgesics/Pain', 'CNS/Psychiatry',
  'Endocrine', 'Pulmonary', 'Gastroenterology', 'Renal/Urology',
  'Hematology/Oncology', 'Immunology/Rheumatology', 'Neurology',
  'Infectious Disease', 'OB/GYN', 'Dermatology', 'Emergency/Critical Care'
];

const DRUG_SCHEDULES = ['All', 'OTC', 'Schedule II', 'Schedule III', 'Schedule IV', 'Schedule V', 'Rx Only'];
```

---

## TASK 2 — BUILD `MedicinesView` COMPONENT

Create this complete component and add it to the app:

```javascript
function MedicinesView({ settings }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSchedule, setSelectedSchedule] = useState('All');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'class' | 'category'
  const isMobile = window.innerWidth < 768;
  const searchRef = useRef(null);

  // Filtered + sorted drug list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MEDICINE_DB
      .filter(d => {
        const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
        const matchSched = selectedSchedule === 'All' || d.schedule === selectedSchedule;
        const matchSearch = !q ||
          d.name.toLowerCase().includes(q) ||
          d.genericName?.toLowerCase().includes(q) ||
          (d.brandNames || []).some(b => b.toLowerCase().includes(q)) ||
          d.drugClass?.toLowerCase().includes(q) ||
          (d.indications || []).some(i => i.toLowerCase().includes(q)) ||
          (d.tags || []).some(t => t.toLowerCase().includes(q));
        return matchCat && matchSched && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'class') return (a.drugClass || '').localeCompare(b.drugClass || '');
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        return a.name.localeCompare(b.name);
      });
  }, [search, selectedCategory, selectedSchedule, sortBy]);

  // Tutor context from selected drug
  const tutorContext = selectedDrug ? {
    drug: selectedDrug.name,
    genericName: selectedDrug.genericName,
    drugClass: selectedDrug.drugClass,
    mechanism: selectedDrug.mechanism,
    indications: (selectedDrug.indications || []).join(', '),
    dosing: JSON.stringify(selectedDrug.dosing),
    sideEffects: JSON.stringify(selectedDrug.sideEffects),
    contraindications: (selectedDrug.contraindications || []).join(', '),
    interactions: (selectedDrug.interactions || []).join(', '),
    keyFacts: (selectedDrug.keyFacts || []).join(', '),
  } : null;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'dosing', label: 'Dosing', icon: Clipboard },
    { id: 'sideeffects', label: 'Side Effects', icon: AlertCircle },
    { id: 'interactions', label: 'Interactions', icon: GitBranch },
    { id: 'pharmacology', label: 'PK/PD', icon: FlaskConical },
    { id: 'counseling', label: 'Counseling', icon: MessageSquare },
  ];

  const scheduleColor = (s) => {
    if (!s || s === 'OTC') return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
    if (s === 'Schedule II') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    if (s === 'Schedule III') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    if (s === 'Schedule IV') return { bg: 'rgba(99,102,241,0.15)', color: '#6366f1' };
    return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
  };

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ═══ LEFT: Search + Drug List ═══ */}
      <div className="flex flex-col shrink-0 border-r border-[color:var(--border)]"
        style={{ width: isMobile && selectedDrug ? 0 : isMobile ? '100%' : 310, overflow: 'hidden', transition: 'width 0.3s ease' }}>

        {/* Search + Filters */}
        <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface, var(--card))' }}>

          {/* Search box */}
          <div className="relative mb-2.5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand, class, indication…"
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border2, var(--border))', color: 'var(--text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2" style={{ scrollbarWidth: 'none' }}>
            {DRUG_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                style={selectedCategory === cat
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface2, var(--card))', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + Schedule row */}
          <div className="flex gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--surface2, var(--card))', border: '1px solid var(--border)', color: 'var(--text)' }}>
              <option value="name">Sort: Name</option>
              <option value="class">Sort: Drug Class</option>
              <option value="category">Sort: Category</option>
            </select>
            <select value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--surface2, var(--card))', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {DRUG_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <p className="text-xs opacity-30 mt-1.5 font-bold">{filtered.length} medicines</p>
        </div>

        {/* Drug list */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 opacity-30">
              <Pill size={24} className="mb-2" />
              <p className="text-sm font-bold">No results for "{search}"</p>
            </div>
          ) : filtered.map(d => {
            const sc = scheduleColor(d.schedule);
            return (
              <button key={d.id} onClick={() => { setSelectedDrug(d); setActiveTab('overview'); }}
                className="w-full text-left px-4 py-3 transition-all"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: selectedDrug?.id === d.id ? 'rgba(var(--acc-rgb,99,102,241),0.1)' : 'transparent',
                  borderLeft: selectedDrug?.id === d.id ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: selectedDrug?.id === d.id ? 'var(--accent)' : 'var(--text)' }}>
                      {d.name}
                    </p>
                    <p className="text-xs opacity-50 mt-0.5 truncate">{d.genericName || d.drugClass}</p>
                    <p className="text-xs opacity-35 truncate">{d.drugClass}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={sc}>{d.schedule || 'Rx'}</span>
                    {d.tags?.includes('usmle-high-yield') && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>HY</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ RIGHT: Drug Detail + Tutor ═══ */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {!selectedDrug ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40 p-8 text-center">
            <Pill size={48} />
            <p className="text-xl font-black">Select a Medicine</p>
            <p className="text-sm">Search and tap any medicine to view full prescribing information</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Drug content */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

              {/* Drug header */}
              <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface, var(--card))' }}>
                {isMobile && (
                  <button onClick={() => setSelectedDrug(null)} className="flex items-center gap-1 text-xs font-bold mb-2 opacity-60">
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-xl font-black truncate" style={{ color: 'var(--text)' }}>{selectedDrug.name}</h1>
                    {selectedDrug.genericName && selectedDrug.genericName !== selectedDrug.name && (
                      <p className="text-sm opacity-60 mt-0.5">{selectedDrug.genericName}</p>
                    )}
                    {/* Brand names */}
                    {selectedDrug.brandNames?.length > 0 && (
                      <p className="text-xs opacity-40 mt-0.5">Brands: {selectedDrug.brandNames.slice(0, 4).join(', ')}</p>
                    )}
                    {/* Tags row */}
                    <div className="flex gap-2 flex-wrap mt-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(var(--acc-rgb,99,102,241),0.15)', color: 'var(--accent)' }}>
                        {selectedDrug.drugClass}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ ...scheduleColor(selectedDrug.schedule) }}>
                        {selectedDrug.schedule || 'Rx Only'}
                      </span>
                      {selectedDrug.blackBoxWarning && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          ⬛ BLACK BOX
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab navigation */}
                <div className="flex gap-1 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all"
                      style={activeTab === id
                        ? { background: 'var(--accent)', color: '#fff' }
                        : { background: 'var(--surface2, var(--card))', color: 'var(--text2)', border: '1px solid var(--border)', opacity: 0.7 }}>
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">

                {/* BLACK BOX WARNING — always show if present */}
                {selectedDrug.blackBoxWarning && (
                  <div className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: 'rgba(0,0,0,0.85)', border: '2px solid #000' }}>
                    <span className="text-xl shrink-0">⬛</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white mb-1">BLACK BOX WARNING</p>
                      <p className="text-sm text-white/90 leading-relaxed">{selectedDrug.blackBoxWarning}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'overview' && (
                  <>
                    {selectedDrug.mechanism && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Mechanism of Action</p>
                        <p className="text-sm leading-relaxed">{selectedDrug.mechanism}</p>
                      </div>
                    )}
                    {selectedDrug.indications?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Indications</p>
                        <div className="space-y-1.5">
                          {selectedDrug.indications.map(ind => (
                            <div key={ind} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                              {ind}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDrug.keyFacts?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(var(--acc-rgb,99,102,241),0.3)', background: 'rgba(var(--acc-rgb,99,102,241),0.05)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                          <Zap size={12} /> Key Facts / High-Yield
                        </p>
                        {selectedDrug.keyFacts.map(f => (
                          <div key={f} className="flex items-start gap-2 text-sm font-medium mb-1.5">
                            <Star size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedDrug.mnemonics?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#8b5cf6' }}>🧠 Mnemonics</p>
                        {selectedDrug.mnemonics.map(m => (
                          <p key={m} className="text-sm font-medium mb-1.5">{m}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'dosing' && selectedDrug.dosing && (
                  <>
                    {[
                      { key: 'adult', label: 'Adult Dosing', color: 'var(--accent)' },
                      { key: 'pediatric', label: 'Pediatric Dosing', color: '#06b6d4' },
                      { key: 'renal', label: 'Renal Adjustment', color: '#f59e0b' },
                      { key: 'hepatic', label: 'Hepatic Adjustment', color: '#f97316' },
                      { key: 'maxDose', label: 'Maximum Dose', color: '#ef4444' },
                    ].filter(({ key }) => selectedDrug.dosing[key]).map(({ key, label, color }) => (
                      <div key={key} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color, opacity: 0.8 }}>{label}</p>
                        <p className="text-sm leading-relaxed">{selectedDrug.dosing[key]}</p>
                      </div>
                    ))}
                    {selectedDrug.pregnancy && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.05)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#ec4899' }}>Pregnancy</p>
                        <p className="text-sm leading-relaxed">{selectedDrug.pregnancy}</p>
                      </div>
                    )}
                    {selectedDrug.nursing && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(236,72,153,0.2)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#ec4899' }}>Lactation / Nursing</p>
                        <p className="text-sm leading-relaxed">{selectedDrug.nursing}</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'sideeffects' && selectedDrug.sideEffects && (
                  <>
                    {selectedDrug.sideEffects.common?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-40">Common Side Effects</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrug.sideEffects.common.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-xl text-xs font-bold"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDrug.sideEffects.serious?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>⚠️ Serious / Severe</p>
                        <div className="space-y-1.5">
                          {selectedDrug.sideEffects.serious.map(s => (
                            <div key={s} className="flex items-start gap-2 text-sm">
                              <AlertCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDrug.contraindications?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-40">Contraindications</p>
                        <div className="space-y-1.5">
                          {selectedDrug.contraindications.map(c => (
                            <div key={c} className="flex items-start gap-2 text-sm font-medium">
                              <X size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDrug.monitoring?.length > 0 && (
                      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-40">Monitoring Parameters</p>
                        <div className="space-y-1.5">
                          {selectedDrug.monitoring.map(m => (
                            <div key={m} className="flex items-start gap-2 text-sm">
                              <Activity size={12} className="shrink-0 mt-0.5" style={{ color: '#06b6d4' }} />
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'interactions' && (
                  <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-40">Drug Interactions</p>
                    <div className="space-y-2">
                      {(selectedDrug.interactions || []).map(inter => (
                        <div key={inter} className="flex items-start gap-2 p-2.5 rounded-xl text-sm"
                          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <Zap size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                          {inter}
                        </div>
                      ))}
                    </div>
                    {/* Related drugs */}
                    {selectedDrug.relatedDrugs?.length > 0 && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3 opacity-40">Related Drugs</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrug.relatedDrugs.map(rd => {
                            const found = MEDICINE_DB.find(d => d.id === rd || d.name.toLowerCase() === rd.toLowerCase());
                            return (
                              <button key={rd} onClick={() => found && setSelectedDrug(found)}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105"
                                style={{ background: 'rgba(var(--acc-rgb,99,102,241),0.15)', color: 'var(--accent)', border: '1px solid rgba(var(--acc-rgb,99,102,241),0.3)' }}>
                                {found ? found.name : rd}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pharmacology' && selectedDrug.pharmacokinetics && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'absorption', label: 'Absorption', icon: '⬆️' },
                        { key: 'distribution', label: 'Distribution', icon: '🔄' },
                        { key: 'metabolism', label: 'Metabolism', icon: '⚗️' },
                        { key: 'elimination', label: 'Elimination', icon: '⬇️' },
                      ].filter(({ key }) => selectedDrug.pharmacokinetics[key]).map(({ key, label, icon }) => (
                        <div key={key} className="glass rounded-2xl p-4 col-span-1" style={{ border: '1px solid var(--border)' }}>
                          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">{icon} {label}</p>
                          <p className="text-xs leading-relaxed">{selectedDrug.pharmacokinetics[key]}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'counseling' && selectedDrug.counseling?.length > 0 && (
                  <div className="glass rounded-2xl p-4" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>Patient Counseling Points</p>
                    <div className="space-y-3">
                      {selectedDrug.counseling.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>{i + 1}</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Docked tutor — desktop */}
            {!isMobile && (
              <DraggableTutorPanel
                context={tutorContext}
                contextLabel={selectedDrug.name}
                settings={settings}
                defaultMode="docked"
              />
            )}
          </div>
        )}
      </div>

      {/* Floating tutor — mobile */}
      {isMobile && selectedDrug && (
        <DraggableTutorPanel
          context={tutorContext}
          contextLabel={selectedDrug?.name}
          settings={settings}
          defaultMode="floating"
        />
      )}
    </div>
  );
}
```

---

## TASK 3 — WIRE MEDICINES VIEW INTO APP NAVIGATION

In the `App()` function (around line 7107):

1. **Add ViewWrapper** after the diseases route:
```jsx
<ViewWrapper active={view === 'medicines'}>
  <MedicinesView settings={settings} />
</ViewWrapper>
```

2. **Add to mobile bottom nav** — find the bottom nav items array and add:
```javascript
{ id: 'medicines', icon: Pill, label: 'Medicines' }
```

3. **Add to desktop sidebar** with the same label and `Pill` icon (already imported from lucide-react)

4. **Add to the home page "Medical Reference" tools section** so it appears in the grid alongside the other medical tools

5. **Add keyboard shortcut** in `useKeyboardShortcuts`:
```javascript
['ctrl+m', () => setView('medicines')],
```

---

## TASK 4 — UPGRADE `GlobalSearch` TO SEARCH EVERYTHING

Find `GlobalSearch` (line ~988) and completely replace the `results` useMemo with this comprehensive version that searches ALL content in the app:

The `GlobalSearch` component currently only receives: `docs, flashcards, exams, cases, notes`

**Step 4a — Update GlobalSearch signature** to accept all data sources:
```javascript
function GlobalSearch({ docs, flashcards, exams, cases, notes, onNavigate, onClose }) {
```
becomes:
```javascript
function GlobalSearch({ docs, flashcards, exams, cases, notes, onNavigate, onClose, chatSessions }) {
```

**Step 4b — Replace the results useMemo with this comprehensive version:**
```javascript
const results = useMemo(() => {
  if (!q.trim() || q.length < 2) return [];
  const lq = q.toLowerCase();
  const out = [];

  // 1. Documents
  docs.forEach(d => {
    if (d.name.toLowerCase().includes(lq))
      out.push({ type: 'Document', icon: FileText, label: d.name, sub: `${d.totalPages} pages`, color: '#6366f1', action: () => onNavigate('reader', d.id) });
  });

  // 2. Flashcard questions + answers
  flashcards.forEach(set => (set.cards || []).forEach(c => {
    if ((c.q + ' ' + c.a).toLowerCase().includes(lq))
      out.push({ type: 'Flashcard', icon: Layers, label: c.q.slice(0, 70), sub: set.title, color: '#8b5cf6', action: () => onNavigate('flashcards') });
  }));

  // 3. Exam questions
  exams.forEach(ex => (ex.questions || []).forEach(q2 => {
    if ((q2.q || '').toLowerCase().includes(lq))
      out.push({ type: 'Exam', icon: CheckSquare, label: (q2.q || '').slice(0, 70), sub: ex.title, color: '#3b82f6', action: () => onNavigate('exams') });
  }));

  // 4. Cases
  cases.forEach(set => (set.questions || []).forEach(c => {
    if ((c.vignette + ' ' + (c.title || '')).toLowerCase().includes(lq))
      out.push({ type: 'Case', icon: Activity, label: (c.title || c.vignette || '').slice(0, 70), sub: set.title, color: '#06b6d4', action: () => onNavigate('cases') });
  }));

  // 5. Notes
  notes.forEach(n => {
    if ((n.title + ' ' + n.content).toLowerCase().includes(lq))
      out.push({ type: 'Note', icon: PenLine, label: n.title, sub: n.content?.slice(0, 50), color: '#f59e0b', action: () => onNavigate('notes') });
  });

  // 6. DISEASE DATABASE — searches name, aliases, symptoms, system
  (typeof DISEASE_DB !== 'undefined' ? DISEASE_DB : []).forEach(d => {
    const searchStr = [d.name, ...(d.aliases || []), d.system, ...(d.symptoms || []), ...(d.tags || [])].join(' ').toLowerCase();
    if (searchStr.includes(lq))
      out.push({ type: 'Disease', icon: Stethoscope, label: d.name, sub: `${d.system} · ICD-10: ${d.icd10 || 'N/A'}`, color: '#ef4444', action: () => onNavigate('diseases') });
  });

  // 7. MEDICINE DATABASE — searches name, generic, brands, class, indications
  (typeof MEDICINE_DB !== 'undefined' ? MEDICINE_DB : []).forEach(d => {
    const searchStr = [d.name, d.genericName, d.drugClass, ...(d.brandNames || []), ...(d.indications || []), ...(d.tags || [])].join(' ').toLowerCase();
    if (searchStr.includes(lq))
      out.push({ type: 'Medicine', icon: Pill, label: d.name, sub: `${d.drugClass} · ${d.genericName || ''}`, color: '#10b981', action: () => onNavigate('medicines') });
  });

  // 8. Chat sessions
  (chatSessions || []).forEach(s => {
    if ((s.title || '').toLowerCase().includes(lq) || (s.messages || []).some(m => m.content?.toLowerCase().includes(lq)))
      out.push({ type: 'Chat', icon: MessageSquare, label: s.title || 'Untitled Chat', sub: `${(s.messages || []).length} messages`, color: '#34d399', action: () => onNavigate('chat') });
  });

  // Return max 20 results, weighted: exact matches first
  return out
    .sort((a, b) => {
      const aExact = a.label.toLowerCase().startsWith(lq) ? 0 : 1;
      const bExact = b.label.toLowerCase().startsWith(lq) ? 0 : 1;
      return aExact - bExact;
    })
    .slice(0, 20);
}, [q, docs, flashcards, exams, cases, notes, chatSessions]);
```

**Step 4c — Update empty state quick-actions grid** to include the new sections:
```jsx
{!q && (
  <div className="p-4 space-y-3">
    <p className="text-xs font-black opacity-30 uppercase tracking-widest px-1">Quick Navigate</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[
        ['Documents', 'library', FileText, '#6366f1'],
        ['Flashcards', 'flashcards', Layers, '#8b5cf6'],
        ['Exams', 'exams', CheckSquare, '#3b82f6'],
        ['Cases', 'cases', Activity, '#06b6d4'],
        ['Diseases', 'diseases', Stethoscope, '#ef4444'],
        ['Medicines', 'medicines', Pill, '#10b981'],
        ['Chat', 'chat', MessageSquare, '#34d399'],
        ['Notes', 'notes', PenLine, '#f59e0b'],
      ].map(([lbl, v, Icon, col]) => (
        <button key={v} onClick={() => { onNavigate(v); onClose(); }}
          className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[var(--accent)]/30 transition-all">
          <Icon size={18} style={{ color: col }} />
          <span className="text-xs font-black">{lbl}</span>
        </button>
      ))}
    </div>
  </div>
)}
```

**Step 4d — Pass `chatSessions` to GlobalSearch** in the App() render:
Find where `GlobalSearch` is rendered (search for `<GlobalSearch`) and add `chatSessions={chatSessions}` prop.

**Step 4e — Show result type badge with color coding:**
Update each result row to show the type badge with a colored background matching the result type color:
```jsx
<span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shrink-0"
  style={{ background: r.color + '20', color: r.color }}>
  {r.type}
</span>
```

---

## TASK 5 — ERROR CHECKING & SAFETY

Before committing, verify:

1. **`MEDICINE_DB` defined at module level** — before `MedicinesView`, after all imports
2. **`DRUG_CATEGORIES` and `DRUG_SCHEDULES` also at module level** — not inside the component
3. **`DraggableTutorPanel` exists** — was added in previous session. If not found, it must be created first (see previous prompt)
4. **All `.map()` calls use `|| []` fallback** — `(array || []).map(...)`
5. **`isMobile` defined** in every component that uses it: `const isMobile = window.innerWidth < 768;`
6. **No prop drilling missing** — `MedicinesView` receives `settings` from App()
7. **GlobalSearch `chatSessions` prop** — make sure it's passed from App() where GlobalSearch is rendered
8. **`Stethoscope`, `Pill`, `FlaskConical`, `GitBranch`** — all already imported from lucide-react at top of file. Do NOT add duplicate imports.
9. **DISEASE_DB guard in GlobalSearch** — use `typeof DISEASE_DB !== 'undefined'` check before accessing it to prevent crash if diseases page hasn't loaded yet

---

## TASK 6 — GIT COMMIT

After all tasks complete with zero errors:

```bash
git add -A
git commit -m "feat: Add MedicinesView with 200+ drug database + upgrade GlobalSearch to search everything

- MedicinesView: 200+ medicines with Mechanism, Dosing, Side Effects, Interactions, PK, Counseling tabs
- MEDICINE_DB: comprehensive drug database covering all major classes
- DraggableTutorPanel integrated into MedicinesView (docked desktop, floating mobile)
- GlobalSearch: now searches Documents, Flashcards, Exams, Cases, Notes, Diseases, Medicines, Chats
- GlobalSearch: quick-navigate grid expanded to 8 sections
- GlobalSearch: color-coded type badges per result
- GlobalSearch: exact-match results sorted to top
- Keyboard shortcut Ctrl+M → medicines view"
git push origin main
```

---

## EXECUTION ORDER

1. Task 1 — Create `MEDICINE_DB`, `DRUG_CATEGORIES`, `DRUG_SCHEDULES` at module level
2. Task 2 — Build `MedicinesView` component
3. Task 3 — Wire into navigation + home page
4. Task 4 — Upgrade `GlobalSearch`
5. Task 5 — Error check
6. Task 6 — Git commit

**DO NOT STOP between tasks. Complete all 6 in one session.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART E — LEGAL, SECURITY, PRICING, GAMIFICATION, MARKETING & 24-MONTH ROADMAP
## (SaaS strategy, $9.99/$19.99 plans, XP system, viral loops, global domination)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Think at the level of:
- **Notion** → product elegance + viral collaboration
- **ChatGPT** → conversational AI depth  
- **Anki + FSRS-5** → spaced repetition science
- **UWorld** → question bank quality and clinical depth
- **Amboss** → integrated clinical reference
- **Duolingo** → behavioral psychology + retention loops
- **Stripe** → frictionless monetization
- **Linear** → developer-level UX polish
- **Headspace** → habit formation and daily engagement

**The app already has:**
File upload (PDF/Word/Excel/Images/Code), Flashcards (FSRS-5), Exams (MCQ), Clinical Cases (USMLE level), AI Tutor (chat + voice with ProsodyEngine), 65+ medical reference tools (all specialties), offline-first IndexedDB, 7 AI providers (Claude/OpenAI/Gemini/Groq/DeepSeek/Ollama/Custom), 117 React components, 17,944 lines of production code.

**CRITICAL CONSTRAINTS:**
- No lifetime subscriptions — recurring revenue ONLY (monthly + yearly)
- No hardcoded colors — always CSS variables (var(--accent), var(--bg), etc.)
- All new components use existing patterns (TutorChat, useDrag, useSwipe, SplitPane, BottomSheet)
- Every new page gets DraggableTutorPanel
- Git commit after every section completes
- Test on iPhone Safari before every commit (that is where most crashes happen)

---

## ══════════════════════════════════════════════════════
## SECTION 1 — LEGAL PROTECTION & MEDICAL LIABILITY
## ══════════════════════════════════════════════════════

### 1.1 Why This Is Priority #1 Before Going Public
One lawsuit from a medical student who misused AI content for a clinical decision can destroy the entire company. Legal protection must be baked into the product UX — not buried in a PDF nobody reads.

### 1.2 Mandatory ToS Acceptance Modal
Build a `LegalAcceptanceModal` shown ONCE on first launch. Cannot be dismissed without checking all boxes. Store acceptance timestamp + ToS version in IndexedDB.

```javascript
const TOS_VERSION = '2.0';
// If version changes → show modal again

const REQUIRED_CHECKBOXES = [
  'I understand this app is for EDUCATIONAL PURPOSES ONLY',
  'I understand AI-generated content may contain errors and must be verified',
  'I will NOT use any content in this app for real patient care decisions',
  'I will always consult a licensed healthcare provider for clinical decisions',
  'I am 18 years or older (or have parental consent)',
  'I agree to the full Terms of Service and Privacy Policy',
];
// All 6 must be checked before "Get Started" button activates
```

### 1.3 Persistent Disclaimers in UI
Every AI-generated content block gets a small disclaimer:

```javascript
const AIDisclaimer = () => (
  <div style={{ 
    fontSize: 10, opacity: 0.5, marginTop: 8,
    padding: '3px 8px', borderRadius: 6,
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.15)'
  }}>
    ⚠️ AI-generated educational content. Verify before clinical use. Not medical advice.
  </div>
);

// On Clinical Simulator, Drug Checker, Differential Diagnosis tools:
const ClinicalWarningBanner = () => (
  <div className="glass rounded-xl p-3 mb-3 flex items-start gap-2"
    style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
    <AlertCircle size={14} style={{ color: '#ef4444' }} />
    <p className="text-xs leading-relaxed" style={{ color: '#ef4444' }}>
      <strong>Educational Tool Only.</strong> For learning purposes. 
      Never use for real patient care. Always follow institution protocols.
    </p>
  </div>
);
```

### 1.4 Modify All AI System Prompts
Add to EVERY generation system prompt:
```
IMPORTANT: Generate educational content ONLY.
Never provide specific dosing protocols, treatment orders, or actionable clinical instructions.
Content is for learning and exam preparation — not clinical decision-making.
Always include educational framing ("Students should know that..." not "Give the patient...").
```

### 1.5 Automatic Data Deletion Policy
```javascript
const DATA_RETENTION = {
  uploadedFiles: '90 days after last access',
  aiGeneratedContent: 'Until user deletes',
  accountData: 'Until account deletion (30-day grace period)',
  analyticsData: '2 years (anonymized after 1 year)',
  gdprErasureTimeline: '30 days after request'
};
// Add "Delete All My Data" button in Settings → Account
// Show data retention info in Privacy Settings
```

---

## ══════════════════════════════════════════════════════
## SECTION 2 — DATA PRIVACY, GDPR & HIPAA COMPLIANCE
## ══════════════════════════════════════════════════════

### 2.1 Compliance Requirements

**GDPR (mandatory for any EU user):**
- Plain-language Privacy Policy (not legalese)
- Cookie consent banner (explicit opt-in for analytics)
- Right to access: "Download all my data" button → exports JSON
- Right to erasure: "Delete my account" → purges everything within 30 days
- Data portability: export in machine-readable JSON format
- Lawful basis documented for each data type

**HIPAA (US clinical settings):**
- MARIAM PRO processes educational content, NOT real patient data
- Add PHI detection warning when user uploads files:
  ```javascript
  const PHI_PATTERNS = [
    /\b\d{3}-\d{2}-\d{4}\b/,          // SSN pattern
    /\bDOB:\s*\d{1,2}\/\d{1,2}\/\d{4}\b/i,  // Date of birth
    /\bMRN:\s*\d+/i,                    // Medical record number
    /\bPt\.?\s+[A-Z][a-z]+\s+[A-Z]/,   // Patient name pattern
  ];
  // If detected: "⚠️ This file may contain patient identifiers. 
  // Please de-identify before uploading. MARIAM PRO is not HIPAA-compliant storage."
  ```
- For institutional sales: Business Associate Agreement (BAA) required

**FERPA (US student data):**
- Never share individual student performance data with third parties
- Institutional dashboards show aggregate/anonymized data only
- Individual data only visible to the student themselves

### 2.2 Encryption Standards
```
Files at rest:     AES-256 (Supabase + Cloudflare R2 handle this)
Data in transit:   TLS 1.3 minimum (Cloudflare enforces)
BYOA API keys:     Encrypted client-side with user-derived key

// For users who store their own API key (BYOA mode):
const encryptApiKey = async (key, userId) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(userId + '_mariam_salt'), 
    'PBKDF2', false, ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode(userId), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, aesKey, encoder.encode(key)
  );
  // Store encrypted key + iv in IndexedDB
};
// Never store plain-text API keys anywhere
```

### 2.3 GDPR Cookie Banner
```javascript
// Build CookieConsentBanner — show on first visit
const CookieConsentBanner = () => {
  // Essential cookies: Always ON (app cannot function without)
  //   - Session token, app state, IndexedDB (not actual cookies — note this)
  // Analytics cookies: User CHOICE (PostHog event tracking)
  // Marketing cookies: User CHOICE (conversion pixel if added later)
  
  // Store choice in localStorage key 'cookie_consent_v1'
  // Respect navigator.doNotTrack === '1'
  // Provide link to full Cookie Policy
};
```

### 2.4 Permission Management for Shared Decks
```javascript
const SHARE_PERMISSION_LEVELS = {
  view_only:   { canStudy: true,  canEdit: false, canCopy: false, canShare: false },
  study_copy:  { canStudy: true,  canEdit: false, canCopy: true,  canShare: false },
  collaborate: { canStudy: true,  canEdit: true,  canCopy: true,  canShare: false },
  admin:       { canStudy: true,  canEdit: true,  canCopy: true,  canShare: true  },
};
// Deck owner can: change permissions, revoke access, set expiry date, add password
// All sharing uses short-lived signed URLs (72-hour expiry for view links)
```

---

## ══════════════════════════════════════════════════════
## SECTION 3 — BACKEND ARCHITECTURE & API SECURITY
## ══════════════════════════════════════════════════════

### 3.1 The Problem (Fix Before Public Launch)
Current state: API keys stored in browser IndexedDB. Anyone can open DevTools → Application → IndexedDB → copy the key. This is a critical vulnerability.

### 3.2 Production Stack
```
Frontend (React PWA) — sends JWT only, never API keys
    ↓ HTTPS/TLS 1.3
Cloudflare Workers (edge, < 50ms globally, 100K req/day free)
    → Rate limiting (Layer 1: IP-based)
    → JWT validation (Clerk.dev or Supabase Auth)
    → Request sanitization
    ↓
Backend Service (Hono.js on Workers — zero cold starts)
    → User quota check
    → Model selection (cheapest acceptable for task)
    → QuestionVarietyEngine variety plan injection
    ↓
AI Router (internal — keys NEVER touch frontend)
    → [Anthropic Claude]
    → [OpenAI GPT-4o]
    → [Google Gemini]
    → [Groq]
    ↓
Response processing
    → Token deduction from user quota
    → Cache result (Upstash Redis, 30 days)
    → Analytics log (async, non-blocking)
    ↓
Supabase (PostgreSQL)
    → User accounts, quotas, decks, sharing
Cloudflare R2 (Object Storage)
    → Uploaded files ($0.015/GB/month — 90% cheaper than S3)
```

### 3.3 Authentication
```javascript
// Use Clerk.dev (free up to 10,000 MAU):
// Frontend sends ONLY the session JWT:
const getAuthHeaders = async () => ({
  'Authorization': `Bearer ${await clerk.session.getToken()}`,
  'X-Request-ID': crypto.randomUUID(),
  'X-App-Version': CONFIG.APP_VER,
});

// Backend validates FIRST, before anything else:
const validateRequest = async (req) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new Response('Unauthorized', { status: 401 });
  const user = await clerkClient.verifyToken(token);
  if (!user) throw new Response('Unauthorized', { status: 401 });
  await checkRateLimit(user.id, user.plan);
  await checkQuota(user.id, user.plan);
  return user;
};
```

### 3.4 Rate Limiting
```javascript
const PLAN_LIMITS = {
  free:    { req_per_hour: 10,  tokens_day: 50_000,    gen_per_day: 10,  max_items: 20 },
  pro:     { req_per_hour: 100, tokens_day: 500_000,   gen_per_day: 100, max_items: 500 },
  proplus: { req_per_hour: 500, tokens_day: 5_000_000, gen_per_day: -1,  max_items: 1000 },
};
// Layer 1: Cloudflare — IP rate limit (200 req/min)
// Layer 2: Per user — hourly request limit
// Layer 3: Per endpoint — generation endpoint max 10 concurrent per user
// Layer 4: Daily token budget — warn at 80%, hard stop at 100%
```

### 3.5 Security Hardening
```javascript
// Prompt injection prevention:
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions/i,
  /you\s+are\s+now\s+(a\s+)?/i,
  /act\s+as\s+(a\s+|an\s+)?(?!student|doctor|tutor|medical)/i,
  /jailbreak|DAN\s+mode|\[SYSTEM\]|\[INST\]|<\|im_start\|>/i,
];

const sanitize = (text) => {
  if (INJECTION_PATTERNS.some(p => p.test(text))) {
    logAbuse({ userId, text, ts: Date.now() });
    throw new Error('Invalid request content');
  }
  return text.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 100_000);
};

// File validation:
const validateUpload = (file) => {
  if (file.size > 50 * 1024 * 1024) throw new Error('Max file size: 50MB');
  const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png',
    'image/webp', 'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
  if (!ALLOWED.has(file.type)) throw new Error('File type not supported');
};
```

---

## ══════════════════════════════════════════════════════
## SECTION 4 — AI SYSTEM & COST OPTIMIZATION
## ══════════════════════════════════════════════════════

### 4.1 Hybrid Model Routing
```
NANO  (< $0.001/req) — Gemini Flash / GPT-4o-mini / Claude Haiku:
  Simple flashcards, translations, short Q&A, tag generation

STANDARD (< $0.01/req) — Claude Haiku / Gemini Flash Pro:
  Exam MCQs, standard cases, podcast scripts, summaries, mind maps

PRO  (< $0.08/req) — Claude Sonnet / GPT-4o:
  USMLE Step 3 vignettes, complex reasoning, drug interaction analysis,
  Hard/Insane difficulty (Pro+ plan only)

VISION (per image) — Claude Sonnet Vision:
  Radiology, ECG, histology analysis
  Only triggered when document is an image file
```

### 4.2 QuestionVarietyEngine — WIRE THIS NOW
**This is the single highest-impact unfixed bug. Generations are repetitive. This is why the app cannot compete with UWorld yet.**

```javascript
// In runBgGeneration — add these 3 lines:
// BEFORE launching parallel requests:
const engine = new QuestionVarietyEngine(domainHint, difficulty);
const varietyPlan = Array.from({ length: numBatches }, (_, i) =>
  engine.getNextPromptDirective(i)
);

// THEN pass to each parallel task:
const tasks = batches.map((batch, i) => ({
  ...batch,
  systemPrompt: buildGenerationSystemPrompt(
    taskType, difficultyLevel, pageRange, docName, varietyPlan[i]
  )
}));
// That's it. 3 lines. Immediately makes every generation 10x better.
```

### 4.3 Adaptive Intelligence Layer
```javascript
// After every study session, analyze performance:
const AdaptiveEngine = {
  
  getWeakDimensions: (cardHistory) => {
    const fails = cardHistory.filter(h => h.rating <= 2);
    const counts = {};
    fails.forEach(f => counts[f.questionType] = (counts[f.questionType] || 0) + 1);
    return Object.entries(counts).sort(([,a],[,b]) => b-a).slice(0,5).map(([d])=>d);
  },

  personalizePrompt: (weakAreas, basePrompt) => weakAreas.length === 0 ? basePrompt :
    `${basePrompt}\n\nPERSONALIZATION: Student struggles with: ${weakAreas.join(', ')}.
    Weight 60% of questions toward these areas. Use harder framing for weak areas,
    simpler for strong areas. Include extra context for weak dimensions.`,

  generateWeeklyInsight: async (userData, settings) => {
    const prompt = `Student data (7 days): ${JSON.stringify(userData)}.
    Write 3 sentences: (1) what they did well, (2) #1 priority topic,
    (3) encouraging score prediction. Be specific and data-driven.`;
    return callAI(prompt, false, false, settings, 300);
  }
};
```

### 4.4 Intelligent Caching
```javascript
// cache key = sha256(docId + pages + type + difficulty + count + lang)
// Cache hit → charge user 10% of normal token cost (huge savings)
// Storage: Upstash Redis (10,000 req/day free)
// Duration: 30 days
// Invalidate: on re-upload, explicit regenerate, or system prompt version bump
// Target: 40%+ cache hit rate → saves 40% of monthly AI costs
```

### 4.5 Token Reduction (Target: 60% reduction vs naive implementation)
```
1. Smart chunking: strip headers/footers/ToC, compress whitespace → -30% input
2. JSON mode output: minimal field names {q,a,e,p} not verbose → -20% output
3. Chat compression: summarize history beyond 10 messages → -40% chat tokens
4. Model routing: route to cheapest acceptable model → -50% cost vs single premium
5. Deduplication: remove duplicate questions post-generation → regenerate only dupes
```

### 4.6 Offline AI (Already Built — Enhance)
```javascript
// Current: Ollama support exists. Enhance with:
const OLLAMA_RECOMMENDATIONS = {
  flashcards: 'qwen2.5-coder:14b',  // Best balance on 16GB RAM
  exams:      'qwen2.5:14b',         // Needs reasoning ability
  cases:      'qwen3:14b',            // Complex clinical reasoning
  chat:       'any 7b+ model',        // Speed matters more than quality
};
// Add: queue offline requests → execute when internet/Ollama reconnects
// Add: cache last 50 AI responses for offline replay
// Add: clear "Offline Mode" indicator in UI
```

---

## ══════════════════════════════════════════════════════
## SECTION 5 — SAAS PRICING MODEL
## ══════════════════════════════════════════════════════

### 5.1 The Four Tiers

#### FREE — "Explorer" ($0/month, no credit card)
- 10 AI generations/day (max 20 items each)
- 1 document (max 10MB)
- All 65+ reference tools (no AI in them)
- Basic FSRS flashcard study
- 5 AI chat messages/day
- 1 voice tutor session/week (5 min)
- Watermark on exported PDFs
- No cloud sync
**Goal:** Enough to feel the value. Not enough to be a primary study tool.

---

#### PRO — "Medical Student" ($9.99/month | $84/year = $7/month, save 30%)
*Note: $9.99 not $12 — psychological pricing. Single-digit feels cheaper.*
- 500MB document storage, unlimited files
- 100 AI generations/day (max 500 items each)
- All AI features: flashcards, exams, cases, notes, timelines, mind maps
- Unlimited chat + voice tutor
- Study podcast (multi-voice, chapters, 0.5-2× speed)
- All reference tools with AI integration
- No watermarks + cloud sync + offline
- Anki export (.apkg)
- Boards countdown mode (exam date → daily plan)
- Weekly AI insights email
- Real push notifications
- Priority AI (faster model, shorter queue)
- XP + Levels + Leaderboard access

---

#### PRO+ — "Resident & Clinician" ($19.99/month | $168/year = $14/month, save 30%)
*UWorld costs $329/year for questions only. MARIAM PRO replaces 8 apps for $14/month.*
Everything in Pro PLUS:
- Unlimited AI generations + 1000 items per generation
- Hard/Insane difficulty (USMLE Step 3 vignettes)
- Most powerful models (GPT-4o, Claude Sonnet, Gemini Pro 1.5)
- Clinical Simulator (unlimited sessions)
- Collaborative decks (share with 10 classmates)
- Smart Boards Predictor (exam success probability)
- Image-based questions (X-ray, ECG, histology)
- Lecture-to-questions pipeline (audio → instant question bank)
- Patient Encounter Logger (residents)
- Specialty Match Predictor
- Faculty portal access
- API access
- Priority support (< 4 hour response)
- Early access to all new features

---

#### INSTITUTIONAL — "Medical School / Hospital"
- $499/month (50 seats) | $999/month (150 seats) | Custom for 500+
- Everything in Pro+, PLUS:
- Faculty dashboard (assign content, monitor cohort)
- Student analytics (aggregate performance, weak topic identification)
- Custom content upload (proprietary curriculum)
- LMS integration (Canvas, Blackboard, Moodle)
- SSO (SAML 2.0 / OAuth)
- Custom branding (white-label option)
- HIPAA BAA available
- Dedicated account manager + SLA 99.9%
- Quarterly business reviews

---

### 5.2 Psychological Pricing Tactics
- **Anchoring:** Show Pro+ first on pricing page. $19.99 makes $9.99 feel cheap.
- **Dollar savings:** "Save $36/year" — not "save 30%". Dollars feel more real.
- **Student verification:** SheerID (.edu email) → additional 20% off. Creates trust.
- **Regional pricing (PPP):** India/Pakistan/Egypt/Nigeria/Brazil → $3.99/$7.99 Pro/Pro+. Unlocks 240M medical students in developing world.
- **Group discount:** 4 friends together → each pays $7.99/month (Pro) — built-in viral loop.
- **Exam season offers:** 50% off January + September (USMLE peak seasons).

### 5.3 Upgrade Trigger Moments
```javascript
// Show upgrade prompt at EXACTLY the right moment:
const UPGRADE_TRIGGERS = {
  daily_limit:    "You've used 10/10 free generations today → Unlock unlimited for $1/day",
  count_exceeded: "Free max: 20 cards. You wanted {N}. → Preview first 20, blur rest",
  difficulty:     "Step 3 vignettes are Pro+ → Your boards deserve the best",
  streak_7:       "🔥 7-day streak! Serious students deserve serious tools → 1 month free",
  score_jump:     "Your score improved 12 points this week → Imagine unlimited AI",
  export:         "Remove watermark → Upgrade to Pro",
};
```

### 5.4 Retention Tactics
- **Pause (not cancel):** Pause for 1-3 months at $2/month — keeps users in ecosystem
- **Win-back sequence:** Cancel → 3 emails over 30 days with escalating offers (10% → 20% → 30% off)
- **Annual upgrade prompt:** Month 3 of monthly → "Switch to annual, save $36"
- **Referral:** 1 friend upgrades → 1 free month for referrer
- **Streak freeze:** Users earn 1 streak freeze per 7-day streak (Duolingo mechanic)

---

## ══════════════════════════════════════════════════════
## SECTION 6 — GAMIFICATION & BEHAVIORAL PSYCHOLOGY
## ══════════════════════════════════════════════════════

### 6.1 XP + Levels + Global Leaderboard
```javascript
const XP_TABLE = {
  card_studied: 5,           card_mastered: 25,
  exam_correct: 10,          exam_completed: 50,
  case_solved: 75,           daily_goal: 100,
  streak_day: 20,            streak_7: 200,
  streak_30: 500,            streak_100: 2000,
  file_uploaded: 30,         deck_shared: 50,
  classmate_joined: 100,     achievement_unlocked: 150,
};

const LEVELS = [
  { n: 1,  title: 'Pre-Med',         xp: 0 },
  { n: 5,  title: 'Medical Student', xp: 1000 },
  { n: 10, title: 'Clinical Intern', xp: 5000 },
  { n: 15, title: 'Junior Resident', xp: 15000 },
  { n: 20, title: 'Senior Resident', xp: 40000 },
  { n: 25, title: 'Fellow',          xp: 100000 },
  { n: 30, title: 'Attending',       xp: 250000 },
  { n: 35, title: 'Chief of Staff',  xp: 500000 },
  { n: 40, title: 'Professor',       xp: 1000000 },
];

// Leaderboard types: Global (weekly), Friends, School, Country
// All update in real-time via Supabase Realtime
```

### 6.2 Achievements System (40 badges minimum)
```javascript
const ACHIEVEMENTS = [
  // Study milestones
  { id: 'cards_100',    icon: '📚', title: 'Century Club',      desc: 'Study 100 cards' },
  { id: 'cards_1000',   icon: '🧠', title: 'Knowledge Seeker',  desc: 'Study 1,000 cards' },
  { id: 'cards_10000',  icon: '💡', title: 'Board Crusher',     desc: 'Study 10,000 cards' },
  // Streaks
  { id: 'streak_7',   icon: '🔥', title: 'Week Warrior',    desc: '7-day streak' },
  { id: 'streak_30',  icon: '⚡', title: 'Monthly Master',  desc: '30-day streak' },
  { id: 'streak_100', icon: '💎', title: 'Centurion',       desc: '100-day streak' },
  { id: 'streak_365', icon: '👑', title: 'Year-Long Scholar',desc: '365-day streak' },
  // Performance
  { id: 'score_80',    icon: '🎯', title: 'Sharp Shooter',    desc: 'Predicted score hits 80%' },
  { id: 'score_90',    icon: '🏆', title: 'Board Dominator',  desc: 'Predicted score hits 90%' },
  { id: 'perfect',     icon: '✨', title: 'Perfectionist',    desc: '100% on a practice exam' },
  // Social
  { id: 'first_share', icon: '🤝', title: 'Team Player',     desc: 'Share first deck' },
  { id: 'squad_3',     icon: '👥', title: 'Study Squad',     desc: '3 classmates joined via link' },
];
```

### 6.3 Daily Motivational Notifications (Push)
```javascript
// Morning (7am local): What to study today
"☀️ Good morning! Today's priority: Pharmacokinetics (your weakest area this week). 
 3 cards to review. Takes 4 minutes."

// Evening (8pm local) — loss aversion:
"🔥 {N}-day streak at risk! Study just 5 cards to keep it alive."

// Weekly (Sunday 6pm):
"📊 Weekly recap: You studied {N} cards, improved {M} points. 
 Your weakest topic: {topic}. Focus on it this week."

// Milestone:
"🎉 You just crossed 1,000 cards studied! You're in the top 15% of users."
```

### 6.4 Variable Reward System
```javascript
// After every 10th card studied, 40% chance of showing an insight:
const INSIGHTS = [
  "💡 Students who review mechanisms (not just names) score 23% higher on pharma questions.",
  "📊 You're in the top 12% of students who studied today.",
  "🧠 The forgetting curve says 70% forgotten in 24h — FSRS just scheduled the perfect review.",
  "⚡ Pattern: You master cardiovascular cards 40% faster than your average.",
  "📈 Your predicted score increased {delta} points since you started.",
  "🔥 Fun fact: Average passing USMLE student studied 847 hours of flashcards.",
];
// Show as a small, non-blocking toast. Rotate randomly.
// The unpredictability is what makes it powerful — user never knows when it appears.
```

### 6.5 The Aha Moment (Most Critical UX Decision)
Research shows: users who study ≥ 15 cards in Session 1 → 70% return on Day 7. Users who only create a deck without studying → 20% return on Day 7.

```javascript
// Optimized onboarding — FORCE the Aha Moment before showing pricing:
// Step 1: Choose specialty (Pharmacology / Cardiology / etc.)
// Step 2: Upload file — OR — use our sample PDF (< 1MB, loads instantly)
// Step 3: Watch AI generate 10 cards (animated, < 30 seconds)
// Step 4: Study ALL 10 cards with the 3D flip interface (CANNOT skip)
// Step 5: Show: "Your predicted exam score improved 4 points in 4 minutes 🎉"
// Step 6: THEN and ONLY THEN show pricing
// Never show pricing before the user has felt the value personally
```

---

## ══════════════════════════════════════════════════════
## SECTION 7 — DISTRIBUTION & MARKETING
## ══════════════════════════════════════════════════════

### 7.1 Channel Priority

**Channel 1 — Medical Communities (Free, Highest ROI):**
- Reddit: r/medicalschool (800K), r/step1 (150K), r/step2, r/MCAT (600K), r/Noctor
- Discord: USMLE servers, medical school servers
- WhatsApp/Telegram: Med student groups (massive in Middle East, India, Egypt)
- Strategy: Provide genuine value in discussions. Never spam. Mention the app naturally when it solves someone's problem.

**Channel 2 — Short-Form Video (Highest Viral Potential):**
- TikTok + Instagram Reels + YouTube Shorts
- Hook: "Watch me generate 500 USMLE flashcards from my professor's PDF in 60 seconds"
- Show the magic in real-time. The transformation IS the content.
- Target: 5-10 medical student creators as ambassadors in Year 1
- Give them Pro+ free for 6 months in exchange for 2 posts/month

**Channel 3 — YouTube (Long-term Trust + SEO):**
- "I used MARIAM PRO for 30 days before Step 1 — here are my actual results"
- "Best AI tools for medical students 2025/2026"
- Tutorial: "Generate perfect USMLE flashcards from any PDF"
- Long-form → higher trust → higher conversion rate

**Channel 4 — SEO (Compounding, Free Traffic):**
```
Create landing pages for every searchable term:
/study/[drug-name]    "Metformin Flashcards — AI-Generated Study Cards"
/study/[disease-name] "Heart Failure Study Guide — AI Flashcards"
/exams/[specialty]    "Cardiology USMLE Questions — Free Practice"
/reference/[topic]    "Hypertension Treatment Guidelines 2025"
Each page = organic search traffic → free user acquisition
```

**Channel 5 — University Ambassador Program:**
- 2 students per medical school, starting with top 50 schools
- Give Pro+ free for 12 months
- Ask: demo for class, post about it, refer classmates
- Pay $10 per paid referral (tracked by referral code)
- Top ambassadors → paid campus reps ($300-500/month)

### 7.2 The Four Viral Growth Loops

**Loop 1 — Deck Share:**
User creates amazing deck → shares with class → classmates sign up → create their own decks → share.
Incentive: Each classmate who signs up = 7 free Pro days for sharer.

**Loop 2 — Study Group:**
"Study with friends" → create group → competitive leaderboard → FOMO → engagement → sharing → signups.
Incentive: 4 people in group → each pays $7.99/month instead of $9.99.

**Loop 3 — Faculty:**
Professor uploads lecture → assigns 500 AI-generated questions → students must create accounts → students get hooked → students pay.
Incentive: Faculty gets Pro+ free for as long as they actively assign content.

**Loop 4 — Score Screenshot:**
Student sees beautiful predicted score widget → takes screenshot → shares on social media.
The score widget is the most shareable element in the app. Make it stunningly beautiful and screenshot-worthy.

---

## ══════════════════════════════════════════════════════
## SECTION 8 — MULTI-PLATFORM STRATEGY
## ══════════════════════════════════════════════════════

### 8.1 Platform Phases (Cost-Optimized)
```
PHASE 1 — NOW:  PWA (already done)
  Cost: $0. Installs on all platforms. 95% of functionality.

PHASE 2 — Month 6:  Capacitor.js Wrapper (~80 hours)
  Gets: App Store listing, Play Store listing,
        real push notifications, biometric auth, camera API.
  DO NOT rewrite in React Native — $200K and 12 months wasted.
  Same codebase, native container.

PHASE 3 — Month 12+ (only after 50K users):
  Capacitor plugins for true native features:
  - iOS Share Extension (highlight text in iBooks → send to MARIAM PRO)
  - Apple Watch complications (cards due count)
  - Android home screen widget (streak + due cards)
  - Background sync for FSRS scheduling

DESKTOP — When users request:
  Electron wrapper (2-3 weeks):
  - Drag files from Finder/Explorer
  - Global hotkey (Ctrl+Shift+M → quick review anywhere)
  - System tray icon with today's due count
```

---

## ══════════════════════════════════════════════════════
## SECTION 9 — ANALYTICS & KEY METRICS
## ══════════════════════════════════════════════════════

### 9.1 North Star Metric
**"Weekly Active Studiers"** — users who study ≥ 20 cards in any 7-day period.
Everything else is a supporting metric. This one predicts revenue and retention.

### 9.2 Metrics Dashboard
```
RETENTION:
  Day 1:  > 60%  (industry avg 40%)
  Day 7:  > 35%  (industry avg 20%)
  Day 30: > 20%  (industry avg 10%)
  Day 90: > 12%

CONVERSION:
  Free → Pro:    > 8%  (edtech avg 3-5%)
  Trial → Paid:  > 40%
  Monthly → Annual: > 30% (sticky revenue)

REVENUE:
  MRR growth:    > 20% month-over-month (early stage)
  Monthly churn: < 3%
  LTV:CAC:       > 3:1
  ARPU:          > $8/paying user

ENGAGEMENT:
  Cards/day (active users): > 30
  Sessions/week:             > 4
  AI generations/week (Pro): > 5
  Feature adoption (new):    > 20% in 30 days
```

### 9.3 Analytics Stack
```
User events:    PostHog (open source, 1M events/month free)
Errors:         Sentry (free tier)
Payments:       Stripe Dashboard (built-in)
Email:          Resend (100/day free → $20/month for more)
Custom data:    Supabase + existing app analytics
```

### 9.4 Funnel to Track
```
Signup
  → First generation (Activation)
  → Studies 15+ cards (Aha Moment)
  → Day 7 return (Retained)
  → Day 14 active (Habit formed)
  → First upgrade prompt seen
  → Upgrade (Conversion)
  → Month 2 retained
  → Annual plan upgrade
  → NPS > 50 (Promoter)
  → Referral sent
```

---

## ══════════════════════════════════════════════════════
## SECTION 10 — COMPLETE MISSING FEATURES BACKLOG
## ══════════════════════════════════════════════════════

### 🔴 CRITICAL — Must fix before public launch:
- [ ] User authentication system (Supabase/Clerk — no accounts = no SaaS)
- [ ] Stripe subscription integration ($9.99/$19.99 monthly + yearly)
- [ ] Backend API proxy — remove all API keys from browser
- [ ] Legal ToS acceptance modal (mandatory, ungated)
- [ ] GDPR cookie consent banner
- [ ] Medical disclaimer on all AI-generated content
- [ ] PHI detection warning for uploaded files
- [ ] **QuestionVarietyEngine wired into runBgGeneration** (built but DISCONNECTED)
- [ ] **Streaming chunk buffer fix** (causes broken markdown mid-render)
- [ ] **Safari/iOS IndexedDB crash fix** (QuotaExceededError + SecurityError)

### 🟠 HIGH PRIORITY — Needed for retention and growth:
- [ ] **Disease Explorer page** — DISEASE_DB + DiseaseExplorerView (designed, never coded)
- [ ] **Medicines page** — MEDICINE_DB + MedicinesView (designed, never coded)
- [ ] **DraggableTutorPanel** on all 65+ tools (designed, never coded)
- [ ] Real push notifications via service worker (UI exists, backend missing)
- [ ] Deck sharing (public link + classmate invite + permissions system)
- [ ] Boards countdown mode (exam date input → AI-generated daily plan)
- [ ] Weekly AI insights email (personalized performance report via Resend)
- [ ] XP + Levels + Global Leaderboard system
- [ ] Achievements + Badges (40 badges minimum)
- [ ] Adaptive Intelligence Layer (personalize generation to user's weak areas)
- [ ] Variable reward system (insights after every 10 cards)
- [ ] Loss aversion notifications ("streak at risk")
- [ ] Social proof in UI ("4,200 students studied this deck this week")

### 🟡 MEDIUM PRIORITY — Needed for scale:
- [ ] Anki export (.apkg format) — most-requested feature by power users
- [ ] Image-based questions (upload X-ray/ECG/histology → generate questions)
- [ ] Collaborative study rooms (2-5 students live — see each other's progress)
- [ ] Faculty portal (curriculum upload + assign to students + cohort analytics)
- [ ] Mobile App Store listing (Capacitor.js — ~80 hours work)
- [ ] Community question bank (user-contributed, peer-reviewed)
- [ ] "Download all my data" export button (GDPR compliance)
- [ ] "Delete my account" with full data purge (GDPR compliance)
- [ ] Regional pricing (India, Egypt, Pakistan, Nigeria, Brazil)
- [ ] Student .edu verification (SheerID → 20% extra discount)
- [ ] Group pricing (4 friends → $7.99/month each)
- [ ] Referral tracking system (code-based, auto credit)
- [ ] Pause subscription option (don't cancel — pause for $2/month)
- [ ] Win-back email sequence for cancellations

### 🟢 LONG-TERM MOAT — To dominate completely:
- [ ] **Smart Boards Predictor** — probability of passing Step 1/2/NCLEX on target date
- [ ] **Lecture-to-Test Pipeline** — audio upload → Whisper → 50 questions in 2 min
- [ ] **Patient Encounter Logger** — residents log case → auto-generates learning flashcards
- [ ] **Specialty Match Predictor** — study patterns → predicted best-fit specialty
- [ ] **"What would I fail today?" daily alert** — AI identifies 3 most at-risk topics per FSRS data
- [ ] **Study Group Leaderboard** — class-wide competitive accountability
- [ ] **Content Marketplace** — users sell premium decks, platform takes 30%
- [ ] **Plugin Ecosystem** — SDK for third-party medical tools
- [ ] **LMS Integration** (Canvas, Blackboard, Moodle via API)
- [ ] **SSO for institutions** (SAML 2.0 / OAuth 2.0)
- [ ] **White-label** option for medical coaching companies
- [ ] **International UI** (Arabic RTL, Spanish, Portuguese, Hindi, French)
- [ ] **AR mode** — point phone at anatomy diagram → overlay flashcards
- [ ] **Two-way EHR integration** for residents (anonymized case-based learning)

---

## ══════════════════════════════════════════════════════
## SECTION 11 — PLUGIN ECOSYSTEM ARCHITECTURE
## ══════════════════════════════════════════════════════

### 11.1 The Vision
Transform MARIAM PRO from an app into a medical education ecosystem — like VSCode for medical students. Third-party developers build plugins that run inside the app. Platform takes 30% of plugin revenue.

### 11.2 Plugin API
```javascript
const MariamPluginAPI = {
  // Event hooks
  onFileUploaded:    (callback) => {},  // file + extractedText
  onCardStudied:     (callback) => {},  // card + rating
  onExamCompleted:   (callback) => {},  // exam + score
  
  // UI injection points
  addToolbarButton:  (icon, label, onClick) => {},
  addSidebarPanel:   (title, ReactComponent) => {},
  addReferenceTab:   (title, ReactComponent) => {},
  addGenerationType: (type, label, handler) => {},
  
  // Data access (read-only for plugins)
  getUserDecks:         () => Promise<Deck[]>,
  getCurrentDocument:   () => Promise<Document>,
  getUserAnalytics:     () => Promise<Analytics>,
  
  // Platform AI (uses platform quota, no plugin key needed)
  callAI:  (prompt, options) => Promise<string>,
};

// Priority plugins to build first (internal):
// 1. radiology-ai     — X-ray/CT/MRI analysis + teaching
// 2. ecg-analyzer     — ECG interpretation + clinical teaching  
// 3. anatomy-3d       — Three.js 3D anatomy viewer
// 4. pharmacology-pro — Enhanced drug database with interactions
// 5. osce-simulator   — Structured OSCE practice scenarios
```

### 11.3 Developer Program
- Open Plugin SDK with full documentation
- Plugin marketplace inside the app (curated tab in Home)
- Revenue share: plugin creator 70%, platform 30%
- Medical accuracy review before listing (safety requirement)
- This creates content and features at zero cost to the platform

---

## ══════════════════════════════════════════════════════
## SECTION 12 — ADVANCED KILLER FEATURES
## ══════════════════════════════════════════════════════

### 12.1 Smart Boards Predictor
```javascript
// Input: user's complete FSRS card data
// Output: "73% probability of passing Step 1 by March 15.
//          To reach 85%: study 30 more cards/day for 21 days."
// This is the most emotionally resonant feature possible for a medical student.
// Every student obsesses over their pass probability.
// Update it daily. Make it the centerpiece of the dashboard.
```

### 12.2 Lecture-to-Test Pipeline
```
Upload: 60-minute lecture audio file
↓
Whisper API transcription: < 2 minutes, $0.006/minute
↓  
AI extracts testable concepts (entities, relationships, clinical pearls)
↓
Generates 50 MCQ questions with USMLE framing
↓
User reviews + approves → adds to their deck
Total time: < 5 minutes
Cost: ~$0.04 per lecture
```

### 12.3 "What Would I Fail Today?" Daily Alert
```javascript
// Every morning, the algorithm runs:
const getDailyFailureRisks = (allCards) => {
  return allCards
    .map(c => ({
      card: c,
      retention: fsrs.retrievability((Date.now() - c.lastReview) / 86400000, c.stability),
      clinicalImportance: c.tags?.includes('usmle-high-yield') ? 2 : 1,
      urgency: retention * clinicalImportance
    }))
    .sort((a, b) => a.urgency - b.urgency)  // lowest urgency = most at risk
    .slice(0, 3);
};
// Push notification at 7am: "Today's 3 failure risks: [topic1], [topic2], [topic3]"
```

### 12.4 Patient Encounter Logger (Residents)
```javascript
// Resident logs: "Patient: 58M with crushing chest pain, diaphoresis, ECG shows ST elevation V1-V4"
// AI generates:
// 1. Educational summary of this presentation
// 2. 5 USMLE-style questions about this exact scenario
// 3. Adds questions to their personal deck with tag "clinical_rotation_[date]"
// Result: Every clinical shift → automatic flashcard generation
// The more they work → the more they learn → unbreakable habit
```

---

## ══════════════════════════════════════════════════════
## SECTION 13 — 24-MONTH ROADMAP TO 100,000 USERS
## ══════════════════════════════════════════════════════

```
MONTH 1-2: Legal + Revenue Foundation
  Legal ToS modal, GDPR banner, PHI warning
  Supabase auth, Stripe ($9.99/$19.99), Backend proxy
  Fix: QuestionVarietyEngine, streaming, Safari iOS
  Target: 500 beta users, $500 MRR

MONTH 3-4: Core Retention
  Disease Explorer page, Medicines page, DraggableTutorPanel
  Push notifications, deck sharing, boards countdown
  Weekly insights email, XP + levels basic
  Target: 3,000 users, $4,000 MRR

MONTH 5-6: Growth Activation
  App Store + Play Store (Capacitor)
  Faculty portal beta, adaptive intelligence layer
  Global leaderboard, community question bank
  SEO: 50 drug/disease landing pages
  University ambassador program (5 schools)
  Target: 10,000 users, $15,000 MRR

MONTH 7-9: Viral Loops
  Study group + collaborative leaderboard
  Image-based questions (X-ray, ECG)
  Regional pricing (India, Egypt, Pakistan)
  Ambassadors → 50 schools
  Content marketplace, Smart Boards Predictor
  Target: 30,000 users, $40,000 MRR

MONTH 10-12: Institutional Revenue
  3 institutional deals closed ($499/month each)
  Lecture-to-Test pipeline, Patient Encounter Logger
  Specialty Match Predictor, LMS integration
  Plugin ecosystem SDK released
  Target: 60,000 users, $90,000 MRR

MONTH 13-24: Global Domination
  International UI (Arabic RTL, Spanish, Portuguese, Hindi)
  10+ institutional deals
  Plugin marketplace open to developers
  Collaboration with NBME / USMLE programs
  White-label for coaching companies
  Series A if needed
  Target: 100,000+ users, $200,000+ MRR
```

---

## ══════════════════════════════════════════════════════
## SECTION 14 — IMPLEMENTATION RULES FOR AI AGENT
## ══════════════════════════════════════════════════════

Every time you implement any feature from this document, follow ALL of these rules without exception:

**LEGAL:**
1. Every AI-generated content block must include `<AIDisclaimer />` component
2. Clinical tools (Simulator, DDx, Drug Checker) must have `<ClinicalWarningBanner />` at top
3. All generation system prompts must include "Educational content only" instruction

**SECURITY:**
4. Never store plain-text API keys in any form (use crypto.subtle to encrypt)
5. Every new API call must go through the backend proxy (never directly from frontend in production)
6. Sanitize all user text inputs through the injection pattern check

**CODE QUALITY:**
7. Never hardcode colors — always `var(--accent)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)`
8. All `.map()` calls require `(array || []).map(...)` — never assume arrays are defined
9. All nested property access uses optional chaining: `obj?.prop?.nested`
10. All async operations need try/catch with user-friendly error toast messages
11. `isMobile` = `window.innerWidth < 768` — define inside each component, not as prop
12. All new views get `ChunkErrorBoundary` wrapper

**AI QUALITY:**
13. QuestionVarietyEngine MUST be used in every generation call — not optional
14. Every generation prompt includes the medical educational disclaimer
15. Streaming always uses chunk buffer — never pipes raw chunks to React setState

**COMPONENTS:**
16. Every new page with AI features must include `DraggableTutorPanel`
17. `MEDICINE_DB`, `DISEASE_DB`, all large data constants — MODULE LEVEL (before components)
18. All drag interactions support both mouse AND touch events
19. New modals use `createPortal` for proper z-index stacking

**COMMITS:**
20. Git add -A after every completed major feature
21. Commit message format: `feat: Add [FeatureName] — [brief description]`
22. Test on iPhone Safari before EVERY commit (most crashes happen there)
23. Never commit with console.log statements in production paths
24. Push to origin main after every commit

---

*This is Version 3.0 of the MARIAM PRO Master Strategy.*
*It supersedes all previous versions.*
*Total scope: 14 sections, 130+ actionable tasks, 24-month roadmap.*
*The question for every decision: "Does this move us toward 100,000 users and $200K MRR?"*


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PART F — MASTER EXECUTION ORDER
## Execute ALL parts in sequence. DO NOT stop between them.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Execute in this exact order — no skipping, no stopping early:

**WEEK 1 — Foundation & Critical Bugs (Part B)**
- [ ] Fix QuestionVarietyEngine wired into runBgGeneration (3 lines of code — do this FIRST)
- [ ] Fix streaming chunk buffer fragmentation
- [ ] Fix Safari/iOS IndexedDB (QuotaExceededError + SecurityError)
- [ ] Add medical disclaimer component to all AI-generated content
- [ ] Add legal ToS acceptance modal (mandatory, 6 checkboxes)
- [ ] Add GDPR cookie consent banner
- [ ] Add PHI detection warning for uploaded files
- [ ] Implement safe area CSS token system
- [ ] Implement z-index layer system
- [ ] Fix GlobalTaskIndicator z-index (must be below bottom nav)
- [ ] Fix all double-scroll traps (add min-h-0 to all nested flex containers)
- [ ] Implement fluid clamp() typography with --font-scale variable
- [ ] PDF canvas memory leak fix (AbortController pattern)

**WEEK 2 — Voice, AI & Core Architecture (Part B continued)**
- [ ] Build full ProsodyEngine with sentence-level prosody control
- [ ] Build FullDuplexVoiceManager (instant interruption on speech start)
- [ ] Rewrite VoiceTutorModal to full-screen immersive experience
- [ ] Upgrade StudyPodcastPanel with multi-voice dialogue + chapter markers
- [ ] Build QuestionVarietyEngine complete (27 pharmacology dimensions)
- [ ] Build buildGenerationSystemPrompt with variety directives
- [ ] Implement Workbox Service Worker (CacheFirst / NetworkFirst / StaleWhileRevalidate)
- [ ] Upgrade PWA manifest (screenshots, shortcuts, window-controls-overlay)
- [ ] Custom "Install App" prompt card (beautiful, not browser default)

**WEEK 3 — Study Tools Polish (Part B continued)**
- [ ] 3D CSS physics flashcard engine (preserve-3d, dynamic shadow based on flip angle)
- [ ] Full FSRS-5 algorithm (replace SM-2 entirely)
- [ ] MatchGame upgrade (staggered animations, shake on wrong, speed timer, personal best)
- [ ] Desktop split-pane exam view with resizable divider
- [ ] Mobile bottom-sheet lab drawer (draggable, snap points)

**WEEK 4 — Disease Explorer + DraggableTutorPanel (Part C)**
- [ ] Upgrade useDrag to support touch events
- [ ] Build DraggableTutorPanel (docked + floating + resize + dock/float toggle)
- [ ] Build DISEASE_DB (120+ diseases with full clinical data)
- [ ] Build DiseaseExplorerView (search, filter, 6 tabs, DDx cross-navigation)
- [ ] Wire DiseaseExplorerView to view === 'diseases'
- [ ] Add DraggableTutorPanel to ALL 65+ medical tools

**WEEK 5 — Medicines Page + Search (Part D)**
- [ ] Build MEDICINE_DB (200+ medicines with full prescribing data)
- [ ] Build MedicinesView (search, filter by category/schedule, 6 tabs, related drugs)
- [ ] Wire MedicinesView to view === 'medicines'
- [ ] Upgrade GlobalSearch to search Diseases + Medicines + Chats
- [ ] Expand GlobalSearch quick-navigate grid to 8 sections
- [ ] Add color-coded type badges to search results
- [ ] Sort search results (exact matches first)

**WEEK 6 — Revenue + Gamification (Part E)**
- [ ] Set up Supabase (user authentication)
- [ ] Set up Stripe (Pro $9.99/month + $84/year, Pro+ $19.99/month + $168/year)
- [ ] Build backend API proxy on Cloudflare Workers (remove API keys from browser)
- [ ] Implement rate limiting per plan
- [ ] Build XP + Levels system (9 levels from Pre-Med to Professor)
- [ ] Build Achievements + Badges (40 badges minimum)
- [ ] Build Global Leaderboard (weekly reset, friends, school, country)
- [ ] Implement upgrade trigger moments (quota hit, count exceeded, difficulty gate, streak milestone)
- [ ] Implement Adaptive Intelligence Layer (personalize generation to weak areas)
- [ ] Build variable reward system (insights after every 10 cards)
- [ ] Implement loss aversion notifications (push + in-app)

**WEEK 7 — Deck Sharing + Boards + Notifications**
- [ ] Build deck sharing (public link + classmate invite + permissions)
- [ ] Build boards countdown mode (exam date → AI daily plan)
- [ ] Build real push notifications (service worker + backend)
- [ ] All 6 notification types (cards due, streak at risk, exam reminder, task due, weekly report, daily goal)
- [ ] Weekly AI insights email (Resend API)
- [ ] Social proof embedded in UI

**WEEK 8 — Chat Superpowers + Accessibility + Final Polish (Part B)**
- [ ] Chat UI redesign (reactions, streaming cursor, syntax-highlighted code blocks)
- [ ] Chat superpowers (highlight-to-ask, quiz-me, table generator, find contradictions)
- [ ] Conversation memory (store summaries in IndexedDB)
- [ ] Accessibility audit (aria-labels, focus management, WCAG AA contrast)
- [ ] Keyboard navigation for all features
- [ ] prefers-reduced-motion fallbacks
- [ ] Performance audit (React.lazy, useMemo, heap profiling)
- [ ] Lighthouse audit → 100/100 PWA score

### FINAL GIT COMMIT (after all 8 weeks complete):
```bash
git add -A
git commit -m "feat: MARIAM PRO v8.0 SUPREME — Complete platform upgrade

Architecture: Modular directory, Zustand state, React.lazy, Workbox PWA
Security: Backend proxy, encrypted keys, prompt injection protection, ToS modal
Legal: Mandatory disclaimer, GDPR compliance, PHI detection, data retention
AI: FSRS-5, QuestionVarietyEngine wired, adaptive intelligence, streaming fixed
Voice: ProsodyEngine, FullDuplex, VoiceTutor full-screen, multi-voice podcast
Flashcards: 3D physics, Tinder swipe, FSRS-5, MatchGame timer + personal best
Exams: Split-pane desktop, mobile bottom-sheet lab drawer
Disease Explorer: 120+ diseases, 6 tabs, DDx cross-navigation, DraggableTutor
Medicines: 200+ drugs, full prescribing info, 6 tabs, DraggableTutor
Search: GlobalSearch upgraded — searches everything (8 categories)
DraggableTutor: Universal panel added to all 65+ tools, touch-enabled
Revenue: Stripe integration, \$9.99/\$19.99 plans, rate limiting
Gamification: XP + Levels + Leaderboard + 40 Achievements + Badges
Notifications: Real push notifications, 6 notification types, weekly email
Mobile: Safe areas, z-index system, fluid typography, iOS Safari fixes
Accessibility: WCAG AA, keyboard nav, focus management, reduced-motion"
git push origin main
```

---

*MARIAM PRO Complete Master Prompt v4.0 ULTIMATE*
*Merged from 4 documents: Enterprise Master v8.0 + Disease/Tutor + Medicines/Search + Global Strategy v3.0*
*Total: ~4,400 lines of directives, code, and strategy*
*The question for every decision: "Does this move us toward 100,000 users and $200K MRR?"*