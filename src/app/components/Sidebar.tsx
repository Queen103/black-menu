'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuEye, LuSlack } from "react-icons/lu";
import { BiHomeAlt } from "react-icons/bi";
import { MdOutlineEmail } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { IoLogOutOutline } from 'react-icons/io5';
import { IoTimerOutline } from "react-icons/io5";
import { useTheme } from '../context/ThemeContext';
import { forwardRef, ForwardedRef } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/api/user';
import { useLanguage } from '../context/LanguageContext';
import { MdOutlineMonitor } from "react-icons/md";
import messages from '@/messages';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = forwardRef(({ isOpen }: SidebarProps, ref: ForwardedRef<HTMLDivElement>) => {
    const pathname = usePathname();
    const { isDark } = useTheme();
    const router = useRouter();
    const { language } = useLanguage();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Danh sách menu
    const menuItems = [
        { href: "/home", icon: <BiHomeAlt className="text-[26px]" />, label: messages[language].sidebar.menu.home },
        { href: "/detail", icon: <LuEye className="text-[26px]" />, label: messages[language].sidebar.menu.detail },
        { href: "/setttingMove", icon: <FiSettings className="text-[26px]" />, label: messages[language].sidebar.menu.line_settings },
        { href: "/monitor", icon: <MdOutlineMonitor className="text-[26px]" />, label: messages[language].sidebar.menu.monitor },
        { href: "/report", icon: <IoTimerOutline className="text-[26px]" />, label: messages[language].sidebar.menu.report_settings },
        { href: "/gmailSettings", icon: <MdOutlineEmail className="text-[26px]" />, label: messages[language].sidebar.menu.email_settings },
        { href: "/settings", icon: <LuSlack className="text-[26px]" />, label: messages[language].sidebar.menu.general_settings },
        { href: "/account", icon: <IoPersonOutline className="text-[26px]" />, label: messages[language].sidebar.menu.account },
    ];

    // Màu nền và chữ dựa trên chế độ sáng/tối
    const bgClass = isDark ? "bg-sideBar-dark text-white" : "bg-sideBar-light text-black";

    return (
        <div
            ref={ref}
            className={`w-[220px] pt-[60px] ${bgClass} fixed z-30 top-0 left-0 h-screen font-semibold p-0 flex flex-col transition-all duration-300 ${isOpen ? "transform-none" : "-translate-x-full"}`}
        >
            <ul className="list-none space-y-0 flex-grow">
                {menuItems.map(({ href, icon, label }) => (
                    <li key={href} className="flex items-center w-full">
                        <Link
                            href={href}
                            className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full select-none transition-colors duration-200 ${pathname === href
                                    ? isDark
                                        ? "bg-dark-selected hover:bg-gray-600 text-opacity-80"
                                        : "bg-light-selected hover:bg-gray-200 text-opacity-80"
                                    : isDark
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-slate-200"
                                }`}
                        >
                            {icon}
                            <span className="select-none">{label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="px-4 pb-10">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <IoLogOutOutline className="w-5 h-5 mr-3" />
                    <span>{messages[language].sidebar.logout}</span>
                </button>
            </div>
        </div>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
