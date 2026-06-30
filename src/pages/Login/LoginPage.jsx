import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, MessageSquare, BarChart3, Shield } from 'lucide-react';
import { apiClient } from '../../lib/axios';

const FEATURES = [
  { icon: MessageSquare, title: 'Inbox đa kênh' },
  { icon: Sparkles, title: 'AI chấm điểm CSKH' },
  { icon: BarChart3, title: 'Báo cáo & Ads' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let token = null;
    let refreshToken = null;
    const hash = window.location.hash;
    if (hash?.startsWith('#')) {
      const params = new URLSearchParams(hash.substring(1));
      token = params.get('token');
      refreshToken = params.get('refreshToken');
    }
    if (!token) token = searchParams.get('token');
    if (!refreshToken) refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');

    if (token) {
      localStorage.setItem('authToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      window.history.replaceState(null, '', window.location.pathname);
      toast.success('Đăng nhập thành công!');
      navigate('/', { replace: true });
    } else if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    window.location.assign(`${apiClient.defaults.baseURL}/auth/google`);
  };

  return (
    <div className="login-page relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b1020] px-4 py-10 sm:px-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="login-blob login-blob-1 absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/35 blur-3xl" />
        <div className="login-blob login-blob-2 absolute -bottom-20 -right-16 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="login-blob login-blob-3 absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 xl:gap-20">
        {/* Branding — hiện trên mọi màn hình */}
        <div className="text-center lg:text-left">
          <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300/90">
                Viên Chi Bảo
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white">CQA CRM</h1>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Quản trị CSKH
            <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              thông minh & tập trung
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 lg:mx-0">
            Đồng bộ hội thoại Facebook, phân tích chất lượng bằng AI và theo dõi hiệu quả quảng cáo.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {FEATURES.map(({ icon: Icon, title }) => (
              <span
                key={title}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-300" />
                {title}
              </span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-white/10">
            <div className="mb-7 text-center">
              <h3 className="text-xl font-bold text-white">Chào mừng trở lại</h3>
              <p className="mt-1.5 text-sm text-slate-400">
                Đăng nhập bằng tài khoản Google
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-lg shadow-black/20 transition hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Tiếp tục với Google
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} CQA CRM · Viên Chi Bảo
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        @keyframes login-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(12px, -18px) scale(1.05); }
          66% { transform: translate(-8px, 10px) scale(0.98); }
        }
        .login-blob-1 { animation: login-float 14s ease-in-out infinite; }
        .login-blob-2 { animation: login-float 18s ease-in-out infinite reverse; }
        .login-blob-3 { animation: login-float 22s ease-in-out infinite 2s; }
      `}</style>
    </div>
  );
}
