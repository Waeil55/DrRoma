import { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';

const MICRO_DATA = [
  { cat: 'Gram-Positive Cocci', icon: '', organisms: [
    { name: 'Staphylococcus aureus', gram: 'GPC in clusters', catalase: '+', coagulase: '+',
      diseases: 'Skin infections (abscess, cellulitis, impetigo), bacteremia, endocarditis (acute), osteomyelitis, septic arthritis, pneumonia (post-influenza), TSS, food poisoning (preformed toxin)',
      key: 'MRSA: mecA gene  altered PBP2a. Treat MRSA: Vancomycin, daptomycin, linezolid, TMP-SMX (skin). MSSA: Nafcillin/oxacillin (DOC).',
      virulence: 'Protein A (binds Fc of IgG), coagulase, hemolysins, TSST-1 (superantigen  TSS), PVL (necrotizing pneumonia), enterotoxins (food poisoning)' },
    { name: 'Streptococcus pyogenes (GAS)', gram: 'GPC in chains', catalase: '', coagulase: 'N/A',
      diseases: 'Pharyngitis, scarlet fever, impetigo, cellulitis/erysipelas, necrotizing fasciitis, rheumatic fever, post-strep GN, TSS',
      key: 'Bacitracin sensitive, PYR+. -hemolytic, Lancefield Group A. Treat: Penicillin (never resistant). Add clindamycin for invasive (toxin suppression).',
      virulence: 'M protein (anti-phagocytic, molecular mimicry  rheumatic fever), streptolysin O (ASO titers), hyaluronidase, streptokinase, SPE (superantigen  scarlet fever/TSS)' },
    { name: 'Streptococcus pneumoniae', gram: 'GPC in lancet-shaped diplococci', catalase: '', coagulase: 'N/A',
      diseases: '#1 bacterial meningitis (adults), #1 CAP, otitis media (children), sinusitis. Asplenic patients at very high risk.',
      key: 'Optochin sensitive, bile soluble, -hemolytic. Quellung reaction (+). Polysaccharide capsule is major virulence factor.',
      virulence: 'Polysaccharide capsule (#1 virulence), IgA protease, pneumolysin (O-labile hemolysin), autolysin (releases cell wall  intense inflammatory response)' },
    { name: 'Enterococcus (faecalis, faecium)', gram: 'GPC in chains/pairs', catalase: '', coagulase: 'N/A',
      diseases: 'UTI, biliary infections, bacteremia, endocarditis (subacute), intra-abdominal infections. Hospital-acquired, often resistant.',
      key: '-hemolytic (non-hemolytic), PYR+. Can grow in 6.5% NaCl + bile esculin+. VRE: treat with linezolid or daptomycin. E. faecium more resistant than E. faecalis.',
      virulence: 'Intrinsic low-level aminoglycoside resistance. Can acquire vanA/vanB  VRE. Biofilm formation.' },
  ]},
  { cat: 'Gram-Negative Rods', icon: '', organisms: [
    { name: 'Escherichia coli', gram: 'GNR', catalase: '+', coagulase: 'N/A',
      diseases: '#1 cause of UTI, #1 cause of gram-negative sepsis, neonatal meningitis (K1 capsule), traveler\'s diarrhea (ETEC), hemolytic uremic syndrome (EHEC O157:H7)',
      key: 'Lactose fermenter (pink on MacConkey). ESBL-producing: treat with carbapenems. EHEC: DO NOT give antibiotics   HUS risk.',
      virulence: 'Pili (adhesion, P pili for pyelonephritis), K capsule, LPS/endotoxin, Shiga-like toxin (EHEC  HUS), heat-labile/heat-stable toxins (ETEC)' },
    { name: 'Klebsiella pneumoniae', gram: 'GNR (encapsulated, mucoid)', catalase: '+', coagulase: 'N/A',
      diseases: 'Pneumonia (aspiration, thick "currant jelly" sputum, cavitation in upper lobes), UTI, liver abscess (K1 hypervirulent strain in Asian populations), nosocomial infections',
      key: 'Lactose fermenter, large mucoid colonies. Prominent polysaccharide capsule. KPC (Klebsiella pneumoniae carbapenemase) = major MDR threat.',
      virulence: 'Thick polysaccharide capsule  anti-phagocytic, mucoid colonies. Risk factors: alcoholism, diabetes, hospitalization.' },
    { name: 'Pseudomonas aeruginosa', gram: 'GNR (non-lactose fermenter)', catalase: '+', coagulase: 'N/A',
      diseases: 'Burn wound infections, CF lung infections (mucoid), otitis externa ("swimmer\'s ear"), hot tub folliculitis, nosocomial pneumonia/UTI/bacteremia, ecthyma gangrenosum',
      key: 'Oxidase+, obligate aerobe, fruity grape-like odor, blue-green pigment (pyocyanin + pyoverdin). Treat: anti-pseudomonal (piperacillin-tazobactam, cefepime, meropenem, ciprofloxacin).',
      virulence: 'Exotoxin A (EF-2 inactivation, like diphtheria toxin), biofilm (CF lungs), alginate (mucoid CF strains), pyocyanin (generates ROS), elastase, phospholipase C' },
    { name: 'Neisseria meningitidis', gram: 'GN diplococci (kidney-shaped)', catalase: '+', coagulase: 'N/A',
      diseases: 'Meningitis (children/young adults, petechial rash  purpura fulminans), meningococcemia (DIC, Waterhouse-Friderichsen = bilateral adrenal hemorrhage)',
      key: 'Maltose+ and glucose+ fermenter (unlike N. gonorrhoeae which is glucose only). Capsular serotypes: A, B, C, W, Y. Vaccine: MenACWY (required for college dorms), MenB.',
      virulence: 'Polysaccharide capsule (serogroup B = poorly immunogenic  sialylated), LPS/endotoxin ( DIC, shock), IgA protease, pili' },
  ]},
  { cat: 'Anaerobes', icon: '', organisms: [
    { name: 'Clostridium difficile', gram: 'GPR (anaerobic, spore-forming)', catalase: '', coagulase: 'N/A',
      diseases: 'Antibiotic-associated colitis (pseudomembranous colitis). "Yellow volcano-like" pseudomembranes on colonoscopy.',
      key: 'Toxin A (enterotoxin) + Toxin B (cytotoxin). Diagnose: Stool PCR or GDH + toxin EIA. Treat: Oral vancomycin (125 mg QID) for initial episode or fidaxomicin (preferred for recurrence). Stop offending antibiotic.',
      virulence: 'Spores survive in environment  nosocomial transmission. Toxins inactivate Rho GTPases  actin depolymerization  cell death. Risk: antibiotics (clindamycin, FQs, cephalosporins), PPI use, hospitalization, age >65.' },
    { name: 'Bacteroides fragilis', gram: 'GNR (anaerobic)', catalase: 'Variable', coagulase: 'N/A',
      diseases: 'Intra-abdominal infections (peritonitis, abscess), often polymicrobial. Most common anaerobic isolate in clinical specimens.',
      key: 'Resistant to penicillin (-lactamase). Treat: Metronidazole, carbapenems, piperacillin-tazobactam, ampicillin-sulbactam.',
      virulence: 'Capsular polysaccharide (promotes abscess formation), -lactamase production. LPS is less toxic than other GNR.' },
    { name: 'Clostridium botulinum', gram: 'GPR (anaerobic, spore-forming)', catalase: '', coagulase: 'N/A',
      diseases: 'Botulism: descending flaccid paralysis. Adult (contaminated food), infantile (honey  spores  in-vivo toxin), wound.',
      key: 'Botulinum toxin: blocks ACh release at NMJ (cleaves SNARE proteins). Descending paralysis: cranial nerves first (diplopia, dysphagia, dysarthria)  respiratory failure. Treat: antitoxin (adult) + supportive care. Infant: BIG-IV (human Ig).',
      virulence: 'Most potent biological toxin known. Heat-labile (toxin destroyed by cooking). Spores are heat-resistant.' },
  ]},
  { cat: 'Fungi', icon: '', organisms: [
    { name: 'Candida albicans', gram: 'Yeast (GPC-sized)', catalase: 'N/A', coagulase: 'N/A',
      diseases: 'Oral thrush, vulvovaginal candidiasis, esophageal candidiasis (AIDS-defining, CD4 <100-200), candidemia, endocarditis (IVDU)',
      key: 'Germ tube test (+). Pseudohyphae at 37°C. Risk: immunosuppression, antibiotics, diabetes, steroids. Treat: Fluconazole (mucosal), echinocandin (invasive), amphotericin B (salvage).',
      virulence: 'Morphologic switching (yeast  hyphae), biofilm formation on catheters, adhesins' },
    { name: 'Aspergillus fumigatus', gram: 'Mold (septate hyphae, 45° branching)', catalase: 'N/A', coagulase: 'N/A',
      diseases: 'Allergic bronchopulmonary aspergillosis (ABPA) in asthmatics/CF, aspergilloma ("fungus ball" in pre-existing cavity), invasive aspergillosis (neutropenic patients  angioinvasive, high mortality)',
      key: 'Septate hyphae with acute (45°) angle branching (vs. Mucor: wide-angle 90°, non-septate). Diagnose: galactomannan antigen (serum), -glucan, CT halo sign. Treat: Voriconazole (DOC for invasive).',
      virulence: 'Angioinvasion  hemorrhagic infarction. Aflatoxins (A. flavus  hepatocellular carcinoma).' },
    { name: 'Cryptococcus neoformans', gram: 'Yeast (heavily encapsulated)', catalase: 'N/A', coagulase: 'N/A',
      diseases: 'Cryptococcal meningitis (AIDS-defining, CD4 <100). Subacute headache,  ICP. Found in pigeon droppings.',
      key: 'India ink: clear halo around yeast (capsule). Latex agglutination for capsular antigen in CSF (most sensitive). Mucicarmine stain: red capsule. Treat: Amphotericin B + flucytosine (induction 2w)  fluconazole (consolidation/maintenance).',
      virulence: 'Thick polysaccharide capsule (inhibits phagocytosis), melanin (antioxidant), urease' },
  ]},
];

export default function MicrobiologyGuideView() {
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const activeCatData = MICRO_DATA.find(c => c.cat === activeCat);
  const allOrganisms = MICRO_DATA.flatMap(c => c.organisms.map(o => ({ ...o, catName: c.cat })));
  const searchResults = search ? allOrganisms.filter(o => (o.name + ' ' + o.diseases + ' ' + o.key + ' ' + o.gram).toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Microbiology Guide</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organisms"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none mt-3"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {search ? (
          searchResults.length > 0 ? searchResults.map(o => (
            <div key={o.name} className="glass rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black" style={{ color: 'var(--accent)' }}>{o.name}</h3>
                <span className="px-2 py-0.5 rounded-lg text-xs opacity-40 shrink-0">{o.catName}</span>
              </div>
              <div className="text-xs"><span className="font-black opacity-40">Gram stain:</span> <span className="opacity-70">{o.gram}</span></div>
              <div className="text-xs"><span className="font-black opacity-40">Diseases:</span> <span className="opacity-70">{o.diseases}</span></div>
              <div className="text-xs"><span className="font-black opacity-40">Key:</span> <span className="opacity-70">{o.key}</span></div>
            </div>
          )) : <div className="empty-state py-12"><p className="font-black mt-4">No organisms found</p></div>
        ) : activeCatData ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveCat(null); setExpanded(null); }} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{activeCatData.icon} {activeCatData.cat}</h2>
            </div>
            {activeCatData.organisms.map(o => {
              const isOpen = expanded === o.name;
              return (
                <div key={o.name} className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}` }}>
                  <button onClick={() => setExpanded(e => e === o.name ? null : o.name)} className="w-full p-4 text-left flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-sm">{o.name}</h3>
                      <p className="text-xs opacity-40 mt-0.5">{o.gram}</p>
                    </div>
                    <ChevronDown size={14} className="opacity-40 shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 space-y-3 animate-fade-in-up">
                      <div className="flex gap-3 text-xs flex-wrap">
                        {o.catalase !== 'N/A' && <span className="px-2 py-1 rounded-lg" style={{ background: 'var(--accent)/10' }}>Catalase: {o.catalase}</span>}
                        {o.coagulase !== 'N/A' && <span className="px-2 py-1 rounded-lg" style={{ background: 'var(--accent)/10' }}>Coagulase: {o.coagulase}</span>}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Diseases</h4>
                        <p className="text-xs opacity-70 leading-relaxed">{o.diseases}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Virulence Factors</h4>
                        <p className="text-xs opacity-70 leading-relaxed">{o.virulence}</p>
                      </div>
                      <div className="glass rounded-xl p-3" style={{ background: '#10b98108', border: '1px solid #10b98120' }}>
                        <h4 className="text-xs font-black mb-1" style={{ color: '#10b981' }}> Key Treatment / Identification</h4>
                        <p className="text-xs opacity-70 leading-relaxed">{o.key}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MICRO_DATA.map(c => (
              <button key={c.cat} onClick={() => setActiveCat(c.cat)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{c.icon}</div>
                <h3 className="font-black">{c.cat}</h3>
                <p className="text-xs opacity-40 mt-1">{c.organisms.length} organisms</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
