(function(){
'use strict';
const {clamp,rr,txt,pill,atLeast,PAL,FONT,axes,legend,fmtNum}=BioLab.h;

/* Lung function: who counts as normal?
   ILLUSTRATIVE reference model (not GLI, not a clinical equation):
   predicted FEV1 (L) = c × (height in m)² × g(age), c = 1.42 (male) or 1.24 (female),
   g(age) = 0.80 + 0.02 × (age − 12) up to age 22, then 1 − 0.007 × (age − 22).
   Healthy people spread around the prediction with a coefficient of variation of 13%, so z = (measured/predicted − 1) / 0.13.
   Lower limit of normal (LLN) = the 5th percentile, z = −1.645. The race-specific reference (older practice) predicts 15% lower for patients recorded as Black. */
const CV=0.13,ZL=-1.645,RS=0.85,RATIO_DEF=0.82;
const g=a=>a<22?0.80+0.02*(a-12):1-0.007*(a-22);
const predN=sim=>(sim.p.sex==='F'?1.24:1.42)*Math.pow(sim.p.ht/100,2)*g(sim.p.age);
const B=sim=>sim.p.black==='yes';
const predR=sim=>predN(sim)*(B(sim)?RS:1);
const zOf=(m,p)=>(m/p-1)/CV,lln=p=>p*(1+ZL*CV);
const zN=sim=>zOf(sim.p.fev1,predN(sim)),zR=sim=>zOf(sim.p.fev1,predR(sim));
function phi(z){const x=z/Math.SQRT2,t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return 0.5*(1+(x>=0?y:-y));}
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const key=sim=>[sim.p.fev1,sim.p.age,sim.p.ht,sim.p.sex,sim.p.black].join('|');
const CALLS={both:'Flagged under both references',neutral:'Flagged only under the race-neutral reference',specific:'Flagged only under the race-specific reference',neither:'Not flagged under either'};
const BTN=[['both','Both'],['neutral','Neutral only'],['specific','Specific only'],['neither','Neither']];
function truth(sim){const a=zN(sim)<ZL,b=zR(sim)<ZL;return a&&b?'both':a?'neutral':b?'specific':'neither';}
const shown=sim=>sim.st&&sim.st.revealed;
const callNow=sim=>{const c=sim.st&&sim.st.call;return c&&c.key===key(sim)?c:null;};
const btnRect=(i,sY,sH,X0,X1)=>{const gp=8,w=(X1-X0-3*gp)/4;return [X0+i*(w+gp),sY+4,w,sH-8];};
function wrap(ctx,s,x,y,w,o){o=o||{};const size=o.s||13,lh=o.lh||size*1.3;ctx.font=(o.w||400)+' '+size+'px '+FONT;let line='',yy=y;
  String(s).split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;line=word;}else line=t;});
  if(line){txt(ctx,line,x,yy,{s:size,w:o.w,c:o.c,a:o.a});yy+=lh;}return yy;}
const extra=sim=>Math.max(0,sim.p.fev1-lln(predR(sim)));

const SIM={
 id:'spirometry',hash:'spirometry',apUnit:3,order:4,kind:'Learning tool',tab:'Lung function: who counts as normal?',prereq:['breathing'],
 card:'Enter a spirometry result and see whether it is flagged as below normal under a race-specific and a race-neutral reference.',
 title:'Lung function: who counts as normal?',
 lede:{bio:'Spirometry measures how much air you can blow out, and how fast. Your result is compared with a “normal” predicted from your age, height and sex. For decades, many labs also used a lower “normal” for Black patients.',
  honors:'A result below the lower limit of normal (about the bottom 5% of healthy people) is flagged. Compare z-scores and percent of predicted under a race-specific reference, which predicted 15% lower for Black patients, and a race-neutral one.',
  ap:'With z = (measured/predicted − 1)/CV and LLN at z = −1.645, find how far a measured FEV1 must fall before each reference flags it. The prediction model here is illustrative, not the GLI equations.'},
 scale:'One forced breath out, about 6 seconds. A healthy teen’s first second can move 3 to 4 liters of air.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'The test',
 controls:[
  {id:'fev1',label:'Measured FEV1 (air out in the first second)',type:'range',min:0.8,max:6,step:0.05,def:2.85,d:2,unit:' L',help:'What you enter stays in this browser tab.'},
  {id:'age',label:'Age',type:'range',min:12,max:80,step:1,def:16,unit:' years'},
  {id:'ht',label:'Height',type:'range',min:140,max:200,step:1,def:175,unit:' cm',help:'175 cm is about 5 ft 9 in.'},
  {id:'sex',label:'Sex',type:'seg',def:'M',options:[{v:'M',l:'Male'},{v:'F',l:'Female'}]},
  {id:'black',label:'Race on the test order (only the race-specific reference uses it)',type:'seg',def:'yes',options:[{v:'yes',l:'Black'},{v:'no',l:'Not Black'}]},
  {id:'call',label:'Your call: under which reference is this result flagged?',type:'seg',def:'both',noTrial:true,options:BTN.map(b=>({v:b[0],l:b[1]})),help:'Make your call before you look, then press Lock in my call.'},
  {id:'ratio',label:'FEV1/FVC ratio',type:'range',min:0.5,max:0.9,step:0.01,def:RATIO_DEF,d:2,lvl:'ap',help:'Healthy young people often blow out about 80% of their air in the first second. Use this to see the full breath (FVC).'}
 ],
 actions:[
  {id:'lock',label:'Lock in my call',primary:true,run(sim){sim.st.call={pick:sim.p.call,key:key(sim),truth:truth(sim)};sim.st.revealed=true;}},
  {id:'show',label:'Show the math',run(sim){sim.st.revealed=true;}},
  {id:'hide',label:'New call: hide the results',run(sim){sim.st.revealed=false;sim.st.call=null;}}
 ],
 init(){return {revealed:false,call:null};},step(){},
 metrics:[
  {id:'predN',label:'Predicted FEV1, race-neutral',unit:'L',d:2,min:0,max:6,get:predN},
  {id:'zN',label:'z-score, race-neutral',unit:'',d:2,min:-5,max:3,get:zN},
  {id:'flag',label:'Flagged below normal?',text:true,noTrial:true,get:sim=>'Race-neutral: '+(zN(sim)<ZL?'yes':'no')+' · Race-specific: '+(zR(sim)<ZL?'yes':'no')},
  {id:'predR',label:'Predicted FEV1, race-specific',unit:'L',d:2,lvl:'honors',min:0,max:6,get:predR},
  {id:'zR',label:'z-score, race-specific',unit:'',d:2,lvl:'honors',min:-5,max:3,get:zR},
  {id:'pctN',label:'Percent of predicted, race-neutral',unit:'%',d:1,lvl:'honors',min:0,max:150,get:sim=>sim.p.fev1/predN(sim)*100},
  {id:'pctR',label:'Percent of predicted, race-specific',unit:'%',d:1,lvl:'honors',min:0,max:150,get:sim=>sim.p.fev1/predR(sim)*100},
  {id:'llnN',label:'Lower limit of normal, race-neutral',unit:'L',d:2,lvl:'ap',min:0,max:6,get:sim=>lln(predN(sim))},
  {id:'llnR',label:'Lower limit of normal, race-specific',unit:'L',d:2,lvl:'ap',min:0,max:6,get:sim=>lln(predR(sim))},
  {id:'extra',label:'Further drop before the race-specific reference flags it',unit:'L',d:2,lvl:'ap',min:0,max:null,get:extra},
  {id:'fvc',label:'FVC (whole breath out)',unit:'L',d:2,lvl:'ap',min:0,max:8,get:sim=>sim.p.fev1/sim.p.ratio}
 ],
 graphs:[{id:'pct',label:'Percentile vs. measured FEV1',custom:true}],defaultGraph:'pct',
 plot(sim,ctx,box){const pn=predN(sim),pr=predR(sim),xmax=Math.ceil(pn*1.3*2)/2;
  const ax=axes(ctx,box,{xmin:0,xmax,ymin:0,ymax:100,xl:'Measured FEV1 (L)',yl:'Percentile among healthy people'});
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(5));ctx.lineTo(ax.X(xmax),ax.Y(5));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'5th percentile (LLN)',ax.X(xmax)-4,ax.Y(5)-6,{s:12,c:PAL['s1'],a:'right',w:700});
  const curve=(p,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();for(let m=0.05;m<=xmax+1e-9;m+=0.05){const px=ax.X(m),py=ax.Y(100*phi(zOf(m,p)));m<0.06?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
  curve(pn,PAL['s2']);if(B(sim))curve(pr,PAL['s4'],[8,5]);
  if(shown(sim)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(sim.p.fev1),ax.Y(0));ctx.lineTo(ax.X(sim.p.fev1),ax.Y(100));ctx.stroke();}
  const L=[{label:'Race-neutral',color:PAL['s2']}];if(B(sim))L.push({label:'Race-specific (Black)',color:PAL['s4'],dash:true});legend(ctx,box.L+12,box.T+12,L);},
 draw(sim,ctx,vdt,k){const W=800,H=450,p=sim.p,sh=shown(sim),pn=predN(sim),pr=predR(sim);sim.vis.k=k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: the spirogram (volume vs. time) */
  const big=k>1.3;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,12,12,262,H-24,14);ctx.fill();
  txt(ctx,big?'Breath out (L)':'Your breath out',26,36,{s:13*k,w:800});
  const ratio=atLeast('ap')?p.ratio:RATIO_DEF,fvc=p.fev1/ratio,tau=-1/Math.log(1-ratio);
  const infoY=H-24,secY=infoY-16*k-4,tickY=(big?infoY:secY)-16*k-2,gx=50+6*k,gy=56+10*k,gw=262-gx-8,gh=tickY-12*k-4-gy,VM=Math.max(6,Math.ceil(fvc)),Xs=t=>gx+t/6*gw,Ys=v=>gy+gh-v/VM*gh;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke();
  for(let v=big?2:0;v<=VM;v+=2)txt(ctx,String(v),gx-6,Ys(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  (big?[0,1,6]:[0,1,3,6]).forEach(t=>txt(ctx,String(t),Xs(t),tickY,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  if(!big){txt(ctx,'seconds',gx+gw,secY,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'liters',gx-6,gy-10,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  ctx.strokeStyle=PAL['s6'];ctx.lineWidth=3;ctx.beginPath();for(let t=0;t<=6.001;t+=0.05){const v=fvc*(1-Math.exp(-t/tau));t===0?ctx.moveTo(Xs(t),Ys(v)):ctx.lineTo(Xs(t),Ys(v));}ctx.stroke();
  ctx.setLineDash([4,4]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(Xs(1),gy+gh);ctx.lineTo(Xs(1),Ys(p.fev1));ctx.lineTo(gx,Ys(p.fev1));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(Xs(1),Ys(p.fev1),6,0,7);ctx.fill();
  txt(ctx,'FEV1 '+f2(p.fev1)+' L',Xs(1)+10,Ys(p.fev1)+16*k,{s:12*k,w:700,c:PAL['rj']});
  txt(ctx,'FVC '+f1(fvc)+' L',gx+gw,Ys(fvc)-8,{s:12*k,w:700,c:PAL['s6'],a:'right'});
  txt(ctx,p.age+' y, '+p.ht+' cm, '+(p.sex==='F'?'female':'male'),26,infoY,{s:12*k,c:PAL['cv-soft']});
  if(!big)txt(ctx,'Stays on this device',260,infoY,{s:12*k,c:PAL['cv-soft'],a:'right'});
  /* right: the healthy spread under each reference, on one liters axis */
  const X0=300,X1=780,lo=Math.max(0,Math.min(pn*0.35,p.fev1-0.3)),hi=Math.max(pn*1.45,p.fev1+0.3),X=v=>X0+(v-lo)/(hi-lo)*(X1-X0);
  const sH=Math.max(46,30*k+16),sY=H-12-sH,mY=sY-8,axY=mY-16*k-2,rowH=(axY-12*k-6-16)/2,mx=X(p.fev1);
  const row=(i,pp,col,name)=>{const top=16+i*rowH,ty=top+12*k,lane=12*k+10,base=top+rowH-lane,cTop=ty+8,peak=base-cTop,sd=CV*pp,L=lln(pp);
   txt(ctx,name,X0,ty,{s:12*k,w:800,c:col});
   const yAt=v=>base-peak*Math.exp(-0.5*Math.pow((v-pp)/sd,2)),dv=(hi-lo)/200;
   ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(X(lo),base);for(let v=lo;v<=L;v+=dv)ctx.lineTo(X(v),yAt(v));ctx.lineTo(X(L),yAt(L));ctx.lineTo(X(L),base);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.fillStyle=col;ctx.globalAlpha=.16;ctx.beginPath();ctx.moveTo(X(L),base);for(let v=L;v<=hi;v+=dv)ctx.lineTo(X(v),yAt(v));ctx.lineTo(X(hi),base);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let v=lo;v<=hi+1e-9;v+=dv){v===lo?ctx.moveTo(X(v),yAt(v)):ctx.lineTo(X(v),yAt(v));}ctx.stroke();
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X0,base);ctx.lineTo(X1,base);ctx.stroke();
   ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(L),base+4);ctx.lineTo(X(L),yAt(L)-8);ctx.stroke();
   ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(pp),base);ctx.lineTo(X(pp),base-peak);ctx.stroke();
   /* measured line through the curve area only, so it never crosses a label */
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.setLineDash([7,4]);ctx.beginPath();ctx.moveTo(mx,cTop);ctx.lineTo(mx,base);ctx.stroke();ctx.setLineDash([]);
   ctx.font='700 '+(12*k)+'px '+FONT;const l1='LLN '+f2(L),l2='predicted '+f2(pp),w1=ctx.measureText(l1).width,w2=ctx.measureText(l2).width;
   const x1=clamp(X(L),X0+w1/2,X1-w1/2),ly=base+12*k+3;txt(ctx,l1,x1,ly,{s:12*k,w:700,c:PAL['s1'],a:'center'});
   const x2=clamp(X(pp),X0+w2/2,X1-w2/2);if(x2-w2/2>x1+w1/2+10)txt(ctx,l2,x2,ly,{s:12*k,c:PAL['cv-soft'],a:'center'});
   if(sh){const z=zOf(p.fev1,pp),fl=z<ZL,t=(fl?'Flagged':'Normal')+' · z '+f2(z);ctx.font='700 '+(12*k)+'px '+FONT;const pw=ctx.measureText(t).width+16;pill(ctx,t,X1-pw/2,ty-4*k,fl?PAL['s1']:PAL['card2'],fl?'#fff':PAL['cv-ink'],12*k);}};
  row(0,pn,PAL['s2'],big?'Race-neutral':'Race-neutral reference');
  row(1,pr,PAL['s4'],B(sim)?(big?'Race-specific (−15%)':'Race-specific reference (−15%)'):(big?'Race-specific (same)':'Race-specific (same: not Black)'));
  /* liters axis and the measured value */
  const st=hi-lo>3?1:0.5;for(let v=Math.ceil(lo/st)*st;v<=hi+1e-9;v+=st)txt(ctx,(st<1?f1(v):String(v))+(Math.abs(v-Math.ceil(lo/st)*st)<1e-9?' L':''),X(v),axY,{s:12*k,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'Measured '+f2(p.fev1)+' L',clamp(mx,X0+70*k,X1-70*k),mY,{s:12*k,w:700,c:PAL['rj'],a:'center'});
  const c=callNow(sim);
  if(!sh){BTN.forEach((b,i)=>{const r=btnRect(i,sY,sH,X0,X1);ctx.fillStyle=PAL['card'];rr(ctx,r[0],r[1],r[2],r[3],9);ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.stroke();txt(ctx,b[1],r[0]+r[2]/2,r[1]+r[3]/2+1,{s:12*k,w:700,a:'center',b:'middle'});});return;}
  ctx.fillStyle=PAL['card2'];rr(ctx,X0,sY,X1-X0,sH,10);ctx.fill();
  const msg=c?('Your call: '+CALLS[c.pick].toLowerCase()+'. '+(c.pick===c.truth?'That matches the math.':'The math: '+CALLS[c.truth].toLowerCase()+'.')):('The math: '+CALLS[truth(sim)].toLowerCase()+'.');
  ctx.font='700 '+(12*k)+'px '+FONT;const two=ctx.measureText(msg).width>X1-X0-24;
  wrap(ctx,msg,X0+12,sY+sH/2+4*k-(two?7*k:0),X1-X0-24,{s:12*k,w:700,c:c&&c.pick!==c.truth?PAL['s1']:PAL['cv-ink']});},
 onClick(sim,x,y){if(shown(sim))return;const k=sim.vis&&sim.vis.k||1,sH=Math.max(46,30*k+16),sY=450-12-sH;
  BTN.forEach((b,i)=>{const r=btnRect(i,sY,sH,300,780);if(x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]-4&&y<=r[1]+r[3]+4){BioLab.setValues(sim,{call:b[0]});SIM.actions[0].run(sim);}});},
 narrate(sim){const n=zN(sim),r=zR(sim),p=sim.p;
  if(!shown(sim))return '<b>Make your call:</b> is this FEV1 of '+f2(p.fev1)+' L flagged as below normal under the race-neutral reference, the race-specific one, both or neither? Click your pick under the curves.';
  const c=callNow(sim),lead=c?(c.pick===c.truth?'<b>Your call matched the math.</b> ':'<b>Not quite:</b> it is '+CALLS[c.truth].toLowerCase()+'. '):'';
  if(!B(sim))return lead+'Recorded as not Black, both references predict '+f2(predN(sim))+' L, so they agree: z = '+f2(n)+'. Switch the race on the order to see where they split.';
  if(n<ZL&&r>=ZL)return lead+'Same lungs, same breath. The race-neutral reference flags it (z = '+f2(n)+'). The race-specific one, predicting 15% lower, calls it normal (z = '+f2(r)+'). <b>His FEV1 would have to fall another '+f2(extra(sim))+' L</b>, to '+f2(lln(predR(sim)))+' L, before the older reference flagged it.';
  if(n<ZL&&r<ZL)return lead+'Both references flag this result (z = '+f2(n)+' and '+f2(r)+'). The lower race-specific prediction only changes the call for results between '+f2(lln(predR(sim)))+' and '+f2(lln(predN(sim)))+' L.';
  return lead+'Neither reference flags it (z = '+f2(n)+' and '+f2(r)+'). Drag the measured FEV1 down to find where the two references disagree.';},
 challenges:[
  {lvl:'bio',instant:true,q:'Two 16-year-old teammates, both 175 cm, both blow an FEV1 of 2.85 L. The older race-specific reference predicts 15% lower for the one recorded as Black. What does that do to his result?',choices:['His result looks closer to normal, so it is less likely to be flagged','His result looks worse, so it is more likely to be flagged','Nothing: the measured value is the same'],correct:0,explain:'The prediction drops from 3.83 L to 3.25 L, so 2.85 L is 87.6% of his “normal” instead of 74.5%. His z-score moves from −1.96 to −0.95, inside the normal range.'},
  {lvl:'bio',instant:true,q:'A result is flagged when it falls below the lower limit of normal. For these teammates, that limit is 3.01 L under the race-neutral reference and 2.56 L under the race-specific one (for the teammate recorded as Black). Both blew 2.85 L. Who is flagged?',choices:['Both teammates','Only the teammate who is not recorded as Black','Only the teammate recorded as Black','Neither'],correct:1,explain:'The teammate who is not recorded as Black is compared with 3.01 L, so 2.85 L is flagged. The teammate recorded as Black is compared with 2.56 L under the older reference, so the same breath is called normal. Under the race-neutral reference both are flagged.'},
  {lvl:'honors',instant:true,q:'His race-neutral z-score is −1.96. What does that mean?',choices:['His FEV1 is about 2 standard deviations below the predicted mean; only about 2.5% of healthy people are that low','He has 1.96 liters less air than predicted','He is in the 96th percentile'],correct:0,explain:'A z-score counts standard deviations from the predicted mean. In this model one SD is 13% of the prediction, about 0.50 L. z = −1.96 is about the 2.5th percentile, below the 5th-percentile cutoff, so it is flagged.'},
  {lvl:'honors',instant:true,q:'Using percent of predicted, what is his result under each reference?',choices:['74.5% race-neutral, 87.6% race-specific','87.6% race-neutral, 74.5% race-specific','85% under both'],correct:0,explain:'2.85 ÷ 3.83 = 74.5% and 2.85 ÷ 3.25 = 87.6%. An old rule of thumb called anything under 80% low; the lower prediction would have moved him from low to normal on that rule too.'},
  {lvl:'ap',instant:true,q:'In this model the LLN is predicted × (1 − 1.645 × 0.13). For a predicted FEV1 of 3.83 L, what is the LLN?',choices:['About 3.01 L','About 3.25 L','About 3.64 L','About 2.56 L'],correct:0,explain:'1 − 1.645 × 0.13 = 0.786, and 3.83 × 0.786 ≈ 3.01 L. The race-specific LLN is 0.85 of that, about 2.56 L.'},
  {lvl:'ap',instant:true,q:'How much further must his FEV1 fall before the race-specific reference flags it?',choices:['About 0.29 L','About 0.58 L','About 0.15 L','It never will'],correct:0,explain:'2.85 − 2.56 ≈ 0.29 L: about 10% of his breath. Over that whole range, the race-neutral reference is already flagging the result and the race-specific one is calling it normal.'}
 ],
 tour:[
  {title:'The test',text:'Spirometry: take the deepest breath you can, then blow out as hard and fast as you can for about 6 seconds. FEV1 is the air out in the first second. FVC is the whole breath.',focus:[12,12,262,426],pause:true,setup(sim){BioLab.setValues(sim,{fev1:2.85,age:16,ht:175,sex:'M',black:'yes',ratio:RATIO_DEF});sim.st.revealed=false;sim.st.call=null;}},
  {title:'Compared with what?',text:'There is no single normal FEV1. A lab predicts one from age, height and sex. Healthy people spread out around that prediction, like this curve.',focus:[292,14,494,150],pause:true},
  {title:'The lower limit of normal',text:'The red tail is the bottom 5% of healthy people: below the lower limit of normal (LLN), at z = −1.645. A result in the red is flagged as below normal.',focus:[292,14,494,150],pause:true},
  {title:'Make your call',text:'His measured FEV1 is 2.85 L, the dashed line. Under which reference is it flagged? Click one of the four buttons at the bottom, or press Next to see the math.',focus:[292,14,494,426],pause:true},
  {title:'Race-neutral reference',text:'Predicted 3.83 L, LLN 3.01 L. At 2.85 L his z-score is −1.96: flagged. A doctor would look further, for example for asthma.',focus:[292,14,494,150],pause:true,setup(sim){sim.st.revealed=true;}},
  {title:'Race-specific reference',text:'The older practice predicted 15% lower for patients recorded as Black: 3.25 L, with an LLN of 2.56 L. The same breath is now called normal (z = −0.95). His FEV1 would have to fall another 0.29 L before it was flagged.',focus:[292,14,494,330],pause:true},
  {title:'What changed',text:'In May 2023 the American Thoracic Society recommended that labs stop using race-specific equations and use the race-neutral GLI Global equations, because adjusting for race could make abnormal results look normal and delay care.',pause:true},
  {lvl:'ap',title:'The math',text:'z = (measured ÷ predicted − 1) ÷ 0.13. Flag if z < −1.645, so LLN = predicted × 0.786. A 15% lower prediction lowers the LLN by 15% too: from 3.01 L to 2.56 L.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> For which measured values do the two references disagree?</p><ol><li>Keep age 16, 175 cm, male, recorded as Black. Set the measured FEV1 to 3.4, 3.1, 2.8, 2.5 and 2.2 L. Press Show the math and record a trial at each.</li><li>Mark which trials are flagged under each reference.</li></ol><p>Write one sentence: in what range is the same breath called normal by one reference and flagged by the other?</p>',
  honors:'<p><b>Question:</b> Does the gap depend on height or age?</p><ol><li>For heights 160, 175 and 190 cm, record both lower limits of normal (use the percent-of-predicted and z tiles).</li><li>Repeat at ages 16, 40 and 70.</li></ol><p>Explain why the gap in liters grows for taller, younger patients but stays 15% of the prediction.</p>',
  ap:'<p><b>Question:</b> How much lung function can go unflagged?</p><ol><li>Derive LLN = predicted × (1 − 1.645 × CV).</li><li>Show that the unflagged range is 0.15 × LLN<sub>neutral</sub> wide.</li><li>For three patients, compute it and check with the tiles.</li></ol><p><b>CER:</b> The 2023 ATS statement gave reasons on both sides. Make a claim about which reference a lab should use, with evidence from your data and reasoning about what a missed flag costs a patient.</p>'},
 terms:[
  {t:'Spirometry',d:'A breathing test that measures how much air you can blow out and how fast.'},
  {t:'FEV1',d:'Forced expiratory volume in 1 second: the liters of air you blow out in the first second of a hard breath out.'},
  {t:'FVC',d:'Forced vital capacity: the total liters you blow out in the whole hard breath.'},
  {t:'Lower limit of normal (LLN)',d:'The cutoff near the bottom 5% of healthy people like you. Results below it are flagged as abnormal.',lvl:'honors'},
  {t:'z-score',d:'How many standard deviations a result is from the predicted mean. The LLN is at z = −1.645.',lvl:'honors'},
  {t:'Reference equation',d:'The formula a lab uses to predict normal values from age, height and sex.',lvl:'honors'},
  {t:'GLI Global',d:'The race-neutral reference equations the American Thoracic Society recommended in 2023.',lvl:'ap'},
  {t:'VO2 max',d:'The most oxygen your body can use per minute in hard exercise, a common measure of aerobic fitness.',lvl:'ap'}
 ],
 about:'<p><b>This prediction model is illustrative, not clinical.</b> It is not the GLI equations or any published reference. Predicted FEV1 (L) = c × (height in m)² × g(age), with c = 1.42 for males and 1.24 for females, and g(age) = 0.80 + 0.02 × (age − 12) up to 22, then 1 − 0.007 × (age − 22). Healthy people spread around the prediction with a coefficient of variation of 13%, so z = (measured ÷ predicted − 1) ÷ 0.13, and the lower limit of normal is the 5th percentile (z = −1.645). The race-specific reference predicts 15% lower for patients recorded as Black. Real race-specific equations differed by measure and group, and real GLI Global values are not simply the old values for any one group. The spirogram curve assumes FEV1/FVC = 0.82 unless you change it at Deep dive.</p><p><b>Facts.</b> The American Thoracic Society statement (May 2023, endorsed by the European Respiratory Society) recommended replacing race-specific equations with race-neutral GLI Global equations. It noted that race-based adjustment can require lower results from Black patients, in some cases by about 15%, before they are flagged. Its panel found the race-neutral approach did better at predicting outcomes, called race a social construct, and warned that race-based equations can delay diagnosis. It also reported that its first workshop did not reach consensus, that some members worried a change could harm patients, and that research on the best reference population should continue (<a href="https://site.thoracic.org/about-us/news/ats-publishes-official-statement-on-race-ethnicity-and-pulmonary-function-test-interpretation" target="_blank" rel="noopener">ATS news release</a>). Exercise-induced bronchoconstriction is usually diagnosed by a fall in FEV1 of 10% or more after hard exercise.</p><p>The values you enter stay in this browser tab and are never sent anywhere. <b>This is a teaching model, not medical advice.</b> Questions about a real test belong with a doctor.</p>',
 thumbSetup(sim){sim.st.revealed=true;}
};
BioLab.register(SIM);

BioLab.addPractical({spirometry:{
 hook:'Two 16-year-old teammates, both 175 cm tall, get winded at practice and are sent for spirometry. Both blow an FEV1 of 2.85 L. Under the older race-specific reference, one is recorded as Black. Is either result flagged as below normal?',
 answer:'Under the race-neutral reference, both are flagged: predicted 3.83 L, lower limit of normal 3.01 L, z = −1.96. Under the older race-specific reference, the teammate recorded as Black is compared with a 15% lower prediction (3.25 L, LLN 2.56 L) and is called normal at z = −0.95. His FEV1 would have to fall another 0.29 L before that reference flagged it.',
 uses:['Exercise-induced asthma: athletes who get short of breath in hard workouts can be tested with spirometry before and after exercise. A fall in FEV1 of 10% or more is the usual sign.','Pulmonary function labs: in 2023 the American Thoracic Society recommended that labs replace race-specific reference equations with race-neutral GLI Global equations, and the European Respiratory Society endorsed the statement.','Fitness: VO2 max, the most oxygen you can use in hard exercise, is usually limited by how much blood the heart pumps, not by lung size, in healthy athletes. A normal FEV1 tells you your airways are open, not how fit you are.'],
 takeaway:'A test result is only “normal” compared with something. Change the reference and the same breath goes from flagged to fine, so the choice of reference is a choice about who gets a second look.'}});

BioLab.addReview({spirometry:{questions:[
 {id:'pred',kind:'real',lvl:'bio',q:'In this tool’s model, what is the race-neutral predicted FEV1 for a 25-year-old woman who is 163 cm tall? Round to 0.01 L.',num:{ans:3.23,tol:0.02,unit:'L'},
  steps:['Height in meters: 1.63, squared: 2.657.','Age factor at 25: 1 − 0.007 × (25 − 22) = 0.979.','Predicted = 1.24 × 2.657 × 0.979 ≈ 3.23 L.'],
  lab:{set:{age:25,ht:163,sex:'F'},look:'Read <b>Predicted FEV1, race-neutral</b>.'},verify:[['predN',3.23,0.01]]},
 {id:'flag',kind:'test',lvl:'bio',q:'What does it mean when a spirometry result is flagged as below the lower limit of normal?',choices:['It is lower than about 95% of healthy people like that patient','The patient has asthma','The patient blew out less than 80% of their air','The machine made an error'],correct:0,
  steps:['The LLN is set near the 5th percentile of healthy people with the same age, height and sex.','A flagged result means a doctor should look further. It is not a diagnosis by itself.']},
 {id:'z',kind:'real',lvl:'honors',q:'A 40-year-old man, 180 cm, recorded as Black, blows 3.20 L. What is his z-score under each reference (round to 0.01)?',choices:['−1.57 race-neutral, −0.49 race-specific','−0.49 race-neutral, −1.57 race-specific','−1.65 under both','−2.10 race-neutral, −1.00 race-specific'],correct:0,
  steps:['Race-neutral prediction: 1.42 × 1.80² × (1 − 0.007 × 18) = 1.42 × 3.24 × 0.874 ≈ 4.02 L. z = (3.20 ÷ 4.02 − 1) ÷ 0.13 ≈ −1.57.','Race-specific prediction: 0.85 × 4.02 ≈ 3.42 L. z = (3.20 ÷ 3.42 − 1) ÷ 0.13 ≈ −0.49.','Neither is below −1.645, so neither flags him, though the race-neutral result is close to the line.'],
  lab:{set:{fev1:3.2,age:40,ht:180,sex:'M',black:'yes'},act:'show',look:'Read both z-score tiles.'},verify:[['zN',-1.57,0.01],['zR',-0.49,0.01]]},
 {id:'pct',kind:'test',lvl:'honors',q:'Lowering the predicted value by 15% changes the percent of predicted for the same measured FEV1 by what factor?',choices:['It multiplies it by 1 ÷ 0.85 ≈ 1.18','It adds 15 percentage points','It lowers it by 15%','No change'],correct:0,
  steps:['Percent of predicted = measured ÷ predicted.','If predicted is multiplied by 0.85, the percent is divided by 0.85: 74.5% becomes 87.6%.']},
 {id:'gap',kind:'real',lvl:'ap',q:'The 16-year-old, 175 cm teammate recorded as Black blows 2.85 L. How much further must his FEV1 fall, to the nearest 0.01 L, before the race-specific reference flags it?',num:{ans:0.29,tol:0.01,unit:'L'},
  steps:['Race-specific prediction: 0.85 × 3.827 = 3.253 L.','LLN = 3.253 × (1 − 1.645 × 0.13) = 3.253 × 0.786 ≈ 2.557 L.','2.85 − 2.557 ≈ 0.29 L. Over that range the race-neutral reference already flags him.'],
  lab:{set:{fev1:2.85,age:16,ht:175,sex:'M',black:'yes'},look:'Read <b>Further drop before the race-specific reference flags it</b>.'},verify:[['extra',0.293,0.005]]},
 {id:'ats',kind:'test',lvl:'ap',q:'Which reason did the 2023 ATS statement give for moving to race-neutral equations?',choices:['Race-specific adjustment could make abnormal results look normal and delay care','Race-neutral equations are cheaper to run','Spirometers can no longer record race','Lung function does not vary with height'],correct:0,
  steps:['The statement said race-based adjustment can require Black patients to have lower results, in some cases by about 15%, before they are flagged.','It also reported that the race-neutral approach did better at predicting outcomes, while noting that its panel first disagreed and that research should continue.']}
]}});
})();
