```js
import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
```
```js
const firebaseConfig = {
  apiKey: "AIzaSyBr6WV5kkiyfLNvPrZNeigrjmG4NilFAUI",
  authDomain: "crewstudio-35d88.firebaseapp.com",
  projectId: "crewstudio-35d88",
  storageBucket: "crewstudio-35d88.firebasestorage.app",
  messagingSenderId: "850782928925",
  appId: "1:850782928925:web:a3308ca535993632f806f4",
  measurementId: "G-PZBV4HCN17"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
```


import { useState, useMemo, useEffect } from "react";

/* ─── Constants ─────────────────────────────────────────────── */
const ROLES = ["Cinematographer","Videographer","Drone Operator","Camera Assistant","Editor","Colorist","Director of Photography","Sound Engineer"];
const DEFAULT_EVENTS = ["Mehndi","Sangeet","Haldi","Wedding Ceremony","Reception","Pre-Wedding Shoot","Engagement"];
const STATUS_COLOR = { Confirmed:"#4ade80", Pending:"#fbbf24", Declined:"#f87171" };
const EVENT_COLOR = { "Mehndi":"#f472b6","Sangeet":"#a78bfa","Haldi":"#fbbf24","Wedding Ceremony":"#c9a96e","Reception":"#34d399","Pre-Wedding Shoot":"#60a5fa","Engagement":"#fb923c" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const ADMIN_WA = "919876543210";

function evColor(ev){ return EVENT_COLOR[ev]||"#c9a96e"; }

const INITIAL_TEAM = [
  { id:1, name:"Dhruv Sukhanadi", role:"Cinematographer", phone:"9876543210", rate:8000, hires:[] },
  { id:2, name:"Keyur Raval",     role:"Cinematographer", phone:"9845678901", rate:5500, hires:[] },
  { id:3, name:"Palak",           role:"Cinematographer", phone:"9823456789", rate:6000, hires:[] },
  { id:4, name:"Akash Shah",      role:"Cinematographer", phone:"9812345678", rate:4000, hires:[] },
];

function loadState(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ════════════════════════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    const users = loadState("crew_users", []);
    const user = users.find(u => u.email === form.email.toLowerCase().trim());
    if (!user) { setError("No account found with this email."); return; }
    if (user.password !== form.password) { setError("Incorrect password."); return; }
    setLoading(true);
    setTimeout(() => {
      saveState("crew_session", { email: user.email, name: user.name, loggedIn: true });
      onLogin(user);
    }, 800);
  }

  function handleSignup() {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    const users = loadState("crew_users", []);
    if (users.find(u => u.email === form.email.toLowerCase().trim())) { setError("This email is already registered."); return; }
    const newUser = { name: form.name.trim(), email: form.email.toLowerCase().trim(), password: form.password, createdAt: new Date().toISOString() };
    saveState("crew_users", [...users, newUser]);
    setLoading(true);
    setTimeout(() => {
      saveState("crew_session", { email: newUser.email, name: newUser.name, loggedIn: true });
      onLogin(newUser);
    }, 800);
  }

  const S = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#060504;}
    input{background:#0e0c0a;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:14px;padding:14px 16px;border-radius:6px;outline:none;width:100%;transition:border-color 0.25s,box-shadow 0.25s;}
    input:focus{border-color:#c9a96e;box-shadow:0 0 0 3px #c9a96e18;}
    input::placeholder{color:#3a3028;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
  `;

  return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",overflow:"hidden"}}>
      <style>{S}</style>

      {/* ── Left Panel ── */}
      <div style={{flex:"0 0 48%",background:"linear-gradient(160deg,#0e0b08 0%,#060504 60%)",borderRight:"1px solid #1a1612",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"48px 56px",position:"relative",overflow:"hidden"}}>

        {/* Background texture */}
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 80%, #c9a96e08 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c9a96e05 0%, transparent 50%)",pointerEvents:"none"}}/>

        {/* Decorative lines */}
        {[...Array(6)].map((_,i)=>(
          <div key={i} style={{position:"absolute",left:0,top:`${12+i*16}%`,width:"100%",height:"1px",background:`linear-gradient(90deg, transparent, #c9a96e${i===2?"18":"08"}, transparent)`,pointerEvents:"none"}}/>
        ))}

        {/* Logo */}
        <div style={{animation:"fadeUp 0.6s ease both"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
            <span style={{fontSize:28,fontWeight:300,letterSpacing:"0.1em"}}>CREW</span>
            <span style={{fontSize:14,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.15em"}}>STUDIO</span>
          </div>
          <div style={{width:40,height:1,background:"#c9a96e44"}}/>
        </div>

        {/* Main copy */}
        <div style={{animation:"fadeUp 0.8s 0.1s ease both"}}>
          <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.2em",color:"#5a5048",textTransform:"uppercase",marginBottom:20}}>Wedding Film Production</p>
          <h1 style={{fontSize:52,fontWeight:300,lineHeight:1.1,marginBottom:24,letterSpacing:"-0.01em"}}>
            Every frame<br/>
            <em style={{fontStyle:"italic",color:"#c9a96e"}}>tells a story</em>
          </h1>
          <p style={{fontSize:17,color:"#7a6f63",lineHeight:1.7,fontWeight:300,maxWidth:340}}>
            Manage your crew, schedule events, and orchestrate every moment of your client's most important day.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{animation:"fadeUp 0.9s 0.2s ease both"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {icon:"🎬", label:"Multi-day wedding scheduling"},
              {icon:"👥", label:"Crew hire & payout tracking"},
              {icon:"📅", label:"Visual calendar & conflict alerts"},
              {icon:"💬", label:"WhatsApp notifications built-in"},
            ].map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:32,height:32,background:"#c9a96e11",border:"1px solid #c9a96e22",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{f.icon}</div>
                <span style={{fontSize:13,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{animation:"fadeUp 1s 0.3s ease both"}}>
          <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.12em"}}>BY KRUNAL PRAJAPATI · AHMEDABAD</p>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 48px",background:"#060504"}}>
        <div style={{width:"100%",maxWidth:440,animation:"fadeUp 0.7s 0.15s ease both"}}>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginBottom:40,background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:4}}>
            {["login","signup"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setError("");setForm({name:"",email:"",password:"",confirm:""});}}
                style={{flex:1,padding:"12px",fontSize:14,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",border:"none",borderRadius:5,cursor:"pointer",transition:"all 0.25s",
                  background:tab===t?"linear-gradient(135deg,#c9a96e,#a8814a)":"transparent",
                  color:tab===t?"#0a0a0a":"#5a5048",fontWeight:tab===t?"600":"normal"}}>
                {t==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:36,fontWeight:300,marginBottom:6}}>
              {tab==="login"?"Welcome back" : "Join the studio"}
            </h2>
            <p style={{fontSize:14,color:"#5a5048"}}>
              {tab==="login"?"Sign in to your Crew Studio account." : "Create your account to get started."}
            </p>
          </div>

          {/* Form Fields */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {tab==="signup"&&(
              <div>
                <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Full Name</label>
                <input placeholder="Krunal Prajapati" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
            )}
            <div>
              <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Email Address</label>
              <input type="email" placeholder="you@studio.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?handleLogin():handleSignup())}/>
            </div>
            <div>
              <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Password</label>
              <div style={{position:"relative"}}>
                <input type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?handleLogin():handleSignup())} style={{paddingRight:48}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a5048",fontSize:16,cursor:"pointer",padding:0,lineHeight:1}}>{showPass?"🙈":"👁"}</button>
              </div>
            </div>
            {tab==="signup"&&(
              <div>
                <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
              </div>
            )}
          </div>

          {/* Error */}
          {error&&(
            <div style={{marginTop:16,padding:"12px 16px",background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={tab==="login"?handleLogin:handleSignup} disabled={loading}
            style={{width:"100%",marginTop:24,padding:"16px",background:loading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:6,fontSize:16,fontWeight:600,letterSpacing:"0.06em",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.25s",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
            {loading?(
              <><div style={{width:18,height:18,border:"2px solid #0a0a0a44",borderTopColor:"#0a0a0a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>
            ):(
              tab==="login"?"Sign In to Studio →":"Create Account →"
            )}
          </button>

          {/* Switch tab link */}
          <p style={{textAlign:"center",marginTop:20,fontSize:13,color:"#3a3028"}}>
            {tab==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setTab(tab==="login"?"signup":"login");setError("");setForm({name:"",email:"",password:"",confirm:""}); }}
              style={{background:"none",border:"none",color:"#c9a96e",fontSize:13,cursor:"pointer",textDecoration:"underline",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
              {tab==="login"?"Create one":"Sign in"}
            </button>
          </p>

          {/* Divider note */}
          <div style={{marginTop:40,paddingTop:24,borderTop:"1px solid #1a1612",textAlign:"center"}}>
            <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.08em"}}>SECURED · DATA STAYS IN YOUR BROWSER</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini Calendar ─────────────────────────────────────────── */
function MiniCalendar({ selectedDates, onToggleDate, bookedMap }) {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const firstDay = new Date(y,m,1).getDay();
  const dim = new Date(y,m+1,0).getDate();
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=dim;d++) cells.push(d);
  const ds = d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const prevM=()=>m===0?(setM(11),setY(y=>y-1)):setM(m=>m-1);
  const nextM=()=>m===11?(setM(0),setY(y=>y+1)):setM(m=>m+1);
  return (
    <div style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:6,padding:16,userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={prevM} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 8px"}}>‹</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#e8e0d4",letterSpacing:"0.08em"}}>{MONTH_NAMES[m]} {y}</span>
        <button onClick={nextM} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 8px"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:"#3a3028",fontFamily:"'DM Mono',monospace",padding:"2px 0"}}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=ds(d); const isSel=selectedDates.includes(dateStr); const booked=bookedMap?.[dateStr]||[];
          return (
            <div key={i} onClick={()=>onToggleDate(dateStr)}
              style={{textAlign:"center",padding:"5px 2px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",
                background:isSel?"#c9a96e":"transparent",color:isSel?"#0a0a0a":"#e8e0d4",border:"1px solid transparent",transition:"all 0.15s"}}>
              {d}
              {booked.length>0&&<div style={{display:"flex",justifyContent:"center",gap:1,marginTop:1}}>
                {booked.slice(0,3).map((_,bi)=><div key={bi} style={{width:3,height:3,borderRadius:"50%",background:"#f87171"}}/>)}
              </div>}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",textAlign:"center"}}>tap dates · {selectedDates.length} selected</div>
    </div>
  );
}

/* ─── Big Calendar ───────────────────────────────────────────── */
function BigCalendar({ weddings, team }) {
  const today = new Date();
  const [y,setY]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const dayMap = useMemo(()=>{
    const map={};
    weddings.forEach(w=>(w.eventDays||[]).forEach(ed=>{
      if(!map[ed.date]) map[ed.date]=[];
      const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));
      map[ed.date].push({weddingName:w.name,event:ed.event,crew});
    }));
    return map;
  },[weddings,team]);
  const firstDay=new Date(y,mo,1).getDay(); const dim=new Date(y,mo+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const ds=d=>`${y}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const prevM=()=>mo===0?(setMo(11),setY(y=>y-1)):setMo(m=>m-1);
  const nextM=()=>mo===11?(setMo(0),setY(y=>y+1)):setMo(m=>m+1);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <button onClick={prevM} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:22,padding:"6px 16px",borderRadius:4}}>‹</button>
        <h2 style={{fontSize:28,fontWeight:300}}>{MONTH_NAMES[mo]} {y}</h2>
        <button onClick={nextM} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:22,padding:"6px 16px",borderRadius:4}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",paddingBottom:8}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i} style={{minHeight:90}}/>;
          const dateStr=ds(d); const entries=dayMap[dateStr]||[]; const isToday=dateStr===today.toISOString().slice(0,10);
          return (
            <div key={i} style={{minHeight:90,background:entries.length?"#0e0c0a":"#080806",border:`1px solid ${entries.length?"#2a2420":"#111"}`,borderRadius:5,padding:"8px 6px"}}>
              <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:isToday?"#c9a96e":entries.length?"#e8e0d4":"#2a2420",fontWeight:isToday?"600":"normal",marginBottom:4}}>{d}</div>
              {entries.map((e,ei)=>(
                <div key={ei} style={{background:evColor(e.event)+"22",borderLeft:`2px solid ${evColor(e.event)}`,borderRadius:2,padding:"3px 5px",marginBottom:3}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:evColor(e.event),textTransform:"uppercase"}}>{e.event}</div>
                  <div style={{fontSize:9,color:"#7a6f63",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.weddingName}</div>
                  {e.crew.length>0&&<div style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{e.crew.map(c=>c.name.split(" ")[0]).join(", ")}</div>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Event Assigner ─────────────────────────────────────────── */
function EventAssigner({ selectedDates, eventDays, setEventDays, team, weddingName }) {
  const [assigningDate,setAssigningDate]=useState(null); const [customInput,setCustomInput]=useState("");
  function assignEvent(date,event){
    setEventDays(prev=>{ const rest=prev.filter(ed=>ed.date!==date); return event?[...rest,{date,event}].sort((a,b)=>a.date.localeCompare(b.date)):rest; });
    setAssigningDate(null); setCustomInput("");
  }
  function getBookedOnDate(date){
    return team.map(m=>m.hires.filter(h=>h.date===date).map(h=>({name:m.name,role:h.hireRole||m.role,wedding:h.wedding,event:h.event,dayType:h.dayType||"Full Day"}))).flat();
  }
  return (
    <div>
      <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",color:"#5a5048",textTransform:"uppercase",marginBottom:10}}>Assign Event to Each Day</p>
      {selectedDates.map(date=>{
        const assigned=eventDays.find(ed=>ed.date===date); const booked=getBookedOnDate(date);
        return (
          <div key={date} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,marginBottom:6,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#c9a96e",fontWeight:500}}>{date}</span>
              {assigningDate===date?<button onClick={()=>setAssigningDate(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:18}}>×</button>
              :<button onClick={()=>setAssigningDate(date)} style={{background:assigned?(evColor(assigned.event)+"22"):"#1a1612",border:`1px solid ${assigned?evColor(assigned.event):"#2a2420"}`,color:assigned?evColor(assigned.event):"#5a5048",fontSize:11,padding:"4px 12px",borderRadius:2,fontFamily:"'DM Mono',monospace"}}>{assigned?assigned.event:"Assign Event"}</button>}
            </div>
            {booked.length>0&&(
              <div style={{padding:"8px 14px",borderTop:"1px solid #151210",background:"#0a0806"}}>
                <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:6}}>Booked on this day</p>
                {booked.map((b,bi)=>(
                  <div key={bi} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#111",border:"1px solid #1e1a16",borderRadius:3,padding:"5px 10px",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:b.wedding===weddingName?"#4ade80":"#f87171",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#e8e0d4"}}>{b.name}</span>
                      <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{b.role}</span>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#7a6f63"}}>{b.wedding}</span>
                      <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:evColor(b.event),marginLeft:6}}>{b.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {assigningDate===date&&(
              <div style={{padding:"10px 14px",borderTop:"1px solid #1e1a16",background:"#080806"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {DEFAULT_EVENTS.map(ev=><button key={ev} onClick={()=>assignEvent(date,ev)} style={{background:evColor(ev)+"22",border:`1px solid ${evColor(ev)}44`,color:evColor(ev),fontSize:10,padding:"4px 10px",borderRadius:2,fontFamily:"'DM Mono',monospace"}}>{ev}</button>)}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input placeholder="Type custom event..." value={customInput} onChange={e=>setCustomInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&customInput.trim())assignEvent(date,customInput.trim());}}/>
                  <button onClick={()=>{if(customInput.trim())assignEvent(date,customInput.trim());}} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",padding:"0 14px",borderRadius:3,fontSize:12,fontFamily:"'DM Mono',monospace"}}>Add</button>
                </div>
                {assigned&&<button onClick={()=>assignEvent(date,null)} style={{marginTop:8,background:"none",border:"none",color:"#f87171",fontSize:11,fontFamily:"'DM Mono',monospace",padding:0}}>Remove event</button>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Team View (crew portal) ────────────────────────────────── */
function TeamView({ team, weddings }) {
  const [myName,setMyName]=useState(loadState("crew_myname",""));
  const [nameInput,setNameInput]=useState("");
  const me=team.find(m=>m.name===myName);
  function confirmIdentity(){ const found=team.find(m=>m.name.toLowerCase()===nameInput.trim().toLowerCase()); if(found){setMyName(found.name);saveState("crew_myname",found.name);}else alert("Name not found."); }
  function sendWA(hire,action,memberName){ const msg=`Hi Krunal! This is ${memberName}. I want to *${action}* my booking:\n\n📅 *${hire.date}*\n💍 *${hire.wedding}*\n🎬 *${hire.event}*\n🎭 Role: *${hire.hireRole}*\n⏱ ${hire.dayType}\n\nPlease confirm.`; window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`,"_blank"); }
  if(!myName) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input{background:#111;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:14px;padding:12px 16px;border-radius:4px;outline:none;width:100%;}`}</style>
      <div style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:8,padding:40,width:"100%",maxWidth:400,textAlign:"center"}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Crew Studio</p>
        <h2 style={{fontSize:28,fontWeight:300,marginBottom:8}}>Who are you?</h2>
        <p style={{fontSize:13,color:"#5a5048",marginBottom:24}}>Enter your name to see your assignments</p>
        <input placeholder="Your full name..." value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&confirmIdentity()} style={{marginBottom:12}}/>
        <button onClick={confirmIdentity} style={{width:"100%",background:"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",padding:"12px",fontSize:15,fontWeight:600,borderRadius:3,cursor:"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Enter</button>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:12}}>{team.map(m=><button key={m.id} onClick={()=>setNameInput(m.name)} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#c9a96e",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{m.name.split(" ")[0]}</button>)}</div>
      </div>
    </div>
  );
  const upcomingHires=[...me.hires].sort((a,b)=>a.date.localeCompare(b.date));
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{borderBottom:"1px solid #1e1a16",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:18,fontWeight:300}}>CREW</span><span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>STUDIO</span></div>
        <button onClick={()=>{setMyName("");saveState("crew_myname","");}} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Switch</button>
      </div>
      <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}}>
        <h1 style={{fontSize:36,fontWeight:300,marginBottom:4}}>{myName}</h1>
        <p style={{fontSize:13,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginBottom:28}}>{me?.role} · ₹{me?.rate?.toLocaleString("en-IN")}/day</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
          {[{v:me.hires.length,l:"Total Hires"},{v:me.hires.filter(h=>h.status==="Confirmed").length,l:"Confirmed"},{v:`₹${me.hires.reduce((s,h)=>s+(me?.rate||0)*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}`,l:"Expected Pay"}].map((s,i)=>(
            <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"20px 16px"}}>
              <div style={{fontSize:28,fontWeight:300,color:"#c9a96e"}}>{s.v}</div>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
            </div>
          ))}
        </div>
        {upcomingHires.length===0?<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:48,textAlign:"center",color:"#3a3028"}}>No assignments yet.</div>
        :upcomingHires.map((h,i)=>(
          <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:6,padding:"20px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:18,fontWeight:500}}>{h.wedding}</div>
                <div style={{fontSize:14,color:evColor(h.event)}}>{h.event}</div>
                <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>📅 {h.date} · 🎭 {h.hireRole} · ⏱ {h.dayType}</div>
                <div style={{fontSize:12,color:"#c9a96e",marginTop:4}}>₹{((me?.rate||0)*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                <span style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24",border:`1px solid ${STATUS_COLOR[h.status]||"#fbbf24"}44`,padding:"3px 12px",borderRadius:2,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{h.status||"Pending"}</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>sendWA(h,"CONFIRM",myName)} style={{background:"#4ade8022",border:"1px solid #4ade8044",color:"#4ade80",fontSize:11,padding:"5px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>✓ Confirm</button>
                  <button onClick={()=>sendWA(h,"DECLINE",myName)} style={{background:"#f8717122",border:"1px solid #f8717144",color:"#f87171",fontSize:11,padding:"5px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>✗ Decline</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN ADMIN APP
════════════════════════════════════════════════════════════════ */
function AdminApp({ user, onLogout }) {
  const [team,setTeamRaw]=useState(()=>loadState("crew_team",INITIAL_TEAM));
  const [weddings,setWeddingsRaw]=useState(()=>loadState("crew_weddings",[]));
  function setTeam(v){const next=typeof v==="function"?v(team):v;setTeamRaw(next);saveState("crew_team",next);}
  function setWeddings(v){const next=typeof v==="function"?v(weddings):v;setWeddingsRaw(next);saveState("crew_weddings",next);}

  const [view,setView]=useState("dashboard");
  const [selectedMember,setSelectedMember]=useState(null);
  const [selectedWedding,setSelectedWedding]=useState(null);
  const [showAddMember,setShowAddMember]=useState(false);
  const [showAddWedding,setShowAddWedding]=useState(false);
  const [showAddHire,setShowAddHire]=useState(null);
  const [editMember,setEditMember]=useState(null);
  const [editWedding,setEditWedding]=useState(null);
  const [editHire,setEditHire]=useState(null);
  const [newMember,setNewMember]=useState({name:"",role:ROLES[0],phone:"",rate:""});
  const [editForm,setEditForm]=useState({name:"",role:ROLES[0],phone:"",rate:""});
  const [wForm,setWForm]=useState({name:"",bride:"",groom:"",location:"",selectedDates:[],eventDays:[]});
  const [hireForm,setHireForm]=useState({wedding:"",selectedEventDays:[],status:"Confirmed",dayType:"Full Day",hireRole:ROLES[0]});
  const [editHireForm,setEditHireForm]=useState({status:"Confirmed",dayType:"Full Day",hireRole:ROLES[0]});
  const [filterRole,setFilterRole]=useState("All");
  const [searchQ,setSearchQ]=useState("");

  const bookedMap=useMemo(()=>{const map={};team.forEach(m=>m.hires.forEach(h=>{if(!map[h.date])map[h.date]=[];map[h.date].push(m.name);}));return map;},[team]);
  const stats=useMemo(()=>({totalMembers:team.length,totalWeddings:weddings.length,totalHires:team.reduce((s,m)=>s+m.hires.length,0),confirmedHires:team.reduce((s,m)=>s+m.hires.filter(h=>h.status==="Confirmed").length,0)}),[team,weddings]);
  const filteredTeam=team.filter(m=>(filterRole==="All"||m.role===filterRole)&&m.name.toLowerCase().includes(searchQ.toLowerCase()));

  function openAddWedding(){setWForm({name:"",bride:"",groom:"",location:"",selectedDates:[],eventDays:[]});setEditWedding(null);setShowAddWedding(true);}
  function openEditWedding(w){setWForm({name:w.name,bride:w.bride,groom:w.groom,location:w.location,selectedDates:[...(w.selectedDates||[])],eventDays:[...(w.eventDays||[])]});setEditWedding(w);setShowAddWedding(true);}
  function toggleWDate(ds){setWForm(prev=>{const already=prev.selectedDates.includes(ds);return{...prev,selectedDates:already?prev.selectedDates.filter(d=>d!==ds):[...prev.selectedDates,ds].sort(),eventDays:already?prev.eventDays.filter(ed=>ed.date!==ds):prev.eventDays};});}
  function saveWedding(){if(!wForm.name)return;if(editWedding){setWeddings(weddings.map(w=>w.id===editWedding.id?{...w,...wForm}:w));}else{setWeddings([...weddings,{id:Date.now(),...wForm}]);}setShowAddWedding(false);}
  function removeWedding(id){setWeddings(weddings.filter(w=>w.id!==id));}
  function addMember(){if(!newMember.name)return;setTeam([...team,{id:Date.now(),...newMember,rate:Number(newMember.rate),hires:[]}]);setNewMember({name:"",role:ROLES[0],phone:"",rate:""});setShowAddMember(false);}
  function saveEditMember(){setTeam(team.map(m=>m.id===editMember.id?{...m,...editForm,rate:Number(editForm.rate)}:m));setEditMember(null);}
  function removeMember(id){setTeam(team.filter(m=>m.id!==id));if(selectedMember?.id===id)setSelectedMember(null);}
  function toggleEventDay(key){setHireForm(prev=>({...prev,selectedEventDays:prev.selectedEventDays.includes(key)?prev.selectedEventDays.filter(k=>k!==key):[...prev.selectedEventDays,key]}));}
  function addBulkHire(memberId){if(!hireForm.wedding||hireForm.selectedEventDays.length===0)return;const newHires=hireForm.selectedEventDays.map(key=>{const[date,...evParts]=key.split("|");const event=evParts.join("|");return{wedding:hireForm.wedding,event,date,status:hireForm.status,dayType:hireForm.dayType,hireRole:hireForm.hireRole,days:1};});setTeam(team.map(m=>m.id===memberId?{...m,hires:[...m.hires,...newHires]}:m));setHireForm({wedding:"",selectedEventDays:[],status:"Confirmed",dayType:"Full Day",hireRole:ROLES[0]});setShowAddHire(null);}
  function openEditHire(memberId,hireIdx){const hire=team.find(m=>m.id===memberId)?.hires[hireIdx];if(!hire)return;setEditHireForm({status:hire.status||"Pending",dayType:hire.dayType||"Full Day",hireRole:hire.hireRole||ROLES[0]});setEditHire({memberId,hireIdx});}
  function saveEditHire(){setTeam(team.map(m=>m.id===editHire.memberId?{...m,hires:m.hires.map((h,i)=>i===editHire.hireIdx?{...h,...editHireForm}:h)}:m));setEditHire(null);}
  function removeHire(memberId,idx){setTeam(team.map(m=>m.id===memberId?{...m,hires:m.hires.filter((_,i)=>i!==idx)}:m));}
  function getWeddingEventDays(weddingName){const w=weddings.find(x=>x.name===weddingName);return w?(w.eventDays||[]):[]; }
  function sendWAToMember(member,hire){const msg=`Hi ${member.name.split(" ")[0]}! You have been booked for:\n\n💍 *${hire.wedding}*\n🎬 *${hire.event}*\n📅 *${hire.date}*\n🎭 Role: *${hire.hireRole||member.role}*\n⏱ ${hire.dayType||"Full Day"}\n💰 ₹${(member.rate*(hire.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}\n\nPlease confirm. Thank you!`;window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(msg)}`,"_blank");}

  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#111;}::-webkit-scrollbar-thumb{background:#3a3028;border-radius:2px;}
  input,select{background:#111;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:13px;padding:10px 14px;border-radius:4px;outline:none;width:100%;transition:border-color 0.2s;}
  input:focus,select:focus{border-color:#c9a96e;}select option{background:#111;}
  button{cursor:pointer;font-family:'Cormorant Garamond',Georgia,serif;transition:all 0.2s;}
  .tag{display:inline-block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.08em;padding:3px 10px;border-radius:2px;text-transform:uppercase;}
  .fade-in{animation:fadeIn 0.4s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .card-hover{transition:all 0.25s;}.card-hover:hover{border-color:#c9a96e!important;transform:translateY(-2px);}
  .btn-gold{background:linear-gradient(135deg,#c9a96e,#a8814a);color:#0a0a0a;border:none;padding:10px 22px;font-size:14px;font-weight:600;letter-spacing:0.05em;border-radius:3px;}
  .btn-ghost{background:transparent;color:#c9a96e;border:1px solid #c9a96e33;padding:8px 18px;font-size:13px;letter-spacing:0.04em;border-radius:3px;}
  .btn-ghost:hover{border-color:#c9a96e;background:#c9a96e11;}
  .nav-item{padding:10px 20px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;background:none;border:none;color:#7a6f63;transition:color 0.2s;}
  .nav-item.active{color:#c9a96e;border-bottom:1px solid #c9a96e;}.nav-item:hover{color:#e8e0d4;}
  .overlay{position:fixed;inset:0;background:#00000099;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
  .modal{background:#111;border:1px solid #2a2420;border-radius:8px;padding:32px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;}
  .stat-num{font-size:38px;font-weight:300;color:#c9a96e;line-height:1;}
  .stat-label{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5a5048;margin-top:4px;font-family:'DM Mono',monospace;}`;

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>

      {/* Header */}
      <div style={{borderBottom:"1px solid #1e1a16",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:22,fontWeight:300,letterSpacing:"0.06em"}}>CREW</span>
          <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>STUDIO</span>
          <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",marginLeft:4}}>ADMIN</span>
        </div>
        <nav style={{display:"flex",gap:4}}>
          {["dashboard","team","weddings","calendar"].map(v=>(
            <button key={v} className={`nav-item ${view===v?"active":""}`} onClick={()=>setView(v)}>{v}</button>
          ))}
        </nav>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{user.name}</span>
          <button className="btn-ghost" onClick={()=>setShowAddMember(true)}>+ Member</button>
          <button className="btn-gold" onClick={openAddWedding}>+ Wedding</button>
          <button onClick={onLogout} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 14px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Sign Out</button>
        </div>
      </div>

      <div style={{padding:"32px",maxWidth:1280,margin:"0 auto"}}>

        {/* DASHBOARD */}
        {view==="dashboard"&&(
          <div className="fade-in">
            <div style={{marginBottom:40}}>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Overview</p>
              <h1 style={{fontSize:42,fontWeight:300,marginTop:4}}>Hire Management</h1>
            </div>
            <div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:6,padding:"16px 20px",marginBottom:32,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Team Portal Link</p>
                <p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{window.location.href.split("#")[0]}#team</p>
              </div>
              <button onClick={()=>navigator.clipboard.writeText(window.location.href.split("#")[0]+"#team")} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",padding:"8px 16px",borderRadius:3,fontSize:12,fontFamily:"'DM Mono',monospace"}}>📋 Copy Link</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:48}}>
              {[{num:stats.totalMembers,label:"Team Members"},{num:stats.totalWeddings,label:"Weddings"},{num:stats.totalHires,label:"Total Hires"},{num:stats.confirmedHires,label:"Confirmed"}].map((s,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"28px 24px"}}><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:24}}>
              <div>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:16}}>Upcoming Events</p>
                {weddings.flatMap(w=>(w.eventDays||[]).map(ed=>({...ed,weddingName:w.name}))).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8).map((e,i)=>{
                  const crew=team.filter(m=>m.hires.some(h=>h.wedding===e.weddingName&&h.date===e.date));
                  return (<div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(e.event)}`,borderRadius:4,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:15,fontWeight:500}}>{e.weddingName}</div><div style={{fontSize:12,color:evColor(e.event),fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.event}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{e.date}</div><div style={{fontSize:11,color:"#5a5048"}}>{crew.length} crew</div></div>
                  </div>);
                })}
                {weddings.flatMap(w=>w.eventDays||[]).length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:4,padding:32,textAlign:"center",color:"#3a3028"}}>No weddings yet</div>}
              </div>
              <div>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:16}}>Team Payout</p>
                {team.map(m=>{const total=m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);return(
                  <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:15}}>{m.name}</div><div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{m.role} · {m.hires.length} hires</div></div>
                    <div style={{fontSize:14,color:"#c9a96e"}}>₹{total.toLocaleString("en-IN")}</div>
                  </div>
                );})}
              </div>
            </div>
          </div>
        )}

        {/* TEAM */}
        {view==="team"&&(
          <div className="fade-in">
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
              <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Roster</p><h1 style={{fontSize:38,fontWeight:300}}>Team Members</h1></div>
              <div style={{display:"flex",gap:12}}>
                <input placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{width:180}}/>
                <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} style={{width:180}}><option>All</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
              {filteredTeam.map(m=>(
                <div key={m.id} className="card-hover" style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"24px",cursor:"pointer"}} onClick={()=>{setSelectedMember(m);setView("member-detail");}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:20,fontWeight:500,marginBottom:4}}>{m.name}</div><span className="tag" style={{background:"#c9a96e22",color:"#c9a96e"}}>{m.role}</span></div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={e=>{e.stopPropagation();setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate});setEditMember(m);}} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>EDIT</button>
                      <button onClick={e=>{e.stopPropagation();removeMember(m.id);}} style={{background:"none",border:"none",color:"#3a3028",fontSize:18,padding:4}}>×</button>
                    </div>
                  </div>
                  <div style={{marginTop:16,display:"flex",gap:24}}>
                    <div><div style={{fontSize:24,color:"#c9a96e",fontWeight:300}}>{m.hires.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>ASSIGNMENTS</div></div>
                    <div><div style={{fontSize:24,color:"#c9a96e",fontWeight:300}}>₹{m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>TOTAL PAYOUT</div></div>
                  </div>
                  {m.phone&&<div style={{marginTop:10,fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📞 {m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</div>}
                </div>
              ))}
              <div className="card-hover" style={{border:"1px dashed #2a2420",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",minHeight:160}} onClick={()=>setShowAddMember(true)}>
                <span style={{color:"#3a3028",fontSize:32}}>+</span>
              </div>
            </div>
          </div>
        )}

        {/* MEMBER DETAIL */}
        {view==="member-detail"&&selectedMember&&(()=>{
          const m=team.find(t=>t.id===selectedMember.id)||selectedMember;
          return (
            <div className="fade-in">
              <button className="btn-ghost" style={{marginBottom:24}} onClick={()=>setView("team")}>← Back</button>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase"}}>{m.role}</p>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:4}}>
                <h1 style={{fontSize:42,fontWeight:300}}>{m.name}</h1>
                <button className="btn-ghost" onClick={()=>{setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate});setEditMember(m);}}>Edit</button>
              </div>
              <p style={{color:"#5a5048",fontFamily:"'DM Mono',monospace",fontSize:13,marginBottom:28}}>{m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</p>
              <div style={{display:"flex",gap:24,marginBottom:32}}>
                {[{v:m.hires.length,l:"Assignments"},{v:m.hires.filter(h=>h.status==="Confirmed").length,l:"Confirmed"},{v:`₹${m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}`,l:"Total Payout"}].map((s,i)=>(
                  <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,padding:"16px 20px"}}><div style={{fontSize:26,fontWeight:300,color:"#c9a96e",lineHeight:1}}>{s.v}</div><div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase"}}>Hire History</p>
                <button className="btn-ghost" onClick={()=>{setHireForm({wedding:"",selectedEventDays:[],status:"Confirmed",dayType:"Full Day",hireRole:m.role});setShowAddHire(m.id);}}>+ Add Hire</button>
              </div>
              {m.hires.length===0?<div style={{border:"1px dashed #1e1a16",borderRadius:4,padding:32,textAlign:"center",color:"#3a3028"}}>No hires yet</div>
              :[...m.hires].sort((a,b)=>a.date.localeCompare(b.date)).map((h,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:4,padding:"16px 20px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:500}}>{h.wedding}</div>
                      <div style={{fontSize:13,color:evColor(h.event)}}>{h.event}</div>
                      <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>{h.date} · {h.hireRole||m.role} · {h.dayType||"Full Day"} · ₹{(m.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span className="tag" style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24"}}>{h.status||"Pending"}</span>
                      <button onClick={()=>sendWAToMember(m,h)} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WA</button>
                      <button onClick={()=>openEditHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Edit</button>
                      <button onClick={()=>removeHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"none",color:"#3a3028",fontSize:18}}>×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* WEDDINGS */}
        {view==="weddings"&&(
          <div className="fade-in">
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
              <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Projects</p><h1 style={{fontSize:38,fontWeight:300}}>Weddings</h1></div>
              <button className="btn-gold" onClick={openAddWedding}>+ New Wedding</button>
            </div>
            {weddings.map(w=>{const assigned=team.filter(m=>m.hires.some(h=>h.wedding===w.name));return(
              <div key={w.id} className="card-hover" style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"28px 32px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{cursor:"pointer",flex:1}} onClick={()=>{setSelectedWedding(w);setView("wedding-detail");}}>
                    <h2 style={{fontSize:26,fontWeight:400,marginBottom:4}}>{w.name}</h2>
                    <p style={{color:"#7a6f63",fontSize:14}}>{w.bride} & {w.groom} · {w.location}</p>
                    <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{(w.eventDays||[]).map((ed,i)=><span key={i} className="tag" style={{background:evColor(ed.event)+"22",color:evColor(ed.event)}}>{ed.event}</span>)}</div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:16}}>
                    <div style={{textAlign:"right",marginRight:4}}><div style={{fontSize:24,color:"#c9a96e",fontWeight:300}}>{assigned.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>CREW</div></div>
                    <button onClick={()=>openEditWedding(w)} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"5px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>EDIT</button>
                    <button onClick={()=>removeWedding(w.id)} style={{background:"none",border:"none",color:"#3a3028",fontSize:20}}>×</button>
                  </div>
                </div>
              </div>
            );})}
            {weddings.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:60,textAlign:"center",color:"#3a3028"}}>No weddings yet</div>}
          </div>
        )}

        {/* WEDDING DETAIL */}
        {view==="wedding-detail"&&selectedWedding&&(()=>{
          const w=weddings.find(x=>x.id===selectedWedding.id)||selectedWedding;
          return (
            <div className="fade-in">
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
                <button className="btn-ghost" onClick={()=>setView("weddings")}>← Back</button>
                <button className="btn-ghost" onClick={()=>openEditWedding(w)}>Edit Wedding</button>
              </div>
              <h1 style={{fontSize:42,fontWeight:300,marginBottom:4}}>{w.name}</h1>
              <p style={{color:"#7a6f63",fontSize:16,marginBottom:28}}>{w.bride} & {w.groom} · {w.location}</p>
              {(w.eventDays||[]).map((ed,i)=>{const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));return(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:4,padding:"14px 20px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:15,fontWeight:500,color:evColor(ed.event)}}>{ed.event}</div><div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{ed.date}</div></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{crew.length===0?<span style={{fontSize:12,color:"#3a3028"}}>No crew</span>:crew.map(c=><span key={c.id} className="tag" style={{background:"#c9a96e11",color:"#c9a96e99"}}>{c.name}</span>)}</div>
                </div>
              );})}
            </div>
          );
        })()}

        {/* CALENDAR */}
        {view==="calendar"&&(
          <div className="fade-in">
            <div style={{marginBottom:32}}><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Visual Planner</p><h1 style={{fontSize:38,fontWeight:300}}>Calendar</h1></div>
            <BigCalendar weddings={weddings} team={team}/>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddWedding&&(<div className="overlay" onClick={()=>setShowAddWedding(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:26,fontWeight:400,marginBottom:24}}>{editWedding?"Edit Wedding":"New Wedding"}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input placeholder="Wedding Name" value={wForm.name} onChange={e=>setWForm({...wForm,name:e.target.value})}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><input placeholder="Bride's Name" value={wForm.bride} onChange={e=>setWForm({...wForm,bride:e.target.value})}/><input placeholder="Groom's Name" value={wForm.groom} onChange={e=>setWForm({...wForm,groom:e.target.value})}/></div>
          <input placeholder="Location" value={wForm.location} onChange={e=>setWForm({...wForm,location:e.target.value})}/>
          <div>
            <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:10}}>Select Wedding Days</p>
            <MiniCalendar selectedDates={wForm.selectedDates} onToggleDate={toggleWDate} bookedMap={bookedMap}/>
          </div>
          {wForm.selectedDates.length>0&&<EventAssigner selectedDates={wForm.selectedDates} eventDays={wForm.eventDays} setEventDays={fn=>setWForm(prev=>({...prev,eventDays:typeof fn==="function"?fn(prev.eventDays):fn}))} team={team} weddingName={editWedding?.name||null}/>}
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}><button className="btn-gold" style={{flex:1}} onClick={saveWedding}>{editWedding?"Save Changes":"Save Wedding"}</button><button className="btn-ghost" onClick={()=>setShowAddWedding(false)}>Cancel</button></div>
      </div></div>)}

      {showAddMember&&(<div className="overlay" onClick={()=>setShowAddMember(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:26,fontWeight:400,marginBottom:24}}>Add Team Member</h2>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input placeholder="Full Name" value={newMember.name} onChange={e=>setNewMember({...newMember,name:e.target.value})}/>
          <select value={newMember.role} onChange={e=>setNewMember({...newMember,role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
          <input placeholder="Phone Number" value={newMember.phone} onChange={e=>setNewMember({...newMember,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={newMember.rate} onChange={e=>setNewMember({...newMember,rate:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}><button className="btn-gold" style={{flex:1}} onClick={addMember}>Add Member</button><button className="btn-ghost" onClick={()=>setShowAddMember(false)}>Cancel</button></div>
      </div></div>)}

      {editMember&&(<div className="overlay" onClick={()=>setEditMember(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:26,fontWeight:400,marginBottom:24}}>Edit Member</h2>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input placeholder="Full Name" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
          <select value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
          <input placeholder="Phone Number" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={editForm.rate} onChange={e=>setEditForm({...editForm,rate:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}><button className="btn-gold" style={{flex:1}} onClick={saveEditMember}>Save Changes</button><button className="btn-ghost" onClick={()=>setEditMember(null)}>Cancel</button></div>
      </div></div>)}

      {showAddHire&&(()=>{
        const m=team.find(x=>x.id===showAddHire); const eventDays=getWeddingEventDays(hireForm.wedding);
        return (<div className="overlay" onClick={()=>setShowAddHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2 style={{fontSize:26,fontWeight:400,marginBottom:8}}>Add Hire</h2>
          <p style={{color:"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace",marginBottom:24}}>for {m?.name}</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <select value={hireForm.wedding} onChange={e=>setHireForm({...hireForm,wedding:e.target.value,selectedEventDays:[]})}><option value="">Select Wedding</option>{weddings.map(w=><option key={w.id}>{w.name}</option>)}</select>
            {hireForm.wedding&&eventDays.length>0&&(<div>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:10}}>Select Days</p>
              {eventDays.map((ed,i)=>{const key=`${ed.date}|${ed.event}`;const isSel=hireForm.selectedEventDays.includes(key);return(
                <div key={i} onClick={()=>toggleEventDay(key)} style={{background:isSel?"#c9a96e11":"#0e0c0a",border:`1px solid ${isSel?"#c9a96e":"#1e1a16"}`,borderRadius:4,padding:"12px 16px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:isSel?"#c9a96e":"#e8e0d4"}}>{ed.date}</span><span style={{fontSize:12,color:evColor(ed.event),marginLeft:10}}>{ed.event}</span></div>
                  <div style={{width:18,height:18,borderRadius:3,border:`1px solid ${isSel?"#c9a96e":"#3a3028"}`,background:isSel?"#c9a96e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0a",fontSize:12,fontWeight:"bold"}}>{isSel?"✓":""}</div>
                </div>
              );})}
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e",marginTop:4}}>{hireForm.selectedEventDays.length} days selected</p>
            </div>)}
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Day Type</p>
              <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setHireForm({...hireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${hireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:hireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:hireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            </div>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Role</p>
              <select value={hireForm.hireRole} onChange={e=>setHireForm({...hireForm,hireRole:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            </div>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Status</p>
              <div style={{display:"flex",gap:8}}>{["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setHireForm({...hireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${hireForm.status===s?(STATUS_COLOR[s]):"#2a2420"}`,background:hireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:hireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}</div>
            </div>
            {hireForm.selectedEventDays.length>0&&m&&<div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:4,padding:"12px 16px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>Total ({hireForm.selectedEventDays.length} days)</span><span style={{fontSize:18,color:"#c9a96e",fontWeight:300}}>₹{(m.rate*(hireForm.dayType==="Half Day"?0.5:1)*hireForm.selectedEventDays.length).toLocaleString("en-IN")}</span></div>}
          </div>
          <div style={{display:"flex",gap:12,marginTop:24}}><button className="btn-gold" style={{flex:1}} onClick={()=>addBulkHire(showAddHire)}>Assign{hireForm.selectedEventDays.length>0?` (${hireForm.selectedEventDays.length})`:""}</button><button className="btn-ghost" onClick={()=>setShowAddHire(null)}>Cancel</button></div>
        </div></div>);
      })()}

      {editHire&&(()=>{const m=team.find(x=>x.id===editHire.memberId);const h=m?.hires[editHire.hireIdx];if(!h)return null;return(
        <div className="overlay" onClick={()=>setEditHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2 style={{fontSize:26,fontWeight:400,marginBottom:8}}>Edit Hire</h2>
          <p style={{color:"#c9a96e",fontSize:12,fontFamily:"'DM Mono',monospace",marginBottom:24}}>{h.wedding} · {h.event} · {h.date}</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Day Type</p>
              <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setEditHireForm({...editHireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${editHireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:editHireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:editHireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            </div>
            <select value={editHireForm.hireRole} onChange={e=>setEditHireForm({...editHireForm,hireRole:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            <div style={{display:"flex",gap:8}}>{["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setEditHireForm({...editHireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${editHireForm.status===s?STATUS_COLOR[s]:"#2a2420"}`,background:editHireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:editHireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}</div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:24}}><button className="btn-gold" style={{flex:1}} onClick={saveEditHire}>Save Changes</button><button className="btn-ghost" onClick={()=>setEditHire(null)}>Cancel</button></div>
        </div></div>
      );})()}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════════════ */
export default function Root() {
  const isTeamView = window.location.hash === "#team";
  const [session, setSession] = useState(()=>loadState("crew_session", null));

  function handleLogin(user) { setSession(user); }
  function handleLogout() { saveState("crew_session", null); setSession(null); }

  if (isTeamView) {
    const [team] = useState(()=>loadState("crew_team", INITIAL_TEAM));
    const [weddings] = useState(()=>loadState("crew_weddings", []));
    return <TeamView team={team} weddings={weddings}/>;
  }

  if (!session?.loggedIn) return <AuthPage onLogin={handleLogin}/>;
  return <AdminApp user={session} onLogout={handleLogout}/>;
}
