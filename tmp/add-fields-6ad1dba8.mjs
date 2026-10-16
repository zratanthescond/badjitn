import { readFileSync } from "fs";
import mongoose from "mongoose";
function loadEnv(file){for(const line of readFileSync(file,"utf8").split("\n")){const t=line.trim();if(!t||t.startsWith("#"))continue;const eq=t.indexOf("=");if(eq===-1)continue;const k=t.slice(0,eq).trim();let v=t.slice(eq+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}
loadEnv(".env.local");
await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn" });
const events = mongoose.connection.db.collection("events");
const _id = new mongoose.Types.ObjectId("6ad1dba8e403dc3d6643bbf3");

const YES_NO = ["Oui", "Non"];
const SPECIALITE = "Spécialité";
const TRANSFERT = "Transfert (Par bus)";
const newFields = [
  { label: SPECIALITE, isRequired: true, type: "select",
    options: ["Oncologie médicale", "Chirurgie oncologique", "Radiothérapie", "Urologie", "Pneumologie", "Autre (à préciser)"] },
  { label: "Spécialité (à préciser)", isRequired: true, type: "text", options: [],
    showWhen: { field: SPECIALITE, value: "Autre (à préciser)" } },
  { label: "Vous êtes", isRequired: true, type: "radio",
    options: ["Senior", "Resident", "Médecin de libre pratique"] },
  { label: TRANSFERT, isRequired: true, type: "radio", options: YES_NO },
  { label: "Plan de transfert", isRequired: true, type: "radio",
    options: ["Plan 1 : Sousse", "Plan 2 : Sfax"],
    showWhen: { field: TRANSFERT, value: "Oui" } },
  { label: "Atelier Tai-chi (Dimanche 08/11/2026)", isRequired: true, type: "radio", options: YES_NO },
  { label: "Hébergement du 07/11/2026", isRequired: true, type: "radio", options: YES_NO },
].map((f) => ({ ...f, _id: new mongoose.Types.ObjectId() }));

const ev = await events.findOne({ _id }, { projection: { customRegistrationFields: 1 } });
const existing = ev.customRegistrationFields || [];
const existingLabels = new Set(existing.map((f) => f.label));
const toAdd = newFields.filter((f) => !existingLabels.has(f.label));
if (toAdd.length === 0) { console.log("nothing to add"); }
else {
  const r = await events.updateOne({ _id }, { $push: { customRegistrationFields: { $each: toAdd } } });
  console.log("modified:", r.modifiedCount, "added:", toAdd.map((f) => f.label));
}
const after = await events.findOne({ _id }, { projection: { customRegistrationFields: 1 } });
console.log(JSON.stringify(after.customRegistrationFields, null, 1));
await mongoose.disconnect();
