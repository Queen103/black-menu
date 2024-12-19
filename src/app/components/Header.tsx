import Logo from './Logo';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { US, VN } from 'country-flag-icons/react/3x2';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <header className={`w-full h-[65px] text-white flex items-center px-0 top-0 left-0 transition-colors duration-200 relative
      ${isDark ? 'bg-gray-900' : 'bg-[#4a4a4a]'}`}>
      <div className="absolute left-1/2 -translate-x-1/2 font-semibold text-[3.5vh] text-white text-center tracking-[0.2em]">
        {language === 'en' ? 'PRODUCTIVITY MANAGEMENT SOFTWARE' : 'PHẦN MỀM QUẢN LÝ NĂNG SUẤT'}
      </div>

      <div className="ml-auto flex items-center h-full gap-4 pr-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg transition-colors hover:bg-opacity-80 flex items-center"
          title={language === 'en' ? "Chuyển sang Tiếng Việt" : "Switch to English"}
        >
          {language === 'en' ? (
            <US className="w-8 h-8" />
          ) : (
            <VN className="w-8 h-8" />
          )}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-opacity-80 flex items-center"
          title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        >
          {isDark ? (
            <FiSun className="w-6 h-6 text-yellow-300" />
          ) : (
            <FiMoon className="w-6 h-6 text-gray-300" />
          )}
        </button>
        <Logo className="h-14 flex items-center" />
      </div>
    </header>
  );
};

export default Header;
