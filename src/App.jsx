import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { routes } from "@/router/routes";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/Login/LoginPage";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

function ProtectedLayout() {
  const token = localStorage.getItem('authToken');
  const hasToken = !!token && token !== 'undefined' && token !== 'null';

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

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-sans">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500" />
          <p className="text-sm text-slate-400">Đang xác thực thông tin...</p>
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

