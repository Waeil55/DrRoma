import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const PATHOLOGY_DATA = [
  { id: 'neoplasia', title: 'Neoplasia Basics', icon: '',
    items: [
      { term: 'Dysplasia', def: 'Disordered growth with loss of uniformity. Preneoplastic but potentially reversible. NOT cancer yet.', detail: 'Loss of polarity, ↑ mitoses, nuclear pleomorphism, ↑ N:C ratio. Confined to basement membrane.', pearl: 'CIN (cervical intraepithelial neoplasia) = classic example of graded dysplasia → carcinoma in situ → invasive.' },
      { term: 'Carcinoma in situ (CIS)', def: 'Full-thickness dysplasia confined above basement membrane. Pre-invasive malignancy.', detail: 'No stromal invasion = no metastatic potential. Basement membrane intact.', pearl: 'CIS of cervix (CIN III) treated with excision/LEEP. Ductal CIS (DCIS) of breast → risk of invasive ductal carcinoma.' },
      { term: 'Metaplasia', def: 'Reversible replacement of one mature cell type by another. Adaptive response to stress.', detail: 'Barrett esophagus: squamous → columnar (intestinal) metaplasia from GERD. Smoker bronchus: columnar → squamous metaplasia.', pearl: 'Metaplasia is REVERSIBLE if stimulus removed. But if persistent → dysplasia → neoplasia.' },
      { term: 'Anaplasia', def: 'Lack of differentiation (undifferentiated). Hallmark of malignancy.', detail: 'Bizarre giant cells, tumor giant cells, abnormal mitoses, marked pleomorphism, N:C ratio approaches 1:1.', pearl: 'More anaplastic = higher grade = worse prognosis. Exception: seminoma is well-differentiated but still malignant.' },
      { term: 'Grading vs Staging', def: 'Grade = differentiation (how abnormal cells look). Stage = spread (how far).', detail: 'Grade: G1 well-diff, G2 moderate, G3 poor, G4 undifferentiated. Stage: TNM (Tumor size, Nodes, Metastasis).', pearl: 'Staging is the BEST predictor of prognosis, more important than grade.' },
    ]},
  { id: 'histo', title: 'Classic Histopathology Findings', icon: '',
    items: [
      { term: 'Reed-Sternberg cells', def: 'Owl-eye bilobed giant cells. Pathognomonic for Hodgkin lymphoma.', detail: 'CD15+, CD30+, CD20−. "Lacunar" variant = Nodular sclerosis subtype (most common).', pearl: 'RS cells are only ~1% of tumor mass. Background reactive cells (lymphocytes, eosinophils, plasma cells) make up the bulk.' },
      { term: 'Auer rods', def: 'Needle-shaped cytoplasmic inclusions in myeloblasts. Pathognomonic for AML (acute myeloid leukemia).', detail: 'Fused azurophilic granules. Especially prominent in APL (AML M3) = "faggot cells" (bundles of Auer rods).', pearl: 'APL (t(15;17) PML-RARA): medical emergency → DIC. Treat with ATRA + arsenic trioxide.' },
      { term: 'Psammoma bodies', def: 'Concentric laminated calcifications. Classic associations: Papillary thyroid ca, Meningioma, Papillary serous ovarian/endometrial ca, Mesothelioma.', detail: 'Mnemonic: PSaMMoma → Papillary (thyroid), Serous (ovarian), Meningioma, Mesothelioma.', pearl: 'If you see psammoma bodies on a biopsy from thyroid → think papillary carcinoma (most common thyroid cancer).' },
      { term: 'Call-Exner bodies', def: 'Rosette-like structures with central eosinophilic material. Pathognomonic for Granulosa cell tumor (ovary).', detail: 'Granulosa cells arranged around pink material resembling immature follicles.', pearl: 'Granulosa cell tumor = most common estrogen-secreting ovarian tumor. Can cause precocious puberty, endometrial hyperplasia.' },
      { term: 'Orphan Annie eyes (ground glass nuclei)', def: 'Empty-appearing nuclei with peripheral chromatin. Classic for Papillary thyroid carcinoma.', detail: 'Also see: nuclear grooves, intranuclear pseudoinclusions, and psammoma bodies.', pearl: 'Papillary thyroid ca has EXCELLENT prognosis even with lymph node mets. RET/PTC rearrangement or BRAF V600E mutation.' },
      { term: 'Signet ring cells', def: 'Mucin-filled cells displacing nucleus to periphery. Poorly differentiated adenocarcinoma.', detail: 'Krukenberg tumor: signet ring gastric cancer metastatic to ovaries (bilateral). Linitis plastica = "leather bottle" stomach.', pearl: 'Signet ring = diffuse type (Lauren classification). Associated with CDH1 mutations (hereditary diffuse gastric cancer).' },
      { term: 'Birbeck granules', def: 'Tennis racquet-shaped organelles on EM. Pathognomonic for Langerhans cell histiocytosis (LCH).', detail: 'LCH cells are CD1a+ and S100+. Pentalaminar rod shape on electron microscopy.', pearl: 'LCH spectrum: Letterer-Siwe (disseminated, infants), Hand-Schüller-Christian (triad: skull lesions, DI, exophthalmos), Eosinophilic granuloma (localized bone).' },
      { term: 'Crescents on glomerular biopsy', def: 'Crescentic (RPGN) = rapidly progressive glomerulonephritis. Cellular crescents = proliferating parietal epithelial cells + macrophages in Bowman space.', detail: 'Type I: Anti-GBM (Goodpasture). Type II: Immune complex (SLE, IgA, post-strep). Type III: Pauci-immune (ANCA: GPA, MPA, EGPA).', pearl: 'Crescents = "broken" glomeruli → medical emergency. If >50% glomeruli affected, prognosis poor without aggressive immunosuppression.' },
    ]},
  { id: 'inflammation', title: 'Inflammation & Repair', icon: '',
    items: [
      { term: 'Granulomatous inflammation', def: 'Collection of activated macrophages (epithelioid cells) ± giant cells. Response to persistent stimuli.', detail: 'Caseating: TB, fungi (histo, coccidio). Non-caseating: Sarcoidosis, Crohn disease, Berylliosis, Cat scratch (Bartonella).', pearl: 'Sarcoid = non-caseating granulomas + ↑ ACE + ↑ Ca²⁺ + bilateral hilar LAD. TB = caseating + AFB+ on Ziehl-Neelsen stain.' },
      { term: 'Amyloidosis', def: 'Extracellular deposition of misfolded fibrillar protein. Congo red stain → apple-green birefringence under polarized light.', detail: 'AL (light chain): multiple myeloma, plasma cell disorders. AA (serum amyloid A): chronic inflammatory states (RA, IBD, FMF). ATTR: transthyretin (familial or senile cardiac).', pearl: 'AL amyloid: nephrotic syndrome, restrictive CMP, macroglossia, periorbital purpura (raccoon eyes), carpal tunnel. Treat underlying myeloma.' },
      { term: 'Fibrinoid necrosis', def: 'Deposition of fibrin-like, eosinophilic material in vessel walls. Vasculitis, malignant HTN, preeclampsia.', detail: 'Seen in: PAN (polyarteritis nodosa), hyperacute transplant rejection, Arthus reaction, immune complex deposition.', pearl: 'If you see fibrinoid necrosis of vessel walls → think vasculitis. PAN spares lungs/glomeruli, affects renal arteries.' },
      { term: 'Coagulative necrosis', def: 'Cell death with preserved tissue architecture (ghost outlines). Most common. All organs except brain.', detail: 'Caused by ischemia (infarction). Proteins denatured → structure maintained. Eventually replaced by fibrosis.', pearl: 'Brain = liquefactive necrosis (enzymatic). Lung = can be either. TB = caseous (cheesy). Fat necrosis = pancreas (saponification).' },
      { term: 'Apoptosis', def: 'Programmed cell death. Energy-dependent. Single cell "drops out" without inflammation.', detail: 'Intrinsic pathway: mitochondrial (Bax/Bak → cytochrome c → caspase 9). Extrinsic pathway: Fas/FasL, TNF → caspase 8. Both → executioner caspases 3,6,7.', pearl: 'Bodies: Councilman (liver in viral hepatitis/yellow fever), Civatte (lichen planus), apoptotic bodies. Cancer evades apoptosis (Bcl-2 overexpression in follicular lymphoma t(14;18)).' },
    ]},
  { id: 'stains', title: 'Special Stains & IHC', icon: '',
    items: [
      { term: 'Congo Red', def: 'Amyloid → apple-green birefringence under polarized light.', detail: '', pearl: 'Gold standard for amyloid detection. Biopsy sites: abdominal fat pad, rectal mucosa, or affected organ.' },
      { term: 'PAS (Periodic Acid-Schiff)', def: 'Stains glycogen + basement membranes magenta/pink.', detail: 'Positive: Whipple disease (PAS+ macrophages), fungal cell walls, Ewing sarcoma (glycogen), renal BM (diabetic nephropathy).', pearl: 'PAS-D (diastase resistant): Whipple bacteria persist after diastase digestion. Glycogen is PAS+ but PAS-D negative.' },
      { term: 'Prussian Blue', def: 'Stains iron (hemosiderin) blue.', detail: 'Used in: hemochromatosis (liver/pancreas), sideroblastic anemia (ringed sideroblasts in bone marrow), hemosiderosis.', pearl: 'Ringed sideroblasts: iron-laden mitochondria around nucleus in erythroblasts. MDS with ring sideroblasts = SF3B1 mutation.' },
      { term: 'Ziehl-Neelsen (AFB)', def: 'Acid-fast bacilli stain red. Mycobacteria (TB, MAC), Nocardia (partially acid-fast).', detail: 'Mycobacterial cell wall: mycolic acid → resists decolorization by acid-alcohol.', pearl: 'Modified ZN (weaker acid): Nocardia, Cryptosporidium. Auramine-rhodamine (fluorescent) is more sensitive for screening.' },
      { term: 'GMS (Grocott Methenamine Silver)', def: 'Fungal cell walls stain black against green background.', detail: 'Best stain for Pneumocystis jirovecii (PJP), also excellent for other fungi.', pearl: 'PJP: ground-glass opacities on CT, ↑ LDH, ↑ β-glucan, CD4 <200 in HIV. Treat: TMP-SMX + steroids if PaO₂ <70.' },
      { term: 'CD markers (IHC)', def: 'Immunohistochemistry panel for lymphoma/leukemia classification.', detail: 'B cells: CD19, CD20, CD79a. T cells: CD3, CD4/CD8, CD5. Myeloid: CD13, CD33, MPO. NK: CD16, CD56. Stem cells: CD34, TdT.', pearl: 'CLL/SLL: CD5+, CD23+, CD20 (dim). Mantle cell: CD5+, CD23−, cyclin D1+ (t(11;14)). Follicular: CD10+, Bcl-2+ (t(14;18)). Burkitt: CD10+, Ki-67 ~100%.' },
    ]},
];

export default function PathologyQuickRefView() {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const active = PATHOLOGY_DATA.find(s => s.id === activeId);
  const allItems = PATHOLOGY_DATA.flatMap(s => s.items.map(item => ({ ...item, section: s.title })));
  const filtered = search ? allItems.filter(i => (i.term + ' ' + i.def + ' ' + i.detail + ' ' + i.pearl).toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Pathology Quick Ref</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pathology terms…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none mt-3"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {search ? (
          filtered.length > 0 ? filtered.map((item, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-2" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black">{item.term}</h3>
                <span className="px-2 py-0.5 rounded-lg text-xs opacity-40 shrink-0">{item.section}</span>
              </div>
              <p className="text-sm opacity-70">{item.def}</p>
              {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
              {item.pearl && <div className="flex items-start gap-2 text-xs" style={{ color: '#f59e0b' }}><span></span><span className="leading-relaxed">{item.pearl}</span></div>}
            </div>
          )) : <div className="empty-state py-12"><p className="font-black mt-4">No results</p></div>
        ) : active ? (
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PATHOLOGY_DATA.map(s => (
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
