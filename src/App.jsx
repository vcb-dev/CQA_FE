import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { routes } from "@/router/routes";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/Login/LoginPage";
import { useQuery, useIsFetching } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

function ProtectedLayout() {
  const token = localStorage.getItem('authToken');
  const hasToken = !!token && token !== 'undefined' && token !== 'null';
  const location = useLocation();

  const { isLoading, isError } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data.data;
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAtDashboard = location.pathname === '/';
  const isFetchingProfile = useIsFetching({ queryKey: ['currentUserProfile'] }) > 0;
  const isFetchingDashboard = useIsFetching({ queryKey: ['dashboardStats'] }) > 0;

  const showLoader = isLoading || isFetchingProfile || (isAtDashboard && isFetchingDashboard);

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (showLoader) {
    let loadingMessage = "Đang xác thực thông tin...";
    if (!isLoading && !isFetchingProfile && isAtDashboard && isFetchingDashboard) {
      loadingMessage = "Đang tải dữ liệu hệ thống...";
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>{loadingMessage}</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (isError) {
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

export default function App() {
  const basename =
    import.meta.env.BASE_URL === "/"
      ? undefined
      : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

