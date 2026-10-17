 'use strict';
(()=>{const root=document.querySelector('.ab-refresh');if(!root)return;const media=matchMedia('(prefers-reduced-motion: reduce)'),map=root.querySelector('.ab-map'),play=document.getElementById('ab-play'),note=document.getElementById('ab-motion-note');let timer;
play.addEventListener('click',()=>{if(media.matches)return;clearTimeout(timer);map.classList.remove('is-playing');void map.offsetWidth;map.classList.add('is-playing');timer=setTimeout(()=>map.classList.remove('is-playing'),1250);});
function sync(){play.hidden=media.matches;note.hidden=!media.matches;if(media.matches){clearTimeout(timer);map.classList.remove('is-playing');}}media.addEventListener('change',sync);sync();
function openPillar(){if(/^#ab-pillar-[0-3]$/.test(location.hash))document.getElementById('ab-detail-'+location.hash.slice(-1)).open=true;}
root.querySelectorAll('.ab-map a').forEach((a,i)=>a.addEventListener('click',()=>{document.getElementById('ab-detail-'+i).open=true;}));window.addEventListener('hashchange',openPillar);openPillar();})();
