interface Machine {
    id: number;
    name: string;
    dailyTarget: number;
    hourTarget: number;
    actual: number;
    isConnect: boolean;
    enable: boolean;
    is_Blink: boolean;
    performance: number;
}

interface CardDetailProps {
    machine: Machine;
    isDarkMode: boolean;
    isFullScreen: boolean;
}

const CardDetail: React.FC<CardDetailProps> = ({ machine, isDarkMode, isFullScreen }) => {
    // Tính toán màu sắc dựa trên trạng thái
    const bgColor = machine.isConnect ? "bg-connect" : "bg-notConnect";
    const borderColor = machine.isConnect
        ? isDarkMode
            ? "border-connect"
            : "border-connect"
        : isDarkMode
            ? "border-notConnect"
            : "border-notConnect";

    return (
        <div className={`text-center border-4 ${isDarkMode ? 'bg-bg-dark' : 'bg-bg-light'} rounded-lg transition-transform hover:scale-[102%] ${borderColor}`}>
            <h3 className={`text-text-dark ${isFullScreen ? "py-3 text-3xl" : "py-2 text-2xl"} rounded-t-sm font-semibold justify-center ${bgColor} ${isFullScreen ? "mb-4" : "mb-2"}`}>
                {machine.name}
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-y-2 p-1 item-center px-3">
                <strong className={`text-start text-xl ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Mục Tiêu Ngày</strong>
                <span className={`text-3xl text-end ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.dailyTarget}</span>
                <strong className={`text-start text-xl ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Mục Tiêu Giờ</strong>
                <span className={`text-3xl text-end ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.hourTarget}</span>
                <strong className={`text-start text-xl ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Thực Hiện</strong>
                <span className={`text-3xl text-end ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.actual}</span>
                <strong className={`text-start text-xl ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Hiệu Suất</strong>
                <span className={`text-3xl text-end ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.performance}</span>
            </div>
        </div>
    );
};

export default CardDetail;
