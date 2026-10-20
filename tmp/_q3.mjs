import {readFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});const db=m.connection.db;
for(const c of ['eventworks','works','event_works']){const r=await db.collection(c).find({title:/^testtest/i}).project({title:1,userId:1,orderId:1,eventId:1,summaryStatus:1}).toArray();console.log(c,r)}
const cols=(await db.listCollections().toArray()).map(c=>c.name);console.log((await db.collection('eventworks').deleteOne({_id:new m.Types.ObjectId('6abd0844467e3968c2249a1e'),title:'testtesttesttest'})).deletedCount);
await m.disconnect();
