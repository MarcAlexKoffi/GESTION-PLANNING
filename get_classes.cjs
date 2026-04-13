const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /className=(?:"([^"]+)"|{`([^`]+)`})/g;
let match;
const classes = new Set();

while ((match = regex.exec(code)) !== null) {
  classes.add(match[1] || match[2]);
}

console.log(Array.from(classes).sort().join('\n'));
