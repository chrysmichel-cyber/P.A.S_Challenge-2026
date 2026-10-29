/* Client du monde ouvert : connexion à un salon, envoi de la position, réception des autres joueurs et du chat (texte).
   Module pur (navigateur + Node) : le transport est injecté (LCA.online.create(...).world) ; l'affichage lit `players`. */
(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else{root.LCA=root.LCA||{};root.LCA.worldClient=f()}})(typeof self!=='undefined'?self:this,function(){
 function create(o){
  const api=o.api,me=o.me||(()=>({x:0,z:0,h:0,moving:false})),H={onChat:o.onChat||(()=>{}),onStatus:o.onStatus||(()=>{})};
  let joinName='',sid=null,cursor=0,status='off',room=null,queue=[],fails=0,timer=null,busy=false,joinArgs=null;const players=new Map(),muted=new Set(),chat=[];
  const setStatus=s=>{if(status!==s){status=s;H.onStatus(s)}};
  async function join(args){joinArgs=args;setStatus('connecting');
   try{const r=await api.join(args);sid=r.sid;joinName=r.name;api.setSession(sid);room=r.room;cursor=0;fails=0;players.clear();chat.length=0;absorb(r.state);setStatus('online');return r}
   catch(e){setStatus(e.code==='offline'?'off':'error');throw e}}
  function absorb(st){if(!st)return;const seen=new Set();
   (st.players||[]).forEach(p=>{seen.add(p.id);let q=players.get(p.id);if(!q){q={id:p.id,name:p.name,av:p.av,x:p.x,z:p.z,h:p.h,a:0,tx:p.x,tz:p.z,th:p.h,ph:0};players.set(p.id,q)}
    q.name=p.name;q.av=p.av;q.tx=p.x;q.tz=p.z;q.th=p.h});
   [...players.keys()].forEach(k=>{if(!seen.has(k))players.delete(k)});
   (st.chat||[]).forEach(m=>{if(m.n<=cursor)return;if(!m.sys&&muted.has(m.id)){return}chat.push(m);if(chat.length>100)chat.shift();H.onChat(m)});
   if(typeof st.cursor==='number')cursor=Math.max(cursor,st.cursor);
   if(st.chatError)H.onChat({n:-1,sys:true,err:true,name:'',text:st.chatError.error})}
  async function poll(){if(!sid||busy)return;busy=true;const m=me(),say=queue.shift();
   try{const st=await api.sync({x:m.x,z:m.z,h:m.h,a:m.moving?1:0,since:cursor,say});fails=0;absorb(st);if(status!=='online')setStatus('online')}
   catch(e){if(say)queue.unshift(say);
    if(e.status===401&&joinArgs){sid=null;try{await join(joinArgs)}catch(_){setStatus('error')}}
    else{fails++;setStatus(fails>=6?'error':'reconnecting')}}
   finally{busy=false}}
  function start(ms){stop();timer=setInterval(poll,ms||450)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  async function leave(){stop();const s=sid;sid=null;joinArgs=null;players.clear();queue=[];setStatus('off');if(s){try{await api.leave()}catch(_){}}api.setSession(null)}
  function say(t){t=String(t||'').trim();if(!t||status==='off')return false;if(queue.length<3)queue.push(t);return true}
  async function report(id){return api.report(id)}
  function mute(id,on){if(on===false)muted.delete(id);else muted.add(id)}
  /* lissage des positions distantes ; à appeler à chaque image */
  function tick(dt){const k=Math.min(1,dt*8);players.forEach(q=>{const dx=q.tx-q.x,dz=q.tz-q.z;q.moving=Math.hypot(dx,dz)>.03;
   if(Math.hypot(dx,dz)>25){q.x=q.tx;q.z=q.tz}else{q.x+=dx*k;q.z+=dz*k}
   let dh=q.th-q.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));q.h+=dh*k;if(q.moving)q.ph+=dt*9})}
  return {join,poll,start,stop,leave,say,report,mute,tick,players,chat,muted,get status(){return status},get room(){return room},get sid(){return sid},get joinName(){return joinName},get cursor(){return cursor}}}
 return {create}});
