'use client';  // Đánh dấu đây là Client Component

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';  // Hook để lấy đường dẫn hiện tại
import Link from 'next/link';
import { LuEye, LuPhoneCall, LuSlack } from "react-icons/lu";
import { BiHomeAlt } from "react-icons/bi";
import { MdOutlineEmail } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";  // Thêm biểu tượng chế độ tối sáng

interface SidebarProps {
    isOpen: boolean;  // Thêm prop để kiểm soát việc hiển thị
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const pathname = usePathname();  // Lấy đường dẫn hiện tại

    // State để kiểm tra chế độ sáng/tối
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Kiểm tra chế độ tối đã được lưu trong localStorage
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

    // Hàm để chuyển đổi chế độ sáng/tối
    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            // Lưu trạng thái vào localStorage
            localStorage.setItem("theme", newMode ? "dark" : "light");

            // Thêm hoặc loại bỏ lớp dark vào thẻ html
            if (newMode) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            return newMode;
        });
    };

    return (
        <div className={`w-55 bg-[#24c0cd] pt-[60px] fixed z-10 top-0 left-0 h-full font-semibold h-screen p-0 flex flex-col fixed top-0 left-0 transition-all ${isOpen ? 'transform-none' : '-translate-x-full'}`}>
            <ul className="list-none space-y-0 flex-grow"> {/* Thêm flex-grow để các mục chiếm không gian còn lại */}
                <li className="flex items-center w-full">
                    <Link
                        href="/"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <BiHomeAlt className="text-[26px]" />
                        <span>GIAO DIỆN CHÍNH</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/detail"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/detail' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <LuEye className="text-[26px]" />
                        <span>GIAO DIỆN CHI TIẾT</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/setttingMove"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/setttingMove' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <FiSettings className="text-[26px]" />
                        <span>CÀI ĐẶT CHUYỀN</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/report"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/report' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <MdOutlineEmail className="text-[26px]" />
                        <span>CÀI ĐẶT BÁO CÁO</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/settings"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/settings' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <LuSlack className="text-[26px]" />
                        <span>CÀI ĐẶT CHUNG</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/account"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-4 w-full ${pathname === '/account' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <IoPersonOutline className="text-[26px]" />
                        <span>TÀI KHOẢN</span>
                    </Link>
                </li>
                <li className="flex items-center w-full">
                    <Link
                        href="/contact"
                        className={`flex items-center space-x-3 text-[13px] px-3 py-2 w-full ${pathname === '/contact' ? 'bg-[#17a0a8] text-black' : 'hover:bg-[#17a0a8] text-white text-opacity-80'}`}
                    >
                        <LuPhoneCall className="text-[26px]" />
                        <span>LIÊN HỆ</span>
                    </Link>
                </li>
            </ul>

            {/* Nút chuyển chế độ tối/sáng */}
            <div className="p-3 mt-auto"> {/* mt-auto để đẩy nút xuống dưới cùng */}
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center w-full text-white text-opacity-80"
                >
                    <div className={`relative w-10 h-10 transition-all duration-300`}>
                        {/* Mặt trời (sun) */}
                        <BsFillSunFill
                            className={`absolute w-6 h-6 bottom-10 left-0 transition-all duration-500 text-white ${isDarkMode ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
                            style={{ transition: 'transform 0.5s, opacity 0.5s' }}
                        />
                        {/* Mặt trăng (moon) */}
                        <BsFillMoonStarsFill
                            className={`absolute w-6 h-6 bottom-10 left-0 transition-all duration-500 text-black ${isDarkMode ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
                            style={{ transition: 'transform 0.5s, opacity 0.5s' }}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
