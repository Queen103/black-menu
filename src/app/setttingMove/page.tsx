"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";
import { useTheme } from "../context/ThemeContext";
import {
    fetchMachines,
    setDeviceEnable,
    setDeviceName,
    setDeviceTarget,
    setDeviceStartShift1,
    setDeviceStartShift2,
    setDeviceActual,
    type Machine
} from '@/services/api/machines';
import InputTime4Number from '../components/InputTime4Number';

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
        const intervaldevice_id = setInterval(() => {
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, UI_UPDATE_INTERVAL);

        // Cleanup
        return () => {
            document.removeEventListener("fullscreenchange", checkFullScreen);
            clearInterval(intervaldevice_id);
        };
    }, [checkFullScreen]);

    // Fetch data effect
    useEffect(() => {
        fetchMachineData(); // Initial fetch
        const fetchInterval = setInterval(fetchMachineData, FETCH_INTERVAL);

        return () => clearInterval(fetchInterval);
    }, [fetchMachineData]);

    const handleChange = (machinedevice_id: number, field: keyof Machine, value: any) => {
        setEditedMachines(prev => ({
            ...prev,
            [machinedevice_id]: {
                ...prev[machinedevice_id],
                [field]: value
            }
        }));
    };

    const handleChangeStateMachine = async (device_id: number, field: keyof Machine, value: any) => {
        try {
            setEditedMachines(prev => ({
                ...prev,
                [device_id]: {
                    ...prev[device_id],
                    [field]: value
                }
            }));

            if (field === "enable") {
                await setDeviceEnable(device_id, value);
            } else {
            }

            toast.success('Cập nhật trạng thái thành công!', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });

            // Refresh data after successful update
            fetchMachineData();
        } catch (error) {
            console.error('Error updating machine state:', error);
            toast.error('Lỗi khi cập nhật trạng thái!', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, machinedevice_id: number) => {
        if (e.key === 'Enter') {
            try {
                const editedMachine = editedMachines[machinedevice_id];
                if (!editedMachine) return;

                const originalMachine = machines.find(m => m.device_id === machinedevice_id);
                if (!originalMachine) return;

                // Tạo mảng lưu các thay đổi
                const changes: string[] = [];

                // So sánh và ghi nhận các thay đổi
                if (editedMachine.name !== undefined && editedMachine.name !== originalMachine.name) {
                    changes.push(`Tên: ${originalMachine.name} → ${editedMachine.name}`);
                    await setDeviceName(machinedevice_id, editedMachine.name);
                }
                if (editedMachine.target !== undefined && editedMachine.target !== originalMachine.target) {
                    changes.push(`Mục tiêu ngày: ${originalMachine.target} → ${editedMachine.target}`);
                    await setDeviceTarget(machinedevice_id, editedMachine.target);
                }
                if (editedMachine.shift_1 !== undefined && editedMachine.shift_1 !== originalMachine.shift_1) {
                    changes.push(`Ca sáng: ${originalMachine.shift_1} → ${editedMachine.shift_1}`);
                    await setDeviceStartShift1(machinedevice_id, editedMachine.shift_1);
                }
                if (editedMachine.actual !== undefined && editedMachine.actual !== originalMachine.actual) {
                    changes.push(`Thực hiện: ${originalMachine.actual} → ${editedMachine.actual}`);
                    await setDeviceActual(machinedevice_id, editedMachine.actual);
                }
                if (editedMachine.shift_2 !== undefined && editedMachine.shift_2 !== originalMachine.shift_2) {
                    changes.push(`Ca chiều: ${originalMachine.shift_2} → ${editedMachine.shift_2}`);
                    await setDeviceStartShift2(machinedevice_id, editedMachine.shift_2);
                }

                // Xóa dữ liệu đã chỉnh sửa sau khi cập nhật thành công
                setEditedMachines(prev => {
                    const newState = { ...prev };
                    delete newState[machinedevice_id];
                    return newState;
                });

                // Hiển thị thông báo với chi tiết thay đổi
                if (changes.length > 0) {
                    toast.success(
                        <div>
                            <div className="font-bold mb-2">Cập nhật thành công Line {machinedevice_id}:</div>
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
    const device_idCount = machines.filter((machine) => machine.device_id).length;

    return (
        <div className={`px-2 h-full ${isDark ? 'text-text-dark bg-bg-dark' : 'text-text-light bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDark} />}
            <CustomToast isDarkMode={isDark} />
            {/* Bảng 1: Trạng Thái */}
            <div>
                <div className="flex justify-between items-center py-2 ">
                    <div className={`text-lg select-none ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        Số Line đang hoạt động: {enabledCount}/{device_idCount}
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
                                    <th key={machine.device_id} className={`border-2 text-text-dark ${isDark ? 'border-border-dark' : 'border-border-light'} px-4 py-0 text-center ${machine.enable ? "bg-connect" : "bg-notConnect"}`}>
                                        {machine.device_id}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <td
                                        key={machine.device_id}
                                        className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} ${isDark ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'} cursor-pointer`}
                                        onClick={() => handleChangeStateMachine(machine.device_id, "enable", !(editedMachines[machine.device_id]?.enable ?? machine.enable))}
                                    >
                                        <div className="flex justify-center items-center h-full ">
                                            <input
                                                type="checkbox"
                                                checked={editedMachines[machine.device_id]?.enable ?? machine.enable}
                                                onChange={(e) => handleChangeStateMachine(machine.device_id, "enable", e.target.checked)}
                                                className="w-5 h-5 cursor-pointer"
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
                                machines.filter(machine => machine.enable).map((machine) => (
                                    <tr key={machine.device_id}>
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'}`}>
                                            {machine.device_id}
                                        </td>
                                        {/* Tên */}
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-center w-1/2">{machine.name}</span>
                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.device_id]?.name ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "name", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Mục tiêu ngày */}
                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.target}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.target ?? ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (value >= 0 && value <= 9999) {
                                                            handleChange(machine.device_id, "target", value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                    style={{
                                                        MozAppearance: 'textfield',
                                                    }}
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
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.actual ?? ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (value >= 0 && value <= 9999) {
                                                            handleChange(machine.device_id, "actual", value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-2xl py-0.5" : "text-xl"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                    style={{
                                                        MozAppearance: 'textfield',
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-center">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.shift_1}</span>
                                                <InputTime4Number
                                                    value={editedMachines[machine.device_id]?.shift_1 ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "shift_1", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isFullScreen={isFullScreen}
                                                    isDark={isDark}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 ${isFullScreen ? "px-4 py-0.5 text-2xl" : "px-2 text-xl"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '}`}>
                                            <div className="flex items-center justify-center">
                                                <span className="font-semibold px-2 text-center w-1/2">{machine.shift_2}</span>
                                                <InputTime4Number
                                                    value={editedMachines[machine.device_id]?.shift_2 ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "shift_2", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isFullScreen={isFullScreen}
                                                    isDark={isDark}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Trạng Thái Kết Nối */}
                                        <td className={`border-2 text-center w-[25vh] ${isFullScreen ? " py-0.5 text-2xl" : " text-xl"} ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                            <div className="flex justify-center items-center h-full">
                                                <span className={`p-1.5 font-semibold text-text-dark w-full h-full flex items-center justify-center ${machine.connection ? "bg-connect" : "bg-error opacity-80 blink"}`}>
                                                    {machine.connection ? "Kết Nối" : "Mất Kết Nối"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <style jsx>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default DetailPage;
