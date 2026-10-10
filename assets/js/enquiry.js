/* Contact page: prepares an email for the visitor to review, edit and send.
   - The form is hidden in the HTML and only shown once this script has started,
     so a visitor without JavaScript sees the plain email link instead.
   - Fields have no name attributes, so nothing can be submitted to the host or into the URL.
   - Nothing is sent, stored or tracked. The visitor chooses to open the mailto link. */
'use strict';
(() => {
  const form = document.getElementById('enquiry-form');
  const fallback = document.getElementById('enquiry-fallback');
  const preview = document.getElementById('enquiry-preview');
  const subjectOut = document.getElementById('eq-out-subject');
  const output = document.getElementById('eq-output');
  const mail = document.getElementById('eq-mail');
  const copy = document.getElementById('eq-copy');
  const status = document.getElementById('eq-status');
  if (!form || !preview || !subjectOut || !output || !mail || !copy) return; // keep the fallback

  const ar = document.documentElement.lang.toLowerCase().startsWith('ar');
  const L = ar
    ? { name: 'الاسم', org: 'الجهة', role: 'المنصب', decision: 'القرار أو النتيجة', time: 'الإطار الزمني', brand: 'استورى للخدمات', subject: 'الموضوع', copied: 'تم النسخ', manual: 'تعذّر النسخ التلقائي. حُدّد الموضوع ونص الرسالة معًا في المربع أدناه؛ انسخهما يدويًا.', manualLabel: 'الموضوع ونص الرسالة للنسخ اليدوي' }
    : { name: 'Name', org: 'Organisation', role: 'Role', decision: 'Decision or outcome', time: 'Timescale', brand: 'Istawra Services', subject: 'Subject', copied: 'Copied', manual: 'Automatic copying is not available. The subject and message are selected together in the box below; please copy them manually.', manualLabel: 'Subject and message for manual copying' };
  const val = id => (document.getElementById(id).value || '').trim();

  let manual = null;
  function refreshLink() {
    if (manual) manual.hidden = true;
    status.textContent = '';
    mail.href = 'mailto:engage@istawra.com?subject=' + encodeURIComponent(subjectOut.value) + '&body=' + encodeURIComponent(output.value);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    subjectOut.value = val('eq-subject') + ' — ' + L.brand + (val('eq-org') ? ' — ' + val('eq-org') : '');
    output.value = [
      L.name + ': ' + val('eq-name'),
      L.org + ': ' + val('eq-org'),
      L.role + ': ' + val('eq-role'),
      '',
      L.decision + ':',
      val('eq-decision'),
      '',
      L.time + ': ' + val('eq-time'),
    ].join('\n');
    refreshLink();
    status.textContent = '';
    preview.hidden = false;
    const h = preview.querySelector('h3');
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
    preview.scrollIntoView({ block: 'nearest' });
  });
  subjectOut.addEventListener('input', refreshLink);
  output.addEventListener('input', refreshLink);

  // Manual-copy fallback: one read-only box holding the subject and the message,
  // selected for the visitor, so nothing is left out when the clipboard is refused.
  copy.addEventListener('click', async () => {
    const text = L.subject + ': ' + subjectOut.value + '\n\n' + output.value;
    try { await navigator.clipboard.writeText(text); status.textContent = L.copied; if (manual) manual.hidden = true; }
    catch {
      if (!manual) {
        manual = document.createElement('textarea');
        manual.id = 'eq-manual'; manual.readOnly = true; manual.rows = 12;
        manual.setAttribute('aria-label', L.manualLabel);
        manual.className = 'jr-manual';
        copy.closest('.menu-actions').after(manual);
      }
      manual.hidden = false; manual.value = text; manual.focus(); manual.select();
      status.textContent = L.manual;
    }
  });

  const pick = { '#private': 1, '#saudi': 2 }[location.hash];
  if (pick !== undefined) document.getElementById('eq-subject').selectedIndex = pick;

  // Everything is wired up: show the form and hide the plain fallback.
  form.hidden = false;
  if (fallback) fallback.hidden = true;
})();
