import { useState, useMemo, useEffect, useCallback } from "react";

/* ─── Constants ─────────────────────────────────────────────── */
const ROLES = [
  "Cinematographer","Videographer","Photographer","Candid Photographer",
  "Portrait Photographer","Drone Operator","BTS Videographer","Reel Editor",
  "Camera Assistant","Video Editor","Photo Editor","Colorist",
  "Director of Photography","Sound Engineer","Lighting Assistant",
  "Wedding Coordinator","Second Shooter"
];
const DEFAULT_EVENTS = ["Mehndi","Sangeet","Haldi","Wedding Ceremony","Reception","Pre-Wedding Shoot","Engagement"];

// FEATURE 8: Crew slot role categories for requirement planning
const CREW_SLOT_ROLES = [
  { id:"photographer", label:"Photographer", emoji:"📸", color:"#f59e0b" },
  { id:"candid", label:"Candid Photographer", emoji:"🎞", color:"#f472b6" },
  { id:"videographer", label:"Videographer", emoji:"🎬", color:"#60a5fa" },
  { id:"cinematographer", label:"Cinematographer", emoji:"🎥", color:"#c9a96e" },
  { id:"drone", label:"Drone Operator", emoji:"🚁", color:"#34d399" },
  { id:"bts", label:"BTS / Reel", emoji:"📱", color:"#a78bfa" },
  { id:"editor", label:"Editor", emoji:"🖥", color:"#fb923c" },
  { id:"other", label:"Other", emoji:"⭐", color:"#5a5048" },
];

const EVENT_TYPES = [
  { id:"wedding",       label:"💍 Wedding",        color:"#c9a96e", subEvents:["Mehndi","Sangeet","Haldi","Wedding Ceremony","Reception","Pre-Wedding Shoot","Tilak","Ring Ceremony","Garba Night","Cocktail Party"] },
  { id:"engagement",   label:"💎 Engagement",      color:"#fb923c", subEvents:["Engagement Ceremony","Ring Exchange","Dinner","Pre-Engagement Shoot"] },
  { id:"babyshower",   label:"🍼 Baby Shower",     color:"#a78bfa", subEvents:["Baby Shower","Maternity Shoot","Baby Reveal","Welcome Ceremony"] },
  { id:"birthday",     label:"🎂 Birthday",         color:"#34d399", subEvents:["Birthday Party","Cake Cutting","Photo Session","Surprise Party"] },
  { id:"corporate",    label:"🏢 Corporate Event",  color:"#60a5fa", subEvents:["Conference","Award Night","Team Outing","Product Launch","Annual Meet"] },
  { id:"other",        label:"✨ Other Event",       color:"#f472b6", subEvents:[] },
];
const STATUS_COLOR = { Confirmed:"#4ade80", Pending:"#fbbf24", Declined:"#f87171" };
const EVENT_COLOR = { "Mehndi":"#f472b6","Sangeet":"#a78bfa","Haldi":"#fbbf24","Wedding Ceremony":"#c9a96e","Reception":"#34d399","Pre-Wedding Shoot":"#60a5fa","Engagement":"#fb923c","Engagement Ceremony":"#fb923c","Ring Exchange":"#fb923c","Baby Shower":"#a78bfa","Maternity Shoot":"#c084fc","Baby Reveal":"#e879f9","Birthday Party":"#34d399","Cake Cutting":"#4ade80","Conference":"#60a5fa","Award Night":"#f59e0b","Team Outing":"#06b6d4","Product Launch":"#3b82f6" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["S","M","T","W","T","F","S"];
const FIXED_EMAIL = "crewstudio@gmail.com";
const FIXED_PASS  = "Weddings@2026";
const ADMIN_WA    = "919876543210";

const FIREBASE_URL = "https://crewstudiov2-default-rtdb.asia-southeast1.firebasedatabase.app";
const USE_FIREBASE = true;

function evColor(ev){ return EVENT_COLOR[ev]||"#c9a96e"; }
function hireBelongsToWedding(hire, wedding) {
  if (!hire || !wedding) return false;
  return hire.weddingId != null ? String(hire.weddingId) === String(wedding.id) : hire.wedding === wedding.name;
}
function hireMatchesEvent(hire, wedding, date, event) {
  return hireBelongsToWedding(hire, wedding) && hire.date === date && (!event || hire.event === event);
}
function eventTimeText(ed) {
  if (!ed?.startTime && !ed?.endTime) return "";
  return `${ed.startTime || ""}${ed.endTime ? `-${ed.endTime}` : ""}`;
}

const INITIAL_TEAM = [
  { id:1, name:"Dhruv Sukhanadi", role:"Cinematographer", phone:"9876543210", rate:8000, hires:[] },
  { id:2, name:"Keyur Raval",     role:"Cinematographer", phone:"9845678901", rate:5500, hires:[] },
  { id:3, name:"Palak",           role:"Cinematographer", phone:"9823456789", rate:6000, hires:[] },
  { id:4, name:"Akash Shah",      role:"Cinematographer", phone:"9812345678", rate:4000, hires:[] },
];

/* ── Firebase helpers ── */
async function fbGet(path) {
  try { const res = await fetch(`${FIREBASE_URL}/${path}.json`); return await res.json(); }
  catch { return null; }
}
async function fbSet(path, data) {
  try { await fetch(`${FIREBASE_URL}/${path}.json`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }); }
  catch(e) { console.error("Firebase write failed:", e); }
}
function fbListen(path, onData) {
  if (!USE_FIREBASE) return () => {};
  const source = new EventSource(`${FIREBASE_URL}/${path}.json`);
  source.addEventListener("put", e => { try { const d=JSON.parse(e.data); if(d?.data!==undefined) onData(d.data); } catch {} });
  return () => source.close();
}
async function fbGetAdmins() {
  const data = await fbGet("crew_admins");
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data || {});
}
async function fbSaveAdmin(adminObj) {
  const admins = await fbGetAdmins();
  const existing = admins.findIndex(a => a.email === adminObj.email);
  if (existing >= 0) admins[existing] = adminObj;
  else admins.push(adminObj);
  await fbSet("crew_admins", admins);
  return admins;
}
function loadState(key, fallback) {
  try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; }
}
function saveState(key, val) { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} }

/* ─── Role Select with Custom Option ────────────────────────── */
function RoleSelect({ value, onChange }) {
  const isCustom = value && !ROLES.includes(value);
  const [custom, setCustom] = useState(isCustom);
