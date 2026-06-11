import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/quality');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {!hideHeader && <Header />}
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
