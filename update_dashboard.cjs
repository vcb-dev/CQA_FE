const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard/DashboardPage.jsx', 'utf8');

content = content.replace(/className="dash-grid"/g, 'className="flex flex-col gap-6"');
content = content.replace(/className="kpi-grid"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"');
content = content.replace(/className="kpi-card"/g, 'className="flex flex-col p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"');
content = content.replace(/className="chart-card"/g, 'className="flex flex-col p-5 rounded-2xl bg-white border border-slate-100 shadow-sm"');

// Strip out inline styles that were replacing the classes
content = content.replace(/ style=\{\{ display: 'flex', flexDirection: 'column', gap: '24px' \}\}/g, '');
content = content.replace(/ style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(180px, 1fr\)\)', gap: '16px' \}\}/g, '');
content = content.replace(/ style=\{\{\s*display: 'flex',\s*flexDirection: 'column',\s*padding: '16px 20px',\s*borderRadius: '16px',\s*background: 'var\(--card-bg, #fff\)',\s*border: '1px solid var\(--border, rgba\(0,0,0,0.06\)\)',\s*boxShadow: '0 1px 3px rgba\(0,0,0,0.02\)',?\s*\}\}/g, '');
content = content.replace(/ style=\{\{\s*display: 'flex',\s*flexDirection: 'column',\s*background: '#fff',\s*borderRadius: '16px',\s*padding: '20px',\s*border: '1px solid var\(--border\)',\s*boxShadow: 'var\(--shadow-card\)',?\s*\}\}/g, '');

fs.writeFileSync('src/pages/Dashboard/DashboardPage.jsx', content);
