import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');const pw=createRequire(import.meta.url)('playwright');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'x'});r.end(b)})});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const b=await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [w,h] of [[844,390],[740,360],[667,375],[932,430],[568,320]])for(const mode of ['2d','3d']){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
 await ctx.addInitScript(m=>{window.LCA_NO_FSGATE=true;localStorage.setItem('lca-v2',JSON.stringify({v:5,settings:{mode:m,modeV:2,sound:0,__set:1}}))},mode);
 const p=await ctx.newPage();await p.route('**/fonts.g*/**',r=>r.abort());await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForTimeout(3000);await p.evaluate(()=>{const b=document.querySelector('[data-setup=go]');if(b)b.click()});await p.waitForTimeout(3500);
 const j=s=>p.evaluate(x=>{const e=document.querySelector(x);e&&e.dispatchEvent(new MouseEvent('click',{bubbles:true}))},s);
 await j('[data-m=new]');await p.waitForTimeout(300);await j('.mdot[data-map=wolof]');await j('[data-pick=wolof]');await j('[data-go2=start]');await p.waitForTimeout(3500);
 const r=await p.evaluate(()=>{const ids=['quest','topr','mini','ambHud','hidHud','dock','joy','joyc','toast','act'];const R=ids.map(i=>{const e=document.getElementById(i);if(!e||e.hidden)return null;const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return null;const b=e.getBoundingClientRect();return b.width?{i,x0:b.left,y0:b.top,x1:b.right,y1:b.bottom}:null}).filter(Boolean);const bad=[];for(let a=0;a<R.length;a++)for(let c=a+1;c<R.length;c++){const p=R[a],q=R[c];if(p.x0<q.x1-1&&q.x0<p.x1-1&&p.y0<q.y1-1&&q.y0<p.y1-1)bad.push(p.i+'×'+q.i)}const off=R.filter(e=>e.x0<-1||e.y0<-1||e.x1>innerWidth+1||e.y1>innerHeight+1).map(e=>e.i);return {bad,off}});
 console.log(w+'x'+h,mode,JSON.stringify(r));await ctx.close()}
await b.close();srv.close();
