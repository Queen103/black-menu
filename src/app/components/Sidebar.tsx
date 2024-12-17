'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuEye, LuPhoneCall, LuSlack } from "react-icons/lu";
import { BiHomeAlt } from "react-icons/bi";
import { MdOutlineEmail } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { useTheme } from '../context/ThemeContext';
import { forwardRef, ForwardedRef } from 'react';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = forwardRef(({ isOpen }: SidebarProps, ref: ForwardedRef<HTMLDivElement>) => {
    const pathname = usePathname();
    const { isDark } = useTheme();

    // Danh sách menu
    const menuItems = [
        { href: "/home", icon: <BiHomeAlt className="text-[26px]" />, label: "GIAO DIỆN CHÍNH" },
        { href: "/detail", icon: <LuEye className="text-[26px]" />, label: "GIAO DIỆN CHI TIẾT" },
        { href: "/setttingMove", icon: <FiSettings className="text-[26px]" />, label: "CÀI ĐẶT CHUYỀN" },
        { href: "/report", icon: <MdOutlineEmail className="text-[26px]" />, label: "CÀI ĐẶT BÁO CÁO" },
        { href: "/gmailSettings", icon: <LuPhoneCall className="text-[26px]" />, label: "CÀI ĐẶT GMAIL" },
        { href: "/settings", icon: <LuSlack className="text-[26px]" />, label: "CÀI ĐẶT CHUNG" },
        { href: "/account", icon: <IoPersonOutline className="text-[26px]" />, label: "TÀI KHOẢN" },
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
        </div>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
