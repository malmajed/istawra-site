'use strict';
// All stages remain readable without JavaScript. Native buttons support Enter/Space.
document.querySelectorAll('.pi-explorer').forEach(explorer => {
  const controls = explorer.querySelector('.pi-stage-controls');
  const buttons = [...explorer.querySelectorAll('[data-stage]')];
  const panels = [...explorer.querySelectorAll('.pi-stage')];
  if (!controls || !buttons.length || buttons.length !== panels.length) return;
  function select(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  select(0);
  controls.hidden = false;
});
