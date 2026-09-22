/* Progressive reading tools. All source text remains available without JavaScript. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const file = location.pathname.split('/').pop() || 'index.html';
  const longPages = ['approach.html','advisory.html','academy.html','oversight-is-a-discipline.html'];
  if (location.port === '4186') document.body.classList.add('private-workspace');
  if (!longPages.includes(file)) return;
  main.classList.add('long-reading');
  // The original paper uses several sibling headings inside one article.
  // Give each chapter its own semantic section before applying reading controls.
  const parents = new Set([...main.querySelectorAll('h2')].map(h=>h.parentElement));
  parents.forEach(parent=>{
    if (parent.querySelectorAll(':scope > h2').length < 2) return;
    let chapter;
    [...parent.childNodes].forEach(node=>{
      if(node.nodeType===1 && node.tagName==='H2'){
        chapter=document.createElement('section');parent.insertBefore(chapter,node);
      }
      if(chapter)chapter.append(node);
    });
  });
  const headings = [...main.querySelectorAll('h2')];
  const chapters = [];
  headings.forEach((h, i) => {
    if (!h.id) h.id = `chapter-${i + 1}`;
    const section = h.closest('section');
    if (!section || section.querySelector('h1') || section.classList.contains('band') || section.classList.contains('reading-chapter')) return;
    section.classList.add('reading-chapter');
    const label = document.createElement('span');
    label.className = 'chapter-label'; label.textContent = `CHAPTER ${String(chapters.length + 1).padStart(2,'0')}`;
    section.prepend(label); chapters.push(section);
    // Fold only a section whose heading is a direct child, preserving nested layouts.
    if (section.textContent.length > 1100) {
      let branch=h;
      while(branch.parentElement!==section){
        let following=branch.nextSibling, length=0;
        while(following){length+=(following.textContent||'').trim().length;following=following.nextSibling;}
        if(length>200)break;
        branch=branch.parentElement;
      }
      const after = []; let node = branch.nextSibling;
      while (node) { after.push(node); node = node.nextSibling; }
      const intro = after.find(n => n.nodeType === 1 && n.tagName === 'P');
      const detail = document.createElement('details');
      const summary = document.createElement('summary'); summary.textContent = 'Explore the full chapter';
      detail.append(summary);
      after.forEach(n => { if (n !== intro) detail.append(n); });
      if(detail.textContent.replace(summary.textContent,'').trim().length>80)branch.parentElement.append(detail);
      else [...detail.childNodes].filter(n=>n!==summary).forEach(n=>branch.parentElement.append(n));
    }
  });
  main.querySelectorAll('h3').forEach(h => {
    const parent = h.parentElement;
    if (parent.tagName === 'DIV' && !parent.querySelector('h1,h2') && parent.textContent.length < 1700) parent.classList.add('method-card');
  });
  if (headings.length > 1) {
    const nav = document.createElement('nav');nav.className = 'reading-map';nav.setAttribute('aria-label','On this page');
    nav.style.display = 'block';
    const title = document.createElement('strong');title.textContent = 'Explore this page';nav.append(title);
    const ol = document.createElement('ol');
    headings.forEach(h => { const li=document.createElement('li'),a=document.createElement('a');a.href=`#${h.id}`;a.textContent=h.innerText.replace(/\s+/g,' ').trim();li.append(a);ol.append(li); });
    nav.append(ol);
    const actions=document.createElement('div');actions.className='reading-actions';
    for (const [text,open] of [['Read all chapters',true],['Show summaries',false]]) {
      const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>main.querySelectorAll('.reading-chapter details').forEach(d=>d.open=open));actions.append(b);
    }
    nav.append(actions);
    let first=main.querySelector('h1');
    if(first){while(first.parentElement!==main)first=first.parentElement;first.after(nav);}else main.prepend(nav);
  }
  function revealAnchor(){
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target)return;
    let p=target.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}
  }
  addEventListener('hashchange',revealAnchor);revealAnchor();
  let printState=[];
  addEventListener('beforeprint',()=>{printState=[...main.querySelectorAll('details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);});
  addEventListener('afterprint',()=>printState.forEach(([d,open])=>d.open=open));
  const back=document.createElement('a');back.href='#main-content';back.className='back-top';back.textContent='Back to the beginning ↑';main.append(back);
})();
