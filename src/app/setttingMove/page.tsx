"use client";
import { useEffect, useState, useCallback } from "react";
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
    setDeviceTotalMin,
    setDeviceTotalProduction,
    setDeviceCode,
    setDeviceTimeStart,
    setDeviceTimeEnd,
    setDeviceActualProduction,
    type Machine
} from '@/services/api/machines';
import InputDateTime from '../components/InputDateTime';
import messages from '@/messages';
import { useLanguage } from '../context/LanguageContext';
import InputTime4Number from "../components/InputTime4Number";

const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [editedMachines, setEditedMachines] = useState<{ [key: number]: Partial<Machine> }>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { isDark } = useTheme();
    const { language } = useLanguage();
    const t = messages[language].settingLine;

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

            toast.success(t.toast.success, {
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
            console.error(t.toast.error, error);
            toast.error(t.toast.error, {
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
                    changes.push(`${t.item.Name}: ${originalMachine.name} → ${editedMachine.name}`);
                    await setDeviceName(machinedevice_id, editedMachine.name);
                }
                if (editedMachine.target !== undefined && editedMachine.target !== originalMachine.target) {
                    changes.push(`${t.item.daily_target}: ${originalMachine.target} → ${editedMachine.target}`);
                    await setDeviceTarget(machinedevice_id, editedMachine.target);
                }
                if (editedMachine.code !== undefined && editedMachine.code !== originalMachine.code) {
                    changes.push(`${t.item.code}: ${originalMachine.code} → ${editedMachine.code}`);
                    await setDeviceCode(machinedevice_id, editedMachine.code);
                }
                if (editedMachine.total_production !== undefined && editedMachine.total_production !== originalMachine.total_production) {
                    changes.push(`${t.item.totalProducted}: ${originalMachine.total_production} → ${editedMachine.total_production}`);
                    await setDeviceTotalProduction(machinedevice_id, editedMachine.total_production);
                }
                if (editedMachine.time_start !== undefined && editedMachine.time_start !== originalMachine.time_start) {
                    changes.push(`${t.item.timeStart}: ${originalMachine.time_start} → ${editedMachine.time_start}`);
                    await setDeviceTimeStart(machinedevice_id, editedMachine.time_start);
                }
                if (editedMachine.time_end !== undefined && editedMachine.time_end !== originalMachine.time_end) {
                    changes.push(`${t.item.timeEnd}: ${originalMachine.time_end} → ${editedMachine.time_end}`);
                    await setDeviceTimeEnd(machinedevice_id, editedMachine.time_end);
                }
                if (editedMachine.actual_production !== undefined && editedMachine.actual_production !== originalMachine.actual_production) {
                    changes.push(`${t.item.actualProducted}: ${originalMachine.actual_production} → ${editedMachine.actual_production}`);
                    await setDeviceActualProduction(machinedevice_id, editedMachine.actual_production);
                }
                if (editedMachine.shift_1 !== undefined && editedMachine.shift_1 !== originalMachine.shift_1) {
                    changes.push(`${t.item.shift_1}: ${originalMachine.shift_1} → ${editedMachine.shift_1}`);
                    await setDeviceStartShift1(machinedevice_id, editedMachine.shift_1);
                }
                if (editedMachine.actual !== undefined && editedMachine.actual !== originalMachine.actual) {
                    changes.push(`${t.item.actual}: ${originalMachine.actual} → ${editedMachine.actual}`);
                    await setDeviceActual(machinedevice_id, editedMachine.actual);
                }
                if (editedMachine.shift_2 !== undefined && editedMachine.shift_2 !== originalMachine.shift_2) {
                    changes.push(`${t.item.shift_2}: ${originalMachine.shift_2} → ${editedMachine.shift_2}`);
                    await setDeviceStartShift2(machinedevice_id, editedMachine.shift_2);
                }
                if (editedMachine.total_min !== undefined && editedMachine.total_min !== originalMachine.total_min) {
                    // Validate total_min range
                    const totalMin = Number(editedMachine.total_min);
                    if (totalMin < 1 || totalMin > 1440) {
                        throw new Error(t.toast.timeMin);
                    }
                    changes.push(`${t.item.total_min}: ${originalMachine.total_min} → ${totalMin} phút`);
                    await setDeviceTotalMin(machinedevice_id, totalMin);
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
                            <div className="font-bold mb-2">{t.toast.update} {machinedevice_id}:</div>
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
                toast.error(t.toast.error, {
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
        <div className={`px-1 h-full ${isDark ? 'text-text-dark bg-bg-dark' : 'text-text-light bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDark} />}
            <CustomToast isDarkMode={isDark} />
            {/* Bảng 1: Trạng Thái */}
            <div>
                <div className="flex justify-between item-center py-1 ">
                    <div className={`text-sm select-none ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        {t.lineActive}: {enabledCount}/{device_idCount}
                    </div>
                    <h2 className={` ${isFullScreen ? "text-lg" : "text-sm"} font-bold select-none text-center ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        {t.enableTable}
                    </h2>
                    <div className="w-[250px]"></div>
                </div>
                <div className="overflow-x-auto mb-1 text-sm shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <th key={machine.device_id} className={`border-2 text-text-dark ${isDark ? 'border-border-dark' : 'border-border-light'} px-1 py-0 text-center ${machine.enable ? "bg-connect" : "bg-notConnect"}`}>
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
                                        className={`border-2 ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 py-2 text-sm"} ${isDark ? 'border-border-dark bg-bg-tableIn' : 'border-border-light bg-bg-light'} cursor-pointer h-full`}
                                    >
                                        <div className="flex justify-center item-center h-full ">
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
                <h2 className={`font-bold mb-1 select-none text-center ${isFullScreen ? "text-lg" : "text-lg"} ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                    {t.settingTable}
                </h2>
                <div className="overflow-x-auto shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                        <thead>
                            <tr className={`w-full ${isDark ? 'border-border-dark bg-bg-table' : 'border-border-light bg-gray-400'}`}>
                                <th className={`border-2 w-[2%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>ID</th>
                                <th className={`border-2 w-[6%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.Name}</th>
                                <th className={`border-2 w-[8%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.productedCode}</th>
                                <th className={`border-2 w-[8%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.totalProducted}</th>
                                <th className={`border-2 w-[10%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.timeStart}</th>
                                <th className={`border-2 w-[10%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.timeEnd}</th>
                                <th className={`border-2 w-[8%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.actualProducted}</th>
                                <th className={`border-2 w-[8%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.daily_target}</th>
                                <th className={`border-2 w-[5%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.actual}</th>
                                <th className={`border-2 w-[6%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.shift_1}</th>
                                <th className={`border-2 w-[6%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.shift_2}</th>
                                <th className={`border-2 w-[6%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.timeWork}</th>
                                <th className={`border-2 border-black w-[8%] ${isFullScreen ? "  text-md" : " text-md"} ${isDark ? 'border-border-dark' : 'border-border-light'} h-full`}>{t.item.state}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">{t.noData}</td>
                                </tr>
                            ) : (
                                machines.filter(machine => machine.enable).map((machine) => (
                                    <tr key={machine.device_id} className={`${machine.connection ? "" : " opacity-80 blink"}`}>
                                        <td className={`border-2 w-[2%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-0 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                {machine.device_id}
                                            </div>
                                        </td>
                                        {/* Tên */}
                                        <td className={`border-2 w-[6%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center w-2/3 truncate" title={machine.name}>{machine.name}</span>
                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.device_id]?.name ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "name", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-2/3 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>
                                        {/* Mã Hàng */}
                                        <td className={`border-2 w-[8%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light'} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center w-1/2 truncate" title={machine.code}>{machine.code}</span>
                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.device_id]?.code ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "code", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Tổng số đơn hàng*/}
                                        <td className={`border-2 w-[8%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center w-1/3">{machine.total_production}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.total_production ?? ""}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (value >= 0 && value <= 9999) {
                                                            handleChange(machine.device_id, "total_production", value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/3 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                    style={{
                                                        MozAppearance: 'textfield',
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* Thoi gian bat dau */}
                                        <td className={`border-2 w-[10%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark text-white' : 'border-border-light text-dark'} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center">{machine.time_start}</span>
                                                <InputDateTime
                                                    value={editedMachines[machine.device_id]?.time_start ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "time_start", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isDark={isDark}
                                                    isFullScreen={isFullScreen}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Thoi gian ket thuc */}
                                        <td className={`border-2 w-[10%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark text-text-dark' : 'border-border-light text-text-light'} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center">{machine.time_end}</span>
                                                <InputDateTime
                                                    value={editedMachines[machine.device_id]?.time_end ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "time_end", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isDark={isDark}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>
                                        {/* Số đơn hàng thực hiện */}
                                        <td className={`border-2 w-[8%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold px-1 text-center w-1/2">{machine.actual_production}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.actual_production ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "actual_production", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Mục tiêu ngày */}
                                        <td className={`border-2 w-[8%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold px-1 text-center w-1/2">{machine.target}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.target ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "target", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        {/* Thực hiện */}
                                        <td className={`border-2 w-[6%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold px-1 text-center w-1/2">{machine.actual}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="9999"
                                                    value={editedMachines[machine.device_id]?.actual ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "actual", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 w-[7%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center w-1/2">{machine.shift_1}</span>
                                                <InputTime4Number
                                                    value={editedMachines[machine.device_id]?.shift_1 ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "shift_1", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isDark={isDark}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 w-[7%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-center w-1/2">{machine.shift_2}</span>
                                                <InputTime4Number
                                                    value={editedMachines[machine.device_id]?.shift_2 ?? ""}
                                                    onChange={(value) => handleChange(machine.device_id, "shift_2", value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    isDark={isDark}
                                                    disabled={!machine.connection}
                                                />
                                            </div>
                                        </td>

                                        <td className={`border-2 w-[6%] ${isFullScreen ? "px-1 py-0.5 text-sm" : "px-1 text-sm"} text-center ${isDark ? 'border-border-dark ' : 'border-border-light '} h-full`}>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold px-1 text-center w-1/2">{machine.total_min}</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1440"
                                                    value={editedMachines[machine.device_id]?.total_min ?? ""}
                                                    onChange={(e) => handleChange(machine.device_id, "total_min", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.device_id)}
                                                    className={`w-1/2 ${isFullScreen ? "text-sm py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent`}
                                                    disabled={!machine.connection}
                                                    style={{
                                                        MozAppearance: 'textfield',
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* Trạng Thái Kết Nối */}
                                        <td className={`border-2 text-center w-[8%] ${isFullScreen ? " py-0.5 text-sm" : " text-sm"} ${isDark ? 'border-border-dark' : 'border-border-light'} ${machine.connection ? "bg-connect" : "bg-error opacity-80 blink"} h-full`}>
                                            <div className="flex items-center justify-center h-full">
                                                <span className="p-1.5 font-semibold text-text-dark w-full flex items-center justify-center">
                                                    {machine.connection ? t.connected : t.disconnected}
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
