import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ORTHO_SECTIONS = [
  { id: 'fractures', title: 'Fracture Principles', icon: '',
    items: [
      { term: 'Fracture Classification & Management', def: 'Open vs closed. Simple (2 fragments) vs comminuted (multiple). Description: transverse, oblique, spiral, segmental, butterfly. Salter-Harris (pediatric, epiphyseal plate): Type I (through physis), II (above  most common), III (lower), IV (through all), V (crush/compression).', detail: 'Open fractures: Gustilo-Anderson classification. Type I: wound <1 cm, low energy. Type II: wound 1-10 cm, moderate tissue damage. Type IIIA: adequate soft tissue coverage despite high energy. IIIB: inadequate soft tissue (requires flap). IIIC: vascular injury requiring repair. All open fractures: IV antibiotics (cefazolin  aminoglycoside), tetanus, surgical debridement within 24h (no longer mandatory within 6h per FLOW trial), external fixation if needed.', pearl: 'Salter-Harris mnemonic: SALTR  Same (through physis only), Above (metaphysis + physis), Lower (epiphysis + physis), Through all (metaphysis + physis + epiphysis), Rammed/cRush (compression). Type I may have normal X-ray (diagnosis by point tenderness over growth plate)  treat as fracture, repeat imaging in 10-14 days. Type IV and V: highest risk for growth arrest  orthopedic referral.' },
      { term: 'Upper Extremity Fractures', def: 'Clavicle: MC fracture overall, middle third (80%). Proximal humerus: elderly falls, 4-part Neer classification. Supracondylar (pediatric): FOOSH, watch for brachial artery and median/AIN injury. Radial head: FOOSH, point tenderness over radial head, Mason classification.', detail: 'Scaphoid fracture: FOOSH, snuffbox tenderness, normal initial X-ray in up to 20%. MRI at 24-48h or repeat X-ray in 10-14 days. Non-union and avascular necrosis risk (retrograde blood supply  proximal pole has worst prognosis). Treat with thumb spica cast 8 weeks. Boxer\'s fracture: 5th metacarpal neck, punch injury. Acceptable angulation up to 70° (5th MC), less for 2nd/3rd.', pearl: 'Supracondylar fracture: most common elbow fracture in children (peak 5-7 years). Gartland classification: Type I (non-displaced  cast), Type II (posterior cortex intact, angulated  closed reduction + pinning usually), Type III (completely displaced  emergent surgical fixation). Check: radial pulse, AIN function (OK sign  thumb-index finger pinch), median nerve (thenar sensation). Volkmann\'s ischemic contracture: feared complication of forearm compartment syndrome from supracondylar fracture.' },
    ]},
  { id: 'joints', title: 'Joint Injuries', icon: '',
    items: [
      { term: 'Shoulder Injuries', def: 'Anterior dislocation (95%): arm abducted + externally rotated, loss of deltoid contour, humeral head palpable anteriorly. Check axillary nerve (lateral deltoid sensation). Reduce: Cunningham (seated massage), external rotation, traction-countertraction. Post-reduction: sling, X-ray (Bankart lesion  anterior labral tear, Hill-Sachs  humeral head impaction).', detail: 'Rotator cuff: SITS (Supraspinatus  most commonly torn, abduction; Infraspinatus  external rotation; Teres minor  external rotation; Subscapularis  internal rotation). Impingement: painful arc 60-120° abduction, positive Neer/Hawkins test. Acute tears: trauma in elderly, surgical repair if significant. Adhesive capsulitis (frozen shoulder): diabetes, thyroid, progressive limitation of active AND passive ROM. Treatment: PT  cortisone injection.', pearl: 'AC joint injury (shoulder separation): classified by Rockwood (I-VI). Type I-II: conservative (sling, PT). Type III: controversial (most conservative, consider surgery in overhead athletes/laborers). Type IV-VI: surgical repair. Labral tears: SLAP (superior labrum  overhead athletes, pain with overhead activities, O\'Brien test), Bankart (anterior  recurrent instability). MRA (MR arthrogram) is study of choice for labral tears. Young patients (<25) with first-time anterior dislocation: high recurrence rate (70-90%)  consider early surgical stabilization vs older patients.' },
      { term: 'Knee Injuries', def: 'ACL tear: non-contact pivot/deceleration, "pop" + effusion within hours, positive Lachman (most sensitive), anterior drawer, pivot shift. MCL: valgus stress (medial opening). LCL: varus stress. PCL: dashboard injury (posterior tibial translation), posterior drawer test.', detail: 'Meniscus: medial > lateral (medial is less mobile, more commonly injured). Twisting injury, joint line tenderness, locking/catching, McMurray test. MRI for diagnosis. Conservative if peripheral tear (red zone has blood supply  can heal). Arthroscopic repair vs partial meniscectomy. Unhappy triad: ACL + MCL + medial meniscus tear.', pearl: 'ACL reconstruction: recommended for active patients, young athletes, combined ligament injuries. Autograft (bone-patellar tendon-bone or hamstring) preferred over allograft in young athletes (lower re-tear rate). Return to sport: typically 9-12 months, functional testing must pass before clearance. Knee dislocation (multi-ligament injury): VASCULAR EMERGENCY  check popliteal artery (ABI/ankle-brachial index, CT angiography). Even if pulse is present, intimal injury may cause delayed occlusion. MUST get CTA. Associated with peroneal nerve injury (foot drop).' },
    ]},
  { id: 'compartment', title: 'Compartment Syndrome', icon: '',
    items: [
      { term: 'Acute Compartment Syndrome', def: 'Pressure within closed muscle compartment exceeds perfusion pressure  ischemia  necrosis. MC: tibia fracture (anterior compartment), forearm (Volkmann\'s), but can occur anywhere. The 6 P\'s: Pain (out of proportion, with passive stretch  earliest and most reliable), Pressure (tense compartment), Paresthesias, Paralysis (late), Pulselessness (very late), Poikilothermia.', detail: 'Diagnosis: CLINICAL  do not delay treatment for compartment pressure measurement if clinical suspicion is high. If measured: absolute pressure >30 mmHg or delta pressure (diastolic BP - compartment pressure) <30 mmHg  emergent fasciotomy. Stryker device for measurement.', pearl: 'Fasciotomy: the ONLY treatment. Must be performed within 6 hours of symptom onset (irreversible muscle necrosis by 6-8h). Two-incision four-compartment fasciotomy of the leg: anterolateral incision (anterior + lateral compartments) + posteromedial incision (superficial + deep posterior). Leave wounds open, delayed primary closure or skin grafting at 48-72h. If missed  rhabdomyolysis ( CK, myoglobinuria, hyperkalemia, AKI), Volkmann\'s contracture (forearm), permanent disability. Post-fasciotomy complications: infection, nerve injury, chronic venous insufficiency.' },
      { term: 'Specific Orthopedic Emergencies', def: 'Septic arthritis: hot, swollen joint, cannot bear weight, fever. WBC >50,000 in aspirate (75% sensitivity, not 100% specific  crystal disease can overlap). Kocher criteria (pediatric hip): fever >38.5°C, non-weight-bearing, ESR >40, WBC >12K. 3 criteria  93% probability.', detail: 'Septic arthritis: S. aureus (#1 in all ages), N. gonorrhoeae (young sexually active  polyarticular  monoarticular, associated with tenosynovitis + rash), Kingella kingae (children <4). Treatment: joint aspiration + IV antibiotics (vancomycin + ceftriaxone empirically). Surgical washout for hip (deep joint, difficult to aspirate/manage percutaneously) and if no improvement in 48h.', pearl: 'Cauda equina syndrome: SURGICAL EMERGENCY. Urinary retention (#1 predictor), saddle anesthesia, bilateral leg pain/weakness, decreased anal tone/rectal sensation, sexual dysfunction. Disc herniation (L4-L5, L5-S1 most common) but also tumor, abscess, hematoma. MRI of lumbar spine STAT. Surgical decompression within 48h (earlier = better outcomes). If missed  permanent neurologic deficit. Any patient with new back pain + urinary retention  consider cauda equina until ruled out.' },
    ]},
  { id: 'spine', title: 'Spine & Pelvis', icon: '',
    items: [
      { term: 'Cervical Spine Injuries', def: 'NEXUS criteria or Canadian C-spine rule to determine imaging need. Jefferson fracture (C1 burst  axial load, diving), Hangman\'s fracture (C2 pars  hyperextension), Odontoid (C2 dens: Type I  tip, stable; Type II  base of dens, UNSTABLE, most common; Type III  body, usually heals with immobilization).', detail: 'Subaxial injuries: facet dislocation (unilateral  25% subluxation, bilateral  50% subluxation, associated with SCI). Burst fractures: axial loading, retropulsed fragments into canal  SCI risk. SLIC score (Subaxial Injury Classification) guides surgical vs conservative management.', pearl: 'Spinal cord injury levels: C3-C5 (phrenic nerve)  diaphragm paralysis, ventilator-dependent. C5  deltoid/biceps (can flex elbow but not extend). C6  wrist extension (tenodesis grip). C7  triceps (extend elbow). T1  hand intrinsics. High-dose methylprednisolone is NO LONGER recommended for acute SCI (NASCIS trials were flawed, increased complications). Neurogenic shock (SCI above T6): hypotension + bradycardia (loss of sympathetic tone)  treat with vasopressors (norepinephrine preferred), NOT fluids alone. MAP target 85 for 7 days (AANS guidelines).' },
      { term: 'Pelvic Fractures', def: 'High-energy mechanism (MVC, falls from height). Life-threatening hemorrhage (venous plexus, iliac vessels). Tile classification: Type A (stable  pubic ramus), Type B (rotationally unstable, vertically stable  open-book, lateral compression), Type C (rotationally + vertically unstable  most severe, vertical shear).', detail: 'Assessment: hemodynamic instability + pelvic fracture  pelvic binder (at level of greater trochanters, do NOT remove in field). Do NOT log-roll or rock pelvis. FAST exam: if positive  OR for abdominal source. If negative  likely pelvic hemorrhage  angioembolization or preperitoneal pelvic packing (REBOA emerging).', pearl: 'Young-Burgess classification (mechanism-based): APC (anterior-posterior compression  "open book," external rotation), LC (lateral compression  most common, internal rotation), VS (vertical shear  unilateral, leg-length discrepancy), CM (combined mechanism). Pubic ramus fractures in elderly (low-energy falls): usually stable, can often mobilize with weight-bearing as tolerated, but must rule out sacral insufficiency fracture (MRI if continued pain  X-ray misses 70%). Associated injuries: urethral injury (blood at meatus  retrograde urethrogram BEFORE Foley), bladder (CT cystogram), rectal, vaginal.' },
    ]},
];

export default function OrthopedicsGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = ORTHO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Orthopedics Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Fractures, joint injuries, compartment syndrome & spine</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#22c55e08', border: '1px solid #22c55e20', color: '#22c55e' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORTHO_SECTIONS.map(s => (
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
