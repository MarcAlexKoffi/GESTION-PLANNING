const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8");
c = c.replace(
  "             return (\n               <div key={idx} style={{borderRight:`1px solid var(--border)`, borderBottom:`1px solid var(--border)`, padding:8, display:`flex`, flexDirection:`column`, gap:4, minHeight:120, background: isToday ? `rgba(0,0,0,0.02)` : `transparent`}}>".replace(/`/g, String.fromCharCode(39)),
  "             const firstOffset = currentMonthHourly[0].day.getDay() || 7;\n             const offsetStyle = idx === 0 ? { gridColumnStart: firstOffset } : {};\n             return (\n               <div key={idx} style={{...offsetStyle, borderRight:`1px solid var(--border)`, borderBottom:`1px solid var(--border)`, padding:8, display:`flex`, flexDirection:`column`, gap:4, minHeight:120, background: isToday ? `rgba(0,0,0,0.02)` : `transparent`}}>".replace(/`/g, String.fromCharCode(39))
);
fs.writeFileSync("src/App.jsx", c);
