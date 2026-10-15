# Working solutions (Dr Ines, written from the question text; all pass in-app)

Each block is the exact code run in the in-app worker. Includes L5/L6 exercises and L7 code projects p7b, p7c, p7e, p7f, p7g.

```js
// Ines's own solutions, written from the question text only.
const S = {
gradStep:`function gradStep(w, xs, ys, lr) {
  if (!xs.length) return w;
  const g = xs.reduce((a, x, i) => a + 2 * (w * x - ys[i]) * x, 0) / xs.length;
  return w - lr * g;
}`,
countParams:`function countParams(sizes){ let t=0; for(let i=1;i<sizes.length;i++) t+=sizes[i-1]*sizes[i]+sizes[i]; return t; }`,
cosine:`function cosine(a,b){ const dot=a.reduce((s,x,i)=>s+x*b[i],0); const na=Math.hypot(...a), nb=Math.hypot(...b); if(!na||!nb) return 0; return Math.round(dot/(na*nb)*1e4)/1e4; }`,
softmax:`function softmax(xs){ if(!xs.length) return []; const m=Math.max(...xs); const e=xs.map(x=>Math.exp(x-m)); const z=e.reduce((a,b)=>a+b,0); return e.map(v=>Math.round(v/z*1e4)/1e4); }`,
attend:`function attend(q, keys, values){
  const d=Math.sqrt(q.length);
  const s=keys.map(k=>k.reduce((a,x,i)=>a+x*q[i],0)/d);
  const m=Math.max(...s); const e=s.map(v=>Math.exp(v-m)); const z=e.reduce((a,b)=>a+b,0);
  const out=values[0].map((_,j)=>e.reduce((a,w,i)=>a+w/z*values[i][j],0));
  return out.map(v=>Math.round(v*1e4)/1e4);
}`,
approxParams:`function approxParams(L,d,V){ return 12*L*d*d+V*d; }`,
trainingDays:`function trainingDays(params,tokens,gpus,flopsPerGpu,util){ const secs=6*params*tokens/(gpus*flopsPerGpu*util); return Math.round(secs/86400*100)/100; }`,
dedupe:`function dedupe(texts){ const seen=new Set(); return texts.filter(t=>{ const k=t.trim().replace(/\\s+/g,' ').toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; }); }`,
loraTrainable:`function loraTrainable(shapes,r){ return shapes.reduce((a,[o,i])=>a+r*(o+i),0); }`,
qUpdate:`function qUpdate(q,r,mn,a,g){ return Math.round((q+a*(r+g*mn-q))*1e4)/1e4; }`,
prf:`function prf(labels,preds){ let tp=0,fp=0,fn=0; labels.forEach((l,i)=>{ const p=preds[i]; if(p&&l)tp++; else if(p&&!l)fp++; else if(!p&&l)fn++; }); const P=tp+fp?tp/(tp+fp):0, R=tp+fn?tp/(tp+fn):0, F=P+R?2*P*R/(P+R):0; const r=x=>Math.round(x*1000)/1000; return {precision:r(P),recall:r(R),f1:r(F)}; }`,
weightMemoryGB:`function weightMemoryGB(p,b){ return Math.round(p*b/8/1e9*100)/100; }`,
kvCacheGB:`function kvCacheGB(L,h,d,t,b){ return Math.round(2*L*h*d*t*b/1e9*100)/100; }`,
rrf:`function rrf(rankings,k){ const s=new Map(); for(const list of rankings) list.forEach((id,i)=>s.set(id,(s.get(id)||0)+1/(k+i+1))); return [...s.keys()].sort((a,b)=>s.get(b)-s.get(a)||a.localeCompare(b)); }`,
reachable:`function reachable(edges,start,maxHops){ const adj=new Map(); for(const [a,b] of edges){ if(!adj.has(a))adj.set(a,new Set()); if(!adj.has(b))adj.set(b,new Set()); adj.get(a).add(b); adj.get(b).add(a);} const seen=new Set([start]); let fr=[start]; for(let h=0;h<maxHops;h++){ const nx=[]; for(const n of fr) for(const m of (adj.get(n)||[])) if(!seen.has(m)){seen.add(m);nx.push(m);} fr=nx; } seen.delete(start); return [...seen].sort(); }`,
compact:`function compact(messages,budget){ let used=messages.reduce((a,m)=>m.role==='system'?a+m.tokens:a,0); const keep=new Set(messages.flatMap((m,i)=>m.role==='system'?[i]:[])); for(let i=messages.length-1;i>=0;i--){ if(messages[i].role==='system')continue; if(used+messages[i].tokens>budget)break; used+=messages[i].tokens; keep.add(i);} return [...keep].sort((a,b)=>a-b); }`,
repeatedHandoffs:`function repeatedHandoffs(log,limit){ const c={}; for(const {from,to} of log){ const k=from+'->'+to; c[k]=(c[k]||0)+1;} return Object.keys(c).filter(k=>c[k]>limit).sort(); }`,
decide:`function decide(a,p){ if(!p.allowDomains.includes(a.domain)) return 'deny'; if(p.confirmTypes.includes(a.type)||a.irreversible) return 'confirm'; return 'allow'; }`,
latencyReport:`function latencyReport(stages,budgetMs){ const total=stages.reduce((a,s)=>a+s.ms,0); let slowest=null,mx=-Infinity; for(const s of stages) if(s.ms>mx){mx=s.ms;slowest=s.name;} return {total,remaining:budgetMs-total,slowest,ok:total<=budgetMs}; }`,
weightedVote:`function weightedVote(c){ const t=new Map(); for(const {answer,score} of c) t.set(answer,(t.get(answer)||0)+score); let best=null,bs=-Infinity; for(const [a,s] of t) if(s>bs){bs=s;best=a;} return best; }`,
kvCacheBytes:`function kvCacheBytes(c){ return 2*c.layers*c.kvHeads*c.headDim*c.seqLen*c.batch*c.bytesPerElem; }`,
marginOfError:`function marginOfError(p,n){ if(n<=0) return null; return Math.round(1.96*Math.sqrt(p*(1-p)/n)*1e4)/1e4; }`,
// L7 code projects
summariseTrace:`function summariseTrace(events){
  let toolCalls=0,toolFailures=0,totalMs=0,finished=false; const cites=new Set(); const per={};
  for(const e of events){ totalMs+=e.ms||0;
    if(e.type==='tool_call'){toolCalls++; per[e.tool]=(per[e.tool]||0)+1;}
    else if(e.type==='tool_result'&&e.ok===false) toolFailures++;
    else if(e.type==='final'){finished=true; (e.citations||[]).forEach(c=>cites.add(c));}
  }
  return {toolCalls,toolFailures,uniqueCitations:[...cites].sort(),totalMs,finished,repeatedTools:Object.keys(per).filter(t=>per[t]>=2).sort()};
}`,
rrfFuse:`function rrfFuse(rankings,k,topN){
  const s=new Map();
  for(const list of rankings){ const seen=new Set(); let rank=0; for(const id of list){ rank++; if(seen.has(id)) continue; seen.add(id); s.set(id,(s.get(id)||0)+1/(k+rank)); } }
  let out=[...s].map(([id,score])=>({id,score:Math.round(score*1e6)/1e6})).sort((a,b)=>b.score-a.score||(a.id<b.id?-1:1));
  return topN>0?out.slice(0,topN):out;
}`,
guardRun:`function guardRun(requests,limits){
  const allowedT=[]; let used=0; const out=[];
  for(const r of requests){
    if(used+r.tokens>limits.maxTokens){out.push('deny-budget');continue;}
    const recent=allowedT.filter(t=>t>r.t-60&&t<=r.t).length;
    if(recent>=limits.maxPerMinute){out.push('deny-rate');continue;}
    allowedT.push(r.t); used+=r.tokens; out.push('allow');
  }
  return out;
}`,
routeTask:`function routeTask(needs,agents){
  if(!needs.length) return {agent:null,reason:'no-needs'};
  const cap=agents.filter(a=>needs.every(n=>a.skills.includes(n)));
  if(!cap.length) return {agent:null,reason:'no-capable-agent'};
  const free=cap.filter(a=>a.load<a.maxLoad);
  if(!free.length) return {agent:null,reason:'all-busy'};
  free.sort((a,b)=>a.load-b.load||(a.name<b.name?-1:1));
  return {agent:free[0].name,reason:'ok'};
}`,
scoreEval:`function scoreEval(cases,passThreshold){
  const norm=s=>String(s).toLowerCase().trim().replace(/\\s+/g,' ');
  const byCategory={}; const failures=[]; let passed=0;
  for(const c of cases){
    const exp=(Array.isArray(c.expected)?c.expected:[c.expected]).map(norm);
    const ok=!(c.actual==null||c.actual==='')&&exp.includes(norm(c.actual));
    const b=(byCategory[c.category]??={total:0,passed:0}); b.total++; if(ok){b.passed++;passed++;} else failures.push(c.id);
  }
  const total=cases.length; const passRate=total?Math.round(passed/total*1000)/1000:0;
  const zero=Object.values(byCategory).some(b=>b.passed===0);
  return {total,passed,passRate,byCategory,failures:failures.sort(),verdict:(total>0&&passRate>=passThreshold&&!zero)?'ship':'hold'};
}`,
};

```
