import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Network, GitBranch, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function KnowledgeGraphView({ flashcards, exams, cases, docs, settings }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovering, setHovering] = useState(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, mastered: 0, gaps: 0 });

  useEffect(() => {
    const nodeMap = {};
    const edgeSet = new Set();
    const edgeList = [];
    const addNode = (id, label, type, docId, masteryData) => {
      if (!nodeMap[id]) {
        nodeMap[id] = { id, label, type, docId, stability: masteryData?.stability || 0, reps: masteryData?.reps || 0, lapses: masteryData?.lapses || 0, x: Math.random() * 600 + 100, y: Math.random() * 400 + 100, vx: 0, vy: 0, r: 20 };
      }
    };
    flashcards.forEach(set => {
      const setId = `set_${set.id}`;
      addNode(setId, set.title?.slice(0, 28) || 'Cards', 'deck', set.docId);
      set.cards?.forEach((card, i) => {
        if (i >= 20) return;
        const cid = `card_${set.id}_${i}`;
        addNode(cid, (card.q || '').split(' ').slice(0, 5).join(' '), 'card', set.docId, card);
        const ek = `${setId}__${cid}`;
        if (!edgeSet.has(ek)) { edgeSet.add(ek); edgeList.push({ from: setId, to: cid, strength: 0.3 }); }
      });
    });
    exams.forEach(ex => {
      const exId = `exam_${ex.id}`;
      addNode(exId, ex.title?.slice(0, 28) || 'Exam', 'exam', ex.docId);
      ex.questions?.slice(0, 10).forEach((q, i) => {
        const qid = `q_${ex.id}_${i}`;
        addNode(qid, q.q?.split(' ').slice(0, 5).join(' ') || `Q${i+1}`, 'question', ex.docId);
        const ek = `${exId}__${qid}`;
        if (!edgeSet.has(ek)) { edgeSet.add(ek); edgeList.push({ from: exId, to: qid, strength: 0.25 }); }
      });
    });
    const nodeList = Object.values(nodeMap);
    nodeList.forEach(a => nodeList.forEach(b => {
      if (a.id >= b.id) return;
      if (a.docId && a.docId === b.docId && a.type !== b.type) {
        const ek = `${a.id}__${b.id}_cross`;
        if (!edgeSet.has(ek) && Math.random() < 0.12) { edgeSet.add(ek); edgeList.push({ from: a.id, to: b.id, strength: 0.1, cross: true }); }
      }
    }));
    setStats({ nodes: nodeList.length, edges: edgeList.length, mastered: nodeList.filter(n => n.stability >= 10).length, gaps: nodeList.filter(n => n.reps > 0 && n.lapses > 1).length });
    setNodes(nodeList); setEdges(edgeList); nodesRef.current = nodeList; edgesRef.current = edgeList;
  }, [flashcards, exams, cases]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const ns = nodesRef.current.map(n => ({ ...n }));
    const es = edgesRef.current;
    const idxMap = {}; ns.forEach((n, i) => { idxMap[n.id] = i; n.x = n.x || W/2+(Math.random()-.5)*300; n.y = n.y || H/2+(Math.random()-.5)*300; });
    const TC = { deck:'rgba(var(--acc-rgb,99,102,241),1)', card:'rgba(var(--acc-rgb,99,102,241),.6)', exam:'#10b981', question:'#06b6d4', case:'#a855f7' };
    let frame = 0;
    const sim = () => {
      for (let i=0;i<ns.length;i++) for (let j=i+1;j<ns.length;j++) { const dx=ns[j].x-ns[i].x,dy=ns[j].y-ns[i].y,d=Math.sqrt(dx*dx+dy*dy)||1,f=1500/(d*d),fx=f*dx/d,fy=f*dy/d; ns[i].vx-=fx;ns[i].vy-=fy;ns[j].vx+=fx;ns[j].vy+=fy; }
      es.forEach(e => { const a=ns[idxMap[e.from]],b=ns[idxMap[e.to]]; if(!a||!b)return; const dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-100)*0.02*(e.strength||0.3),fx=f*dx/d,fy=f*dy/d; a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy; });
      ns.forEach(n => { n.vx+=(W/2-n.x)*0.002;n.vy+=(H/2-n.y)*0.002;n.vx*=0.85;n.vy*=0.85;n.x+=n.vx;n.y+=n.vy;n.x=Math.max(30,Math.min(W-30,n.x));n.y=Math.max(30,Math.min(H-30,n.y)); });
      ctx.clearRect(0,0,W,H);
      es.forEach(e => { const a=ns[idxMap[e.from]],b=ns[idxMap[e.to]]; if(!a||!b)return; ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y); ctx.strokeStyle=e.cross?'rgba(var(--acc-rgb,99,102,241),.08)':'rgba(var(--acc-rgb,99,102,241),.18)'; ctx.lineWidth=e.cross?0.5:1;ctx.stroke(); });
      ns.forEach(n => {
        const r=n.type==='deck'||n.type==='exam'?14:8; const isSel=n.id===selected; const isHov=n.id===hovering;
        if(n.stability>=10){ctx.beginPath();ctx.arc(n.x,n.y,r+5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,.15)';ctx.fill();}
        else if(n.lapses>1){ctx.beginPath();ctx.arc(n.x,n.y,r+5,0,Math.PI*2);ctx.fillStyle='rgba(239,68,68,.15)';ctx.fill();}
        ctx.beginPath();ctx.arc(n.x,n.y,isSel||isHov?r+3:r,0,Math.PI*2);ctx.fillStyle=TC[n.type]||'var(--accent)';
        if(isSel){ctx.shadowColor='var(--accent)';ctx.shadowBlur=15;}ctx.fill();ctx.shadowBlur=0;
        ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.5;ctx.stroke();
        if(n.type==='deck'||n.type==='exam'||isSel||isHov){ctx.font=`${isSel?'700':'500'} 10px DM Sans,system-ui`;ctx.fillStyle='var(--text)';ctx.textAlign='center';ctx.fillText(n.label?.slice(0,16)||'',n.x,n.y+r+12);}
      });
      frame++; if(frame<300) animRef.current=requestAnimationFrame(sim);
    };
    animRef.current=requestAnimationFrame(sim);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, edges, selected, hovering]);

  const handleClick = e => {
    const c = canvasRef.current; if(!c) return;
    const r = c.getBoundingClientRect(); const mx=e.clientX-r.left, my=e.clientY-r.top;
    const hit = nodesRef.current.find(n => Math.hypot(n.x-mx, n.y-my)<18);
    setSelected(hit?.id || null);
  };

  const selectedNode = nodes.find(n => n.id === selected);

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 gap-4">
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[{ label:'Concepts',val:stats.nodes,icon:Network,col:'var(--accent)' },{ label:'Links',val:stats.edges,icon:GitBranch,col:'#8b5cf6' },{ label:'Mastered',val:stats.mastered,icon:CheckCircle2,col:'var(--success)' },{ label:'Gaps',val:stats.gaps,icon:AlertCircle,col:'var(--danger)' }].map(({label,val,icon:Icon,col})=>(
          <div key={label} className="glass rounded-2xl p-3 text-center"><Icon size={16} className="mx-auto mb-1" style={{color:col}} /><div className="text-xl font-black" style={{color:col}}>{val}</div><div className="text-xs font-black uppercase tracking-widest opacity-40">{label}</div></div>
        ))}
      </div>
      <div className="flex-1 min-h-0 glass rounded-2xl overflow-hidden relative" style={{ border:'1px solid var(--border)' }}>
        {nodes.length===0 ? (
          <div className="empty-state h-full flex flex-col items-center justify-center"><div className="empty-icon"><Network size={40}/></div><p className="font-black text-lg mt-4">No knowledge graph yet</p><p className="text-sm opacity-40 mt-1">Generate flashcards or exams to build your graph</p></div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onClick={handleClick}
              onMouseMove={e => { const r=canvasRef.current?.getBoundingClientRect(); if(!r)return; const hit=nodesRef.current.find(n=>Math.hypot(n.x-(e.clientX-r.left),n.y-(e.clientY-r.top))<18); setHovering(hit?.id||null); }}
              style={{ display:'block' }} />
            <div className="absolute bottom-4 left-4 glass rounded-xl p-2 flex gap-3">
              {[['Deck','rgba(99,102,241,1)'],['Cards','rgba(99,102,241,.6)'],['Exam','#10b981'],['Question','#06b6d4']].map(([l,c])=>(
                <div key={l} className="flex items-center gap-1.5 text-xs opacity-70"><div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/><span>{l}</span></div>
              ))}
            </div>
            {selectedNode && (
              <div className="absolute top-4 right-4 glass rounded-2xl p-4 w-56 animate-scale-in" style={{ border:'1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-2"><p className="font-black text-sm">{selectedNode.label}</p><button onClick={()=>setSelected(null)} className="opacity-40 hover:opacity-100"><X size={12}/></button></div>
                <p className="text-xs opacity-50 capitalize mb-3">{selectedNode.type}</p>
                {selectedNode.stability > 0 && (<>
                  <div className="flex justify-between text-xs mb-1"><span className="opacity-40">Stability</span><span className="font-black">{selectedNode.stability?.toFixed(1)}d</span></div>
                  <div className="flex justify-between text-xs mb-1"><span className="opacity-40">Reviews</span><span className="font-black">{selectedNode.reps}</span></div>
                  <div className="flex justify-between text-xs mb-3"><span className="opacity-40">Lapses</span><span className="font-black" style={{color:selectedNode.lapses>0?'var(--danger)':'var(--text)'}}>{selectedNode.lapses||0}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(selectedNode.stability/30)*100)}%`}}/></div>
                </>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
