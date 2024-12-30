'use client';

import { useState, useRef, useEffect, forwardRef, useContext } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './globals.css';
import '../styles/snow.css';
import Footer from './components/Footer';
import { IoMenuOutline } from "react-icons/io5";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isMobile, isTablet } from 'react-device-detect';
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { FullScreenProvider } from './context/FullScreenContext'
import SnowEffect from './components/SnowEffect';
import SpringEffect from './components/SpringEffect';
import SummerEffect from './components/SummerEffect';
import AutumnEffect from './components/AutumnEffect';
import { useSeasonEffect } from '@/hooks/useSeasonEffect';
import { SettingsProvider } from './context/SettingsContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { CustomToast } from './components/CustomToast';
import { fetchSettings } from '@/services/api/settings';

// Component con sử dụng useTheme
const MainContent = forwardRef<HTMLDivElement, { children: React.ReactNode }>((props, ref) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();
  const { setEffect } = useSeasonEffect();
  const { setLanguage } = useLanguage();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm để toggle trạng thái của sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  // Đóng sidebar khi click ra ngoài
  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setSidebarOpen(false);
    }
  };

  // Xử lý phím mũi tên cho điều hướng
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const menuItems = [
        "/home",
        "/detail",
        "/setttingMove",
        "/monitor",
        "/report",
        "/gmailSettings",
        "/settings",
        "/account",
      ];

      const currentIndex = menuItems.findIndex(path => path === pathname);

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        router.push(menuItems[newIndex]);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const newIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        router.push(menuItems[newIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [pathname, router]);

  // Load settings on mount and route change
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        // Cập nhật theme
        setIsDark(settings.dark_mode);
        // Cập nhật hiệu ứng
        setEffect(settings.effect);
        // Cập nhật ngôn ngữ
        if (settings.is_vietnamese) {
          setLanguage('vi');
        } else if (settings.is_english) {
          setLanguage('en');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [pathname, setIsDark, setEffect, setLanguage]);

  return (
    <div ref={ref} className={`flex flex-col min-h-screen ${isDark ? 'dark' : ''}`}>
      {!isLoginPage && (
        <>
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex flex-1">
            <Sidebar ref={sidebarRef} isOpen={sidebarOpen} />
            <button
              ref={buttonRef}
              onClick={toggleSidebar}
              className={`fixed top-[1.5vh] left-[1.5vh] z-50 rounded-lg transition-colors duration-200 
                ${isDark ? ' hover:bg-gray-700' : ' hover:bg-gray-300'}`}
            >
              <IoMenuOutline size={40} />
            </button>
            <main className="flex-1 relative">
              <CustomToast isDarkMode={isDark} />
              {props.children}
            </main>
          </div>
          <Footer />
        </>
      )}
      {isLoginPage && (
        <main className="flex-1 relative">
          <CustomToast isDarkMode={isDark} />
          {props.children}
        </main>
      )}
    </div>
  );
});

MainContent.displayName = 'MainContent';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [showError, setShowError] = useState(false);
  const { currentSeason } = useSeasonEffect();
  
  const renderSeasonEffect = () => {
    switch (currentSeason) {
      case 'spring':
        return <SpringEffect />;
      case 'summer':
        return <SummerEffect />;
      case 'autumn':
        return <AutumnEffect />;
      case 'winter':
        return <SnowEffect />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const isPhone = isMobile && !isTablet;
    if (isPhone) {
      setShowError(true);
    }
  }, []);

  if (showError) {
    return (
      <html translate="no" className="notranslate" lang="vi">
        <body>
          <div className="fixed inset-0 bg-error text-text-dark flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Không hỗ trợ thiết bị di động</h1>
              <p className="text-lg">
                Vui lòng truy cập bằng máy tính để có trải nghiệm tốt nhất.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col hidden-on-mobile select-none ">
        <ThemeProvider>
          <SettingsProvider>
            <LanguageProvider>
              <FullScreenProvider>
                {renderSeasonEffect()}
                <MainContent>
                  {children}
                </MainContent>
              </FullScreenProvider>
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

RootLayout.displayName = 'RootLayout';
