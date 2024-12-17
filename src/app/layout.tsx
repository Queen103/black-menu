'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
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
import { SettingsProvider } from './context/SettingsContext'

// Component con sử dụng useTheme
const MainContent = forwardRef<HTMLDivElement, { children: React.ReactNode }>((props, ref) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();
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

  return (
    <div ref={ref} className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      {!isLoginPage && (
        <>
          <Sidebar isOpen={sidebarOpen} ref={sidebarRef} />
          <button
            ref={buttonRef}
            className="fixed top-2 left-3 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <IoMenuOutline className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </>
      )}
      <div className={`flex flex-col flex-grow `}>
        { <Header />}
        <main className={`flex-grow`}>
          {props.children}
        </main>
        { <Footer />}
      </div>
    </div>
  );
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const isPhone = isMobile && !isTablet;
    if (isPhone) {
      setShowError(true);
    }
  }, []);

  if (showError) {
    return (
      <html lang="vi">
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
            <FullScreenProvider>
              <SnowEffect />
              <MainContent>
                {children}
              </MainContent>
            </FullScreenProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
