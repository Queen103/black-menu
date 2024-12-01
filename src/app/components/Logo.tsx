import Image from 'next/image';
import { isMobile, isTablet } from 'react-device-detect';

interface LogoProps {
    className?: string;
}

const Logo = ({ className = '' }: LogoProps) => {
    const isPhone = isMobile && !isTablet;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className={`${isPhone ? 'w-[100px]' : 'w-[150px]'} h-[40px] relative mb-2`}>
                <Image
                    src="/vnatech.png"
                    alt="VNATech Logo"
                    fill
                    sizes="100px"
                    priority
                    className="object-contain"
                />
            </div>
            <div className="text-center">
                <p className={`text-white font-bold font-['Arial'] tracking-[0.1em] ${isPhone ? 'text-[8px]' : 'text-[10px]'}`}>
                    Technology  For  Future
                </p>
            </div>
        </div>
    );
};

export default Logo;
