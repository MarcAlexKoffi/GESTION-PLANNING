const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const reps = {
  'var(--ink4)': 'var(--text-muted)',
  'var(--ink3)': 'var(--text-muted)',
  'var(--ink)': 'var(--text)',
  'var(--ivory3)': 'var(--border)',
  'var(--shadow-m)': 'var(--shadow-md)',
  'var(--gold)': '#b07d2a',
  'var(--font-d)': '\'Inter\', sans-serif',
  'var(--font-b)': '\'Inter\', sans-serif',
  'var(--font-m)': '\'Inter\', sans-serif',
};

for (const [k, v] of Object.entries(reps)) {
  code = code.replace(new RegExp(k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), v);
}

fs.writeFileSync('src/App.jsx', code);
console.log("Variables cleaned!");
