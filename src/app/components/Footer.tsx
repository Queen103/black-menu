// components/Footer.tsx

import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  // Lấy phiên bản từ package.json
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Lấy tháng, cộng thêm 1 vì getMonth() bắt đầu từ 0
  const day = currentDate.getDate();

  // Chuyển đổi ngày tháng thành chuỗi theo định dạng "dd-mm-yyyy"
  const formattedDate = `${day}-${month < 10 ? '0' + month : month}-${year}`;

  return (
    <footer className={`bg-[#4a4a4a] text-white py-1 w-full fixed bottom-0 left-0 ${isDark ? 'bg-gray-900 text-gray-300' : ''}`}>
      <div className="flex justify-between items-center w-full px-6">
        <div className="flex text-white text-sm gap-8"> {/* gap-2.5 tương đương 10px */}
          <p>
            @version: <span>{version}</span>
          </p>
          <p>
            <span className="font-bold">{formattedDate}</span>
          </p>
        </div>

        <div className="text-sm">
          @author: <span className="font-bold">QUEEN</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
