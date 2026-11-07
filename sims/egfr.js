(function(){
'use strict';
const {clamp,rng,rr,txt,pill,atLeast,PAL,FONT,axes,legend,fmtNum}=BioLab.h;

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
const shown=sim=>!!(sim.st&&sim.st.revealed);
const fresh=sim=>{sim.st.revealed=false;sim.st.call=null;sim.st.yt=null;};
const BTN=[['both','Both'],['only21','Only 2021'],['only09','Only 2009'],['neither','Neither']];
const btnRect=(i,sY,sH,X0,X1)=>{const g=8,w=(X1-X0-3*g)/4;return [X0+i*(w+g),sY+4,w,sH-8];};
const callNow=sim=>{const c=sim.st&&sim.st.call;return c&&c.key===key(sim)?c:null;};
function wrap(ctx,s,x,y,w,o){o=o||{};const size=o.s||13,lh=o.lh||size*1.3;ctx.font=(o.w||400)+' '+size+'px '+FONT;let line='',yy=y;
  String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;line=word;}else line=t;});
  if(line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;}return yy;}
/* ---------- Your turn: one step of the equation for this lab report ----------
   Big picture: the race multiplier step, printed pre-multiplier value × 1.159 (or × 1).
   Closer look and Deep dive: the 2021 equation with this report's numbers. */
const hon=()=>atLeast('honors'),KAP=sim=>F(sim)?0.7:0.9,MULT=sim=>B(sim)?1.159:1,g09=sim=>Math.round(v09n(sim)*100)/100;
function form21(sim){const s=sim.p.scr,k=KAP(sim),r=s/k,al=F(sim)?'−0.241':'−0.302';return '142 × ('+f2(s)+' ÷ '+k+')^'+(r>=1?'−1.200':al)+' × 0.9938^'+sim.p.age+(F(sim)?' × 1.012':'');}
const YT={
  key:sim=>key(sim)+'|'+(hon()?'h':'b'),
  ans:sim=>hon()?v21(sim):g09(sim)*MULT(sim),
  tol:()=>hon()?0.3:0.1,
  fmt:v=>v.toFixed(1),
  line:sim=>hon()?form21(sim)+' = '+f1(v21(sim)):f2(g09(sim))+' × '+MULT(sim)+' = '+f2(g09(sim)*MULT(sim)),
  wrong:sim=>{if(!hon()){const x=g09(sim);return [x/1.159,x+1.159,x*1.159,x+15.9,x*0.159];}
    const k=KAP(sim),r=Math.max(sim.p.scr/k,1),A=Math.pow(0.9938,sim.p.age),ft=F(sim)?1.012:1;return [142*Math.pow(r,-1.2)*ft,142/r*A*ft,142*A*ft,142*Math.pow(r,1.2)*A*ft];}
};
/* ---------- Your turn, shared machinery: the student computes one number for this case before the call ----------
   YT (defined above) gives the key, answer, tolerance, format and common-slip choices. Canvas buttons are bare numbers;
   they set the `ans` control and submit it. One retry after a wrong answer; a second wrong answer shows the worked math.
   Then the call, then the reveal with the formula and this case's numbers. */
const hashS=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))%2147483647;return h||1;};
const ytNow=sim=>{const y=sim.st&&sim.st.yt;return y&&y.key===YT.key(sim)?y:null;};
const ytDone=sim=>{const y=ytNow(sim);return !!(y&&y.done);};
function ytChoices(sim){const a=YT.ans(sim),t=YT.tol(sim),f=YT.fmt,seen=new Set([f(a)]),out=[a];
  const add=v=>{if(out.length<4&&Number.isFinite(v)&&(YT.neg||v>0)&&!seen.has(f(v))&&Math.abs(v-a)>t*1.5){seen.add(f(v));out.push(v);}};
  YT.wrong(sim).forEach(add);[1.25,0.8,1.5,0.6,2,0.5].forEach(m=>add(a*m));[1,-1,2,-2,3].forEach(d=>add(a+d*Math.max(t*4,0.5)));
  const r=rng(hashS(YT.key(sim)));for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function ytSubmit(sim,v){let y=ytNow(sim);if(!y){y={key:YT.key(sim),tries:[],done:false,ok:false};sim.st.yt=y;}if(y.done)return;
  y.tries.push(v);if(Math.abs(v-YT.ans(sim))<=YT.tol(sim)+1e-9){y.ok=true;y.done=true;}else if(y.tries.length>=2)y.done=true;}
function ytVerdict(sim){const y=ytNow(sim);if(!y||!y.tries.length)return '';const last=y.tries[y.tries.length-1];
  return 'Your answer: '+YT.fmt(last)+(YT.unit||'')+'. '+(y.ok?'Correct: ':'The math: ')+YT.line(sim)+'.';}
function ytShort(sim){const y=ytNow(sim);if(!y||!y.tries.length)return '';const last=y.tries[y.tries.length-1];return 'Your answer: '+YT.fmt(last)+(YT.unit||'')+(y.ok?', correct.':'; the math gives '+YT.fmt(YT.ans(sim))+(YT.unit||'')+'.');}
/* bottom strip: lines of text, then a row of buttons. Measured first so the drawing above can make room. */
function nLines(ctx,s,w,size,wt){ctx.font=(wt||400)+' '+size+'px '+FONT;let n=0,line='';String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){n++;line=word;}else line=t;});return n+(line?1:0);}
function stripPlan(ctx,k,w,parts,btns){let h=10;parts=parts.filter(p=>p&&p.t);parts.forEach(p=>{p.n=nLines(ctx,p.t,w-24,p.s,p.w);h+=p.n*p.s*1.3;});const bh=btns&&btns.length?Math.min(44,24*k+12):0;if(bh)h+=bh+8;return {parts,btns:btns||[],bh,h:h+8};}
function stripDraw(ctx,sim,P,x0,x1,y0,k){ctx.fillStyle=PAL['card2'];rr(ctx,x0,y0,x1-x0,P.h,10);ctx.fill();let y=y0+10;
  P.parts.forEach(p=>{y=wrap(ctx,p.t,x0+12,y+p.s,x1-x0-24,{s:p.s,w:p.w,c:p.c})-p.s;});
  sim.vis.ytR=[];sim.vis.callR=[];if(!P.btns.length)return;const g=8,n=P.btns.length,bw=(x1-x0-24-g*(n-1))/n,by=y+6;
  P.btns.forEach((b,i)=>{const bx=x0+12+i*(bw+g);ctx.fillStyle=PAL[b.off?'card2':'card'];rr(ctx,bx,by,bw,P.bh,9);ctx.fill();ctx.strokeStyle=b.off?PAL['line']:PAL['rj'];ctx.lineWidth=2;ctx.stroke();
    ctx.font='700 '+(12*k)+'px '+FONT;let l=b.l;if(b.short&&ctx.measureText(l).width>bw-10)l=b.short;
    txt(ctx,l,bx+bw/2,by+P.bh/2+1,{s:(b.kind==='yt'?13:12)*k,w:b.kind==='yt'?800:700,a:'center',b:'middle',c:b.off?PAL['cv-soft']:PAL['cv-ink']});
    if(!b.off)(b.kind==='yt'?sim.vis.ytR:sim.vis.callR).push([bx,by,bw,P.bh,b.v]);});}
function ytButtons(sim){const y=ytNow(sim);return ytChoices(sim).map(v=>({l:YT.fmt(v),v,kind:'yt',off:!!(y&&y.tries.some(t=>Math.abs(t-v)<1e-9))}));}
function stripClick(sim,x,y){const hit=R=>(R||[]).find(r=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]-4&&y<=r[1]+r[3]+4);
  const a=hit(sim.vis&&sim.vis.ytR);if(a){BioLab.setValues(sim,{ans:a[4]});ytSubmit(sim,a[4]);sim.vis.ytR=null;return true;}
  const c=hit(sim.vis&&sim.vis.callR);if(c){BioLab.setValues(sim,{call:c[4]});SIM.actions.find(a=>a.id==='lock').run(sim);sim.vis.callR=null;return true;}return false;}

function realTerms(sim){const s=sim.p.scr,a=c21(sim),b=c09(sim);
  if(!B(sim))return 'With race recorded as not Black, the 2009 equation applies no race multiplier. It puts him at '+f1(v09(sim))+', a little <i>below</i> the 2021 result of '+f1(v21(sim))+'.';
  return 'The 1.159 multiplier means his creatinine has to reach <b>'+f2(b)+' mg/dL</b> before the 2009 report hits 20, instead of '+f2(a)+' mg/dL under 2021. If his kidneys kept losing '+fmtNum(sim.p.rate,1)+' points a year (an assumption), that is about <b>'+Math.round(gapMonths(sim))+' months</b> of waiting time not counted.';}

function plan(sim,ctx,k,w){const y=ytNow(sim),c=callNow(sim),big=k>1.3,S=12*k,M=13*k;
  if(!shown(sim)&&!ytDone(sim)){const retry=y&&y.tries.length;
    const giv=big?(hon()?[{t:'Your turn: the 2021 eGFR',s:M,w:800},{t:form21(sim),s:S,w:700,c:PAL['s2']},{t:retry?'Not quite. Power first, then multiply.':'',s:S,w:600,c:PAL['s1']}]
      :[{t:'Your turn: 2009 report = '+f2(g09(sim))+' × '+MULT(sim)+(B(sim)?' (race multiplier)':' (no multiplier)')+' = ?',s:S,w:800,c:PAL['cv-ink']},{t:retry?'Not quite. Multiply, then pick again.':'',s:S,w:600,c:PAL['s1']}]):hon()?[{t:'Your turn: the 2021 equation with this report',s:M,w:800},{t:form21(sim),s:M,w:700,c:PAL['s2']},{t:retry?'Not quite. Work left to right with a calculator: the power first, then multiply.':'Use a calculator. What is the 2021 eGFR?',s:S,w:600,c:retry?PAL['s1']:PAL['cv-soft']}]
      :[{t:'Your turn: the 2009 report',s:M,w:800},{t:'Before the race multiplier, the 2009 equation gives '+f2(g09(sim))+'.',s:S,w:700,c:PAL['s4']},{t:B(sim)?'The order says Black, so it multiplies by 1.159.':'The order says not Black, so it multiplies by 1.',s:S,w:700,c:PAL['s4']},{t:retry?'Not quite. Multiply, then pick again.':'What does the 2009 report show?',s:S,w:600,c:retry?PAL['s1']:PAL['cv-soft']}];
    return stripPlan(ctx,k,w,giv,ytButtons(sim));}
  if(!shown(sim)){const yy=ytNow(sim);return stripPlan(ctx,k,w,[{t:ytVerdict(sim),s:S,w:700,c:yy.ok?PAL['s3']:PAL['s1']},{t:'Now your call: whose eGFR is 20 or lower?',s:S,w:800}],BTN.map(b=>({l:b[1],v:b[0],kind:'call'})));}
  const l21='2021: '+form21(sim)+' = '+f1(v21(sim)),l09='2009: '+(B(sim)?f2(v09n(sim))+' × 1.159 = '+f2(v09(sim)):f2(v09(sim))+', no multiplier');
  const vd=ytShort(sim),cm=c?('Your call: '+CALLS[c.pick]+'. '+(c.pick===c.truth?'That matches the math.':'The math says: '+CALLS[c.truth]+'.')):('The math: '+CALLS[truth(sim)]+' at 20 or lower.');
  return stripPlan(ctx,k,w,[{t:l21,s:S,w:800,c:PAL['s2']},{t:l09,s:S,w:800,c:PAL['s4']},{t:(vd&&!big?vd+' ':'')+cm,s:S,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']}],null);}

const SIM={
 id:'egfr',hash:'egfr',yt:YT,apUnit:0,order:3,kind:'Learning tool',tab:'Kidney math: eGFR',prereq:['homeostasis'],
 card:'Enter a blood creatinine, age and sex. See the kidney score under the 2009 and 2021 equations, and who reaches the transplant waiting-list line.',
 title:'Kidney math: who counts as sick enough?',
 lede:{bio:'The math: evaluating an equation one factor at a time, then comparing with a cutoff (Anatomy & Physiology: the urinary system). Your kidneys filter waste out of your blood. A lab can’t watch them filter, so it estimates how well they work from one blood test, your age and your sex. Until 2021, one common equation also changed the answer if the patient was recorded as Black.',
  honors:'eGFR is an estimated glomerular filtration rate. Creatinine is a waste product the kidneys clear, so more creatinine in the blood means a lower eGFR. Compare the 2009 CKD-EPI equation, which multiplied by 1.159 for Black patients, with the race-free 2021 refit.',
  ap:'Both CKD-EPI equations are piecewise power laws in Scr/κ, with an age term. Find the creatinine where each crosses eGFR 20, and turn the gap into months of waiting time under an assumed rate of decline.'},
 scale:'One blood test. eGFR is in mL per minute per 1.73 m² of body surface; healthy young adults are often near 100.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'The lab report',
 controls:[
  {id:'scr',label:'Blood creatinine',type:'range',min:0.5,max:8,step:0.05,def:3.4,d:2,unit:' mg/dL',help:'A waste product from muscle. Healthy adults are often around 0.6 to 1.2 mg/dL.'},
  {id:'age',label:'Age',type:'range',min:18,max:90,step:1,def:60,unit:' years',help:'These equations are for adults 18 and older.'},
  {id:'sex',label:'Sex',type:'seg',def:'M',options:[{v:'M',l:'Male'},{v:'F',l:'Female'}]},
  {id:'black',label:'Race on the lab order (only the 2009 equation uses it)',type:'seg',def:'yes',options:[{v:'yes',l:'Black'},{v:'no',l:'Not Black'}]},
  {id:'ans',label:'Your answer: the eGFR you computed (Your turn on the canvas)',type:'range',min:0,max:150,step:0.1,def:20,d:1,noTrial:true,help:'Big picture: the 2009 report after the race multiplier. Closer look and up: the 2021 equation. Set it, then press Lock in my answer.'},
  {id:'call',label:'Your call: whose eGFR is 20 or lower?',type:'seg',def:'both',noTrial:true,options:[{v:'both',l:'Both'},{v:'only21',l:'Only 2021'},{v:'only09',l:'Only 2009'},{v:'neither',l:'Neither'}],help:'Make your call before you look, then press Lock in my call.'},
  {id:'rate',label:'Assumed loss of kidney function',type:'range',min:1,max:8,step:0.5,def:3,d:1,unit:' points a year',lvl:'honors',help:'An assumption for illustration. Real decline varies a lot from person to person.'}
 ],
 actions:[
  {id:'ytlock',label:'Lock in my answer',run(sim){ytSubmit(sim,sim.p.ans);}},
  {id:'lock',label:'Lock in my call',primary:true,run(sim){sim.st.call={pick:sim.p.call,key:key(sim),truth:truth(sim)};sim.st.revealed=true;}},
  {id:'show',label:'Show the math',run(sim){sim.st.revealed=true;}},
  {id:'hide',label:'New call: hide the results',run(sim){fresh(sim);}}
 ],
 init(){return {revealed:false,call:null,yt:null};},step(){},
 metrics:[
  {id:'e21',label:'eGFR, 2021 equation (no race)',unit:'mL/min/1.73 m²',d:1,min:0,max:130,get:sim=>shown(sim)?v21(sim):null},
  {id:'e09',label:'eGFR, 2009 equation as recorded',unit:'mL/min/1.73 m²',d:1,min:0,max:130,get:sim=>shown(sim)?v09(sim):null},
  {id:'wait',label:'Waiting time can start (eGFR ≤ 20)?',text:true,noTrial:true,get:sim=>shown(sim)?'2021: '+(v21(sim)<=LINE?'yes':'no')+' · 2009: '+(v09(sim)<=LINE?'yes':'no'):'After your call'},
  {id:'diff',label:'2009 minus 2021',unit:'points',d:1,lvl:'honors',min:-10,max:20,get:sim=>shown(sim)?v09(sim)-v21(sim):null},
  {id:'c21',label:'Creatinine where 2021 reaches 20',unit:'mg/dL',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?c21(sim):null},
  {id:'c09',label:'Creatinine where 2009 reaches 20',unit:'mg/dL',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?c09(sim):null},
  {id:'e09n',label:'eGFR, 2009 equation with no race multiplier',unit:'mL/min/1.73 m²',d:1,lvl:'ap',min:0,max:130,get:v09n},
  {id:'months',label:'Waiting time not counted (at the assumed decline)',unit:'months',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?gapMonths(sim):null}
 ],
 graphs:[{id:'curve',label:'eGFR vs. creatinine',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const a=sim.p.age,f=F(sim),b=B(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:8,ymin:0,ymax:140,xl:'Blood creatinine (mg/dL)',yl:'eGFR (mL/min/1.73 m²)'});
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(LINE));ctx.lineTo(ax.X(8),ax.Y(LINE));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'eGFR 20',ax.X(8)-4,ax.Y(LINE)-6,{s:12,c:PAL['s1'],a:'right',w:700});
  const curve=(fn,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();for(let s=0.3;s<=8.001;s+=0.05){const px=ax.X(s),py=ax.Y(Math.min(140,fn(s)));s<0.31?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
  if(!shown(sim)){txt(ctx,'The curves appear after your call',(box.L+box.W)/2+box.L/2,box.T+box.H/2,{s:13,c:PAL['cv-soft'],a:'center'});return;}
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
  /* result cards and the bottom strip (Your turn, then the call, then the math) */
  const P=plan(sim,ctx,k,X1-X0),sY=H-12-P.h,cy=TY+14,ch=Math.min(170,sY-12-cy),cw=(X1-X0-16)/2;
  const card=(x,title,sub,v,col)=>{if(ch<36*k)return;ctx.fillStyle=PAL['card'];rr(ctx,x,cy,cw,ch,12);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
   txt(ctx,title,x+14,cy+22*k,{s:13*k,w:800,c:col});if(ch>95*k)txt(ctx,sub,x+14,cy+22*k+17*k,{s:12*k,c:PAL['cv-soft']});
   const vy=cy+Math.min(ch-14*k,22*k+17*k+(ch-39*k-26*k)/2+14*Math.min(k,1.3));
   if(!sh){txt(ctx,'?',x+cw/2,vy,{s:30*Math.min(k,1.3),w:800,a:'center',c:PAL['cv-soft']});return;}
   txt(ctx,f1(v),x+14,vy,{s:28*Math.min(k,1.3),w:800});
   const ok=v<=LINE;if(ch>90*k)pill(ctx,ok?'20 or lower':'Above 20 by '+f1(v-LINE),x+cw/2,cy+ch-14*k,ok?PAL['s1']:PAL['card2'],ok?'#fff':PAL['cv-ink'],12*k);};
  card(X0,'2021 equation','No race term',r21,PAL['s2']);
  card(X0+cw+16,'2009 equation',B(sim)?'× 1.159 for Black':'No multiplier applied',r09,PAL['s4']);
  stripDraw(ctx,sim,P,X0,X1,sY,k);},
 onClick(sim,x,y){if(!shown(sim))stripClick(sim,x,y);},
 narrate(sim){const r21=v21(sim),r09=v09(sim);
  if(!shown(sim)&&!ytDone(sim)){const y=ytNow(sim);return (y&&y.tries.length?'<b>Not quite.</b> ':'<b>Your turn:</b> ')+(hon()?'put this report’s numbers into the 2021 equation, '+form21(sim)+', and click your answer under the cards.':'before the race multiplier, the 2009 equation gives '+f2(g09(sim))+'. Multiply by '+MULT(sim)+' and click your answer under the cards.');}
  if(!shown(sim))return ytVerdict(sim)+' <b>Make your call:</b> will his eGFR be 20 or lower under the 2021 equation, the 2009 equation, both, or neither? Click your pick under the cards.';
  const c=callNow(sim),lead=c?(c.pick===c.truth?'<b>Your call matched the math.</b> ':'<b>Your call was '+CALLS[c.pick].toLowerCase()+'; the math says '+CALLS[c.truth].toLowerCase()+'.</b> '):'';
  if(r21<=LINE&&r09>LINE)return lead+'Same blood, same kidneys: the 2021 equation gives '+f1(r21)+' and the 2009 equation gives '+f1(r09)+'. '+realTerms(sim);
  if(r21<=LINE&&r09<=LINE)return lead+'Both equations put him at or below 20 ('+f1(r21)+' and '+f1(r09)+'), so waiting time can start either way. Raise the age or lower the creatinine to find where they disagree.';
  if(r21>LINE&&r09>LINE)return lead+'Both equations put him above 20 ('+f1(r21)+' and '+f1(r09)+'). <b>Higher creatinine means lower eGFR:</b> drag creatinine up to find where each one crosses.';
  return lead+'Here the 2009 equation is the lower one ('+f1(r09)+' vs '+f1(r21)+'), because no race multiplier is applied and the 2021 refit runs slightly higher for these patients.';},
 challenges:[
  {lvl:'bio',instant:true,q:'A 55-year-old man’s creatinine is 3.0 mg/dL. Before the race multiplier, the 2009 equation gives 22.35. He is recorded as Black. What does the 2009 report show?',choices:['25.9','19.3','23.5','22.4'],correct:0,explain:'22.35 × 1.159 = 25.90. Dividing by 1.159 (19.3) or adding 1.159 (23.5) are the common slips. The race-free 2021 equation gives him 23.8.'},
  {lvl:'bio',instant:true,q:'Two 60-year-old men have the same creatinine, 3.4 mg/dL. The 2009 equation is told one of them is Black. What happens to his eGFR?',choices:['It goes up about 16%','It goes down about 16%','It stays the same'],correct:0,explain:'The 2009 equation multiplies by 1.159, which adds 15.9%. His eGFR goes from 18.5 to 21.5, so his kidneys look healthier on paper, even though his blood and his kidneys are the same as the other man’s.'},
  {lvl:'bio',instant:true,q:'Waiting time on the kidney list typically starts at eGFR 20 or lower. His 2021 result is 19.8 and his 2009 result (recorded as Black) is 21.5. What did the 2009 number do?',choices:['It kept his waiting time from starting','It started his waiting time sooner','It changed nothing'],correct:0,explain:'At 21.5 he is still above the line. His creatinine would have to climb from 3.40 to about 3.61 mg/dL before the 2009 report reached 20, and that waiting time would not count.'},
  {lvl:'honors',instant:true,q:'Creatinine is a waste product the kidneys clear. If a patient’s blood creatinine rises, what happens to eGFR?',choices:['eGFR rises','eGFR falls','eGFR stays the same'],correct:1,explain:'Waste builds up in the blood when filtering slows. For a 60-year-old man under 2021, creatinine 1.0 gives about 86.2, and 3.4 gives 19.8.'},
  {lvl:'honors',instant:true,q:'Above κ, the 2021 equation is proportional to creatinine<sup>−1.200</sup>. If creatinine doubles, eGFR is multiplied by about what?',choices:['0.435','0.5','2.30','0.8'],correct:0,explain:'2<sup>−1.2</sup> = 0.435. Because the exponent is steeper than −1, doubling creatinine more than halves eGFR: 97.6 at 1.0 mg/dL becomes 42.5 at 2.0 for a 40-year-old man.'},
  {lvl:'honors',instant:true,q:'A 60-year-old man is recorded as Black. About what creatinine makes his 2009 eGFR reach 20?',choices:['3.38 mg/dL','3.61 mg/dL','4.20 mg/dL','2.90 mg/dL'],correct:1,explain:'The 2009 equation reaches 20 at about 3.61 mg/dL. The race-free 2021 equation reaches 20 at about 3.38 mg/dL. The multiplier asked for about 7% more creatinine before the line.'},
  {lvl:'ap',instant:true,q:'Same 60-year-old man, creatinine 3.4, but recorded as not Black. Which is higher?',choices:['The 2021 equation','The 2009 equation','They are equal'],correct:0,explain:'With no race term the 2009 equation gives 18.5 and the 2021 refit gives 19.8. The 2021 refit, built without race, runs a little higher for patients who were not recorded as Black and lower for patients who were, compared with 2009 as it was used.'},
  {lvl:'ap',instant:true,q:'For that 60-year-old man recorded as Black, assume his kidney function falls 3 points a year on the 2021 scale. How much waiting time did the 1.159 multiplier cost him?',choices:['About 1 month','About 6 months','About 3 years','None'],correct:1,explain:'When the 2009 report reaches 20 (creatinine 3.61), the 2021 equation reads about 18.47. Falling from 20 to 18.47 at 3 points a year takes 0.51 years, about 6.1 months. The decline rate is an assumption; slower decline means more months lost.'}
 ],
 tour:[
  {title:'The lab report',text:'A 60-year-old man has one blood test: creatinine 3.4 mg/dL. Creatinine is a waste product from muscle that healthy kidneys clear. When the kidneys slow down, it builds up.',focus:[12,12,262,426],pause:true,setup(sim){BioLab.setValues(sim,{scr:3.4,age:60,sex:'M',black:'yes',rate:3});fresh(sim);}},
  {title:'From filtering to a kidney score',text:'Blood flows through about a million tiny filters in each kidney, the glomeruli, which pass creatinine into urine. eGFR estimates how many mL of blood they filter each minute. Labs compute it from creatinine, age and sex. At 20 or lower, waiting time for a transplant can start to count.',focus:[296,16,490,140],pause:true},
  {title:'Your turn',text:{bio:'First compute: before the race multiplier, the 2009 equation gives 18.55. The order says Black, so the 2009 report multiplies by 1.159. Click your answer at the bottom. Then make your call: whose eGFR is 20 or lower? Or press Next to see the math.',honors:'First compute the 2021 equation with his numbers (the formula is at the bottom) and click your answer. Then make your call: whose eGFR is 20 or lower? Or press Next to see the math.'},focus:[296,160,490,280],pause:true,setup(sim){fresh(sim);}},
  {title:'The 2021 equation',text:'The race-free 2021 equation: 142 × (3.40 ÷ 0.9)^−1.200 × 0.9938^60 = 19.8. He is at or below 20, so his waiting time can start.',focus:[296,160,245,280],pause:true,setup(sim){sim.st.revealed=true;}},
  {title:'The 2009 equation',text:'The 2009 equation, told he is Black, multiplies by 1.159: 18.55 × 1.159 = 21.5. Same blood, same kidneys, but he is above the line and his waiting time does not start.',focus:[541,160,245,280],pause:true,setup(sim){sim.st.revealed=true;}},
  {lvl:'honors',title:'How much sicker first?',text:'Drag creatinine up. The 2021 report reaches 20 at 3.38 mg/dL. The 2009 report needs 3.61 mg/dL: his kidneys have to get worse before he counts.',pause:true,setup(sim){BioLab.setValues(sim,{scr:3.6});sim.st.revealed=true;}},
  {title:'What changed',text:'In 2021 a national kidney task force recommended the race-free 2021 equation. From January 2023 the transplant network required waiting time to be credited back to Black candidates who had been delayed. By mid-March 2024, 14,280 had moved up the list and nearly 3,000 had received transplants.',pause:true,setup(sim){BioLab.setValues(sim,{scr:3.4});sim.st.revealed=true;}},
  {lvl:'ap',title:'Turn the gap into months',text:'If his function falls 3 points a year, the 2021 scale reads 18.47 when the 2009 report finally reaches 20. That is 1.53 points, or about 6 months of waiting time not counted. Try a slower decline.',pause:true,setup(sim){sim.st.revealed=true;}}
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
 about:'<p><b>Equations used.</b> 2021 CKD-EPI creatinine (race-free): eGFR = 142 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.200</sup> × 0.9938<sup>Age</sup> × 1.012 if female, with κ = 0.7 (female) or 0.9 (male) and α = −0.241 (female) or −0.302 (male). 2009 CKD-EPI creatinine: eGFR = 141 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.209</sup> × 0.993<sup>Age</sup> × 1.018 if female × 1.159 if Black, with the same κ and α = −0.329 (female) or −0.411 (male). Scr is serum creatinine in mg/dL; eGFR is in mL/min/1.73 m². The scale bands follow the usual kidney disease stages (below 15, 15 to 29, 30 to 59, 60 to 89, 90 and up).</p><p><b>Facts.</b> Waiting time on the kidney transplant list typically starts counting when eGFR is 20 or lower. In September 2021 the NKF–ASN task force recommended the race-free 2021 CKD-EPI creatinine equation and wider use of cystatin C (ACP Internist, <a href="https://www.acpinternist.org/weekly/archives/2021/09/28/2.htm" target="_blank" rel="noopener">acpinternist.org</a>). From January 2023 the Organ Procurement and Transplantation Network (OPTN) required waiting time to be credited back for Black candidates affected; by mid-March 2024, 14,280 Black candidates had moved up the list and nearly 3,000 had received transplants (ABC7, <a href="https://abc7.com/new-race-neutral-kidney-evaluation-moves-thousands-of-black-patients-up-transplant-waitlist/14717014/" target="_blank" rel="noopener">abc7.com</a>).</p><p><b>Muscle and creatine.</b> Muscle holds almost all of the body’s creatine, which breaks down into creatinine, so muscular people usually have higher blood creatinine. Creatine supplements can raise blood creatinine and lower eGFR with normal kidney function (GPnotebook, <a href="https://gpnotebook.com/pages/general-information/creatine-supplements-and-raised-creatinine-levels" target="_blank" rel="noopener">Creatine supplements and raised creatinine levels</a>).</p><p><b>Simplified.</b> “Months not counted” assumes kidney function falls at a steady rate on the 2021 scale; that rate is an assumption for illustration, and real decline varies a lot. Listing also depends on a full medical evaluation, not one number. The values you enter stay in this browser tab and are never sent anywhere.</p><p><b>This is a teaching model, not medical advice.</b> Questions about a real lab report belong with that patient’s doctor.</p>',
 thumbSetup(sim){sim.st.revealed=true;}
};
BioLab.register(SIM);

BioLab.addPractical({egfr:{
 hook:'A 60-year-old man in your family shows you his lab report: blood creatinine 3.4 mg/dL. Waiting time for a kidney transplant typically starts counting when eGFR is 20 or lower. Does his report cross that line under the race-free 2021 equation? Under the 2009 equation, if he is recorded as Black?',
 answer:'Under the 2021 equation his eGFR is 19.8, so waiting time can start. Under the 2009 equation with the 1.159 multiplier it is 21.5, so it can’t: his creatinine would have to rise to about 3.61 mg/dL first. With no multiplier the 2009 equation gives 18.5.',
 uses:['Lab reports and patient portals often print an eGFR right next to creatinine. It is computed by an equation, not measured directly, so the equation the lab chose is part of the result.','Kidney transplant waiting lists: from January 2023 the transplant network required waiting time to be credited back to Black candidates delayed by the race multiplier. By mid-March 2024, 14,280 had moved up the list and nearly 3,000 had received transplants.','Athletes: creatinine comes from muscle, so very muscular people and people taking creatine supplements can have higher blood creatinine and a lower eGFR even when their kidneys are normal. The equation reads muscle as weaker filtering.'],
 takeaway:'An equation is a set of choices. One race multiplier changed who counted as sick enough, and replacing it moved thousands of people up the transplant list.'}});

BioLab.addReview({egfr:{questions:[
 {id:'f50',kind:'real',lvl:'bio',q:'A 50-year-old woman has blood creatinine 2.6 mg/dL. To the nearest 0.1, what is her eGFR under the 2021 equation?',num:{ans:21.8,tol:0.15,unit:'mL/min/1.73 m²'},
  steps:['For a woman, κ = 0.7 and α = −0.241. Scr/κ = 2.6 ÷ 0.7 = 3.714, which is above 1, so only the max term matters: 3.714<sup>−1.200</sup> = 0.207.','Age term: 0.9938<sup>50</sup> = 0.733. Female term: 1.012.','eGFR = 142 × 0.207 × 0.733 × 1.012 ≈ 21.8. She is just above the line of 20.'],
  lab:{set:{scr:2.6,age:50,sex:'F'},act:'show',look:'Read <b>eGFR, 2021 equation</b>.'},verify:[['e21',21.8,0.1]]},
 {id:'mult',kind:'test',lvl:'bio',q:'The 2009 equation multiplied by 1.159 for patients recorded as Black. For the same creatinine, age and sex, how much higher did that make the reported eGFR?',choices:['1.159 points higher','15.9% higher','1.159% higher','It depends on creatinine only'],correct:1,
  steps:['Multiplying by 1.159 is the same as adding 0.159 of the value, which is 15.9%.','For a 60-year-old man with creatinine 3.4, that turns 18.5 into 21.5.']},
 {id:'cross55',kind:'real',lvl:'honors',q:'A 55-year-old man is recorded as Black. To the nearest 0.01 mg/dL, what creatinine makes his 2009 eGFR reach 20, and what creatinine does the 2021 equation need?',choices:['3.72 under 2009, 3.47 under 2021','3.47 under 2009, 3.72 under 2021','3.29 under both','4.05 under 2009, 3.75 under 2021'],correct:0,
  steps:['Above κ, eGFR is a power law in creatinine, so solve 20 = (constants) × (Scr/0.9)<sup>exponent</sup> for each equation.','2021: 142 × 0.9938<sup>55</sup> × (Scr/0.9)<sup>−1.2</sup> = 20 gives Scr ≈ 3.47 mg/dL.','2009 with 1.159: 141 × 0.993<sup>55</sup> × 1.159 × (Scr/0.9)<sup>−1.209</sup> = 20 gives Scr ≈ 3.72 mg/dL. His creatinine must climb about 0.25 mg/dL more.'],
  lab:{set:{scr:3.5,age:55,sex:'M',black:'yes'},act:'show',look:'Read both <b>Creatinine where … reaches 20</b> tiles.'},verify:[['c09',3.72,0.01],['c21',3.47,0.01]]},
 {id:'double',kind:'test',lvl:'honors',q:'A 40-year-old man’s creatinine doubles from 1.0 to 2.0 mg/dL. Under the 2021 equation, about what happens to his eGFR?',choices:['It halves, from 97.6 to 48.8','It falls to about 42.5, a bit less than half','It falls by 1.2 points','It doubles'],correct:1,
  steps:['Both values are above κ = 0.9, so eGFR is proportional to Scr<sup>−1.2</sup>.','Doubling Scr multiplies eGFR by 2<sup>−1.2</sup> = 0.435.','97.6 × 0.435 ≈ 42.5. Because the exponent is steeper than −1, doubling creatinine more than halves eGFR.'],
  lab:{set:{scr:2,age:40,sex:'M'},act:'show',look:'Read <b>eGFR, 2021 equation</b>, then set creatinine to 1.0.'},verify:[['e21',42.5,0.1]]},
 {id:'months',kind:'real',lvl:'ap',q:'A 60-year-old man recorded as Black, with function assumed to fall 3 points a year on the 2021 scale. How many months of waiting time does the 1.159 multiplier cost him? Round to the nearest month.',num:{ans:6,tol:0.6,unit:'months'},
  steps:['The 2009 report reaches 20 when creatinine is about 3.61 mg/dL.','At that creatinine the 2021 equation reads about 18.47.','The 2021 scale had to fall from 20 to 18.47: 1.53 points. At 3 points a year: 1.53 ÷ 3 = 0.51 years ≈ 6.1 months.'],
  lab:{set:{scr:3.4,age:60,sex:'M',black:'yes',rate:3},act:'show',look:'Read <b>Waiting time not counted</b>.'},verify:[['months',6.1,0.1]]},
 {id:'what',kind:'test',lvl:'bio',q:'What does eGFR estimate?',choices:['How much blood the kidneys filter each minute, scaled to body size','How much urine you make in a day','How much creatinine your muscles make','The size of your kidneys'],correct:0,
  steps:['GFR is the glomerular filtration rate: the volume of blood plasma filtered by the glomeruli each minute.','The e means estimated: it comes from an equation using creatinine, age and sex, reported per 1.73 m² of body surface so people of different sizes can be compared.']}
]}});
})();
