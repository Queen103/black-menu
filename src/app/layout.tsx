'use client'; // Đánh dấu đây là Client Component

import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header'; // Import Header component
import './globals.css'; // Nhập vào file CSS
import Footer from './components/Footer'; // Import Footer component
import { IoMenuOutline } from "react-icons/io5";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Quản lý trạng thái của Sidebar
  const sidebarRef = useRef<HTMLDivElement>(null); // Tạo ref cho sidebar
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref cho nút bấm

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col hidden-on-mobile scroll-container">
        <div className="flex flex-col flex-1 pb-[25px] relative">
          {/* Truyền toggleSidebar vào Header */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Nút để điều khiển Sidebar */}
          <button
            ref={buttonRef}
            onClick={toggleSidebar}
            className="absolute top-2 left-5 text-white rounded-md z-30 flex items-center bg-transparent"
          >
            <IoMenuOutline className="text-[50px]" />
          </button>

          {/* Main content area */}
          <div className={`flex flex-1 transition-all`}>
            {/* Sidebar */}
            <div ref={sidebarRef}>
              <Sidebar isOpen={sidebarOpen} />
            </div>

            {/* Nội dung chính */}
            <main className={`flex-1 p-0 bg-[#e6e6e6] transition-all scrollbar-none scrollbar-hidden`}>
              {children}
            </main>
          </div>
        </div>

        {/* Footer bám dính dưới cùng */}
        <Footer />
      </body>
    </html>
  );
}
