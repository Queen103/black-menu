import Logo from './Logo';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`w-full h-[65px] text-white flex items-center px-0 top-0 left-0 transition-colors duration-200
      ${isDark ? 'bg-gray-900' : 'bg-[#4a4a4a]'}`}>
      <div className="flex-grow font-semibold text-[40px] text-white text-center tracking-[0.2em]">
        PHẦN MỀM QUẢN LÝ NĂNG SUẤT
      </div>

      <div className="flex items-center h-full gap-4 px-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
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
