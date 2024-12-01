'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './globals.css';
import './styles/snow.css';
import Footer from './components/Footer';
import { IoMenuOutline } from "react-icons/io5";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isMobile, isTablet } from 'react-device-detect';
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { FullScreenProvider } from './context/FullScreenContext'
import SnowEffect from './components/SnowEffect';

// Component con sử dụng useTheme
const MainContent = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();

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
        "/",
        "/detail",
        "/setttingMove",
        "/report",
        "/settings",
        "/account",
        "/contact"
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
    <div className="flex flex-col flex-1 pb-[25px] relative">
      {/* Truyền toggleSidebar vào Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Nút để điều khiển Sidebar */}
      <button
        ref={buttonRef}
        onClick={toggleSidebar}
        className="absolute top-2 left-5 rounded-md z-40 flex items-center bg-transparent"
      >
        <IoMenuOutline className={`text-[50px] ${isDark ? 'text-text-dark' : 'text-text-light'}`} />
      </button>

      {/* Main content area */}
      <div className={`flex flex-1 transition-all`}>
        {/* Sidebar */}
        <div ref={sidebarRef}>
          <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Nội dung chính */}
        <main className={`flex-1 p-0 transition-all scrollbar-none scrollbar-hidden`}>
          {children}
        </main>
      </div>
    </div>
  );
};

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
      <body className="min-h-screen flex flex-col hidden-on-mobile select-none">
        <ThemeProvider>
          <FullScreenProvider>
            <SnowEffect />
            <MainContent>
              {children}
            </MainContent>
            <Footer />
          </FullScreenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
