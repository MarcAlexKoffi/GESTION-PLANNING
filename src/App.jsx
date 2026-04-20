import { useState, useEffect, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  GraduationCap, Briefcase, ShieldAlert,
  Calendar as CalendarIcon, List, LayoutDashboard, Download, Bell, ChevronLeft, ChevronRight,
  MapPin, CheckCircle, Clock, Trash2, XCircle, Plus, Users, User, Search, 
  BookOpen, Monitor, Check
} from "lucide-react";

// ─── DESIGN DIRECTION ────────────────────────────────────────────────────────
// "Académie Moderne Africaine" — lumière, espace, autorité douce.
// Palette: blanc ivoire chaud + vert forêt ivoirien + or Akan comme accent.
// Typographie: Playfair Display (prestige) + DM Sans (lisibilité).
// Motif subtil: kente géométrique en watermark décoratif.
// Interface tri-rôles : Étudiant / Professeur / Administration.
// Moteur: react-headless-planning (simulé) — logique pure, UI 100% custom.
// ─────────────────────────────────────────────────────────────────────────────

import { 
  getWeekDays as rpGetWeekDays, 
  getHash, 
  updateOffsetWithDateCalendarForWeek, 
  useIntersectionObserver,
  useCalendarDateState,
  getNewTaskForDropOrPaste,
  CalendarTaskContextProvider,
  useCalendarTaskContext,
  getUniqueId,
  checkDuplicates,
  getMonthDay,
  getDayHourlyForMonth,
  updateOffsetWithDateCalendarForMonth
} from "react-headless-planning";

// ══ HEADLESS PLANNING ENGINE (react-headless-planning API) ══════════════════
function getWeekDays(offset = 0) {
  // Use the actual package to get the days, starting from Monday
  const packageDays = rpGetWeekDays(offset);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  
  // packageDays[1] correspond au Lundi (si le package commence par Dimanche)
  const mondayObj = packageDays[1];
  const monday = new Date(mondayObj.dayYear, months.indexOf(mondayObj.dayMonth), mondayObj.dayOfTheMonth);
  
  // Générer les 7 jours de la semaine (Lundi -> Dimanche) de manière chronologique
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function toDateString(d) {
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,'0') + "-" + String(d.getDate()).padStart(2,'0');
}
// getHash is imported directly since its signature matches the need
function updateOffsetForWeek(date) {
  return updateOffsetWithDateCalendarForWeek(date);
}
// ════════════════════════════════════════════════════════════════════════════

const SLOTS = [
  { id: "s1", label: "08h00 – 10h00", start: 8, end: 10 },
  { id: "s2", label: "10h00 – 12h00", start: 10, end: 12 },
  { id: "s3", label: "12h00 – 14h00", start: 12, end: 14 },
  { id: "s4", label: "14h00 – 16h00", start: 14, end: 16 },
  { id: "s5", label: "16h00 – 18h00", start: 16, end: 18 },
  { id: "s6", label: "18h00 – 20h00", start: 18, end: 20 },
  { id: "s7", label: "20h00 – 22h00", start: 20, end: 22 },
];

const FILIERES = [
  { id: "f1", code: "INFO3", label: "Informatique L3", color: "#1a6b3c" },
  { id: "f2", code: "GEST2", label: "Gestion L2",      color: "#b07d2a" },
  { id: "f3", code: "DROIT1",label: "Droit L1",        color: "#8b3a3a" },
  { id: "f4", code: "ECO2",  label: "Économie L2",     color: "#2a5b8b" },
];

const SALLES = ["Amphi A", "Amphi B", "Salle 101", "Salle 202", "Salle 303", "En ligne (Zoom)"];

const PROFS = [
  { id: "p1", nom: "Prof. Kouassi Aya",    matiere: "Algorithmique",   filiere: "f1", avatar: "KA" },
  { id: "p2", nom: "Prof. Bamba Lassina",  matiere: "Comptabilité",    filiere: "f2", avatar: "BL" },
  { id: "p3", nom: "Prof. Traoré Mariam",  matiere: "Droit Civil",     filiere: "f3", avatar: "TM" },
  { id: "p4", nom: "Prof. Koné Ibrahim",   matiere: "Macroéconomie",   filiere: "f4", avatar: "KI" },
  { id: "p5", nom: "Prof. Diallo Fatou",   matiere: "Base de données", filiere: "f1", avatar: "DF" },
];

// 💡 [OPTIMISATION] : Générateur de Seed dynamique pour remplir le calendrier
// sur tout le mois entier avec des dates précises, ce qui testera la Vue Mensuelle.
function generateSeedData() {
  const baseTasks = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  let idCounter = 1;
  const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
  
  for (let i = 1; i <= 28; i++) {
    const numCours = Math.floor(Math.random() * 4); // 0 à 3 cours/jour
    for (let j = 0; j < numCours; j++) {
      const prof = randomItem(PROFS);
      const filiere = randomItem(FILIERES);
      const slot = randomItem(SLOTS);
      const taskDate = new Date(year, month, i);
      const dayIdx = taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1; // 0=Lundi, 6=Dimanche
      if (dayIdx >= 5) continue; // Pas de cours le WE dans le seed
      
      const startMs = new Date(year, month, i, slot.start, 0, 0).getTime();
      const endMs = new Date(year, month, i, slot.end, 0, 0).getTime();
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const statRand = Math.random();
      
      baseTasks.push({
        id: "cf" + idCounter++,
        titre: prof.matiere,
        profId: prof.id,
        filiereId: filiere.id,
        slotId: slot.id,
        dayIdx,
        salle: randomItem(SALLES),
        type: randomItem(["CM", "TD", "TP"]),
        statut: statRand > 0.8 ? "en_attente" : (statRand > 0.9 ? "annulé" : "confirmé"),
        dateString,
        taskSummary: prof.matiere,
        taskStart: startMs,
        taskEnd: endMs,
        taskDate: taskDate,
        taskExpiryDate: new Date('2030-01-01').getTime(),
        groupId: "default",
        dayIndex: dayIdx
      });
    }
  }
  return baseTasks;
}

const SEED_COURS = generateSeedData();

const ROLES = [
  { id: "etudiant",  label: "Étudiant·e",    icon: <GraduationCap size={16} /> },
  { id: "prof",      label: "Professeur·e",  icon: <Briefcase size={16} /> },
  { id: "admin",     label: "Administration",icon: <ShieldAlert size={16} /> },
];

const TYPE_META = {
  CM: { label: "Cours Magistral", bg: "rgba(26,107,60,0.12)",  border: "#1a6b3c", text: "#1a6b3c" },
  TD: { label: "Travaux Dirigés", bg: "rgba(176,125,42,0.12)", border: "#b07d2a", text: "#b07d2a" },
  TP: { label: "Travaux Pratiques",bg:"rgba(43,91,139,0.12)", border: "#2a5b8b", text: "#2a5b8b" },
};

const STATUT_META = {
  confirmé:    { label: "Confirmé",    dot: "#1a6b3c" },
  en_attente:  { label: "En attente", dot: "#e8a020" },
  annulé:      { label: "Annulé",     dot: "#c0392b" },
};

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `

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
.planning-board { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 600px; position: relative; }
.cal-header { display: flex; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 10; }
.cal-header-corner { width: 80px; flex-shrink: 0; border-right: 1px solid var(--border); display:flex; align-items:flex-end; padding:12px; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
.cal-day-header { flex: 1 1 0px; min-width: 0; padding: 16px 12px; border-right: 1px solid var(--border); text-align: center; position: relative; }
.cal-day-header:last-child { border-right: none; }
.cal-day-name { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.cal-day-num { font-size: 26px; font-weight: 700; color: var(--text); margin-top: 4px; }
.cal-day-header.today::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 3px; background: var(--text); border-radius: 3px 3px 0 0; }

.cal-body { display: flex; flex: 1; align-items: stretch; }
.time-col-cell { width: 80px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: #FAFAFA; }
.slot-label { height: 200px; min-height: 200px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 4px; font-size: 13px; font-weight: 600; color: var(--text-muted); border-bottom: 1px dashed var(--border); }

.day-slot-col { flex: 1 1 0px; border-right: 1px solid var(--border); display: flex; flex-direction: column; min-width: 0; }
.day-slot-col:last-child { border-right: none; }
.day-slot-cell { height: 200px; min-height: 200px; flex-shrink: 0; border-bottom: 1px dashed var(--border); position: relative; transition: background 0.2s; padding: 6px; display: flex; flex-direction: column; overflow: hidden; gap: 6px; }
.day-slot-cell:hover { background: rgba(0,0,0,0.01); }

/* COURS CARD */
.cours-card { border-radius: 12px; padding: 12px 14px; cursor: pointer; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.2s; overflow: hidden; display: flex; flex-direction: column; align-items: stretch; position: relative; flex: 1; min-height: 0; width: 100%; gap: 8px; }
.cours-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); z-index: 5; }
.cours-card.annulé { opacity: 0.6; filter: grayscale(50%); }
.cours-card.en_attente { background: linear-gradient(135deg, var(--surface) 0%, var(--gold-bg) 100%); }

.cours-type { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; }
.cours-titre { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.35; margin-bottom: auto; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
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

/* LEGEND */
.legend { display: flex; gap: 24px; align-items: center; margin-top: 24px; padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.legend-group { display: flex; gap: 12px; align-items: center; }
.legend-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-right: 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
.filter-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* COURS CARD ADDITIONAL STYLES */
.cours-type-badge { font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; }
.cours-prof { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.cours-salle { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 4px; }
.cours-salle-text { font-size: 12px; color: var(--text-muted); }

/* MONTH VIEW SPECIFIC STYLES */
.month-view-container { display: flex; flex-direction: column; flex: 1; padding: 0; }
.month-view-calendar { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid var(--border); border-radius: 16px; background: var(--surface); overflow: hidden; flex: 1; min-height: 500px; }
.month-view-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 2px solid var(--border); background: rgba(0, 0, 0, 0.02); }
.month-day-header { padding: 16px 12px; text-align: center; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid var(--border); }
.month-day-header:last-child { border-right: none; }
.month-cell { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 12px 10px; display: flex; flex-direction: column; gap: 8px; min-height: 140px; background: var(--surface); transition: background-color 0.2s; cursor: default; position: relative; overflow: hidden; }
.month-cell:nth-child(7n) { border-right: none; }
.month-cell:hover { background: rgba(0, 0, 0, 0.01); }
.month-cell.today { background: rgba(0, 100, 200, 0.03); }
.month-cell-empty { background: rgba(0, 0, 0, 0.015); }
.month-day-number { font-size: 14px; font-weight: 700; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; min-height: 24px; }
.month-day-number.today { color: var(--primary); background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; }
.month-day-number .course-count { font-size: 10px; font-weight: 600; background: var(--gray-bg); padding: 2px 6px; border-radius: 6px; color: var(--text-muted); }
.month-courses-list { display: flex; flex-direction: column; gap: 5px; flex: 1; overflow: hidden; }
.month-course-item { font-size: 10.5px; font-weight: 600; padding: 5px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: all 0.2s; border-left: 3px solid; position: relative; }
.month-course-item:hover { transform: translateX(2px); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); }
.month-course-more { font-size: 10px; color: var(--text-muted); font-weight: 600; text-align: center; padding: 4px 0; }
.month-add-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; background: rgba(0, 0, 0, 0.03); transition: opacity 0.2s; pointer-events: none; }
.month-cell:hover .month-add-hint { opacity: 1; }
.month-add-btn-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; }

`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getProf(id) { return PROFS.find(p => p.id === id); }
function getFiliere(id) { return FILIERES.find(f => f.id === id); }
function getSlot(id) { return SLOTS.find(s => s.id === id); }
function today() { return new Date(); }

function useToast() {
  const [toast, setToast] = useState(null);
  function show(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }
  return [toast, show];
}

export default function App() {
  return (
    <CalendarTaskContextProvider hashScope="week">
      <UniPlanning />
    </CalendarTaskContextProvider>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function UniPlanning() {
  const [role, setRole]             = useState("admin");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0); // 💡 [OPTIMISATION] : Ajout de l'offset pour naviguer de mois en mois

  // 💡 [OPTIMISATION] : getTasks, addTask, updateTask, deleteTask peuvent désormais 
  // être extraits de ce store contextuel pour ne plus avoir à gérer le `cours` state localement 
  // et risquer des fuites de mémoire. Le store nettoie les expired-tasks automatiquement.
  const { tasks, addTask, updateTask, deleteTask, getTasks, isValidTask, getTask } = useCalendarTaskContext();
  
  // 💡 [OPTIMISATION] : Initialisation du store interne au montage
  // Au lieu d'utiliser un array `cours` simple, on va initier les tâches dans le store de headless-planning
  // si ce n'est pas déjà fait.
  useEffect(() => {
    // 💡 [CORRECTION] : Nettoyage automatique des anciens évènements zombies corrompus par l'ancien bug
    // La base locale conservait des objets sans "hash" correct ou avec des IDs dupliqués.
    if (localStorage.getItem("fix_zombies_v1") !== "done") {
       localStorage.removeItem("calendar_tasks");
       localStorage.removeItem("gestion_planning_cours_v2");
       localStorage.setItem("fix_zombies_v1", "done");
       window.location.reload(); // Rechargement propre de l'app
       return;
    }

    let initialCours = SEED_COURS;
    try {
      const saved = localStorage.getItem("gestion_planning_cours_v2");
      if (saved) initialCours = JSON.parse(saved);
    } catch(e) {}
    
    // Obtenir le hash de la semaine courante
    const dayWeekOffset = updateOffsetWithDateCalendarForWeek(new Date());
    const hash = getHash(dayWeekOffset, "default", 0).day;
    
    // Seulement injecter si le store est vide
    if (Object.keys(tasks.buckets || tasks).length === 0) {
      initialCours.forEach(c => {
         addTask({
            ...c,
            id: c.id,
            taskSummary: c.titre,
            taskStart: c.taskStart || new Date(c.dateString || c.taskExpiryDate).getTime(), 
            taskEnd: c.taskEnd || new Date(c.dateString || c.taskExpiryDate).getTime() + 1000,
            taskDate: new Date(c.dateString || c.taskExpiryDate),
            taskExpiryDate: new Date('2030-01-01').getTime(),
            groupId: "default",
            dayIndex: c.dayIdx
         });
      });
    }
  }, []);

  // Pour garder la compatibilité avec votre code UI, 
  // on "dérive" les cours depuis le state global `tasks`
  // au lieu d'utiliser un state local.
  const cours = Object.values(tasks?.buckets || {}).flatMap(bucket => bucket.list || []);
  
  // On synchronise le store headless avec le localStorage
  useEffect(() => {
    if (cours.length > 0) {
       localStorage.setItem("gestion_planning_cours_v2", JSON.stringify(cours));
    }
  }, [tasks]);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("gestion_planning_notifs");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [filterFiliere, setFilterFiliere] = useState(null);
  const [filterProf, setFilterProf]       = useState(null);
  const [filterSalle, setFilterSalle]     = useState(null);
  const [selectedCours, setSelectedCours] = useState(null);
  const [showAddModal, setShowAddModal]   = useState(null); // {dayIdx, slotId}
  const [toast, showToast] = useToast();
  const [now, setNow]               = useState(new Date());
  const [view, setView]             = useState("semaine");

  useEffect(() => {
    localStorage.setItem("gestion_planning_notifs", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Définition du contexte selon le rôle pour simplifier (Simulation login)
  useEffect(() => {
    if (role !== "admin" && view === "dashboard") {
      setView("semaine");
    }
    if (role === "prof") {
      setFilterProf("p1"); setFilterFiliere(null); setFilterSalle(null);
    } else if (role === "etudiant") {
      setFilterFiliere("f1"); setFilterProf(null); setFilterSalle(null);
    } else {
      setFilterProf(null); setFilterFiliere(null); setFilterSalle(null);
    }
  }, [role]);

  function addNotif(msg, targetRole) {
    setNotifications(prev => [{ id: Date.now(), msg, read: false, time: new Date().toISOString(), targetRole }, ...prev]);
  }
  
  const myNotifs = notifications.filter(n => role === "admin" || n.targetRole === role || n.targetRole === "all");
  const unreadCount = myNotifs.filter(n => !n.read).length;

  // Export PDF 
  const exportPDF = async () => {
    const element = document.querySelector(".planning-board");
    if (!element) return;
    
    showToast("Génération du PDF en cours...", "warn");
    try {
      const canvas = await html2canvas(element, { scale: 1.5 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Emploi_du_temps.pdf");
      showToast("PDF généré avec succès !", "success");
    } catch (e) {
      showToast("Erreur lors de la génération", "error");
    }
  };

  // 💡 [OPTIMISATION] : useCalendarDateState génère automatiquement la grille (jours et créneaux) sans avoir besoin de calculs manuels à chaque rendu de la vue ou à chaque changement de semaine.
  const { weekDays: hlWeekDays } = useCalendarDateState(now, weekOffset);
  
  // 💡 [CORRECTION] : Le package génère une semaine débutant le Dimanche. En France, la semaine commence le Lundi.
  // On recalcule manuellement la plage de dates pour aligner Lundi avec INDEX 0.
  const weekDays = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + weekOffset * 7);
    const day = d.getDay() || 7; // 1=Lundi, ..., 7=Dimanche
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + 1);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const dateDate = new Date(monday);
      dateDate.setDate(monday.getDate() + i);
      return dateDate;
    });
  }, [now, weekOffset]);

  const todayIdx = weekDays.findIndex(d => isSameDay(d, now));
  
  const currentWeekDateStrings = weekDays.map(toDateString);

  // Derived filters
  const visibleCours = cours.filter(c => {
    // 💡 [OPTIMISATION] : En vue mensuelle, on pourrait afficher tous les cours du mois sélectionné. 
    // Mais pour garder la simplicité et puisqu'on filtre selon dateString, on s'assure d'afficher 
    // les cours qui correspondent à l'affichage actuel. En mois, le filtre "currentWeekDateStrings" sera élargi.
    if (view === "semaine" && !currentWeekDateStrings.includes(c.dateString)) return false;
    if (filterFiliere && c.filiereId !== filterFiliere) return false;
    if (filterProf && c.profId !== filterProf) return false;
    if (filterSalle && c.salle !== filterSalle) return false;
    return true;
  });

  // Stats
  const confirmes = cours.filter(c => c.statut === "confirmé").length;
  const attente   = cours.filter(c => c.statut === "en_attente").length;
  const annules   = cours.filter(c => c.statut === "annulé").length;

  // Salle usage
  const salleCount = SALLES.reduce((acc, s) => {
    acc[s] = cours.filter(c => c.salle === s && c.statut !== "annulé").length;
    return acc;
  }, {});

  // Conflict detection (same salle, same slot, same day)
  function hasConflict(c) {
    if (c.statut === "annulé") return false;

    // 💡 [OPTIMISATION] : Au lieu de comparer manuellement la salle, la date et le slot (ce qui empêchait
    // d'avoir des cours de durées différentes), on utilise la fonction native `checkDuplicates`.
    // Elle analyse mathématiquement avec précision les marqueurs `taskStart` et `taskEnd`.
    // On isole d'abord les cours ayant lieu dans la même définition conflictuelle (ex: la même salle).
    const sameRoomTasks = cours.filter(other => 
      other.id !== c.id && 
      other.salle === c.salle && 
      other.statut !== "annulé"
    );

    // Le package vérifie automatiquement s'il y a un chevauchement temporel dans la liste fournie !
    return checkDuplicates(sameRoomTasks, c.taskStart, c.taskEnd, "default");
  }

  function handleAddCours(data) {
    const id = "c" + Date.now();
    const dateString = toDateString(weekDays[data.dayIdx]);
    const newTask = {
       ...data,
       id,
       dateString,
       statut: role === "admin" ? "confirmé" : "en_attente",
       taskSummary: data.titre,
       taskStart: new Date(dateString).getTime(), // Nécessaire pour le package
       taskEnd: new Date(dateString).getTime() + 1000, 
       taskDate: new Date(dateString), // Nécessaire pour le package
       taskExpiryDate: new Date('2030-01-01').getTime(), // Empêche l'expiration auto
       groupId: "default",
       dayIndex: data.dayIdx
    };
    
    // 💡 [OPTIMISATION] : On remplace le `setCours(...)` local par la fonction native du store `addTask(...)`.
    // Ainsi, le système de Drag & Drop qui enquête dans le store trouvera officiellement ce cours par son Hash.
    addTask(newTask);
    
    showToast(role === "admin" ? "Cours ajouté et confirmé ✓" : "Demande envoyée à l'administration", role === "admin" ? "success" : "warn");
    if(role !== "admin") {
      addNotif(`Nouvelle demande de cours ajoutée pour le ${dateString} (${getSlot(data.slotId)?.label})`, "admin");
    }
    setShowAddModal(null);
  }

  function handleChangeStatut(id, statut) {
    const target = cours.find(c => c.id === id);
    if (!target) return;
    
    if (target.statut !== statut) {
       if (target.statut === "en_attente" && statut === "confirmé") {
         addNotif(`Votre cours "${target.titre}" a été confirmé`, "prof");
       } else if (statut === "annulé") {
         addNotif(`Le cours "${target.titre}" prévu pour ${getFiliere(target.filiereId)?.label} est annulé`, "all");
       }
    }
    
    // 💡 [OPTIMISATION] : Au lieu de mapper manuellement le tableau, 
    // on utilise `updateTask` du store pour mettre à jour unitairement l'état de l'évènement.
    // Il faut fournir le Hash, l'id unique, et les données modifiées.
    updateTask(target.hash, id, { ...target, statut });
    
    showToast(`Statut mis à jour : ${STATUT_META[statut].label}`, statut === "annulé" ? "error" : "success");
    setSelectedCours(null);
  }

  function handleDelete(id) {
    const target = cours.find(c => c.id === id);
    if (!target) return;
    
    // 💡 [DEBUG] : Afficher les propriétés pour voir si le hash existe
    console.log("Suppression demandée pour", id, "Hash associé:", target.hash);

    // 💡 [OPTIMISATION] : Même principe pour la suppression, `deleteTask` gère l'exclusion
    // sécurisée du state global de l'application Headless Planning.
    deleteTask(target.hash, id);
    
    showToast("Cours supprimé", "error");
    setSelectedCours(null);
  }

  const canEdit = role === "admin" || role === "prof";
  const canConfirm = role === "admin";

  // Drag and Drop (répondant aux guidelines Headless)
  const handleDragStart = (e, task) => {
    // 💡 [OPTIMISATION] : Stockage de TOUTES les exigences du système interne dans 
    // le drag-transfer et on simule un `taskStart/taskEnd` à des fins de calcul 
    // intercellulaire même si on reste sur UI à système textuel `slotId`.
    const taskStart = getSlot(task.slotId)?.start || 0;
    const taskEnd = getSlot(task.slotId)?.end || 0;
    
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: task.id,
      taskStart,
      taskEnd,
      dayIndex: task.dayIndex, // Toujours transmettre d'où l'on vient !
      hash: task.hash
    }));
  };

  const handleDrop = (e, dayIdx, slotId) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      const rawData = e.dataTransfer.getData("application/json");
      if (rawData) {
        const { id, hash: oldHash, dayIndex: oldDayIdx } = JSON.parse(rawData);
        const newDateStr = toDateString(weekDays[dayIdx]);
        const targetCours = cours.find(c => c.id === id);
        
        if (targetCours) {
          // 💡 [OPTIMISATION] : Au lieu d'utiliser le patch fait plus tôt,
          // l'idéal avec ce store intégré est de détruire l'ancien évènement de son Hash d'origine
          // Et d'injecter la copie mise à jour à sa nouvelle destination. Logique native immutable !
          
          deleteTask(oldHash, id);
          addTask({
             ...targetCours,
             dayIdx, // pour votre UI
             dayIndex: dayIdx, // pour le store
             slotId,
             dateString: newDateStr,
             statut: role === "admin" ? "confirmé" : "en_attente",
             taskStart: new Date(newDateStr).getTime(),
             taskEnd: new Date(newDateStr).getTime() + 1000,
             taskDate: new Date(newDateStr),
             groupId: "default",
          });
          
          showToast("Cours déplacé avec succès via le store ", "success");
        }
      }
    } catch(err) {
      console.error("Erreur lors du glisser-déposer", err);
    }
  };

  const handleDragOver = (e) => {
    if (!canEdit) return;
    e.preventDefault(); // Nécessaire pour autoriser le drop
  };

  return (
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
             {(role === "admin" ? ["dashboard", "mois", "semaine", "liste"] : ["mois", "semaine", "liste"]).map(v => (
                <div key={v} 
                     className={`sidebar-item ${view === v ? 'active' : ''}`} 
                     onClick={() => setView(v)}>
                  {v === "dashboard" ? <LayoutDashboard size={18}/> : v === "semaine" ? <CalendarIcon size={18}/> : v === "mois" ? <Monitor size={18}/> : <List size={18}/>}
                  <span style={{textTransform:'capitalize'}}>{v}</span>
                </div>
             ))}
          </div>

          {view !== "dashboard" && (
             <>
                <div className="section-label">Filières</div>
                <div className={`sidebar-item ${!filterFiliere ? 'active' : ''}`} onClick={() => setFilterFiliere(null)}>
                  <div className="sidebar-item-dot" style={{background: '#000'}} /> Toutes
                </div>
                {FILIERES.map(f => (
                  <div key={f.id} className={`sidebar-item ${filterFiliere === f.id ? 'active' : ''}`} onClick={() => setFilterFiliere(filterFiliere === f.id ? null : f.id)}>
                    <div className="sidebar-item-dot" style={{background: f.color}} /> {f.label}
                  </div>
                ))}

                <div className="section-label">Enseignants</div>
                 <div className={`sidebar-item ${!filterProf ? 'active' : ''}`} onClick={() => role !== "prof" && setFilterProf(null)}>
                  <User size={14}/> Tous
                </div>
                {PROFS.map(p => (
                  <div key={p.id} className={`sidebar-item ${filterProf === p.id ? 'active' : ''}`} onClick={() => role !== "prof" && setFilterProf(filterProf === p.id ? null : p.id)} style={{opacity: role==="prof" && filterProf!==p.id ? 0.3 : 1}}>
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
               <div className={`role-badge ${role}`}>
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
                   <h1 className="page-title">{view === "dashboard" ? "Tableau de Bord" : view === "semaine" ? "Emploi du temps" : view === "mois" ? "Vue Mensuelle" : "Liste des séances"}</h1>
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

                {view === "semaine" && (
                <div className="week-nav">
                  <button className="wnav-btn" onClick={() => setWeekOffset(p => p - 5)}><ChevronLeft size={18}/></button>
                  <button className="wnav-today" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
                  <div className="week-label">
                    {weekDays[0]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short" })} – {weekDays[4]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
                  </div>
                  <button className="wnav-btn" onClick={() => setWeekOffset(p => p + 5)}><ChevronRight size={18}/></button>
                </div>
                )}
                {view === "mois" && (
                <div className="week-nav">
                  <button className="wnav-btn" onClick={() => setMonthOffset(p => p - 1)}><ChevronLeft size={18}/></button>
                  <button className="wnav-today" onClick={() => setMonthOffset(0)}>Ce mois</button>
                  <div className="week-label">
                    {(() => {
                       const d = new Date(); d.setMonth(d.getMonth() + monthOffset);
                       return d.toLocaleDateString("fr-FR", { month:"long", year:"numeric" }).toUpperCase();
                    })()}
                  </div>
                  <button className="wnav-btn" onClick={() => setMonthOffset(p => p + 1)}><ChevronRight size={18}/></button>
                </div>
                )}
             </div>

             {view === "dashboard" && role === "admin" ? (
                <AdminDashboard cours={cours} onChangeStatut={handleChangeStatut} />
             ) : view === "mois" ? (
                <MonthView monthOffset={monthOffset} visibleCours={visibleCours} canEdit={canEdit} onAddClick={(dayIdx) => setShowAddModal({ dayIdx, slotId: "s1" })} />
             ) : view === "semaine" ? (
                <div className="planning-board">
                  <div className="cal-header">
                    <div className="cal-header-corner">Créneaux</div>
                    {weekDays.map((day, i) => {
                      const isT = isSameDay(day, now);
                      return (
                        <div key={i} className={`cal-day-header ${isT ? "today" : ""}`}>
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


function AdminDashboard({ cours, onChangeStatut }) {
  const attenteTasks = cours.filter(c => c.statut === "en_attente");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, flex:1 }}>
      <div className="board-header" style={{marginBottom: 0}}>
        <div>
           <div className="b-title">Tableau de bord Administration</div>
           <div className="b-subtitle">Gérez les demandes de cours et les entités de l'université.</div>
        </div>
      </div>
      
      <div style={{display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:24, flex:1, minHeight:0}}>
        
        {/* Colonne Gauche : Demandes en attente */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)", display:"flex", flexDirection:"column", overflow:"hidden"}}>
          <div style={{fontSize:18, fontWeight:700, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", color:"var(--text)"}}>
            Demandes en attente
            <span style={{background:"#fef3c7", color:"#92400e", padding:"6px 12px", borderRadius:8, fontSize:13, fontWeight:700}}>{attenteTasks.length}</span>
          </div>
          
          {attenteTasks.length === 0 ? (
            <div style={{color:"var(--text-muted)", fontSize:14, padding:40, textAlign:"center", background:"var(--gray-bg)", borderRadius:12, flex:1, display:"flex", alignItems:"center", justifyContent:"center", border:"1px dashed var(--border)"}}>
              ✓ Aucune demande en attente
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:16, overflowY:"auto", flex:1, paddingRight:8}}>
              {attenteTasks.map(c => {
                 const prof = getProf(c.profId);
                 const fil = getFiliere(c.filiereId);
                 const slot = getSlot(c.slotId);
                 const tm = TYPE_META[c.type];
                 const day = DAY_NAMES[c.dayIdx];
                 return (
                  <div key={c.id} style={{padding:16, border:"1px solid var(--border)", borderRadius:12, background:"var(--gray-bg)", display:"flex", flexDirection:"column", gap:14, borderLeft:`5px solid ${fil?.color || tm.border}`, transition:"all 0.2s"}}>
                    <div>
                      <div style={{fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
                        {c.titre} 
                        <span style={{fontSize:11, background:tm.bg, color:tm.text, padding:"3px 8px", borderRadius:5, fontWeight:700, textTransform:"uppercase"}}>{c.type}</span>
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:13}}>
                        <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text)"}}>
                          <span style={{fontSize:16}}>👤</span>
                          <div>
                            <div style={{fontWeight:600, color:"var(--text)"}}>Professeur</div>
                            <div style={{color:"var(--text-muted)", fontSize:12, marginTop:2}}>{prof?.nom}</div>
                          </div>
                        </div>
                        <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text)"}}>
                          <span style={{fontSize:16}}>🎓</span>
                          <div>
                            <div style={{fontWeight:600, color:"var(--text)"}}>Filière</div>
                            <div style={{color:"var(--text-muted)", fontSize:12, marginTop:2}}>{fil?.label}</div>
                          </div>
                        </div>
                        <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text)"}}>
                          <span style={{fontSize:16}}>📍</span>
                          <div>
                            <div style={{fontWeight:600, color:"var(--text)"}}>Salle</div>
                            <div style={{color:"var(--text-muted)", fontSize:12, marginTop:2}}>{c.salle}</div>
                          </div>
                        </div>
                        <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text)"}}>
                          <span style={{fontSize:16}}>🕐</span>
                          <div>
                            <div style={{fontWeight:600, color:"var(--text)"}}>Créneau</div>
                            <div style={{color:"var(--text-muted)", fontSize:12, marginTop:2}}>{day} · {slot?.label.split('–')[0]}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, borderTop:"1px dashed var(--border)", paddingTop:12}}>
                      <button className="btn btn-primary" style={{padding:"8px 16px", fontSize:13, fontWeight:600}} onClick={() => onChangeStatut(c.id, "confirmé")}>✓ Valider</button>
                      <button className="btn btn-danger" style={{padding:"8px 16px", fontSize:13, fontWeight:600}} onClick={() => onChangeStatut(c.id, "annulé")}>✕ Refuser</button>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite : Raccourcis et Stats */}
        <div style={{display:"flex", flexDirection:"column", gap:24, overflow:"hidden"}}>
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:16, fontWeight:700, marginBottom:16, color:"var(--text)"}}>Actions rapides</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)", padding:"12px 14px", fontSize:14, fontWeight:600, border:"1px solid var(--border)", transition:"all 0.2s"}}><span style={{display:"flex", alignItems:"center", gap:8}}>👥 Utilisateurs</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)", padding:"12px 14px", fontSize:14, fontWeight:600, border:"1px solid var(--border)", transition:"all 0.2s"}}><span style={{display:"flex", alignItems:"center", gap:8}}>🎓 Filières</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)", padding:"12px 14px", fontSize:14, fontWeight:600, border:"1px solid var(--border)", transition:"all 0.2s"}}><span style={{display:"flex", alignItems:"center", gap:8}}>🚪 Salles</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
            </div>
          </div>

          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)", flex:1, overflow:"hidden"}}>
            <div style={{fontSize:16, fontWeight:700, marginBottom:16, color:"var(--text)"}}>Ressources</div>
             <div style={{display:"flex", flexDirection:"column", gap:14}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:14, borderBottom:"1px solid var(--border)"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14, fontWeight:500}}>Professeurs</span>
                  <span style={{fontWeight:700, background:"var(--blue-bg)", color:"var(--blue-txt)", padding:"4px 10px", borderRadius:6, fontSize:14}}>{PROFS.length}</span>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:14, borderBottom:"1px solid var(--border)"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14, fontWeight:500}}>Filières</span>
                  <span style={{fontWeight:700, background:"var(--green-bg)", color:"var(--green-txt)", padding:"4px 10px", borderRadius:6, fontSize:14}}>{FILIERES.length}</span>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14, fontWeight:500}}>Salles</span>
                  <span style={{fontWeight:700, background:"var(--gray-bg)", color:"var(--gray-txt)", padding:"4px 10px", borderRadius:6, fontSize:14}}>{SALLES.length}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COURS CARD ──────────────────────────────────────────────────────────────
function CoursCard({ cours, conflict, onClick, onDragStart, canEdit }) {
  const ref = useRef(null);
  
  // 💡 [OPTIMISATION] : useIntersectionObserver permet de ne rendre le contenu du composant que s'il est proche de l'écran. 
  // Très utile lorsqu'on affiche un emploi du temps chargé avec beaucoup de cellules, c'est ce qu'on appelle la virtualisation.
  // rootMargin: "600px" précharge les cartes qui sont à 600px ou moins d'entrer dans la vue, évitant de charger des éléments non visibles.
  const { entry } = useIntersectionObserver(ref, { rootMargin: "600px" });
  const isVisible = !entry || entry.isIntersecting; // par défaut visible si pas encore observé
  
  const prof    = getProf(cours.profId);
  const filiere = getFiliere(cours.filiereId);
  const tm      = TYPE_META[cours.type];
  const sm      = STATUT_META[cours.statut];
  
  return (
    <div
      ref={ref}
      className={`cours-card ${cours.statut}`}
      draggable={canEdit}
      onDragStart={(e) => canEdit && onDragStart && onDragStart(e, cours)}
      style={{ background: tm.bg, borderLeft: `6px solid ${filiere?.color || tm.border}`, minHeight: '120px' }}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      {isVisible ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div className="cours-type-badge" style={{ background: tm.border + "22", color: tm.text, display: "flex", alignItems: "center", gap: 4 }}>
              {cours.type}
            </div>
            <div title={sm.label} style={{ width: 10, height: 10, borderRadius: "50%", background: sm.dot, flexShrink: 0 }}></div>
          </div>
          {conflict && <span className="conflict-badge" style={{marginLeft:4,fontSize:8, marginBottom:0, alignSelf: "flex-start"}}>⚠ Conflit</span>}
          <div className="cours-titre">{cours.titre}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
            <div className="cours-prof" style={{display:"flex", alignItems:"center", gap:8, fontSize: 13, color: "var(--text-muted)", fontWeight: 500}}>
              <User size={14} color="var(--text-muted)"/> {prof?.nom}
            </div>
            <div className="cours-salle" style={{display:"flex", alignItems:"center", gap:8, fontSize: 13, color: "var(--text-muted)", fontWeight: 500}}>
              <MapPin size={14} color="var(--text-muted)"/> {cours.salle}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── LIST VIEW ───────────────────────────────────────────────────────────────
function ListView({ cours, weekDays, onSelect, hasConflict }) {
  const grouped = weekDays.map((day, i) => ({
    day, dayIdx: i,
    items: cours.filter(c => c.dayIdx === i).sort((a,b) => {
      const sa = getSlot(a.slotId)?.start || 0;
      const sb = getSlot(b.slotId)?.start || 0;
      return sa - sb;
    })
  }));

  return (
    <div style={{padding:"16px 20px", display:"flex", flexDirection:"column", gap:16, overflowY:"auto", flex:1}}>
      {grouped.map(({day, dayIdx, items}) => (
        <div key={dayIdx}>
          <div style={{fontFamily:"'Inter', sans-serif", fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:8, paddingBottom:6, borderBottom:"2px solid var(--border)"}}>
            {DAY_NAMES[dayIdx]} {day.toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}
            <span style={{fontFamily:"'Inter', sans-serif",fontWeight:400,fontSize:12,color:"var(--text-muted)",marginLeft:8}}>
              {items.length} cours
            </span>
          </div>
          {items.length === 0 && (
            <div style={{color:"var(--text-muted)",fontSize:12,fontStyle:"italic",padding:"8px 0"}}>— Aucun cours programmé —</div>
          )}
          {items.map(c => {
            const prof = getProf(c.profId);
            const fil  = getFiliere(c.filiereId);
            const slot = getSlot(c.slotId);
            const tm   = TYPE_META[c.type];
            const sm   = STATUT_META[c.statut];
            return (
              <div key={c.id} onClick={() => onSelect(c)} style={{display:'flex', alignItems:'center', padding:12, borderBottom:'1px solid var(--border)', cursor:'pointer'}}>
                <div style={{width: 80, fontWeight: 700, fontSize:13}}>{slot?.label.split('–')[0]}</div>
                <div style={{flex:1, fontWeight:600}}>{c.titre} <span style={{fontSize:10, padding:'2px 6px', background:tm.bg, color:tm.text, borderRadius:4}}>{c.type}</span></div>
                <div style={{color:'var(--text-muted)', fontSize:13, width:150}}>{prof?.nom}</div>
                <div style={{color:'var(--text-muted)', fontSize:13, width:150}}>{fil?.label}</div>
                <div style={{color:'var(--text-muted)', fontSize:13, width:100}}>{c.salle}</div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  );
}

// ─── MONTH VUE ──────────────────────────────────────────────────────────────
function MonthView({ monthOffset, visibleCours, canEdit, onAddClick }) {
  // 💡 [OPTIMISATION] : On appelle les fonctions natives du package pour 
  // récupérer la structure entière du mois actuel en fonction de l'offset (+1 mois, -1 mois, etc.)
  const currentMonthDays = getMonthDay(monthOffset);
  const currentMonthHourly = getDayHourlyForMonth(monthOffset);

  const todayDate = new Date();
  const [selectedCourseInMonth, setSelectedCourseInMonth] = useState(null);

  return (
    <div className="month-view-container">
       {/* Header du calendrier (jours de la semaine) */}
       <div className="month-view-header">
         {DAY_NAMES.map(d => (
           <div key={d} className="month-day-header">{d}</div>
         ))}
       </div>
       
       {/* Grille des jours du mois */}
       <div className="month-view-calendar">
         {currentMonthDays.map((dayObj, idx) => {
           // Vérification basique du jour "aujourd'hui"
           const isToday = dayObj.dayOfTheMonth === todayDate.getDate() && 
             currentMonthHourly[idx].day.getMonth() === todayDate.getMonth() && 
             currentMonthHourly[idx].day.getFullYear() === todayDate.getFullYear();

           // 💡 [OPTIMISATION] : Filtrer les cours correspondants au jour (la valeur en base)
           const dateStr = toDateString(currentMonthHourly[idx].day);
           const dayCours = visibleCours.filter(c => c.dateString === dateStr);
           
           // Manage grid offset for the first day of the month
           const realFirstDay = new Date();
           realFirstDay.setMonth(realFirstDay.getMonth() + monthOffset);
           realFirstDay.setDate(1);
           const firstDayOfWeek = realFirstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
           // In France (Monday=1...Sunday=7). So if 0 (Sunday), we offset 7.
           const offset = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;
           const offsetStyle = idx === 0 ? { gridColumnStart: offset } : {};
           
           // Si c'est un jour hors du mois actuel
           const isOutOfMonth = dayObj.dayOfTheMonth === 0;

           return (
             <div 
               key={idx} 
               className={`month-cell ${isToday ? 'today' : ''} ${isOutOfMonth ? 'empty' : ''}`}
               style={offsetStyle}
               onClick={() => canEdit && dayCours.length === 0 && onAddClick(idx)}
             >
                {/* Numéro du jour */}
                <div className="month-day-number" style={isToday ? {color:'white'} : {}}>
                  <span style={isToday ? {color:'white'} : {}}>{dayObj.dayOfTheMonth || ''}</span>
                  {dayCours.length > 0 && !isOutOfMonth && <span className="course-count">{dayCours.length}</span>}
                </div>
                
                {/* Liste des cours */}
                {!isOutOfMonth && dayCours.length > 0 && (
                  <div className="month-courses-list">
                    {dayCours.slice(0, 3).map(c => {
                      const tm = TYPE_META[c.type];
                      const prof = getProf(c.profId);
                      const sm = STATUT_META[c.statut];
                      return (
                        <div 
                          key={c.id} 
                          className="month-course-item"
                          style={{
                            background: tm.bg,
                            color: tm.text,
                            borderLeftColor: tm.border
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourseInMonth(c);
                          }}
                          title={`${c.titre}\n${prof?.nom}\n${c.salle}\nStatut: ${sm.label}`}
                        >
                          <span style={{fontWeight:700}}>{c.type}</span> {c.titre}
                        </div>
                      );
                    })}
                    {dayCours.length > 3 && <div className="month-course-more">+{dayCours.length - 3}</div>}
                  </div>
                )}
                
                {/* Hint pour ajouter un cours */}
                {!isOutOfMonth && canEdit && dayCours.length === 0 && (
                  <div className="month-add-hint">
                    <div className="month-add-btn-icon">
                      <Plus size={14} />
                    </div>
                  </div>
                )}
             </div>
           );
         })}
       </div>
       
       {/* Modal pour afficher les détails du cours sélectionné */}
       {selectedCourseInMonth && (
         <div className="overlay" onClick={() => setSelectedCourseInMonth(null)}>
           <div className="modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <button className="modal-close-btn" onClick={() => setSelectedCourseInMonth(null)}>✕</button>
               <div>
                 <div className="modal-title">{selectedCourseInMonth.titre}</div>
                 <div className="modal-subtitle">{TYPE_META[selectedCourseInMonth.type].label}</div>
               </div>
             </div>
             <div className="modal-body">
               <div className="info-row">
                 <span className="info-key">Type</span>
                 <span className="info-val">
                   <div style={{
                     background: TYPE_META[selectedCourseInMonth.type].bg,
                     color: TYPE_META[selectedCourseInMonth.type].text,
                     padding: '4px 10px',
                     borderRadius: 6,
                     fontSize: 12,
                     fontWeight: 600
                   }}>{TYPE_META[selectedCourseInMonth.type].label}</div>
                 </span>
               </div>
               <div className="info-row">
                 <span className="info-key">Professeur</span>
                 <span className="info-val">{getProf(selectedCourseInMonth.profId)?.nom}</span>
               </div>
               <div className="info-row">
                 <span className="info-key">Filière</span>
                 <span className="info-val">{getFiliere(selectedCourseInMonth.filiereId)?.label}</span>
               </div>
               <div className="info-row">
                 <span className="info-key">Salle</span>
                 <span className="info-val" style={{display:'flex', alignItems:'center', gap:8}}>
                   <MapPin size={14} />
                   {selectedCourseInMonth.salle}
                 </span>
               </div>
               <div className="info-row">
                 <span className="info-key">Créneaux</span>
                 <span className="info-val">{getSlot(selectedCourseInMonth.slotId)?.label}</span>
               </div>
               <div className="info-row">
                 <span className="info-key">Statut</span>
                 <span className="info-val">
                   <div style={{
                     background: STATUT_META[selectedCourseInMonth.statut].bg || 'var(--gray-bg)',
                     color: STATUT_META[selectedCourseInMonth.statut].dot,
                     padding: '4px 10px',
                     borderRadius: 6,
                     fontSize: 12,
                     fontWeight: 600
                   }}>{STATUT_META[selectedCourseInMonth.statut].label}</div>
                 </span>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

// ─── DETAIL MODAL ────────────────────────────────────────────────────────────
function CoursDetailModal({ cours, conflict, role, canEdit, canConfirm, onClose, onChangeStatut, onDelete }) {
  const prof = getProf(cours.profId);
  const fil = getFiliere(cours.filiereId);
  const slot = getSlot(cours.slotId);
  const sm = STATUT_META[cours.statut];
  const day = DAY_NAMES[cours.dayIdx];

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{display:'flex',gap:16}}>
            <button className="modal-close-btn" onClick={onClose} title="Fermer">✕</button>
            <button className="modal-action-btn" title="Agrandir">↗</button>
          </div>
          <div style={{display:'flex',gap:16}}>
             <button className="modal-action-btn" title="Favoris">☆</button>
             <button className="modal-action-btn" title="Options">⋮</button>
          </div>
        </div>

        <div className="modal-title">{cours.titre}</div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:24}}>
          <span style={{fontSize:14,color:'var(--text-muted)'}}>Priority: </span>
          <span className="saas-tag blue">{cours.type}</span>
        </div>

        <div className="modal-body">
          <div className="info-row">
            <div className="info-key">Assignees</div>
            <div className="info-val">
              <div className="saas-avatar" style={{background:'#c2e8ff', color:'#1e3a8a'}}>{prof?.avatar}</div>
              {prof?.nom}
              <div className="saas-avatar" style={{background:'#f3f4f6', color:'#6b7280', fontSize:14, cursor:'pointer'}}>+</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-key">Due date</div>
            <div className="info-val">{day} · {slot?.label.split('–')[0]}</div>
          </div>
          <div className="info-row">
            <div className="info-key">Status</div>
            <div className="info-val">
              <span className={"saas-tag " + (cours.statut === 'confirmé' ? 'gray' : cours.statut === 'annulé' ? 'red' : 'gold')} style={{textTransform:'uppercase'}}>{sm.label}</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-key">Tags</div>
            <div className="info-val">
              <span className="saas-tag green">{fil?.label.split(' ')[0]}</span>
              <span className="saas-tag blue">{cours.salle.split(' ')[0]}</span>
              <span style={{color:'var(--text-muted)', fontSize:12, cursor:'pointer'}}>Add more</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-key">Created by</div>
            <div className="info-val">
              <div className="saas-avatar" style={{background:'#def7ec', color:'#03543f'}}>AD</div>
              Administration
            </div>
          </div>

          <div className="saas-tabs">
            <div className="saas-tab active">Description</div>
            <div className="saas-tab">Comments</div>
            <div className="saas-tab">Activities</div>
          </div>
          <div className="saas-editor-box">
             Ce module se concentre sur l'apprentissage autour de {cours.titre} avec une approche active.
            <div style={{display:'flex',gap:12, marginTop:16, borderTop:'1px solid var(--border)', paddingTop:12, color:'var(--text)'}}>
              <span style={{fontWeight:600}}>B</span> <span style={{fontStyle:'italic'}}>I</span> <span style={{textDecoration:'underline'}}>U</span> <span style={{textDecoration:'line-through'}}>T</span>
            </div>
          </div>
          
          <div style={{marginTop:24}}>
             <div style={{fontSize:11, fontWeight:600, color:'var(--text-muted)', letterSpacing:0.5, marginBottom:12}}>ADD SUBTASKS</div>
             <div style={{display:'flex', alignItems:'center', gap:8, fontSize:14, marginBottom:8}}>
               <input type="checkbox" defaultChecked /> Revoir les supports de cours avant le Lundi
             </div>
             <div style={{display:'flex', alignItems:'center', gap:8, fontSize:14, color:'var(--text-muted)'}}>
               <input type="checkbox" disabled /> <span style={{opacity:0.5}}>Add subtask</span>
             </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="viewers">
             Viewers:
             <div className="saas-avatar">M</div>
             <div className="saas-avatar" style={{background:'#fca5a5',color:'#7f1d1d'}}>J</div>
             <div className="saas-avatar" style={{background:'#e5e7eb',color:'#374151', cursor:'pointer'}}>+</div>
          </div>
          {canConfirm && cours.statut === 'en_attente' && <button className="btn btn-primary" onClick={() => onChangeStatut(cours.id, 'confirmé')}>Confirmer</button>}
          {canEdit && cours.statut !== 'annulé' && <button className="btn btn-danger" onClick={() => onChangeStatut(cours.id, 'annulé')}>Annuler</button>}
          {canConfirm && cours.statut === 'annulé' && <button className="btn btn-gold" onClick={() => onChangeStatut(cours.id, 'confirmé')}>Rétablir</button>}
          {canConfirm && <button className="btn btn-ghost" onClick={() => onDelete(cours.id)}>Supprimer</button>}
        </div>
      </div>
    </div>
  );
}

// ─── ADD COURS MODAL ─────────────────────────────────────────────────────────
function AddCoursModal({ dayIdx, slotId, weekDays, role, existingCours, onClose, onAdd }) {
  const [form, setForm] = useState({
    titre: "", profId: "p1", filiereId: "f1", slotId, dayIdx,
    salle: SALLES[0], type: "CM"
  });

  const slot = getSlot(slotId);
  const day  = DAY_NAMES[dayIdx];
  const date = weekDays[dayIdx];

  // Conflict check
  const dateString = date ? toDateString(date) : "";
  const conflict = existingCours.some(c =>
    c.salle === form.salle && c.slotId === form.slotId && c.dateString === dateString && c.statut !== "annulé"
  );

  function set(k, v) { setForm(p => ({...p, [k]: v})); }

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Ajouter un cours</div>
            <div className="modal-subtitle">
              {day} {date?.toLocaleDateString("fr-FR",{day:"numeric",month:"long"})} · {slot?.label}
              {role === "prof" && <span style={{color:"#b07d2a",marginLeft:8}}>⚠ Soumis à validation admin</span>}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fermer">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Intitulé du cours *</label>
            <input className="form-input" placeholder="Ex : Introduction à l'algorithmique"
              value={form.titre} onChange={e => set("titre", e.target.value)} />
          </div>

          <div className="form-grid">
            {role !== "prof" ? (
              <div className="form-field">
                <label className="form-label">Enseignant</label>
                <select className="form-select" value={form.profId} onChange={e => set("profId", e.target.value)}>
                  {PROFS.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
            ) : (
               <div className="form-field">
                 <label className="form-label">Enseignant</label>
                 <div className="form-input" style={{background: "var(--gray-bg)", color: "var(--text-muted)", cursor: "not-allowed"}}>
                   {getProf("p1")?.nom}
                 </div>
               </div>
            )}
            <div className="form-field">
              <label className="form-label">Filière</label>
              <select className="form-select" value={form.filiereId} onChange={e => set("filiereId", e.target.value)}>
                {FILIERES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Type de séance</label>
              <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
                {Object.entries(TYPE_META).map(([k,v]) => <option key={k} value={k}>{k} — {v.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Salle / Modalité</label>
              <select className="form-select" value={form.salle} onChange={e => set("salle", e.target.value)}>
                {SALLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {conflict && (
            <div style={{background:"#fff3cd",border:"1px solid #ffc107",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#856404"}}>
              ⚠️ <strong>Conflit détecté :</strong> {form.salle} est déjà occupée sur ce créneau. Choisissez une autre salle.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            disabled={!form.titre.trim() || conflict}
            style={{opacity: !form.titre.trim() || conflict ? 0.5 : 1}}
            onClick={() => form.titre.trim() && !conflict && onAdd(form)}
          >
            {role === "admin" ? "✓ Ajouter & Confirmer" : "📤 Soumettre la demande"}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
