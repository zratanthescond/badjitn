import { readFileSync } from "fs";
import mongoose from "mongoose";
for (const l of readFileSync(".env.local","utf8").split("\n")) {
  const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim();
  if(!(k in process.env)) process.env[k]=t.slice(i+1).trim().replace(/^["']|["']$/g,"");
}
await mongoose.connect(process.env.MONGODB_URI,{dbName:"badjitn"});
const db=mongoose.connection.db;
const ev=await db.collection("events").find({title:/pharmaco/i}).project({title:1}).toArray(); console.log("db:",db.databaseName,"events total:",await db.collection("events").countDocuments());
console.log(ev);
const eventId=ev[0]._id;
const nums=[5,7,8,26,18,137,19,34,33,56,46,177,51,81,59,60,114,115,155,156,275,278];
const orders=await db.collection("orders").find({event:eventId,orderNumber:{$in:nums}}).toArray();
const works=await db.collection("eventworks").find({eventId}).toArray();
for(const o of orders.sort((a,b)=>a.orderNumber-b.orderNumber)){
  const ws=works.filter(w=>String(w.userId)===String(o.buyer)||String(w.orderId)===String(o._id));
  const ruiWork=(o.requiredUserInfo||[]).filter(r=>/r[ée]sum|work|abstract|titre|title/i.test(r.label+r.field)&&r.value);
  console.log(`#${o.orderNumber} id=${o._id} buyer=${o.buyer} total=${o.totalAmount} type=${o.type} ruiWorkFields=${ruiWork.length}`);
  for(const w of ws) console.log(`   work ${w._id} user=${w.userId} order=${w.orderId} idx=${w.resumeIndex} status=${w.summaryStatus} files=${(w.fileUrls||[]).length}/${(w.abstractFileUrls||[]).length} "${(w.title||"").slice(0,50)}"`);
  for(const r of ruiWork) console.log(`   rui: ${r.label.slice(0,40)} = ${String(r.value).slice(0,60)}`);
}
// buyers shared across orders?
const byBuyer={}; for(const o of orders){(byBuyer[o.buyer]??=[]).push(o.orderNumber)}
console.log("buyers with >1 order:",Object.entries(byBuyer).filter(([,v])=>v.length>1));
await mongoose.disconnect();
