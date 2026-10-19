import {readFileSync,writeFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;const ev=new m.Types.ObjectId('6a7b1e6233d40a79156fd924');
const works=await db.collection('eventworks').find({eventId:ev}).toArray();
const orders=await db.collection('orders').find({event:ev}).toArray();
const users=await db.collection('users').find({_id:{$in:works.map(w=>w.userId)}}).toArray();
const uM=new Map(users.map(u=>[String(u._id),u])), oById=new Map(orders.map(o=>[String(o._id),o]));
const oByBuyer=new Map(); for(const o of orders) if(o.buyer){const k=String(o.buyer);if(!oByBuyer.has(k))oByBuyer.set(k,[]);oByBuyer.get(k).push(o)}
const get=(o,re)=>(o?.requiredUserInfo||[]).find(r=>re.test(r.label))?.value;
const out=works.map(w=>{
  let o=w.orderId?oById.get(String(w.orderId)):null; let via=o?'orderId':'';
  if(!o){const l=oByBuyer.get(String(w.userId))||[]; if(l.length){o=l[0];via='buyer'+l.length}}
  const u=uM.get(String(w.userId));
  return {id:String(w._id),title:w.title,status:w.summaryStatus,abs:(w.abstractFileUrls||[]).length,files:(w.fileUrls||[]).length,
   note:!!(w.note&&w.note.trim())||(w.sections||[]).some(s=>s.content&&s.content.trim()),
   orderNo:o?.orderNumber??null,via,
   oFirst:get(o,/^Pr[ée]nom$/i),oLast:get(o,/^Nom$/i),oEmail:get(o,/^E-?mail$/i),
   uFirst:u?.firstName,uLast:u?.lastName,uEmail:u?.email,created:w.createdAt,ci:w.clientInfo}
});
writeFileSync(process.argv[2],JSON.stringify(out));
console.log(out.length);await m.disconnect();
