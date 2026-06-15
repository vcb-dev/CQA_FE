import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/quality');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 h-screen">
        {!hideHeader && <Header />}
        <div className={`flex flex-1 flex-col overflow-hidden min-h-0 bg-slate-100 p-4 sm:p-5 ${hideHeader ? '!p-4 md:!p-6 !bg-slate-50/80' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
