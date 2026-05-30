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
const STATUS_COLOR = { Confirmed:"#4ade80", Pending:"#fbbf24", Declined:"#f87171" };
const EVENT_COLOR = { "Mehndi":"#f472b6","Sangeet":"#a78bfa","Haldi":"#fbbf24","Wedding Ceremony":"#c9a96e","Reception":"#34d399","Pre-Wedding Shoot":"#60a5fa","Engagement":"#fb923c" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["S","M","T","W","T","F","S"];
const FIXED_EMAIL = "crewstudio@gmail.com";
const FIXED_PASS  = "Weddings@2026";
const ADMIN_WA    = "919876543210";

// ── PASTE YOUR FIREBASE URL HERE ──────────────────────────────
// Example: "https://crew-studio-xxxxx-default-rtdb.firebaseio.com"
const FIREBASE_URL = "https://crewstudio-35d88-default-rtdb.asia-southeast1.firebasedatabase.app";
// ─────────────────────────────────────────────────────────────

const USE_FIREBASE = true; // Firebase is always ON

function evColor(ev){ return EVENT_COLOR[ev]||"#c9a96e"; }

const INITIAL_TEAM = [
  { id:1, name:"Dhruv Sukhanadi", role:"Cinematographer", phone:"9876543210", rate:8000, hires:[] },
  { id:2, name:"Keyur Raval",     role:"Cinematographer", phone:"9845678901", rate:5500, hires:[] },
  { id:3, name:"Palak",           role:"Cinematographer", phone:"9823456789", rate:6000, hires:[] },
  { id:4, name:"Akash Shah",      role:"Cinematographer", phone:"9812345678", rate:4000, hires:[] },
];

/* ── Firebase helpers ── */
async function fbGet(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    return await res.json();
  } catch { return null; }
}
async function fbSet(path, data) {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch(e) { console.error("Firebase write failed:", e); }
}
/* Real-time listener via Firebase SSE */
function fbListen(path, onData) {
  if (!USE_FIREBASE) return () => {};
  const source = new EventSource(`${FIREBASE_URL}/${path}.json`);
  source.addEventListener("put", e => {
    try { const d = JSON.parse(e.data); if (d?.data !== undefined) onData(d.data); } catch {}
  });
  return () => source.close();
}

/* localStorage fallback */
function loadState(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ─── Role Select with Custom Option ────────────────────────── */
function RoleSelect({ value, onChange }) {
  const isCustom = value && !ROLES.includes(value);
  const [custom, setCustom] = useState(isCustom);
  const inputStyle = {background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:"14px",padding:"12px 14px",borderRadius:"6px",outline:"none",width:"100%",WebkitAppearance:"none"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <select value={custom?"＋ Custom Role":(value||ROLES[0])}
        onChange={e=>{
          if(e.target.value==="＋ Custom Role"){setCustom(true);onChange("");}
          else{setCustom(false);onChange(e.target.value);}
        }} style={inputStyle}>
        {ROLES.map(r=><option key={r}>{r}</option>)}
        <option>＋ Custom Role</option>
      </select>
      {custom&&<input placeholder="Type custom role e.g. BTS Photographer…" value={value} onChange={e=>onChange(e.target.value)} style={{...inputStyle,border:"1px solid #c9a96e55"}}/>}
    </div>
  );
}

/* ─── Responsive Hook ───────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

/* ════════════════════════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
    setError("");
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    if (form.email.toLowerCase().trim() !== FIXED_EMAIL || form.password !== FIXED_PASS) {
      setError("Incorrect email or password."); return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = { name: "Krunal Prajapati", email: FIXED_EMAIL, loggedIn: true };
      saveState("crew_session", user);
      onLogin(user);
    }, 900);
  }

  const S = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    input{background:#0e0c0a;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:14px;padding:14px 16px;border-radius:6px;outline:none;width:100%;transition:border-color 0.25s,box-shadow 0.25s;}
    input:focus{border-color:#c9a96e;box-shadow:0 0 0 3px #c9a96e18;}
    input::placeholder{color:#3a3028;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  `;

  /* ── MOBILE AUTH ── */
  if (isMobile) return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",flexDirection:"column",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",padding:"0"}}>
      <style>{S}</style>
      {/* Top hero */}
      <div style={{background:"linear-gradient(160deg,#0e0b08,#060504)",borderBottom:"1px solid #1a1612",padding:"48px 28px 36px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 50% 100%, #c9a96e10 0%, transparent 60%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:26,fontWeight:300,letterSpacing:"0.1em"}}>CREW</span>
          <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.15em"}}>STUDIO</span>
        </div>
        <div style={{width:32,height:1,background:"#c9a96e44",margin:"0 auto 20px"}}/>
        <h1 style={{fontSize:34,fontWeight:300,lineHeight:1.15,marginBottom:10}}>Every frame<br/><em style={{fontStyle:"italic",color:"#c9a96e"}}>tells a story</em></h1>
        <p style={{fontSize:14,color:"#5a5048",fontWeight:300}}>Wedding Film Production · Ahmedabad</p>
      </div>

      {/* Form */}
      <div style={{flex:1,padding:"32px 24px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp 0.5s ease both"}}>
        <div>
          <h2 style={{fontSize:28,fontWeight:300,marginBottom:4}}>Welcome back</h2>
          <p style={{fontSize:13,color:"#5a5048"}}>Sign in to continue</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Email</label>
            <input type="email" placeholder="crewstudio@gmail.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{fontSize:16}}/>
          </div>
          <div>
            <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{paddingRight:48,fontSize:16}}/>
              <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a5048",fontSize:18,padding:0,lineHeight:1}}>{showPass?"🙈":"👁"}</button>
            </div>
          </div>
        </div>
        {error&&<div style={{padding:"12px 16px",background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>⚠ {error}</div>}
        <button onClick={handleLogin} disabled={loading}
          style={{padding:"18px",background:loading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"'Cormorant Garamond',Georgia,serif",marginTop:4}}>
          {loading?<><div style={{width:18,height:18,border:"2px solid #0a0a0a44",borderTopColor:"#0a0a0a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>:"Sign In →"}
        </button>
        <div style={{marginTop:"auto",paddingTop:24,borderTop:"1px solid #1a1612",textAlign:"center"}}>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.08em"}}>SECURED · DATA STAYS IN YOUR BROWSER</p>
        </div>
      </div>
    </div>
  );

  /* ── DESKTOP AUTH ── */
  return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",overflow:"hidden"}}>
      <style>{S}</style>
      <div style={{flex:"0 0 48%",background:"linear-gradient(160deg,#0e0b08 0%,#060504 60%)",borderRight:"1px solid #1a1612",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"48px 56px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 80%, #c9a96e08 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c9a96e05 0%, transparent 50%)",pointerEvents:"none"}}/>
        {[...Array(6)].map((_,i)=><div key={i} style={{position:"absolute",left:0,top:`${12+i*16}%`,width:"100%",height:"1px",background:`linear-gradient(90deg,transparent,#c9a96e${i===2?"18":"08"},transparent)`,pointerEvents:"none"}}/>)}
        <div style={{animation:"fadeUp 0.6s ease both"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}><span style={{fontSize:28,fontWeight:300,letterSpacing:"0.1em"}}>CREW</span><span style={{fontSize:14,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.15em"}}>STUDIO</span></div>
          <div style={{width:40,height:1,background:"#c9a96e44"}}/>
        </div>
        <div style={{animation:"fadeUp 0.8s 0.1s ease both"}}>
          <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.2em",color:"#5a5048",textTransform:"uppercase",marginBottom:20}}>Wedding Film Production</p>
          <h1 style={{fontSize:52,fontWeight:300,lineHeight:1.1,marginBottom:24}}>Every frame<br/><em style={{fontStyle:"italic",color:"#c9a96e"}}>tells a story</em></h1>
          <p style={{fontSize:17,color:"#7a6f63",lineHeight:1.7,fontWeight:300,maxWidth:340}}>Manage your crew, schedule events, and orchestrate every moment of your client's most important day.</p>
        </div>
        <div style={{animation:"fadeUp 0.9s 0.2s ease both"}}>
          {[{icon:"🎬",label:"Multi-day wedding scheduling"},{icon:"👥",label:"Crew hire & payout tracking"},{icon:"📅",label:"Visual calendar & conflict alerts"},{icon:"💬",label:"WhatsApp notifications built-in"}].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:32,height:32,background:"#c9a96e11",border:"1px solid #c9a96e22",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{f.icon}</div>
              <span style={{fontSize:13,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{f.label}</span>
            </div>
          ))}
        </div>
        <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.12em"}}>BY KRUNAL PRAJAPATI · AHMEDABAD</p></div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 48px",background:"#060504"}}>
        <div style={{width:"100%",maxWidth:440,animation:"fadeUp 0.7s 0.15s ease both"}}>
          <div style={{marginBottom:36}}>
            <h2 style={{fontSize:38,fontWeight:300,marginBottom:6}}>Welcome back</h2>
            <p style={{fontSize:14,color:"#5a5048"}}>Sign in to your Crew Studio account.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Email Address</label>
              <input type="email" placeholder="crewstudio@gmail.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div>
              <label style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>Password</label>
              <div style={{position:"relative"}}>
                <input type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{paddingRight:48}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a5048",fontSize:16,cursor:"pointer",padding:0,lineHeight:1}}>{showPass?"🙈":"👁"}</button>
              </div>
            </div>
          </div>
          {error&&<div style={{marginTop:16,padding:"12px 16px",background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>⚠ {error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{width:"100%",marginTop:28,padding:"16px",background:loading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:6,fontSize:16,fontWeight:600,letterSpacing:"0.06em",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.25s",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
            {loading?<><div style={{width:18,height:18,border:"2px solid #0a0a0a44",borderTopColor:"#0a0a0a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>:"Sign In to Studio →"}
          </button>
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
  const [y,setY]=useState(today.getFullYear()); const [m,setM]=useState(today.getMonth());
  const firstDay=new Date(y,m,1).getDay(); const dim=new Date(y,m+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const ds=d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const prevM=()=>m===0?(setM(11),setY(y=>y-1)):setM(m=>m-1);
  const nextM=()=>m===11?(setM(0),setY(y=>y+1)):setM(m=>m+1);
  return (
    <div style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:6,padding:12,userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={prevM} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 10px"}}>‹</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#e8e0d4"}}>{MONTH_NAMES[m]} {y}</span>
        <button onClick={nextM} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 10px"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {DAY_NAMES.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",padding:"2px 0"}}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=ds(d); const isSel=selectedDates.includes(dateStr); const booked=bookedMap?.[dateStr]||[];
          return (
            <div key={i} onClick={()=>onToggleDate(dateStr)}
              style={{textAlign:"center",padding:"6px 2px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",background:isSel?"#c9a96e":"transparent",color:isSel?"#0a0a0a":"#e8e0d4",transition:"all 0.15s"}}>
              {d}
              {booked.length>0&&<div style={{display:"flex",justifyContent:"center",gap:1,marginTop:1}}>{booked.slice(0,3).map((_,bi)=><div key={bi} style={{width:3,height:3,borderRadius:"50%",background:"#f87171"}}/>)}</div>}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",textAlign:"center"}}>{selectedDates.length} days selected</div>
    </div>
  );
}

/* ─── Event Assigner ─────────────────────────────────────────── */
function EventAssigner({ selectedDates, eventDays, setEventDays, team, weddingName }) {
  const [assigningDate,setAssigningDate]=useState(null);
  function assignEvent(date,event){
    setEventDays(prev=>{const rest=prev.filter(ed=>ed.date!==date);return event?[...rest,{date,event}].sort((a,b)=>a.date.localeCompare(b.date)):rest;});
    setAssigningDate(null);
  }
  return (
    <div>
      <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Assign Event to Each Day</p>
      {selectedDates.map(date=>{
        const assigned=eventDays.find(ed=>ed.date===date);
        return (
          <div key={date} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,marginBottom:6,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#c9a96e"}}>{date}</span>
              {assigningDate===date
                ?<button onClick={()=>setAssigningDate(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:18}}>×</button>
                :<button onClick={()=>setAssigningDate(date)} style={{background:assigned?evColor(assigned.event)+"22":"#1a1612",border:`1px solid ${assigned?evColor(assigned.event):"#2a2420"}`,color:assigned?evColor(assigned.event):"#5a5048",fontSize:10,padding:"4px 10px",borderRadius:2,fontFamily:"'DM Mono',monospace"}}>{assigned?assigned.event:"Assign"}</button>}
            </div>
            {assigningDate===date&&(
              <div style={{padding:"10px 12px",borderTop:"1px solid #1e1a16",background:"#080806"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {DEFAULT_EVENTS.map(ev=><button key={ev} onClick={()=>assignEvent(date,ev)} style={{background:evColor(ev)+"22",border:`1px solid ${evColor(ev)}44`,color:evColor(ev),fontSize:10,padding:"5px 10px",borderRadius:2,fontFamily:"'DM Mono',monospace"}}>{ev}</button>)}
                </div>
                {assigned&&<button onClick={()=>assignEvent(date,null)} style={{marginTop:8,background:"none",border:"none",color:"#f87171",fontSize:11,fontFamily:"'DM Mono',monospace",padding:0}}>Remove</button>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Big Calendar (Desktop) ─────────────────────────────────── */
function BigCalendar({ weddings, team }) {
  const today=new Date(); const [y,setY]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const dayMap=useMemo(()=>{const map={};weddings.forEach(w=>(w.eventDays||[]).forEach(ed=>{if(!map[ed.date])map[ed.date]=[];const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));map[ed.date].push({weddingName:w.name,event:ed.event,crew});}));return map;},[weddings,team]);
  const firstDay=new Date(y,mo,1).getDay(); const dim=new Date(y,mo+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const ds=d=>`${y}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <button onClick={()=>mo===0?(setMo(11),setY(y=>y-1)):setMo(m=>m-1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:22,padding:"6px 16px",borderRadius:4}}>‹</button>
        <h2 style={{fontSize:24,fontWeight:300}}>{MONTH_NAMES[mo]} {y}</h2>
        <button onClick={()=>mo===11?(setMo(0),setY(y=>y+1)):setMo(m=>m+1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:22,padding:"6px 16px",borderRadius:4}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",paddingBottom:8}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i} style={{minHeight:80}}/>;
          const dateStr=ds(d); const entries=dayMap[dateStr]||[]; const isToday=dateStr===today.toISOString().slice(0,10);
          return (
            <div key={i} style={{minHeight:80,background:entries.length?"#0e0c0a":"#080806",border:`1px solid ${entries.length?"#2a2420":"#111"}`,borderRadius:5,padding:"6px"}}>
              <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:isToday?"#c9a96e":entries.length?"#e8e0d4":"#2a2420",marginBottom:3}}>{d}</div>
              {entries.map((e,ei)=>(
                <div key={ei} style={{background:evColor(e.event)+"22",borderLeft:`2px solid ${evColor(e.event)}`,borderRadius:2,padding:"2px 4px",marginBottom:2}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:evColor(e.event),textTransform:"uppercase"}}>{e.event}</div>
                  <div style={{fontSize:9,color:"#7a6f63",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.weddingName}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mobile Calendar (list view) ────────────────────────────── */
function MobileCalendar({ weddings, team }) {
  const today=new Date(); const [y,setY]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const events=useMemo(()=>{
    const list=[];
    weddings.forEach(w=>(w.eventDays||[]).forEach(ed=>{
      const [ey,em]=ed.date.split("-").map(Number);
      if(ey===y&&em===mo+1){
        const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));
        list.push({...ed,weddingName:w.name,crew});
      }
    }));
    return list.sort((a,b)=>a.date.localeCompare(b.date));
  },[weddings,team,y,mo]);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <button onClick={()=>mo===0?(setMo(11),setY(y=>y-1)):setMo(m=>m-1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:20,padding:"6px 14px",borderRadius:4}}>‹</button>
        <h2 style={{fontSize:20,fontWeight:300}}>{MONTH_NAMES[mo]} {y}</h2>
        <button onClick={()=>mo===11?(setMo(0),setY(y=>y+1)):setMo(m=>m+1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:20,padding:"6px 14px",borderRadius:4}}>›</button>
      </div>
      {events.length===0
        ?<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:40,textAlign:"center",color:"#3a3028",fontSize:14}}>No events this month</div>
        :events.map((e,i)=>(
          <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(e.event)}`,borderRadius:6,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:16,fontWeight:500}}>{e.weddingName}</div>
                <div style={{fontSize:13,color:evColor(e.event),marginTop:2}}>{e.event}</div>
                <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048",marginTop:4}}>{e.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#5a5048"}}>{e.crew.length} crew</div>
                {e.crew.map(c=><div key={c.id} style={{fontSize:11,color:"#7a6f63"}}>{c.name.split(" ")[0]}</div>)}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─── Team View (Crew Portal) ────────────────────────────────── */
function TeamView({ team, weddings }) {
  const isMobile=useIsMobile();
  const [myName,setMyName]=useState(loadState("crew_myname",""));
  const [nameInput,setNameInput]=useState("");
  const me=team.find(m=>m.name===myName);
  function confirmIdentity(){const found=team.find(m=>m.name.toLowerCase()===nameInput.trim().toLowerCase());if(found){setMyName(found.name);saveState("crew_myname",found.name);}else alert("Name not found.");}
  function sendWA(hire,action,memberName){const msg=`Hi Krunal! This is ${memberName}. I want to *${action}* my booking:\n\n📅 *${hire.date}*\n💍 *${hire.wedding}*\n🎬 *${hire.event}*\n🎭 Role: *${hire.hireRole}*\n⏱ ${hire.dayType}`;window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`,"_blank");}

  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input{background:#111;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:16px;padding:14px 16px;border-radius:6px;outline:none;width:100%;}`;

  if(!myName) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      <div style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:10,padding:isMobile?28:40,width:"100%",maxWidth:400,textAlign:"center"}}>
        <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Crew Portal</p>
        <h2 style={{fontSize:isMobile?24:28,fontWeight:300,marginBottom:8}}>Who are you?</h2>
        <p style={{fontSize:13,color:"#5a5048",marginBottom:20}}>Tap your name to see your schedule</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16}}>
          {team.map(m=><button key={m.id} onClick={()=>setNameInput(m.name)} style={{background:nameInput===m.name?"#c9a96e22":"#1a1612",border:`1px solid ${nameInput===m.name?"#c9a96e":"#2a2420"}`,color:nameInput===m.name?"#c9a96e":"#7a6f63",fontSize:13,padding:"8px 14px",borderRadius:6,fontFamily:"'Cormorant Garamond',Georgia,serif",cursor:"pointer"}}>{m.name.split(" ")[0]}</button>)}
        </div>
        <input placeholder="Or type your full name..." value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&confirmIdentity()} style={{marginBottom:12}}/>
        <button onClick={confirmIdentity} style={{width:"100%",background:"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",padding:"14px",fontSize:16,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>View My Schedule</button>
      </div>
    </div>
  );

  const upcomingHires=[...me.hires].sort((a,b)=>a.date.localeCompare(b.date));
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",paddingBottom:isMobile?32:0}}>
      <style>{S}</style>
      <div style={{background:"#0e0c0a",borderBottom:"1px solid #1e1a16",padding:isMobile?"14px 20px":"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:isMobile?"auto":56}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:18,fontWeight:300}}>CREW</span><span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>PORTAL</span></div>
        <button onClick={()=>{setMyName("");saveState("crew_myname","");}} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 12px",borderRadius:4,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Switch</button>
      </div>
      <div style={{padding:isMobile?"20px":"24px",maxWidth:700,margin:"0 auto"}}>
        <h1 style={{fontSize:isMobile?28:36,fontWeight:300,marginBottom:2}}>{myName}</h1>
        <p style={{fontSize:13,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginBottom:20}}>{me?.role} · ₹{me?.rate?.toLocaleString("en-IN")}/day</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
          {[{v:me.hires.length,l:"Hires"},{v:me.hires.filter(h=>h.status==="Confirmed").length,l:"Confirmed"},{v:`₹${me.hires.reduce((s,h)=>s+(me?.rate||0)*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}`,l:"Payout"}].map((s,i)=>(
            <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"14px 12px"}}>
              <div style={{fontSize:isMobile?20:26,fontWeight:300,color:"#c9a96e"}}>{s.v}</div>
              <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
            </div>
          ))}
        </div>
        {upcomingHires.length===0?<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:40,textAlign:"center",color:"#3a3028"}}>No assignments yet.</div>
        :upcomingHires.map((h,i)=>(
          <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:8,padding:"16px",marginBottom:12}}>
            <div style={{fontSize:17,fontWeight:500}}>{h.wedding}</div>
            <div style={{fontSize:14,color:evColor(h.event),margin:"2px 0 6px"}}>{h.event}</div>
            <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📅 {h.date}</div>
            <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>🎭 {h.hireRole} · ⏱ {h.dayType}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:8}}>
              <div>
                <span style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24",border:`1px solid ${STATUS_COLOR[h.status]||"#fbbf24"}44`,padding:"3px 10px",borderRadius:2,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{h.status||"Pending"}</span>
                <span style={{fontSize:13,color:"#c9a96e",marginLeft:10}}>₹{((me?.rate||0)*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}</span>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>sendWA(h,"CONFIRM",myName)} style={{background:"#4ade8022",border:"1px solid #4ade8044",color:"#4ade80",fontSize:11,padding:"6px 12px",borderRadius:4,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>✓ Confirm</button>
                <button onClick={()=>sendWA(h,"DECLINE",myName)} style={{background:"#f8717122",border:"1px solid #f8717144",color:"#f87171",fontSize:11,padding:"6px 12px",borderRadius:4,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>✗ Decline</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADMIN APP
════════════════════════════════════════════════════════════════ */
function AdminApp({ user, onLogout }) {
  const isMobile=useIsMobile();
  const [team,setTeamRaw]=useState(()=>loadState("crew_team",INITIAL_TEAM));
  const [weddings,setWeddingsRaw]=useState(()=>loadState("crew_weddings",[]));
  const [syncing,setSyncing]=useState(USE_FIREBASE);

  /* Load from Firebase on mount + listen for real-time changes */
  useEffect(()=>{
    if(!USE_FIREBASE){setSyncing(false);return;}
    let closeFns=[];
    (async()=>{
      const [fbTeam,fbWeddings]=await Promise.all([fbGet("crew_team"),fbGet("crew_weddings")]);
      if(fbTeam)  setTeamRaw(fbTeam);
      if(fbWeddings) setWeddingsRaw(Array.isArray(fbWeddings)?fbWeddings:Object.values(fbWeddings||{}));
      setSyncing(false);
    })();
    closeFns.push(fbListen("crew_team",    d=>{ if(d) setTeamRaw(d); }));
    closeFns.push(fbListen("crew_weddings",d=>{ if(d) setWeddingsRaw(Array.isArray(d)?d:Object.values(d||{})); }));
    return ()=>closeFns.forEach(f=>f());
  },[]);

  function setTeam(v){
    setTeamRaw(prev=>{
      const next=typeof v==="function"?v(prev):v;
      saveState("crew_team",next);
      if(USE_FIREBASE) fbSet("crew_team",next);
      return next;
    });
  }
  function setWeddings(v){
    setWeddingsRaw(prev=>{
      const next=typeof v==="function"?v(prev):v;
      saveState("crew_weddings",next);
      if(USE_FIREBASE) fbSet("crew_weddings",next);
      return next;
    });
  }

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

  const bookedMap=useMemo(()=>{const map={};(team||[]).forEach(m=>(m.hires||[]).forEach(h=>{if(!map[h.date])map[h.date]=[];map[h.date].push(m.name);}));return map;},[team]);
const stats=useMemo(()=>({totalMembers:(team||[]).length,totalWeddings:(weddings||[]).length,totalHires:(team||[]).reduce((s,m)=>s+(m.hires||[]).length,0),confirmedHires:(team||[]).reduce((s,m)=>s+(m.hires||[]).filter(h=>h.status==="Confirmed").length,0)}),[team,weddings]);
  
  if(syncing) return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <div style={{width:36,height:36,border:"2px solid #2a2420",borderTopColor:"#c9a96e",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
      <p style={{fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase"}}>Connecting to database…</p>
    </div>
  );

  function openAddWedding(){setWForm({name:"",bride:"",groom:"",location:"",selectedDates:[],eventDays:[]});setEditWedding(null);setShowAddWedding(true);}
  function openEditWedding(w){setWForm({name:w.name,bride:w.bride,groom:w.groom,location:w.location,selectedDates:[...(w.selectedDates||[])],eventDays:[...(w.eventDays||[])]});setEditWedding(w);setShowAddWedding(true);}
  function toggleWDate(ds){setWForm(prev=>{const already=prev.selectedDates.includes(ds);return{...prev,selectedDates:already?prev.selectedDates.filter(d=>d!==ds):[...prev.selectedDates,ds].sort(),eventDays:already?prev.eventDays.filter(ed=>ed.date!==ds):prev.eventDays};});}
  function saveWedding(){if(!wForm.name)return;if(editWedding){setWeddings(weddings.map(w=>w.id===editWedding.id?{...w,...wForm}:w));}else{setWeddings([...weddings,{id:Date.now(),...wForm}]);}setShowAddWedding(false);}
  function removeWedding(id){setWeddings(weddings.filter(w=>w.id!==id));}
  function addMember(){if(!newMember.name)return;setTeam([...team,{id:Date.now(),...newMember,rate:Number(newMember.rate),hires:[]}]);setNewMember({name:"",role:ROLES[0],phone:"",rate:""});setShowAddMember(false);}
  function saveEditMember(){setTeam(team.map(m=>m.id===editMember.id?{...m,...editForm,rate:Number(editForm.rate)}:m));setEditMember(null);}
  function removeMember(id){setTeam(team.filter(m=>m.id!==id));}
  function toggleEventDay(key){setHireForm(prev=>({...prev,selectedEventDays:prev.selectedEventDays.includes(key)?prev.selectedEventDays.filter(k=>k!==key):[...prev.selectedEventDays,key]}));}
  function addBulkHire(memberId){if(!hireForm.wedding||hireForm.selectedEventDays.length===0)return;const newHires=hireForm.selectedEventDays.map(key=>{const[date,...evParts]=key.split("|");const event=evParts.join("|");return{wedding:hireForm.wedding,event,date,status:hireForm.status,dayType:hireForm.dayType,hireRole:hireForm.hireRole};});setTeam(team.map(m=>m.id===memberId?{...m,hires:[...m.hires,...newHires]}:m));setHireForm({wedding:"",selectedEventDays:[],status:"Confirmed",dayType:"Full Day",hireRole:ROLES[0]});setShowAddHire(null);}
  function openEditHire(memberId,hireIdx){const hire=team.find(m=>m.id===memberId)?.hires[hireIdx];if(!hire)return;setEditHireForm({status:hire.status||"Pending",dayType:hire.dayType||"Full Day",hireRole:hire.hireRole||ROLES[0]});setEditHire({memberId,hireIdx});}
  function saveEditHire(){setTeam(team.map(m=>m.id===editHire.memberId?{...m,hires:m.hires.map((h,i)=>i===editHire.hireIdx?{...h,...editHireForm}:h)}:m));setEditHire(null);}
  function removeHire(memberId,idx){setTeam(team.map(m=>m.id===memberId?{...m,hires:m.hires.filter((_,i)=>i!==idx)}:m));}
  function getWeddingEventDays(weddingName){const w=weddings.find(x=>x.name===weddingName);return w?(w.eventDays||[]):[]; }
  function sendWAToMember(member,hire){const msg=`Hi ${member.name.split(" ")[0]}! You've been booked:\n\n💍 *${hire.wedding}*\n🎬 *${hire.event}*\n📅 *${hire.date}*\n🎭 ${hire.hireRole||member.role}\n⏱ ${hire.dayType||"Full Day"}\n💰 ₹${(member.rate*(hire.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}\n\nPlease confirm.`;window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(msg)}`,"_blank");}

  const NAV_ITEMS=[{id:"dashboard",icon:"◈",label:"Home"},{id:"team",icon:"◉",label:"Team"},{id:"weddings",icon:"◇",label:"Events"},{id:"calendar",icon:"▦",label:"Calendar"}];

  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#3a3028;border-radius:2px;}
  input,select{background:#111;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:14px;padding:12px 14px;border-radius:6px;outline:none;width:100%;transition:border-color 0.2s;-webkit-appearance:none;}
  input:focus,select:focus{border-color:#c9a96e;}select option{background:#111;}
  button{cursor:pointer;font-family:'Cormorant Garamond',Georgia,serif;transition:all 0.2s;}
  .tag{display:inline-block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.08em;padding:3px 10px;border-radius:2px;text-transform:uppercase;}
  .fade-in{animation:fadeIn 0.3s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  .overlay{position:fixed;inset:0;background:#00000099;z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
  .modal{background:#111;border:1px solid #2a2420;border-radius:12px 12px 0 0;padding:28px 20px;width:100%;max-height:90vh;overflow-y:auto;}
  .modal-desktop{align-items:center;}.modal-desktop .modal{border-radius:10px;max-width:540px;}
  .btn-gold{background:linear-gradient(135deg,#c9a96e,#a8814a);color:#0a0a0a;border:none;padding:12px 22px;font-size:15px;font-weight:600;border-radius:6px;}
  .btn-ghost{background:transparent;color:#c9a96e;border:1px solid #c9a96e33;padding:8px 16px;font-size:13px;border-radius:4px;}
  .btn-ghost:hover{border-color:#c9a96e;}
  .nav-item{padding:10px 18px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;background:none;border:none;color:#7a6f63;}
  .nav-item.active{color:#c9a96e;border-bottom:1px solid #c9a96e;}
  .mob-nav{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:8px 0;flex:1;border:none;background:none;}
  .mob-nav.active .mob-nav-icon{color:#c9a96e;}.mob-nav.active .mob-nav-label{color:#c9a96e;}
  .mob-nav-icon{font-size:18px;color:#3a3028;line-height:1;}
  .mob-nav-label{font-size:9px;font-family:'DM Mono',monospace;letter-spacing:0.08em;text-transform:uppercase;color:#3a3028;margin-top:2px;}`;

  const modalClass = isMobile ? "overlay" : "overlay modal-desktop";
  const modalStyle = isMobile ? {} : {};

  /* ── MOBILE LAYOUT ── */
  if (isMobile) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",paddingBottom:70}}>
      <style>{S}</style>

      {/* Mobile Header */}
      <div style={{background:"#0e0c0a",borderBottom:"1px solid #1e1a16",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:18,fontWeight:300,letterSpacing:"0.06em"}}>CREW</span>
          <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>STUDIO</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {view==="weddings"&&<button className="btn-gold" style={{padding:"8px 14px",fontSize:13}} onClick={openAddWedding}>+ Wedding</button>}
          {view==="team"&&<button className="btn-gold" style={{padding:"8px 14px",fontSize:13}} onClick={()=>setShowAddMember(true)}>+ Member</button>}
          <button onClick={onLogout} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 10px",borderRadius:4,fontFamily:"'DM Mono',monospace"}}>↩</button>
        </div>
      </div>

      {/* Page Content */}
      <div style={{padding:"20px 16px"}}>

        {/* DASHBOARD mobile */}
        {view==="dashboard"&&(
          <div className="fade-in">
            <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.15em"}}>Overview</p>
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20,marginTop:2}}>Dashboard</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[{num:stats.totalMembers,label:"Members"},{num:stats.totalWeddings,label:"Weddings"},{num:stats.totalHires,label:"Hires"},{num:stats.confirmedHires,label:"Confirmed"}].map((s,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px 14px"}}>
                  <div style={{fontSize:30,fontWeight:300,color:"#c9a96e",lineHeight:1}}>{s.num}</div>
                  <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:3,fontFamily:"'DM Mono',monospace"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Upcoming Events</p>
            {weddings.flatMap(w=>(w.eventDays||[]).map(ed=>({...ed,weddingName:w.name}))).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6).map((e,i)=>{
              const crew=team.filter(m=>m.hires.some(h=>h.wedding===e.weddingName&&h.date===e.date));
              return (
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(e.event)}`,borderRadius:6,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:15,fontWeight:500}}>{e.weddingName}</div><div style={{fontSize:12,color:evColor(e.event),fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.event}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{e.date}</div><div style={{fontSize:11,color:"#5a5048"}}>{crew.length} crew</div></div>
                </div>
              );
            })}
            {weddings.flatMap(w=>w.eventDays||[]).length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:28,textAlign:"center",color:"#3a3028",fontSize:14}}>No events yet</div>}
          </div>
        )}

        {/* TEAM mobile */}
        {view==="team"&&(
          <div className="fade-in">
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Team</h1>
            {team.map(m=>(
              <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px",marginBottom:12}} onClick={()=>{setSelectedMember(m);setView("member-detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:500}}>{m.name}</div>
                    <span className="tag" style={{background:"#c9a96e22",color:"#c9a96e",marginTop:4,display:"inline-block"}}>{m.role}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>{m.hires.length}</div>
                    <div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>HIRES</div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>₹{m.rate?.toLocaleString("en-IN")}/day · {m.phone}</div>
              </div>
            ))}
          </div>
        )}

        {/* MEMBER DETAIL mobile */}
        {view==="member-detail"&&selectedMember&&(()=>{
          const m=team.find(t=>t.id===selectedMember.id)||selectedMember;
          return (
            <div className="fade-in">
              <button className="btn-ghost" style={{marginBottom:16}} onClick={()=>setView("team")}>← Back</button>
              <h1 style={{fontSize:26,fontWeight:300,marginBottom:2}}>{m.name}</h1>
              <p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginBottom:16}}>{m.role} · ₹{m.rate?.toLocaleString("en-IN")}/day</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
                {[{v:m.hires.length,l:"Hires"},{v:m.hires.filter(h=>h.status==="Confirmed").length,l:"OK"},{v:`₹${m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}`,l:"Payout"}].map((s,i)=>(
                  <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"12px 10px"}}>
                    <div style={{fontSize:18,fontWeight:300,color:"#c9a96e"}}>{s.v}</div>
                    <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <button className="btn-gold" style={{flex:1,fontSize:14}} onClick={()=>{setHireForm({wedding:"",selectedEventDays:[],status:"Confirmed",dayType:"Full Day",hireRole:m.role});setShowAddHire(m.id);}}>+ Add Hire</button>
                <button onClick={()=>{setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate});setEditMember(m);}} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#7a6f63",padding:"12px 16px",borderRadius:6,fontSize:14}}>Edit</button>
                {m.phone&&<button onClick={()=>window.open(`https://wa.me/91${m.phone}`,"_blank")} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",padding:"12px 14px",borderRadius:6,fontSize:16}}>💬</button>}
              </div>
              {[...m.hires].sort((a,b)=>a.date.localeCompare(b.date)).map((h,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:6,padding:"14px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:500}}>{h.wedding}</div>
                      <div style={{fontSize:13,color:evColor(h.event)}}>{h.event}</div>
                      <div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>{h.date} · {h.dayType}</div>
                      <div style={{fontSize:13,color:"#c9a96e",marginTop:2}}>₹{(m.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <span className="tag" style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24"}}>{h.status||"Pending"}</span>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>sendWAToMember(m,h)} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WA</button>
                        <button onClick={()=>openEditHire(m.id,m.hires.indexOf(h))} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Edit</button>
                        <button onClick={()=>removeHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"none",color:"#3a3028",fontSize:16}}>×</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {m.hires.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:28,textAlign:"center",color:"#3a3028"}}>No hires yet</div>}
            </div>
          );
        })()}

        {/* WEDDINGS mobile */}
        {view==="weddings"&&(
          <div className="fade-in">
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Weddings</h1>
            {weddings.map(w=>{const assigned=team.filter(m=>m.hires.some(h=>h.wedding===w.name));return(
              <div key={w.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}} onClick={()=>{setSelectedWedding(w);setView("wedding-detail");}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:18,fontWeight:500}}>{w.name}</h2>
                    <p style={{fontSize:13,color:"#7a6f63",marginTop:2}}>{w.bride} & {w.groom}</p>
                    <p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>{w.location}</p>
                    <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
                      {(w.eventDays||[]).map((ed,i)=><span key={i} className="tag" style={{background:evColor(ed.event)+"22",color:evColor(ed.event)}}>{ed.event}</span>)}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,marginLeft:8}}>
                    <button onClick={e=>{e.stopPropagation();openEditWedding(w);}} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Edit</button>
                    <button onClick={e=>{e.stopPropagation();removeWedding(w.id);}} style={{background:"none",border:"none",color:"#3a3028",fontSize:18}}>×</button>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{assigned.length} crew · {w.selectedDates?.length||0} days</div>
              </div>
            );})}
            {weddings.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:8,padding:40,textAlign:"center",color:"#3a3028"}}>No weddings yet</div>}
          </div>
        )}

        {/* WEDDING DETAIL mobile */}
        {view==="wedding-detail"&&selectedWedding&&(()=>{
          const w=weddings.find(x=>x.id===selectedWedding.id)||selectedWedding;
          return (
            <div className="fade-in">
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
                <button className="btn-ghost" onClick={()=>setView("weddings")}>← Back</button>
                <button className="btn-ghost" onClick={()=>openEditWedding(w)}>Edit</button>
              </div>
              <h1 style={{fontSize:24,fontWeight:300,marginBottom:2}}>{w.name}</h1>
              <p style={{color:"#7a6f63",fontSize:14,marginBottom:20}}>{w.bride} & {w.groom} · {w.location}</p>
              {(w.eventDays||[]).map((ed,i)=>{const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));return(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:6,padding:"12px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:15,fontWeight:500,color:evColor(ed.event)}}>{ed.event}</div><div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{ed.date}</div></div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"flex-end"}}>{crew.length===0?<span style={{fontSize:12,color:"#3a3028"}}>No crew</span>:crew.map(c=><span key={c.id} className="tag" style={{background:"#c9a96e11",color:"#c9a96e99"}}>{c.name.split(" ")[0]}</span>)}</div>
                  </div>
                </div>
              );})}
            </div>
          );
        })()}

        {/* CALENDAR mobile */}
        {view==="calendar"&&(
          <div className="fade-in">
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Calendar</h1>
            <MobileCalendar weddings={weddings} team={team}/>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #1e1a16",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {NAV_ITEMS.map(n=>(
          <button key={n.id} className={`mob-nav ${view===n.id||view==="member-detail"&&n.id==="team"||view==="wedding-detail"&&n.id==="weddings"?"active":""}`} onClick={()=>setView(n.id)}>
            <span className="mob-nav-icon">{n.icon}</span>
            <span className="mob-nav-label">{n.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {renderModals()}
    </div>
  );

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      <div style={{borderBottom:"1px solid #1e1a16",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,background:"#0a0a0a",zIndex:100}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}><span style={{fontSize:22,fontWeight:300,letterSpacing:"0.06em"}}>CREW</span><span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>STUDIO</span></div>
        <nav style={{display:"flex",gap:4}}>{NAV_ITEMS.map(n=><button key={n.id} className={`nav-item ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>{n.label}</button>)}</nav>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{user.name}</span>
          <button className="btn-ghost" onClick={()=>setShowAddMember(true)}>+ Member</button>
          <button className="btn-gold" onClick={openAddWedding}>+ Wedding</button>
          <button onClick={onLogout} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 14px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Sign Out</button>
        </div>
      </div>
      <div style={{padding:"32px",maxWidth:1280,margin:"0 auto"}}>
        {/* Desktop views - same structure but full layout */}
        {view==="dashboard"&&(<div className="fade-in">
          <div style={{marginBottom:36}}><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Overview</p><h1 style={{fontSize:42,fontWeight:300,marginTop:4}}>Dashboard</h1></div>
          <div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:6,padding:"16px 20px",marginBottom:32,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",marginBottom:4}}>Team Portal Link</p><p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{window.location.href.split("#")[0]}#team</p></div>
            <button onClick={()=>navigator.clipboard.writeText(window.location.href.split("#")[0]+"#team")} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",padding:"8px 16px",borderRadius:3,fontSize:12,fontFamily:"'DM Mono',monospace"}}>📋 Copy Link</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:40}}>
            {[{num:stats.totalMembers,label:"Team Members"},{num:stats.totalWeddings,label:"Weddings"},{num:stats.totalHires,label:"Total Hires"},{num:stats.confirmedHires,label:"Confirmed"}].map((s,i)=>(
              <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"28px 24px"}}><div style={{fontSize:38,fontWeight:300,color:"#c9a96e",lineHeight:1}}>{s.num}</div><div style={{fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.label}</div></div>
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
              {weddings.flatMap(w=>w.eventDays||[]).length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:4,padding:32,textAlign:"center",color:"#3a3028"}}>No events yet</div>}
            </div>
            <div>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:16}}>Team Payout</p>
              {team.map(m=>{const total=m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);return(
                <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:15}}>{m.name}</div><div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{m.hires.length} hires</div></div>
                  <div style={{fontSize:14,color:"#c9a96e"}}>₹{total.toLocaleString("en-IN")}</div>
                </div>
              );})}
            </div>
          </div>
        </div>)}

        {view==="team"&&(<div className="fade-in">
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}><div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Roster</p><h1 style={{fontSize:38,fontWeight:300}}>Team Members</h1></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {team.map(m=>(
              <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"22px",cursor:"pointer",transition:"all 0.2s"}} onClick={()=>{setSelectedMember(m);setView("member-detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:19,fontWeight:500,marginBottom:4}}>{m.name}</div><span className="tag" style={{background:"#c9a96e22",color:"#c9a96e"}}>{m.role}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate});setEditMember(m);}} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>EDIT</button>
                    <button onClick={e=>{e.stopPropagation();removeMember(m.id);}} style={{background:"none",border:"none",color:"#3a3028",fontSize:18,padding:4}}>×</button>
                  </div>
                </div>
                <div style={{marginTop:14,display:"flex",gap:20}}>
                  <div><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>{m.hires.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>HIRES</div></div>
                  <div><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>₹{m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>PAYOUT</div></div>
                </div>
                {m.phone&&<div style={{marginTop:8,fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📞 {m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</div>}
              </div>
            ))}
            <div style={{border:"1px dashed #2a2420",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",minHeight:150}} onClick={()=>setShowAddMember(true)}><span style={{color:"#3a3028",fontSize:32}}>+</span></div>
          </div>
        </div>)}

        {view==="member-detail"&&selectedMember&&(()=>{
          const m=team.find(t=>t.id===selectedMember.id)||selectedMember;
          return (<div className="fade-in">
            <button className="btn-ghost" style={{marginBottom:24}} onClick={()=>setView("team")}>← Back</button>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:4}}><h1 style={{fontSize:40,fontWeight:300}}>{m.name}</h1><button className="btn-ghost" onClick={()=>{setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate});setEditMember(m);}}>Edit</button></div>
            <p style={{color:"#5a5048",fontFamily:"'DM Mono',monospace",fontSize:13,marginBottom:24}}>{m.role} · {m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</p>
            <div style={{display:"flex",gap:20,marginBottom:28}}>
              {[{v:m.hires.length,l:"Assignments"},{v:m.hires.filter(h=>h.status==="Confirmed").length,l:"Confirmed"},{v:`₹${m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}`,l:"Total Payout"}].map((s,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,padding:"16px 20px"}}><div style={{fontSize:24,fontWeight:300,color:"#c9a96e",lineHeight:1}}>{s.v}</div><div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.l}</div></div>
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
                  <div><div style={{fontSize:16,fontWeight:500}}>{h.wedding}</div><div style={{fontSize:13,color:evColor(h.event)}}>{h.event}</div><div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>{h.date} · {h.hireRole||m.role} · {h.dayType||"Full Day"} · ₹{(m.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="tag" style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24"}}>{h.status||"Pending"}</span>
                    <button onClick={()=>sendWAToMember(m,h)} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WA</button>
                    <button onClick={()=>openEditHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Edit</button>
                    <button onClick={()=>removeHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"none",color:"#3a3028",fontSize:18}}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>);
        })()}

        {view==="weddings"&&(<div className="fade-in">
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}><div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Projects</p><h1 style={{fontSize:38,fontWeight:300}}>Weddings</h1></div><button className="btn-gold" onClick={openAddWedding}>+ New Wedding</button></div>
          {weddings.map(w=>{const assigned=team.filter(m=>m.hires.some(h=>h.wedding===w.name));return(
            <div key={w.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"24px 28px",marginBottom:14,transition:"all 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{cursor:"pointer",flex:1}} onClick={()=>{setSelectedWedding(w);setView("wedding-detail");}}>
                  <h2 style={{fontSize:24,fontWeight:400,marginBottom:4}}>{w.name}</h2>
                  <p style={{color:"#7a6f63",fontSize:14}}>{w.bride} & {w.groom} · {w.location}</p>
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>{(w.eventDays||[]).map((ed,i)=><span key={i} className="tag" style={{background:evColor(ed.event)+"22",color:evColor(ed.event)}}>{ed.event}</span>)}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:16}}>
                  <div style={{textAlign:"right",marginRight:4}}><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>{assigned.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>CREW</div></div>
                  <button onClick={()=>openEditWedding(w)} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"5px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>EDIT</button>
                  <button onClick={()=>removeWedding(w.id)} style={{background:"none",border:"none",color:"#3a3028",fontSize:20}}>×</button>
                </div>
              </div>
            </div>
          );})}
          {weddings.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:60,textAlign:"center",color:"#3a3028"}}>No weddings yet</div>}
        </div>)}

        {view==="wedding-detail"&&selectedWedding&&(()=>{const w=weddings.find(x=>x.id===selectedWedding.id)||selectedWedding;return(
          <div className="fade-in">
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}><button className="btn-ghost" onClick={()=>setView("weddings")}>← Back</button><button className="btn-ghost" onClick={()=>openEditWedding(w)}>Edit</button></div>
            <h1 style={{fontSize:40,fontWeight:300,marginBottom:4}}>{w.name}</h1>
            <p style={{color:"#7a6f63",fontSize:16,marginBottom:24}}>{w.bride} & {w.groom} · {w.location}</p>
            {(w.eventDays||[]).map((ed,i)=>{const crew=team.filter(m=>m.hires.some(h=>h.wedding===w.name&&h.date===ed.date));return(
              <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:4,padding:"14px 20px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:15,fontWeight:500,color:evColor(ed.event)}}>{ed.event}</div><div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{ed.date}</div></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{crew.length===0?<span style={{fontSize:12,color:"#3a3028"}}>No crew</span>:crew.map(c=><span key={c.id} className="tag" style={{background:"#c9a96e11",color:"#c9a96e99"}}>{c.name}</span>)}</div>
              </div>
            );})}
          </div>
        );})()}

        {view==="calendar"&&(<div className="fade-in"><div style={{marginBottom:28}}><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Visual Planner</p><h1 style={{fontSize:38,fontWeight:300}}>Calendar</h1></div><BigCalendar weddings={weddings} team={team}/></div>)}
      </div>
      {renderModals()}
    </div>
  );

  /* ── Shared Modals ── */
  function renderModals(){
    const mClass = isMobile ? "overlay" : "overlay modal-desktop";
    return (<>
      {showAddWedding&&(<div className={mClass} onClick={()=>setShowAddWedding(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:22,fontWeight:400}}>{editWedding?"Edit Wedding":"New Wedding"}</h2><button onClick={()=>setShowAddWedding(false)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Wedding Name" value={wForm.name} onChange={e=>setWForm({...wForm,name:e.target.value})}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><input placeholder="Bride's Name" value={wForm.bride} onChange={e=>setWForm({...wForm,bride:e.target.value})}/><input placeholder="Groom's Name" value={wForm.groom} onChange={e=>setWForm({...wForm,groom:e.target.value})}/></div>
          <input placeholder="Location" value={wForm.location} onChange={e=>setWForm({...wForm,location:e.target.value})}/>
          <div><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Select Days</p><MiniCalendar selectedDates={wForm.selectedDates} onToggleDate={toggleWDate} bookedMap={bookedMap}/></div>
          {wForm.selectedDates.length>0&&<EventAssigner selectedDates={wForm.selectedDates} eventDays={wForm.eventDays} setEventDays={fn=>setWForm(prev=>({...prev,eventDays:typeof fn==="function"?fn(prev.eventDays):fn}))} team={team} weddingName={editWedding?.name||null}/>}
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={saveWedding}>{editWedding?"Save Changes":"Save Wedding"}</button><button className="btn-ghost" onClick={()=>setShowAddWedding(false)}>Cancel</button></div>
      </div></div>)}

      {showAddMember&&(<div className={mClass} onClick={()=>setShowAddMember(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:22,fontWeight:400}}>Add Member</h2><button onClick={()=>setShowAddMember(false)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Full Name" value={newMember.name} onChange={e=>setNewMember({...newMember,name:e.target.value})}/>
          <RoleSelect value={newMember.role} onChange={v=>setNewMember({...newMember,role:v})}/>
          <input placeholder="Phone Number" value={newMember.phone} onChange={e=>setNewMember({...newMember,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={newMember.rate} onChange={e=>setNewMember({...newMember,rate:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={addMember}>Add Member</button><button className="btn-ghost" onClick={()=>setShowAddMember(false)}>Cancel</button></div>
      </div></div>)}

      {editMember&&(<div className={mClass} onClick={()=>setEditMember(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:22,fontWeight:400}}>Edit Member</h2><button onClick={()=>setEditMember(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Full Name" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
          <RoleSelect value={editForm.role} onChange={v=>setEditForm({...editForm,role:v})}/>
          <input placeholder="Phone" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={editForm.rate} onChange={e=>setEditForm({...editForm,rate:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={saveEditMember}>Save Changes</button><button className="btn-ghost" onClick={()=>setEditMember(null)}>Cancel</button></div>
      </div></div>)}

      {showAddHire&&(()=>{const m=team.find(x=>x.id===showAddHire);const eventDays=getWeddingEventDays(hireForm.wedding);return(
        <div className={mClass} onClick={()=>setShowAddHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:400}}>Add Hire · {m?.name.split(" ")[0]}</h2><button onClick={()=>setShowAddHire(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <select value={hireForm.wedding} onChange={e=>setHireForm({...hireForm,wedding:e.target.value,selectedEventDays:[]})}><option value="">Select Wedding</option>{weddings.map(w=><option key={w.id}>{w.name}</option>)}</select>
            {hireForm.wedding&&eventDays.length>0&&(<div>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Select Days</p>
              {eventDays.map((ed,i)=>{const key=`${ed.date}|${ed.event}`;const isSel=hireForm.selectedEventDays.includes(key);return(
                <div key={i} onClick={()=>toggleEventDay(key)} style={{background:isSel?"#c9a96e11":"#0e0c0a",border:`1px solid ${isSel?"#c9a96e":"#1e1a16"}`,borderRadius:4,padding:"12px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:isSel?"#c9a96e":"#e8e0d4"}}>{ed.date}</span><span style={{fontSize:12,color:evColor(ed.event),marginLeft:10}}>{ed.event}</span></div>
                  <div style={{width:18,height:18,borderRadius:3,border:`1px solid ${isSel?"#c9a96e":"#3a3028"}`,background:isSel?"#c9a96e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0a",fontSize:12,fontWeight:"bold"}}>{isSel?"✓":""}</div>
                </div>
              );})}
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{hireForm.selectedEventDays.length} days selected</p>
            </div>)}
            <div><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Day Type</p>
              <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setHireForm({...hireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${hireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:hireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:hireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            </div>
            <select value={hireForm.hireRole} onChange={e=>setHireForm({...hireForm,hireRole:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            <div style={{display:"flex",gap:8}}>{["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setHireForm({...hireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${hireForm.status===s?STATUS_COLOR[s]:"#2a2420"}`,background:hireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:hireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}</div>
            {hireForm.selectedEventDays.length>0&&m&&<div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:4,padding:"12px 16px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>Total ({hireForm.selectedEventDays.length} days)</span><span style={{fontSize:16,color:"#c9a96e",fontWeight:300}}>₹{(m.rate*(hireForm.dayType==="Half Day"?0.5:1)*hireForm.selectedEventDays.length).toLocaleString("en-IN")}</span></div>}
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={()=>addBulkHire(showAddHire)}>Assign{hireForm.selectedEventDays.length>0?` (${hireForm.selectedEventDays.length})`:""}</button><button className="btn-ghost" onClick={()=>setShowAddHire(null)}>Cancel</button></div>
        </div></div>
      );})()}

      {editHire&&(()=>{const m=team.find(x=>x.id===editHire.memberId);const h=m?.hires[editHire.hireIdx];if(!h)return null;return(
        <div className={mClass} onClick={()=>setEditHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:400}}>Edit Hire</h2><button onClick={()=>setEditHire(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
          <p style={{color:"#c9a96e",fontSize:12,fontFamily:"'DM Mono',monospace",marginBottom:20}}>{h.wedding} · {h.event} · {h.date}</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setEditHireForm({...editHireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${editHireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:editHireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:editHireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            <select value={editHireForm.hireRole} onChange={e=>setEditHireForm({...editHireForm,hireRole:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            <div style={{display:"flex",gap:8}}>{["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setEditHireForm({...editHireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${editHireForm.status===s?STATUS_COLOR[s]:"#2a2420"}`,background:editHireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:editHireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}</div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={saveEditHire}>Save</button><button className="btn-ghost" onClick={()=>setEditHire(null)}>Cancel</button></div>
        </div></div>
      );})()}
    </>);
  }
}

/* ════════════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════════════ */
export default function Root() {
  const isTeamView = window.location.hash === "#team";
  const [session, setSession] = useState(()=>loadState("crew_session", null));
  const [teamData, setTeamData] = useState(()=>loadState("crew_team", INITIAL_TEAM));
  const [weddingsData, setWeddingsData] = useState(()=>loadState("crew_weddings", []));
  const [portalReady, setPortalReady] = useState(!isTeamView || !USE_FIREBASE);

  // For crew portal: load live data from Firebase
  useEffect(()=>{
    if(!isTeamView || !USE_FIREBASE) return;
    (async()=>{
      const [fbTeam, fbWeddings] = await Promise.all([fbGet("crew_team"), fbGet("crew_weddings")]);
      if(fbTeam) setTeamData(fbTeam);
      if(fbWeddings) setWeddingsData(Array.isArray(fbWeddings)?fbWeddings:Object.values(fbWeddings||{}));
      setPortalReady(true);
    })();
  },[]);

  if(isTeamView){
    if(!portalReady) return(
      <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>
        <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
        <div style={{width:36,height:36,border:"2px solid #2a2420",borderTopColor:"#c9a96e",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
        <p style={{fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase"}}>Loading your schedule…</p>
      </div>
    );
    return <TeamView team={teamData} weddings={weddingsData}/>;
  }

  if (!session?.loggedIn) return <AuthPage onLogin={user=>setSession(user)}/>;
  return <AdminApp user={session} onLogout={()=>{saveState("crew_session",null);setSession(null);}}/>;
}
