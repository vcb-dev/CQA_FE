const fs = require('fs');
let content = fs.readFileSync('src/components/Header.jsx', 'utf8');

content = content.replace(/className="header"/g, 'className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-5 z-40 shrink-0"');
content = content.replace(/className="header-left"/g, 'className="flex items-center gap-4"');
content = content.replace(/className="header-title"/g, 'className="flex flex-col"');
content = content.replace(/<h1 style={{ display: "flex", alignItems: "center", gap: "6px" }}>/g, '<h1 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 leading-tight">');
content = content.replace(/<span className="tag tag-purple">/g, '<span className="flex items-center justify-center rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700">');
content = content.replace(/<p>\{page.sub\}<\/p>/g, '<p className="text-[11px] text-slate-500">{page.sub}</p>');

content = content.replace(/className="header-center"/g, 'className="hidden flex-1 items-center justify-center gap-3 md:flex"');
content = content.replace(/className="header-date"/g, 'className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"');
content = content.replace(/className="header-btn"/g, 'className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"');

content = content.replace(/className="header-right"/g, 'className="flex items-center gap-2"');
content = content.replace(/className="header-search"/g, 'className="hidden h-8 items-center gap-2 rounded-lg bg-slate-100 px-3 text-slate-400 lg:flex w-64 transition-colors hover:bg-slate-200"');
content = content.replace(/<span>Tìm kiếm hội thoại, khách hàng...<\/span>/g, '<span className="text-xs font-medium">Tìm kiếm hội thoại, khách hàng...</span>');

content = content.replace(/className="header-user"/g, 'className="flex cursor-pointer items-center gap-2 rounded-xl p-1 pr-3 transition-colors hover:bg-slate-50"');
content = content.replace(/className="header-avatar"/g, 'className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-xs"');
content = content.replace(/className="header-user-info"/g, 'className="hidden flex-col md:flex"');
content = content.replace(/className="header-user-name"/g, 'className="text-xs font-bold leading-tight text-slate-800"');
content = content.replace(/className="header-user-role"/g, 'className="text-[10px] text-slate-500"');

content = content.replace(/className="avatar-dropdown"/g, 'className="absolute right-0 top-[calc(100%+8px)] z-[1000] flex w-[220px] origin-top-right flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95"');
content = content.replace(/className="avatar-dropdown-header"/g, 'className="mb-1.5 border-b border-slate-100 px-3 py-2.5"');
content = content.replace(/className="avatar-dropdown-name"/g, 'className="text-[13.5px] font-bold leading-tight text-slate-900"');
content = content.replace(/className="avatar-dropdown-email"/g, 'className="mt-0.5 break-all text-[11px] text-slate-500"');
content = content.replace(/className="avatar-dropdown-item"/g, 'className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-700"');
content = content.replace(/className="avatar-dropdown-item danger"/g, 'className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"');

fs.writeFileSync('src/components/Header.jsx', content);
