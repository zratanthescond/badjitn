import {readFileSync,writeFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;const ev=new m.Types.ObjectId('6a7b1e6233d40a79156fd924');
const orders=await db.collection('orders').find({event:ev}).toArray();
console.log(orders.length, orders.map(o=>o.updatedAt).filter(Boolean).sort().slice(-3), orders.map(o=>o.createdAt).filter(Boolean).sort().slice(-2));
console.log([...new Set(orders.flatMap(o=>(o.requiredUserInfo||[]).map(r=>r.field+'|'+r.label)))]);
console.log([...new Set(orders.flatMap(o=>(o.details||[]).map(d=>d.name+'|'+d.option+'|'+d.price)))].filter(x=>/uit|Nuit/i.test(x)));
console.log(Object.keys(orders[0]));
writeFileSync('tmp/_orders-full.json',JSON.stringify(orders));
await m.disconnect();
