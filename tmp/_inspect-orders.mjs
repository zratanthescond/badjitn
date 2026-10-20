import {readFileSync,writeFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;const ev=new m.Types.ObjectId('6a7b1e6233d40a79156fd924');
const e=await db.collection('events').findOne({_id:ev},{projection:{title:1,pricePlans:1}});
console.log(e.title);console.log(JSON.stringify(e.pricePlans,null,1));
const orders=await db.collection('orders').find({event:ev}).toArray();
const users=await db.collection('users').find({_id:{$in:orders.map(o=>o.buyer).filter(Boolean)}}).toArray();
const uM=new Map(users.map(u=>[String(u._id),u]));
const get=(o,re)=>(o.requiredUserInfo||[]).find(r=>re.test(r.label)||re.test(r.field))?.value;
const out=orders.map(o=>({id:String(o._id),n:o.orderNumber,first:get(o,/^pr[ée]nom$|first/i)||uM.get(String(o.buyer))?.firstName,last:get(o,/^nom$|last/i)||uM.get(String(o.buyer))?.lastName,email:get(o,/e-?mail/i)||uM.get(String(o.buyer))?.email,details:o.details}));
writeFileSync('tmp/orders-dump.json',JSON.stringify(out,null,1));
console.log(out.length);console.log(JSON.stringify(out.slice(0,3),null,1));await m.disconnect();
