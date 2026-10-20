import {readFileSync} from 'fs';import m from 'mongoose';
for(const l of readFileSync('.env.local','utf8').split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const i=t.indexOf('=');process.env[t.slice(0,i).trim()]??=t.slice(i+1).trim()}
await m.connect(process.env.MONGODB_URI,{dbName:'badjitn'});
const r=await m.connection.db.collection('eventworks').find({'fileUrls.0':{$exists:true}}).project({fileUrls:1}).limit(400).toArray();
console.log(r.length);const ext={};r.forEach(x=>x.fileUrls.forEach(u=>{const e=u.split('?')[0].split('.').pop().toLowerCase();ext[e]=(ext[e]||0)+1}));console.log(ext,r.slice(0,3).map(x=>x.fileUrls));
await m.disconnect();
