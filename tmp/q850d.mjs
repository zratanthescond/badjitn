import { readFileSync } from "fs";
import mongoose from "mongoose";
function loadEnv(file){try{for(const line of readFileSync(file,"utf8").split("\n")){const t=line.trim();if(!t||t.startsWith("#"))continue;const eq=t.indexOf("=");if(eq===-1)continue;const k=t.slice(0,eq).trim();let v=t.slice(eq+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}catch(_){}}
loadEnv(".env.local");
await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn" });
const db = mongoose.connection.db;
const ev = new mongoose.Types.ObjectId("6a7b1e6233d40a79156fd924");
const orders = await db.collection("orders").find({ event: ev, details: { $elemMatch: { name: "Congrès et Pré-congrès", option: /Pharmacovigilance/ } } }).project({ orderNumber:1, buyer:1, requiredUserInfo:1, createdAt:1 }).sort({ orderNumber: 1 }).toArray();
for (const o of orders) {
  const u = o.buyer ? await db.collection("users").findOne({ _id: o.buyer }, { projection: { firstName:1, lastName:1, email:1 } }) : null;
  const info = Object.fromEntries((o.requiredUserInfo||[]).map(r => [r.field || r.label, r.value]));
  console.log(o.orderNumber, "|", u ? `${u.firstName} ${u.lastName} <${u.email}>` : "(invité)", "|", JSON.stringify(info));
}
await mongoose.disconnect();
