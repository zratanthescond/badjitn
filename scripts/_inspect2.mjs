import { readFileSync } from "fs";
import mongoose from "mongoose";
for (const l of readFileSync(".env.local","utf8").split("\n")) {
  const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim();
  if(!(k in process.env)) process.env[k]=t.slice(i+1).trim().replace(/^["']|["']$/g,"");
}
await mongoose.connect(process.env.MONGODB_URI,{dbName:"badjitn"});
const db=mongoose.connection.db;
const eventId=new mongoose.Types.ObjectId('6a7b1e6233d40a79156fd924');
const nums=[5,7,33,56,51,81,19,34,114,115,155,156,177,46,275,278];
const orders=await db.collection("orders").find({event:eventId,orderNumber:{$in:nums}}).toArray();
const ids=orders.map(o=>o._id); const idStr=ids.map(String);
const cols=await db.listCollections().toArray();
for(const c of cols){
  const docs=await db.collection(c.name).find({}).limit(0).toArray().catch(()=>[]);
  if(c.name==="orders") continue;
  const hits=docs.filter(d=>{const s=JSON.stringify(d);return idStr.some(i=>s.includes(i))});
  if(hits.length) console.log(c.name,hits.length,hits.map(h=>({_id:h._id,...Object.fromEntries(Object.entries(h).filter(([k,v])=>idStr.includes(String(v))))})));
}
for(const o of orders.filter(o=>[155,156,275,278].includes(o.orderNumber))){
  console.log(o.orderNumber, JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k])=>!["requiredUserInfo","details"].includes(k)))));
  console.log("  rui:", o.requiredUserInfo.map(r=>`${r.label}=${String(r.value).slice(0,40)}`).join(" | "));
}
await mongoose.disconnect();
