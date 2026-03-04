import React,{useState,useEffect,useRef,useCallback,useMemo}from'react';
/* mammoth and XLSX are loaded dynamically from CDN — no npm install needed */
import{BookOpen,Layers,CheckSquare,Settings,ChevronLeft,ChevronRight,MessageSquare,
CheckCircle2,Trash2,Loader2,Send,GraduationCap,Save,X,BookA,AlertCircle,FileUp,
Target,Trash,Sparkles,Activity,Stethoscope,Lightbulb,Baby,Pill,Thermometer,Zap,
Database,Search,Palette,Type,Moon,Sun,UserCircle2,ZoomIn,ZoomOut,Maximize,
PlusCircle,CloudSun,MoonStar,FileSearch,MessageCircleQuestion,FastForward,
FlaskConical,Info,Clipboard,KeyRound,Globe,GripVertical,BookMarked,Layers3,
Brain,ListChecks,FilePlus,AlignLeft,Hash,Image,FileText,FileCode,Table,
Map,Clock,Download,Share2,Star,Mic,MicOff,Network,BarChart2,Camera,
Languages,Wand2,Tag,TrendingUp,LayoutDashboard,Award,
ChevronDown,ChevronUp,Eye,EyeOff,RefreshCw,
Filter,SortAsc,Grid,List,Smartphone,Monitor,Code,
}from'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   DYNAMIC CDN LOADERS — no npm install needed
═══════════════════════════════════════════════════════════════════ */
const loadScript=(src,globalName)=>new Promise((res,rej)=>{
  if(window[globalName])return res(window[globalName]);
  const s=document.createElement('script');
  s.src=src;
  s.onload=()=>res(window[globalName]);
  s.onerror=()=>rej(new Error(`Failed to load ${globalName}`));
  document.head.appendChild(s);
});

const loadMammoth=()=>loadScript(
  'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  'mammoth'
);

const loadXLSX=()=>loadScript(
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'XLSX'
);


const MARIAM_IMG='https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';
const NAV_H=72;
const APP_VER='v5.0 ULTRA';
const CHUNK=3500;

/* ═══════════════════════════════════════════════════════════════════
   INDEXED DB
═══════════════════════════════════════════════════════════════════ */
const DB_NAME='MariamProDB_v50';
const openDB=()=>new Promise((res,rej)=>{
  const r=indexedDB.open(DB_NAME,8);
  r.onupgradeneeded=e=>{const d=e.target.result;
    ['files','appState'].forEach(s=>{if(!d.objectStoreNames.contains(s))d.createObjectStore(s);});};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
});
const dbOp=(store,mode,op)=>openDB().then(db=>new Promise((res,rej)=>{
  const tx=db.transaction(store,mode),s=tx.objectStore(store),r=op(s);
  if(r?.onsuccess!==undefined){r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}
  else{tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);}
}));
const saveFile=(id,d)=>dbOp('files','readwrite',s=>{s.put(d,id);});
const getFile=id=>dbOp('files','readonly',s=>s.get(id));
const delFile=id=>dbOp('files','readwrite',s=>{s.delete(id);});
const saveState=(k,v)=>dbOp('appState','readwrite',s=>{s.put(v,k);});
const getState=k=>dbOp('appState','readonly',s=>s.get(k));

/* ═══════════════════════════════════════════════════════════════════
   PDF.JS LOADER
═══════════════════════════════════════════════════════════════════ */
const loadPdfJs=async()=>{
  if(window.pdfjsLib)return window.pdfjsLib;
  return new Promise((res,rej)=>{
    const sc=document.createElement('script');
    sc.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    sc.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';res(window.pdfjsLib);};
    sc.onerror=rej;document.body.appendChild(sc);
  });
};

/* ═══════════════════════════════════════════════════════════════════
   FILE CATEGORY DETECTION
═══════════════════════════════════════════════════════════════════ */
const getFileCategory=(file)=>{
  const n=file.name.toLowerCase();const t=file.type||'';
  if(t==='application/pdf'||n.endsWith('.pdf'))return'pdf';
  if(t.includes('wordprocessingml')||t.includes('msword')||n.endsWith('.docx')||n.endsWith('.doc'))return'word';
  if(t.includes('spreadsheetml')||t.includes('ms-excel')||n.endsWith('.xlsx')||n.endsWith('.xls'))return'spreadsheet';
  if(n.endsWith('.csv')||t==='text/csv')return'csv';
  if(t.startsWith('image/'))return'image';
  const textExts=['.txt','.md','.markdown','.js','.ts','.jsx','.tsx','.py','.java','.c','.cpp','.go','.rs','.rb','.php','.html','.css','.json','.yaml','.yml','.xml','.sh','.bash','.zsh','.sql','.r','.swift','.kt','.dart','.vue','.svelte','.toml','.ini','.env','.log'];
  if(t.startsWith('text/')||textExts.some(e=>n.endsWith(e)))return'text';
  return'unknown';
};

const FILE_ICONS={
  pdf:{Icon:FileText,from:'from-red-500',to:'to-rose-600',label:'PDF'},
  word:{Icon:FileText,from:'from-blue-500',to:'to-blue-700',label:'Word'},
  spreadsheet:{Icon:Table,from:'from-emerald-500',to:'to-green-700',label:'Excel'},
  csv:{Icon:Table,from:'from-teal-500',to:'to-emerald-700',label:'CSV'},
  image:{Icon:Image,from:'from-purple-500',to:'to-violet-700',label:'Image'},
  text:{Icon:FileCode,from:'from-amber-500',to:'to-orange-600',label:'Text'},
  unknown:{Icon:FileUp,from:'from-slate-500',to:'to-slate-700',label:'File'},
};

/* ═══════════════════════════════════════════════════════════════════
   UNIVERSAL FILE EXTRACTOR
═══════════════════════════════════════════════════════════════════ */
const chunkText=(text)=>{
  const pages={};let page=1,cur='';
  const parts=text.split(/\n\n+/);
  for(const part of parts){
    if(!part.trim())continue;
    if(cur.length+part.length>CHUNK&&cur){pages[page++]=cur.trim();cur=part+'\n\n';}
    else cur+=part+'\n\n';
  }
  if(cur.trim())pages[page]=cur.trim();
  if(!Object.keys(pages).length)pages[1]=text.trim().substring(0,CHUNK)||'(empty)';
  return{pagesText:pages,totalPages:page};
};

const extractPdf=async(file,onProgress)=>{
  const ab=await file.arrayBuffer();
  const pdfjs=await loadPdfJs();
  const pdf=await pdfjs.getDocument({data:ab.slice(0)}).promise;
  const tot=pdf.numPages;const pagesText={};
  for(let i=1;i<=tot;i++){
    try{const pg=await pdf.getPage(i);const tc=await pg.getTextContent();pagesText[i]=tc.items.map(s=>s.str).join(' ');pg.cleanup();}
    catch{pagesText[i]='';}
    if(i%5===0)await new Promise(r=>setTimeout(r,0));
    if(onProgress)onProgress(i/tot);
  }
  try{await pdf.destroy();}catch{}
  return{buffer:ab,pagesText,totalPages:tot,fileCategory:'pdf'};
};

const extractWord=async(file)=>{
  const ab=await file.arrayBuffer();
  let text='';
  try{
    const mammoth=await loadMammoth();
    const r=await mammoth.extractRawText({arrayBuffer:ab});
    text=r.value||'';
  }catch(e){text=`Could not extract Word content: ${e.message}`;}
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'word'};
};

const extractSpreadsheet=async(file)=>{
  const ab=await file.arrayBuffer();
  let text='';
  try{
    const XLSX=await loadXLSX();
    const wb=XLSX.read(new Uint8Array(ab),{type:'array'});
    const parts=wb.SheetNames.map(name=>{
      const ws=wb.Sheets[name];
      const csv=XLSX.utils.sheet_to_csv(ws,{skipHidden:true});
      return`=== Sheet: ${name} ===\n${csv}`;
    });
    text=parts.join('\n\n');
  }catch(e){text=`Spreadsheet parse error: ${e.message}`;}
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'spreadsheet'};
};

const extractCsv=async(file)=>{
  const text=await file.text();
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'csv'};
};

const extractImage=async(file)=>{
  return new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const b64=e.target.result.split(',')[1];
      const pagesText={1:`[IMAGE FILE: ${file.name}]\nSize: ${(file.size/1024).toFixed(1)}KB\nType: ${file.type}\n\nThis is an image file. Use the AI Vision feature to analyze its content.`};
      res({pagesText,totalPages:1,imageBase64:b64,imageType:file.type||'image/jpeg',fileCategory:'image'});
    };
    reader.onerror=rej;
    reader.readAsDataURL(file);
  });
};

const extractText=async(file)=>{
  let text='';
  try{text=await file.text();}
  catch(e){text=`Could not read file: ${e.message}`;}
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'text'};
};

const extractUniversal=async(file,onProgress)=>{
  const cat=getFileCategory(file);
  switch(cat){
    case'pdf':return extractPdf(file,onProgress);
    case'word':return extractWord(file);
    case'spreadsheet':return extractSpreadsheet(file);
    case'csv':return extractCsv(file);
    case'image':return extractImage(file);
    default:return extractText(file);
  }
};

/* ═══════════════════════════════════════════════════════════════════
   AI ENGINE — multi-provider + vision + streaming
═══════════════════════════════════════════════════════════════════ */
const callAI=async(prompt,expectJson,strictMode,settings={},maxTokens=8000)=>{
  const{provider='anthropic',apiKey='',baseUrl='',model=''}=settings;
  const sys=strictMode
    ?'STRICT AI: Use ONLY the provided document text. NEVER add outside knowledge. Cite every answer with [Page X].'
    :'Expert AI assistant. Use the provided document as primary source. Be precise, detailed, and insightful.';
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
    if(!apiKey)throw new Error('Gemini API key required.');
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

const callAIWithVision=async(prompt,imageBase64,imageType,settings={},maxTokens=4000)=>{
  const{provider='anthropic',apiKey='',model=''}=settings;
  if(provider==='anthropic'){
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'Content-Type':'application/json',...(apiKey?{'x-api-key':apiKey}:{})},
      body:JSON.stringify({model:model||'claude-sonnet-4-20250514',max_tokens:Math.min(maxTokens,8192),
        messages:[{role:'user',content:[
          {type:'image',source:{type:'base64',media_type:imageType,data:imageBase64}},
          {type:'text',text:prompt}
        ]}]})});
    if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||r.statusText);}
    const d=await r.json();return d.content[0].text.trim();
  }
  // Fallback for non-vision providers
  return callAI(`[Image file provided. Describe based on filename context]\n${prompt}`,false,false,settings,maxTokens);
};

const callAIStreaming=async(prompt,onChunk,settings={},maxTokens=4000)=>{
  const{provider='anthropic',apiKey='',model=''}=settings;
  if(provider!=='anthropic'){
    const full=await callAI(prompt,false,false,settings,maxTokens);
    onChunk(full);return full;
  }
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'Content-Type':'application/json',...(apiKey?{'x-api-key':apiKey}:{})},
    body:JSON.stringify({model:model||'claude-sonnet-4-20250514',max_tokens:Math.min(maxTokens,8192),
      stream:true,messages:[{role:'user',content:prompt}]})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||r.statusText);}
  const reader=r.body.getReader();const decoder=new TextDecoder();let text='';
  while(true){
    const{done,value}=await reader.read();if(done)break;
    const lines=decoder.decode(value,{stream:true}).split('\n');
    for(const line of lines){
      if(!line.startsWith('data: '))continue;
      try{const d=JSON.parse(line.slice(6));
        if(d.type==='content_block_delta'&&d.delta?.type==='text_delta'){
          text+=d.delta.text;onChunk(text);
        }
      }catch{}
    }
  }
  return text;
};

const parseJson=txt=>{
  let c=txt.replace(/```json/gi,'').replace(/```/g,'').trim();
  const f=c.indexOf('{'),l=c.lastIndexOf('}');
  if(f!==-1&&l!==-1)c=c.substring(f,l+1);
  return JSON.parse(c);
};

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

/* ═══════════════════════════════════════════════════════════════════
   PWA SETUP
═══════════════════════════════════════════════════════════════════ */
const setupPWA=()=>{
  // Manifest
  const manifest={
    name:'MARIAM PRO',short_name:'MARIAM',description:'Universal AI Document Intelligence',
    start_url:'/',display:'standalone',orientation:'any',
    background_color:'#ffffff',theme_color:'#6366f1',
    icons:[
      {src:MARIAM_IMG,sizes:'192x192',type:'image/jpeg',purpose:'any maskable'},
      {src:MARIAM_IMG,sizes:'512x512',type:'image/jpeg',purpose:'any maskable'},
    ],
    categories:['education','productivity','medical'],
    screenshots:[],
    shortcuts:[
      {name:'Library',url:'/'},
      {name:'Flashcards',url:'/'},
    ]
  };
  try{
    const mBlob=new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'});
    const mUrl=URL.createObjectURL(mBlob);
    let link=document.querySelector('link[rel="manifest"]');
    if(!link){link=document.createElement('link');link.rel='manifest';document.head.appendChild(link);}
    link.href=mUrl;
  }catch{}

  // Meta tags for iOS & Android
  const metas=[
    {name:'mobile-web-app-capable',content:'yes'},
    {name:'apple-mobile-web-app-capable',content:'yes'},
    {name:'apple-mobile-web-app-status-bar-style',content:'black-translucent'},
    {name:'apple-mobile-web-app-title',content:'MARIAM PRO'},
    {name:'theme-color',content:'#6366f1'},
    {name:'msapplication-navbutton-color',content:'#6366f1'},
    {name:'msapplication-starturl',content:'/'},
  ];
  metas.forEach(({name,content})=>{
    let m=document.querySelector(`meta[name="${name}"]`);
    if(!m){m=document.createElement('meta');m.name=name;document.head.appendChild(m);}
    m.content=content;
  });

  // Apple touch icon
  let apl=document.querySelector('link[rel="apple-touch-icon"]');
  if(!apl){apl=document.createElement('link');apl.rel='apple-touch-icon';document.head.appendChild(apl);}
  apl.href=MARIAM_IMG;

  // Service Worker (best-effort, may fail in sandboxed environments)
  if('serviceWorker' in navigator){
    const swCode=`
const CACHE='mariam-v5';
const OFFLINE_RESP=new Response('MARIAM PRO is cached and ready!',{headers:{'Content-Type':'text/plain'}});
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/'])).catch(()=>{})));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const rc=r.clone();caches.open(CACHE).then(c=>c.put(e.request,rc)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(r=>r||OFFLINE_RESP)));
});
    `;
    try{
      const swBlob=new Blob([swCode],{type:'application/javascript'});
      const swUrl=URL.createObjectURL(swBlob);
      navigator.serviceWorker.register(swUrl).catch(()=>{});
    }catch{}
  }
};

/* ═══════════════════════════════════════════════════════════════════
   TOAST HOOK
═══════════════════════════════════════════════════════════════════ */
function useToast(){
  const[toasts,setToasts]=useState([]);
  const add=useCallback((msg,type='success',dur=3500)=>{
    const id=Date.now()+Math.random();
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
          ${t.type==='success'?'bg-emerald-500 text-white':t.type==='error'?'bg-red-500 text-white':t.type==='warn'?'bg-amber-500 text-white':'bg-[var(--card)] border border-[var(--border)] text-[var(--text)]'}`}>
          {t.type==='success'?<CheckCircle2 size={15}/>:t.type==='error'?<AlertCircle size={15}/>:<Info size={15}/>}
          <span className="truncate max-w-[280px]">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DRAG HOOK
═══════════════════════════════════════════════════════════════════ */
function useDrag(onDrag,deps=[]){
  const dragging=useRef(false);
  const start=useCallback(e=>{
    e.preventDefault();dragging.current=true;
    document.body.style.userSelect='none';document.body.style.webkitUserSelect='none';
    const move=ev=>{
      if(!dragging.current)return;
      const x=ev.touches?.[0]?.clientX??ev.clientX;
      const y=ev.touches?.[0]?.clientY??ev.clientY;
      if(x!==undefined)onDrag(x,y);
    };
    const up=()=>{
      dragging.current=false;
      document.body.style.userSelect='';document.body.style.webkitUserSelect='';
      document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);
    };
    document.addEventListener('mousemove',move,{passive:false});document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',up);
  },[onDrag,...deps]);
  return start;
}

/* ═══════════════════════════════════════════════════════════════════
   FILE ICON COMPONENT
═══════════════════════════════════════════════════════════════════ */
function FileCover({category,className='h-28 lg:h-32',name=''}){
  const cfg=FILE_ICONS[category]||FILE_ICONS.unknown;
  const Icon=cfg.Icon;
  return(
    <div className={`bg-gradient-to-br ${cfg.from} ${cfg.to} flex flex-col items-center justify-center gap-2 ${className}`}>
      <Icon size={36} className="text-white opacity-60"/>
      <span className="text-white text-[9px] font-black uppercase tracking-widest opacity-70 px-2 py-0.5 bg-black/20 rounded-full">{cfg.label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MIND MAP COMPONENT
═══════════════════════════════════════════════════════════════════ */
function MindMap({data}){
  if(!data?.topic)return<div className="flex items-center justify-center h-full opacity-40 text-sm font-bold">No mind map data</div>;
  const branches=data.branches||[];
  const W=700,H=500,cx=W/2,cy=H/2,r1=160,r2=260;
  const branchAngles=branches.map((_,i)=>((2*Math.PI*i)/branches.length)-(Math.PI/2));
  const COLORS=['#6366f1','#a855f7','#3b82f6','#10b981','#f43f5e','#f59e0b','#06b6d4','#84cc16'];

  return(
    <div className="w-full overflow-auto custom-scrollbar p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[420px]" xmlns="http://www.w3.org/2000/svg">
        {/* Radial gradient bg */}
        <defs>
          <radialGradient id="mmBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.05"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
          {branches.map((_,i)=>(
            <marker key={i} id={`arrow${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS[i%COLORS.length]} opacity="0.6"/>
            </marker>
          ))}
        </defs>
        <rect width={W} height={H} fill="url(#mmBg)" rx="16"/>

        {/* Branch connections & nodes */}
        {branches.map((branch,i)=>{
          const ang=branchAngles[i];const col=COLORS[i%COLORS.length];
          const bx=cx+r1*Math.cos(ang),by=cy+r1*Math.sin(ang);
          const subs=branch.subtopics||branch.children||[];
          return(
            <g key={i}>
              {/* Center → Branch */}
              <line x1={cx} y1={cy} x2={bx} y2={by} stroke={col} strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 2"/>
              {/* Sub connections */}
              {subs.slice(0,4).map((sub,j)=>{
                const subCount=Math.min(subs.length,4);
                const spanAngle=subCount>1?(Math.PI/3):0;
                const startAng=ang-(spanAngle/2);
                const subAng=subCount>1?startAng+(j/(subCount-1))*spanAngle:ang;
                const sx=cx+r2*Math.cos(subAng),sy=cy+r2*Math.sin(subAng);
                return(
                  <g key={j}>
                    <line x1={bx} y1={by} x2={sx} y2={sy} stroke={col} strokeWidth="1.5" strokeOpacity="0.3"/>
                    <circle cx={sx} cy={sy} r="24" fill={col} fillOpacity="0.08" stroke={col} strokeWidth="1" strokeOpacity="0.3"/>
                    <foreignObject x={sx-30} y={sy-18} width="60" height="36">
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{fontSize:'8px',textAlign:'center',color:'var(--text)',fontWeight:700,lineHeight:1.2,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>
                        {typeof sub==='string'?sub:(sub.label||sub)}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
              {/* Branch node */}
              <ellipse cx={bx} cy={by} rx="42" ry="20" fill={col} fillOpacity="0.15" stroke={col} strokeWidth="2" strokeOpacity="0.6"/>
              <foreignObject x={bx-40} y={by-16} width="80" height="32">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{fontSize:'9px',textAlign:'center',color:'var(--text)',fontWeight:800,lineHeight:1.2,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                  {branch.label}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Center node */}
        <circle cx={cx} cy={cy} r="50" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="3"/>
        <circle cx={cx} cy={cy} r="42" fill="var(--accent)" fillOpacity="0.2"/>
        <foreignObject x={cx-38} y={cy-24} width="76" height="48">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{fontSize:'10px',textAlign:'center',color:'var(--accent)',fontWeight:900,lineHeight:1.2,display:'flex',alignItems:'center',justifyContent:'center',height:'100%',overflow:'hidden'}}>
            {data.topic}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIMELINE COMPONENT
═══════════════════════════════════════════════════════════════════ */
function TimelineView({events=[]}){
  if(!events.length)return<div className="flex items-center justify-center h-32 opacity-40 text-sm font-bold">No timeline data</div>;
  return(
    <div className="relative pl-8 space-y-4">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/40 to-transparent"/>
      {events.map((ev,i)=>(
        <div key={i} className="relative">
          <div className="absolute -left-5 w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] flex items-center justify-center text-[8px] text-white font-black">{i+1}</div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">{ev.date||ev.time||ev.year||''}</span>
              {ev.page&&<span className="text-[9px] opacity-40 font-mono">p.{ev.page}</span>}
            </div>
            <p className="text-xs font-bold leading-relaxed">{ev.event||ev.title||ev.description||ev}</p>
            {ev.significance&&<p className="text-[10px] opacity-60 mt-1 italic">{ev.significance}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LAB TABLE
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   SPLIT PANE
═══════════════════════════════════════════════════════════════════ */
function SplitPane({left,right,defaultSplit=60,minLeft=30,maxLeft=85,direction='vertical'}){
  const[split,setSplit]=useState(defaultSplit);
  const containerRef=useRef(null);
  const handleDrag=useCallback((x,y)=>{
    const el=containerRef.current;if(!el)return;
    const rect=el.getBoundingClientRect();
    if(direction==='vertical'){const pct=Math.max(minLeft,Math.min(maxLeft,((x-rect.left)/rect.width)*100));setSplit(pct);}
    else{const pct=Math.max(minLeft,Math.min(maxLeft,((y-rect.top)/rect.height)*100));setSplit(pct);}
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

/* ═══════════════════════════════════════════════════════════════════
   TUTOR CHAT — streaming + voice input
═══════════════════════════════════════════════════════════════════ */
function TutorChat({context,settings,contextLabel=''}){
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[listening,setListening]=useState(false);
  const endRef=useRef(null);const prevCtx=useRef(null);
  const recogRef=useRef(null);

  useEffect(()=>{
    const key=JSON.stringify(context);
    if(prevCtx.current!==key){prevCtx.current=key;
      if(context)setMsgs([{role:'assistant',content:`Ready! Ask me anything about ${contextLabel||'this content'}.`}]);}
  },[context,contextLabel]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const toggleVoice=()=>{
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert('Voice input not supported in this browser.');return;}
    const r=new SR();r.continuous=false;r.interimResults=true;
    r.onresult=e=>{const t=Array.from(e.results).map(r=>r[0].transcript).join('');setInput(t);};
    r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.start();recogRef.current=r;setListening(true);
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const msg=input;setInput('');
    const newMsgs=[...msgs,{role:'user',content:msg}];
    setMsgs([...newMsgs,{role:'assistant',content:''}]);setLoading(true);
    try{
      const hist=newMsgs.slice(-6).map(m=>`${m.role==='user'?'STUDENT':'TUTOR'}: ${m.content}`).join('\n');
      const prompt=`Expert tutor. Document context:\n${JSON.stringify(context,null,2)}\n\nConversation:\n${hist}\n\nStudent: ${msg}\n\nAnswer concisely but completely.`;
      await callAIStreaming(prompt,chunk=>{setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:chunk}]);},settings,3000);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  return(
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
        <img src={MARIAM_IMG} className="w-7 h-7 rounded-lg object-cover" alt="AI"/>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">AI Tutor</span>
        {loading&&<div className="ml-auto flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 min-h-0">
        {msgs.length===0&&<div className="flex flex-col items-center justify-center h-full opacity-40 text-center"><Brain size={32} className="mb-2"/><p className="text-[10px] font-bold">Ask me anything</p></div>}
        {msgs.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden'}`}>
              {m.role==='user'?<UserCircle2 size={13} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
            </div>
            <div className={`px-3 py-2 text-[11px] leading-relaxed max-w-[85%] rounded-2xl whitespace-pre-wrap
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'bg-[var(--card)] border border-[var(--border)] rounded-tl-sm'}`}>
              {m.content||<span className="opacity-40">thinking…</span>}
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0 p-2 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask tutor…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[11px] outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24"/>
          <button onClick={toggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${listening?'bg-red-500 text-white animate-pulse':'glass text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}>
            {listening?<MicOff size={14}/>:<Mic size={14}/>}
          </button>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0">
            <Send size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROVIDER PRESETS
═══════════════════════════════════════════════════════════════════ */
const PROVIDERS={
  anthropic:{label:'Claude (Anthropic)',note:'Works built-in — no API key needed in Claude artifacts.',needsKey:false,defaultModel:'claude-sonnet-4-20250514',baseUrl:''},
  openai:   {label:'OpenAI (GPT)',       note:'Requires an OpenAI API key.',needsKey:true,defaultModel:'gpt-4o-mini',baseUrl:'https://api.openai.com'},
  gemini:   {label:'Google Gemini',      note:'Requires a Google AI Studio API key.',needsKey:true,defaultModel:'gemini-2.0-flash',baseUrl:''},
  deepseek: {label:'DeepSeek',           note:'Requires a DeepSeek API key.',needsKey:true,defaultModel:'deepseek-chat',baseUrl:'https://api.deepseek.com'},
  groq:     {label:'Groq (Ultra-fast)',  note:'Requires a Groq API key. Blazing fast inference.',needsKey:true,defaultModel:'llama-3.3-70b-versatile',baseUrl:'https://api.groq.com/openai'},
  ollama:   {label:'Ollama (Local)',     note:'Local inference — no API key needed.',needsKey:false,defaultModel:'llama3',baseUrl:'http://localhost:11434/v1'},
  custom:   {label:'Custom API',         note:'Any OpenAI-compatible endpoint.',needsKey:true,defaultModel:'',baseUrl:''},
};
const DEFAULT_SETTINGS={provider:'anthropic',apiKey:'',baseUrl:'',model:'',strictMode:false,theme:'pure-white',fontSize:'medium',accentColor:'indigo'};

/* ═══════════════════════════════════════════════════════════════════
   VIEW WRAPPER
═══════════════════════════════════════════════════════════════════ */
const ViewWrapper=({active,children})=>(
  <div className={`absolute inset-0 flex flex-col ${active?'z-10 pointer-events-auto opacity-100':'z-0 pointer-events-none opacity-0'}`}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   LIBRARY VIEW — with drag-drop, file types, stats
═══════════════════════════════════════════════════════════════════ */
function LibraryView({docs,uploading,onUpload,onOpen,onDelete,flashcards,exams,cases,notes}){
  const[search,setSearch]=useState('');
  const[sortBy,setSortBy]=useState('date');
  const[viewMode,setViewMode]=useState('grid');
  const[dragging,setDragging]=useState(false);
  const inputRef=useRef(null);
  const allStats=useMemo(()=>({
    docs:docs.length,
    cards:flashcards.reduce((s,set)=>s+(set.cards?.length||0),0),
    exams:exams.reduce((s,e)=>s+(e.questions?.length||0),0),
    cases:cases.length,
  }),[docs,flashcards,exams,cases]);

  const filtered=useMemo(()=>{
    let d=docs.filter(doc=>doc.name.toLowerCase().includes(search.toLowerCase()));
    if(sortBy==='date')d=[...d].sort((a,b)=>new Date(b.addedAt)-new Date(a.addedAt));
    else if(sortBy==='name')d=[...d].sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==='type')d=[...d].sort((a,b)=>(a.fileCategory||'pdf').localeCompare(b.fileCategory||'pdf'));
    return d;
  },[docs,search,sortBy]);

  const handleDrop=useCallback(e=>{
    e.preventDefault();setDragging(false);
    const files=Array.from(e.dataTransfer.files);
    if(files.length)onUpload({target:{files}});
  },[onUpload]);

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content"
      onDragOver={e=>{e.preventDefault();setDragging(true);}}
      onDragLeave={()=>setDragging(false)}
      onDrop={handleDrop}>
      {/* Drop overlay */}
      {dragging&&(
        <div className="fixed inset-0 z-[9998] bg-[var(--accent)]/20 border-4 border-dashed border-[var(--accent)] flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--accent)] text-white rounded-3xl px-8 py-6 text-center shadow-2xl">
            <FileUp size={48} className="mx-auto mb-3 animate-bounce"/>
            <p className="text-xl font-black">Drop any files here!</p>
            <p className="text-sm opacity-80 mt-1">PDF, Word, Excel, Images, Code — all welcome</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-5">
        {/* Stats bar */}
        {docs.length>0&&(
          <div className="grid grid-cols-4 gap-3">
            {[
              {label:'Documents',val:allStats.docs,icon:BookOpen,color:'text-[var(--accent)]'},
              {label:'Flashcards',val:allStats.cards,icon:Layers,color:'text-emerald-500'},
              {label:'Questions',val:allStats.exams,icon:CheckSquare,color:'text-blue-500'},
              {label:'Cases',val:allStats.cases,icon:Activity,color:'text-purple-500'},
            ].map(({label,val,icon:Icon,color})=>(
              <div key={label} className="glass rounded-2xl p-3 text-center">
                <Icon size={18} className={`mx-auto mb-1 ${color}`}/>
                <div className={`text-xl font-black ${color}`}>{val}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex-none">Library</h1>
          <div className="flex-1 min-w-[160px] relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…"
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none border border-[var(--border)] focus:border-[var(--accent)]/50 text-[var(--text)]"/>
            <Search className="absolute left-2.5 top-3 opacity-30" size={14}/>
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="glass border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs font-black outline-none text-[var(--text)] bg-[var(--card)] cursor-pointer">
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
            <div className="flex glass rounded-xl overflow-hidden border border-[var(--border)]">
              <button onClick={()=>setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode==='grid'?'bg-[var(--accent)] text-white':'opacity-50 hover:opacity-100'}`}><Grid size={14}/></button>
              <button onClick={()=>setViewMode('list')} className={`p-2.5 transition-colors ${viewMode==='list'?'bg-[var(--accent)] text-white':'opacity-50 hover:opacity-100'}`}><List size={14}/></button>
            </div>
            <label className={`btn-accent flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg cursor-pointer whitespace-nowrap ${uploading?'opacity-50 pointer-events-none':''}`}>
              {uploading?<Loader2 size={16} className="animate-spin"/>:<FileUp size={16}/>}
              {uploading?'Uploading…':'Import Files'}
              <input ref={inputRef} type="file" multiple className="hidden" onChange={onUpload} disabled={uploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.go,.rs,.rb,.php,.html,.css,.json,.yaml,.yml,.xml,.sh,.sql,.r,.swift,.kt,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"/>
            </label>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length===0&&(
          <div className="glass border-dashed border-2 border-[var(--border)] rounded-3xl p-12 lg:p-16 text-center flex flex-col items-center gap-4"
            onClick={()=>inputRef.current?.click()}>
            <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center">
              <FileUp size={40} className="text-[var(--accent)] opacity-60"/>
            </div>
            <div>
              <h2 className="text-xl font-black opacity-70">{search?'No results found':'Drop any file to begin'}</h2>
              <p className="text-sm opacity-40 mt-1">PDF · Word · Excel · CSV · Images · Code · Text — everything works</p>
            </div>
            {!search&&<button className="btn-accent px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg">Browse Files</button>}
          </div>
        )}

        {/* Grid view */}
        {filtered.length>0&&viewMode==='grid'&&(
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filtered.map(doc=>{
              const nCards=flashcards.filter(f=>f.docId===doc.id).reduce((s,set)=>s+(set.cards?.length||0),0);
              const nExams=exams.filter(e=>e.docId===doc.id).length;
              const nCases=cases.filter(c=>c.docId===doc.id).length;
              const cat=doc.fileCategory||'pdf';
              return(
                <div key={doc.id} onClick={()=>onOpen(doc.id)} className="card-hover glass rounded-2xl overflow-hidden flex flex-col relative group cursor-pointer">
                  <button onClick={ev=>onDelete(doc.id,ev)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-red-500 rounded-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13}/>
                  </button>
                  {cat==='image'&&doc.imagePreview
                    ?<div className="h-28 lg:h-32 overflow-hidden"><img src={doc.imagePreview} className="w-full h-full object-cover" alt={doc.name}/></div>
                    :<FileCover category={cat} name={doc.name}/>
                  }
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-[11px] lg:text-xs leading-snug line-clamp-2 flex-1">{doc.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] opacity-40 font-mono">{doc.totalPages} {cat==='image'?'view':'pages'}</span>
                      <span className="text-[8px] font-black uppercase text-[var(--accent)] opacity-60">{(FILE_ICONS[cat]||FILE_ICONS.unknown).label}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {nCards>0&&<span className="text-[8px] font-bold px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md">{nCards} Cards</span>}
                      {nExams>0&&<span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">{nExams} Exams</span>}
                      {nCases>0&&<span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-md">{nCases} Cases</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {filtered.length>0&&viewMode==='list'&&(
          <div className="space-y-2">
            {filtered.map(doc=>{
              const cat=doc.fileCategory||'pdf';
              const cfg=FILE_ICONS[cat]||FILE_ICONS.unknown;
              const Icon=cfg.Icon;
              const nCards=flashcards.filter(f=>f.docId===doc.id).reduce((s,set)=>s+(set.cards?.length||0),0);
              return(
                <div key={doc.id} onClick={()=>onOpen(doc.id)} className="card-hover glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.from} ${cfg.to} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className="text-white opacity-80"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{doc.name}</div>
                    <div className="text-[10px] opacity-40 mt-0.5">{cfg.label} · {doc.totalPages} pages · {new Date(doc.addedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {nCards>0&&<span className="text-[9px] font-bold px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">{nCards} cards</span>}
                    <button onClick={ev=>onDelete(doc.id,ev)} className="w-8 h-8 hover:bg-red-500/10 hover:text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14}/>
                    </button>
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

/* ═══════════════════════════════════════════════════════════════════
   DOCUMENT WORKSPACE — PDF canvas + text/image viewer
═══════════════════════════════════════════════════════════════════ */
function DocWorkspace({activeDoc,setDocs,currentPage,setCurrentPage,openDocs,closeTab,setActiveId,docs,onBack}){
  const[pdf,setPdf]=useState(null);
  const[loading,setLoading]=useState(true);
  const[scale,setScale]=useState(1);
  const[dims,setDims]=useState({w:0,h:0});
  const[pageText,setPageText]=useState('');
  const[imageData,setImageData]=useState(null);
  const canvasRef=useRef(null);const containerRef=useRef(null);
  const textRef=useRef(null);const renderRef=useRef(null);const pdfRef=useRef(null);
  const cat=activeDoc?.fileCategory||'pdf';
  const isPdf=cat==='pdf';

  useEffect(()=>{
    if(!activeDoc?.id)return;
    let mounted=true;setLoading(true);setPdf(null);setPageText('');setImageData(null);
    if(pdfRef.current){try{pdfRef.current.destroy();}catch{}pdfRef.current=null;}
    (async()=>{
      try{
        const data=await getFile(activeDoc.id);if(!data||!mounted)return;
        if(isPdf){
          const pdfjs=await loadPdfJs();
          const loaded=await pdfjs.getDocument({data:(data.buffer||data).slice(0)}).promise;
          if(mounted){pdfRef.current=loaded;setPdf(loaded);}
          else{try{loaded.destroy();}catch{}}
        }else if(cat==='image'){
          if(mounted&&data.imageBase64)setImageData(`data:${data.imageType||'image/jpeg'};base64,${data.imageBase64}`);
        }else{
          if(mounted&&data.pagesText)setPageText(data.pagesText[currentPage]||'');
        }
      }catch(e){console.error(e);}
      finally{if(mounted)setLoading(false);}
    })();
    return()=>{mounted=false;};
  },[activeDoc?.id,cat]);

  useEffect(()=>{
    if(!isPdf)return;
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
  },[currentPage,pdf,scale,isPdf]);

  // For non-PDF: load page text on page change
  useEffect(()=>{
    if(isPdf||cat==='image'||!activeDoc)return;
    (async()=>{
      try{const data=await getFile(activeDoc.id);if(data?.pagesText)setPageText(data.pagesText[currentPage]||'');}
      catch{}
    })();
  },[currentPage,isPdf,cat,activeDoc]);

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
  const cfg=FILE_ICONS[cat]||FILE_ICONS.unknown;

  return(
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="h-12 glass flex items-center gap-2 px-3 shrink-0 border-t-0 border-x-0">
        <button onClick={onBack} className="w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 shrink-0"><ChevronLeft size={16}/></button>
        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cfg.from} ${cfg.to} flex items-center justify-center shrink-0`}>
          <cfg.Icon size={11} className="text-white"/>
        </div>
        <span className="font-bold text-xs truncate flex-1 min-w-0">{activeDoc.name}</span>
        {isPdf&&(
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={()=>setScale(s=>Math.max(s-.2,.5))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomOut size={13}/></button>
            <button onClick={()=>setScale(1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><Maximize size={13}/></button>
            <button onClick={()=>setScale(s=>Math.min(s+.2,4))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomIn size={13}/></button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      {openDocs.length>1&&(
        <div className="flex gap-1.5 px-3 py-1.5 border-b border-[var(--border)] overflow-x-auto custom-scrollbar shrink-0 bg-[var(--card)]">
          {openDocs.map(id=>{
            const doc=docs.find(d=>d.id===id);if(!doc)return null;
            const dc=FILE_ICONS[doc.fileCategory||'pdf']||FILE_ICONS.pdf;
            return(
              <div key={id} onClick={()=>setActiveId(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer text-[10px] font-bold shrink-0 transition-colors
                  ${id===activeDoc.id?'bg-[var(--accent)] text-white':'glass hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <dc.Icon size={10}/>
                <span className="truncate max-w-[80px]">{doc.name}</span>
                <button onClick={e=>{e.stopPropagation();closeTab(id);}} className="opacity-60 hover:opacity-100 ml-0.5"><X size={10}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* Content area */}
      <div ref={containerRef} className="flex-1 overflow-auto custom-scrollbar min-h-0 bg-zinc-200 dark:bg-zinc-900">
        {loading?(
          <div className="flex items-center justify-center h-full gap-3 text-[var(--accent)]">
            <Loader2 size={28} className="animate-spin"/><span className="text-xs font-bold opacity-50">Loading…</span>
          </div>
        ):isPdf&&pdf?(
          <div className="p-2 pb-20 lg:pb-4 flex justify-center">
            <div className="relative bg-white shadow-2xl" style={{width:dims.w?`${dims.w}px`:'100%',height:dims.h?`${dims.h}px`:'auto'}}>
              <canvas ref={canvasRef}/>
              <div ref={textRef} style={{position:'absolute',inset:0,overflow:'hidden',opacity:1,lineHeight:1,userSelect:'text'}}/>
            </div>
          </div>
        ):cat==='image'&&imageData?(
          <div className="flex items-center justify-center p-4 pb-20 lg:pb-4 min-h-full">
            <img src={imageData} alt={activeDoc.name} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"/>
          </div>
        ):(
          <div className="p-4 pb-20 lg:pb-4 max-w-4xl mx-auto">
            <div className="bg-[var(--card)] rounded-2xl p-6 shadow-sm border border-[var(--border)] min-h-[60vh]">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-[var(--text)] opacity-90 break-words">{pageText||'(No content on this page)'}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Page nav */}
      <div className="h-14 glass flex items-center justify-center gap-3 shrink-0 border-t border-[var(--border)] border-x-0 border-b-0
        fixed bottom-[72px] left-0 right-0 z-[200] lg:relative lg:bottom-auto lg:z-auto"
        style={{bottom:`calc(${NAV_H}px + env(safe-area-inset-bottom))`}}>
        <button onClick={()=>nav(-1)} disabled={currentPage<=1} className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95"><ChevronLeft size={18}/></button>
        <div className="px-4 py-2 glass rounded-xl font-mono text-sm font-bold border border-[var(--border)] min-w-[90px] text-center">
          <span className="text-[var(--accent)]">{currentPage}</span> / {activeDoc.totalPages}
        </div>
        <button onClick={()=>nav(1)} disabled={currentPage>=activeDoc.totalPages}
          className="w-10 h-10 btn-accent rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 shadow-md"><ChevronRight size={18}/></button>
      </div>
      <div className="h-14 lg:hidden shrink-0"/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE PANEL — all AI tools including new ones
═══════════════════════════════════════════════════════════════════ */
function GeneratePanel({activeDoc,bgTask,onStart,onClear,setFlashcards,setExams,setCases,setNotes,onVault,currentPage,addToast,settings,mindMaps,setMindMaps,timelines,setTimelines}){
  const[startPage,setStartPage]=useState(currentPage);
  const[endPage,setEndPage]=useState(currentPage);
  const[entireFile,setEntireFile]=useState(false);
  const[type,setType]=useState('exam');
  const[count,setCount]=useState(20);
  const[difficulty,setDifficulty]=useState(2);
  const[targetLang,setTargetLang]=useState('Spanish');
  const levels=['Hard','Expert','Insane'];

  useEffect(()=>{if(!bgTask){setStartPage(currentPage);if(!entireFile)setEndPage(currentPage);}},[currentPage,bgTask]);
  useEffect(()=>{if(entireFile&&activeDoc){setStartPage(1);setEndPage(activeDoc.totalPages);}},[entireFile,activeDoc]);

  if(!activeDoc)return<div className="flex-1 flex items-center justify-center text-sm opacity-40 font-bold">No document open.</div>;

  const go=()=>onStart(type,activeDoc.id,startPage,endPage,{count,difficultyLevel:levels[difficulty-1],targetLang});

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
    }else if(g.type==='mindmap'){
      if(setMindMaps)setMindMaps(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,pages:g.pages,data:g.data,createdAt:new Date().toISOString()}]);
      addToast('Mind map saved!','success');
    }else if(g.type==='timeline'){
      if(setTimelines)setTimelines(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,pages:g.pages,events:g.data,createdAt:new Date().toISOString()}]);
      addToast('Timeline saved!','success');
    }else{
      setNotes(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,title:`${g.title||'Note'} · Pgs ${g.pages}`,content:g.data,createdAt:new Date().toISOString()}]);
      addToast('Saved!','success');
    }
    onClear();onVault();
  };

  const TOOLS=[
    ['flashcards','Cards',Layers,'#6366f1'],['exam','Exam',CheckSquare,'#3b82f6'],
    ['summary','Summary',AlignLeft,'#10b981'],['cases','Cases',Activity,'#8b5cf6'],
    ['clinical','Clinical',Stethoscope,'#06b6d4'],['treatment','Treat',Pill,'#f59e0b'],
    ['labs','Labs',Thermometer,'#ef4444'],['mnemonics','Memory',Lightbulb,'#84cc16'],
    ['eli5','ELI5',Baby,'#f97316'],['mindmap','MindMap',Network,'#a855f7'],
    ['concepts','Concepts',Tag,'#14b8a6'],['timeline','Timeline',Clock,'#6366f1'],
    ['translate','Translate',Languages,'#ec4899'],['smart-summary','SmartSum',Wand2,'#f59e0b'],
    ['differential','Diff Dx',FlaskConical,'#8b5cf6'],['code-explain','Explain',Code,'#94a3b8'],
  ];

  /* ── RESULTS VIEW ── */
  if(bgTask?.isFinished)return(
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 shrink-0">
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={15}/>{Array.isArray(bgTask.result?.data)?`${bgTask.result.data.length} items ready`:'Done!'}
        </span>
        <div className="flex gap-2">
          <button onClick={onClear} className="px-3 py-1.5 glass rounded-xl text-[10px] font-black uppercase opacity-60 hover:opacity-100">Discard</button>
          <button onClick={save} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 shadow-md">
            <Save size={12}/> Save
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Flashcard preview */}
        {bgTask.result?.type==='flashcards'&&bgTask.result.data.slice(0,5).map((item,i)=>(
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-bold text-xs mb-3 leading-relaxed"><span className="opacity-30 mr-1.5 font-mono text-[9px]">Q{i+1}</span>{item.q}</p>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-xs text-[var(--accent)]">{item.a}</div>
            {item.evidence&&<p className="mt-2 text-[10px] opacity-40 italic">"{item.evidence}" — Pg {item.sourcePage}</p>}
          </div>
        ))}
        {/* Exam/cases preview */}
        {(bgTask.result?.type==='exam'||bgTask.result?.type==='cases')&&bgTask.result.data.slice(0,3).map((item,i)=>{
          const q=item.examQuestion||item;
          return(
            <div key={i} className="glass p-4 rounded-2xl">
              <p className="font-bold text-xs mb-3"><span className="opacity-30 mr-1.5 text-[9px]">Q{i+1}</span>{item.vignette||q.q}</p>
              <div className="space-y-1.5">
                {(q.options||[]).map((opt,oi)=>(
                  <div key={oi} className={`px-3 py-2 rounded-xl text-[11px] font-medium border ${oi===q.correct?'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold':'glass border-transparent'}`}>
                    <span className="font-black opacity-50 mr-2">{String.fromCharCode(65+oi)}.</span>{opt}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {/* Mind map preview */}
        {bgTask.result?.type==='mindmap'&&<MindMap data={bgTask.result.data}/>}
        {/* Timeline preview */}
        {bgTask.result?.type==='timeline'&&<TimelineView events={bgTask.result.data.events||bgTask.result.data}/>}
        {/* Concepts preview */}
        {bgTask.result?.type==='concepts'&&bgTask.result.data.slice(0,5).map((c,i)=>(
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-black text-xs mb-1 text-[var(--accent)]">{c.concept||c.term}</p>
            <p className="text-[11px] leading-relaxed opacity-80">{c.definition||c.explanation}</p>
            {c.example&&<p className="text-[10px] mt-2 opacity-50 italic">Ex: {c.example}</p>}
          </div>
        ))}
        {/* Text results */}
        {['summary','clinical','treatment','labs','eli5','mnemonics','translate','differential','smart-summary','code-explain'].includes(bgTask.result?.type)&&(
          <div className="glass p-4 rounded-2xl">
            <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--text)] opacity-90">{bgTask.result.data}</pre>
          </div>
        )}
        {bgTask.result?.data?.length>5&&<p className="text-center text-[10px] opacity-40 font-bold">+{bgTask.result.data.length-5} more items saved</p>}
      </div>
    </div>
  );

  /* ── CONFIG VIEW ── */
  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* Page range */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2"><BookOpen size={13}/> Page Range</h3>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <div onClick={()=>setEntireFile(v=>!v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${entireFile?'bg-[var(--accent)]':'bg-gray-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${entireFile?'translate-x-4':'translate-x-0.5'}`}/>
          </div>
          <span className="text-xs font-bold opacity-60">Entire file</span>
        </label>
        {!entireFile&&(
          <div className="flex gap-3">
            {[['From',startPage,setStartPage],['To',endPage,setEndPage]].map(([l,v,s])=>(
              <div key={l} className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={v} onChange={e=>s(Number(e.target.value))}
                  className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)]"/>
              </div>
            ))}
          </div>
        )}
        {entireFile&&<p className="text-[10px] text-[var(--accent)] font-bold mt-2 text-center">All {activeDoc.totalPages} pages selected</p>}
      </div>

      {/* Tool selector */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2"><Zap size={13}/> AI Tool</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {TOOLS.map(([id,lbl,Icon,color])=>(
            <button key={id} onClick={()=>setType(id)}
              className={`py-2.5 flex flex-col items-center gap-1 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border
                ${type===id?'text-white border-transparent shadow-md scale-105':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}
              style={type===id?{backgroundColor:color}:{}}>
              <Icon size={14}/>{lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Language picker for translate */}
      {type==='translate'&&(
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-3">Target Language</h3>
          <div className="flex flex-wrap gap-2">
            {['Arabic','Spanish','French','German','Chinese','Japanese','Portuguese','Turkish','Hindi','Urdu'].map(lang=>(
              <button key={lang} onClick={()=>setTargetLang(lang)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${targetLang===lang?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>
                {lang}
              </button>
            ))}
          </div>
          <input value={targetLang} onChange={e=>setTargetLang(e.target.value)} placeholder="Or type any language…"
            className="mt-3 w-full glass border border-[var(--border)] rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--text)]"/>
        </div>
      )}

      {/* Count for batch tasks */}
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
                className={`px-2 py-1 rounded-lg text-[9px] font-black transition-colors ${count===n?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>{n}</button>
            ))}
          </div>
          {count>50&&<p className="text-[9px] text-amber-500 font-bold mt-2 flex items-center gap-1"><AlertCircle size={10}/>Parallel AI — {count}+ items in ~30-120s</p>}
        </div>
      )}

      {/* Difficulty */}
      {['flashcards','exam','cases'].includes(type)&&(
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Difficulty</h3>
            <span className="text-xs font-black text-[var(--accent)]">{levels[difficulty-1]}</span>
          </div>
          <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(+e.target.value)}
            className="w-full accent-[var(--accent)]"/>
        </div>
      )}

      {/* GO */}
      <button onClick={go} disabled={!!bgTask}
        className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl">
        {bgTask?<Loader2 size={18} className="animate-spin"/>:<Zap size={18} fill="currentColor"/>}
        {bgTask?`${bgTask.msg}`:'⚡ Generate Now'}
      </button>

      {/* Progress */}
      {bgTask&&!bgTask.isFinished&&(
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black opacity-60">{bgTask.msg}</span>
            <span className="text-[10px] font-black text-[var(--accent)]">{bgTask.done||0}/{bgTask.total||1}</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] h-full rounded-full transition-all duration-300 animate-pulse"
              style={{width:`${bgTask.total?((bgTask.done||0)/bgTask.total)*100:10}%`}}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT PANEL (AI Studio - streaming)
═══════════════════════════════════════════════════════════════════ */
function ChatPanel({activeDoc,settings,currentPage}){
  const[msgs,setMsgs]=useState([{role:'assistant',content:'Ready. Ask me anything about this document.'}]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[mode,setMode]=useState('page');
  const[listening,setListening]=useState(false);
  const endRef=useRef(null);
  const recogRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const toggleVoice=()=>{
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.continuous=false;r.interimResults=true;
    r.onresult=e=>{setInput(Array.from(e.results).map(r=>r[0].transcript).join(''));};
    r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.start();recogRef.current=r;setListening(true);
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const msg=input;setInput('');
    setMsgs(p=>[...p,{role:'user',content:msg},{role:'assistant',content:''}]);setLoading(true);
    try{
      const fileData=await getFile(activeDoc.id);
      let textContext='';
      if(activeDoc.fileCategory==='image'&&fileData?.imageBase64){
        const result=await callAIWithVision(
          `Document context: ${activeDoc.name}\nUser question: ${msg}`,
          fileData.imageBase64,fileData.imageType||'image/jpeg',settings,3000);
        setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:result}]);setLoading(false);return;
      }
      if(mode==='page'){
        textContext=fileData?.pagesText?.[currentPage]||'No text on this page.';
      }else{
        textContext=Object.entries(fileData?.pagesText||{}).map(([p,t])=>`[Page ${p}]\n${t}`).join('\n\n').substring(0,80000);
      }
      const hist=msgs.slice(-6).map(m=>`${m.role==='user'?'USER':'AI'}: ${m.content}`).join('\n');
      const prompt=`DOCUMENT:\n${textContext}\n\nCONVERSATION:\n${hist}\n\nQUESTION: ${msg}\n\nAnswer clearly and precisely.`;
      await callAIStreaming(prompt,chunk=>{setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:chunk}]);},settings,4000);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:`⚠️ ${e.message}`}]);}
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
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'glass rounded-tl-sm'}`}>
              {m.content||<span className="opacity-30">▊</span>}
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0 p-3 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask about this document…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24"/>
          <button onClick={toggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${listening?'bg-red-500 text-white animate-pulse':'glass text-[var(--accent)]'}`}>
            {listening?<MicOff size={14}/>:<Mic size={14}/>}
          </button>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0"><Send size={14}/></button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VAULT PANEL
═══════════════════════════════════════════════════════════════════ */
function VaultPanel({activeDocId,flashcards,setFlashcards,exams,setExams,cases,setCases,notes,setNotes,addToast,setCurrentPage,setView,settings,mindMaps,timelines}){
  const docFc=flashcards.filter(f=>f.docId===activeDocId);
  const docEx=exams.filter(e=>e.docId===activeDocId);
  const docCa=cases.filter(c=>c.docId===activeDocId);
  const docNo=notes.filter(n=>n.docId===activeDocId);
  const docMm=(mindMaps||[]).filter(m=>m.docId===activeDocId);
  const docTl=(timelines||[]).filter(t=>t.docId===activeDocId);
  const[expanded,setExpanded]=useState({});
  const toggle=k=>setExpanded(p=>({...p,[k]:!p[k]}));

  const Section=({title,count,colorClass,children,id})=>(
    <div className="glass rounded-2xl overflow-hidden">
      <button onClick={()=>toggle(id)} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>{title}</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${colorClass} bg-current/10`}>{count}</span>
        </div>
        {expanded[id]?<ChevronUp size={14} className="opacity-40"/>:<ChevronDown size={14} className="opacity-40"/>}
      </button>
      {expanded[id]&&<div className="border-t border-[var(--border)] p-3 space-y-2">{children}</div>}
    </div>
  );

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
      <Section id="fc" title="Flashcards" count={docFc.reduce((s,f)=>s+(f.cards?.length||0),0)} colorClass="text-[var(--accent)]">
        {docFc.map(set=>(
          <div key={set.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div>
              <p className="text-[11px] font-bold">{set.title}</p>
              <p className="text-[9px] opacity-40">{set.cards?.length} cards · {new Date(set.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('flashcards')} className="text-[9px] font-black px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">Study</button>
              <button onClick={()=>setFlashcards(p=>p.filter(f=>f.id!==set.id))} className="text-[9px] font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docFc.length&&<p className="text-center text-[10px] opacity-40 py-2 font-bold">No flashcards yet</p>}
      </Section>

      <Section id="ex" title="Exams" count={docEx.reduce((s,e)=>s+(e.questions?.length||0),0)} colorClass="text-emerald-500">
        {docEx.map(ex=>(
          <div key={ex.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-[11px] font-bold">{ex.title}</p><p className="text-[9px] opacity-40">{ex.questions?.length} Qs</p></div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('exams')} className="text-[9px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">Take</button>
              <button onClick={()=>setExams(p=>p.filter(e=>e.id!==ex.id))} className="text-[9px] font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docEx.length&&<p className="text-center text-[10px] opacity-40 py-2 font-bold">No exams yet</p>}
      </Section>

      <Section id="ca" title="Cases" count={docCa.reduce((s,c)=>s+(c.questions?.length||0),0)} colorClass="text-blue-500">
        {docCa.map(c=>(
          <div key={c.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-[11px] font-bold">{c.title}</p><p className="text-[9px] opacity-40">{c.questions?.length} cases</p></div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('cases')} className="text-[9px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg">Start</button>
              <button onClick={()=>setCases(p=>p.filter(x=>x.id!==c.id))} className="text-[9px] font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docCa.length&&<p className="text-center text-[10px] opacity-40 py-2 font-bold">No cases yet</p>}
      </Section>

      <Section id="no" title="Notes" count={docNo.length} colorClass="text-amber-500">
        {docNo.map(n=>(
          <div key={n.id} className="p-3 glass rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] font-bold">{n.title}</p>
              <button onClick={()=>setNotes(p=>p.filter(x=>x.id!==n.id))} className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-lg font-black">Del</button>
            </div>
            <p className="text-[10px] opacity-60 line-clamp-3 leading-relaxed">{n.content}</p>
          </div>
        ))}
        {!docNo.length&&<p className="text-center text-[10px] opacity-40 py-2 font-bold">No notes yet</p>}
      </Section>

      {docMm.length>0&&(
        <Section id="mm" title="Mind Maps" count={docMm.length} colorClass="text-purple-500">
          {docMm.map((m,i)=>(
            <div key={m.id} className="glass rounded-xl overflow-hidden">
              <p className="text-[10px] font-bold p-2 border-b border-[var(--border)] opacity-60">{m.data?.topic||`Map ${i+1}`} · Pgs {m.pages}</p>
              <MindMap data={m.data}/>
            </div>
          ))}
        </Section>
      )}

      {docTl.length>0&&(
        <Section id="tl" title="Timelines" count={docTl.length} colorClass="text-teal-500">
          {docTl.map((t,i)=>(
            <div key={t.id} className="glass rounded-xl p-3">
              <p className="text-[10px] font-bold mb-3 opacity-60">Timeline · Pgs {t.pages}</p>
              <TimelineView events={t.events||[]}/>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLASHCARDS VIEW — spaced repetition
═══════════════════════════════════════════════════════════════════ */
function FlashcardsView({flashcards,setFlashcards,settings,addToast}){
  const[selSet,setSelSet]=useState(null);const[idx,setIdx]=useState(0);
  const[flipped,setFlipped]=useState(false);const[mode,setMode]=useState('list');
  const[showAnswer,setShowAnswer]=useState(false);

  const sm2=(card,q)=>{
    let{ef=2.5,interval=1,repetitions=0}=card;
    if(q>=3){repetitions++;interval=repetitions===1?1:repetitions===2?6:Math.round(interval*ef);}
    else{repetitions=0;interval=1;}
    ef=Math.max(1.3,ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));
    return{...card,ef,interval,repetitions,nextReview:Date.now()+interval*86400000,lastReview:Date.now()};
  };

  const rateCard=(q)=>{
    if(!selSet)return;
    const cards=selSet.cards.map((c,i)=>i===idx?sm2(c,q):c);
    const updated={...selSet,cards};
    setSelSet(updated);
    setFlashcards(p=>p.map(f=>f.id===selSet.id?updated:f));
    if(idx<selSet.cards.length-1){setIdx(i=>i+1);setFlipped(false);setShowAnswer(false);}
    else{addToast('Set complete! 🎉','success');setMode('list');setSelSet(null);setIdx(0);}
  };

  if(mode==='study'&&selSet){
    const card=selSet.cards[idx];
    return(
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 scroll-content overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <button onClick={()=>{setMode('list');setSelSet(null);setIdx(0);setFlipped(false);}} className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"><ChevronLeft size={14}/>Back</button>
            <span className="text-xs font-black opacity-40">{idx+1} / {selSet.cards.length}</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mb-6">
            <div className="bg-[var(--accent)] h-full rounded-full transition-all" style={{width:`${((idx+1)/selSet.cards.length)*100}%`}}/>
          </div>
          <div className="glass rounded-3xl p-8 min-h-[280px] flex flex-col justify-between cursor-pointer shadow-xl" onClick={()=>setFlipped(f=>!f)}>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-4">{flipped?'Answer':'Question'} · tap to flip</div>
            <p className="text-base font-bold leading-relaxed text-center flex-1 flex items-center justify-center">
              {flipped?card.a:card.q}
            </p>
            {flipped&&card.evidence&&<p className="text-[10px] opacity-40 italic mt-4 text-center border-t border-[var(--border)] pt-3">"{card.evidence}" — Pg {card.sourcePage}</p>}
          </div>
          {flipped&&(
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[['Again',0,'bg-red-500'],[' Hard',2,'bg-amber-500'],['Good',3,'bg-blue-500'],['Easy',5,'bg-emerald-500']].map(([l,q,bg])=>(
                <button key={l} onClick={()=>rateCard(q)} className={`${bg} text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform`}>{l}</button>
              ))}
            </div>
          )}
          {!flipped&&<button onClick={()=>setFlipped(true)} className="mt-4 w-full py-3 btn-accent rounded-2xl text-sm font-black">Show Answer</button>}
        </div>
      </div>
    );
  }

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-4">
        <h1 className="text-3xl font-black flex items-center gap-3"><Layers size={28} className="opacity-40"/> Flashcards</h1>
        {!flashcards.length?(
          <div className="glass border-dashed border-2 border-[var(--border)] rounded-3xl p-12 text-center">
            <Layers size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No flashcard sets yet</p>
            <p className="text-sm opacity-30 mt-1">Open a document → AI Studio → Generate → Cards</p>
          </div>
        ):(
          flashcards.map(set=>(
            <div key={set.id} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black text-sm">{set.title}</h3>
                  <p className="text-[10px] opacity-40 mt-0.5">{set.cards?.length} cards · {new Date(set.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{setSelSet(set);setIdx(0);setFlipped(false);setMode('study');}}
                    className="btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md">
                    <Brain size={14}/> Study
                  </button>
                  <button onClick={()=>setFlashcards(p=>p.filter(f=>f.id!==set.id))}
                    className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {set.cards?.slice(0,3).map((c,i)=>(
                  <div key={i} className="glass rounded-xl px-3 py-2 text-[10px] font-medium opacity-60 max-w-[200px] truncate">{c.q}</div>
                ))}
                {set.cards?.length>3&&<div className="glass rounded-xl px-3 py-2 text-[10px] font-bold opacity-40">+{set.cards.length-3} more</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXAMS VIEW
═══════════════════════════════════════════════════════════════════ */
function ExamsView({exams,setExams,settings,addToast}){
  const[selEx,setSelEx]=useState(null);const[qi,setQi]=useState(0);
  const[selected,setSelected]=useState(null);const[submitted,setSubmitted]=useState(false);
  const[score,setScore]=useState(null);const[answers,setAnswers]=useState([]);

  const startExam=ex=>{setSelEx(ex);setQi(0);setSelected(null);setSubmitted(false);setScore(null);setAnswers([]);};
  const submit=()=>{
    if(selected===null)return;
    const correct=selEx.questions[qi].correct===selected;
    const newAnswers=[...answers,{qi,selected,correct}];
    setAnswers(newAnswers);setSubmitted(true);
    if(qi===selEx.questions.length-1)setScore(newAnswers.filter(a=>a.correct).length);
  };
  const next=()=>{
    if(qi<selEx.questions.length-1){setQi(i=>i+1);setSelected(null);setSubmitted(false);}
    else{addToast(`Exam done! Score: ${score}/${selEx.questions.length}`,'success');}
  };

  if(selEx&&score===null){
    const q=selEx.questions[qi];
    return(
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
        <div className="max-w-2xl mx-auto p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={()=>{setSelEx(null);setScore(null);}} className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"><ChevronLeft size={14}/>Exit</button>
            <span className="text-xs font-black opacity-40">{qi+1}/{selEx.questions.length}</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mb-6">
            <div className="bg-[var(--accent)] h-full rounded-full" style={{width:`${((qi+1)/selEx.questions.length)*100}%`}}/>
          </div>
          <div className="glass rounded-3xl p-6 mb-4">
            <p className="text-sm font-bold leading-relaxed">{q.q}</p>
          </div>
          <div className="space-y-2.5 mb-6">
            {(q.options||[]).map((opt,oi)=>(
              <button key={oi} disabled={submitted} onClick={()=>setSelected(oi)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all border
                  ${submitted&&oi===q.correct?'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold':
                    submitted&&oi===selected&&oi!==q.correct?'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400':
                    selected===oi?'bg-[var(--accent)]/15 border-[var(--accent)] font-bold':'glass border-[var(--border)] hover:border-[var(--accent)]/30'}`}>
                <span className="font-black opacity-50 mr-3">{String.fromCharCode(65+oi)}.</span>{opt}
              </button>
            ))}
          </div>
          {submitted&&q.explanation&&<div className="glass p-4 rounded-2xl mb-4 border-l-4 border-[var(--accent)]"><p className="text-xs leading-relaxed opacity-80">{q.explanation}</p></div>}
          {!submitted?
            <button onClick={submit} disabled={selected===null} className="w-full py-3.5 btn-accent rounded-2xl text-sm font-black disabled:opacity-40 shadow-lg">Submit Answer</button>:
            <button onClick={next} className="w-full py-3.5 btn-accent rounded-2xl text-sm font-black shadow-lg">{qi<selEx.questions.length-1?'Next Question →':'Finish Exam'}</button>
          }
        </div>
      </div>
    );
  }

  if(score!==null){
    const pct=Math.round((score/selEx.questions.length)*100);
    return(
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="glass rounded-3xl p-10 text-center max-w-sm">
          <div className={`text-6xl font-black mb-2 ${pct>=80?'text-emerald-500':pct>=60?'text-amber-500':'text-red-500'}`}>{pct}%</div>
          <p className="text-sm font-black opacity-60 mb-2">{score} / {selEx.questions.length} correct</p>
          <p className="text-xs opacity-40">{pct>=80?'Excellent! 🎉':pct>=60?'Good effort! Keep studying 📚':'Need more review 💪'}</p>
        </div>
        <button onClick={()=>{setSelEx(null);setScore(null);}} className="btn-accent px-8 py-3 rounded-2xl font-black shadow-xl">Back to Exams</button>
      </div>
    );
  }

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-4">
        <h1 className="text-3xl font-black flex items-center gap-3"><CheckSquare size={28} className="opacity-40"/> Exams</h1>
        {!exams.length?(
          <div className="glass border-dashed border-2 border-[var(--border)] rounded-3xl p-12 text-center">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No exams yet</p>
          </div>
        ):(exams.map(ex=>(
          <div key={ex.id} className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm">{ex.title}</h3>
              <p className="text-[10px] opacity-40 mt-0.5">{ex.questions?.length} questions · {new Date(ex.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>startExam(ex)} className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"><Target size={14}/> Start</button>
              <button onClick={()=>setExams(p=>p.filter(e=>e.id!==ex.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CASES VIEW
═══════════════════════════════════════════════════════════════════ */
function CasesView({cases,setCases,settings,addToast}){
  const[selSet,setSelSet]=useState(null);const[ci,setCi]=useState(0);
  const[stage,setStage]=useState('vignette');const[selOpt,setSelOpt]=useState(null);const[submitted,setSubmitted]=useState(false);

  if(selSet){
    const cas=selSet.questions[ci];const q=cas.examQuestion||cas;
    return(
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
        <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={()=>{setSelSet(null);setCi(0);setStage('vignette');}} className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"><ChevronLeft size={14}/>Exit</button>
            <span className="text-xs font-black opacity-40">Case {ci+1}/{selSet.questions.length}</span>
          </div>
          {cas.title&&<h2 className="text-lg font-black">{cas.title}</h2>}
          <div className="glass p-5 rounded-2xl border-l-4 border-[var(--accent)]">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2">Clinical Vignette</p>
            <p className="text-sm leading-relaxed">{cas.vignette}</p>
          </div>
          {cas.labPanels?.length>0&&cas.labPanels.map((panel,i)=>(
            <div key={i}><p className="text-xs font-black opacity-60 mb-2">{panel.panelName}</p><LabTable rows={panel.rows}/></div>
          ))}
          <div className="space-y-2">
            {(q.options||[]).map((opt,oi)=>(
              <button key={oi} disabled={submitted} onClick={()=>setSelOpt(oi)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all border
                  ${submitted&&oi===q.correct?'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold':
                    submitted&&oi===selOpt&&oi!==q.correct?'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400':
                    selOpt===oi?'bg-[var(--accent)]/15 border-[var(--accent)] font-bold':'glass border-[var(--border)] hover:border-[var(--accent)]/30'}`}>
                <span className="font-black opacity-50 mr-3">{String.fromCharCode(65+oi)}.</span>{opt}
              </button>
            ))}
          </div>
          {submitted&&<div className="glass p-4 rounded-2xl border-l-4 border-emerald-500">
            {cas.diagnosis&&<p className="text-xs font-black text-emerald-500 mb-1">Diagnosis: {cas.diagnosis}</p>}
            {q.explanation&&<p className="text-xs leading-relaxed opacity-80">{q.explanation}</p>}
          </div>}
          {!submitted?
            <button onClick={()=>setSubmitted(true)} disabled={selOpt===null} className="w-full py-3.5 btn-accent rounded-2xl font-black disabled:opacity-40 shadow-lg">Submit</button>:
            ci<selSet.questions.length-1?
              <button onClick={()=>{setCi(i=>i+1);setSelOpt(null);setSubmitted(false);}} className="w-full py-3.5 btn-accent rounded-2xl font-black shadow-lg">Next Case →</button>:
              <button onClick={()=>{setSelSet(null);setCi(0);addToast('All cases done! 🏆','success');}} className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-black shadow-lg">Finish Session</button>
          }
        </div>
      </div>
    );
  }

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-4">
        <h1 className="text-3xl font-black flex items-center gap-3"><Activity size={28} className="opacity-40"/> Clinical Cases</h1>
        {!cases.length?(
          <div className="glass border-dashed border-2 border-[var(--border)] rounded-3xl p-12 text-center">
            <Activity size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No cases yet</p>
          </div>
        ):(cases.map(set=>(
          <div key={set.id} className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm">{set.title}</h3>
              <p className="text-[10px] opacity-40 mt-0.5">{set.questions?.length} cases</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>{setSelSet(set);setCi(0);setSelOpt(null);setSubmitted(false);}}
                className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"><Stethoscope size={14}/>Practice</button>
              <button onClick={()=>setCases(p=>p.filter(c=>c.id!==set.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT VIEW — global AI chat with streaming + voice
═══════════════════════════════════════════════════════════════════ */
function ChatView({settings,sessions,setSessions}){
  const[selSess,setSelSess]=useState(null);
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[listening,setListening]=useState(false);
  const endRef=useRef(null);const recogRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const toggleVoice=()=>{
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.continuous=false;r.interimResults=true;
    r.onresult=e=>{setInput(Array.from(e.results).map(r=>r[0].transcript).join(''));};
    r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.start();recogRef.current=r;setListening(true);
  };

  const newSession=()=>{setSelSess(null);setMsgs([{role:'assistant',content:'Hello! I\'m your AI assistant. Ask me anything, upload files, or get help with your studies.'}]);};
  const saveSession=useCallback((ms)=>{
    if(!ms.length)return;
    const sess={id:selSess||Date.now().toString(),title:ms.find(m=>m.role==='user')?.content?.slice(0,40)||'New Chat',messages:ms,updatedAt:new Date().toISOString()};
    setSessions(p=>{const ex=p.findIndex(s=>s.id===sess.id);return ex>=0?[...p.slice(0,ex),sess,...p.slice(ex+1)]:[sess,...p];});
    setSelSess(sess.id);
  },[selSess,setSessions]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const msg=input;setInput('');
    const newMsgs=[...msgs,{role:'user',content:msg},{role:'assistant',content:''}];
    setMsgs(newMsgs);setLoading(true);
    try{
      const hist=newMsgs.slice(-8,-1).map(m=>`${m.role==='user'?'USER':'AI'}: ${m.content}`).join('\n');
      const prompt=`You are a brilliant AI assistant. Conversation:\n${hist}\n\nUser: ${msg}\n\nAssistant:`;
      await callAIStreaming(prompt,chunk=>{setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:chunk}]);},settings,4000);
      const final=[...newMsgs.slice(0,-1)];
      setTimeout(()=>saveSession(final),500);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  return(
    <div className="flex flex-col h-full min-h-0">
      {msgs.length===0&&!selSess&&(
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <img src={MARIAM_IMG} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-4 border-[var(--border)]" alt="MARIAM AI"/>
          <h2 className="text-2xl font-black text-center">Hi, I'm MARIAM</h2>
          <p className="text-sm opacity-50 text-center max-w-xs">Your universal AI assistant. I can discuss anything from your documents or just help you think.</p>
          <button onClick={newSession} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2"><MessageSquare size={16}/>Start Chat</button>
        </div>
      )}
      {(msgs.length>0||selSess)&&(
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0" style={{paddingBottom:`calc(80px + ${NAV_H}px + env(safe-area-inset-bottom))`}}>
            {msgs.map((m,i)=>(
              <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden border border-[var(--border)]'}`}>
                  {m.role==='user'?<UserCircle2 size={18} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
                </div>
                <div className={`px-4 py-3 text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap rounded-3xl
                  ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'glass rounded-tl-sm'}`}>
                  {m.content||<span className="opacity-30">▊</span>}
                </div>
              </div>
            ))}
            <div ref={endRef}/>
          </div>
          <div className="shrink-0 p-4 border-t border-[var(--border)] bg-[var(--card)]"
            style={{paddingBottom:`calc(16px + ${NAV_H}px + env(safe-area-inset-bottom))`}}>
            <div className="max-w-3xl mx-auto flex gap-2 items-end glass rounded-2xl p-2 border border-[var(--border)]">
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder="Ask anything…" disabled={loading}
                className="flex-1 bg-transparent p-2 text-sm outline-none resize-none max-h-28 custom-scrollbar text-[var(--text)] min-h-[40px]"/>
              <button onClick={toggleVoice}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${listening?'bg-red-500 text-white':'opacity-50 hover:opacity-100'}`}>
                {listening?<MicOff size={16}/>:<Mic size={16}/>}
              </button>
              <button onClick={send} disabled={loading||!input.trim()}
                className="w-10 h-10 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg"><Send size={16}/></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════════════════════════ */
function SettingsView({settings,setSettings,installPrompt,onInstall}){
  const pr=PROVIDERS[settings.provider]||PROVIDERS.anthropic;
  const themes=[{id:'pure-white',label:'White',icon:Sun},{id:'light',label:'Soft',icon:CloudSun},{id:'dark',label:'Dark',icon:Moon},{id:'oled',label:'OLED',icon:MoonStar}];
  const accents=[{id:'indigo',hex:'#6366f1'},{id:'purple',hex:'#a855f7'},{id:'blue',hex:'#3b82f6'},{id:'emerald',hex:'#10b981'},{id:'rose',hex:'#f43f5e'}];
  const sizes=[{id:'small',label:'S',px:12},{id:'medium',label:'M',px:14},{id:'large',label:'L',px:16},{id:'xl',label:'XL',px:18}];
  const changeProvider=p=>{const pr=PROVIDERS[p];setSettings(s=>({...s,provider:p,baseUrl:pr.baseUrl,model:pr.defaultModel}));};

  return(
    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-content">
      <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-4">
        <h1 className="text-3xl font-black flex items-center gap-3 mb-6"><Settings size={28} className="opacity-40"/> Settings</h1>

        {/* Install PWA */}
        {installPrompt&&(
          <section className="glass rounded-2xl p-5 border border-[var(--accent)]/30 bg-[var(--accent)]/5">
            <h2 className="font-black text-sm mb-2 flex items-center gap-2 text-[var(--accent)]"><Smartphone size={16}/> Install as App</h2>
            <p className="text-xs opacity-60 mb-4">Install MARIAM PRO on your device for offline access, faster loading, and a native app experience.</p>
            <div className="flex gap-3">
              <button onClick={onInstall} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg"><Download size={14}/> Install Now</button>
            </div>
          </section>
        )}

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
            <div>
              <span className="text-xs font-bold">Strict Mode</span>
              <p className="text-[10px] opacity-50 mt-0.5">Use ONLY document text, no outside knowledge</p>
            </div>
            <div onClick={()=>setSettings(s=>({...s,strictMode:!s.strictMode}))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.strictMode?'bg-[var(--accent)]':'bg-gray-300 dark:bg-zinc-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.strictMode?'translate-x-5':'translate-x-1'}`}/>
            </div>
          </label>
        </section>

        {/* About */}
        <section className="glass rounded-2xl p-5 text-center">
          <img src={MARIAM_IMG} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg" alt="MARIAM"/>
          <h3 className="font-black text-sm">MARIAM PRO {APP_VER}</h3>
          <p className="text-[10px] opacity-40 mt-1">Universal AI Document Intelligence</p>
          <div className="flex justify-center gap-3 mt-3 text-[9px] font-black uppercase tracking-widest opacity-30">
            <span>PDF · Word · Excel · Images · Code</span>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
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
  const[mindMaps,setMindMaps]=useState([]);
  const[timelines,setTimelines]=useState([]);
  const[settings,setSettings]=useState(DEFAULT_SETTINGS);
  const[uploading,setUploading]=useState(false);
  const[uploadPct,setUploadPct]=useState(0);
  const[view,setView]=useState('library');
  const[rpTab,setRpTab]=useState('generate');
  const[rpOpen,setRpOpen]=useState(false);
  const[rpW,setRpW]=useState(420);
  const[bgTask,setBgTask]=useState(null);
  const[installPrompt,setInstallPrompt]=useState(null);
  const{toasts,addToast}=useToast();

  // PWA setup
  useEffect(()=>{
    setupPWA();
    const handler=e=>{e.preventDefault();setInstallPrompt(e);};
    window.addEventListener('beforeinstallprompt',handler);
    window.addEventListener('appinstalled',()=>{setInstallPrompt(null);addToast('App installed! 🎉','success');});
    return()=>window.removeEventListener('beforeinstallprompt',handler);
  },[]);

  // Viewport
  useEffect(()=>{
    let m=document.querySelector('meta[name="viewport"]');
    if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}
    m.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
  },[]);

  // Load state
  useEffect(()=>{(async()=>{
    try{
      const[d,fc,ex,ca,no,ch,st,od,dp,mm,tl]=await Promise.all([
        getState('docs'),getState('flashcards'),getState('exams'),getState('cases'),
        getState('notes'),getState('chats'),getState('settings'),getState('openDocs'),
        getState('docPages'),getState('mindMaps'),getState('timelines')]);
      if(d)setDocs(d);if(fc)setFlashcards(fc);if(ex)setExams(ex);if(ca)setCases(ca);
      if(no)setNotes(no);if(ch)setChatSessions(ch);if(od)setOpenDocs(od);if(dp)setDocPages(dp);
      if(mm)setMindMaps(mm);if(tl)setTimelines(tl);
      if(st)setSettings(p=>({...DEFAULT_SETTINGS,...p,...st}));
    }catch(e){console.warn(e);}finally{setLoaded(true);}
  })();},[]);

  // Persist
  useEffect(()=>{
    if(!loaded)return;
    const t=setTimeout(async()=>{
      try{
        const slim=docs.map(d=>{const c={...d};delete c.pagesText;delete c.buffer;return c;});
        await Promise.all([saveState('docs',slim),saveState('flashcards',flashcards),
          saveState('exams',exams),saveState('cases',cases),saveState('notes',notes),
          saveState('chats',chatSessions),saveState('settings',settings),
          saveState('openDocs',openDocs),saveState('docPages',docPages),
          saveState('mindMaps',mindMaps),saveState('timelines',timelines)]);
      }catch(e){console.warn(e);}
    },800);
    return()=>clearTimeout(t);
  },[docs,flashcards,exams,cases,notes,chatSessions,settings,openDocs,docPages,mindMaps,timelines,loaded]);

  // Theme
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
      blue:{hex:'#3b82f6',rgb:'59,130,246',soft:'#2563eb'},
      emerald:{hex:'#10b981',rgb:'16,185,129',soft:'#059669'},
      rose:{hex:'#f43f5e',rgb:'244,63,94',soft:'#e11d48'},
    };
    const c=clrs[settings.accentColor]||clrs.indigo;
    root.style.setProperty('--accent',c.hex);
    root.style.setProperty('--accent-rgb',c.rgb);
    root.style.setProperty('--accent-soft',c.soft);
  },[settings.theme,settings.fontSize,settings.accentColor]);

  // Right panel resize
  const handleRpDrag=useCallback(x=>{setRpW(Math.max(320,Math.min(window.innerWidth-300,window.innerWidth-x)));},[]);
  const startRpDrag=useDrag(handleRpDrag,[handleRpDrag]);

  // Universal upload
  const handleUpload=async(e)=>{
    const files=Array.from(e.target?.files||e.dataTransfer?.files||[]);
    if(!files.length)return;
    if(e.target)e.target.value='';
    setUploading(true);setUploadPct(2);
    try{
      const newDocs=[],newIds=[],newPg={};let lastId=null;
      for(let fi=0;fi<files.length;fi++){
        const file=files[fi];
        const cat=getFileCategory(file);
        try{
          const data=await extractUniversal(file,pct=>{setUploadPct(Math.round((fi/files.length*100)+pct*(80/files.length)));});
          const id=`${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
          // For images, store preview
          let imagePreview=null;
          if(cat==='image'&&data.imageBase64){imagePreview=`data:${data.imageType||'image/jpeg'};base64,${data.imageBase64.substring(0,200)}`;}
          await saveFile(id,data);
          newDocs.push({id,name:file.name,totalPages:data.totalPages,progress:1,addedAt:new Date().toISOString(),fileCategory:cat,fileSize:file.size,imagePreview});
          newIds.push(id);newPg[id]=1;lastId=id;
          addToast(`"${file.name}" imported!`,'success');
        }catch(err){addToast(`"${file.name}": ${err.message}`,'error');}
        setUploadPct(Math.round(((fi+1)/files.length)*95));
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
      if(!next)setView('library');return next;
    });
  },[openDocs]);

  const deleteDoc=async(id,ev)=>{
    if(ev)ev.stopPropagation();
    try{await delFile(id);}catch{}
    setDocs(p=>p.filter(d=>d.id!==id));
    setFlashcards(p=>p.filter(f=>f.docId!==id));
    setExams(p=>p.filter(e=>e.docId!==id));
    setCases(p=>p.filter(c=>c.docId!==id));
    setNotes(p=>p.filter(n=>n.docId!==id));
    setMindMaps(p=>p.filter(m=>m.docId!==id));
    setTimelines(p=>p.filter(t=>t.docId!==id));
    closeDoc(id);addToast('Document deleted','info');
  };

  const activeDoc=useMemo(()=>docs.find(d=>d.id===activeId)||null,[docs,activeId]);
  const setPage=useCallback(updater=>setDocPages(p=>({...p,[activeId]:typeof updater==='function'?updater(p[activeId]||1):updater})),[activeId]);

  // Background AI generation
  const startGen=async(taskType,docId,startPage,endPage,params)=>{
    if(bgTask){addToast('A generation is already running','info');return;}
    setBgTask({title:`AI ${taskType.toUpperCase()}`,msg:'Initializing…',done:0,total:1,isFinished:false});
    try{
      const fileData=await getFile(docId);
      const pagesText=fileData?.pagesText||{};
      const doc=docs.find(d=>d.id===docId);

      // Handle image files with vision
      if(doc?.fileCategory==='image'&&fileData?.imageBase64){
        setBgTask(p=>({...p,msg:'Analyzing image with AI Vision…'}));
        const prompt=`Analyze this image and ${taskType==='mindmap'?'create a mind map JSON':'provide detailed analysis'}.\n${taskType==='mindmap'?'JSON: {"topic":"...","branches":[{"label":"...","subtopics":["..."]}]}':''}`;
        const result=await callAIWithVision(prompt,fileData.imageBase64,fileData.imageType,settings,4000);
        if(taskType==='mindmap'){
          try{setBgTask(p=>({...p,isFinished:true,result:{type:'mindmap',data:parseJson(result),pages:'image'},msg:'Done!'}));}
          catch{setBgTask(p=>({...p,isFinished:true,result:{type:'summary',data:result,pages:'image',title:'Image Analysis'},msg:'Done!'}));}
        }else{
          setBgTask(p=>({...p,isFinished:true,result:{type:'summary',data:result,pages:'image',title:'Image Analysis'},msg:'Done!'}));
        }
        addToast('Analysis complete!','success');return;
      }

      let textContext='';
      for(let i=Number(startPage);i<=Number(endPage);i++){
        if(pagesText[i])textContext+=`\n[PAGE ${i}]\n${pagesText[i]}\n`;
      }
      if(!textContext.trim()||textContext.length<10)throw new Error('No text found in selected page range.');
      const count=params.count||10;
      const diff=params.difficultyLevel||'Expert';
      const targetLang=params.targetLang||'Spanish';

      const batchSize=taskType==='cases'?5:taskType==='flashcards'?30:15;
      const isBatch=['flashcards','exam','cases'].includes(taskType);
      const numBatches=isBatch?Math.ceil(count/batchSize):1;
      setBgTask(p=>({...p,total:numBatches,msg:`Launching ${numBatches} parallel AI requests…`}));

      const makePrompt=(bc)=>{
        const base=`Difficulty: ${diff}. USE ONLY provided text.\nDOCUMENT:\n${textContext}`;
        if(taskType==='flashcards')return`${base}\nGenerate ${bc} expert flashcards.\nJSON: {"items":[{"q":"...","a":"...","evidence":"...","sourcePage":1}]}`;
        if(taskType==='exam')return`${base}\nGenerate ${bc} exam questions.\nJSON: {"items":[{"q":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","evidence":"...","sourcePage":1}]}`;
        if(taskType==='cases')return`${base}\nGenerate ${bc} clinical cases.\nJSON: {"cases":[{"title":"...","vignette":"...","diagnosis":"...","labPanels":[{"panelName":"...","rows":[{"test":"...","result":"...","flag":"H|L|","range":"...","units":"..."}]}],"examQuestion":{"q":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","evidence":"...","sourcePage":1}}]}`;
        if(taskType==='mindmap')return`${base}\nCreate a comprehensive mind map.\nJSON: {"topic":"Central Topic","branches":[{"label":"Branch Name","subtopics":["sub1","sub2","sub3"]}]}`;
        if(taskType==='concepts')return`${base}\nExtract key concepts with definitions.\nJSON: {"items":[{"concept":"...","definition":"...","example":"...","sourcePage":1}]}`;
        if(taskType==='timeline')return`${base}\nExtract chronological events.\nJSON: {"events":[{"date":"...","event":"...","significance":"...","page":1}]}`;
        if(taskType==='translate')return`${base}\nTranslate the content to ${targetLang}. Preserve structure. Provide the complete translation.`;
        if(taskType==='summary')return`${base}\nProvide a comprehensive summary with key points, main themes, and critical details.`;
        if(taskType==='smart-summary')return`${base}\n\nProvide 3-tier smart summary:\n## EXECUTIVE (2-3 sentences)\n## STANDARD (1 paragraph)\n## DETAILED (bullet points with key facts)`;
        if(taskType==='clinical')return`${base}\nProvide a structured clinical summary with: Chief Complaint, History, Physical Findings, Assessment, Plan.`;
        if(taskType==='differential')return`${base}\nProvide a ranked differential diagnosis with supporting evidence and key distinguishing features.`;
        if(taskType==='treatment')return`${base}\nProvide a comprehensive treatment plan with first-line, second-line options, monitoring, and follow-up.`;
        if(taskType==='labs')return`${base}\nInterpret all laboratory values mentioned. Provide clinical significance and action items.`;
        if(taskType==='mnemonics')return`${base}\nCreate memorable mnemonics and memory aids for the key concepts in this content.`;
        if(taskType==='eli5')return`${base}\nExplain this content simply, as if teaching a 10-year-old. Use analogies and simple language.`;
        if(taskType==='code-explain')return`${base}\nExplain this code/technical content clearly. Cover: purpose, how it works, key concepts, practical applications.`;
        return`${base}\nProvide a detailed analysis of this content.`;
      };

      const isJson=['flashcards','exam','cases','mindmap','concepts','timeline'].includes(taskType);
      const tasks=isBatch?Array.from({length:numBatches},(_,i)=>{
        const bc=i===numBatches-1&&count%batchSize!==0?count%batchSize:batchSize;
        return()=>callAI(makePrompt(bc),isJson,settings.strictMode,settings,8000);
      }):[()=>callAI(makePrompt(count),isJson,settings.strictMode,settings,8000)];

      let all=[];
      const exRes=await runParallel(tasks,10,(done,total)=>{
        setBgTask(p=>({...p,done,msg:`${done}/${total} batches complete…`}));
      });

      if(isJson){
        for(const r of exRes){
          if(r.status==='fulfilled'){
            try{const p=parseJson(r.value);
              if(taskType==='mindmap'){all=[p];break;}
              if(taskType==='timeline'){all=[p];break;}
              all=[...all,...(p.cases||p.items||p.questions||p.events||[])];}
            catch(e){console.warn('Parse:',e.message);}
          }
        }
        if(!all.length)throw new Error('AI returned no parseable data.');
        const finalData=taskType==='mindmap'?all[0]:taskType==='timeline'?all[0]:all.slice(0,count);
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,data:finalData,pages:`${startPage}-${endPage}`},msg:`Done! ${Array.isArray(finalData)?finalData.length:1} items.`}));
      }else{
        const raw=exRes[0]?.value||'No content generated.';
        const titles={summary:'Summary','smart-summary':'Smart Summary',clinical:'Clinical Summary',differential:'Differential Dx',treatment:'Treatment Plan',labs:'Lab Interpretation',eli5:'Simplified Explanation',mnemonics:'Mnemonics',translate:`${targetLang} Translation`,'code-explain':'Code Explanation'};
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,data:raw,pages:`${startPage}-${endPage}`,title:titles[taskType]||taskType},msg:'Complete!'}));
      }
      addToast('Generation complete! ⚡','success');
    }catch(e){console.error(e);setBgTask(null);addToast(e.message,'error');}
  };

  const onInstall=async()=>{
    if(!installPrompt)return;
    installPrompt.prompt();
    const{outcome}=await installPrompt.userChoice;
    if(outcome==='accepted')setInstallPrompt(null);
  };

  if(!loaded)return(
    <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-white gap-4">
      <style>{`:root{--bg:#fff;--text:#0f172a;--card:#f8fafc;--border:#e2e8f0;--accent:#6366f1;--accent-soft:#4f46e5;}`}</style>
      <div className="relative">
        <img src={MARIAM_IMG} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" alt="MARIAM"/>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={14}/>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-indigo-500">MARIAM PRO</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-1">{APP_VER} · Loading…</p>
      </div>
    </div>
  );

  const showReader=view==='reader'&&!!activeId&&!!activeDoc;
  const NAV_ITEMS=[
    {icon:BookOpen,label:'Library',v:'library'},
    {icon:BookMarked,label:'Reader',v:'reader',dis:!activeId},
    {icon:Layers,label:'Cards',v:'flashcards'},
    {icon:Activity,label:'Cases',v:'cases'},
    {icon:CheckSquare,label:'Exams',v:'exams'},
    {icon:MessageSquare,label:'Chat',v:'chat'},
  ];

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
        .btn-accent:hover{opacity:.9;} .btn-accent:active{opacity:.8;transform:scale(.98);}
        .card-hover{transition:.25s ease;}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(var(--accent-rgb),.12);}
        @keyframes slide-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .animate-slide-in{animation:slide-in .2s ease-out forwards;}
        .bottom-nav-safe{padding-bottom:max(8px,env(safe-area-inset-bottom));}
        .scroll-content{padding-bottom:calc(${NAV_H}px + env(safe-area-inset-bottom) + 24px);}
        @media(min-width:1024px){.scroll-content{padding-bottom:32px;}}
        canvas{display:block;max-width:100%;height:auto!important;}
        textarea{min-height:40px;}
      `}</style>
      <ToastContainer toasts={toasts}/>

      {/* HEADER */}
      <header className="h-14 lg:h-16 glass flex items-center justify-between px-4 lg:px-6 shrink-0 z-40 border-t-0 border-x-0">
        <div className="flex items-center gap-2.5">
          <img src={MARIAM_IMG} className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl object-cover border border-[var(--border)]" alt=""/>
          <span className="text-2xl lg:text-3xl font-black tracking-tight text-[var(--accent)]" style={{fontFamily:'system-ui'}}>MARIAM</span>
          <span className="text-[9px] font-black bg-[var(--accent)] text-white px-2 py-0.5 rounded-full hidden sm:inline">{APP_VER}</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <input placeholder="Search documents…" className="w-full bg-black/5 dark:bg-white/5 rounded-full py-2 pl-9 pr-4 text-sm outline-none border border-transparent focus:border-[var(--accent)]/40 text-[var(--text)]"/>
            <Search className="absolute left-3 top-2.5 opacity-30" size={16}/>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {installPrompt&&(
            <button onClick={onInstall} className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-white transition-all">
              <Download size={13}/> Install
            </button>
          )}
          {activeDoc&&(
            <button onClick={()=>{setRpOpen(o=>!o);if(view!=='reader')setView('reader');}}
              className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all
                ${rpOpen?'bg-[var(--accent)] text-white':'glass text-[var(--accent)] border border-[var(--accent)]/30'}`}>
              <Sparkles size={14}/> AI Studio
            </button>
          )}
          <button onClick={()=>setView('settings')} className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100"><Settings size={17}/></button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <nav className="hidden lg:flex w-[78px] flex-col items-center py-6 gap-1 glass shrink-0 border-t-0 border-b-0 border-l-0 z-30">
          {NAV_ITEMS.map(({icon:Icon,label,v,dis})=>(
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
          {uploading&&(
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--border)] z-50">
              <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] transition-all duration-300 animate-pulse" style={{width:`${uploadPct}%`}}/>
            </div>
          )}

          <ViewWrapper active={view==='library'}>
            <LibraryView docs={docs} uploading={uploading} onUpload={handleUpload}
              onOpen={id=>{setOpenDocs(p=>p.includes(id)?p:[...p,id]);setActiveId(id);setView('reader');}}
              onDelete={deleteDoc} flashcards={flashcards} exams={exams} cases={cases} notes={notes}/>
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
            <SettingsView settings={settings} setSettings={setSettings} installPrompt={installPrompt} onInstall={onInstall}/>
          </ViewWrapper>
          <ViewWrapper active={showReader}>
            {activeDoc&&(
              <DocWorkspace activeDoc={activeDoc} setDocs={setDocs}
                currentPage={docPages[activeId]||1} setCurrentPage={setPage}
                openDocs={openDocs} closeTab={id=>setOpenDocs(p=>p.filter(d=>d!==id))}
                setActiveId={setActiveId} docs={docs} onBack={()=>setView('library')}/>
            )}
          </ViewWrapper>
        </main>

        {/* AI STUDIO PANEL */}
        {showReader&&rpOpen&&(
          <>
            <div onMouseDown={startRpDrag} onTouchStart={startRpDrag}
              className="hidden lg:flex w-2 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 shrink-0 z-[120] touch-none transition-colors group">
              <GripVertical size={12} className="text-[var(--text)] opacity-20 group-hover:opacity-60"/>
            </div>
            <aside style={{width:window.innerWidth>=1024?`${rpW}px`:'100%'}}
              className="glass flex flex-col shrink-0 z-[100] lg:relative absolute inset-0 lg:inset-auto border-t-0 border-b-0 border-r-0 animate-slide-in">
              <div className="h-14 lg:h-16 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] text-white flex items-center justify-between px-4 shrink-0">
                <span className="font-black flex items-center gap-2 text-base"><Sparkles size={18}/> AI Studio</span>
                <button onClick={()=>setRpOpen(false)} className="w-8 h-8 hover:bg-white/20 rounded-xl flex items-center justify-center"><X size={18}/></button>
              </div>
              <div className="flex shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
                {[['generate','Generate',Zap],['chat','Chat',MessageSquare],['vault','Vault',Database]].map(([id,lbl,Icon])=>(
                  <button key={id} onClick={()=>setRpTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2
                      ${rpTab===id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent text-[var(--text)] opacity-50 hover:opacity-80'}`}>
                    <Icon size={13}/>{lbl}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeDoc&&rpTab==='generate'&&(
                  <GeneratePanel activeDoc={activeDoc} bgTask={bgTask} onStart={startGen}
                    onClear={()=>setBgTask(null)} setFlashcards={setFlashcards} setExams={setExams}
                    setCases={setCases} setNotes={setNotes} onVault={()=>setRpTab('vault')}
                    currentPage={docPages[activeId]||1} addToast={addToast} settings={settings}
                    mindMaps={mindMaps} setMindMaps={setMindMaps}
                    timelines={timelines} setTimelines={setTimelines}/>
                )}
                {activeDoc&&rpTab==='chat'&&(
                  <ChatPanel activeDoc={activeDoc} settings={settings} currentPage={docPages[activeId]||1}/>
                )}
                {activeDoc&&rpTab==='vault'&&(
                  <VaultPanel activeDocId={activeId} flashcards={flashcards} setFlashcards={setFlashcards}
                    exams={exams} setExams={setExams} cases={cases} setCases={setCases}
                    notes={notes} setNotes={setNotes} addToast={addToast}
                    setCurrentPage={setPage} setView={setView} settings={settings}
                    mindMaps={mindMaps} timelines={timelines}/>
                )}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[500] bg-[var(--card)] border-t border-[var(--border)] flex items-center"
        style={{paddingBottom:`max(12px,env(safe-area-inset-bottom))`}}>
        {NAV_ITEMS.map(({icon:Icon,label,v,dis})=>(
          <button key={v} disabled={dis}
            onClick={()=>{if(!dis){if(v==='reader'&&activeId)setView('reader');else if(v!=='reader')setView(v);}}}
            className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-1 transition-all ${dis?'opacity-20':''}`}>
            <Icon size={19} strokeWidth={view===v?2.5:2} className={view===v?'text-[var(--accent)]':'text-[var(--text)] opacity-55'}/>
            <span className={`text-[8px] font-black uppercase tracking-wider ${view===v?'text-[var(--accent)]':'opacity-40'}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Play icon polyfill
const Play=({size=16,...p})=><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><polygon points="5 3 19 12 5 21 5 3"/></svg>;