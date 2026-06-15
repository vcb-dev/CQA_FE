const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceStyles(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Generic replacements
  content = content.replace(/className="card"/g, 'className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"');
  content = content.replace(/className="card anim-up"/g, 'className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4"');
  
  // Replace variables
  content = content.replace(/var\(--primary-600\)/g, '#4f46e5');
  content = content.replace(/var\(--primary-50\)/g, '#eef2ff');
  content = content.replace(/var\(--primary-100\)/g, '#e0e7ff');
  content = content.replace(/var\(--primary-700\)/g, '#3730a3');
  content = content.replace(/var\(--n-900\)/g, '#111827');
  content = content.replace(/var\(--n-800\)/g, '#1f2937');
  content = content.replace(/var\(--n-700\)/g, '#374151');
  content = content.replace(/var\(--n-600\)/g, '#4b5563');
  content = content.replace(/var\(--n-500\)/g, '#6b7280');
  content = content.replace(/var\(--n-400\)/g, '#9ca3af');
  content = content.replace(/var\(--n-300\)/g, '#d1d5db');
  content = content.replace(/var\(--n-200\)/g, '#e5e7eb');
  content = content.replace(/var\(--n-100\)/g, '#f3f4f6');
  content = content.replace(/var\(--n-50\)/g, '#f9fafb');
  
  content = content.replace(/var\(--danger-600\)/g, '#dc2626');
  content = content.replace(/var\(--danger-500\)/g, '#ef4444');
  content = content.replace(/var\(--danger-100\)/g, '#fee2e2');
  content = content.replace(/var\(--danger-50\)/g, '#fef2f2');
  
  content = content.replace(/var\(--success-600\)/g, '#16a34a');
  content = content.replace(/var\(--success-500\)/g, '#22c55e');
  content = content.replace(/var\(--success-100\)/g, '#dcfce7');
  content = content.replace(/var\(--success-50\)/g, '#f0fdf4');

  content = content.replace(/var\(--warning-600\)/g, '#d97706');
  content = content.replace(/var\(--warning-500\)/g, '#f59e0b');
  content = content.replace(/var\(--warning-100\)/g, '#fef3c7');
  content = content.replace(/var\(--warning-50\)/g, '#fffbeb');
  
  content = content.replace(/var\(--border\)/g, '#e5e7eb');
  content = content.replace(/var\(--white\)/g, '#fff');
  
  // DashboardPage specific fixes left
  content = content.replace(/<div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style=\{\{ flex: '2 1 450px', borderRadius: '16px', padding: '20px' \}\}>/g, '<div className="flex flex-col flex-[2_1_450px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">');
  content = content.replace(/<div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style=\{\{ flex: '1 1 300px', borderRadius: '16px', padding: '20px' \}\}>/g, '<div className="flex flex-col flex-[1_1_300px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

walkDir('src/pages', replaceStyles);
