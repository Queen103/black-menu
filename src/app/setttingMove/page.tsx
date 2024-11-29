"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";
import { useTheme } from "../context/ThemeContext";
import { fetchMachines, updateMachine } from '@/services/api';

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
    morningTime: string;
    afternoonTime: string;
}

const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [editedMachines, setEditedMachines] = useState<{ [key: number]: Partial<Machine> }>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { isDark } = useTheme();

    // Refs for input fields
    const inputRefs = {
        morning: {
            hour1: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            hour2: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            minute1: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            minute2: useRef<{ [key: number]: HTMLInputElement }>({}).current,
        },
        afternoon: {
            hour1: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            hour2: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            minute1: useRef<{ [key: number]: HTMLInputElement }>({}).current,
            minute2: useRef<{ [key: number]: HTMLInputElement }>({}).current,
        }
    };

    // Wrap fetchMachineData trong useCallback
    const fetchMachineData = useCallback(async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const data = await fetchMachines();
            setMachines(data);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            if (isFirstLoad) {
                setIsLoading(false);
            }
        }
    }, [isFirstLoad]);

    const checkFullScreen = useCallback(() => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    }, []);

    const FETCH_INTERVAL = 1000; // 1 second for API calls
    const UI_UPDATE_INTERVAL = 2000; // 5 seconds for UI updates

    // Thiết lập các hiệu ứng UI
    useEffect(() => {
        // Initial setup
        document.addEventListener("fullscreenchange", checkFullScreen);
        checkFullScreen();

        // Set up interval for UI updates
        const intervalId = setInterval(() => {
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, UI_UPDATE_INTERVAL);

        // Cleanup
        return () => {
            document.removeEventListener("fullscreenchange", checkFullScreen);
            clearInterval(intervalId);
        };
    }, [checkFullScreen]);

    // Fetch data effect
    useEffect(() => {
        fetchMachineData(); // Initial fetch
        const fetchInterval = setInterval(fetchMachineData, FETCH_INTERVAL);

        return () => clearInterval(fetchInterval);
    }, [fetchMachineData]);

    const handleChange = (machineId: number, field: keyof Machine, value: any) => {
        setEditedMachines(prev => ({
            ...prev,
            [machineId]: {
                ...prev[machineId],
                [field]: value
            }
        }));
    };

    const handleChangeStateMachine = async (machineId: number, field: keyof Machine, value: any) => {
        try {
            setEditedMachines(prev => ({
                ...prev,
                [machineId]: {
                    ...prev[machineId],
                    [field]: value
                }
            }));

            await updateMachine(machineId, { [field]: value });

            toast.success('Cập nhật trạng thái thành công!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            fetchMachineData();
        } catch (error) {
            console.error('Error updating machine status:', error);
            toast.error('Cập nhật trạng thái thất bại!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, machineId: number) => {
        if (e.key === 'Enter') {
            try {
                const editedMachine = editedMachines[machineId];
                if (!editedMachine) return;

                const originalMachine = machines.find(m => m.id === machineId);
                if (!originalMachine) return;

                // Tạo mảng lưu các thay đổi
                const changes: string[] = [];

                // So sánh và ghi nhận các thay đổi
                if (editedMachine.name !== undefined && editedMachine.name !== originalMachine.name) {
                    changes.push(`Tên: ${originalMachine.name} → ${editedMachine.name}`);
                }
                if (editedMachine.dailyTarget !== undefined && editedMachine.dailyTarget !== originalMachine.dailyTarget) {
                    changes.push(`Mục tiêu ngày: ${originalMachine.dailyTarget} → ${editedMachine.dailyTarget}`);
                }
                if (editedMachine.actual !== undefined && editedMachine.actual !== originalMachine.actual) {
                    changes.push(`Thực hiện: ${originalMachine.actual} → ${editedMachine.actual}`);
                }
                if (editedMachine.morningTime !== undefined && editedMachine.morningTime !== originalMachine.morningTime) {
                    changes.push(`Ca sáng: ${originalMachine.morningTime} → ${editedMachine.morningTime}`);
                }
                if (editedMachine.afternoonTime !== undefined && editedMachine.afternoonTime !== originalMachine.afternoonTime) {
                    changes.push(`Ca chiều: ${originalMachine.afternoonTime} → ${editedMachine.afternoonTime}`);
                }

                await updateMachine(machineId, editedMachine);

                // Xóa dữ liệu đã chỉnh sửa sau khi cập nhật thành công
                setEditedMachines(prev => {
                    const newState = { ...prev };
                    delete newState[machineId];
                    return newState;
                });

                // Hiển thị thông báo với chi tiết thay đổi
                if (changes.length > 0) {
                    toast.success(
                        <div>
                            <div className="font-bold mb-2">Cập nhật thành công Line {machineId}:</div>
                            {changes.map((change, index) => (
                                <div key={index} className="ml-2">• {change}</div>
                            ))}
                        </div>,
                        {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                }

            } catch (error) {
                console.error('Error:', error);
                toast.error('Có lỗi xảy ra khi cập nhật!', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    };

    const enabledCount = machines.filter((machine) => machine.enable).length;
    const idCount = machines.filter((machine) => machine.id).length;

    return (
        <div className={`px-2 h-full ${isDark ? 'text-text-dark bg-bg-dark' : 'text-text-light bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDark} />}
            <CustomToast isDarkMode={isDark} />
            {/* Bảng 1: Trạng Thái */}
            <div>
                <div className="flex justify-between items-center py-2 ">
                    <div className={`text-lg select-none ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        Số Line đang hoạt động: {enabledCount}/{idCount}
                    </div>
                    <h2 className={`text-xl ${isFullScreen ? "text-3xl" : "text-xl"} font-bold select-none text-center ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        Bảng Trạng Thái
                    </h2>
                    <div className="w-[250px]"></div>
                </div>
                <div className="overflow-x-auto mb-2 text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <th key={machine.id} className={`border-2 text-text-dark ${isDark ? 'border-border-dark' : 'border-border-light'} px-4 py-0 text-center ${machine.enable ? "bg-connect" : "bg-notConnect"}`}>
                                        {machine.id}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <td
                                        key={machine.id}
                                        className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'} cursor-pointer`}
                                        onClick={() => handleChangeStateMachine(machine.id, "enable", !(editedMachines[machine.id]?.enable ?? machine.enable))}
                                    >
                                        <div className="flex justify-center items-center h-full">
                                            <input
                                                type="checkbox"
                                                checked={editedMachines[machine.id]?.enable ?? machine.enable}
                                                onChange={(e) => handleChangeStateMachine(machine.id, "enable", e.target.checked)}
                                                className="w-5 h-5"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </td>

                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Bảng 2: Cài Đặt */}
            <div>
                <h2 className={` font-bold mb-2 select-none text-center ${isFullScreen ? "text-3xl" : "text-xl"} ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                    Bảng Cài Đặt
                </h2>
                <div className="overflow-x-auto text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr className={`${isDark ? 'border-border-dark bg-bg-table' : 'border-border-light bg-gray-400'}`}>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>ID</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Tên</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Mục Tiêu Ngày</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Thực Hiện</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Ca Sáng</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Ca Chiều</th>
                                <th className={`border-2 border-black ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>Trạng Thái Kết Nối</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                machines.filter(machine => machine.enable).map((machine, index) => (
                                    <tr key={machine.id} className={`${index % 2 === 0
                                        ? isDark ? "bg-bg-tableIn text-text-dark" : "bg-gray-100 text-text-light"
                                        : isDark ? "bg-bg-tableOut text-text-dark" : "bg-gray-300 text-text-light"} 
                                ${!machine.isConnect ? "blink animate-blink opacity-60" : ""}`}>
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'}`}>
                                            {machine.id}
                                        </td>
                                        {/* Tên */}
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-center w-1/2">{machine.name}</span>
                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.id]?.name ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "name", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        {/* Mục tiêu ngày */}
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.dailyTarget}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    value={editedMachines[machine.id]?.dailyTarget ?? ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (value >= 0 && value <= 999) {
                                                            handleChange(machine.id, "dailyTarget", value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        {/* Thực hiện */}
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.actual}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    value={editedMachines[machine.id]?.actual ?? ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (value >= 0 && value <= 999) {
                                                            handleChange(machine.id, "actual", value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.morningTime}</span>
                                                <div className="flex items-center w-1/2 mr-10">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[0]?.charAt(0) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-2]$/.test(value)) {
                                                                    const currentHours = editedMachines[machine.id]?.morningTime?.split(":")[0] ?? "00";
                                                                    const newHours = value + currentHours.charAt(1);
                                                                    const minutes = editedMachines[machine.id]?.morningTime?.split(":")[1] ?? "00";
                                                                    handleChange(machine.id, "morningTime", `${newHours}:${minutes}`);
                                                                    inputRefs.morning.hour2[machine.id]?.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-2]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.morning.hour1[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[0]?.charAt(1) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-9]$/.test(value)) {
                                                                    const currentHours = editedMachines[machine.id]?.morningTime?.split(":")[0] ?? "00";
                                                                    const firstDigit = currentHours.charAt(0);
                                                                    if ((firstDigit === "2" && parseInt(value) <= 4) || firstDigit !== "2") {
                                                                        const newHours = currentHours.charAt(0) + value;
                                                                        const minutes = editedMachines[machine.id]?.morningTime?.split(":")[1] ?? "00";
                                                                        handleChange(machine.id, "morningTime", `${newHours}:${minutes}`);
                                                                        inputRefs.morning.minute1[machine.id]?.focus();
                                                                    }
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-9]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.morning.hour2[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                    <span className="mx-1 font-bold">:</span>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[1]?.charAt(0) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-5]$/.test(value)) {
                                                                    const currentMinutes = editedMachines[machine.id]?.morningTime?.split(":")[1] ?? "00";
                                                                    const newMinutes = value + currentMinutes.charAt(1);
                                                                    const hours = editedMachines[machine.id]?.morningTime?.split(":")[0] ?? "00";
                                                                    handleChange(machine.id, "morningTime", `${hours}:${newMinutes}`);
                                                                    inputRefs.morning.minute2[machine.id]?.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-5]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.morning.minute1[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[1]?.charAt(1) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-9]$/.test(value)) {
                                                                    const currentMinutes = editedMachines[machine.id]?.morningTime?.split(":")[1] ?? "00";
                                                                    const newMinutes = currentMinutes.charAt(0) + value;
                                                                    const hours = editedMachines[machine.id]?.morningTime?.split(":")[0] ?? "00";
                                                                    handleChange(machine.id, "morningTime", `${hours}:${newMinutes}`);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-9]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.morning.minute2[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.afternoonTime}</span>
                                                <div className="flex items-center w-1/2 mr-10">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[0]?.charAt(0) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-2]$/.test(value)) {
                                                                    const currentHours = editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? "00";
                                                                    const newHours = value + currentHours.charAt(1);
                                                                    const minutes = editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? "00";
                                                                    handleChange(machine.id, "afternoonTime", `${newHours}:${minutes}`);
                                                                    inputRefs.afternoon.hour2[machine.id]?.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-2]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.afternoon.hour1[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[0]?.charAt(1) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-9]$/.test(value)) {
                                                                    const currentHours = editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? "00";
                                                                    const firstDigit = currentHours.charAt(0);
                                                                    if ((firstDigit === "2" && parseInt(value) <= 4) || firstDigit !== "2") {
                                                                        const newHours = currentHours.charAt(0) + value;
                                                                        const minutes = editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? "00";
                                                                        handleChange(machine.id, "afternoonTime", `${newHours}:${minutes}`);
                                                                        inputRefs.afternoon.minute1[machine.id]?.focus();
                                                                    }
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-9]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.afternoon.hour2[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                    <span className="mx-1 font-bold">:</span>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[1]?.charAt(0) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-5]$/.test(value)) {
                                                                    const currentMinutes = editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? "00";
                                                                    const newMinutes = value + currentMinutes.charAt(1);
                                                                    const hours = editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? "00";
                                                                    handleChange(machine.id, "afternoonTime", `${hours}:${newMinutes}`);
                                                                    inputRefs.afternoon.minute2[machine.id]?.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-5]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.afternoon.minute1[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[1]?.charAt(1) ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^[0-9]$/.test(value)) {
                                                                    const currentMinutes = editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? "00";
                                                                    const newMinutes = currentMinutes.charAt(0) + value;
                                                                    const hours = editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? "00";
                                                                    handleChange(machine.id, "afternoonTime", `${hours}:${newMinutes}`);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleKeyDown(e, machine.id);
                                                                } else if (/^[0-9]$/.test(e.key)) {
                                                                    e.currentTarget.select();
                                                                }
                                                            }}
                                                            ref={(el) => {
                                                                if (el) inputRefs.afternoon.minute2[machine.id] = el;
                                                            }}
                                                            className={`w-8 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Trạng Thái Kết Nối */}
                                        <td className={`border-2 text-center w-[25vh] ${isFullScreen ? " py-0.5 text-2xl" : " text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                            <div className="flex justify-center items-center h-full">
                                                <span className={`p-1.5 font-semibold text-text-dark w-full h-full flex items-center justify-center ${machine.isConnect ? "bg-connect" : "bg-error opacity-80 blink"}`}>
                                                    {machine.isConnect ? "Kết Nối" : "Mất Kết Nối"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
