(() => {
  const nodes = [...document.querySelectorAll('[data-node]')];
  const panels = [...document.querySelectorAll('[data-node-panel]')];
  const steps = [...document.querySelectorAll('[data-step]')];
  const stages = [...document.querySelectorAll('.journey-panel')];
  const selectNode = button => {
    nodes.forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.nodePanel !== button.dataset.node; });
    document.querySelectorAll('[data-edge]').forEach(edge => edge.classList.toggle('active', edge.dataset.edge === button.dataset.node));
  };
  const selectStep = button => {
    steps.forEach(step => step.setAttribute('aria-pressed', String(step === button)));
    stages.forEach(panel => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
  };
  nodes.forEach(button => button.addEventListener('click', () => selectNode(button)));
  steps.forEach(button => button.addEventListener('click', () => selectStep(button)));
  if (nodes.length) selectNode(nodes[0]);
  if (steps.length) selectStep(steps[0]);
  // Existing links to a specific stage still reveal that stage.
  const revealStage = () => {
    const button = steps.find(step => '#' + step.getAttribute('aria-controls') === location.hash);
    if (button) { selectStep(button); document.getElementById(location.hash.slice(1)).scrollIntoView(); }
  };
  window.addEventListener('hashchange', revealStage);
  revealStage();
})();
