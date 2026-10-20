import {readFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;const ev=new m.Types.ObjectId('6a7b1e6233d40a79156fd924');
const orders=await db.collection('orders').find({event:ev}).toArray();
let mismatch=0,withRoom=0,dbl150=0,dbl150noRoom=0,dbl300=0;
const ex=[];
for(const o of orders){const sum=(o.details||[]).reduce((a,d)=>a+Number(d.price||0),0);
 if(sum!==Number(o.totalAmount)){mismatch++;if(ex.length<4)ex.push({n:o.orderNumber,sum,total:o.totalAmount,type:o.type,orig:o.originalAmount,disc:o.discountInfo?.label})}
 const rm=(o.requiredUserInfo||[]).find(r=>r.field==='roommateName')?.value;
 for(const d of o.details||[]) if(/double/i.test(d.option||'')){ if(d.price==='150'){dbl150++; if(!rm)dbl150noRoom++} if(d.price==='300')dbl300++ }
 if(rm)withRoom++}
console.log({total:orders.length,mismatch,withRoom,dbl150,dbl150noRoom,dbl300});console.log(ex);
const o=orders.find(x=>x.orderNumber===193);console.log(JSON.stringify({...o,requiredUserInfo:o.requiredUserInfo.map(r=>r.field+'='+String(r.value).slice(0,30))},null,1));
await m.disconnect();
