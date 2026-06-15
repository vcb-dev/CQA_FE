const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard/DashboardPage.jsx', 'utf8');

// Replace inline styles in the loading state
content = content.replace(/<div style=\{\{\s*minHeight: '60vh',\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*color: 'var\(--n-600\)'\s*\}\}>/g, '<div className="flex min-h-[60vh] items-center justify-center text-slate-500">');
content = content.replace(/<div style=\{\{ textAlign: 'center' \}\}>/g, '<div className="text-center">');
content = content.replace(/<div style=\{\{\s*width: '40px',\s*height: '40px',\s*border: '4px solid rgba\(0,0,0,0.05\)',\s*borderTopColor: 'var\(--primary-500\)',\s*borderRadius: '50%',\s*animation: 'spin 1s linear infinite',\s*margin: '0 auto 16px'\s*\}\} \/>/g, '<div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-indigo-500" />');
content = content.replace(/<p style=\{\{ fontSize: '14px', color: 'var\(--n-500\)' \}\}>Đang tải số liệu hệ thống...<\/p>/g, '<p className="text-sm text-slate-500">Đang tải số liệu hệ thống...</p>');

// Replace error state
content = content.replace(/<div className="card" style=\{\{ padding: '32px', textAlign: 'center', margin: '20px auto', maxWidth: '500px' \}\}>/g, '<div className="mx-auto my-5 max-w-[500px] rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">');
content = content.replace(/<Warning size=\{48\} color="var\(--danger-500\)" style=\{\{ marginBottom: '16px' \}\} \/>/g, '<Warning size={48} className="mb-4 text-red-500 mx-auto" />');
content = content.replace(/<h3 style=\{\{ fontSize: '18px', fontWeight: 700, color: 'var\(--n-900\)', marginBottom: '8px' \}\}>/g, '<h3 className="mb-2 text-lg font-bold text-slate-900">');
content = content.replace(/<p style=\{\{ color: 'var\(--n-500\)', fontSize: '14px', marginBottom: '20px' \}\}>/g, '<p className="mb-5 text-sm text-slate-500">');

// Replace kpi loop styles
content = content.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' \}\}>/g, '<div className="mb-3 flex items-center gap-2.5">');
content = content.replace(/<div style=\{\{\s*width: '36px',\s*height: '36px',\s*borderRadius: '10px',\s*background: kpi.bg,\s*color: kpi.color,\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*\}\}>/g, '<div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: kpi.bg, color: kpi.color }}>');
content = content.replace(/<span style=\{\{ fontSize: '12.5px', color: 'var\(--n-500\)', fontWeight: 500 \}\}>/g, '<span className="text-[12.5px] font-medium text-slate-500">');
content = content.replace(/<div style=\{\{ fontSize: '24px', fontWeight: 800, color: 'var\(--n-900\)', lineHeight: 1.1 \}\}>/g, '<div className="text-2xl font-extrabold leading-tight text-slate-900">');
content = content.replace(/<div style=\{\{ fontSize: '11px', color: 'var\(--n-400\)', marginTop: '4px' \}\}>/g, '<div className="mt-1 text-[11px] text-slate-400">');

// Replace Empty State
content = content.replace(/<div\s*className="card anim-up"\s*style=\{\{\s*background: 'linear-gradient\\(135deg, rgba\\(99, 102, 241, 0.05\\) 0%, rgba\\(168, 85, 247, 0.05\\) 100%\\)',\s*border: '1px solid rgba\\(99, 102, 241, 0.15\\)',\s*borderRadius: '20px',\s*padding: '40px 24px',\s*textAlign: 'center',\s*display: 'flex',\s*flexDirection: 'column',\s*alignItems: 'center',\s*gap: '16px',\s*maxWidth: '720px',\s*margin: '0 auto',\s*boxShadow: '0 10px 30px rgba\\(99, 102, 241, 0.05\\)'\s*\}\}\s*>/gm, '<div className="mx-auto flex w-full max-w-[720px] animate-in fade-in slide-in-from-bottom-4 flex-col items-center gap-4 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-10 text-center shadow-[0_10px_30px_rgba(99,102,241,0.05)]">');

content = content.replace(/<div style=\{\{\s*width: '64px',\s*height: '64px',\s*borderRadius: '50%',\s*background: 'rgba\(99, 102, 241, 0.1\)',\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*color: 'var\(--primary-600\)',\s*marginBottom: '8px'\s*\}\}>/g, '<div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">');
content = content.replace(/<h2 style=\{\{ fontSize: '22px', fontWeight: 800, color: 'var\(--n-900\)', letterSpacing: '-0.02em' \}\}>/g, '<h2 className="text-[22px] font-extrabold tracking-tight text-slate-900">');
content = content.replace(/<p style=\{\{ fontSize: '14.5px', color: 'var\(--n-600\)', maxWidth: '500px', lineHeight: 1.5 \}\}>/g, '<p className="max-w-[500px] text-[14.5px] leading-relaxed text-slate-600">');

content = content.replace(/<div style=\{\{\s*display: 'flex',\s*flexWrap: 'wrap',\s*gap: '12px',\s*justifyContent: 'center',\s*marginTop: '8px'\s*\}\}>/g, '<div className="mt-2 flex flex-wrap justify-center gap-3">');

content = content.replace(/<button\s*onClick=\{\(\) => navigate\('\/settings\?tab=channel'\)\}\s*style=\{\{\s*display: 'flex',\s*alignItems: 'center',\s*gap: '8px',\s*padding: '11px 20px',\s*background: 'var\(--primary-600\)',\s*color: 'white',\s*border: 'none',\s*borderRadius: '10px',\s*fontSize: '13.5px',\s*fontWeight: 600,\s*cursor: 'pointer',\s*boxShadow: '0 4px 12px rgba\(99, 102, 241, 0.2\)',\s*transition: 'all 0.2s'\s*\}\}\s*onMouseEnter=\{\(e\) => e\.currentTarget\.style\.background = 'var\(--primary-700\)'\}\s*onMouseLeave=\{\(e\) => e\.currentTarget\.style\.background = 'var\(--primary-600\)'\}\s*>/gm, '<button onClick={() => navigate(\'/settings?tab=channel\')} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700">');

content = content.replace(/<button\s*onClick=\{\(\) => navigate\('\/quality'\)\}\s*style=\{\{\s*display: 'flex',\s*alignItems: 'center',\s*gap: '8px',\s*padding: '11px 20px',\s*background: 'transparent',\s*color: 'var\(--n-700\)',\s*border: '1px solid var\(--border\)',\s*borderRadius: '10px',\s*fontSize: '13.5px',\s*fontWeight: 600,\s*cursor: 'pointer',\s*transition: 'all 0.2s'\s*\}\}\s*onMouseEnter=\{\(e\) => \{\s*e\.currentTarget\.style\.background = 'var\(--n-50\)';\s*e\.currentTarget\.style\.borderColor = 'var\(--n-300\)';\s*\}\}\s*onMouseLeave=\{\(e\) => \{\s*e\.currentTarget\.style\.background = 'transparent';\s*e\.currentTarget\.style\.borderColor = 'var\(--border\)';\s*\}\}\s*>/gm, '<button onClick={() => navigate(\'/quality\')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-transparent px-5 py-3 text-[13.5px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">');

// We also have to clean the bottom part of the file.
fs.writeFileSync('src/pages/Dashboard/DashboardPage.jsx', content);
