import { useState, useEffect, useRef } from "react";
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

import { getWeekDays as rpGetWeekDays, getHash, updateOffsetWithDateCalendarForWeek, useIntersectionObserver } from "react-headless-planning";

// ══ HEADLESS PLANNING ENGINE (react-headless-planning API) ══════════════════
function getWeekDays(offset = 0) {
  // Use the actual package to get the days, and keep only Mon-Fri (5 days)
  const packageDays = rpGetWeekDays(offset);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  
  return packageDays.slice(1, 6).map(dayObj => {
    // Reconstruct the Date object since the package returns day, dayMonth, dayYear, dayOfTheMonth
    return new Date(dayObj.dayYear, months.indexOf(dayObj.dayMonth), dayObj.dayOfTheMonth);
  });
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

const SEED_COURS = [
  { id:"c1",  titre:"Algorithmique",     profId:"p1", filiereId:"f1", slotId:"s1", dayIdx:0, salle:"Amphi A",    type:"CM",  statut:"confirmé" },
  { id:"c2",  titre:"Base de données",   profId:"p5", filiereId:"f1", slotId:"s3", dayIdx:0, salle:"Salle 101",  type:"TD",  statut:"confirmé" },
  { id:"c3",  titre:"Comptabilité",      profId:"p2", filiereId:"f2", slotId:"s2", dayIdx:1, salle:"Amphi B",    type:"CM",  statut:"confirmé" },
  { id:"c4",  titre:"Droit Civil",       profId:"p3", filiereId:"f3", slotId:"s4", dayIdx:1, salle:"Salle 202",  type:"CM",  statut:"en_attente" },
  { id:"c5",  titre:"Macroéconomie",     profId:"p4", filiereId:"f4", slotId:"s2", dayIdx:2, salle:"Amphi A",    type:"CM",  statut:"confirmé" },
  { id:"c6",  titre:"Algorithmique",     profId:"p1", filiereId:"f1", slotId:"s5", dayIdx:2, salle:"En ligne (Zoom)", type:"TP", statut:"confirmé" },
  { id:"c7",  titre:"Comptabilité",      profId:"p2", filiereId:"f2", slotId:"s1", dayIdx:3, salle:"Salle 303",  type:"TD",  statut:"annulé" },
  { id:"c8",  titre:"Base de données",   profId:"p5", filiereId:"f1", slotId:"s4", dayIdx:3, salle:"Salle 101",  type:"CM",  statut:"confirmé" },
  { id:"c9",  titre:"Droit Civil",       profId:"p3", filiereId:"f3", slotId:"s3", dayIdx:4, salle:"Amphi B",    type:"TD",  statut:"confirmé" },
  { id:"c10", titre:"Macroéconomie",     profId:"p4", filiereId:"f4", slotId:"s6", dayIdx:4, salle:"En ligne (Zoom)", type:"CM", statut:"en_attente" },
];

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

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:         #ffffff;
  --surface:    #ffffff;
  --text:       #111827;
  --text-muted: #6b7280;
  --border:     #e5e7eb;
  --primary:    #111827;
  
  --green-bg:   #e3f6ed;
  --green-txt:  #046c4e;
  --blue-bg:    #e0e8f9;
  --blue-txt:   #1e429f;
  --gray-bg:    #f4f5f8;
  --gray-txt:   #374151;
  --red-bg:     #fde8e8;
  --red-txt:    #9b1c1c;

  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

body { font-family: 'Inter', -apple-system, sans-serif; background-color: var(--bg); color: var(--text); overflow: hidden; }
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.topbar { flex-shrink: 0; min-height: 60px; height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; justify-content: space-between; z-index: 50; gap: 12px; overflow: visible; }
.logo-block { display: flex; align-items: center; gap: 12px; }
.logo-text { display:flex; flex-direction:column;}
.logo-name { font-weight: 700; font-size: 16px; color: var(--text); }
.logo-sub { font-size: 11px; color: var(--text-muted); }
.logo-seal { width:32px; height:32px; background:var(--primary); color:white; border-radius:8px; display:flex; align-items:center; justify-content:center;}
.topbar-right { display: flex; align-items: center; gap: 16px; }

.view-tabs, .week-nav { display: flex; background: var(--gray-bg); padding: 4px; border-radius: 8px; gap: 4px; flex-shrink: 0; }
.role-switcher { display: flex; background: var(--surface); border: 1px solid var(--border); padding: 4px; border-radius: 8px; gap: 4px; flex-shrink: 0; }
.role-btn, .vtab, .wnav-today { display:flex; align-items:center; gap:6px; padding: 6px 12px; border: none; background: transparent; cursor: pointer; border-radius: 6px; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text-muted); transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.role-btn-etudiant.active { background: #eef2ff; color: #4338ca; }
.role-btn-prof.active { background: #f0fdf4; color: #15803d; }
.role-btn-admin.active { background: #fef2f2; color: #b91c1c; }
.role-btn:hover:not(.active), .vtab:hover:not(.active) { background: rgba(0,0,0,0.05); color: var(--text); }
.vtab.active, .wnav-today:hover { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.wnav-btn { background: transparent; border: none; padding: 0 8px; cursor: pointer; font-size: 16px; color: var(--text-muted); display:flex; align-items:center; flex-shrink: 0; }
.week-label { font-size: 13px; font-weight: 500; display: flex; align-items: center; color: var(--text); padding: 0 8px; white-space: nowrap; flex-shrink: 0; }
.date-badge { display:none;}
.admin-banner { display:none; flex-shrink: 0; }

/* Custom Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

.body { display: flex; flex: 1; overflow: hidden; position: relative; }
.sidebar { width: 270px; min-width: 270px; height: 100%; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 16px 12px; overflow-y: auto; flex-shrink: 0; }
.sidebar-section { border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 12px; }
.sidebar-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.sidebar-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text); font-weight: 700; cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; padding: 6px; border-radius: 6px; transition: background 0.2s; margin-bottom: 8px; }
.sidebar-title:hover { background: var(--gray-bg); }
.sidebar-content { display: flex; flex-direction: column; gap: 2px; padding: 0 4px; }
details > summary { list-style: none; outline: none; }
details > summary::-webkit-details-marker { display: none; }
.summary-chevron { transition: transform 0.2s; color: var(--text-muted); }
details[open] > summary .summary-chevron { transform: rotate(90deg); color: var(--text); }

.stat-row { display: grid !important; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; padding: 0 4px; }
.stat-card { padding: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.stat-num { font-size: 20px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 4px; }
.stat-lbl { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-btn { display: flex; justify-content: space-between; padding: 8px 12px; background: transparent; border: 1px solid transparent; border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; text-align: left; transition: all 0.2s; align-items:center; gap:8px;}
.filter-btn:hover { background: var(--gray-bg); }
.filter-btn.active { background: var(--blue-bg); color: var(--blue-txt); }
.filter-btn .dot { width: 8px; height: 8px; border-radius: 50%; opacity: 0.8; }

.main-content { flex: 1; padding: 32px 40px; overflow-y: auto; background: var(--gray-bg); display: block; }
.board-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
.b-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.b-subtitle { font-size: 13px; color: var(--text-muted); }

/* GRID CALENDAR */
.planning-board { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm); min-height: auto; }
.board-head-row { display: flex; background: var(--surface); border-bottom: 1px solid var(--border); }
.time-col-header { width: 80px; border-right: 1px solid var(--border); }
.day-col-header { flex: 1; padding: 10px; text-align: center; border-right: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
.day-col-header.today { color: var(--blue-txt); border-bottom: 2px solid var(--blue-txt); }

.cal-body { display: flex; background: var(--surface); border-radius: 0 0 12px 12px; }
.cal-header { display: flex; align-items: center; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: -32px; z-index: 10; border-radius: 12px 12px 0 0; }
.cal-header-corner { width: 85px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-right: 1px dashed var(--border); height: 100%; }
.time-col-cell { width: 85px; flex-shrink: 0; border-right: 1px dashed var(--border); display: flex; flex-direction: column; background: var(--surface); z-index: 2; }
.slot-label-row { height: 130px; min-height: 130px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: var(--text-muted); border-bottom: 1px dashed var(--border); text-align: center; }
.day-slot-col { flex: 1; border-right: 1px dashed var(--border); display: flex; flex-direction: column; min-width: 150px; }
.day-slot-cell { height: 130px; min-height: 130px; flex-shrink: 0; border-bottom: 1px dashed var(--border); position: relative; transition: background 0.2s; cursor:crosshair;}
.day-slot-cell:hover { background: var(--gray-bg); }

/* COURS CARD */
.cours-card { position: absolute; inset: 4px; border-radius: 8px; padding: 8px 10px; cursor: pointer; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.2s; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start;}
.cours-card:hover { box-shadow: var(--shadow-md); z-index: 5; border-color: var(--text-muted); }
.cours-card.annulé { opacity: 0.5; }
.cours-type-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; flex-shrink: 0; }
.cours-titre { font-size: 13px; font-weight: 600; color: var(--text); margin-top: 6px; margin-bottom: 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
.cours-prof { font-size: 11px; color: var(--text-muted); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; width: 100%; flex-shrink: 0; }
.cours-salle { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-start; margin-top: auto; width: 100%; flex-shrink: 0; }
.cours-salle-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

.add-hint { position: absolute; inset: 4px; display: flex; align-items: center; justify-content: center; opacity: 0; font-size: 18px; color: var(--border); pointer-events: none; }
.day-slot-cell:hover .add-hint { opacity: 1; }

/* MODAL SAAS */
.overlay { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); animation: fadeIn 0.2s; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background: var(--surface); width: 680px; border-radius: 12px; box-shadow: var(--shadow-xl); max-height: 90vh; overflow-y: auto; padding: 32px; position: relative; }

.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-direction:row-reverse;}
.modal-close-btn { background: #fee2e2; border: 1px solid #fca5a5; font-size: 16px; font-weight: 700; color: #991b1b; cursor: pointer; transition: all 0.2s; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 1px 2px rgba(153, 27, 27, 0.1); }
.modal-close-btn:hover { background: #f87171; color: white; border-color: #ef4444; }
.modal-action-btn { background: transparent; border: 1px solid var(--border); font-size: 16px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.modal-action-btn:hover { background: var(--gray-bg); color: var(--text); }

.modal-title { font-size: 24px; font-weight: 700; color: var(--text); border: none; outline: none; width: 100%; background: transparent; margin-bottom:4px;}
.modal-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 500; display:inline-flex; align-items:center; gap:6px; padding:2px 8px; background:var(--blue-bg); color:var(--blue-txt); border-radius:4px;}

.modal-body { display:flex; flex-direction:column; }
.info-row { display: grid; grid-template-columns: 140px 1fr; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.info-key { color: var(--text-muted); font-weight: 500; }
.info-val { display: flex; align-items: center; gap: 8px; color: var(--text); font-weight: 500; }

.saas-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.saas-tag.green { background: var(--green-bg); color: var(--green-txt); }
.saas-tag.blue { background: var(--blue-bg); color: var(--blue-txt); }
.saas-tag.gray { background: var(--gray-bg); color: var(--gray-txt); }
.saas-tag.gold { background: #fef3c7; color: #92400e; }
.saas-tag.red { background: var(--red-bg); color: var(--red-txt); }

.saas-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--blue-bg); color: var(--blue-txt); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; border:1px solid #fff; }

.saas-tabs { display: flex; gap: 24px; border-bottom: 1px solid var(--border); margin: 24px 0 16px; }
.saas-tab { padding-bottom: 12px; color: var(--text-muted); font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; font-size: 14px; }
.saas-tab.active { color: var(--text); border-bottom-color: var(--text); }

.saas-editor-box { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; min-height: 100px; font-size: 14px; color: var(--text-muted); line-height: 1.5; }

.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: transparent; transition: 0.2s; display:inline-flex; align-items:center; gap:8px;}
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--gray-bg); color:var(--text);}
.btn-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.btn-danger:hover { background: #fca5a5; color: white; }
.btn-gold { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.btn-gold:hover { background: #fde68a; }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; border-top: 1px solid var(--border); padding-top: 24px; display: flex; align-items:center; }
.modal-footer .viewers { display:flex; margin-right:auto; align-items:center; gap:8px; font-size:13px; color:var(--text-muted); font-weight:500;}

/* Forms */
.form-group { display: flex; align-items:center; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.form-group label { width: 140px; color: var(--text-muted); font-size: 14px; font-weight: 500; text-transform:none; letter-spacing:0;}
.form-control { flex:1; padding: 8px 12px; border: 1px solid transparent; border-radius: 6px; font-family: inherit; font-size: 14px; background: transparent; transition: .2s; outline:none; font-weight:500; color:var(--text); cursor:pointer;}
.form-control:hover { background:var(--gray-bg); }
.form-control:focus { background: var(--surface); box-shadow: 0 0 0 2px var(--border); }

/* Add Modal Form */
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text); }
.form-input, .form-select { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 14px; color: var(--text); background: var(--surface); transition: all 0.2s; outline: none; }
.form-input:focus, .form-select:focus { border-color: var(--blue-txt); box-shadow: 0 0 0 3px var(--blue-bg); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Toasts */
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; }
.toast { padding: 12px 20px; border-radius: 8px; color: var(--text); background:var(--surface); font-size: 14px; font-weight: 500; box-shadow: var(--shadow-xl); border:1px solid var(--border); display: flex; align-items: center; gap: 10px; animation: slideUp .3s forwards; }
@keyframes slideUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }


/* OVERRIDES & MISSING CLASSES TO FIX "BOUSILLÉ" APP */
.stat-row { display: grid !important; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 24px; }
.stat-card { padding: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.stat-num { font-size: 24px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 4px; }
.stat-lbl { font-size: 12px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* Filter item fixes to match the new filter-btn */
.filiere-item, .prof-item, .salle-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  background: transparent; border: 1px solid transparent; border-radius: 6px;
  font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
  margin-bottom: 4px;
}
.filiere-item:hover, .prof-item:hover, .salle-item:hover { background: var(--gray-bg); color: var(--text); }
.filiere-item.active, .prof-item.active, .salle-item.active { background: var(--blue-bg); color: var(--blue-txt); }
.filiere-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.salle-count { margin-left: auto; font-size: 11px; background: var(--border); color: var(--text); padding: 2px 6px; border-radius: 4px; }

/* Prof specific */
.prof-info { display: flex; flex-direction: column; flex: 1; }
.prof-name { font-weight: 600; color: var(--text); font-size: 13px; }
.prof-mat { font-size: 11px; color: var(--text-muted); }
.prof-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--blue-bg); color: var(--blue-txt); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; }

/* List View fixes */
.conflict-badge { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #fca5a5; }

/* Calendar structural fixes */
.cal-body { flex: 1; display: flex; overflow-y: auto; background: var(--surface); }
.cal-header { display: flex; align-items: center; background: var(--surface); border-bottom: 1px solid var(--border); }
.cal-header-corner { width: 85px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-right: 1px dashed var(--border); height: 100%; }
.time-col-cell { width: 85px; flex-shrink: 0; border-right: 1px dashed var(--border); display: flex; flex-direction: column; background: var(--surface); z-index: 2; }
.slot-label-row { height: 140px; min-height: 140px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: var(--text-muted); border-bottom: 1px dashed var(--border); text-align: center; }
.day-slot-cell { height: 140px; min-height: 140px; }
.cal-day-header { flex: 1; text-align: center; padding: 12px; border-right: 1px solid var(--border); min-width: 150px; }
.cal-day-name { font-size: 12px; font-weight: 500; text-transform: uppercase; color: var(--text-muted); }
.cal-day-num { font-size: 20px; font-weight: 700; color: var(--text); margin-top: 2px; }
.cal-day-header.today { border-bottom: 2px solid var(--blue-txt); }
.cal-day-header.today .cal-day-num { color: var(--blue-txt); }

.legend { margin-top: 24px; display: flex; align-items: center; flex-wrap: wrap; gap: 16px; background: var(--surface); padding: 12px 20px; border-radius: 8px; border: 1px solid var(--border); }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; color: var(--text-muted); }
.legend-dot { width: 12px; height: 12px; border-radius: 4px; }
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function UniPlanning() {
  const [role, setRole]             = useState("admin");
  const [weekOffset, setWeekOffset] = useState(0);
  
  const [cours, setCours] = useState(() => {
    let initialCours = SEED_COURS;
    try {
      const saved = localStorage.getItem("gestion_planning_cours");
      if (saved) initialCours = JSON.parse(saved);
    } catch(e) {}
    
    // S'assurer que tous les cours ont une date (pour la backward compatibility avec les anciennes sauvegardes ou les SEED)
    const currentWeekDays = getWeekDays(0);
    return initialCours.map(c => ({
      ...c,
      dateString: c.dateString || (currentWeekDays[c.dayIdx] ? toDateString(currentWeekDays[c.dayIdx]) : "")
    }));
  });

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
    localStorage.setItem("gestion_planning_cours", JSON.stringify(cours));
  }, [cours]);

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

  // Headless: compute week days from offset
  const weekDays = getWeekDays(weekOffset);
  const todayIdx = weekDays.findIndex(d => isSameDay(d, now));
  
  const currentWeekDateStrings = weekDays.map(toDateString);

  // Derived filters
  const visibleCours = cours.filter(c => {
    if (!currentWeekDateStrings.includes(c.dateString)) return false;
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
    return cours.some(other =>
      other.id !== c.id &&
      other.salle === c.salle &&
      other.slotId === c.slotId &&
      other.dateString === c.dateString &&
      other.statut !== "annulé" &&
      c.statut !== "annulé"
    );
  }

  function handleAddCours(data) {
    const id = "c" + Date.now();
    const dateString = toDateString(weekDays[data.dayIdx]);
    setCours(prev => [...prev, { ...data, id, dateString, statut: role === "admin" ? "confirmé" : "en_attente" }]);
    showToast(role === "admin" ? "Cours ajouté et confirmé ✓" : "Demande envoyée à l'administration", role === "admin" ? "success" : "warn");
    if(role !== "admin") {
      addNotif(`Nouvelle demande de cours ajoutée pour le ${dateString} (${getSlot(data.slotId)?.label})`, "admin");
    }
    setShowAddModal(null);
  }

  function handleChangeStatut(id, statut) {
    setCours(prev => {
      const target = prev.find(c => c.id === id);
      if (target && target.statut !== statut) {
        if (target.statut === "en_attente" && statut === "confirmé") {
          addNotif(`Votre cours "${target.titre}" a été confirmé`, "prof");
        } else if (statut === "annulé") {
          addNotif(`Le cours "${target.titre}" prévu pour ${getFiliere(target.filiereId)?.label} est annulé`, "all");
        }
      }
      return prev.map(c => c.id === id ? { ...c, statut } : c);
    });
    showToast(`Statut mis à jour : ${STATUT_META[statut].label}`, statut === "annulé" ? "error" : "success");
    setSelectedCours(null);
  }

  function handleDelete(id) {
    setCours(prev => prev.filter(c => c.id !== id));
    showToast("Cours supprimé", "error");
    setSelectedCours(null);
  }

  const canEdit = role === "admin" || role === "prof";
  const canConfirm = role === "admin";

  // Drag and Drop (répondant aux guidelines Headless)
  const handleDragStart = (e, task) => {
    // Calcul du hash approprié (scope "day")
    const hash = getHash(weekOffset, undefined, task.dayIdx).day;
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: task.id,
      dayIndex: task.dayIdx,
      hash
    }));
  };

  const handleDrop = (e, dayIdx, slotId) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        const { id } = JSON.parse(dataStr);
        const newDateStr = toDateString(weekDays[dayIdx]);
        // Mise à jour de la position de la tâche existante
        setCours(prev => prev.map(c => 
          c.id === id ? { ...c, dayIdx, slotId, dateString: newDateStr, statut: role === "admin" ? "confirmé" : "en_attente" } : c
        ));
        showToast("Cours déplacé avec succès", "success");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDragOver = (e) => {
    if (!canEdit) return;
    e.preventDefault(); // Nécessaire pour autoriser le drop
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="kente-bg" />
      <div className="app">

        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div style={{ display: "flex", flex: 1, minWidth: 150, alignItems: "center", overflow: "hidden" }}>
            <div className="logo-block">
              <div className="logo-seal"><Check size={20}/></div>
              <div className="logo-text">
                <div className="logo-name" style={{ whiteSpace: "nowrap" }}>Nouveau Management</div>
                <div className="logo-sub" style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>Tableau de bord Kanban</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="role-switcher">
              {ROLES.map(r => (
                <button key={r.id} className={`role-btn role-btn-${r.id} ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>

            <div className="view-tabs">
              {(role === "admin" ? ["semaine","liste","dashboard"] : ["semaine","liste"]).map(v => (
                <button key={v} className={`vtab ${view===v?"active":""}`} onClick={() => setView(v)}>
                  {v === "semaine" ? <><CalendarIcon size={14}/> Semaine</> : v === "liste" ? <><List size={14}/> Liste</> : <><LayoutDashboard size={14}/> Dashboard</>}
                </button>
              ))}
            </div>
          </div>

          <div className="topbar-right" style={{ display: "flex", flex: 1, justifyContent: "flex-end", gap: 12, alignItems: "center", minWidth: "max-content", overflow: "visible" }}>
            {role === "etudiant" && view === "semaine" && (
              <button className="btn btn-ghost" style={{padding:"6px 12px", fontSize:12, marginRight:8}} onClick={exportPDF}>
                <Download size={14}/> Exporter PDF
              </button>
            )}
            
            <div ref={notifRef} style={{position:"relative", flexShrink: 0}}>
              <button 
                className="btn btn-ghost" 
                style={{padding:"6px", border:"none"}}
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) {
                     setNotifications(prev => prev.map(n => myNotifs.includes(n) ? {...n, read: true} : n));
                  }
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <div style={{position:"absolute", top:4, right:4, width:8, height:8, background:"#c0392b", borderRadius:"50%"}} />}
              </button>
              {showNotifs && (
                <div style={{position:"absolute", top:45, right: -10, width:320, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, boxShadow:"var(--shadow-xl)", zIndex:9999}}>
                  <div style={{padding:"12px 16px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:14, color:"var(--text)"}}>Notifications</div>
                  <div style={{maxHeight:300, overflowY:"auto"}}>
                    {myNotifs.length === 0 ? <div style={{padding:16, color:"var(--text-muted)", fontSize:13, textAlign:"center"}}>Aucune notification</div> : null}
                    {myNotifs.map(n => (
                       <div key={n.id} style={{padding:"12px 16px", borderBottom:"1px solid var(--border)", fontSize:13, background: n.read ? "transparent" : "var(--blue-bg)"}}>
                         <div style={{color:"var(--text)", whiteSpace: "normal", wordWrap: "break-word", lineHeight: 1.4}}>{n.msg}</div>
                         <div style={{fontSize:11, color:"var(--text-muted)", marginTop:6}}>{new Date(n.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}</div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="week-nav" style={{ flexShrink: 0 }}>
              <button className="wnav-btn" onClick={() => setWeekOffset(p => p - 5)}><ChevronLeft size={16}/></button>
              <button className="wnav-today" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
              <span className="week-label" style={{ whiteSpace: "nowrap" }}>
                {weekDays[0]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short" })} —{" "}
                {weekDays[4]?.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
              </span>
              <button className="wnav-btn" onClick={() => setWeekOffset(p => p + 5)}><ChevronRight size={16}/></button>
            </div>
          </div>
        </header>

        {/* Role banners */}
        {role === "admin" && (
          <div className="admin-banner" style={{display:"flex", alignItems:"center", gap:12, background:"#fef3c7", padding:"8px 24px", fontSize:13, color:"#92400e", borderBottom:"1px solid #fcd34d"}}>
            <span><ShieldAlert size={20}/></span>
            <div>
              <strong>Mode Administration</strong> — Vous pouvez ajouter, confirmer, annuler et supprimer des cours.
              <span style={{marginLeft:16, opacity:.8, fontSize:12, fontWeight:600}}>
                {attente > 0 && `⚠ ${attente} demande(s) en attente`}
              </span>
            </div>
          </div>
        )}
        {role === "prof" && (
          <div className="admin-banner" style={{display:"flex", alignItems:"center", gap:12, background:"#e0e8f9", padding:"8px 24px", fontSize:13, color:"#1e429f", borderBottom:"1px solid var(--blue-bg)"}}>
            <span><Briefcase size={20}/></span>
            <div>
              <strong>Mode Professeur</strong> — Vous visualisez uniquement vos propres cours. Vous pouvez soumettre des demandes de cours.
            </div>
          </div>
        )}
        {role === "etudiant" && (
          <div className="admin-banner" style={{display:"flex", alignItems:"center", gap:12, background:"#e3f6ed", padding:"8px 24px", fontSize:13, color:"#046c4e", borderBottom:"1px solid var(--green-bg)"}}>
            <span><GraduationCap size={20}/></span>
            <div>
              <strong>Mode Étudiant</strong> — Vous visualisez l'emploi du temps de votre filière. Cliquez sur "Exporter PDF" pour le sauvegarder.
            </div>
          </div>
        )}

        <div className="body">

          {/* ── SIDEBAR ── */}
          <aside className="sidebar">

            {/* Stats */}
            <details className="sidebar-section" open>
              <summary className="sidebar-title">
                <span>Résumé de la semaine</span>
                <ChevronRight size={14} className="summary-chevron" />
              </summary>
              <div className="stat-row">
                <div className="stat-card green">
                  <div className="stat-num">{confirmes}</div>
                  <div className="stat-lbl">Confirmés</div>
                </div>
                <div className="stat-card gold">
                  <div className="stat-num">{attente}</div>
                  <div className="stat-lbl">En attente</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-num">{annules}</div>
                  <div className="stat-lbl">Annulés</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{cours.length}</div>
                  <div className="stat-lbl">Total cours</div>
                </div>
              </div>
            </details>

            {/* Filières */}
            <details className="sidebar-section" open>
              <summary className="sidebar-title">
                <span>Filières</span>
                <ChevronRight size={14} className="summary-chevron" />
              </summary>
              <div className="sidebar-content">
                <div
                  className={`filiere-item ${!filterFiliere ? "active" : ""}`}
                  onClick={() => setFilterFiliere(null)}
                >
                  <div className="filiere-dot" style={{background: "#1c1c1e"}} />
                  Toutes les filières
                </div>
                {FILIERES.map(f => (
                  <div
                    key={f.id}
                    className={`filiere-item ${filterFiliere===f.id ? "active" : ""}`}
                    onClick={() => setFilterFiliere(filterFiliere===f.id ? null : f.id)}
                  >
                    <div className="filiere-dot" style={{background: f.color}} />
                    {f.label}
                    <span className="filiere-code" style={{marginLeft:"auto", fontSize:11, color:"var(--text-muted)"}}>{f.code}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Professeurs */}
            <details className="sidebar-section" open>
              <summary className="sidebar-title">
                <span>Corps enseignant</span>
                <ChevronRight size={14} className="summary-chevron" />
              </summary>
              <div className="sidebar-content">
                {role !== "prof" && (
                  <div
                    className={`prof-item ${!filterProf ? "active" : ""}`}
                    onClick={() => setFilterProf(null)}
                  >
                    Tout le corps
                  </div>
                )}
                {PROFS.map(p => (
                  <div
                    key={p.id}
                    className={`prof-item ${filterProf===p.id ? "active" : ""}`}
                    onClick={() => role !== "prof" && setFilterProf(filterProf===p.id ? null : p.id)}
                    style={{ opacity: role === "prof" && filterProf !== p.id ? 0.3 : 1, pointerEvents: role === "prof" ? "none" : "auto" }}
                  >
                    <div className="prof-avatar">{p.avatar}</div>
                    <div className="prof-info">
                      <div className="prof-name">{p.nom}</div>
                      <div className="prof-mat">{p.matiere}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            {/* Salles */}
            <details className="sidebar-section" open={role === "admin"}>
              <summary className="sidebar-title">
                <span>Disponibilité des salles</span>
                <ChevronRight size={14} className="summary-chevron" />
              </summary>
              <div className="sidebar-content">
                {SALLES.map(s => (
                  <div
                    key={s}
                    className={`salle-item ${filterSalle===s ? "active" : ""}`}
                    onClick={() => setFilterSalle(filterSalle===s ? null : s)}
                  >
                    <MapPin size={14}/><span> {s}</span>
                    <span className="salle-count">{salleCount[s] || 0}</span>
                  </div>
                ))}
              </div>
            </details>
          </aside>

          {/* ── MAIN ── */}
          <main className="main-content">
            {view === "dashboard" && role === "admin" ? (
              <AdminDashboard cours={cours} onChangeStatut={handleChangeStatut} />
            ) : view === "semaine" ? (
              <div className="planning-board">
                {/* Calendar header (headless weekDays) */}
                <div className="cal-header">
                  <div className="cal-header-corner">
                    <div style={{fontSize:9,color:"var(--text-muted)",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Créneaux</div>
                  </div>
                  {weekDays.map((day, i) => {
                    const isT = isSameDay(day, now);
                    return (
                      <div key={i} className={`cal-day-header ${isT ? "today" : ""}`}>
                        <div className="cal-day-name">{DAY_SHORT[i]}</div>
                        <div className="cal-day-num">{day.getDate()}</div>
                        {isT && <div className="today-pill">AUJOURD'HUI</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Grid body */}
                <div className="cal-body">
                  {/* Time labels */}
                  <div className="time-col-cell">
                    {SLOTS.map(slot => (
                      <div key={slot.id} className="slot-label-row">{slot.label}</div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day, dayIdx) => (
                    <div key={dayIdx} className="day-slot-col">
                      {SLOTS.map(slot => {
                        const c = visibleCours.find(c => c.dayIdx === dayIdx && c.slotId === slot.id);
                        const conflict = c && hasConflict(c);
                        return (
                          <div
                            key={slot.id}
                            className="day-slot-cell"
                            onClick={() => { if (!c && canEdit) setShowAddModal({ dayIdx, slotId: slot.id }); }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dayIdx, slot.id)}
                          >
                            {!c && <div className="add-hint">＋</div>}
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
              <span style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",marginRight:4}}>Types :</span>
              {Object.entries(TYPE_META).map(([k,v]) => (
                <div key={k} className="legend-item">
                  <div className="legend-dot" style={{background:v.border}} />
                  <span>{k} — {v.label}</span>
                </div>
              ))}
              <span style={{marginLeft:"auto",fontSize:11,fontWeight:600,color:"var(--text-muted)"}}>Statuts :</span>
              {Object.entries(STATUT_META).map(([k,v]) => (
                <div key={k} className="legend-item">
                  <div className="legend-dot" style={{background:v.dot}} />
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
            )}
          </main>
        </div>

        {/* ── DETAIL MODAL ── */}
        {selectedCours && (
          <CoursDetailModal
            cours={selectedCours}
            conflict={hasConflict(selectedCours)}
            role={role}
            canEdit={canEdit}
            canConfirm={canConfirm}
            onClose={() => setSelectedCours(null)}
            onChangeStatut={handleChangeStatut}
            onDelete={handleDelete}
          />
        )}

        {/* ── ADD MODAL ── */}
        {showAddModal && (
          <AddCoursModal
            dayIdx={showAddModal.dayIdx}
            slotId={showAddModal.slotId}
            weekDays={weekDays}
            role={role}
            existingCours={cours}
            onClose={() => setShowAddModal(null)}
            onAdd={handleAddCours}
          />
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <span>{toast.type==="success"?"✓":toast.type==="warn"?"⚠":"✕"}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
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
      
      <div style={{display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:24}}>
        
        {/* Colonne Gauche : Demandes en attente */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20, boxShadow:"var(--shadow-sm)", display:"flex", flexDirection:"column", maxHeight:"calc(100vh - 200px)"}}>
          <div style={{fontSize:16, fontWeight:600, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            Demandes de cours en attente
            <span style={{background:"#fef3c7", color:"#92400e", padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:700}}>{attenteTasks.length}</span>
          </div>
          
          {attenteTasks.length === 0 ? (
            <div style={{color:"var(--text-muted)", fontSize:14, padding:32, textAlign:"center", background:"var(--gray-bg)", borderRadius:8, flex:1, display:"flex", alignItems:"center", justifyContent:"center"}}>
              Aucune demande en attente.
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:12, overflowY:"auto", paddingRight:4, flex:1}}>
              {attenteTasks.map(c => {
                 const prof = getProf(c.profId);
                 const fil = getFiliere(c.filiereId);
                 const slot = getSlot(c.slotId);
                 const tm = TYPE_META[c.type];
                 const day = DAY_NAMES[c.dayIdx];
                 return (
                  <div key={c.id} style={{padding:16, border:"1px solid var(--border)", borderRadius:8, background:"var(--gray-bg)", display:"flex", flexDirection:"column", gap:16, borderLeft:`4px solid ${fil?.color || tm.border}`}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:6, display:"flex", alignItems:"center", gap:8}}>
                          {c.titre} 
                          <span style={{fontSize:10, background:tm.bg, color:tm.text, padding:"2px 6px", borderRadius:4, fontWeight:700}}>{c.type}</span>
                        </div>
                        <div style={{fontSize:13, color:"var(--text)", marginBottom:4}}>👤 {prof?.nom}</div>
                        <div style={{fontSize:12, color:"var(--text-muted)"}}>🎓 {fil?.label}</div>
                      </div>
                      <div style={{background:"var(--surface)", border:"1px solid var(--border)", padding:"6px 10px", borderRadius:6, fontSize:12, fontWeight:600, color:"var(--text-muted)", textAlign:"center"}}>
                        <div>{day}</div>
                        <div style={{fontSize:11, fontWeight:500, marginTop:2}}>{slot?.label.split('–')[0]}</div>
                      </div>
                    </div>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px dashed var(--border)", paddingTop:12}}>
                      <div style={{fontSize:12, color:"var(--text-muted)"}}>📍 {c.salle}</div>
                      <div style={{display:"flex", gap:8}}>
                        <button className="btn btn-primary" style={{padding:"6px 12px", fontSize:12}} onClick={() => onChangeStatut(c.id, "confirmé")}>✓ Valider</button>
                        <button className="btn btn-danger" style={{padding:"6px 12px", fontSize:12}} onClick={() => onChangeStatut(c.id, "annulé")}>✕ Refuser</button>
                      </div>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite : Raccourcis et Stats */}
        <div style={{display:"flex", flexDirection:"column", gap:24}}>
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20, boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Administration rapide</div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)"}}><span>👥 Gestion des Utilisateurs</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)"}}><span>🎓 Programme des Filières</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
              <button className="btn btn-ghost" style={{justifyContent:"space-between", color:"var(--text)"}}><span>🚪 Inventaire des Salles</span> <span style={{color:"var(--text-muted)"}}>→</span></button>
            </div>
          </div>

          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20, boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Aperçu des ressources</div>
             <div style={{display:"flex", flexDirection:"column", gap:12}}>
                <div style={{display:"flex", justifyContent:"space-between", paddingBottom:12, borderBottom:"1px solid var(--border)", alignItems:"center"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14}}>Professeurs inscrits</span>
                  <span style={{fontWeight:600, background:"var(--blue-bg)", color:"var(--blue-txt)", padding:"2px 8px", borderRadius:4, fontSize:13}}>{PROFS.length}</span>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", paddingBottom:12, borderBottom:"1px solid var(--border)", alignItems:"center"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14}}>Filières actives</span>
                  <span style={{fontWeight:600, background:"var(--green-bg)", color:"var(--green-txt)", padding:"2px 8px", borderRadius:4, fontSize:13}}>{FILIERES.length}</span>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{color:"var(--text-muted)", fontSize:14}}>Salles configurées</span>
                  <span style={{fontWeight:600, background:"var(--gray-bg)", color:"var(--gray-txt)", padding:"2px 8px", borderRadius:4, fontSize:13}}>{SALLES.length}</span>
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
  const { entry } = useIntersectionObserver(ref, { rootMargin: "600px" });
  const isVisible = !entry || entry.isIntersecting; // par défaut visible si pas encore observé
  
  const prof    = getProf(cours.profId);
  const filiere = getFiliere(cours.filiereId);
  const tm      = TYPE_META[cours.type];
  const sm      = STATUT_META[cours.statut];
  
  return (
    <div
      className={`cours-card ${cours.statut}`}
      draggable={canEdit}
      onDragStart={(e) => canEdit && onDragStart && onDragStart(e, cours)}
      style={{ background: tm.bg, borderLeft: `4px solid ${filiere?.color || tm.border}` }}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 6 }}>
        <div className="cours-type-badge" style={{ background: tm.border + "22", color: tm.text }}>
          {cours.type}
        </div>
        <div title={sm.label} style={{ width: 8, height: 8, borderRadius: "50%", background: sm.dot, flexShrink: 0 }}></div>
      </div>
      {conflict && <span className="conflict-badge" style={{marginLeft:4,fontSize:8, marginBottom:4}}>⚠ Conflit</span>}
      <div className="cours-titre">{cours.titre}</div>
      <div className="cours-prof" style={{display:"flex", alignItems:"center", gap:4}}><User size={10}/> {prof?.nom}</div>
      <div className="cours-salle">
        <span className="cours-salle-text" style={{display:"flex", alignItems:"center", gap:4}}>
          <MapPin size={10}/> {cours.salle}
        </span>
      </div>
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
              <div key={c.id} onClick={() => onSelect(c)}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
                  background: c.statut==="annulé" ? "var(--gray-bg)" : "var(--surface)",
                  border:"1px solid var(--border)", borderRadius: 4, marginBottom:6,
                  cursor:"pointer", transition:"all .15s", opacity: c.statut==="annulé"?.5:1,
                  borderLeft:`3px solid ${fil?.color||"#ccc"}`,
                }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="var(--shadow-md)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
              >
                <div style={{fontFamily:"'Inter', sans-serif",fontSize:11,color:"var(--text-muted)",minWidth:120}}>{slot?.label}</div>
                <div style={{fontWeight:600,fontSize:13,color:"var(--text)",flex:1}}>{c.titre}</div>
                <div style={{fontSize:11,color:"var(--text-muted)",display:"flex", alignItems:"center", gap:4}}><User size={12}/> {prof?.nom}</div>
                <div style={{fontSize:11,color:"var(--text-muted)",display:"flex", alignItems:"center", gap:4}}><MapPin size={12}/> {c.salle}</div>
                <div style={{fontSize:10,fontWeight:700,color:tm.text,background:tm.bg,padding:"2px 7px",borderRadius:6}}>{c.type}</div>
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:sm.dot,fontWeight:600}}>
                  <span style={{fontSize:7}}>●</span>{sm.label}
                </div>
                {hasConflict(c) && <span className="conflict-badge">⚠ Conflit</span>}
              </div>
            );
          })}
        </div>
      ))}
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
