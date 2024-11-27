import { IoMenuOutline } from "react-icons/io5";
import Logo from './Logo';

interface HeaderProps {
    toggleSidebar: () => void; // Định nghĩa kiểu cho toggleSidebar
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <header className="w-full h-[65px] bg-[#4a4a4a] text-white flex items-center px-0 top-0 left-0">
            {/* Nút menu ở góc trái */}
            <div className="flex-grow font-semibold text-[40px] text-white text-center tracking-[0.3em]">
                PHẦN MỀM QUẢN LÝ NĂNG SUẤT
            </div>

            {/* Logo ở góc phải */}
            <div>
                <Logo className="h-14 flex items-center" />
            </div>
        </header>
    );
};

export default Header;
