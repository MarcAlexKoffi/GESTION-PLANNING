const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');
code = code.replaceAll('\\`', '`').replaceAll('\\$', '$');
fs.writeFileSync('src/App.jsx', code);