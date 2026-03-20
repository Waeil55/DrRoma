# MARIAM PRO — COMPREHENSIVE FIX & CONTENT EXPANSION PROMPT
## Fix All Crashes · Fix All UI · Fix All Fonts · Fix All Scrolling · Expand All Content
## Execute every task — do NOT stop until the final git commit

---

## CONTEXT

You are working inside `App.jsx` (currently ~20,352 lines). This prompt covers:
1. Fix corrupted/garbled text characters throughout the app
2. Fix all UI layout issues (header overlap, scroll, font sizes)
3. Add universal Back button to every page and section
4. Fix all page crashes (undefined props, missing data, broken .map() calls)
5. Expand every page to have complete, rich, real content
6. Fix mobile UI completely

**Absolute rules (never break):**
- Never hardcode colors — always `var(--accent)`, `var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)`
- All `.map()` calls require `(array || []).map(...)` — never assume arrays exist
- All nested access uses optional chaining: `obj?.prop?.nested`
- All async operations need try/catch with user-friendly error toasts
- `isMobile` = `window.innerWidth < 768` inside each component
- Every view needs `<ChunkErrorBoundary>` wrapper
- Test on iPhone Safari before every commit

---

## ══════════════════════════════════════════════════════
## TASK 1 — FIX CORRUPTED / GARBLED CHARACTERS
## ══════════════════════════════════════════════════════

### 1.1 Search and Replace All Corrupted Text

Scan the ENTIRE file for these corrupted character patterns and replace them:

```javascript
// Corrupted emoji/unicode patterns to find and fix:
const CORRUPTED_PATTERNS = [
  // Corrupted sun/weather emoji
  { find: /ðŸŒ¤/g,        replace: '☀️' },
  { find: /ðŸŒ¥/g,        replace: '⛅' },
  { find: /ðŸŒ§/g,        replace: '🌧️' },
  { find: /ðŸŒ¦/g,        replace: '🌦️' },
  { find: /ðŸŒ©/g,        replace: '🌩️' },
  // Corrupted medical/study emoji
  { find: /ðŸ§ /g,         replace: '🧠' },
  { find: /ðŸ'Š/g,         replace: '💊' },
  { find: /ðŸ©º/g,         replace: '🩺' },
  { find: /ðŸ"š/g,         replace: '📚' },
  { find: /ðŸŽ¯/g,         replace: '🎯' },
  { find: /ðŸ†/g,          replace: '🏆' },
  { find: /ðŸ"¥/g,         replace: '🔥' },
  { find: /â­/g,           replace: '⭐' },
  { find: /â†'/g,          replace: '→' },
  { find: /â†"/g,          replace: '↓' },
  { find: /â†'/g,          replace: '↑' },
  { find: /â†/g,           replace: '←' },
  { find: /â€"/g,          replace: '—' },
  { find: /â€˜/g,          replace: "'" },
  { find: /â€™/g,          replace: "'" },
  { find: /â€œ/g,          replace: '"' },
  { find: /â€/g,           replace: '"' },
  { find: /Â·/g,           replace: '·' },
  { find: /Ã©/g,           replace: 'é' },
  { find: /Ã /g,           replace: 'à' },
  { find: /Ã¨/g,           replace: 'è' },
  { find: /Ã§/g,           replace: 'ç' },
  { find: /â„¢/g,          replace: '™' },
  { find: /Â®/g,           replace: '®' },
  { find: /Â°/g,           replace: '°' },
  { find: /Â½/g,           replace: '½' },
  { find: /Â¼/g,           replace: '¼' },
  { find: /Â¾/g,           replace: '¾' },
  { find: /Ë†/g,           replace: 'ˆ' },
  { find: /â€¦/g,          replace: '…' },
  { find: /â€¢/g,          replace: '•' },
  { find: /ï»¿/g,          replace: '' },  // BOM character
];

// Run this replacement across the ENTIRE file
// Also search for any string that contains consecutive non-printable or multi-byte garbled sequences
// Pattern: any 2+ character sequence starting with ð, â, Ã, Â, ë, ï
// Replace with the correct UTF-8 equivalent
```

### 1.2 Fix All UI Label Text

Search for and replace any garbled text in button labels, page titles, descriptions:
- Any title or label containing characters outside normal ASCII + common Unicode (✓ ✗ → ← ↑ ↓ • … — ' ' " ")
- Replace garbled medical terms with their correct spelling
- Common issues: "Ã©" → "é", "â€"" → "—", "ðŸŒ¤" → "☀️"

### 1.3 Verify All String Content After Fix

After replacing, scan for any remaining sequences like `ðŸ`, `â€`, `Ã©`, `Â·` — there should be zero.

---

## ══════════════════════════════════════════════════════
## TASK 2 — FIX ALL UI LAYOUT ISSUES
## ══════════════════════════════════════════════════════

### 2.1 Fix Content Hidden Behind Header (Most Critical Mobile Bug)

The `scroll-content` class must provide enough top padding to clear the fixed header. Current issue: content starts at 0px and is hidden behind the header on mobile.

**Fix the CSS `scroll-content` class:**
```css
/* FIND this in the CSS section of App.jsx and REPLACE with: */

.scroll-content {
  padding-top: calc(env(safe-area-inset-top, 44px) + var(--header-h, 58px) + 8px);
  padding-bottom: calc(140px + env(safe-area-inset-bottom, 34px));
  -webkit-overflow-scrolling: touch;
  min-height: 100%;
}

@media (min-width: 768px) {
  .scroll-content {
    padding-top: 16px;
    padding-bottom: 24px;
  }
}

/* Also fix design-main on mobile: */
.design-main {
  padding-top: calc(env(safe-area-inset-top, 44px) + var(--header-h, 58px) + 8px) !important;
  padding-bottom: calc(120px + env(safe-area-inset-bottom, 34px)) !important;
}

@media (min-width: 768px) {
  .design-main {
    padding-top: 20px !important;
    padding-bottom: 0 !important;
  }
}
```

**Every scrollable view container must have this style:**
```jsx
// Pattern for ALL scrollable page containers:
<div
  className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
  style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
>
  {/* content */}
</div>

// For views that DON'T use scroll-content class, add explicit top padding:
<div
  className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4"
  style={{
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
    paddingTop: 'max(16px, calc(env(safe-area-inset-top) + 70px))',
    paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 34px))',
  }}
>
```

### 2.2 Fix All Double-Scroll Traps

Every nested flex container that scrolls needs `minHeight: 0`. Find ALL instances of:
```jsx
// WRONG — current pattern causing double scroll:
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">...</div>
</div>

// CORRECT — add min-h-0 to EVERY flex parent and flex-1 child:
<div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
  <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>...</div>
</div>
```

Audit and fix in ALL of: DocWorkspace, ChatPanel, FlashcardsView, ExamsView, CasesView, AiTutorPanel, VoiceTutorModal, StudyPodcastPanel, DiseaseExplorerView, MedicinesView, SymptomsView, CounselingTherapyView, every specialty guide.

### 2.3 Fix Font Sizes — Standardize Across Entire App

Current problem: Inconsistent font sizes — some text is 10px, some is 28px in the same component. Standardize with these tokens:

**Add to the CSS section:**
```css
:root {
  --font-scale: 1;

  /* Standardized type scale */
  --text-xs:   clamp(11px, calc(11px * var(--font-scale)), 13px);
  --text-sm:   clamp(12px, calc(13px * var(--font-scale)), 15px);
  --text-base: clamp(13px, calc(15px * var(--font-scale)), 17px);
  --text-md:   clamp(15px, calc(17px * var(--font-scale)), 20px);
  --text-lg:   clamp(18px, calc(20px * var(--font-scale)), 24px);
  --text-xl:   clamp(22px, calc(26px * var(--font-scale)), 32px);
  --text-hero: clamp(28px, calc(34px * var(--font-scale)), 44px);
}
```

**Font weight rules — enforce strictly:**
- Page section labels, badges, captions: `fontSize: 'var(--text-xs)'`
- Body text, descriptions, list items: `fontSize: 'var(--text-sm)'`
- Card titles, subheadings: `fontSize: 'var(--text-base)'`
- Section headers: `fontSize: 'var(--text-md)'`
- Page titles: `fontSize: 'var(--text-lg)'`
- Hero numbers (predicted score, etc.): `fontSize: 'var(--text-hero)'`

**Font weight rules:**
- Body text: `fontWeight: 400`
- Labels, captions: `fontWeight: 500`
- Card titles, subheadings: `fontWeight: 600`
- Section headers, page titles: `fontWeight: 700`
- Hero text ONLY: `fontWeight: 800` — never use on body copy

**Audit and remove:**
- All `className="font-black"` on anything that is NOT a major page title
- All hardcoded `text-[10px]`, `text-[9px]` — minimum is `var(--text-xs)`
- Inconsistent mixing of `font-black`, `font-bold`, `font-extrabold` on similar elements

### 2.4 Fix Mobile Bottom Nav Overlap

The GlobalTaskIndicator and floating buttons currently overlap the bottom nav. Fix:
```jsx
// ALL fixed-position floating buttons must use:
style={{
  bottom: 'calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom, 34px) + 12px)',
  // NOT: bottom: '90px' — that hardcoded value is wrong on iPhone
}}

// GlobalTaskIndicator specifically:
style={{
  position: 'fixed',
  bottom: 'calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom, 34px) + 12px)',
  right: 16,
  zIndex: 140, // below bottom nav (160) but above content
  maxWidth: 280,
}}
```

### 2.5 Fix Z-Index Layers

Apply these z-index values consistently:
```javascript
const Z_LAYERS = {
  base:         1,
  card:         10,
  sticky:       20,
  dropdown:     50,
  modalBack:    100,
  modal:        110,
  bottomSheet:  120,
  aiTutor:      130,
  globalTask:   140,
  toast:        150,
  bottomNav:    160,
  topGlass:     170,
  header:       180,
  onboarding:   9990,
};
```

Fix in CSS:
```css
.design-header { z-index: 180; }
.bottom-nav-fixed { z-index: 160; }
```

---

## ══════════════════════════════════════════════════════
## TASK 3 — UNIVERSAL BACK BUTTON SYSTEM
## ══════════════════════════════════════════════════════

### 3.1 Create Universal Back Button Component

Add this component near the top of App.jsx (after imports, before first view function):

```jsx
// Universal back button — use in EVERY view header
function BackButton({ onClick, label = 'Back', style = {} }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 transition-all active:scale-95"
      style={{
        padding: '8px 12px',
        borderRadius: 12,
        background: 'var(--surface, var(--card))',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        cursor: 'pointer',
        ...style,
      }}
      aria-label={`Go back to ${label}`}
    >
      <ChevronLeft size={16} style={{ color: 'var(--accent)' }} />
      <span>{label}</span>
    </button>
  );
}

// Universal section header with back button — use in EVERY sub-section
function SectionHeader({ title, subtitle, onBack, backLabel = 'Back', actions = null }) {
  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-3"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface, var(--card))',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {onBack && <BackButton onClick={onBack} label={backLabel} />}
      <div className="flex-1 min-w-0">
        <h1
          className="truncate"
          style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', opacity: 0.7, marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
```

### 3.2 Add Back Button to EVERY Page and Section

Apply `SectionHeader` with `onBack` prop to EVERY view that has a "detail" or "sub-page" state. Here is the complete list of places that need it:

**Pattern — Every view with a "selected item" state:**
```jsx
// When a disease/medicine/case/counseling entry is selected:
{selectedItem && (
  <SectionHeader
    title={selectedItem.name}
    subtitle={selectedItem.category || selectedItem.system}
    onBack={() => setSelectedItem(null)}
    backLabel="All Items"
  />
)}

// When a sub-mode is active (e.g., FSRS review, match game, exam player):
{mode === 'fsrs' && (
  <SectionHeader
    title="FSRS Review"
    subtitle={selectedSet?.title}
    onBack={() => { setMode(null); setSelectedSet(null); }}
    backLabel="Flashcards"
  />
)}
```

**Specific locations to add back buttons:**

1. **MedicinesView** — when a medicine is selected (back to medicines list)
2. **DiseaseExplorerView** — when a disease is selected (back to disease list)
3. **SymptomsView** — when a symptom is selected (back to symptoms list)
4. **CounselingTherapyView** — when an entry is selected (back to counseling list)
5. **FlashcardsView** — when studying a deck (back to decks list), when in FSRS mode, when in Match Game
6. **ExamsView** — when taking an exam (back to exam list), when in review mode
7. **CasesView** — when in a case set (back to cases list)
8. **ChatView** — when in a session (back to session list)
9. **NotesView** — when editing a note (back to notes list)
10. **MedicalCalculatorView** — when using a calculator (back to calculator list)
11. **StudyPlanView** — when viewing a plan (back to plan list)
12. **ClinicalSimulatorView** — when in a session (back to simulator home)
13. **AnalyticsView** — sub-sections (back to analytics home)
14. **Every specialty guide** (CardiologyGuideView, NeurologyGuideView, etc.) — any sub-topic detail view
15. **LabReferenceView** — any selected category (back to full lab list)
16. **DifferentialDiagnosisView** — results view (back to input)
17. **DrugInteractionCheckerView** — results view (back to search)
18. **ECGInterpreterView** — interpretation detail (back to ECG list)
19. **RadiologyInterpreterView** — image detail (back to radiology list)
20. **OSCEPrepView** — scenario detail (back to scenario list)
21. **Any deep-nested modal or sub-view** — always needs a back path

**Also add a global "Back to Home" in every specialty guide header:**
```jsx
// Every specialty guide top bar:
<SectionHeader
  title="Cardiology Guide"
  onBack={() => setView('dashboard')}
  backLabel="Home"
  actions={<DraggableTutorPanel ... />}
/>
```

---

## ══════════════════════════════════════════════════════
## TASK 4 — FIX ALL PAGE CRASHES
## ══════════════════════════════════════════════════════

### 4.1 The Universal Crash Prevention Pattern

Apply these defensive patterns to EVERY component in the app:

```jsx
// Rule 1: Safe array mapping — ALWAYS add || []
(items || []).map(item => ...)
(set?.cards || []).map(card => ...)
(data?.rows || []).map(row => ...)

// Rule 2: Safe object access — ALWAYS use optional chaining
item?.name || 'Unknown'
disease?.symptoms?.join(', ') || ''
medicine?.dosing?.adult?.start || 'See prescribing information'

// Rule 3: Safe function wrapping for any component that might crash
function SafeView({ Component, props, fallback = null }) {
  try {
    return <Component {...props} />;
  } catch (err) {
    console.error('[SafeView]', err);
    return fallback || <ErrorFallback error={err} />;
  }
}

// Rule 4: Error fallback component
function ErrorFallback({ error, onRetry }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 24, maxWidth: 300 }}>
        {error?.message || 'This page encountered an error. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-accent px-6 py-3 rounded-2xl font-bold"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

### 4.2 Fix Each Crashing View

**Pattern to apply to EVERY view function:**
```jsx
function AnyView({ settings, addToast, ...otherProps }) {
  // 1. Always validate props at top
  const safeSettings = settings || {};
  const safeAddToast = addToast || ((msg, type) => console.log(msg, type));

  // 2. State initialization with safe defaults
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 3. Safe data computation
  const safeItems = useMemo(() => (items || []).filter(Boolean), [items]);

  // 4. Error boundary in render
  if (error) return <ErrorFallback error={error} onRetry={() => setError(null)} />;

  return (
    // ... rest of component
  );
}
```

**Specific crash fixes for known problematic views:**

```jsx
// PharmacologyQuickRefView — crashes because it uses hardcoded static data without safety checks
function PharmacologyQuickRefView() {
  const [selected, setSelected] = useState(null);
  // Always wrap data access in try/catch
  const pharmaData = useMemo(() => {
    try { return PHARMA_REFERENCE_DATA || []; }
    catch { return []; }
  }, []);
  // ...
}

// ClinicalGuidelinesView — crashes on undefined guideline access
function ClinicalGuidelinesView() {
  const [guidelines] = useState(CLINICAL_GUIDELINES_DATA || []);
  // ...
}

// ECGInterpreterView — crashes when image data undefined
function ECGInterpreterView() {
  const [ecgData] = useState(ECG_REFERENCE_DATA || []);
  // Always check before rendering any image or data
  if (!ecgData || ecgData.length === 0) {
    return <EmptyState icon="📈" title="ECG Reference" message="Loading ECG reference data..." />;
  }
  // ...
}

// ALL specialty guide views — crashes when internal data undefined
// Apply this pattern to ALL guide views:
function CardiologyGuideView() {
  const data = CARDIOLOGY_DATA || {};
  const topics = data.topics || [];
  const keyDrugs = data.keyDrugs || [];
  const conditions = data.conditions || [];
  // ... safe to use now
}
```

### 4.3 Fix App.jsx ViewWrapper Calls — Add Missing Props

Many crashes happen because views are called with missing props. Fix every ViewWrapper call:

```jsx
// Audit EVERY ViewWrapper in App() function
// Add missing props to every single one:

<ViewWrapper active={view === 'pharma'}>
  <ChunkErrorBoundary>
    <PharmacologyQuickRefView settings={settings} addToast={addToast} />
  </ChunkErrorBoundary>
</ViewWrapper>

<ViewWrapper active={view === 'guidelines'}>
  <ChunkErrorBoundary>
    <ClinicalGuidelinesView settings={settings} addToast={addToast} />
  </ChunkErrorBoundary>
</ViewWrapper>

<ViewWrapper active={view === 'ecg'}>
  <ChunkErrorBoundary>
    <ECGInterpreterView settings={settings} addToast={addToast} />
  </ChunkErrorBoundary>
</ViewWrapper>

// ... same pattern for ALL 79 views
// Every view gets: settings={settings} addToast={addToast}
// Views that need more: also add their required props
```

### 4.4 Add EmptyState Helper Component

Many views crash when they show an empty array. Add this:

```jsx
function EmptyState({ icon = '📭', title, message, action = null }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        {title}
      </h3>
      {message && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', opacity: 0.7, maxWidth: 280 }}>
          {message}
        </p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
```

---

## ══════════════════════════════════════════════════════
## TASK 5 — EXPAND ALL PAGES WITH COMPLETE REAL CONTENT
## ══════════════════════════════════════════════════════

### 5.1 The Content Expansion Standard

Every page must have REAL, COMPLETE, CLINICALLY ACCURATE content. No placeholder text, no "coming soon", no minimal 3-line descriptions.

### 5.2 Complete All Specialty Guide Views

Every specialty guide view must use this rich template:

```jsx
function CardiologyGuideView({ settings, addToast }) {
  const [activeSection, setActiveSection] = useState(null);
  const isMobile = window.innerWidth < 768;

  const SECTIONS = [
    {
      id: 'overview',
      title: 'Specialty Overview',
      icon: '🫀',
      content: {
        description: 'Cardiology is the branch of medicine dealing with disorders of the heart and the cardiovascular system. Cardiologists treat conditions including coronary artery disease, heart failure, valvular disease, arrhythmias, congenital heart disease, and hypertension.',
        scope: ['Coronary artery disease and acute coronary syndromes', 'Heart failure (systolic and diastolic)', 'Valvular heart diseases (aortic stenosis, mitral regurgitation, etc.)', 'Arrhythmias and electrophysiology', 'Hypertension', 'Peripheral vascular disease', 'Congenital heart disease', 'Pericardial diseases', 'Cardiomyopathies', 'Cardiac imaging (echo, cardiac MRI, nuclear)'],
        keyFacts: ['Heart disease is the #1 cause of death in the US and worldwide', 'CAD causes approximately 1 in 4 deaths in the US', 'Heart failure affects 6.5 million Americans', 'AF affects approximately 5 million Americans'],
      },
    },
    {
      id: 'conditions',
      title: 'Top Conditions',
      icon: '🏥',
      content: {
        list: [
          { name: 'Acute Myocardial Infarction (STEMI)', prevalence: 'Common', mortality: '5-10% with treatment', keyDrug: 'Aspirin + P2Y12 + heparin', management: 'Primary PCI < 90 min door-to-balloon' },
          { name: 'Heart Failure (HFrEF)', prevalence: '6.5M US patients', mortality: '50% 5-year', keyDrug: 'ACEi/ARNI + BB + MRA + SGLT2i', management: 'Optimize medical therapy + ICD if EF ≤ 35%' },
          { name: 'Atrial Fibrillation', prevalence: '5M US patients', mortality: '2× mortality vs sinus', keyDrug: 'Anticoagulation (DOAC preferred)', management: 'Rate vs rhythm control + stroke prevention' },
          { name: 'Hypertension', prevalence: '116M US (47%)', mortality: 'Silent killer — leads to stroke, MI, HF', keyDrug: 'ACEi/ARB + CCB + thiazide', management: 'Target < 130/80 (ACC/AHA 2017)' },
          { name: 'Aortic Stenosis', prevalence: '2% over age 65', mortality: 'Symptomatic: 50% 2-year without intervention', keyDrug: 'None — definitive is TAVR/SAVR', management: 'Valve replacement when symptomatic (angina, syncope, CHF)' },
          { name: 'Pulmonary Embolism', prevalence: '600K cases/year US', mortality: 'Massive PE: 30% untreated', keyDrug: 'Anticoagulation (heparin → DOAC)', management: 'Risk stratify: submassive → lyse; massive → lyse or surgical embolectomy' },
          { name: 'Deep Vein Thrombosis', prevalence: '900K cases/year US', mortality: 'Low with treatment', keyDrug: 'Anticoagulation', management: 'DOAC for 3-6 months; indefinite if unprovoked' },
          { name: 'Cardiac Tamponade', prevalence: 'Uncommon but emergent', mortality: 'High without pericardiocentesis', keyDrug: 'IV fluids temporizing', management: 'Emergency pericardiocentesis' },
          { name: 'Endocarditis', prevalence: '15/100K per year', mortality: '15-25% in-hospital', keyDrug: 'Prolonged IV antibiotics (4-6 weeks)', management: 'ID + cardiology co-management; surgery if indicated' },
          { name: 'Hypertrophic Cardiomyopathy', prevalence: '1/500 population', mortality: 'Main cause of SCD in young athletes', keyDrug: 'Beta-blockers, disopyramide', management: 'ICD for SCD risk; septal reduction if LVOTO' },
        ],
      },
    },
    {
      id: 'drugs',
      title: 'Key Drugs',
      icon: '💊',
      content: {
        classes: [
          {
            class: 'Beta-Blockers',
            examples: 'Metoprolol succinate, Carvedilol, Bisoprolol',
            indications: 'HFrEF (mortality ↓ 34%), AF rate control, post-MI, hypertension, angina',
            mechanism: 'Block β1/β2 adrenergic receptors → ↓ HR, ↓ BP, ↓ myocardial O2 demand',
            sideEffects: 'Bradycardia, hypotension, fatigue, bronchospasm (non-cardioselective)',
            contraindications: 'Decompensated HF, severe bradycardia, high-degree heart block, severe asthma',
            pearl: 'Carvedilol: β1 + β2 + α1 blocker. Metoprolol: β1-selective. For HF: must start low, titrate SLOWLY.',
          },
          {
            class: 'ACE Inhibitors',
            examples: 'Lisinopril, Enalapril, Ramipril, Captopril',
            indications: 'HFrEF (mortality ↓ 16-20%), post-MI, hypertension, proteinuric CKD',
            mechanism: 'Block ACE → ↓ angiotensin II → vasodilation + ↓ aldosterone + ↓ remodeling',
            sideEffects: 'Dry cough (10-15%), angioedema (rare but serious), hyperkalemia, hypotension, AKI',
            contraindications: 'Pregnancy (category D), bilateral renal artery stenosis, prior ACE-induced angioedema',
            pearl: 'Cough → switch to ARB (losartan). Angioedema → NO ACEi or ARB ever again.',
          },
          {
            class: 'ARNIs (Sacubitril/Valsartan)',
            examples: 'Entresto (sacubitril/valsartan)',
            indications: 'HFrEF EF ≤ 40% — superior to enalapril (PARADIGM-HF: ↓ CV mortality 20%)',
            mechanism: 'Neprilysin inhibition (↑ BNP, natriuretic peptides) + ARB (blocks RAAS)',
            sideEffects: 'Hypotension, angioedema (↑ risk if prior ACE angioedema), hyperkalemia',
            contraindications: 'Do NOT combine with ACEi (angioedema risk). Wash out ACEi 36h before starting.',
            pearl: 'BNP is elevated on sacubitril/valsartan — use NT-proBNP to monitor HF instead.',
          },
          {
            class: 'SGLT2 Inhibitors',
            examples: 'Empagliflozin (Jardiance), Dapagliflozin (Farxiga)',
            indications: 'HFrEF (↓ CV death + HF hosp 25%), HFpEF (empagliflozin), T2DM with CV disease',
            mechanism: 'Block renal glucose reabsorption → glucosuria + osmotic diuresis + ↓ preload + cardiac metabolic effects',
            sideEffects: 'UTI, genital mycotic infections, DKA (rare), volume depletion',
            contraindications: 'eGFR < 20-25, Type 1 DM',
            pearl: 'Now a cornerstone of HF therapy regardless of DM status.',
          },
          {
            class: 'Statins',
            examples: 'Atorvastatin (Lipitor), Rosuvastatin (Crestor)',
            indications: 'All atherosclerotic CV disease; LDL reduction; primary prevention in high-risk',
            mechanism: 'Inhibit HMG-CoA reductase → ↓ hepatic cholesterol synthesis → ↑ LDL receptors',
            sideEffects: 'Myopathy/myalgia (3-10%), rhabdomyolysis (rare), elevated LFTs, new-onset DM (high-dose)',
            contraindications: 'Active liver disease, pregnancy, statin myopathy',
            pearl: 'High-intensity: atorvastatin 40-80mg or rosuvastatin 20-40mg. Target LDL < 70 (or < 55 for very high risk).',
          },
        ],
      },
    },
    {
      id: 'labs',
      title: 'Reference Values',
      icon: '🧪',
      content: {
        values: [
          { test: 'Troponin I', normal: '< 0.04 ng/mL', critical: '> 1.0 ng/mL', significance: 'MI, myocarditis; rises 3-6h, peaks 12-24h, stays up 7-10d' },
          { test: 'Troponin T (high-sensitivity)', normal: '< 14 ng/L', critical: '> 52 ng/L', significance: 'Earlier detection, better NPV for ruling out ACS' },
          { test: 'BNP', normal: '< 100 pg/mL', critical: '> 400 pg/mL', significance: '< 100 rules out HF; > 400 confirms HF in dyspneic patient' },
          { test: 'NT-proBNP', normal: '< 300 pg/mL', critical: '> 450 (< 50yo); > 900 (50-75yo); > 1800 (>75yo)', significance: 'Monitor HF on sacubitril/valsartan (BNP unreliable on ARNI)' },
          { test: 'CK-MB', normal: '< 5 ng/mL', critical: '> 25 ng/mL', significance: 'Rises 4-6h, peaks 12-24h — more cardiac-specific than total CK' },
          { test: 'D-dimer', normal: '< 0.5 μg/mL (FEU)', critical: 'Rule out DVT/PE only if LOW pretest probability', significance: 'Very sensitive, poor specificity — elevated in many conditions' },
          { test: 'LDL Cholesterol', normal: '< 100 mg/dL (general); < 70 (high-risk); < 55 (very high-risk)', critical: '> 190 (consider FH)', significance: 'Primary target for statin therapy' },
          { test: 'HDL Cholesterol', normal: '> 40 (men), > 50 (women)', critical: '< 40 (↑ CV risk)', significance: 'Low HDL is a risk factor' },
          { test: 'Triglycerides', normal: '< 150 mg/dL', critical: '> 500 (pancreatitis risk)', significance: 'Target < 150; > 150 = elevated' },
          { test: 'CRP (hs-CRP)', normal: '< 1.0 mg/L (low risk)', critical: '> 3.0 mg/L (high risk)', significance: 'CV risk stratification; predicts events beyond lipids' },
          { test: 'International Normalized Ratio (INR)', normal: '0.9-1.1', critical: '> 4.0 (bleeding risk)', significance: 'Monitor warfarin; target 2.0-3.0 for AF; 2.5-3.5 for mechanical valve' },
          { test: 'TSH', normal: '0.4-4.0 mIU/L', critical: 'Any abnormal in new AF or HF', significance: 'Check in all new AF; thyroid disease is reversible cause' },
        ],
      },
    },
    {
      id: 'algorithms',
      title: 'Clinical Algorithms',
      icon: '📊',
      content: {
        algorithms: [
          {
            name: 'STEMI Management',
            steps: ['12-lead ECG within 10 min → ST elevation in ≥ 2 contiguous leads or new LBBB', 'Activate cath lab', 'Dual antiplatelet (aspirin + P2Y12 inhibitor)', 'Anticoagulate (UFH or bivalirudin)', 'Primary PCI within 90 min (door-to-balloon)', 'If PCI unavailable within 120 min → fibrinolytics', 'Post-PCI: CCU admission, serial troponins, echo'],
          },
          {
            name: 'AF Rate vs Rhythm Control',
            steps: ['New AF: Rate control first (BB or CCB)', 'Anticoagulation: CHA₂DS₂-VASc ≥ 2 men / ≥ 3 women → DOAC', 'Rate control target: HR < 110 bpm at rest (lenient)', 'Rhythm control if: symptomatic despite rate control, younger patient, reversible cause, first episode', 'Cardioversion: electrical (if stable) or pharmacological (flecainide, amiodarone)', 'If cardioversion: anticoagulate ≥ 3 weeks before OR TEE to rule out thrombus'],
          },
          {
            name: 'HF GDMT Initiation',
            steps: ['Confirm HFrEF (echo EF < 40%)', 'Start ACEi/ARNI (lisinopril or sacubitril/valsartan)', 'Add beta-blocker (carvedilol, metoprolol succinate)', 'Add MRA (spironolactone or eplerenone if eGFR allows)', 'Add SGLT2i (empagliflozin or dapagliflozin)', 'Diuretics for symptom relief (furosemide, torsemide)', 'Consider ICD if EF ≤ 35% despite ≥ 3 months optimal therapy', 'Consider CRT if EF ≤ 35% + LBBB + QRS ≥ 150ms'],
          },
        ],
      },
    },
    {
      id: 'questions',
      title: 'Practice Questions (50 Questions)',
      icon: '📝',
      content: {
        questions: [
          {
            q: 'A 65-year-old man presents with crushing substernal chest pain for 90 minutes, radiation to the left arm, and diaphoresis. ECG shows ST elevation in V1-V4. What is the door-to-balloon time goal for primary PCI?',
            choices: ['30 minutes', '60 minutes', '90 minutes', '120 minutes', '180 minutes'],
            correct: 2,
            explanation: '90 minutes is the ACC/AHA goal for door-to-balloon time in STEMI when the patient presents to a PCI-capable hospital. This time starts at first medical contact. If transfer is needed, the goal is 120 minutes. Every 30-minute delay increases mortality by approximately 7.5%.',
          },
          {
            q: 'A patient with heart failure and EF of 30% has been on optimal medical therapy for 4 months. He continues to have NYHA class II symptoms. Which additional intervention should be considered?',
            choices: ['CRT-D', 'Heart transplant', 'LVAD', 'ICD placement', 'Increased diuretic dose'],
            correct: 3,
            explanation: 'ICD is indicated for primary prevention of sudden cardiac death in patients with EF ≤ 35% who have been on optimal medical therapy for ≥ 3 months and have NYHA class II-III symptoms. CRT requires QRS ≥ 150ms with LBBB in addition to EF ≤ 35%. Heart transplant and LVAD are for end-stage, refractory HF.',
          },
          {
            q: 'A 72-year-old woman with atrial fibrillation has a CHA₂DS₂-VASc score of 4. What is the most appropriate anticoagulation strategy?',
            choices: ['No anticoagulation needed', 'Aspirin alone', 'Warfarin with target INR 2-3', 'DOAC (apixaban, rivaroxaban)', 'Aspirin + clopidogrel'],
            correct: 3,
            explanation: 'DOACs are preferred over warfarin for AF anticoagulation in most patients (except mechanical heart valves or severe MS). CHA₂DS₂-VASc ≥ 2 in men or ≥ 3 in women warrants anticoagulation. This patient\'s score of 4 clearly indicates anticoagulation. DOACs (apixaban, rivaroxaban, dabigatran) have been shown to be at least as effective as warfarin with lower bleeding risk.',
          },
          // ... continue with 47 more questions at this quality level
        ],
      },
    },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <SectionHeader
        title="Cardiology Guide"
        subtitle="Comprehensive cardiovascular medicine reference"
        onBack={() => setActiveSection(null)}
        backLabel={activeSection ? 'Cardiology' : 'Home'}
      />

      <div
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
      >
        {!activeSection ? (
          // Section list
          <div className="p-4 space-y-3">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section)}
                className="w-full text-left glass rounded-2xl p-4 card-hover transition-all"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 28 }}>{section.icon}</span>
                  <div>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' }}>
                      {section.title}
                    </p>
                  </div>
                  <ChevronRight size={16} className="ml-auto" style={{ color: 'var(--accent)' }} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Section detail
          <div className="p-4">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              {activeSection.title}
            </h2>
            {/* Render section content based on activeSection.id */}
            {renderSectionContent(activeSection)}
          </div>
        )}
      </div>

      <DraggableTutorPanel
        context={{
          specialty: 'Cardiology',
          section: activeSection?.title || 'Overview',
          focus: activeSection?.id || 'general',
        }}
        contextLabel={activeSection?.title || 'Cardiology'}
        settings={settings}
        defaultMode={isMobile ? 'floating' : 'docked'}
      />
    </div>
  );
}
```

**Apply this SAME template to ALL 26 specialty guides:**
- CardiologyGuideView ✓ (shown above)
- NeurologyGuideView
- PulmonologyGuideView
- GastroenterologyGuideView
- EmergencyMedicineGuideView
- InfectiousDiseaseGuideView
- EndocrinologyGuideView
- NephrologyGuideView
- HematologyGuideView
- RheumatologyGuideView
- OphthalmologyGuideView
- OrthopedicsGuideView
- ENTGuideView
- UrologyGuideView
- DermatologyAtlasView
- PathologyQuickRefView
- MicrobiologyGuideView
- CriticalCareProtocolsView
- NeurologyGuideView
- GeriatricAssessmentView
- PalliativeCareView
- WoundCareGuideView
- PainManagementView
- TransfusionMedicineView
- AntibioticStewardshipView
- VentilatorGraphsView

Each must have: Overview + Top Conditions + Key Drugs + Reference Values + Clinical Algorithms + 50 Practice Questions

### 5.3 Complete All Medical Reference Tool Views

**LabReferenceView — Complete normal values table (all major labs):**
```javascript
// Must include ALL of these lab categories with normal ranges, critical values, clinical significance:
const LAB_REFERENCE = {
  hematology: [
    { test: 'Hemoglobin', male: '13.5-17.5 g/dL', female: '12.0-15.5 g/dL', critical: '< 7.0 or > 20.0', significance: 'Anemia vs polycythemia' },
    { test: 'Hematocrit', male: '41-53%', female: '36-46%', critical: '< 21% or > 60%', significance: 'Parallel to Hgb' },
    { test: 'WBC', normal: '4,500-11,000/μL', critical: '< 2,000 or > 30,000', significance: 'Infection, leukemia, immunosuppression' },
    { test: 'Platelets', normal: '150,000-400,000/μL', critical: '< 50,000 or > 1,000,000', significance: 'Thrombocytopenia: bleeding risk; thrombocytosis: clotting risk' },
    { test: 'MCV', normal: '80-100 fL', critical: '< 70 or > 115', significance: 'Microcytic (iron, thal) vs macrocytic (B12, folate, liver)' },
    { test: 'Reticulocytes', normal: '0.5-2.5%', critical: '>10%: hemolysis; <0.5%: aplasia', significance: 'Bone marrow response to anemia' },
    // ... continue with all CBC components, differentials
  ],
  metabolic: [
    { test: 'Sodium', normal: '136-145 mEq/L', critical: '< 120 or > 160', significance: 'Hypo: seizures; Hyper: brain shrinkage' },
    { test: 'Potassium', normal: '3.5-5.0 mEq/L', critical: '< 2.5 or > 6.5', significance: 'Cardiac arrhythmias at extremes' },
    { test: 'Creatinine', male: '0.7-1.3 mg/dL', female: '0.5-1.1 mg/dL', critical: '> 10 (dialysis consideration)', significance: 'Renal function marker' },
    { test: 'BUN', normal: '7-20 mg/dL', critical: '> 100', significance: 'BUN:Cr ratio > 20 suggests prerenal azotemia' },
    { test: 'Glucose (fasting)', normal: '70-99 mg/dL', critical: '< 50 or > 500', significance: 'DM diagnosis ≥ 126 mg/dL twice' },
    { test: 'HbA1c', normal: '< 5.7%', prediabetes: '5.7-6.4%', diabetes: '≥ 6.5%', significance: '3-month glucose average; target < 7% in DM' },
    { test: 'Calcium', normal: '8.5-10.5 mg/dL', critical: '< 6.5 or > 13.5', significance: 'Hypo: tetany, seizures; Hyper: stones, bones, groans, moans' },
    { test: 'Magnesium', normal: '1.5-2.5 mEq/L', critical: '< 0.5 or > 4.9', significance: 'Low Mg causes refractory hypoK and HypoCa' },
    { test: 'Phosphate', normal: '2.5-4.5 mg/dL', critical: '< 1.0 or > 8.9', significance: 'Low: refeeding syndrome; High: CKD, hypoparathyroidism' },
    // ... continue with liver function, cardiac markers, coagulation, thyroid, lipids, urinalysis, ABG, etc.
  ],
  // ... all other lab panels
};
```

**ECGInterpreterView — Complete ECG reference:**
```javascript
const ECG_REFERENCE = {
  normals: {
    rate: '60-100 bpm (60/large squares between R waves)',
    prInterval: '120-200ms (3-5 small squares)',
    qrsDuration: '< 120ms (< 3 small squares)',
    qtcInterval: '< 440ms male; < 460ms female',
    pAxis: '0-75°',
    qrsAxis: '-30° to +90°',
  },
  rhythms: [
    { name: 'Normal Sinus Rhythm', features: 'P before every QRS, PR 120-200ms, rate 60-100', management: 'None' },
    { name: 'Sinus Bradycardia', features: 'Rate < 60, otherwise normal', management: 'Asymptomatic: observe. Symptomatic: atropine → transcutaneous pacing → transvenous pacing' },
    { name: 'Atrial Fibrillation', features: 'Irregularly irregular, no distinct P waves, fibrillatory baseline', management: 'Rate control (BB/CCB) + anticoagulation + rhythm control if indicated' },
    { name: 'Atrial Flutter', features: 'Sawtooth flutter waves at 300/min, usually 2:1 or 4:1 block, rate 150 or 75', management: 'Similar to AF; cardioversion often effective; ablation highly effective' },
    { name: 'Ventricular Tachycardia', features: 'Wide complex (> 120ms), rate > 100, AV dissociation, fusion beats, capture beats', management: 'Unstable: defibrillate. Stable: amiodarone or lidocaine. Monomomorphic: check K+/Mg2+' },
    { name: 'Ventricular Fibrillation', features: 'Chaotic, no organized complexes', management: 'CPR + defibrillation (200J biphasic) + epinephrine 1mg q3-5min + amiodarone' },
    { name: 'SVT (AVNRT)', features: 'Narrow complex, rate 150-250, P hidden in or just after QRS', management: 'Vagal maneuvers → adenosine 6mg IV → 12mg → cardioversion if unstable' },
    { name: '1st Degree AV Block', features: 'PR > 200ms, all P waves conduct', management: 'None — benign' },
    { name: '2nd Degree AV Block Type I (Wenckebach)', features: 'Progressive PR lengthening until dropped QRS', management: 'Usually benign; treat underlying cause' },
    { name: '2nd Degree AV Block Type II', features: 'Constant PR with sudden dropped QRS, fixed ratio', management: 'Pacemaker (risk of complete heart block)' },
    { name: '3rd Degree (Complete) Heart Block', features: 'AV dissociation, P and QRS with no relationship, ventricular escape rate 30-40', management: 'EMERGENT: transcutaneous pacing → transvenous → permanent pacemaker' },
    { name: 'LBBB', features: 'QRS > 120ms, broad notched R in V5-V6, deep S in V1, no septal Q waves in I, aVL', management: 'If new + chest pain → treat as STEMI equivalent. Otherwise investigate cause.' },
    { name: 'RBBB', features: 'QRS > 120ms, RSR\' in V1 (rabbit ears), wide S in V5-V6, I, aVL', management: 'Isolated RBBB: usually benign. New RBBB in PE context: RV strain.' },
  ],
  stChanges: [
    { pattern: 'ST elevation ≥ 1mm in ≥ 2 contiguous limb leads or ≥ 2mm in precordial', interpretation: 'STEMI — emergent PCI', leads: 'V1-V4: Anterior (LAD); II, III, aVF: Inferior (RCA or LCx); I, aVL, V5-V6: Lateral (LCx or LAD diag)' },
    { pattern: 'ST depression', interpretation: 'NSTEMI/UA, posterior MI (V1-V3), digoxin effect, LVH', management: 'Serial troponins, heparin, cardiology consult' },
    { pattern: 'Diffuse ST elevation with PR depression', interpretation: 'Pericarditis (saddle-shaped elevation in most leads)', management: 'NSAIDs + colchicine; avoid in recent MI' },
    { pattern: 'Tall R in V1 with ST depression', interpretation: 'Posterior MI (mirror image of anterior STEMI)', management: 'Treat as STEMI — check posterior leads V7-V9' },
  ],
};
```

### 5.4 Fix and Complete MedicinesView Content

The MedicinesView must have at minimum 200 drugs with complete data. Ensure the `MEDICINE_DB` array contains entries like:

```javascript
// Every medicine entry must have ALL fields:
{
  id: 'aspirin',
  name: 'Aspirin',
  genericName: 'Acetylsalicylic Acid',
  brandNames: ['Bayer', 'Ecotrin', 'Bufferin'],
  drugClass: 'NSAID / Antiplatelet',
  category: 'Cardiovascular',
  schedule: 'OTC',
  blackBoxWarning: null,
  mechanism: 'Irreversibly inhibits COX-1 and COX-2 → ↓ prostaglandins. At low doses: inhibits thromboxane A2 in platelets (irreversible) → antiplatelet effect lasting platelet lifespan (8-10 days).',
  indications: { fda: [...], offLabel: [...] },
  dosing: { adult: {...}, pediatric: {...}, renal: {...}, hepatic: {...} },
  sideEffects: { common: [...], serious: [...] },
  contraindications: { absolute: [...], relative: [...] },
  interactions: [...],
  monitoring: { baseline: [...], ongoing: {...} },
  counseling: [...],  // 10+ points
  clinicalPearls: [...],  // 8-10 points
  pharmacokinetics: { absorption: {...}, distribution: {...}, metabolism: {...}, elimination: {...} },
  comparedTo: [...],
  questionBank: [],  // Built-in questions
}
```

### 5.5 Fix and Complete DiseaseExplorerView Content

Ensure `DISEASE_DB` has at minimum 150 diseases with complete clinical data. Each must have all 12 sections populated.

### 5.6 Fix and Complete SymptomsView Content

The SymptomsView should display symptoms with complete clinical information. Ensure `SYMPTOMS_DB` has 100 entries.

### 5.7 Fix and Complete CounselingTherapyView Content

Ensure `COUNSELING_DB` has 30 entries with complete theoretical and clinical content.

---

## ══════════════════════════════════════════════════════
## TASK 6 — FIX MOBILE UI COMPLETELY
## ══════════════════════════════════════════════════════

### 6.1 Touch Targets — Minimum 44×44pt

Every interactive element must meet iOS HIG minimum touch target:
```jsx
// Any button/tap target must have at minimum:
style={{ minHeight: 44, minWidth: 44, padding: '10px 12px' }}

// Small icon buttons still need 44px hit area:
<button
  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
>
  <X size={16} />
</button>
```

### 6.2 Fix List Items on Mobile

List items that are too cramped on mobile:
```jsx
// Mobile list item pattern:
<div
  className="flex items-center gap-3 w-full"
  style={{
    padding: '12px 16px',  // Not 8px — 12px minimum
    minHeight: 64,  // Not 44 for content items — 64px
    borderBottom: '1px solid var(--border)',
  }}
>
  <div className="min-w-0 flex-1">
    <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' }}>
      {item.name}
    </p>
    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', marginTop: 2 }}>
      {item.subtitle}
    </p>
  </div>
  <ChevronRight size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
</div>
```

### 6.3 Fix Modal/Sheet Overflow on Mobile

Modals that overflow the screen on small phones:
```jsx
// Every modal/bottom-sheet must have max-height constraints:
<div
  style={{
    maxHeight: 'calc(100dvh - env(safe-area-inset-top, 44px) - env(safe-area-inset-bottom, 34px) - 40px)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  }}
>
```

### 6.4 Fix Tab Bars on Mobile

Tab bars that overflow horizontally on narrow screens:
```jsx
// Tab bar pattern — scrollable on mobile:
<div
  className="flex gap-1 overflow-x-auto"
  style={{
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
    padding: '0 16px 8px',
    flexWrap: 'nowrap',
  }}
>
  {tabs.map(tab => (
    <button
      key={tab.id}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: activeTab === tab.id ? 'var(--accent)' : 'var(--surface)',
        color: activeTab === tab.id ? '#fff' : 'var(--text2)',
        border: `1px solid ${activeTab === tab.id ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### 6.5 Fix Text Overflow on Mobile

All text that overflows on narrow screens:
```jsx
// For titles and names that might be long:
<p
  className="truncate"
  style={{
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    color: 'var(--text)',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }}
>
  {item.name}
</p>

// For description text that should wrap:
<p
  style={{
    fontSize: 'var(--text-sm)',
    color: 'var(--text2)',
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }}
>
  {item.description}
</p>
```

---

## ══════════════════════════════════════════════════════
## TASK 7 — FINAL VERIFICATION CHECKLIST
## ══════════════════════════════════════════════════════

Before committing, verify ALL of the following:

**Character/Text fixes:**
- [ ] Zero instances of `ðŸ`, `â€`, `Ã©`, `Â·` in any string
- [ ] All emoji render correctly in both light and dark themes
- [ ] All medical terms spelled correctly

**Layout fixes:**
- [ ] Content is NOT hidden behind header on iPhone SE (375px width)
- [ ] Content is NOT hidden behind header on iPhone 15 Pro Max (430px width)
- [ ] Bottom content is NOT hidden behind the bottom nav
- [ ] No double scrollbars in any view
- [ ] All views scroll smoothly on iOS (WebkitOverflowScrolling: 'touch')

**Back button:**
- [ ] Every view with a selected item has a Back button
- [ ] Every sub-mode (FSRS review, Match Game, Exam player) has Back/Exit
- [ ] Every specialty guide has back to Home
- [ ] Back buttons use consistent style (BackButton component)

**Crash fixes:**
- [ ] All .map() calls have (array || []) guard
- [ ] All optional chaining on nested property access
- [ ] All views wrapped in ChunkErrorBoundary
- [ ] All views receive settings and addToast props
- [ ] No views show blank/white screen when opened
- [ ] Error fallback shows when view crashes

**Font sizes:**
- [ ] No text smaller than var(--text-xs) = 11px minimum
- [ ] No body copy using font-black (800 weight)
- [ ] Consistent heading hierarchy across all pages
- [ ] Page titles all use the same size (var(--text-lg))

**Mobile UI:**
- [ ] All tap targets are minimum 44×44pt
- [ ] Tab bars scroll horizontally on narrow screens
- [ ] Long text truncates or wraps cleanly
- [ ] Modals don't overflow screen height
- [ ] Floating buttons are above the bottom nav

**Content:**
- [ ] Every specialty guide has real content (not placeholder)
- [ ] Every reference tool has complete tables
- [ ] No "coming soon" or empty placeholder pages

---

## FINAL GIT COMMIT

```bash
git add -A
git commit -m "fix: Comprehensive UI, crash, content, and layout fixes

Corrupted text: Fix all garbled unicode/emoji characters throughout app
Layout: Fix content hidden behind header on mobile (scroll-content padding)
Layout: Fix all double-scroll traps (min-h-0 on all flex containers)
Layout: Fix GlobalTaskIndicator overlapping bottom nav
Z-index: Standardize all z-index layers
Fonts: Add --font-scale CSS variables, standardize text sizes throughout
Fonts: Remove font-black from body copy, enforce weight hierarchy
Back buttons: Add universal BackButton + SectionHeader components
Back buttons: Add back navigation to ALL 79+ views and sub-sections
Crashes: Add || [] guard to all .map() calls in entire codebase
Crashes: Add optional chaining to all nested property access
Crashes: Wrap all views in ChunkErrorBoundary with error fallback
Crashes: Add settings + addToast props to all ViewWrapper calls
Mobile: Fix touch targets to minimum 44px
Mobile: Fix tab bars to scroll horizontally
Mobile: Fix modal height overflow
Mobile: Fix text truncation and wrapping
Content: Expand all 26 specialty guide views with complete clinical content
Content: Add 50 practice questions per specialty guide
Content: Complete LabReferenceView with all normal lab values
Content: Complete ECGInterpreterView with rhythm + ST change reference
Content: Ensure MedicinesView, DiseaseExplorerView, SymptomsView have full data
Content: Add EmptyState component for data-less views"
git push origin main
```

---

*This prompt covers every identified issue in the MARIAM PRO app.*
*Execute every task completely before the git commit.*
*Priority order: Crashes → Back Buttons → Header Overlap → Font Sizes → Content Expansion → Mobile Polish*