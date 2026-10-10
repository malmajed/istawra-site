'use strict';
(() => {
  document.querySelectorAll('.visual-experience').forEach(root => {
    const controls=root.querySelector('.viz-controls');
    const buttons=[...root.querySelectorAll('[data-viz-index]')];
    const panels=[...root.querySelectorAll('.viz-panel')];
    function select(index) {
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      panels.forEach((p,i)=>{p.hidden=i!==index;});
    }
    buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index)));
    controls.hidden=false;root.dataset.enhanced='true';select(0);
    function revealHash() {
      const i=panels.findIndex(p=>'#'+p.id===location.hash);
      if(i>=0){select(i);panels[i].scrollIntoView();}
    }
    window.addEventListener('hashchange',revealHash);revealHash();
  });
  // Bridge the visual investor route to the existing selector and its own logic.
  document.querySelectorAll('[data-investor-route]').forEach(link=>link.addEventListener('click',()=>{
    const select=document.getElementById('inv-route');
    if(select){select.value=link.dataset.investorRoute;select.dispatchEvent(new Event('change',{bubbles:true}));}
  }));
  const filter=document.getElementById('page-filter');
  if(filter){
    const rows=[...document.querySelectorAll('.visual-directory li')];
    const status=document.getElementById('filter-status');
    const ar=document.documentElement.lang==='ar';
    const normalize=s=>s.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا');
    function update(){const q=normalize(filter.value.trim());let count=0;rows.forEach(row=>{row.hidden=!normalize(row.textContent).includes(q);if(!row.hidden)count++;});status.textContent=ar?`${count} من ${rows.length} صفحة`:`${count} of ${rows.length} pages`;}
    filter.closest('.directory-filter').hidden=false;filter.addEventListener('input',update);update();
  }
  // Email remains the only enquiry channel. Nothing is submitted or stored here.
  const address=document.querySelector('.menu-email,.pi-email,.home-email');
  if(address){
    const ar=document.documentElement.lang==='ar';
    const button=document.createElement('button');button.type='button';button.className='copy-email';button.textContent=ar?'نسخ البريد':'Copy email';
    const status=document.createElement('span');status.className='copy-status';status.setAttribute('role','status');
    button.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText('engage@istawra.com');status.textContent=ar?'تم النسخ':'Copied';}
      catch{status.textContent=ar?'انسخ العنوان الظاهر يدويًا.':'Please select and copy the visible address.';}
    });
    address.after(button,status);
  }
})();
