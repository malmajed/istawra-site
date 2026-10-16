'use strict';
(() => {
 const node=document.getElementById('iv-data'); if(!node)return;
 const d=JSON.parse(node.textContent), root=document.querySelector('.iv-refresh');
 let route=d.routes[0].id, origin=null, stage=d.routes[0].start;
 const summary=document.getElementById('iv-summary'), download=document.getElementById('iv-download'), extra=document.getElementById('iv-capability'), status=document.getElementById('iv-download-status');
 function update(){
  for(const [kind,value] of [['route',route],['origin',origin],['stage',stage]]){
   root.querySelectorAll('[data-'+kind+']').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[kind]===value)));
   root.querySelectorAll('[data-'+kind+'-panel]').forEach(p=>{p.hidden=p.dataset[kind+'Panel']!==value;});
  }
  root.querySelectorAll('[data-map]').forEach(p=>{p.hidden=p.dataset.map!==route;});
  root.querySelector('[data-pe]').hidden=route!=='private-equity';
  const r=d.routes.find(r=>r.id===route),o=d.origins.find(o=>o.id===origin),s=d.stages.find(s=>s.id===stage);
  summary.textContent=o?[r.title,o.title,s.title].join(' · '):r.title+' — '+d.summary_pending;
  download.disabled=!o;status.textContent='';
 }
 for(const kind of ['route','origin','stage'])root.querySelectorAll('[data-'+kind+']').forEach(b=>b.addEventListener('click',()=>{
  if(kind==='route'){route=b.dataset.route;stage=d.routes.find(r=>r.id===route).start;}
  else if(kind==='origin')origin=b.dataset.origin; else stage=b.dataset.stage;
  update();
 }));
 document.getElementById('iv-reset').addEventListener('click',()=>{route=d.routes[0].id;origin=null;stage=d.routes[0].start;extra.checked=false;update();});
 download.addEventListener('click',()=>{
  const r=d.routes.find(r=>r.id===route),o=d.origins.find(o=>o.id===origin),s=d.stages.find(s=>s.id===stage);if(!o)return;
  const e=route==='private-equity'?d.private_equity:d.ecosystem[route];
  const sections=[d.brief_title,r.title,r.purpose,d.route_output+': '+r.output,o.title,o.focus,...o.questions,d.brief_stage+': '+s.title,s.intro,d.questions,...s.questions,d.evidence,...s.evidence,d.decision+': '+s.decision,d.connection_entry,...e.incoming.map(x=>x.join(' — ')),d.connection_next,...e.outgoing.map(x=>x.join(' — ')),d.connection_note];
  if(extra.checked)sections.push(d.brief_extra,...d.extra_questions);
  sections.push(d.commercial_body,d.capability_body,d.brief_footer,'engage@istawra.com');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+sections.join('\n\n')],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Istawra-Investor-Discussion-'+document.documentElement.lang+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=d.downloaded;
 });
 update();root.querySelectorAll('.iv-controls,.iv-brief-controls').forEach(el=>{el.hidden=false;});
})();
