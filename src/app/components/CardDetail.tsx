import { useLanguage } from '../context/LanguageContext';
import messages from '@/messages';

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
    name?: string;
    enable: boolean;
}

interface CardDetailProps {
    machine: Machine;
    isDarkMode: boolean;
    isFullScreen: boolean;
}

const CardDetail: React.FC<CardDetailProps> = ({ machine, isDarkMode, isFullScreen }) => {
    const { language } = useLanguage();
    const t = messages[language].detail.card;

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
        <div className={`text-center border-2 rounded-lg h-[27vh] transition-transform hover:scale-[102%] ${borderColor} ${isDisabled ? 'opacity-40 bg-gray-400' : isDarkMode ? 'bg-secondary' : 'bg-bg-light'}`}>
            <h3 className={`text-text-dark ${isFullScreen ? "py-0 text-2xl" : "py-1 text-xl"} rounded-t-sm font-semibold justify-center ${isDisabled ? 'bg-gray-500' : bgColor}`}>
                    {machine.name}
                </h3>
                <div className={`h-[calc(27vh-3rem)] grid grid-cols-2 gap-y-0 items-center px-2 ${isDisabled ? 'text-gray-700' : ''}`}>
                    <strong className={`text-start text-base leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{t.daily_target}</strong>
                    <span className={`text-3xl text-end leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.target}</span>
                    <strong className={`text-start text-base leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{t.hourly_target}</strong>
                    <span className={`text-3xl text-end leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.mtg}</span>
                    <strong className={`text-start text-base leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{t.actual}</strong>
                    <span className={`text-3xl text-end leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{machine.actual}</span>
                    <strong className={`text-start text-base leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{t.difference}</strong>
                    <span className={`text-3xl text-end leading-none ${(machine.actual - machine.mtg) > 0 ? 'text-green-500' : 'text-red-500'} `}>
                        {(machine.actual - machine.mtg).toFixed(0)}
                    </span>
                    <strong className={`text-start text-base leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>{t.performance}</strong>
                    <span className={`text-3xl text-end leading-none ${isDisabled ? 'text-gray-700' : isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>
                        {(machine.mtg <= 0 || machine.actual < 0) ? "-" : ((machine.actual / machine.mtg) * 100).toFixed(1)}
                    </span>
            </div>
        </div>
    );
};

export default CardDetail;
