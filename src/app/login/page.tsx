"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { CustomToast } from '../components/CustomToast';
import { validateLogin } from '@/services/api/user';
import messages from '@/messages';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const t = messages[language].login;

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
        toast.error(t.error.invalid_credentials);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t.error.general);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-start pt-[23vh] justify-center ${isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
      <CustomToast isDarkMode={isDark} />
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${isDark ? 'bg-secondary text-text-dark' : 'bg-white text-text-light'}`}>
        <h2 className="text-3xl font-bold text-center mb-8">{t.title}</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-bg-dark border-border-dark' : 'bg-bg-light border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t.username_placeholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-bg-dark border-border-dark' : 'bg-bg-light border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t.password_placeholder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? t.loading : t.button}
          </button>
        </form>
      </div>
    </div>
  );
}
