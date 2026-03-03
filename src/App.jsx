import React,{useState,useEffect,useRef,useCallback,useMemo}from'react';
import{BookOpen,Layers,CheckSquare,Settings,ChevronLeft,ChevronRight,MessageSquare,
CheckCircle2,Trash2,Loader2,Send,GraduationCap,Save,X,BookA,AlertCircle,FileUp,
Target,Trash,Sparkles,Activity,Stethoscope,Lightbulb,Baby,Pill,Thermometer,Zap,
Database,Search,Palette,Type,Moon,Sun,UserCircle2,ZoomIn,ZoomOut,Maximize,
PlusCircle,CloudSun,MoonStar,FileSearch,MessageCircleQuestion,FastForward,
FlaskConical,Info,Clipboard,KeyRound,Globe,GripVertical,BookMarked,Layers3,
Brain,ListChecks,FilePlus,AlignLeft,Hash}from'lucide-react';

const MARIAM_IMG="https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg";
const NAV_H=72; // mobile bottom nav height px

/* ═══════════════════════════════════════════════════════════════════════════
   INDEXED DB
═══════════════════════════════════════════════════════════════════════════ */
const DB='MariamProDB_v30';
const openDB=()=>new Promise((res,rej)=>{
  const r=indexedDB.open(DB,6);
  r.onupgradeneeded=e=>{const d=e.target.result;
    ['pdfs','appState'].forEach(s=>{if(!d.objectStoreNames.contains(s))d.createObjectStore(s);});};
  r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);
});
const dbOp=(store,mode,op)=>openDB().then(db=>new Promise((res,rej)=>{
  const tx=db.transaction(store,mode),s=tx.objectStore(store),r=op(s);
  if(r?.onsuccess!==undefined){r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}
  else{tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);}
}));
const savePdf=(id,d)=>dbOp('pdfs','readwrite',s=>{s.put(d,id);});
const getPdf=id=>dbOp('pdfs','readonly',s=>s.get(id));
const delPdf=id=>dbOp('pdfs','readwrite',s=>{s.delete(id);});
const saveState=(k,v)=>dbOp('appState','readwrite',s=>{s.put(v,k);});
const getState=k=>dbOp('appState','readonly',s=>s.get(k));

/* ═══════════════════════════════════════════════════════════════════════════
   PDF.JS
═══════════════════════════════════════════════════════════════════════════ */
const loadPdfJs=async()=>{
  if(window.pdfjsLib)return window.pdfjsLib;
  return new Promise((res,rej)=>{
    const sc=document.createElement('script');
    sc.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    sc.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';res(window.pdfjsLib);};
    sc.onerror=rej; document.body.appendChild(sc);
  });
};

/* ═══════════════════════════════════════════════════════════════════════════
   UNIVERSAL AI ENGINE
   Supports: Anthropic · OpenAI · Gemini · DeepSeek · GLM · Groq · Ollama · Any-Compatible
═══════════════════════════════════════════════════════════════════════════ */
const callAI=async(prompt,expectJson,strictMode,settings={},maxTokens=8000)=>{
  const{provider='anthropic',apiKey='',baseUrl='',model=''}=settings;
  const sys=strictMode
    ?'STRICT MEDICAL AI: Use ONLY the provided document text. NEVER add outside knowledge. Cite every answer with [Page X].'
    :'Expert medical AI. Use the provided document as primary source. Be precise, detailed, and accurate.';
  const jsonSuffix=expectJson?'\n\nRETURN ONLY RAW JSON. No markdown. No explanation. No backticks.':'';
  const finalPrompt=prompt+jsonSuffix;

  if(provider==='anthropic'){
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'Content-Type':'application/json',...(apiKey?{'x-api-key':apiKey}:{})},
      body:JSON.stringify({model:model||'claude-sonnet-4-20250514',max_tokens:Math.min(maxTokens,8192),
        system:sys,messages:[{role:'user',content:finalPrompt}]})});
    if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||r.statusText);}
    const d=await r.json();return d.content[0].text.trim();
  }
  if(provider==='gemini'){
    if(!apiKey)throw new Error('Gemini API key required — add it in Settings.');
    const mdl=model||'gemini-2.0-flash';
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${apiKey}`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system_instruction:{parts:[{text:sys}]},
        contents:[{role:'user',parts:[{text:finalPrompt}]}],
        generationConfig:{maxOutputTokens:Math.min(maxTokens,8192),temperature:strictMode?0:0.4}})});
    if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||r.statusText);}
    const d=await r.json();return d.candidates[0].content.parts[0].text.trim();
  }
  if(!apiKey)throw new Error('API key required — add it in Settings.');
  const base=(baseUrl||'https://api.openai.com').replace(/\/$/,'');
  const r=await fetch(`${base}/v1/chat/completions`,{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model:model||'gpt-4o-mini',
      messages:[{role:'system',content:sys},{role:'user',content:finalPrompt}],
      max_tokens:Math.min(maxTokens,8192),temperature:strictMode?0:0.4,
      ...(expectJson&&provider==='openai'?{response_format:{type:'json_object'}}:{})})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||r.statusText);}
  const d=await r.json();return d.choices[0].message.content.trim();
};

const parseJson=txt=>{
  let c=txt.replace(/```json/gi,'').replace(/```/g,'').trim();
  const f=c.indexOf('{'),l=c.lastIndexOf('}');
  if(f!==-1&&l!==-1)c=c.substring(f,l+1);
  return JSON.parse(c);
};

/* Ultra-fast parallel runner — max concurrency, zero artificial delay */
const runParallel=async(tasks,concurrency=10,onProgress)=>{
  const results=[];
  for(let i=0;i<tasks.length;i+=concurrency){
    const batch=tasks.slice(i,i+concurrency);
    const br=await Promise.allSettled(batch.map(fn=>fn()));
    results.push(...br);
    if(onProgress)onProgress(Math.min(i+concurrency,tasks.length),tasks.length);
  }
  return results;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════════════ */
function useToast(){
  const[toasts,setToasts]=useState([]);
  const add=useCallback((msg,type='success',dur=3500)=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),dur);
  },[]);
  return{toasts,addToast:add};
}
function ToastContainer({toasts}){
  return(
    <div className="fixed top-20 right-3 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-24px)]">
      {toasts.map(t=>(
        <div key={t.id} className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-slide-in pointer-events-auto
          ${t.type==='success'?'bg-emerald-500 text-white':t.type==='error'?'bg-red-500 text-white':'bg-[var(--card)] border border-[var(--border)] text-[var(--text)]'}`}>
          {t.type==='success'?<CheckCircle2 size={15}/>:t.type==='error'?<AlertCircle size={15}/>:<Info size={15}/>}
          <span className="truncate">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOUCH + MOUSE DRAG HOOK
═══════════════════════════════════════════════════════════════════════════ */
function useDrag(onDrag,deps=[]){
  const dragging=useRef(false);
  const start=useCallback(e=>{
    e.preventDefault();
    dragging.current=true;
    document.body.style.userSelect='none';
    document.body.style.webkitUserSelect='none';
    const move=ev=>{
      if(!dragging.current)return;
      const x=ev.touches?.[0]?.clientX??ev.clientX;
      const y=ev.touches?.[0]?.clientY??ev.clientY;
      if(x!==undefined)onDrag(x,y);
    };
    const up=()=>{
      dragging.current=false;
      document.body.style.userSelect='';
      document.body.style.webkitUserSelect='';
      document.removeEventListener('mousemove',move);
      document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',move);
      document.removeEventListener('touchend',up);
    };
    document.addEventListener('mousemove',move,{passive:false});
    document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('touchend',up);
  },[onDrag,...deps]);
  return start;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ALWAYS-OPEN TUTOR CHAT (persistent, never hidden)
═══════════════════════════════════════════════════════════════════════════ */
function TutorChat({context,settings,contextLabel=''}){
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const prevCtx=useRef(null);

  useEffect(()=>{
    const key=JSON.stringify(context);
    if(prevCtx.current!==key){
      prevCtx.current=key;
      if(context)setMsgs([{role:'assistant',content:`Ready! Ask me anything about ${contextLabel||'this content'}.`}]);
    }
  },[context,contextLabel]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const msg=input;setInput('');
    const newMsgs=[...msgs,{role:'user',content:msg}];
    setMsgs(newMsgs);setLoading(true);
    try{
      const hist=newMsgs.slice(-6).map(m=>`${m.role==='user'?'STUDENT':'TUTOR'}: ${m.content}`).join('\n');
      const res=await callAI(
        `You are an expert medical tutor. The student is studying this content:\n${JSON.stringify(context,null,2)}\n\nConversation:\n${hist}\n\nStudent asked: ${msg}\n\nAnswer concisely but completely. Use clinical reasoning.`,
        false,false,settings,3000);
      setMsgs(p=>[...p,{role:'assistant',content:res}]);
    }catch(e){setMsgs(p=>[...p,{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  return(
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
        <img src={MARIAM_IMG} className="w-7 h-7 rounded-lg object-cover" alt="AI"/>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">AI Tutor</span>
        {loading&&<Loader2 size={12} className="animate-spin text-[var(--accent)] ml-auto"/>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 min-h-0">
        {msgs.length===0&&(
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
            <Brain size={32} className="mb-2"/>
            <p className="text-[10px] font-bold">Tutor ready</p>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden'}`}>
              {m.role==='user'?<UserCircle2 size={13} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
            </div>
            <div className={`px-3 py-2 text-[11px] leading-relaxed max-w-[85%] rounded-2xl whitespace-pre-wrap
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'bg-[var(--card)] border border-[var(--border)] rounded-tl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&<div className="flex gap-2"><div className="w-6 h-6 rounded-lg overflow-hidden shrink-0"><img src={MARIAM_IMG} className="w-full h-full object-cover opacity-50" alt="AI"/></div><div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-2 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div></div>}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0 p-2 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask tutor…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[11px] outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24"/>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0">
            <Send size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLIT PANE (vertical divider, touch+mouse drag)
═══════════════════════════════════════════════════════════════════════════ */
function SplitPane({left,right,defaultSplit=60,minLeft=30,maxLeft=85,direction='vertical'}){
  const[split,setSplit]=useState(defaultSplit);
  const containerRef=useRef(null);

  const handleDrag=useCallback((x,y)=>{
    const el=containerRef.current;
    if(!el)return;
    const rect=el.getBoundingClientRect();
    if(direction==='vertical'){
      const pct=Math.max(minLeft,Math.min(maxLeft,((x-rect.left)/rect.width)*100));
      setSplit(pct);
    }else{
      const pct=Math.max(minLeft,Math.min(maxLeft,((y-rect.top)/rect.height)*100));
      setSplit(pct);
    }
  },[direction,minLeft,maxLeft]);

  const startDrag=useDrag(handleDrag,[handleDrag]);

  if(direction==='vertical')return(
    <div ref={containerRef} className="flex flex-row w-full h-full overflow-hidden">
      <div style={{width:`${split}%`}} className="flex flex-col h-full overflow-hidden min-w-0">{left}</div>
      <div onMouseDown={startDrag} onTouchStart={startDrag}
        className="w-2 shrink-0 cursor-col-resize flex items-center justify-center bg-[var(--border)]/40 hover:bg-[var(--accent)]/30 transition-colors group touch-none select-none z-10">
        <GripVertical size={12} className="text-[var(--text)] opacity-40 group-hover:opacity-100"/>
      </div>
      <div style={{width:`${100-split}%`}} className="flex flex-col h-full overflow-hidden min-w-0">{right}</div>
    </div>
  );
  return(
    <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden">
      <div style={{height:`${split}%`}} className="w-full overflow-hidden min-h-0">{left}</div>
      <div onMouseDown={startDrag} onTouchStart={startDrag}
        className="h-2 shrink-0 cursor-row-resize flex items-center justify-center bg-[var(--border)]/40 hover:bg-[var(--accent)]/30 transition-colors group touch-none select-none">
        <div className="w-16 h-1 bg-[var(--text)] opacity-20 rounded-full group-hover:opacity-60"/>
      </div>
      <div style={{height:`${100-split}%`}} className="w-full overflow-hidden min-h-0">{right}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LAB TABLE
═══════════════════════════════════════════════════════════════════════════ */
function LabTable({rows}){
  if(!rows?.length)return null;
  return(
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] mb-4 text-[11px]">
      <table className="w-full border-collapse">
        <thead><tr className="bg-black/5 dark:bg-white/5 border-b border-[var(--border)]">
          {['Test','Result','Range','Units'].map(h=>(
            <th key={h} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-wider text-left opacity-50">{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-b border-[var(--border)]/50 last:border-0">
              <td className="py-2 px-3 font-semibold">{r.test}</td>
              <td className="py-2 px-3 text-center">
                <span className={`font-black inline-flex items-center gap-1 ${r.flag==='L'?'text-blue-500':r.flag==='H'?'text-red-500':''}`}>
                  {r.result}
                  {r.flag&&<span className={`text-[8px] font-black px-1 py-0.5 rounded ${r.flag==='L'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600':'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>{r.flag}</span>}
                </span>
              </td>
              <td className="py-2 px-3 text-center opacity-50 font-mono">{r.range}</td>
              <td className="py-2 px-3 text-center opacity-40 font-mono text-[9px] uppercase">{r.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER PRESETS
═══════════════════════════════════════════════════════════════════════════ */
const PROVIDERS={
  anthropic:{label:'Claude (Anthropic)',note:'Works built-in — no API key needed in Claude artifacts.',needsKey:false,defaultModel:'claude-sonnet-4-20250514',baseUrl:''},
  openai:   {label:'OpenAI (GPT)',       note:'Requires an OpenAI API key.',                          needsKey:true, defaultModel:'gpt-4o-mini',              baseUrl:'https://api.openai.com'},
  gemini:   {label:'Google Gemini',      note:'Requires a Google AI Studio API key.',                 needsKey:true, defaultModel:'gemini-2.0-flash',          baseUrl:''},
  deepseek: {label:'DeepSeek',           note:'Requires a DeepSeek API key.',                        needsKey:true, defaultModel:'deepseek-chat',             baseUrl:'https://api.deepseek.com'},
  glm:      {label:'GLM / Zhipu AI',     note:'Requires a Zhipu API key.',                           needsKey:true, defaultModel:'glm-4-flash',               baseUrl:'https://open.bigmodel.cn/api/paas'},
  groq:     {label:'Groq (Ultra-fast)',  note:'Requires a Groq API key. Extremely fast.',             needsKey:true, defaultModel:'llama-3.3-70b-versatile',   baseUrl:'https://api.groq.com/openai'},
  ollama:   {label:'Ollama (Local)',     note:'Local inference — no API key needed.',                 needsKey:false,defaultModel:'llama3',                    baseUrl:'http://localhost:11434/v1'},
  custom:   {label:'Custom API',         note:'Any OpenAI-compatible endpoint.',                      needsKey:true, defaultModel:'',                          baseUrl:''},
};
const DEFAULT_SETTINGS={provider:'anthropic',apiKey:'',baseUrl:'',model:'',strictMode:true,theme:'pure-white',fontSize:'medium',accentColor:'indigo'};

/* ═══════════════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════════════ */
export default function App(){
  const[loaded,setLoaded]=useState(false);
  const[docs,setDocs]=useState([]);
  const[openDocs,setOpenDocs]=useState([]);
  const[activeId,setActiveId]=useState(null);
  const[docPages,setDocPages]=useState({});
  const[flashcards,setFlashcards]=useState([]);
  const[exams,setExams]=useState([]);
  const[cases,setCases]=useState([]);
  const[notes,setNotes]=useState([]);
  const[chatSessions,setChatSessions]=useState([]);
  const[settings,setSettings]=useState(DEFAULT_SETTINGS);
  const[uploading,setUploading]=useState(false);
  const[uploadPct,setUploadPct]=useState(0);
  const[view,setView]=useState('library');
  const[rpTab,setRpTab]=useState('generate');
  const[rpOpen,setRpOpen]=useState(false);
  const[rpW,setRpW]=useState(420);
  const[bgTask,setBgTask]=useState(null);
  const{toasts,addToast}=useToast();

  // viewport meta
  useEffect(()=>{
    let m=document.querySelector('meta[name="viewport"]');
    if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}
    m.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
  },[]);

  // load persisted state
  useEffect(()=>{(async()=>{
    try{
      const[d,fc,ex,ca,no,ch,st,od,dp]=await Promise.all([
        getState('docs'),getState('flashcards'),getState('exams'),getState('cases'),
        getState('notes'),getState('chats'),getState('settings'),getState('openDocs'),getState('docPages')]);
      if(d)setDocs(d);if(fc)setFlashcards(fc);if(ex)setExams(ex);if(ca)setCases(ca);
      if(no)setNotes(no);if(ch)setChatSessions(ch);if(od)setOpenDocs(od);if(dp)setDocPages(dp);
      if(st)setSettings(p=>({...DEFAULT_SETTINGS,...p,...st}));
    }catch(e){console.warn(e);}finally{setLoaded(true);}
  })();},[]);

  // persist
  useEffect(()=>{
    if(!loaded)return;
    const t=setTimeout(async()=>{
      try{
        const slim=docs.map(d=>{const c={...d};delete c.pagesText;return c;});
        await Promise.all([saveState('docs',slim),saveState('flashcards',flashcards),saveState('exams',exams),
          saveState('cases',cases),saveState('notes',notes),saveState('chats',chatSessions),
          saveState('settings',settings),saveState('openDocs',openDocs),saveState('docPages',docPages)]);
      }catch(e){console.warn(e);}
    },800);
    return()=>clearTimeout(t);
  },[docs,flashcards,exams,cases,notes,chatSessions,settings,openDocs,docPages,loaded]);

  // theme
  useEffect(()=>{
    const root=document.documentElement;
    root.classList.remove('pure-white','light','dark','oled');
    let th=settings.theme;
    if(th==='system')th=window.matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'pure-white';
    root.classList.add(th);
    root.style.setProperty('color-scheme',(th==='dark'||th==='oled')?'dark':'light');
    root.style.fontSize={small:'14px',medium:'16px',large:'18px',xl:'20px'}[settings.fontSize]||'16px';
    const clrs={
      indigo:{hex:'#6366f1',rgb:'99,102,241',soft:'#4f46e5'},
      purple:{hex:'#a855f7',rgb:'168,85,247',soft:'#9333ea'},
      blue:  {hex:'#3b82f6',rgb:'59,130,246',soft:'#2563eb'},
      emerald:{hex:'#10b981',rgb:'16,185,129',soft:'#059669'},
      rose:  {hex:'#f43f5e',rgb:'244,63,94',soft:'#e11d48'},
    };
    const c=clrs[settings.accentColor]||clrs.indigo;
    root.style.setProperty('--accent',c.hex);
    root.style.setProperty('--accent-rgb',c.rgb);
    root.style.setProperty('--accent-soft',c.soft);
  },[settings.theme,settings.fontSize,settings.accentColor]);

  // right-panel resize
  const handleRpDrag=useCallback((x)=>{
    const w=Math.max(320,Math.min(window.innerWidth-300,window.innerWidth-x));
    setRpW(w);
  },[]);
  const startRpDrag=useDrag(handleRpDrag,[handleRpDrag]);

  // upload
  const handleUpload=async(e)=>{
    const files=Array.from(e.target.files||[]);
    if(!files.length)return;
    if(e.target)e.target.value='';
    setUploading(true);setUploadPct(2);
    try{
      const pdfjs=await loadPdfJs();
      const newDocs=[],newIds=[],newPg={};
      let lastId=null;
      for(let fi=0;fi<files.length;fi++){
        const file=files[fi];
        if(file.type!=='application/pdf'){addToast(`"${file.name}" is not a PDF — skipped`,'info');continue;}
        let ab;
        try{ab=await file.arrayBuffer();}catch{addToast(`Cannot read "${file.name}"`,'error');continue;}
        let pdf;
        try{pdf=await pdfjs.getDocument({data:ab.slice(0)}).promise;}catch{addToast(`Cannot parse "${file.name}"`,'error');continue;}
        const tot=pdf.numPages,pagesText={};
        for(let i=1;i<=tot;i++){
          try{const pg=await pdf.getPage(i);const tc=await pg.getTextContent();pagesText[i]=tc.items.map(s=>s.str).join(' ');pg.cleanup();}
          catch{pagesText[i]='';}
          if(i%8===0)await new Promise(r=>setTimeout(r,0));
          setUploadPct(Math.round((fi/files.length*100)+((i/tot)*(90/files.length))));
        }
        try{await pdf.destroy();}catch{}
        const id=`${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
        await savePdf(id,{buffer:ab,pagesText});
        newDocs.push({id,name:file.name,totalPages:tot,progress:1,addedAt:new Date().toISOString()});
        newIds.push(id);newPg[id]=1;lastId=id;
        addToast(`"${file.name}" imported!`,'success');
      }
      if(newDocs.length){
        setDocs(p=>[...p,...newDocs]);
        setOpenDocs(p=>[...new Set([...p,...newIds])]);
        setDocPages(p=>({...p,...newPg}));
        if(lastId)setTimeout(()=>{setActiveId(lastId);setView('reader');setRpOpen(true);},60);
      }
    }catch(e){addToast(`Upload failed: ${e.message}`,'error');}
    finally{setUploading(false);setUploadPct(0);}
  };

  const closeDoc=useCallback(id=>{
    setOpenDocs(p=>p.filter(d=>d!==id));
    setActiveId(prev=>{
      if(prev!==id)return prev;
      const next=openDocs.filter(d=>d!==id)[0]||null;
      if(!next)setView('library');
      return next;
    });
  },[openDocs]);

  const deleteDoc=async(id,ev)=>{
    if(ev)ev.stopPropagation();
    try{await delPdf(id);}catch{}
    setDocs(p=>p.filter(d=>d.id!==id));
    setFlashcards(p=>p.filter(f=>f.docId!==id));
    setExams(p=>p.filter(e=>e.docId!==id));
    setCases(p=>p.filter(c=>c.docId!==id));
    setNotes(p=>p.filter(n=>n.docId!==id));
    closeDoc(id);addToast('Document deleted','info');
  };

  const activeDoc=useMemo(()=>docs.find(d=>d.id===activeId)||null,[docs,activeId]);
  const setPage=useCallback(updater=>setDocPages(p=>({...p,[activeId]:typeof updater==='function'?updater(p[activeId]||1):updater})),[activeId]);

  // background generation
  const startGen=async(taskType,docId,startPage,endPage,params)=>{
    if(bgTask){addToast('A generation is already running','info');return;}
    setBgTask({title:`AI ${taskType.toUpperCase()}`,msg:'Initializing…',done:0,total:1,isFinished:false});
    try{
      const pdfData=await getPdf(docId);
      const pagesText=pdfData?.pagesText||{};
      let textContext='';
      for(let i=Number(startPage);i<=Number(endPage);i++){
        if(pagesText[i])textContext+=`\n[PAGE ${i}]\n${pagesText[i]}\n`;
      }
      if(!textContext.trim()||textContext.length<30)throw new Error('No text found in selected range.');
      const count=params.count||10;
      const diff=params.difficultyLevel||'Expert';
      // Ultra-fast batch sizes: 30 flashcards/call, 15 exam Q/call, 5 cases/call
      const batchSize=taskType==='cases'?5:taskType==='flashcards'?30:15;
      const numBatches=Math.ceil(count/batchSize);
      setBgTask(p=>({...p,total:numBatches,msg:`Launching ${numBatches} parallel AI requests…`}));

      const sysInstr=`STRICT: Only use the provided document text. Cite every item with the exact page. Difficulty: ${diff}.`;
      const makePrompt=(bc)=>{
        if(taskType==='cases')return`${sysInstr}\nGenerate ${bc} USMLE clinical cases from the text.\nJSON: {"cases":[{"title":"…","vignette":"…","diagnosis":"…","labPanels":[{"panelName":"…","rows":[{"test":"…","result":"…","flag":"H|L|","range":"…","units":"…"}]}],"examQuestion":{"q":"…","options":["A","B","C","D"],"correct":0,"explanation":"…","evidence":"…","sourcePage":1}}]}`;
        if(taskType==='flashcards')return`${sysInstr}\nGenerate ${bc} expert medical flashcards from the text.\nJSON: {"items":[{"q":"…","a":"…","evidence":"…","sourcePage":1}]}`;
        if(taskType==='exam')return`${sysInstr}\nGenerate ${bc} high-yield exam questions from the text.\nJSON: {"items":[{"q":"…","options":["A","B","C","D"],"correct":0,"explanation":"…","evidence":"…","sourcePage":1}]}`;
        return`${sysInstr}\nTask: ${taskType}. Text:\n${textContext}\n\nRespond in Markdown.`;
      };
      const isJson=['cases','flashcards','exam'].includes(taskType);
      const tasks=Array.from({length:numBatches},(_,i)=>{
        const bc=i===numBatches-1&&count%batchSize!==0?count%batchSize:batchSize;
        return()=>callAI(`${makePrompt(bc)}\n\nDOCUMENT TEXT:\n${textContext}`,isJson,settings.strictMode,settings,8000);
      });

      let all=[];
      const exRes=await runParallel(tasks,10,(done,total)=>{
        setBgTask(p=>({...p,done,msg:`${done}/${total} batches complete…`}));
      });
      if(isJson){
        for(const r of exRes){
          if(r.status==='fulfilled'){
            try{const p=parseJson(r.value);all=[...all,...(p.cases||p.items||p.questions||[])];}
            catch(e){console.warn('Parse:',e.message);}
          }
        }
        if(!all.length)throw new Error('AI returned no parseable data.');
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,data:all.slice(0,count),pages:`${startPage}-${endPage}`},msg:`Done! ${Math.min(all.length,count)} items.`}));
      }else{
        const raw=exRes[0]?.value||'No content generated.';
        const titles={clinical:'Clinical Summary',differential:'Differential Dx',treatment:'Treatment Plan',labs:'Lab Interpretation',eli5:'Simplified',summary:'Summary',mnemonics:'Mnemonics'};
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,data:raw,pages:`${startPage}-${endPage}`,title:titles[taskType]||taskType},msg:'Complete!'}));
      }
      addToast('Generation complete!','success');
    }catch(e){console.error(e);setBgTask(null);addToast(e.message,'error');}
  };

  if(!loaded)return(
    <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-white gap-4">
      <style>{`:root{--bg:#fff;--text:#0f172a;--card:#f8fafc;--border:#e2e8f0;--accent:#6366f1;--accent-soft:#4f46e5;}`}</style>
      <Loader2 className="animate-spin text-indigo-500" size={44}/>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Loading MARIAM PRO…</p>
    </div>
  );

  const showReader=view==='reader'&&!!activeId&&!!activeDoc;

  return(
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <style>{`
        .pure-white{--bg:#ffffff;--text:#0f172a;--card:#f8fafc;--border:#e2e8f0;}
        .light{--bg:#f0f4ff;--text:#1e293b;--card:#ffffff;--border:#e2e8f0;}
        .dark{--bg:#0d0f1a;--text:#e2e8f0;--card:#141827;--border:#252840;}
        .oled{--bg:#000;--text:#f1f5f9;--card:#0a0a0a;--border:#1a1a1a;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{margin:0;padding:0;overflow:hidden;}
        .custom-scrollbar::-webkit-scrollbar{width:4px;height:4px;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(128,128,128,.2);border-radius:4px;}
        .glass{background:var(--card);border:1px solid var(--border);}
        .btn-accent{background:linear-gradient(135deg,var(--accent),var(--accent-soft));color:#fff;border:none;cursor:pointer;}
        .btn-accent:hover{opacity:.9;}
        .btn-accent:active{opacity:.8;transform:scale(.98);}
        .card-hover{transition:.25s ease;cursor:pointer;}
        .card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(var(--accent-rgb),.12);}
        @keyframes slide-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .animate-slide-in{animation:slide-in .2s ease-out forwards;}
        .bottom-nav-safe{padding-bottom:max(8px,env(safe-area-inset-bottom));}
        .scroll-content{padding-bottom:calc(${NAV_H}px + env(safe-area-inset-bottom) + 24px);}
        @media(min-width:1024px){.scroll-content{padding-bottom:32px;}}
        canvas{display:block;max-width:100%;height:auto!important;}
      `}</style>
      <ToastContainer toasts={toasts}/>

      {/* ── HEADER ── */}
      <header className="h-14 lg:h-16 glass flex items-center justify-between px-4 lg:px-6 shrink-0 z-40 border-t-0 border-x-0">
        <div className="flex items-center gap-2.5">
          <img src={MARIAM_IMG} className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl object-cover border border-[var(--border)]" alt=""/>
          <span className="text-2xl lg:text-3xl font-black tracking-tight text-[var(--accent)]" style={{fontFamily:'system-ui'}}>MARIAM</span>
          <span className="text-[9px] font-black bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <input placeholder="Search documents…" className="w-full bg-black/5 dark:bg-white/5 rounded-full py-2 pl-9 pr-4 text-sm outline-none border border-transparent focus:border-[var(--accent)]/40 text-[var(--text)]"/>
            <Search className="absolute left-3 top-2.5 opacity-30" size={16}/>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeDoc&&(
            <button onClick={()=>{setRpOpen(o=>!o);if(view!=='reader')setView('reader');}}
              className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all
                ${rpOpen?'bg-[var(--accent)] text-white':'glass text-[var(--accent)] border border-[var(--accent)]/30'}`}>
              <Sparkles size={14}/> AI Studio
            </button>
          )}
          <button onClick={()=>setView('settings')} className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100">
            <Settings size={17}/>
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <nav className="hidden lg:flex w-[78px] flex-col items-center py-6 gap-1 glass shrink-0 border-t-0 border-b-0 border-l-0 z-30">
          {[
            {icon:BookOpen,label:'Library',v:'library'},
            {icon:BookMarked,label:'Reader',v:'reader',dis:!activeId},
            {icon:Layers,label:'Cards',v:'flashcards'},
            {icon:CheckSquare,label:'Exams',v:'exams'},
            {icon:Activity,label:'Cases',v:'cases'},
            {icon:MessageSquare,label:'Chat',v:'chat'},
          ].map(({icon:Icon,label,v,dis})=>(
            <button key={v} onClick={()=>{if(!dis){if(v==='reader'&&activeId)setView('reader');else if(v!=='reader')setView(v);}}}
              disabled={dis} title={label}
              className={`flex flex-col items-center gap-1 w-full py-2.5 rounded-2xl mx-1 transition-all text-[8px] font-black uppercase tracking-widest
                ${dis?'opacity-20 cursor-not-allowed':''}
                ${view===v?'text-[var(--accent)]':''}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                ${view===v?'bg-[var(--accent)] text-white shadow-lg':'text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Icon size={19} strokeWidth={view===v?2.5:2}/>
              </div>
              <span className={view===v?'text-[var(--accent)]':'opacity-50'}>{label}</span>
            </button>
          ))}
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* UPLOAD PROGRESS BAR */}
          {uploading&&(
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--border)] z-50">
              <div className="h-full bg-[var(--accent)] transition-all duration-200" style={{width:`${uploadPct}%`}}/>
            </div>
          )}

          {/* VIEWS — all mounted, toggled via display */}
          <ViewWrapper active={view==='library'}>
            <LibraryView docs={docs} uploading={uploading} onUpload={handleUpload}
              onOpen={id=>{setOpenDocs(p=>p.includes(id)?p:[...p,id]);setActiveId(id);setView('reader');}}
              onDelete={deleteDoc} flashcards={flashcards} exams={exams} cases={cases}/>
          </ViewWrapper>
          <ViewWrapper active={view==='flashcards'}>
            <FlashcardsView flashcards={flashcards} setFlashcards={setFlashcards} settings={settings} addToast={addToast}/>
          </ViewWrapper>
          <ViewWrapper active={view==='exams'}>
            <ExamsView exams={exams} setExams={setExams} settings={settings} addToast={addToast}/>
          </ViewWrapper>
          <ViewWrapper active={view==='cases'}>
            <CasesView cases={cases} setCases={setCases} settings={settings} addToast={addToast}/>
          </ViewWrapper>
          <ViewWrapper active={view==='chat'}>
            <ChatView settings={settings} sessions={chatSessions} setSessions={setChatSessions}/>
          </ViewWrapper>
          <ViewWrapper active={view==='settings'}>
            <SettingsView settings={settings} setSettings={setSettings}/>
          </ViewWrapper>
          <ViewWrapper active={showReader}>
            {activeDoc&&(
              <PdfWorkspace activeDoc={activeDoc} setDocs={setDocs}
                currentPage={docPages[activeId]||1} setCurrentPage={setPage}
                openDocs={openDocs} closeTab={id=>setOpenDocs(p=>p.filter(d=>d!==id))}
                setActiveId={setActiveId} docs={docs}
                onBack={()=>setView('library')}/>
            )}
          </ViewWrapper>
        </main>

        {/* AI STUDIO PANEL */}
        {showReader&&rpOpen&&(
          <>
            {/* drag handle */}
            <div onMouseDown={startRpDrag} onTouchStart={startRpDrag}
              className="hidden lg:flex w-2 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 shrink-0 z-[120] touch-none transition-colors group">
              <GripVertical size={12} className="text-[var(--text)] opacity-20 group-hover:opacity-60"/>
            </div>
            <aside style={{width:window.innerWidth>=1024?`${rpW}px`:'100%'}}
              className="glass flex flex-col shrink-0 z-[100] lg:relative absolute inset-0 lg:inset-auto border-t-0 border-b-0 border-r-0 animate-slide-in">
              {/* panel header */}
              <div className="h-14 lg:h-16 bg-[var(--accent)] text-white flex items-center justify-between px-4 shrink-0">
                <span className="font-black flex items-center gap-2 text-base"><Sparkles size={18}/> AI Studio</span>
                <button onClick={()=>setRpOpen(false)} className="w-8 h-8 hover:bg-white/20 rounded-xl flex items-center justify-center"><X size={18}/></button>
              </div>
              {/* tabs */}
              <div className="flex shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
                {[['generate','Extract',Zap],['chat','Chat',MessageSquare],['vault','Vault',Database]].map(([id,lbl,Icon])=>(
                  <button key={id} onClick={()=>setRpTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2
                      ${rpTab===id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent text-[var(--text)] opacity-50 hover:opacity-80'}`}>
                    <Icon size={13}/>{lbl}
                  </button>
                ))}
              </div>
              {/* panel content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeDoc&&rpTab==='generate'&&(
                  <GeneratePanel activeDoc={activeDoc} bgTask={bgTask} onStart={startGen}
                    onClear={()=>setBgTask(null)} setFlashcards={setFlashcards} setExams={setExams}
                    setCases={setCases} setNotes={setNotes} onVault={()=>setRpTab('vault')}
                    currentPage={docPages[activeId]||1} addToast={addToast} settings={settings}/>
                )}
                {activeDoc&&rpTab==='chat'&&(
                  <ChatPanel activeDoc={activeDoc} settings={settings} currentPage={docPages[activeId]||1}/>
                )}
                {activeDoc&&rpTab==='vault'&&(
                  <VaultPanel activeDocId={activeId} flashcards={flashcards} setFlashcards={setFlashcards}
                    exams={exams} setExams={setExams} cases={cases} setCases={setCases}
                    notes={notes} setNotes={setNotes} addToast={addToast}
                    setCurrentPage={setPage} setView={setView} settings={settings}/>
                )}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[500] bg-[var(--card)] border-t border-[var(--border)] flex items-center bottom-nav-safe"
        style={{paddingBottom:`max(12px, env(safe-area-inset-bottom))`}}>
        {[
          {icon:BookOpen,label:'Library',v:'library'},
          {icon:BookMarked,label:'Reader',v:'reader',dis:!activeId},
          {icon:Layers,label:'Cards',v:'flashcards'},
          {icon:Activity,label:'Cases',v:'cases'},
          {icon:GraduationCap,label:'Exams',v:'exams'},
          {icon:MessageSquare,label:'Chat',v:'chat'},
        ].map(({icon:Icon,label,v,dis})=>(
          <button key={v} disabled={dis}
            onClick={()=>{if(!dis){if(v==='reader'&&activeId)setView('reader');else if(v!=='reader')setView(v);}}}
            className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-1 transition-all ${dis?'opacity-20':''}`}>
            <Icon size={19} strokeWidth={view===v?2.5:2}
              className={view===v?'text-[var(--accent)]':'text-[var(--text)] opacity-55'}/>
            <span className={`text-[8px] font-bold ${view===v?'text-[var(--accent)]':'opacity-50'}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ViewWrapper({active,children}){
  return <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${active?'':'hidden'}`}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIBRARY VIEW
═══════════════════════════════════════════════════════════════════════════ */
function LibraryView({docs,uploading,onUpload,onOpen,onDelete,flashcards,exams,cases}){
  const[search,setSearch]=useState('');
  const filtered=search?docs.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())):docs;
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="p-4 lg:p-8 max-w-screen-2xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 lg:mb-10">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]">Intelligence Nexus</h1>
            <p className="text-xs lg:text-sm opacity-40 mt-1 font-medium">{docs.length} document{docs.length!==1?'s':''} · Universal AI</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 sm:flex-none">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                className="w-full sm:w-48 bg-black/5 dark:bg-white/5 rounded-xl py-2.5 pl-8 pr-3 text-sm outline-none border border-[var(--border)] focus:border-[var(--accent)]/50 text-[var(--text)]"/>
              <Search className="absolute left-2.5 top-3 opacity-30" size={14}/>
            </div>
            <label className={`btn-accent flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap cursor-pointer ${uploading?'opacity-50 pointer-events-none':''}`}>
              {uploading?<Loader2 size={16} className="animate-spin"/>:<FileUp size={16}/>}
              {uploading?'Importing…':'Import PDF'}
              <input type="file" accept="application/pdf" multiple className="hidden" onChange={onUpload} disabled={uploading}/>
            </label>
          </div>
        </div>
        {filtered.length===0?(
          <div className="glass border-dashed border-2 border-[var(--border)] rounded-3xl p-12 lg:p-20 text-center flex flex-col items-center gap-4">
            <FileUp size={48} className="opacity-20"/>
            <h2 className="text-xl lg:text-2xl font-black opacity-60">{search?'No results found':'No Documents Yet'}</h2>
            <p className="text-sm opacity-40 max-w-xs">{search?'Try a different search term':'Import a PDF to get started.'}</p>
          </div>
        ):(
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filtered.map(doc=>{
              const nCards=flashcards.filter(f=>f.docId===doc.id).reduce((s,set)=>s+(set.cards?.length||0),0);
              const nExams=exams.filter(e=>e.docId===doc.id).length;
              const nCases=cases.filter(c=>c.docId===doc.id).length;
              return(
                <div key={doc.id} onClick={()=>onOpen(doc.id)} className="card-hover glass rounded-2xl overflow-hidden flex flex-col relative group">
                  <button onClick={ev=>onDelete(doc.id,ev)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-red-500 rounded-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13}/>
                  </button>
                  <div className="h-28 lg:h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center">
                    <BookOpen size={40} className="text-white opacity-30 group-hover:scale-110 transition-transform duration-300"/>
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-[11px] lg:text-xs leading-snug line-clamp-2 flex-1">{doc.name}</h3>
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded-md">{nCards} Cards</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">{nExams} Exams</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-md">{nCases} Cases</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PDF WORKSPACE
═══════════════════════════════════════════════════════════════════════════ */
function PdfWorkspace({activeDoc,setDocs,currentPage,setCurrentPage,openDocs,closeTab,setActiveId,docs,onBack}){
  const[pdf,setPdf]=useState(null);
  const[loading,setLoading]=useState(true);
  const[dims,setDims]=useState({w:0,h:0});
  const[scale,setScale]=useState(1);
  const canvasRef=useRef(null);
  const containerRef=useRef(null);
  const textRef=useRef(null);
  const renderRef=useRef(null);
  const pdfRef=useRef(null);

  useEffect(()=>{
    if(!activeDoc?.id)return;
    let mounted=true;setLoading(true);setPdf(null);
    if(pdfRef.current){try{pdfRef.current.destroy();}catch{}pdfRef.current=null;}
    (async()=>{
      try{
        const data=await getPdf(activeDoc.id);
        if(!data||!mounted)return;
        const pdfjs=await loadPdfJs();
        const loaded=await pdfjs.getDocument({data:(data.buffer||data).slice(0)}).promise;
        if(mounted){pdfRef.current=loaded;setPdf(loaded);}else{try{loaded.destroy();}catch{}}
      }catch(e){console.error(e);}
      finally{if(mounted)setLoading(false);}
    })();
    return()=>{mounted=false;};
  },[activeDoc?.id]);

  useEffect(()=>{
    if(!pdf)return;
    let mounted=true;
    (async()=>{
      try{
        const page=await pdf.getPage(currentPage);
        const cont=containerRef.current;if(!cont||!mounted)return;
        const tmp=page.getViewport({scale:1});
        const base=cont.clientWidth/tmp.width;
        const final=Math.min(Math.max(base*scale,.5),5);
        const vp=page.getViewport({scale:final});
        if(mounted)setDims({w:vp.width,h:vp.height});
        const canvas=canvasRef.current;
        if(canvas){
          const pr=window.devicePixelRatio||1;
          canvas.width=Math.floor(vp.width*pr);canvas.height=Math.floor(vp.height*pr);
          canvas.style.width=`${vp.width}px`;canvas.style.height=`${vp.height}px`;
          if(renderRef.current)renderRef.current.cancel();
          renderRef.current=page.render({canvasContext:canvas.getContext('2d'),viewport:vp,transform:[pr,0,0,pr,0,0]});
          await renderRef.current.promise;
        }
        const tl=textRef.current;
        if(tl&&mounted){tl.innerHTML='';tl.style.setProperty('--scale-factor',vp.scale);
          const tc=await page.getTextContent();
          window.pdfjsLib?.renderTextLayer({textContentSource:tc,container:tl,viewport:vp,textDivs:[]});}
      }catch(e){if(e?.name!=='RenderingCancelledException')console.warn(e?.message);}
    })();
    return()=>{mounted=false;if(renderRef.current)renderRef.current.cancel();};
  },[currentPage,pdf,scale]);

  const nav=useCallback(dir=>{
    if(!activeDoc)return;
    const next=Math.max(1,Math.min(activeDoc.totalPages,currentPage+dir));
    if(next!==currentPage){setCurrentPage(next);setDocs(p=>p.map(d=>d.id===activeDoc.id?{...d,progress:next}:d));containerRef.current?.scrollTo({top:0,behavior:'smooth'});}
  },[currentPage,activeDoc,setCurrentPage,setDocs]);

  useEffect(()=>{
    const kd=e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowLeft')nav(-1);if(e.key==='ArrowRight')nav(1);};
    document.addEventListener('keydown',kd);return()=>document.removeEventListener('keydown',kd);
  },[nav]);

  if(!activeDoc)return null;

  return(
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* PDF top bar */}
      <div className="h-12 glass flex items-center gap-2 px-3 shrink-0 border-t-0 border-x-0">
        <button onClick={onBack} className="w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 shrink-0">
          <ChevronLeft size={16}/>
        </button>
        <span className="font-bold text-xs truncate flex-1 min-w-0">{activeDoc.name}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={()=>setScale(s=>Math.max(s-.2,.5))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomOut size={13}/></button>
          <button onClick={()=>setScale(1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><Maximize size={13}/></button>
          <button onClick={()=>setScale(s=>Math.min(s+.2,4))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomIn size={13}/></button>
        </div>
      </div>

      {/* doc tabs */}
      {openDocs.length>1&&(
        <div className="flex gap-1.5 px-3 py-1.5 border-b border-[var(--border)] overflow-x-auto custom-scrollbar shrink-0 bg-[var(--card)]">
          {openDocs.map(id=>{
            const doc=docs.find(d=>d.id===id);if(!doc)return null;
            return(
              <div key={id} onClick={()=>setActiveId(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer text-[10px] font-bold shrink-0 transition-colors
                  ${id===activeDoc.id?'bg-[var(--accent)] text-white':'glass hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="truncate max-w-[80px]">{doc.name}</span>
                <button onClick={e=>{e.stopPropagation();closeTab(id);}} className="opacity-60 hover:opacity-100 ml-0.5"><X size={10}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF scroll area */}
      <div ref={containerRef} className="flex-1 overflow-auto custom-scrollbar bg-zinc-200 dark:bg-zinc-900 min-h-0">
        {loading?(
          <div className="flex items-center justify-center h-full gap-3 text-[var(--accent)]">
            <Loader2 size={28} className="animate-spin"/><span className="text-xs font-bold opacity-50">Rendering…</span>
          </div>
        ):pdf?(
          <div className="p-2 pb-20 lg:pb-4 flex justify-center">
            <div className="relative bg-white shadow-2xl" style={{width:dims.w?`${dims.w}px`:'100%',height:dims.h?`${dims.h}px`:'auto'}}>
              <canvas ref={canvasRef}/>
              <div ref={textRef} style={{position:'absolute',inset:0,overflow:'hidden',opacity:1,lineHeight:1,userSelect:'text'}}/>
            </div>
          </div>
        ):(
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-xs flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertCircle size={14}/> Failed to load PDF
            </div>
          </div>
        )}
      </div>

      {/* PAGE CONTROLS — always visible, above mobile nav */}
      <div className="h-14 glass flex items-center justify-center gap-3 shrink-0 border-t border-[var(--border)] border-x-0 border-b-0
                      fixed bottom-[72px] left-0 right-0 z-[200] lg:relative lg:bottom-auto lg:z-auto"
        style={{bottom:`calc(${NAV_H}px + env(safe-area-inset-bottom))`}}>
        <button onClick={()=>nav(-1)} disabled={currentPage<=1}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95">
          <ChevronLeft size={18}/>
        </button>
        <div className="px-4 py-2 glass rounded-xl font-mono text-sm font-bold border border-[var(--border)] min-w-[90px] text-center">
          <span className="text-[var(--accent)]">{currentPage}</span> / {activeDoc.totalPages}
        </div>
        <button onClick={()=>nav(1)} disabled={currentPage>=activeDoc.totalPages}
          className="w-10 h-10 btn-accent rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 shadow-md">
          <ChevronRight size={18}/>
        </button>
      </div>
      {/* spacer so content isn't hidden behind fixed page controls on mobile */}
      <div className="h-14 lg:hidden shrink-0"/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GENERATE PANEL
═══════════════════════════════════════════════════════════════════════════ */
function GeneratePanel({activeDoc,bgTask,onStart,onClear,setFlashcards,setExams,setCases,setNotes,onVault,currentPage,addToast,settings}){
  const[startPage,setStartPage]=useState(currentPage);
  const[endPage,setEndPage]=useState(currentPage);
  const[entireFile,setEntireFile]=useState(false);
  const[type,setType]=useState('exam');
  const[count,setCount]=useState(20);
  const[difficulty,setDifficulty]=useState(2);
  const levels=['Hard','Expert','Insane'];

  useEffect(()=>{if(!bgTask){setStartPage(currentPage);if(!entireFile)setEndPage(currentPage);}},[currentPage,bgTask]);
  useEffect(()=>{if(entireFile&&activeDoc){setStartPage(1);setEndPage(activeDoc.totalPages);}},[entireFile,activeDoc]);

  if(!activeDoc)return<div className="flex-1 flex items-center justify-center text-sm opacity-40 font-bold">No document open.</div>;

  const go=()=>onStart(type,activeDoc.id,startPage,endPage,{count,difficultyLevel:levels[difficulty-1]});

  const save=()=>{
    if(!bgTask?.result)return;
    const g=bgTask.result;
    if(g.type==='flashcards'){
      const cards=g.data.map(c=>({id:Date.now()+Math.random(),q:c.q,a:c.a,evidence:c.evidence,sourcePage:c.sourcePage,repetitions:0,ef:2.5,interval:1,nextReview:Date.now(),lastReview:Date.now()}));
      setFlashcards(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:`Cards — Pgs ${g.pages}`,cards,createdAt:new Date().toISOString()}]);
      addToast(`${cards.length} flashcards saved!`,'success');
    }else if(g.type==='cases'){
      setCases(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:'Patient Cases',questions:g.data,createdAt:new Date().toISOString()}]);
      addToast(`${g.data.length} cases saved!`,'success');
    }else if(g.type==='exam'){
      setExams(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:`Exam — Pgs ${g.pages}`,questions:g.data,createdAt:new Date().toISOString()}]);
      addToast(`${g.data.length} questions saved!`,'success');
    }else{
      setNotes(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,title:`${g.title||'Note'} · Pgs ${g.pages}`,content:g.data,createdAt:new Date().toISOString()}]);
      addToast('Note saved!','success');
    }
    onClear();onVault();
  };

  /* ── RESULTS VIEW ── */
  if(bgTask?.isFinished)return(
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 shrink-0">
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={15}/> {bgTask.result?.data?.length||1} items ready
        </span>
        <div className="flex gap-2">
          <button onClick={onClear} className="px-3 py-1.5 glass rounded-xl text-[10px] font-black uppercase opacity-60 hover:opacity-100">Discard</button>
          <button onClick={save} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 shadow-md">
            <Save size={12}/> Save
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {bgTask.result?.type==='flashcards'&&bgTask.result.data.map((item,i)=>(
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-bold text-xs mb-3 leading-relaxed"><span className="opacity-30 mr-1.5 font-mono text-[9px]">Q{i+1}</span>{item.q}</p>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-xs text-[var(--accent)]">{item.a}</div>
            {item.evidence&&<p className="mt-2 text-[10px] opacity-40 italic">"{item.evidence}" — Pg {item.sourcePage}</p>}
          </div>
        ))}
        {(bgTask.result?.type==='exam'||bgTask.result?.type==='cases')&&bgTask.result.data.map((item,i)=>{
          const q=item.examQuestion||item;
          return(
            <div key={i} className="glass p-4 rounded-2xl">
              {item.vignette&&<p className="text-[10px] opacity-60 mb-3 bg-black/5 p-3 rounded-xl leading-relaxed line-clamp-3">{item.vignette}</p>}
              <p className="font-bold text-xs mb-3 leading-relaxed">{i+1}. {q.q}</p>
              <div className="space-y-1.5 mb-3">
                {(q.options||[]).map((o,oi)=>(
                  <div key={oi} className={`text-[10px] px-3 py-2 rounded-xl border ${oi===q.correct?'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold':'border-[var(--border)] bg-black/5'}`}>
                    <span className="font-mono opacity-40 mr-1.5">{String.fromCharCode(65+oi)}.</span>{o}
                  </div>
                ))}
              </div>
              <div className="bg-[var(--accent)]/10 p-3 rounded-xl text-[10px] leading-relaxed">{q.explanation}</div>
            </div>
          );
        })}
        {!['flashcards','exam','cases'].includes(bgTask.result?.type)&&(
          <div className="glass p-4 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed">{bgTask.result?.data}</div>
        )}
      </div>
    </div>
  );

  /* ── CONFIG VIEW ── */
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-4">
        {/* Page range */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><Hash size={13}/> Page Range</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={()=>setEntireFile(o=>!o)}
                className={`w-10 h-5 rounded-full transition-colors relative ${entireFile?'bg-[var(--accent)]':'bg-gray-300 dark:bg-zinc-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${entireFile?'translate-x-5':'translate-x-0.5'}`}/>
              </div>
              <span className="text-[10px] font-bold opacity-60">Entire File</span>
            </label>
          </div>
          <div className={`flex gap-3 ${entireFile?'opacity-40 pointer-events-none':''}`}>
            {[['From',startPage,setStartPage],['To',endPage,setEndPage]].map(([l,v,s])=>(
              <div key={l} className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={v} onChange={e=>s(Number(e.target.value))}
                  className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)]"/>
              </div>
            ))}
          </div>
          {entireFile&&<p className="text-[10px] text-[var(--accent)] font-bold mt-2 text-center">All {activeDoc.totalPages} pages selected</p>}
        </div>

        {/* Tool selector */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2"><Zap size={13}/> Tool</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['flashcards','Cards',Layers],['exam','Exam',CheckSquare],['summary','Summary',AlignLeft],
              ['cases','Cases',Activity],['clinical','Clinical',Stethoscope],['treatment','Treat',Pill],
              ['labs','Labs',Thermometer],['mnemonics','Memory',Lightbulb],['eli5','ELI5',Baby],
            ].map(([id,lbl,Icon])=>(
              <button key={id} onClick={()=>setType(id)}
                className={`py-3 flex flex-col items-center gap-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                  ${type===id?'bg-[var(--accent)] text-white border-transparent shadow-md scale-105':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}>
                <Icon size={16}/>{lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {['flashcards','exam','cases'].includes(type)&&(
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><ListChecks size={13}/> Quantity</h3>
              <span className="text-sm font-black text-[var(--accent)]">{count}</span>
            </div>
            <input type="range" min="1" max="1000" value={count} onChange={e=>setCount(+e.target.value)}
              className="w-full accent-[var(--accent)] mb-2"/>
            <div className="flex gap-1.5 flex-wrap">
              {[5,10,20,50,100,250,500,1000].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black transition-colors ${count===n?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>
                  {n}
                </button>
              ))}
            </div>
            {count>50&&<p className="text-[9px] text-amber-500 font-bold mt-2 flex items-center gap-1"><AlertCircle size={10}/>Large batches run in parallel — expect 30-120s for {count}+ items</p>}
          </div>
        )}

        {/* Difficulty */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Difficulty</h3>
            <span className="text-xs font-black text-[var(--accent)]">{levels[difficulty-1]}</span>
          </div>
          <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(+e.target.value)}
            className="w-full accent-[var(--accent)]"/>
        </div>

        {/* GO button */}
        <button onClick={go} disabled={!!bgTask}
          className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl">
          {bgTask?<Loader2 size={18} className="animate-spin"/>:<Zap size={18} fill="currentColor"/>}
          {bgTask?`${bgTask.msg}`:'Generate Now'}
        </button>

        {/* progress */}
        {bgTask&&!bgTask.isFinished&&(
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black opacity-60">{bgTask.msg}</span>
              <span className="text-[10px] font-black text-[var(--accent)]">{bgTask.done||0}/{bgTask.total||1}</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
                style={{width:`${bgTask.total?((bgTask.done||0)/bgTask.total)*100:10}%`}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAT PANEL (AI Studio side panel)
═══════════════════════════════════════════════════════════════════════════ */
function ChatPanel({activeDoc,settings,currentPage}){
  const[msgs,setMsgs]=useState([{role:'assistant',content:'Ready. Ask me anything about this document.'}]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[mode,setMode]=useState('page');
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const msg=input;setInput('');setMsgs(p=>[...p,{role:'user',content:msg}]);setLoading(true);
    try{
      const pdfData=await getPdf(activeDoc.id);
      const text=mode==='page'
        ?(pdfData?.pagesText?.[currentPage]||'No text on this page.')
        :Object.entries(pdfData?.pagesText||{}).map(([p,t])=>`[Page ${p}]\n${t}`).join('\n\n').substring(0,80000);
      const hist=msgs.slice(-6).map(m=>`${m.role==='user'?'USER':'AI'}: ${m.content}`).join('\n');
      const res=await callAI(`DOCUMENT:\n${text}\n\nHISTORY:\n${hist}\n\nQUESTION: ${msg}`,false,false,settings,4000);
      setMsgs(p=>[...p,{role:'assistant',content:res}]);
    }catch(e){setMsgs(p=>[...p,{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  return(
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
        {['page','document'].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2
              ${mode===m?'border-[var(--accent)] text-[var(--accent)]':'border-transparent opacity-50 hover:opacity-80'}`}>
            {m==='page'?`Page ${currentPage}`:'Full Doc'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-0">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex gap-2.5 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden glass'}`}>
              {m.role==='user'?<UserCircle2 size={16} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
            </div>
            <div className={`px-3.5 py-2.5 text-xs leading-relaxed max-w-[84%] whitespace-pre-wrap rounded-2xl
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'glass rounded-tl-sm'}`}>{m.content}</div>
          </div>
        ))}
        {loading&&<div className="flex gap-2.5"><div className="w-8 h-8 rounded-xl overflow-hidden glass shrink-0"><img src={MARIAM_IMG} className="w-full h-full object-cover opacity-50" alt="AI"/></div><div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}</div></div>}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0 p-3 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="flex gap-2 items-end glass rounded-2xl p-2 border border-[var(--border)]">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={`Ask about ${mode==='page'?`page ${currentPage}`:'the document'}…`} disabled={loading}
            className="flex-1 bg-transparent p-2 text-xs outline-none resize-none max-h-24 custom-scrollbar text-[var(--text)] min-h-[36px]"/>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-8 h-8 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0"><Send size={14}/></button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VAULT PANEL
═══════════════════════════════════════════════════════════════════════════ */
function VaultPanel({activeDocId,flashcards,setFlashcards,exams,setExams,cases,setCases,notes,setNotes,addToast,setCurrentPage,setView,settings}){
  const[tab,setTab]=useState('exams');
  const[active,setActive]=useState(null);
  const dCards=flashcards.filter(f=>f.docId===activeDocId);
  const dExams=exams.filter(e=>e.docId===activeDocId);
  const dCases=cases.filter(c=>c.docId===activeDocId);
  const dNotes=notes.filter(n=>n.docId===activeDocId);

  if(active?.type==='exam'||active?.type==='case')return(
    <ExamPlayer exam={active.data} onBack={()=>setActive(null)}
      onScore={(id,sc)=>{if(active.type==='case')setCases(p=>p.map(c=>c.id===id?{...c,lastScore:sc}:c));else setExams(p=>p.map(e=>e.id===id?{...e,lastScore:sc}:e));}}
      settings={settings} addToast={addToast}/>
  );
  if(active?.type==='flashcards')return(
    <FlashPlayer set={active.data} onBack={()=>setActive(null)} setFlashcards={setFlashcards} settings={settings} addToast={addToast}/>
  );
  if(active?.type==='note')return(
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 shrink-0">
        <button onClick={()=>setActive(null)} className="flex items-center gap-1.5 text-blue-600 text-xs font-black"><ChevronLeft size={14}/> Back</button>
        <button onClick={()=>navigator.clipboard?.writeText(active.data.content)} className="w-8 h-8 glass rounded-xl flex items-center justify-center text-blue-600"><Clipboard size={14}/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <h2 className="font-black text-lg mb-4 leading-snug">{active.data.title}</h2>
        <div className="text-xs leading-loose whitespace-pre-wrap glass p-4 rounded-2xl">{active.data.content}</div>
      </div>
    </div>
  );

  const TABS=[['exams','Exams',dExams.length,'rose'],['cases','Cases',dCases.length,'blue'],['flashcards','Cards',dCards.length,'indigo'],['notes','Notes',dNotes.length,'amber']];

  return(
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex border-b border-[var(--border)] shrink-0 bg-[var(--card)]">
        {TABS.map(([id,lbl,cnt])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex-1 flex flex-col items-center py-2 text-[9px] font-black uppercase tracking-widest transition-colors border-b-2
              ${tab===id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent opacity-50 hover:opacity-80'}`}>
            {lbl}<span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black mt-0.5 ${tab===id?'bg-[var(--accent)] text-white':'bg-black/10 dark:bg-white/10'}`}>{cnt}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
        {tab==='exams'&&(dExams.length===0
          ?<Empty icon={GraduationCap} text="No exams yet"/>
          :dExams.map(e=>(
            <ItemCard key={e.id} title={e.title} badge={`${e.questions.length} Qs`} score={e.lastScore}
              color="rose" onPlay={()=>setActive({type:'exam',data:e})} onDelete={()=>setExams(exams.filter(x=>x.id!==e.id))}/>
          )))}
        {tab==='cases'&&(dCases.length===0
          ?<Empty icon={Activity} text="No cases yet"/>
          :dCases.map(c=>(
            <ItemCard key={c.id} title={c.title} badge={`${c.questions?.length||0} Cases`} score={c.lastScore}
              color="blue" onPlay={()=>setActive({type:'case',data:c})} onDelete={()=>setCases(cases.filter(x=>x.id!==c.id))}/>
          )))}
        {tab==='flashcards'&&(dCards.length===0
          ?<Empty icon={Layers} text="No cards yet"/>
          :dCards.map(set=>(
            <ItemCard key={set.id} title={set.title} badge={`${set.cards?.length||0} Cards`}
              color="indigo" onPlay={()=>setActive({type:'flashcards',data:set})} onDelete={()=>setFlashcards(flashcards.filter(f=>f.id!==set.id))}/>
          )))}
        {tab==='notes'&&(dNotes.length===0
          ?<Empty icon={AlignLeft} text="No notes yet"/>
          :dNotes.map(n=>(
            <div key={n.id} onClick={()=>setActive({type:'note',data:n})}
              className="glass rounded-2xl p-4 card-hover relative group border border-[var(--border)]">
              <p className="font-bold text-xs mb-2 pr-8 leading-snug">{n.title}</p>
              <p className="text-[10px] opacity-40 line-clamp-2">{n.content}</p>
              <button onClick={ev=>{ev.stopPropagation();setNotes(notes.filter(x=>x.id!==n.id));}}
                className="absolute top-3 right-3 w-7 h-7 glass rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500">
                <Trash size={12}/>
              </button>
            </div>
          )))}
      </div>
    </div>
  );
}

function ItemCard({title,badge,score,color,onPlay,onDelete}){
  const colors={rose:'text-rose-500 bg-rose-500/10',blue:'text-blue-500 bg-blue-500/10',indigo:'text-[var(--accent)] bg-[var(--accent)]/10',amber:'text-amber-500 bg-amber-500/10'};
  return(
    <div className="glass rounded-2xl p-4 border border-[var(--border)] card-hover group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-bold text-xs leading-snug flex-1 min-w-0">{title}</p>
        <button onClick={e=>{e.stopPropagation();onDelete();}} className="w-6 h-6 glass rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500 shrink-0"><Trash size={11}/></button>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${colors[color]||colors.indigo}`}>{badge}</span>
        {score!==undefined&&<span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${score>=70?'bg-emerald-500/10 text-emerald-500':'bg-red-500/10 text-red-500'}`}>{score}%</span>}
      </div>
      <button onClick={onPlay} className="mt-3 w-full py-2.5 btn-accent rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm">
        <Play size={12} fill="currentColor"/> Start
      </button>
    </div>
  );
}
function Empty({icon:Icon,text}){return<div className="flex flex-col items-center gap-2 py-12 opacity-30"><Icon size={32}/><p className="text-xs font-bold">{text}</p></div>;}

/* ═══════════════════════════════════════════════════════════════════════════
   EXAM PLAYER  — always-open tutor split pane
═══════════════════════════════════════════════════════════════════════════ */
function ExamPlayer({exam,onBack,onScore,settings,addToast}){
  const[qi,setQi]=useState(0);
  const[sel,setSel]=useState(null);
  const[fb,setFb]=useState(false);
  const[score,setScore]=useState(0);
  const[done,setDone]=useState(false);
  const[tutorW,setTutorW]=useState(38);// % of width

  const handleTutorDrag=useCallback((x)=>{
    const pct=Math.max(25,Math.min(65,((window.innerWidth-x)/window.innerWidth)*100));
    setTutorW(pct);
  },[]);
  const startTutorDrag=useDrag(handleTutorDrag,[handleTutorDrag]);

  const qObj=exam.questions[qi];
  const q=qObj?.examQuestion?qObj.examQuestion:qObj;
  const pct=Math.round((qi/Math.max(exam.questions.length,1))*100);

  const pick=i=>{if(fb)return;setSel(i);setFb(true);if(i===q?.correct)setScore(s=>s+1);};
  const next=()=>{
    setSel(null);setFb(false);
    if(qi<exam.questions.length-1)setQi(qi+1);
    else{setDone(true);onScore?.(exam.id,Math.round(score/exam.questions.length*100));}
  };

  if(done){
    const fs=Math.round((score/exam.questions.length)*100);
    return(
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center overflow-y-auto">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center glass shadow-xl ${fs>=70?'bg-emerald-500/20 border border-emerald-500/30':'bg-red-500/20 border border-red-500/30'}`}>
          <span className={`text-4xl font-black ${fs>=70?'text-emerald-500':'text-red-500'}`}>{fs}%</span>
        </div>
        <h2 className="text-2xl font-black">Complete!</h2>
        <p className="opacity-50 text-sm">{score}/{exam.questions.length} correct</p>
        <p className={`font-bold ${fs>=70?'text-emerald-500':'text-red-500'}`}>{fs>=90?'Outstanding!':fs>=70?'Well done!':'Keep studying!'}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onBack} className="px-6 py-3 glass rounded-full text-xs font-black uppercase opacity-70 hover:opacity-100">Back</button>
          <button onClick={()=>{setQi(0);setScore(0);setSel(null);setFb(false);setDone(false);}} className="px-6 py-3 btn-accent rounded-full text-xs font-black uppercase shadow-lg">Retry</button>
        </div>
      </div>
    );
  }
  if(!q)return null;

  const examContent=(
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* exam header */}
      <div className="flex items-center justify-between px-4 py-2.5 glass border-b border-[var(--border)] shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-[10px] font-black uppercase opacity-60 hover:opacity-100"><ChevronLeft size={13}/> Exit</button>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{width:`${pct}%`}}/>
          </div>
          <span className="text-[10px] font-black glass px-2 py-1 rounded-lg">{qi+1}/{exam.questions.length}</span>
        </div>
      </div>
      {/* question content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {qObj?.vignette&&(
          <div className="mb-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-xs leading-relaxed whitespace-pre-wrap">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-2">Patient Vignette</span>
            {qObj.vignette}
          </div>
        )}
        {qObj?.labPanels?.length>0&&(
          <div className="mb-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1 mb-2"><FlaskConical size={11}/> Labs</span>
            {qObj.labPanels.map((lp,pi)=><div key={pi}><p className="text-[9px] font-black opacity-40 mb-1">{lp.panelName}</p><LabTable rows={lp.rows}/></div>)}
          </div>
        )}
        <h3 className="font-bold text-sm lg:text-base leading-relaxed mb-4">{q.q}</h3>
        <div className="space-y-2 mb-5">
          {(q.options||[]).map((opt,i)=>{
            const isSel=sel===i,isCorr=i===q.correct;
            return(
              <button key={i} onClick={()=>pick(i)} disabled={fb}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all text-xs leading-relaxed flex items-center gap-3
                  ${isSel?(isCorr?'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-bold':'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-bold')
                    :(fb&&isCorr?'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-bold':'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5')}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${(isSel||(fb&&isCorr))?(isCorr?'border-emerald-500':'border-red-500'):'border-[var(--border)]'}`}>
                  {(isSel||(fb&&isCorr))&&<div className={`w-2.5 h-2.5 rounded-full ${isCorr?'bg-emerald-500':'bg-red-500'}`}/>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
        {fb&&(
          <div className="animate-slide-in">
            <div className="p-4 bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-2xl mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] block mb-2">Explanation</span>
              <p className="text-xs leading-relaxed">{q.explanation}</p>
              {q.evidence&&<p className="mt-3 text-[10px] italic opacity-50 border-l-2 border-[var(--border)] pl-3">"{q.evidence}" — Pg {q.sourcePage}</p>}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <button onClick={()=>{if(qi>0){setQi(qi-1);setSel(null);setFb(false);}}} disabled={qi===0}
            className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase disabled:opacity-30 flex items-center gap-1">
            <ChevronLeft size={13}/> Prev
          </button>
          <button onClick={next} disabled={!fb}
            className="px-5 py-2.5 btn-accent rounded-xl text-[10px] font-black uppercase shadow-md disabled:opacity-40 flex items-center gap-1">
            {qi<exam.questions.length-1?'Next':'Finish'} <ChevronRight size={13}/>
          </button>
        </div>
        <div className="h-4"/>
      </div>
    </div>
  );

  const tutorContent=<TutorChat context={qObj} settings={settings} contextLabel={`question ${qi+1}`}/>;

  return(
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <SplitPane left={examContent} right={tutorContent} defaultSplit={100-tutorW} minLeft={40} maxLeft={80}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLASH PLAYER  — always-open tutor split pane
═══════════════════════════════════════════════════════════════════════════ */
function FlashPlayer({set,onBack,setFlashcards,settings,addToast}){
  const[cards,setCards]=useState(set.cards||[]);
  const[ci,setCi]=useState(0);
  const[flip,setFlip]=useState(false);
  const[stats,setStats]=useState({again:0,hard:0,good:0,easy:0});

  const card=cards[ci];
  const pct=Math.round((ci/Math.max(set.cards?.length||1,1))*100);

  const rate=q=>{
    const rk=q===0?'again':q===3?'hard':q===4?'good':'easy';setStats(p=>({...p,[rk]:p[rk]+1}));
    let nr=card.repetitions||0,ne=card.ef||2.5,ni=card.interval||1;
    if(q<3){nr=0;ni=1;}else{ne=Math.max(1.3,ne+(0.1-(5-q)*(0.08+(5-q)*0.02)));nr++;ni=nr===1?1:nr===2?6:Math.round(ni*ne);}
    const nc={...card,repetitions:nr,ef:ne,interval:ni,lastReview:Date.now(),nextReview:Date.now()+ni*86400000};
    setCards(p=>p.map(c=>c.id===nc.id?nc:c));
    setFlashcards(gs=>gs.map(s=>({...s,cards:s.cards?s.cards.map(c=>c.id===nc.id?nc:c):s.cards})));
    setFlip(false);
    if(ci<cards.length-1)setCi(ci+1);else setCards([]);
  };

  if(!cards.length)return(
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="w-24 h-24 rounded-full glass bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 size={48} className="text-emerald-500"/>
      </div>
      <h2 className="text-2xl font-black">Complete!</h2>
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {Object.entries(stats).map(([k,v])=>(
          <div key={k} className="glass rounded-xl p-3 text-center"><p className="text-xl font-black">{v}</p><p className="text-[8px] opacity-40 font-bold uppercase">{k}</p></div>
        ))}
      </div>
      <button onClick={onBack} className="px-8 py-3 btn-accent rounded-full text-xs font-black uppercase shadow-lg">Back</button>
    </div>
  );

  if(!card)return null;

  const cardContent=(
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 glass border-b border-[var(--border)] shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-[10px] font-black uppercase opacity-60 hover:opacity-100"><ChevronLeft size={13}/> Exit</button>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full hidden sm:block"><div className="h-full bg-[var(--accent)] rounded-full" style={{width:`${pct}%`}}/></div>
          <span className="text-[10px] font-black glass px-2 py-1 rounded-lg">{ci+1}/{set.cards?.length||cards.length}</span>
        </div>
      </div>
      {/* card area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div onClick={()=>!flip&&setFlip(true)}
          className={`w-full max-w-xl cursor-pointer mb-5 rounded-3xl border-2 bg-[var(--card)] overflow-hidden shadow-lg transition-all
            ${flip?'border-[var(--accent)]/50':'border-[var(--border)] hover:border-[var(--accent)]/30'}`}
          style={{minHeight:'180px'}}>
          {!flip?(
            <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-3">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-30 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">Question</span>
              <p className="font-bold text-sm lg:text-base leading-relaxed">{card.q}</p>
              <span className="text-[8px] text-[var(--accent)] font-black animate-pulse">TAP TO REVEAL</span>
            </div>
          ):(
            <div className="h-full flex flex-col p-5 gap-3" onClick={e=>e.stopPropagation()}>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg self-start">Answer</span>
              <p className="font-bold text-sm leading-relaxed flex-1">{card.a}</p>
              {card.evidence&&<p className="text-[10px] italic opacity-40 border-l-2 border-[var(--border)] pl-2">"{card.evidence}" — Pg {card.sourcePage}</p>}
            </div>
          )}
        </div>
        {/* SR buttons */}
        <div className={`w-full max-w-xl grid grid-cols-4 gap-2 transition-all ${flip?'opacity-100':'opacity-0 pointer-events-none'}`}>
          {[['Again',0,'red'],[`Hard`,3,'amber'],['Good',4,'emerald'],['Easy',5,'blue']].map(([l,q,c])=>(
            <button key={l} onClick={()=>rate(q)}
              className={`py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all hover:-translate-y-0.5 active:scale-95
                text-${c}-600 bg-${c}-50 dark:bg-${c}-900/20 border-${c}-200 dark:border-${c}-800/50 hover:bg-${c}-500 hover:text-white hover:border-${c}-500`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const tutorContent=<TutorChat context={card} settings={settings} contextLabel={`"${card.q?.substring(0,40)}…"`}/>;

  return(
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <SplitPane left={cardContent} right={tutorContent} defaultSplit={62} minLeft={40} maxLeft={80}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL VIEWS (Flashcards, Exams, Cases, Chat)
═══════════════════════════════════════════════════════════════════════════ */
function FlashcardsView({flashcards,setFlashcards,settings,addToast}){
  const[sel,setSel]=useState(null);
  if(sel)return<div className="flex-1 flex flex-col min-h-0 overflow-hidden"><FlashPlayer set={sel} onBack={()=>setSel(null)} setFlashcards={setFlashcards} settings={settings} addToast={addToast}/></div>;
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="p-4 lg:p-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-black text-[var(--accent)] mb-8 flex items-center gap-3"><Layers size={30}/> Card Vault</h1>
        {flashcards.length===0?<Empty icon={Layers} text="No flashcards. Open a PDF → AI Studio → Generate Cards"/>:(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map(s=>(
              <div key={s.id} className="glass rounded-2xl p-5 card-hover flex flex-col gap-4">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1">{s.title}</h3>
                <span className="text-[9px] font-black bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-lg w-fit">{s.cards?.length||0} Cards</span>
                <div className="flex gap-2 mt-auto">
                  <button onClick={()=>setSel(s)} className="flex-1 py-3 btn-accent rounded-xl text-xs font-black uppercase shadow-md">Study</button>
                  <button onClick={()=>setFlashcards(flashcards.filter(f=>f.id!==s.id))} className="w-11 h-11 glass rounded-xl flex items-center justify-center hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamsView({exams,setExams,settings,addToast}){
  const[sel,setSel]=useState(null);
  if(sel)return<div className="flex-1 flex flex-col min-h-0 overflow-hidden"><ExamPlayer exam={sel} onBack={()=>setSel(null)} onScore={(id,sc)=>setExams(p=>p.map(e=>e.id===id?{...e,lastScore:sc}:e))} settings={settings} addToast={addToast}/></div>;
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="p-4 lg:p-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-black text-rose-500 mb-8 flex items-center gap-3"><GraduationCap size={30}/> Exams</h1>
        {exams.length===0?<Empty icon={GraduationCap} text="No exams yet"/>:(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(e=>(
              <div key={e.id} className="glass rounded-2xl p-5 card-hover flex flex-col gap-4">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1">{e.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-1 rounded-lg">{e.questions.length} Qs</span>
                  {e.lastScore!==undefined&&<span className={`text-[9px] font-black px-2 py-1 rounded-lg ${e.lastScore>=70?'bg-emerald-500/10 text-emerald-500':'bg-red-500/10 text-red-500'}`}>{e.lastScore}%</span>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={()=>setSel(e)} className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-rose-600 text-white rounded-xl text-xs font-black uppercase shadow-md">Take Exam</button>
                  <button onClick={()=>setExams(exams.filter(x=>x.id!==e.id))} className="w-11 h-11 glass rounded-xl flex items-center justify-center hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CasesView({cases,setCases,settings,addToast}){
  const[sel,setSel]=useState(null);
  if(sel)return<div className="flex-1 flex flex-col min-h-0 overflow-hidden"><ExamPlayer exam={sel} onBack={()=>setSel(null)} onScore={(id,sc)=>setCases(p=>p.map(c=>c.id===id?{...c,lastScore:sc}:c))} settings={settings} addToast={addToast}/></div>;
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="p-4 lg:p-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-black text-blue-500 mb-8 flex items-center gap-3"><Activity size={30}/> Patient Cases</h1>
        {cases.length===0?<Empty icon={Activity} text="No cases yet"/>:(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map(c=>(
              <div key={c.id} className="glass rounded-2xl p-5 card-hover flex flex-col gap-4">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1">{c.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg">{c.questions?.length||0} Cases</span>
                  {c.lastScore!==undefined&&<span className={`text-[9px] font-black px-2 py-1 rounded-lg ${c.lastScore>=70?'bg-emerald-500/10 text-emerald-500':'bg-red-500/10 text-red-500'}`}>{c.lastScore}%</span>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={()=>setSel(c)} className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-md">Solve</button>
                  <button onClick={()=>setCases(cases.filter(x=>x.id!==c.id))} className="w-11 h-11 glass rounded-xl flex items-center justify-center hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({settings,sessions,setSessions}){
  const[sid,setSid]=useState(null);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const active=sessions.find(s=>s.id===sid)||null;
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[active?.messages,loading]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const id=sid||Date.now().toString(),msg=input;setInput('');
    const prevMsgs=!sid?[]:(sessions.find(s=>s.id===id)?.messages||[]);
    const msgs=[...prevMsgs,{role:'user',content:msg}];
    const title=!sid?msg.substring(0,40)+'…':sessions.find(s=>s.id===id)?.title;
    setSessions(p=>p.find(s=>s.id===id)?p.map(s=>s.id===id?{...s,messages:msgs}:s):[{id,title,messages:msgs,createdAt:new Date().toISOString()},...p]);
    if(!sid)setSid(id);setLoading(true);
    try{const r=await callAI(msg,false,false,settings,4000);setSessions(p=>p.map(s=>s.id===id?{...s,messages:[...s.messages,{role:'assistant',content:r}]}:s));}
    catch(e){setSessions(p=>p.map(s=>s.id===id?{...s,messages:[...s.messages,{role:'assistant',content:`⚠️ ${e.message}`}]}:s));}
    finally{setLoading(false);}
  };

  return(
    <div className="flex-1 flex min-h-0 h-full">
      {/* sidebar */}
      <div className="hidden md:flex w-60 flex-col glass border-t-0 border-b-0 border-l-0 shrink-0">
        <div className="p-3 border-b border-[var(--border)]">
          <button onClick={()=>setSid(null)} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-2.5 rounded-xl text-xs font-black uppercase">
            <PlusCircle size={14}/> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {sessions.length===0&&<p className="text-center text-[9px] opacity-30 font-bold uppercase p-4">No History</p>}
          {sessions.map(s=>(
            <div key={s.id} className="relative group mb-0.5">
              <button onClick={()=>setSid(s.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] transition-colors ${sid===s.id?'bg-[var(--accent)]/10 text-[var(--accent)] font-bold':'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <div className="truncate pr-5">{s.title}</div>
              </button>
              <button onClick={()=>setSessions(p=>p.filter(x=>x.id!==s.id))} className="absolute right-2 top-2.5 p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded-lg"><Trash size={11}/></button>
            </div>
          ))}
        </div>
      </div>
      {/* main */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 scroll-content">
          {!active?(
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center"><Sparkles size={28} className="text-[var(--accent)]"/></div>
              <h2 className="text-lg font-black">Medical AI Chat</h2>
              <p className="text-sm text-center max-w-xs">Ask any clinical or medical question.</p>
            </div>
          ):(
            <div className="max-w-3xl mx-auto space-y-4 pb-4">
              {active.messages.map((m,i)=>(
                <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden glass'}`}>
                    {m.role==='user'?<UserCircle2 size={17} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
                  </div>
                  <div className={`px-4 py-3 text-sm leading-relaxed max-w-[84%] whitespace-pre-wrap rounded-2xl
                    ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'glass rounded-tl-sm'}`}>{m.content}</div>
                </div>
              ))}
              {loading&&<div className="flex gap-3"><div className="w-9 h-9 rounded-xl overflow-hidden glass"><img src={MARIAM_IMG} className="w-full h-full object-cover opacity-40" alt="AI"/></div><div className="glass px-4 py-3 rounded-2xl flex gap-1.5">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}</div></div>}
              <div ref={endRef}/>
            </div>
          )}
        </div>
        <div className="shrink-0 p-4 border-t border-[var(--border)] bg-[var(--card)]"
          style={{paddingBottom:`calc(16px + ${NAV_H}px + env(safe-area-inset-bottom))`,paddingBottom:'calc(16px + 72px + env(safe-area-inset-bottom))'}}>
          <div className="max-w-3xl mx-auto flex gap-2 items-end glass rounded-2xl p-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Ask anything…" disabled={loading}
              className="flex-1 bg-transparent p-2 text-sm outline-none resize-none max-h-28 custom-scrollbar text-[var(--text)] min-h-[40px]"/>
            <button onClick={send} disabled={loading||!input.trim()} className="w-10 h-10 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0"><Send size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════════════════════════════════ */
function SettingsView({settings,setSettings}){
  const pr=PROVIDERS[settings.provider]||PROVIDERS.anthropic;
  const themes=[{id:'pure-white',label:'White',icon:Sun},{id:'light',label:'Soft',icon:CloudSun},{id:'dark',label:'Dark',icon:Moon},{id:'oled',label:'OLED',icon:MoonStar}];
  const accents=[{id:'indigo',hex:'#6366f1'},{id:'purple',hex:'#a855f7'},{id:'blue',hex:'#3b82f6'},{id:'emerald',hex:'#10b981'},{id:'rose',hex:'#f43f5e'}];
  const sizes=[{id:'small',label:'S',px:12},{id:'medium',label:'M',px:14},{id:'large',label:'L',px:16},{id:'xl',label:'XL',px:18}];
  const changeProvider=p=>{const pr=PROVIDERS[p];setSettings(s=>({...s,provider:p,baseUrl:pr.baseUrl,model:pr.defaultModel}));};

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-4">
        <h1 className="text-3xl font-black flex items-center gap-3 mb-6"><Settings size={28} className="opacity-40"/> Settings</h1>

        {/* AI Provider */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Globe size={16}/> AI Provider</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {Object.entries(PROVIDERS).map(([id,{label}])=>(
              <button key={id} onClick={()=>changeProvider(id)}
                className={`py-2.5 px-2 rounded-xl text-[10px] font-black leading-tight transition-all border
                  ${settings.provider===id?'bg-[var(--accent)] text-white border-transparent shadow-md scale-105':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}>
                {label.split(' ')[0]}<br/><span className="opacity-70 font-normal normal-case text-[9px]">{label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
          <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${pr.needsKey?'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300':'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}>
            {pr.needsKey?<AlertCircle size={14} className="shrink-0 mt-0.5"/>:<CheckCircle2 size={14} className="shrink-0 mt-0.5"/>}
            {pr.note}
          </div>
          {pr.needsKey&&(
            <div className="mb-3">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1.5 flex items-center gap-1"><KeyRound size={10}/>API Key</label>
              <input type="password" placeholder="Paste your API key…" value={settings.apiKey||''}
                onChange={e=>setSettings(s=>({...s,apiKey:e.target.value}))}
                className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)]"/>
            </div>
          )}
          {(settings.provider==='custom'||settings.provider==='ollama')&&(
            <div className="mb-3">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1.5">Base URL</label>
              <input type="text" placeholder="https://your-api.com" value={settings.baseUrl||''}
                onChange={e=>setSettings(s=>({...s,baseUrl:e.target.value}))}
                className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)]"/>
            </div>
          )}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1.5">Model (optional)</label>
            <input type="text" placeholder={pr.defaultModel||'e.g. gpt-4o'} value={settings.model||''}
              onChange={e=>setSettings(s=>({...s,model:e.target.value}))}
              className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)]"/>
            <p className="text-[9px] opacity-30 mt-1">Default: <code>{pr.defaultModel}</code></p>
          </div>
        </section>

        {/* Theme */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Palette size={16}/> Appearance</h2>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {themes.map(t=>(
              <button key={t.id} onClick={()=>setSettings({...settings,theme:t.id})}
                className={`py-4 flex flex-col items-center gap-2 rounded-xl text-[10px] font-black uppercase border transition-all
                  ${settings.theme===t.id?'bg-[var(--accent)] text-white border-transparent shadow-lg':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}>
                <t.icon size={18}/>{t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center mb-5">
            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest shrink-0">Accent</span>
            <div className="flex gap-2">
              {accents.map(a=>(
                <button key={a.id} onClick={()=>setSettings({...settings,accentColor:a.id})}
                  className={`w-8 h-8 rounded-xl transition-all ${settings.accentColor===a.id?'scale-125 ring-2 ring-offset-2 ring-current shadow-lg':''}`}
                  style={{backgroundColor:a.hex}}/>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest block mb-2">Font Size</span>
            <div className="flex gap-2 glass rounded-xl p-1.5">
              {sizes.map(s=>(
                <button key={s.id} onClick={()=>setSettings({...settings,fontSize:s.id})}
                  className={`flex-1 py-2 rounded-lg font-black transition-all ${settings.fontSize===s.id?'bg-[var(--accent)] text-white shadow-md':'opacity-50 hover:opacity-100'}`}
                  style={{fontSize:`${s.px}px`}}>{s.label}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Generation */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Brain size={16}/> Generation</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold opacity-60">Strict Mode (use only PDF text)</span>
            <div onClick={()=>setSettings(s=>({...s,strictMode:!s.strictMode}))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.strictMode?'bg-[var(--accent)]':'bg-gray-300 dark:bg-zinc-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.strictMode?'translate-x-5':'translate-x-1'}`}/>
            </div>
          </label>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MISSING ICON IMPORT FIX
═══════════════════════════════════════════════════════════════════════════ */
const Play=({size=16,...p})=><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><polygon points="5 3 19 12 5 21 5 3"/></svg>;