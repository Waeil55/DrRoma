import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const RESEARCH_SECTIONS = [
  { id: 'designs', title: 'Study Designs', icon: '',
    items: [
      { term: 'Randomized Controlled Trial (RCT)', def: 'Gold standard for determining causality. Random assignment to treatment vs control. Double-blinding reduces bias.', detail: 'Intention-to-treat (ITT): analyze by assigned group regardless of compliance (preserves randomization, more conservative). Per-protocol: analyze only compliant participants (may overestimate effect).', pearl: 'Crossover RCT: each participant serves as own control (two periods) — reduces confounding, needs fewer subjects. Washout period between. Cluster RCT: randomize groups (hospitals, clinics) instead of individuals — used when individual randomization is impractical.' },
      { term: 'Cohort Study', def: 'Observe exposed vs unexposed groups over time → measure outcomes. Prospective (follow forward) or retrospective (use existing records). Measure: Relative Risk (RR).', detail: 'Prospective: expensive, time-consuming, but strong temporal relationship. Retrospective: faster, cheaper, but limited by data quality. RR = incidence in exposed / incidence in unexposed. RR >1 = risk factor, <1 = protective.', pearl: 'Framingham Heart Study = classic prospective cohort. Best for rare exposures (recruit exposed group). NOT good for rare diseases (need huge sample). Attrition bias is major weakness of prospective cohorts.' },
      { term: 'Case-Control Study', def: 'Start with disease (cases) vs no disease (controls) → look back for exposure. Retrospective. Measure: Odds Ratio (OR).', detail: 'Efficient for rare diseases (start with cases). Cannot calculate incidence or RR directly. OR approximates RR when disease is rare (<10%).', pearl: 'Nested case-control: cases and controls selected within an existing cohort — combines advantages of both designs. Recall bias is the cardinal weakness (cases remember exposures differently than controls). Selection of appropriate controls is the most critical methodologic challenge.' },
      { term: 'Cross-Sectional Study', def: 'Snapshot in time — measure exposure and disease simultaneously. "Prevalence study." Cannot establish temporal relationship.', detail: 'Good for: prevalence estimation, hypothesis generation, planning health services. Cheap and quick. Measure: Prevalence, OR (not RR). Cannot determine causation.', pearl: 'NHANES = classic cross-sectional survey. Prevalence bias: overrepresents conditions with longer duration (chronic diseases overrepresented vs acute diseases that resolve quickly).' },
      { term: 'Meta-Analysis / Systematic Review', def: 'Systematic review: comprehensive search + critical appraisal of all studies. Meta-analysis: statistical pooling of results. Highest level of evidence (when includes RCTs).', detail: 'Forest plot: individual study effects + pooled estimate (diamond). Heterogeneity: I² statistic (>50% = substantial heterogeneity). Fixed-effects (assume common true effect) vs random-effects (assume distribution of effects).', pearl: 'Funnel plot: detects publication bias (asymmetry suggests missing small negative studies). GRADE system: rates quality of evidence (high → moderate → low → very low). Cochrane Collaboration = gold standard for systematic reviews.' },
      { term: 'Case Report / Case Series', def: 'Detailed description of unusual cases. No control group, no hypothesis testing. Lowest level of evidence but important for: new diseases, rare presentations, adverse drug reactions.', detail: 'Case series: collection of similar cases. Can suggest new hypotheses. Cannot establish causation, prevalence, or incidence.', pearl: 'AIDS was first identified through a case series (5 young men with PCP in LA, 1981). Case reports remain vital for pharmacovigilance (new drug side effects) and identifying emerging infectious diseases.' },
    ]},
  { id: 'bias', title: 'Bias & Confounding', icon: '',
    items: [
      { term: 'Selection Bias', def: 'Systematic error in how participants are selected or retained. Study sample does not represent target population.', detail: 'Berkson bias: hospital-based cases have different exposure pattern than general population. Healthy worker effect: employed people are healthier than general population. Volunteer bias: participants differ from non-participants. Attrition/loss to follow-up: drop-outs differ from completers.', pearl: 'Randomization is the best way to reduce selection bias in interventional studies. For observational studies: clearly defined inclusion/exclusion criteria, population-based sampling, adequate follow-up rates (>80%).' },
      { term: 'Information (Measurement) Bias', def: 'Systematic error in how exposure or outcome is measured or classified.', detail: 'Recall bias: differential memory of exposures (case-control studies). Observer bias: knowledge of exposure influences outcome assessment. Misclassification: non-differential (random → biases toward null/no effect) vs differential (systematic → can bias in either direction).', pearl: 'Blinding reduces observer bias. Standardized measurement tools reduce measurement bias. Non-differential misclassification is "conservative" — it makes you LESS likely to find an association that exists.' },
      { term: 'Confounding', def: 'A third variable is associated with BOTH the exposure and outcome, distorting the true relationship. NOT on the causal pathway.', detail: 'Control methods: Randomization (best), Restriction, Matching, Stratification (Mantel-Haenszel), Multivariable regression, Propensity scores.', pearl: 'Simpson Paradox: a trend that appears in several different groups reverses when groups are combined (confounding by the grouping variable). Age and sex are the two most common confounders in medical research.' },
      { term: 'Lead-Time Bias', def: 'Screening detects disease earlier → appears to increase survival time even if treatment doesn\'t change outcome. The patient simply KNOWS longer.', detail: 'Control: use mortality rate (not survival time) as the outcome. Or use randomized screening trial comparing screened vs unscreened groups.', pearl: 'Lead-time bias is the #1 pitfall in evaluating cancer screening programs. Just because 5-year survival improves with screening does NOT mean people live longer — they may just be diagnosed earlier without any true benefit.' },
      { term: 'Length-Time Bias', def: 'Screening preferentially detects slower-growing, less aggressive tumors (they have a longer preclinical phase, so more likely to be caught at screening).', detail: 'Aggressive tumors present between screenings (interval cancers). Screened tumors appear to have better prognosis simply because they are inherently less aggressive.', pearl: 'To truly demonstrate screening benefit: need to show reduction in DISEASE-SPECIFIC MORTALITY in an RCT (randomized to screening vs no screening). Example: mammography screening has shown mortality reduction in RCTs.' },
    ]},
  { id: 'biostats', title: 'Biostatistics', icon: '',
    items: [
      { term: 'Sensitivity / Specificity', def: 'Sensitivity (Sn): true positive rate = TP/(TP+FN). "SnNOut" — Sensitive test, Negative result rules OUT disease. Specificity (Sp): true negative rate = TN/(TN+FP). "SpPIn" — Specific test, Positive result rules IN disease.', detail: 'Sensitivity and specificity are intrinsic properties of the test (do not change with prevalence). Trade-off: increasing sensitivity usually decreases specificity and vice versa (ROC curve).', pearl: 'Use HIGH SENSITIVITY test for screening (don\'t miss disease). Use HIGH SPECIFICITY test for confirmation (don\'t falsely diagnose). Troponin = high sensitivity for MI (screening). Western blot = high specificity for HIV (confirmatory).' },
      { term: 'PPV / NPV', def: 'PPV: probability of disease given a positive test = TP/(TP+FP). NPV: probability of no disease given a negative test = TN/(TN+FN).', detail: 'PPV and NPV CHANGE with prevalence. As prevalence ↑: PPV ↑, NPV ↓. As prevalence ↓: PPV ↓, NPV ↑. In very low prevalence: even a highly specific test will have many false positives (low PPV).', pearl: 'This is why you don\'t screen the general population for rare diseases (low prevalence → low PPV → too many false positives). Pre-test probability (clinical gestalt) is essentially prevalence for an individual patient — Bayesian reasoning.' },
      { term: 'P-value', def: 'Probability of observing the result (or more extreme) IF the null hypothesis is true. P <0.05 = "statistically significant" (by convention). Does NOT measure the probability the hypothesis is true.', detail: 'P-value depends on: effect size, sample size, and variability. A very large study can find a tiny, clinically meaningless difference "statistically significant." Conversely, a small study may miss a real difference (underpowered).', pearl: 'Statistical significance ≠ clinical significance. Always look at the effect SIZE (absolute risk reduction, NNT, confidence interval) — not just the p-value. P <0.05 was not handed down from God — it\'s an arbitrary threshold (Fisher, 1925).' },
      { term: 'Confidence Interval', def: '95% CI: if we repeated the study 100 times, ~95 of the CIs would contain the true population parameter. The range of plausible values for the true effect.', detail: 'If 95% CI for RR/OR includes 1.0 → not statistically significant. If 95% CI for mean difference includes 0 → not significant. Wider CI = more uncertainty (small sample, high variance).', pearl: 'CI is MORE informative than p-value: it tells you both significance AND precision of the estimate. A study with RR = 2.0, 95% CI [1.1, 3.6] is significant but imprecise. RR = 1.5, 95% CI [1.3, 1.7] is more precise and more clinically useful.' },
      { term: 'NNT / NNH', def: 'Number Needed to Treat: number of patients you need to treat to prevent one bad outcome = 1/ARR (absolute risk reduction). Number Needed to Harm: 1/ARI.', detail: 'ARR = control event rate - treatment event rate (absolute difference). RRR = relative risk reduction = ARR/control rate. NNT = 1/ARR. Lower NNT = more effective treatment.', pearl: 'Relative risk reduction (RRR) sounds more impressive than absolute. "Drug X reduces heart attacks by 50%!" (RRR = 50%, but if baseline risk is 2%, ARR = 1%, NNT = 100 → need to treat 100 patients to prevent one event). Always report ARR and NNT alongside RRR.' },
      { term: 'Type I and Type II Errors', def: 'Type I (α): reject null when null is TRUE = false positive ("convict an innocent"). Typically α = 0.05. Type II (β): fail to reject null when null is FALSE = false negative ("acquit a guilty"). Power = 1-β.', detail: 'Power: probability of detecting a true effect if it exists. Standard target: ≥80% (β ≤ 0.20). Factors increasing power: larger sample size, larger effect size, higher alpha, lower variability.', pearl: 'Type I error is controlled by α level (0.05). Type II error is controlled by power analysis (sample size calculation BEFORE the study). A "negative" study (P >0.05) may be underpowered — check the power. Bonferroni correction: when doing multiple comparisons, adjust α (divide 0.05 by number of comparisons) to control overall Type I error.' },
      { term: 'Likelihood Ratios', def: 'LR+: how much more likely a positive test is in someone WITH disease vs WITHOUT. LR+ = Sensitivity / (1-Specificity). LR−: how much more likely a negative test is in someone WITH disease vs WITHOUT. LR− = (1-Sensitivity) / Specificity.', detail: 'LR+ >10 = very helpful positive test. LR− <0.1 = very helpful negative test. LR = 1 = useless test. Used with pre-test odds → post-test odds (Fagan nomogram).', pearl: 'Post-test odds = Pre-test odds × LR. Convert: Odds = Probability/(1-Probability). LRs are independent of prevalence (unlike PPV/NPV), making them more useful across different clinical settings. Most useful when prevalence is intermediate (neither very high nor very low).' },
    ]},
];

export default function ResearchMethodsView() {
  const [activeId, setActiveId] = useState(null);
  const active = RESEARCH_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Research Methods</h2>
        <p className="text-xs opacity-40 mt-0.5">Study designs, bias & biostatistics</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>
            {active.items.map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-2" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black" style={{ color: 'var(--accent)' }}>{item.term}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#3b82f608', border: '1px solid #3b82f620', color: '#3b82f6' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESEARCH_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-xs opacity-40 mt-1">{s.items.length} topics</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
