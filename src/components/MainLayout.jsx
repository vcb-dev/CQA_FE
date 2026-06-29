import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuditJobProvider } from '@/features/cskh-quality/AuditJobProvider';
import { OAuthReturnHandler } from '@/features/cskh-quality/OAuthReturnHandler';

export default function MainLayout() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/quality');
  const isConversations = location.pathname.startsWith('/conversations');

  return (
    <AuditJobProvider>
      <OAuthReturnHandler />
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 h-screen">
          {!hideHeader && <Header />}
          <div className={`flex flex-1 flex-col overflow-hidden min-h-0 bg-slate-100 ${
            hideHeader 
              ? '!p-4 md:!p-6 !bg-slate-50/80' 
              : isConversations 
                ? 'p-2 sm:p-3' 
                : 'p-4 sm:p-5'
          }`}>
            <Outlet />
          </div>
        </div>
      </div>
    </AuditJobProvider>
  );
}
