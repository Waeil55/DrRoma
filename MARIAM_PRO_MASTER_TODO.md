# MARIAM PRO — ENTERPRISE MASTER TO-DO LIST
### Parsed from: Enterprise Master Directive v8.0 SUPREME
### Zero omissions • Every sentence accounted for • Markdown checkboxes for full tracking

---

## PHASE 1 — ARCHITECTURE: BREAKING THE MONOLITH

### 1.1 Directory Structure — Create All Files

#### `/src/app/`
- [x] Create `/src/app/App.jsx` — root shell only (~80 lines, no business logic, no prop drilling)
- [x] Create `/src/app/AppErrorBoundary.jsx`
- [x] Create `/src/app/AppProviders.jsx` — all context providers nested here
- [x] Verify every new file is a single-responsibility module
- [x] Verify zero circular dependencies across all modules

#### `/src/store/`
- [x] Create `/src/store/useAppStore.js` — Zustand global store (replaces ALL prop drilling)
- [x] Create `/src/store/useSettingsStore.js`
- [x] Create `/src/store/useStudyStore.js`
- [x] Create `/src/store/useTaskStore.js`
- [x] Create `/src/store/useNotificationStore.js`

#### `/src/services/ai/`
- [x] Create `/src/services/ai/callAI.js` — provider-agnostic AI router
- [x] Create `/src/services/ai/callAIStreaming.js` — streaming with chunk-safe buffer
- [x] Create `/src/services/ai/callAIWithVision.js`
- [x] Create `/src/services/ai/generationPrompts.js` — ALL AI system prompts (NEVER inline anywhere in codebase)
- [x] Create `/src/services/ai/questionVariety.js` — anti-repetition engine

#### `/src/services/db/`
- [x] Create `/src/services/db/openDB.js`
- [x] Create `/src/services/db/dbOp.js`
- [x] Create `/src/services/db/fileOps.js`
- [x] Create `/src/services/db/stateOps.js`
- [x] Create `/src/services/db/migrations.js` — ALL IndexedDB migration logic isolated here

#### `/src/services/voice/`
- [x] Create `/src/services/voice/speechSynthesis.js` — full prosody engine (see Phase 4)
- [x] Create `/src/services/voice/speechRecognition.js` — full-duplex recognition wrapper
- [x] Create `/src/services/voice/voiceQueue.js` — queue manager for utterances

#### `/src/services/notifications/`
- [x] Create `/src/services/notifications/notificationService.js` — Web Notifications + Push API
- [x] Create `/src/services/notifications/scheduleEngine.js` — FSRS-driven review scheduling

#### `/src/services/analytics/`
- [x] Create `/src/services/analytics/studyAnalytics.js`
- [x] Create `/src/services/analytics/fsrsEngine.js` — Full FSRS-5 algorithm (not SM-2)

#### `/src/components/layout/`
- [x] Create `/src/components/layout/AppShell.jsx` — fixed header, body, safe-area management
- [x] Create `/src/components/layout/BottomNav.jsx` — mobile pill nav
- [x] Create `/src/components/layout/SidebarNav.jsx` — desktop sidebar
- [x] Create `/src/components/layout/GlobalTaskIndicator.jsx` — fixed z-index, never overlaps nav

#### `/src/components/ui/`
- [x] Create `/src/components/ui/Button.jsx`
- [x] Create `/src/components/ui/Card.jsx`
- [x] Create `/src/components/ui/Modal.jsx`
- [x] Create `/src/components/ui/BottomSheet.jsx` — mobile drag-to-dismiss sheet
- [x] Create `/src/components/ui/Toast.jsx`
- [x] Create `/src/components/ui/Spinner.jsx`
- [x] Create `/src/components/ui/Badge.jsx`
- [x] Create `/src/components/ui/ProgressRing.jsx` — circular SVG progress with mastery %
- [x] Create `/src/components/ui/SplitPane.jsx` — resizable desktop split pane
- [x] Create `/src/components/ui/Typography.jsx` — all font tokens + responsive scale

#### `/src/components/chat/`
- [x] Create `/src/components/chat/ChatPanel.jsx`
- [x] Create `/src/components/chat/ChatMessage.jsx`
- [x] Create `/src/components/chat/ChatInput.jsx`
- [x] Create `/src/components/chat/QuickPrompts.jsx`

#### `/src/components/flashcards/`
- [x] Create `/src/components/flashcards/FlashcardsView.jsx`
- [x] Create `/src/components/flashcards/FlashcardCard.jsx` — 3D CSS physics card
- [x] Create `/src/components/flashcards/SwipeGestureHandler.jsx` — Tinder-swipe engine
- [x] Create `/src/components/flashcards/FSRSReview.jsx`
- [x] Create `/src/components/flashcards/MatchGame.jsx`
- [x] Create `/src/components/flashcards/MasteryHeatmap.jsx`
- [x] Create `/src/components/flashcards/ProgressRing.jsx`

#### `/src/components/exams/`
- [x] Create `/src/components/exams/ExamsView.jsx`
- [x] Create `/src/components/exams/ExamPlayer.jsx`
- [x] Create `/src/components/exams/SplitPaneExam.jsx`
- [x] Create `/src/components/exams/LabResultsDrawer.jsx` — draggable bottom sheet for mobile

#### `/src/components/cases/`
- [x] Create `/src/components/cases/CasesView.jsx`
- [x] Create `/src/components/cases/CasePlayer.jsx`

#### `/src/components/voice/`
- [x] Create `/src/components/voice/VoiceTutorModal.jsx`
- [x] Create `/src/components/voice/StudyPodcastPanel.jsx`

#### `/src/components/tasks/`
- [x] Create `/src/components/tasks/TasksView.jsx`
- [x] Create `/src/components/tasks/CalendarView.jsx`
- [x] Create `/src/components/tasks/TaskCard.jsx`
- [x] Create `/src/components/tasks/GoalTracker.jsx`

#### `/src/components/reader/`
- [x] Create `/src/components/reader/DocWorkspace.jsx`
- [x] Create `/src/components/reader/PdfRenderer.jsx`
- [x] Create `/src/components/reader/DocChatOverlay.jsx`

#### `/src/components/dashboard/`
- [x] Create `/src/components/dashboard/DashboardView.jsx`
- [x] Create `/src/components/dashboard/StudyStreakCard.jsx`
- [x] Create `/src/components/dashboard/HeatmapCalendar.jsx`

#### `/src/hooks/`
- [x] Create `/src/hooks/useDB.js`
- [x] Create `/src/hooks/useVoice.js`
- [x] Create `/src/hooks/useSwipe.js`
- [x] Create `/src/hooks/useDrag.js`
- [x] Create `/src/hooks/useNotifications.js`
- [x] Create `/src/hooks/useKeyboard.js`
- [x] Create `/src/hooks/useMediaQuery.js`
- [x] Create `/src/hooks/useFSRS.js`
- [x] Create `/src/hooks/useTypography.js`

#### `/src/utils/`
- [x] Create `/src/utils/markdown.js`
- [x] Create `/src/utils/formatters.js`
- [x] Create `/src/utils/fileCategory.js`
- [x] Create `/src/utils/safeArea.js`
- [x] Create `/src/utils/exportToPDF.js`
- [x] Create `/src/utils/chunkText.js`

#### `/src/styles/`
- [x] Create `/src/styles/tokens.css` — ALL CSS variables (colors, spacing, type)
- [x] Create `/src/styles/typography.css` — fluid type scale
- [x] Create `/src/styles/animations.css`
- [x] Create `/src/styles/components.css`
- [x] Create `/src/styles/safeAreas.css`

---

### 1.2 State Management — Eliminate All Prop Drilling

- [ ] Audit codebase for all props passed through 3+ component levels
- [ ] Fix `setFlashcards` prop drilling: `App → FlashcardsView → FSRSReview → MatchGame` (4 levels)
- [ ] Fix `settings` prop drilling: currently passed to Chat, Exams, Cases, Flashcards, Voice, Podcast
- [ ] Fix `addToast` prop drilling: currently passed to 12+ components
- [ ] Fix `docs` prop drilling: currently threaded through 5 component layers
- [ ] Implement `useAppStore` (Zustand) exposing globally:
  - [ ] `flashcards` state slice
  - [ ] `exams` state slice
  - [ ] `cases` state slice
  - [ ] `settings` state slice
  - [ ] `docs` state slice
  - [ ] `addToast` action
  - [ ] `tasks` state slice
  - [ ] `notifications` state slice
- [ ] Update every component to call `useAppStore(state => state.X)` — zero props
- [ ] Verify `App.jsx` root passes no data props to any child after migration

---

### 1.3 Code Splitting & Lazy Loading

- [ ] Add `React.lazy()` to `FlashcardsView`
- [ ] Add `React.lazy()` to `ExamsView`
- [ ] Add `React.lazy()` to `CasesView`
- [ ] Add `React.lazy()` to `ChatPanel`
- [ ] Add `React.lazy()` to `TasksView`
- [ ] Add `React.lazy()` to `CalendarView`
- [ ] Add `React.lazy()` to `VoiceTutorModal`
- [ ] Add `React.lazy()` to `StudyPodcastPanel`
- [ ] Wrap each lazy view in `<Suspense fallback={<SkeletonLoader />}>`
- [x] Create skeleton loader for `FlashcardsView` (shape matches actual view — not a generic spinner)
- [x] Create skeleton loader for `ExamsView` (shape matches actual view)
- [x] Create skeleton loader for `CasesView` (shape matches actual view)
- [x] Create skeleton loader for `ChatPanel` (shape matches actual view)
- [x] Create skeleton loader for `TasksView` (shape matches actual view)
- [x] Create skeleton loader for `CalendarView` (shape matches actual view)
- [x] Create skeleton loader for `VoiceTutorModal` (shape matches actual view)
- [x] Create skeleton loader for `StudyPodcastPanel` (shape matches actual view)
- [ ] Wrap PDF.js CDN load in `AbortController` pattern with cancellation
- [ ] Wrap Mammoth CDN load in `AbortController` pattern with cancellation
- [ ] Wrap XLSX CDN load in `AbortController` pattern with cancellation
- [ ] Wrap jsPDF CDN load in `AbortController` pattern with cancellation

---

### 1.4 PWA — True Native Installability

#### Manifest Upgrade
- [x] Set `display: "standalone"` in `manifest.json`
- [x] Add `display_override: ["window-controls-overlay"]` to manifest
- [x] Add `screenshots` array to manifest (app-store-style listing appearance)
- [x] Add `shortcuts` entry for quick-launch to Flashcards
- [x] Add `shortcuts` entry for quick-launch to Exam
- [x] Add `shortcuts` entry for quick-launch to Chat

#### Service Worker — Workbox
- [ ] Set up Workbox service worker
- [ ] Implement `CacheFirst` strategy for all CDN scripts (PDF.js, Mammoth, XLSX)
- [ ] Implement `NetworkFirst` strategy for all AI API calls (never cache)
- [ ] Implement `StaleWhileRevalidate` strategy for all static assets
- [ ] Implement background sync queue for any failed IndexedDB writes

#### iOS Home Screen
- [ ] Add `<meta name="apple-mobile-web-app-capable" content="yes">` meta tag
- [ ] Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` meta tag
- [ ] Create full splash screen set for every iPhone size:
  - [ ] iPhone SE (1st/2nd/3rd gen)
  - [ ] iPhone 14 / 14 Plus
  - [ ] iPhone 14 Pro / 14 Pro Max
  - [ ] iPhone 15 / 15 Plus
  - [ ] iPhone 15 Pro / 15 Pro Max

#### Android / Install Prompt
- [ ] Verify app passes all PWA install criteria scoring 100/100 on Lighthouse
- [ ] Persist `beforeinstallprompt` event in a variable immediately on capture
- [ ] Design custom "Install MARIAM PRO" prompt card (not the browser default UI)
- [ ] Wire install CTA button to replay the persisted `beforeinstallprompt` event
- [ ] In `standalone` mode: verify zero browser chrome visible
- [ ] In `standalone` mode: verify bottom navigation appears where browser bar was
- [ ] In `standalone` mode: verify top safe-area is always visually filled

---

## PHASE 2 — MOBILE UI/UX: ZERO MESSINESS

### 2.1 Safe Area System — Mathematical Precision

- [x] Create `/src/styles/safeAreas.css`
- [x] Define `--sat: env(safe-area-inset-top, 44px)` on `:root`
- [x] Define `--sab: env(safe-area-inset-bottom, 34px)` on `:root`
- [x] Define `--sal: env(safe-area-inset-left, 0px)` on `:root`
- [x] Define `--sar: env(safe-area-inset-right, 0px)` on `:root`
- [x] Define derived token `--header-h: 56px` on `:root`
- [x] Define derived token `--bottom-nav-h: 72px` on `:root`
- [x] Define derived token `--content-top: calc(var(--sat) + var(--header-h))` on `:root`
- [x] Define derived token `--content-bottom: calc(var(--sab) + var(--bottom-nav-h))` on `:root`
- [x] Define derived token `--content-bottom-clear: calc(var(--sab) + var(--bottom-nav-h) + 16px)` on `:root`
- [x] Apply `padding-bottom: var(--content-bottom-clear)` to every scrollable view:
  - [x] DocWorkspace scroll container
  - [x] ChatPanel messages container
  - [x] FlashcardsView scroll container
  - [x] ExamsView scroll container
  - [x] CasesView scroll container
  - [x] TasksView scroll container
  - [x] CalendarView scroll container
  - [x] DashboardView scroll container

---

### 2.2 Z-Index Layer System — Strictly Enforced

- [x] Define all z-index tokens in `tokens.css` — NEVER deviate from these anywhere in code:
  - [x] `--z-base: 1`
  - [x] `--z-card: 10`
  - [x] `--z-sticky: 20`
  - [x] `--z-dropdown: 50`
  - [x] `--z-modal-backdrop: 100`
  - [x] `--z-modal: 110`
  - [x] `--z-bottom-sheet: 120`
  - [x] `--z-ai-tutor: 130`
  - [x] `--z-global-task: 140`
  - [x] `--z-toast: 150`
  - [x] `--z-bottom-nav: 160`
  - [x] `--z-top-glass: 170`
  - [x] `--z-header: 180`
- [x] **Critical fix:** Set `GlobalTaskIndicator` bottom to `calc(var(--bottom-nav-h) + var(--sab) + 12px)` always
- [x] **Critical fix:** Set `GlobalTaskIndicator` z-index to `var(--z-global-task)` (140 — BELOW bottom nav at 160)
- [x] **Critical fix:** Elevate `AiTutorPanel` mobile from `z-[49]` to `var(--z-ai-tutor)` (130)
- [x] **Critical fix:** Ensure `AiTutorPanel` never clips behind bottom nav on any screen size
- [x] **Critical fix:** Set Toast z-index to `var(--z-toast)` (150) — always above modals including sheets
- [x] **Critical fix:** Convert AI Tutor toggle button in DocWorkspace to a Floating Action Button
  - [x] Position FAB at `bottom: var(--content-bottom-clear); right: 16px`
- [x] Audit every hardcoded `z-index:` value in entire codebase and replace with tokens

---

### 2.3 Fluid Typography System

- [x] Create `/src/styles/typography.css`
- [x] Define `--font-scale: 1` CSS variable on `:root` (valid range: 0.8 to 1.3)
- [x] Define `--text-xs:   clamp(10px, calc(11px * var(--font-scale)), 13px)` on `:root`
- [x] Define `--text-sm:   clamp(12px, calc(13px * var(--font-scale)), 15px)` on `:root`
- [x] Define `--text-base: clamp(13px, calc(15px * var(--font-scale)), 17px)` on `:root`
- [x] Define `--text-md:   clamp(15px, calc(17px * var(--font-scale)), 20px)` on `:root`
- [x] Define `--text-lg:   clamp(17px, calc(20px * var(--font-scale)), 24px)` on `:root`
- [x] Define `--text-xl:   clamp(20px, calc(24px * var(--font-scale)), 30px)` on `:root`
- [x] Define `--text-2xl:  clamp(24px, calc(30px * var(--font-scale)), 38px)` on `:root`
- [x] Define `--text-3xl:  clamp(28px, calc(36px * var(--font-scale)), 46px)` on `:root`
- [x] Set weight enforcement rules in `typography.css`:
  - [x] `body { font-weight: 400; }`
  - [x] `p, span, li { font-weight: 400; }`
  - [x] `.label, .caption { font-weight: 500; }` (--font-medium)
  - [x] `h3, .subheading { font-weight: 600; }`
  - [x] `h2, .section-title { font-weight: 700; }`
  - [x] `h1, .page-title { font-weight: 800; }` (MAXIMUM weight for headings)
  - [x] `.hero-title { font-weight: 900; }` (--font-black: ONLY for hero-level, NOWHERE else)

#### Font Control UI (Settings page)
- [x] Add "Text Size" slider to Settings page
- [x] Show 5 preset labels as: `[A · A · A · A · A]` = 80%, 90%, 100%, 115%, 130%
- [x] Slider onChange: write `--font-scale: X` to `:root` inline style immediately
- [x] Persist chosen `font-scale` value in IndexedDB settings
- [x] Add `transition: font-size 0.2s ease` on `html` element for smooth rescaling

#### Font Weight Audit
- [x] Audit all JSX: remove `font-black` class from body copy
- [x] Audit all JSX: remove `font-black` class from badges
- [x] Audit all JSX: remove `font-black` class from list items
- [x] Audit all JSX: remove `font-black` class from descriptions
- [x] Audit all JSX: remove `font-black` from any text that is NOT a top-level page heading
- [x] Audit all JSX: remove all hardcoded `text-[10px]` Tailwind sizes (too small)
- [x] Audit all JSX: remove all hardcoded `text-[9px]` Tailwind sizes (too small)
- [x] Replace all removed tiny sizes with `var(--text-xs)` as minimum
- [x] Audit and remove all inconsistent mixing of `font-black` / `font-bold` / `font-extrabold` with no semantic logic

---

### 2.4 Scroll Containment — Fix All Double-Scroll Traps

**Rule: Every nested flex container that needs to scroll MUST have `minHeight: 0`.**

- [ ] Audit `DocWorkspace` for all nested `overflow-y-auto` / `flex-1` containers
- [ ] Fix `DocWorkspace`: replace incorrect pattern with `{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }` + `{ flex: 1, minHeight: 0, overflowY: 'auto' }`
- [ ] Audit `ChatPanel` for nested scroll containers
- [ ] Fix `ChatPanel`: apply `minHeight: 0` to all flex children in the messages area
- [ ] Audit `FlashcardsView` for nested scroll containers
- [ ] Fix `FlashcardsView`: apply `minHeight: 0` to all flex children
- [ ] Audit `ExamsView` for nested scroll containers
- [ ] Fix `ExamsView`: apply `minHeight: 0` to all flex children
- [ ] Audit `CasesView` for nested scroll containers
- [ ] Fix `CasesView`: apply `minHeight: 0` to all flex children
- [ ] Audit `AiTutorPanel` for nested scroll containers
- [ ] Fix `AiTutorPanel`: apply `minHeight: 0` to all flex children
- [ ] Audit `VoiceTutorModal` for nested scroll containers
- [ ] Fix `VoiceTutorModal`: apply `minHeight: 0` to all flex children
- [ ] Audit `StudyPodcastPanel` for nested scroll containers
- [ ] Fix `StudyPodcastPanel`: apply `minHeight: 0` to all flex children
- [ ] Verify zero double-scrollbar scenarios remain in any view

---

### 2.5 Mobile Layout Completeness Checklist

Apply ALL checks to EACH view (DocWorkspace, ChatPanel, FlashcardsView, ExamsView, CasesView, VoiceTutorModal, StudyPodcastPanel, TasksView, CalendarView, DashboardView):

- [ ] No element clipped behind the notch, Dynamic Island, or status bar — all views
- [ ] No element clipped behind the home indicator or bottom nav — all views
- [ ] No element overlaps another at 320px wide (iPhone SE)
- [ ] No element overlaps another at 430px wide (iPhone 15 Pro Max)
- [ ] All touch targets are minimum 44×44pt (iOS HIG standard)
- [ ] Scrollable areas show zero double scrollbars
- [ ] Modal/sheet backdrops cover 100% of viewport including safe areas
- [ ] AI Tutor panel (mobile slide-in) does not bleed behind the bottom nav
- [ ] All `position: fixed` elements account for `env(safe-area-inset-*)` values
- [ ] All floating action buttons are always positioned above `--content-bottom-clear`

---

## PHASE 3 — ADVANCED AI GENERATION: HYPER-CONTEXTUAL, NON-REPETITIVE, HARD-MODE

### 3.1 The Anti-Repetition Engine (`questionVariety.js`)

- [x] Create `/src/services/ai/questionVariety.js`
- [x] Define `QUESTION_DIMENSIONS` constant object containing all 5 domain arrays:
  - [x] **`pharmacology`** array (27 dimensions):
    - [x] `brand_name`, `generic_name`, `drug_class`, `mechanism_of_action`
    - [x] `primary_indication`, `secondary_indications`, `dosing_form`
    - [x] `route_of_administration`, `onset_of_action`, `duration_of_action`
    - [x] `common_side_effects`, `serious_adverse_effects`, `black_box_warning`
    - [x] `contraindications`, `drug_interactions`, `pregnancy_category`
    - [x] `monitoring_parameters`, `patient_counseling`, `reversal_agent`
    - [x] `comparison_to_similar_drugs`, `clinical_vignette_application`
    - [x] `pharmacokinetics_absorption`, `pharmacokinetics_distribution`
    - [x] `pharmacokinetics_metabolism`, `pharmacokinetics_excretion`
    - [x] `overdose_presentation`, `overdose_management`
  - [x] **`clinical`** array (20 dimensions):
    - [x] `diagnosis`, `pathophysiology`, `risk_factors`, `epidemiology`
    - [x] `presenting_symptoms`, `physical_exam_findings`, `diagnostic_workup`
    - [x] `gold_standard_test`, `imaging_of_choice`, `lab_interpretation`
    - [x] `first_line_treatment`, `second_line_treatment`, `surgical_indications`
    - [x] `complications`, `prognosis`, `prevention`, `screening_guidelines`
    - [x] `differential_diagnosis`, `clinical_vignette`, `next_best_step`
  - [x] **`counseling`** array (15 dimensions):
    - [x] `theory_author`, `core_concept`, `technique_name`, `technique_application`
    - [x] `diagnosis_criteria`, `dsm5_criteria`, `treatment_approach`
    - [x] `evidence_base`, `contraindications`, `ethical_consideration`
    - [x] `cultural_consideration`, `case_vignette`, `compare_theories`
    - [x] `therapeutic_relationship`, `termination_criteria`
  - [x] **`law`** array (10 dimensions):
    - [x] `statute_name`, `key_provision`, `exception`, `penalty`
    - [x] `application_scenario`, `comparison_statute`, `landmark_case`
    - [x] `jurisdictional_variation`, `ethical_obligation`, `reporting_duty`
  - [x] **`general`** array (12 dimensions):
    - [x] `definition`, `example`, `application`, `comparison`, `cause_and_effect`
    - [x] `historical_context`, `current_relevance`, `critical_analysis`
    - [x] `synthesis`, `evaluation`, `multi_step_reasoning`, `case_study`
- [x] Define `COGNITIVE_LEVELS` constant object with 4 tiers:
  - [x] `easy`: `['definition', 'recall', 'identification', 'listing']`
  - [x] `medium`: `['comparison', 'application', 'explanation', 'classification']`
  - [x] `hard`: `['clinical_vignette', 'multi_step_reasoning', 'synthesis', 'evaluation', 'next_best_step']`
  - [x] `insane`: `['usmle_step3_vignette', 'multi_patient_management', 'ethics_conflict', 'complex_case_chain']`
- [x] Implement `QuestionVarietyEngine` class (exported):
  - [x] `constructor()`: initialize `this.history = []` and `this.entityHistory = []`
  - [x] `getNextPromptDirective(totalAsked, difficulty, domainHint)` method:
    - [x] Get correct dimensions array (fallback to `general` if domainHint unknown)
    - [x] Get correct cognitive levels array (fallback to `medium`)
    - [x] Build `dimCounts` object: count how many times each dimension appears in `this.history`
    - [x] Sort dimensions by count ascending — always pick the least-used as `targetDimension`
    - [x] Get last 3 cognitive levels from `this.history`
    - [x] Filter available levels: exclude any used 2+ times in the last 3
    - [x] Select `targetLevel` randomly from remaining available levels
    - [x] Push `{ dimension: targetDimension, cognitiveLevel: targetLevel, index: totalAsked }` to `this.history`
    - [x] Return `{ dimension, cognitiveLevel, instruction }` where instruction includes:
      - [x] `"Question X MUST test: [targetDimension] at cognitive level [targetLevel]."`
      - [x] `"DO NOT ask about: [last 3 dimensions from history]."`
      - [x] `"Previous question types used: [JSON dimCounts]."`
      - [x] `"Force yourself to pick a COMPLETELY DIFFERENT angle."`

---

### 3.2 Context-Grounded Generation — File + Page Binding

- [x] Create `/src/services/ai/generationPrompts.js`
- [x] Move ALL existing inline AI system prompts from `App.jsx` to this file (zero inline prompts remaining)
- [x] Implement `buildGenerationSystemPrompt(type, difficulty, pageRange, docName, varietyDirective)` function:
  - [x] Header section — include:
    - [x] `DOCUMENT: "${docName}"`
    - [x] `PAGES SELECTED: ${pageRange.join(', ')}`
    - [x] `GENERATION TYPE: ${type}`
    - [x] `DIFFICULTY: ${difficulty}`
  - [x] **STRICT CONTENT RULES section** (violation = entire batch rejected):
    - [x] Rule 1: Every question, term, and answer MUST come DIRECTLY from the text provided
    - [x] Rule 1: AI must NOT use any knowledge outside the provided document text
    - [x] Rule 2: Specific drug/concept/law must be quoted or paraphrased from source — never from AI memory
    - [x] Rule 3: Page references must be included in each question's evidence field
  - [x] **ANTI-REPETITION DIRECTIVE section** (mandatory):
    - [x] Inject `varietyDirective.instruction` verbatim into the prompt
    - [x] State `COGNITIVE ANGLE REQUIRED: ${varietyDirective.cognitiveLevel}`
    - [x] State `DIMENSION TO TEST: ${varietyDirective.dimension}`
    - [x] Enforce pattern: if prev = brand name → this Q MUST test a different property
    - [x] Enforce pattern: if prev = RECALL → this Q MUST be APPLICATION or ANALYSIS
    - [x] Enforce pattern: if Q1/Q2/Q3 all tested brand names → Q4 MUST NOT be brand name
    - [x] Enforce rotation chain: Recall → Apply → Analyze → Synthesize → Evaluate → Create
  - [x] **DIFFICULTY SPECIFICATIONS section**:
    - [x] `EASY`: single-concept recall, ~2 sentences per question
    - [x] `MEDIUM`: application with 2–3 step reasoning, patient scenario preferred
    - [x] `HARD`: full USMLE Step 2 style — 4–6 sentence patient vignette, 5 answer choices (A–E), one clearly correct, one very attractive distractor, explanation for each choice
    - [x] `INSANE`: USMLE Step 3 / Board-style — complex multi-problem patient with labs, imaging findings, vitals, social history, 6-sentence vignette, management decisions, "NEXT BEST STEP" style, requires synthesis of 3+ concepts

---

### 3.3 Parallel Generation with Variety Coordination

- [ ] Update `runBgGeneration` function to pre-compute `varietyPlan[]` BEFORE launching any parallel requests
- [ ] Use `QuestionVarietyEngine` to generate N distinct `{dimension, cognitiveLevel}` pairs (one per batch item)
- [ ] Pass each parallel request its pre-assigned `varietyPlan[i]` directive
- [ ] Verify that even parallel requests cannot produce the same dimension/level angle

---

### 3.4 Streaming Chunk Buffer Fix

- [x] In `callAIStreaming.js`, implement safe streaming buffer:
  - [x] Declare `let buffer = ''` accumulator variable
  - [x] Declare `let isInsideCodeBlock = false` tracking flag
  - [x] Declare `let isInsideTable = false` tracking flag
  - [x] Implement `flushSafe(newText)` function:
    - [x] Append `newText` to `buffer`
    - [x] Count code fence markers ```` ``` ```` — odd count means block is open
    - [x] Set `isInsideCodeBlock = (count % 2 !== 0)`
    - [x] Find `lastNewline = buffer.lastIndexOf('\n')`
    - [x] If `isInsideCodeBlock` or `isInsideTable`: do NOT call `onChunk` — wait for closing marker
    - [x] Otherwise: extract `safeContent = buffer.slice(0, lastNewline + 1)`
    - [x] Call `onChunk(safeContent)` only if `safeContent` is non-empty
  - [x] Ensure `onChunk` is NEVER called with incomplete markdown structures

---

## PHASE 4 — HUMAN-LIKE VOICE: PRACTICA / LEARNA / PROMOVA KILLER

### 4.1 The Prosody Engine (`speechSynthesis.js`)

- [x] Create `/src/services/voice/speechSynthesis.js`
- [x] Define `VOICE_FILLERS` object with 4 arrays:
  - [x] `thinking`: `["Hmm, let me think about that...", "That's a great question...", "Let's see...", "Good point, so...", "Right, okay..."]`
  - [x] `confirming`: `["Exactly!", "That's correct!", "Perfect!", "You've got it!", "Well done!"]`
  - [x] `correcting`: `["Not quite — let me clarify...", "Almost, but here's the key difference...", "Let me walk you through that again..."]`
  - [x] `transitioning`: `["Now, moving on to...", "Building on that...", "Here's something interesting...", "Let's take this further..."]`
- [x] Define `PUNCTUATION_PROSODY` object mapping each punctuation to `{ pauseMs, pitchDelta, rateDelta }`:
  - [x] `.`  → `{ pauseMs: 350, pitchDelta: -0.08, rateDelta: -0.03 }` (drop pitch, pause)
  - [x] `!`  → `{ pauseMs: 250, pitchDelta: +0.05, rateDelta: +0.04 }` (lift pitch)
  - [x] `?`  → `{ pauseMs: 300, pitchDelta: +0.12, rateDelta: -0.02 }` (rise pitch)
  - [x] `,`  → `{ pauseMs: 150, pitchDelta:     0, rateDelta: -0.02 }` (tiny breath)
  - [x] `:`  → `{ pauseMs: 200, pitchDelta: -0.04, rateDelta: -0.03 }` (preparatory drop)
  - [x] `—`  → `{ pauseMs: 220, pitchDelta: -0.02, rateDelta: -0.04 }` (thoughtful pause)
  - [x] `...`→ `{ pauseMs: 500, pitchDelta: -0.06, rateDelta: -0.06 }` (long thoughtful pause)
- [x] Implement `ProsodyEngine` class:
  - [x] `constructor()`: initialize `synth = window.speechSynthesis`, `voice = null`, `baseRate = 0.92`, `basePitch = 1.02`, `baseVolume = 0.95`, `isSpeaking = false`, `queue = []`, `currentUtterance = null`, `onInterruptCallback = null`
  - [x] `loadBestVoice(languageCode = 'en')` async method:
    - [x] Handle voices not yet loaded — use `synth.onvoiceschanged` event
    - [x] Priority order to find best voice:
      1. [x] Voice name contains "Neural"
      2. [x] Voice name contains "Premium"
      3. [x] Voice name contains "Enhanced"
      4. [x] Voice name contains "Google" AND lang starts with `languageCode`
      5. [x] Voice name is "Samantha", "Karen", or "Moira" (Apple high-quality)
      6. [x] Any non-local-service voice for target language
      7. [x] Any voice for target language
      8. [x] Fallback: `voices[0]`
    - [x] Store found voice in `this.voice`; resolve with voice
  - [x] `speakWithProsody(text, options = {})` async method:
    - [x] Call `this.synth.cancel()` to stop any current speech
    - [x] Set `this.isSpeaking = true`
    - [x] If `text.length > 200` AND `Math.random() > 0.4`: select random filler from `VOICE_FILLERS.thinking`
    - [x] Call `_preprocessText(text)` to clean markdown
    - [x] Call `_splitIntoSentences(processedText)` to get sentence array
    - [x] If filler: speak it first at `rate: baseRate * 0.88, pitch: basePitch * 1.04`
    - [x] Loop through sentences; break loop if `this.isSpeaking` becomes false
    - [x] For each sentence: get last character → look up `PUNCTUATION_PROSODY`
    - [x] Apply `rate = baseRate + prosody.rateDelta + (Math.random() * 0.04 - 0.02)` (±2% variance)
    - [x] Apply `pitch = basePitch + prosody.pitchDelta`
    - [x] `await _speakSentence(sentence, { rate, pitch, volume: baseVolume })`
    - [x] After each sentence: `await _pause(prosody.pauseMs)` if `pauseMs` exists
    - [x] Set `this.isSpeaking = false` when all sentences complete
  - [x] `_speakSentence(text, { rate, pitch, volume })` method returning Promise:
    - [x] Create `new SpeechSynthesisUtterance(text)`
    - [x] Set `u.voice = this.voice` if available
    - [x] Set `u.rate = Math.max(0.5, Math.min(1.8, rate))`
    - [x] Set `u.pitch = Math.max(0.5, Math.min(2.0, pitch))`
    - [x] Set `u.volume = Math.max(0, Math.min(1, volume))`
    - [x] Bind `u.onend = resolve` and `u.onerror = resolve` (don't block on error)
    - [x] Store as `this.currentUtterance = u`
    - [x] Call `this.synth.speak(u)`
  - [x] `_pause(ms)` method: return `new Promise(resolve => setTimeout(resolve, ms))`
  - [x] `interrupt()` method (called MILLISECOND user starts speaking):
    - [x] Set `this.isSpeaking = false`
    - [x] Call `this.synth.cancel()`
    - [x] Set `this.currentUtterance = null`
    - [x] Call `this.onInterruptCallback()` if set
  - [x] `_preprocessText(text)` method:
    - [x] Remove markdown bold: `**text**` → `text`
    - [x] Remove markdown italic: `*text*` → `text`
    - [x] Remove inline code: `` `code` `` → `code`
    - [x] Remove headers: `## ` → empty string
    - [x] Strip links: `[text](url)` → `text`
    - [x] Spell out 3+ letter uppercase acronyms slowly (split each letter with space)
  - [x] `_splitIntoSentences(text)` method: regex match `/[^.!?]+[.!?]+["']?|[^.!?]+$/g`
- [x] Export `ProsodyEngine` as singleton (single instance shared across entire app)

---

### 4.2 Full-Duplex Voice Interaction (`speechRecognition.js`)

**Critical requirement: The moment user starts speaking, ALL TTS must stop INSTANTLY.**

- [x] Create `/src/services/voice/speechRecognition.js`
- [x] Implement `FullDuplexVoiceManager` class:
  - [x] `constructor(prosodyEngine)`: store reference to engine; initialize `recognition = null`, `isListening = false`, `isSpeaking = false`, `onUserSpeech = null`, `onFinalTranscript = null`
  - [x] `startListening()` method:
    - [x] Check `window.SpeechRecognition || window.webkitSpeechRecognition`
    - [x] `throw new Error('Speech recognition not supported')` if neither exists
    - [x] Create recognition instance
    - [x] Set `recognition.continuous = true`
    - [x] Set `recognition.interimResults = true`
    - [x] Set `recognition.lang = 'en-US'`
    - [x] `recognition.onstart`: set `this.isListening = true`
    - [x] `recognition.onspeechstart`: if `this.prosody.isSpeaking` → call `this.prosody.interrupt()` INSTANTLY (target < 16ms); call `this.onUserSpeech()` if set
    - [x] `recognition.onresult`: collect transcript from all results; detect `isFinal`; call `this.onFinalTranscript(transcript)` on final result
    - [x] `recognition.onerror`: if `e.error !== 'aborted'` → call `this.startListening()` (auto-restart)
    - [x] `recognition.onend`: if `this.isListening` still true → call `this.recognition.start()` (keep alive)
    - [x] Call `recognition.start()`
  - [x] `stopListening()` method:
    - [x] Set `this.isListening = false`
    - [x] Call `this.recognition?.abort()`
    - [x] Set `this.recognition = null`

---

### 4.3 VoiceTutorModal — Complete Rewrite

- [x] Create `/src/components/voice/VoiceTutorModal.jsx`
- [x] **Visual design requirements:**
  - [x] Full-screen dark modal (covers 100% of viewport)
  - [x] Animated circular audio visualizer — CSS or Canvas only (no third-party visualization libraries)
  - [x] Real-time waveform pulsing using CSS `box-shadow` animation driven by utterance state
  - [x] Live transcript area at bottom: gray text for interim result, white text for final result
  - [x] Scrollable AI response message area in main body
  - [x] Natural "typing..." indicator while AI response is streaming
  - [x] Mariam avatar displayed centrally in the layout
  - [x] Animated "speaking" glow ring around avatar when AI is speaking
  - [x] Animated "listening" pulse ring around avatar when user is speaking
  - [x] Bottom toolbar with exactly 4 buttons:
    - [x] 🎙️ "Hold to Override" — allows user to force-interrupt
    - [x] 📝 "Type instead" — shows text input fallback
    - [x] ⚙️ "Voice settings" — opens voice settings panel
    - [x] ✕ "End" — closes modal and shows session summary
- [x] **Behavior requirements:**
  - [x] On open: AI greets naturally: `"Hey! Ready to study? What topic should we tackle first?"` using full `ProsodyEngine`
  - [x] Always-on recognition: Recognition stays active entire session — user NEVER needs to tap to speak
  - [x] Context injection: AI receives current document name + page
  - [x] Context injection: AI receives current flashcard deck name + mastery %
  - [x] Context injection: AI receives most recent exam score
  - [x] Filler injection: every 4th AI response begins with a natural filler from `VOICE_FILLERS`
  - [x] Error recovery: if recognition fails → gracefully display "Type your message instead" prompt
  - [x] On close: display session summary card with:
    - [x] "Topics covered" list
    - [x] "Key concepts reviewed" list
    - [x] "Suggested next steps" list

---

### 4.4 StudyPodcastPanel — Upgrade

- [x] Create `/src/components/voice/StudyPodcastPanel.jsx`
- [x] Implement **multi-voice dialogue mode**:
  - [x] AI generates a script with two characters: "Host" (Mariam) and "Student"
  - [x] Select two different TTS voices with distinctly different pitches for each character
  - [x] Alternate speaking between Host and Student voices throughout episode
- [x] Implement **chapter markers**:
  - [x] Auto-generate chapters from document headings (H1, H2)
  - [x] Display chapter list as a tappable timeline
  - [x] Tap chapter to jump playback to that chapter
- [x] Implement **speed controls**: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2× buttons
  - [x] Apply smooth transitions between speed changes (no audio glitch)
- [x] Implement **Media Session API integration** for background play:
  - [x] Register `play` action handler
  - [x] Register `pause` action handler
  - [x] Register `seekbackward` action handler
  - [x] Register `seekforward` action handler
  - [x] Show episode title and artwork on iOS lock screen notification
- [x] Implement **"Download episode"** button: serialize TTS-read text into a structured format for offline replay

---

## PHASE 5 — NEXT-GEN STUDY TOOLS: QUIZLET OBLITERATOR

### 5.1 Flashcard 3D Physics Engine

- [x] Create (or overhaul) `/src/components/flashcards/FlashcardCard.jsx`
- [x] Add `.flashcard-scene` CSS class with `perspective: 1200px; perspective-origin: 50% 40%`
- [x] Add `.flashcard-inner` CSS class with:
  - [x] `transform-style: preserve-3d`
  - [x] `transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1)`
  - [x] `will-change: transform`
- [x] Add `.flashcard-inner.flipped { transform: rotateY(180deg); }`
- [x] Add `.flashcard-front` CSS with `position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 24px`
- [x] Add `.flashcard-back` CSS with same + `transform: rotateY(180deg)`
- [x] Implement **dynamic shadow** driven by `--flip-progress` CSS variable:
  - [x] `filter: drop-shadow(0 calc(var(--flip-progress, 0) * 40px + 8px) calc(var(--flip-progress, 0) * 60px + 16px) rgba(0,0,0,calc(var(--flip-progress, 0) * 0.35 + 0.12)))`
- [x] Implement JavaScript **RAF physics driver** in `handleFlip()`:
  - [x] Start `progress = 0`; increment by `0.04` each `requestAnimationFrame`
  - [x] First half (`progress < 0.5`): ease-in-cubic `4 * p * p * p`
  - [x] Second half: ease-out-cubic `1 - Math.pow(-2 * p + 2, 3) / 2`
  - [x] Drive `--flip-progress` via `cardRef.current.style.setProperty('--flip-progress', String(ease))`
  - [x] Stop RAF when `progress >= 1`
  - [x] Toggle `flipped` state

---

### 5.2 Tinder-Swipe Gesture Engine

- [x] Create `/src/hooks/useSwipe.js`:
  - [x] Accept `{ onSwipeLeft, onSwipeRight, onSwipeUp, threshold = 80 }` as parameter
  - [x] Create `ref` for the element
  - [x] `useRef`: `startX`, `startY`, `isDragging`, `currentX`
  - [x] `touchstart` handler (`{ passive: true }`): record `startX`, `startY`; set `isDragging = true`
  - [x] `touchmove` handler (`{ passive: false }`):
    - [x] Compute `currentX` delta
    - [x] Compute `currentY` delta
    - [x] Only intercept if `|deltaX| > |deltaY|` (horizontal dominance)
    - [x] Call `e.preventDefault()`
    - [x] Apply real-time transform: `translateX(deltaX) translateY(-|deltaX|*0.04) rotate(deltaX*0.08deg)`
    - [x] Set `el.style.transition = 'none'`
    - [x] Compute `intensity = Math.min(1, |deltaX| / threshold)`
    - [x] Apply green `box-shadow` glow when `deltaX > 0` (Easy — right swipe)
    - [x] Apply red `box-shadow` glow when `deltaX < 0` (Hard — left swipe)
  - [x] `touchend` handler:
    - [x] If `delta > threshold`: animate card to `translateX(150vw) rotate(30deg)` → call `onSwipeRight()` after 350ms
    - [x] If `delta < -threshold`: animate card to `translateX(-150vw) rotate(-30deg)` → call `onSwipeLeft()` after 350ms
    - [x] Otherwise: snap back — clear `transform` and `boxShadow`
    - [x] Set `transition: all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)` on release
  - [x] Cleanup: remove all event listeners on unmount
- [x] Create `/src/components/flashcards/SwipeGestureHandler.jsx`
- [x] Add visible UX legend overlay on flashcard study view:
  - [x] Swipe RIGHT = 🟢 Easy (FSRS rating 5 — long interval)
  - [x] Swipe LEFT = 🔴 Hard (FSRS rating 1 — resets to 1 day)
  - [x] Swipe UP = 🟡 Medium (FSRS rating 3)
  - [x] Tap card = Flip to see answer

---

### 5.3 Full FSRS-5 Algorithm (Replace SM-2)

- [x] Create `/src/services/analytics/fsrsEngine.js`
- [x] Define `FSRS_PARAMS` constant:
  - [x] `w`: array of exactly 17 weights: `[0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]`
  - [x] `DECAY: -0.5`
  - [x] `FACTOR: 19/81`
  - [x] `REQUESTED_RETENTION: 0.9`
- [x] Implement `fsrs.initStability(rating)`: `Math.max(0.1, FSRS_PARAMS.w[Math.max(1,Math.min(4,rating)) - 1])`
- [x] Implement `fsrs.initDifficulty(rating)`: `Math.max(1, Math.min(10, FSRS_PARAMS.w[4] - (rating - 3) * FSRS_PARAMS.w[5]))`
- [x] Implement `fsrs.retrievability(t, stability)`: `Math.pow(1 + FSRS_PARAMS.FACTOR * t / stability, FSRS_PARAMS.DECAY)`
- [x] Implement `fsrs.nextInterval(stability)`: `Math.max(1, Math.round((stability / FSRS_PARAMS.FACTOR) * (Math.pow(FSRS_PARAMS.REQUESTED_RETENTION, 1 / FSRS_PARAMS.DECAY) - 1)))`
- [x] Implement `fsrs.review(card, rating)` — full card update:
  - [x] Compute `t = (now - card.lastReview) / 86400000` (days since last review; 0 if first)
  - [x] Compute `r = fsrs.retrievability(t, card.stability || 1)`
  - [x] If `card.repetitions === 0` (new card):
    - [x] `newStability = fsrs.initStability(rating)`
    - [x] `newDifficulty = fsrs.initDifficulty(rating)`
  - [x] Else if `rating >= 3` (recall):
    - [x] `newStability = card.stability * (Math.exp(w[8]) * (11 - card.difficulty) * Math.pow(card.stability, -w[9]) * (Math.exp((1-r)*w[10]) - 1))`
  - [x] Else if `rating < 3` (forgetting):
    - [x] `newStability = w[11] * Math.pow(card.difficulty, -w[12]) * (Math.pow(card.stability+1, w[13])-1) * Math.exp((1-r)*w[14])`
  - [x] Update difficulty with mean-reversion: `Math.max(1, Math.min(10, card.difficulty - w[6]*(rating-3) + w[7]*(3-card.difficulty)))`
  - [x] Compute `interval = fsrs.nextInterval(newStability)`
  - [x] Return updated card with:
    - [x] `stability: Math.max(0.1, newStability)`
    - [x] `difficulty: newDifficulty`
    - [x] `interval`
    - [x] `repetitions`: increment if rating >= 3, reset to 0 if < 3
    - [x] `lapses`: increment if rating < 3
    - [x] `lastReview: Date.now()`
    - [x] `nextReview: Date.now() + interval * 86400000`
    - [x] `lastRating: rating`
    - [x] `retrievabilityAtReview: r`
- [x] Implement `fsrs.predictedScore(cards)`: mean of `retrievability(t, stability) * 100` across all cards
- [x] Create `/src/hooks/useFSRS.js` hook wrapping the engine
- [x] Remove all SM-2 algorithm code from existing codebase
- [x] Migrate existing card data schema to FSRS-5 fields (ensure backward compatibility)

---

### 5.4 Mastery Heatmap

- [x] Create `/src/components/flashcards/MasteryHeatmap.jsx`
- [x] Desktop: render grid for last 52 weeks (X = weeks, Y = days of week)
- [x] Mobile: render grid for last 90 days (simplified 1-row format)
- [x] Color-code each cell by cards-reviewed count that day using 4 levels:
  - [x] 0 cards: empty / `.bg-surface` (lightest)
  - [x] 1–5 cards: light shade of `--accent` at 25% opacity
  - [x] 6–15 cards: medium shade of `--accent` at 55% opacity
  - [x] 16+ cards: full `--accent` color (darkest)
- [x] On tap/click a cell: show tooltip with `"X cards reviewed · Avg score Y%"`
- [x] Position tooltip to never overflow viewport edge
- [x] Display streak counter below grid: `"🔥 14 day streak"`
- [x] Display longest streak record: `"Best: 42 days"`
- [x] Read daily review history from IndexedDB `analytics` store (keyed by date)

---

### 5.5 Exam View — Desktop Split-Pane + Mobile Bottom Sheet

#### Desktop: True Resizable Split-Pane
- [x] Create `/src/components/ui/SplitPane.jsx`:
  - [x] Left panel: question/vignette content (default 55% width)
  - [x] Right panel: lab results, imaging, or reference notes (default 45%)
  - [x] Draggable divider bar between panels
  - [x] Drag-to-resize: update panel widths in real-time on mousemove/touchmove
  - [x] Store split position in component state
- [x] Create `/src/components/exams/SplitPaneExam.jsx` using `SplitPane`

#### Mobile: Draggable Bottom Sheet
- [x] Create `/src/components/ui/BottomSheet.jsx`:
  - [x] Render via `createPortal(content, document.body)`
  - [x] Backdrop: `position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur`
  - [x] Backdrop opacity transition: 0 when closed, 1 when open (300ms)
  - [x] Sheet: `position: absolute; bottom: 0; left: 0; right: 0; border-radius: 24px 24px 0 0`
  - [x] Default height: `60vh`
  - [x] `padding-bottom: env(safe-area-inset-bottom)`
  - [x] Background: `var(--surface)`; border: `1px solid var(--border)`
  - [x] Drag handle: `width: 40px; height: 4px; border-radius: 2px; background: var(--border2)` centered at top
  - [x] `onTouchStart`: record `startY = e.touches[0].clientY`
  - [x] `onTouchMove`: compute `dragY = max(0, e.touches[0].clientY - startY)`; apply `translateY(dragY)` instantly
  - [x] `onTouchEnd`: if `dragY > 120` → call `onClose()`; else → spring back by resetting `dragY = 0`
  - [x] Open: `transform: translateY(0)` with `transition: 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)`
  - [x] Closed: `transform: translateY(100%)`
  - [x] Accept props: `isOpen`, `onClose`, `children`, `title`
- [x] Create `/src/components/exams/LabResultsDrawer.jsx`:
  - [x] "View Labs" button appears on mobile exam view when question has lab data or imaging
  - [x] Tapping button opens `BottomSheet` with lab/imaging content

---

### 5.6 MatchGame — Complete Upgrade

- [x] Create (or overhaul) `/src/components/flashcards/MatchGame.jsx`
- [x] Implement staggered `scale-in` animations on card grid load: cards appear with delay `index * 50ms`
- [x] Define `@keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`
- [x] Implement match celebration:
  - [x] Matched pair gets green glow burst animation
  - [x] Both matched cards fly off screen simultaneously: `scale(0) translateY(-100px)` animation
- [x] Implement mismatch shake animation:
  - [x] Define `@keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-8px) } 75% { transform: translateX(8px) } }`
  - [x] Trigger shake + red color flash on wrong pick
- [x] Implement circular countdown speed timer in corner:
  - [x] SVG circle progress ring as countdown visual
  - [x] Timer stroke color changes to red when < 30 seconds remaining
- [x] Track personal best completion time per deck in IndexedDB
- [x] Display trophy icon (🏆) when user beats their personal best time
- [x] Show personal bests in a leaderboard-style section on MatchGame start screen

---

## PHASE 6 — PRODUCTIVITY SUITE: TASKS, CALENDAR, NOTIFICATIONS

### 6.1 Task Management System

- [x] Create `/src/store/useTaskStore.js` (Zustand) for task state
- [x] Define `TaskSchema` data model with all fields:
  - [x] `id: String` — UUID
  - [x] `title: String` — required
  - [x] `description: String` — optional
  - [x] `type: 'study' | 'exam' | 'review' | 'personal'`
  - [x] `priority: 'low' | 'medium' | 'high' | 'urgent'`
  - [x] `status: 'pending' | 'in_progress' | 'done' | 'skipped'`
  - [x] `dueDate: Number` — Unix timestamp (ms)
  - [x] `dueTime: String` — "HH:MM" local time
  - [x] `linkedDocId: String` — optional link to a document
  - [x] `linkedFlashcardSetId: String` — optional
  - [x] `fsrsReviewDate: Number` — auto-populated by FSRS engine
  - [x] `reminderMinutesBefore: 15 | 30 | 60 | 120 | 1440`
  - [x] `recurrence: 'none' | 'daily' | 'weekly' | 'custom'`
  - [x] `recurrenceRule: String` — RRULE format if custom
  - [x] `completedAt: Number`
  - [x] `createdAt: Number`
  - [x] `tags: String[]`
- [x] Create `/src/components/tasks/TasksView.jsx`
- [x] Create `/src/components/tasks/TaskCard.jsx`
- [x] Add "Tasks" tab to bottom navigation bar
- [x] Implement task list with exact 4 sections:
  - [x] "Overdue" — red accent header
  - [x] "Today" — primary accent color header
  - [x] "Upcoming" — muted/secondary color header
  - [x] "Done" — green header, collapsible by default
- [x] Swipe right on task card → mark as complete
- [x] Swipe left on task card → delete task
- [x] After delete: show undo toast for 5 seconds with countdown
  - [x] Cancel delete if undo tapped before timer expires
- [x] Long press on task card → activate drag-to-reorder mode
- [x] Quick-add `+` button opens smart input bar
- [x] Smart input bar NLP parsing:
  - [x] `"Study drugs tomorrow at 9am"` → `{ title: "Study drugs", dueDate: tomorrow, dueTime: "09:00", type: "study" }`
  - [x] Detect relative dates: "tomorrow", "next Monday", "in 3 days", "this evening"
  - [x] Detect time: "at 9am", "at 3:30pm", "tonight"
  - [x] Detect task type from keywords: "study", "review", "exam", "read"
- [x] Task card displays:
  - [x] Priority color dot (gray=low, yellow=medium, orange=high, red=urgent)
  - [x] Task title
  - [x] Time remaining chip (e.g., "in 3h", "2 days", "Overdue")
  - [x] Linked document badge (shown if `linkedDocId` set)
  - [x] FSRS review indicator (shown if `fsrsReviewDate` set)

---

### 6.2 Calendar View

- [x] Create `/src/components/tasks/CalendarView.jsx`
- [x] Segmented control at top for view toggle: Month | Week | Day
- [x] Implement **Month View**:
  - [x] Grid of 35 cells (5 rows × 7 columns)
  - [x] Each day cell shows colored event dots:
    - [x] FSRS review events = blue dots
    - [x] Exam events = red dots
    - [x] Task events = accent color dots
  - [x] Tap a day cell → open `BottomSheet` listing day's events
- [x] Implement **Week View**:
  - [x] Horizontal scroll through 7 days
  - [x] Events positioned by time on a vertical timeline
  - [x] FSRS reviews auto-populated from `fsrsEngine.getUpcomingReviews(7)`
- [x] Implement **Day View**:
  - [x] Hour-by-hour vertical timeline (00:00–23:00)
  - [x] AI-suggested study blocks appear as ghost/suggested events (visually distinct)
  - [x] User can tap ghost event to confirm and add to their schedule
- [x] FSRS auto-population: for all flashcard decks with due cards, auto-add "📚 Review due" event
- [x] Color-code each deck's FSRS review events uniquely
- [ ] Implement "Plan my week" AI feature:
  - [ ] Input dialog: hours available per day + exam date + priority topics
  - [ ] AI generates a personalized week study plan
  - [ ] All generated sessions added to calendar as confirmed events

---

### 6.3 Notifications Engine

- [x] Create `/src/services/notifications/notificationService.js`
- [x] Implement `requestPermission()` async method:
  - [x] Guard: return `false` if `'Notification' in window` is false
  - [x] Call `Notification.requestPermission()`
  - [x] Return `result === 'granted'`
- [x] Implement `scheduleLocal(options)` method with `{ title, body, icon, badge, delay, data, actions }`:
  - [x] If `delay <= 0`: call `_fireNow()` immediately
  - [x] If `delay > 0`: save to IndexedDB `notifications` store with `fireAt: Date.now() + delay`
- [x] Implement `_fireNow({ title, body, icon, badge, data, actions })` method:
  - [x] Guard: only fire if `Notification.permission === 'granted'`
  - [x] Create `new Notification(title, { body, icon: icon || '/icon-192.png', badge: badge || '/badge-72.png', data, actions, silent: false, requireInteraction: data?.requireInteraction || false })`
  - [x] `n.onclick`: call `window.focus()`; navigate to `data.view` via `window.mariamNavigateTo?.(data.view)`
- [x] Implement `scheduleFSRSReminders(allDecks)` method:
  - [x] For each deck: filter cards where `c.nextReview <= Date.now() + 86400000`
  - [x] If any due cards exist: schedule at 9:00 AM with title `"📚 X cards due — [deck.title]"`
  - [x] Body: `"Keep your streak alive! Review now to maximize retention."`
  - [x] Actions: `[{ action: 'review', title: 'Review Now' }, { action: 'snooze', title: 'In 1 hour' }]`
  - [x] Link to `{ view: 'flashcards', deckId: deck.id }`
- [x] Implement `scheduleExamReminder(examTitle, examDate)` method:
  - [x] Schedule at `examDate - 86400000`: `"📝 Exam tomorrow: ${examTitle}"` — body: sleep well reminder
  - [x] Schedule at `examDate - 3600000`: `"⏰ Exam in 1 hour: ${examTitle}"` — body: last-minute review prompt
- [x] Implement `scheduleStreakAlert(streakDays)` method:
  - [x] Only fire if current time < 9:00 PM that day
  - [x] Schedule at 9:00 PM: `"🔥 ${streakDays}-day streak at risk!"`
  - [x] Body: `"Study for just 5 minutes to keep your streak alive."`
  - [x] Set `requireInteraction: true`
  - [x] Link to `{ view: 'flashcards' }`
- [x] Implement `_msUntil(timeStr)` helper:
  - [x] Parse "HH:MM" → create target `Date` object for today at that hour/minute
  - [x] If target is already in the past → advance to next day same time
  - [x] Return `target - Date.now()`
- [x] Create `/src/services/notifications/scheduleEngine.js` wired to FSRS engine
- [x] Implement all 6 notification types:
  - [x] Type 1: 📚 Cards Due Today — fires at 9:00 AM if any FSRS cards are due
  - [x] Type 2: 🔥 Streak at Risk — fires at 9:00 PM if no study activity today
  - [x] Type 3: 📝 Exam Reminder — 24h and 1h before scheduled exam dates
  - [x] Type 4: ✅ Task Due Soon — fires based on per-task `reminderMinutesBefore`
  - [x] Type 5: 🏆 Weekly Report — fires every Sunday with stats summary
  - [x] Type 6: 🎯 Daily Study Goal — fires at user-set time if daily goal not yet met

---

## PHASE 7 — CODE-LEVEL BUGS & PERFORMANCE FIXES

### 7.1 IndexedDB Safari/iOS Hardening

- [x] Update `dbOp` function in `/src/services/db/dbOp.js` with full error handling:
- [x] Outer try/catch around `openDB()`:
  - [x] Catch `QuotaExceededError`: throw `"Storage quota exceeded. Please clear some data in Settings."`
  - [x] Catch `SecurityError`: throw `"Storage is blocked (Private Browsing mode or restricted permissions)."`
  - [x] Catch all others: throw `"Database failed to open: ${err.message}"`
- [x] Try/catch around `db.transaction(store, mode)`:
  - [x] Catch `InvalidStateError` (Firefox — connection closed unexpectedly):
    - [x] Reject with `"Database connection was closed unexpectedly. Refreshing..."`
    - [x] `setTimeout(() => window.location.reload(), 2000)`
  - [x] All other errors: reject with original error
- [x] `request.onerror` handler: reject with `"IDB request error in '${store}': ${request.error?.message}"`
- [x] `tx.onerror` handler:
  - [x] If message contains `"QuotaExceededError"`: `"Storage full. Delete unused documents in the Library."`
  - [x] Otherwise: `"IDB transaction failed (${store}): ${msg}"`
- [x] `tx.onabort` handler: `"IDB transaction aborted (${store}). This may be a Safari private mode restriction."`
- [x] `tx.oncomplete`: always call `db.close()` to prevent Safari connection leak
- [x] Implement IndexedDB **migration to version 10** in `migrations.js`:
  - [x] Check `if (oldV < 10)`
  - [x] Create `notifications` object store with `keyPath: 'id'` (guard: check `!db.objectStoreNames.contains('notifications')`)
  - [x] Create `tasks` object store with `keyPath: 'id'` (guard: check `!db.objectStoreNames.contains('tasks')`)
  - [x] Create `analytics` object store with `keyPath: 'date'` (guard: check `!db.objectStoreNames.contains('analytics')`)
  - [x] Verify ALL data in stores from v1–v9 is preserved (zero breaking changes)

---

### 7.2 PDF.js Memory Leak Fix

- [x] Create (or refactor) `/src/components/reader/PdfRenderer.jsx` as a function component:
  - [x] `canvasRef = useRef(null)`
  - [x] `renderTaskRef = useRef(null)` — tracks in-progress PDF.js render task
  - [x] `abortRef = useRef(null)` — cancellation signal per render
  - [x] `useEffect` with dependencies `[pageNumber, pdfDoc, scale]`:
    - [x] Guard: return if `!canvas || !pdfDoc`
    - [x] Cancel in-progress render: `renderTaskRef.current?.cancel()` → set to null
    - [x] Create new abort signal: `abortRef.current = { cancelled: false }`
    - [x] Get page: `await pdfDoc.getPage(pageNumber)`
    - [x] After await: if `abort.cancelled` → return early
    - [x] Get viewport: `page.getViewport({ scale })`
    - [x] Set `canvas.height = viewport.height` and `canvas.width = viewport.width`
    - [x] Get `ctx = canvas.getContext('2d')`
    - [x] `ctx.clearRect(0, 0, canvas.width, canvas.height)` — clear previous render
    - [x] Start render: `page.render({ canvasContext: ctx, viewport })`
    - [x] Store render task in `renderTaskRef.current`
    - [x] `await renderTask.promise`
    - [x] If not cancelled: call `page.cleanup()` to release PDF.js memory cache
    - [x] Catch `err.name === 'RenderingCancelledException'` silently (not an error)
    - [x] Log other errors: `console.error('[PdfRenderer]', err)`
  - [x] Cleanup function (on unmount or dependency change):
    - [x] Set `abort.cancelled = true`
    - [x] Cancel render task: `renderTaskRef.current?.cancel()` → null
    - [x] Clear canvas: `ctx?.clearRect(0, 0, canvas.width, canvas.height)` (release GPU memory)
- [x] Verify no canvas memory accumulates when rapidly switching PDF pages

---

### 7.3 React Render Cycles & useMemo/useCallback Audit

- [ ] **FlashcardsView**: Remove `flashcards` prop; use `useStudyStore(state => state.flashcards)` selector instead
- [ ] **FlashcardsView**: Ensure `filteredSets` only recalculates when `flashcards` or the filter criteria actually change (not on unrelated state updates)
- [ ] **ChatPanel**: Replace per-chunk `setMsgs(p => [...p.slice(0,-1), ...])` with a `useRef` streaming buffer
- [ ] **ChatPanel**: Use `setInterval` at 50ms to batch-flush the streaming buffer to React state (not every chunk)
- [ ] **ChatPanel**: Clear the interval on stream completion and on component unmount
- [ ] **DocWorkspace**: Replace `window.innerWidth < 1024` evaluated at init with `useMediaQuery('(min-width: 1024px)')` hook
- [x] Create `/src/hooks/useMediaQuery.js`: listens to `window.matchMedia(query).addEventListener('change', ...)` — responds to resize events
- [ ] **StudyPodcastPanel**: Remove all direct `window.speechSynthesis` calls; route through `ProsodyEngine` singleton
- [ ] **VoiceTutorModal**: Remove all direct `window.speechSynthesis` calls; route through `ProsodyEngine` singleton
- [ ] **App root**: After Zustand migration, zero local state except `activeView`
- [ ] Verify App root only re-renders when `activeView` changes

---

### 7.4 Streaming Reliability — Complete Fix

- [x] Add `parseSSEBuffer(buffer, provider)` function to `callAIStreaming.js`:
  - [x] Split `buffer` on `'\n'` to get lines array
  - [x] Initialize `events = []` and `remaining = ''`
  - [x] For each line:
    - [x] If starts with `'data: '`: extract `data = line.slice(6).trim()`
    - [x] If `data === '[DONE]'`: push `{ type: 'done' }` → continue
    - [x] Try `JSON.parse(data)`:
      - [x] **Anthropic format**: if `parsed.type === 'content_block_delta'` → push `{ type: 'text', text: parsed.delta?.text || '' }`
      - [x] **OpenAI format**: if `parsed.choices?.[0]?.delta?.content` → push `{ type: 'text', text: parsed.choices[0].delta.content }`
    - [x] On JSON parse failure: store line in `remaining` (incomplete chunk — prepend to next read)
  - [x] Return `{ events, remaining }`
- [x] Integrate `remaining` as prefix carried into the next `read()` call
- [x] Verify: multiple events in a single `read()` result are all processed (no data loss)
- [x] Verify: fragmented JSON across TCP packets is recovered via `remaining` buffer

---

### 7.5 GlobalTaskIndicator Z-Index and Position Fix

- [x] Create `/src/components/layout/GlobalTaskIndicator.jsx`:
  - [x] Render `null` if no task has `status === 'running'`
  - [x] `position: 'fixed'`
  - [x] `bottom: 'calc(var(--bottom-nav-h) + var(--sab) + 12px)'` — always above bottom nav
  - [x] `right: 16`
  - [x] `zIndex: 'var(--z-global-task)'` — value 140, below bottom-nav at 160
  - [x] `maxWidth: 280`
  - [x] `pointerEvents: 'auto'`
  - [x] Apply `.glass` styling: `rounded-2xl px-4 py-3 shadow-xl`
- [x] Verify on mobile the indicator never overlaps the bottom navigation bar

---

### 7.6 speakText → Full ProsodyEngine Migration

- [ ] Locate legacy `speakText` function (currently lines ~126–136 in `App.jsx`)
- [ ] Audit codebase for ALL call sites of `speakText`:
  - [ ] In ChatPanel / chat message handler
  - [ ] In VoiceTutor component
  - [ ] In Podcast / study playback
  - [ ] In any other component
- [ ] Replace EVERY call site with `ProsodyEngine.speakWithProsody(text)`
- [ ] Ensure `ProsodyEngine` singleton is initialized and `loadBestVoice()` awaited before first call
- [ ] Delete the legacy `speakText` function entirely
- [ ] Verify zero remaining direct `window.speechSynthesis.speak()` calls anywhere in codebase

---

### 7.7 Settings — API Key Security Hardening

- [x] In Settings UI: mask API key — display only last 8 characters
  - [x] Format: `sk-...XXXXXXXX` (all but last 8 chars hidden with `...`)
- [x] Add "Test connection" button in Settings:
  - [x] On click: fire a minimal 1-token API call (minimum possible cost)
  - [x] On success: show latency in milliseconds + green checkmark
  - [x] On failure: show red × with sanitized error message (NO API key in message)
- [ ] Add provider-specific model selector dropdown:
  - [ ] Populate with actual available models per provider
  - [ ] Separate dropdown per provider (Anthropic, OpenAI, etc.)
- [ ] Store provider selection independently from API key in IndexedDB
- [ ] Switching providers must NOT clear the existing API key
- [ ] Implement "Export settings" as encrypted password-locked JSON
- [ ] Implement "Import settings" from encrypted JSON (requires same password)
- [ ] Security hard rules (non-negotiable):
  - [ ] NEVER log API keys to `console.log`, `console.error`, or any console method
  - [ ] NEVER include API keys in any `Error` message or user-facing string
  - [ ] NEVER send API keys to any URL other than the configured AI provider endpoint

---

## PHASE 8 — CHAT PAGE: SUPERSEDE CHATGPT

### 8.1 Multi-Turn Context Management

- [ ] Upgrade message history rolling window from 6 messages to **20 messages**
- [ ] Implement intelligent compression for older messages (beyond the 20-message window):
  - [ ] Summarize messages outside the window into a compact "context summary"
  - [ ] Inject context summary as a system-level message at start of each API call
- [ ] Implement document-grounded mode when "Full Doc" is active:
  - [ ] Extract only the 3 most relevant document sections using keyword matching
  - [ ] Never send the entire document text (prevents token overflow)
- [ ] Store conversation summaries in IndexedDB keyed by document ID
- [ ] On revisiting a document with a prior conversation:
  - [ ] Show "Continue previous conversation?" prompt to user
  - [ ] Show a brief summary of previously discussed topics

---

### 8.2 Chat UI Redesign

- [ ] User message bubbles: accent-colored, rounded pill shape, right-aligned
- [ ] AI message bubbles: full-width, Mariam avatar on left, subtle card background
- [ ] Code blocks: syntax-highlighted (use `highlight.js` or equivalent CDN)
- [ ] Code blocks: "Copy" button in top-right corner of each block
- [ ] Code blocks: show programming language label in top-left corner
- [ ] Streaming cursor: blinking `│` cursor shown at end of the **current streaming word** (not end of whole message)
- [ ] Reaction row under each AI message with 5 buttons:
  - [ ] 👍 Thumbs up (positive feedback)
  - [ ] 👎 Thumbs down (negative feedback)
  - [ ] 📋 Copy (copies full message text to clipboard)
  - [ ] 🔊 Read aloud (triggers `ProsodyEngine.speakWithProsody()` on message content)
  - [ ] 🔁 Regenerate (re-runs the triggering user prompt)
- [ ] Message search:
  - [ ] Search icon in chat header
  - [ ] On click: show search input bar
  - [ ] Highlight all matching messages inline as user types
- [ ] Export conversation as `.txt` download
- [ ] Export conversation as `.md` download
- [ ] Export conversation as print-formatted PDF download

---

### 8.3 Chat Superpowers (Features ChatGPT doesn't have in document context)

- [ ] **"Explain this passage"**:
  - [ ] User highlights text in the document viewer
  - [ ] "Ask AI" button appears contextually near the text selection
  - [ ] Tapping sends the selected text as a quote block into the chat
- [ ] **"Quiz me from this page"**:
  - [ ] Quick action button in chat interface
  - [ ] Generates exactly 3 rapid-fire Q&A questions from the current page
  - [ ] Renders questions inline in the chat as interactive cards
- [ ] **"Make me a table"**:
  - [ ] Button that generates a structured comparison from the current document section
  - [ ] Renders result using the existing `UiTable` component
- [ ] **"Find contradictions"**:
  - [ ] AI scans the full document text
  - [ ] Identifies and reports any internal contradictions or inconsistencies
- [ ] **Sticky system prompt per document**:
  - [ ] User can set a persistent system instruction per document
  - [ ] Example: `"Always answer like you're explaining to a 1st-year medical student"`
  - [ ] Instruction persisted in IndexedDB keyed by document ID
  - [ ] Injected into every AI call for that document
- [x] Create `/src/components/chat/QuickPrompts.jsx` containing all quick-action button logic

---

## PHASE 9 — DASHBOARD: DATA-DRIVEN & MOTIVATING

### 9.1 Study Streak System

- [x] Create `/src/components/dashboard/StudyStreakCard.jsx`
- [x] Track consecutive days with any study activity (any feature counts)
- [x] Implement streak freeze mechanic:
  - [x] User earns 1 streak freeze per every 7-day streak milestone
  - [x] Freeze protects streak on a single missed day
  - [x] Freeze is consumed automatically on first missed day (or manually if configurable)
- [x] Implement streak milestone badges at: 7, 14, 30, 60, 100 consecutive days
- [x] Display earned milestone badges on user profile section
- [x] Visual streak row (last 7 days): show 7 icons
  - [x] 🔥 lit flame = studied that day
  - [x] 🔥 dim flame = missed that day
  - [x] 🛡️ shield = streak freeze was used that day

---

### 9.2 Weekly Insights Panel

- [ ] Auto-generate weekly insights card every Monday
- [ ] Data sources for analysis:
  - [ ] FSRS card ratings from the past 7 days
  - [ ] Exam scores from the past 7 days
- [ ] Generated insights must include:
  - [ ] Retention percentage per topic with comparative context (e.g., "your best week yet!")
  - [ ] Weakest topic identification (topic with most cards failed 4+ times)
  - [ ] Personalized recommendation tied to upcoming exam date if one is scheduled
- [ ] Use AI to compose the final insights text from the raw analytics data
- [ ] Store generated insights in IndexedDB for offline reading
- [ ] Display on Dashboard home view

---

### 9.3 Goal Setting

- [ ] Implement daily study goal configuration (in Settings or Dashboard)
- [ ] Support compound goals: e.g., `"Study 20 cards AND review 1 chapter per day"`
- [ ] Parse compound goals into individual trackable sub-components
- [ ] Dashboard shows a `ProgressRing` (circular SVG) for each goal sub-component
  - [ ] Ring fills from 0% to 100% as activity is logged
- [ ] On full goal completion: trigger confetti celebration animation
  - [ ] Implement `@keyframes confetti` burst in CSS (no libraries)
  - [ ] Multiple colored particles burst from center of screen
- [x] Create `/src/components/tasks/GoalTracker.jsx`
- [ ] Persist daily goals (and current-day progress) in IndexedDB

---

## PHASE 10 — ACCESSIBILITY & PERFORMANCE STANDARDS

### 10.1 Accessibility Requirements

- [ ] Add `aria-label` to every interactive element that has no visible text label
  - [ ] All icon-only buttons (close ×, settings ⚙️, search 🔍, etc.)
  - [ ] All action icon buttons in chat (👍, 👎, 📋, 🔊, 🔁)
  - [ ] All navigation items
- [ ] Implement proper focus management on modal/sheet open:
  - [ ] Focus automatically moves to first interactive element inside modal
- [ ] Implement proper focus management on modal/sheet close:
  - [ ] Focus returns to the element that triggered the modal
- [ ] Audit color contrast in all 8 themes for WCAG AA (4.5:1 ratio minimum):
  - [ ] `pure-white` theme
  - [ ] `light` theme
  - [ ] `warm` theme
  - [ ] `rose` theme
  - [ ] `forest` theme
  - [ ] `dark` theme
  - [ ] `slate` theme
  - [ ] `oled` theme
- [ ] Keyboard navigation — verify ALL features reachable via:
  - [ ] `Tab` key cycles through all interactive elements
  - [ ] `Enter`/`Space` activates buttons and links
  - [ ] `Escape` closes all modals, sheets, and dropdowns
  - [ ] `Arrow keys` navigate within carousels, lists, and grids
- [x] `prefers-reduced-motion` support:
  - [x] All CSS animations have a `@media (prefers-reduced-motion: reduce)` fallback
  - [x] Fallback uses opacity-only transitions (no transform animations)
  - [x] 3D card flip → fade in/out instead of `rotateY`
  - [x] Swipe animations → fade out instead of `translateX`
  - [x] Streaming cursor → static instead of blinking

---

### 10.2 Performance Targets (All must be verified via Lighthouse)

- [ ] First Contentful Paint (FCP): measure and achieve < 1.5 seconds
- [ ] Time to Interactive (TTI): measure and achieve < 3 seconds
- [ ] Lighthouse PWA score: achieve 100/100
- [ ] Memory leak verification:
  - [ ] Profile Chrome DevTools heap after navigating through every view
  - [ ] Verify heap usage returns within 10% of initial value
  - [ ] Verify no detached DOM nodes accumulating
  - [ ] Verify no uncleaned event listeners remaining after unmount
- [ ] Frame rate verification on mid-range mobile (iPhone 11 equivalent):
  - [ ] Flashcard 3D flip animation: verify 60fps
  - [ ] Swipe gesture animation: verify 60fps
  - [ ] MatchGame animations: verify 60fps
  - [ ] Confetti burst animation: verify 60fps

---

### 10.3 Error Boundary Completeness

- [x] Maintain `/src/app/AppErrorBoundary.jsx` at app root level
- [ ] Create `ChunkErrorBoundary` for each lazy-loaded view (handles code-split failures):
  - [ ] Wrap `FlashcardsView` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `ExamsView` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `CasesView` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `ChatPanel` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `TasksView` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `VoiceTutorModal` lazy load — show "Retry loading" button on failure
  - [ ] Wrap `StudyPodcastPanel` lazy load — show "Retry loading" button on failure
- [ ] Create `PdfErrorBoundary` around PDF renderer specifically:
  - [ ] Shows: "Unable to render this PDF. Try re-uploading the file."
- [ ] Create `AiErrorBoundary` around all AI-generated content rendering:
  - [ ] Shows: "Regenerate" button instead of crashing the view
- [ ] Create `VoiceErrorBoundary` around all voice features:
  - [ ] Shows: "Voice interaction is not supported in this browser" with a fallback to text input

---

## CRITICAL CONSTRAINTS — NON-NEGOTIABLE VERIFICATION CHECKLIST

### Zero Breaking Changes to Existing Data
- [ ] Test IndexedDB migration: open a pre-migration database → run migration → verify all files exist
- [ ] Test IndexedDB migration: verify all flashcard sets and cards are intact
- [ ] Test IndexedDB migration: verify all exams are intact
- [ ] Test IndexedDB migration: verify all cases are intact
- [ ] Test IndexedDB migration: verify all settings are preserved

### API Key Security — Absolute Rules
- [ ] Audit entire codebase: zero `console.log` calls that could expose API key
- [ ] Audit entire codebase: zero `Error` messages that contain API key
- [ ] Audit every `fetch()` call with `Authorization` header: verify destination is the AI provider only
- [ ] No API key is ever included in any query parameter or URL fragment

### Offline Functionality — Verify All Features Work Without Internet
- [ ] Document viewing (all formats): fully offline
- [ ] Flashcard study (flip, FSRS review, MatchGame): fully offline
- [ ] Exam replay (existing exams): fully offline
- [ ] Task management — CRUD operations: fully offline
- [ ] Calendar viewing: fully offline
- [ ] AI generation: fails gracefully with "No internet connection" — rest of app remains functional

### No New npm Dependencies
- [ ] Verify `package.json` has no new entries after all work is complete
- [ ] All new functionality uses Web Platform APIs exclusively
- [ ] CDN-loaded Workbox is the only new external dependency (acceptable per directive)

### Single HTML File Deployment
- [ ] App builds successfully with `npm run build` (Vite)
- [ ] Build output is `index.html` + hashed asset files only
- [ ] No server-side rendering required
- [ ] `npm run deploy` publishes successfully to GitHub Pages

### All 8 Themes Must Work with Every New Component
- [ ] All new components use `var(--accent)` — NEVER hardcoded `#hex` colors
- [ ] All new components use `var(--bg)` — NEVER hardcoded background colors
- [ ] All new components use `var(--surface)` — NEVER hardcoded surface colors
- [ ] All new components use `var(--text)`, `var(--text2)`, `var(--text3)` for text colors
- [ ] All new components use `var(--border)`, `var(--border2)` for all borders
- [ ] Manually verify every new component in all 8 themes: `pure-white`, `light`, `warm`, `rose`, `forest`, `dark`, `slate`, `oled`

### Existing Data Modules — DO NOT MODIFY
- [ ] `src/Counseling.js` — remains untouched; new architecture imports from it as-is
- [ ] `src/Diseases.js` — remains untouched
- [ ] `src/drugData.js` — remains untouched
- [ ] `src/lawData.js` — remains untouched

### Mobile-First Development Order (Enforced for All New Components)
- [ ] Every new component is designed and tested at **375px wide** first
- [ ] Then enhanced for **768px breakpoint** (tablet)
- [ ] Then enhanced for **1280px+ breakpoint** (desktop)

---

*End of MARIAM PRO Master To-Do List*
*Total items: 500+ granular, actionable tasks*
*Source: Enterprise Master Directive v8.0 SUPREME*
*Zero omissions. Every sentence parsed.*
