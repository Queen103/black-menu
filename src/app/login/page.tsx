"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { CustomToast } from '../components/CustomToast';
import { validateLogin } from '@/services/api/user';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await validateLogin(username, password);
      if (user) {
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      } else {
        toast.error('Tài khoản hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-start pt-[23vh] justify-center ${isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
      <CustomToast isDarkMode={isDark} />
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${isDark ? 'bg-secondary text-text-dark' : 'bg-white text-text-light'}`}>
        <h2 className="text-3xl font-bold text-center mb-8">Đăng Nhập</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tài khoản
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-bg-dark border-border-dark' : 'bg-bg-light border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Nhập tài khoản"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-bg-dark border-border-dark' : 'bg-bg-light border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
