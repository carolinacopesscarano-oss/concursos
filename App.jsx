import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";

const MONTHS_ORDER = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const BG      = "#0A0A08";
const CARD    = "#0F0F0C";
const CARD2   = "#141410";
const BORDER  = "#2A2820";
const GOLD    = "#C9A84C";
const GOLD_LT = "#E2C46A";
const GOLD_DK = "#8B6914";
const GOLD_DIM = "rgba(201,168,76,0.38)";

const INITIAL_CONTESTS = [
  { id:1,  month:"Mayo",       name:"Intrepid Times",            genre:"Travel nonfiction",        prize:"$500 USD",               fee:"Gratis",  deadline:"2026-05-15", deadlineDisplay:"15 mayo",                   resultDate:"2026-06-15", notes:"1.800–2.500 palabras. Tema: When Things Fall Apart.", url:"https://intrepidtimes.com/when-things-fall-apart-2026-travel-writing-competition-500-prize-free-entry/", status:"pendiente", myNotes:"" },
  { id:2,  month:"Junio",      name:"The Moth Short Story Prize", genre:"Cuento literario",         prize:"€3.000 + pub Irish Times", fee:"€17",    deadline:"2026-06-15", deadlineDisplay:"15 junio",                  resultDate:"2026-08-15", notes:"Hasta 3.000 palabras. Juez: Wendy Erskine. Lectura anónima.", url:"https://www.themothmagazine.com/directory/the-moth-short-story-prize", status:"pendiente", myNotes:"" },
  { id:3,  month:"Junio",      name:"Narrative Magazine",         genre:"Ficción o nonfiction",     prize:"$2.500 USD",              fee:"$27 USD", deadline:"2026-06-26", deadlineDisplay:"26 junio",                  resultDate:"",           notes:"Hasta 15.000 palabras. Tus ensayos de Sudáfrica o migración encajan.", url:"https://www.narrativemagazine.com/", status:"pendiente", myNotes:"" },
  { id:4,  month:"Junio",      name:"Frazzled Lit",               genre:"Cuento",                   prize:"€1.800 total",            fee:"€12",    deadline:"2026-06-30", deadlineDisplay:"30 junio",                  resultDate:"",           notes:"Juez: Donal Ryan. Lectura anónima. Sin tema específico.", url:"https://www.frazzledlit.com/p/frazzled-lit-short-story-award-2026", status:"pendiente", myNotes:"" },
  { id:5,  month:"Julio",      name:"Seán Ó Faoláin",             genre:"Cuento literario",         prize:"€2.000 + viaje a Cork",   fee:"~€19",   deadline:"2026-07-31", deadlineDisplay:"31 julio",                  resultDate:"2026-10-18", notes:"Hasta 3.000 palabras. El ganador lee en el Cork International Short Story Festival.", url:"https://munsterlit.ie/ofaolain-competition/", status:"pendiente", myNotes:"" },
  { id:6,  month:"Agosto",     name:"Kenyon Review",              genre:"Nonfiction literaria",     prize:"Publicación élite",       fee:"Gratis",  deadline:"2026-08-31", deadlineDisplay:"Agosto (a confirmar)",      resultDate:"",           notes:"Verificar convocatoria activa 2026. Una de las mejores revistas del mundo.", url:"https://kenyonreview.org/", status:"pendiente", myNotes:"" },
  { id:7,  month:"Agosto",     name:"World Nomads",               genre:"Travel writing",           prize:"Viaje + mentoría",        fee:"Gratis",  deadline:"2026-08-31", deadlineDisplay:"Agosto (a confirmar)",      resultDate:"",           notes:"Verificar convocatoria activa 2026. Tu historia de África encaja perfectamente.", url:"https://www.worldnomads.com/", status:"pendiente", myNotes:"" },
  { id:8,  month:"Septiembre", name:"The Moth Nature Writing",    genre:"Prosa o poesía",           prize:"€1.000 + semana Irlanda", fee:"€16",    deadline:"2026-09-30", deadlineDisplay:"30 septiembre",             resultDate:"2026-12-15", notes:"Hasta 4.000 palabras. Tu texto de Kruger/baobab es candidato natural.", url:"https://www.themothmagazine.com/about-the-moth-nature-writing-prize", status:"pendiente", myNotes:"" },
  { id:9,  month:"Octubre",    name:"Ghost Story Award",          genre:"Terror / Realismo mágico", prize:"$1.500 USD",              fee:"$20 USD", deadline:"2026-10-31", deadlineDisplay:"~31 octubre",               resultDate:"2026-12-01", notes:"1.500–10.000 palabras. Tu entrada al género oscuro. Bianual.", url:"https://theghoststory.com/", status:"pendiente", myNotes:"" },
  { id:10, month:"Octubre",    name:"Tom Howard / John H. Reid",  genre:"Ficción o ensayo",         prize:"$3.500 USD",              fee:"$25 USD", deadline:"2027-05-01", deadlineDisplay:"Abre 15 oct — cierra mayo 2027", resultDate:"2027-10-15", notes:"Hasta 6.000 palabras. Acepta publicado e inédito. Envío simultáneo OK.", url:"https://winningwriters.com/our-contests/tom-howard-john-h-reid-fiction-essay-contest", status:"pendiente", myNotes:"" },
  { id:11, month:"Noviembre",  name:"Anthology Travel",           genre:"Travel narrative",         prize:"€500",                   fee:"€15",    deadline:"2026-11-30", deadlineDisplay:"30 noviembre",              resultDate:"",           notes:"Atmósfera y narrativa envolvente. Bueno para piezas cortas.", url:"#", status:"pendiente", myNotes:"" },
  { id:12, month:"Noviembre",  name:"Tadpole Press",              genre:"Cualquier género",         prize:"$2.000 USD",             fee:"$15 USD", deadline:"2026-11-30", deadlineDisplay:"30 noviembre",              resultDate:"",           notes:"Máximo 100 palabras incluyendo título. Ejercicio de precisión extrema.", url:"https://tadpolepress.com/", status:"pendiente", myNotes:"" },
  { id:13, month:"Diciembre",  name:"Narratively Memoir Prize",   genre:"Nonfiction primera persona",prize:"$3.000 USD",            fee:"$20 USD", deadline:"2026-12-31", deadlineDisplay:"~Diciembre (a confirmar)",  resultDate:"",           notes:"2.000–5.000 palabras. Voces latinoamericanas subrepresentadas.", url:"https://narratively.com/", status:"pendiente", myNotes:"" },
];

const STATUS_OPTIONS = [
  { value:"pendiente",   label:"Pendiente"     },
  { value:"escribiendo", label:"✎ Escribiendo" },
  { value:"enviado",     label:"✈ Enviado"     },
  { value:"finalista",   label:"★ Finalista"   },
  { value:"ganado",      label:"🏆 Ganado"     },
  { value:"rechazado",   label:"× Rechazado"   },
  { value:"descartado",  label:"— Descartado"  },
];

const EMPTY = { name:"", month:"Mayo", genre:"", prize:"", fee:"", deadline:"", deadlineDisplay:"", resultDate:"", notes:"", url:"", status:"pendiente", myNotes:"" };

const SHIMMER_CSS = `
@keyframes shimmer-title {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes shimmer-line {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.shimmer-title {
  background: linear-gradient(90deg, ${GOLD_DK} 0%, ${GOLD_DK} 30%, ${GOLD_LT} 45%, #FFF8DC 50%, ${GOLD_LT} 55%, ${GOLD_DK} 70%, ${GOLD_DK} 100%);
  background-size: 600px 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer-title 3.5s ease-in-out infinite;
}
.shimmer-line {
  background: linear-gradient(90deg, ${GOLD_DK} 0%, ${GOLD} 35%, ${GOLD_LT} 48%, #FFFACD 50%, ${GOLD_LT} 52%, ${GOLD} 65%, ${GOLD_DK} 100%);
  background-size: 400px 100%;
  animation: shimmer-line 2.8s ease-in-out infinite;
}
* { box-sizing: border-box; }
`;

function getDays(dl) {
  if (!dl) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.ceil((new Date(dl)-t)/86400000);
}

function Urgency({ deadline, status }) {
  if (["enviado","ganado","rechazado","descartado"].includes(status)) return null;
  const d = getDays(deadline);
  if (!d||d<0||d>21) return null;
  return (
    <span style={{ fontFamily:"sans-serif", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, border:`1px solid ${d<=7?"rgba(201,168,76,0.8)":"rgba(201,168,76,0.4)"}`, background:d<=7?"rgba(201,168,76,0.15)":"transparent", color:GOLD }}>
      {d===0?"¡HOY!":d<=7?`¡${d}d!`:`${d}d`}
    </span>
  );
}

const inputSt = { width:"100%", padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:6, fontFamily:"Georgia,serif", fontSize:13, background:"#0A0A08", color:GOLD, outline:"none", boxSizing:"border-box" };
const labelSt = { fontFamily:"sans-serif", fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:GOLD_DIM, display:"block", marginBottom:5 };

export default function App() {
  const [contests, setContests]     = useState(INITIAL_CONTESTS);
  const [expanded, setExpanded]     = useState(null);
  const [fStatus,  setFStatus]      = useState("all");
  const [fMonth,   setFMonth]       = useState("all");
  const [showAdd,  setShowAdd]      = useState(false);
  const [newC,     setNewC]         = useState(EMPTY);
  const [saveStatus, setSaveStatus] = useState("cargando");
  const [delConfirm, setDelConfirm] = useState(null);
  const timer = useRef(null);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = SHIMMER_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("concursos")
          .select("data")
          .eq("id", 1)
          .single();
        if (!error && data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setContests(data.data);
        }
        setSaveStatus("guardado");
      } catch {
        setSaveStatus("guardado");
      }
    })();
  }, []);

  // Auto-save to Supabase
  const save = useCallback(async (data) => {
    setSaveStatus("guardando");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await supabase.from("concursos").upsert({ id: 1, data, updated_at: new Date().toISOString() });
        setSaveStatus("guardado");
      } catch {
        setSaveStatus("error");
      }
    }, 900);
  }, []);

  const upd = useCallback((id, f, v) => {
    setContests(p => {
      const next = p.map(c => c.id === id ? {...c, [f]: v} : c);
      save(next);
      return next;
    });
  }, [save]);

  const del = useCallback(id => {
    setContests(p => {
      const next = p.filter(c => c.id !== id);
      save(next);
      return next;
    });
    setExpanded(null);
    setDelConfirm(null);
  }, [save]);

  const add = useCallback(() => {
    if (!newC.name.trim()) return;
    setContests(p => {
      const next = [...p, { ...newC, id: Date.now() }];
      save(next);
      return next;
    });
    setNewC(EMPTY);
    setShowAdd(false);
  }, [newC, save]);

  const exportJSON = () => {
    const b = new Blob([JSON.stringify(contests,null,2)],{type:"application/json"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download="catsu-concursos-2026.json"; a.click();
  };
  const exportCSV = () => {
    const h = ["Mes","Nombre","Género","Premio","Fee","Deadline","Fallo","Estado","Notas","URL"];
    const rows = contests.map(c=>[c.month,c.name,c.genre,c.prize,c.fee,c.deadlineDisplay||c.deadline,c.resultDate||"—",c.status,c.myNotes.replace(/,/g," "),c.url]);
    const csv = [h,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const b = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download="catsu-concursos-2026.csv"; a.click();
  };

  const months     = [...new Set(contests.map(c=>c.month))].sort((a,b)=>MONTHS_ORDER.indexOf(a)-MONTHS_ORDER.indexOf(b));
  const filtered   = contests.filter(c=>(fStatus==="all"||c.status===fStatus)&&(fMonth==="all"||c.month===fMonth));
  const monthsView = [...new Set(filtered.map(c=>c.month))].sort((a,b)=>MONTHS_ORDER.indexOf(a)-MONTHS_ORDER.indexOf(b));
  const cnts       = Object.fromEntries(STATUS_OPTIONS.map(s=>[s.value,contests.filter(c=>c.status===s.value).length]));

  const chip = active => ({
    fontFamily:"sans-serif", fontSize:10, padding:"4px 13px",
    border:`1px solid ${active?GOLD:BORDER}`, borderRadius:20,
    background:active?"rgba(201,168,76,0.1)":"transparent",
    color:active?GOLD:GOLD_DIM, cursor:"pointer", fontWeight:active?700:400,
    transition:"all 0.15s",
  });

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"Georgia,'Times New Roman',serif", color:GOLD }}>

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:"36px 28px 28px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <p style={{ margin:"0 0 10px", fontFamily:"sans-serif", fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase", color:GOLD_DIM }}>Catsu · 2026</p>
          <h1 className="shimmer-title" style={{ margin:"0 0 6px", fontSize:"clamp(30px,5vw,44px)", fontWeight:"normal", letterSpacing:"-0.02em", lineHeight:1.05, fontFamily:"Georgia,'Times New Roman',serif" }}>
            Mis concursos<br/><em>literarios</em>
          </h1>
          <div className="shimmer-line" style={{ height:1, width:"100%", margin:"16px 0 18px", borderRadius:1 }}/>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-end" }}>
            {[{l:"Total",v:contests.length},{l:"Enviados",v:cnts.enviado||0},{l:"Escribiendo",v:cnts.escribiendo||0},{l:"Ganados",v:cnts.ganado||0}].map(s=>(
              <div key={s.l}>
                <span style={{ fontFamily:"sans-serif", fontSize:22, fontWeight:800, color:GOLD }}>{s.v}</span>
                <span style={{ fontFamily:"sans-serif", fontSize:9, color:GOLD_DIM, marginLeft:6, letterSpacing:"0.1em", textTransform:"uppercase" }}>{s.l}</span>
              </div>
            ))}
            <div style={{ flex:1 }}/>
            <div style={{ fontFamily:"sans-serif", fontSize:10, color:GOLD_DIM, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background: saveStatus==="guardado"?GOLD_DK: saveStatus==="guardando"?GOLD:"#555", display:"inline-block" }}/>
              {saveStatus==="guardado"?"Guardado ☁": saveStatus==="guardando"?"Guardando…": saveStatus==="cargando"?"Cargando…":"Error"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px 80px" }}>

        {/* Controls */}
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={exportJSON} style={{ fontFamily:"sans-serif", fontSize:11, padding:"6px 14px", border:`1px solid ${BORDER}`, borderRadius:6, background:"transparent", cursor:"pointer", color:GOLD_DIM }}>↓ JSON</button>
          <button onClick={exportCSV}  style={{ fontFamily:"sans-serif", fontSize:11, padding:"6px 14px", border:`1px solid ${BORDER}`, borderRadius:6, background:"transparent", cursor:"pointer", color:GOLD_DIM }}>↓ CSV</button>
          <div style={{flex:1}}/>
          <button onClick={()=>setShowAdd(true)} style={{ fontFamily:"sans-serif", fontSize:11, padding:"7px 18px", border:`1px solid ${GOLD}`, borderRadius:6, background:"rgba(201,168,76,0.08)", color:GOLD, cursor:"pointer", fontWeight:700 }}>+ Agregar</button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ border:`1px solid ${BORDER}`, borderRadius:10, marginBottom:22, overflow:"hidden", background:CARD }}>
            <div className="shimmer-line" style={{ height:2 }}/>
            <div style={{ padding:18 }}>
              <p style={{ margin:"0 0 14px", fontFamily:"sans-serif", fontSize:9, color:GOLD_DIM, letterSpacing:"0.18em", textTransform:"uppercase" }}>Nuevo concurso</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[{f:"name",l:"Nombre *",full:true},{f:"month",l:"Mes",sel:MONTHS_ORDER},{f:"genre",l:"Género"},{f:"prize",l:"Premio"},{f:"fee",l:"Fee"},{f:"deadline",l:"Deadline (AAAA-MM-DD)"},{f:"deadlineDisplay",l:"Deadline (texto)"},{f:"resultDate",l:"Fecha de fallo"},{f:"url",l:"URL",full:true},{f:"notes",l:"Descripción",ta:true,full:true}].map(x=>(
                  <div key={x.f} style={{ gridColumn:x.full?"1/-1":"auto" }}>
                    <label style={labelSt}>{x.l}</label>
                    {x.sel ? <select value={newC[x.f]} onChange={e=>setNewC(p=>({...p,[x.f]:e.target.value}))} style={inputSt}>{x.sel.map(o=><option key={o} style={{background:BG}}>{o}</option>)}</select>
                    : x.ta  ? <textarea value={newC[x.f]} onChange={e=>setNewC(p=>({...p,[x.f]:e.target.value}))} rows={2} style={{...inputSt,resize:"vertical"}}/>
                    :          <input value={newC[x.f]} onChange={e=>setNewC(p=>({...p,[x.f]:e.target.value}))} style={inputSt}/>}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                <button onClick={add} style={{ fontFamily:"sans-serif", fontSize:11, padding:"7px 18px", border:`1px solid ${GOLD}`, borderRadius:6, background:"rgba(201,168,76,0.1)", color:GOLD, cursor:"pointer", fontWeight:700 }}>Agregar</button>
                <button onClick={()=>{setShowAdd(false);setNewC(EMPTY);}} style={{ fontFamily:"sans-serif", fontSize:11, padding:"7px 14px", border:`1px solid ${BORDER}`, borderRadius:6, background:"transparent", cursor:"pointer", color:GOLD_DIM }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Status filters */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
          <button onClick={()=>setFStatus("all")} style={chip(fStatus==="all")}>Todos</button>
          {STATUS_OPTIONS.map(s=>(
            <button key={s.value} onClick={()=>setFStatus(s.value)} style={chip(fStatus===s.value)}>
              {s.label}{cnts[s.value]>0&&<span style={{opacity:.45}}> {cnts[s.value]}</span>}
            </button>
          ))}
        </div>

        {/* Month filters */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:30 }}>
          {["all",...months].map(m=>{
            const active = fMonth===m;
            return <button key={m} onClick={()=>setFMonth(m)} style={{ fontFamily:"sans-serif", fontSize:10, padding:"3px 10px", border:"none", borderRadius:4, background:active?"rgba(201,168,76,0.1)":"transparent", color:active?GOLD:GOLD_DIM, cursor:"pointer", fontWeight:active?700:400 }}>{m==="all"?"Todos los meses":m}</button>;
          })}
        </div>

        {/* List */}
        {monthsView.map(month=>{
          const mc = filtered.filter(c=>c.month===month);
          return (
            <div key={month} style={{ marginBottom:30 }}>
              <p style={{ margin:"0 0 8px", fontFamily:"sans-serif", fontSize:9, letterSpacing:"0.26em", textTransform:"uppercase", color:GOLD_DIM, fontWeight:700 }}>{month}</p>
              <div style={{ height:1, background:`linear-gradient(90deg, ${GOLD_DK}, transparent)`, marginBottom:8 }}/>
              <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                {mc.map((contest,ci)=>{
                  const isExp   = expanded===contest.id;
                  const isDisc  = contest.status==="descartado";
                  const st      = STATUS_OPTIONS.find(s=>s.value===contest.status)||STATUS_OPTIONS[0];
                  const isFirst = ci===0, isLast=ci===mc.length-1;
                  const br      = isFirst&&isLast?"6px": isFirst?"6px 6px 1px 1px": isLast?"1px 1px 6px 6px":"1px";

                  return (
                    <div key={contest.id} style={{ background:isExp?CARD2:CARD, border:`1px solid ${isExp?"rgba(201,168,76,0.3)":BORDER}`, borderRadius:br, overflow:"hidden", opacity:isDisc?0.28:1, transition:"all 0.15s" }}>

                      <div onClick={()=>setExpanded(isExp?null:contest.id)} style={{ display:"flex", alignItems:"center", cursor:"pointer", padding:"12px 14px" }}>
                        <div style={{ width:1, alignSelf:"stretch", background:isExp?GOLD:GOLD_DK, marginRight:14, flexShrink:0, opacity:isExp?1:0.4 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontSize:14, color:GOLD, fontWeight:isExp?"bold":"normal" }}>{contest.name}</span>
                            <Urgency deadline={contest.deadline} status={contest.status}/>
                          </div>
                          <div style={{ fontFamily:"sans-serif", fontSize:10, color:GOLD_DIM, display:"flex", gap:7, flexWrap:"wrap" }}>
                            <span>{contest.genre}</span><span>·</span>
                            <span>{contest.deadlineDisplay||contest.deadline}</span>
                            {contest.resultDate&&<><span>·</span><span>fallo {contest.resultDate}</span></>}
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0, marginRight:12 }}>
                          <div style={{ fontFamily:"sans-serif", fontSize:12, fontWeight:800, color:GOLD }}>{contest.prize}</div>
                          <span style={{ fontFamily:"sans-serif", fontSize:9, padding:"2px 8px", borderRadius:20, border:`1px solid ${BORDER}`, color:GOLD_DIM }}>{st.label}</span>
                        </div>
                        <span style={{ fontFamily:"sans-serif", fontSize:9, color:GOLD_DIM, flexShrink:0 }}>{isExp?"▲":"▼"}</span>
                      </div>

                      {isExp&&(
                        <div style={{ borderTop:`1px solid ${BORDER}`, padding:"16px 16px 16px 29px", background:BG }}>
                          <p style={{ margin:"0 0 16px", fontFamily:"sans-serif", fontSize:12, color:GOLD_DIM, lineHeight:1.85 }}>{contest.notes}</p>

                          <div style={{ marginBottom:14 }}>
                            <label style={labelSt}>Estado</label>
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                              {STATUS_OPTIONS.map(s=>(
                                <button key={s.value} onClick={()=>upd(contest.id,"status",s.value)} style={{ fontFamily:"sans-serif", fontSize:10, padding:"4px 12px", borderRadius:20, border:`1px solid ${contest.status===s.value?GOLD:BORDER}`, background:contest.status===s.value?"rgba(201,168,76,0.12)":"transparent", color:contest.status===s.value?GOLD:GOLD_DIM, cursor:"pointer", fontWeight:contest.status===s.value?700:400 }}>{s.label}</button>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom:14, maxWidth:220 }}>
                            <label style={labelSt}>Fecha de fallo</label>
                            <input value={contest.resultDate} onChange={e=>upd(contest.id,"resultDate",e.target.value)} placeholder="AAAA-MM-DD" style={inputSt}/>
                          </div>

                          <div style={{ marginBottom:16 }}>
                            <label style={labelSt}>Mis notas · texto candidato</label>
                            <textarea value={contest.myNotes} onChange={e=>upd(contest.id,"myNotes",e.target.value)} placeholder="Qué texto vas a mandar, ideas, recordatorios…" rows={3} style={{...inputSt,resize:"vertical",lineHeight:1.75,fontFamily:"Georgia,serif",fontSize:13}}/>
                          </div>

                          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                            {contest.url&&contest.url!=="#"&&(
                              <a href={contest.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"sans-serif", fontSize:11, color:GOLD_DIM, textDecoration:"none", borderBottom:`1px solid ${BORDER}` }}>Ver convocatoria →</a>
                            )}
                            <div style={{flex:1}}/>
                            {delConfirm===contest.id ? (
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                <span style={{ fontFamily:"sans-serif", fontSize:10, color:GOLD_DIM }}>¿Borrar?</span>
                                <button onClick={()=>del(contest.id)} style={{ fontFamily:"sans-serif", fontSize:10, padding:"4px 12px", border:`1px solid ${GOLD}`, borderRadius:4, background:"rgba(201,168,76,0.1)", color:GOLD, cursor:"pointer", fontWeight:700 }}>Sí</button>
                                <button onClick={()=>setDelConfirm(null)} style={{ fontFamily:"sans-serif", fontSize:10, padding:"4px 10px", border:`1px solid ${BORDER}`, borderRadius:4, background:"transparent", cursor:"pointer", color:GOLD_DIM }}>No</button>
                              </div>
                            ):(
                              <button onClick={()=>setDelConfirm(contest.id)} style={{ fontFamily:"sans-serif", fontSize:10, padding:"4px 12px", border:`1px solid ${BORDER}`, borderRadius:4, background:"transparent", color:GOLD_DIM, opacity:0.4, cursor:"pointer" }}>Borrar</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length===0&&(
          <div style={{ textAlign:"center", padding:"60px 0", fontFamily:"sans-serif", color:GOLD_DIM, fontSize:13, opacity:.5 }}>No hay concursos con ese filtro.</div>
        )}
      </div>
    </div>
  );
}
