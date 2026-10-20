import {readFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});
const e=await m.connection.db.collection('events').findOne({_id:new m.Types.ObjectId('6a7b1e6233d40a79156fd924')},{projection:{pricePlan:1}});
console.log(JSON.stringify(e.pricePlan.map(p=>({n:p.name,t:p.type,pr:p.price,o:(p.options||[]).map(o=>[o.name,o.price,o.type])})),null,0).slice(0,4000));
await m.disconnect();
