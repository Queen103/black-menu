interface Machine {
    device_id: number;
    target: number;
    mtg: number;
    actual: number;
    wait_time: number;
    total_min: number;
    shift_1: string;
    shift_2: string;
    temp: number;
    actual_delta_seconds: number;
    device_total_seconds: number;
    connection: boolean;
    ts: number;
    dt: string;
    name?: string; // This will be populated from cpu.ts device list
    enable: boolean;
}

interface CardDetailProps {
    machine: Machine;
    isDarkMode: boolean;
    isFullScreen: boolean;
}

const CardDetail: React.FC<CardDetailProps> = ({ machine, isDarkMode, isFullScreen }) => {
    // Tính toán màu sắc dựa trên trạng thái
    const bgColor = machine.connection ? "bg-connect" : "bg-notConnect";
    const isDisabled = !machine.enable;
    const borderColor = isDisabled
        ? "border-gray-400"
        : machine.connection
            ? isDarkMode
                ? "border-connect"
                : "border-connect"
            : isDarkMode
                ? "border-notConnect"
                : "border-notConnect";

    return (
        <div className={`text-center border-4 rounded-lg transition-transform hover:scale-[102%] ${borderColor} ${isDisabled ? 'opacity-40 bg-gray-400' : isDarkMode ? 'bg-secondary' : 'bg-bg-light'}`}>
            <h3 className={`text-text-dark ${isFullScreen ? "py-3 text-3xl" : "py-2 text-2xl"} rounded-t-sm font-semibold justify-center ${isDisabled ? 'bg-gray-500' : bgColor} ${isFullScreen ? "mb-4" : "mb-2"}`}>
                {machine.name}
            </h3>
            <div className={`mb-3 grid grid-cols-2 gap-y-2 p-1 item-center px-3 ${isDisabled ? 'text-gray-700' : ''}`}>
                <strong className={`text-start text-xl ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Mục Tiêu Ngày</strong>
                <span className={`text-3xl text-end ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.target}</span>
                <strong className={`text-start text-xl ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Mục Tiêu Giờ</strong>
                <span className={`text-3xl text-end ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.mtg}</span>
                <strong className={`text-start text-xl ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Thực Hiện</strong>
                <span className={`text-3xl text-end ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.actual}</span>
                <strong className={`text-start text-xl ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>Hiệu Suất (%)</strong>
                <span className={`text-3xl text-end ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>
                    {(machine.mtg <= 0 || machine.actual < 0) ? "-" : ((machine.actual / machine.mtg) * 100).toFixed(1)}
                </span>
            </div>
        </div>
    );
};

export default CardDetail;
