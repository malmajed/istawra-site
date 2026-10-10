'use strict';
(() => {
  const data = JSON.parse(document.getElementById('inv-data').textContent);
  const radios = [...document.querySelectorAll('input[name="investor-stage"]')];
  const status = document.getElementById('inv-status');
  function currentStages() {
    return data.stage_overrides[routeSelect.value] || data.stages;
  }
  function renderStages() {
    for (const stage of currentStages()) {
      for (const field of ['title', 'intro', 'decision']) document.getElementById('inv-' + field + '-' + stage.id).textContent = stage[field];
      document.getElementById('inv-label-' + stage.id).textContent = stage.title;
      for (const field of ['questions', 'evidence']) {
        const list = document.createElement('ul');
        list.replaceChildren(...stage[field].map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
        document.getElementById('inv-' + field + '-' + stage.id).replaceChildren(list);
      }
    }
  }
  function updatePrivateEquity() {
    document.getElementById('inv-pe').hidden = routeSelect.value !== 'private-equity';
    document.getElementById('inv-pe-origin').textContent = data.private_equity.origin[originSelect.value] || '';
  }
  function updateSummary() {
    updatePrivateEquity();
    for (const id of Object.keys(data.ecosystem)) document.getElementById('inv-eco-' + id).hidden = routeSelect.value !== id;
    const route = data.routes.find(r => r.id === routeSelect.value);
    const origin = data.origins.find(o => o.id === originSelect.value);
    const stage = currentStages().find(s => s.id === radios.find(r => r.checked).value);
    document.getElementById('inv-summary').textContent = route && origin
      ? [route.title, origin.title, stage.title].join(' · ') : data.summary_pending;
    document.getElementById('inv-summary-focus').textContent = route && origin ? route.output + ' ' + origin.focus : '';
  }
  function selectStage() {
    renderStages();
    const active = radios.find(r => r.checked).value;
    for (const stage of data.stages) document.getElementById(`inv-${stage.id}`).hidden = stage.id !== active;
    status.textContent = '';
    updateSummary();
  }
  const routeSelect = document.getElementById('inv-route');
  const originSelect = document.getElementById('inv-origin');
  function updateBriefAvailability() {
    document.getElementById('inv-download').disabled = !(routeSelect.value && originSelect.value);
    updateSummary();
  }
  originSelect.addEventListener('change', () => {
    const origin = data.origins.find(o => o.id === originSelect.value);
    document.getElementById('inv-origin-result').hidden = !origin;
    status.textContent = '';
    updateBriefAvailability();
    if (!origin) return;
    document.getElementById('inv-origin-focus').textContent = origin.focus;
    document.getElementById('inv-origin-questions').replaceChildren(...origin.questions.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  });
  routeSelect.addEventListener('change', () => {
    const route = data.routes.find(r => r.id === routeSelect.value);
    document.getElementById('inv-route-result').hidden = !route;
    updateBriefAvailability();
    status.textContent = '';
    if (!route) { selectStage(); return; }
    document.getElementById('inv-route-title').textContent = route.title;
    document.getElementById('inv-route-purpose').textContent = route.purpose;
    document.getElementById('inv-route-output').textContent = data.route_output + ': ' + route.output;
    const list = document.getElementById('inv-route-evidence');
    list.replaceChildren(...route.evidence.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    radios.forEach(r => { r.checked = r.value === route.start; });
    selectStage();
  });
  radios.forEach(r => r.addEventListener('change', selectStage));
  document.getElementById('inv-reset').addEventListener('click', () => {
    routeSelect.value = ''; originSelect.value = '';
    document.getElementById('inv-route-result').hidden = true;
    document.getElementById('inv-origin-result').hidden = true;
    document.getElementById('inv-capability').checked = false;
    radios.forEach((r, index) => { r.checked = index === 0; });
    selectStage(); updateBriefAvailability(); routeSelect.focus();
  });
  document.getElementById('inv-capability').addEventListener('change', () => { status.textContent = ''; });
  document.getElementById('inv-download').addEventListener('click', () => {
    const route = data.routes.find(r => r.id === routeSelect.value);
    const origin = data.origins.find(o => o.id === originSelect.value);
    if (!route || !origin) return;
    const stage = currentStages().find(s => s.id === radios.find(r => r.checked).value);
    const lines = [data.brief_title, '', data.origin_label + ': ' + origin.title, origin.focus, ...origin.questions.map(q => '- ' + q), '', data.route_label + ': ' + route.title, route.purpose, ...route.evidence.map(q => '- ' + q), data.route_output + ': ' + route.output, '', data.brief_stage + ': ' + stage.title, stage.intro, '', data.questions, ...stage.questions.map(q => '- ' + q), '', data.evidence, ...stage.evidence.map(q => '- ' + q), '', data.decision, stage.decision, '', data.commercial_body];
    const connections = data.ecosystem[route.id];
    if (connections) {
      lines.push('', data.ecosystem_heading);
      lines.push(data.connection_entry);
      for (const [party, purpose, question] of connections.incoming) lines.push('- ' + party + ': ' + purpose, question);
      lines.push('', data.connection_next);
      for (const [party, purpose, question] of connections.outgoing) lines.push('- ' + party + ': ' + purpose, question);
      lines.push('', data.connection_note);
    }
    if (route.id === 'private-equity') {
      const pe = data.private_equity;
      lines.push('', pe.title, pe.origin[origin.id]);
      for (const [title, question, items] of pe.phases) lines.push('', title, question, ...items.map(x => '- ' + x));
      lines.push('', pe.map_title, pe.entry);
      for (const [party, purpose, question] of pe.incoming) lines.push('- ' + party + ': ' + purpose, question);
      lines.push('', pe.exit);
      for (const [party, purpose, question] of pe.outgoing) lines.push('- ' + party + ': ' + purpose, question);
      lines.push('', pe.boundary, pe.role);
    }
    if (document.getElementById('inv-capability').checked) lines.push('', data.brief_extra, ...data.extra_questions.map(q => '- ' + q), data.capability_body);
    lines.push('', data.brief_footer);
    // Formatted, printable brief (HTML) instead of plain text. Nothing is sent or stored.
    const lang = document.documentElement.lang || 'en', rtl = lang.startsWith('ar');
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const blocks = []; let cur = [];
    for (const l of lines) { if (l === '') { if (cur.length) blocks.push(cur); cur = []; } else cur.push(l); }
    if (cur.length) blocks.push(cur);
    const title = blocks.length ? blocks.shift()[0] : data.brief_title;
    const body = blocks.map(b => {
      let html = '', list = [];
      const flush = () => { if (list.length) { html += '<ul>' + list.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'; list = []; } };
      b.forEach((l, i) => {
        if (l.startsWith('- ')) { list.push(l.slice(2)); return; }
        flush();
        html += (i === 0 ? '<h2>' : '<p>') + esc(l) + (i === 0 ? '</h2>' : '</p>');
      });
      flush();
      return '<section>' + html + '</section>';
    }).join('');
    const date = new Date().toLocaleDateString(rtl ? 'ar-SA' : 'en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
    const doc = '<!doctype html><html lang="' + esc(lang) + '" dir="' + (rtl ? 'rtl' : 'ltr') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title>'
      + '<style>body{margin:0;background:#FAF9F5;color:#1F2D3D;font:16px/1.6 "IBM Plex Sans","IBM Plex Sans Arabic","Segoe UI",Tahoma,Arial,sans-serif}'
      + '.page{max-width:760px;margin:0 auto;padding:48px 36px 60px;background:#fff;border-left:1px solid #DCE0E2;border-right:1px solid #DCE0E2;min-height:100vh;box-sizing:border-box}'
      + '.mark{display:flex;gap:2px;margin-bottom:6px}.mark span{width:20px;height:24px;background:#1F2D3D;color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center}.mark span:first-child{background:#0F6F6F}'
      + '.sub{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#5A6675;margin:0 0 36px}'
      + 'h1{font-size:28px;line-height:1.3;margin:0 0 6px}.date{color:#5A6675;font-size:13px;margin:0 0 30px}'
      + 'section{border-top:1px solid #DCE0E2;padding:18px 0 6px}h2{font-size:17px;margin:0 0 8px;color:#0F6F6F}p{margin:0 0 8px}'
      + 'ul{margin:4px 0 10px;padding-' + (rtl ? 'right' : 'left') + ':20px}li{margin:0 0 4px}'
      + 'footer{border-top:2px solid #1F2D3D;margin-top:30px;padding-top:12px;font-size:13px;color:#5A6675}'
      + '.print{position:fixed;top:16px;' + (rtl ? 'left' : 'right') + ':16px;background:#0F6F6F;color:#fff;border:0;padding:10px 16px;font:inherit;font-size:14px;cursor:pointer}'
      + '@media print{body{background:#fff}.page{border:0;padding:0}.print{display:none}}</style></head><body>'
      + '<button class="print" onclick="window.print()">' + (rtl ? 'طباعة أو حفظ PDF' : 'Print or save as PDF') + '</button>'
      + '<div class="page"><div class="mark" aria-label="Istawra Services">' + 'ISTAWRA'.split('').map(c => '<span>' + c + '</span>').join('') + '</div><p class="sub">Istawra Services</p>'
      + '<h1>' + esc(title) + '</h1><p class="date">' + esc(date) + '</p>' + body
      + '<footer>istawra.com · engage@istawra.com</footer></div></body></html>';
    const url = URL.createObjectURL(new Blob([doc], {type: 'text/html;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = `istawra-investor-brief-${lang}.html`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = data.downloaded;
  });
  selectStage();
  document.getElementById('inv-profile').hidden = false;
  document.getElementById('inv-controls').hidden = false;
  document.getElementById('inv-brief').hidden = false;
})();
