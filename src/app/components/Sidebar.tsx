'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuEye, LuPhoneCall, LuSlack } from "react-icons/lu";
import { BiHomeAlt } from "react-icons/bi";
import { MdOutlineEmail } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const pathname = usePathname();

    // State kiểm tra chế độ sáng/tối
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Kiểm tra chế độ tối từ localStorage hoặc hệ thống
    useEffect(() => {
        const savedMode = localStorage.getItem("theme");
        if (savedMode === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Chuyển đổi chế độ sáng/tối
    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            if (newMode) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            return newMode;
        });
    };

    // Màu nền và chữ dựa trên chế độ sáng/tối
    const bgClass = isDarkMode ? "bg-sideBar-dark text-white" : "bg-sideBar-light text-black";

    // Danh sách menu
    const menuItems = [
        { href: "/", icon: <BiHomeAlt className="text-[26px]" />, label: "GIAO DIỆN CHÍNH" },
        { href: "/detail", icon: <LuEye className="text-[26px]" />, label: "GIAO DIỆN CHI TIẾT" },
        { href: "/setttingMove", icon: <FiSettings className="text-[26px]" />, label: "CÀI ĐẶT CHUYỀN" },
        { href: "/report", icon: <MdOutlineEmail className="text-[26px]" />, label: "CÀI ĐẶT BÁO CÁO" },
        { href: "/settings", icon: <LuSlack className="text-[26px]" />, label: "CÀI ĐẶT CHUNG" },
        { href: "/account", icon: <IoPersonOutline className="text-[26px]" />, label: "TÀI KHOẢN" },
        { href: "/contact", icon: <LuPhoneCall className="text-[26px]" />, label: "LIÊN HỆ" },
    ];

    return (
        <div
            className={`w-55 pt-[60px] ${bgClass} fixed z-30 top-0 left-0 h-screen font-semibold p-0 flex flex-col transition-all ${isOpen ? "transform-none" : "-translate-x-full"
                }`}
        >
            <ul className="list-none space-y-0 flex-grow">
                {menuItems.map(({ href, icon, label }) => (
                    <li key={href} className="flex items-center w-full">
                        <Link
                            href={href}
                            className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full select-none ${pathname === href
                                ? isDarkMode
                                    ? "bg-dark-selected" // Nền cho chế độ tối
                                    : "bg-light-selected" // Nền cho chế độ sáng
                                : "hover:bg-primary text-opacity-80" // Nền khi hover
                                }`}
                        >
                            {icon}
                            <span className="select-none">{label}</span>
                        </Link>

                    </li>
                ))}
            </ul>

            {/* Nút chuyển chế độ tối/sáng */}
            <div className="p-3 mt-auto">
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center w-full"
                >
                    <div className="relative w-10 h-10">
                        {/* Mặt trời (sun) */}
                        <BsFillSunFill
                            className={`absolute w-6 h-6 transition-all duration-1000 ${isDarkMode ? "translate-y-full opacity-0" : "translate-y-0 opacity-100 "
                                }`}
                        />
                        {/* Mặt trăng (moon) */}
                        <BsFillMoonStarsFill
                            className={`absolute w-6 h-6 transition-all duration-1000 ${isDarkMode ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                                }`}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
