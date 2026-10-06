// Repairs résumés (EventWork) damaged by the old checkout materialization,
// which matched a participant's email in ANY registration field (e.g. the
// roommate's email) and deduplicated by userId+resumeIndex. That produced:
//   1. duplicates: the same résumé materialized twice for one participant;
//   2. misattributions: a colleague's résumé created under the wrong user;
//   3. guest users named after the wrong registration.
//
//   node scripts/repair-event-works.mjs --event <eventId> [--email a@x.com,b@y.com] [--apply]
//
// Dry-run by default: prints what would change. --apply performs it.
// Rules (conservative, never loses an upload):
//   - duplicate group = same participant, same normalized title. Keeper = the
//     copy linked to a registration (orderId), else the one with most files,
//     else the best status, else the oldest. Files and the best status are
//     merged into the keeper before the others are deleted.
//   - misattributed = no orderId, title not among the owner's own checkout
//     titles but equal to another registration's title. Deleted only when it
//     has no files and the rightful owner already holds that résumé; otherwise
//     flagged for manual review.
//   - guest user (clerkId guest_*) renamed from the registration's own
//     firstName/lastName when they differ.
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv(file) {
  try {
    for (const line of readFileSync(resolve(__dirname, "..", file), "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      if (!(k in process.env)) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv(".env.local");
loadEnv(".env");

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const EVENT = opt("event");
const EMAILS = (opt("email") || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const APPLY = args.includes("--apply");
if (!EVENT || !process.env.MONGODB_URI) {
  console.error("Usage: node scripts/repair-event-works.mjs --event <eventId> [--email a,b] [--apply]");
  process.exit(1);
}

const O = (s) => new mongoose.Types.ObjectId(String(s));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
const short = (s, n = 55) => String(s || "").slice(0, n);
const STATUS_RANK = { rejected: 0, draft: 1, submitted: 2, approved: 3 };
const info = (order, field) =>
  (order.requiredUserInfo || []).find((i) => i.field === field)?.value || "";
const ownEmail = (order) =>
  String((order.requiredUserInfo || []).find((i) => /^email$/i.test(String(i?.field || "")))?.value || "")
    .toLowerCase()
    .trim();
const orderTitles = (order) =>
  (order.requiredUserInfo || [])
    .filter((i) => /^workSummaryTitle(_\d+)?$/.test(String(i.field || "")) && String(i.value || "").trim())
    .map((i) => norm(i.value));

await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
const db = mongoose.connection;
const users = db.collection("users");
const orders = db.collection("orders");
const works = db.collection("eventworks");
const eventOid = O(EVENT);

const plan = { deleteWorks: [], updateWorks: [], renameUsers: [], review: [] };
const log = (s) => console.log(s);

// 0. Would the new unique index (eventId, orderId, resumeIndex) be violated?
const idxViolations = await works
  .aggregate([
    { $match: { eventId: eventOid, orderId: { $type: "objectId" } } },
    { $group: { _id: { o: "$orderId", i: "$resumeIndex" }, n: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { n: { $gt: 1 } } },
  ])
  .toArray();
log(`Unique-index check (eventId, orderId, resumeIndex): ${idxViolations.length} violating group(s)`);
idxViolations.forEach((v) => log(`   order=${v._id.o} idx=${v._id.i} works=${v.ids.join(",")}`));

// 1. Registrations of the event, grouped by the registrant's own email.
const evOrders = await orders.find({ event: eventOid }).toArray();
const byEmail = new Map();
for (const o of evOrders) {
  const e = ownEmail(o);
  if (!e) continue;
  if (!byEmail.has(e)) byEmail.set(e, []);
  byEmail.get(e).push(o);
}
const titleOwners = new Map(); // normalized title -> Set(own emails)
for (const [e, os] of byEmail) {
  for (const o of os) for (const t of orderTitles(o)) {
    if (!titleOwners.has(t)) titleOwners.set(t, new Set());
    titleOwners.get(t).add(e);
  }
}

const targets = EMAILS.length ? EMAILS : [...byEmail.keys()];
for (const email of targets) {
  const myOrders = byEmail.get(email) || [];
  const re = new RegExp(`^${esc(email)}$`, "i");
  const owners = await users.find({ email: re }).toArray();
  const ownerIds = new Set(owners.map((u) => String(u._id)));
  myOrders.forEach((o) => o.buyer && ownerIds.add(String(o.buyer)));
  if (!ownerIds.size) continue;

  const myTitles = new Set(myOrders.flatMap(orderTitles));
  const mine = await works
    .find({ eventId: eventOid, userId: { $in: [...ownerIds].map(O) } })
    .sort({ createdAt: 1 })
    .toArray();
  if (!mine.length) continue;

  const header = `\n### ${email}  users=${[...ownerIds].join(",")}  works=${mine.length}`;
  let printed = false;
  const say = (s) => {
    if (!printed) { log(header); printed = true; }
    log(s);
  };

  // 1a. guest user names
  for (const u of owners) {
    if (!String(u.clerkId || "").startsWith("guest_")) continue;
    const o = myOrders[0];
    if (!o) continue;
    const fn = info(o, "firstName"), ln = info(o, "lastName");
    if ((fn || ln) && (norm(u.firstName) !== norm(fn) || norm(u.lastName) !== norm(ln))) {
      say(`  RENAME user ${u._id}: "${u.firstName} ${u.lastName}" -> "${fn} ${ln}"`);
      plan.renameUsers.push({ _id: u._id, firstName: fn, lastName: ln });
    }
  }

  // 1b. misattributed works
  const kept = [];
  for (const w of mine) {
    const t = norm(w.title);
    const others = [...(titleOwners.get(t) || [])].filter((e) => e !== email);
    const isForeign = !w.orderId && t && !myTitles.has(t) && others.length > 0;
    if (!isForeign) { kept.push(w); continue; }
    const files = (w.fileUrls || []).length + (w.abstractFileUrls || []).length;
    const rightful = await works.findOne({
      eventId: eventOid,
      _id: { $ne: w._id },
      title: new RegExp(`^\\s*${esc(String(w.title).trim())}\\s*$`, "i"),
      "clientInfo.correspondenceEmail": { $in: others.map((e) => new RegExp(`^${esc(e)}$`, "i")) },
    });
    if (files === 0 && rightful) {
      say(`  DELETE misattributed ${w._id} "${short(w.title)}" (belongs to ${others.join("/")}; their copy ${rightful._id} exists)`);
      plan.deleteWorks.push(w._id);
    } else {
      say(`  REVIEW misattributed ${w._id} "${short(w.title)}" files=${files} rightfulCopy=${rightful?._id || "none"}`);
      plan.review.push(w._id);
      kept.push(w);
    }
  }

  // 1c. duplicates by title
  const groups = new Map();
  for (const w of kept) {
    const t = norm(w.title);
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(w);
  }
  for (const [t, g] of groups) {
    if (g.length < 2) continue;
    const score = (w) => [
      w.orderId ? 1 : 0,
      (w.fileUrls || []).length + (w.abstractFileUrls || []).length,
      STATUS_RANK[w.summaryStatus] ?? 0,
      -new Date(w.createdAt || 0).getTime(),
    ];
    const sorted = [...g].sort((a, b) => {
      const sa = score(a), sb = score(b);
      for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return sb[i] - sa[i];
      return 0;
    });
    const keeper = sorted[0];
    const dupes = sorted.slice(1);
    const set = {};
    const fileUrls = new Set(keeper.fileUrls || []);
    const abstractUrls = new Set(keeper.abstractFileUrls || []);
    let best = keeper;
    for (const d of dupes) {
      (d.fileUrls || []).forEach((u) => fileUrls.add(u));
      (d.abstractFileUrls || []).forEach((u) => abstractUrls.add(u));
      if ((STATUS_RANK[d.summaryStatus] ?? 0) > (STATUS_RANK[best.summaryStatus] ?? 0)) best = d;
    }
    if (fileUrls.size !== (keeper.fileUrls || []).length) set.fileUrls = [...fileUrls];
    if (abstractUrls.size !== (keeper.abstractFileUrls || []).length) set.abstractFileUrls = [...abstractUrls];
    if (best !== keeper) {
      set.summaryStatus = best.summaryStatus;
      if (best.approvedAt) set.approvedAt = best.approvedAt;
      if (best.rejectedAt) set.rejectedAt = best.rejectedAt;
      if (best.rejectionReason) set.rejectionReason = best.rejectionReason;
    }
    const statuses = g.map((w) => w.summaryStatus).join("/");
    say(`  DEDUPE "${short(t)}" x${g.length} [${statuses}] keep ${keeper._id}${keeper.orderId ? " (linked)" : ""}, delete ${dupes.map((d) => d._id).join(",")}${Object.keys(set).length ? " merge=" + Object.keys(set).join("+") : ""}`);
    if (Object.keys(set).length) plan.updateWorks.push({ _id: keeper._id, set });
    dupes.forEach((d) => plan.deleteWorks.push(d._id));
  }
}

log(`\nSummary: delete ${plan.deleteWorks.length} work(s), update ${plan.updateWorks.length}, rename ${plan.renameUsers.length} user(s), ${plan.review.length} to review manually.`);

if (!APPLY) {
  log("Dry-run only. Re-run with --apply to perform these changes.");
} else {
  for (const u of plan.updateWorks) {
    await works.updateOne({ _id: u._id }, { $set: { ...u.set, updatedAt: new Date() } });
  }
  if (plan.deleteWorks.length) {
    const r = await works.deleteMany({ _id: { $in: plan.deleteWorks } });
    log(`Deleted ${r.deletedCount} work(s).`);
  }
  for (const u of plan.renameUsers) {
    await users.updateOne({ _id: u._id }, { $set: { firstName: u.firstName, lastName: u.lastName } });
  }
  log("Applied.");
}

await mongoose.disconnect();
