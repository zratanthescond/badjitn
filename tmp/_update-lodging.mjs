// Usage: node tmp/_update-lodging.mjs [--apply]   (default: dry run, no writes)
import {readFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
const APPLY=process.argv.includes('--apply');
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;const ev=new m.Types.ObjectId('6a7b1e6233d40a79156fd924');
const P1="Formation Pré-Congrès : La médecine de précision";
const P2="Formation Pré-Congrès : Mise en place d'un Système de Pharmacovigilance dans l'industrie Pharmaceutique";
// n = order number; room = single|double ; partner = order number or free-text name ; parcours = P1|P2
const sheet=[
 {n:66,room:'double',partner:104,parcours:P2},{n:104,room:'double',partner:66,parcours:P2},
 {n:111,room:'double',partner:52,parcours:P1},{n:52,room:'double',partner:111,parcours:P1},
 {n:103,room:'double',partner:99},
 {n:75,room:'double',partner:93},{n:93,room:'double',partner:75},
 {n:64,room:'double',partner:82,parcours:P2},{n:82,room:'double',partner:64,parcours:P2},
 {n:80,room:'double',partner:85,parcours:P2},{n:85,room:'double',partner:80,parcours:P2},
 {n:170,room:'double',partner:'Hanen El Jebari'},
 {n:193,room:'single'},
 {n:88,room:'double',partner:86},{n:86,room:'double',partner:88,parcours:P1},
 {n:12,gala:true},
 {n:99,room:'double',partner:103,parcours:P1},{n:117,room:'single',parcours:P2},{n:107,parcours:P2},
 {n:87,parcours:P1},{n:272,parcours:P1},
 {n:190,room:'double',partner:191},{n:191,room:'double',partner:190},
];
const orders=await db.collection('orders').find({event:ev}).toArray();
const byN=new Map(orders.map(o=>[o.orderNumber,o]));
const nameOf=o=>{const g=f=>(o.requiredUserInfo||[]).find(r=>r.field===f)?.value||'';return `${g('firstName')} ${g('lastName')}`.trim()};
const emailOf=o=>(o.requiredUserInfo||[]).find(r=>r.field==='email')?.value||'';
const roommate=o=>(o.requiredUserInfo||[]).find(r=>r.field==='roommateName')?.value?.trim()||'';
const work=new Map(); // n -> {details, info, notes}
const get=o=>{if(!work.has(o.orderNumber))work.set(o.orderNumber,{o,details:o.details.map(d=>({...d})),info:o.requiredUserInfo.map(r=>({...r})),notes:[]});return work.get(o.orderNumber)};
const setInfo=(w,field,label,value)=>{const r=w.info.find(x=>x.field===field);if(r){if(!String(r.value||'').trim()){w.notes.push(`${field}: + "${value}"`);r.value=value}}else{w.info.push({field,label,type:'text',value});w.notes.push(`${field}: + "${value}"`)}};
const nightKey=d=>/^(Pré-)?[Nn]uitée du (\d+)/.exec(d.name)?.[2];
const todo=[];
for(const s of sheet){
 const o=byN.get(s.n);if(!o){todo.push(`#${s.n}: commande introuvable`);continue}
 const w=get(o);
 if(s.partner){const p=typeof s.partner==='number'?byN.get(s.partner):null;
  setInfo(w,'roommateName','Nom du colocataire',p?nameOf(p):s.partner);
  if(p&&emailOf(p))setInfo(w,'roommateEmail','Email du colocataire',emailOf(p));}
 if(s.room){
  const label=s.room==='single'?'Chambre single':'Chambre double';
  const designated=!!w.info.find(r=>r.field==='roommateName')?.value?.trim();
  const existingDouble=w.details.find(d=>nightKey(d)&&/double/i.test(d.option||''));
  const price=s.room==='single'?'200':existingDouble?existingDouble.price:designated?'150':'300';
  const keep=[];
  for(const d of w.details){const k=nightKey(d);
   if(k===undefined){keep.push(d);continue}
   if(k==='21'||k==='22'){keep.push(d)}else w.notes.push(`retire "${d.name}" (${d.option}, ${d.price})`)}
  for(const day of ['21','22']){
   const ex=keep.find(d=>nightKey(d)===day&&!/^Pré/.test(d.name));
   if(!ex){keep.push({name:`Nuitée du ${day} octobre`,price,option:label});w.notes.push(`ajoute Nuitée ${day} ${label} ${price}`)}
   else if(ex.option!==label){w.notes.push(`Nuitée ${day}: ${ex.option} ${ex.price} -> ${label} ${price}`);ex.option=label;ex.price=price}
   }
  w.details=keep;
 }
 if(s.gala&&!w.details.some(d=>/Dîner de Gala/.test(d.option||''))){w.details.push({name:'Suppléments',price:'125',option:'Dîner de Gala (22 octobre)'});w.notes.push('ajoute Suppléments: Dîner de Gala (22 octobre) 125')}
 if(s.parcours){
  const pc=w.details.find(d=>d.name==='Congrès et Pré-congrès');
  if(pc){if(pc.option!==s.parcours){w.notes.push(`parcours: ${String(pc.option).slice(0,40)} -> ${s.parcours.slice(24,50)}`);pc.option=s.parcours}}
  else setInfo(w,'parcours','Parcours pré-congrès',s.parcours===P1?'Parcours 1 : La médecine de précision':"Parcours 2 : Mise en place d'un Système de Pharmacovigilance dans l'industrie Pharmaceutique");
 }
}
// Global rule: double night at 150 with no designated roommate -> 300
for(const o of orders){const w=get(o);const designated=!!w.info.find(r=>r.field==='roommateName')?.value?.trim();
 for(const d of w.details)if(nightKey(d)&&/double/i.test(d.option||'')&&d.price==='150'&&!designated){d.price='300';w.notes.push(`${d.name}: double 150 -> 300 (pas de binôme désigné)`)}}
let changed=0;
for(const [n,w] of [...work].sort((a,b)=>a[0]-b[0])){
 if(!w.notes.length)continue;changed++;
 const before=Number(w.o.totalAmount),sumBefore=w.o.details.reduce((a,d)=>a+Number(d.price||0),0);
 const after=w.details.reduce((a,d)=>a+Number(d.price||0),0);
 const consistent=before===sumBefore;
 console.log(`#${n} ${nameOf(w.o)} | total ${before} -> ${consistent?after:before+' (incohérent, non recalculé)'}`);
 w.notes.forEach(x=>console.log('   -',x));
 if(APPLY)await db.collection('orders').updateOne({_id:w.o._id},{$set:{details:w.details,requiredUserInfo:w.info,...(consistent?{totalAmount:after}:{})}});
}
console.log(`\n${changed} commandes ${APPLY?'MODIFIÉES':'à modifier (dry run)'}`);
console.log('\nÀ traiter à part:');todo.forEach(x=>console.log(' *',x));
await m.disconnect();
