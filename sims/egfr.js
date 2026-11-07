(function(){
'use strict';
const {clamp,rr,txt,pill,atLeast,PAL,FONT,axes,legend,fmtNum}=BioLab.h;

/* Kidney math: the 2009 and 2021 CKD-EPI creatinine equations (Inker et al., NEJM 2021; Levey et al., Ann Intern Med 2009).
   eGFR in mL/min/1.73 m². Scr in mg/dL. Waiting time on the kidney list typically starts counting at eGFR ≤ 20. */
function e21(s,a,f){const k=f?0.7:0.9,al=f?-0.241:-0.302;return 142*Math.pow(Math.min(s/k,1),al)*Math.pow(Math.max(s/k,1),-1.2)*Math.pow(0.9938,a)*(f?1.012:1);}
function e09(s,a,f,b){const k=f?0.7:0.9,al=f?-0.329:-0.411;return 141*Math.pow(Math.min(s/k,1),al)*Math.pow(Math.max(s/k,1),-1.209)*Math.pow(0.993,a)*(f?1.018:1)*(b?1.159:1);}
const LINE=20;
/* creatinine at which an equation reaches 20 (eGFR falls as creatinine rises, so bisection works) */
function cross(fn){let lo=0.2,hi=30;for(let i=0;i<70;i++){const m=(lo+hi)/2;if(fn(m)>LINE)lo=m;else hi=m;}return (lo+hi)/2;}
const F=sim=>sim.p.sex==='F',B=sim=>sim.p.black==='yes';
const v21=sim=>e21(sim.p.scr,sim.p.age,F(sim)),v09=sim=>e09(sim.p.scr,sim.p.age,F(sim),B(sim)),v09n=sim=>e09(sim.p.scr,sim.p.age,F(sim),false);
const c21=sim=>cross(s=>e21(s,sim.p.age,F(sim))),c09=sim=>cross(s=>e09(s,sim.p.age,F(sim),B(sim)));
/* Waiting time lost if function keeps falling at the assumed rate, measured on the 2021 scale:
   from the day the 2021 equation reaches 20 to the day the 2009 equation (as recorded) does. */
function gapMonths(sim){const at=e21(c09(sim),sim.p.age,F(sim));return Math.max(0,(LINE-at)/sim.p.rate*12);}
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const key=sim=>[sim.p.scr,sim.p.age,sim.p.sex,sim.p.black].join('|');
const CALLS={both:'Both reports',only21:'Only the 2021 report',only09:'Only the 2009 report',neither:'Neither report'};
function truth(sim){const a=v21(sim)<=LINE,b=v09(sim)<=LINE;return a&&b?'both':a?'only21':b?'only09':'neither';}
const shown=sim=>sim.st&&sim.st.revealed;
const BTN=[['both','Both'],['only21','Only 2021'],['only09','Only 2009'],['neither','Neither']];
const btnRect=(i,sY,sH,X0,X1)=>{const g=8,w=(X1-X0-3*g)/4;return [X0+i*(w+g),sY+4,w,sH-8];};
const callNow=sim=>{const c=sim.st&&sim.st.call;return c&&c.key===key(sim)?c:null;};
function wrap(ctx,s,x,y,w,o){o=o||{};const size=o.s||13,lh=o.lh||size*1.3;ctx.font=(o.w||400)+' '+size+'px '+FONT;let line='',yy=y;
  String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;line=word;}else line=t;});
  if(line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;}return yy;}
function realTerms(sim){const s=sim.p.scr,a=c21(sim),b=c09(sim);
  if(!B(sim))return 'With race recorded as not Black, the 2009 equation applies no race multiplier. It puts him at '+f1(v09(sim))+', a little <i>below</i> the 2021 result of '+f1(v21(sim))+'.';
  return 'The 1.159 multiplier means his creatinine has to reach <b>'+f2(b)+' mg/dL</b> before the 2009 report hits 20, instead of '+f2(a)+' mg/dL under 2021. If his kidneys kept losing '+fmtNum(sim.p.rate,1)+' points a year (an assumption), that is about <b>'+Math.round(gapMonths(sim))+' months</b> of waiting time not counted.';}

const SIM={
 id:'egfr',hash:'egfr',apUnit:0,order:3,kind:'Learning tool',tab:'Kidney math: eGFR',prereq:['homeostasis'],
 card:'Enter a blood creatinine, age and sex. See the kidney score under the 2009 and 2021 equations, and who reaches the transplant waiting-list line.',
 title:'Kidney math: who counts as sick enough?',
 lede:{bio:'Your kidneys filter waste out of your blood. A lab can’t watch them filter, so it estimates how well they work from one blood test, your age and your sex. Until 2021, one common equation also changed the answer if the patient was recorded as Black.',
  honors:'eGFR is an estimated glomerular filtration rate. Creatinine is a waste product the kidneys clear, so more creatinine in the blood means a lower eGFR. Compare the 2009 CKD-EPI equation, which multiplied by 1.159 for Black patients, with the race-free 2021 refit.',
  ap:'Both CKD-EPI equations are piecewise power laws in Scr/κ, with an age term. Find the creatinine where each crosses eGFR 20, and turn the gap into months of waiting time under an assumed rate of decline.'},
 scale:'One blood test. eGFR is in mL per minute per 1.73 m² of body surface; healthy young adults are often near 100.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'The lab report',
 controls:[
  {id:'scr',label:'Blood creatinine',type:'range',min:0.5,max:8,step:0.05,def:3.4,d:2,unit:' mg/dL',help:'A waste product from muscle. Healthy adults are often around 0.6 to 1.2 mg/dL.'},
  {id:'age',label:'Age',type:'range',min:18,max:90,step:1,def:60,unit:' years',help:'These equations are for adults 18 and older.'},
  {id:'sex',label:'Sex',type:'seg',def:'M',options:[{v:'M',l:'Male'},{v:'F',l:'Female'}]},
  {id:'black',label:'Race on the lab order (only the 2009 equation uses it)',type:'seg',def:'yes',options:[{v:'yes',l:'Black'},{v:'no',l:'Not Black'}]},
  {id:'call',label:'Your call: whose eGFR is 20 or lower?',type:'seg',def:'both',noTrial:true,options:[{v:'both',l:'Both'},{v:'only21',l:'Only 2021'},{v:'only09',l:'Only 2009'},{v:'neither',l:'Neither'}],help:'Make your call before you look, then press Lock in my call.'},
  {id:'rate',label:'Assumed loss of kidney function',type:'range',min:1,max:8,step:0.5,def:3,d:1,unit:' points a year',lvl:'honors',help:'An assumption for illustration. Real decline varies a lot from person to person.'}
 ],
 actions:[
  {id:'lock',label:'Lock in my call',primary:true,run(sim){sim.st.call={pick:sim.p.call,key:key(sim),truth:truth(sim)};sim.st.revealed=true;}},
  {id:'show',label:'Show the math',run(sim){sim.st.revealed=true;}},
  {id:'hide',label:'New call: hide the results',run(sim){sim.st.revealed=false;sim.st.call=null;}}
 ],
 init(){return {revealed:false,call:null};},step(){},
 metrics:[
  {id:'e21',label:'eGFR, 2021 equation (no race)',unit:'mL/min/1.73 m²',d:1,min:0,max:130,get:v21},
  {id:'e09',label:'eGFR, 2009 equation as recorded',unit:'mL/min/1.73 m²',d:1,min:0,max:130,get:v09},
  {id:'wait',label:'Waiting time can start (eGFR ≤ 20)?',text:true,noTrial:true,get:sim=>'2021: '+(v21(sim)<=LINE?'yes':'no')+' · 2009: '+(v09(sim)<=LINE?'yes':'no')},
  {id:'diff',label:'2009 minus 2021',unit:'points',d:1,lvl:'honors',min:-10,max:20,get:sim=>v09(sim)-v21(sim)},
  {id:'c21',label:'Creatinine where 2021 reaches 20',unit:'mg/dL',d:2,lvl:'honors',min:0,max:null,get:c21},
  {id:'c09',label:'Creatinine where 2009 reaches 20',unit:'mg/dL',d:2,lvl:'honors',min:0,max:null,get:c09},
  {id:'e09n',label:'eGFR, 2009 equation with no race multiplier',unit:'mL/min/1.73 m²',d:1,lvl:'ap',min:0,max:130,get:v09n},
  {id:'months',label:'Waiting time not counted (at the assumed decline)',unit:'months',d:1,lvl:'ap',min:0,max:null,get:gapMonths}
 ],
 graphs:[{id:'curve',label:'eGFR vs. creatinine',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const a=sim.p.age,f=F(sim),b=B(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:8,ymin:0,ymax:140,xl:'Blood creatinine (mg/dL)',yl:'eGFR (mL/min/1.73 m²)'});
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(LINE));ctx.lineTo(ax.X(8),ax.Y(LINE));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'eGFR 20',ax.X(8)-4,ax.Y(LINE)-6,{s:12,c:PAL['s1'],a:'right',w:700});
  const curve=(fn,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();for(let s=0.3;s<=8.001;s+=0.05){const px=ax.X(s),py=ax.Y(Math.min(140,fn(s)));s<0.31?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
  if(b&&atLeast('ap'))curve(s=>e09(s,a,f,false),PAL['cv-soft'],[3,4]);
  curve(s=>e21(s,a,f),PAL['s2']);curve(s=>e09(s,a,f,b),PAL['s4'],b?[]:[8,5]);
  if(shown(sim)){const dot=(v,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(sim.p.scr),ax.Y(Math.min(140,v)),5.5,0,7);ctx.fill();};dot(v21(sim),PAL['s2']);dot(v09(sim),PAL['s4']);}
  const L=[{label:'2021 (no race)',color:PAL['s2']},{label:'2009 as recorded',color:PAL['s4']}];if(b&&atLeast('ap'))L.push({label:'2009, no multiplier',color:PAL['cv-soft'],dash:true});legend(ctx,box.L+12,box.T+12,L);},
 draw(sim,ctx,vdt,k){const W=800,H=450,p=sim.p,r21=v21(sim),r09=v09(sim),sh=shown(sim);sim.vis.k=k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: the kidneys and the lab report */
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,12,12,262,H-24,14);ctx.fill();
  const big=k>1.3,kid=(cx,cy,sc,flip)=>{ctx.save();ctx.translate(cx,cy);ctx.scale(flip*sc,sc);ctx.fillStyle='#a6505c';ctx.beginPath();ctx.moveTo(0,-52);ctx.bezierCurveTo(44,-56,50,-6,40,22);ctx.bezierCurveTo(30,52,-4,60,-14,40);ctx.bezierCurveTo(-20,28,-4,18,-6,4);ctx.bezierCurveTo(-8,-10,-22,-14,-20,-30);ctx.bezierCurveTo(-18,-46,-8,-52,0,-52);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#e9b7bd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,2);ctx.quadraticCurveTo(12,0,22,-20);ctx.moveTo(-8,2);ctx.quadraticCurveTo(14,8,24,22);ctx.stroke();ctx.restore();};
  const rows=[['Creatinine',f2(p.scr)+' mg/dL'],['Age',p.age+' years'],['Sex',p.sex==='F'?'Female':'Male'],['Race on order',p.black==='yes'?'Black':'Not Black']];
  if(!big){kid(92,92,1,-1);kid(194,92,1,1);
   ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(104,96);ctx.quadraticCurveTo(130,130,138,170);ctx.moveTo(182,96);ctx.quadraticCurveTo(156,130,148,170);ctx.stroke();
   txt(ctx,'Kidneys clear creatinine',143,180+12*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
   ctx.fillStyle=PAL['card'];rr(ctx,26,214,234,H-240,10);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
   txt(ctx,'Lab report',40,240,{s:14*k,w:800});
   rows.forEach((r,i)=>{const y=272+i*30*Math.min(k,1.25);txt(ctx,r[0],40,y,{s:12*k,c:PAL['cv-soft']});txt(ctx,r[1],246,y,{s:13*k,w:700,a:'right'});});
   txt(ctx,'Stays on this device',143,H-34,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  else{kid(110,62,.6,-1);kid(176,62,.6,1);
   ctx.fillStyle=PAL['card'];rr(ctx,24,112,238,H-136,10);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
   const step=(H-150)/4;rows.forEach((r,i)=>{const y=112+14+12*k+i*step;txt(ctx,r[0],36,y,{s:12*k,c:PAL['cv-soft']});txt(ctx,r[1],36,y+14*k+4,{s:13*k,w:700});});}
  /* right: the eGFR scale with stage bands and the waiting-list line */
  const X0=300,X1=780,MAX=120,X=v=>X0+clamp(v,0,MAX)/MAX*(X1-X0),BY=66+12*k,BH=28;
  txt(ctx,'eGFR scale (mL/min/1.73 m²)',X0,30,{s:13*k,w:800});
  const bands=[[0,15,'s1',.55],[15,30,'s1',.32],[30,60,'s4',.32],[60,90,'s3',.22],[90,MAX,'s3',.38]];
  bands.forEach(b=>{ctx.fillStyle=PAL[b[2]];ctx.globalAlpha=b[3];ctx.fillRect(X(b[0]),BY,X(b[1])-X(b[0]),BH);});ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(X0,BY,X1-X0,BH);
  const TY=BY+BH+18+12*k;[0,30,60,90,120].forEach(v=>txt(ctx,String(v),X(v),TY,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(LINE),BY-14);ctx.lineTo(X(LINE),BY+BH+4);ctx.stroke();
  txt(ctx,'20: waiting time can start',X(LINE)+6,BY-6,{s:12*k,w:700,c:PAL['s1']});
  if(sh){const mark=(v,col,up)=>{const x=X(v);ctx.fillStyle=col;ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.beginPath();if(up){ctx.moveTo(x,BY+BH*.5);ctx.lineTo(x-8,BY+1);ctx.lineTo(x+8,BY+1);}else{ctx.moveTo(x,BY+BH*.5);ctx.lineTo(x-8,BY+BH-1);ctx.lineTo(x+8,BY+BH-1);}ctx.closePath();ctx.fill();ctx.stroke();};
   mark(r21,PAL['s2'],true);mark(r09,PAL['s4'],false);}
  /* result cards and the call strip */
  const sH=Math.max(46,30*k+16),sY=H-12-sH,cy=TY+14,ch=Math.min(170,sY-12-cy),cw=(X1-X0-16)/2;
  const card=(x,title,sub,v,col)=>{ctx.fillStyle=PAL['card'];rr(ctx,x,cy,cw,ch,12);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
   txt(ctx,title,x+14,cy+22*k,{s:13*k,w:800,c:col});txt(ctx,sub,x+14,cy+22*k+17*k,{s:12*k,c:PAL['cv-soft']});
   const vy=cy+22*k+17*k+(ch-39*k-26*k)/2+14*Math.min(k,1.3);
   if(!sh){txt(ctx,'?',x+cw/2,vy,{s:36*Math.min(k,1.3),w:800,a:'center',c:PAL['cv-soft']});return;}
   txt(ctx,f1(v),x+14,vy,{s:32*Math.min(k,1.3),w:800});
   const ok=v<=LINE;pill(ctx,ok?'20 or lower':'Above 20 by '+f1(v-LINE),x+cw/2,cy+ch-14*k,ok?PAL['s1']:PAL['card2'],ok?'#fff':PAL['cv-ink'],12*k);};
  card(X0,'2021 equation','No race term',r21,PAL['s2']);
  card(X0+cw+16,'2009 equation',B(sim)?'× 1.159 for Black':'No multiplier applied',r09,PAL['s4']);
  const c=callNow(sim);
  if(!sh){BTN.forEach((b,i)=>{const r=btnRect(i,sY,sH,X0,X1);ctx.fillStyle=PAL['card'];rr(ctx,r[0],r[1],r[2],r[3],9);ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.stroke();txt(ctx,b[1],r[0]+r[2]/2,r[1]+r[3]/2+1,{s:12*k,w:700,a:'center',b:'middle'});});
   if(k<1.3)txt(ctx,'Your call: whose eGFR is 20 or lower? Click one.',X0,sY-6,{s:12*k,w:700,c:PAL['cv-soft']});return;}
  ctx.fillStyle=PAL['card2'];rr(ctx,X0,sY,X1-X0,sH,10);ctx.fill();
  const msg=c?('Your call: '+CALLS[c.pick]+'. '+(c.pick===c.truth?'That matches the math.':'The math says: '+CALLS[c.truth]+'.')):('The math: '+CALLS[truth(sim)]+' at 20 or lower.');
  ctx.font='700 '+(12*k)+'px '+FONT;const two=ctx.measureText(msg).width>X1-X0-24;
  wrap(ctx,msg,X0+12,sY+sH/2+4*k-(two?7*k:0),X1-X0-24,{s:12*k,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']});},
 onClick(sim,x,y){if(shown(sim))return;const k=sim.vis&&sim.vis.k||1;const sH=Math.max(46,30*k+16),sY=450-12-sH;
  BTN.forEach((b,i)=>{const r=btnRect(i,sY,sH,300,780);if(x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]-4&&y<=r[1]+r[3]+4){BioLab.setValues(sim,{call:b[0]});SIM.actions[0].run(sim);}});},
 narrate(sim){const r21=v21(sim),r09=v09(sim);
  if(!shown(sim))return 'Read the lab report on the left. <b>Make your call:</b> will his eGFR be 20 or lower under the 2021 equation, the 2009 equation, both, or neither? Click your pick under the cards.';
  const c=callNow(sim),lead=c?(c.pick===c.truth?'<b>Your call matched the math.</b> ':'<b>Your call was '+CALLS[c.pick].toLowerCase()+'; the math says '+CALLS[c.truth].toLowerCase()+'.</b> '):'';
  if(r21<=LINE&&r09>LINE)return lead+'Same blood, same kidneys: the 2021 equation gives '+f1(r21)+' and the 2009 equation gives '+f1(r09)+'. '+realTerms(sim);
  if(r21<=LINE&&r09<=LINE)return lead+'Both equations put him at or below 20 ('+f1(r21)+' and '+f1(r09)+'), so waiting time can start either way. Raise the age or lower the creatinine to find where they disagree.';
  if(r21>LINE&&r09>LINE)return lead+'Both equations put him above 20 ('+f1(r21)+' and '+f1(r09)+'). <b>Higher creatinine means lower eGFR:</b> drag creatinine up to find where each one crosses.';
  return lead+'Here the 2009 equation is the lower one ('+f1(r09)+' vs '+f1(r21)+'), because no race multiplier is applied and the 2021 refit runs slightly higher for these patients.';},
 challenges:[
  {lvl:'bio',instant:true,q:'Two 60-year-old men have the same creatinine, 3.4 mg/dL. The 2009 equation is told one of them is Black. What happens to his eGFR?',choices:['It goes up about 16%, so his kidneys look healthier','It goes down about 16%, so his kidneys look sicker','Nothing, because only creatinine matters'],correct:0,explain:'The 2009 equation multiplies by 1.159. His eGFR goes from 18.5 to 21.5, even though his blood and his kidneys are the same as the other man’s.'},
  {lvl:'bio',instant:true,q:'Waiting time on the kidney list typically starts at eGFR 20 or lower. His 2021 result is 19.8 and his 2009 result (recorded as Black) is 21.5. What did the 2009 number do?',choices:['Kept his waiting time from starting until his kidneys got worse','Got him onto the list sooner','Nothing: 19.8 and 21.5 mean the same thing'],correct:0,explain:'At 21.5 he is still above the line. His creatinine would have to climb from 3.40 to about 3.61 mg/dL before the 2009 report reached 20, and every month of that waiting time would not count.'},
  {lvl:'honors',instant:true,q:'Creatinine is a waste product the kidneys clear. If a patient’s blood creatinine rises, what happens to eGFR?',choices:['eGFR rises, because more waste is being filtered','eGFR falls, because the kidneys are clearing less','eGFR stays the same'],correct:1,explain:'Waste builds up in the blood when filtering slows. For a 60-year-old man under 2021, creatinine 1.0 gives about 86.2, and 3.4 gives 19.8.'},
  {lvl:'honors',instant:true,q:'A 60-year-old man is recorded as Black. About what creatinine makes his 2009 eGFR reach 20?',choices:['3.38 mg/dL','3.61 mg/dL','4.20 mg/dL','2.90 mg/dL'],correct:1,explain:'The 2009 equation reaches 20 at about 3.61 mg/dL. The race-free 2021 equation reaches 20 at about 3.38 mg/dL. The multiplier asked for about 7% more creatinine before the line.'},
  {lvl:'ap',instant:true,q:'Same 60-year-old man, creatinine 3.4, but recorded as not Black. Which is higher?',choices:['The 2021 equation (19.8 vs 18.5)','The 2009 equation (21.5 vs 19.8)','They are equal'],correct:0,explain:'With no race term the 2009 equation gives 18.5. The 2021 refit, built without race, runs a little higher for patients who were not recorded as Black and lower for patients who were, compared with 2009 as it was used.'},
  {lvl:'ap',instant:true,q:'For that 60-year-old man recorded as Black, assume his kidney function falls 3 points a year on the 2021 scale. How much waiting time did the 1.159 multiplier cost him?',choices:['About 1 month','About 6 months','About 3 years','None'],correct:1,explain:'When the 2009 report reaches 20 (creatinine 3.61), the 2021 equation reads about 18.47. Falling from 20 to 18.47 at 3 points a year takes 0.51 years, about 6.1 months. The decline rate is an assumption; slower decline means more months lost.'}
 ],
 tour:[
  {title:'The lab report',text:'A 60-year-old man has one blood test: creatinine 3.4 mg/dL. Creatinine is a waste product from muscle that healthy kidneys clear. When the kidneys slow down, it builds up.',focus:[12,12,262,426],pause:true,setup(sim){BioLab.setValues(sim,{scr:3.4,age:60,sex:'M',black:'yes',rate:3});sim.st.revealed=false;sim.st.call=null;}},
  {title:'From one number to a kidney score',text:'Labs turn creatinine, age and sex into eGFR, an estimate of how much blood the kidneys filter each minute. Red is serious kidney disease. At 20 or lower, waiting time for a transplant can start to count.',focus:[296,16,490,140],pause:true},
  {title:'Make your call',text:'Before you see the numbers: is his eGFR 20 or lower under the 2021 equation, the 2009 equation, both or neither? Click one of the four buttons under the cards. Or press Next to see the math.',focus:[296,160,490,280],pause:true},
  {title:'The 2021 equation',text:'The race-free 2021 equation gives 19.8. He is at or below 20, so his waiting time can start.',focus:[296,160,245,200],pause:true,setup(sim){sim.st.revealed=true;}},
  {title:'The 2009 equation',text:'The 2009 equation, told he is Black, multiplies by 1.159 and gives 21.5. Same blood, same kidneys, but he is above the line and his waiting time does not start.',focus:[541,160,245,200],pause:true},
  {lvl:'honors',title:'How much sicker first?',text:'Drag creatinine up. The 2021 report reaches 20 at 3.38 mg/dL. The 2009 report needs 3.61 mg/dL: his kidneys have to get worse before he counts.',pause:true,setup(sim){BioLab.setValues(sim,{scr:3.6});}},
  {title:'What changed',text:'In 2021 a national kidney task force recommended the race-free 2021 equation. From January 2023 the transplant network required waiting time to be credited back to Black candidates who had been delayed. By mid-March 2024, 14,280 had moved up the list and nearly 3,000 had received transplants.',pause:true,setup(sim){BioLab.setValues(sim,{scr:3.4});}},
  {lvl:'ap',title:'Turn the gap into months',text:'If his function falls 3 points a year, the 2021 scale reads 18.47 when the 2009 report finally reaches 20. That is 1.53 points, or about 6 months of waiting time not counted. Try a slower decline.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> When do the two equations disagree about the waiting-list line?</p><ol><li>Keep age 60, male, race recorded as Black. Set creatinine to 3.0, 3.2, 3.4, 3.6 and 3.8 mg/dL. Record a trial at each.</li><li>Mark which trials have the 2021 result at or below 20 and the 2009 result above 20.</li></ol><p>Write one sentence: what range of creatinine puts a patient in the gap?</p>',
  honors:'<p><b>Question:</b> How does age change where each equation crosses 20?</p><ol><li>For ages 30, 45, 60 and 75, read <b>Creatinine where 2021 reaches 20</b> and <b>Creatinine where 2009 reaches 20</b>.</li><li>Repeat for a female patient.</li><li>Record the difference each time.</li></ol><p>Explain why the gap never closes while race is recorded as Black.</p>',
  ap:'<p><b>Question:</b> How many months of waiting time does the race multiplier cost, and what does that depend on?</p><ol><li>At age 60, male, read <b>Waiting time not counted</b> for decline rates of 1, 2, 3, 5 and 8 points a year.</li><li>Show algebraically why the months scale as 1/rate.</li><li>Repeat at age 40.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the equation. Name the assumption your claim depends on most.</p>'},
 terms:[
  {t:'Creatinine',d:'A waste product of muscle that healthy kidneys filter out of the blood. When filtering slows, blood creatinine rises.'},
  {t:'eGFR',d:'Estimated glomerular filtration rate: an estimate of how much blood the kidneys filter each minute, in mL/min per 1.73 m² of body surface.'},
  {t:'Kidney transplant waiting list',d:'The national list of people waiting for a donor kidney. Waiting time typically starts counting at eGFR 20 or lower.'},
  {t:'Race coefficient',d:'A multiplier in an equation applied only to patients of one recorded race. The 2009 CKD-EPI equation used 1.159 for Black patients.',lvl:'honors'},
  {t:'Glomerulus',d:'The tiny ball of capillaries in each nephron where blood is filtered. GFR is the total filtering of all of them.',lvl:'honors'},
  {t:'CKD-EPI',d:'The research group whose equations estimate GFR from creatinine (and sometimes cystatin C), age and sex.',lvl:'ap'},
  {t:'Cystatin C',d:'Another blood marker of kidney filtering. The 2021 task force called for wider use of it alongside creatinine.',lvl:'ap'}
 ],
 about:'<p><b>Equations used.</b> 2021 CKD-EPI creatinine (race-free): eGFR = 142 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.200</sup> × 0.9938<sup>Age</sup> × 1.012 if female, with κ = 0.7 (female) or 0.9 (male) and α = −0.241 (female) or −0.302 (male). 2009 CKD-EPI creatinine: eGFR = 141 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.209</sup> × 0.993<sup>Age</sup> × 1.018 if female × 1.159 if Black, with the same κ and α = −0.329 (female) or −0.411 (male). Scr is serum creatinine in mg/dL; eGFR is in mL/min/1.73 m². The scale bands follow the usual kidney disease stages (below 15, 15 to 29, 30 to 59, 60 to 89, 90 and up).</p><p><b>Facts.</b> Waiting time on the kidney transplant list typically starts counting when eGFR is 20 or lower. In September 2021 the NKF–ASN task force recommended the race-free 2021 CKD-EPI creatinine equation and wider use of cystatin C (ACP Internist, <a href="https://www.acpinternist.org/weekly/archives/2021/09/28/2.htm" target="_blank" rel="noopener">acpinternist.org</a>). From January 2023 the Organ Procurement and Transplantation Network (OPTN) required waiting time to be credited back for Black candidates affected; by mid-March 2024, 14,280 Black candidates had moved up the list and nearly 3,000 had received transplants (ABC7, <a href="https://abc7.com/new-race-neutral-kidney-evaluation-moves-thousands-of-black-patients-up-transplant-waitlist/14717014/" target="_blank" rel="noopener">abc7.com</a>).</p><p><b>Simplified.</b> “Months not counted” assumes kidney function falls at a steady rate on the 2021 scale; that rate is an assumption for illustration, and real decline varies a lot. Listing also depends on a full medical evaluation, not one number. The values you enter stay in this browser tab and are never sent anywhere.</p><p><b>This is a teaching model, not medical advice.</b> Questions about a real lab report belong with that patient’s doctor.</p>',
 thumbSetup(sim){sim.st.revealed=true;}
};
BioLab.register(SIM);

BioLab.addPractical({egfr:{
 hook:'A 60-year-old man in your family shows you his lab report: blood creatinine 3.4 mg/dL. Waiting time for a kidney transplant typically starts counting when eGFR is 20 or lower. Does his report cross that line under the race-free 2021 equation? Under the 2009 equation, if he is recorded as Black?',
 answer:'Under the 2021 equation his eGFR is 19.8, so waiting time can start. Under the 2009 equation with the 1.159 multiplier it is 21.5, so it can’t: his creatinine would have to rise to about 3.61 mg/dL first. With no multiplier the 2009 equation gives 18.5.',
 uses:['Lab reports and patient portals often print an eGFR right next to creatinine. It is computed by an equation, not measured directly, so the equation the lab chose is part of the result.','Kidney transplant waiting lists: from January 2023 the transplant network required waiting time to be credited back to Black candidates delayed by the race multiplier. By mid-March 2024, 14,280 had moved up the list and nearly 3,000 had received transplants.','Medicine doses: doctors and pharmacists adjust the dose of many drugs the kidneys clear using an estimate of kidney function, so the same equation choice reaches the pharmacy counter.'],
 takeaway:'An equation is a set of choices. One race multiplier changed who counted as sick enough, and fixing it moved thousands of people up the transplant list.'}});

BioLab.addReview({egfr:{questions:[
 {id:'f50',kind:'real',lvl:'bio',q:'A 50-year-old woman has blood creatinine 2.6 mg/dL. To the nearest 0.1, what is her eGFR under the 2021 equation?',num:{ans:21.8,tol:0.15,unit:'mL/min/1.73 m²'},
  steps:['For a woman, κ = 0.7 and α = −0.241. Scr/κ = 2.6 ÷ 0.7 = 3.714, which is above 1, so only the max term matters: 3.714<sup>−1.200</sup> = 0.207.','Age term: 0.9938<sup>50</sup> = 0.733. Female term: 1.012.','eGFR = 142 × 0.207 × 0.733 × 1.012 ≈ 21.8. She is just above the line of 20.'],
  lab:{set:{scr:2.6,age:50,sex:'F'},act:'show',look:'Read <b>eGFR, 2021 equation</b>.'},verify:[['e21',21.8,0.1]]},
 {id:'mult',kind:'test',lvl:'bio',q:'The 2009 equation multiplied by 1.159 for patients recorded as Black. For the same creatinine, age and sex, how much higher did that make the reported eGFR?',choices:['1.159 points higher','15.9% higher','1.159% higher','It depends on creatinine only'],correct:1,
  steps:['Multiplying by 1.159 is the same as adding 0.159 of the value, which is 15.9%.','For a 60-year-old man with creatinine 3.4, that turns 18.5 into 21.5.']},
 {id:'cross55',kind:'real',lvl:'honors',q:'A 55-year-old man is recorded as Black. To the nearest 0.01 mg/dL, what creatinine makes his 2009 eGFR reach 20, and what creatinine does the 2021 equation need?',choices:['3.72 under 2009, 3.47 under 2021','3.47 under 2009, 3.72 under 2021','3.29 under both','4.05 under 2009, 3.75 under 2021'],correct:0,
  steps:['Above κ, eGFR is a power law in creatinine, so solve 20 = (constants) × (Scr/0.9)<sup>exponent</sup> for each equation.','2021: 142 × 0.9938<sup>55</sup> × (Scr/0.9)<sup>−1.2</sup> = 20 gives Scr ≈ 3.47 mg/dL.','2009 with 1.159: 141 × 0.993<sup>55</sup> × 1.159 × (Scr/0.9)<sup>−1.209</sup> = 20 gives Scr ≈ 3.72 mg/dL. His creatinine must climb about 0.25 mg/dL more.'],
  lab:{set:{scr:3.5,age:55,sex:'M',black:'yes'},look:'Read both <b>Creatinine where … reaches 20</b> tiles.'},verify:[['c09',3.72,0.01],['c21',3.47,0.01]]},
 {id:'double',kind:'test',lvl:'honors',q:'A 40-year-old man’s creatinine doubles from 1.0 to 2.0 mg/dL. Under the 2021 equation, about what happens to his eGFR?',choices:['It halves, from 97.6 to 48.8','It falls to about 42.5, a bit less than half','It falls by 1.2 points','It doubles'],correct:1,
  steps:['Both values are above κ = 0.9, so eGFR is proportional to Scr<sup>−1.2</sup>.','Doubling Scr multiplies eGFR by 2<sup>−1.2</sup> = 0.435.','97.6 × 0.435 ≈ 42.5. Because the exponent is steeper than −1, doubling creatinine more than halves eGFR.'],
  lab:{set:{scr:2,age:40,sex:'M'},act:'show',look:'Read <b>eGFR, 2021 equation</b>, then set creatinine to 1.0.'},verify:[['e21',42.5,0.1]]},
 {id:'months',kind:'real',lvl:'ap',q:'A 60-year-old man recorded as Black, with function assumed to fall 3 points a year on the 2021 scale. How many months of waiting time does the 1.159 multiplier cost him? Round to the nearest month.',num:{ans:6,tol:0.6,unit:'months'},
  steps:['The 2009 report reaches 20 when creatinine is about 3.61 mg/dL.','At that creatinine the 2021 equation reads about 18.47.','The 2021 scale had to fall from 20 to 18.47: 1.53 points. At 3 points a year: 1.53 ÷ 3 = 0.51 years ≈ 6.1 months.'],
  lab:{set:{scr:3.4,age:60,sex:'M',black:'yes',rate:3},look:'Read <b>Waiting time not counted</b>.'},verify:[['months',6.1,0.1]]},
 {id:'what',kind:'test',lvl:'bio',q:'What does eGFR estimate?',choices:['How much blood the kidneys filter each minute, scaled to body size','How much urine you make in a day','How much creatinine your muscles make','The size of your kidneys'],correct:0,
  steps:['GFR is the glomerular filtration rate: the volume of blood plasma filtered by the glomeruli each minute.','The e means estimated: it comes from an equation using creatinine, age and sex, reported per 1.73 m² of body surface so people of different sizes can be compared.']}
]}});
})();
