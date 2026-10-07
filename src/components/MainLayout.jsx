import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuditJobProvider } from '@/features/cskh-quality/AuditJobProvider';
import { OAuthReturnHandler } from '@/features/cskh-quality/OAuthReturnHandler';

export default function MainLayout() {
  const location = useLocation();
  const isConversations = location.pathname.startsWith('/conversations');
  const isQuality = location.pathname.startsWith('/quality');
  const isFullBleed = isConversations || isQuality;

  return (
    <AuditJobProvider>
      <OAuthReturnHandler />
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 h-screen">
          <Header />
          <div
            className={`flex min-h-0 flex-1 flex-col bg-slate-100 ${
              isFullBleed ? 'overflow-hidden p-2 sm:p-3' : 'overflow-y-auto p-4 sm:p-5'
            }`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </AuditJobProvider>
  );
}
