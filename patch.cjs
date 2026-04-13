const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const replCss = fs.readFileSync('C:/Users/koffi/AppData/Roaming/Code/User/workspaceStorage/e0892b6aa45957033e1e42b09b393f11/GitHub.copilot-chat/chat-session-resources/bbc79d6a-9ce4-4e7d-82fb-f261ec11c5f0/call_MHxxSHVnRnpaZmh0SnhTa1ZHYjM__vscode-1776024559879/content.txt', 'utf8');
const tSearch = 'const CSS = ';
const pCssStart = code.indexOf(tSearch);
const pCssEnd = code.indexOf('' + ';', pCssStart) + 2;
code = code.slice(0, pCssStart) + replCss + code.slice(pCssEnd);
fs.writeFileSync('src/App.jsx', code);
