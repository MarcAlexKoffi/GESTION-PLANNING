const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf-8');

// The CSS chunk
const CSS_START = `const CSS = \``;
const CSS_END = `\`;\n`;
const cssIdx1 = app.indexOf(CSS_START);
const cssIdx2 = app.indexOf(CSS_END, cssIdx1);
if(cssIdx1<0 || cssIdx2<0) throw "CSS not found";

const NEW_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:         #FAFAFA;
  --surface:    #FFFFFF;
  --text:       #18181B;
  --text-muted: #71717A;
  --border:     #E4E4E7;
  --primary:    #000000;
  --primary-hover: #27272A;
  
  --green-bg:   #DCFCE7;
  --green-txt:  #14532D;
  --blue-bg:    #DBEAFE;
  --blue-txt:   #1E3A8A;
  --gray-bg:    #F4F4F5;
  --gray-txt:   #3F3F46;
  --red-bg:     #FEE2E2;
  --red-txt:    #7F1D1D;
  --gold-bg:    #FEF9C3;
  --gold-txt:   #713F12;

  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
}

body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg); color: var(--text); overflow: hidden; -webkit-font-smoothing: antialiased; }
.app { display: flex; height: 100vh; overflow: hidden; }

/* -- GLOBAL BUTTONS -- */
.btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: transparent; transition: 0.2s; display:inline-flex; align-items:center; gap:8px;}
.btn-primary { background: var(--primary); color: white; box-shadow: var(--shadow-sm); }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--gray-bg); color:var(--text);}
.btn-danger { background: var(--red-bg); color: var(--red-txt); border: 1px solid #FCA5A5; }
.btn-danger:hover { background: #FCA5A5; }
.btn-success { background: var(--green-bg); color: var(--green-txt); border: 1px solid #86EFAC; }
.btn-success:hover { background: #86EFAC; }
.btn-gold { background: var(--gold-bg); color: var(--gold-txt); border: 1px solid #FDE047; }
.btn-gold:hover { background: #FDE047; }

/* -- ANIMATIONS -- */
@keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

/* -- SIDEBAR -- */
.sidebar { width: 280px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px 20px; overflow-y: auto; flex-shrink: 0; box-shadow: 1px 0 10px rgba(0,0,0,0.02); z-index: 10; }
.logo-block { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.logo-seal { width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
.logo-name { font-weight: 700; font-size: 17px; color: var(--text); letter-spacing: -0.3px; }
.logo-sub { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); font-weight: 700; margin: 24px 0 12px; }

/* Filter items */
.sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
.sidebar-item:hover { background: var(--gray-bg); color: var(--text); }
.sidebar-item.active { background: #18181B; color: white; box-shadow: var(--shadow-sm); }
.sidebar-item-dot { width: 10px; height: 10px; border-radius: 4px; flex-shrink: 0; }
.sidebar-item-count { margin-left: auto; font-size: 11px; background: rgba(0,0,0,0.06); color: inherit; padding: 2px 8px; border-radius: 12px; font-weight: 600; }

/* MAIN CONTENT */
.main-wrapper { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }

/* TOP NAV */
.top-nav { height: 72px; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; background: var(--surface); border-bottom: 1px solid var(--border); z-index: 20; box-shadow: 0 1px 3px rgba(0,0,0,0.01); }
.view-tabs { display: flex; background: var(--gray-bg); padding: 4px; border-radius: 10px; }
.vtab { padding: 8px 16px; border: none; background: transparent; cursor: pointer; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: var(--text-muted); transition: all 0.2s; display:flex; align-items:center; gap:8px;}
.vtab:hover:not(.active) { color: var(--text); }
.vtab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }

.nav-actions { display: flex; align-items: center; gap: 16px; }
.role-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: var(--gray-bg); color: var(--text); border: 1px solid var(--border); }
.role-badge.admin { background: var(--gold-bg); color: var(--gold-txt); border-color: #FDE047; }
.role-badge.prof { background: var(--blue-bg); color: var(--blue-txt); border-color: #BFDBFE; }
.role-badge.etudiant { background: var(--green-bg); color: var(--green-txt); border-color: #86EFAC; }
.icon-btn { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; transition: 0.2s; position: relative; }
.icon-btn:hover { background: var(--gray-bg); color: var(--text); }

/* CONTENT HEADER */
.content-header { padding: 24px 32px 16px; display: flex; align-items: flex-end; justify-content: space-between; }
.page-title { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; margin-bottom: 6px;}
.page-sub { font-size: 14px; color: var(--text-muted); display:flex; align-items:center; gap:8px;}
.week-nav { display: flex; align-items: center; gap: 12px; background: var(--surface); padding: 6px; border-radius: 10px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);}
.wnav-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:transparent; border:none; cursor:pointer; color:var(--text-muted); transition:0.2s;}
.wnav-btn:hover { background:var(--gray-bg); color:var(--text);}
.wnav-today { padding: 0 12px; font-size: 13px; font-weight: 600; cursor: pointer; background: transparent; border: none; color: var(--text-muted); }
.wnav-today:hover { color: var(--text); }
.week-label { font-size: 14px; font-weight: 600; color: var(--text); padding: 0 12px; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }

/* MAIN AREA */
.main-area { flex: 1; overflow-y: auto; padding: 0 32px 32px; display: flex; flex-direction: column; }

/* DASHBOARD STATS */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.stat-card { padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-sm); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.stat-lbl { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.stat-num { font-size: 32px; font-weight: 700; color: var(--text); letter-spacing: -1px; }

/* CALENDAR GRID */
.planning-board { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 600px; }
.cal-header { display: flex; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 10; }
.cal-header-corner { width: 80px; flex-shrink: 0; border-right: 1px solid var(--border); display:flex; align-items:flex-end; padding:12px; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
.cal-day-header { flex: 1; padding: 16px 12px; border-right: 1px solid var(--border); text-align: center; position: relative; }
.cal-day-header:last-child { border-right: none; }
.cal-day-name { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.cal-day-num { font-size: 26px; font-weight: 700; color: var(--text); margin-top: 4px; }
.cal-day-header.today::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 3px; background: var(--text); border-radius: 3px 3px 0 0; }

.cal-body { display: flex; flex: 1; overflow-y: auto; }
.time-col-cell { width: 80px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: #FAFAFA; }
.slot-label { height: 140px; display: flex; align-items: flex-start; justify-content: center; padding-top: 12px; font-size: 13px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); }

.day-slot-col { flex: 1; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.day-slot-col:last-child { border-right: none; }
.day-slot-cell { height: 140px; border-bottom: 1px dashed var(--border); position: relative; transition: background 0.2s; padding: 4px; display: flex; flex-direction: column; }
.day-slot-cell:hover { background: rgba(0,0,0,0.01); }

/* COURS CARD */
.cours-card { flex: 1; border-radius: 12px; padding: 12px; cursor: pointer; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.2s; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; position: relative; }
.cours-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); z-index: 5; }
.cours-card.annulé { opacity: 0.6; filter: grayscale(50%); }
.cours-card.en_attente { background: linear-gradient(135deg, var(--surface) 0%, var(--gold-bg) 100%); }

.cours-type { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; }
.cours-titre { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
.cours-detail { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-weight: 500; }

.add-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; pointer-events: none; }
.day-slot-cell:hover .add-hint { opacity: 1; }
.add-hint-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }

/* LIST VIEW */
.conflict-badge { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #fca5a5; }

/* MODALS */
.overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
.modal { background: var(--surface); width: 600px; border-radius: 20px; box-shadow: var(--shadow-xl); max-height: 90vh; overflow-y: auto; padding: 32px; position: relative; animation: slideDown 0.3s; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-direction:row-reverse; }
.modal-title { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
.modal-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 500; display:inline-flex; align-items:center; gap:6px; padding:2px 8px; background:var(--blue-bg); color:var(--blue-txt); border-radius:4px;}
.modal-close-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: var(--gray-bg); color: var(--text-muted); font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.modal-close-btn:hover { background: var(--red-bg); color: var(--red-txt); }
.modal-action-btn { background: transparent; border: 1px solid var(--border); font-size: 16px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.modal-action-btn:hover { background: var(--gray-bg); color: var(--text); }
.modal-body { display:flex; flex-direction:column; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; border-top: 1px solid var(--border); padding-top: 24px; display: flex; align-items:center; }

.info-row { display: grid; grid-template-columns: 140px 1fr; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.info-key { color: var(--text-muted); font-weight: 600; }
.info-val { color: var(--text); font-weight: 600; display: flex; align-items: center; gap: 8px; }

.saas-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.saas-tag.green { background: var(--green-bg); color: var(--green-txt); }
.saas-tag.blue { background: var(--blue-bg); color: var(--blue-txt); }
.saas-tag.gray { background: var(--gray-bg); color: var(--gray-txt); }
.saas-tag.gold { background: #fef3c7; color: #92400e; }
.saas-tag.red { background: var(--red-bg); color: var(--red-txt); }
.saas-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--blue-bg); color: var(--blue-txt); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border:1px solid #fff; }
.saas-tabs { display: flex; gap: 24px; border-bottom: 1px solid var(--border); margin: 24px 0 16px; }
.saas-tab { padding-bottom: 12px; color: var(--text-muted); font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; font-size: 14px; }
.saas-tab.active { color: var(--text); border-bottom-color: var(--text); }
.saas-editor-box { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; min-height: 100px; font-size: 14px; color: var(--text-muted); line-height: 1.5; }

/* FORMS */
.form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text); }
.form-input, .form-select { padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 14px; color: var(--text); background: var(--bg); transition: all 0.2s; outline: none; }
.form-input:focus, .form-select:focus { border-color: var(--primary); background: var(--surface); box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* TOASTS */
.toast-container { position: fixed; bottom: 32px; right: 32px; z-index: 1000; display: flex; flex-direction: column; gap: 12px; }
.toast { padding: 16px 24px; border-radius: 12px; color: var(--text); background: var(--surface); font-size: 14px; font-weight: 600; box-shadow: var(--shadow-xl); border: 1px solid var(--border); display: flex; align-items: center; gap: 12px; animation: slideDown 0.3s forwards; }

/* EXTRA UI FIXES */
.b-title { font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.b-subtitle { font-size: 14px; color: var(--text-muted); }
.board-header { margin-bottom: 24px; }
`;

app = app.substring(0, cssIdx1 + CSS_START.length) + NEW_CSS + app.substring(cssIdx2);

// Now replacing UniPlanning Layout
const layoutStartStr = `  return (\n    <>\n      <style>{CSS}</style>`;
const layoutEndStr = `// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────\nfunction AdminDashboard({ cours, onChangeStatut }) {`;

const startLayout = app.indexOf(layoutStartStr);
const endLayout = app.indexOf(layoutEndStr);

if(startLayout < 0 || endLayout < 0) throw "Layout bounds not found";

const REPLACEMENT_LAYOUT = `  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* -- LEFT SIDEBAR -- */}
        <aside className="sidebar">
          <div className="logo-block">
            <div className="logo-seal"><Check size={20}/></div>
            <div>
              <div className="logo-name">Nouveau Man</div>
              <div className="logo-sub">Planning Académique</div>
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32}}>
             {(role === "admin" ? ["dashboard", "semaine", "liste"] : ["semaine", "liste"]).map(v => (
                <div key={v} 
                     className={\`sidebar-item \${view === v ? 'active' : ''}\`} 
                     onClick={() => setView(v)}>
                  {v === "dashboard" ? <LayoutDashboard size={18}/> : v === "semaine" ? <CalendarIcon size={18}/> : <List size={18}/>}
                  <span style={{textTransform:'capitalize'}}>{v}</span>
                </div>
             ))}
          </div>

          {view !== "dashboard" && (
             <>
                <div className="section-label">Filières</div>
                <div className={\`sidebar-item \${!filterFiliere ? 'active' : ''}\`} onClick={() => setFilterFiliere(null)}>
                  <div className="sidebar-item-dot" style={{background: '#000'}} /> Toutes
                </div>
                {FILIERES.map(f => (
                  <div key={f.id} className={\`sidebar-item \${filterFiliere === f.id ? 'active' : ''}\`} onClick={() => setFilterFiliere(filterFiliere === f.id ? null : f.id)}>
                    <div className="sidebar-item-dot" style={{background: f.color}} /> {f.label}
                  </div>
                ))}

                <div className="section-label">Enseignants</div>
                 <div className={\`sidebar-item \${!filterProf ? 'active' : ''}\`} onClick={() => role !== "prof" && setFilterProf(null)}>
                  <User size={14}/> Tous
                </div>
                {PROFS.map(p => (
                  <div key={p.id} className={\`sidebar-item \${filterProf === p.id ? 'active' : ''}\`} onClick={() => role !== "prof" && setFilterProf(filterProf === p.id ? null : p.id)} style={{opacity: role==="prof" && filterProf!==p.id ? 0.3 : 1}}>
                     <span style={{fontSize:12, fontWeight:700, background:'var(--gray-bg)', padding:'2px 6px', borderRadius:4, color:'var(--text)'}}>{p.avatar}</span> 
                     <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.nom}</span>
                  </div>
                ))}
             </>
          )}

          <div style={{marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)'}}>
             <div className="section-label" style={{marginTop:0}}>Mode de vue</div>
             <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {ROLES.map(r => (
                  <label key={r.id} style={{display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:600, color:'var(--text)', cursor:'pointer'}}>
                     <input type="radio" name="role" checked={role === r.id} onChange={() => setRole(r.id)} style={{accentColor:'var(--primary)'}}/>
                     {r.icon} {r.label}
                  </label>
                ))}
             </div>
          </div>
        </aside>

        {/* -- MAIN CONTENT WRAPPER -- */}
        <div className="main-wrapper">
          {/* TOP NAV */}
          <header className="top-nav">
             <div className="nav-actions">
               {/* Role Badge indicator */}
               <div className={\`role-badge \${role}\`}>
                  {role === "admin" ? <ShieldAlert size={16}/> : role === "prof" ? <Briefcase size={16}/> : <GraduationCap size={16}/>}
                  {ROLES.find(r => r.id === role)?.label}
               </div>
             </div>

             <div className="nav-actions" ref={notifRef} style={{position:'relative'}}>
               {role === "etudiant" && view === "semaine" && (
                 <button className="btn btn-ghost" onClick={exportPDF} style={{marginRight:8}}><Download size={16}/> Exporter PDF</button>
               )}
               <button className="icon-btn" onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) setNotifications(prev => prev.map(n => myNotifs.includes(n) ? {...n, read: true} : n));
               }}>
                  <Bell size={18}/>
                  {unreadCount > 0 && <span style={{position:'absolute', top:-2, right:-2, width:10, height:10, borderRadius:'50%', background:'var(--red-txt)', border:'2px solid var(--surface)'}}></span>}
               </button>
               <button className="icon-btn"><Search size={18}/></button>

                {showNotifs && (
                <div style={{position:"absolute", top:48, right: 0, width:340, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, boxShadow:"var(--shadow-xl)", zIndex:9999, overflow:'hidden'}}>
                  <div style={{padding:"16px 20px", borderBottom:"1px solid var(--border)", fontWeight:700, fontSize:15, color:"var(--text)", display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    Notifications <span style={{background:'var(--gray-bg)', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:600}}>{unreadCount}</span>
                  </div>
                  <div style={{maxHeight:350, overflowY:"auto"}}>
                    {myNotifs.length === 0 ? <div style={{padding:32, color:"var(--text-muted)", fontSize:14, textAlign:"center", fontWeight:500}}>Aucune notification</div> : null}
                    {myNotifs.map(n => (
                       <div key={n.id} style={{padding:"16px 20px", borderBottom:"1px solid var(--border)", fontSize:14, background: n.read ? "transparent" : "var(--blue-bg)", transition:'0.2s'}}>
                         <div style={{color:"var(--text)", fontWeight: n.read ? 500 : 700, marginBottom:8, lineHeight:1.4}}>{n.msg}</div>
                         <div style={{fontSize:12, color:"var(--text-muted)", fontWeight:600}}><Clock size={10} style={{display:'inline', marginRight:4, verticalAlign:'-1px'}}/>{new Date(n.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}</div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
             </div>
          </header>

          {/* PAGE BODY */}
          <div className="main-area">

             {/* PAGE HEADER */}
             <div className="content-header">
                <div>
                   <h1 className="page-title">{view === "dashboard" ? "Tableau de Bord" : view === "semaine" ? "Emploi du temps" : "Liste des séances"}</h1>
                   <div className="page-sub">
                      {view === "dashboard" && "Aperçu global et validation des demandes."}
                      {view !== "dashboard" && (
                        <>
                           <span style={{fontWeight:600, color:'var(--text)'}}>{confirmes}</span> confirmés · 
                           <span style={{fontWeight:600, color:'var(--gold-txt)'}}>{attente}</span> en attente ·
                           <span style={{fontWeight:600, color:'var(--red-txt)'}}>{annules}</span> annulés
                        </>
                      )}
                   </div>
                </div>

                {view !== "dashboard" && (
                <div className="week-nav">
                  <button className="wnav-btn" onClick={() => setWeekOffset(p => p - 5)}><ChevronLeft size={18}/></button>
                  <button className="wnav-today" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
                  <div className="week-label">
                    {weekDays[0]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short" })} – {weekDays[4]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
                  </div>
                  <button className="wnav-btn" onClick={() => setWeekOffset(p => p + 5)}><ChevronRight size={18}/></button>
                </div>
                )}
             </div>

             {view === "dashboard" && role === "admin" ? (
                <AdminDashboard cours={cours} onChangeStatut={handleChangeStatut} />
             ) : view === "semaine" ? (
                <div className="planning-board">
                  <div className="cal-header">
                    <div className="cal-header-corner">Créneaux</div>
                    {weekDays.map((day, i) => {
                      const isT = isSameDay(day, now);
                      return (
                        <div key={i} className={\`cal-day-header \${isT ? "today" : ""}\`}>
                           <div className="cal-day-name">{DAY_NAMES[i]}</div>
                           <div className="cal-day-num">{day.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="cal-body">
                    <div className="time-col-cell">
                       {SLOTS.map(slot => (
                         <div key={slot.id} className="slot-label">{slot.label.split('–')[0].trim()}</div>
                       ))}
                    </div>
                    {weekDays.map((day, dayIdx) => (
                      <div key={dayIdx} className="day-slot-col">
                        {SLOTS.map(slot => {
                           const c = visibleCours.find(c => c.dayIdx === dayIdx && c.slotId === slot.id);
                           const conflict = c && hasConflict(c);
                           return (
                             <div key={slot.id} className="day-slot-cell"
                                  onClick={() => { if (!c && canEdit) setShowAddModal({ dayIdx, slotId: slot.id }); }}
                                  onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, dayIdx, slot.id)}>
                               {!c && <div className="add-hint"><div className="add-hint-icon"><Plus size={16}/></div></div>}
                               {c && <CoursCard cours={c} conflict={conflict} canEdit={canEdit} onDragStart={handleDragStart} onClick={() => setSelectedCours(c)} />}
                             </div>
                           );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
             ) : view === "liste" ? (
                <ListView cours={visibleCours} weekDays={weekDays} onSelect={setSelectedCours} hasConflict={hasConflict} />
             ) : null}
             
             {/* Legend */}
             {view !== "dashboard" && (
                <div className="legend">
                  <div className="legend-group">
                     <span className="legend-title">Types</span>
                     {Object.entries(TYPE_META).map(([k,v]) => (
                        <div key={k} className="legend-item"><div className="filter-dot" style={{background:v.border}}></div> {k}</div>
                     ))}
                  </div>
                  <div style={{width:1, height:24, background:'var(--border)'}}></div>
                  <div className="legend-group">
                     <span className="legend-title">Statuts</span>
                     {Object.entries(STATUT_META).map(([k,v]) => (
                        <div key={k} className="legend-item"><div className="filter-dot" style={{background:v.dot}}></div> {v.label}</div>
                     ))}
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* MODALS */}
        {selectedCours && (
          <CoursDetailModal cours={selectedCours} conflict={hasConflict(selectedCours)} role={role} canEdit={canEdit} canConfirm={canConfirm} onClose={() => setSelectedCours(null)} onChangeStatut={handleChangeStatut} onDelete={handleDelete} />
        )}
        {showAddModal && (
          <AddCoursModal dayIdx={showAddModal.dayIdx} slotId={showAddModal.slotId} weekDays={weekDays} role={role} existingCours={cours} onClose={() => setShowAddModal(null)} onAdd={handleAddCours} />
        )}

        {/* TOASTS */}
        <div className="toast-container">
           {toast && (
              <div className="toast">
                {toast.type === "success" ? <CheckCircle size={20} color="var(--green-txt)"/> : toast.type === "warn" ? <ShieldAlert size={20} color="var(--gold-txt)"/> : <XCircle size={20} color="var(--red-txt)"/>}
                <span style={{flex:1}}>{toast.msg}</span>
              </div>
           )}
        </div>

      </div>
    </>
  );
}
\n\n`;

app = app.substring(0, startLayout) + REPLACEMENT_LAYOUT + app.substring(endLayout);

const coursCardRegex = /function CoursCard\(\{\s*cours,\s*conflict,\s*onClick,\s*onDragStart,\s*canEdit\s*\}\)\s*\{[\s\S]*?return\s*\([\s\S]*?<\/div>\s*;\s*\}/;
const newCoursCard = `function CoursCard({ cours, conflict, onClick, onDragStart, canEdit }) {
  const prof    = getProf(cours.profId);
  const filiere = getFiliere(cours.filiereId);
  const tm      = TYPE_META[cours.type];
  const sm      = STATUT_META[cours.statut];
  
  return (
    <div
      className={\`cours-card \${cours.statut}\`}
      draggable={canEdit}
      onDragStart={(e) => canEdit && onDragStart && onDragStart(e, cours)}
      style={{ borderLeft: \`4px solid \${filiere?.color || tm.border}\` }}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 8 }}>
        <div className="cours-type" style={{ background: tm.bg, color: tm.text }}>
          {cours.type}
        </div>
        <div title={sm.label} style={{ width: 10, height: 10, borderRadius: "50%", background: sm.dot, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}></div>
      </div>
      {conflict && <span style={{marginLeft:4,fontSize:10, marginBottom:4, color: 'var(--red-txt)', fontWeight:700}}>⚠ Conflit</span>}
      <div className="cours-titre">{cours.titre}</div>
      <div className="cours-detail"><User size={12}/> {prof?.nom}</div>
      <div className="cours-detail"><MapPin size={12}/> {cours.salle}</div>
    </div>
  );
}`;

app = app.replace(coursCardRegex, newCoursCard);
fs.writeFileSync('src/App.jsx', app);
console.log("Successfully patched App.jsx safely without leak syntax errors!");