const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// Find the end of UniPlanning component which is `  );\n}`
const endOfUniPlanning = `    </>
  );
}`;

const leakStartIdx = code.indexOf(endOfUniPlanning) + endOfUniPlanning.length;

// Find the start of AdminDashboard
const adminDashboard = `// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────`;
let adminDashIdx = code.indexOf(adminDashboard);

if (leakStartIdx > -1 && adminDashIdx > -1 && adminDashIdx > leakStartIdx) {
  // Delete everything between the end of UniPlanning and AdminDashboard
  code = code.substring(0, leakStartIdx) + '\n\n' + code.substring(adminDashIdx);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Leak successfully cleaned!");
} else {
  console.log("Could not find the bounds.", {leakStartIdx, adminDashIdx});
}
