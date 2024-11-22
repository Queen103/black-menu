import { IoMenuOutline } from "react-icons/io5";
import Image from 'next/image';

interface HeaderProps {
    toggleSidebar: () => void; // Định nghĩa kiểu cho toggleSidebar
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <header className="w-full h-[60px] bg-[#4a4a4a] text-white flex items-center px-4 top-0 left-0">
            {/* Nút menu ở góc trái */}


            {/* Tên "PHẦN MỀM QUẢN LÝ NĂNG SUẤT" */}
            <div className="flex-grow font-semibold text-[32px] text-white text-center">
                PHẦN MỀM QUẢN LÝ NĂNG SUẤT
            </div>

            {/* Logo ở góc phải */}
            <div>
                <Image src="/vnatech.png" alt="Logo" width={48} height={48} className="h-12 w-auto" />
            </div>
        </header>
    );
};

export default Header;
