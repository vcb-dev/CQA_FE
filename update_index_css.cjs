const fs = require('fs');
const content = fs.readFileSync('src/index.css', 'utf8');

const lines = content.split('\n');
let res = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // start of pure css rules
  if (line === 'html {') {
    skip = true;
  }
  
  // start of tailwind variables alias
  if (line === '  --color-popover: var(--popover);') {
    skip = false;
    res.push(':root {');
  }

  // start of Avatar Dropdown Menu Styles
  if (line === '/* Avatar Dropdown Menu Styles */') {
    skip = true;
  }

  // start of Hide number input spinners
  if (line === '/* Hide number input spinners (arrows) for Giới hạn fields */') {
    skip = false;
  }

  if (!skip) {
    res.push(line);
  }
}

fs.writeFileSync('src/index.css', res.join('\n'));
