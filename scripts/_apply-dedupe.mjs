import { readFileSync, writeFileSync } from "fs";
import mongoose from "mongoose";
for (const l of readFileSync(".env.local","utf8").split("\n")) {
  const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim();
  if(!(k in process.env)) process.env[k]=t.slice(i+1).trim().replace(/^["']|["']$/g,"");
}
const APPLY=process.argv.includes("--apply");
await mongoose.connect(process.env.MONGODB_URI,{dbName:"badjitn"});
const db=mongoose.connection.db;
const eventId=new mongoose.Types.ObjectId('6a7b1e6233d40a79156fd924');
// [delete, keep]
const PLAN=[[5,7],[19,34],[33,56],[51,81],[114,115],[155,156],[275,278]];
const O=db.collection("orders"), W=db.collection("eventworks");
const backup=[]; let ok=true;
for(const [del,keep] of PLAN){
  const d=await O.findOne({event:eventId,orderNumber:del}), k=await O.findOne({event:eventId,orderNumber:keep});
  if(!d||!k){console.log("MISSING",del,keep);ok=false;continue;}
  const worksOnDel=await W.find({$or:[{orderId:d._id},...(d.buyer?[{userId:d.buyer,eventId}]:[])]}).toArray();
  const worksOnKeep=await W.find({orderId:k._id}).toArray();
  const refs=[];
  for(const c of ["banktransfers","attendances","certifications","certificates"]){
    const n=await db.collection(c).countDocuments({$or:[{orderId:String(d._id)},{orderId:d._id},{order:d._id}]}).catch(()=>0);
    if(n) refs.push(`${c}:${n}`);
  }
  const titleOf=o=>(o.requiredUserInfo||[]).filter(r=>/^Titre du resume/.test(r.label)).map(r=>r.value.trim());
  const delTitles=titleOf(d);
  const keepTitles=new Set([...titleOf(k),...worksOnKeep.map(w=>(w.title||"").trim())]);
  const lost=delTitles.filter(t=>![...keepTitles].some(x=>x.slice(0,40)===t.slice(0,40)));
  console.log(`delete #${del} (works on it: ${worksOnDel.length}, refs: ${refs.join(",")||"none"}, résumés ${delTitles.length}, not found on #${keep}: ${lost.length}) keep #${keep} (works ${worksOnKeep.length})`);
  if(worksOnDel.length||refs.length||(lost.length&&del!==33)){ok=false;console.log("  -> BLOCKED");}
  backup.push({delete:d,keep:k.orderNumber});
}
if(!ok){console.log("ABORT: guard failed");process.exit(1);}
if(!APPLY){console.log("dry-run OK");process.exit(0);}
const file="../dedupe-backup-orders-"+new Date().toISOString().slice(0,10)+".json";
writeFileSync(file,JSON.stringify(backup,null,1));
console.log("backup written",file);
for(const b of backup){const r=await O.deleteOne({_id:b.delete._id});console.log("deleted #"+b.delete.orderNumber,r.deletedCount);}
const wc=await W.countDocuments({eventId});console.log("event works after:",wc);
await mongoose.disconnect();
