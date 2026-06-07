import { useState, useMemo, useEffect, useCallback, createContext, useContext } from "react";

/* ─── Firebase Auth (Google Sign-In) ────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC37gaDS-MqZS6IB4Oz_gqCfHD357id-cE",
  authDomain: "crewstudiov2.firebaseapp.com",
  databaseURL: "https://crewstudiov2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crewstudiov2",
  storageBucket: "crewstudiov2.firebasestorage.app",
  messagingSenderId: "910832492151",
  appId: "1:910832492151:web:efa4e4c310f4af6ae67072",
};
function getFirebaseAuth() {
  try {
    if (!window._fbAppInit) {
      if (!window.firebase.apps?.length) window.firebase.initializeApp(FIREBASE_CONFIG);
      window._fbAppInit = true;
    }
    return window.firebase.auth();
  } catch(e) { console.error("Firebase Auth not available:", e); return null; }
}
async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not loaded");
  const provider = new window.firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await auth.signInWithPopup(provider);
  return result.user;
}
async function signOutGoogle() {
  const auth = getFirebaseAuth();
  if (auth) await auth.signOut();
}


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

/* ─── Themes ─────────────────────────────────────────────────── */
const THEMES = {
  golden: {
    id:"golden", label:"🌑 Golden Dark", emoji:"🌑",
    bg:"#060504", bg2:"#0a0a0a", bg3:"#0e0c0a", bgCard:"#0e0c0a",
    border:"#1e1a16", border2:"#2a2420",
    text:"#e8e0d4", textMuted:"#7a6f63", textFaint:"#5a5048", textGhost:"#3a3028",
    accent:"#c9a96e", accentAlt:"#a8814a",
    accentGrad:"linear-gradient(135deg,#c9a96e,#a8814a)",
    navActive:"#c9a96e", inputBg:"#0e0c0a",
  },
  light: {
    id:"light", label:"☀️ Light", emoji:"☀️",
    bg:"#f5f0e8", bg2:"#ede8dc", bg3:"#ffffff", bgCard:"#ffffff",
    border:"#ddd5c5", border2:"#ccc0a8",
    text:"#2a1f0e", textMuted:"#7a6040", textFaint:"#a08060", textGhost:"#c0a880",
    accent:"#b07830", accentAlt:"#8a5e22",
    accentGrad:"linear-gradient(135deg,#b07830,#8a5e22)",
    navActive:"#b07830", inputBg:"#f9f5ee",
  },
  midnight: {
    id:"midnight", label:"🌊 Midnight Blue", emoji:"🌊",
    bg:"#040810", bg2:"#080f1e", bg3:"#0c1428", bgCard:"#0c1428",
    border:"#1a2540", border2:"#243050",
    text:"#d0e4ff", textMuted:"#6080a8", textFaint:"#405878", textGhost:"#2a3a58",
    accent:"#4a9eff", accentAlt:"#2e7dd9",
    accentGrad:"linear-gradient(135deg,#4a9eff,#2e7dd9)",
    navActive:"#4a9eff", inputBg:"#0c1428",
  },
  colorful: {
    id:"colorful", label:"🌈 Colorful", emoji:"🌈",
    bg:"#0d0010", bg2:"#12001a", bg3:"#1a0024", bgCard:"#1a0024",
    border:"#3a1050", border2:"#4a1a60",
    text:"#f0d8ff", textMuted:"#b070d0", textFaint:"#8040a8", textGhost:"#5a2080",
    accent:"#e040fb", accentAlt:"#aa00ff",
    accentGrad:"linear-gradient(135deg,#e040fb,#aa00ff,#2979ff)",
    navActive:"#e040fb", inputBg:"#1a0024",
  },
  rosegold: {
    id:"rosegold", label:"🌸 Rose Gold", emoji:"🌸",
    bg:"#0f0608", bg2:"#160a0c", bg3:"#1e0e12", bgCard:"#1e0e12",
    border:"#3a1820", border2:"#4a2030",
    text:"#ffe8ea", textMuted:"#c07080", textFaint:"#904858", textGhost:"#602838",
    accent:"#f4a0aa", accentAlt:"#d06070",
    accentGrad:"linear-gradient(135deg,#f4a0aa,#d06070)",
    navActive:"#f4a0aa", inputBg:"#1e0e12",
  },
};

const ThemeCtx = createContext(THEMES.golden);
function useTheme(){ return useContext(ThemeCtx); }

/* ─── Splash Screen ─────────────────────────────────────────── */
function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=fade out
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1), 1600);
    const t2=setTimeout(()=>onDone(), 2200);
    return ()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return (
    <div style={{position:"fixed",inset:0,background:"#060504",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,transition:"opacity 0.6s ease",opacity:phase===1?0:1,pointerEvents:"none"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');
        @keyframes splashLogoIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
        @keyframes splashTagIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes splashLine{from{width:0;}to{width:48px;}}
        @keyframes splashPulse{0%,100%{box-shadow:0 0 0 0 #c9a96e33;}50%{box-shadow:0 0 24px 8px #c9a96e22;}}
      `}</style>
      <div style={{animation:"splashLogoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both",animationDelay:"0.1s",display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <div style={{width:72,height:72,borderRadius:18,background:"linear-gradient(135deg,#c9a96e,#a8814a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,animation:"splashPulse 2s ease infinite",boxShadow:"0 0 0 1px #c9a96e44"}}>🎬</div>
        <div style={{textAlign:"center",animation:"splashTagIn 0.5s ease both",animationDelay:"0.5s"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,letterSpacing:"0.1em",color:"#e8e0d4"}}>CREW <span style={{color:"#c9a96e",fontFamily:"'DM Mono',monospace",fontSize:14,letterSpacing:"0.18em"}}>STUDIO</span></div>
          <div style={{width:0,height:1,background:"linear-gradient(90deg,transparent,#c9a96e,transparent)",margin:"10px auto",animation:"splashLine 0.6s ease both",animationDelay:"0.9s"}}/>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#5a5048",letterSpacing:"0.18em",textTransform:"uppercase",animation:"splashTagIn 0.5s ease both",animationDelay:"1.1s"}}>Wedding Crew Management</div>
        </div>
      </div>
    </div>
  );
}
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
  const inputStyle = {background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:14,padding:"12px 14px",borderRadius:"6px",outline:"none",width:"100%",WebkitAppearance:"none"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <select value={custom?"＋ Custom Role":(value||ROLES[0])} onChange={e=>{if(e.target.value==="＋ Custom Role"){setCustom(true);onChange("");}else{setCustom(false);onChange(e.target.value);}}} style={inputStyle}>
        {ROLES.map(r=><option key={r}>{r}</option>)}
        <option>＋ Custom Role</option>
      </select>
      {custom&&<input placeholder="Type custom role…" value={value} onChange={e=>onChange(e.target.value)} style={{...inputStyle,border:"1px solid #c9a96e55"}}/>}
    </div>
  );
}

function CrewStudioBrand({ small=false, portal=false, onHome=null }) {
  return (
    <div onClick={onHome||undefined} style={{display:"flex",alignItems:"center",gap:small?8:10,cursor:onHome?"pointer":"default"}}>
      <img src={`${process.env.PUBLIC_URL}/crewstudio-logo.svg`} alt="CrewStudio logo" style={{width:small?28:36,height:small?28:36,borderRadius:small?7:9,objectFit:"cover",boxShadow:"0 0 0 1px #c9a96e33"}}/>
      <div style={{display:"flex",alignItems:"baseline",gap:small?6:8}}>
        <span style={{fontSize:small?18:22,fontWeight:300,letterSpacing:"0.06em"}}>CREW</span>
        <span style={{fontSize:small?10:12,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.12em"}}>{portal?"PORTAL":"STUDIO"}</span>
      </div>
    </div>
  );
}

/* ─── Responsive Hook ─────────────────────────────────────── */
function useIsMobile() {
  const [isMobile,setIsMobile] = useState(window.innerWidth<768);
  useEffect(()=>{ const fn=()=>setIsMobile(window.innerWidth<768); window.addEventListener("resize",fn); return ()=>window.removeEventListener("resize",fn); },[]);
  return isMobile;
}

/* ════════════════════════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email:"", password:"" });
  const [signupForm, setSignupForm] = useState({ name:"", studioName:"", email:"", password:"", confirmPassword:"", phone:"", city:"Ahmedabad" });
  const [error, setError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    setError(""); if(!form.email||!form.password){setError("Please enter your email and password.");return;} setLoading(true);
    if(form.email.toLowerCase().trim()===FIXED_EMAIL&&form.password===FIXED_PASS){const user={name:"Krunal Prajapati",email:FIXED_EMAIL,loggedIn:true,adminId:"legacy"};saveState("crew_session",user);onLogin(user);return;}
    try {
      const admins=await fbGetAdmins(); const found=admins.find(a=>a.email.toLowerCase()===form.email.toLowerCase().trim());
      if(!found||found.password!==form.password){setError("Incorrect email or password.");setLoading(false);return;}
      const user={name:found.name,email:found.email,loggedIn:true,adminId:found.id,studioName:found.studioName};
      saveState("crew_session",user);onLogin(user);
    } catch {setError("Connection error.");setLoading(false);}
  }

  async function handleSignup() {
    setSignupError(""); const{name,studioName,email,password,confirmPassword}=signupForm;
    if(!name||!studioName||!email||!password){setSignupError("Please fill all required fields.");return;}
    if(password.length<6){setSignupError("Password must be at least 6 characters.");return;}
    if(password!==confirmPassword){setSignupError("Passwords don't match.");return;}
    if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){setSignupError("Enter a valid email address.");return;}
    setLoading(true);
    try {
      const admins=await fbGetAdmins(); const exists=admins.find(a=>a.email.toLowerCase()===email.toLowerCase());
      if(exists||email.toLowerCase()===FIXED_EMAIL){setSignupError("An account with this email already exists.");setLoading(false);return;}
      const newAdmin={id:Date.now().toString(),name:name.trim(),studioName:studioName.trim(),email:email.toLowerCase().trim(),password,phone:signupForm.phone,city:signupForm.city,createdAt:new Date().toISOString()};
      await fbSaveAdmin(newAdmin);
      await fbSet(`crew_team_${newAdmin.id}`,[]);
      await fbSet(`crew_weddings_${newAdmin.id}`,[]);
      await fbSet(`crew_profile_${newAdmin.id}`,{adminName:newAdmin.name,studioName:newAdmin.studioName,waNumber:"91"+newAdmin.phone,city:newAdmin.city});
      setSignupSuccess(true);setLoading(false);
    } catch {setSignupError("Registration failed.");setLoading(false);}
  }

  async function handleGoogleLogin() {
    setError(""); setLoading(true);
    try {
      const gUser = await signInWithGoogle();
      const email = gUser.email.toLowerCase();
      const displayName = gUser.displayName || email.split("@")[0];
      const photo = gUser.photoURL || "";
      // Check if admin exists in Firebase
      let admins = await fbGetAdmins();
      let found = admins.find(a => a.email.toLowerCase() === email);
      if (!found) {
        // Auto-register Google user
        const newAdmin = {
          id: "google_" + gUser.uid,
          name: displayName,
          studioName: displayName + "'s Studio",
          email: email,
          password: "",
          phone: "",
          city: "",
          photo: photo,
          googleUid: gUser.uid,
          createdAt: new Date().toISOString(),
        };
        await fbSaveAdmin(newAdmin);
        await fbSet(`crew_team_google_${gUser.uid}`, []);
        await fbSet(`crew_weddings_google_${gUser.uid}`, []);
        await fbSet(`crew_profile_google_${gUser.uid}`, { adminName: displayName, studioName: displayName + "'s Studio", waNumber: "", city: "" });
        found = newAdmin;
      }
      const user = { name: found.name, email: found.email, loggedIn: true, adminId: found.id, studioName: found.studioName, photo: found.photo || photo, googleUid: gUser.uid };
      saveState("crew_session", user);
      onLogin(user);
    } catch(e) {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input{background:#0e0c0a;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:14px;padding:14px 16px;border-radius:6px;outline:none;width:100%;transition:border-color 0.25s,box-shadow 0.25s;}
  input:focus{border-color:#c9a96e;box-shadow:0 0 0 3px #c9a96e18;}
  input::placeholder{color:#3a3028;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`;

  if(signupSuccess) return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      <div style={{textAlign:"center",maxWidth:400,animation:"fadeUp 0.5s ease both"}}>
        <div style={{fontSize:52,marginBottom:16}}>🎉</div>
        <h2 style={{fontSize:32,fontWeight:300,marginBottom:10}}>Account Created!</h2>
        <p style={{fontSize:15,color:"#7a6f63",marginBottom:28}}>Welcome to Crew Studio, {signupForm.name.split(" ")[0]}. Your studio <em style={{color:"#c9a96e"}}>{signupForm.studioName}</em> is ready.</p>
        <button onClick={()=>{setSignupSuccess(false);setMode("login");setForm({email:signupForm.email,password:""}); }} style={{padding:"16px 32px",background:"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Sign In Now →</button>
      </div>
    </div>
  );

  if(mode==="signup") return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",overflowY:"auto"}}>
      <style>{S}</style>
      {!isMobile&&<div style={{flex:"0 0 40%",background:"linear-gradient(160deg,#0e0b08,#060504)",borderRight:"1px solid #1a1612",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 56px"}}>
        <div style={{marginBottom:24}}><CrewStudioBrand/></div>
        <h2 style={{fontSize:36,fontWeight:300,marginBottom:12,lineHeight:1.2}}>Wedding Crew<br/>Management</h2>
        <p style={{fontSize:15,color:"#5a5048",lineHeight:1.7}}>Manage your team, assign bookings, send WhatsApp confirmations — all in one place.</p>
      </div>}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 32px"}}>
        <div style={{width:"100%",maxWidth:440,animation:"fadeUp 0.5s ease both"}}>
          <h2 style={{fontSize:30,fontWeight:300,marginBottom:6}}>Create Account</h2>
          <p style={{fontSize:13,color:"#5a5048",marginBottom:28}}>Join Crew Studio — free forever.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input placeholder="Your Full Name *" value={signupForm.name} onChange={e=>setSignupForm({...signupForm,name:e.target.value})}/>
            <input placeholder="Studio Name *" value={signupForm.studioName} onChange={e=>setSignupForm({...signupForm,studioName:e.target.value})}/>
            <input placeholder="Email Address *" type="email" value={signupForm.email} onChange={e=>setSignupForm({...signupForm,email:e.target.value})}/>
            <input placeholder="Phone Number" value={signupForm.phone} onChange={e=>setSignupForm({...signupForm,phone:e.target.value})}/>
            <input placeholder="City" value={signupForm.city} onChange={e=>setSignupForm({...signupForm,city:e.target.value})}/>
            <input placeholder="Password (min 6 chars) *" type={showPass?"text":"password"} value={signupForm.password} onChange={e=>setSignupForm({...signupForm,password:e.target.value})}/>
            <input placeholder="Confirm Password *" type="password" value={signupForm.confirmPassword} onChange={e=>setSignupForm({...signupForm,confirmPassword:e.target.value})}/>
          </div>
          {signupError&&<div style={{marginTop:12,background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>⚠ {signupError}</div>}
          <button onClick={handleSignup} disabled={loading} style={{width:"100%",marginTop:20,padding:"16px",background:loading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
            {loading?"Creating…":"Create Account →"}
          </button>
          <div style={{margin:"16px 0",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,height:1,background:"#1e1a16"}}/>
            <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3a3028",letterSpacing:"0.1em"}}>OR</span>
            <div style={{flex:1,height:1,background:"#1e1a16"}}/>
          </div>
          <button onClick={handleGoogleLogin} disabled={loading} style={{width:"100%",padding:"14px 16px",background:"#ffffff",color:"#1f1f1f",border:"1px solid #ddd",borderRadius:8,fontSize:15,fontWeight:500,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Continue with Google
          </button>
          <div style={{marginTop:16,textAlign:"center"}}>
            <button onClick={()=>{setMode("login");setSignupError("");}} style={{background:"none",border:"none",color:"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Already have account? <span style={{color:"#c9a96e"}}>Sign in →</span></button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      {!isMobile&&<div style={{flex:"0 0 45%",background:"linear-gradient(160deg,#0e0b08,#060504)",borderRight:"1px solid #1a1612",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 56px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 30% 70%, #c9a96e08 0%, transparent 50%)",pointerEvents:"none"}}/>
        <div style={{marginBottom:24}}><CrewStudioBrand/></div>
        <h2 style={{fontSize:38,fontWeight:300,marginBottom:16,lineHeight:1.2}}>Your Wedding Crew,<br/>Organized.</h2>
        <p style={{fontSize:15,color:"#5a5048",lineHeight:1.7}}>Assign photographers, videographers & editors to events. Track bookings, send WhatsApp messages, and manage payouts — all in one elegant platform.</p>
        <div style={{marginTop:40,padding:"16px 0",borderTop:"1px solid #1a1612"}}>
          <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</p>
        </div>
      </div>}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:isMobile?"24px":"48px 56px"}}>
        <div style={{width:"100%",maxWidth:400,animation:"fadeUp 0.5s ease both"}}>
          <div style={{marginBottom:32}}>
            {isMobile&&<div style={{marginBottom:20}}><CrewStudioBrand small/></div>}
            <h2 style={{fontSize:30,fontWeight:300,marginBottom:4}}>Sign In</h2>
            <p style={{fontSize:13,color:"#5a5048"}}>Welcome back to your studio</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <input placeholder="Email address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div style={{position:"relative"}}>
              <input placeholder="Password" type={showPass?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{paddingRight:48}}/>
              <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a5048",fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>{showPass?"🙈":"👁"}</button>
            </div>
          </div>
          {error&&<div style={{marginTop:12,background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>⚠ {error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{width:"100%",marginTop:20,padding:"16px",background:loading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading?<><div style={{width:18,height:18,border:"2px solid #0a0a0a44",borderTopColor:"#0a0a0a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>:"Sign In →"}
          </button>
          <div style={{margin:"20px 0",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,height:1,background:"#1e1a16"}}/>
            <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3a3028",letterSpacing:"0.1em"}}>OR</span>
            <div style={{flex:1,height:1,background:"#1e1a16"}}/>
          </div>
          <button onClick={handleGoogleLogin} disabled={loading} style={{width:"100%",padding:"14px 16px",background:"#ffffff",color:"#1f1f1f",border:"1px solid #ddd",borderRadius:8,fontSize:15,fontWeight:500,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:12,letterSpacing:"0.02em"}}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Continue with Google
          </button>
          <div style={{marginTop:16,textAlign:"center"}}>
            <button onClick={()=>{setMode("signup");setError("");}} style={{background:"none",border:"none",color:"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>New to Crew Studio? <span style={{color:"#c9a96e"}}>Create account →</span></button>
          </div>
          <div style={{marginTop:32,paddingTop:24,borderTop:"1px solid #1a1612",textAlign:"center"}}>
            <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.08em"}}>SECURED · DATA STAYS IN YOUR BROWSER</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini Calendar ─────────────────────────────────────────── */
function MiniCalendar({ selectedDates, onToggleDate, bookedMap }) {
  const today=new Date(); const [y,setY]=useState(today.getFullYear()); const [m,setM]=useState(today.getMonth());
  const firstDay=new Date(y,m,1).getDay(); const dim=new Date(y,m+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const ds=d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  return (
    <div style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:6,padding:12,userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>m===0?(setM(11),setY(y=>y-1)):setM(m=>m-1)} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 10px"}}>‹</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#e8e0d4"}}>{MONTH_NAMES[m]} {y}</span>
        <button onClick={()=>m===11?(setM(0),setY(y=>y+1)):setM(m=>m+1)} style={{background:"none",border:"none",color:"#c9a96e",fontSize:18,padding:"2px 10px"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {DAY_NAMES.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",padding:"2px 0"}}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=ds(d); const isSel=selectedDates.includes(dateStr); const booked=bookedMap?.[dateStr]||[];
          return (
            <div key={i} onClick={()=>onToggleDate(dateStr)} style={{textAlign:"center",padding:"6px 2px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",background:isSel?"#c9a96e":"transparent",color:isSel?"#0a0a0a":"#e8e0d4",transition:"all 0.15s"}}>
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

/* ─── Event Assigner with Time, Crew Slots, Location & Multi-Event (Features 1, 8, 9) ── */
function EventAssigner({ selectedDates, eventDays, setEventDays, team, weddingName, eventType, onQuickHire }) {
  const [openDate,setOpenDate]=useState(null);
  const [customInputKey,setCustomInputKey]=useState(null);
  const [customText,setCustomText]=useState("");
  const [quickHireKey,setQuickHireKey]=useState(null); // "date|event" key for inline hire
  const [quickHireForm,setQuickHireForm]=useState({memberId:"",dayType:"Full Day",hireRole:ROLES[0],status:"Pending"});
  const [quickHireDone,setQuickHireDone]=useState({}); // tracks confirmed hires per key

  const typeObj = EVENT_TYPES.find(et=>et.id===(eventType||"wedding"));
  const QUICK_EVENTS = typeObj?.subEvents?.length>0 ? typeObj.subEvents : ["Mehndi","Sangeet","Haldi","Wedding Ceremony","Reception","Pre-Wedding Shoot","Engagement","Tilak","Ring Ceremony","Garba Night","Cocktail Party","Baby Shower","Birthday","Corporate Event"];

  // Get all events for a given date
  function eventsForDate(date){ return eventDays.filter(ed=>ed.date===date); }

  function addEvent(date, event) {
    if(!event) return;
    setEventDays(prev=>{
      // Allow multiple events per date — each date+event combo is unique
      const exists=prev.find(ed=>ed.date===date&&ed.event===event);
      if(exists) return prev;
      return [...prev,{date,event,startTime:"",endTime:"",crewSlots:[],location:"",side:"both"}].sort((a,b)=>a.date.localeCompare(b.date)||a.event.localeCompare(b.event));
    });
    setCustomInputKey(null);setCustomText("");
  }

  function removeEvent(date, event) {
    setEventDays(prev=>prev.filter(ed=>!(ed.date===date&&ed.event===event)));
  }

  function updateEventField(date, event, field, value) {
    setEventDays(prev=>prev.map(ed=>ed.date===date&&ed.event===event?{...ed,[field]:value}:ed));
  }

  function addCrewSlot(date, event) {
    setEventDays(prev=>prev.map(ed=>ed.date===date&&ed.event===event?{...ed,crewSlots:[...(ed.crewSlots||[]),{id:Date.now(),role:"photographer",assignedMemberId:null}]}:ed));
  }
  function removeCrewSlot(date, event, slotId) {
    setEventDays(prev=>prev.map(ed=>ed.date===date&&ed.event===event?{...ed,crewSlots:(ed.crewSlots||[]).filter(s=>s.id!==slotId)}:ed));
  }
  function updateCrewSlot(date, event, slotId, field, value) {
    setEventDays(prev=>prev.map(ed=>ed.date===date&&ed.event===event?{...ed,crewSlots:(ed.crewSlots||[]).map(s=>s.id===slotId?{...s,[field]:value}:s)}:ed));
  }

  return (
    <div>
      <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Assign Events to Each Day</p>
      {selectedDates.map(date=>{
        const dayEvents=eventsForDate(date);
        const isOpen=openDate===date;
        return (
          <div key={date} style={{background:"#0e0c0a",border:"1px solid #2a2420",borderRadius:6,marginBottom:8,overflow:"hidden"}}>
            {/* Date header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#c9a96e"}}>{date}</span>
                {dayEvents.map(ed=>(
                  <span key={ed.event} style={{fontSize:10,fontFamily:"'DM Mono',monospace",background:evColor(ed.event)+"22",color:evColor(ed.event),border:`1px solid ${evColor(ed.event)}44`,padding:"2px 8px",borderRadius:2,display:"inline-flex",alignItems:"center",gap:4}}>
                    {ed.side==="bride"?"👰":(ed.side==="groom"?"🤵":"")} {ed.event}
                    {ed.location&&<span style={{color:"#60a5fa",fontSize:9}}>📍</span>}
                  </span>
                ))}
                {dayEvents.length>0&&<span style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{dayEvents.length} event{dayEvents.length>1?"s":""}</span>}
              </div>
              <button onClick={()=>setOpenDate(isOpen?null:date)} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"5px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>{isOpen?"Done ✓":`${dayEvents.length?"Edit":"Add"} Event +`}</button>
            </div>

            {isOpen&&(
              <div style={{borderTop:"1px solid #1e1a16",background:"#080806",padding:"14px"}}>
                {/* Existing events for this date */}
                {dayEvents.length>0&&<div style={{marginBottom:14}}>
                  <p style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#3a3028",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Events on {date}</p>
                  {dayEvents.map(ed=>{
                    const slots=ed.crewSlots||[];
                    const filledSlots=slots.filter(s=>s.assignedMemberId).length;
                    const qKey=`${date}|${ed.event}`;
                    return (
                      <div key={ed.event} style={{background:"#0e0c0a",border:`1px solid ${evColor(ed.event)}44`,borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:5,padding:"12px",marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                          <span style={{fontSize:13,color:evColor(ed.event),fontFamily:"'DM Mono',monospace"}}>{ed.event}</span>
                          <button onClick={()=>removeEvent(date,ed.event)} style={{background:"none",border:"none",color:"#f87171",fontSize:16,padding:"0 4px",cursor:"pointer"}}>×</button>
                        </div>

                        {/* Location per event */}
                        <div style={{marginBottom:8}}>
                          <label style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace",display:"block",marginBottom:4,textTransform:"uppercase"}}>📍 Venue / Location</label>
                          <input placeholder="e.g. Rajmahal Banquet Hall, Ahmedabad" value={ed.location||""} onChange={e=>updateEventField(date,ed.event,"location",e.target.value)} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"8px 10px",borderRadius:4,outline:"none",width:"100%"}}/>
                        </div>

                        {/* Bride / Groom / Both side */}
                        <div style={{marginBottom:8}}>
                          <label style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace",display:"block",marginBottom:6,textTransform:"uppercase"}}>Coverage Side</label>
                          <div style={{display:"flex",gap:6}}>
                            {[{v:"both",l:"👥 Both",c:"#c9a96e"},{v:"bride",l:"👰 Bride",c:"#f472b6"},{v:"groom",l:"🤵 Groom",c:"#60a5fa"}].map(({v,l,c})=>(
                              <button key={v} onClick={()=>updateEventField(date,ed.event,"side",v)} style={{flex:1,padding:"6px",borderRadius:3,border:`1px solid ${ed.side===v?c:"#2a2420"}`,background:ed.side===v?c+"22":"#0a0a0a",color:ed.side===v?c:"#5a5048",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{l}</button>
                            ))}
                          </div>
                        </div>

                        {/* Time */}
                        <div style={{display:"flex",gap:8,marginBottom:8}}>
                          <div style={{flex:1}}>
                            <label style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace",display:"block",marginBottom:4,textTransform:"uppercase"}}>Start</label>
                            <input type="time" value={ed.startTime||""} onChange={e=>updateEventField(date,ed.event,"startTime",e.target.value)} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"6px 8px",borderRadius:3,outline:"none",width:"100%"}}/>
                          </div>
                          <div style={{flex:1}}>
                            <label style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace",display:"block",marginBottom:4,textTransform:"uppercase"}}>End</label>
                            <input type="time" value={ed.endTime||""} onChange={e=>updateEventField(date,ed.event,"endTime",e.target.value)} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"6px 8px",borderRadius:3,outline:"none",width:"100%"}}/>
                          </div>
                        </div>

                        {/* Crew Slots */}
                        <div style={{marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                            <p style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#3a3028",textTransform:"uppercase",letterSpacing:"0.1em"}}>Crew Slots ({filledSlots}/{slots.length})</p>
                            <button onClick={()=>addCrewSlot(date,ed.event)} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",fontSize:10,padding:"3px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>+ Slot</button>
                          </div>
                          {slots.map((slot,si)=>{
                            const roleInfo=CREW_SLOT_ROLES.find(r=>r.id===slot.role)||CREW_SLOT_ROLES[0];
                            const assignedMember=team.find(m=>m.id===slot.assignedMemberId);
                            return (
                              <div key={slot.id} style={{background:"#0a0a0a",border:`1px solid ${slot.assignedMemberId?"#c9a96e33":"#1e1a16"}`,borderRadius:4,padding:"8px 10px",marginBottom:5,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                <span style={{fontSize:14}}>{roleInfo.emoji}</span>
                                <select value={slot.role} onChange={e=>updateCrewSlot(date,ed.event,slot.id,"role",e.target.value)} style={{background:"#111",border:"1px solid #2a2420",color:roleInfo.color,fontFamily:"'DM Mono',monospace",fontSize:11,padding:"4px 6px",borderRadius:3,outline:"none",flex:1}}>
                                  {CREW_SLOT_ROLES.map(r=><option key={r.id} value={r.id}>{r.emoji} {r.label}</option>)}
                                </select>
                                <select value={slot.assignedMemberId||""} onChange={e=>updateCrewSlot(date,ed.event,slot.id,"assignedMemberId",e.target.value?Number(e.target.value):null)} style={{background:"#111",border:"1px solid #2a2420",color:slot.assignedMemberId?"#c9a96e":"#5a5048",fontFamily:"'DM Mono',monospace",fontSize:11,padding:"4px 6px",borderRadius:3,outline:"none",flex:1}}>
                                  <option value="">— Unassigned —</option>
                                  {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <button onClick={()=>removeCrewSlot(date,ed.event,slot.id)} style={{background:"none",border:"none",color:"#3a3028",fontSize:16,padding:"2px 4px",cursor:"pointer"}}>×</button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick Hire directly from event */}
                        {quickHireKey===qKey?(
                          <div style={{background:"#c9a96e11",border:"1px solid #c9a96e33",borderRadius:4,padding:"10px"}}>
                            <p style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",marginBottom:8}}>Quick Hire for {ed.event}</p>
                            <select value={quickHireForm.memberId} onChange={e=>setQuickHireForm(f=>({...f,memberId:e.target.value}))} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"7px",borderRadius:3,outline:"none",width:"100%",marginBottom:6}}>
                              <option value="">Select Team Member</option>
                              {team.map(m=><option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                            </select>
                            <div style={{display:"flex",gap:6,marginBottom:6}}>
                              {["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setQuickHireForm(f=>({...f,dayType:dt}))} style={{flex:1,padding:"6px",borderRadius:3,border:`1px solid ${quickHireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:quickHireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:quickHireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{dt}</button>)}
                            </div>
                            <select value={quickHireForm.hireRole} onChange={e=>setQuickHireForm(f=>({...f,hireRole:e.target.value}))} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"7px",borderRadius:3,outline:"none",width:"100%",marginBottom:8}}>
                              {ROLES.map(r=><option key={r}>{r}</option>)}
                            </select>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>{
                                if(!quickHireForm.memberId)return;
                                if(onQuickHire){
                                  onQuickHire({
                                    memberId:Number(quickHireForm.memberId),
                                    event:ed.event,
                                    date,
                                    dayType:quickHireForm.dayType,
                                    hireRole:quickHireForm.hireRole,
                                    status:"Pending",
                                    startTime:ed.startTime||"",
                                    endTime:ed.endTime||"",
                                  });
                                }
                                setQuickHireDone(prev=>({...prev,[qKey]:(prev[qKey]||0)+1}));
                                setQuickHireKey(null);
                              }} style={{flex:1,background:"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",padding:"8px",borderRadius:3,fontSize:12,fontWeight:600,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Hire ✓</button>
                              <button onClick={()=>setQuickHireKey(null)} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",padding:"8px 12px",borderRadius:3,cursor:"pointer"}}>Cancel</button>
                            </div>
                          </div>
                        ):(
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            {quickHireDone[qKey]>0&&<span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#4ade80",background:"#4ade8011",border:"1px solid #4ade8022",padding:"2px 8px",borderRadius:2}}>✓ {quickHireDone[qKey]} hired</span>}
                            <button onClick={()=>{setQuickHireKey(qKey);setQuickHireForm({memberId:"",dayType:"Full Day",hireRole:ROLES[0],status:"Pending"});}} style={{background:"#1a1612",border:"1px dashed #c9a96e44",color:"#c9a96e88",fontSize:11,padding:"6px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>⚡ Quick Hire</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>}

                {/* Add new event for this date */}
                <p style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#3a3028",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Add Event to {date}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {QUICK_EVENTS.filter(ev=>!dayEvents.find(ed=>ed.event===ev)).map(ev=>(
                    <button key={ev} onClick={()=>addEvent(date,ev)} style={{background:evColor(ev)+"18",border:`1px solid ${evColor(ev)}44`,color:evColor(ev),fontSize:11,padding:"6px 12px",borderRadius:3,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{ev}</button>
                  ))}
                </div>
                {customInputKey===date
                  ?<div style={{display:"flex",gap:8,marginBottom:8}}>
                    <input autoFocus placeholder="e.g. Farewell Pooja…" value={customText} onChange={e=>setCustomText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&customText.trim()&&addEvent(date,customText.trim())} style={{flex:1,background:"#111",border:"1px solid #c9a96e55",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:13,padding:"9px 12px",borderRadius:4,outline:"none"}}/>
                    <button onClick={()=>customText.trim()&&addEvent(date,customText.trim())} style={{background:"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",padding:"9px 16px",borderRadius:4,fontSize:13,fontWeight:600,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Add</button>
                    <button onClick={()=>{setCustomInputKey(null);setCustomText("");}} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",padding:"9px 12px",borderRadius:4,cursor:"pointer"}}>✕</button>
                  </div>
                  :<button onClick={()=>setCustomInputKey(date)} style={{background:"#1a1612",border:"1px dashed #3a3028",color:"#5a5048",fontSize:11,padding:"8px 14px",borderRadius:3,fontFamily:"'DM Mono',monospace",width:"100%",textAlign:"left",cursor:"pointer"}}>＋ Type custom event name…</button>
                }
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Big Calendar (Desktop) ─────────────────────────────────── */
function BigCalendar({ weddings, team, onEventClick }) {
  const today=new Date(); const [y,setY]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const dayMap=useMemo(()=>{const map={};weddings.forEach(w=>(w.eventDays||[]).forEach(ed=>{if(!map[ed.date])map[ed.date]=[];const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,w,ed.date)));map[ed.date].push({weddingName:w.name,event:ed.event,crew,wedding:w,ed});}));return map;},[weddings,team]);
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
            <div key={i} style={{minHeight:80,background:entries.length?"#0e0c0a":"#080806",border:`1px solid ${entries.length?"#2a2420":"#111"}`,borderRadius:5,padding:"6px",cursor:entries.length?"pointer":"default"}} onClick={()=>entries.length&&onEventClick&&onEventClick(entries[0].wedding)}>
              <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:isToday?"#c9a96e":entries.length?"#e8e0d4":"#2a2420",marginBottom:3}}>{d}</div>
              {entries.map((e,ei)=>(
                <div key={ei} style={{background:evColor(e.event)+"22",borderLeft:`2px solid ${evColor(e.event)}`,borderRadius:2,padding:"2px 4px",marginBottom:2}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:evColor(e.event),textTransform:"uppercase"}}>{e.event}</div>
                  <div style={{fontSize:9,color:"#7a6f63",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.weddingName}</div>
                  {e.ed.startTime&&<div style={{fontSize:8,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>⏰ {e.ed.startTime}</div>}
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
      if(ey===y&&em===mo+1){const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,w,ed.date)));list.push({...ed,weddingName:w.name,crew,wedding:w});}
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
                <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048",marginTop:4}}>{e.date}{e.startTime&&` · ⏰ ${e.startTime}`}{e.endTime&&`–${e.endTime}`}</div>
                {/* FEATURE 3: clickable Google Maps location */}
                {e.wedding?.location&&(
                  <div style={{marginTop:4}}>
                    {e.wedding?.googleMapsLink
                      ?<a href={e.wedding.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#60a5fa",fontFamily:"'DM Mono',monospace",textDecoration:"none"}} onClick={ev=>ev.stopPropagation()}>📍 {e.wedding.location} ↗</a>
                      :<span style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📍 {e.wedding.location}</span>
                    }
                  </div>
                )}
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

/* ─── Team Portal Calendar ───────────────────────────────────── */
function TeamCalendar({ myHires, weddings, team, myName }) {
  const today=new Date(); const [y,setY]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const [selected,setSelected]=useState(null);
  const monthEvents=useMemo(()=>{
    const list=[];
    weddings.forEach(w=>(w.eventDays||[]).forEach(ed=>{
      const [ey,em]=ed.date.split("-").map(Number);
      if(ey===y&&em===mo+1){const myHire=myHires.find(h=>hireMatchesEvent(h,w,ed.date,ed.event));const allCrew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,w,ed.date,ed.event)));list.push({date:ed.date,event:ed.event,startTime:ed.startTime,endTime:ed.endTime,weddingName:w.name,wedding:w,myHire,allCrew,eventLocation:ed.location,side:ed.side});}
    }));
    return list.sort((a,b)=>a.date.localeCompare(b.date));
  },[weddings,team,myHires,y,mo]);
  const dayMap=useMemo(()=>{const m={};monthEvents.forEach(e=>{if(!m[e.date])m[e.date]=[];m[e.date].push(e);});return m;},[monthEvents]);
  const firstDay=new Date(y,mo,1).getDay(); const dim=new Date(y,mo+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const ds=d=>`${y}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const todayStr=today.toISOString().slice(0,10);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={()=>mo===0?(setMo(11),setY(y=>y-1)):setMo(m=>m-1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:18,padding:"6px 14px",borderRadius:4,cursor:"pointer"}}>‹</button>
        <h2 style={{fontSize:20,fontWeight:300,fontFamily:"'Cormorant Garamond',serif"}}>{MONTH_NAMES[mo]} {y}</h2>
        <button onClick={()=>mo===11?(setMo(0),setY(y=>y+1)):setMo(m=>m+1)} style={{background:"none",border:"1px solid #2a2420",color:"#c9a96e",fontSize:18,padding:"6px 14px",borderRadius:4,cursor:"pointer"}}>›</button>
      </div>
      <div style={{background:"#0a0a0a",border:"1px solid #1e1a16",borderRadius:8,overflow:"hidden",marginBottom:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid #1e1a16"}}>
          {DAY_NAMES.map((d,i)=><div key={i} style={{textAlign:"center",padding:"8px 4px",fontSize:10,fontFamily:"'DM Mono',monospace",color:"#3a3028",letterSpacing:"0.1em"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {cells.map((d,i)=>{
            if(!d) return <div key={i} style={{minHeight:56,borderRight:"1px solid #111",borderBottom:"1px solid #111"}}/>;
            const dateStr=ds(d); const entries=dayMap[dateStr]||[]; const isToday=dateStr===todayStr;
            const hasMyHire=entries.some(e=>e.myHire); const isSelected=selected===dateStr;
            return (
              <div key={i} onClick={()=>entries.length>0?setSelected(isSelected?null:dateStr):null}
                style={{minHeight:56,borderRight:"1px solid #111",borderBottom:"1px solid #111",padding:"4px 3px",cursor:entries.length?"pointer":"default",background:isSelected?"#c9a96e11":"transparent"}}>
                <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:isToday?"#c9a96e":hasMyHire?"#e8e0d4":entries.length?"#7a6f63":"#2a2420",fontWeight:isToday||hasMyHire?"600":"400",marginBottom:2}}>{d}</div>
                {entries.slice(0,2).map((e,ei)=>(
                  <div key={ei} style={{background:e.myHire?"#c9a96e33":evColor(e.event)+"18",borderLeft:`2px solid ${e.myHire?"#c9a96e":evColor(e.event)}`,borderRadius:2,padding:"1px 3px",marginBottom:1,overflow:"hidden"}}>
                    <div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:e.myHire?"#c9a96e":evColor(e.event),textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}>{e.event}</div>
                  </div>
                ))}
                {entries.length>2&&<div style={{fontSize:8,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>+{entries.length-2}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {selected&&dayMap[selected]&&(
        <div style={{marginBottom:16}}>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>{selected}</p>
          {dayMap[selected].map((e,i)=><TeamEventCard key={i} e={e} myName={myName}/>)}
        </div>
      )}
      {monthEvents.length===0
        ?<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:32,textAlign:"center",color:"#3a3028",fontSize:14}}>No events this month</div>
        :<div>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>All Events This Month</p>
          {monthEvents.map((e,i)=><TeamEventCard key={i} e={e} myName={myName}/>)}
        </div>
      }
    </div>
  );
}

function TeamEventCard({ e, myName }) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{background:"#0e0c0a",border:`1px solid ${e.myHire?"#c9a96e44":"#1e1a16"}`,borderLeft:`3px solid ${e.myHire?"#c9a96e":evColor(e.event)}`,borderRadius:8,padding:"14px 16px",marginBottom:10,cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontSize:16,fontWeight:500}}>{e.weddingName}</span>
            {e.myHire&&<span style={{background:"#c9a96e22",color:"#c9a96e",border:"1px solid #c9a96e44",fontSize:9,fontFamily:"'DM Mono',monospace",padding:"2px 8px",borderRadius:2,textTransform:"uppercase"}}>My Booking</span>}
          </div>
          <div style={{fontSize:13,color:evColor(e.event),marginBottom:2}}>{e.event}</div>
          <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>📅 {e.date}{e.startTime&&` · ⏰ ${e.startTime}`}{e.endTime&&`–${e.endTime}`}</div>
          {/* FEATURE 3: Google Maps link in portal */}
          {e.wedding?.location&&(
            <div style={{marginTop:3}}>
              {e.wedding?.googleMapsLink
                ?<a href={e.wedding.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#60a5fa",fontFamily:"'DM Mono',monospace",textDecoration:"none"}} onClick={ev=>ev.stopPropagation()}>📍 {e.wedding.location} ↗ Open Maps</a>
                :<span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>📍 {e.wedding.location}</span>
              }
            </div>
          )}
          {/* Per-event location */}
          {e.eventLocation&&<div style={{marginTop:2,fontSize:11,color:"#60a5fa",fontFamily:"'DM Mono',monospace"}}>📍 {e.eventLocation}</div>}
          {e.side&&e.side!=="both"&&<div style={{marginTop:2,fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{e.side==="bride"?"👰 Bride Side":"🤵 Groom Side"}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          {e.myHire&&<span style={{background:(STATUS_COLOR[e.myHire.status]||"#fbbf24")+"22",color:STATUS_COLOR[e.myHire.status]||"#fbbf24",border:`1px solid ${STATUS_COLOR[e.myHire.status]||"#fbbf24"}44`,padding:"3px 10px",borderRadius:2,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{e.myHire.status||"Pending"}</span>}
          <span style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{e.allCrew.length} crew {open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1e1a16"}}>
          {(e.wedding?.bride||e.wedding?.groom)&&<div style={{marginBottom:10}}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Client</p><p style={{fontSize:13,color:"#e8e0d4"}}>{[e.wedding?.bride,e.wedding?.groom].filter(Boolean).join(" & ")}</p></div>}
          {e.myHire&&<div style={{background:"#c9a96e11",border:"1px solid #c9a96e33",borderRadius:6,padding:"10px 12px",marginBottom:10}}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>My Assignment</p><p style={{fontSize:13,color:"#e8e0d4"}}>🎭 {e.myHire.hireRole} · ⏱ {e.myHire.dayType}</p></div>}

          {/* FEATURE 6: Admin studio name shown prominently in portal */}
          {e.wedding?.adminStudio&&<div style={{background:"#1a1612",border:"1px solid #2a2420",borderRadius:6,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            {e.wedding.adminLogo?<img src={e.wedding.adminLogo} alt="studio" style={{width:24,height:24,borderRadius:"50%",objectFit:"cover"}}/>:<span style={{fontSize:14}}>🎬</span>}
            <span style={{fontSize:13,fontWeight:600,color:"#c9a96e",letterSpacing:"0.05em"}}>{e.wedding.adminStudio}</span>
          </div>}

          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Full Crew ({e.allCrew.length})</p>
          {e.allCrew.length===0?<p style={{fontSize:12,color:"#3a3028"}}>No crew assigned yet</p>
          :e.allCrew.map(member=>{
            const memberHire=member.hires.find(h=>hireMatchesEvent(h,e.wedding,e.date,e.event)); const isMe=member.name===myName;
            return (
              <div key={member.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:isMe?"#c9a96e11":"#0a0a0a",border:`1px solid ${isMe?"#c9a96e33":"#1e1a16"}`,borderRadius:5,marginBottom:5}}>
                <div><span style={{fontSize:13,color:isMe?"#c9a96e":"#e8e0d4"}}>{member.name}{isMe?" (you)":""}</span><span style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginLeft:8}}>{memberHire?.hireRole||member.role}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {member.phone&&<a href={`tel:${member.phone}`} style={{background:"#1e1a16",border:"1px solid #2a2420",color:"#7a6f63",fontSize:10,padding:"3px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>📞 {member.phone}</a>}
                  {memberHire&&<span style={{background:(STATUS_COLOR[memberHire.status]||"#fbbf24")+"22",color:STATUS_COLOR[memberHire.status]||"#fbbf24",fontSize:9,padding:"2px 7px",borderRadius:2,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{memberHire.status||"Pending"}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TEAM VIEW (Crew Portal) — Feature 2: One-tap confirm
════════════════════════════════════════════════════════════════ */
function TeamView({ team, weddings, adminProfile, onConfirmHire }) {
  const isMobile=useIsMobile();
  const [session,setSession]=useState(()=>{try{const s=sessionStorage.getItem("crew_portal_session");return s?JSON.parse(s):null;}catch{return null;}});
  const [step,setStep]=useState("pick");
  const [pickedName,setPickedName]=useState("");
  const [passInput,setPassInput]=useState("");
  const [passError,setPassError]=useState("");
  const [passLoading,setPassLoading]=useState(false);
  const [showPass,setShowPass]=useState(false);
  const [portalTab,setPortalTab]=useState("schedule");
  // FEATURE 2: confirmLoading state for instant confirm
  const [confirmingId,setConfirmingId]=useState(null);
  const [confirmDone,setConfirmDone]=useState({});

  const me=team.find(m=>m.id===session?.memberId);
  if(session&&!me){sessionStorage.removeItem("crew_portal_session");setSession(null);}

  function pickMember(name){setPickedName(name);setStep("pass");setPassInput("");setPassError("");}
  function attemptLogin(){
    setPassLoading(true);setPassError("");
    setTimeout(()=>{
      const found=team.find(m=>m.name===pickedName);
      if(!found){setPassError("Member not found.");setPassLoading(false);return;}
      const correctPass=found.portalPass||"";
      if(!correctPass){setPassError("No password set yet. Ask admin to set your password.");setPassLoading(false);return;}
      if(passInput!==correctPass){setPassError("Wrong password. Try again.");setPassLoading(false);return;}
      const s={memberId:found.id,name:found.name};
      sessionStorage.setItem("crew_portal_session",JSON.stringify(s));
      setSession(s); setPassLoading(false);
    },600);
  }
  function logout(){sessionStorage.removeItem("crew_portal_session");setSession(null);setStep("pick");setPickedName("");setPassInput("");}

  // FEATURE 2: Direct confirm — sends WA to admin and marks as confirmed instantly
  async function handleDirectConfirm(hire, memberName) {
    const key=`${hire.weddingId||hire.wedding}|${hire.date}|${hire.event}|${hire.slotId||""}`;
    setConfirmingId(key);
    // Send WA
    sendWA(hire,"CONFIRM",memberName);
    if(onConfirmHire&&me) await onConfirmHire(me.id,hire);
    // Wait a moment then mark done visually
    setTimeout(()=>{
      setConfirmDone(prev=>({...prev,[key]:true}));
      setConfirmingId(null);
    },1200);
  }

  function sendWA(hire,action,memberName){
    const isConfirm=action==="CONFIRM";
    const template=isConfirm?(adminProfile?.msgConfirm||""):(adminProfile?.msgDecline||"");
    const msg=template
      ?template.replace(/{name}/g,memberName).replace(/{adminName}/g,adminProfile?.adminName||"Admin").replace(/{date}/g,hire.date).replace(/{wedding}/g,hire.wedding).replace(/{event}/g,hire.event).replace(/{role}/g,hire.hireRole).replace(/{dayType}/g,hire.dayType)
      :`Hi ${adminProfile?.adminName||"Krunal"}! This is ${memberName}. I want to *${action}* my booking:\n\n📅 *${hire.date}*\n💍 *${hire.wedding}*\n🎬 *${hire.event}*\n🎭 Role: *${hire.hireRole}*\n⏱ ${hire.dayType}`;
    const waNum=(adminProfile?.waNumber||ADMIN_WA).replace(/[^0-9]/g,"");
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input{background:#111;border:1px solid #2a2420;color:#e8e0d4;font-family:'DM Mono',monospace;font-size:16px;padding:14px 16px;border-radius:6px;outline:none;width:100%;transition:border-color 0.2s;}
  input:focus{border-color:#c9a96e;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.6;}}`;

  if(!session&&step==="pick") return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp 0.5s ease both"}}>
        {/* FEATURE 6: Admin studio name/logo shown at top of portal */}
        {(adminProfile?.studioName||adminProfile?.adminName)&&(
          <div style={{textAlign:"center",marginBottom:24,padding:"14px 20px",background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:8}}>
            {adminProfile?.studioLogo&&<img src={adminProfile.studioLogo} alt="logo" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",marginBottom:8,display:"block",margin:"0 auto 8px"}}/>}
            <div style={{fontSize:20,fontWeight:600,color:"#c9a96e",letterSpacing:"0.06em"}}>{adminProfile?.studioName||adminProfile?.adminName}</div>
            {adminProfile?.website&&<a href={adminProfile.website} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>{adminProfile.website}</a>}
          </div>
        )}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><CrewStudioBrand small portal/></div>
          <div style={{width:32,height:1,background:"#c9a96e44",margin:"0 auto 20px"}}/>
          <h2 style={{fontSize:28,fontWeight:300,marginBottom:8}}>Who are you?</h2>
          <p style={{fontSize:13,color:"#5a5048"}}>Select your name to sign in</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
          {team.map(m=>(
            <button key={m.id} onClick={()=>pickMember(m.name)} style={{background:"#0e0c0a",border:"1px solid #2a2420",color:"#e8e0d4",padding:"14px 18px",borderRadius:8,fontSize:16,fontFamily:"'Cormorant Garamond',Georgia,serif",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:17,fontWeight:400}}>{m.name}</div><div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>{m.role}</div></div>
              <span style={{color:"#3a3028",fontSize:20}}>›</span>
            </button>
          ))}
        </div>
        {team.length===0&&<p style={{textAlign:"center",color:"#3a3028",fontSize:13,fontFamily:"'DM Mono',monospace"}}>No team members yet.</p>}
        {/* FEATURE 7: Credit */}
        <div style={{marginTop:32,textAlign:"center"}}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BUILT BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</p></div>
      </div>
    </div>
  );

  if(!session&&step==="pass") return (
    <div style={{minHeight:"100vh",background:"#060504",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4"}}>
      <style>{S}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeUp 0.4s ease both"}}>
        <button onClick={()=>setStep("pick")} style={{background:"none",border:"none",color:"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer",marginBottom:24,padding:0}}>← Back</button>
        <div style={{marginBottom:28}}>
          <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:8}}>Crew Portal</p>
          <h2 style={{fontSize:32,fontWeight:300}}>{pickedName.split(" ")[0]}</h2>
          <p style={{fontSize:13,color:"#5a5048",marginTop:4}}>Enter your password to continue</p>
        </div>
        <div style={{position:"relative",marginBottom:passError?12:20}}>
          <input type={showPass?"text":"password"} placeholder="Your portal password" value={passInput} onChange={e=>setPassInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attemptLogin()} style={{paddingRight:48}}/>
          <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5a5048",fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>{showPass?"🙈":"👁"}</button>
        </div>
        {passError&&<div style={{background:"#f8717115",border:"1px solid #f8717133",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace",marginBottom:16}}>⚠ {passError}</div>}
        <button onClick={attemptLogin} disabled={passLoading} style={{width:"100%",padding:"16px",background:passLoading?"#5a4a2a":"linear-gradient(135deg,#c9a96e,#a8814a)",color:"#0a0a0a",border:"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:passLoading?"not-allowed":"pointer",fontFamily:"'Cormorant Garamond',Georgia,serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {passLoading?<><div style={{width:18,height:18,border:"2px solid #0a0a0a44",borderTopColor:"#0a0a0a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Signing in…</>:"View My Schedule →"}
        </button>
      </div>
    </div>
  );

  const upcomingHires=[...(me?.hires||[])].sort((a,b)=>a.date.localeCompare(b.date));
  const pendingCount=upcomingHires.filter(h=>h.status==="Pending").length;
  const TABS=[{id:"schedule",label:"My Schedule"},{id:"calendar",label:"Full Calendar"}];

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d4",paddingBottom:isMobile?32:0}}>
      <style>{S}</style>
      <div style={{background:"#0e0c0a",borderBottom:"1px solid #1e1a16",padding:isMobile?"14px 20px":"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:isMobile?"auto":56,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {adminProfile?.studioName&&<span style={{fontSize:15,fontWeight:600,color:"#c9a96e",letterSpacing:"0.04em"}}>{adminProfile.studioName}</span>}
          {!adminProfile?.studioName&&<CrewStudioBrand small portal/>}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:13,color:"#7a6f63",fontFamily:"'DM Mono',monospace"}}>{me?.name?.split(" ")[0]}</span>
          <button onClick={logout} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 12px",borderRadius:4,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Sign Out</button>
        </div>
      </div>

      <div style={{padding:isMobile?"16px":"24px 32px",maxWidth:760,margin:"0 auto"}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:isMobile?26:34,fontWeight:300,marginBottom:2}}>{me?.name}</h1>
          <p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{me?.role}</p>
        </div>

        {(adminProfile?.studioName||adminProfile?.adminName)&&(
          <div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:8,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            {adminProfile?.studioLogo?<img src={adminProfile.studioLogo} alt="studio logo" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"1px solid #c9a96e44"}}/>:<div style={{width:42,height:42,borderRadius:"50%",background:"#c9a96e22",border:"1px solid #c9a96e44",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a96e",fontSize:18}}>CS</div>}
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:18,fontWeight:600,color:"#c9a96e"}}>{adminProfile.studioName||adminProfile.adminName}</div>
              <div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>{[adminProfile.city,adminProfile.phone||adminProfile.waNumber].filter(Boolean).join(" · ")}</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:6}}>
                {adminProfile.website&&<a href={adminProfile.website} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#60a5fa",fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>Website</a>}
                {adminProfile.instagram&&<a href={adminProfile.instagram.startsWith("http")?adminProfile.instagram:`https://instagram.com/${adminProfile.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#f472b6",fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>Instagram</a>}
                {adminProfile.facebook&&<a href={adminProfile.facebook} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#60a5fa",fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>Facebook</a>}
              </div>
            </div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
          {(()=>{
            const confirmedHires=upcomingHires.filter(h=>h.status==="Confirmed");
            return [
              {v:upcomingHires.length,l:"Total Bookings"},
              {v:confirmedHires.length,l:"Confirmed"},
              {v:pendingCount,l:"Pending",alert:pendingCount>0},
              {v:`₹${(me?.rate||0).toLocaleString("en-IN")}`,l:"Daily Rate"},
            ].map((s,i)=>(
              <div key={i} style={{background:"#0e0c0a",border:`1px solid ${s.alert?"#fbbf2444":"#1e1a16"}`,borderRadius:6,padding:"14px 12px"}}>
                <div style={{fontSize:isMobile?20:24,fontWeight:300,color:s.alert?"#fbbf24":"#c9a96e"}}>{s.v}</div>
                <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
              </div>
            ));
          })()}
        </div>

        {(()=>{
          const confirmedHires=upcomingHires.filter(h=>h.status==="Confirmed");
          const totalEarned=confirmedHires.reduce((s,h)=>s+(me?.rate||0)*(h.dayType==="Half Day"?0.5:1),0);
          const paidAmount=confirmedHires.filter(h=>h.paid).reduce((s,h)=>s+(me?.rate||0)*(h.dayType==="Half Day"?0.5:1),0);
          const unpaidAmount=totalEarned-paidAmount;
          return totalEarned>0?(
            <div style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px",marginBottom:20}}>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Earnings Summary</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,color:"#c9a96e",fontWeight:300}}>₹{totalEarned.toLocaleString("en-IN")}</div><div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#5a5048",marginTop:2}}>TOTAL</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,color:"#4ade80",fontWeight:300}}>₹{paidAmount.toLocaleString("en-IN")}</div><div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#5a5048",marginTop:2}}>PAID</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,color:unpaidAmount>0?"#f87171":"#5a5048",fontWeight:300}}>₹{unpaidAmount.toLocaleString("en-IN")}</div><div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#5a5048",marginTop:2}}>UNPAID</div></div>
              </div>
            </div>
          ):null;
        })()}

        <div style={{display:"flex",gap:0,marginBottom:20,background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,overflow:"hidden"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setPortalTab(t.id)} style={{flex:1,padding:"11px",background:portalTab===t.id?"#c9a96e22":"transparent",color:portalTab===t.id?"#c9a96e":"#5a5048",border:"none",borderRight:"1px solid #1e1a16",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer",letterSpacing:"0.05em"}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* FEATURE 2: My Schedule with instant confirm */}
        {portalTab==="schedule"&&(
          <div>
            {upcomingHires.length===0
              ?<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:40,textAlign:"center",color:"#3a3028"}}>No assignments yet.</div>
              :upcomingHires.map((h,i)=>{
                const wedding=weddings.find(w=>hireBelongsToWedding(h,w));
                const key=`${h.weddingId||h.wedding}|${h.date}|${h.event}|${h.slotId||""}`;
                const isDone=confirmDone[key];
                const isConfirming=confirmingId===key;
                const isPending=h.status==="Pending";
                return (
                  <div key={i} style={{background:"#0e0c0a",border:`1px solid ${h.status==="Pending"?"#fbbf2433":"#1e1a16"}`,borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:8,padding:"16px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:17,fontWeight:500}}>{h.wedding}</div>
                        <div style={{fontSize:14,color:evColor(h.event),margin:"2px 0"}}>{h.event}</div>
                        {(wedding?.bride||wedding?.groom)&&<div style={{fontSize:12,color:"#7a6f63"}}>💍 {[wedding?.bride,wedding?.groom].filter(Boolean).join(" & ")}</div>}
                        <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>📅 {h.date}{(h.startTime||h.endTime)&&` · ${eventTimeText(h)}`}</div>
                        {/* FEATURE 3: clickable location */}
                        {wedding?.location&&(
                          wedding?.googleMapsLink
                            ?<a href={wedding.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:"#60a5fa",fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>📍 {wedding.location} ↗</a>
                            :<div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📍 {wedding.location}</div>
                        )}
                        <div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>🎭 {h.hireRole} · ⏱ {h.dayType}</div>
                        {me?.rate&&<div style={{fontSize:13,color:"#c9a96e",fontFamily:"'DM Mono',monospace",marginTop:2}}>₹{(me.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")} {h.paid?<span style={{fontSize:9,color:"#4ade80",background:"#4ade8011",padding:"2px 6px",borderRadius:2,border:"1px solid #4ade8022",marginLeft:4}}>PAID</span>:<span style={{fontSize:9,color:"#f87171",background:"#f8717111",padding:"2px 6px",borderRadius:2,border:"1px solid #f8717122",marginLeft:4}}>UNPAID</span>}</div>}
                      </div>
                      <span style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24",border:`1px solid ${STATUS_COLOR[h.status]||"#fbbf24"}44`,padding:"4px 12px",borderRadius:2,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",flexShrink:0}}>{h.status||"Pending"}</span>
                    </div>
                    {/* FEATURE 2: Show confirm/decline based on status */}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {isPending&&!isDone&&(
                        <button
                          onClick={()=>handleDirectConfirm(h,me.name)}
                          disabled={isConfirming}
                          style={{background:isConfirming?"#4ade8011":"linear-gradient(135deg,#4ade80,#22c55e)",border:"1px solid #4ade8044",color:isConfirming?"#4ade80":"#0a0a0a",fontSize:12,padding:"10px 20px",borderRadius:5,fontFamily:"'DM Mono',monospace",cursor:isConfirming?"not-allowed":"pointer",flex:1,fontWeight:isConfirming?400:600,animation:isConfirming?"pulse 0.8s infinite":""}}
                        >
                          {isConfirming?"✓ Confirming…":"✓ Confirm Booking"}
                        </button>
                      )}
                      {isDone&&<div style={{flex:1,padding:"10px 16px",background:"#4ade8022",border:"1px solid #4ade8044",borderRadius:5,fontSize:12,fontFamily:"'DM Mono',monospace",color:"#4ade80",textAlign:"center"}}>✓ Confirmed! WhatsApp sent to admin.</div>}
                      {!isDone&&<button onClick={()=>sendWA(h,"DECLINE",me.name)} style={{background:"#f8717122",border:"1px solid #f8717144",color:"#f87171",fontSize:12,padding:"8px 16px",borderRadius:5,fontFamily:"'DM Mono',monospace",cursor:"pointer",flex:isPending?0:1}}>✗ Decline</button>}
                      {!isPending&&!isDone&&<button onClick={()=>sendWA(h,"CONFIRM",me.name)} style={{background:"#4ade8022",border:"1px solid #4ade8044",color:"#4ade80",fontSize:12,padding:"8px 16px",borderRadius:5,fontFamily:"'DM Mono',monospace",cursor:"pointer",flex:1}}>✓ Confirm via WhatsApp</button>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {portalTab==="calendar"&&(
          <TeamCalendar myHires={me?.hires||[]} weddings={weddings} team={team} myName={me?.name}/>
        )}

        {/* FEATURE 7: Credit in portal */}
        <div style={{marginTop:32,paddingTop:16,borderTop:"1px solid #1e1a16",textAlign:"center"}}>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BUILT BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme Picker ───────────────────────────────────────────── */
function ThemePicker({ current, onChange, compact=false }) {
  const [open, setOpen] = useState(false);
  const cur = THEMES[current]||THEMES.golden;
  return (
    <div style={{position:"relative"}}>
      <button
        onClick={()=>setOpen(o=>!o)}
        title="Change theme"
        style={{background:"#1a1612",border:"1px solid #2a2420",borderRadius:6,padding:compact?"5px 8px":"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:compact?14:13,color:"#7a6f63",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}
      >
        <span style={{fontSize:compact?14:16}}>{cur.emoji}</span>
        {!compact&&<span style={{fontSize:11}}>{cur.label}</span>}
        <span style={{fontSize:10,opacity:0.6}}>▾</span>
      </button>
      {open&&(
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:998}}/>
          <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#111",border:"1px solid #2a2420",borderRadius:10,padding:6,zIndex:999,minWidth:180,boxShadow:"0 8px 32px #00000088",display:"flex",flexDirection:"column",gap:2}}>
            <p style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.15em",padding:"4px 10px 6px"}}>Choose Theme</p>
            {Object.values(THEMES).map(t=>(
              <button key={t.id} onClick={()=>{onChange(t.id);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:6,border:t.id===current?"1px solid "+t.accent+"66":"1px solid transparent",background:t.id===current?t.accent+"15":"transparent",cursor:"pointer",textAlign:"left",width:"100%"}}>
                <span style={{fontSize:18}}>{t.emoji}</span>
                <span style={{fontSize:13,fontFamily:"'Cormorant Garamond',Georgia,serif",color:t.id===current?t.accent:"#e8e0d4"}}>{t.label.replace(/^[^ ]+ /,"")}</span>
                {t.id===current&&<span style={{marginLeft:"auto",color:t.accent,fontSize:14}}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADMIN APP
════════════════════════════════════════════════════════════════ */
function AdminApp({ user, onLogout, theme, onThemeChange }) {
  const isMobile=useIsMobile();
  const adminId=user?.adminId||"legacy";
  const teamKey=adminId==="legacy"?"crew_team":`crew_team_${adminId}`;
  const weddingsKey=adminId==="legacy"?"crew_weddings":`crew_weddings_${adminId}`;
  const profileKey=adminId==="legacy"?"crew_profile":`crew_profile_${adminId}`;
  const normalizeTeam=t=>(Array.isArray(t)?t:Object.values(t||{})).map(m=>({...m,hires:Array.isArray(m.hires)?m.hires:Object.values(m.hires||{})}));
  const [team,setTeamRaw]=useState(()=>normalizeTeam(loadState(teamKey,adminId==="legacy"?INITIAL_TEAM:[])));
  const [weddings,setWeddingsRaw]=useState(()=>loadState(weddingsKey,[]));
  const [syncing,setSyncing]=useState(USE_FIREBASE);

  useEffect(()=>{
    if(!USE_FIREBASE){setSyncing(false);return;}
    let closeFns=[];
    (async()=>{
      const [fbTeam,fbWeddings,fbProfile]=await Promise.all([fbGet(teamKey),fbGet(weddingsKey),fbGet(profileKey)]);
      const teamToUse=normalizeTeam(fbTeam||(adminId==="legacy"?INITIAL_TEAM:[]));
      const weddingsToUse=fbWeddings?(Array.isArray(fbWeddings)?fbWeddings:Object.values(fbWeddings)):[];
      if(!fbTeam) await fbSet(teamKey,adminId==="legacy"?INITIAL_TEAM:[]);
      if(!fbWeddings) await fbSet(weddingsKey,[]);
      if(fbProfile) setProfileRaw(fbProfile);
      setTeamRaw(teamToUse); setWeddingsRaw(weddingsToUse); setSyncing(false);
    })();
    closeFns.push(fbListen(teamKey,d=>{if(d) setTeamRaw(normalizeTeam(d));}));
    closeFns.push(fbListen(weddingsKey,d=>{if(d) setWeddingsRaw(Array.isArray(d)?d:Object.values(d||{}));}));
    return ()=>closeFns.forEach(f=>f());
  },[]);

  function setTeam(v){setTeamRaw(prev=>{const next=typeof v==="function"?v(prev):v;saveState(teamKey,next);if(USE_FIREBASE)fbSet(teamKey,next);return next;});}
  function setWeddings(v){setWeddingsRaw(prev=>{const next=typeof v==="function"?v(prev):v;saveState(weddingsKey,next);if(USE_FIREBASE)fbSet(weddingsKey,next);return next;});}

  const [view,setView]=useState("dashboard");
  const [selectedMember,setSelectedMember]=useState(null);
  const [selectedWedding,setSelectedWedding]=useState(null);
  const [showAddMember,setShowAddMember]=useState(false);
  const [showAddWedding,setShowAddWedding]=useState(false);
  const [showAddHire,setShowAddHire]=useState(null);
  const [editMember,setEditMember]=useState(null);
  const [editWedding,setEditWedding]=useState(null);
  const [editHire,setEditHire]=useState(null);
  const [newMember,setNewMember]=useState({name:"",role:ROLES[0],phone:"",rate:"",portalPass:""});
  const [editForm,setEditForm]=useState({name:"",role:ROLES[0],phone:"",rate:"",portalPass:""});

  // FEATURE 3 & 1: Extended wedding form with time and google maps link
  const [wForm,setWForm]=useState({name:"",bride:"",groom:"",location:"",googleMapsLink:"",selectedDates:[],eventDays:[],eventType:"wedding",clientName:""});
  const [hireForm,setHireForm]=useState({wedding:"",selectedEventDays:[],status:"Pending",dayType:"Full Day",hireRole:ROLES[0]});
  const [editHireForm,setEditHireForm]=useState({status:"Confirmed",dayType:"Full Day",hireRole:ROLES[0],paid:false});
  const [profile,setProfileRaw]=useState(()=>loadState(profileKey,{
    adminName:user?.name||"Krunal Prajapati",
    studioName:"Krunalfilms",
    waNumber:"919876543210",
    city:"Ahmedabad",
    website:"",phone:"",instagram:"",facebook:"",studioLogo:"",
    msgBooking:"Hi {name}! You've been booked:\n\n💍 *{wedding}*\n🎬 *{event}*\n📅 *{date}*\n🎭 {role}\n⏱ {dayType}\n💰 ₹{amount}\n\nPlease confirm.",
    msgConfirm:"Hi {adminName}! This is {name}. I want to *CONFIRM* my booking:\n\n📅 *{date}*\n💍 *{wedding}*\n🎬 *{event}*\n🎭 Role: *{role}*\n⏱ {dayType}",
    msgDecline:"Hi {adminName}! This is {name}. I want to *DECLINE* my booking:\n\n📅 *{date}*\n💍 *{wedding}*\n🎬 *{event}*\n🎭 Role: *{role}*\n⏱ {dayType}",
  }));
  function setProfile(v){setProfileRaw(prev=>{const next=typeof v==="function"?v(prev):v;saveState(profileKey,next);if(USE_FIREBASE)fbSet(profileKey,next);return next;});}
  function handleLogoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({ ...prev, studioLogo: reader.result }));
    reader.readAsDataURL(file);
  }

  // FEATURE 5: Dashboard state
  const [dashSearch,setDashSearch]=useState("");
  const [dashFilter,setDashFilter]=useState("upcoming"); // upcoming | all | past
  const [dashPage,setDashPage]=useState(0);
  const DASH_PER_PAGE=10;

  const bookedMap=useMemo(()=>{const map={};(team||[]).forEach(m=>(m.hires||[]).forEach(h=>{if(!map[h.date])map[h.date]=[];map[h.date].push(m.name);}));return map;},[team]);
  const stats=useMemo(()=>({
    totalMembers:(team||[]).length,
    totalWeddings:(weddings||[]).length,
    totalHires:(team||[]).reduce((s,m)=>s+(m.hires||[]).length,0),
    confirmedHires:(team||[]).reduce((s,m)=>s+(m.hires||[]).filter(h=>h.status==="Confirmed").length,0),
    pendingHires:(team||[]).reduce((s,m)=>s+(m.hires||[]).filter(h=>h.status==="Pending").length,0),
    totalRevenue:(team||[]).reduce((s,m)=>s+(m.hires||[]).filter(h=>h.status==="Confirmed").reduce((ss,h)=>ss+m.rate*(h.dayType==="Half Day"?0.5:1),0),0),
  }),[team,weddings]);

  const today=new Date().toISOString().slice(0,10);
  const allDashEvents=useMemo(()=>{
    const list=weddings.flatMap(w=>(w.eventDays||[]).map(ed=>({...ed,weddingName:w.name,wedding:w})));
    list.sort((a,b)=>a.date.localeCompare(b.date));
    let filtered=list;
    if(dashFilter==="upcoming") filtered=list.filter(e=>e.date>=today);
    else if(dashFilter==="past") filtered=list.filter(e=>e.date<today);
    if(dashSearch) filtered=filtered.filter(e=>e.weddingName.toLowerCase().includes(dashSearch.toLowerCase())||e.event.toLowerCase().includes(dashSearch.toLowerCase())||e.date.includes(dashSearch));
    return filtered;
  },[weddings,dashFilter,dashSearch,today]);

  const dashPages=Math.max(1,Math.ceil(allDashEvents.length/DASH_PER_PAGE));
  const dashEvents=allDashEvents.slice(dashPage*DASH_PER_PAGE,(dashPage+1)*DASH_PER_PAGE);

  if(syncing) return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <div style={{width:36,height:36,border:"2px solid #2a2420",borderTopColor:"#c9a96e",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
      <p style={{fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase"}}>Connecting to database…</p>
    </div>
  );

  function openAddWedding(){setWForm({name:"",bride:"",groom:"",location:"",googleMapsLink:"",selectedDates:[],eventDays:[],eventType:"wedding",clientName:""});setEditWedding(null);setShowAddWedding(true);}
  // FEATURE 4: When editing, preserve existing crew (no new adding crew here)
  function openEditWedding(w){setWForm({name:w.name,bride:w.bride||"",groom:w.groom||"",location:w.location||"",googleMapsLink:w.googleMapsLink||"",selectedDates:[...(w.selectedDates||[])],eventDays:[...(w.eventDays||[])],eventType:w.eventType||"wedding",clientName:w.clientName||""});setEditWedding(w);setShowAddWedding(true);}
  function toggleWDate(ds){setWForm(prev=>{const already=prev.selectedDates.includes(ds);return{...prev,selectedDates:already?prev.selectedDates.filter(d=>d!==ds):[...prev.selectedDates,ds].sort(),eventDays:already?prev.eventDays.filter(ed=>ed.date!==ds):prev.eventDays};});}
  function syncSlotBookings(wedding, previousName) {
    const slotBookings=(wedding.eventDays||[]).flatMap(ed=>(ed.crewSlots||[])
      .filter(slot=>slot.assignedMemberId)
      .map(slot=>{
        const roleInfo=CREW_SLOT_ROLES.find(r=>r.id===slot.role);
        return {
          memberId:Number(slot.assignedMemberId),
          key:`${ed.date}|${ed.event}|${slot.id}`,
          hire:{
            wedding:wedding.name,
            weddingId:wedding.id,
            event:ed.event,
            date:ed.date,
            status:"Pending",
            dayType:"Full Day",
            hireRole:roleInfo?.label||slot.role||"Crew",
            paid:false,
            slotId:slot.id,
            source:"slot",
            startTime:ed.startTime||"",
            endTime:ed.endTime||"",
          }
        };
      })
    );
    setTeam(team.map(member=>{
      const mySlots=slotBookings.filter(s=>s.memberId===member.id);
      const mySlotKeys=new Set(mySlots.map(s=>s.key));
      let hires=(member.hires||[]).map(h=>{
        const sameWedding=hireBelongsToWedding(h,wedding)||(previousName&&h.wedding===previousName);
        return sameWedding?{...h,wedding:wedding.name,weddingId:wedding.id}:h;
      }).filter(h=>!(h.source==="slot"&&hireBelongsToWedding(h,wedding)&&!mySlotKeys.has(`${h.date}|${h.event}|${h.slotId}`)));
      mySlots.forEach(({key,hire})=>{
        const existingIndex=hires.findIndex(h=>h.source==="slot"&&hireBelongsToWedding(h,wedding)&&`${h.date}|${h.event}|${h.slotId}`===key);
        if(existingIndex>=0) hires[existingIndex]={...hires[existingIndex],...hire,status:hires[existingIndex].status||"Pending",paid:hires[existingIndex].paid||false};
        else hires.push(hire);
      });
      return {...member,hires};
    }));
  }
  function saveWedding(){
    if(!wForm.name)return;
    const eventId=editWedding?.id||Date.now();
    const nextWedding={...(editWedding||{}),...wForm,id:eventId,adminStudio:profile.studioName||profile.adminName||"",adminLogo:profile.studioLogo||""};
    if(editWedding){
      setWeddings(weddings.map(w=>w.id===editWedding.id?nextWedding:w));
    }else{
      setWeddings([...weddings,nextWedding]);
    }
    syncSlotBookings(nextWedding,editWedding?.name);
    setSelectedWedding(nextWedding);
    setShowAddWedding(false);
  }
  function handleQuickHire({memberId,event,date,dayType,hireRole,status,startTime,endTime}){
    // wForm may not have weddingId yet for new weddings; use name as fallback
    const weddingId=editWedding?.id||null;
    const weddingName=wForm.name;
    const hire={wedding:weddingName,weddingId,event,date,status:status||"Pending",dayType,hireRole,paid:false,startTime,endTime};
    setTeam(prev=>prev.map(m=>m.id===memberId?{...m,hires:[...m.hires,hire]}:m));
  }
  function removeWedding(id){
    const wedding=weddings.find(w=>w.id===id);
    setWeddings(weddings.filter(w=>w.id!==id));
    if(wedding){
      // Also remove all hires for this wedding from all team members
      setTeam(team.map(m=>({...m,hires:(m.hires||[]).filter(h=>!hireBelongsToWedding(h,wedding))})));
    }
  }
  function addMember(){if(!newMember.name)return;setTeam([...team,{id:Date.now(),...newMember,rate:Number(newMember.rate),hires:[]}]);setNewMember({name:"",role:ROLES[0],phone:"",rate:"",portalPass:""});setShowAddMember(false);}
  function saveEditMember(){const pp=editForm.portalPass||editMember?.portalPass||"";setTeam(team.map(m=>m.id===editMember.id?{...m,...editForm,rate:Number(editForm.rate),portalPass:pp}:m));setEditMember(null);}
  function removeMember(id){setTeam(team.filter(m=>m.id!==id));}
  function toggleEventDay(key){setHireForm(prev=>({...prev,selectedEventDays:prev.selectedEventDays.includes(key)?prev.selectedEventDays.filter(k=>k!==key):[...prev.selectedEventDays,key]}));}
  function addBulkHire(memberId){
    if(!hireForm.wedding||hireForm.selectedEventDays.length===0)return;
    const selectedWeddingObj=weddings.find(w=>String(w.id)===String(hireForm.wedding)||w.name===hireForm.wedding);
    const newHires=hireForm.selectedEventDays.map(key=>{const[date,...evParts]=key.split("|");const event=evParts.join("|");const ed=(selectedWeddingObj?.eventDays||[]).find(d=>d.date===date&&d.event===event)||{};return{wedding:selectedWeddingObj?.name||hireForm.wedding,weddingId:selectedWeddingObj?.id,event,date,status:hireForm.status,dayType:hireForm.dayType,hireRole:hireForm.hireRole,paid:false,startTime:ed.startTime||"",endTime:ed.endTime||""};});
    setTeam(team.map(m=>m.id===memberId?{...m,hires:[...m.hires,...newHires]}:m));
    setHireForm({wedding:"",selectedEventDays:[],status:"Pending",dayType:"Full Day",hireRole:ROLES[0]});
    setShowAddHire(null);
    // FEATURE 2: Send WA booking notification
    const member=team.find(m=>m.id===memberId);
    if(member&&newHires.length>0){
      const firstHire=newHires[0];
      sendWAToMember(member,firstHire);
    }
  }
  function openEditHire(memberId,hireIdx){const hire=team.find(m=>m.id===memberId)?.hires[hireIdx];if(!hire)return;setEditHireForm({status:hire.status||"Pending",dayType:hire.dayType||"Full Day",hireRole:hire.hireRole||ROLES[0],paid:hire.paid||false});setEditHire({memberId,hireIdx});}
  function saveEditHire(){setTeam(team.map(m=>m.id===editHire.memberId?{...m,hires:m.hires.map((h,i)=>i===editHire.hireIdx?{...h,...editHireForm}:h)}:m));setEditHire(null);}
  // FEATURE 2: Admin can directly confirm a hire (no WA needed from admin side)
  function adminConfirmHire(memberId,hireIdx){
    setTeam(team.map(m=>m.id===memberId?{...m,hires:m.hires.map((h,i)=>i===hireIdx?{...h,status:"Confirmed"}:h)}:m));
    // Send WA notification to admin
    const member=team.find(m=>m.id===memberId);
    const hire=member?.hires[hireIdx];
    if(member&&hire){
      const amount=(member.rate*(hire.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN");
      const msg=`✅ Booking CONFIRMED\n\n👤 ${member.name}\n💍 ${hire.wedding}\n🎬 ${hire.event}\n📅 ${hire.date}\n💰 ₹${amount}`;
      const waNum=(profile.waNumber||ADMIN_WA).replace(/\D/g,"");
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,"_blank");
    }
  }
  function toggleHirePaid(memberId,hireIdx){setTeam(team.map(m=>m.id===memberId?{...m,hires:m.hires.map((h,i)=>i===hireIdx?{...h,paid:!h.paid}:h)}:m));}
  function removeHire(memberId,idx){setTeam(team.map(m=>m.id===memberId?{...m,hires:m.hires.filter((_,i)=>i!==idx)}:m));}
  function getWeddingEventDays(weddingValue){const w=weddings.find(x=>String(x.id)===String(weddingValue)||x.name===weddingValue);return w?(w.eventDays||[]):[]; }
  function sendWAToMember(member,hire){
    const amount=(member.rate*(hire.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN");
    const msg=(profile.msgBooking||"Hi {name}! Booked.")
      .replace(/{name}/g,member.name.split(" ")[0]).replace(/{wedding}/g,hire.wedding).replace(/{event}/g,hire.event).replace(/{date}/g,hire.date).replace(/{role}/g,hire.hireRole||member.role).replace(/{dayType}/g,hire.dayType||"Full Day").replace(/{amount}/g,`₹${amount}`).replace(/{adminName}/g,profile.adminName||"Admin");
    const waNum=(profile.waNumber||ADMIN_WA).replace(/\D/g,"");
    window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const NAV_ITEMS=[{id:"dashboard",icon:"◈",label:"Home"},{id:"team",icon:"◉",label:"Team"},{id:"weddings",icon:"◇",label:"Events"},{id:"calendar",icon:"▦",label:"Calendar"},{id:"profile",icon:"◎",label:"Profile"}];

  const T=theme||THEMES.golden;
  const S=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${T.border2};border-radius:2px;}
  input,select{background:${T.inputBg};border:1px solid ${T.border2};color:${T.text};font-family:'DM Mono',monospace;font-size:14px;padding:12px 14px;border-radius:6px;outline:none;width:100%;transition:border-color 0.2s;-webkit-appearance:none;}
  input:focus,select:focus{border-color:${T.accent};}select option{background:${T.bg3};}
  button{cursor:pointer;font-family:'Cormorant Garamond',Georgia,serif;transition:all 0.2s;}
  .tag{display:inline-block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.08em;padding:3px 10px;border-radius:2px;text-transform:uppercase;}
  .fade-in{animation:fadeIn 0.3s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  .overlay{position:fixed;inset:0;background:#00000099;z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
  .modal{background:${T.bg3};border:1px solid ${T.border2};border-radius:12px 12px 0 0;padding:28px 20px;width:100%;max-height:90vh;overflow-y:auto;}
  .modal-desktop{align-items:center;}.modal-desktop .modal{border-radius:10px;max-width:560px;}
  .btn-gold{background:${T.accentGrad};color:${T.bg};border:none;padding:12px 22px;font-size:15px;font-weight:600;border-radius:6px;}
  .btn-ghost{background:transparent;color:${T.accent};border:1px solid ${T.accent}33;padding:8px 16px;font-size:13px;border-radius:4px;}
  .btn-ghost:hover{border-color:${T.accent};}
  .nav-item{padding:10px 18px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;background:none;border:none;color:${T.textMuted};}
  .nav-item.active{color:${T.accent};border-bottom:1px solid ${T.accent};}
  .mob-nav{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:8px 0;flex:1;border:none;background:none;}
  .mob-nav.active .mob-nav-icon{color:${T.accent};}.mob-nav.active .mob-nav-label{color:${T.accent};}
  .mob-nav-icon{font-size:18px;color:${T.textGhost};line-height:1;}
  .mob-nav-label{font-size:9px;font-family:'DM Mono',monospace;letter-spacing:0.08em;text-transform:uppercase;color:${T.textGhost};margin-top:2px;}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
`;

  const mClass=isMobile?"overlay":"overlay modal-desktop";

  /* ── MOBILE LAYOUT ── */
  if(isMobile) return (
    <div style={{minHeight:"100vh",background:T.bg2,fontFamily:"'Cormorant Garamond',Georgia,serif",color:T.text,paddingBottom:70}}>
      <style>{S}</style>
      <div style={{background:T.bg3,borderBottom:`1px solid ${T.border}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <CrewStudioBrand small onHome={()=>setView("dashboard")}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {view==="weddings"&&<button className="btn-gold" style={{padding:"8px 14px",fontSize:13}} onClick={openAddWedding}>+ Event</button>}
          {view==="team"&&<button className="btn-gold" style={{padding:"8px 14px",fontSize:13}} onClick={()=>setShowAddMember(true)}>+ Member</button>}
          <ThemePicker current={theme?.id||"golden"} onChange={onThemeChange} compact/>
          <button onClick={onLogout} style={{background:"none",border:"1px solid #2a2420",color:"#5a5048",fontSize:11,padding:"6px 10px",borderRadius:4,fontFamily:"'DM Mono',monospace"}}>Logout</button>
        </div>
      </div>

      <div style={{padding:"20px 16px"}}>
        {/* DASHBOARD mobile — Feature 5 */}
        {view==="dashboard"&&(
          <div className="fade-in">
            <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.15em"}}>Overview</p>
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:16,marginTop:2}}>Dashboard</h1>
            {/* Team Portal Link — mobile */}
            <div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:8,padding:"14px 16px",marginBottom:16}}>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>Team Portal Link</p>
              <p style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginBottom:10,wordBreak:"break-all"}}>{window.location.href.split("#")[0]}#{adminId==="legacy"?"team":`team-${adminId}`}</p>
              <button onClick={()=>navigator.clipboard.writeText(window.location.href.split("#")[0]+"#"+(adminId==="legacy"?"team":`team-${adminId}`))} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",padding:"8px 14px",borderRadius:3,fontSize:12,fontFamily:"'DM Mono',monospace",width:"100%"}}>📋 Copy Team Link</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[{num:stats.totalMembers,label:"Members"},{num:stats.totalWeddings,label:"Weddings"},{num:stats.totalHires,label:"Hires"},{num:stats.confirmedHires,label:"Confirmed"},{num:stats.pendingHires,label:"Pending",alert:stats.pendingHires>0},{num:`₹${Math.round(stats.totalRevenue/1000)}k`,label:"Revenue"}].map((s,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:`1px solid ${s.alert?"#fbbf2444":"#1e1a16"}`,borderRadius:8,padding:"14px 14px"}}>
                  <div style={{fontSize:26,fontWeight:300,color:s.alert?"#fbbf24":"#c9a96e",lineHeight:1}}>{s.num}</div>
                  <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:3,fontFamily:"'DM Mono',monospace"}}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Search + Filter */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input placeholder="Search events…" value={dashSearch} onChange={e=>{setDashSearch(e.target.value);setDashPage(0);}} style={{flex:1,padding:"8px 12px",fontSize:13}}/>
              <select value={dashFilter} onChange={e=>{setDashFilter(e.target.value);setDashPage(0);}} style={{padding:"8px 10px",fontSize:12,width:"auto"}}>
                <option value="upcoming">Upcoming</option>
                <option value="all">All</option>
                <option value="past">Past</option>
              </select>
            </div>
            <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>{dashFilter} Events ({allDashEvents.length})</p>
            {dashEvents.map((e,i)=>{
              const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,e.wedding,e.date)));
              return (
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(e.event)}`,borderRadius:6,padding:"12px 14px",marginBottom:8,cursor:"pointer"}} onClick={()=>{setSelectedWedding(e.wedding);setView("wedding-detail");}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:500}}>{e.weddingName}</div>
                      <div style={{fontSize:12,color:evColor(e.event),fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.event}</div>
                      <div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.date}{e.startTime&&` · ⏰ ${e.startTime}`}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{crew.length} crew</div>
                      {e.date<today&&<span style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>PAST</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {allDashEvents.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:6,padding:28,textAlign:"center",color:"#3a3028",fontSize:14}}>No events found</div>}
            {/* Pagination */}
            {dashPages>1&&<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
              <button onClick={()=>setDashPage(p=>Math.max(0,p-1))} disabled={dashPage===0} style={{background:"#0e0c0a",border:"1px solid #2a2420",color:dashPage===0?"#3a3028":"#c9a96e",padding:"6px 14px",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:12}}>‹ Prev</button>
              <span style={{color:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace",padding:"6px 0"}}>{dashPage+1}/{dashPages}</span>
              <button onClick={()=>setDashPage(p=>Math.min(dashPages-1,p+1))} disabled={dashPage===dashPages-1} style={{background:"#0e0c0a",border:"1px solid #2a2420",color:dashPage===dashPages-1?"#3a3028":"#c9a96e",padding:"6px 14px",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:12}}>Next ›</button>
            </div>}
          </div>
        )}

        {/* TEAM mobile */}
        {view==="team"&&(
          <div className="fade-in">
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Team</h1>
            {team.map(m=>(
              <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px",marginBottom:12}} onClick={()=>{setSelectedMember(m);setView("member-detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:18,fontWeight:500}}>{m.name}</div><span className="tag" style={{background:"#c9a96e22",color:"#c9a96e",marginTop:4,display:"inline-block"}}>{m.role}</span></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>{m.hires.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>HIRES</div></div>
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
                {(()=>{const totalPay=m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);const paidPay=m.hires.filter(h=>h.paid).reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);const unpaidPay=totalPay-paidPay;
                  return [{v:m.hires.length,l:"Hires"},{v:`₹${paidPay.toLocaleString("en-IN")}`,l:"Paid",c:"#4ade80"},{v:`₹${unpaidPay.toLocaleString("en-IN")}`,l:"Unpaid",c:"#f87171",alert:unpaidPay>0}].map((s,i)=>(
                    <div key={i} style={{background:"#0e0c0a",border:`1px solid ${s.alert?"#f8717133":"#1e1a16"}`,borderRadius:6,padding:"12px 10px"}}>
                      <div style={{fontSize:15,fontWeight:300,color:s.c||"#c9a96e"}}>{s.v}</div>
                      <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#5a5048",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
                    </div>
                  ));
                })()}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <button className="btn-gold" style={{flex:1,fontSize:14}} onClick={()=>{setHireForm({wedding:"",selectedEventDays:[],status:"Pending",dayType:"Full Day",hireRole:m.role});setShowAddHire(m.id);}}>+ Add Hire</button>
                <button onClick={()=>{setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate,portalPass:m.portalPass||""});setEditMember(m);}} style={{background:"#1a1612",border:"1px solid #2a2420",color:"#7a6f63",padding:"12px 16px",borderRadius:6,fontSize:14}}>Edit</button>
                {m.phone&&<button onClick={()=>window.open(`https://wa.me/91${m.phone}`,"_blank")} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",padding:"12px 14px",borderRadius:6,fontSize:16}}>💬</button>}
              </div>
              {[...m.hires].sort((a,b)=>a.date.localeCompare(b.date)).map((h,i)=>(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:6,padding:"14px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:500}}>{h.wedding}</div>
                      <div style={{fontSize:13,color:evColor(h.event)}}>{h.event}</div>
                      <div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>{h.date} · {h.dayType}</div>
                      <div style={{fontSize:13,color:"#c9a96e",marginTop:2}}>₹{(m.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")} {h.paid?<span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#4ade80",background:"#4ade8011",border:"1px solid #4ade8022",padding:"2px 6px",borderRadius:2,marginLeft:4}}>PAID</span>:<span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#f87171",background:"#f8717111",border:"1px solid #f8717122",padding:"2px 6px",borderRadius:2,marginLeft:4}}>UNPAID</span>}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <span className="tag" style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24"}}>{h.status||"Pending"}</span>
                      <div style={{display:"flex",gap:4}}>
                        {h.status==="Pending"&&<button onClick={()=>adminConfirmHire(m.id,m.hires.indexOf(h))} style={{background:"#4ade8022",border:"1px solid #4ade8044",color:"#4ade80",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>✓ Confirm</button>}
                        <button onClick={()=>sendWAToMember(m,h)} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WA</button>
                        <button onClick={()=>toggleHirePaid(m.id,m.hires.indexOf(h))} style={{background:h.paid?"#4ade8022":"#f8717122",border:`1px solid ${h.paid?"#4ade8044":"#f8717144"}`,color:h.paid?"#4ade80":"#f87171",fontSize:11,padding:"4px 8px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>{h.paid?"✓":"$"}</button>
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
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Events</h1>
            {weddings.map(w=>{const assigned=team.filter(m=>m.hires.some(h=>hireBelongsToWedding(h,w)));return(
              <div key={w.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:"16px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}} onClick={()=>{setSelectedWedding(w);setView("wedding-detail");}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:18,fontWeight:500}}>{w.name}</h2>
                    <p style={{fontSize:13,color:"#7a6f63",marginTop:2}}>{w.bride} {w.bride&&w.groom?"&":""} {w.groom}{w.clientName&&!w.bride?w.clientName:""}</p>
                    {/* FEATURE 3: Google Maps link */}
                    {w.location&&(w.googleMapsLink?<a href={w.googleMapsLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{display:"block",fontSize:12,color:"#60a5fa",fontFamily:"'DM Mono',monospace",marginTop:2,textDecoration:"none"}}>📍 {w.location} ↗</a>:<p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>📍 {w.location}</p>)}
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

        {/* WEDDING DETAIL mobile — Features 3, 8 */}
        {view==="wedding-detail"&&selectedWedding&&(()=>{
          const w=weddings.find(x=>x.id===selectedWedding.id)||selectedWedding;
          return (
            <div className="fade-in">
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
                <button className="btn-ghost" onClick={()=>setView("weddings")}>← Back</button>
                <button className="btn-ghost" onClick={()=>openEditWedding(w)}>Edit</button>
              </div>
              <h1 style={{fontSize:24,fontWeight:300,marginBottom:2}}>{w.name}</h1>
              <p style={{color:"#7a6f63",fontSize:14,marginBottom:4}}>{w.bride} {w.bride&&w.groom?"&":""} {w.groom}{w.clientName&&!w.bride?w.clientName:""}</p>
              {w.location&&(w.googleMapsLink?<a href={w.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:13,color:"#60a5fa",marginBottom:16,textDecoration:"none"}}>📍 {w.location} ↗ Open in Maps</a>:<p style={{fontSize:13,color:"#5a5048",marginBottom:16}}>📍 {w.location}</p>)}
              {(w.eventDays||[]).map((ed,i)=>{
                const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,w,ed.date,ed.event)));
                const slots=ed.crewSlots||[];
                const sideLabel=ed.side==="bride"?"👰 Bride":ed.side==="groom"?"🤵 Groom":"";
                return(
                  <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:6,padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
                          <div style={{fontSize:15,fontWeight:500,color:evColor(ed.event)}}>{ed.event}</div>
                          {sideLabel&&<span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#c9a96e",background:"#c9a96e11",border:"1px solid #c9a96e33",padding:"1px 6px",borderRadius:2}}>{sideLabel}</span>}
                        </div>
                        <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{ed.date}{ed.startTime&&` · ⏰ ${ed.startTime}`}{ed.endTime&&`–${ed.endTime}`}</div>
                        {ed.location&&<div style={{fontSize:11,color:"#60a5fa",fontFamily:"'DM Mono',monospace",marginTop:2}}>📍 {ed.location}</div>}
                        {slots.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                          {slots.map(slot=>{
                            const roleInfo=CREW_SLOT_ROLES.find(r=>r.id===slot.role)||CREW_SLOT_ROLES[0];
                            const member=team.find(m=>m.id===slot.assignedMemberId);
                            return <span key={slot.id} style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:member?roleInfo.color:"#5a5048",background:member?roleInfo.color+"15":"#1e1a16",border:`1px solid ${member?roleInfo.color+"33":"#2a2420"}`,padding:"2px 8px",borderRadius:2}}>{roleInfo.emoji} {member?member.name.split(" ")[0]:"Empty"}</span>;
                          })}
                        </div>}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"flex-end",maxWidth:120}}>
                        {crew.length===0?<span style={{fontSize:12,color:"#3a3028"}}>No crew</span>:crew.map(c=><span key={c.id} className="tag" style={{background:"#c9a96e11",color:"#c9a96e99"}}>{c.name.split(" ")[0]}</span>)}
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* PROFILE mobile — Feature 6 */}
        {view==="profile"&&(
          <div className="fade-in">
            <h1 style={{fontSize:28,fontWeight:300,marginBottom:20}}>Profile</h1>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
              <div style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:20}}>
                <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14}}>Studio Info</p>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:5}}>YOUR NAME</label><input value={profile.adminName||""} onChange={e=>setProfile({...profile,adminName:e.target.value})} placeholder="Your full name"/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:5}}>STUDIO NAME</label><input value={profile.studioName||""} onChange={e=>setProfile({...profile,studioName:e.target.value})} placeholder="Studio name"/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:5}}>CITY</label><input value={profile.city||""} onChange={e=>setProfile({...profile,city:e.target.value})} placeholder="City"/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:5}}>WHATSAPP NUMBER</label><input value={profile.waNumber||""} onChange={e=>setProfile({...profile,waNumber:e.target.value.replace(/[^0-9]/g,"")})} placeholder="919876543210"/></div>
                  {/* FEATURE 6: Social media + contact links */}
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>📞 CONTACT NUMBER</label><input value={profile.phone||""} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="Phone/contact number"/></div>
                  <div>
                    <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>UPLOAD LOGO IMAGE</label>
                    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                      {profile.studioLogo&&<img src={profile.studioLogo} alt="Studio logo preview" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"1px solid #c9a96e44"}}/>}
                      <label style={{background:"#1a1612",border:"1px solid #c9a96e44",color:"#c9a96e",fontSize:12,padding:"9px 14px",borderRadius:5,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
                        Choose Image
                        <input type="file" accept="image/*" onChange={e=>handleLogoUpload(e.target.files?.[0])} style={{display:"none"}}/>
                      </label>
                      {profile.studioLogo&&<button onClick={()=>setProfile({...profile,studioLogo:""})} style={{background:"none",border:"1px solid #2a2420",color:"#f87171",fontSize:12,padding:"8px 12px",borderRadius:5,fontFamily:"'DM Mono',monospace"}}>Remove</button>}
                    </div>
                  </div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>🌐 WEBSITE</label><input value={profile.website||""} onChange={e=>setProfile({...profile,website:e.target.value})} placeholder="https://yourwebsite.com"/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>📸 INSTAGRAM</label><input value={profile.instagram||""} onChange={e=>setProfile({...profile,instagram:e.target.value})} placeholder="@yourhandle"/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>📘 FACEBOOK</label><input value={profile.facebook||""} onChange={e=>setProfile({...profile,facebook:e.target.value})} placeholder="Page or profile URL"/></div>
                </div>
              </div>
              <div style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:20}}>
                <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>Message Templates</p>
                <p style={{fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginBottom:14}}>Variables: {"{name}"} {"{wedding}"} {"{event}"} {"{date}"} {"{role}"} {"{dayType}"} {"{amount}"} {"{adminName}"}</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",display:"block",marginBottom:5}}>📨 BOOKING (ADMIN → CREW)</label><textarea value={profile.msgBooking||""} onChange={e=>setProfile({...profile,msgBooking:e.target.value})} rows={4} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#4ade80",display:"block",marginBottom:5}}>✓ CONFIRM (CREW → ADMIN)</label><textarea value={profile.msgConfirm||""} onChange={e=>setProfile({...profile,msgConfirm:e.target.value})} rows={4} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
                  <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#f87171",display:"block",marginBottom:5}}>✗ DECLINE (CREW → ADMIN)</label><textarea value={profile.msgDecline||""} onChange={e=>setProfile({...profile,msgDecline:e.target.value})} rows={4} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
                </div>
              </div>
              <div style={{background:"#c9a96e11",border:"1px solid #c9a96e33",borderRadius:6,padding:"10px 14px"}}>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>✓ Changes save automatically</p>
              </div>
            </div>
            {/* FEATURE 7: Credit */}
            <div style={{padding:"12px 0",textAlign:"center"}}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BUILT BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</p></div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.bg3,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {NAV_ITEMS.map(n=>(
          <button key={n.id} className={`mob-nav ${view===n.id||view==="member-detail"&&n.id==="team"||view==="wedding-detail"&&n.id==="weddings"?"active":""}`} onClick={()=>setView(n.id)}>
            <span className="mob-nav-icon">{n.icon}</span>
            <span className="mob-nav-label">{n.label}</span>
          </button>
        ))}
      </div>
      {renderModals()}
    </div>
  );

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{minHeight:"100vh",background:T.bg2,fontFamily:"'Cormorant Garamond',Georgia,serif",color:T.text}}>
      <style>{S}</style>
      <div style={{borderBottom:`1px solid ${T.border}`,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,background:T.bg2,zIndex:100}}>
        <CrewStudioBrand onHome={()=>setView("dashboard")}/>
        <nav style={{display:"flex",gap:4}}>{NAV_ITEMS.map(n=><button key={n.id} className={`nav-item ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>{n.label}</button>)}</nav>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:T.textFaint}}>{user.name}</span>
          <ThemePicker current={theme?.id||"golden"} onChange={onThemeChange}/>
          <button className="btn-ghost" onClick={()=>setShowAddMember(true)}>+ Member</button>
          <button className="btn-gold" onClick={openAddWedding}>+ Wedding</button>
          <button onClick={onLogout} style={{background:"none",border:`1px solid ${T.border2}`,color:T.textFaint,fontSize:11,padding:"6px 14px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Sign Out</button>
        </div>
      </div>

      <div style={{padding:"32px",maxWidth:1280,margin:"0 auto"}}>

        {/* DASHBOARD desktop — Feature 5 */}
        {view==="dashboard"&&(<div className="fade-in">
          <div style={{marginBottom:32}}>
            <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Overview</p>
            <h1 style={{fontSize:42,fontWeight:300,marginTop:4}}>Dashboard</h1>
          </div>

          {/* Team Portal Link */}
          <div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:6,padding:"16px 20px",marginBottom:32,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",marginBottom:4}}>Team Portal Link</p>
            <p style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{window.location.href.split("#")[0]}#{adminId==="legacy"?"team":`team-${adminId}`}</p></div>
            <button onClick={()=>navigator.clipboard.writeText(window.location.href.split("#")[0]+"#"+(adminId==="legacy"?"team":`team-${adminId}`))} style={{background:"#c9a96e22",border:"1px solid #c9a96e44",color:"#c9a96e",padding:"8px 16px",borderRadius:3,fontSize:12,fontFamily:"'DM Mono',monospace"}}>📋 Copy Link</button>
          </div>

          {/* Stats — 6 cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,marginBottom:36,flexWrap:"wrap"}}>
            {[
              {num:stats.totalMembers,label:"Team Members"},
              {num:stats.totalWeddings,label:"Weddings"},
              {num:stats.totalHires,label:"Total Hires"},
              {num:stats.confirmedHires,label:"Confirmed"},
              {num:stats.pendingHires,label:"Pending",alert:stats.pendingHires>0},
              {num:`₹${Math.round(stats.totalRevenue/1000)}k`,label:"Est. Revenue"},
            ].map((s,i)=>(
              <div key={i} style={{background:"#0e0c0a",border:`1px solid ${s.alert?"#fbbf2444":"#1e1a16"}`,borderRadius:6,padding:"20px 18px"}}>
                <div style={{fontSize:30,fontWeight:300,color:s.alert?"#fbbf24":"#c9a96e",lineHeight:1}}>{s.num}</div>
                <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:28}}>
            <div>
              {/* Search + Filter for dashboard events */}
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
                <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",whiteSpace:"nowrap"}}>Events</p>
                <input placeholder="Search by name, event or date…" value={dashSearch} onChange={e=>{setDashSearch(e.target.value);setDashPage(0);}} style={{flex:1,padding:"8px 12px",fontSize:13}}/>
                <select value={dashFilter} onChange={e=>{setDashFilter(e.target.value);setDashPage(0);}} style={{padding:"8px 12px",fontSize:12,width:130}}>
                  <option value="upcoming">Upcoming</option>
                  <option value="all">All</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div style={{maxHeight:520,overflowY:"auto",paddingRight:4}}>
                {dashEvents.map((e,i)=>{
                  const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,e.wedding,e.date)));
                  const isPast=e.date<today;
                  return (
                    <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(e.event)}`,borderRadius:4,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",opacity:isPast?0.6:1}} onClick={()=>{setSelectedWedding(e.wedding);setView("wedding-detail");}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:500}}>{e.weddingName}</div>
                        <div style={{fontSize:12,color:evColor(e.event),fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.event}</div>
                        <div style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:2}}>{e.date}{e.startTime&&` · ⏰ ${e.startTime}`}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{crew.length} crew</div>
                        {isPast&&<span style={{fontSize:9,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>PAST</span>}
                      </div>
                    </div>
                  );
                })}
                {allDashEvents.length===0&&<div style={{border:"1px dashed #1e1a16",borderRadius:4,padding:32,textAlign:"center",color:"#3a3028"}}>No events found</div>}
              </div>
              {/* Pagination */}
              {dashPages>1&&<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
                <button onClick={()=>setDashPage(p=>Math.max(0,p-1))} disabled={dashPage===0} style={{background:"#0e0c0a",border:"1px solid #2a2420",color:dashPage===0?"#3a3028":"#c9a96e",padding:"6px 16px",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:12}}>‹ Prev</button>
                <span style={{color:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace",padding:"6px 0"}}>{dashPage+1} / {dashPages} · {allDashEvents.length} total</span>
                <button onClick={()=>setDashPage(p=>Math.min(dashPages-1,p+1))} disabled={dashPage===dashPages-1} style={{background:"#0e0c0a",border:"1px solid #2a2420",color:dashPage===dashPages-1?"#3a3028":"#c9a96e",padding:"6px 16px",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:12}}>Next ›</button>
              </div>}
            </div>
            <div>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:16}}>Team Payout</p>
              {team.map(m=>{
                const total=m.hires.filter(h=>h.status==="Confirmed").reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);
                const paid=m.hires.filter(h=>h.paid).reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);
                const unpaid=total-paid;
                return(
                  <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:4,padding:"12px 16px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div><div style={{fontSize:14}}>{m.name}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>{m.hires.length} hires · ₹{m.rate?.toLocaleString("en-IN")}/day</div></div>
                      <div style={{fontSize:14,color:"#c9a96e"}}>₹{total.toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <div style={{flex:1,background:"#4ade8011",border:"1px solid #4ade8022",borderRadius:3,padding:"4px 8px",textAlign:"center"}}><div style={{fontSize:11,color:"#4ade80"}}>₹{paid.toLocaleString("en-IN")}</div><div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>PAID</div></div>
                      <div style={{flex:1,background:unpaid>0?"#f8717111":"#1a1612",border:`1px solid ${unpaid>0?"#f8717122":"#2a2420"}`,borderRadius:3,padding:"4px 8px",textAlign:"center"}}><div style={{fontSize:11,color:unpaid>0?"#f87171":"#3a3028"}}>₹{unpaid.toLocaleString("en-IN")}</div><div style={{fontSize:8,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>UNPAID</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* FEATURE 7: Credit on dashboard */}
          <div style={{marginTop:32,paddingTop:16,borderTop:"1px solid #1e1a16",textAlign:"center"}}><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BUILT BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</p></div>
        </div>)}

        {/* TEAM desktop */}
        {view==="team"&&(<div className="fade-in">
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}><div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Roster</p><h1 style={{fontSize:38,fontWeight:300}}>Team Members</h1></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {team.map(m=>(
              <div key={m.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"22px",cursor:"pointer"}} onClick={()=>{setSelectedMember(m);setView("member-detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:19,fontWeight:500,marginBottom:4}}>{m.name}</div><span className="tag" style={{background:"#c9a96e22",color:"#c9a96e"}}>{m.role}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate,portalPass:m.portalPass||""});setEditMember(m);}} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>EDIT</button>
                    <button onClick={e=>{e.stopPropagation();removeMember(m.id);}} style={{background:"none",border:"none",color:"#3a3028",fontSize:18,padding:4}}>×</button>
                  </div>
                </div>
                <div style={{marginTop:14,display:"flex",gap:20}}>
                  <div><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>{m.hires.length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>HIRES</div></div>
                  <div><div style={{fontSize:22,color:"#c9a96e",fontWeight:300}}>₹{m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0).toLocaleString("en-IN")}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>PAYOUT</div></div>
                  {m.hires.filter(h=>h.status==="Pending").length>0&&<div><div style={{fontSize:22,color:"#fbbf24",fontWeight:300}}>{m.hires.filter(h=>h.status==="Pending").length}</div><div style={{fontSize:10,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>PENDING</div></div>}
                </div>
                {m.phone&&<div style={{marginTop:8,fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>📞 {m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</div>}
                <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>{m.portalPass?<span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#4ade8088",background:"#4ade8011",border:"1px solid #4ade8022",padding:"2px 8px",borderRadius:2}}>🔐 Password Set</span>:<span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"#f8717188",background:"#f8717111",border:"1px solid #f8717122",padding:"2px 8px",borderRadius:2}}>⚠ No Password</span>}</div>
              </div>
            ))}
            <div style={{border:"1px dashed #2a2420",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",minHeight:150}} onClick={()=>setShowAddMember(true)}><span style={{color:"#3a3028",fontSize:32}}>+</span></div>
          </div>
        </div>)}

        {/* MEMBER DETAIL desktop */}
        {view==="member-detail"&&selectedMember&&(()=>{
          const m=team.find(t=>t.id===selectedMember.id)||selectedMember;
          return (<div className="fade-in">
            <button className="btn-ghost" style={{marginBottom:24}} onClick={()=>setView("team")}>← Back</button>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:4}}><h1 style={{fontSize:40,fontWeight:300}}>{m.name}</h1><button className="btn-ghost" onClick={()=>{setEditForm({name:m.name,role:m.role,phone:m.phone||"",rate:m.rate,portalPass:m.portalPass||""});setEditMember(m);}}>Edit</button></div>
            <p style={{color:"#5a5048",fontFamily:"'DM Mono',monospace",fontSize:13,marginBottom:24}}>{m.role} · {m.phone} · ₹{m.rate?.toLocaleString("en-IN")}/day</p>
            <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap"}}>
              {(()=>{
                const totalPay=m.hires.reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);
                const paidPay=m.hires.filter(h=>h.paid).reduce((s,h)=>s+m.rate*(h.dayType==="Half Day"?0.5:1),0);
                const unpaidPay=totalPay-paidPay;
                return [
                  {v:m.hires.length,l:"Assignments",c:"#c9a96e"},
                  {v:m.hires.filter(h=>h.status==="Confirmed").length,l:"Confirmed",c:"#c9a96e"},
                  {v:m.hires.filter(h=>h.status==="Pending").length,l:"Pending",c:"#fbbf24"},
                  {v:`₹${totalPay.toLocaleString("en-IN")}`,l:"Total Payout",c:"#c9a96e"},
                  {v:`₹${paidPay.toLocaleString("en-IN")}`,l:"Paid",c:"#4ade80"},
                  {v:`₹${unpaidPay.toLocaleString("en-IN")}`,l:"Unpaid",c:"#f87171",alert:unpaidPay>0},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#0e0c0a",border:`1px solid ${s.alert?"#f8717133":"#1e1a16"}`,borderRadius:4,padding:"16px 20px"}}>
                    <div style={{fontSize:22,fontWeight:300,color:s.c,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5048",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{s.l}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase"}}>Hire History</p>
              <button className="btn-ghost" onClick={()=>{setHireForm({wedding:"",selectedEventDays:[],status:"Pending",dayType:"Full Day",hireRole:m.role});setShowAddHire(m.id);}}>+ Add Hire</button>
            </div>
            {m.hires.length===0?<div style={{border:"1px dashed #1e1a16",borderRadius:4,padding:32,textAlign:"center",color:"#3a3028"}}>No hires yet</div>
            :[...m.hires].sort((a,b)=>a.date.localeCompare(b.date)).map((h,i)=>(
              <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(h.event)}`,borderRadius:4,padding:"16px 20px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div><div style={{fontSize:16,fontWeight:500}}>{h.wedding}</div><div style={{fontSize:13,color:evColor(h.event)}}>{h.event}</div><div style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginTop:4}}>{h.date} · {h.hireRole||m.role} · {h.dayType||"Full Day"} · ₹{(m.rate*(h.dayType==="Half Day"?0.5:1)).toLocaleString("en-IN")} {h.paid?<span style={{color:"#4ade80",fontSize:10,background:"#4ade8011",padding:"1px 7px",borderRadius:2,border:"1px solid #4ade8022"}}>PAID</span>:<span style={{color:"#f87171",fontSize:10,background:"#f8717111",padding:"1px 7px",borderRadius:2,border:"1px solid #f8717122"}}>UNPAID</span>}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:(STATUS_COLOR[h.status]||"#fbbf24")+"22",color:STATUS_COLOR[h.status]||"#fbbf24"}}>{h.status||"Pending"}</span>
                    {/* FEATURE 2: Admin quick confirm */}
                    {h.status==="Pending"&&<button onClick={()=>adminConfirmHire(m.id,m.hires.indexOf(h))} style={{background:"#4ade8022",border:"1px solid #4ade8044",color:"#4ade80",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>✓ Confirm</button>}
                    <button onClick={()=>toggleHirePaid(m.id,m.hires.indexOf(h))} style={{background:h.paid?"#4ade8022":"#f8717122",border:`1px solid ${h.paid?"#4ade8044":"#f8717144"}`,color:h.paid?"#4ade80":"#f87171",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>{h.paid?"✓ Paid":"Mark Paid"}</button>
                    <button onClick={()=>sendWAToMember(m,h)} style={{background:"#25D36622",border:"1px solid #25D36644",color:"#25D366",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WA</button>
                    <button onClick={()=>openEditHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"1px solid #2a2420",color:"#7a6f63",fontSize:11,padding:"4px 10px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>Edit</button>
                    <button onClick={()=>removeHire(m.id,m.hires.indexOf(h))} style={{background:"none",border:"none",color:"#3a3028",fontSize:18}}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>);
        })()}

        {/* WEDDINGS desktop — Features 3, 4, 8 */}
        {view==="weddings"&&(<div className="fade-in">
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
            <div><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Projects</p><h1 style={{fontSize:38,fontWeight:300}}>Events</h1></div>
            <button className="btn-gold" onClick={openAddWedding}>+ New Event</button>
          </div>
          {weddings.map(w=>{const assigned=team.filter(m=>m.hires.some(h=>hireBelongsToWedding(h,w)));return(
            <div key={w.id} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:6,padding:"24px 28px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{cursor:"pointer",flex:1}} onClick={()=>{setSelectedWedding(w);setView("wedding-detail");}}>
                  <h2 style={{fontSize:24,fontWeight:400,marginBottom:4}}>{w.name}</h2>
                  <p style={{color:"#7a6f63",fontSize:14,marginBottom:4}}>{w.bride} {w.bride&&w.groom?"&":""} {w.groom}{w.clientName&&!w.bride?w.clientName:""}</p>
                  {/* FEATURE 3: Google Maps link */}
                  {w.location&&(w.googleMapsLink
                    ?<a href={w.googleMapsLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{display:"inline-block",fontSize:13,color:"#60a5fa",textDecoration:"none",marginBottom:6}}>📍 {w.location} ↗ Open Maps</a>
                    :<p style={{fontSize:13,color:"#5a5048",marginBottom:6}}>📍 {w.location}</p>
                  )}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(w.eventDays||[]).map((ed,i)=><span key={i} className="tag" style={{background:evColor(ed.event)+"22",color:evColor(ed.event)}}>{ed.event}{ed.startTime?` ⏰ ${ed.startTime}`:""}</span>)}</div>
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

        {/* WEDDING DETAIL desktop — Features 3, 8 */}
        {view==="wedding-detail"&&selectedWedding&&(()=>{const w=weddings.find(x=>x.id===selectedWedding.id)||selectedWedding;return(
          <div className="fade-in">
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}><button className="btn-ghost" onClick={()=>setView("weddings")}>← Back</button><button className="btn-ghost" onClick={()=>openEditWedding(w)}>Edit</button></div>
            <h1 style={{fontSize:40,fontWeight:300,marginBottom:4}}>{w.name}</h1>
            <p style={{color:"#7a6f63",fontSize:16,marginBottom:4}}>{w.bride} {w.bride&&w.groom?"&":""} {w.groom}{w.clientName&&!w.bride?w.clientName:""}</p>
            {w.location&&(w.googleMapsLink
              ?<a href={w.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:14,color:"#60a5fa",textDecoration:"none",marginBottom:20}}>📍 {w.location} ↗ Open in Google Maps</a>
              :<p style={{fontSize:14,color:"#5a5048",marginBottom:20}}>📍 {w.location}</p>
            )}
            {(w.eventDays||[]).map((ed,i)=>{
              const crew=team.filter(m=>m.hires.some(h=>hireMatchesEvent(h,w,ed.date,ed.event)));
              const slots=ed.crewSlots||[];
              const totalSlots=slots.length;
              const filledSlots=slots.filter(s=>s.assignedMemberId).length;
              const sideLabel=ed.side==="bride"?"👰 Bride Side":ed.side==="groom"?"🤵 Groom Side":"";
              return(
                <div key={i} style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderLeft:`3px solid ${evColor(ed.event)}`,borderRadius:4,padding:"14px 20px",marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4,flexWrap:"wrap"}}>
                        <div style={{fontSize:15,fontWeight:500,color:evColor(ed.event)}}>{ed.event}</div>
                        {sideLabel&&<span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",background:"#c9a96e11",border:"1px solid #c9a96e33",padding:"2px 8px",borderRadius:2}}>{sideLabel}</span>}
                        <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>{ed.date}</div>
                        {(ed.startTime||ed.endTime)&&<div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>⏰ {ed.startTime||""}{ed.endTime?`–${ed.endTime}`:""}</div>}
                        {totalSlots>0&&<span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:filledSlots===totalSlots?"#4ade80":"#fbbf24",background:filledSlots===totalSlots?"#4ade8011":"#fbbf2411",border:`1px solid ${filledSlots===totalSlots?"#4ade8033":"#fbbf2433"}`,padding:"2px 8px",borderRadius:2}}>{filledSlots}/{totalSlots} slots filled</span>}
                      </div>
                      {ed.location&&<div style={{fontSize:12,color:"#60a5fa",fontFamily:"'DM Mono',monospace",marginBottom:8}}>📍 {ed.location}</div>}
                      {/* FEATURE 8: Crew slots visual */}
                      {slots.length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                          {slots.map(slot=>{
                            const roleInfo=CREW_SLOT_ROLES.find(r=>r.id===slot.role)||CREW_SLOT_ROLES[0];
                            const member=team.find(m=>m.id===slot.assignedMemberId);
                            return (
                              <div key={slot.id} style={{display:"flex",alignItems:"center",gap:4,background:member?roleInfo.color+"15":"#0a0a0a",border:`1px solid ${member?roleInfo.color+"44":"#2a2420"}`,borderRadius:4,padding:"4px 10px"}}>
                                <span style={{fontSize:13}}>{roleInfo.emoji}</span>
                                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:member?roleInfo.color:"#5a5048"}}>{member?member.name:"Empty"}</span>
                                {!member&&<span style={{fontSize:9,color:"#f87171",fontFamily:"'DM Mono',monospace"}}>NEEDED</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:240}}>
                      {crew.length===0?<span style={{fontSize:12,color:"#3a3028"}}>No crew hired</span>:crew.map(c=>{
                        const ch=c.hires.find(h=>hireMatchesEvent(h,w,ed.date));
                        return <span key={c.id} className="tag" style={{background:(STATUS_COLOR[ch?.status]||"#fbbf24")+"22",color:STATUS_COLOR[ch?.status]||"#fbbf24"}}>{c.name}</span>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );})()}

        {view==="calendar"&&(<div className="fade-in">
          <div style={{marginBottom:28}}><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Visual Planner</p><h1 style={{fontSize:38,fontWeight:300}}>Calendar</h1></div>
          <BigCalendar weddings={weddings} team={team} onEventClick={w=>{setSelectedWedding(w);setView("wedding-detail");}}/>
        </div>)}

        {/* PROFILE desktop — Feature 6 */}
        {view==="profile"&&(<div className="fade-in">
          <div style={{marginBottom:32}}><p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.18em",color:"#5a5048",textTransform:"uppercase"}}>Settings</p><h1 style={{fontSize:38,fontWeight:300}}>Profile</h1></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,maxWidth:1000}}>
            <div style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:28}}>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:20}}>Studio Info</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Your Name</label><input value={profile.adminName} onChange={e=>setProfile({...profile,adminName:e.target.value})} placeholder="Your full name"/></div>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Studio Name</label><input value={profile.studioName||""} onChange={e=>setProfile({...profile,studioName:e.target.value})} placeholder="Studio name"/></div>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>City</label><input value={profile.city||""} onChange={e=>setProfile({...profile,city:e.target.value})} placeholder="City"/></div>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>WhatsApp Number</label><input value={profile.waNumber||""} onChange={e=>setProfile({...profile,waNumber:e.target.value.replace(/[^0-9]/g,"")})} placeholder="919876543210"/><p style={{fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginTop:4}}>e.g. 919876543210</p></div>
                {/* FEATURE 6: Social / contact links */}
                <div style={{paddingTop:12,borderTop:"1px solid #1e1a16"}}>
                  <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Company / Social Links</p>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:4}}>📞 CONTACT NUMBER</label><input value={profile.phone||""} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="Phone / contact number"/></div>
                    <div>
                      <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:4}}>UPLOAD LOGO IMAGE</label>
                      <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                        {profile.studioLogo&&<img src={profile.studioLogo} alt="Studio logo preview" style={{width:58,height:58,borderRadius:"50%",objectFit:"cover",border:"1px solid #c9a96e44"}}/>}
                        <label style={{background:"#1a1612",border:"1px solid #c9a96e44",color:"#c9a96e",fontSize:12,padding:"10px 16px",borderRadius:5,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
                          Choose Image
                          <input type="file" accept="image/*" onChange={e=>handleLogoUpload(e.target.files?.[0])} style={{display:"none"}}/>
                        </label>
                        {profile.studioLogo&&<button onClick={()=>setProfile({...profile,studioLogo:""})} style={{background:"none",border:"1px solid #2a2420",color:"#f87171",fontSize:12,padding:"9px 14px",borderRadius:5,fontFamily:"'DM Mono',monospace"}}>Remove</button>}
                      </div>
                      <p style={{fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginTop:6}}>Saved in your profile and shown in crew portal.</p>
                    </div>
                    <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:4}}>🌐 WEBSITE</label><input value={profile.website||""} onChange={e=>setProfile({...profile,website:e.target.value})} placeholder="https://krunalfilms.in"/></div>
                    <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:4}}>📸 INSTAGRAM</label><input value={profile.instagram||""} onChange={e=>setProfile({...profile,instagram:e.target.value})} placeholder="@handle or full URL"/></div>
                    <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",display:"block",marginBottom:4}}>📘 FACEBOOK</label><input value={profile.facebook||""} onChange={e=>setProfile({...profile,facebook:e.target.value})} placeholder="Page or profile URL"/></div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{background:"#0e0c0a",border:"1px solid #1e1a16",borderRadius:8,padding:28}}>
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>WhatsApp Message Templates</p>
              <p style={{fontSize:11,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginBottom:20}}>Variables: {"{name}"} {"{wedding}"} {"{event}"} {"{date}"} {"{role}"} {"{dayType}"} {"{amount}"} {"{adminName}"}</p>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>📨 Booking Message (Admin → Crew)</label><textarea value={profile.msgBooking||""} onChange={e=>setProfile({...profile,msgBooking:e.target.value})} rows={5} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#4ade80",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>✓ Confirm Message (Crew → Admin)</label><textarea value={profile.msgConfirm||""} onChange={e=>setProfile({...profile,msgConfirm:e.target.value})} rows={4} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
                <div><label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#f87171",letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>✗ Decline Message (Crew → Admin)</label><textarea value={profile.msgDecline||""} onChange={e=>setProfile({...profile,msgDecline:e.target.value})} rows={4} style={{background:"#111",border:"1px solid #2a2420",color:"#e8e0d4",fontFamily:"'DM Mono',monospace",fontSize:12,padding:"10px 12px",borderRadius:6,outline:"none",width:"100%",resize:"vertical",lineHeight:1.6}}/></div>
              </div>
            </div>
          </div>
          <div style={{marginTop:16,background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:6,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1000}}>
            <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>✓ Changes save automatically to Firebase in real-time</span>
            {/* FEATURE 7: Credit in footer */}
            <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#2a2420",letterSpacing:"0.1em"}}>BUILT BY KRUNAL PRAJAPATI · KRUNALFILMS.IN</span>
          </div>
        </div>)}
      </div>
      {renderModals()}
    </div>
  );

  /* ── Shared Modals ── */
  function renderModals(){
    const mClass=isMobile?"overlay":"overlay modal-desktop";
    return (<>
      {/* ADD / EDIT WEDDING MODAL — Features 1, 3, 4, 8 */}
      {showAddWedding&&(<div className={mClass} onClick={()=>setShowAddWedding(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontSize:22,fontWeight:400}}>{editWedding?"Edit Event":"New Event"}</h2>
          <button onClick={()=>setShowAddWedding(false)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button>
        </div>

        {/* Event Type — only shown for new events (Feature 4: on edit keep type) */}
        {!editWedding&&(<div style={{marginBottom:16}}>
          <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Event Type</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {EVENT_TYPES.map(et=>(
              <button key={et.id} onClick={()=>setWForm(f=>({...f,eventType:et.id,bride:"",groom:"",clientName:"",eventDays:[]}))}
                style={{padding:"10px 12px",borderRadius:6,border:`1px solid ${wForm.eventType===et.id?et.color:"#2a2420"}`,background:wForm.eventType===et.id?et.color+"22":"#0e0c0a",color:wForm.eventType===et.id?et.color:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"left",cursor:"pointer"}}>
                {et.label}
              </button>
            ))}
          </div>
        </div>)}
        {editWedding&&(<div style={{marginBottom:12,padding:"8px 12px",background:"#c9a96e11",border:"1px solid #c9a96e33",borderRadius:4}}>
          <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{EVENT_TYPES.find(et=>et.id===wForm.eventType)?.label||"💍 Wedding"}</span>
        </div>)}

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Event / Project Name *" value={wForm.name} onChange={e=>setWForm({...wForm,name:e.target.value})}/>

          {wForm.eventType==="wedding"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <input placeholder="Bride's Name" value={wForm.bride||""} onChange={e=>setWForm({...wForm,bride:e.target.value})}/>
              <input placeholder="Groom's Name" value={wForm.groom||""} onChange={e=>setWForm({...wForm,groom:e.target.value})}/>
            </div>
          )}
          {wForm.eventType==="engagement"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <input placeholder="Partner 1 Name" value={wForm.bride||""} onChange={e=>setWForm({...wForm,bride:e.target.value})}/>
              <input placeholder="Partner 2 Name" value={wForm.groom||""} onChange={e=>setWForm({...wForm,groom:e.target.value})}/>
            </div>
          )}
          {(wForm.eventType==="babyshower"||wForm.eventType==="birthday"||wForm.eventType==="corporate"||wForm.eventType==="other")&&(
            <input placeholder={wForm.eventType==="corporate"?"Company / Client Name":"Client / Host Name"} value={wForm.clientName||""} onChange={e=>setWForm({...wForm,clientName:e.target.value})}/>
          )}

          <input placeholder="Location / Venue" value={wForm.location||""} onChange={e=>setWForm({...wForm,location:e.target.value})}/>
          {/* FEATURE 3: Google Maps link */}
          <div>
            <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#60a5fa",display:"block",marginBottom:5}}>📍 GOOGLE MAPS LINK (optional)</label>
            <input placeholder="Paste Google Maps URL — team will tap to navigate" value={wForm.googleMapsLink||""} onChange={e=>setWForm({...wForm,googleMapsLink:e.target.value})} style={{borderColor:wForm.googleMapsLink?"#60a5fa44":"#2a2420"}}/>
            <p style={{fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginTop:4}}>Tip: Open location in Google Maps → Share → Copy link</p>
          </div>

          <div><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Select Days</p><MiniCalendar selectedDates={wForm.selectedDates} onToggleDate={toggleWDate} bookedMap={bookedMap}/></div>
          {wForm.selectedDates.length>0&&(
            <EventAssigner
              selectedDates={wForm.selectedDates}
              eventDays={wForm.eventDays}
              setEventDays={fn=>setWForm(prev=>({...prev,eventDays:typeof fn==="function"?fn(prev.eventDays):fn}))}
              team={team}
              weddingName={wForm.name||editWedding?.name||null}
              eventType={wForm.eventType}
              onQuickHire={handleQuickHire}
            />
          )}
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn-gold" style={{flex:1}} onClick={saveWedding}>{editWedding?"Save Changes":"Save Event"}</button>
          <button className="btn-ghost" onClick={()=>setShowAddWedding(false)}>Cancel</button>
        </div>
      </div></div>)}

      {/* ADD MEMBER MODAL */}
      {showAddMember&&(<div className={mClass} onClick={()=>setShowAddMember(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:22,fontWeight:400}}>Add Member</h2><button onClick={()=>setShowAddMember(false)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Full Name" value={newMember.name} onChange={e=>setNewMember({...newMember,name:e.target.value})}/>
          <RoleSelect value={newMember.role} onChange={v=>setNewMember({...newMember,role:v})}/>
          <input placeholder="Phone Number" value={newMember.phone} onChange={e=>setNewMember({...newMember,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={newMember.rate} onChange={e=>setNewMember({...newMember,rate:e.target.value})}/>
          <div style={{paddingTop:8,borderTop:"1px solid #1e1a16"}}>
            <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>🔐 Portal Password</label>
            <input placeholder="Set crew portal password" value={newMember.portalPass||""} onChange={e=>setNewMember({...newMember,portalPass:e.target.value})}/>
            <p style={{fontSize:10,color:"#3a3028",fontFamily:"'DM Mono',monospace",marginTop:5}}>They use this to log in to crew portal.</p>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={addMember}>Add Member</button><button className="btn-ghost" onClick={()=>setShowAddMember(false)}>Cancel</button></div>
      </div></div>)}

      {/* EDIT MEMBER MODAL */}
      {editMember&&(<div className={mClass} onClick={()=>setEditMember(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:22,fontWeight:400}}>Edit Member</h2><button onClick={()=>setEditMember(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input placeholder="Full Name" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
          <RoleSelect value={editForm.role} onChange={v=>setEditForm({...editForm,role:v})}/>
          <input placeholder="Phone" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/>
          <input placeholder="Daily Rate (₹)" type="number" value={editForm.rate} onChange={e=>setEditForm({...editForm,rate:e.target.value})}/>
          <div style={{paddingTop:8,borderTop:"1px solid #1e1a16"}}>
            <label style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:6}}>🔐 Portal Password</label>
            <input placeholder="Set or update portal password" value={editForm.portalPass||""} onChange={e=>setEditForm({...editForm,portalPass:e.target.value})}/>
            {editMember?.portalPass?<p style={{fontSize:10,color:"#4ade8088",fontFamily:"'DM Mono',monospace",marginTop:5}}>✓ Password is set. Change here or leave to keep.</p>:<p style={{fontSize:10,color:"#f8717188",fontFamily:"'DM Mono',monospace",marginTop:5}}>⚠ No password set. Add one so they can log in.</p>}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={saveEditMember}>Save Changes</button><button className="btn-ghost" onClick={()=>setEditMember(null)}>Cancel</button></div>
      </div></div>)}

      {/* ADD HIRE MODAL — Feature 1: time shown for event days */}
      {showAddHire&&(()=>{const m=team.find(x=>x.id===showAddHire);const eventDays=getWeddingEventDays(hireForm.wedding);return(
        <div className={mClass} onClick={()=>setShowAddHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:400}}>Add Hire · {m?.name.split(" ")[0]}</h2><button onClick={()=>setShowAddHire(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <select value={hireForm.wedding} onChange={e=>setHireForm({...hireForm,wedding:e.target.value,selectedEventDays:[]})}><option value="">Select Event</option>{weddings.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
            {hireForm.wedding&&eventDays.length>0&&(<div>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Select Days</p>
              {eventDays.map((ed,i)=>{const key=`${ed.date}|${ed.event}`;const isSel=hireForm.selectedEventDays.includes(key);return(
                <div key={i} onClick={()=>toggleEventDay(key)} style={{background:isSel?"#c9a96e11":"#0e0c0a",border:`1px solid ${isSel?"#c9a96e":"#1e1a16"}`,borderRadius:4,padding:"12px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:isSel?"#c9a96e":"#e8e0d4"}}>{ed.date}</span>
                    <span style={{fontSize:12,color:evColor(ed.event),marginLeft:10}}>{ed.event}</span>
                    {/* FEATURE 1: Show time in hire modal */}
                    {(ed.startTime||ed.endTime)&&<span style={{fontSize:11,color:"#5a5048",fontFamily:"'DM Mono',monospace",marginLeft:10}}>⏰ {ed.startTime||""}{ed.endTime?`–${ed.endTime}`:""}</span>}
                  </div>
                  <div style={{width:18,height:18,borderRadius:3,border:`1px solid ${isSel?"#c9a96e":"#3a3028"}`,background:isSel?"#c9a96e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0a",fontSize:12,fontWeight:"bold"}}>{isSel?"✓":""}</div>
                </div>
              );})}
              <p style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e"}}>{hireForm.selectedEventDays.length} days selected</p>
            </div>)}
            <div><p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Day Type</p>
              <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setHireForm({...hireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${hireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:hireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:hireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            </div>
            <RoleSelect value={hireForm.hireRole} onChange={v=>setHireForm({...hireForm,hireRole:v})}/>
            <div>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",marginBottom:8}}>Booking Status</p>
              <div style={{display:"flex",gap:8}}>
                {["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setHireForm({...hireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${hireForm.status===s?STATUS_COLOR[s]:"#2a2420"}`,background:hireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:hireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}
              </div>
            </div>
            {hireForm.selectedEventDays.length>0&&m&&<div style={{background:"#0e0c0a",border:"1px solid #c9a96e33",borderRadius:4,padding:"12px 16px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#5a5048",fontFamily:"'DM Mono',monospace"}}>Total ({hireForm.selectedEventDays.length} days)</span><span style={{fontSize:16,color:"#c9a96e",fontWeight:300}}>₹{(m.rate*(hireForm.dayType==="Half Day"?0.5:1)*hireForm.selectedEventDays.length).toLocaleString("en-IN")}</span></div>}
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-gold" style={{flex:1}} onClick={()=>addBulkHire(showAddHire)}>Assign{hireForm.selectedEventDays.length>0?` (${hireForm.selectedEventDays.length})`:""}</button><button className="btn-ghost" onClick={()=>setShowAddHire(null)}>Cancel</button></div>
        </div></div>
      );})()}

      {/* EDIT HIRE MODAL */}
      {editHire&&(()=>{const m=team.find(x=>x.id===editHire.memberId);const h=m?.hires[editHire.hireIdx];if(!h)return null;return(
        <div className={mClass} onClick={()=>setEditHire(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:400}}>Edit Hire</h2><button onClick={()=>setEditHire(null)} style={{background:"none",border:"none",color:"#5a5048",fontSize:22}}>×</button></div>
          <p style={{color:"#c9a96e",fontSize:12,fontFamily:"'DM Mono',monospace",marginBottom:20}}>{h.wedding} · {h.event} · {h.date}</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8}}>{["Full Day","Half Day"].map(dt=><button key={dt} onClick={()=>setEditHireForm({...editHireForm,dayType:dt})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${editHireForm.dayType===dt?"#c9a96e":"#2a2420"}`,background:editHireForm.dayType===dt?"#c9a96e22":"#0e0c0a",color:editHireForm.dayType===dt?"#c9a96e":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{dt}</button>)}</div>
            <RoleSelect value={editHireForm.hireRole} onChange={v=>setEditHireForm({...editHireForm,hireRole:v})}/>
            <div style={{display:"flex",gap:8}}>{["Confirmed","Pending","Declined"].map(s=><button key={s} onClick={()=>setEditHireForm({...editHireForm,status:s})} style={{flex:1,padding:"8px",borderRadius:4,border:`1px solid ${editHireForm.status===s?STATUS_COLOR[s]:"#2a2420"}`,background:editHireForm.status===s?STATUS_COLOR[s]+"22":"#0e0c0a",color:editHireForm.status===s?STATUS_COLOR[s]:"#5a5048",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s}</button>)}</div>
            <div style={{borderTop:"1px solid #1e1a16",paddingTop:12}}>
              <p style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#5a5048",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>Payment Status</p>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setEditHireForm({...editHireForm,paid:false})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${!editHireForm.paid?"#f87171":"#2a2420"}`,background:!editHireForm.paid?"#f8717122":"#0e0c0a",color:!editHireForm.paid?"#f87171":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>Unpaid</button>
                <button onClick={()=>setEditHireForm({...editHireForm,paid:true})} style={{flex:1,padding:"10px",borderRadius:4,border:`1px solid ${editHireForm.paid?"#4ade80":"#2a2420"}`,background:editHireForm.paid?"#4ade8022":"#0e0c0a",color:editHireForm.paid?"#4ade80":"#5a5048",fontSize:13,fontFamily:"'DM Mono',monospace"}}>✓ Paid</button>
              </div>
            </div>
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
  const hash=window.location.hash;
  const isTeamView=hash.startsWith("#team");
  const hashAdminId=hash.startsWith("#team-")?hash.replace("#team-",""):"legacy";
  const [session,setSession]=useState(()=>loadState("crew_session",null));
  const [splashDone,setSplashDone]=useState(()=>sessionStorage.getItem("crew_splash_done")==="1");
  const [themeId,setThemeId]=useState(()=>loadState("crew_theme","golden"));
  const theme=THEMES[themeId]||THEMES.golden;
  const normalizeTeam=t=>(Array.isArray(t)?t:Object.values(t||{})).map(m=>({...m,hires:Array.isArray(m.hires)?m.hires:Object.values(m.hires||{})}));
  const teamKey=hashAdminId==="legacy"?"crew_team":`crew_team_${hashAdminId}`;
  const weddingsKey=hashAdminId==="legacy"?"crew_weddings":`crew_weddings_${hashAdminId}`;
  const profileKey=hashAdminId==="legacy"?"crew_profile":`crew_profile_${hashAdminId}`;
  const [teamData,setTeamData]=useState(()=>normalizeTeam(loadState(teamKey,INITIAL_TEAM)));
  const [weddingsData,setWeddingsData]=useState(()=>loadState(weddingsKey,[]));
  const [portalReady,setPortalReady]=useState(!isTeamView||!USE_FIREBASE);
  const [profileData,setProfileData]=useState(()=>loadState(profileKey,{adminName:"Krunal Prajapati",waNumber:"919876543210",studioName:"Krunalfilms"}));

  function handleSplashDone(){setSplashDone(true);sessionStorage.setItem("crew_splash_done","1");}
  function handleThemeChange(id){setThemeId(id);saveState("crew_theme",id);}

  // Favicon injection — works in all browsers (Chrome, Safari, mobile)
  useEffect(()=>{
    const svgFavicon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0e0c0a"/><text x="32" y="46" font-size="36" text-anchor="middle">🎬</text><rect x="8" y="52" width="48" height="3" rx="1.5" fill="#c9a96e" opacity="0.7"/></svg>`;
    const encoded=`data:image/svg+xml,${encodeURIComponent(svgFavicon)}`;
    // Remove existing favicons
    document.querySelectorAll("link[rel*='icon']").forEach(el=>el.remove());
    // Add new ones for all browsers
    ["icon","shortcut icon","apple-touch-icon"].forEach(rel=>{
      const link=document.createElement("link");
      link.rel=rel; link.href=encoded; link.type="image/svg+xml";
      document.head.appendChild(link);
    });
    document.title="Crew Studio";
  },[]);

  useEffect(()=>{
    if(!isTeamView||!USE_FIREBASE)return;
    (async()=>{
      const [fbTeam,fbWeddings,fbProfile]=await Promise.all([fbGet(teamKey),fbGet(weddingsKey),fbGet(profileKey)]);
      if(fbTeam) setTeamData(normalizeTeam(fbTeam));
      if(fbWeddings) setWeddingsData(Array.isArray(fbWeddings)?fbWeddings:Object.values(fbWeddings||{}));
      if(fbProfile) setProfileData(fbProfile);
      setPortalReady(true);
    })();
  },[]);

  async function confirmPortalHire(memberId, hireToConfirm) {
    const nextTeam=teamData.map(member=>{
      if(member.id!==memberId) return member;
      const hires=(member.hires||[]).map(h=>{
        const sameSlot=hireToConfirm.slotId&&h.slotId===hireToConfirm.slotId;
        const sameBooking=(h.weddingId&&hireToConfirm.weddingId
          ? String(h.weddingId)===String(hireToConfirm.weddingId)
          : h.wedding===hireToConfirm.wedding) && h.date===hireToConfirm.date && h.event===hireToConfirm.event;
        return sameSlot||sameBooking?{...h,status:"Confirmed"}:h;
      });
      return {...member,hires};
    });
    setTeamData(nextTeam);
    saveState(teamKey,nextTeam);
    if(USE_FIREBASE) await fbSet(teamKey,nextTeam);
  }

  if(!splashDone) return <SplashScreen onDone={handleSplashDone}/>;

  if(isTeamView){
    if(!portalReady) return(
      <ThemeCtx.Provider value={theme}>
      <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Mono',monospace",color:"#5a5048"}}>
        <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
        <div style={{width:36,height:36,border:"2px solid #2a2420",borderTopColor:"#c9a96e",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
        <p style={{fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase"}}>Loading your schedule…</p>
      </div>
      </ThemeCtx.Provider>
    );
    return <ThemeCtx.Provider value={theme}><TeamView team={teamData} weddings={weddingsData} adminProfile={profileData} onConfirmHire={confirmPortalHire}/></ThemeCtx.Provider>;
  }

  if(!session?.loggedIn) return <ThemeCtx.Provider value={theme}><AuthPage onLogin={user=>setSession(user)}/></ThemeCtx.Provider>;
  return <ThemeCtx.Provider value={theme}><AdminApp user={session} theme={theme} onThemeChange={handleThemeChange} onLogout={()=>{saveState("crew_session",null);setSession(null);}}/></ThemeCtx.Provider>;
}
