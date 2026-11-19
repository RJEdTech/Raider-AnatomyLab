/* AnatomyLab Learn it, part B (Nov 18, 2026): breathing, transport, nsmap, neuron, reaction, dissection, egfr, spirometry.
   One BioLab.addLearn block, plus Test yourself why questions (addReview) for tools that had none (transport, neuron, dissection).
   Steps reuse each tool's own walkthrough setups (captured before Learn it replaces the tour) and add live number cards. */
(function(){
'use strict';
/* ---- shared helpers for learn-more.js (copied into each site's file) ---- */
const H=BioLab.h,PAL=H.PAL;
const RED='#b3261e',GREEN='#1b7a3a',BLUE='#1f5fbf',HI='#c8102e';
const DEF=id=>BioLab.defs.find(d=>d.id===id);
/* the tool's own walkthrough steps, captured before Learn it replaces them */
const TOUR={};BioLab.defs.forEach(d=>{TOUR[d.id]=(d.tour||[]).slice();});
const TS=(id,title)=>{const s=(TOUR[id]||[]).find(x=>{const t=typeof x.title==='object'?Object.values(x.title).join('|'):String(x.title||'');return t.indexOf(title)>=0;});return s&&s.setup?s.setup:null;};
const tour=(id,title)=>sim=>{const f=TS(id,title);if(f)f(sim);};
const met=(sim,id)=>(sim.def.metrics||[]).find(m=>m.id===id);
const M=(sim,id)=>{const m=met(sim,id);if(!m)return NaN;try{return m.get(sim);}catch(e){return NaN;}};
const pick=(v)=>{if(v&&typeof v==='object'){const L=H.level||'bio';return v[L]||(L==='ap'&&v.honors)||v.bio||Object.values(v)[0];}return v;};
/* formatted metric: "label: value unit" or just value */
const F=(sim,id,d)=>{const m=met(sim,id);if(!m)return '…';let v;try{v=m.get(sim);}catch(e){return '…';}
  if(v==null)return '…';if(typeof v==='string')return v;if(!isFinite(v))return '…';
  const dd=d!=null?d:(m.d!=null?m.d:1);let s=Math.abs(v)>=1e4&&dd===0?Math.round(v).toLocaleString('en-US'):v.toFixed(dd);
  const u=pick(m.unit);return s+(u&&!/^\(|^of |^\(/.test(u)&&u.length<14?(u[0]==='%'?'':' ')+u:'');};
const FL=(sim,id,d)=>{const m=met(sim,id);return (m?pick(m.label):id)+': '+F(sim,id,d);};
/* card: word-wrapped rows. pos: [x,y] top-left, or {x,y,w,up} */
function card(ctx,k,x,y,w,L,o){o=o||{};const kk=Math.min(k,1.35),pad=10*kk,rows=[];
  L.filter(r=>r!==''&&r!=null).forEach(r=>{const t=Array.isArray(r)?r:[r,{}],op=t[1]||{},sz=(op.s||13)*kk;ctx.font=(op.w||600)+' '+sz+'px '+H.FONT;
    const words=String(t[0]).split(' ');let cur='';words.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(tr).width>w-2*pad){rows.push([cur,op,sz]);cur=wd;}else cur=tr;});if(cur)rows.push([cur,op,sz]);});
  let h=pad*1.6;rows.forEach(r=>h+=r[2]*1.35);if(o.up)y-=h;
  ctx.save();H.rr(ctx,x,y,w,h,9);ctx.fillStyle=PAL['cv-sol']||PAL['card'];ctx.globalAlpha=0.96;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=o.hi===false?1.2:2.5;ctx.strokeStyle=o.hi===false?PAL['cv-soft']:HI;ctx.stroke();
  let yy=y+pad*0.8;rows.forEach(([s,op,sz])=>{yy+=sz*1.1;H.txt(ctx,s,x+pad,yy,{s:sz,w:op.w||600,c:op.c||PAL['cv-ink']});yy+=sz*0.25;});ctx.restore();return h;}
/* red ring around the part of the picture that matters in this step */
function ring(ctx,k,r,tau){if(!r)return;const a=0.55+0.45*Math.sin((tau||0)*4);ctx.save();ctx.globalAlpha=a;ctx.lineWidth=3;ctx.strokeStyle=HI;ctx.setLineDash([7,5]);H.rr(ctx,r[0],r[1],r[2],r[3],10);ctx.stroke();ctx.restore();}
const atT=(sim,tau,t,key,fn)=>{sim._at=sim._at||{};const kk=(sim.lnKey||'')+':'+key;if(tau>=t&&!sim._at[kk]){sim._at[kk]=1;fn(sim);}};
const atReset=sim=>{sim._at={};};
const L={},R={};
const BL=(ctx,k,LH,rows,w)=>card(ctx,k,12,LH-10,w||300,rows,{up:true});
const RG=(r)=>(sim,ctx,LH,k,tau)=>ring(ctx,k,r,tau);
/* graph label anchored by an edge but kept between x0 and x1 (phone-safe) */
function tagIn(ctx,s,x,y,k,o,side,x0,x1){const K=BioLab.lg,sz=((o&&o.s)||15)*k;ctx.save();ctx.font=((o&&o.w)||600)+' '+sz+'px '+H.FONT;const w=ctx.measureText(s).width+sz*1.1;ctx.restore();
  let L=side==='r'?x-w:x;L=Math.max(x0==null?4:x0,Math.min(L,(x1==null?796:x1)-w));return K.tag(ctx,s,L+w/2,y,k,o);}

/* ---------- breathing (800 × 600) ---------- */
/* hemoglobin curve and alveolar O2 use the model's own constants (sims/breathing.js: Hill P50 26.8 mmHg, n 2.7; PA = 0.2093(Pb − 47) − PCO2/0.8) */
const brHill=P=>{const a=Math.pow(Math.max(P,0.1),2.7);return a/(a+Math.pow(26.8,2.7));};
const brPA=(pb,pc)=>Math.max(15,0.2093*(pb-47)-pc/0.8);
L.breathing={
  goals:{
    bio:['How the diaphragm changes lung volume and pressure to move air','How O₂ and CO₂ cross between the air sacs and the blood, high to low','How hemoglobin carries O₂ and gives it up at the tissues','Why thin air at altitude means less O₂ in your blood'],
    honors:['How Boyle’s law moves air in and out','Why millions of tiny air sacs beat one big one','How partial pressure sets the direction each gas moves'],
    ap:['Why CO₂, not O₂, sets your urge to breathe','How the S-shaped hemoglobin curve protects you at moderate altitude','How exercise unloads more O₂ at the steep part of the curve']},
  matters:'Every cell in your body runs on oxygen from your lungs. The same rules explain why visitors to Colorado get winded, why emphysema is so disabling, and why overbreathing before an underwater swim is dangerous.',
  steps:[
    {key:'pump',title:'In and out',set:{view:'vent',act:'rest',alt:'sea'},speed:0.5,focus:[0,0,470,600],
     see:'The diaphragm under the lungs flattens to breathe in and domes up to breathe out. The panel tracks lung volume and the pressure inside versus outside.',
     why:'Bigger chest, lower pressure inside (<b>Boyle’s law</b>): air flows in. Smaller chest, higher pressure: air flows out.',
     overlay:RG([20,250,440,140])},
    {key:'brain',title:'Your brain stem sets the pace',set:{view:'vent',act:'run'},speed:2,focus:[478,250,314,340],
     see:'Now you run. Working muscles make more CO₂. The box shows blood CO₂ and the breathing rate your brain stem sets.',
     why:'The brain stem senses CO₂ rising and speeds breathing to blow it off. Rising CO₂, not falling O₂, is the main trigger.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[478,250,314,340],tau);BL(ctx,k,LH,[[FL(sim,'rr',0),{w:700}],[FL(sim,'pco2',1),{w:700,c:RED}]],320);}},
    {key:'ext',title:'External respiration',set:{view:'ext',act:'rest'},speed:1,focus:[0,0,470,600],
     see:'In the air sac (<b>alveolus</b>) O₂ is high; in arriving blood it is low. Teal O₂ dots cross into the capillary; gold CO₂ dots cross out.',
     why:'Each gas moves from high to low: <b>diffusion</b>. Blood leaves the lungs with hemoglobin almost full.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[8,292,460,135],tau);card(ctx,k,488,LH-14,300,[[FL(sim,'sat',0),{w:700}]],{up:true});}},
    {key:'area',title:'Why millions of tiny sacs',set:{view:'ext',act:'rest',balloon:true},speed:1,focus:[470,10,322,380],
     see:'Same air in one big sac instead of millions of tiny ones: 0.16 m² of surface, not about 70 m². Watch the hemoglobin bar.',
     why:'Gas crosses only where air touches capillary. Far less surface lets far less O₂ in.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[470,10,322,380],tau);BL(ctx,k,LH,[[FL(sim,'sat',0),{w:700,c:RED}]],300);}},
    {key:'trans',title:'Transport',set:{view:'trans',act:'rest'},speed:1,
     see:'Each hemoglobin holds 4 O₂. It leaves the lungs about 97% full and comes back from resting tissues about 75% full.',
     why:'Almost all O₂ rides on hemoglobin. CO₂ rides back mostly as <b>bicarbonate</b>, made by an enzyme in red blood cells.',
     overlay:RG([100,15,600,225])},
    {key:'int',title:'Internal respiration',set:{view:'int',act:'rest'},speed:1,focus:[0,0,470,600],
     see:'At a muscle, cells have used O₂ and made CO₂. O₂ moves from blood into the cells; CO₂ moves into the blood.',
     why:'Same rule, high to low, the other way. At rest blood leaves about 75% full: a reserve for exercise.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[8,292,460,135],tau);card(ctx,k,488,LH-14,300,[[FL(sim,'sv',0),{w:700}]],{up:true});}},
    {key:'run',title:'Exercise unloads more',set:{view:'int',act:'run'},fresh:true,speed:1,focus:[0,0,470,600],
     see:'Same muscle, now running. The cells burn O₂ faster, so their O₂ drops, and the blood leaving them is much less full.',
     why:'A bigger high-to-low difference pulls more O₂ off hemoglobin, right where the working muscle needs it.',
     overlay(sim,ctx,LH,k,tau){card(ctx,k,488,LH-14,300,[[FL(sim,'sv',0),{w:700,c:RED}]],{up:true});}},
    {key:'curve',title:'The hemoglobin curve',speed:0.5,
     see:'How full hemoglobin is (up) at each O₂ pressure (across). Dots: lung O₂ at sea level, Denver, a 14er and Everest.',
     why:'The flat top means Denver barely lowers it. Tissues sit on the steep middle, where a small drop releases lots of O₂.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:120,x1:740,y0:70,y1:470},xr=[0,120];K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[20,'20'],[40,'40'],[60,'60'],[80,'80'],[100,'100'],[120,'120']],yt:[[0,'0%'],[0.25,'25%'],[0.5,'50%'],[0.75,'75%'],[1,'100%']],xl:'O₂ pressure (mmHg)',yl:'Hemoglobin full'});
       K.curve(ctx,B,xr,brHill,p<3?120*p/3:120,'#b3261e',null,3.5);
       const pts=[['Sea level',brPA(760,40)],['Denver',brPA(630,36)],['14er',brPA(455,30)],['Everest',brPA(253,8)]];
       const ab=['1','2','3','4'],rows=[];
       pts.forEach(([n,P],i)=>{if(p<3.2+i*0.8)return;const x=K.X(B,xr,P),y=K.Y(B,brHill(P));K.dot(ctx,x,y,'#1f5fbf',9);H.txt(ctx,ab[i],x,y+0.5,{s:11,w:800,c:'#fff',a:'center',b:'middle'});
         rows.push([ab[i]+'  '+n+': '+Math.round(P)+' mmHg → '+Math.round(brHill(P)*100)+'% full',{w:600,s:12.5}]);});
       if(p>=7){const x=K.X(B,xr,40),y=K.Y(B,brHill(40));K.dot(ctx,x,y,'#c8102e',7);rows.push(['Red dot: resting tissue, 40 mmHg → '+Math.round(brHill(40)*100)+'%',{w:700,s:12.5,c:RED}]);}
       if(rows.length)card(ctx,k,440,B.y1-14,300,rows,{up:true,hi:false});}},
    {key:'climb',title:'Now climb a 14er',set:{view:'ext',act:'rest',alt:'fourteener'},fresh:true,speed:2,focus:[470,10,322,580],
     see:'Resting on a Colorado 14er. The air is still about 21% O₂, but thinner: about 455 mmHg of pressure, not 760.',
     why:'Thinner air means less O₂ in the air sacs, so less crosses into the blood.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[470,10,322,580],tau);BL(ctx,k,LH,[[FL(sim,'pa',0),{w:700}],[FL(sim,'sat',0),{w:700,c:RED}]],320);}}
  ],
  useIt:[
    {do:'On a trip to the mountains, take the first day easy and drink water.',why:'Thinner air lowers the O₂ in your air sacs. At Denver’s height hemoglobin stays mostly full, but higher up it drops fast, and your body needs days to adjust.'},
    {do:'Never overbreathe before swimming underwater.',why:'Fast breathing blows off CO₂, the signal that makes you need a breath. You can run low on O₂ and black out before the urge to breathe arrives.'},
    {do:'When you need more air, breathe slower and deeper, not faster and shallower.',why:'Part of every breath stays in the airways and never reaches the air sacs. Deep breaths send a bigger share of fresh air to where gas exchange happens.'}],
  tryIt:[{title:'the bottle lung (15 minutes, with an adult for the cutting)',steps:['Have an adult cut the bottom off a plastic bottle. Push a balloon into the neck and stretch its mouth over the bottle’s mouth.','Cut a second balloon in half and stretch it over the open bottom as a diaphragm.','Pull the bottom balloon down, then push it up.'],look:'Pulling down makes more room inside, so the pressure drops and air rushes into the inner balloon. Pushing up squeezes it out. Your diaphragm works the same way.'}]};

/* ---------- transport (800 × 450) ---------- */
/* red blood cell equilibrium volume from the model (sims/transport.js): V = Vb + n(1 − Vb)/Co, Vb 0.4, n 300 mOsm/L, Co = 342 × salt %; bursts above 150% */
const trV=s=>0.4+300*0.6/(342*Math.max(s,0.01));
L.transport={
  goals:{
    bio:['What osmosis is: water moving toward the side with more dissolved solute','Why a red blood cell bursts in pure water and shrinks in salty water','Why hospital IV saline is 0.9% salt'],
    honors:['Why a plant cell turns firm instead of bursting','What aquaporins do, and what they don’t change'],
    ap:['How water potential (ψ = ψs + ψp) predicts which way water moves','How to read a cell’s solute potential from a volume graph']},
  matters:'Hospital IVs, contact-lens solution, crisp lettuce and wilted plants all come down to osmosis. Get the salt wrong in an IV and red blood cells burst or shrivel.',
  steps:[
    {key:'meet',title:'Meet the cell',speed:0.5,focus:[120,105,240,255],
     see:'A red blood cell in water as salty as blood: 0.9% salt. The right panel zooms in on its membrane.',
     why:'The membrane lets water through but holds salt back: <b>selectively permeable</b>. With equal salt on both sides, water crosses both ways equally.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[120,105,240,255],tau);BL(ctx,k,LH,[[FL(sim,'tonic'),{w:700}]],320);}},
    {key:'zoom',title:'Zoom in on the membrane',speed:0.25,focus:[493,15,300,420],
     see:'Blue water molecules slip through blue <b>aquaporin</b> channels. Purple salt particles bounce off the membrane.',
     why:'Water is small and has its own channels; salt is held back. So only water can move to even out a difference.',
     overlay:RG([493,15,300,420])},
    {key:'pure',title:'Pure water outside',set:{salt:0},speed:0.25,focus:[493,15,300,420],
     see:'The salt outside is replaced with pure water. In the zoom, more blue water dots cross in than come out.',
     why:'Water moves toward the side with more dissolved solute: <b>osmosis</b>. The outside is <b>hypotonic</b>, with less solute than the cell.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[493,15,300,420],tau);BL(ctx,k,LH,[[FL(sim,'water'),{w:700,c:BLUE}]],320);}},
    {key:'burst',title:'The cell swells and bursts',set:{salt:0},speed:1,focus:[60,40,370,380],
     see:'Water keeps flowing in. The cell swells into a ball and then tears open: <b>lysis</b>.',
     why:'A red blood cell has no wall. Past about 150% of its normal volume, the membrane can’t stretch any further.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[60,40,370,380],tau);BL(ctx,k,LH,[[isFinite(M(sim,'vol'))?FL(sim,'vol',0):'The cell burst (lysis)',{w:700,c:RED}]],300);}},
    {key:'salty',title:'Salty water',set:{salt:3},fresh:true,speed:1,focus:[60,40,370,380],
     see:'A fresh cell goes into 3% salt water, more than three times as salty as blood. It shrinks and wrinkles: <b>crenation</b>.',
     why:'Now the outside is <b>hypertonic</b>, with more solute than the cell, so water leaves.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[60,40,370,380],tau);BL(ctx,k,LH,[[FL(sim,'vol',0),{w:700,c:BLUE}],[FL(sim,'water'),{w:600}]],320);}},
    {key:'graph',title:'The volume graph',speed:0.5,
     see:'The model’s cell size once water stops moving (up), for each salt level outside (across). Dashed line: normal size.',
     why:'Less salt outside, bigger cell. Below about 0.48% it bursts. 0.9% lands right at normal size, which is why IV saline is 0.9%.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:120,x1:740,y0:50,y1:350},xr=[0,3],ys=v=>v/1.6;K.dim(ctx,LH);
       const s0=180/(342*1.1);
       ctx.save();ctx.fillStyle='rgba(179,38,30,0.12)';ctx.fillRect(B.x0,B.y0,K.X(B,xr,s0)-B.x0,B.y1-B.y0);ctx.restore();
       K.axes(ctx,B,k,{xr,xt:[[0,'0%'],[0.5,'0.5%'],[1,'1%'],[1.5,'1.5%'],[2,'2%'],[2.5,'2.5%'],[3,'3%']],yt:[[0,'0%'],[ys(0.5),'50%'],[ys(1),'100%'],[ys(1.5),'150%']],xl:'Salt outside the cell',yl:'Cell volume'});
       K.curve(ctx,B,[0,3],v=>ys(1),3,PAL['cv-soft'],[7,6],2);
       const xr2=[s0,3];if(p>=1)K.curve(ctx,B,xr2,v=>ys(trV(v)),p<4?s0+(3-s0)*(p-1)/3:3,'#b3261e',null,3.5);
       tagIn(ctx,'Bursts',B.x0+8,B.y0+22,k,{s:12.5,c:RED},'l');
       [[0.9,'0.9% (IV saline): '+Math.round(trV(0.9)*100)+'%',-30],[3,'3%: '+Math.round(trV(3)*100)+'%',-30]].forEach(([s,t,dy],i)=>{if(p<4.2+i)return;const x=K.X(B,xr,s),y=K.Y(B,ys(trV(s)));K.dot(ctx,x,y,'#1f5fbf',7);tagIn(ctx,t,i?x-10:x+10,y+dy,k,{s:12.5,hi:!i},i?'r':'l');});}},
    {key:'plantw',lvl:'honors',title:'A plant cell in pure water',run:tour('transport','A plant cell in pure water'),speed:1,focus:[60,40,370,380],
     see:'A plant cell goes into pure water. Water flows in, just as it did for the red blood cell.',
     why:'The stiff <b>cell wall</b> pushes back (<b>turgor pressure</b>), so the cell turns firm instead of bursting. That firmness holds plants upright.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[60,40,370,380],tau);BL(ctx,k,LH,[[FL(sim,'vol',0),{w:700}]],300);}},
    {key:'plants',lvl:'honors',title:'A plant cell in salt water',set:{cell:'plant',salt:3},fresh:true,speed:1,focus:[60,40,370,380],
     see:'The same plant cell in 3% salt water. The membrane and cytoplasm pull away from the wall: <b>plasmolysis</b>.',
     why:'Water leaves, as it did from the red blood cell, but the wall keeps its shape. This is wilting, one cell at a time.',
     overlay:RG([60,40,370,380])},
    {key:'psi',lvl:'ap',title:'Water potential',set:{cell:'plant',salt:0.9},fresh:true,speed:1,
     see:'Water potential (ψ) outside and inside: ψ inside is the solute part (ψs) plus the wall’s pressure (ψp).',
     why:'Water flows from higher ψ to lower ψ. Pure water is 0 MPa, solutes make ψ negative (ψs = −iCRT), and flow stops when the two match.',
     overlay(sim,ctx,LH,k,tau){BL(ctx,k,LH,[[FL(sim,'psiOut',2),{w:700}],[FL(sim,'psiIn',2),{w:700,c:BLUE}]],340);}},
    {key:'iv',title:'Back to the IV bag',set:{salt:0.9},fresh:true,speed:1,focus:[60,40,370,380],
     see:'Back to 0.9% salt, the strength of a hospital IV bag. The cell keeps its normal size.',
     why:'Inside and outside have the same solute: <b>isotonic</b>. Water moves in and out equally. Plain water would burst the cells; 3% would shrink them.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[60,40,370,380],tau);BL(ctx,k,LH,[[FL(sim,'vol',0),{w:700}],[FL(sim,'tonic'),{w:600}]],320);}}
  ],
  useIt:[
    {do:'Rinse contact lenses only in saline, never tap water.',why:'Saline matches the salt in your tears. Tap water is hypotonic, so it makes the lens and the cells on your eye swell, and it can carry germs.'},
    {do:'Revive limp celery or lettuce in a bowl of cold plain water.',why:'The plant cells have more solute than plain water, so water moves in, the vacuoles fill, and the cells press firm against their walls.'},
    {do:'Don’t water houseplants with salty or over-fertilized water.',why:'Water that is saltier than the roots pulls water out of them, as the 3% salt pulled water out of the cell. The plant wilts even though it is wet.'}],
  tryIt:[{title:'the gummy bear test (overnight)',steps:['Put one gummy bear in a cup of plain water and one in a cup of very salty water.','Keep a third bear dry to compare.','The next day, line up all three.'],look:'The bear in plain water swells a lot, because water moves into the sugary bear. In salty water it swells much less. It is the same rule as the cells: water moves toward the side with more dissolved stuff.'}]};
R.transport={questions:[
  {id:'dir',kind:'test',lvl:'bio',q:'A cell sits in water with less dissolved solute than its cytoplasm. Which way does water move?',choices:['Into the cell','Out of the cell','No net movement','Only salt moves'],correct:0,
   steps:['Water moves toward the side with more solute.','The cytoplasm has more solute than the outside.','So water moves into the cell.']},
  {id:'hyper',kind:'test',lvl:'bio',q:'What does “hypertonic” describe?',choices:['A solution with more solute than the cell','A solution with less solute than the cell','A solution with the same solute as the cell','A cell that has just burst open'],correct:0,
   steps:['Hyper means more.','A hypertonic solution has more solute than the cell.','Water leaves the cell, and it shrinks.']},
  {id:'ivwhy',kind:'test',lvl:'bio',q:'Why do hospitals give IV saline at 0.9% salt rather than plain water?',choices:['0.9% matches blood, so cells keep their size','Salt kills germs that ride in on the needle','Plain water is too thin to drip through the tube','The salt is a medicine for the heart'],correct:0,
   steps:['0.9% salt has about as much solute as blood.','So water moves in and out of red blood cells equally.','Plain water would make them swell and burst.']},
  {id:'wall',kind:'test',lvl:'honors',q:'A plant cell and a red blood cell both go into pure water. Why does only the red blood cell burst?',choices:['The plant cell’s wall pushes back as it swells','Water can’t cross a plant cell membrane at all','The plant cell pumps the water back out','The plant cell has no solute inside it'],correct:0,
   steps:['Both cells take in water by osmosis.','The plant cell’s wall resists, building turgor pressure.','The red blood cell has no wall, so it stretches until it tears.']},
  {id:'aqua',kind:'test',lvl:'honors',q:'A drug blocks aquaporins. A red blood cell then goes into pure water. What happens?',choices:['It still swells, just more slowly','It never swells, with no other way in','It shrinks instead of swelling up','It bursts faster than it did before'],correct:0,
   steps:['Aquaporins are fast lanes for water.','Water can still cross the membrane slowly without them.','The direction and the end point stay the same; only the speed drops.']},
  {id:'vnum',kind:'test',lvl:'honors',q:'In the model, a red blood cell’s settled volume is V = 0.4 + 180 ÷ (342 × salt %). What is V, as a percent of normal, in 1.8% salt?',num:{ans:69,tol:2,unit:'% of normal'},
   steps:['342 × 1.8 = 615.6.','180 ÷ 615.6 ≈ 0.29.','0.4 + 0.29 = 0.69, so about 69% of normal size.']},
  {id:'psi',kind:'test',lvl:'ap',q:'Outside ψ is −0.8 MPa. A plant cell inside has ψs = −1.0 MPa and ψp = +0.4 MPa. Which way does water move?',choices:['Out of the cell','Into the cell','No net movement','It can’t be told from ψ'],correct:0,
   steps:['ψ inside = ψs + ψp = −1.0 + 0.4 = −0.6 MPa.','Outside is −0.8 MPa, which is lower.','Water moves from higher ψ (inside) to lower ψ (outside), so out of the cell.']}]};

/* ---------- nsmap (800 × 500) ---------- */
L.nsmap={
  goals:{
    bio:['How the nervous system divides into the CNS and the PNS','Which signals arrive (sensory) and which exit (motor)','What the sympathetic and parasympathetic divisions do to the body','What the main brain regions and the parts of a neuron do'],
    honors:['Why somatic signals are voluntary and autonomic ones are automatic','Why the two autonomic divisions work as a balance, not a switch'],
    ap:['How one organ gets opposite commands from the two divisions','How each brain hemisphere controls the opposite side of the body']},
  matters:'Every reflex, decision and heartbeat change runs through this map. It explains why a scare dries your mouth, why stress shuts down digestion, and why a stroke on one side of the brain weakens the other side of the body.',
  steps:[
    {key:'cns',title:'Two big divisions',set:{view:'tree',node:'cns'},pause:true,
     see:'The nervous system’s family tree. Highlighted: the <b>central nervous system (CNS)</b>, the brain and spinal cord, shown purple on the body.',
     why:'The CNS combines information and makes decisions: <b>integration</b>. All the nerves outside it make up the <b>peripheral nervous system (PNS)</b>.',
     overlay:RG([20,112,240,125])},
    {key:'mot',title:'Arrives and exits',set:{view:'tree',node:'mot'},speed:1,
     see:'Now the PNS’s motor branch is highlighted, with its nerves running out to the arms and legs.',
     why:'Sensory signals arrive at the CNS: <b>afferent</b>. Motor signals exit it: <b>efferent</b>. Memory trick: afferent arrives, efferent exits.',
     overlay:RG([270,175,260,70])},
    {key:'aut',title:'Select or automatic',set:{view:'tree',node:'aut'},speed:1,
     see:'Motor splits again. Highlighted: <b>autonomic</b>, wired to the heart and gut on the body.',
     why:'<b>Somatic</b> nerves run skeletal muscle, which you choose to move. Autonomic nerves run heart muscle, smooth muscle and glands automatically.',
     overlay:RG([260,255,300,70])},
    {key:'scare',title:'Fight or flight',set:{view:'body',scen:'scare'},speed:1,
     see:'A car horn blasts. Heart rate climbs, the pupils open wide, the airways open and digestion nearly stops.',
     why:'The <b>sympathetic</b> division gets you ready for action. Blood is sent to the muscles and away from the gut.',
     overlay(sim,ctx,LH,k){BL(ctx,k,LH,[[FL(sim,'hr',0),{w:700,c:RED}],[FL(sim,'pu',1),{w:700}]],270);}},
    {key:'dinner',title:'Rest and digest',set:{view:'body',scen:'dinner'},speed:1,
     see:'After dinner. The heart slows, the pupils narrow and the gut gets to work.',
     why:'The <b>parasympathetic</b> division takes over for upkeep: digesting and saving energy. Both divisions reach most organs.',
     overlay(sim,ctx,LH,k){BL(ctx,k,LH,[[FL(sim,'hr',0),{w:700,c:GREEN}],[FL(sim,'pu',1),{w:700}]],270);}},
    {key:'walk',lvl:'honors',title:'Both at once',set:{view:'body',scen:'walk'},speed:1,
     see:'Walking home. The bars at the top show both divisions active at the same time.',
     why:'The autonomic system works like a balance, not an on-off switch. Each organ settles where the two pulls meet.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[0,0,800,40],tau);BL(ctx,k,LH,[[FL(sim,'sym',0),{w:700,c:RED}],[FL(sim,'par',0),{w:700,c:GREEN}]],300);}},
    {key:'brain',title:'The brain’s regions',set:{view:'brain',part:'cerebrum',hemi:'left'},speed:1,
     see:'The cerebrum’s four lobes, the cerebellum and the brain stem. On the right: the left hemisphere controls the right side of the body.',
     why:'Frontal: planning and movement. Parietal: touch. Occipital: vision. Temporal: hearing. Cerebellum: coordination. Brain stem: breathing and heartbeat.',
     overlay:RG([560,20,230,400])},
    {key:'neuron',title:'The cells that carry it',set:{view:'neuron',ntype:'motor',npart:'axon'},speed:1,
     see:'A motor neuron running from the spinal cord to a muscle. Highlighted: the <b>axon</b>, wrapped in a myelin sheath.',
     why:'<b>Dendrites</b> receive signals, the <b>cell body</b> combines them, and the axon carries the signal away to the axon terminals.',
     overlay:RG([240,110,330,120])},
    {key:'horn',title:'Back to the horn',set:{view:'body',scen:'scare'},speed:1,
     see:'The horn again: the sound reaches your brain, and your heart races and mouth dries before you decide anything.',
     why:'Sensory neurons (PNS, afferent) bring the sound in. The brain (CNS) integrates. Sympathetic motor fibers (PNS, efferent) speed your heart and slow your saliva.',
     overlay(sim,ctx,LH,k){BL(ctx,k,LH,[[FL(sim,'hr',0),{w:700,c:RED}]],250);}}
  ],
  useIt:[
    {do:'Before a test or a big game, slow your breathing for a minute.',why:'Slow breaths with long exhales strengthen parasympathetic signals to the heart, which nudges your heart rate down and takes the edge off the fight-or-flight response.'},
    {do:'Wait a while after a big meal before a hard workout.',why:'After eating, the parasympathetic side sends blood to the gut. Hard exercise asks the sympathetic side to send it to the muscles, and the two pull against each other.'},
    {do:'If someone suddenly has weakness on one side of the face or body, call 911.',why:'Each hemisphere controls the opposite side of the body, so one-sided weakness can mean a stroke. Fast treatment saves brain tissue.'}],
  tryIt:[{title:'the pupil check (2 minutes)',steps:['In a dim room, look closely at your eyes in a mirror.','Switch on a bright light or step into daylight and keep watching your pupils.'],look:'Your pupils shrink within a second, without you deciding anything. That automatic change is your autonomic nervous system at work.'}]};

/* ---------- neuron (800 × 450) ---------- */
L.neuron={
  goals:{
    bio:['What each part of a neuron does','Why the inside of a resting neuron is negative','How Na⁺ rushing in and K⁺ flowing out make an action potential','How myelin makes signals faster'],
    honors:['Why an action potential is all-or-none','How toxins and numbing medicines block Na⁺ channels','How a stronger stimulus shows up as a faster firing rate'],
    ap:['How positive feedback at Na⁺ channels drives the spike','How myelin and axon diameter set conduction speed']},
  matters:'Every thought, feeling and movement rides on these electrical pulses. Multiple sclerosis strips myelin and slows them, and the numbing shot at the dentist works by blocking them.',
  steps:[
    {key:'meet',title:'Meet the neuron',run:tour('neuron','Meet the neuron'),speed:0.25,focus:[0,8,800,140],
     see:'Top: one neuron. Dendrites at the left, the cell body, the long axon, and the axon terminal at the right.',
     why:'Dendrites collect signals and the cell body adds them up. The axon carries a pulse to the terminal, which passes it on.',
     overlay:RG([0,8,800,140])},
    {key:'rest',title:'The resting membrane',run:tour('neuron','The resting membrane'),pause:true,focus:[8,166,516,276],
     see:'A zoomed-in patch of axon membrane. The pump keeps gold Na⁺ mostly outside and purple K⁺ inside. Inside reads about −65 mV.',
     why:'More positive charge sits outside, so the inside is negative: the <b>resting potential</b>. The pump spends ATP to keep it.',
     overlay:RG([8,166,516,276])},
    {key:'na',title:'Threshold: Na⁺ rushes in',run:tour('neuron','Threshold'),speed:0.05,focus:[8,166,516,276],
     see:'A stimulus pushes the inside up to <b>threshold</b>. The blue Na⁺ channels snap open and gold Na⁺ floods in.',
     why:'Na⁺ is positive, so the inside swings to about +40 mV: <b>depolarization</b>. Each channel that opens helps open more, so it is all or nothing.',
     overlay:RG([8,166,516,276])},
    {key:'k',title:'K⁺ flows out',run:tour('neuron','Repolarization'),speed:0.05,focus:[8,166,516,276],
     see:'Next the Na⁺ channels close and the green K⁺ channels open. Purple K⁺ flows out.',
     why:'K⁺ carries positive charge out, so the inside goes negative again: <b>repolarization</b>. It dips just below rest before settling.',
     overlay:RG([8,166,516,276])},
    {key:'graph',title:'The action potential graph',speed:0.3,
     see:'Voltage (up) against time (across) for one spike, with this neuron’s values.',
     why:'The rise is Na⁺ rushing in; the fall is K⁺ flowing out; the dip below rest comes from slow K⁺ channels. Every spike reaches the same height.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:130,x1:740,y0:50,y1:370},xr=[0,6],vr=[-90,50],ys=v=>(v-vr[0])/(vr[1]-vr[0]);K.dim(ctx,LH);
       const pk=isFinite(M(sim,'peak'))&&M(sim,'peak')>0?M(sim,'peak'):40;
       /* piecewise shape: rest −65 to 1 ms, small rise to threshold −55, spike to peak at 1.6 ms, fall to −72 by 2.6 ms, back to −65 by 5 ms */
       const sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
       const V=t=>t<1?-65:t<1.3?-65+10*sm((t-1)/0.3):t<1.65?-55+(pk+55)*sm((t-1.3)/0.35):t<2.6?pk+(-72-pk)*sm((t-1.65)/0.95):-72+7*sm((t-2.6)/2.4);
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']],yt:[[ys(-90),'−90'],[ys(-65),'−65'],[ys(-55),'−55'],[ys(0),'0'],[ys(40),'+40']],xl:'Time (ms)',yl:'Voltage inside (mV)'});
       ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#c27a00';ctx.lineWidth=1.5;const yt=K.Y(B,ys(-55));ctx.beginPath();ctx.moveTo(B.x0,yt);ctx.lineTo(B.x1,yt);ctx.stroke();ctx.restore();
       K.curve(ctx,B,xr,t=>ys(V(t)),p<3?6*p/3:6,'#1b7a3a',null,3.5);
       const T=[[0.4,-65,'Resting: −65 mV',20,'l'],[1.15,-55,'Threshold',-22,'r'],[1.45,(pk-55)/2,'Depolarization: Na⁺ in',0,'r'],[2.15,(pk-72)/2,'Repolarization: K⁺ out',0,'l'],[3.2,-71,'Below rest: K⁺ channels close slowly',26,'l'],[1.65,pk,'Peak: '+Math.round(pk)+' mV',-20,'l']];
       T.forEach(([t,v,s,dy,side],i)=>{if(p<3.2+i*0.6)return;const x=K.X(B,xr,t)+(side==='r'?-12:12),y=K.Y(B,ys(v))+dy;tagIn(ctx,s,x,y,k,{s:12},side,B.x0+6,796);});}},
    {key:'travel',title:'The signal travels',run:tour('neuron','The signal travels'),speed:0.2,focus:[100,40,700,80],
     see:'The spike sweeps along the axon from left to right.',
     why:'Each patch that fires pushes the next patch to threshold, like a row of falling dominoes. Without myelin it crawls along at a few meters per second.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[100,40,700,80],tau);card(ctx,k,290,128,250,[[FL(sim,'vel',1),{w:700}]]);}},
    {key:'myelin',title:'Myelin makes it jump',run:tour('neuron','Myelin makes it jump'),speed:0.03,focus:[100,40,700,80],
     see:'Myelin wraps the axon. The spike fires only at the gaps, the nodes of Ranvier, jumping from node to node. Time is slowed way down.',
     why:'Myelin insulates the axon, so only the nodes need to fire. The signal moves many times faster.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[100,40,700,80],tau);card(ctx,k,290,128,250,[[FL(sim,'vel',1),{w:700,c:GREEN}]]);}},
    {key:'ttx',lvl:'honors',title:'Blocking the signal',run:tour('neuron','Blocking the signal'),speed:0.2,focus:[8,166,516,276],
     see:'Tetrodotoxin, a pufferfish poison, plugs the Na⁺ channels. Pulses nudge the voltage, but no spike starts.',
     why:'No Na⁺ rush, no action potential. The dentist’s numbing shot, such as lidocaine, blocks the same channels more gently.',
     overlay:RG([8,166,516,276])},
    {key:'rate',lvl:'honors',title:'Stronger means faster, not bigger',set:{stim:'steady',strength:20},fresh:true,speed:0.6,focus:[533,166,262,276],
     see:'A steady current instead of single pulses, at 20 µA/cm². The neuron fires again and again.',
     why:'A stronger stimulus doesn’t make bigger spikes; it makes them come more often. The brain reads strength from the <b>firing rate</b>.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[533,166,262,276],tau);card(ctx,k,290,128,230,[[FL(sim,'rate',0),{w:700}],[FL(sim,'peak',0),{w:600}]]);}},
    {key:'tack',title:'Back to the tack',run:tour('neuron','The signal travels'),set:{myelin:true},cause:{from:{myelin:false},delay:2,dur:1,label:'Myelin'},speed:0.2,focus:[100,40,700,80],
     see:'The tack: the signal travels about 1 m from foot to spinal cord. Watch the travel time when myelin is added.',
     why:'Without myelin the trip takes about 0.29 s; with it, about 17 ms. Fast nerves let a reflex start before you think.',
     overlay(sim,ctx,LH,k,tau){card(ctx,k,290,128,270,[[FL(sim,'toe',0),{w:700,c:RED}],[FL(sim,'vel',1),{w:600}]]);}}
  ],
  useIt:[
    {do:'If your foot “falls asleep,” move and wait a minute before you walk on it.',why:'Pressure on a nerve stops it from firing properly, so signals in and out are blocked for a while. Until they return, you can’t feel or control the foot well.'},
    {do:'At the dentist, expect the numbness to last an hour or two.',why:'The numbing medicine blocks Na⁺ channels in the nerves, so no action potentials carry pain. It wears off as your body clears the drug.'},
    {do:'Eat a varied diet with enough vitamin B12.',why:'Your body needs B12 to build and maintain myelin. Without enough, nerve signals can slow and cause numbness or tingling.'}],
  tryIt:[{title:'the domino axon (10 minutes)',steps:['Stand a line of dominoes or books evenly spaced. Push the first and time how long the whole row takes.','Now take out sections and replace them with rulers lying flat, so the push only has to topple a few pieces at the gaps.'],look:'The toppling only happens at the gaps, so the signal crosses the row faster. That is how myelin speeds an action potential: it only fires at the nodes.'}]};
R.neuron={questions:[
  {id:'parts',kind:'test',lvl:'bio',q:'Which part of a neuron carries the signal away from the cell body?',choices:['The axon','The dendrites','The nucleus','The myelin gap'],correct:0,
   steps:['Dendrites receive signals.','The cell body adds them up.','The axon carries the pulse away to the terminals.']},
  {id:'rest',kind:'test',lvl:'bio',q:'At rest, the inside of a neuron is about −65 mV. Why is it negative?',choices:['More positive ions sit outside than inside','Neurons store extra electrons for later','Na⁺ floods into the cell while at rest','The axon is wrapped in myelin'],correct:0,
   steps:['The pump moves Na⁺ out and K⁺ in.','Overall, more positive charge ends up outside.','So the inside reads negative compared with the outside.']},
  {id:'rise',kind:'test',lvl:'bio',q:'What causes the fast upswing of an action potential?',choices:['Na⁺ rushing into the axon','K⁺ flowing out of the axon','The pump using more ATP','Myelin wrapping the axon'],correct:0,
   steps:['At threshold, Na⁺ channels open.','Positive Na⁺ pours in.','The inside swings positive: depolarization.']},
  {id:'allnone',kind:'test',lvl:'honors',q:'A stimulus twice as strong as needed reaches the axon. How does the spike compare with a just-strong-enough one?',choices:['Same height; spikes may come more often','Twice as tall as the weaker spike','Half as tall, from tired channels','No spike at all, from too much current'],correct:0,
   steps:['Action potentials are all-or-none.','Once threshold is passed, every spike reaches the same peak.','Stronger stimuli raise the firing rate instead.']},
  {id:'ttx',kind:'test',lvl:'honors',q:'Tetrodotoxin blocks voltage-gated Na⁺ channels. What does a poisoned nerve do?',choices:['It can’t fire action potentials','It fires faster than normal','It fires only where it is myelinated','It stays stuck at +40 mV for good'],correct:0,
   steps:['The spike depends on Na⁺ rushing in.','With Na⁺ channels blocked, no spike can start.','Signals stop: numbness or paralysis.']},
  {id:'toe',kind:'test',lvl:'bio',q:'A signal travels at 60 m/s along a myelinated axon. How long does it take to cover 1 m, in milliseconds?',num:{ans:17,tol:1,unit:'ms'},
   steps:['time = distance ÷ speed.','1 m ÷ 60 m/s ≈ 0.0167 s.','That is about 17 ms.']},
  {id:'ms',kind:'test',lvl:'ap',q:'In multiple sclerosis, the immune system damages myelin. What happens to signals in those axons?',choices:['They slow down or fail at damaged stretches','They speed up, with less insulation in the way','They get stronger at each node','They stop needing Na⁺ channels'],correct:0,
   steps:['Myelin lets the spike jump from node to node.','Without it, charge leaks out between nodes.','The signal slows or fails to reach the next node.']}]};

/* ---------- reaction (800 × 500) ---------- */
const rxCard=(ctx,k,rows)=>card(ctx,k,12,416,260,rows,{up:true});
const RXB=[[6,424,262,72],[268,424,264,72],[532,424,262,72]];
L.reaction={
  goals:{
    bio:['The three jobs in every reaction: sensory input, integration and motor output','How a falling ruler measures reaction time','Why a sound cue beats a light cue','How a reflex skips the brain'],
    honors:['Which step practice and distraction change, and which they don’t','Why it matters where on the body you are touched'],
    ap:['How little of a reaction is signal travel along nerves','How to turn a ruler distance into a time with free fall']},
  matters:'Reaction time decides whether a driver stops in time and whether a goalie blocks a shot. It also shows why texting while driving is so dangerous: most of the delay is in your brain, not your nerves.',
  steps:[
    {key:'three',title:'Three jobs, in order',run:tour('reaction','Three jobs'),speed:0.6,focus:[6,424,788,72],
     see:'A ruler drops and you catch it. The three boxes at the bottom time each part of your reaction. Time runs 10 times slower here.',
     why:'Every reaction does three jobs in order: <b>sensory input</b> (detect it), <b>integration</b> (the brain decides) and <b>motor output</b> (move).',
     overlay:RG([6,424,788,72])},
    {key:'sens',title:'Sensory input',run:tour('reaction','Sensory input'),speed:0.2,
     see:'The ruler starts to fall. Light from it reaches the retina at the back of your eye.',
     why:'The retina’s light-sensing cells run a slow chemical chain before any signal leaves the eye. That takes most of vision’s sensory time.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[340,30,240,120],tau);ring(ctx,k,RXB[0],tau);}},
    {key:'integ',title:'Integration',run:tour('reaction','Integration'),speed:0.25,
     see:'The signal reaches the back of the brain, where vision is handled, then moves to the front, where you decide to grab.',
     why:'Deciding and planning the movement is the longest step, and it changes the most from one try to the next.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[8,50,332,370],tau);ring(ctx,k,RXB[1],tau);}},
    {key:'motor',title:'Motor output',run:tour('reaction','Motor output'),speed:0.25,
     see:'The command runs down the spinal cord and out along a motor neuron to the hand. Then the fingers close.',
     why:'Signal travel is quick. The muscle needs about 40 ms to contract and close your fingers.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[340,30,240,390],tau);ring(ctx,k,RXB[2],tau);}},
    {key:'ruler',title:'The ruler is a clock',run:tour('reaction','The ruler is a clock'),speed:0.6,focus:[586,30,210,390],
     see:'The ruler falls the whole time you react. Where your fingers catch it shows how far it fell.',
     why:'Falling objects speed up at the same steady rate, so distance tells time: d = ½gt². A slower reaction means a longer fall.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[586,30,210,390],tau);rxCard(ctx,k,[[FL(sim,'cm',1),{w:700}],[FL(sim,'last',2),{w:600}]]);}},
    {key:'graph',title:'The ruler graph',speed:0.5,
     see:'How far the ruler falls (up) for each reaction time (across), from free fall. The dot is your last catch.',
     why:'The curve bends upward because the ruler keeps speeding up. Twice the time means four times the distance.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:130,x1:740,y0:50,y1:400},xr=[0,0.3],ys=d=>d/45;K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[0.05,'0.05'],[0.1,'0.10'],[0.15,'0.15'],[0.2,'0.20'],[0.25,'0.25'],[0.3,'0.30']],yt:[[0,'0'],[ys(10),'10'],[ys(20),'20'],[ys(30),'30'],[ys(40),'40']],xl:'Reaction time (s)',yl:'Ruler fall (cm)'});
       K.curve(ctx,B,xr,t=>ys(490*t*t),p<3?0.3*p/3:0.3,'#1f5fbf',null,3.5);
       const t=M(sim,'last'),d=M(sim,'cm');if(p>=3.3&&isFinite(t)&&isFinite(d)&&t>0){const x=K.X(B,xr,Math.min(t,0.3)),y=K.Y(B,ys(Math.min(d,45)));K.dot(ctx,x,y,'#c8102e',8);tagIn(ctx,'Your catch: '+d.toFixed(1)+' cm in '+t.toFixed(2)+' s',x-14,y-26,k,{s:12.5,hi:true},'r');}
       if(p>=4.5){const x1=K.X(B,xr,0.1),y1=K.Y(B,ys(4.9)),x2=K.X(B,xr,0.2),y2=K.Y(B,ys(19.6));K.dot(ctx,x1,y1,'#1b7a3a',6);K.dot(ctx,x2,y2,'#1b7a3a',6);
         tagIn(ctx,'0.10 s: 4.9 cm',x1+12,y1-20,k,{s:12},'l');tagIn(ctx,'0.20 s: 19.6 cm (4×)',x2+12,y2+26,k,{s:12},'l');}}},
    {key:'sound',title:'Sight against sound',run:tour('reaction','Sight against sound'),speed:0.6,
     see:'Only the cue changes: a sound instead of the sight of the ruler. The catch gets shorter.',
     why:'The ear turns sound into a nerve signal almost at once, so sensory input shrinks. A touch cue is about as fast as sound.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,RXB[0],tau);rxCard(ctx,k,[[FL(sim,'cm',1),{w:700}]]);}},
    {key:'text',lvl:'honors',title:'Reading a text',set:{distract:'text'},fresh:true,speed:0.6,
     see:'Back to the light cue, but now you are reading a text when the ruler drops.',
     why:'Your eyes and attention are busy, so integration takes much longer. Sensing and moving don’t change. That is why texting while driving is so dangerous.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,RXB[1],tau);rxCard(ctx,k,[[FL(sim,'avg',2),{w:700,c:RED}]]);}},
    {key:'reflex',title:'The reflex shortcut',run:tour('reaction','The reflex shortcut'),speed:0.3,focus:[340,30,456,390],
     see:'A tap below the knee. The signal goes to the spinal cord and straight back to the thigh muscle: the leg kicks.',
     why:'A <b>reflex</b> skips the brain: the spinal cord does the integrating, in about 0.04 s. The brain only finds out afterward.',
     overlay:RG([340,30,456,390])},
    {key:'answer',title:'Back to the 18 cm catch',set:{distract:'none'},fresh:true,speed:0.6,focus:[6,424,788,72],
     see:'Back to the question: a catch at 18 cm. Watch the three boxes as the trials run.',
     why:'18 cm means about 0.19 s. Only about 0.02 s is the signal traveling along nerves. The retina, synapses, the decision and the muscle take the rest.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[6,424,788,72],tau);rxCard(ctx,k,[[FL(sim,'avg',2),{w:700}],[FL(sim,'cond',0),{w:600,c:RED}]]);}}
  ],
  useIt:[
    {do:'Leave at least a 3-second gap behind the car ahead.',why:'Real braking reactions take about a second or more. At highway speed you cover about 30 m before your foot even reaches the brake.'},
    {do:'Put your phone away while driving or biking.',why:'Distraction stretches integration, the brain’s decision step. Your eyes and muscles stay fast, but the decision waits.'},
    {do:'Practice the moves you need in a game, not just general drills.',why:'Practice shortens integration, because a familiar choice takes less deciding. That is the step that changes most.'}],
  tryIt:[{title:'the ruler drop (10 minutes, with a partner)',steps:['Your partner holds a 30 cm ruler by the top, with the 0 mark just above your open fingers.','They drop it without warning. Catch it and read the mark at your fingers. Do five tries.','Do five more with your eyes closed while they say “now” as they let go.'],look:'Turn each distance into time with t = √(2d ÷ 980), with d in cm. The sound cue usually gives a shorter catch, just like in the model.'}]};

/* ---------- dissection (800 × 450) ---------- */
L.dissection={
  goals:{
    bio:['How to use and hold each dissecting tool','Which structures you can find before cutting','How to tie, cut and pin a fetal pig','Where the major organs sit and what they do'],
    honors:['How food moves through the digestive organs','How blood moves through the heart and great vessels'],
    ap:['Why a fetus needs shortcuts (shunts) in its circulation','What happens to those shunts at birth']},
  matters:'Walking through the dissection first means a calmer, more careful real one, with fewer wasted cuts. A pig’s organs sit almost where yours do, so this is also a map of your own body. Treat the specimen with respect: it is a gift for learning.',
  steps:[
    {key:'tools',title:'Tools of the trade',run:tour('dissection','Tools of the trade'),pause:true,focus:[272,10,256,140],
     see:'The tool tray. Highlighted: the dissecting scissors, which do almost all of the cutting.',
     why:'Keep the scissors’ blunt blade inside so it doesn’t stab organs. Forceps lift, the blunt probe separates tissue, and pins hold flaps open.',
     overlay:RG([272,10,256,140])},
    {key:'outside',title:'Outside first',run:tour('dissection','Outside first'),pause:true,
     see:'The pig lies on its back. Marked: the umbilical cord, and near the tail, this female’s genital papilla just below the anus.',
     why:'Outside structures orient you and tell you the sex. In a male, the urogenital opening is just behind the cord instead.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[440,195,60,60],tau);ring(ctx,k,[630,200,80,50],tau);}},
    {key:'cut',title:'Tie it down and cut',run:tour('dissection','Tie it down and cut'),pause:true,focus:[170,100,430,250],
     see:'The legs are tied so the pig lies belly up. The yellow lines show the five cuts, made with the dissecting scissors.',
     why:'Cut from head toward tail. Keep the blunt blade inside and cut shallow, so the organs below stay whole.',
     overlay:RG([170,100,430,250])},
    {key:'five',title:'Open, pin and look',run:tour('dissection','Open, pin and look'),pause:true,focus:[340,110,350,240],
     see:'The flaps are pinned open. Without moving anything you can see five organs: liver, stomach, spleen, small intestine and the coiled large intestine.',
     why:'The dark brown <b>liver</b> is the biggest organ and covers the upper abdomen, so it is the first thing you see.',
     overlay:RG([340,110,350,240])},
    {key:'liver',title:'Lift the liver',run:tour('dissection','Lift the liver'),pause:true,
     see:'The liver is lifted toward the head. Under it sits the small green <b>gallbladder</b>; the pale <b>pancreas</b> lies in the loop of small intestine.',
     why:'The gallbladder stores bile from the liver, and the pancreas makes digestive enzymes. Both drain into the small intestine.',
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,[290,240,70,60],tau);ring(ctx,k,[470,190,60,40],tau);}},
    {key:'kidney',title:'Move the intestines',run:tour('dissection','Move the intestines'),pause:true,focus:[450,140,240,170],
     see:'The intestines are pushed aside. The bean-shaped <b>kidneys</b> lie against the back wall.',
     why:'Kidneys filter the blood and make urine. Each ureter carries urine to the bladder, and the urethra carries it out.',
     overlay:RG([450,140,240,170])},
    {key:'chest',title:{bio:'Open the chest',honors:'The heart and great vessels'},run:tour('dissection','Open the chest'),pause:true,
     see:{bio:'The rib cage is opened. The lungs lie on each side of the heart, and the diaphragm separates the chest from the abdomen.',honors:'A close-up of the heart and the great vessels. The largest chamber, the thick-walled <b>left ventricle</b>, pumps blood to the body.'},
     why:{bio:'The heart sits up in the chest, above the diaphragm and behind the ribs. That is why you don’t see it when you open the abdomen.',honors:'Body blood enters the right atrium, the right ventricle sends it to the lungs, and the left ventricle pumps it out the aorta.'},
     overlay(sim,ctx,LH,k,tau){ring(ctx,k,sim.p.step==='heart'?[250,80,360,290]:[160,120,210,210],tau);}},
    {key:'fetal',lvl:'ap',title:'Fetal circulation',run:tour('dissection','Fetal circulation'),pause:true,focus:[150,100,560,340],
     see:'The blood’s path before birth. Red: oxygen-rich, from the placenta. Purple: mixed. Blue: oxygen-poor.',
     why:'The placenta does the lungs’ job, so shunts let blood skip them: the <b>foramen ovale</b> and the <b>ductus arteriosus</b>. Both close after birth.',
     overlay:RG([150,100,560,340])}
  ],
  useIt:[
    {do:'When a doctor mentions the upper right abdomen, picture the liver.',why:'Your liver sits where the pig’s does, under the right ribs, with the gallbladder tucked beneath it. Pain there often points to one of them.'},
    {do:'In the real lab, cut the way you practiced here.',why:'Scissors with the blunt blade inside and shallow cuts protect the organs you need to find, and careful technique keeps you and your partner safe.'},
    {do:'Remember that a newborn’s first breaths reroute its blood.',why:'At birth the lungs fill with air and the foramen ovale and ductus arteriosus close, so blood starts flowing through the lungs instead of skipping them.'}],
  tryIt:[{title:'map your own organs (5 minutes)',steps:['Lie on your back and find the bottom of your rib cage on the right side.','Find your belly button and the bony points at the front of your hips.','Using the pig as a guide, point to where your liver, stomach and bladder sit.'],look:'Your liver is under your right ribs, your stomach under your left ribs and your bladder just above the pubic bone: the same layout as the pig.'}]};
R.dissection={questions:[
  {id:'cuttool',kind:'test',lvl:'bio',q:'Which tool does almost all of the cutting in a fetal pig dissection?',choices:['Dissecting scissors','A sharp scalpel','The blunt probe','Fine forceps'],correct:0,
   steps:['Scissors let you cut shallow and controlled.','The blunt blade goes inside, away from the organs.','A scalpel is easy to push too deep.']},
  {id:'blunt',kind:'test',lvl:'bio',q:'Why do you keep the blunt blade of the scissors on the inside when you cut?',choices:['So it doesn’t stab the organs underneath','So the cut goes faster through the skin','So the pins stay in place','So the pig stays tied down'],correct:0,
   steps:['The organs lie just under the body wall.','A sharp point inside could puncture them.','The blunt blade slides over them safely.']},
  {id:'first',kind:'test',lvl:'bio',q:'You open the abdomen. Which organ covers most of the upper abdomen and is seen first?',choices:['The liver','The heart','The kidneys','The bladder'],correct:0,
   steps:['The liver is the biggest organ in the pig.','It lies right under the diaphragm.','So it covers the upper abdomen.']},
  {id:'heartwhere',kind:'test',lvl:'bio',q:'Why can’t you see the heart when you first open the abdomen?',choices:['It sits in the chest, above the diaphragm','It lies behind the kidneys, near the spine','It is wrapped inside the liver','It is too small to see without a lens'],correct:0,
   steps:['The diaphragm separates the chest from the abdomen.','The heart is in the chest, behind the ribs.','You must open the rib cage to see it.']},
  {id:'gall',kind:'test',lvl:'honors',q:'What does the gallbladder do?',choices:['Stores bile made by the liver','Makes insulin for the blood','Filters blood to make urine','Absorbs nutrients from food'],correct:0,
   steps:['The liver makes bile.','The gallbladder stores it.','Bile is released into the small intestine to help digest fat.']},
  {id:'kidney',kind:'test',lvl:'honors',q:'Urine leaves a kidney. In order, which tubes carry it out of the body?',choices:['Ureter, then bladder, then urethra','Urethra, then bladder, then ureter','Esophagus, then bladder, then ureter','Ureter, then urethra, then bladder'],correct:0,
   steps:['Each kidney drains into a ureter.','The ureters carry urine to the bladder.','The urethra carries it out of the body.']},
  {id:'shunt',kind:'test',lvl:'ap',q:'Before birth, why does most blood skip the lungs through the foramen ovale and ductus arteriosus?',choices:['The placenta supplies the oxygen instead','The fetal lungs are full of blood already','The heart is too weak to pump to the lungs','Blood can’t reach the lungs until age one'],correct:0,
   steps:['A fetus doesn’t breathe air.','Oxygen comes from the mother through the placenta.','So most blood bypasses the unused lungs.']}]};

/* ---------- egfr (800 × 450) ---------- */
/* equations copied from sims/egfr.js (CKD-EPI 2021 and 2009) */
function eg21(s,a,f){const k=f?0.7:0.9,al=f?-0.241:-0.302;return 142*Math.pow(Math.min(s/k,1),al)*Math.pow(Math.max(s/k,1),-1.2)*Math.pow(0.9938,a)*(f?1.012:1);}
function eg09(s,a,f,b){const k=f?0.7:0.9,al=f?-0.329:-0.411;return 141*Math.pow(Math.min(s/k,1),al)*Math.pow(Math.max(s/k,1),-1.209)*Math.pow(0.993,a)*(f?1.018:1)*(b?1.159:1);}
const egCross=(fn)=>{let lo=0.3,hi=12;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(fn(m)>20)lo=m;else hi=m;}return (lo+hi)/2;};
L.egfr={
  goals:{
    bio:['What creatinine and eGFR tell you about the kidneys','How two equations turn the same blood test into different scores','Why that difference mattered for kidney transplant waiting lists'],
    honors:['How much sicker a patient had to get before the 2009 equation crossed 20','How to compute eGFR with the 2021 equation'],
    ap:['How to turn the gap between equations into months of waiting time','Why the gap shrinks or grows with the rate of decline']},
  matters:'For years many labs reported a higher kidney score for patients recorded as Black, which delayed when their transplant waiting time started. The math shows how one number in an equation can change who gets care first.',
  steps:[
    {key:'report',title:'The lab report',run:tour('egfr','The lab report'),pause:true,focus:[12,12,262,426],
     see:'A 60-year-old man’s blood test: creatinine 3.4 mg/dL. Creatinine is a waste product from muscle.',
     why:'Healthy kidneys clear creatinine into urine. When the kidneys slow down, it builds up in the blood, so a high value means weak kidneys.',
     overlay:RG([12,12,262,426])},
    {key:'scale',title:'From filtering to a kidney score',run:tour('egfr','From filtering'),pause:true,focus:[296,16,490,140],
     see:'The eGFR scale: about how many mL of blood the kidneys filter each minute. The red line at 20: transplant waiting time can start.',
     why:'Labs compute eGFR from creatinine, age and sex. Lower means weaker kidneys; healthy adults are around 90 or more.',
     overlay:RG([296,16,490,140])},
    {key:'turn',title:'Your turn',run:tour('egfr','Your turn'),pause:true,focus:[296,160,490,280],
     see:{bio:'Your turn. Before the race multiplier, the 2009 equation gives 18.55. The order says Black, so it multiplies by 1.159. Click your answer at the bottom.',honors:'Your turn. Compute the 2021 equation with his numbers (the formula is at the bottom) and click your answer.'},
     why:'Then make your call: whose eGFR is 20 or lower? Or press Next to see the math.'},
    {key:'e21',title:'The 2021 equation',run:tour('egfr','The 2021 equation'),pause:true,focus:[296,160,245,280],
     see:'The race-free 2021 equation gives his eGFR as 19.8.',
     why:'That is 20 or lower, so his transplant waiting time can start counting.',
     overlay:RG([296,160,245,280])},
    {key:'e09',title:'The 2009 equation',run:tour('egfr','The 2009 equation'),pause:true,focus:[541,160,245,280],
     see:'The 2009 equation, told he is Black, multiplies by 1.159 and reports 21.5.',
     why:'Same blood, same kidneys, but now he is above 20, so his waiting time does not start.',
     overlay:RG([541,160,245,280])},
    {key:'graph',title:'The two curves',speed:0.5,
     see:'eGFR (up) for each creatinine level (across), at his age and sex. Blue: 2021. Gold: 2009 with the 1.159 multiplier.',
     why:'The gold curve sits higher everywhere, so it crosses 20 later. His kidneys have to get worse before the 2009 report counts him.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:120,x1:740,y0:40,y1:360},xr=[1,6],yr=80,ys=v=>v/yr;K.dim(ctx,LH);
       const a=sim.p.age||60,f=sim.p.sex==='F';
       K.axes(ctx,B,k,{xr,xt:[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']],yt:[[0,'0'],[ys(20),'20'],[ys(40),'40'],[ys(60),'60'],[ys(80),'80']],xl:'Creatinine (mg/dL)',yl:'eGFR'});
       ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#c8102e';ctx.lineWidth=2;const y20=K.Y(B,ys(20));ctx.beginPath();ctx.moveTo(B.x0,y20);ctx.lineTo(B.x1,y20);ctx.stroke();ctx.restore();
       const to=p<3?1+5*p/3:6;K.curve(ctx,B,xr,s=>ys(eg21(s,a,f)),to,'#1f5fbf',null,3.5);K.curve(ctx,B,xr,s=>ys(eg09(s,a,f,true)),to,'#c27a00',null,3.5);
       if(p>=3.4){const c1=egCross(s=>eg21(s,a,f)),c2=egCross(s=>eg09(s,a,f,true));
         K.dot(ctx,K.X(B,xr,c1),y20,'#1f5fbf',7);K.dot(ctx,K.X(B,xr,c2),y20,'#c27a00',7);
         tagIn(ctx,'2021 reaches 20 at '+c1.toFixed(2),K.X(B,xr,c1)-12,y20+30,k,{s:12.5,c:'#1f5fbf'},'r');
         tagIn(ctx,'2009 reaches 20 at '+c2.toFixed(2),K.X(B,xr,c2)+12,y20-30,k,{s:12.5,c:'#8a5a00'},'l');}
       if(p>=5){const s0=sim.p.scr||3.4,x=K.X(B,xr,s0);tagIn(ctx,'His result: '+s0.toFixed(2)+' mg/dL',x+12,B.y0+20,k,{s:12.5,hi:true},'l');
         ctx.save();ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x,B.y0+34);ctx.lineTo(x,B.y1);ctx.stroke();ctx.restore();}}},
    {key:'sicker',lvl:'honors',title:'How much sicker first?',run:tour('egfr','How much sicker'),pause:true,
     see:'Creatinine raised to 3.6 mg/dL. The 2021 report is well under 20; the 2009 report is still just above it.',
     why:'Under 2009 his creatinine must reach 3.61 before he counts, instead of 3.38 under 2021. His kidneys have to fail further first.'},
    {key:'changed',title:'What changed',run:tour('egfr','What changed'),pause:true,
     see:'In 2021 a national kidney task force recommended the race-free 2021 equation.',
     why:'From January 2023 the transplant network required waiting time to be credited back to Black candidates who had been delayed. By March 2024, 14,280 had moved up the list.'},
    {key:'months',lvl:'ap',title:'Turn the gap into months',run:tour('egfr','Turn the gap into months'),pause:true,
     see:'If his kidney function falls 3 points a year, the 2021 scale already reads 18.47 when the 2009 report finally reaches 20.',
     why:'That 1.53-point gap is about 6 months of waiting time not counted. Try a slower decline with the slider: the months grow.'}
  ],
  useIt:[
    {do:'If a family member gets a kidney lab report, check which eGFR equation it uses.',why:'Since 2021 most US labs use the race-free 2021 equation. An older report could read higher than the current method would.'},
    {do:'When you see any lab result, ask what it is being compared with.',why:'Kidney and lung scores come from equations built on reference groups. Knowing the reference helps you understand what the number means.'},
    {do:'Know your blood pressure, and get checked if diabetes runs in your family.',why:'High blood pressure and diabetes are the top causes of kidney damage. Catching them early protects the filters eGFR measures.'}],
  tryIt:[{title:'run the equation (10 minutes)',steps:['Use a calculator and the 2021 formula shown at the bottom of the tool.','Use a creatinine of 1.0 mg/dL and an age of 60 for a man, and compute eGFR.','Repeat with 2.0 and then 4.0 mg/dL.'],look:'Doubling creatinine cuts eGFR by more than half, because of the −1.2 power. Near the cutoff of 20, a small change in creatinine moves the score a lot.'}]};

/* ---------- spirometry (800 × 450) ---------- */
const spN=(x,m,sd)=>Math.exp(-0.5*Math.pow((x-m)/sd,2));
L.spirometry={
  goals:{
    bio:['What spirometry measures: FEV1 and FVC','Why a result is compared with a predicted value and a lower limit of normal','How a race-specific reference could call the same breath normal'],
    honors:['How a z-score compares a result with healthy people','Why the 2023 change matters for patients'],
    ap:['How LLN = predicted × 0.786 follows from the z cutoff','Why a 15% lower prediction lowers the lower limit by 15%']},
  matters:'Spirometry diagnoses asthma and COPD and clears athletes to play. For decades many labs predicted lower lung function for Black patients, so the same breath could be called normal. In 2023 the main lung society recommended ending that practice.',
  steps:[
    {key:'test',title:'The test',run:tour('spirometry','The test'),pause:true,focus:[12,12,262,426],
     see:'Spirometry: take the deepest breath you can, then blow out as hard and fast as you can for about 6 seconds.',
     why:'<b>FEV1</b> is the air out in the first second; <b>FVC</b> is the whole breath. Narrowed airways, as in asthma, lower FEV1.',
     overlay:RG([12,12,262,426])},
    {key:'compare',title:'Compared with what?',run:tour('spirometry','Compared with what'),pause:true,focus:[292,14,494,150],
     see:'The curve shows healthy people of the same age, height and sex, spread out around a predicted FEV1.',
     why:'There is no single normal FEV1. Taller, younger people blow out more, so a lab predicts a value for each person.',
     overlay:RG([292,14,494,150])},
    {key:'lln',title:'The lower limit of normal',run:tour('spirometry','The lower limit'),pause:true,focus:[292,14,494,150],
     see:'The red tail is the lowest 5% of healthy people: below the <b>lower limit of normal (LLN)</b>.',
     why:'A result in the red is flagged as below normal. On the z-score scale, that cutoff is z = −1.645.',
     overlay:RG([292,14,494,150])},
    {key:'turn',title:'Your turn',run:tour('spirometry','Your turn'),pause:true,focus:[292,14,494,426],
     see:'His FEV1 is 2.85 L and the race-neutral prediction is 3.827 L. Compute z = (measured ÷ predicted − 1) ÷ 0.13 and click your answer.',
     why:'Then make your call: under which reference is he flagged? Or press Next to see the math.'},
    {key:'neutral',title:'Race-neutral reference',run:tour('spirometry','Race-neutral reference'),pause:true,focus:[292,14,494,150],
     see:'z = (2.85 ÷ 3.827 − 1) ÷ 0.13 = −1.96, below the −1.645 cutoff.',
     why:'He is flagged. The lower limit of normal is 3.01 L. A doctor would look further, for example for asthma.',
     overlay:RG([292,14,494,150])},
    {key:'specific',title:'Race-specific reference',run:tour('spirometry','Race-specific reference'),pause:true,focus:[292,14,494,330],
     see:'The older practice predicted 15% lower for patients recorded as Black: 3.25 L, with a lower limit of 2.56 L.',
     why:'The same breath now gives z = −0.95 and is called normal. His FEV1 would have to fall another 0.29 L before it was flagged.',
     overlay:RG([292,14,494,330])},
    {key:'graph',title:'Two references, one breath',speed:0.5,
     see:'Healthy-people curves for both references. Blue: race-neutral. Gold: race-specific, shifted 15% lower. The red line is his 2.85 L.',
     why:'His breath falls in the blue curve’s flagged tail but inside the normal part of the gold curve.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,p=tau%14,B={x0:110,x1:750,y0:60,y1:350},xr=[1.5,5.5];K.dim(ctx,LH);
       const pn=M(sim,'predN'),pr=M(sim,'predR'),ln=M(sim,'llnN'),lr=M(sim,'llnR'),me=sim.p.fev1||2.85;if(!isFinite(pn)||!isFinite(pr))return;
       K.axes(ctx,B,k,{xr,xt:[[2,'2.0'],[3,'3.0'],[4,'4.0'],[5,'5.0']],yt:[],xl:'FEV1 (L)',yl:'Healthy people'});
       const fN=x=>0.9*spN(x,pn,0.13*pn),fR=x=>0.9*spN(x,pr,0.13*pr);
       const fill=(fn,lo,col)=>{ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(K.X(B,xr,xr[0]),B.y1);for(let x=xr[0];x<=lo;x+=0.01)ctx.lineTo(K.X(B,xr,x),K.Y(B,fn(x)));ctx.lineTo(K.X(B,xr,lo),B.y1);ctx.closePath();ctx.fill();ctx.restore();};
       if(p>=1)fill(fN,ln,'rgba(31,95,191,0.18)');if(p>=2)fill(fR,lr,'rgba(194,122,0,0.2)');
       K.curve(ctx,B,xr,fN,p<1?xr[0]+4*p:xr[1],'#1f5fbf',null,3.2);if(p>=1)K.curve(ctx,B,xr,fR,p<2?xr[0]+4*(p-1):xr[1],'#c27a00',null,3.2);
       if(p>=2.5){const x=K.X(B,xr,me);ctx.save();ctx.strokeStyle='#c8102e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,B.y0);ctx.lineTo(x,B.y1);ctx.stroke();ctx.restore();
         tagIn(ctx,'His FEV1: '+me.toFixed(2)+' L',x-10,B.y0+10,k,{s:12.5,hi:true},'r');}
       if(p>=3.5){[[ln,'#1f5fbf'],[lr,'#c27a00']].forEach(([v,c])=>{const x=K.X(B,xr,v);ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,B.y0+30);ctx.lineTo(x,B.y1);ctx.stroke();ctx.restore();});
         tagIn(ctx,'Race-neutral cutoff '+ln.toFixed(2)+' L: he is below it, flagged',K.X(B,xr,ln)+10,B.y1-80,k,{s:12,c:'#1f5fbf'},'l',B.x0+6);
         tagIn(ctx,'Race-specific cutoff '+lr.toFixed(2)+' L: he is above it, normal',K.X(B,xr,lr)-10,B.y1-30,k,{s:12,c:'#8a5a00'},'r',B.x0+6);}}},
    {key:'changed',title:'What changed',run:tour('spirometry','What changed'),pause:true,
     see:'In May 2023 the American Thoracic Society recommended race-neutral reference equations.',
     why:'Adjusting for race could make abnormal results look normal and delay care, so labs were told to use the race-neutral GLI Global equations.'},
    {key:'math',lvl:'ap',title:'The math',run:tour('spirometry','The math'),pause:true,
     see:'z = (measured ÷ predicted − 1) ÷ 0.13. A result is flagged when z is below −1.645.',
     why:'So LLN = predicted × (1 − 1.645 × 0.13) = predicted × 0.786. A 15% lower prediction lowers the LLN by 15%: from 3.01 L to 2.56 L.'}
  ],
  useIt:[
    {do:'If you get winded at practice, ask a doctor about a lung function test.',why:'Spirometry can find asthma, including asthma set off by exercise, and treatment can make practice much easier.'},
    {do:'If you get a lung test, ask how your result compares with your predicted value.',why:'Reports give percent of predicted or a z-score. Knowing the reference tells you what “normal” means for you.'},
    {do:'Stay away from smoke and vaping.',why:'Smoke and vapor irritate and narrow the airways, which lowers FEV1, the number this test measures.'}],
  tryIt:[{title:'the balloon FEV1 (5 minutes)',steps:['Take your deepest breath and blow into a balloon as hard as you can for one second only, then pinch it shut.','Rest, then blow a second balloon with one whole breath, as long as you can.','Compare the two balloons.'],look:'The first balloon holds your one-second air, like FEV1. The second holds your whole breath, like FVC. In healthy lungs the first is usually about 80% of the second.'}]};

BioLab.addLearn(L);
Object.keys(R).forEach(id=>{const d=DEF(id);if(d&&d.review&&d.review.questions&&d.review.questions.length)delete R[id];});
BioLab.addReview(R);
})();
