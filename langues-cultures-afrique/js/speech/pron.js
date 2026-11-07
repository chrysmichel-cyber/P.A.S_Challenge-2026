/* Comparaison de deux enregistrements (voix de référence d'un locuteur / voix du joueur). Module pur : navigateur (LCA.pron) et Node (tests).
   IMPORTANT : ce n'est PAS une évaluation de la prononciation. On compare seulement deux courbes mesurables : le RYTHME (enveloppe d'énergie
   dans le temps) et la MÉLODIE (hauteur de la voix, en demi-tons autour de la médiane). Ni les sons ni les tons lexicaux d'une langue
   ne sont reconnus. Le résultat est une aide à l'écoute, à lire avec prudence, jamais une note de justesse linguistique. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.pron=f()}})(typeof self!=='undefined'?self:this,function(){
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 /* réduit à ~16 kHz en moyennant (suffisant pour la voix) */
 function down(x,sr){const k=Math.max(1,Math.floor(sr/16000));if(k===1)return {x,sr};const n=Math.floor(x.length/k),y=new Float32Array(n);for(let i=0;i<n;i++){let a=0;for(let j=0;j<k;j++)a+=x[i*k+j];y[i]=a/k}return {x:y,sr:sr/k}}
 /* enveloppe d'énergie : log-RMS par trame, puis normalisée entre 0 et 1 */
 function envelope(x,sr,ms){const hop=Math.max(1,Math.round(sr*(ms||20)/1000)),n=Math.floor(x.length/hop),e=new Float32Array(n);let mx=-1e9,mn=1e9;
  for(let i=0;i<n;i++){let s=0;for(let j=0;j<hop;j++){const v=x[i*hop+j];s+=v*v}const l=Math.log10(Math.sqrt(s/hop)+1e-5);e[i]=l;if(l>mx)mx=l;if(l<mn)mn=l}
  const span=Math.max(1e-6,mx-mn);for(let i=0;i<n;i++)e[i]=(e[i]-mn)/span;return {e,hop,peakDb:20*mx,range:span}}
 /* retire le silence au début et à la fin ; renvoie [début, fin] en trames */
 function bounds(e,thr){thr=thr===undefined?.5:thr;let a=0,b=e.length-1;while(a<b&&e[a]<thr)a++;while(b>a&&e[b]<thr)b--;return [a,b+1]}
 /* hauteur par autocorrélation (70 à 400 Hz) ; 0 = non voisé */
 function pitch(x,sr,ms){const hop=Math.round(sr*(ms||40)/1000),n=Math.floor((x.length-hop)/hop),lo=Math.floor(sr/400),hi=Math.floor(sr/70),out=new Float32Array(Math.max(0,n));
  for(let i=0;i<n;i++){const o=i*hop;let e0=0;for(let j=0;j<hop;j++)e0+=x[o+j]*x[o+j];if(e0/hop<1e-6){out[i]=0;continue}
   let best=0,bl=0;for(let l=lo;l<=hi&&o+hop+l<=x.length;l++){let c=0;for(let j=0;j<hop;j++)c+=x[o+j]*x[o+j+l];if(c>best){best=c;bl=l}}
   out[i]=bl&&best/e0>.45?sr/bl:0}
  return out}
 function dtw(a,b,band){const n=a.length,m=b.length;if(!n||!m)return 1;band=Math.max(band||0,Math.abs(n-m))+Math.ceil(Math.max(n,m)*.25);
  const INF=1e9;let prev=new Float32Array(m+1).fill(INF),cur=new Float32Array(m+1);prev[0]=0;
  for(let i=1;i<=n;i++){cur.fill(INF);const jlo=Math.max(1,Math.floor(i*m/n)-band),jhi=Math.min(m,Math.ceil(i*m/n)+band);
   for(let j=jlo;j<=jhi;j++){const d=Math.abs(a[i-1]-b[j-1]);cur[j]=d+Math.min(prev[j],cur[j-1],prev[j-1])}[prev,cur]=[cur,prev]}
  return prev[m]/(n+m)}
 const toSemis=(p)=>{const v=Array.from(p).filter(h=>h>0);if(v.length<5)return null;const s=v.slice().sort((a,b)=>a-b),med=s[s.length>>1];return v.map(h=>12*Math.log2(h/med))}
 /* analyse d'un enregistrement mono */
 function analyse(x,sr){const d=down(x,sr),env=envelope(d.x,d.sr,20),[a,b]=bounds(env.e,.35),core=env.e.slice(a,b);
  const dur=core.length*env.hop/d.sr,p=pitch(d.x.subarray(a*env.hop,b*env.hop),d.sr,40);
  return {env:core,dur,pitch:toSemis(p),voiced:p.length?Array.from(p).filter(h=>h>0).length/p.length:0,silent:env.range<.3||core.length<8,peakDb:env.peakDb}}
 /* compare(référence, joueur) → {ok, score 0-100, rhythm, melody|null, durRatio, tips[]} */
 function compare(ref,usr,sr1,sr2){
  const A=analyse(ref,sr1),B=analyse(usr,sr2||sr1);
  if(A.silent)return {ok:false,error:'ref'};if(B.silent)return {ok:false,error:'silence'};
  const rhythm=Math.exp(-5*dtw(A.env,B.env,10)),dr=B.dur/A.dur;
  let melody=null;if(A.pitch&&B.pitch){const sm=v=>{const o=[];for(let i=0;i<v.length;i+=2)o.push(v[i]);return o};melody=Math.exp(-.35*dtw(sm(A.pitch),sm(B.pitch),6)*3)}
  const durScore=Math.exp(-Math.abs(Math.log(clamp(dr,.2,5)))*1.6);
  const score=Math.round(100*(melody===null?(.7*rhythm+.3*durScore):(.45*rhythm+.35*melody+.2*durScore)));
  const tips=[];if(dr>1.35)tips.push('Ton enregistrement est plus lent que la référence : essaie de dire le mot un peu plus vite.');else if(dr<.7)tips.push('Ton enregistrement est plus rapide que la référence : prends ton temps sur le mot.');
  if(melody!==null&&melody<.55)tips.push('La mélodie de ta voix (montées et descentes) diffère de la référence : réécoute-la en suivant la hauteur.');
  if(rhythm<.55)tips.push('Le rythme des syllabes est différent : écoute où la voix marque des temps forts.');
  if(!tips.length)tips.push('Rythme et durée proches de la référence.');
  return {ok:true,score:clamp(score,0,100),rhythm:+rhythm.toFixed(2),melody:melody===null?null:+melody.toFixed(2),durRatio:+dr.toFixed(2),tips,approx:true}}
 return {down,envelope,bounds,pitch,dtw,analyse,compare}});
