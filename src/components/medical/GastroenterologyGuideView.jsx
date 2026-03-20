import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const GI_SECTIONS = [
  { id: 'gibleed', title: 'GI Bleeding', icon: '',
    items: [
      { term: 'Upper GI Bleeding', def: 'Proximal to ligament of Treitz. Hematemesis (bright red or coffee-ground), melena. Causes: peptic ulcer disease (PUD) #1 (40-50%), esophageal/gastric varices, Mallory-Weiss tear, erosive gastritis/esophagitis, Dieulafoy lesion, AVM.', detail: 'Management: resuscitation (2 large-bore IVs, crystalloid, crossmatch, transfuse if Hgb <7 — restrictive strategy per TRIGGER trial). PPI drip (80 mg IV bolus → 8 mg/hr) for PUD. Octreotide + antibiotics (ceftriaxone) if variceal bleed suspected. EGD within 24h (12h if variceal or hemodynamically unstable).', pearl: 'Glasgow-Blatchford Score (GBS): predicts need for intervention. GBS = 0 → safe for outpatient management. Forrest classification (ulcer): Ia/Ib (active bleeding) → 55% rebleed without treatment → endoscopic therapy. IIa (visible vessel) → 43% rebleed → endoscopic therapy. IIb (adherent clot) → consider removing, treat if active bleeding underneath. IIc/III (flat spot/clean base) → <5% rebleed → early discharge. Variceal banding > sclerotherapy. TIPS (transjugular intrahepatic portosystemic shunt) for refractory variceal bleed.' },
      { term: 'Lower GI Bleeding', def: 'Distal to ligament of Treitz. Hematochezia (bright red blood per rectum). Causes: diverticulosis (#1 in elderly), hemorrhoids, colonic AVM/angiodysplasia, colorectal cancer/polyps, IBD, ischemic colitis, infectious colitis, radiation proctitis.', detail: 'Workup: colonoscopy (after bowel prep) is preferred initial diagnostic. If massive/hemodynamically unstable: CTA first (active extravasation), then colonoscopy/angiographic embolization. Tagged RBC scan: sensitive for slow bleeds (0.1-0.4 mL/min) — localize before angiography.', pearl: 'Diverticulosis: 80% of bleeds stop spontaneously. Usually painless, large-volume hematochezia. Right-sided diverticula bleed more often (even though left-sided diverticulosis is more common). Recurrence rate: 25% after first bleed. Angiodysplasia: associated with aortic stenosis (Heyde syndrome — acquired vWF deficiency), CKD, hereditary hemorrhagic telangiectasia (Osler-Weber-Rendu). Ischemic colitis: "watershed areas" (splenic flexure, rectosigmoid). Thumbprinting on CT/X-ray.' },
    ]},
  { id: 'liver', title: 'Liver Disease', icon: '',
    items: [
      { term: 'Cirrhosis & Complications', def: 'End-stage fibrosis from any chronic liver disease. Hepatocellular pattern (↑ AST/ALT): viral hepatitis, MASLD/MASH (formerly NAFLD/NASH), alcohol, autoimmune hepatitis, Wilson\'s, hemochromatosis. Cholestatic pattern (↑ ALP/GGT): PBC (anti-mitochondrial Ab), PSC (MRCP — beading of bile ducts, UC association).', detail: 'Complications: portal HTN (varices, ascites, hepatorenal, hepatopulmonary syndrome), hepatic encephalopathy (HE), coagulopathy, HCC. Child-Pugh (A/B/C) and MELD scores for prognosis/transplant listing.', pearl: 'Ascites: diagnostic paracentesis for new-onset or SBP suspicion. SAAG (Serum-Ascites Albumin Gradient) ≥1.1 = portal HTN. SBP: PMN ≥250/mm³ in ascites fluid → empiric ceftriaxone (or cefotaxime). IV albumin 1.5 g/kg day 1, 1 g/kg day 3 (reduces hepatorenal syndrome mortality per Sort et al.). SBP prophylaxis: norfloxacin or TMP-SMX if prior SBP, ascitic protein <1.5 g/dL + renal dysfunction or liver failure. Hepatic encephalopathy: lactulose (titrate to 2-3 BMs/day) + rifaximin (REDUCE trial — 50% reduction in recurrence).' },
      { term: 'Hepatocellular Carcinoma', def: 'Most common primary liver cancer. Surveillance: ultrasound ± AFP every 6 months in cirrhosis (any cause), chronic HBV (even without cirrhosis in high-risk groups: Asian males >40, Asian females >50, African/Afro-Caribbean >20, family history HCC).', detail: 'Diagnosis: multiphasic CT or MRI — arterial phase enhancement + portal venous/delayed phase washout is diagnostic (LI-RADS 5). Biopsy needed only if imaging indeterminate. Staging: BCLC (Barcelona Clinic Liver Cancer) guides treatment.', pearl: 'Treatment by BCLC stage: Very early/early (single ≤5 cm or ≤3 nodules ≤3 cm): resection, ablation (RFA/MWA), or liver transplant (Milan criteria: single ≤5 cm or ≤3 ≤3 cm — recurrence-free survival >70% at 5 years). Intermediate: TACE (transarterial chemoembolization). Advanced: systemic therapy — atezolizumab + bevacizumab (IMbrave150 — first-line, OS ~19 months), or durvalumab + tremelimumab (HIMALAYA). Sorafenib/lenvatinib as alternatives.' },
    ]},
  { id: 'ibd', title: 'Inflammatory Bowel Disease', icon: '',
    items: [
      { term: 'Crohn\'s Disease', def: 'Transmural inflammation, skip lesions, any GI tract (mouth to anus, most common: terminal ileum/ileocecal). Cobblestone mucosa, non-caseating granulomas (30%). Complications: strictures, fistulae (perianal, enteroenteric, enterovesical), abscesses.', detail: 'Extraintestinal: arthritis (most common, migratory large joints), erythema nodosum, pyoderma gangrenosum, eye (uveitis, episcleritis), PSC (more UC), kidney stones (oxalate from fat malabsorption), gallstones (decreased bile salt reabsorption from ileal disease).', pearl: 'Treatment: 5-ASA (mesalamine) for mild colonic Crohn\'s only (NOT effective for small bowel or moderate-severe). Steroids for induction (budesonide for ileal/right colon, prednisone for moderate-severe) — NOT for maintenance. Immunomodulators: thiopurines (azathioprine/6-MP), methotrexate. Biologics: anti-TNF (infliximab, adalimumab — mucosal healing), vedolizumab (gut-selective anti-α4β7 integrin), ustekinumab (anti-IL-12/23), risankizumab (anti-IL-23 — ADVANCE/MOTIVATE trials). Small molecules: upadacitinib (JAK inhibitor). Top-down approach (early biologic) increasingly favored for moderate-severe.' },
      { term: 'Ulcerative Colitis', def: 'Mucosal/submucosal inflammation, continuous from rectum proximally. Bloody diarrhea, urgency, tenesmus. Pseudopolyps. No skip lesions, no transmural involvement (usually). Toxic megacolon: colonic dilation >6 cm + systemic toxicity.', detail: 'PSC association (3-8% of UC) → increased risk of cholangiocarcinoma. Colorectal cancer risk increases with disease duration/extent — annual surveillance colonoscopy starting 8 years after diagnosis. Proctocolectomy with IPAA (ileal pouch-anal anastomosis) is curative.', pearl: 'Treatment: 5-ASA (mesalamine, sulfasalazine) — first-line for mild-moderate (oral + topical rectal). Biologics same as Crohn\'s + tofacitinib (JAK inhibitor — approved for UC before Crohn\'s). Ozanimod (S1P receptor modulator — TRUE NORTH trial). Acute severe UC (>6 bloody stools/day + systemic toxicity): IV methylprednisolone. No improvement in 3 days → rescue therapy with infliximab or cyclosporine. Surgery if medical therapy fails. Toxic megacolon: NPO, NG decompression, IV steroids, broad-spectrum antibiotics, serial abdominal X-rays, surgical consult (colectomy if no improvement in 48-72h or perforation).' },
    ]},
  { id: 'pancreas', title: 'Pancreatitis', icon: '',
    items: [
      { term: 'Acute Pancreatitis', def: '2 of 3: (1) epigastric pain radiating to back, (2) lipase >3× ULN, (3) imaging findings. Causes: gallstones (#1, 40%) and alcohol (#2, 30%). Others: hypertriglyceridemia (>1000), drugs (azathioprine, valproate, GLP-1 agonists), ERCP, trauma, autoimmune, pancreatic divisum.', detail: 'Severity: Revised Atlanta Classification — mild (no organ failure, no local complications), moderately severe (transient organ failure <48h or local complications), severe (persistent organ failure >48h — mortality 30-50%). Predict severity: BISAP score, APACHE-II, CRP at 48h (>150 = severe).', pearl: 'Management: aggressive IV fluid resuscitation (lactated Ringer\'s preferred, 1.5 mL/kg/hr initially — goal-directed, new data suggests moderate resuscitation may be sufficient per WATERFALL trial), pain control (IV opioids), NPO → early oral feeding when tolerated (within 24h if mild — don\'t wait for lipase to normalize!). NO prophylactic antibiotics. Infected necrotizing pancreatitis: step-up approach → percutaneous drainage first, then minimally invasive surgical necrosectomy if needed (PANTER, TENSION trials). Cholecystectomy before discharge for gallstone pancreatitis (to prevent recurrence).' },
      { term: 'Chronic Pancreatitis', def: 'Irreversible fibrosis and loss of exocrine/endocrine function. Alcohol #1 cause. Chronic epigastric pain. Late complications: pancreatic exocrine insufficiency (steatorrhea, fat-soluble vitamin deficiency), diabetes (type 3c), pseudocysts, pancreatic duct strictures/stones.', detail: 'Diagnosis: CT (calcifications, ductal dilation, atrophy). MRCP/EUS for early disease. Fecal elastase-1 <200 = exocrine insufficiency. Treatment: pain management (stepladder approach — avoid opioid dependence), pancreatic enzyme replacement therapy (PERT with meals — lipase 40,000-50,000 IU per meal), fat-soluble vitamins (A, D, E, K), diabetes management.', pearl: 'Pancreatic cancer risk: chronic pancreatitis increases risk ~10-15× over general population. Screening: not standardized, but clinical vigilance (unexplained weight loss, new diabetes in chronic pancreatitis patient, worsening pain pattern). Autoimmune pancreatitis (AIP): Type 1 (IgG4-related — multisystem, elevated IgG4, sausage-shaped pancreas on imaging) responds dramatically to steroids. Type 2 (idiopathic duct-centric, associated with UC) — steroids also effective. Must distinguish from pancreatic cancer (imaging overlap).' },
    ]},
];

export default function GastroenterologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = GI_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Gastroenterology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">GI bleeding, liver disease, IBD & pancreatitis</p>
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
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#f5920808', border: '1px solid #f5920820', color: '#f59208' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GI_SECTIONS.map(s => (
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
