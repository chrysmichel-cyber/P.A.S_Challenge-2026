/* Charge les modules du jeu sous Node comme dans le navigateur (window.LCA). */
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function load(){
 const w={};w.window=w;w.LCA={};w.btoa=btoa;w.atob=atob;w.TextEncoder=TextEncoder;
 vm.createContext(w);
 const run=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),w,{filename:f});
 /* les modules « purs » s’exportent via module.exports sous Node ; ici on les exécute comme des scripts de navigateur */
 ['js/data/common.js'].forEach(run);
 fs.readdirSync(path.join(root,'js/data')).filter(f=>f.endsWith('.js')&&!['common.js','regions.js'].includes(f)).forEach(f=>run('js/data/'+f));
 ['js/learn/progression.js','js/learn/storage.js','js/account/accounts.js','js/oral/oral.js','js/review/review.js','js/learn/quiz.js','js/data/quiz/curriculum.js','js/data/quiz/bank.js'].forEach(run);
 return w.LCA;
}
function memStorage(init){const m=Object.assign({},init||{});return {getItem:k=>(k in m?m[k]:null),setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},_m:m}}
module.exports={load,memStorage,root};
