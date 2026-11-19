/* Learn it for AnatomyLab, part A (Nov 18, 2026): bodymap, homeostasis, skin, skeleton, muscles, movements, contraction, heart.
   One BioLab.addLearn block. Steps reuse each tool's own walkthrough setups (captured below before Learn it replaces the tour)
   and add live number cards from the tool's metrics. movements and skeleton are written to work unchanged on SportsMedLab
   (identical sims there). Homeostasis gets 7 more why questions, appended after BioLab.start() builds its review. */
(function(){
'use strict';
/* ---- shared helpers (same as the science sites' learn-more.js) ---- */
const H=BioLab.h,PAL=H.PAL;
const RED='#b3261e',GREEN='#1b7a3a',BLUE='#1f5fbf',HI='#c8102e',GOLD='#b8860b';
const DEF=id=>BioLab.defs.find(d=>d.id===id);
const TOUR={};BioLab.defs.forEach(d=>{TOUR[d.id]=(d.tour||[]).slice();});
const TS=(id,title)=>{const s=(TOUR[id]||[]).find(x=>{const t=typeof x.title==='object'?Object.values(x.title).join('|'):String(x.title||'');return t.indexOf(title)>=0;});return s&&s.setup?s.setup:null;};
const tour=(id,title)=>sim=>{const f=TS(id,title);if(f)f(sim);};
const met=(sim,id)=>(sim.def.metrics||[]).find(m=>m.id===id);
const pick=v=>{if(v&&typeof v==='object'){const L=H.level||'bio';return v[L]||(L==='ap'&&v.honors)||v.bio||Object.values(v)[0];}return v;};
const F=(sim,id,d)=>{const m=met(sim,id);if(!m)return '…';let v;try{v=m.get(sim);}catch(e){return '…';}
  if(v==null)return '…';if(typeof v==='string')return v;if(!isFinite(v))return '…';
  const dd=d!=null?d:(m.d!=null?m.d:1);const s=Math.abs(v)>=1e4&&dd===0?Math.round(v).toLocaleString('en-US'):v.toFixed(dd);
  const u=pick(m.unit);return s+(u&&!/^\(|^of /.test(u)&&u.length<14?' '+u:'');};
const FL=(sim,id,d)=>{const m=met(sim,id);return (m?pick(m.label):id)+': '+F(sim,id,d);};
/* card: word-wrapped rows at x,y (top-left); o.up draws it upward from y */
function card(ctx,k,x,y,w,L,o){o=o||{};const kk=Math.min(k,1.35),pad=10*kk,rows=[];
  L.filter(r=>r!==''&&r!=null).forEach(r=>{const t=Array.isArray(r)?r:[r,{}],op=t[1]||{},sz=(op.s||13)*kk;ctx.font=(op.w||600)+' '+sz+'px '+H.FONT;
    const words=String(t[0]).split(' ');let cur='';words.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(tr).width>w-2*pad){rows.push([cur,op,sz]);cur=wd;}else cur=tr;});if(cur)rows.push([cur,op,sz]);});
  let h=pad*1.6;rows.forEach(r=>h+=r[2]*1.35);if(o.up)y-=h;
  ctx.save();H.rr(ctx,x,y,w,h,9);ctx.fillStyle=PAL['cv-sol']||PAL['card'];ctx.globalAlpha=0.96;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=o.hi===false?1.2:2.5;ctx.strokeStyle=o.hi===false?PAL['cv-soft']:HI;ctx.stroke();
  let yy=y+pad*0.8;rows.forEach(([s,op,sz])=>{yy+=sz*1.1;H.txt(ctx,s,x+pad,yy,{s:sz,w:op.w||600,c:op.c||PAL['cv-ink']});yy+=sz*0.25;});ctx.restore();return h;}
function ring(ctx,k,r,tau){if(!r)return;const a=0.55+0.45*Math.sin((tau||0)*4);ctx.save();ctx.globalAlpha=a;ctx.lineWidth=3;ctx.strokeStyle=HI;ctx.setLineDash([7,5]);H.rr(ctx,r[0],r[1],r[2],r[3],10);ctx.stroke();ctx.restore();}
/* run a tool's own model off-screen (fresh state, given controls) and sample it; used to draw graphs from the model */
function offline(id,p,setup,T,dt,every,f){const d=DEF(id),defs={};(d.controls||[]).forEach(c=>defs[c.id]=c.def);
  const sim={st:d.init(),p:Object.assign({},defs,p||{}),t:0,def:d,vis:{}};if(setup)setup(sim);const out=[];const n=Math.round(T/dt),e=Math.max(1,Math.round(every/dt));
  for(let i=0;i<=n;i++){if(i%e===0)out.push([i*dt,f(sim)]);d.step(sim,dt);sim.t+=dt;}return out;}
const L={};

/* ======================= bodymap ======================= */
L.bodymap={
  goals:{
    bio:['Why every direction word starts from anatomical position','Superior/inferior, anterior/posterior, medial/lateral, proximal/distal','How planes slice the body and which cavities hold which organs'],
    honors:['Superficial and deep, and when each pair of terms applies','Why proximal and distal belong on limbs only','How the eleven organ systems share one space'],
    ap:['Writing an injury note another clinician can follow','Ipsilateral and contralateral','Reading a transverse CT slice by level']},
  matters:'Doctors, nurses, athletic trainers and EMTs use these words to tell each other exactly where a problem is, often while the patient is lying down. One wrong word and someone looks at the wrong side of the arm.',
  steps:[
    {key:'pose',title:'One pose for every term',run:tour('bodymap','Anatomical position'),focus:[100,50,260,545],pause:true,
     see:'The front view shows <b>anatomical position</b>: standing, facing forward, arms at the sides, palms forward.',
     why:'Every direction word assumes this pose, even when the real person is lying on a table. That way two people always mean the same spot.'},
    {key:'si',title:'Superior and inferior',run:tour('bodymap','Superior and inferior'),pause:true,
     see:'A is the kidneys and B is the heart. The sentence at the top reads: the kidneys are inferior to the heart.',
     why:'<b>Superior</b> means closer to the top of the head. <b>Inferior</b> means closer to the feet.'},
    {key:'ap',title:'Anterior and posterior',run:tour('bodymap','Anterior and posterior'),focus:[480,50,310,545],pause:true,
     see:'The side view shows the esophagus (A) just in front of the spinal cord (B): the esophagus is anterior to it.',
     why:'<b>Anterior</b> means toward the front of the body. <b>Posterior</b> means toward the back.'},
    {key:'ml',title:'Medial and lateral',run:tour('bodymap','Medial and lateral'),focus:[100,50,260,250],pause:true,
     see:'The nose (A) sits on the midline. The ears (B) sit out to the sides. So the nose is medial to the ears.',
     why:'<b>Medial</b> means closer to the body’s midline. <b>Lateral</b> means farther from it.',
     overlay(sim,ctx,LH,k){BioLab.lg.tagA(ctx,'Nose: medial. Ears: lateral.',12,LH-30,k,{s:13,hi:true},'l');}},
    {key:'pd',title:'Proximal and distal',run:tour('bodymap','Proximal and distal'),focus:[100,300,260,295],pause:true,
     see:'On the leg, the knee (A) is closer to the hip than the ankle (B) is. The knee is proximal to the ankle.',
     why:'On a limb, <b>proximal</b> means closer to where the limb joins the trunk. <b>Distal</b> means farther away.'},
    {key:'hook',title:'The patient on the stretcher',set:{view:'terms',a:'thumb',b:'pinky',supine:true},pause:true,
     see:'Now she lies on her back. A is her thumb, B her little finger. The sentence still says the thumb is lateral.',
     why:'Terms always mean anatomical position, palms forward. So the cut is on the thumb side, 3 cm toward the elbow.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg;K.tagA(ctx,'Lateral = thumb side, always',20,LH-40,k,{s:13,hi:true},'l');}},
    {key:'sd',lvl:'honors',title:'Superficial and deep',set:{view:'terms',a:'heart',b:'sternum'},pause:true,
     see:'A is the heart, B the sternum. The side view shows the heart behind the breastbone: posterior to it, and deep to it.',
     why:'<b>Deep</b> means farther from the body surface; <b>superficial</b> means closer. CPR presses on the sternum to squeeze the heart behind it.'},
    {key:'planes',title:'Planes slice the body',run:tour('bodymap','Planes'),pause:true,
     see:'A blue line cuts across the trunk: a <b>transverse plane</b>, splitting a superior part from an inferior part.',
     why:'A sagittal plane splits left from right, a frontal plane front from back. CT and MRI images are slices along these planes.'},
    {key:'cav',title:'Cavities hold the organs',run:tour('bodymap','Cavities'),pause:true,
     see:'The thoracic cavity lights up in the chest, holding the heart, lungs, trachea and esophagus. The diaphragm is its floor.',
     why:'Cavities are protected spaces. The diaphragm divides the thoracic cavity from the abdominal cavity below it.'},
    {key:'sys',title:'Eleven systems, one body',run:tour('bodymap','Organ systems'),pause:true,
     see:'The respiratory system: nose, trachea, lungs and the diaphragm that powers breathing.',
     why:'Eleven organ systems share the same space, each with a job. A structure’s shape fits its job, like thin, huge lung surfaces for gas exchange.'}],
  useIt:[
    {do:'Next time you read an injury report for an athlete, translate it into plain words.',why:'Reports say things like “distal radius fracture” or “lateral ankle sprain.” Each word locates the injury from anatomical position.'},
    {do:'When you describe a scrape or pain to a doctor, say which side and how far from a joint.',why:'“Two inches proximal to my left wrist, on the thumb side” is something anyone can find. “On my arm” is not.'},
    {do:'Look at a medical scan online and name its plane.',why:'Head-to-toe slices are transverse, side views are sagittal, front views are frontal. Knowing the plane tells you what you are looking at.'}],
  tryIt:[{title:'the stretcher test (5 minutes, a partner)',steps:['Your partner stands in anatomical position. Point to a spot and describe it with two pairs of terms.','Have them lie down, palms down. Describe the same spot again.','Check that every word stayed the same.'],look:'The words don’t change when the body moves, because they always refer to anatomical position. That is why they work in a hospital.'}]};

/* ======================= homeostasis ======================= */
const hoCard=(ctx,k,rows)=>card(ctx,k,560,8,230,rows);
function hoCurve(sim){const c=sim.p.carbs;if(sim._hoC&&sim._hoC.c===c)return sim._hoC.v;
  const v=offline('homeostasis',{mode:'glucose',carbs:c},s=>{s.st.Q+=c;},180,0.1,2,s=>[s.st.G,s.st.I]);sim._hoC={c,v};return v;}
L.homeostasis={
  goals:{
    bio:['How the body holds blood sugar near 90 mg/dL','How insulin and glucagon work as opposite signals','What negative feedback means, for sugar and for temperature'],
    honors:['Where the liver’s glycogen fits in the loop','How type 1 diabetes breaks the loop','Sensor, control center and effectors in temperature control'],
    ap:['The shape of the glucose and insulin curves after a meal','Why glucose output from the liver falls when insulin rises','Heat made versus heat lost at different air temperatures']},
  matters:'Every cell needs a steady supply of glucose and a steady temperature. When the loops that hold them break, you get diabetes, heat stroke or hypothermia. One in ten Americans has diabetes.',
  steps:[
    {key:'blood',title:'Blood carries glucose',set:{mode:'glucose'},speed:0.5,focus:[8,168,784,104],
     see:'Gold dots are glucose riding in the blood. The reading sits near 90 mg/dL: about a teaspoon of sugar in all your blood.',
     why:'Every cell burns glucose for energy, so the body keeps it in a narrow range. Holding conditions steady like this is <b>homeostasis</b>.',
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:800}],['Normal fasting: about 90']]);}},
    {key:'meal',title:'A meal raises it',set:{mode:'glucose'},fresh:true,run(sim){sim.st.Q+=sim.p.carbs;},speed:1,focus:[[290,20,220,148],[8,168,784,104]],
     see:'A 75 g carbohydrate meal goes in. The small intestine fills with gold, and glucose crosses into the blood. The reading climbs.',
     why:'Digestion breaks starch and sugar into glucose, which the gut absorbs into the blood. Nothing has pushed back yet.',
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:800,c:RED}]]);}},
    {key:'insulin',title:'The pancreas answers',speed:0.8,focus:[[30,290,290,140],[8,168,784,104]],
     see:'Blue dots pour out of the pancreas into the blood: <b>insulin</b>. Its reading rises along with glucose.',
     why:{bio:'The pancreas senses the high glucose and sends insulin, a hormone, through the blood.',honors:'Beta cells in the pancreatic islets sense the rise and secrete insulin. Alpha cells cut back on glucagon (purple).'},
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:700}],[FL(sim,'I',0),{w:800,c:BLUE}]]);}},
    {key:'uptake',title:'Cells take it in',speed:2,focus:[[30,20,210,148],[460,290,320,140]],
     see:'Green doors open on the muscle and fat cells, and the liver stores gold as glycogen. Glucose peaks, then falls back toward 90.',
     why:'Insulin opens the doors. As glucose falls, insulin falls too. A response that undoes the change is <b>negative feedback</b>.',
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:800,c:GREEN}],[FL(sim,'I',0)]]);}},
    {key:'graph',title:'The meal as a graph',set:{mode:'glucose'},speed:0.5,
     see:'Three hours after the meal: glucose in red (left scale) and insulin in blue, dashed (right scale).',
     why:'Glucose peaks about 40 minutes in, near 130 mg/dL, and is back near 100 by 2 hours. Insulin rises and falls just behind it.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:110,x1:700,y0:60,y1:350},xr=[0,180];K.dim(ctx,LH);
       const v=hoCurve(sim),gs=g=>(g-60)/100,is=i=>i/100;
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[30,'30'],[60,'60'],[90,'90'],[120,'120'],[150,'150'],[180,'180']],yt:[[gs(60),'60'],[gs(90),'90'],[gs(120),'120'],[gs(150),'150']],xl:'Minutes after eating',yl:'Blood glucose (mg/dL)'});
       const H2=H,kk=Math.min(k,1.25);[[0,'0'],[.5,'50'],[1,'100']].forEach(([f,l])=>{const y=K.Y(B,f*1);H2.txt(ctx,l,B.x1+12,y,{s:12*kk,b:'middle',c:BLUE});});
       H2.txt(ctx,'Insulin (µU/mL)',790,B.y0-18*kk,{s:12*kk,w:700,c:BLUE,a:'right'});
       const at=t=>{const i=Math.min(v.length-1,Math.round(t/2));return v[i][1];};const to=Math.min(180,tau*45);
       ctx.save();ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(B.x0,K.Y(B,gs(90)));ctx.lineTo(B.x1,K.Y(B,gs(90)));ctx.stroke();ctx.restore();
       K.curve(ctx,B,xr,t=>is(at(t)[1]),to,BLUE,[8,6],3);K.curve(ctx,B,xr,t=>gs(at(t)[0]),to,RED,null,4);
       if(to>=180){let pk=0,pt=0;v.forEach(([t,g])=>{if(g[0]>pk){pk=g[0];pt=t;}});const x=K.X(B,xr,pt),y=K.Y(B,gs(pk));K.dot(ctx,x,y,RED,7);
         K.tagA(ctx,'Peak: '+Math.round(pk)+' mg/dL at '+Math.round(pt)+' min',x+12,y-22,k,{s:12.5,hi:true},'l');
         const g2=at(120)[0];K.tagA(ctx,'2 hours: '+Math.round(g2)+' mg/dL',K.X(B,xr,120),K.Y(B,gs(g2))+30,k,{s:12.5},'l');}}},
    {key:'hook',title:'A hard run with no snack',set:{mode:'glucose'},fresh:true,run(sim){sim.st.ex=30;},speed:1.2,focus:[[30,20,210,148],[30,290,290,140]],
     see:'No meal, 30 minutes of hard exercise. Purple <b>glucagon</b> pours from the pancreas. Glucose dips only into the low 80s.',
     why:'Glucagon tells the liver to break down stored glycogen and release glucose. The sugar comes from your liver, so it doesn’t crash.',
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:800}],[FL(sim,'Gn',0),{w:800,c:'#5b3a99'}],]);}},
    {key:'t1',lvl:'honors',title:'When the loop breaks: type 1',set:{mode:'glucose',t1:true},fresh:true,run(sim){sim.st.Q+=sim.p.carbs;},speed:3,focus:[8,168,784,104],
     see:'Type 1 diabetes: the pancreas makes no insulin. After the same meal, glucose climbs past 200 and stays high.',
     why:'With no insulin, cells can’t take glucose in and the liver keeps releasing it. Above about 180 mg/dL, the kidneys spill sugar into urine.',
     overlay(sim,ctx,LH,k){hoCard(ctx,k,[[FL(sim,'G',0),{w:800,c:RED}],[FL(sim,'I',0)],[FL(sim,'urine')]]);}},
    {key:'cold',title:'Temperature: the cold',set:{mode:'temp',ta:-10},fresh:true,speed:1,focus:[150,30,240,410],
     see:'Air at −10 °C. Skin vessels narrow and the person shivers. Core temperature slips only to about 36 °C.',
     why:'The brain compares core temperature with a 37 °C <b>set point</b>. Shivering makes heat; narrow skin vessels keep it in. Negative feedback again.'},
    {key:'hot',title:'Temperature: the heat',set:{mode:'temp',ta:40},fresh:true,run(sim){sim.st.ex=30;},speed:1,focus:[150,30,240,410],
     see:'Air at 40 °C while exercising. The skin flushes as vessels widen, and sweat appears. Core rises only to about 37.8 °C.',
     why:'Evaporating sweat carries heat away. Same loop, opposite effectors: a sensor, a control center (the hypothalamus) and effectors.'}],
  useIt:[
    {do:'Eat something with protein or fiber before a long practice, not just candy.',why:'Fast sugar spikes glucose and insulin, then glucose can dip below where it started. A slower meal keeps the loop calm.'},
    {do:'Learn the signs of low blood sugar if a friend has type 1 diabetes: shaky, sweaty, confused.',why:'Injected insulin can’t sense glucose the way the pancreas does, so lows happen. Fast sugar fixes them.'},
    {do:'In the heat, drink before you feel thirsty and take breaks in the shade.',why:'Sweating is your main way to dump heat. If you run low on water, the loop can’t keep up and core temperature climbs.'}],
  tryIt:[{title:'the flush and the goosebumps (5 minutes)',steps:['Hold one hand in cold water for a minute and look at its color. Then hold it in warm water.','Watch your forearm skin when you step from a warm room into cold air.'],look:'Cold makes skin pale (vessels narrow) and raises goosebumps; warmth makes it pink (vessels widen). Those are effectors of your temperature loop.'}]};

/* ======================= skin ======================= */
/* firing-rate model copied from sims/skin.js RESP.touch: [peak, sustained, adaptation time constant s, ..., threshold %] */
const SK={meissner:[60,0,.15,30,.1,5],merkel:[50,12,1.5,0,0,8]};
const skRate=(T,S,a)=>{const g=Math.max(0,Math.min(1,(S-T[5])/(100-T[5])));return g*(T[1]+(T[0]-T[1])*Math.exp(-a/T[2]));};
L.skin={
  goals:{
    bio:['The three layers under your skin’s surface','Why some touch receptors stop firing while a touch goes on','Why a fingertip feels finer detail than the back of your calf'],
    honors:['How the epidermis rebuilds itself every month or so','Fast versus slow adapting receptors, and what each reports','The four parts of any sensation'],
    ap:['Matching receptors to stimuli: touch, pressure, vibration, heat, cold, pain','Firing rate over time as a graph','Two-point threshold and receptor density']},
  matters:'Your skin is your largest organ and your biggest sense organ. Knowing which receptor reports what explains why you stop feeling your clothes, why pain doesn’t fade, and why burns and nerve injuries are checked the way they are.',
  steps:[
    {key:'layers',title:'Three layers',run:tour('skin','Three layers'),focus:[10,10,505,600],pause:true,
     see:'A slice of skin: the thin <b>epidermis</b> on top, the thicker <b>dermis</b> below it, and fatty <b>hypodermis</b> underneath.',
     why:'The epidermis is the waterproof barrier. The dermis holds the working parts. The hypodermis cushions and insulates, but isn’t really skin.'},
    {key:'renew',title:'The epidermis rebuilds itself',run:tour('skin','The epidermis rebuilds itself'),focus:[525,10,265,470],speed:1,
     see:'In the close-up, new cells form at the bottom (the stratum basale) and are pushed upward, flattening and dying on the way.',
     why:'The cells you shed are dead and full of tough keratin. You grow a new epidermis every 25 to 45 days.'},
    {key:'dermis',title:'What lives in the dermis',run:tour('skin','What lives in the dermis'),focus:[10,60,505,420],pause:true,
     see:'The dermis holds capillary loops, hair follicles, oil and sweat glands, and most of the touch receptors.',
     why:'The epidermis has no blood vessels. Everything that feeds it, cools you or senses touch sits in the dermis below.'},
    {key:'fast',title:'A touch begins: fast adapters',run:tour('skin','A touch begins'),focus:[400,214,390,246],speed:0.4,
     see:'A steady touch on the fingertip. Meissner’s corpuscle (top row of spikes) fires a quick burst, then goes quiet while the touch is still on.',
     why:'<b>Fast-adapting</b> receptors report change: a touch starting or stopping. A steady touch is no news, so they stop firing.'},
    {key:'slow',title:'Slow adapters keep talking',run:tour('skin','Slow adapters keep talking'),focus:[400,214,390,246],speed:1,
     see:'The Merkel cell (bottom row) fires too. Its rate drops slowly but never reaches zero while the touch lasts.',
     why:'<b>Slow-adapting</b> receptors report what is still there: pressure, shape and edges, like the pencil in your hand.'},
    {key:'graph',title:'Adaptation as a graph',run:tour('skin','A touch begins'),speed:0.5,
     see:'Firing rate for the first 4 seconds of a steady touch: Meissner’s corpuscle in blue, the Merkel cell in red.',
     why:'Meissner’s drops to zero in under half a second. Merkel’s falls to a steady rate of about 7 spikes per second and holds there.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:110,x1:720,y0:80,y1:430},xr=[0,4],S=sim.p.S||60,ym=40;K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4']],yt:[[0,'0'],[10/ym,'10'],[20/ym,'20'],[30/ym,'30'],[40/ym,'40']],xl:'Seconds since the touch began',yl:'Firing rate (spikes/s)'});
       const to=Math.min(4,tau*1.3);K.curve(ctx,B,xr,a=>skRate(SK.meissner,S,a)/ym,to,BLUE,null,4);K.curve(ctx,B,xr,a=>skRate(SK.merkel,S,a)/ym,to,RED,null,4);
       if(to>=4){K.tagA(ctx,'Meissner’s: fast adapting',K.X(B,xr,0.35),K.Y(B,skRate(SK.meissner,S,0)/ym)-6,k,{s:12.5,c:BLUE},'l');
         const m=skRate(SK.merkel,S,4),ss=skRate(SK.merkel,S,60);K.tagA(ctx,'Merkel: slow adapting, levels off near '+ss.toFixed(0)+' spikes/s',B.x1,K.Y(B,m/ym)-24,k,{s:12.5,c:RED},'r');}}},
    {key:'hook',title:'Why you forget your watch',set:{view:'test',stim:'touch',site:'handback',S:60},fresh:true,speed:1,focus:[400,214,390,246],
     see:'A steady touch on the back of the hand, where a watch sits. The hair receptor bursts, then goes quiet. The Merkel cell slows.',
     why:'The watch didn’t change. Your receptors adapted, and your brain tunes out what’s left. Move it and you feel it again.',
     overlay(sim,ctx,LH,k){card(ctx,k,20,330,360,[[FL(sim,'pct',0),{w:800}],[FL(sim,'on',1)]]);}},
    {key:'pacini',lvl:'honors',title:'Deep pressure and vibration',run:tour('skin','Deep pressure and vibration'),focus:[10,10,780,450],speed:1,
     see:'A 250 Hz buzz on the fingertip. The Pacinian corpuscle, deep and layered like an onion, fires at every push of the vibration.',
     why:'It adapts in milliseconds, but the skin keeps changing, so it keeps firing. That is how you feel a phone buzz.'},
    {key:'pain',title:'Pain doesn’t fade',run:tour('skin','Heat, cold and pain'),focus:[10,10,780,450],speed:1,
     see:'A painful stimulus. Free nerve endings fire, and their rate barely drops while it lasts.',
     why:'Pain is a warning, so pain receptors adapt very little. They keep reporting until the danger is gone.'},
    {key:'site',title:'Why body site matters',run:tour('skin','Why body site matters'),focus:[400,10,390,196],speed:1,
     see:'The same touch on the back of the calf. The panel shows a two-point threshold of about 45 mm, versus 3 mm at the fingertip.',
     why:'Fingertips pack in far more touch receptors, each covering a tiny patch. Fewer receptors, blurrier picture.'}],
  useIt:[
    {do:'Check a burn or cut by its depth: does it hurt, or is it numb?',why:'A painful burn still has working nerve endings in the dermis. A numb one may have destroyed them, which is more serious.'},
    {do:'Use your fingertips, not your palm, to feel for a small splinter or lump.',why:'Fingertips have the densest touch receptors and the smallest two-point threshold, so they find detail your palm misses.'},
    {do:'Don’t ignore pain that stays steady, even if a touch or pressure feeling faded.',why:'Touch receptors adapt and go quiet; pain receptors are built not to. Steady pain means something is still wrong.'}],
  tryIt:[{title:'two-point test (10 minutes, a partner)',steps:['Bend a paperclip so its two tips are 5 mm apart.','With your partner’s eyes closed, touch either one tip or both tips to their fingertip, palm and back of calf.','Widen the gap until they can tell two tips from one at each spot.'],look:'Fingertips tell two points apart a few millimeters apart. The calf needs several centimeters. That gap tracks how densely packed the receptors are.'}]};

/* ======================= skeleton (also used on SportsMedLab) ======================= */
/* Trotter–Gleser femur equation for white males, from sims/skeleton.js FORM.femur.CM: height = 2.32 x + 65.53 ± 3.94 cm */
const FEM=[2.32,65.53,3.94];
L.skeleton={
  goals:{
    bio:['The names and places of the major bones','Axial versus appendicular skeleton','The parts of a long bone and where bones grow','How one bone can estimate a person’s height'],
    honors:['Compact versus spongy bone, and red versus yellow marrow','Why the growth plate closes','Using a regression equation and its ± range'],
    ap:['The skeleton’s seven functions, including hormone production','Bone landmarks for muscle attachment','Limits of mid-20th-century reference data']},
  matters:'Every injury report, X-ray and forensic case names bones. Knowing the skeleton is also knowing your own frame: where growth happens, why bones heal, and how a single bone can identify a person.',
  steps:[
    {key:'whole',title:'The adult skeleton',set:{task:'explore',bone:'none',view:'front',zoom:'whole',labels:true},pause:true,
     see:'The adult skeleton from the front, with each bone group labeled. An adult has about 206 bones.',
     why:'Bones give the body its frame, protect organs, anchor muscles, store calcium and make blood cells. Each bone’s shape fits its job.'},
    {key:'groups',title:'Axial and appendicular',set:{task:'groups',sortMode:'show',view:'front',zoom:'whole',labels:true},pause:true,
     see:'Blue: the <b>axial skeleton</b>, 80 bones (skull, spine, ribs, sternum). Gold: the <b>appendicular skeleton</b>, 126 bones (the limbs and their girdles).',
     why:'Axial bones run down the body’s central axis and protect the brain, spinal cord and heart. Appendicular bones move you.'},
    {key:'femur',title:'The femur',set:{task:'explore',bone:'femur',view:'front',zoom:'whole',labels:true},pause:true,
     see:'The femur turns red: the thigh bone, from the hip socket to the knee. It is the longest and strongest bone in the body.',
     why:'Because the femur makes up so much of your leg, its length tracks your height closely. Forensic scientists use that.'},
    {key:'forearm',title:'Radius and ulna',set:{task:'explore',bone:'radius',zoom:'hand',view:'front',labels:true},pause:true,
     see:'Zoomed in on the forearm: the radius (red) runs on the thumb side, the ulna on the little-finger side.',
     why:'In anatomical position the thumb is lateral, so the radius is the lateral forearm bone. Bone names plus direction words pin down any spot.'},
    {key:'long',title:'Inside a long bone',set:{task:'long',part:'diaphysis',age:'adult'},pause:true,
     see:'A long bone opened up: a shaft (<b>diaphysis</b>) of hard compact bone around a hollow cavity, and wide ends (<b>epiphyses</b>) of spongy bone.',
     why:'Compact bone resists bending along the shaft. Spongy bone in the ends is light but strong, and holds red marrow.'},
    {key:'plate',title:'Where bones grow',set:{task:'long',part:'plate',age:'adult'},cause:{from:{age:'grow'},delay:3,dur:0.6,label:'Age'},
     see:'A teen’s bone has a red band of cartilage near each end: the <b>epiphyseal plate</b>. As an adult, the plate becomes a thin line.',
     why:'Bones grow longer at the plate. Once it turns to bone, usually by the early twenties, you stop getting taller.'},
    {key:'blood',title:'Bones make blood',set:{task:'func',fn:'blood'},pause:true,
     see:'Red shows where an adult makes blood cells: flat bones, the vertebrae, and the tops of the femur and humerus.',
     why:'Red marrow in these bones makes red blood cells, white blood cells and platelets: about 2 million red cells every second.'},
    {key:'height',title:'Height from one femur',set:{task:'explore',bone:'femur',view:'front',zoom:'whole',labels:true},speed:0.5,
     see:'The line is the lab’s formula for white males: height = 2.32 × femur + 65.53 cm. The dot: the 52.4 cm femur.',
     why:'Read across: about 187 cm (6 ft 2 in), give or take 4 cm. The band shows how real people scatter around the line.',
     so:{honors:'Mid-1900s data: use with caution.'},
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:120,x1:720,y0:120,y1:640},xr=[35,60],ys=h=>(h-140)/70;K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[35,'35'],[40,'40'],[45,'45'],[50,'50'],[55,'55'],[60,'60']],yt:[[ys(140),'140'],[ys(160),'160'],[ys(180),'180'],[ys(200),'200']],xl:'Femur length (cm)',yl:'Height (cm)'});
       const f=x=>FEM[0]*x+FEM[1],to=35+Math.min(25,tau*12);
       ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle=GREEN;ctx.beginPath();ctx.moveTo(K.X(B,xr,35),K.Y(B,ys(f(35)+FEM[2])));ctx.lineTo(K.X(B,xr,60),K.Y(B,ys(f(60)+FEM[2])));ctx.lineTo(K.X(B,xr,60),K.Y(B,ys(f(60)-FEM[2])));ctx.lineTo(K.X(B,xr,35),K.Y(B,ys(f(35)-FEM[2])));ctx.closePath();ctx.fill();ctx.restore();
       K.curve(ctx,B,xr,x=>ys(f(x)),to,GREEN,null,4);
       if(to>=60){const x=K.X(B,xr,52.4),hh=f(52.4),y=K.Y(B,ys(hh));ctx.save();ctx.strokeStyle=RED;ctx.setLineDash([5,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,B.y1);ctx.lineTo(x,y);ctx.lineTo(B.x0,y);ctx.stroke();ctx.restore();
         K.dot(ctx,x,y,RED,8);K.tagA(ctx,'52.4 cm → '+hh.toFixed(0)+' ± '+FEM[2].toFixed(0)+' cm',x-14,y-34,k,{s:13.5,hi:true},'r');}}}],
  useIt:[
    {do:'If you get an X-ray after an injury, ask which bone and which part of it is hurt.',why:'“A crack near the growth plate of the tibia” means something different from a crack in the shaft, especially for a teen who is still growing.'},
    {do:'Get calcium, vitamin D and weight-bearing exercise while you are young.',why:'Bones store minerals and build most of their density by your mid-twenties. What you build now has to last.'},
    {do:'Watch for news stories about identifying remains and look for how height was estimated.',why:'Forensic anthropologists use long-bone formulas like the one here, always with a ± range.'}],
  tryIt:[{title:'measure and predict (15 minutes, a partner)',steps:['Measure your partner’s femur from the bony bump at the side of the hip to the outer knee joint, in cm.','Use height = 2.32 × femur + 65.53 (or the lab’s formula for your partner).','Compare the prediction with their real height.'],look:'Most predictions land within a few centimeters, but not all. That is what the ± in the formula means: real people scatter around the line.'}]};

/* ======================= muscles ======================= */
L.muscles={
  goals:{
    bio:['Where the major muscles are, front and back','Origin and insertion: which end moves','Why muscles work in opposing pairs','The three kinds of muscle tissue'],
    honors:['Reading a muscle’s name for clues to its size, shape or direction','Agonist and antagonist','Muscles that cross two joints'],
    ap:['Innervation and actions of the major muscles','Landmarks for origins and insertions','Lever systems at the elbow']},
  matters:'Athletic trainers, physical therapists and doctors name muscles, not body parts. Knowing what a muscle attaches to tells you what it does and what stops working when it is injured.',
  steps:[
    {key:'chart',title:'The major muscles',set:{act:'explore',muscle:'deltoid',view:'both',zoom:'whole',names:true},pause:true,
     see:'The body’s major muscles from the front and back. The highlighted one is the <b>deltoid</b>, the cap of the shoulder.',
     why:'Each muscle has a name, a location and a job. Learn all three together and the names stop being a list to memorize.'},
    {key:'lats',title:'The latissimus dorsi',set:{act:'explore',muscle:'lats',view:'back',zoom:'whole',names:true},pause:true,
     see:'Back view: the latissimus dorsi, the widest back muscle, fans from the low spine and hip bone up to the front of the upper arm bone.',
     why:'It pulls the arm down and back. Torn, it weakens pull-ups, rowing and swimming strokes.'},
    {key:'flex',title:'Origin and insertion',set:{act:'pull',elbow:120},cause:{from:{elbow:30},delay:1.5,dur:2,label:'Elbow flexion'},
     see:'The biceps shortens and pulls on its <b>insertion</b> on the forearm. The forearm swings up; the <b>origin</b> at the shoulder stays put.',
     why:'Muscles only pull: the insertion on the moving bone is pulled toward the origin. The biceps is a flexor.'},
    {key:'pair',title:'Muscles work in pairs',set:{act:'pull',elbow:30},cause:{from:{elbow:120},delay:1.5,dur:2,label:'Elbow flexion'},
     see:'Now the triceps, on the back of the arm, shortens and straightens the elbow while the biceps relaxes and lengthens.',
     why:'A muscle can’t push, so each joint needs opposing muscles. Here the triceps is the <b>agonist</b> and the biceps is the <b>antagonist</b>.'},
    {key:'decode',title:'Names are clues',set:{act:'decoder',root:'maximus'},pause:true,
     see:'The name decoder: <i>maximus</i> means largest. The gluteus maximus lights up, the biggest of the three glute muscles.',
     why:'Names often describe size, shape, direction, location or number of heads: rectus (straight), deltoid (triangle), biceps (two heads).'},
    {key:'quads',lvl:'honors',title:'A muscle that crosses two joints',set:{act:'explore',muscle:'rectusfem',view:'front',zoom:'lower',names:true},pause:true,
     see:'The front of the thigh: rectus femoris down the middle, with the vastus lateralis outside it and the vastus medialis inside.',
     why:'The vasti cross only the knee. Rectus femoris also crosses the hip, so it straightens the knee and lifts the thigh.'},
    {key:'types',title:'Three kinds of muscle',set:{act:'types',mtype:'cardiac'},pause:true,
     see:'Skeletal muscle: long striped fibers. Cardiac muscle: branched striped cells joined at discs. Smooth muscle: spindle-shaped cells, no stripes.',
     why:'Skeletal muscle is voluntary. Cardiac and smooth muscle work without your choosing: the heart beats on its own, and smooth muscle moves food along.'}],
  useIt:[
    {do:'Read the muscle list on a gym machine and find each muscle on your own body.',why:'Machines are built around one movement, and the label names the muscles that do it. Feeling them work connects the name to the job.'},
    {do:'Stretch both sides of a joint, not just one.',why:'Muscles work in opposing pairs. A tight muscle on one side limits motion just as much as a weak one on the other.'},
    {do:'When a friend says they “pulled a hammy,” name which muscles they mean.',why:'The hamstrings are three muscles: biceps femoris, semitendinosus and semimembranosus. Trainers check them separately.'}],
  tryIt:[{title:'feel the pair (2 minutes)',steps:['Rest your left hand on your right biceps and slowly bend your right elbow.','Move your hand to the back of your upper arm and straighten the elbow against a table edge.'],look:'The biceps firms as the elbow bends, and the triceps firms as it straightens. One pulls each way; neither can push.'}]};

/* ======================= movements (also used on SportsMedLab) ======================= */
L.movements={
  goals:{
    bio:['Naming movements as pairs of opposites','Which plane each movement happens in','How to tell if a joint’s range of motion is normal'],
    honors:['Rotation, pronation and supination','The ankle’s own movement words','How joint shape limits movement'],
    ap:['Measuring range of motion with a goniometer','Describing a movement problem in one clinical line','Matching exercises to planes']},
  matters:'Coaches, trainers and therapists describe exercises and injuries by movement and plane. A shoulder that only flexes to 140° is something you can measure, write down and track as it heals.',
  steps:[
    {key:'start',title:'Start in anatomical position',run:tour('movements','Start in anatomical position'),pause:true,
     see:'The figure stands in anatomical position. The blue part moves, the dashed green arc is its normal range, and the red wedge shows how far it moved.',
     why:'Every movement is named from this starting pose, and each comes in a pair of opposites.'},
    {key:'flex',title:'Flexion in the sagittal plane',run:tour('movements','Flexion in the sagittal plane'),pause:true,
     see:'A biceps curl: the elbow bends to 110°. The plane picture shows the sagittal plane, splitting left from right.',
     why:'<b>Flexion</b> makes the angle at a joint smaller; <b>extension</b> opens it. Both happen in the sagittal plane, best seen from the side.'},
    {key:'abd',title:'Abduction in the frontal plane',run:tour('movements','Abduction in the frontal plane'),pause:true,
     see:'A lateral raise: the arm swings out to the side to 90°. The plane is now the frontal plane, seen from the front.',
     why:'<b>Abduction</b> moves a limb away from the midline; <b>adduction</b> brings it back. Both happen in the frontal plane.'},
    {key:'rot',title:'Rotation in the transverse plane',run:tour('movements','Rotation in the transverse plane'),pause:true,
     see:'Seen from above, with the elbow bent, the upper arm spins and the forearm swings out like a gate.',
     why:'Rotation turns a bone around its own long axis. It happens in the transverse plane, the same plane as a trunk twist.'},
    {key:'pro',lvl:'honors',title:'Pronation and supination',run:tour('movements','Pronation and supination'),pause:true,
     see:'The palm turns down: <b>pronation</b>. Turning it up is <b>supination</b>.',
     why:'The radius crosses over the ulna at a pivot joint near the elbow. The elbow’s hinge isn’t doing this.'},
    {key:'ankle',title:'The ankle has its own words',run:tour('movements','The ankle has its own words'),pause:true,
     see:'The sole turns inward: <b>inversion</b>. Pointing the toes is plantarflexion; pulling them up is dorsiflexion.',
     why:'Rolling the ankle inward is the most common ankle sprain. The ligaments on the outside get stretched.'},
    {key:'hook',title:'The hitter’s shoulder',set:{view:'move',joint:'shoulder',move:'flexion',angle:140,cam:'auto'},pause:true,
     see:'Shoulder flexion stops at 140°. The dashed green arc runs to 180°, the normal range. The red wedge stops 40° short.',
     why:'Write: “Limited shoulder flexion, 140° of 180°, sagittal plane.” Her other arm reaches 180°, so this is a real loss.',
     overlay(sim,ctx,LH,k){const K=BioLab.lg;K.tagA(ctx,'40° short of normal',20,LH-40,k,{s:13.5,hi:true},'l');}},
    {key:'types',title:'Structure limits movement',run:tour('movements','Structure limits movement'),pause:true,
     see:'A ball-and-socket joint, like the shoulder and hip: a round head in a cup.',
     why:'Shape sets what a joint can do. A ball and socket moves in every plane, a hinge in one, a pivot only spins, and a saddle rocks in two.'}],
  useIt:[
    {do:'When a trainer says an exercise is “frontal plane,” picture which way the arm or leg moves.',why:'Programs mix planes on purpose. Lateral raises and side lunges are frontal; curls and squats are sagittal; twists and throws are transverse.'},
    {do:'After an injury, ask what your range of motion is and what normal is.',why:'Range of motion in degrees is how recovery is tracked. Comparing with the uninjured side shows what is normal for you.'},
    {do:'Warm up through all three planes before a sport that twists, like tennis or volleyball.',why:'Many injuries happen in the plane you didn’t prepare: a twist or a side step after only forward-and-back warm-ups.'}],
  tryIt:[{title:'name that movement (5 minutes, a partner)',steps:['One partner does a movement: a wave, a kick, a head shake, a toe raise.','The other names the movement, the joint and the plane.','Switch, and try one that combines two movements.'],look:'Every everyday motion breaks down into named pairs in three planes. Combined motions, like throwing, use all three.'}]};

/* ======================= contraction ======================= */
const coFoc=n=>sim=>((sim.vis&&sim.vis.ly&&sim.vis.ly[n])||[0,0,800,500]);
/* length–tension table copied from sims/contraction.js LT: [sarcomere length µm, share of best overlap] */
const LT=[[1.27,0],[1.67,.84],[2,1],[2.25,1],[3.65,0]];
const ltF=x=>{if(x<=LT[0][0]||x>=LT[4][0])return 0;for(let i=0;i<4;i++)if(x<=LT[i+1][0])return LT[i][1]+(LT[i+1][1]-LT[i][1])*(x-LT[i][0])/(LT[i+1][0]-LT[i][0]);return 0;};
L.contraction={
  goals:{
    bio:['How a sarcomere shortens: filaments sliding past each other','What calcium and ATP each do','Why a fast pace tires a muscle in seconds and a slow pace doesn’t'],
    honors:['The cross-bridge cycle, step by step','How signals add up to tetanus','The length–tension curve'],
    ap:['Creatine phosphate, glycolysis and aerobic respiration as ATP sources','Fast and slow twitch fibers','Why force falls when filaments overlap too little or too much']},
  matters:'Every move you make, every heartbeat and every breath runs on this cycle. It also explains cramps, the burn in a hard set, rigor mortis, and why sprinters and distance runners train differently.',
  steps:[
    {key:'zoom',title:'From muscle to sarcomere',run:tour('contraction','From muscle to sarcomere'),focus:coFoc('strip'),speed:0.5,pause:true,
     see:'The strip at the top zooms in: muscle, then a bundle, a fiber, a myofibril, and a <b>sarcomere</b>, the unit that shortens.',
     why:'A muscle shortens because millions of sarcomeres in a row each shorten a tiny bit at the same time.'},
    {key:'rest',title:'At rest',set:{rate:0},focus:coFoc('sarc'),speed:0.5,pause:true,
     see:'Thin filaments (<b>actin</b>) reach in from each side. The thick filament (<b>myosin</b>) sits in the middle with its heads ready, but no heads are attached.',
     why:'A protein strand, tropomyosin, covers the binding sites on actin. The heads have nothing to grab.'},
    {key:'signal',title:'The nerve signal arrives',set:{rate:2},focus:coFoc('nerve'),speed:0.3,
     see:'A motor neuron fires. The signal spreads over the fiber, and its store, the sarcoplasmic reticulum, releases calcium.',
     why:'The nerve doesn’t pull anything itself. It is a switch that lets calcium out.'},
    {key:'calcium',title:'Calcium uncovers actin',set:{rate:2},focus:coFoc('sarc'),speed:0.3,
     see:'Teal calcium dots flood around the filaments. The amber tropomyosin line shifts off the binding sites.',
     why:'Calcium binds to troponin, which drags tropomyosin out of the way. Now myosin heads can reach actin.'},
    {key:'pull',title:'Cross-bridges pull',set:{rate:30},focus:coFoc('sarc'),speed:0.5,
     see:'Heads grab actin and swing: the power stroke. The filaments keep their length, but slide past each other, so the sarcomere shortens.',
     why:'Each stroke pulls the thin filaments toward the middle. This is the <b>sliding filament</b> model.'},
    {key:'atp',title:'ATP lets go and recocks',set:{rate:30},focus:coFoc('low'),speed:0.3,
     see:'A new ATP binds and the head lets go. Splitting that ATP recocks the head for its next stroke.',
     why:'ATP pays for letting go as well as pulling. With no ATP, heads stay stuck: that is rigor mortis.'},
    {key:'sum',title:'Signals add up',set:{rate:80},focus:coFoc('tr'),speed:0.5,
     see:'Signals now come fast. Each twitch starts before the last one ends, and force climbs into a smooth, steady pull: <b>tetanus</b>.',
     why:'Your nervous system grades force this way, and by calling in more fibers at once.'},
    {key:'lt',lvl:'honors',title:'The length–tension curve',set:{rate:30},speed:0.5,
     see:'Force against sarcomere length. The flat top, about 2.0 to 2.25 µm, is where every head can reach actin.',
     why:'Stretched too far, filaments barely overlap, so fewer heads grab. Too short, filaments crash into each other. Either way force falls.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:120,x1:720,y0:70,y1:400},xr=[1.2,3.8];K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[1.5,'1.5'],[2,'2.0'],[2.5,'2.5'],[3,'3.0'],[3.5,'3.5']],yt:[[0,'0'],[.5,'50'],[1,'100']],xl:'Sarcomere length (µm)',yl:'Force (% of max)'});
       const to=1.2+Math.min(2.6,tau*1.2);K.curve(ctx,B,xr,ltF,to,RED,null,4);
       if(to>=3.8){[[2.1,'Best overlap','l',12,-24],[3.4,'Stretched: little overlap','r',-12,-28],[1.5,'Crowded','l',12,24]].forEach(([x,s,a,dx,dy])=>{const X=K.X(B,xr,x),Y=K.Y(B,ltF(x));K.dot(ctx,X,Y,RED,6);K.tagA(ctx,s,X+dx,Y+dy,k,{s:12.5},a);});}}},
    {key:'hook',title:'The clothespin: all out',set:{scene:'energy',fiber:'mixed',effort:100},fresh:true,speed:2,
     see:'All out, a mixed muscle uses up its creatine phosphate in about 10 seconds. Force drops and lactic acid builds; the burn comes near 16 s.',
     why:'Fast fibers burn ATP faster than oxygen can resupply it. Without oxygen, glucose yields just 2 ATP plus lactic acid.',
     overlay(sim,ctx,LH,k){card(ctx,k,530,LH-10,260,[[FL(sim,'eF',0),{w:800}],[FL(sim,'tf')],[FL(sim,'tb'),{c:RED}]],{up:true});}},
    {key:'pace',title:'A pace you can hold',set:{scene:'energy',fiber:'mixed',effort:30},fresh:true,speed:3,
     see:'The same muscle at 30% effort. Creatine phosphate dips and levels off, force holds at 30%, and no burn appears.',
     why:'At a slow pace, oxygen keeps up: nearly all the ATP comes from aerobic respiration, 38 per glucose. That is why the pace matters.',
     overlay(sim,ctx,LH,k){card(ctx,k,530,LH-10,260,[[FL(sim,'eF',0),{w:800}],[FL(sim,'aerShare',0),{c:GREEN}],[FL(sim,'tb')]],{up:true});}}],
  useIt:[
    {do:'For a long effort, start slower than you think you need to.',why:'Below your aerobic limit, oxygen keeps up and lactic acid stays low. Go out too fast and fatigue arrives in seconds, not minutes.'},
    {do:'Rest 2 to 3 minutes between heavy sets or sprints.',why:'Creatine phosphate, your fastest ATP backup, takes a few minutes to rebuild. Short rests mean the next set starts half empty.'},
    {do:'Stretch to a comfortable length, not to the limit, before you need power.',why:'The length–tension curve shows muscles are strongest near their resting length. Overstretched sarcomeres make less force.'}],
  tryIt:[{title:'the clothespin test (5 minutes)',steps:['Squeeze a clothespin open and shut as fast as you can. Note when your hand starts to burn.','Rest 3 minutes. Now squeeze at a slow, steady pace and see how long you can keep going.'],look:'Fast squeezing burns out in well under a minute; slow squeezing can go for minutes. Same muscle, different ATP sources.'}]};

/* ======================= heart ======================= */
const hp=title=>({set:{view:'path',auto:false},run:tour('heart',title)});
L.heart={
  goals:{
    bio:['The path of blood through the heart’s four chambers','Why blood turns bright red in the lungs','How much blood your heart moves in a minute'],
    honors:['Arteries versus veins, and the pulmonary exception','Cardiac output = heart rate × stroke volume','What a leaky valve does to the flow'],
    ap:['Ejection fraction','Why the left ventricle has the thickest wall','The two circuits as one loop in series']},
  matters:'Your heart beats about 100,000 times a day. Heart disease is the leading cause of death in the U.S., and CPR, blood pressure checks and fitness all make sense once you can follow one red blood cell around the loop.',
  steps:[
    Object.assign(hp('Oxygen-poor blood comes home'),{key:'home',title:'Oxygen-poor blood comes home',focus:[[210,50,90,170],[210,300,60,250]],speed:1,
     see:'A red blood cell, ringed in white, returns from the body through a vena cava. It has given up oxygen, so it is dark red.',
     why:'Blood low in oxygen is dark red, never blue. Veins only look blue through your skin.',
     overlay(sim,ctx,LH,k){card(ctx,k,560,LH-10,230,[[FL(sim,'code',0),{w:800}]],{up:true});}}),
    Object.assign(hp('Right atrium to right ventricle'),{key:'ra',title:'Right atrium to right ventricle',focus:[238,195,150,290],speed:1,
     see:'The cell enters the right atrium, then falls through the tricuspid valve into the right ventricle.',
     why:'Valves let blood flow one way only. The ventricle relaxes and fills before it squeezes.'}),
    Object.assign(hp('Out to the lungs'),{key:'pa',title:'Out to the lungs',focus:[[260,310,120,170],[340,100,50,220],[150,100,210,60]],speed:1,
     see:'The right ventricle squeezes. The cell leaves through a pulmonary artery toward the lungs.',
     why:'Arteries carry blood away from the heart. The pulmonary artery is the one artery that carries oxygen-poor blood.'}),
    Object.assign(hp('The lungs change the color'),{key:'lung',title:'The lungs change the color',focus:[[10,130,150,220],[640,130,150,220]],speed:1,
     see:'In the lung capillaries the cell drops carbon dioxide, picks up oxygen and turns bright red.',
     why:'Hemoglobin binds oxygen in the lungs and changes color. The oxygen reading on the card jumps.',
     overlay(sim,ctx,LH,k){card(ctx,k,560,LH-10,230,[[FL(sim,'code',0),{w:800,c:RED}]],{up:true});}}),
    Object.assign(hp('Back to the left atrium'),{key:'la',title:'Back to the left atrium',focus:[[520,180,140,100],[425,180,120,110]],speed:1,
     see:'Pulmonary veins carry the bright red blood back to the left atrium.',
     why:'They are veins because they carry blood toward the heart, even though their blood is rich in oxygen.'}),
    Object.assign(hp('The strongest pump'),{key:'lv',title:'The strongest pump',focus:[[405,175,160,345]],speed:1,
     see:'The cell falls through the bicuspid (mitral) valve into the left ventricle. Its thick wall squeezes and pushes the cell up the aorta.',
     why:'The left ventricle pushes blood around the whole body, so it has the thickest, strongest wall.'}),
    Object.assign(hp('Out to the body and home'),{key:'body',title:'Out to the body and home',focus:[[180,0,450,125],[575,80,70,480],[120,545,530,55]],speed:1,
     see:'The aorta branches into smaller arteries and capillaries. Oxygen leaves, and the cell turns dark red again on its way home.',
     why:'Two circuits in a row: lungs, then body. A full loop takes about a minute at rest.'}),
    {key:'co',title:'Cardiac output',set:{view:'output',hr:72,sv:70},speed:1,focus:[370,0,430,600],
     see:'Each beat pumps 70 mL (the stroke volume). At 72 beats a minute, the jug fills with 5.0 L of blood every minute.',
     why:'Cardiac output = heart rate × stroke volume. 72 × 70 mL ≈ 5 L/min: about all of your blood, every minute.'},
    {key:'graph',title:'Output rises with heart rate',set:{view:'output',hr:72,sv:70},speed:0.5,
     see:'Cardiac output against heart rate: the solid line for a resting stroke volume of 70 mL, the dashed line for 100 mL during exercise.',
     why:'Each line is heart rate × stroke volume. In hard exercise, rate and stroke volume both rise, so output can triple.',
     overlay(sim,ctx,LH,k,tau){const K=BioLab.lg,B={x0:120,x1:720,y0:80,y1:500},xr=[40,200],ys=c=>c/20;K.dim(ctx,LH);
       K.axes(ctx,B,k,{xr,xt:[[40,'40'],[80,'80'],[120,'120'],[160,'160'],[200,'200']],yt:[[0,'0'],[ys(5),'5'],[ys(10),'10'],[ys(15),'15'],[ys(20),'20']],xl:'Heart rate (beats per minute)',yl:'Cardiac output (L/min)'});
       const to=40+Math.min(160,tau*70);K.curve(ctx,B,xr,h=>ys(h*0.07),to,RED,null,4);K.curve(ctx,B,xr,h=>ys(h*0.1),to,RED,[8,6],3);
       if(to>=200){const p=[[72,0.07,'Rest: 72 × 70 mL = 5.0 L/min','l',12,-26],[150,0.1,'Hard exercise: 150 × 100 mL = 15 L/min','r',-12,-28]];
         p.forEach(([h,s,t,a,dx,dy])=>{const x=K.X(B,xr,h),y=K.Y(B,ys(h*s));K.dot(ctx,x,y,RED,7);K.tagA(ctx,t,x+dx,y+dy,k,{s:12.5,hi:true},a);});}}},
    {key:'leak',lvl:'honors',title:'What breaks: a leaky valve',set:{view:'breaks',brk:'mitral',leak:30,hr:72,sv:70},speed:1,
     see:'The bicuspid valve doesn’t close all the way. With each squeeze, some blood leaks back into the left atrium instead of going up the aorta.',
     why:'Less blood reaches the body for the same work, so the heart must beat harder or faster.'}],
  useIt:[
    {do:'Take your resting pulse for 15 seconds and multiply by 4, then estimate your cardiac output.',why:'Multiply by about 70 mL per beat. Fit people have a lower resting rate because each beat moves more blood.'},
    {do:'Learn hands-only CPR: hard, fast pushes in the center of the chest.',why:'Pressing the sternum squeezes the heart behind it and moves blood to the brain when the heart can’t.'},
    {do:'If a doctor mentions a heart murmur, ask which valve.',why:'A murmur is often the sound of blood leaking through or squeezing past a valve, like the leaky valve here.'}],
  tryIt:[{title:'pulse before and after (10 minutes)',steps:['Count your pulse for 15 seconds at rest and multiply by 4.','Do jumping jacks for 1 minute and count again right away, then every minute after.'],look:'Your rate jumps with exercise and falls back within a few minutes. Fitter hearts recover faster, because each beat moves more blood.'}]};

BioLab.addLearn(L);

/* ---- 7 more why questions for homeostasis (it had 5); appended once review.js's set is in place ---- */
const HOQ=[
  {id:'lnSource',kind:'test',lvl:'bio',q:'You skip lunch and run for 30 minutes. Where does most of the glucose that keeps your blood sugar up come from?',
   choices:['Glycogen broken down in your liver','Sugar made by your muscles as they work','Glucose your lungs pull from the air','Protein broken down in your blood'],correct:0,
   steps:['Exercise pulls glucose out of the blood.','The pancreas releases glucagon as glucose dips.','Glucagon tells the liver to break down glycogen and release glucose.']},
  {id:'lnPair',kind:'test',lvl:'bio',q:'Why does the body use two hormones, insulin and glucagon, for blood sugar instead of one?',
   choices:['One hormone can only push glucose in one direction','Two hormones make blood sugar rise twice as fast','Insulin works only at night, glucagon only by day','Each hormone controls a different kind of sugar'],correct:0,
   steps:['Insulin lowers blood glucose.','Glucagon raises it.','Opposite signals let the body correct a change in either direction.']},
  {id:'lnPeak',kind:'test',lvl:'bio',q:'In the model, a healthy 75 g meal makes blood glucose peak at about what level?',num:{ans:130,tol:10,unit:'mg/dL'},
   steps:['Fasting glucose sits near 90 mg/dL.','After the meal, glucose climbs as the gut absorbs it.','It peaks near 130 mg/dL about 40 minutes in, then insulin brings it down.']},
  {id:'lnT1',kind:'test',lvl:'honors',q:'In type 1 diabetes the beta cells are destroyed. After a meal, which change would you expect?',
   choices:['Glucose falls quickly as glucagon stops','Glucose climbs high and stays high','Glucose rises a little, then insulin fixes it','Glucose stays flat, since no insulin is needed'],correct:1,
   steps:['Beta cells make insulin.','With no insulin, cells take in little glucose and the liver keeps releasing it.','Glucose climbs past 200 mg/dL and stays high.']},
  {id:'lnUrine',kind:'test',lvl:'honors',q:'Why can sugar show up in the urine of someone with untreated diabetes?',
   choices:['The kidneys make extra sugar when insulin is low','Blood glucose is so high the kidneys can’t take it all back','Glucagon carries sugar straight to the bladder','Sweat glands send sugar to the kidneys'],correct:1,
   steps:['Kidneys filter glucose out of the blood and normally reabsorb all of it.','Above about 180 mg/dL, reabsorption can’t keep up.','The extra glucose spills into the urine.']},
  {id:'lnParts',kind:'test',lvl:'honors',q:'In temperature control, what is the hypothalamus?',
   choices:['The effector that makes the body’s heat','The sensor that feels the skin cooling','The control center, holding the set point','The stimulus that sets off the loop'],correct:2,
   steps:['Sensors in the skin and brain detect temperature.','The hypothalamus compares it with the 37 °C set point.','It signals effectors: sweat glands, skin vessels, muscles.']},
  {id:'lnSweat',kind:'test',lvl:'bio',q:'On a 40 °C day you exercise hard. Which response does the most to keep your core near 37 °C?',
   choices:['Shivering to keep muscles warm','Narrowing skin blood vessels','Breathing more slowly to hold heat in','Sweating, so evaporation carries heat away'],correct:3,
   steps:['Hot air can’t take heat from your skin.','Sweat evaporates and carries heat off the skin.','Wider skin vessels bring warm blood to the surface to be cooled.']}];
const _start=BioLab.start;
BioLab.start=function(){const r=_start.apply(this,arguments);const d=DEF('homeostasis');
  if(d&&d.review&&Array.isArray(d.review.questions)&&!d.review.questions.some(q=>q.id==='lnSource'))d.review.questions.push(...HOQ);return r;};
})();
