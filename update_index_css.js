const fs = require('fs');
const content = fs.readFileSync('src/index.css', 'utf8');

// Find where :root ends or just keep everything up to line 100 and the @layer base
const lines = content.split('\n');
let keep = [];
let inRoot = false;
let inDark = false;
let inLayerBase = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (i < 100) {
    keep.push(line);
    continue;
  }
  
  if (line.includes(':root {')) {
    inRoot = true;
    keep.push(line);
    continue;
  }
  
  if (line.includes('.dark {')) {
    inDark = true;
    keep.push(line);
    continue;
  }

  if (line.includes('@layer base {')) {
    inLayerBase = true;
    keep.push(line);
    continue;
  }
  
  if (inRoot || inDark || inLayerBase) {
    keep.push(line);
    if (line === '}') {
      inRoot = false;
      inDark = false;
      inLayerBase = false;
    }
    continue;
  }
  
  // Also keep custom variables that were added after line 100 inside :root
  // Actually, let's just write a clean index.css
}
