import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  MessageSquare,
  BarChart3,
  Shield,
} from 'lucide-react';
import { apiClient, getApiErrorMessage } from '../../lib/axios';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Inbox đa kênh',
    desc: 'Quản lý tin nhắn Facebook Page tập trung',
  },
  {
    icon: Sparkles,
    title: 'AI chấm điểm CSKH',
    desc: 'Phân tích chất lượng hội thoại tự động',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo & Ads',
    desc: 'Theo dõi chi phí quảng cáo và hiệu quả',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let token = null;
    let refreshToken = null;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const params = new URLSearchParams(hash.substring(1));
      token = params.get('token');
      refreshToken = params.get('refreshToken');
    }

    if (!token) {
      token = searchParams.get('token');
    }
    if (!refreshToken) {
      refreshToken = searchParams.get('refreshToken');
    }
    const errorParam = searchParams.get('error');

    if (token) {
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      window.history.replaceState(null, '', window.location.pathname);
      toast.success('Đăng nhập thành công!');
      navigate('/', { replace: true });
    } else if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    const loginUrl = `${apiClient.defaults.baseURL}/auth/google`;
    window.location.assign(loginUrl);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem('authToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      const msg = getApiErrorMessage(error);
      toast.error(msg || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page flex min-h-screen w-full overflow-auto bg-slate-50">
      {/* Branding panel */}
      <aside className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-10 xl:p-14 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="login-blob login-blob-1 absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="login-blob login-blob-2 absolute bottom-10 right-0 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="login-blob login-blob-3 absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
                Viên Chi Bảo
              </p>
              <h1 className="text-xl font-bold tracking-tight">CQA CRM</h1>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-10 max-w-lg">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Nền tảng quản trị CSKH thông minh
          </span>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            Nâng tầm trải nghiệm
            <span className="block bg-gradient-to-r from-indigo-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              chăm sóc khách hàng
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300/90">
            Tập trung hội thoại, đánh giá chất lượng bằng AI và theo dõi hiệu quả quảng cáo — tất cả
            trong một hệ thống duy nhất.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/30 ring-1 ring-indigo-400/30">
                  <Icon className="h-4 w-4 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400">
          <div>
            <p className="text-lg font-bold text-white">35K+</p>
            <p>Hội thoại quản lý</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-lg font-bold text-white">AI</p>
            <p>Phân tích intent</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-lg font-bold text-white">24/7</p>
            <p>Đồng bộ realtime</p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Mobile header gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-100/80 to-transparent lg:hidden" />

        <div className="relative w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              CQA CRM
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <div className="mb-7 text-center lg:text-left">
              <div className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25 lg:flex">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Chào mừng trở lại
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Đăng nhập hệ thống CQA CRM Viên Chi Bảo
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@vienchibao.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng nhập'}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Hoặc
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CQA CRM · Viên Chi Bảo
          </p>
        </div>
      </main>

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
