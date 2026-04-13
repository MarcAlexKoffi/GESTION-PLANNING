const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf-8');

// Fix 1: Update the CSS variable block to append missing classes that keep the layout sane.
// We'll append them right before \`; // end of CSS
const newCSSAppend = `

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
.time-col-cell { width: 80px; border-right: 1px dashed var(--border); display: flex; flex-direction: column; }
.slot-label-row { height: 100px; display: flex; justify-content: center; padding-top: 8px; font-size: 12px; font-weight: 500; color: var(--text-muted); border-bottom: 1px dashed var(--border); }
.cal-day-header { flex: 1; text-align: center; padding: 12px; border-right: 1px solid var(--border); }
.cal-day-name { font-size: 12px; font-weight: 500; text-transform: uppercase; color: var(--text-muted); }
.cal-day-num { font-size: 20px; font-weight: 700; color: var(--text); margin-top: 2px; }
.cal-day-header.today { border-bottom: 2px solid var(--blue-txt); }
.cal-day-header.today .cal-day-num { color: var(--blue-txt); }
`;

// Insert CSS
code = code.replace('}\n`;', '}\n' + newCSSAppend + '\n`;');

// Fix 2: ListView styling - the curved borders
// Find the borderRadius:10 combined with borderLeft:4px
// Change borderRadius:10 to 4 and borderLeft to 3px to remove the "parenthesis" look.
code = code.replace(/borderRadius:\s*10\s*,/g, 'borderRadius: 4,');
code = code.replace(/borderLeft:\s*`4px/g, 'borderLeft:`3px');

// Add inline override to avoid parenthesis rounding
code = code.replace(/border:\s*"1px solid var\(--ivory3\)"/g, 'border:"1px solid var(--border)"');
code = code.replace(/background:\s*c\.statut==="annulé"\s*\?\s*"var\(--ivory2\)"\s*:\s*"var\(--white\)"/g, 'background: c.statut==="annulé" ? "var(--gray-bg)" : "var(--surface)"');

fs.writeFileSync('src/App.jsx', code);
console.log("App style patched successfully!");
