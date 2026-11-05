/* Links to related tools on the sister site. */
(function(){const X={"skeleton": [["joints", "Joints and stress tests"]], "muscles": [["mmt", "Manual muscle testing"]], "movements": [["kineticchain", "The kinetic chain"]], "nsmap": [["neuroexam", "Neuro exam"]], "reaction": [["concussion", "Concussion"]], "contraction": [["injury", "Injury and healing"]]},SITE="https://rjedtech.github.io/Raider-SportsMedLab/",NAME="SportsMedLab";
function put(){const id=location.hash.slice(1).split('@')[0],L=X[id],S=BioLab.sims&&BioLab.sims[id];if(!L||!S||!S.ui||!S.ui.sec)return;const r=S.ui.sec.querySelector('.related');if(!r||S.ui.sec.querySelector('.xsite'))return;
const p=document.createElement('p');p.className='rel-row xsite';p.innerHTML='<span class="rel-l">On '+NAME+'</span>'+L.map(a=>'<a class="chip" href="'+SITE+'#'+a[0]+'" target="_top">'+a[1]+'</a>').join('');r.after(p);}
addEventListener('hashchange',()=>setTimeout(put,60));addEventListener('load',()=>setTimeout(put,200));})();
