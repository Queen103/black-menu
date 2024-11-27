"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";

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
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Wrap fetchMachineData trong useCallback
    const fetchMachineData = useCallback(async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const response = await fetch("/api/machines");
            if (!response.ok) {
                throw new Error("API response not ok");
            }
            const data = await response.json();
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
    }, [isFirstLoad]); // Empty dependency array because it doesn't depend on any props or state

    const checkFullScreen = useCallback(() => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    }, []);

    const initializeTheme = useCallback(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    const FETCH_INTERVAL = 1000; // 1 second for API calls
    const UI_UPDATE_INTERVAL = 2000; // 5 seconds for UI updates

    // Thiết lập các hiệu ứng UI
    useEffect(() => {
        // Initial setup
        initializeTheme();
        document.addEventListener("fullscreenchange", checkFullScreen);
        checkFullScreen();

        // Set up interval for UI updates
        const intervalId = setInterval(() => {
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();

            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                setIsDarkMode(savedTheme === "dark");
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDarkMode(prefersDark);
            }
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
            // Cập nhật state local trước
            setEditedMachines(prev => ({
                ...prev,
                [machineId]: {
                    ...prev[machineId],
                    [field]: value
                }
            }));

            // Gọi API để cập nhật
            const response = await fetch(`/api/machines/${machineId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [field]: value
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update machine status');
            }

            toast.success('Cập nhật trạng thái thành công!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Cập nhật lại dữ liệu
            fetchMachineData();
        } catch (error) {
            console.error('Error updating machine status:', error);
            toast.error('Cập nhật trạng thái thất bại!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Rollback state nếu API thất bại
            setEditedMachines(prev => {
                const newState = { ...prev };
                delete newState[machineId];
                return newState;
            });
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, machineId: number) => {
        if (e.key === 'Enter') {
            try {
                const response = await fetch(`/api/machines/${machineId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editedMachines[machineId]),
                });

                if (!response.ok) {
                    throw new Error('Failed to update machine');
                }

                // Xóa dữ liệu đã chỉnh sửa sau khi cập nhật thành công
                setEditedMachines(prev => {
                    const newState = { ...prev };
                    delete newState[machineId];
                    return newState;
                });

                toast.success('Cập nhật thành công!', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } catch (error) {
                console.error('Error updating machine:', error);
                toast.error('Cập nhật thất bại!', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    };

    const enabledCount = machines.filter((machine) => machine.enable || (!machine.isConnect)).length;
    const idCount = machines.filter((machine) => machine.id).length;

    return (
        <div className={`px-2 h-full ${isDarkMode ? 'text-text-dark bg-bg-dark' : 'text-text-light bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDarkMode} />}
            <CustomToast isDarkMode={isDarkMode} />
            {/* Bảng 1: Trạng Thái */}
            <div>
                <div className="flex justify-between items-center py-2 ">
                    <div className={`text-lg select-none ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>
                        Số Line đang hoạt động: {enabledCount}/{idCount}
                    </div>
                    <h2 className={`text-xl ${isFullScreen ? "text-3xl" : "text-xl"} font-bold select-none text-center ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>
                        Bảng Trạng Thái
                    </h2>
                    <div className="w-[250px]"></div>
                </div>
                <div className="overflow-x-auto mb-2 text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDarkMode ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <th key={machine.id} className={`border-2 text-text-dark ${isDarkMode ? 'border-border-dark' : 'border-border-light'} px-4 py-0 text-center ${machine.enable ? "bg-connect" : "bg-notConnect"}`}>
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
                                        className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'} cursor-pointer`}
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
                <h2 className={` font-bold mb-2 select-none text-center ${isFullScreen ? "text-3xl" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'}`}>
                    Bảng Cài Đặt
                </h2>
                <div className="overflow-x-auto text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDarkMode ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr className={`${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>ID</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>Tên</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>Mục Tiêu Ngày</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>Thực Hiện</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>Ca Sáng</th>
                                <th className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'} text-2xl`}>Ca Chiều</th>
                                <th className={`border-2 border-black text-2xl ${isDarkMode ? 'border-border-dark' : 'border-border-light'}`}>Trạng Thái Kết Nối</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                machines.map((machine) => {
                                    // Nếu máy không được enable, trả về null để không hiển thị dòng
                                    if (!machine.enable) {
                                        return null;
                                    }

                                    return (
                                        <tr key={machine.id} className={` ${machine.isConnect ? isDarkMode ? "bg-secondary text-text-dark" : "bg-bg-light text-text-light" : isDarkMode ? "bg-error opacity-80 blink" : "bg-error opacity-80 blink"}`}>
                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
                                                {machine.id}
                                            </td>
                                            {/* Tên */}
                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-center w-1/2">{machine.name}</span>
                                                    <input
                                                        type="text"
                                                        value={editedMachines[machine.id]?.name ?? ""}
                                                        onChange={(e) => handleChange(machine.id, "name", e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                        className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            {/* Mục tiêu ngày */}
                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
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
                                                        className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            {/* Thực hiện */}
                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
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
                                                        className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold px-2 text-center w-1/2">{machine.morningTime}</span>
                                                    <div className="flex items-center w-1/2 mr-10">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="24"
                                                            onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[0] ?? ""}
                                                            onChange={(e) => {
                                                                const hours = Math.min(24, Math.max(0, Number(e.target.value)));
                                                                const minutes = editedMachines[machine.id]?.morningTime?.split(":")[1] ?? "00";
                                                                handleChange(machine.id, "morningTime", `${hours}:${minutes}`);
                                                            }}
                                                            className={`w-12 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <span className="mx-1 font-bold">:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                            value={editedMachines[machine.id]?.morningTime?.split(":")[1] ?? ""}
                                                            onChange={(e) => {
                                                                const minutes = Math.min(59, Math.max(0, Number(e.target.value)));
                                                                const hours = editedMachines[machine.id]?.morningTime?.split(":")[0] ?? "00";
                                                                handleChange(machine.id, "morningTime", `${hours}:${minutes}`);
                                                            }}
                                                            className={`w-12 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDarkMode ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold px-2 text-center w-1/2">{machine.afternoonTime}</span>
                                                    <div className="flex items-center w-1/2 mr-10">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="24"
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? ""}
                                                            onChange={(e) => {
                                                                const hours = Math.min(24, Math.max(0, Number(e.target.value)));
                                                                const minutes = editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? "00";
                                                                handleChange(machine.id, "afternoonTime", `${hours}:${minutes}`);
                                                            }}
                                                            className={`w-12 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                        <span className="mx-1 font-bold">:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={editedMachines[machine.id]?.afternoonTime?.split(":")[1] ?? ""}
                                                            onChange={(e) => {
                                                                const minutes = Math.min(59, Math.max(0, Number(e.target.value)));
                                                                const hours = editedMachines[machine.id]?.afternoonTime?.split(":")[0] ?? "00";
                                                                handleChange(machine.id, "afternoonTime", `${hours}:${minutes}`);
                                                            }}
                                                            className={`w-12 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDarkMode ? 'text-text-dark' : 'text-text-light'} bg-transparent border-b border-border-dark text-center focus:outline-none focus:border-b focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Trạng Thái Kết Nối */}
                                            <td className={`border-2 text-center w-[25vh] ${isFullScreen ? " py-0.5 text-2xl" : " text-xl"} ${isDarkMode ? 'border-border-dark' : 'border-border-light'}`}>
                                                <div className="flex justify-center items-center h-full">
                                                    <span
                                                        className={`p-1.5 font-semibold text-text-dark w-full h-full flex items-center justify-center ${machine.isConnect ? "bg-connect" : "bg-notConnect"
                                                            } shadow-inner shadow-[inset_0px_0px_10px_rgba(255,255,255,1)]`}
                                                    >
                                                        {machine.isConnect ? "Kết Nối" : "Mất Kết Nối"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
