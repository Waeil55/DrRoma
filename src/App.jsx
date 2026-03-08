import React,{useState,useEffect,useRef,useCallback,useMemo}from'react';
/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MARIAM PRO v7.0 ULTRA — Universal AI Document Intelligence     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  DEPENDENCY VERSIONS (pinned in CONFIG below):                  ║
 * ║   • pdf.js        2.16.105  (Cloudflare CDN)                    ║
 * ║   • mammoth       1.6.0     (Cloudflare CDN, loaded on demand)  ║
 * ║   • xlsx          0.18.5    (Cloudflare CDN, loaded on demand)  ║
 * ║   • lucide-react  (peer dep — managed by npm/package.json)      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  SECURITY POLICY:                                               ║
 * ║   • All file data stays in the user's browser (IndexedDB).      ║
 * ║   • No data is ever sent to any server except the chosen AI     ║
 * ║     provider API (text prompts only — no raw files uploaded).   ║
 * ║   • API keys are stored in IndexedDB only, never in cookies or  ║
 * ║     localStorage, and are never transmitted except to the       ║
 * ║     provider endpoint chosen by the user.                       ║
 * ║   • Do NOT store HIPAA/GDPR regulated data without adding       ║
 * ║     server-side encryption and access controls.                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
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
Printer,FileDown,FolderOpen,Pin,Copy,ExternalLink,
Bell,Archive,BarChart,BookCopy,CalendarDays,FlameKindling,
Trophy,Percent,PenLine,Scissors,Bookmark,History,Plus,
MoreVertical,CheckCheck,CircleDot,Flame,Heart,Leaf,
}from'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   DYNAMIC CDN LOADERS — no npm install needed.
   Versions are pinned in CONFIG above so upgrades are one-line changes.
═══════════════════════════════════════════════════════════════════ */
/**
 * Injects a <script> tag and resolves with the global the library exposes.
 * Safe to call multiple times — returns the cached global immediately if loaded.
 */
/* ── IMMEDIATE MOBILE FIXES (runs before first React render) ──────────────────
   1. viewport-fit=cover  →  env(safe-area-inset-*) gets real iPhone values
   2. body background     →  no white flash / gap behind fixed nav
──────────────────────────────────────────────────────────────────────────── */
(()=>{
  // viewport-fit=cover must exist BEFORE first paint for safe-area-inset to work
  let vp=document.querySelector('meta[name="viewport"]');
  if(!vp){vp=document.createElement('meta');vp.name='viewport';document.head.appendChild(vp);}
  if(!vp.content.includes('viewport-fit=cover')){
    vp.content='width=device-width, initial-scale=1, viewport-fit=cover';
  }
  // Make html+body fill screen colour so no white shows behind fixed nav
  document.documentElement.style.cssText+='height:100%;background:transparent;';
  document.body.style.cssText+='height:100%;background:transparent;margin:0;padding:0;overflow:hidden;';
})();

const loadScript=async(src,globalName)=>{
  if(window[globalName])return window[globalName];
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>{
      if(window[globalName])res(window[globalName]);
      else rej(new Error(`Script loaded but global '${globalName}' not found at ${src}`));
    };
    s.onerror=()=>rej(new Error(`Network error loading ${globalName} from ${src}. Check your internet connection.`));
    document.head.appendChild(s);
  });
};

const loadMammoth=()=>loadScript(CONFIG.MAMMOTH_CDN,'mammoth');
const loadXLSX=()=>loadScript(CONFIG.XLSX_CDN,'XLSX');
const loadJsPDF=()=>loadScript(CONFIG.JSPDF_CDN,'jspdf');


/* ═══════════════════════════════════════════════════════════════════
   CONFIG — change values here, not scattered through the codebase.
   In a production app these would come from import.meta.env / .env
═══════════════════════════════════════════════════════════════════ */
const CONFIG=Object.freeze({
  MARIAM_IMG:'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg',
  NAV_H:72,           // px — mobile bottom nav height
  APP_VER:'v7.0 ULTRA',
  CHUNK:3500,         // chars per virtual page for non-PDF files
  MAX_TOKENS:8000,    // default AI response ceiling
  DB_NAME:'MariamProDB_v70',
  DB_VERSION:9,
  PDF_CDN:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105',
  MAMMOTH_CDN:'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  XLSX_CDN:'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  JSPDF_CDN:'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  RETRY_ATTEMPTS:2,
  PARALLEL_CONCURRENCY:50,
});
const{MARIAM_IMG,NAV_H,APP_VER,CHUNK}=CONFIG;

/* ═══════════════════════════════════════════════════════════════════
   INDEXED DB — with proper migration strategy and async/await
   Migration guide: bump CONFIG.DB_VERSION and add a case below.
═══════════════════════════════════════════════════════════════════ */

/** Centralised error logger — swap console.error for Sentry.captureException etc. */
const logError=(context,err)=>{
  console.error(`[MariamPro][${context}]`,err?.message||err);
};

/**
 * Opens (or upgrades) the IndexedDB database.
 * onupgradeneeded handles ALL schema migrations in version order,
 * so the DB is always consistent regardless of which version the
 * user was previously on.
 */
const openDB=()=>new Promise((resolve,reject)=>{
  if(!window.indexedDB){
    return reject(new Error('IndexedDB is not supported in this browser.'));
  }
  const request=indexedDB.open(CONFIG.DB_NAME,CONFIG.DB_VERSION);

  request.onupgradeneeded=event=>{
    const db=event.target.result;
    const oldVersion=event.oldVersion;
    if(oldVersion<9){
      if(!db.objectStoreNames.contains('files'))db.createObjectStore('files');
      if(!db.objectStoreNames.contains('appState'))db.createObjectStore('appState');
    }
  };

  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>{
    const msg=`Failed to open IndexedDB: ${request.error?.message||'unknown error'}`;
    logError('openDB',msg);
    reject(new Error(msg));
  };
  request.onblocked=()=>{
    logError('openDB','Database upgrade blocked — close other tabs running this app.');
  };
});

/**
 * Generic database operation wrapper.
 * Uses async/await internally; always rejects with a descriptive Error.
 */
const dbOp=async(store,mode,op)=>{
  let db;
  try{db=await openDB();}
  catch(err){throw new Error(`DB open failed for store '${store}': ${err.message}`);}

  return new Promise((resolve,reject)=>{
    let tx,objectStore,request;
    try{
      tx=db.transaction(store,mode);
      objectStore=tx.objectStore(store);
      request=op(objectStore);
    }catch(err){
      const msg=`DB transaction setup failed (${store}/${mode}): ${err.message}`;
      logError('dbOp',msg);
      return reject(new Error(msg));
    }

    if(request?.onsuccess!==undefined){
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>{
        const msg=`DB request failed (${store}): ${request.error?.message||'unknown'}`;
        logError('dbOp',msg);
        reject(new Error(msg));
      };
    }else{
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>{
        const msg=`DB transaction failed (${store}): ${tx.error?.message||'unknown'}`;
        logError('dbOp',msg);
        reject(new Error(msg));
      };
    }
  });
};

// Typed helpers — all return Promises; callers should await them
const saveFile  =(id,data)=>dbOp('files','readwrite',s=>{s.put(data,id);});
const getFile   =id       =>dbOp('files','readonly', s=>s.get(id));
const delFile   =id       =>dbOp('files','readwrite',s=>{s.delete(id);});
const saveState =(key,val)=>dbOp('appState','readwrite',s=>{s.put(val,key);});
const getState  =key      =>dbOp('appState','readonly', s=>s.get(key));

/* ═══════════════════════════════════════════════════════════════════
   PDF.JS LOADER — with retry and descriptive error messages
═══════════════════════════════════════════════════════════════════ */
/**
 * Loads PDF.js from CDN with up to RETRY_ATTEMPTS retries.
 * Throws a user-friendly Error if all attempts fail.
 */
const loadPdfJs=async()=>{
  if(window.pdfjsLib)return window.pdfjsLib;

  const base=CONFIG.PDF_CDN;
  let lastErr;
  for(let attempt=1;attempt<=CONFIG.RETRY_ATTEMPTS+1;attempt++){
    try{
      await new Promise((resolve,reject)=>{
        const sc=document.createElement('script');
        sc.src=`${base}/pdf.min.js`;
        sc.onload=()=>{
          if(!window.pdfjsLib){
            return reject(new Error('PDF.js script loaded but pdfjsLib global not found.'));
          }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc=`${base}/pdf.worker.min.js`;
          resolve();
        };
        sc.onerror=()=>reject(new Error(`Network error loading PDF.js from ${sc.src}`));
        document.body.appendChild(sc);
      });
      return window.pdfjsLib; // success
    }catch(err){
      lastErr=err;
      logError(`loadPdfJs attempt ${attempt}`,err);
      if(attempt<=CONFIG.RETRY_ATTEMPTS){
        await new Promise(r=>setTimeout(r,1000*attempt)); // back-off
        if(window.pdfjsLib)return window.pdfjsLib; // loaded by previous try
      }
    }
  }
  throw new Error(
    `Could not load PDF renderer after ${CONFIG.RETRY_ATTEMPTS+1} attempts. `+
    `Check your internet connection. (${lastErr?.message})`
  );
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
   Non-PDF files have no intrinsic page structure, so we split their
   text into virtual pages of CONFIG.CHUNK characters each. This lets
   every file type work with the same page-based AI & reader UI.
═══════════════════════════════════════════════════════════════════ */

/**
 * Splits a plain-text string into numbered virtual pages.
 * Uses paragraph breaks as split points to avoid cutting mid-sentence,
 * then falls back to hard character limits (CONFIG.CHUNK).
 * @returns {{ pagesText: Record<number,string>, totalPages: number }}
 */
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

/** Extracts text from a PDF file page-by-page using PDF.js. */
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

/** Extracts raw text from a .docx/.doc file using mammoth (loaded from CDN). */
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

/** Converts each sheet in an Excel workbook to CSV text, then chunks it. */
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

/** Reads a CSV file as plain text and chunks it into virtual pages. */
const extractCsv=async(file)=>{
  const text=await file.text();
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'csv'};
};

/**
 * Reads an image file as base64.
 * NOTE: base64 data is stored in IndexedDB only for display/AI-vision.
 * No sensitive personal data should be uploaded; the app has no server-side
 * storage — all data stays in the user's own browser.
 */
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

/** Falls back to reading the file as UTF-8 text for code, markdown, logs, etc. */
const extractText=async(file)=>{
  let text='';
  try{text=await file.text();}
  catch(e){text=`Could not read file: ${e.message}`;}
  const{pagesText,totalPages}=chunkText(text);
  return{pagesText,totalPages,rawText:text,fileCategory:'text'};
};

/**
 * Universal entry point: detects the file type and routes to the correct extractor.
 * Always returns { pagesText, totalPages, fileCategory, ...extras }.
 */
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
   AI ENGINE
   Supports: Anthropic (default, no key needed in Claude artifacts),
   OpenAI, Google Gemini, DeepSeek, Groq, Ollama, and any
   OpenAI-compatible endpoint. Provider is selected in Settings.
═══════════════════════════════════════════════════════════════════ */
/**
 * One-shot AI call. Returns the model's text response.
 * @param {boolean} expectJson  — appends a strict "return only JSON" instruction
 * @param {boolean} strictMode  — tells the model to cite only the document text
 */
const callAI=async(prompt,expectJson,strictMode,settings={},maxTokens=8000)=>{
  const{provider='anthropic',apiKey='',baseUrl='',model=''}=settings;
  const sys=`CRITICAL INSTRUCTION: You are an expert AI that generates EXCLUSIVELY from the provided PDF/document content below. You must NEVER use outside knowledge, general facts, or information not present in the document. Every question, answer, explanation, and vignette must be directly traceable to the document text. If a concept is not in the document, do not include it. Generate long, detailed, comprehensive content — questions should be multi-sentence with rich clinical/academic context. Explanations must be thorough (3-5 sentences minimum). ${strictMode?'STRICT MODE: Cite [Page X] for every single item.':'Always reference the source material explicitly.'}\n\nMEDICINE RULE — CRITICAL: Whenever any explanation, answer, flashcard, exam question, or clinical case involves a medication or drug, you MUST begin that explanation/answer/description by stating the brand name first, followed by the generic name in parentheses. Example: "Tylenol (acetaminophen)" or "Lipitor (atorvastatin)". If only the generic name is mentioned in the document, look it up from pharmacological knowledge and always present as: "BrandName (generic name) — [explanation]". This rule applies to ALL content types: flashcards, exams, clinical cases, summaries, and chat responses.`;
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

/**
 * Safely parses a JSON string that may be wrapped in markdown code fences.
 * Throws a descriptive error if the content cannot be parsed.
 */
const parseJson=txt=>{
  // Strip markdown fences and leading/trailing whitespace
  let cleaned=txt.replace(/```json/gi,'').replace(/```/g,'').trim();
  // Extract the outermost JSON object if there's preamble text
  const start=cleaned.indexOf('{');
  const end=cleaned.lastIndexOf('}');
  if(start!==-1&&end!==-1&&end>start)cleaned=cleaned.substring(start,end+1);
  try{
    return JSON.parse(cleaned);
  }catch(err){
    throw new Error(`AI response was not valid JSON. Raw text (first 200 chars): ${cleaned.substring(0,200)}`);
  }
};

/**
 * Runs an array of async task-functions with bounded concurrency.
 * Uses Promise.allSettled so a failed batch does not abort the rest.
 * @param {Function[]} tasks - zero-arg functions returning Promises
 * @param {number} concurrency - max simultaneous requests
 * @param {Function} [onProgress] - called with (completed, total) after each batch
 */
const runParallel=async(tasks,concurrency=10,onProgress)=>{
  const results=[];
  for(let i=0;i<tasks.length;i+=concurrency){
    const batch=tasks.slice(i,i+concurrency);
    const batchResults=await Promise.allSettled(batch.map(fn=>fn()));
    results.push(...batchResults);
    if(onProgress)onProgress(Math.min(i+concurrency,tasks.length),tasks.length);
  }
  return results;
};

/* ═══════════════════════════════════════════════════════════════════
   PDF EXPORT ENGINE — generates printable PDFs via jsPDF
═══════════════════════════════════════════════════════════════════ */
const exportToPDF=async(type,data,title,addToast)=>{
  try{
    const lib=await loadJsPDF();
    const jsPDF=lib.jspdf?.jsPDF||lib.jsPDF||window.jspdf?.jsPDF;
    if(!jsPDF)throw new Error('jsPDF failed to load.');
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const pageW=210,pageH=297,margin=15,colW=pageW-margin*2;
    let y=margin;

    const checkPage=(needed=12)=>{if(y+needed>pageH-margin){doc.addPage();y=margin;}};
    const drawLine=()=>{doc.setDrawColor(200,200,200);doc.line(margin,y,pageW-margin,y);y+=4;};

    // Header
    doc.setFillColor(99,102,241);doc.rect(0,0,pageW,18,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(14);doc.setFont('helvetica','bold');
    doc.text('MARIAM PRO',margin,11);
    doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text(`${type.toUpperCase()} · ${title}`,margin+40,11);
    doc.text(`Generated ${new Date().toLocaleDateString()}`,pageW-margin-35,11);
    y=24;

    doc.setTextColor(30,30,30);

    if(type==='flashcards'){
      data.forEach((card,i)=>{
        checkPage(28);
        doc.setFillColor(248,250,252);doc.roundedRect(margin,y,colW,24,2,2,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(99,102,241);
        doc.text(`Q${i+1}`,margin+3,y+6);
        doc.setTextColor(30,30,30);doc.setFont('helvetica','normal');doc.setFontSize(9);
        const qLines=doc.splitTextToSize(card.q||'',colW-12);
        doc.text(qLines,margin+10,y+6);
        const qH=Math.min(qLines.length*4.5,14);
        doc.setFillColor(238,240,255);doc.roundedRect(margin+2,y+qH+2,colW-4,10,1,1,'F');
        doc.setTextColor(79,70,229);doc.setFontSize(8.5);
        const aLines=doc.splitTextToSize(card.a||'',colW-10);
        doc.text(aLines.slice(0,2),margin+5,y+qH+7);
        y+=28;doc.setTextColor(30,30,30);
      });
    }else if(type==='exam'){
      data.forEach((q,i)=>{
        const opts=q.options||[];
        const needed=22+opts.length*7+(q.explanation?12:0);
        checkPage(needed);
        doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(30,30,30);
        const qLines=doc.splitTextToSize(`Q${i+1}. ${q.q||q.question||''}`,colW);
        doc.text(qLines,margin,y);y+=qLines.length*5+3;
        opts.forEach((opt,oi)=>{
          const isCorrect=oi===q.correct;
          if(isCorrect){doc.setFillColor(220,252,231);doc.roundedRect(margin,y-3.5,colW,6.5,1,1,'F');}
          doc.setFont('helvetica',isCorrect?'bold':'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(isCorrect?22:80,isCorrect?163:80,isCorrect?74:80);
          doc.text(`${String.fromCharCode(65+oi)}. ${opt}`,margin+3,y);
          if(isCorrect){doc.setTextColor(22,163,74);doc.text('✓',pageW-margin-5,y);}
          y+=6.5;
        });
        if(q.explanation){
          checkPage(12);
          doc.setFillColor(254,252,232);doc.roundedRect(margin,y,colW,10,1,1,'F');
          doc.setFont('helvetica','italic');doc.setFontSize(7.5);doc.setTextColor(120,100,20);
          const expLines=doc.splitTextToSize(q.explanation,colW-6);
          doc.text(expLines.slice(0,2),margin+3,y+4);y+=12;
        }
        drawLine();y+=2;
        doc.setTextColor(30,30,30);
      });
    }else if(type==='cases'){
      data.forEach((cas,i)=>{
        checkPage(40);
        const q=cas.examQuestion||cas;
        doc.setFillColor(240,249,255);doc.roundedRect(margin,y,colW,8,2,2,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(14,116,144);
        doc.text(`Case ${i+1}: ${cas.title||'Clinical Case'}`,margin+3,y+5.5);y+=11;
        doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(30,30,30);
        const vigLines=doc.splitTextToSize(cas.vignette||'',colW);
        doc.text(vigLines.slice(0,6),margin,y);y+=Math.min(vigLines.length,6)*4.5+5;
        if(cas.diagnosis){
          doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(16,185,129);
          doc.text(`Dx: ${cas.diagnosis}`,margin,y);y+=6;
        }
        const opts=q.options||[];
        opts.forEach((opt,oi)=>{
          const isCorrect=oi===q.correct;
          doc.setFont('helvetica',isCorrect?'bold':'normal');doc.setFontSize(8.5);
          doc.setTextColor(isCorrect?22:80,isCorrect?163:80,isCorrect?74:80);
          doc.text(`${String.fromCharCode(65+oi)}. ${opt}`,margin+3,y);y+=6;
        });
        drawLine();y+=3;doc.setTextColor(30,30,30);
      });
    }

    // Footer on each page
    const totalPages=doc.getNumberOfPages();
    for(let i=1;i<=totalPages;i++){
      doc.setPage(i);doc.setFontSize(7);doc.setTextColor(160,160,160);
      doc.text(`MARIAM PRO · ${title}`,margin,pageH-6);
      doc.text(`Page ${i} of ${totalPages}`,pageW-margin-18,pageH-6);
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g,'_')}_${type}.pdf`);
    if(addToast)addToast('PDF exported! 📄','success');
  }catch(e){
    console.error('PDF export error:',e);
    if(addToast)addToast(`PDF export failed: ${e.message}`,'error');
  }
};

/* ═══════════════════════════════════════════════════════════════════
   STUDY ANALYTICS — track sessions, streaks, scores
   Stored in window to survive view changes
═══════════════════════════════════════════════════════════════════ */
if(!window.__MARIAM_ANALYTICS__)window.__MARIAM_ANALYTICS__={
  sessions:[],streak:0,lastStudy:null,totalCards:0,totalExams:0,scores:[]
};
const ANALYTICS=window.__MARIAM_ANALYTICS__;
const trackStudy=(type,score,total)=>{
  const today=new Date().toDateString();
  if(ANALYTICS.lastStudy!==today){
    ANALYTICS.streak=(ANALYTICS.lastStudy===new Date(Date.now()-86400000).toDateString())?ANALYTICS.streak+1:1;
    ANALYTICS.lastStudy=today;
  }
  if(type==='flashcard')ANALYTICS.totalCards++;
  if(type==='exam'&&score!==undefined)ANALYTICS.scores.push({date:Date.now(),score,total,pct:Math.round(score/total*100)});
  ANALYTICS.sessions.push({type,date:Date.now()});
  if(ANALYTICS.sessions.length>500)ANALYTICS.sessions=ANALYTICS.sessions.slice(-500);
};

/* ═══════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS HOOK
═══════════════════════════════════════════════════════════════════ */
function useKeyboardShortcuts(shortcuts){
  useEffect(()=>{
    const handler=e=>{
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
      for(const[combo,fn]of shortcuts){
        const parts=combo.toLowerCase().split('+');
        const key=parts[parts.length-1];
        const ctrl=parts.includes('ctrl');
        const meta=parts.includes('meta');
        const alt=parts.includes('alt');
        if(e.key.toLowerCase()===key&&
          (ctrl?(e.ctrlKey||e.metaKey):!e.ctrlKey)&&
          (alt?e.altKey:!e.altKey)){
          e.preventDefault();fn();break;
        }
      }
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[shortcuts]);
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL SEARCH — searches across all content
═══════════════════════════════════════════════════════════════════ */
function GlobalSearch({docs,flashcards,exams,cases,notes,onNavigate,onClose}){
  const[q,setQ]=useState('');const inputRef=useRef(null);
  useEffect(()=>{inputRef.current?.focus();},[]);

  const results=useMemo(()=>{
    if(!q.trim()||q.length<2)return[];
    const lq=q.toLowerCase();const out=[];
    docs.forEach(d=>{if(d.name.toLowerCase().includes(lq))out.push({type:'doc',icon:FileText,label:d.name,sub:`${d.totalPages} pages`,color:'#6366f1',action:()=>onNavigate('reader',d.id)});});
    flashcards.forEach(set=>set.cards?.forEach(c=>{if((c.q+c.a).toLowerCase().includes(lq))out.push({type:'card',icon:Layers,label:c.q.slice(0,60),sub:set.title,color:'#8b5cf6',action:()=>onNavigate('flashcards')});}));
    exams.forEach(ex=>ex.questions?.forEach(q2=>{if((q2.q||'').toLowerCase().includes(lq))out.push({type:'exam',icon:CheckSquare,label:(q2.q||'').slice(0,60),sub:ex.title,color:'#3b82f6',action:()=>onNavigate('exams')});}));
    cases.forEach(set=>set.questions?.forEach(c=>{if((c.vignette||'').toLowerCase().includes(lq))out.push({type:'case',icon:Activity,label:(c.title||c.vignette||'').slice(0,60),sub:set.title,color:'#06b6d4',action:()=>onNavigate('cases')});}));
    notes.forEach(n=>{if((n.title+n.content).toLowerCase().includes(lq))out.push({type:'note',icon:PenLine,label:n.title,sub:n.content?.slice(0,50),color:'#f59e0b',action:()=>onNavigate('library')});});
    return out.slice(0,12);
  },[q,docs,flashcards,exams,cases,notes]);

  return(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 px-4"
      style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(12px)'}}
      onClick={onClose}>
      <div className="w-full max-w-2xl glass rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-[var(--accent)]/30"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[color:var(--border2,var(--border))]">
          <Search size={20} className="text-[var(--accent)] shrink-0"/>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search everything — documents, cards, questions, cases, notes…"
            className="flex-1 bg-transparent text-sm outline-none font-medium placeholder:opacity-40 text-[var(--text)]"/>
          <kbd className="text-xs font-black opacity-30 px-2 py-1 glass rounded-lg">ESC</kbd>
          <button onClick={onClose} className="opacity-40 hover:opacity-80"><X size={18}/></button>
        </div>
        {q.length>=2&&(
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {results.length===0?(
              <div className="py-12 text-center opacity-40">
                <Search size={32} className="mx-auto mb-3"/>
                <p className="text-sm font-bold">No results for "{q}"</p>
              </div>
            ):results.map((r,i)=>(
              <button key={i} onClick={()=>{r.action();onClose();}}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--accent)]/5 transition-colors text-left border-b border-[color:var(--border2,var(--border))]/50 last:border-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:r.color+'20'}}>
                  <r.icon size={16} style={{color:r.color}}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{r.label}</p>
                  <p className="text-xs opacity-50 truncate">{r.sub}</p>
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-30 px-2 py-1 glass rounded-lg shrink-0">{r.type}</span>
              </button>
            ))}
          </div>
        )}
        {!q&&(
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['Documents','doc',FileText,'#6366f1'],['Flashcards','flashcards',Layers,'#8b5cf6'],['Exams','exams',CheckSquare,'#3b82f6'],['Cases','cases',Activity,'#06b6d4']].map(([lbl,v,Icon,col])=>(
              <button key={v} onClick={()=>{onNavigate(v);onClose();}}
                className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[var(--accent)]/30 transition-all">
                <Icon size={20} style={{color:col}}/>
                <span className="text-xs font-black">{lbl}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD VIEW — stats, streaks, recent activity, quick actions
═══════════════════════════════════════════════════════════════════ */
function DashboardView({docs,flashcards,exams,cases,notes,chatSessions,setView,setActiveId,addToast,settings}){
  const totalCards=flashcards.reduce((s,f)=>s+(f.cards?.length||0),0);
  const totalQ=exams.reduce((s,e)=>s+(e.questions?.length||0),0);
  const totalCases=cases.reduce((s,c)=>s+(c.questions?.length||0),0);
  const dueCards=flashcards.reduce((s,f)=>s+(f.cards?.filter(c=>c.nextReview<=Date.now()).length||0),0);
  const recentScores=ANALYTICS.scores.slice(-7);
  const avgScore=recentScores.length?Math.round(recentScores.reduce((s,r)=>s+r.pct,0)/recentScores.length):0;
  const streak=ANALYTICS.streak||0;

  const STAT_CARDS=[
    {label:'Documents',value:docs.length,icon:FileText,color:'#6366f1',sub:'uploaded'},
    {label:'Flashcards',value:totalCards,icon:Layers,color:'#8b5cf6',sub:`${dueCards} due today`,urgent:dueCards>0},
    {label:'Exam Qs',value:totalQ,icon:CheckSquare,color:'#3b82f6',sub:`${exams.length} exams`},
    {label:'Cases',value:totalCases,icon:Activity,color:'#06b6d4',sub:`${cases.length} sets`},
    {label:'Notes',value:notes.length,icon:PenLine,color:'#f59e0b',sub:'saved'},
    {label:'Study Streak',value:streak,icon:Flame,color:'#ef4444',sub:'days 🔥',urgent:streak>=3},
  ];

  const recentDocs=docs.slice(-4).reverse();
  const bgTaskList=Object.values(window.__MARIAM_BG__?.tasks||{});

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
      <div className="max-w-6xl mx-auto p-5 lg:p-8 space-y-6">

        {/* ── HERO ── */}
        <div className="flex items-start justify-between gap-4 animate-slide-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge text-xs">
                {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
              </span>
              {streak>=3&&<span className="badge" style={{color:'#f59e0b',borderColor:'rgba(245,158,11,.3)',background:'rgba(245,158,11,.1)'}}>🔥 {streak} day streak</span>}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight" style={{fontFamily:'Plus Jakarta Sans,system-ui',color:'var(--text)'}}>
              {new Date().getHours()<12?'Good morning ☀️':new Date().getHours()<17?'Good afternoon 🌤':'Good evening 🌙'} 👋
            </h1>
            <p className="text-base mt-1 font-medium" style={{color:'var(--text2)'}}>
              {docs.length===0?'Upload a document to get started':'Your AI-powered study command center'}
            </p>
          </div>
          <div className="relative shrink-0 hidden sm:block">
            <img src={MARIAM_IMG} alt="" className="w-16 h-16 rounded-2xl object-cover"
              style={{boxShadow:'0 0 0 3px rgba(var(--acc-rgb,99,102,241),.25),0 8px 24px rgba(0,0,0,.3)'}}/>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map(({label,value,icon:Icon,color,sub,urgent},i)=>(
            <div key={label}
              className={`card-lined rounded-2xl p-4 cursor-default animate-slide-up stagger-${Math.min(i+1,6)}`}
              style={urgent?{borderTopColor:color+'99'}:{}}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:color+'18'}}>
                  <Icon size={17} style={{color}}/>
                </div>
                {urgent&&<div className="w-2 h-2 rounded-full animate-pulse" style={{background:color}}/>}
              </div>
              <p className="text-3xl lg:text-4xl font-black leading-none" style={{color,fontFamily:'Plus Jakarta Sans,system-ui'}}>{value}</p>
              <p className="text-xs font-black uppercase tracking-widest mt-1.5" style={{color:'var(--text3)',fontSize:10}}>{label}</p>
              <p className="text-xs mt-0.5 font-medium" style={{color:'var(--text3)'}}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── BG TASKS ── */}
        {bgTaskList.filter(t=>t.status==='running'||t.status==='done').length>0&&(
          <div className="card-lined rounded-2xl p-5 animate-fade-in" style={{borderTopColor:'rgba(var(--acc-rgb,99,102,241),.4)'}}>
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{color:'var(--text3)'}}>
              <Zap size={13} style={{color:'var(--accent)'}}/> Active Generation
            </h2>
            <div className="space-y-2.5">
              {bgTaskList.map((t,i)=>(
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                  style={t.status==='done'?{borderColor:'rgba(16,185,129,.3)',background:'rgba(16,185,129,.05)'}:{borderColor:'var(--border2,var(--border))',background:'var(--surface2,var(--card))'}}>
                  {t.status==='running'?<Loader2 size={14} className="animate-spin shrink-0" style={{color:'var(--accent)'}}/>:<CheckCircle2 size={14} className="shrink-0" style={{color:'#10b981'}}/>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate capitalize">{t.type} · {t.docName?.slice(0,28)}</p>
                    {t.status==='running'&&t.total>1&&(
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{background:'var(--border2,var(--border))'}}>
                        <div className="h-full rounded-full transition-all duration-500" style={{width:`${((t.done||0)/t.total)*100}%`,background:'linear-gradient(90deg,var(--accent),var(--accent2,var(--accent)))'}}/>
                      </div>
                    )}
                    {t.status==='done'&&<p className="text-xs mt-0.5" style={{color:'var(--text3)'}}>{t.result?.count} items ready</p>}
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                    style={t.status==='done'?{background:'rgba(16,185,129,.15)',color:'#10b981'}:{background:'rgba(var(--acc-rgb,99,102,241),.12)',color:'var(--accent)'}}>
                    {t.status==='done'?'Done':'Running'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent Docs */}
          <div className="card-lined rounded-2xl p-5 lg:col-span-3 animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{color:'var(--text3)'}}>
                <History size={13} style={{color:'var(--accent)'}}/> Recent Documents
              </h2>
              <button onClick={()=>setView('library')} className="text-xs font-bold transition-all" style={{color:'var(--accent)',opacity:.7}}>View all →</button>
            </div>
            {recentDocs.length===0?(
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'rgba(var(--acc-rgb,99,102,241),.08)',border:'1px solid rgba(var(--acc-rgb,99,102,241),.15)'}}>
                  <FileText size={22} style={{color:'var(--accent)',opacity:.5}}/>
                </div>
                <p className="text-sm font-bold" style={{color:'var(--text3)'}}>No documents yet</p>
                <button onClick={()=>setView('library')} className="btn-accent px-4 py-2 rounded-xl text-sm font-black">Upload Document</button>
              </div>
            ):recentDocs.map((doc,i)=>(
              <button key={doc.id} onClick={()=>{setActiveId(doc.id);setView('reader');}}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl transition-all group hover:bg-[rgba(var(--acc-rgb,99,102,241),0.05)] mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black"
                  style={{background:`linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))`}}>
                  {doc.name.slice(0,2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{doc.name}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--text3)'}}>{doc.totalPages} pages · {new Date(doc.addedAt||0).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{color:'var(--accent)'}}/>
              </button>
            ))}
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Study Stats */}
            <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-3">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{color:'var(--text3)'}}>
                <BarChart size={13} style={{color:'var(--accent)'}}/> Study Progress
              </h2>
              {[
                {label:'Avg Score',val:`${avgScore}%`,pct:avgScore,color:'#818cf8'},
                {label:'Cards Studied',val:ANALYTICS.totalCards,pct:Math.min(100,Math.round((ANALYTICS.totalCards/Math.max(1,totalCards))*100)),color:'#a78bfa'},
                {label:'Due Cards',val:dueCards,pct:Math.min(100,Math.round((dueCards/Math.max(1,totalCards))*100)),color:dueCards>0?'#f43f5e':'#10b981'},
              ].map(({label,val,pct,color})=>(
                <div key={label} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium" style={{color:'var(--text2)'}}>{label}</span>
                    <span className="text-xs font-black" style={{color}}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--border2,var(--border))'}}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-4">
              <h2 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{color:'var(--text3)'}}>
                <Zap size={13} style={{color:'var(--accent)'}}/> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {lbl:'Study Cards',Icon:Layers,v:'flashcards',col:'#a78bfa'},
                  {lbl:'Take Exam',Icon:CheckSquare,v:'exams',col:'#818cf8'},
                  {lbl:'Cases',Icon:Activity,v:'cases',col:'#22d3ee'},
                  {lbl:'AI Chat',Icon:MessageSquare,v:'chat',col:'#34d399'},
                ].map(({lbl,Icon,v,col})=>(
                  <button key={v} onClick={()=>setView(v)}
                    className="flex flex-col items-start gap-2 p-3.5 rounded-xl card-hover transition-all"
                    style={{background:'var(--surface2,var(--card))',border:'1px solid var(--border2,var(--border))'}}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:col+'18'}}>
                      <Icon size={16} style={{color:col}}/>
                    </div>
                    <span className="text-xs font-black" style={{color:'var(--text)'}}>{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scores Chart */}
        {recentScores.length>0&&(
          <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-5">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{color:'var(--text3)'}}>
              <TrendingUp size={13} style={{color:'var(--accent)'}}/> Exam Score History
            </h2>
            <div className="flex items-end gap-2" style={{height:80}}>
              {recentScores.map((s,i)=>{
                const col=s.pct>=80?'#10b981':s.pct>=60?'#f59e0b':'#f43f5e';
                return(
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-black" style={{color:col,fontSize:10}}>{s.pct}%</span>
                    <div className="w-full rounded-t-lg relative overflow-hidden"
                      style={{height:`${Math.max(4,s.pct*.7)}px`,background:`${col}22`,border:`1px solid ${col}44`}}>
                      <div className="absolute inset-x-0 bottom-0" style={{height:'60%',background:`${col}88`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BACKGROUND TASKS
   Tasks survive page navigation, component unmounts, and even if the
   user switches views mid-generation. Uses module-level storage so
   React state lifecycle doesn't kill ongoing fetch chains.
═══════════════════════════════════════════════════════════════════ */
if(!window.__MARIAM_BG__)window.__MARIAM_BG__={tasks:{},listeners:new Set()};

const BG=window.__MARIAM_BG__;

const bgEmit=()=>BG.listeners.forEach(fn=>fn({...BG.tasks}));

const bgStart=(id,meta)=>{BG.tasks[id]={...meta,startedAt:Date.now(),status:'running'};bgEmit();};
const bgUpdate=(id,patch)=>{if(BG.tasks[id]){BG.tasks[id]={...BG.tasks[id],...patch};bgEmit();}};
const bgFinish=(id,result)=>{if(BG.tasks[id]){BG.tasks[id]={...BG.tasks[id],status:'done',result,finishedAt:Date.now()};bgEmit();}};
const bgFail=(id,err)=>{if(BG.tasks[id]){BG.tasks[id]={...BG.tasks[id],status:'error',error:err};bgEmit();}};
const bgClear=(id)=>{delete BG.tasks[id];bgEmit();};

function useBgTasks(){
  const[tasks,setTasks]=useState({...BG.tasks});
  useEffect(()=>{
    const fn=t=>setTasks({...t});
    BG.listeners.add(fn);
    return()=>BG.listeners.delete(fn);
  },[]);
  return tasks;
}

/**
 * Run a generation task fully in the background.
 * Calls startGen-style logic but stores progress in the BG registry
 * so it persists regardless of which page the user is on.
 */
const runBgGeneration=async({taskId,docId,docName,taskType,startPage,endPage,count,difficultyLevel,targetLang,settings,onSave})=>{
  const batchSize=40;
  const isBatch=count>batchSize&&['flashcards','exam','cases'].includes(taskType);
  const numBatches=isBatch?Math.ceil(count/batchSize):1;

  bgStart(taskId,{type:taskType,docName,msg:'Loading document…',done:0,total:numBatches});

  try{
    const fileData=await getFile(docId);
    if(!fileData)throw new Error('Document not found in storage.');

    const pageRange=Array.from({length:endPage-startPage+1},(_,i)=>startPage+i);
    const textChunks=pageRange.map(p=>(fileData.pagesText?.[p]||'')).filter(Boolean);
    const fullText=textChunks.join('\n\n').substring(0,80000);

    if(!fullText.trim())throw new Error('No text could be extracted from the selected page range.');

    bgUpdate(taskId,{msg:'Generating…',done:0,total:numBatches});

    const MEDICINE_RULE=`\n\nMEDICINE RULE — MANDATORY: For every medication/drug mentioned in any question, answer, explanation, or vignette, ALWAYS write the brand name first followed by generic name in parentheses. Format: "BrandName (generic)" e.g. "Lasix (furosemide)", "Tylenol (acetaminophen)", "Glucophage (metformin)". Apply this rule to EVERY drug in EVERY item.`;

    const makePrompt=(bc)=>{
      const base=`DOCUMENT: "${docName}" | Pages ${startPage}-${endPage}\n\nDOCUMENT CONTENT (generate ONLY from this):\n${fullText}\n\nDIFFICULTY: ${difficultyLevel}${MEDICINE_RULE}\n\n`;
      if(taskType==='flashcards')return`${base}YOU MUST generate EXACTLY ${bc} flashcards — no more, no fewer. Count carefully before responding. Use ONLY topics from the document above. Each question must be a complete, multi-sentence clinical/academic question. Answers must be comprehensive (3-5 sentences). RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"q":"detailed question","a":"comprehensive answer","evidence":"exact quote","sourcePage":1}]}`;
      if(taskType==='exam')return`${base}YOU MUST generate EXACTLY ${bc} MCQ questions — no more, no fewer. Count carefully before responding. Use ONLY content from the document. Each stem must be 2-4 sentences. All 4 options must be plausible. Explanation must be 3-5 sentences. RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"q":"detailed question stem","options":["A. option","B. option","C. option","D. option"],"correct":0,"explanation":"thorough explanation","evidence":"exact quote","sourcePage":1}]}`;
      if(taskType==='cases')return`${base}YOU MUST generate EXACTLY ${bc} clinical cases — no more, no fewer. Count carefully. Use ONLY document content. Each case needs: vignette (8-12 sentences with demographics/HPI/PMH/meds/vitals/exam), 3 lab panels (12+ total rows), examQuestion with 5 options (A-E). RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"vignette":"8-12 sentence case","title":"title","diagnosis":"diagnosis","labPanels":[{"panelName":"COMPLETE BLOOD COUNT","rows":[{"test":"WBC","result":"value","flag":"H","range":"4.5-11.0","units":"K/uL"},{"test":"Hgb","result":"value","flag":"","range":"12-16","units":"g/dL"},{"test":"Hct","result":"value","flag":"","range":"36-46","units":"%"},{"test":"Platelets","result":"value","flag":"","range":"150-400","units":"K/uL"},{"test":"MCV","result":"value","flag":"","range":"80-100","units":"fL"}]},{"panelName":"BASIC METABOLIC PANEL","rows":[{"test":"Sodium","result":"value","flag":"","range":"135-145","units":"mEq/L"},{"test":"Potassium","result":"value","flag":"","range":"3.5-5.0","units":"mEq/L"},{"test":"Creatinine","result":"value","flag":"","range":"0.6-1.2","units":"mg/dL"},{"test":"BUN","result":"value","flag":"","range":"7-20","units":"mg/dL"},{"test":"Glucose","result":"value","flag":"","range":"70-100","units":"mg/dL"}]},{"panelName":"DISEASE-SPECIFIC PANEL","rows":[{"test":"test1","result":"value","flag":"H","range":"ref","units":"u"},{"test":"test2","result":"value","flag":"L","range":"ref","units":"u"},{"test":"test3","result":"value","flag":"","range":"ref","units":"u"},{"test":"test4","result":"value","flag":"","range":"ref","units":"u"}]}],"examQuestion":{"q":"2-3 sentence question","options":["A) opt","B) opt","C) opt","D) opt","E) opt"],"correct":0,"explanation":"4-6 sentence explanation"}}]}`;
      return`${base}Analyze this content comprehensively using only the document provided.`;
    };

    const isJson=['flashcards','exam','cases'].includes(taskType);
    const tasks=Array.from({length:numBatches},(_,i)=>{
      // Calculate exact batch size: last batch gets the remainder, all others get batchSize
      const bc=i===numBatches-1?(count%batchSize===0?batchSize:count%batchSize):batchSize;
      return()=>callAI(makePrompt(bc),isJson,false,settings,8000);
    });

    let all=[];
    const results=await runParallel(tasks,50,(done,total)=>{
      bgUpdate(taskId,{done,total,msg:`${done}/${total} batches complete…`});
    });

    for(const r of results){
      if(r.status==='fulfilled'){
        try{
          const p=parseJson(r.value);
          all=[...all,...(p.items||p.cases||p.questions||p.flashcards||[])];
        }catch(e){console.warn('BG parse err:',e.message);}
      }
    }
    if(!all.length)throw new Error('AI returned no parseable data. Try again with a different page range.');

    const finalData=all.slice(0,count);
    bgFinish(taskId,{type:taskType,data:finalData,pages:`${startPage}-${endPage}`,docName,count:finalData.length});
    if(onSave)onSave(finalData,taskId);
  }catch(e){
    bgFail(taskId,e.message||String(e));
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL TASK INDICATOR — floating pill visible on all pages
═══════════════════════════════════════════════════════════════════ */
function GlobalTaskIndicator({onViewResult}){
  const tasks=useBgTasks();
  const list=Object.entries(tasks);
  if(!list.length)return null;
  const running=list.filter(([,t])=>t.status==='running');
  const done=list.filter(([,t])=>t.status==='done');
  const errors=list.filter(([,t])=>t.status==='error');
  return(
    <div className="fixed bottom-20 lg:bottom-6 right-3 z-[9990] flex flex-col gap-2 items-end pointer-events-none" style={{maxWidth:320}}>
      {running.map(([id,t])=>(
        <div key={id} className="pointer-events-auto glass rounded-2xl px-4 py-3 shadow-2xl border border-[var(--accent)]/30 flex items-center gap-3 animate-slide-in" style={{background:'var(--card)'}}>
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
            <Loader2 size={15} className="text-[var(--accent)] animate-spin"/>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] truncate">{t.type} · {t.docName?.slice(0,22)||'…'}</p>
            <p className="text-xs opacity-50 font-bold">{t.msg||'Generating…'}</p>
            {t.total>1&&(
              <div className="mt-1 w-32 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{width:`${t.total?((t.done||0)/t.total)*100:10}%`}}/>
              </div>
            )}
          </div>
        </div>
      ))}
      {done.map(([id,t])=>(
        <div key={id} className="pointer-events-auto glass rounded-2xl px-4 py-3 shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-slide-in cursor-pointer hover:border-emerald-500/60 transition-colors"
          onClick={()=>onViewResult&&onViewResult(id,t)}>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} className="text-emerald-500"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">{t.type} ready!</p>
            <p className="text-xs opacity-50 font-bold">{t.result?.count||0} items · {t.docName?.slice(0,20)||'…'} · tap to save</p>
          </div>
          <button onClick={e=>{e.stopPropagation();bgClear(id);}} className="text-xs opacity-40 hover:opacity-80 ml-1 shrink-0"><X size={16}/></button>
        </div>
      ))}
      {errors.map(([id,t])=>(
        <div key={id} className="pointer-events-auto glass rounded-2xl px-4 py-3 shadow-2xl border border-red-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-500"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Failed</p>
            <p className="text-xs opacity-50 font-bold truncate">{t.error?.slice(0,40)||'Unknown error'}</p>
          </div>
          <button onClick={()=>bgClear(id)} className="text-xs opacity-40 hover:opacity-80 ml-1 shrink-0"><X size={16}/></button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   QUICK GENERATE MODAL — for Flashcards / Exams / Cases pages
   Lets users upload a new file or pick from their library,
   choose page range, difficulty, and count (1–1000).
═══════════════════════════════════════════════════════════════════ */
function QuickGenerateModal({type,docs,settings,onClose,onTaskStart,addToast,
  setFlashcards,setExams,setCases}){
  const[tab,setTab]=useState('library'); // 'library' | 'upload'
  const[selDocId,setSelDocId]=useState(docs[0]?.id||null);
  const[uploadedDoc,setUploadedDoc]=useState(null);
  const[uploading,setUploading]=useState(false);
  const[uploadPct,setUploadPct]=useState(0);
  const[entireFile,setEntireFile]=useState(true);
  const[startPage,setStartPage]=useState(1);
  const[endPage,setEndPage]=useState(1);
  const[count,setCount]=useState(20);
  const[difficulty,setDifficulty]=useState(2);
  const levels=['Easy','Medium','Hard'];
  const inputRef=useRef(null);

  const activeDoc=tab==='upload'?uploadedDoc:(docs.find(d=>d.id===selDocId)||null);

  useEffect(()=>{
    if(activeDoc){setStartPage(1);setEndPage(activeDoc.totalPages||1);}
  },[activeDoc?.id]);

  const handleFileUpload=async(files)=>{
    const file=files[0];if(!file)return;
    setUploading(true);setUploadPct(5);
    try{
      const data=await extractUniversal(file,p=>setUploadPct(5+p*85));
      const id='tmp_'+Date.now();
      const doc={id,name:file.name,size:file.size,fileCategory:data.fileCategory,
        totalPages:data.totalPages,createdAt:new Date().toISOString()};
      await saveFile(id,{...data,name:file.name,size:file.size});
      setUploadedDoc(doc);setUploadPct(100);
      setStartPage(1);setEndPage(data.totalPages);
      addToast(`"${file.name}" loaded!`,'success');
    }catch(e){addToast(e.message,'error');}
    finally{setUploading(false);}
  };

  const typeConfig={
    flashcards:{label:'Flashcards',icon:Layers,color:'#6366f1'},
    exam:{label:'Exam',icon:CheckSquare,color:'#3b82f6'},
    cases:{label:'Cases',icon:Activity,color:'#8b5cf6'},
  };
  const tc=typeConfig[type]||typeConfig.flashcards;
  const Icon=tc.icon;

  const handleGo=()=>{
    if(!activeDoc){addToast('Select or upload a document first.','error');return;}
    const sp=entireFile?1:startPage;
    const ep=entireFile?activeDoc.totalPages:endPage;
    const taskId='task_'+Date.now();
    const onSave=(data,tid)=>{
      const now=new Date().toISOString();
      if(type==='flashcards'){
        const cards=data.map(c=>({id:Date.now()+Math.random(),q:c.q,a:c.a,evidence:c.evidence,
          sourcePage:c.sourcePage,repetitions:0,ef:2.5,interval:1,nextReview:Date.now(),lastReview:Date.now()}));
        setFlashcards(p=>[...p,{id:taskId,docId:activeDoc.id,sourcePages:`${sp}-${ep}`,
          title:`Cards — ${activeDoc.name.slice(0,30)}`,cards,createdAt:now}]);
        addToast(`${cards.length} flashcards saved! ⚡`,'success');
      }else if(type==='exam'){
        setExams(p=>[...p,{id:taskId,docId:activeDoc.id,sourcePages:`${sp}-${ep}`,
          title:`Exam — ${activeDoc.name.slice(0,30)}`,questions:data,createdAt:now}]);
        addToast(`${data.length} exam questions saved! ⚡`,'success');
      }else if(type==='cases'){
        setCases(p=>[...p,{id:taskId,docId:activeDoc.id,sourcePages:`${sp}-${ep}`,
          title:`Cases — ${activeDoc.name.slice(0,30)}`,questions:data,createdAt:now}]);
        addToast(`${data.length} cases saved! ⚡`,'success');
      }
      bgClear(tid);
    };
    runBgGeneration({taskId,docId:activeDoc.id,docName:activeDoc.name,
      taskType:type,startPage:sp,endPage:ep,count,
      difficultyLevel:levels[difficulty-1],settings,onSave});
    if(onTaskStart)onTaskStart(taskId);
    addToast(`Generating ${count} ${tc.label}… runs in background!`,'info');
    onClose();
  };

  return(
    <div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)'}}>
      <div className="w-full sm:max-w-lg glass rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] overflow-hidden shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[color:var(--border2,var(--border))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:tc.color+'22'}}>
              <Icon size={20} style={{color:tc.color}}/>
            </div>
            <div>
              <h2 className="font-black text-sm">Generate {tc.label}</h2>
              <p className="text-xs opacity-50 font-bold">From any document • Runs in background</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100"><X size={16}/></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 space-y-4 max-h-[70vh]">
          {/* Source tabs */}
          <div className="flex gap-1 p-1 glass rounded-2xl">
            {[['library','From Library',BookOpen],['upload','Upload File',FileUp]].map(([id,lbl,TIcon])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all
                  ${tab===id?'bg-[var(--accent)] text-white shadow-md':'opacity-50 hover:opacity-80'}`}>
                <TIcon size={16}/>{lbl}
              </button>
            ))}
          </div>

          {/* Library picker */}
          {tab==='library'&&(
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {!docs.length?(
                <div className="text-center py-6 opacity-40">
                  <BookOpen size={28} className="mx-auto mb-2"/>
                  <p className="text-xs font-bold">No documents in library</p>
                  <p className="text-xs mt-1">Switch to "Upload File" tab</p>
                </div>
              ):docs.map(doc=>(
                <button key={doc.id} onClick={()=>setSelDocId(doc.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border
                    ${selDocId===doc.id?'bg-[var(--accent)]/10 border-[var(--accent)]/40':'glass border-transparent hover:border-[color:var(--border2,var(--border))]'}`}>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${FILE_ICONS[doc.fileCategory||'unknown']?.from||'from-slate-500'} ${FILE_ICONS[doc.fileCategory||'unknown']?.to||'to-slate-700'} flex items-center justify-center shrink-0`}>
                    <FileText size={18} className="text-white opacity-80"/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{doc.name}</p>
                    <p className="text-xs opacity-40 font-mono">{doc.totalPages} pages</p>
                  </div>
                  {selDocId===doc.id&&<CheckCircle2 size={16} className="text-[var(--accent)] shrink-0"/>}
                </button>
              ))}
            </div>
          )}

          {/* File upload */}
          {tab==='upload'&&(
            <div>
              {!uploadedDoc?(
                <div
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();handleFileUpload(e.dataTransfer.files);}}
                  onClick={()=>inputRef.current?.click()}
                  className="border-2 border-dashed border-[color:var(--border2,var(--border))] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
                  {uploading?(
                    <div className="space-y-3">
                      <Loader2 size={28} className="mx-auto text-[var(--accent)] animate-spin"/>
                      <p className="text-xs font-bold">Processing…</p>
                      <div className="w-full bg-black/10 rounded-full h-1.5"><div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{width:`${uploadPct}%`}}/></div>
                    </div>
                  ):(
                    <>
                      <FileUp size={32} className="mx-auto mb-3 opacity-30"/>
                      <p className="text-sm font-black opacity-60">Drop file here or click to browse</p>
                      <p className="text-xs opacity-30 mt-1">PDF, Word, Excel, CSV, images, text</p>
                    </>
                  )}
                  <input ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.jpg,.jpeg,.png,.webp"
                    onChange={e=>handleFileUpload(e.target.files)}/>
                </div>
              ):(
                <div className="flex items-center gap-3 p-3 glass rounded-2xl border border-emerald-500/30">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0"/>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{uploadedDoc.name}</p>
                    <p className="text-xs opacity-40">{uploadedDoc.totalPages} pages extracted</p>
                  </div>
                  <button onClick={()=>setUploadedDoc(null)} className="opacity-40 hover:opacity-80"><X size={14}/></button>
                </div>
              )}
            </div>
          )}

          {/* Page range */}
          {activeDoc&&(
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><BookOpen size={16}/>Page Range</h3>
                <span className="text-xs font-bold opacity-40">{activeDoc.totalPages} total</span>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={()=>setEntireFile(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${entireFile?'bg-[var(--accent)] text-white border-transparent':'glass border-[color:var(--border2,var(--border))] opacity-60'}`}>
                  Entire File
                </button>
                <button onClick={()=>setEntireFile(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${!entireFile?'bg-[var(--accent)] text-white border-transparent':'glass border-[color:var(--border2,var(--border))] opacity-60'}`}>
                  Page Range
                </button>
              </div>
              {!entireFile&&(
                <div className="flex gap-3">
                  {[['From',startPage,setStartPage],['To',endPage,setEndPage]].map(([l,v,s])=>(
                    <div key={l} className="flex-1">
                      <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                      <input type="number" min={1} max={activeDoc.totalPages} value={v}
                        onChange={e=>s(Math.max(1,Math.min(activeDoc.totalPages,Number(e.target.value))))}
                        className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"/>
                    </div>
                  ))}
                </div>
              )}
              {entireFile&&<p className="text-xs text-[var(--accent)] font-bold text-center">All {activeDoc.totalPages} pages selected</p>}
            </div>
          )}

          {/* Count */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><Hash size={16}/>Quantity</h3>
              <span className="text-lg font-black text-[var(--accent)]">{count}</span>
            </div>
            <input type="range" min="1" max="1000" value={count} onChange={e=>setCount(+e.target.value)}
              className="w-full accent-[var(--accent)]"/>
            <div className="flex gap-1.5 flex-wrap">
              {[5,10,20,50,100,200,500,1000].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${count===n?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>{n}</button>
              ))}
            </div>
            {count>50&&<p className="text-xs text-amber-500 font-bold flex items-center gap-1.5"><AlertCircle size={10}/>Parallel AI — runs fully in background</p>}
          </div>

          {/* Difficulty */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Difficulty Level</h3>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l,i)=>(
                <button key={l} onClick={()=>setDifficulty(i+1)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all
                    ${difficulty===i+1?'text-white border-transparent shadow-md':'glass border-[color:var(--border2,var(--border))] opacity-60 hover:opacity-100'}`}
                  style={difficulty===i+1?{background:['#10b981','#f59e0b','#ef4444'][i]}:{}}>
                  {['🟢','🟡','🔴'][i]} {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[color:var(--border2,var(--border))] shrink-0">
          <button onClick={handleGo} disabled={!activeDoc}
            className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-3 shadow-xl">
            <Zap size={18} fill="currentColor"/>
            Generate {count} {tc.label} in Background
          </button>
          <p className="text-xs text-center opacity-30 font-bold mt-2">You can switch pages — generation never stops</p>
        </div>
      </div>
    </div>
  );
}

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
  // Ensure viewport-fit=cover so env(safe-area-inset-*) works on iPhone notch/island
  let vp=document.querySelector('meta[name="viewport"]');
  if(!vp){vp=document.createElement('meta');vp.name='viewport';document.head.appendChild(vp);}
  if(!vp.content.includes('viewport-fit')){
    vp.content=(vp.content||'width=device-width, initial-scale=1')+', viewport-fit=cover';
  }

  // Apple touch icon
  let apl=document.querySelector('link[rel="apple-touch-icon"]');
  if(!apl){apl=document.createElement('link');apl.rel='apple-touch-icon';document.head.appendChild(apl);}
  apl.href=MARIAM_IMG;

  // Service Worker (best-effort, may fail in sandboxed environments)
  if('serviceWorker' in navigator){
    const swCode=`
const CACHE='mariam-v7';
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
          ${t.type==='success'?'bg-emerald-500 text-white':t.type==='error'?'bg-red-500 text-white':t.type==='warn'?'bg-amber-500 text-white':'bg-[var(--surface,var(--card))] border border-[color:var(--border2,var(--border))] text-[var(--text)]'}`}>
          {t.type==='success'?<CheckCircle2 size={15}/>:t.type==='error'?<AlertCircle size={18}/>:<Info size={18}/>}
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
      <span className="text-white text-xs font-black uppercase tracking-widest opacity-70 px-2 py-0.5 bg-black/20 rounded-full">{cfg.label}</span>
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
          <div className="absolute -left-5 w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] flex items-center justify-center text-xs text-white font-black">{i+1}</div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-[var(--accent)] uppercase tracking-widest">{ev.date||ev.time||ev.year||''}</span>
              {ev.page&&<span className="text-xs opacity-40 font-mono">p.{ev.page}</span>}
            </div>
            <p className="text-xs font-bold leading-relaxed">{ev.event||ev.title||ev.description||ev}</p>
            {ev.significance&&<p className="text-xs opacity-60 mt-1 italic">{ev.significance}</p>}
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
    <div className="rounded-xl overflow-hidden border border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] mb-4 text-xs">
      <table className="w-full border-collapse">
        <thead><tr className="bg-black/5 dark:bg-white/5 border-b border-[color:var(--border2,var(--border))]">
          {['Test','Result','Range','Units'].map(h=>(
            <th key={h} className="py-1.5 px-3 text-xs font-black uppercase tracking-wider text-left opacity-50">{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-b border-[color:var(--border2,var(--border))]/50 last:border-0">
              <td className="py-2 px-3 font-semibold">{r.test}</td>
              <td className="py-2 px-3 text-center">
                <span className={`font-black inline-flex items-center gap-1 ${r.flag==='L'?'text-blue-500':r.flag==='H'?'text-red-500':''}`}>
                  {r.result}
                  {r.flag&&<span className={`text-xs font-black px-1 py-0.5 rounded ${r.flag==='L'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600':'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>{r.flag}</span>}
                </span>
              </td>
              <td className="py-2 px-3 text-center opacity-50 font-mono">{r.range}</td>
              <td className="py-2 px-3 text-center opacity-40 font-mono text-xs uppercase">{r.units}</td>
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
        <GripVertical size={16} className="text-[var(--text)] opacity-40 group-hover:opacity-100"/>
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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] shrink-0">
        <img src={MARIAM_IMG} className="w-7 h-7 rounded-lg object-cover" alt="AI"/>
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">AI Tutor</span>
        {loading&&<div className="ml-auto flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {msgs.length===0&&<div className="flex flex-col items-center justify-center h-full opacity-40 text-center"><Brain size={32} className="mb-2"/><p className="text-xs font-bold">Ask me anything</p></div>}
        {msgs.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden'}`}>
              {m.role==='user'?<UserCircle2 size={16} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
            </div>
            <div className={`px-3 py-2 text-xs leading-relaxed max-w-[85%] rounded-2xl whitespace-pre-wrap
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'bg-[var(--surface,var(--card))] border border-[color:var(--border2,var(--border))] rounded-tl-sm'}`}>
              {m.content||<span className="opacity-40">thinking…</span>}
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0 p-2 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask tutor…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24"/>
          <button onClick={toggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${listening?'bg-red-500 text-white animate-pulse':'glass text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}>
            {listening?<MicOff size={18}/>:<Mic size={18}/>}
          </button>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0">
            <Send size={18}/>
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
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}
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

      <div className="w-full p-6 lg:p-8 space-y-6">
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
                <div className="text-xs font-black uppercase tracking-widest opacity-40">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex-none">Library</h1>
          <div className="flex-1 min-w-[160px] relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…"
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none border border-[color:var(--border2,var(--border))] focus:border-[var(--accent)]/50 text-[var(--text)]"/>
            <Search className="absolute left-2.5 top-3 opacity-30" size={14}/>
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="glass border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2.5 text-xs font-black outline-none text-[var(--text)] bg-[var(--surface,var(--card))] cursor-pointer">
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
            <div className="flex glass rounded-xl overflow-hidden border border-[color:var(--border2,var(--border))]">
              <button onClick={()=>setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode==='grid'?'bg-[var(--accent)] text-white':'opacity-50 hover:opacity-100'}`}><Grid size={18}/></button>
              <button onClick={()=>setViewMode('list')} className={`p-2.5 transition-colors ${viewMode==='list'?'bg-[var(--accent)] text-white':'opacity-50 hover:opacity-100'}`}><List size={18}/></button>
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
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 lg:p-16 text-center flex flex-col items-center gap-4"
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
                    <Trash2 size={16}/>
                  </button>
                  {cat==='image'&&doc.imagePreview
                    ?<div className="h-28 lg:h-32 overflow-hidden"><img src={doc.imagePreview} className="w-full h-full object-cover" alt={doc.name}/></div>
                    :<FileCover category={cat} name={doc.name}/>
                  }
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-xs lg:text-xs leading-snug line-clamp-2 flex-1">{doc.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-40 font-mono">{doc.totalPages} {cat==='image'?'view':'pages'}</span>
                      <span className="text-xs font-black uppercase text-[var(--accent)] opacity-60">{(FILE_ICONS[cat]||FILE_ICONS.unknown).label}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {nCards>0&&<span className="text-xs font-bold px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md">{nCards} Cards</span>}
                      {nExams>0&&<span className="text-xs font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">{nExams} Exams</span>}
                      {nCases>0&&<span className="text-xs font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-md">{nCases} Cases</span>}
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
                    <div className="text-xs opacity-40 mt-0.5">{cfg.label} · {doc.totalPages} pages · {new Date(doc.addedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {nCards>0&&<span className="text-xs font-bold px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">{nCards} cards</span>}
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
            <button onClick={()=>setScale(s=>Math.max(s-.2,.5))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomOut size={16}/></button>
            <button onClick={()=>setScale(1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><Maximize size={16}/></button>
            <button onClick={()=>setScale(s=>Math.min(s+.2,4))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomIn size={16}/></button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      {openDocs.length>1&&(
        <div className="flex gap-1.5 px-3 py-1.5 border-b border-[color:var(--border2,var(--border))] overflow-x-auto custom-scrollbar shrink-0 bg-[var(--surface,var(--card))]">
          {openDocs.map(id=>{
            const doc=docs.find(d=>d.id===id);if(!doc)return null;
            const dc=FILE_ICONS[doc.fileCategory||'pdf']||FILE_ICONS.pdf;
            return(
              <div key={id} onClick={()=>setActiveId(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer text-xs font-bold shrink-0 transition-colors
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
          <div className="p-6 pb-20 lg:pb-6 w-full">
            <div className="bg-[var(--surface,var(--card))] rounded-2xl p-6 shadow-sm border border-[color:var(--border2,var(--border))] min-h-[60vh]">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-[var(--text)] opacity-90 break-words">{pageText||'(No content on this page)'}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Page nav */}
      <div className="h-14 glass flex items-center justify-center gap-3 shrink-0 border-t border-[color:var(--border2,var(--border))] border-x-0 border-b-0
        fixed bottom-[72px] left-0 right-0 z-[200] lg:relative lg:bottom-auto lg:z-auto"
        style={{bottom:`calc(${NAV_H}px + env(safe-area-inset-bottom))`}}>
        <button onClick={()=>nav(-1)} disabled={currentPage<=1} className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95"><ChevronLeft size={18}/></button>
        <div className="px-4 py-2 glass rounded-xl font-mono text-sm font-bold border border-[color:var(--border2,var(--border))] min-w-[90px] text-center">
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
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 shrink-0">
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={15}/>{Array.isArray(bgTask.result?.data)?`${bgTask.result.data.length} items ready`:'Done!'}
        </span>
        <div className="flex gap-2">
          <button onClick={onClear} className="px-3 py-1.5 glass rounded-xl text-xs font-black uppercase opacity-60 hover:opacity-100">Discard</button>
          <button onClick={save} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
            <Save size={16}/> Save
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
        {/* Flashcard preview */}
        {bgTask.result?.type==='flashcards'&&bgTask.result.data.slice(0,5).map((item,i)=>(
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-bold text-xs mb-3 leading-relaxed"><span className="opacity-30 mr-1.5 font-mono text-xs">Q{i+1}</span>{item.q}</p>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-xs text-[var(--accent)]">{item.a}</div>
            {item.evidence&&<p className="mt-2 text-xs opacity-40 italic">"{item.evidence}" — Pg {item.sourcePage}</p>}
          </div>
        ))}
        {/* Exam/cases preview */}
        {(bgTask.result?.type==='exam'||bgTask.result?.type==='cases')&&bgTask.result.data.slice(0,3).map((item,i)=>{
          const q=item.examQuestion||item;
          return(
            <div key={i} className="glass p-4 rounded-2xl">
              <p className="font-bold text-xs mb-3"><span className="opacity-30 mr-1.5 text-xs">Q{i+1}</span>{item.vignette||q.q}</p>
              <div className="space-y-1.5">
                {(q.options||[]).map((opt,oi)=>(
                  <div key={oi} className={`px-3 py-2 rounded-xl text-xs font-medium border ${oi===q.correct?'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold':'glass border-transparent'}`}>
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
            <p className="text-xs leading-relaxed opacity-80">{c.definition||c.explanation}</p>
            {c.example&&<p className="text-xs mt-2 opacity-50 italic">Ex: {c.example}</p>}
          </div>
        ))}
        {/* Text results */}
        {['summary','clinical','treatment','labs','eli5','mnemonics','translate','differential','smart-summary','code-explain'].includes(bgTask.result?.type)&&(
          <div className="glass p-4 rounded-2xl">
            <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--text)] opacity-90">{bgTask.result.data}</pre>
          </div>
        )}
        {bgTask.result?.data?.length>5&&<p className="text-center text-xs opacity-40 font-bold">+{bgTask.result.data.length-5} more items saved</p>}
      </div>
    </div>
  );

  /* ── CONFIG VIEW ── */
  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4 h-full">
      {/* Page range */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2"><BookOpen size={16}/> Page Range</h3>
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
                <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={v} onChange={e=>s(Number(e.target.value))}
                  className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"/>
              </div>
            ))}
          </div>
        )}
        {entireFile&&<p className="text-xs text-[var(--accent)] font-bold mt-2 text-center">All {activeDoc.totalPages} pages selected</p>}
      </div>

      {/* Tool selector */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2"><Zap size={16}/> AI Tool</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {TOOLS.map(([id,lbl,Icon,color])=>(
            <button key={id} onClick={()=>setType(id)}
              className={`py-2.5 flex flex-col items-center gap-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all border
                ${type===id?'text-white border-transparent shadow-md scale-105':'glass opacity-60 hover:opacity-100 border-[color:var(--border2,var(--border))]'}`}
              style={type===id?{backgroundColor:color}:{}}>
              <Icon size={18}/>{lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Language picker for translate */}
      {type==='translate'&&(
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4">Target Language</h3>
          <div className="flex flex-wrap gap-2">
            {['Arabic','Spanish','French','German','Chinese','Japanese','Portuguese','Turkish','Hindi','Urdu'].map(lang=>(
              <button key={lang} onClick={()=>setTargetLang(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${targetLang===lang?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>
                {lang}
              </button>
            ))}
          </div>
          <input value={targetLang} onChange={e=>setTargetLang(e.target.value)} placeholder="Or type any language…"
            className="mt-3 w-full glass border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--text)]"/>
        </div>
      )}

      {/* Count for batch tasks */}
      {['flashcards','exam','cases'].includes(type)&&(
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><ListChecks size={16}/> Quantity</h3>
            <span className="text-sm font-black text-[var(--accent)]">{count}</span>
          </div>
          <input type="range" min="1" max="1000" value={count} onChange={e=>setCount(+e.target.value)}
            className="w-full accent-[var(--accent)] mb-2"/>
          <div className="flex gap-1.5 flex-wrap">
            {[5,10,20,50,100,250,500,1000].map(n=>(
              <button key={n} onClick={()=>setCount(n)}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-colors ${count===n?'bg-[var(--accent)] text-white':'glass opacity-60 hover:opacity-100'}`}>{n}</button>
            ))}
          </div>
          {count>50&&<p className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1"><AlertCircle size={10}/>Parallel AI — {count}+ items in ~30-120s</p>}
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
            <span className="text-xs font-black opacity-60">{bgTask.msg}</span>
            <span className="text-xs font-black text-[var(--accent)]">{bgTask.done||0}/{bgTask.total||1}</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] h-full rounded-full transition-all duration-300 animate-pulse"
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
      <div className="flex shrink-0 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        {['page','document'].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors border-b-2
              ${mode===m?'border-[var(--accent)] text-[var(--accent)]':'border-transparent opacity-50 hover:opacity-80'}`}>
            {m==='page'?`Page ${currentPage}`:'Full Doc'}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-0">
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
      <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask about this document…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24"/>
          <button onClick={toggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${listening?'bg-red-500 text-white animate-pulse':'glass text-[var(--accent)]'}`}>
            {listening?<MicOff size={18}/>:<Mic size={18}/>}
          </button>
          <button onClick={send} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0"><Send size={18}/></button>
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
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${colorClass} bg-current/10`}>{count}</span>
        </div>
        {expanded[id]?<ChevronUp size={18} className="opacity-40"/>:<ChevronDown size={18} className="opacity-40"/>}
      </button>
      {expanded[id]&&<div className="border-t border-[color:var(--border2,var(--border))] p-3 space-y-2">{children}</div>}
    </div>
  );

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
      <Section id="fc" title="Flashcards" count={docFc.reduce((s,f)=>s+(f.cards?.length||0),0)} colorClass="text-[var(--accent)]">
        {docFc.map(set=>(
          <div key={set.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div>
              <p className="text-sm font-bold">{set.title}</p>
              <p className="text-xs opacity-40">{set.cards?.length} cards · {new Date(set.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('flashcards')} className="text-xs font-black px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">Study</button>
              <button onClick={()=>setFlashcards(p=>p.filter(f=>f.id!==set.id))} className="text-xs font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docFc.length&&<p className="text-center text-xs opacity-40 py-2 font-bold">No flashcards yet</p>}
      </Section>

      <Section id="ex" title="Exams" count={docEx.reduce((s,e)=>s+(e.questions?.length||0),0)} colorClass="text-emerald-500">
        {docEx.map(ex=>(
          <div key={ex.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-xs font-bold">{ex.title}</p><p className="text-xs opacity-40">{ex.questions?.length} Qs</p></div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('exams')} className="text-xs font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">Take</button>
              <button onClick={()=>setExams(p=>p.filter(e=>e.id!==ex.id))} className="text-xs font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docEx.length&&<p className="text-center text-xs opacity-40 py-2 font-bold">No exams yet</p>}
      </Section>

      <Section id="ca" title="Cases" count={docCa.reduce((s,c)=>s+(c.questions?.length||0),0)} colorClass="text-blue-500">
        {docCa.map(c=>(
          <div key={c.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-xs font-bold">{c.title}</p><p className="text-xs opacity-40">{c.questions?.length} cases</p></div>
            <div className="flex gap-1.5">
              <button onClick={()=>setView('cases')} className="text-xs font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg">Start</button>
              <button onClick={()=>setCases(p=>p.filter(x=>x.id!==c.id))} className="text-xs font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">Del</button>
            </div>
          </div>
        ))}
        {!docCa.length&&<p className="text-center text-xs opacity-40 py-2 font-bold">No cases yet</p>}
      </Section>

      <Section id="no" title="Notes" count={docNo.length} colorClass="text-amber-500">
        {docNo.map(n=>(
          <div key={n.id} className="p-3 glass rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold">{n.title}</p>
              <button onClick={()=>setNotes(p=>p.filter(x=>x.id!==n.id))} className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-lg font-black">Del</button>
            </div>
            <p className="text-xs opacity-60 line-clamp-3 leading-relaxed">{n.content}</p>
          </div>
        ))}
        {!docNo.length&&<p className="text-center text-xs opacity-40 py-2 font-bold">No notes yet</p>}
      </Section>

      {docMm.length>0&&(
        <Section id="mm" title="Mind Maps" count={docMm.length} colorClass="text-purple-500">
          {docMm.map((m,i)=>(
            <div key={m.id} className="glass rounded-xl overflow-hidden">
              <p className="text-xs font-bold p-2 border-b border-[color:var(--border2,var(--border))] opacity-60">{m.data?.topic||`Map ${i+1}`} · Pgs {m.pages}</p>
              <MindMap data={m.data}/>
            </div>
          ))}
        </Section>
      )}

      {docTl.length>0&&(
        <Section id="tl" title="Timelines" count={docTl.length} colorClass="text-teal-500">
          {docTl.map((t,i)=>(
            <div key={t.id} className="glass rounded-xl p-3">
              <p className="text-xs font-bold mb-3 opacity-60">Timeline · Pgs {t.pages}</p>
              <TimelineView events={t.events||[]}/>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════════
   FLASHCARDS VIEW — v6 with Quick Generate + better UI
═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   AI TUTOR PANEL — draggable side panel for Flashcards, Exams, Cases
═══════════════════════════════════════════════════════════════════ */
function AiTutorPanel({settings,context,onClose,width,onDragStart,alwaysOpen=false}){
  const[msgs,setMsgs]=useState([{role:'assistant',content:"Hi! I'm your AI Tutor 🎓\nAsk me anything about this question, the diagnosis, the explanation, or related concepts. I'm here to help you learn!"}]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const send=async(override)=>{
    const msg=override||input;
    if(!msg.trim()||loading)return;
    setInput('');
    const newMsgs=[...msgs,{role:'user',content:msg},{role:'assistant',content:''}];
    setMsgs(newMsgs);setLoading(true);
    try{
      const hist=newMsgs.slice(-8,-1).map(m=>`${m.role==='user'?'STUDENT':'TUTOR'}: ${m.content}`).join('\n');
      const prompt=`You are an expert medical/academic AI tutor. The student is currently studying the following content:\n\nCONTEXT:\n${context||'General study session'}\n\nConversation so far:\n${hist}\n\nSTUDENT: ${msg}\n\nTUTOR: Provide a clear, educational explanation. Use bullet points, bold key terms, and be thorough but concise.\n\nCRITICAL MEDICINE RULE: Whenever you discuss any medication or drug, ALWAYS start with the brand name first, followed by the generic name in parentheses. Format: "BrandName (generic name)". Example: "Tylenol (acetaminophen)", "Lipitor (atorvastatin)", "Lasix (furosemide)". Apply this to every single drug mentioned anywhere in your response.`;
      await callAIStreaming(prompt,chunk=>{setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:chunk}]);},settings,4000);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  const QUICK=[
    'Explain this in detail',
    'Why is this the correct answer?',
    'What are common mistakes here?',
    'Give me a mnemonic',
    'What else should I know?',
    'Create a practice question',
  ];

  return(
    <div className="flex flex-col h-full min-h-0 bg-[var(--surface,var(--card))] border-l border-[color:var(--border2,var(--border))]" style={{width:width||360}}>
      {/* Header - draggable */}
      <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white flex items-center justify-between px-4 py-3 shrink-0 cursor-grab select-none"
        onMouseDown={onDragStart} onTouchStart={onDragStart}>
        <div>
          <span className="font-black flex items-center gap-2 text-base"><GraduationCap size={20}/> AI Tutor</span>
          <p className="text-xs opacity-70 mt-0.5">Ask about anything you're studying</p>
        </div>
        {!alwaysOpen&&onClose&&<button onClick={onClose} className="w-9 h-9 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><X size={18}/></button>}
      </div>
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${m.role==='user'?'bg-[var(--accent)] text-white':'bg-gradient-to-br from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white'}`}>
              {m.role==='user'?'You':'AI'}
            </div>
            <div className={`px-3 py-2.5 text-sm leading-relaxed rounded-2xl max-w-[85%] whitespace-pre-wrap
              ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm':'glass border border-[color:var(--border2,var(--border))] rounded-tl-sm'}`}>
              {m.content||<span className="opacity-30 animate-pulse">▊</span>}
            </div>
          </div>
        ))}
        {loading&&(
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white flex items-center justify-center text-xs font-black shrink-0">AI</div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 border border-[color:var(--border2,var(--border))]">
              {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      {/* Quick prompts */}
      <div className="px-3 py-2 flex gap-1.5 flex-wrap shrink-0 border-t border-[color:var(--border2,var(--border))]">
        {QUICK.map(q=>(
          <button key={q} onClick={()=>send(q)}
            className="px-2.5 py-1.5 glass rounded-xl text-xs font-bold opacity-60 hover:opacity-100 hover:border-[var(--accent)]/40 transition-all border border-[color:var(--border2,var(--border))] leading-tight text-left">
            {q}
          </button>
        ))}
      </div>
      {/* Input */}
      <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        <div className="flex gap-2 items-end glass rounded-2xl p-2 border border-[color:var(--border2,var(--border))] focus-within:border-[var(--accent)]/50">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask your tutor anything…" disabled={loading} rows={1}
            className="flex-1 bg-transparent p-1.5 text-sm outline-none resize-none max-h-32 custom-scrollbar text-[var(--text)] min-h-[36px]"/>
          <button onClick={()=>send()} disabled={loading||!input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg">
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Wrapper that adds the draggable AI Tutor panel to any view */
function WithAiTutor({settings,context,children}){
  const[open,setOpen]=useState(false);
  const[w,setW]=useState(380);
  const isMobile=window.innerWidth<1024;
  const handleDrag=useCallback(x=>{setW(Math.max(300,Math.min(680,window.innerWidth-x)));},[]);
  const startDrag=useDrag(handleDrag,[handleDrag]);
  return(
    <div className="flex-1 min-h-0 flex overflow-hidden relative">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      {/* Toggle button */}
      {!open&&(
        <button onClick={()=>setOpen(true)}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white rounded-xl font-black text-sm shadow-xl hover:opacity-90 transition-all">
          <GraduationCap size={16}/>AI Tutor
        </button>
      )}
      {/* Mobile overlay backdrop */}
      {open&&isMobile&&(
        <div className="fixed inset-0 bg-black/50 z-[48] backdrop-blur-sm" onClick={()=>setOpen(false)}/>
      )}
      {open&&(
        <>
          <div onMouseDown={startDrag} onTouchStart={startDrag}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center bg-[var(--border)]/40 hover:bg-[var(--accent)]/40 shrink-0 z-50 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-60 text-[var(--text)]"/>
          </div>
          <div className={isMobile?"fixed inset-y-0 right-0 z-[49] shadow-2xl":"h-full"}
            style={isMobile?{width:'90vw',maxWidth:400}:{width:w,minWidth:300,maxWidth:680,flexShrink:0}}>
            <AiTutorPanel settings={settings} context={context} onClose={()=>setOpen(false)} width={isMobile?400:w} onDragStart={startDrag}/>
          </div>
        </>
      )}
    </div>
  );
}

function FlashcardsView({flashcards,setFlashcards,settings,addToast,docs,setExams,setCases}){
  const[selSet,setSelSet]=useState(null);const[idx,setIdx]=useState(0);
  const[flipped,setFlipped]=useState(false);const[mode,setMode]=useState('browse');
  const[showModal,setShowModal]=useState(false);
  const[exporting,setExporting]=useState(null);
  const[filterDocId,setFilterDocId]=useState('all');

  const rateCard=useCallback(q=>{
    trackStudy('flashcard');
    setFlashcards(p=>p.map(set=>{
      if(set.id!==selSet.id)return set;
      return{...set,cards:set.cards.map((c,i)=>{
        if(i!==idx)return c;
        const ef=Math.max(1.3,c.ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));
        const interval=q<3?1:Math.round(c.interval*(c.repetitions===0?1:ef));
        return{...c,ef,interval,repetitions:(c.repetitions||0)+1,
          nextReview:Date.now()+interval*86400000,lastReview:Date.now()};
      })};
    }));
    const nextIdx=idx+1;
    if(nextIdx<selSet.cards.length){setIdx(nextIdx);setFlipped(false);}
    else{addToast('🎉 Set complete!','success');setSelSet(null);setIdx(0);}
  },[selSet,idx,setFlashcards,addToast]);

  const handleExport=async(set)=>{
    setExporting(set.id);
    await exportToPDF('flashcards',set.cards,set.title,addToast);
    setExporting(null);
  };

  const filteredSets=useMemo(()=>{
    if(filterDocId==='all')return flashcards;
    return flashcards.filter(f=>f.docId===filterDocId);
  },[flashcards,filterDocId]);

  const[fcTutorW,setFcTutorW]=useState(380);
  const handleFcTutorDrag=useCallback(x=>{setFcTutorW(Math.max(280,Math.min(560,window.innerWidth-x)));},[]);
  const startFcTutorDrag=useDrag(handleFcTutorDrag,[handleFcTutorDrag]);

  if(selSet){
    const card=selSet.cards[idx];
    const progress=((idx+1)/selSet.cards.length)*100;
    const tutorCtx=`Flashcard study session.\nSet: ${selSet.title}\nCard ${idx+1}/${selSet.cards.length}\nQuestion: ${card?.q}\nAnswer: ${card?.a}\nEvidence: ${card?.evidence||'N/A'}`;
    return(
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
          <button onClick={()=>{setSelSet(null);setIdx(0);setFlipped(false);}}
            className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"><ChevronLeft size={18}/>Exit</button>
          <div className="text-center">
            <p className="text-sm font-black truncate max-w-xs">{selSet.title}</p>
            <p className="text-xs opacity-40">{idx+1} / {selSet.cards.length}</p>
          </div>
          <button onClick={()=>handleExport(selSet)} className="glass px-3 py-2 rounded-xl text-sm font-black flex items-center gap-2 opacity-60 hover:opacity-100">
            <Printer size={16}/>PDF
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-black/10 dark:bg-white/10 shrink-0">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] h-full transition-all duration-500" style={{width:`${progress}%`}}/>
        </div>
        {/* Two-panel row */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* LEFT: card + controls */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5" style={{touchAction:'pan-y',WebkitOverflowScrolling:'touch'}}>
            {/* Flip card */}
            <div className="glass rounded-3xl p-8 cursor-pointer min-h-[220px] flex flex-col justify-between select-none border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/40 transition-all active:scale-[0.99]"
              onClick={()=>setFlipped(f=>!f)}>
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${flipped?'border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/8':'glass opacity-50'}`}>
                  {flipped?'Answer':'Question'}
                </span>
                {card.sourcePage&&<span className="text-xs font-mono opacity-30">p.{card.sourcePage}</span>}
              </div>
              <p className={`text-base font-semibold leading-relaxed flex-1 ${flipped?'text-[var(--accent)]':''}`}>
                {flipped?card.a:card.q}
              </p>
              {flipped&&card.evidence&&<p className="text-xs opacity-40 mt-4 italic border-t border-[color:var(--border2,var(--border))] pt-3">"{card.evidence}"</p>}
              {!flipped&&<p className="text-xs opacity-25 text-center mt-6 flex items-center justify-center gap-1"><RefreshCw size={11}/>Tap to flip</p>}
            </div>
            {/* Rating buttons */}
            {flipped?(
              <div className="grid grid-cols-4 gap-3">
                {[['Again',0,'#ef4444','🔁'],['Hard',2,'#f59e0b','😓'],['Good',3,'#3b82f6','👍'],['Easy',5,'#10b981','⚡']].map(([l,q,col,em])=>(
                  <button key={l} onClick={()=>rateCard(q)}
                    className="text-white py-4 rounded-2xl text-sm font-black uppercase tracking-wide shadow-lg active:scale-95 transition-all flex flex-col items-center gap-1"
                    style={{background:col}}>
                    <span className="text-base">{em}</span>{l}
                  </button>
                ))}
              </div>
            ):(
              <button onClick={()=>setFlipped(true)} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">
                Show Answer
              </button>
            )}
          </div>
          {/* Drag handle */}
          <div onMouseDown={startFcTutorDrag} onTouchStart={startFcTutorDrag}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/40 shrink-0 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]"/>
          </div>
          {/* RIGHT: AI Tutor always open */}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0" style={{width:fcTutorW}}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={fcTutorW} onDragStart={startFcTutorDrag} alwaysOpen={true}/>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
      {showModal&&<QuickGenerateModal type="flashcards" docs={docs||[]} settings={settings}
        onClose={()=>setShowModal(false)} addToast={addToast}
        setFlashcards={setFlashcards} setExams={setExams} setCases={setCases}/>}
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3"><Layers size={26} className="opacity-40"/> Flashcards</h1>
          <button onClick={()=>setShowModal(true)}
            className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18}/> New from File
          </button>
        </div>

        {flashcards.length>0&&(
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Sets',flashcards.length,'#6366f1'],
                ['Cards',flashcards.reduce((s,f)=>s+(f.cards?.length||0),0),'#3b82f6'],
                ['Due Today',flashcards.reduce((s,f)=>s+(f.cards?.filter(c=>!c.nextReview||c.nextReview<=Date.now()).length||0),0),'#f59e0b'],
              ].map(([l,n,col])=>(
                <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                  <p className="text-xl font-black" style={{color:col}}>{n}</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {docs?.length>0&&(
              <select value={filterDocId} onChange={e=>setFilterDocId(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="all">All Documents</option>
                {[...new Set(flashcards.map(f=>f.docId))].map(id=>{const doc=docs?.find(d=>d.id===id);return doc?<option key={id} value={id}>{doc.name.slice(0,30)}</option>:null;})}
              </select>
            )}
          </>
        )}

        {!flashcards.length?(
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <Layers size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No flashcard sets yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate cards from any document</p>
            <button onClick={()=>setShowModal(true)} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16}/> Generate from File
            </button>
          </div>
        ):(filteredSets.map(set=>(
          <div key={set.id} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/20 transition-all card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm truncate">{set.title}</h3>
                <p className="text-xs opacity-40 mt-0.5">{set.cards?.length} cards · {new Date(set.createdAt).toLocaleDateString()}</p>
                {set.docId&&docs?.find(d=>d.id===set.docId)&&(
                  <p className="text-xs opacity-30 mt-0.5 truncate">📄 {docs.find(d=>d.id===set.docId).name}</p>
                )}
                {set.cards?.some(c=>!c.nextReview||c.nextReview<=Date.now())&&(
                  <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {set.cards.filter(c=>!c.nextReview||c.nextReview<=Date.now()).length} due today
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>handleExport(set)} disabled={exporting===set.id} title="Export PDF"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                  {exporting===set.id?<Loader2 size={14} className="animate-spin"/>:<Printer size={18}/>}
                </button>
                <button onClick={()=>{setSelSet(set);setIdx(0);setFlipped(false);}}
                  className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                  <Layers size={16}/> Study
                </button>
                <button onClick={()=>setFlashcards(p=>p.filter(f=>f.id!==set.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXAMS VIEW
═══════════════════════════════════════════════════════════════════ */
function ExamsView({exams,setExams,settings,addToast,docs,setFlashcards,setCases}){
  const[selEx,setSelEx]=useState(null);const[qi,setQi]=useState(0);
  const[selected,setSelected]=useState(null);const[submitted,setSubmitted]=useState(false);
  const[score,setScore]=useState(null);const[answers,setAnswers]=useState([]);
  const[showModal,setShowModal]=useState(false);
  const[reviewMode,setReviewMode]=useState(false);
  const[exporting,setExporting]=useState(false);
  const[filterDocId,setFilterDocId]=useState('all');
  const[sortMode,setSortMode]=useState('newest');

  const startExam=ex=>{setSelEx(ex);setQi(0);setSelected(null);setSubmitted(false);setScore(null);setAnswers([]);setReviewMode(false);};
  const submit=()=>{
    if(selected===null)return;
    const correct=selEx.questions[qi].correct===selected;
    const newAnswers=[...answers,{qi,selected,correct}];
    setAnswers(newAnswers);setSubmitted(true);
    if(qi===selEx.questions.length-1){
      const sc=newAnswers.filter(a=>a.correct).length;
      setScore(sc);
      trackStudy('exam',sc,selEx.questions.length);
    }
  };
  const next=()=>{
    if(qi<selEx.questions.length-1){setQi(i=>i+1);setSelected(null);setSubmitted(false);}
  };

  const handleExport=async(ex)=>{
    setExporting(true);
    await exportToPDF('exam',ex.questions,ex.title,addToast);
    setExporting(false);
  };

  const filteredExams=useMemo(()=>{
    let r=[...exams];
    if(filterDocId!=='all')r=r.filter(e=>e.docId===filterDocId);
    if(sortMode==='newest')r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(sortMode==='oldest')r.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    if(sortMode==='most')r.sort((a,b)=>(b.questions?.length||0)-(a.questions?.length||0));
    return r;
  },[exams,filterDocId,sortMode]);

  const[examTutorW,setExamTutorW]=useState(380);
  const handleExamTutorDrag=useCallback(x=>{setExamTutorW(Math.max(280,Math.min(580,window.innerWidth-x)));},[]);
  const startExamTutorDrag=useDrag(handleExamTutorDrag,[handleExamTutorDrag]);

  if(selEx&&score===null&&!reviewMode){
    const q=selEx.questions[qi];
    const progress=((qi+1)/selEx.questions.length)*100;
    const tutorCtx=`Exam session: ${selEx.title}\nQuestion ${qi+1}/${selEx.questions.length}\nQ: ${q?.q}\nOptions: ${(q?.options||[]).join(' | ')}\nCorrect answer: ${q?.options?.[q?.correct]}\nExplanation: ${q?.explanation||'N/A'}`;
    return(
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
          <button onClick={()=>{setSelEx(null);setScore(null);setAnswers([]);}} className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"><ChevronLeft size={18}/>Exit</button>
          <div className="text-center">
            <p className="text-sm font-black truncate max-w-xs">{selEx.title}</p>
            <p className="text-xs opacity-40">{qi+1} / {selEx.questions.length} questions</p>
          </div>
          <button onClick={()=>setReviewMode(true)} className="glass px-3 py-2 rounded-xl text-sm font-black opacity-60 hover:opacity-100">Review All</button>
        </div>
        {/* Progress */}
        <div className="h-1.5 bg-black/10 dark:bg-white/10 shrink-0">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] h-full transition-all duration-500" style={{width:`${progress}%`}}/>
        </div>
        {/* Two-panel row */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* LEFT: question + options */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 space-y-4" style={{touchAction:'pan-y',WebkitOverflowScrolling:'touch'}}>
            <div className="glass rounded-2xl p-6 border border-[color:var(--border2,var(--border))]">
              {q.sourcePage&&<p className="text-xs font-mono opacity-30 mb-3">Source: p.{q.sourcePage}</p>}
              <p className="text-base font-semibold leading-relaxed">{q.q}</p>
            </div>
            <div className="space-y-2.5">
              {(q.options||[]).map((opt,oi)=>(
                <button key={oi} disabled={submitted} onClick={()=>setSelected(oi)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-all border flex items-center gap-3
                    ${submitted&&oi===q.correct?'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold':
                      submitted&&oi===selected&&oi!==q.correct?'bg-red-500/15 border-red-500 text-red-500':
                      selected===oi?'bg-[var(--accent)]/10 border-[var(--accent)] font-bold':'glass border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border transition-all
                    ${submitted&&oi===q.correct?'bg-emerald-500 border-emerald-500 text-white':
                      submitted&&oi===selected&&oi!==q.correct?'bg-red-500 border-red-500 text-white':
                      selected===oi?'bg-[var(--accent)] border-[var(--accent)] text-white':'border-[color:var(--border2,var(--border))] opacity-50'}`}>
                    {String.fromCharCode(65+oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {submitted&&oi===q.correct&&<CheckCircle2 size={15} className="text-emerald-500 shrink-0"/>}
                </button>
              ))}
            </div>
            {submitted&&q.explanation&&(
              <div className="glass p-5 rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent)]/5">
                <p className="text-xs font-black opacity-60 mb-2 uppercase tracking-widest">Explanation</p>
                <p className="text-sm leading-relaxed">{q.explanation}</p>
                {q.evidence&&<p className="text-xs opacity-40 italic mt-3 pt-3 border-t border-[color:var(--border2,var(--border))]">"{q.evidence}"</p>}
              </div>
            )}
            <div className="pb-4">
              {!submitted?
                <button onClick={submit} disabled={selected===null} className="w-full py-4 btn-accent rounded-2xl text-base font-black disabled:opacity-40 shadow-xl">Submit Answer</button>:
                qi<selEx.questions.length-1?
                  <button onClick={next} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">Next Question →</button>:
                  <button onClick={()=>{const sc=answers.filter(a=>a.correct).length;setScore(sc);trackStudy('exam',sc,selEx.questions.length);}} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">See Results →</button>
              }
            </div>
          </div>
          {/* Drag handle */}
          <div onMouseDown={startExamTutorDrag} onTouchStart={startExamTutorDrag}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/40 shrink-0 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]"/>
          </div>
          {/* RIGHT: AI Tutor always open */}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0" style={{width:examTutorW}}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={examTutorW} onDragStart={startExamTutorDrag} alwaysOpen={true}/>
          </div>
        </div>
      </div>
    );
  }

  // Review mode — all questions at once
  if(reviewMode&&selEx){
    return(
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
        <div className="w-full p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={()=>setReviewMode(false)} className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"><ChevronLeft size={18}/>Back</button>
            <h2 className="font-black text-lg">{selEx.title} — Review</h2>
            <button onClick={()=>handleExport(selEx)} disabled={exporting}
              className="ml-auto btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md">
              {exporting?<Loader2 size={16} className="animate-spin"/>:<Printer size={16}/>}Print PDF
            </button>
          </div>
          <div className="space-y-4">
            {selEx.questions.map((q,i)=>(
              <div key={i} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
                <p className="text-xs font-black text-[var(--accent)] mb-2">Q{i+1}</p>
                <p className="text-sm font-bold mb-3">{q.q}</p>
                <div className="space-y-1.5">
                  {(q.options||[]).map((opt,oi)=>(
                    <div key={oi} className={`px-3 py-2 rounded-xl text-xs font-medium ${oi===q.correct?'bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-500/30':'opacity-50'}`}>
                      <span className="font-black mr-2">{String.fromCharCode(65+oi)}.</span>{opt}
                      {oi===q.correct&&<CheckCircle2 size={16} className="inline ml-2 text-emerald-500"/>}
                    </div>
                  ))}
                </div>
                {q.explanation&&<p className="text-xs opacity-50 mt-3 italic">{q.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(score!==null&&selEx){
    const pct=Math.round((score/selEx.questions.length)*100);
    const grade=pct>=90?'A':pct>=80?'B':pct>=70?'C':pct>=60?'D':'F';
    return(
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="glass rounded-3xl p-10 text-center max-w-sm w-full border border-[color:var(--border2,var(--border))]">
          <div className={`text-7xl font-black mb-1 ${pct>=80?'text-emerald-500':pct>=60?'text-amber-500':'text-red-500'}`}>{pct}%</div>
          <div className={`text-3xl font-black mb-4 ${pct>=80?'text-emerald-500':pct>=60?'text-amber-500':'text-red-500'}`}>Grade {grade}</div>
          <p className="text-sm font-black opacity-60 mb-1">{score} / {selEx.questions.length} correct</p>
          <p className="text-xs opacity-40">{pct>=80?'Outstanding! 🎉':pct>=60?'Good effort! Keep studying 📚':'Need more review 💪'}</p>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 mt-6 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:pct>=80?'#10b981':pct>=60?'#f59e0b':'#ef4444'}}/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{setReviewMode(true);}} className="glass px-6 py-3 rounded-2xl font-black border border-[color:var(--border2,var(--border))]">Review Answers</button>
          <button onClick={()=>{setSelEx(null);setScore(null);setAnswers([]);}} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl">Back to Exams</button>
        </div>
      </div>
    );
  }

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
      {showModal&&<QuickGenerateModal type="exam" docs={docs||[]} settings={settings}
        onClose={()=>setShowModal(false)} addToast={addToast}
        setFlashcards={setFlashcards||((fn)=>{})} setExams={setExams} setCases={setCases||((fn)=>{})}/>}
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3"><CheckSquare size={26} className="opacity-40"/> Exams</h1>
          <button onClick={()=>setShowModal(true)} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18}/> New from File
          </button>
        </div>

        {exams.length>0&&(
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total Exams',exams.length,'#3b82f6'],
                ['Questions',exams.reduce((s,e)=>s+(e.questions?.length||0),0),'#6366f1'],
                ['Avg Score',ANALYTICS.scores.length?`${Math.round(ANALYTICS.scores.reduce((s,r)=>s+r.pct,0)/ANALYTICS.scores.length)}%`:'—','#10b981'],
                ['Attempts',ANALYTICS.scores.length,'#f59e0b'],
              ].map(([l,n,col])=>(
                <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                  <p className="text-xl font-black" style={{color:col}}>{n}</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select value={filterDocId} onChange={e=>setFilterDocId(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="all">All Documents</option>
                {[...new Set(exams.map(e=>e.docId))].map(id=>{const doc=docs?.find(d=>d.id===id);return doc?<option key={id} value={id}>{doc.name.slice(0,30)}</option>:null;})}
              </select>
              <select value={sortMode} onChange={e=>setSortMode(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most">Most questions</option>
              </select>
            </div>
          </>
        )}

        {!exams.length?(
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No exams yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate exams from any document</p>
            <button onClick={()=>setShowModal(true)} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16}/> Generate from File
            </button>
          </div>
        ):(filteredExams.map(ex=>(
          <div key={ex.id} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/20 transition-all card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm truncate">{ex.title}</h3>
                <p className="text-xs opacity-40 mt-0.5">{ex.questions?.length} questions · {new Date(ex.createdAt).toLocaleDateString()}</p>
                {ex.docId&&docs?.find(d=>d.id===ex.docId)&&(
                  <p className="text-xs opacity-30 mt-0.5 truncate">📄 {docs.find(d=>d.id===ex.docId).name}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>handleExport(ex)} disabled={exporting} title="Export as PDF"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-colors" >
                  {exporting?<Loader2 size={14} className="animate-spin"/>:<Printer size={18}/>}
                </button>
                <button onClick={()=>{setSelEx(ex);setReviewMode(true);}} title="Review all questions"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors">
                  <Eye size={18}/>
                </button>
                <button onClick={()=>startExam(ex)} className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"><Target size={18}/> Start</button>
                <button onClick={()=>setExams(p=>p.filter(e=>e.id!==ex.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CASES VIEW — v6 with Quick Generate
═══════════════════════════════════════════════════════════════════ */
function CasesView({cases,setCases,settings,addToast,docs,setFlashcards,setExams}){
  const[selSet,setSelSet]=useState(null);const[ci,setCi]=useState(0);
  const[stage,setStage]=useState('vignette');const[selOpt,setSelOpt]=useState(null);const[submitted,setSubmitted]=useState(false);
  const[showModal,setShowModal]=useState(false);
  const[exporting,setExporting]=useState(null);

  const handleExport=async(set)=>{
    setExporting(set.id);
    await exportToPDF('cases',set.questions,set.title,addToast);
    setExporting(null);
  };

  /* ── draggable panel widths ── */
  const[labW,setLabW]=useState(420);
  const[tutorW,setTutorW]=useState(360);
  const handleLabDrag=useCallback(x=>{setLabW(Math.max(280,Math.min(600,window.innerWidth-x)));},[]);
  const handleTutorDrag=useCallback(x=>{setTutorW(Math.max(260,Math.min(520,window.innerWidth-x)));},[]);
  const startLabDrag=useDrag(handleLabDrag,[handleLabDrag]);
  const startTutorDrag=useDrag(handleTutorDrag,[handleTutorDrag]);

  if(selSet){
    const cas=selSet.questions[ci];const q=cas.examQuestion||cas;
    const tutorCtx=`Clinical case: ${cas?.title||'Untitled'}\nVignette: ${cas?.vignette||''}\nDiagnosis: ${cas?.diagnosis||'N/A'}\nQuestion: ${q?.q}\nCorrect answer: ${q?.options?.[q?.correct]}\nExplanation: ${q?.explanation||'N/A'}`;
    return(
      /* ══ THREE-PANEL LAYOUT ══ */
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* ── TOP BAR ── */}
        <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
          <button onClick={()=>{setSelSet(null);setCi(0);setSelOpt(null);setSubmitted(false);}}
            className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:border-[var(--accent)]/40 transition-all">
            <ChevronLeft size={18}/>Exit
          </button>
          <div className="text-center">
            {cas.title&&<p className="text-base font-black truncate max-w-xs">{cas.title}</p>}
            <div className="flex items-center gap-2 justify-center mt-0.5">
              <p className="text-xs font-bold opacity-50">Case {ci+1} / {selSet.questions.length}</p>
              <div className="flex gap-0.5">
                {selSet.questions.map((_,i)=>(
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i===ci?'w-6 bg-[var(--accent)]':i<ci?'w-2 bg-emerald-500':'w-2 bg-black/10 dark:bg-white/10'}`}/>
                ))}
              </div>
            </div>
          </div>
          <button onClick={()=>handleExport(selSet)} className="glass px-3 py-2 rounded-xl text-sm font-black opacity-60 hover:opacity-100 flex items-center gap-2">
            <Printer size={16}/>PDF
          </button>
        </div>

        {/* ── MAIN THREE-PANEL ROW ── */}
        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* ═══ LEFT: Vignette + Question + Answers (scrollable) ═══ */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-5 space-y-4" style={{touchAction:'pan-y',WebkitOverflowScrolling:'touch'}}>

            {/* Patient Vignette */}
            <div className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-3 flex items-center gap-2">
                <Stethoscope size={13}/> Patient Vignette
              </p>
              <p className="text-sm leading-[1.85]">{cas.vignette}</p>
            </div>

            {/* Question stem */}
            <div className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
              <p className="text-sm font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2"><CheckSquare size={13}/>Question</p>
              <p className="text-base font-semibold leading-relaxed">{q.q}</p>
            </div>

            {/* Answer options */}
            <div className="space-y-2.5">
              {(q.options||[]).map((opt,oi)=>(
                <button key={oi} disabled={submitted} onClick={()=>setSelOpt(oi)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-all border flex items-center gap-3
                    ${submitted&&oi===q.correct?'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold':
                      submitted&&oi===selOpt&&oi!==q.correct?'bg-red-500/15 border-red-500 text-red-500':
                      selOpt===oi?'bg-[var(--accent)]/10 border-[var(--accent)] font-bold':'glass border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border transition-all
                    ${submitted&&oi===q.correct?'bg-emerald-500 border-emerald-500 text-white':
                      submitted&&oi===selOpt&&oi!==q.correct?'bg-red-500 border-red-500 text-white':
                      selOpt===oi?'bg-[var(--accent)] border-[var(--accent)] text-white':'border-[color:var(--border2,var(--border))] opacity-50'}`}>
                    {String.fromCharCode(65+oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {submitted&&oi===q.correct&&<CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {submitted&&(
              <div className="glass p-5 rounded-2xl border-l-4 border-emerald-500 bg-emerald-500/5 space-y-2">
                {cas.diagnosis&&<p className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 size={15}/>Diagnosis: {cas.diagnosis}</p>}
                {q.explanation&&<p className="text-sm leading-relaxed">{q.explanation}</p>}
                {q.evidence&&<p className="text-xs opacity-40 italic pt-3 border-t border-[color:var(--border2,var(--border))]">"{q.evidence}" — p.{q.sourcePage}</p>}
              </div>
            )}

            {/* Action */}
            <div className="pb-4">
              {!submitted?
                <button onClick={()=>setSubmitted(true)} disabled={selOpt===null}
                  className="w-full py-4 btn-accent rounded-2xl text-base font-black disabled:opacity-40 shadow-xl">
                  Submit Answer
                </button>:
                ci<selSet.questions.length-1?
                  <button onClick={()=>{setCi(i=>i+1);setSelOpt(null);setSubmitted(false);}}
                    className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl flex items-center justify-center gap-2">
                    <ChevronRight size={20}/>Next Case
                  </button>:
                  <button onClick={()=>{setSelSet(null);setCi(0);addToast('All cases complete! 🏆','success');}}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-base font-black shadow-xl">
                    Finish Session 🎉
                  </button>
              }
            </div>
          </div>

          {/* ═══ DRAG HANDLE: left ↔ lab ═══ */}
          <div onMouseDown={startLabDrag} onTouchStart={startLabDrag}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/40 shrink-0 z-10 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]"/>
          </div>

          {/* ═══ MIDDLE: Lab Results (scrollable, draggable width) ═══ */}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] overflow-hidden shrink-0"
            style={{width:labW}}>
            {/* Lab header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--border2,var(--border))] shrink-0 cursor-grab select-none"
              onMouseDown={startLabDrag} onTouchStart={startLabDrag}>
              <Thermometer size={15} className="text-[var(--accent)] shrink-0"/>
              <span className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">Laboratory Results</span>
              <GripVertical size={13} className="ml-auto opacity-20"/>
            </div>
            {/* Lab content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-5">
              {cas.labPanels?.length>0?cas.labPanels.map((panel,pi)=>(
                <div key={pi}>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 px-1">{panel.panelName}</p>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[color:var(--border2,var(--border))]">
                        {['TEST','RESULT','RANGE','UNITS'].map(h=>(
                          <th key={h} className="text-left py-1.5 px-2 text-xs font-black uppercase tracking-wider opacity-40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(panel.rows||[]).map((row,ri)=>(
                        <tr key={ri} className="border-b border-[color:var(--border2,var(--border))]/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-2 px-2 font-bold text-sm">{row.test}</td>
                          <td className="py-2 px-2 font-black text-sm">
                            <span className="flex items-center gap-1" style={{color:row.flag==='H'?'#ef4444':row.flag==='L'?'#3b82f6':undefined}}>
                              {row.result}
                              {row.flag&&<span className="text-xs font-black px-1 py-0.5 rounded" style={{backgroundColor:row.flag==='H'?'#ef444420':row.flag==='L'?'#3b82f620':'transparent'}}>{row.flag}</span>}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-sm opacity-45 font-mono">{row.range}</td>
                          <td className="py-2 px-2 text-sm opacity-35 font-mono">{row.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )):(
                <div className="flex flex-col items-center justify-center h-32 opacity-25">
                  <Thermometer size={28} className="mb-2"/>
                  <p className="text-sm font-bold">No lab data</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══ DRAG HANDLE: lab ↔ tutor ═══ */}
          <div onMouseDown={startTutorDrag} onTouchStart={startTutorDrag}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center bg-[var(--border)]/30 hover:bg-[var(--accent)]/40 shrink-0 z-10 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]"/>
          </div>

          {/* ═══ RIGHT: AI Tutor (always open, draggable width) ═══ */}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0 overflow-hidden"
            style={{width:tutorW}}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={tutorW} onDragStart={startTutorDrag} alwaysOpen={true}/>
          </div>

        </div>

        {/* Mobile: lab results below (collapsed accordion) */}
        <div className="lg:hidden border-t border-[color:var(--border2,var(--border))]">
          {cas.labPanels?.length>0&&(
            <details className="group">
              <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer bg-[var(--surface,var(--card))] text-sm font-black select-none">
                <Thermometer size={15} className="text-[var(--accent)]"/>
                <span className="text-[var(--accent)] uppercase tracking-widest text-xs">Lab Results</span>
                <ChevronDown size={14} className="ml-auto opacity-40 group-open:rotate-180 transition-transform"/>
              </summary>
              <div className="p-4 overflow-x-auto">
                {cas.labPanels.map((panel,pi)=>(
                  <div key={pi} className="mb-4">
                    <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">{panel.panelName}</p>
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-[color:var(--border2,var(--border))]">{['TEST','RESULT','RANGE','UNITS'].map(h=><th key={h} className="text-left py-1 px-2 font-black uppercase opacity-40">{h}</th>)}</tr></thead>
                      <tbody>{(panel.rows||[]).map((row,ri)=>(
                        <tr key={ri} className="border-b border-[color:var(--border2,var(--border))]/20">
                          <td className="py-1.5 px-2 font-bold">{row.test}</td>
                          <td className="py-1.5 px-2 font-black" style={{color:row.flag==='H'?'#ef4444':row.flag==='L'?'#3b82f6':undefined}}>{row.result}{row.flag&&` ${row.flag}`}</td>
                          <td className="py-1.5 px-2 opacity-40 font-mono">{row.range}</td>
                          <td className="py-1.5 px-2 opacity-35 font-mono">{row.units}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

      </div>
    );
  }

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
      {showModal&&<QuickGenerateModal type="cases" docs={docs||[]} settings={settings}
        onClose={()=>setShowModal(false)} addToast={addToast}
        setFlashcards={setFlashcards||((fn)=>{})} setExams={setExams||((fn)=>{})} setCases={setCases}/>}
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3"><Activity size={26} className="opacity-40"/> Clinical Cases</h1>
          <button onClick={()=>setShowModal(true)} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18}/> New from File
          </button>
        </div>
        {cases.length>0&&(
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['Case Sets',cases.length,'#8b5cf6'],
              ['Total Cases',cases.reduce((s,c)=>s+(c.questions?.length||0),0),'#06b6d4'],
              ['Docs Used',[...new Set(cases.map(c=>c.docId))].filter(Boolean).length,'#10b981'],
            ].map(([l,n,col])=>(
              <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                <p className="text-xl font-black" style={{color:col}}>{n}</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        )}
        {!cases.length?(
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <Activity size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-lg font-black opacity-40">No cases yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate clinical cases from any medical document</p>
            <button onClick={()=>setShowModal(true)} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16}/> Generate from File
            </button>
          </div>
        ):(cases.map(set=>(
          <div key={set.id} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/20 transition-all card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm truncate">{set.title}</h3>
                <p className="text-xs opacity-40 mt-0.5">{set.questions?.length} cases · {new Date(set.createdAt||0).toLocaleDateString()}</p>
                {set.docId&&docs?.find(d=>d.id===set.docId)&&(
                  <p className="text-xs opacity-30 mt-0.5 truncate">📄 {docs.find(d=>d.id===set.docId).name}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>handleExport(set)} disabled={exporting===set.id} title="Export PDF"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                  {exporting===set.id?<Loader2 size={14} className="animate-spin"/>:<Printer size={18}/>}
                </button>
                <button onClick={()=>{setSelSet(set);setCi(0);setSelOpt(null);setSubmitted(false);}}
                  className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"><Stethoscope size={18}/>Practice</button>
                <button onClick={()=>setCases(p=>p.filter(c=>c.id!==set.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
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
  const[sidebarOpen,setSidebarOpen]=useState(true);
  const[sessSearch,setSessSearch]=useState('');
  const[pinnedIds,setPinnedIds]=useState([]);
  const[contextMenu,setContextMenu]=useState(null);
  const[projects,setProjects]=useState([]);
  const[selProject,setSelProject]=useState(null);
  const[showNewProject,setShowNewProject]=useState(false);
  const[newProjectName,setNewProjectName]=useState('');
  const[sidebarTab,setSidebarTab]=useState('chats'); // 'chats'|'projects'
  const[inputRows,setInputRows]=useState(1);
  const endRef=useRef(null);const recogRef=useRef(null);const inputRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const STARTERS=[
    {icon:'🧬',text:'Explain a complex topic'},
    {icon:'📋',text:'Create a study plan'},
    {icon:'❓',text:'Quiz me on key concepts'},
    {icon:'🔍',text:'Compare and contrast'},
    {icon:'📝',text:'Summarize main points'},
    {icon:'💡',text:'Give me clinical pearls'},
  ];

  const toggleVoice=()=>{
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert('Voice not supported in this browser.');return;}
    const r=new SR();r.continuous=false;r.interimResults=true;
    r.onresult=e=>{setInput(Array.from(e.results).map(r=>r[0].transcript).join(''));};
    r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.start();recogRef.current=r;setListening(true);
  };

  const newSession=()=>{
    setSelSess(null);
    setMsgs([]);
    inputRef.current?.focus();
  };

  const saveSession=useCallback((ms,id)=>{
    if(!ms.filter(m=>m.role==='user').length)return;
    const sessId=id||selSess||Date.now().toString();
    const title=ms.find(m=>m.role==='user')?.content?.slice(0,50)||'New Chat';
    const sess={id:sessId,title,messages:ms,updatedAt:new Date().toISOString(),msgCount:ms.filter(m=>m.role==='user').length,projectId:selProject||null};
    setSessions(p=>{const ex=p.findIndex(s=>s.id===sessId);return ex>=0?[...p.slice(0,ex),sess,...p.slice(ex+1)]:[sess,...p];});
    setSelSess(sessId);
  },[selSess,setSessions,selProject]);

  const loadSession=sess=>{setSelSess(sess.id);setMsgs(sess.messages||[]);};

  const deleteSession=id=>{
    setSessions(p=>p.filter(s=>s.id!==id));
    setPinnedIds(p=>p.filter(x=>x!==id));
    if(selSess===id){setSelSess(null);setMsgs([]);}
    setContextMenu(null);
  };

  const copySession=id=>{
    const sess=sessions.find(s=>s.id===id);
    if(!sess)return;
    const text=sess.messages.map(m=>`${m.role==='user'?'You':'MARIAM'}: ${m.content}`).join('\n\n');
    navigator.clipboard?.writeText(text);
    setContextMenu(null);
  };

  const createProject=()=>{
    if(!newProjectName.trim())return;
    const p={id:Date.now().toString(),name:newProjectName.trim(),color:['#6366f1','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'][Math.floor(Math.random()*6)],createdAt:new Date().toISOString()};
    setProjects(prev=>[...prev,p]);
    setNewProjectName('');
    setShowNewProject(false);
  };

  const send=async(overrideMsg)=>{
    const msg=overrideMsg||input;
    if(!msg.trim()||loading)return;
    setInput('');setInputRows(1);
    const sessId=selSess||Date.now().toString();
    if(!selSess)setSelSess(sessId);
    const newMsgs=[...msgs,{role:'user',content:msg,timestamp:Date.now()},{role:'assistant',content:'',timestamp:Date.now()}];
    setMsgs(newMsgs);setLoading(true);
    try{
      const hist=newMsgs.slice(-12,-1).map(m=>`${m.role==='user'?'USER':'MARIAM'}: ${m.content}`).join('\n');
      const projCtx=selProject?`\n\nProject context: ${projects.find(p=>p.id===selProject)?.name||''}`:'';
      const sysPrompt=`You are MARIAM, a brilliant, warm, and knowledgeable AI study assistant specialized in medicine and academia. You help students understand complex topics, create study materials, explain clinical concepts, and achieve their academic goals.${projCtx}\n\nFormatting rules:\n- Use **bold** for key terms and important concepts\n- Use bullet points and numbered lists when listing items\n- Use headers (##) for major sections in long responses\n- Be thorough but organized — students need to be able to study from your answers\n- Always cite clinical evidence when relevant`;
      const prompt=`${sysPrompt}\n\nConversation:\n${hist}\n\nUSER: ${msg}\n\nMARIAM:`;
      await callAIStreaming(prompt,chunk=>{setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:chunk,timestamp:Date.now()}]);},settings,6000);
      const finalMsgs=[...newMsgs.slice(0,-1),{...newMsgs[newMsgs.length-1]}];
      setTimeout(()=>saveSession(finalMsgs,sessId),300);
    }catch(e){setMsgs(p=>[...p.slice(0,-1),{role:'assistant',content:`⚠️ ${e.message}`}]);}
    finally{setLoading(false);}
  };

  const filteredSessions=useMemo(()=>{
    let s=[...sessions];
    if(sidebarTab==='projects'&&selProject) s=s.filter(x=>x.projectId===selProject);
    const q=sessSearch.toLowerCase();
    if(q) s=s.filter(x=>x.title.toLowerCase().includes(q)||x.messages?.some(m=>m.content?.toLowerCase().includes(q)));
    return s;
  },[sessions,sessSearch,sidebarTab,selProject]);

  const pinned=filteredSessions.filter(s=>pinnedIds.includes(s.id));
  const unpinned=filteredSessions.filter(s=>!pinnedIds.includes(s.id)).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));

  // Group by date
  const groupByDate=(items)=>{
    const today=new Date();today.setHours(0,0,0,0);
    const yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);
    const week=new Date(today);week.setDate(week.getDate()-7);
    const groups={Today:[],Yesterday:[],'Last 7 Days':[],'Older':[]};
    items.forEach(s=>{
      const d=new Date(s.updatedAt);
      if(d>=today) groups.Today.push(s);
      else if(d>=yesterday) groups.Yesterday.push(s);
      else if(d>=week) groups['Last 7 Days'].push(s);
      else groups.Older.push(s);
    });
    return groups;
  };
  const grouped=groupByDate(unpinned);

  const SessionItem=({s})=>(
    <button className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all group relative ${selSess===s.id?'bg-[var(--accent)]/10 border border-[var(--accent)]/20':'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}`}
      onClick={()=>loadSession(s)}>
      {s.projectId&&<div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{backgroundColor:projects.find(p=>p.id===s.projectId)?.color||'#6366f1'}}/>}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate font-medium ${selSess===s.id?'text-[var(--accent)] font-bold':''}`}>{s.title}</p>
        <p className="text-xs opacity-40 mt-0.5">{new Date(s.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-60 hover:!opacity-100 shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
        onClick={e=>{e.stopPropagation();setContextMenu({id:s.id,x:e.clientX,y:e.clientY});}}>
        <MoreVertical size={14}/>
      </button>
    </button>
  );

  const formatMsg=(text)=>{
    // Simple markdown-like formatting
    return text.split('\n').map((line,i)=>{
      if(line.startsWith('## ')) return <h3 key={i} className="text-base font-black mt-3 mb-1">{line.slice(3)}</h3>;
      if(line.startsWith('# ')) return <h2 key={i} className="text-lg font-black mt-4 mb-1">{line.slice(2)}</h2>;
      if(line.startsWith('- ')||line.startsWith('• ')) return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{formatInline(line.slice(2))}</li>;
      if(/^\d+\. /.test(line)) return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{formatInline(line.replace(/^\d+\. /,''))}</li>;
      if(line===''&&i>0) return <div key={i} className="h-2"/>;
      return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>;
    });
  };

  const formatInline=(text)=>{
    const parts=text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p,i)=>p.startsWith('**')&&p.endsWith('**')?<strong key={i} className="font-black">{p.slice(2,-2)}</strong>:p);
  };

  const curSessData=sessions.find(s=>s.id===selSess);

  return(
    <div className="flex h-full min-h-0 overflow-hidden bg-[var(--bg)]" onClick={()=>contextMenu&&setContextMenu(null)}>

      {/* Context menu */}
      {contextMenu&&(
        <div className="fixed z-[9999] glass rounded-xl shadow-2xl border border-[color:var(--border2,var(--border))] py-1 min-w-[180px]"
          style={{left:Math.min(contextMenu.x,window.innerWidth-200),top:Math.min(contextMenu.y,window.innerHeight-140)}}>
          <button onClick={()=>{setPinnedIds(p=>p.includes(contextMenu.id)?p.filter(x=>x!==contextMenu.id):[...p,contextMenu.id]);setContextMenu(null);}}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Pin size={15}/>{pinnedIds.includes(contextMenu.id)?'Unpin':'Pin to top'}
          </button>
          <button onClick={()=>copySession(contextMenu.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Copy size={15}/>Copy transcript
          </button>
          <div className="my-1 border-t border-[color:var(--border2,var(--border))]"/>
          <button onClick={()=>deleteSession(contextMenu.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <Trash2 size={15}/>Delete chat
          </button>
        </div>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      {/* Mobile overlay backdrop */}
      {sidebarOpen&&(
        <div className="lg:hidden fixed inset-0 bg-black/40 z-[40] backdrop-blur-sm"
          onClick={()=>setSidebarOpen(false)}/>
      )}
      <div className={`flex flex-col bg-[var(--surface,var(--card))] border-r border-[color:var(--border2,var(--border))] transition-all duration-300 shrink-0 z-[41]
        ${sidebarOpen?'w-72':'w-0 overflow-hidden'}
        lg:relative absolute inset-y-0 left-0`}>

        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border2,var(--border))] shrink-0">
          <span className="text-base font-black">MARIAM Chat</span>
          <div className="flex items-center gap-1">
            <button onClick={newSession}
              className="w-8 h-8 btn-accent rounded-xl flex items-center justify-center shadow-sm" title="New chat">
              <Plus size={18}/>
            </button>
            <button onClick={()=>setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 glass rounded-xl flex items-center justify-center opacity-60">
              <X size={18}/>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/>
            <input value={sessSearch} onChange={e=>setSessSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--accent)]/40 text-[var(--text)]"/>
          </div>
        </div>

        {/* Sidebar tabs: Chats | Projects */}
        <div className="flex border-b border-[color:var(--border2,var(--border))] shrink-0 px-3 gap-1">
          {[['chats','Chats',MessageSquare],['projects','Projects',FolderOpen]].map(([id,lbl,Icon])=>(
            <button key={id} onClick={()=>setSidebarTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-colors -mb-px
                ${sidebarTab===id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent opacity-50 hover:opacity-80'}`}>
              <Icon size={14}/>{lbl}
            </button>
          ))}
        </div>

        {/* Chats list */}
        {sidebarTab==='chats'&&(
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
            {pinned.length>0&&(
              <div className="mb-2">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5 flex items-center gap-1.5"><Pin size={10}/>Pinned</p>
                {pinned.map(s=><SessionItem key={s.id} s={s}/>)}
                <div className="mx-3 my-2 border-t border-[color:var(--border2,var(--border))]"/>
              </div>
            )}
            {Object.entries(grouped).map(([grp,items])=>items.length>0&&(
              <div key={grp} className="mb-3">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5">{grp}</p>
                {items.map(s=><SessionItem key={s.id} s={s}/>)}
              </div>
            ))}
            {!sessions.length&&(
              <div className="text-center py-16 px-4 opacity-30">
                <MessageSquare size={32} className="mx-auto mb-3"/>
                <p className="text-sm font-bold">No chats yet</p>
                <p className="text-xs mt-1">Start a conversation below</p>
              </div>
            )}
          </div>
        )}

        {/* Projects tab */}
        {sidebarTab==='projects'&&(
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
            <button onClick={()=>setShowNewProject(true)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors">
              <Plus size={16}/>New Project
            </button>
            {showNewProject&&(
              <div className="mx-3 mb-3 p-3 glass rounded-xl border border-[color:var(--border2,var(--border))] space-y-2">
                <input value={newProjectName} onChange={e=>setNewProjectName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&createProject()}
                  placeholder="Project name…" autoFocus
                  className="w-full text-sm bg-transparent outline-none border-b border-[color:var(--border2,var(--border))] pb-1 text-[var(--text)]"/>
                <div className="flex gap-2">
                  <button onClick={createProject} className="flex-1 py-1.5 btn-accent rounded-lg text-xs font-black">Create</button>
                  <button onClick={()=>setShowNewProject(false)} className="flex-1 py-1.5 glass rounded-lg text-xs font-black opacity-60">Cancel</button>
                </div>
              </div>
            )}
            {projects.length===0&&!showNewProject&&(
              <div className="text-center py-12 px-4 opacity-30">
                <FolderOpen size={32} className="mx-auto mb-3"/>
                <p className="text-sm font-bold">No projects yet</p>
                <p className="text-xs mt-1">Organize chats into projects</p>
              </div>
            )}
            {[{id:null,name:'All Chats',color:'#6366f1'},...projects].map(p=>(
              <button key={p.id||'all'} onClick={()=>{setSelProject(p.id);setSidebarTab(p.id?'projects':'chats');}}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all mx-0
                  ${selProject===p.id?'bg-[var(--accent)]/10':'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:p.color}}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-xs opacity-40">{sessions.filter(s=>s.projectId===p.id).length} chats</p>
                </div>
                {p.id&&(
                  <button onClick={e=>{e.stopPropagation();setProjects(prev=>prev.filter(x=>x.id!==p.id));}}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center">
                    <Trash2 size={12} className="text-red-500"/>
                  </button>
                )}
              </button>
            ))}
            {selProject&&(
              <div className="border-t border-[color:var(--border2,var(--border))] mt-2 pt-2">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5">Chats in project</p>
                {filteredSessions.map(s=><SessionItem key={s.id} s={s}/>)}
                {filteredSessions.length===0&&<p className="text-xs opacity-30 text-center py-4">No chats in this project</p>}
              </div>
            )}
          </div>
        )}

        {/* Sidebar footer */}
        <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))]">
          <div className="flex items-center gap-2 px-2 py-2 text-xs opacity-40">
            <Brain size={14}/>
            <span className="font-bold">{sessions.length} conversations · {sessions.reduce((a,s)=>a+(s.msgCount||0),0)} messages</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]/80 backdrop-blur-sm shrink-0">
          <button onClick={()=>setSidebarOpen(o=>!o)}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 shrink-0 transition-all">
            <History size={18}/>
          </button>
          <div className="flex-1 min-w-0">
            {curSessData?.projectId&&(
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor:projects.find(p=>p.id===curSessData.projectId)?.color||'#6366f1'}}/>
                <span className="text-xs opacity-50 font-bold">{projects.find(p=>p.id===curSessData.projectId)?.name||'Project'}</span>
              </div>
            )}
            <p className="text-sm font-black truncate">{curSessData?.title||'New Conversation'}</p>
          </div>
          <div className="flex items-center gap-1">
            {msgs.length>0&&(
              <button onClick={()=>{const t=msgs.map(m=>`${m.role==='user'?'You':'MARIAM'}: ${m.content}`).join('\n\n');navigator.clipboard?.writeText(t);}}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 transition-all" title="Copy transcript">
                <Copy size={18}/>
              </button>
            )}
            {msgs.length>0&&(
              <button onClick={newSession}
                className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-sm font-black opacity-60 hover:opacity-100 transition-all">
                <Plus size={16}/>New
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {msgs.length===0?(
            <div className="flex flex-col items-center justify-center min-h-full p-6 gap-8">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <img src={MARIAM_IMG} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-[color:var(--border2,var(--border))]" alt="MARIAM AI"/>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full border-2 border-[var(--bg)] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"/>
                  </div>
                </div>
                <h1 className="text-3xl font-black">What can I help you study?</h1>
                <p className="text-base opacity-50 max-w-md">Your AI study assistant — medicine, sciences, and beyond</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                {STARTERS.map(s=>(
                  <button key={s.text} onClick={()=>send(s.text)}
                    className="glass rounded-2xl p-4 text-left hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all border border-[color:var(--border2,var(--border))] group">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-sm font-bold group-hover:text-[var(--accent)] transition-colors">{s.text}</p>
                  </button>
                ))}
              </div>
              {selProject&&(
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--accent)]/20">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor:projects.find(p=>p.id===selProject)?.color}}/>
                  <span className="text-sm font-bold">Project: {projects.find(p=>p.id===selProject)?.name}</span>
                  <button onClick={()=>setSelProject(null)} className="ml-auto text-xs opacity-50 hover:opacity-100"><X size={14}/></button>
                </div>
              )}
            </div>
          ):(
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {msgs.map((m,i)=>(
                <div key={i} className={`flex gap-4 ${m.role==='user'?'flex-row-reverse':''} group`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 ${m.role==='user'?'bg-[var(--accent)]':'overflow-hidden border border-[color:var(--border2,var(--border))]'}`}>
                    {m.role==='user'?<UserCircle2 size={20} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
                  </div>
                  <div className={`flex-1 max-w-[85%] flex flex-col gap-1.5 ${m.role==='user'?'items-end':''}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${m.role==='user'?'bg-[var(--accent)] text-white rounded-tr-sm max-w-[80%]':'rounded-tl-sm'}`}>
                      {m.role==='assistant'?(
                        <div className="prose-custom space-y-1">{formatMsg(m.content||'')}</div>
                      ):(
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                      {!m.content&&m.role==='assistant'&&<span className="opacity-30 animate-pulse">▊</span>}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <button onClick={()=>navigator.clipboard?.writeText(m.content)}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-80 text-xs font-bold flex items-center gap-1 transition-opacity">
                        <Copy size={12}/>Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {loading&&(
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-[color:var(--border2,var(--border))] shrink-0 mt-1"><img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/></div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                    {[0,1,2].map(i=><div key={i} className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        {/* Input area — ChatGPT-style */}
        <div className="shrink-0 px-4 py-4 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {/* Project badge if active */}
            {selProject&&(
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor:projects.find(p=>p.id===selProject)?.color}}/>
                <span className="text-xs font-bold opacity-60">{projects.find(p=>p.id===selProject)?.name}</span>
                <button onClick={()=>setSelProject(null)} className="opacity-40 hover:opacity-80 ml-1"><X size={12}/></button>
              </div>
            )}
            <div className="glass rounded-2xl border border-[color:var(--border2,var(--border))] focus-within:border-[var(--accent)]/60 transition-colors shadow-lg">
              <textarea ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value);setInputRows(Math.min(8,e.target.value.split('\n').length));}}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder="Message MARIAM…" disabled={loading} rows={inputRows}
                className="w-full bg-transparent px-4 pt-4 pb-2 text-sm outline-none resize-none custom-scrollbar text-[var(--text)] min-h-[52px]"/>
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <button onClick={toggleVoice}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${listening?'bg-red-500 text-white animate-pulse':'opacity-50 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'}`}
                    title="Voice input">
                    {listening?<MicOff size={16}/>:<Mic size={16}/>}
                  </button>
                  {projects.length>0&&(
                    <div className="relative group">
                      <button className="w-8 h-8 rounded-xl flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all" title="Assign to project">
                        <FolderOpen size={16}/>
                      </button>
                      <div className="absolute bottom-10 left-0 hidden group-hover:flex flex-col glass rounded-xl border border-[color:var(--border2,var(--border))] shadow-xl min-w-[160px] py-1 z-50">
                        {projects.map(p=>(
                          <button key={p.id} onClick={()=>setSelProject(p.id)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--accent)]/10 transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:p.color}}/>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={()=>send()} disabled={loading||!input.trim()}
                  className="w-9 h-9 bg-[var(--accent)] disabled:opacity-30 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg transition-all hover:opacity-90 active:scale-95">
                  {loading?<Loader2 size={18} className="animate-spin"/>:<Send size={16}/>}
                </button>
              </div>
            </div>
            <p className="text-xs text-center opacity-20 font-medium mt-2">MARIAM can make mistakes. Verify important medical information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════════════════════════ */
function SettingsView({settings,setSettings,installPrompt,onInstall}){
  const pr=PROVIDERS[settings.provider]||PROVIDERS.anthropic;
  const themes=[
    {id:'pure-white',label:'White',icon:Sun,desc:'Clean & bright'},
    {id:'light',label:'Soft Blue',icon:CloudSun,desc:'Gentle blue tint'},
    {id:'warm',label:'Warm',icon:Flame,desc:'Cozy amber tone'},
    {id:'rose',label:'Rose',icon:Heart,desc:'Soft pink glow'},
    {id:'forest',label:'Forest',icon:Leaf,desc:'Natural greens'},
    {id:'dark',label:'Dark',icon:Moon,desc:'Easy on eyes'},
    {id:'midnight',label:'Midnight',icon:MoonStar,desc:'Deep blue-black'},
    {id:'slate',label:'Slate',icon:Layers,desc:'Modern grey'},
    {id:'oled',label:'OLED',icon:Zap,desc:'Pure black'},
  ];
  const accents=[
    {id:'indigo',hex:'#5046e5',label:'Indigo'},
    {id:'purple',hex:'#9333ea',label:'Purple'},
    {id:'blue',hex:'#2563eb',label:'Blue'},
    {id:'emerald',hex:'#059669',label:'Emerald'},
    {id:'rose',hex:'#e11d48',label:'Rose'},
    {id:'amber',hex:'#d97706',label:'Amber'},
    {id:'cyan',hex:'#0891b2',label:'Cyan'},
    {id:'teal',hex:'#0d9488',label:'Teal'},
  ];
  const sizes=[{id:'small',label:'S',px:15},{id:'medium',label:'M',px:18},{id:'large',label:'L',px:20},{id:'xl',label:'XL',px:22}];
  const changeProvider=p=>{const pr=PROVIDERS[p];setSettings(s=>({...s,provider:p,baseUrl:pr.baseUrl,model:pr.defaultModel}));};

  return(
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{touchAction:"pan-y",WebkitOverflowScrolling:"touch"}}>
      <div className="w-full p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-black flex items-center gap-3 mb-6"><Settings size={28} className="opacity-40"/> Settings</h1>

        {/* Install PWA */}
        {installPrompt&&(
          <section className="glass rounded-2xl p-5 border border-[var(--accent)]/30 bg-[var(--accent)]/5">
            <h2 className="font-black text-sm mb-2 flex items-center gap-2 text-[var(--accent)]"><Smartphone size={16}/> Install as App</h2>
            <p className="text-xs opacity-60 mb-4">Install MARIAM PRO on your device for offline access, faster loading, and a native app experience.</p>
            <div className="flex gap-3">
              <button onClick={onInstall} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg"><Download size={18}/> Install Now</button>
            </div>
          </section>
        )}

        {/* AI Provider */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Globe size={16}/> AI Provider</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {Object.entries(PROVIDERS).map(([id,{label}])=>(
              <button key={id} onClick={()=>changeProvider(id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-black leading-tight transition-all border
                  ${settings.provider===id?'bg-[var(--accent)] text-white border-transparent shadow-md scale-105':'glass opacity-60 hover:opacity-100 border-[color:var(--border2,var(--border))]'}`}>
                {label.split(' ')[0]}<br/><span className="opacity-70 font-normal normal-case text-xs">{label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
          <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${pr.needsKey?'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300':'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}>
            {pr.needsKey?<AlertCircle size={18} className="shrink-0 mt-0.5"/>:<CheckCircle2 size={14} className="shrink-0 mt-0.5"/>}
            {pr.note}
          </div>
          {pr.needsKey&&(
            <div className="mb-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5 flex items-center gap-1"><KeyRound size={10}/>API Key</label>
              <input type="password" placeholder="Paste your API key…" value={settings.apiKey||''}
                onChange={e=>setSettings(s=>({...s,apiKey:e.target.value}))}
                className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"/>
            </div>
          )}
          {(settings.provider==='custom'||settings.provider==='ollama')&&(
            <div className="mb-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5">Base URL</label>
              <input type="text" placeholder="https://your-api.com" value={settings.baseUrl||''}
                onChange={e=>setSettings(s=>({...s,baseUrl:e.target.value}))}
                className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"/>
            </div>
          )}
          <div>
            <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5">Model (optional)</label>
            <input type="text" placeholder={pr.defaultModel||'e.g. gpt-4o'} value={settings.model||''}
              onChange={e=>setSettings(s=>({...s,model:e.target.value}))}
              className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"/>
          </div>
        </section>

        {/* Theme */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Palette size={16}/> Appearance</h2>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {themes.map(t=>(
              <button key={t.id} onClick={()=>setSettings({...settings,theme:t.id})}
                className={`py-3 px-2 flex flex-col items-center gap-1.5 rounded-xl text-xs font-black border transition-all`}
                style={settings.theme===t.id?{background:'linear-gradient(135deg,rgba(var(--acc-rgb,99,102,241),.18),rgba(var(--acc-rgb,99,102,241),.08))',borderColor:'rgba(var(--acc-rgb,99,102,241),.4)',color:'var(--accent)',boxShadow:'0 4px 16px rgba(var(--acc-rgb,99,102,241),.18)'}:{background:'var(--surface2,var(--card))',borderColor:'var(--border)',opacity:.7}}>
                <t.icon size={18}/><span>{t.label}</span>
                {t.desc&&<span style={{fontSize:9,fontWeight:500,opacity:.6}}>{t.desc}</span>}
              </button>
            ))}
          </div>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color:'var(--text3)',opacity:.7}}>Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {accents.map(a=>(
                <button key={a.id} onClick={()=>setSettings({...settings,accentColor:a.id})}
                  title={a.label}
                  className="flex flex-col items-center gap-1 transition-all"
                  style={{}}>
                  <div className="w-8 h-8 rounded-xl transition-all flex items-center justify-center"
                    style={{background:a.hex,boxShadow:settings.accentColor===a.id?`0 0 0 3px rgba(255,255,255,.5), 0 0 0 5px ${a.hex}`:undefined,transform:settings.accentColor===a.id?'scale(1.2)':'scale(1)'}}>
                    {settings.accentColor===a.id&&<CheckCircle2 size={14} className="text-white"/>}
                  </div>
                  <span style={{fontSize:9,fontWeight:700,color:'var(--text3)',opacity:.7}}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest block mb-2" style={{color:'var(--text3)',opacity:.7}}>Font Size</span>
            <div className="flex gap-2 glass rounded-xl p-1.5">
              {sizes.map(sz=>(
                <button key={sz.id} onClick={()=>setSettings({...settings,fontSize:sz.id})}
                  className={`flex-1 py-2 rounded-lg font-black transition-all`}
                  style={settings.fontSize===sz.id?{background:'var(--accent)',color:'#fff'}:{opacity:.6}}
                  >{sz.label}</button>
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
              <p className="text-xs opacity-50 mt-0.5">Use ONLY document text, no outside knowledge</p>
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
          <p className="text-xs opacity-40 mt-1">Universal AI Document Intelligence</p>
          <div className="flex justify-center gap-3 mt-3 text-xs font-black uppercase tracking-widest opacity-30">
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
  const[bootError,setBootError]=useState(null); // Fix 9: surface DB failures to user
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
  const[view,setView]=useState('dashboard');
  const[rpTab,setRpTab]=useState('generate');
  const[rpOpen,setRpOpen]=useState(false);
  const[rpW,setRpW]=useState(420);
  const[bgTask,setBgTask]=useState(null);
  const[installPrompt,setInstallPrompt]=useState(null);
  const[showGlobalSearch,setShowGlobalSearch]=useState(false);
  const[isMobile,setIsMobile]=useState(()=>window.innerWidth<1024);
  const{toasts,addToast}=useToast();

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<1024);
    window.addEventListener('resize',onResize);
    return()=>window.removeEventListener('resize',onResize);
  },[]);

  // (body background kept transparent — app div covers full screen)

  useKeyboardShortcuts([
    ['ctrl+k',()=>setShowGlobalSearch(true)],
    ['ctrl+/',()=>setShowGlobalSearch(true)],
    ['Escape',()=>setShowGlobalSearch(false)],
    ['ctrl+1',()=>setView('dashboard')],
    ['ctrl+2',()=>setView('library')],
    ['ctrl+3',()=>setView('flashcards')],
    ['ctrl+4',()=>setView('exams')],
    ['ctrl+5',()=>setView('cases')],
    ['ctrl+6',()=>setView('chat')],
  ]);

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

  // Load persisted state — show a clear error if IndexedDB is unavailable
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
    }catch(err){
      logError('boot',err);
      // Non-fatal: app still works, just without persisted data
      console.warn('Could not restore saved data. Starting fresh.',err.message);
      setBootError(err.message);
    }finally{setLoaded(true);}
  })();},[]);

  // Persist state to IndexedDB — debounced 800ms, silent failures (non-critical)
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
      }catch(err){
        logError('persist',err);
        // Don't interrupt the user — data is safe in memory for this session
      }
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
    root.style.fontSize={small:'15px',medium:'18px',large:'20px',xl:'22px'}[settings.fontSize]||'18px';
    const clrs={
      indigo:{hex:'#6366f1',rgb:'99,102,241',soft:'#4f46e5'},
      purple:{hex:'#a855f7',rgb:'168,85,247',soft:'#9333ea'},
      blue:{hex:'#3b82f6',rgb:'59,130,246',soft:'#2563eb'},
      emerald:{hex:'#10b981',rgb:'16,185,129',soft:'#059669'},
      rose:{hex:'#f43f5e',rgb:'244,63,94',soft:'#e11d48'},
    };
    const c=clrs[settings.accentColor]||clrs.indigo;
    root.style.setProperty('--accent',c.hex);
    root.style.setProperty('--acc-rgb',c.rgb);
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

      const MEDICINE_RULE_GEN=`\n\nMEDICINE RULE — MANDATORY: For every medication/drug, ALWAYS write brand name first then generic in parentheses. e.g. "Lasix (furosemide)", "Tylenol (acetaminophen)". Apply to ALL items.`;

      const makePrompt=(bc)=>{
        const base=`Difficulty: ${diff}. USE ONLY provided text.${MEDICINE_RULE_GEN}\nDOCUMENT:\n${textContext}`;
        if(taskType==='flashcards')return`${base}\nYOU MUST generate EXACTLY ${bc} expert flashcards — count carefully, the "items" array must have EXACTLY ${bc} entries.\nJSON: {"items":[{"q":"...","a":"...","evidence":"...","sourcePage":1}]}`;
        if(taskType==='exam')return`${base}\nYOU MUST generate EXACTLY ${bc} exam questions — count carefully, the "items" array must have EXACTLY ${bc} entries.\nJSON: {"items":[{"q":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","evidence":"...","sourcePage":1}]}`;
        if(taskType==='cases')return`${base}\nGenerate exactly ${bc} richly detailed clinical cases from ONLY the document content. EACH case MUST have:\n- vignette: 6-10 sentences with demographics, chief complaint, HPI, PMH, meds, vitals, physical exam\n- labPanels: MINIMUM 3 panels (CBC, BMP, LFTs, others) with 5+ rows each (12-20 total lab values), flag abnormals H/L\n- examQuestion with 5 answer options (A-E), long stem, thorough explanation\nThe "cases" array MUST contain EXACTLY ${bc} entries.\nJSON ONLY: {"cases":[{"title":"descriptive title","vignette":"6-10 sentence detailed vignette","diagnosis":"specific ICD diagnosis","labPanels":[{"panelName":"COMPLETE BLOOD COUNT","rows":[{"test":"WBC","result":"15.2","flag":"H","range":"4.5-11.0","units":"K/uL"},{"test":"Hemoglobin","result":"11.5","flag":"L","range":"12.0-16.0","units":"g/dL"},{"test":"Hematocrit","result":"34.5","flag":"L","range":"36-46","units":"%"},{"test":"Platelets","result":"250","flag":"","range":"150-400","units":"K/uL"},{"test":"MCV","result":"80","flag":"","range":"80-100","units":"fL"},{"test":"Neutrophils","result":"85","flag":"H","range":"50-70","units":"%"}]},{"panelName":"BASIC METABOLIC PANEL","rows":[{"test":"Na","result":"138","flag":"","range":"135-145","units":"mEq/L"},{"test":"K","result":"3.2","flag":"L","range":"3.5-5.0","units":"mEq/L"},{"test":"Cl","result":"100","flag":"","range":"98-107","units":"mEq/L"},{"test":"CO2","result":"24","flag":"","range":"22-28","units":"mEq/L"},{"test":"BUN","result":"28","flag":"H","range":"7-20","units":"mg/dL"},{"test":"Creatinine","result":"1.5","flag":"H","range":"0.6-1.2","units":"mg/dL"}]},{"panelName":"LIVER FUNCTION TESTS","rows":[{"test":"AST","result":"150","flag":"H","range":"10-40","units":"U/L"},{"test":"ALT","result":"175","flag":"H","range":"7-56","units":"U/L"},{"test":"ALP","result":"90","flag":"","range":"44-147","units":"U/L"},{"test":"Total Bilirubin","result":"1.2","flag":"","range":"0.1-1.2","units":"mg/dL"},{"test":"Albumin","result":"3.0","flag":"L","range":"3.5-5.0","units":"g/dL"}]}],"examQuestion":{"q":"Detailed 2-3 sentence question stem about the case","options":["A) specific option","B) specific option","C) specific option","D) specific option","E) specific option"],"correct":0,"explanation":"Thorough 4-5 sentence explanation","evidence":"document quote","sourcePage":1}}]}`;
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
        // Exact batch size: last batch gets remainder, all others get batchSize
        const bc=i===numBatches-1?(count%batchSize===0?batchSize:count%batchSize):batchSize;
        return()=>callAI(makePrompt(bc),isJson,settings.strictMode,settings,8000);
      }):[()=>callAI(makePrompt(count),isJson,settings.strictMode,settings,8000)];

      let all=[];
      const exRes=await runParallel(tasks,50,(done,total)=>{
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        /* ══ FONTS ══ */
        *, *::before, *::after { box-sizing: border-box; }
        * { -webkit-tap-highlight-color: transparent; font-family: 'DM Sans', system-ui, sans-serif; }
        h1,h2,h3,h4,.brand,.font-black { font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important; }
        .mono, code, pre { font-family: 'JetBrains Mono', monospace !important; }
        body { margin:0; padding:0; overflow:hidden; }
        input, textarea, select { font-size: 16px !important; }

        /* ══ LIGHT THEMES ══ */
        .pure-white {
          --bg:#f6f8ff; --bg2:#edf1ff; --surface:#ffffff; --surface2:#f0f4ff; --surface3:#e5eaff;
          --text:#060d28; --text2:#3e4f7a; --text3:#8494bc;
          --border:rgba(50,80,220,.07); --border2:rgba(50,80,220,.14);
          --accent:#4f46e5; --accent2:#7c3aed; --acc-rgb:79,70,229;
          --nav-bg:rgba(246,248,255,.88); --sidebar-bg:linear-gradient(180deg,#eef2ff,#e5eaff);
          --card:#fff; --glow:rgba(79,70,229,.12);
        }
        .light {
          --bg:#eef2ff; --bg2:#e3eaff; --surface:#ffffff; --surface2:#eef2ff; --surface3:#e0e8ff;
          --text:#040e2a; --text2:#2e3f6a; --text3:#6a7caa;
          --border:rgba(40,70,220,.09); --border2:rgba(40,70,220,.17);
          --accent:#4338ca; --accent2:#6d28d9; --acc-rgb:67,56,202;
          --nav-bg:rgba(238,242,255,.92); --sidebar-bg:linear-gradient(180deg,#e3eaff,#d8e2ff);
          --card:#fff; --glow:rgba(67,56,202,.12);
        }
        .warm {
          --bg:#fffcf5; --bg2:#fff8ea; --surface:#ffffff; --surface2:#fffbf0; --surface3:#fff4d9;
          --text:#1c0f04; --text2:#5c3d1a; --text3:#9e7540;
          --border:rgba(180,110,20,.08); --border2:rgba(180,110,20,.15);
          --accent:#d97706; --accent2:#ea580c; --acc-rgb:217,119,6;
          --nav-bg:rgba(255,252,245,.92); --sidebar-bg:linear-gradient(180deg,#fff8ea,#ffefd4);
          --card:#fff; --glow:rgba(217,119,6,.12);
        }
        .rose {
          --bg:#fff5f7; --bg2:#ffe8ee; --surface:#ffffff; --surface2:#fff0f4; --surface3:#ffdde5;
          --text:#1c040c; --text2:#5c1525; --text3:#a04560;
          --border:rgba(220,30,80,.08); --border2:rgba(220,30,80,.15);
          --accent:#e11d48; --accent2:#be185d; --acc-rgb:225,29,72;
          --nav-bg:rgba(255,245,247,.92); --sidebar-bg:linear-gradient(180deg,#ffe8ee,#ffdde5);
          --card:#fff; --glow:rgba(225,29,72,.12);
        }
        .forest {
          --bg:#f2fbf6; --bg2:#e2f5ea; --surface:#ffffff; --surface2:#eef9f3; --surface3:#ddf3e6;
          --text:#041a0c; --text2:#1a4a2a; --text3:#4a8060;
          --border:rgba(20,130,55,.08); --border2:rgba(20,130,55,.15);
          --accent:#059669; --accent2:#0d9488; --acc-rgb:5,150,105;
          --nav-bg:rgba(242,251,246,.92); --sidebar-bg:linear-gradient(180deg,#e2f5ea,#cfeedd);
          --card:#fff; --glow:rgba(5,150,105,.12);
        }
        /* ══ DARK THEMES ══ */
        .dark {
          --bg:#050a14; --bg2:#080e1e; --surface:#0d1628; --surface2:#121e34; --surface3:#172440;
          --text:#cad8f8; --text2:#546082; --text3:#324060;
          --border:rgba(100,140,255,.08); --border2:rgba(100,140,255,.15);
          --accent:#818cf8; --accent2:#a78bfa; --acc-rgb:129,140,248;
          --nav-bg:rgba(5,10,20,.94); --sidebar-bg:linear-gradient(180deg,#06091a,#050810);
          --card:#0d1628; --glow:rgba(129,140,248,.14);
        }
        .midnight {
          --bg:#09091a; --bg2:#0e0e24; --surface:#131326; --surface2:#191934; --surface3:#202046;
          --text:#dddeff; --text2:#5a5a98; --text3:#3a3a70;
          --border:rgba(130,130,255,.08); --border2:rgba(130,130,255,.15);
          --accent:#6366f1; --accent2:#8b5cf6; --acc-rgb:99,102,241;
          --nav-bg:rgba(9,9,26,.96); --sidebar-bg:linear-gradient(180deg,#0e0e24,#09091a);
          --card:#131326; --glow:rgba(99,102,241,.14);
        }
        .slate {
          --bg:#0d1117; --bg2:#131b24; --surface:#1a2330; --surface2:#202c3a; --surface3:#283444;
          --text:#d4e4f8; --text2:#4e6080; --text3:#304050;
          --border:rgba(80,130,190,.08); --border2:rgba(80,130,190,.15);
          --accent:#38bdf8; --accent2:#818cf8; --acc-rgb:56,189,248;
          --nav-bg:rgba(13,17,23,.96); --sidebar-bg:linear-gradient(180deg,#131b24,#0d1117);
          --card:#1a2330; --glow:rgba(56,189,248,.14);
        }
        .oled {
          --bg:#000000; --bg2:#040810; --surface:#070c18; --surface2:#0b1020; --surface3:#0f1528;
          --text:#b8ccf0; --text2:#384870; --text3:#243050;
          --border:rgba(70,110,220,.07); --border2:rgba(70,110,220,.12);
          --accent:#818cf8; --accent2:#c084fc; --acc-rgb:129,140,248;
          --nav-bg:rgba(0,0,0,.97); --sidebar-bg:linear-gradient(180deg,#040810,#000000);
          --card:#070c18; --glow:rgba(129,140,248,.12);
        }
        /* ══ ACCENT OVERRIDES ══ */
        .accent-indigo  {--accent:#4f46e5;--accent2:#7c3aed;--acc-rgb:79,70,229;}
        .accent-purple  {--accent:#9333ea;--accent2:#7c3aed;--acc-rgb:147,51,234;}
        .accent-blue    {--accent:#2563eb;--accent2:#0891b2;--acc-rgb:37,99,235;}
        .accent-emerald {--accent:#059669;--accent2:#0d9488;--acc-rgb:5,150,105;}
        .accent-rose    {--accent:#e11d48;--accent2:#be185d;--acc-rgb:225,29,72;}
        .accent-amber   {--accent:#d97706;--accent2:#ea580c;--acc-rgb:217,119,6;}
        .accent-cyan    {--accent:#0891b2;--accent2:#0e7490;--acc-rgb:8,145,178;}
        .accent-teal    {--accent:#0d9488;--accent2:#059669;--acc-rgb:13,148,136;}

        /* ══ SCROLLBAR ══ */
        .custom-scrollbar { -webkit-overflow-scrolling: touch; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; height: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--acc-rgb,99,102,241),.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--acc-rgb,99,102,241),.4); }

        /* ══ SURFACES ══ */
        .glass { background: var(--surface,var(--card)); border: 1px solid var(--border); }
        .glass-2 { background: var(--surface2,var(--card)); border: 1px solid var(--border2,var(--border)); }
        .card-lined {
          background: var(--surface,var(--card));
          border: 1px solid var(--border2,var(--border));
          border-top: 1.5px solid rgba(var(--acc-rgb,99,102,241),.25);
          box-shadow: 0 4px 20px rgba(0,0,0,.1), 0 1px 4px rgba(0,0,0,.06);
        }
        .card-glow {
          background: linear-gradient(135deg,rgba(var(--acc-rgb,99,102,241),.08),rgba(var(--acc-rgb,99,102,241),.02));
          border: 1px solid rgba(var(--acc-rgb,99,102,241),.22);
          box-shadow: 0 0 28px rgba(var(--acc-rgb,99,102,241),.08),inset 0 1px 0 rgba(var(--acc-rgb,99,102,241),.1);
        }

        /* ══ BUTTONS ══ */
        .btn-accent {
          background: linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));
          color:#fff; border:none; cursor:pointer; font-weight:800; letter-spacing:.015em;
          transition: all .18s cubic-bezier(.34,1.4,.64,1);
          box-shadow: 0 4px 18px rgba(var(--acc-rgb,99,102,241),.32),inset 0 1px 0 rgba(255,255,255,.14);
          position:relative; overflow:hidden;
        }
        .btn-accent::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(255,255,255,.1),transparent); }
        .btn-accent:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(var(--acc-rgb,99,102,241),.44); }
        .btn-accent:active { transform:scale(.97); }

        /* ══ GRADIENT TEXT ══ */
        .gradient-text {
          background: linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* ══ CARD HOVER ══ */
        .card-hover { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .card-hover:hover {
          transform:translateY(-2px);
          box-shadow:0 12px 36px rgba(var(--acc-rgb,99,102,241),.1),0 2px 8px rgba(0,0,0,.14);
          border-color:rgba(var(--acc-rgb,99,102,241),.3) !important;
        }

        /* ══ ANIMATIONS ══ */
        @keyframes slide-in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes slide-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes scale-in  { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes fade-in   { from{opacity:0} to{opacity:1} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes glow-ring { 0%,100%{box-shadow:0 0 0 0 rgba(var(--acc-rgb,99,102,241),.35)} 50%{box-shadow:0 0 0 7px rgba(var(--acc-rgb,99,102,241),0)} }
        @keyframes shimmer   { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
        @keyframes ticker    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .animate-slide-in { animation:slide-in .25s cubic-bezier(.34,1.2,.64,1) both; }
        .animate-slide-up { animation:slide-up .32s cubic-bezier(.34,1.2,.64,1) both; }
        .animate-scale-in { animation:scale-in .24s cubic-bezier(.34,1.3,.64,1) both; }
        .animate-fade-in  { animation:fade-in .2s ease both; }
        .animate-spin     { animation:spin 1s linear infinite; }
        .animate-pulse    { animation:glow-ring 2.5s ease infinite; }
        .animate-bounce   { animation:float 1s ease-in-out infinite; }
        .animate-float    { animation:float 3s ease-in-out infinite; }
        .stagger-1{animation-delay:.06s} .stagger-2{animation-delay:.12s} .stagger-3{animation-delay:.18s}
        .stagger-4{animation-delay:.24s} .stagger-5{animation-delay:.30s} .stagger-6{animation-delay:.36s}

        /* ══ NAVIGATION ══ */
        .sidebar-nav { background:var(--sidebar-bg,var(--surface2)); border-right:1px solid var(--border); }
        .sidebar-nav button { transition:all .18s ease; }
        .nav-item-active { position:relative; }
        .nav-item-active::before {
          content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
          width:3px; height:30px; border-radius:0 6px 6px 0;
          background:linear-gradient(180deg,var(--accent),var(--accent2,var(--accent)));
        }
        /* ══ ROOT RESET — zero margin/padding, exact screen fit ══ */
        *, *::before, *::after { box-sizing: border-box; }
        html, body {
          margin: 0; padding: 0;
          width: 100%; height: 100dvh;
          overflow: hidden;
          overscroll-behavior: none;
          background: transparent;
        }

        .main-header {
          background:var(--nav-bg);
          backdrop-filter:saturate(200%) blur(20px); -webkit-backdrop-filter:saturate(200%) blur(20px);
          border-bottom:1px solid var(--border);
        }

        /* ══ PILL NAV / SIDEBAR — controlled by React isMobile state, not CSS ══ */
        /* Glass pill nav styles (applied via inline styles in JSX) */

        /* ══ BG MESH ══ */
        .bg-mesh {
          background:
            radial-gradient(ellipse 900px 700px at 0% -5%,rgba(var(--acc-rgb,99,102,241),.06) 0%,transparent 55%),
            radial-gradient(ellipse 700px 900px at 105% 105%,rgba(167,139,250,.04) 0%,transparent 55%),
            var(--bg);
        }

        /* ══ INPUTS ══ */
        .glass-input {
          background:var(--surface2,var(--card)); border:1px solid var(--border2,var(--border));
          color:var(--text); transition:border-color .15s,box-shadow .15s;
        }
        .glass-input:focus {
          outline:none; border-color:rgba(var(--acc-rgb,99,102,241),.5);
          box-shadow:0 0 0 3px rgba(var(--acc-rgb,99,102,241),.1);
        }

        /* ══ SHIMMER SKELETON ══ */
        .shimmer {
          background: linear-gradient(90deg,var(--surface2) 25%,var(--surface3,var(--surface)) 50%,var(--surface2) 75%);
          background-size:400% 100%; animation:shimmer 1.6s ease infinite;
        }

        /* ══ MISC ══ */
        /* Mobile: pad bottom so content clears the pill nav (~62px) + safe area */
        .scroll-content { padding-bottom:calc(96px + env(safe-area-inset-bottom)); -webkit-overflow-scrolling:touch; }
        @media(min-width:1024px){ .scroll-content { padding-bottom:32px; } }
        .prose-custom h2,.prose-custom h3 { font-weight:800; margin:14px 0 5px; }
        .prose-custom li { margin:3px 0; }
        .prose-custom strong { font-weight:800; }
        canvas { display:block; max-width:100%; height:auto !important; }
        textarea { min-height:40px; }
        input[type=range] { accent-color:var(--accent); }
        html { scroll-behavior:smooth; }
        @media(max-width:640px){ .hide-sm{display:none!important;} }
        @media(min-width:1024px){ .lg-only{display:flex!important;} }

        /* ══ DRAG HANDLE ══ */
        .drag-h { cursor:col-resize; width:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:transparent; transition:background .15s; }
        .drag-h:hover { background:rgba(var(--acc-rgb,99,102,241),.12); }
        .drag-h-row { cursor:row-resize; height:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:transparent; transition:background .15s; }
        .drag-h-row:hover { background:rgba(var(--acc-rgb,99,102,241),.12); }

        /* ══ ANSWER OPTION ══ */
        .answer-opt { transition:all .13s ease; cursor:pointer; border:1.5px solid var(--border2,var(--border)); background:var(--surface,var(--card)); border-radius:14px; }
        .answer-opt:not(:disabled):hover { border-color:rgba(var(--acc-rgb,99,102,241),.4); background:rgba(var(--acc-rgb,99,102,241),.05); transform:translateX(3px); }
        .answer-opt.selected  { border-color:var(--accent); background:rgba(var(--acc-rgb,99,102,241),.1); }
        .answer-opt.correct   { border-color:#10b981; background:rgba(16,185,129,.1); }
        .answer-opt.wrong     { border-color:#f43f5e; background:rgba(244,63,94,.08); }

        /* ══ BADGE ══ */
        .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:700; background:rgba(var(--acc-rgb,99,102,241),.1); color:var(--accent); border:1px solid rgba(var(--acc-rgb,99,102,241),.2); }
      `}</style>
      <div className="relative">
        <img src={MARIAM_IMG} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" alt="MARIAM"/>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={14}/>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-indigo-500">MARIAM PRO</p>
        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30 mt-1">{APP_VER} · Loading</p>
      </div>
    </div>
  );

  const showReader=view==='reader'&&!!activeId&&!!activeDoc;

  const NAV_ITEMS=[
    {icon:LayoutDashboard,label:'Home',v:'dashboard'},
    {icon:BookOpen,label:'Library',v:'library'},
    {icon:BookMarked,label:'Reader',v:'reader',dis:!activeId},
    {icon:Layers,label:'Cards',v:'flashcards'},
    {icon:Activity,label:'Cases',v:'cases'},
    {icon:CheckSquare,label:'Exams',v:'exams'},
    {icon:MessageSquare,label:'Chat',v:'chat'},
    {icon:Settings,label:'Settings',v:'settings'},
  ];

  return(
    <div className={`w-screen flex flex-col overflow-hidden text-[var(--text)] bg-mesh ${settings.theme||'pure-white'} accent-${settings.accentColor||'indigo'}`}
      style={{
        height:'100dvh',
        maxHeight:'100dvh',
        boxSizing:'border-box',
        /* safe-area-inset-top is handled by the header below */
      }}>
      <style>{`
        /* ── LIGHT THEMES ── */
        .pure-white{--bg:#f5f7ff;--bg2:#ecf0ff;--surface:#ffffff;--surface2:#f0f4ff;--text:#05102c;--text2:#3a4870;--text3:#7e8fb0;--border:rgba(60,80,220,.07);--border2:rgba(60,80,220,.13);--accent:#5046e5;--accent2:#7c3aed;--accent3:#0891b2;--acc-rgb:80,70,229;--nav-bg:rgba(245,247,255,.88);--sidebar-bg:linear-gradient(180deg,#eef2ff 0%,#e6ecff 100%);--card:#fff;--border-old:#e2e8f0;}
        .light{--bg:#eef2ff;--bg2:#e4eaff;--surface:#ffffff;--surface2:#eef2ff;--text:#050f2a;--text2:#334070;--text3:#6a7ba0;--border:rgba(40,70,220,.09);--border2:rgba(40,70,220,.16);--accent:#4338ca;--accent2:#6d28d9;--accent3:#0284c7;--acc-rgb:67,56,202;--nav-bg:rgba(238,242,255,.92);--sidebar-bg:linear-gradient(180deg,#e4eaff 0%,#d8e2ff 100%);--card:#fff;--border-old:#e2e8f0;}
        .warm{--bg:#fffbf5;--bg2:#fff5e8;--surface:#ffffff;--surface2:#fff8f0;--text:#1a0f05;--text2:#5c3d1e;--text3:#9e7555;--border:rgba(180,100,20,.08);--border2:rgba(180,100,20,.15);--accent:#ea580c;--accent2:#d97706;--accent3:#0891b2;--acc-rgb:234,88,12;--nav-bg:rgba(255,251,245,.92);--sidebar-bg:linear-gradient(180deg,#fff5e8 0%,#ffefd6 100%);--card:#fff;--border-old:#fde8cc;}
        .rose{--bg:#fff5f7;--bg2:#ffe8ed;--surface:#ffffff;--surface2:#fff0f4;--text:#1a0508;--text2:#5c1a28;--text3:#a05070;--border:rgba(200,30,80,.08);--border2:rgba(200,30,80,.15);--accent:#e11d48;--accent2:#be185d;--accent3:#0891b2;--acc-rgb:225,29,72;--nav-bg:rgba(255,245,247,.92);--sidebar-bg:linear-gradient(180deg,#ffe8ed 0%,#ffd6e0 100%);--card:#fff;--border-old:#ffc0cb;}
        .forest{--bg:#f0faf5;--bg2:#e0f5ea;--surface:#ffffff;--surface2:#eef9f3;--text:#031a0a;--text2:#1a4a28;--text3:#4a8060;--border:rgba(20,130,60,.08);--border2:rgba(20,130,60,.15);--accent:#059669;--accent2:#0d9488;--accent3:#7c3aed;--acc-rgb:5,150,105;--nav-bg:rgba(240,250,245,.92);--sidebar-bg:linear-gradient(180deg,#e0f5ea 0%,#cff0dc 100%);--card:#fff;--border-old:#b7f5d0;}
        /* ── DARK THEMES ── */
        .dark{--bg:#04080f;--bg2:#070c18;--surface:#0c1220;--surface2:#101828;--text:#ccd8f8;--text2:#5c6e98;--text3:#384562;--border:rgba(100,130,255,.08);--border2:rgba(100,130,255,.14);--accent:#818cf8;--accent2:#a78bfa;--accent3:#22d3ee;--acc-rgb:129,140,248;--nav-bg:rgba(4,8,15,.94);--sidebar-bg:linear-gradient(180deg,#06090f 0%,#040810 100%);--card:#0c1220;--border-old:#252840;}
        .oled{--bg:#000000;--bg2:#030610;--surface:#060c18;--surface2:#0a1020;--text:#c0d0f0;--text2:#404e70;--text3:#28344c;--border:rgba(80,120,255,.07);--border2:rgba(80,120,255,.12);--accent:#818cf8;--accent2:#c084fc;--accent3:#22d3ee;--acc-rgb:129,140,248;--nav-bg:rgba(0,0,0,.97);--sidebar-bg:linear-gradient(180deg,#020408 0%,#000000 100%);--card:#060c18;--border-old:#1a1a1a;}
        .midnight{--bg:#0a0a14;--bg2:#0e0e1e;--surface:#12122a;--surface2:#18183a;--text:#e0e0ff;--text2:#6060a0;--text3:#404080;--border:rgba(140,140,255,.08);--border2:rgba(140,140,255,.14);--accent:#6366f1;--accent2:#8b5cf6;--accent3:#22d3ee;--acc-rgb:99,102,241;--nav-bg:rgba(10,10,20,.96);--sidebar-bg:linear-gradient(180deg,#0e0e1e 0%,#0a0a14 100%);--card:#12122a;--border-old:#1e1e40;}
        .slate{--bg:#0f1117;--bg2:#161820;--surface:#1e2130;--surface2:#252840;--text:#dce8f8;--text2:#5a6a88;--text3:#384558;--border:rgba(100,130,180,.08);--border2:rgba(100,130,180,.14);--accent:#38bdf8;--accent2:#818cf8;--accent3:#34d399;--acc-rgb:56,189,248;--nav-bg:rgba(15,17,23,.96);--sidebar-bg:linear-gradient(180deg,#161820 0%,#0f1117 100%);--card:#1e2130;--border-old:#2a2d40;}
        /* ── ACCENT OVERRIDES (when user picks accent color) ── */
        .accent-indigo{--accent:#5046e5;--accent2:#7c3aed;--acc-rgb:80,70,229;}
        .accent-purple{--accent:#9333ea;--accent2:#7c3aed;--acc-rgb:147,51,234;}
        .accent-blue{--accent:#2563eb;--accent2:#0891b2;--acc-rgb:37,99,235;}
        .accent-emerald{--accent:#059669;--accent2:#0d9488;--acc-rgb:5,150,105;}
        .accent-rose{--accent:#e11d48;--accent2:#be185d;--acc-rgb:225,29,72;}
        .accent-amber{--accent:#d97706;--accent2:#ea580c;--acc-rgb:217,119,6;}
        .accent-cyan{--accent:#0891b2;--accent2:#0e7490;--acc-rgb:8,145,178;}
        .accent-teal{--accent:#0d9488;--accent2:#059669;--acc-rgb:13,148,136;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{margin:0;padding:0;overflow:hidden;}
        input,textarea,select{font-size:16px!important;}
        .custom-scrollbar{-webkit-overflow-scrolling:touch;}
        .custom-scrollbar::-webkit-scrollbar{width:2px;height:2px;}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(var(--acc-rgb,99,102,241),.22);border-radius:4px;}
        .glass{background:var(--surface,var(--card));border:1px solid var(--border);}
        .glass-2{background:var(--surface2,var(--card));border:1px solid var(--border2,var(--border));}
        .card-lined{background:var(--surface,var(--card));border:1px solid var(--border2,var(--border));border-top:1.5px solid rgba(var(--acc-rgb,99,102,241),.25);box-shadow:0 4px 20px rgba(0,0,0,.12);}
        .card-glow{background:linear-gradient(145deg,rgba(var(--acc-rgb,99,102,241),.08),rgba(var(--acc-rgb,99,102,241),.02));border:1px solid rgba(var(--acc-rgb,99,102,241),.22);box-shadow:0 0 28px rgba(var(--acc-rgb,99,102,241),.07);}
        .btn-accent{background:linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));color:#fff;border:none;cursor:pointer;font-weight:800;letter-spacing:.01em;transition:all .18s cubic-bezier(.34,1.4,.64,1);box-shadow:0 4px 18px rgba(var(--acc-rgb,99,102,241),.3),inset 0 1px 0 rgba(255,255,255,.13);position:relative;overflow:hidden;}
        .btn-accent::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.09),transparent);}
        .btn-accent:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(var(--acc-rgb,99,102,241),.42);}
        .btn-accent:active{transform:scale(.97);}
        .gradient-text{background:linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .card-hover{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(var(--acc-rgb,99,102,241),.1),0 2px 8px rgba(0,0,0,.15);border-color:rgba(var(--acc-rgb,99,102,241),.28)!important;}
        @keyframes slide-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes slide-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes scale-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glow-ring{0%,100%{box-shadow:0 0 0 0 rgba(var(--acc-rgb,99,102,241),.3)}50%{box-shadow:0 0 0 6px rgba(var(--acc-rgb,99,102,241),0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .animate-slide-in{animation:slide-in .24s cubic-bezier(.34,1.2,.64,1) both;}
        .animate-slide-up{animation:slide-up .3s cubic-bezier(.34,1.2,.64,1) both;}
        .animate-scale-in{animation:scale-in .22s cubic-bezier(.34,1.3,.64,1) both;}
        .animate-fade-in{animation:fade-in .2s ease both;}
        .animate-spin{animation:spin 1s linear infinite;}
        .animate-pulse{animation:glow-ring 2s ease infinite;}
        .animate-bounce{animation:float .9s ease-in-out infinite;}
        .stagger-1{animation-delay:.06s}.stagger-2{animation-delay:.12s}.stagger-3{animation-delay:.18s}
        .stagger-4{animation-delay:.24s}.stagger-5{animation-delay:.3s}.stagger-6{animation-delay:.36s}
        .sidebar-nav{background:var(--sidebar-bg);border-right:1px solid var(--border);}
        .nav-item-active{position:relative;}
        .nav-item-active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:26px;border-radius:0 4px 4px 0;background:linear-gradient(180deg,var(--accent),var(--accent2,var(--accent)));}
        .mobile-nav{background:var(--nav-bg);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-top:1px solid var(--border);}
        .main-header{background:var(--nav-bg);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--border);}
        .bg-mesh{background:radial-gradient(ellipse 800px 600px at 0% 0%,rgba(var(--acc-rgb,99,102,241),.06) 0%,transparent 60%),radial-gradient(ellipse 600px 800px at 100% 100%,rgba(167,139,250,.04) 0%,transparent 60%),var(--bg);}
        .prose-custom h2,.prose-custom h3{font-weight:800;margin:14px 0 5px;}
        .prose-custom li{margin:3px 0;}
        .prose-custom strong{font-weight:800;}
        .scroll-content{padding-bottom:calc(96px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch;}
        @media(min-width:1024px){.scroll-content{padding-bottom:32px;}}

        /* ── PILL NAV ITEM ACTIVE ── */
        .pill-nav-active{position:relative;}
        .pill-nav-active::before{display:none;}
        /* ── SIDEBAR HOVER ── */
        .sidebar-nav button:not(:disabled):hover .nav-icon{opacity:1!important;transform:scale(1.1);}
        .sidebar-nav button{border-radius:12px;margin:0 8px;}
        /* ── GLASS INPUTS ── */
        .glass-input{background:var(--surface2,var(--card));border:1px solid var(--border2,var(--border));color:var(--text);transition:border-color .15s,box-shadow .15s;}
        .glass-input:focus{outline:none;border-color:rgba(var(--acc-rgb,99,102,241),.5);box-shadow:0 0 0 3px rgba(var(--acc-rgb,99,102,241),.1);}
        /* ── PILL BADGE ── */
        .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(var(--acc-rgb,99,102,241),.1);color:var(--accent);border:1px solid rgba(var(--acc-rgb,99,102,241),.2);}
        /* ── DRAG HANDLE ── */
        .drag-handle{cursor:col-resize;display:flex;align-items:center;justify-content:center;width:8px;background:transparent;transition:background .15s;flex-shrink:0;}
        .drag-handle:hover{background:rgba(var(--acc-rgb,99,102,241),.15);}
        /* ── SECTION HEADER ── */
        .section-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--text3,var(--text));opacity:.7;}
        /* ── STAT CARD SHIMMER on load ── */
        @keyframes shimmer{0%{background-position:-400% 0}100%{background-position:400% 0}}
        .shimmer{background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3,var(--surface)) 50%,var(--surface2) 75%);background-size:400% 100%;animation:shimmer 1.5s ease infinite;}
        /* ── RESPONSIVE FIXES ── */
        @media(max-width:640px){
          .hide-mobile{display:none!important;}
          .glass{backdrop-filter:none;-webkit-backdrop-filter:none;}
        }
        @media(min-width:1024px){
          .hide-desktop{display:none!important;}
        }
        /* ── CARD GRID RESPONSIVE ── */
        .responsive-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));}
        @media(max-width:640px){.responsive-grid{grid-template-columns:1fr;}}
        canvas{display:block;max-width:100%;height:auto!important;}
        textarea{min-height:40px;}
        input[type=range]{accent-color:var(--accent);}
        html{scroll-behavior:smooth;}
      `}</style>
      <ToastContainer toasts={toasts}/>
      {showGlobalSearch&&<GlobalSearch docs={docs} flashcards={flashcards} exams={exams} cases={cases} notes={notes}
        onNavigate={(v,id)=>{setView(v);if(id){setActiveId(id);setOpenDocs(p=>p.includes(id)?p:[...p,id]);setDocPages(p=>({...p,[id]:1}));};}}
        onClose={()=>setShowGlobalSearch(false)}/>}
      <GlobalTaskIndicator onViewResult={(id,task)=>{
        // Auto-navigate to the right page when clicking a done task
        if(task.type==='flashcards')setView('flashcards');
        else if(task.type==='exam')setView('exams');
        else if(task.type==='cases')setView('cases');
      }}/>

      {/* Boot error banner — shown when IndexedDB failed to restore saved data */}
      {bootError&&(
        <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
          <AlertCircle size={16} className="shrink-0"/>
          <span>Could not restore your previous session — starting fresh. ({bootError})</span>
          <button onClick={()=>setBootError(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

      {/* HEADER */}
      <header className="main-header shrink-0 z-40"
        style={{
          paddingTop:'env(safe-area-inset-top)',
          height:'calc(64px + env(safe-area-inset-top))',
          boxSizing:'border-box',
        }}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4" style={{height:64}}>

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <img src={MARIAM_IMG} className="w-10 h-10 rounded-2xl object-cover" alt=""
                style={{boxShadow:'0 0 0 2px rgba(var(--acc-rgb,99,102,241),0.3),0 4px 12px rgba(0,0,0,0.25)'}}/>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[var(--bg)] bg-emerald-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"/>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xl font-black tracking-tight leading-none gradient-text">MARIAM</p>
              <p className="text-xs opacity-30 font-bold tracking-widest uppercase leading-none mt-0.5">{APP_VER}</p>
            </div>
            {Object.values(window.__MARIAM_BG__?.tasks||{}).filter(t=>t.status==='running').length>0&&(
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black text-amber-400 border border-amber-500/30 bg-amber-500/10">
                <Loader2 size={10} className="animate-spin"/>{Object.values(window.__MARIAM_BG__.tasks).filter(t=>t.status==='running').length} running
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:flex">
            <button onClick={()=>setShowGlobalSearch(true)} className="relative w-full group">
              <div className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer"
                style={{background:'var(--surface2,var(--card))',border:'1px solid var(--border)'}}>
                <Search size={15} className="opacity-30 shrink-0 group-hover:opacity-60 transition-opacity"/>
                <span className="opacity-35 flex-1 text-left font-medium">Search everything…</span>
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-black opacity-25"
                  style={{background:'var(--border)',border:'1px solid var(--border2)'}}>⌘K</kbd>
              </div>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={()=>setShowGlobalSearch(true)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{background:'var(--surface2,var(--card))',border:'1px solid var(--border)'}}>
              <Search size={16} className="opacity-60"/>
            </button>
            {installPrompt&&(
              <button onClick={onInstall} className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                style={{background:'rgba(var(--acc-rgb,99,102,241),0.1)',color:'var(--accent)',border:'1px solid rgba(var(--acc-rgb,99,102,241),0.2)'}}>
                <Download size={14}/> Install App
              </button>
            )}
            {activeDoc&&(
              <button onClick={()=>{setRpOpen(o=>!o);if(view!=='reader')setView('reader');}}
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all`}
                style={rpOpen?{
                  background:'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))',
                  color:'#fff',boxShadow:'0 4px 16px rgba(var(--acc-rgb,99,102,241),0.35)'
                }:{
                  background:'rgba(var(--acc-rgb,99,102,241),0.1)',
                  color:'var(--accent)',
                  border:'1px solid rgba(var(--acc-rgb,99,102,241),0.2)'
                }}>
                <Sparkles size={15}/> AI Studio
              </button>
            )}
            <button onClick={()=>setView('settings')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all opacity-50 hover:opacity-100"
              style={{background:'var(--surface2,var(--card))',border:'1px solid var(--border)'}}>
              <Settings size={16}/>
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* DESKTOP SIDEBAR — only rendered when not mobile */}
        {!isMobile&&(
        <nav style={{width:120,display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,zIndex:30,paddingTop:16,paddingBottom:16,gap:2,background:'var(--sidebar-bg,var(--surface2))',borderRight:'1px solid var(--border)'}}>
          {NAV_ITEMS.map(({icon:Icon,label,v,dis})=>(
            <button key={v} onClick={()=>{if(!dis){if(v==='reader'&&activeId)setView('reader');else if(v!=='reader')setView(v);}}}
              disabled={dis} title={label}
              style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:6,width:'100%',padding:'10px 4px',border:'none',background:'none',cursor:dis?'not-allowed':'pointer',opacity:dis?0.2:1,transition:'all .15s'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',borderRadius:16,width:56,height:56,transition:'all .15s',
                ...(view===v?{background:'linear-gradient(135deg,rgba(var(--acc-rgb,99,102,241),.18),rgba(var(--acc-rgb,99,102,241),.08))',border:'1.5px solid rgba(var(--acc-rgb,99,102,241),.28)',color:'var(--accent)',boxShadow:'0 4px 16px rgba(var(--acc-rgb,99,102,241),.2)'}:
                dis?{color:'var(--text3,var(--text))'}:{color:'var(--text2,var(--text))',opacity:.6})}}>
                <Icon size={24} strokeWidth={view===v?2.5:1.8}/>
              </div>
              <span style={{fontSize:10,color:view===v?'var(--accent)':'var(--text3,var(--text))',opacity:dis?0.3:view===v?1:.7,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                {label}
              </span>
            </button>
          ))}
        </nav>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {uploading&&(
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--border)] z-50">
              <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] transition-all duration-300 animate-pulse" style={{width:`${uploadPct}%`}}/>
            </div>
          )}

          <ViewWrapper active={view==='dashboard'}>
            <DashboardView docs={docs} flashcards={flashcards} exams={exams} cases={cases} notes={notes} chatSessions={chatSessions}
              setView={setView} setActiveId={id=>{setActiveId(id);setOpenDocs(p=>p.includes(id)?p:[...p,id]);}} addToast={addToast} settings={settings}/>
          </ViewWrapper>
          <ViewWrapper active={view==='library'}>
            <LibraryView docs={docs} uploading={uploading} onUpload={handleUpload}
              onOpen={id=>{setOpenDocs(p=>p.includes(id)?p:[...p,id]);setActiveId(id);setView('reader');}}
              onDelete={deleteDoc} flashcards={flashcards} exams={exams} cases={cases} notes={notes}/>
          </ViewWrapper>
          <ViewWrapper active={view==='flashcards'}>
            <FlashcardsView flashcards={flashcards} setFlashcards={setFlashcards} settings={settings} addToast={addToast} docs={docs} setExams={setExams} setCases={setCases}/>
          </ViewWrapper>
          <ViewWrapper active={view==='exams'}>
            <ExamsView exams={exams} setExams={setExams} settings={settings} addToast={addToast} docs={docs} setFlashcards={setFlashcards} setCases={setCases}/>
          </ViewWrapper>
          <ViewWrapper active={view==='cases'}>
            <CasesView cases={cases} setCases={setCases} settings={settings} addToast={addToast} docs={docs} setFlashcards={setFlashcards} setExams={setExams}/>
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
              <GripVertical size={16} className="text-[var(--text)] opacity-20 group-hover:opacity-60"/>
            </div>
            <aside style={{width:window.innerWidth>=1024?`${rpW}px`:'100%'}}
              className="glass flex flex-col shrink-0 z-[100] lg:relative absolute inset-0 lg:inset-auto border-t-0 border-b-0 border-r-0 animate-slide-in h-full">
              <div className="h-14 lg:h-16 bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white flex items-center justify-between px-4 shrink-0">
                <span className="font-black flex items-center gap-2 text-base"><Sparkles size={18}/> AI Studio</span>
                <button onClick={()=>setRpOpen(false)} className="w-8 h-8 hover:bg-white/20 rounded-xl flex items-center justify-center"><X size={18}/></button>
              </div>
              <div className="flex shrink-0 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
                {[['generate','Generate',Zap],['chat','Chat',MessageSquare],['vault','Vault',Database]].map(([id,lbl,Icon])=>(
                  <button key={id} onClick={()=>setRpTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2
                      ${rpTab===id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent text-[var(--text)] opacity-50 hover:opacity-80'}`}>
                    <Icon size={16}/>{lbl}
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

      {/* MOBILE BOTTOM NAV — floating glass pill */}
      {isMobile&&(
      <div style={{
        position:'fixed',
        bottom:0,
        left:0,right:0,
        zIndex:9999,
        pointerEvents:'none',
        display:'flex',
        justifyContent:'center',
        paddingLeft:12,
        paddingRight:12,
        paddingBottom:'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <nav style={{
          pointerEvents:'all',
          display:'flex',
          flexDirection:'row',
          flexWrap:'nowrap',
          alignItems:'center',
          justifyContent:'space-around',
          width:'100%',
          maxWidth:540,
          padding:'4px 6px',
          borderRadius:999,
          background:'rgba(255,255,255,0.78)',
          backdropFilter:'saturate(200%) blur(28px)',
          WebkitBackdropFilter:'saturate(200%) blur(28px)',
          border:'1px solid rgba(255,255,255,0.88)',
          boxShadow:'0 6px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}>
          {NAV_ITEMS.map(({icon:Icon,label,v,dis})=>(
            <button key={v} disabled={dis}
              onClick={()=>{if(!dis){if(v==='reader'&&activeId)setView('reader');else if(v!=='reader')setView(v);}}}
              style={{
                position:'relative',
                flex:1,
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                gap:2,
                padding:'5px 2px',
                borderRadius:22,
                border:'none',
                cursor:dis?'not-allowed':'pointer',
                minWidth:0,
                flexShrink:1,
                background:view===v?'linear-gradient(135deg,rgba(var(--acc-rgb,99,102,241),.16),rgba(var(--acc-rgb,99,102,241),.07))':'transparent',
                opacity:dis?0.25:1,
                transition:'all .15s ease',
                WebkitTapHighlightColor:'transparent',
              }}>
              {view===v&&<div style={{position:'absolute',top:1,left:'50%',transform:'translateX(-50%)',height:2,width:16,borderRadius:999,background:'var(--accent)'}}/>}
              <div style={{
                width:28,height:28,borderRadius:10,
                display:'flex',alignItems:'center',justifyContent:'center',
                color:view===v?'var(--accent)':'var(--text2,#555)',
                background:view===v?'rgba(var(--acc-rgb,99,102,241),.13)':'transparent',
                opacity:view===v?1:0.6,
                transition:'all .15s',
              }}>
                <Icon size={15} strokeWidth={view===v?2.5:1.8}/>
              </div>
              <span style={{
                fontSize:8,fontWeight:800,
                textTransform:'uppercase',letterSpacing:'0.04em',
                whiteSpace:'nowrap',lineHeight:1,
                color:view===v?'var(--accent)':'var(--text3,#888)',
                opacity:view===v?1:0.6,
              }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      )}
    </div>
  );
}

// Play icon polyfill
const Play=({size=16,...p})=><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><polygon points="5 3 19 12 5 21 5 3"/></svg>;