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
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = `istawra-investor-brief-${document.documentElement.lang}.txt`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = data.downloaded;
  });
  selectStage();
  document.getElementById('inv-profile').hidden = false;
  document.getElementById('inv-controls').hidden = false;
  document.getElementById('inv-brief').hidden = false;
})();
