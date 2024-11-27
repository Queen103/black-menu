"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CustomToast } from "../components/CustomToast";

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

    const fetchMachineData = async () => {
        try {
            const response = await fetch("/api/machines");
            if (!response.ok) {
                throw new Error("API response not ok");
            }
            const data = await response.json();
            setMachines(data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };

    const checkFullScreen = () => {
        const isFullScreenNow = window.innerHeight === screen.height;
        if (isFullScreenNow) {
            setIsFullScreen(true);
        } else {
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme"); // Lấy giá trị từ localStorage
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            // Nếu không có giá trị, kiểm tra hệ thống của người dùng
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
        const intervalId = setInterval(() => {
            const savedTheme = localStorage.getItem("theme"); // Lấy giá trị từ localStorage
            if (savedTheme) {
                setIsDarkMode(savedTheme === "dark");
            } else {
                // Nếu không có giá trị, kiểm tra hệ thống của người dùng
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDarkMode(prefersDark);
            }

            fetchMachineData();
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, 1000);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("fullscreenchange", checkFullScreen);
        };
    }, []);

    const handleChange = async (id: number, field: keyof Machine, value: any) => {
        const machine = machines.find(m => m.id === id);
        if (!machine) return;

        setEditedMachines(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));

        // Nếu thay đổi trường "enable", gửi yêu cầu cập nhật đến API
        if (field === "enable") {
            try {
                const response = await fetch(`/api/machines/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        newEnable: value,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error?.error || "Cập nhật trạng thái không thành công");
                }

                // Hiển thị Toast khi cập nhật thành công
                toast.success(`Cập nhật trạng thái thành công cho Line ID: ${id}`);

                fetchMachineData(); // Cập nhật lại danh sách máy sau khi thay đổi
            } catch (error) {
                console.error("Lỗi khi cập nhật trạng thái:", error);
                toast.error("Cập nhật trạng thái thất bại!");
            }
        }
    };

    const handleUpdate = async (id: number) => {
        const updatedMachine = editedMachines[id];
        if (!updatedMachine) return;

        const originalMachine = machines.find(m => m.id === id);
        if (!originalMachine) return;

        const { name, dailyTarget, enable, actual, morningTime, afternoonTime } = updatedMachine;

        try {
            const response = await fetch(`/api/machines/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newName: name,
                    newDailyTarget: dailyTarget,
                    newEnable: enable,
                    newActual: actual,
                    newMorningTime: morningTime,
                    newAfternoonTime: afternoonTime
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.error || "Cập nhật không thành công");
            }

            // Tạo thông báo chi tiết về các thay đổi
            const changes = [];
            if (name !== undefined && name !== originalMachine.name)
                changes.push(`Tên Line: ${originalMachine.name} → ${name}`);
            if (dailyTarget !== undefined && dailyTarget !== originalMachine.dailyTarget)
                changes.push(`Target ngày: ${originalMachine.dailyTarget} → ${dailyTarget}`);
            if (actual !== undefined && actual !== originalMachine.actual)
                changes.push(`Thực hiện: ${originalMachine.actual} → ${actual}`);
            if (morningTime !== undefined && morningTime !== originalMachine.morningTime)
                changes.push(`Giờ sáng: ${originalMachine.morningTime} → ${morningTime}`);
            if (afternoonTime !== undefined && afternoonTime !== originalMachine.afternoonTime)
                changes.push(`Giờ chiều: ${originalMachine.afternoonTime} → ${afternoonTime}`);

            // Hiển thị Toast với thông tin chi tiết
            toast.success(
                <div>
                    <p className="font-bold mb-2">Cập nhật thành công Line {name || `#${id}`}!</p>
                    {changes.map((change, index) => (
                        <p key={index} className="text-md">{change}</p>
                    ))}
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );

            setEditedMachines((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });

            fetchMachineData();
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
        if (e.key === "Enter") {
            handleUpdate(id);
        }
    };

    const enabledCount = machines.filter((machine) => machine.enable || (!machine.isConnect)).length;
    const idCount = machines.filter((machine) => machine.id).length;

    return (
        <div className={`px-2 h-full ${isDarkMode ? 'text-white bg-bg-dark' : 'text-[#333333] bg-bg-light'}`}>
            <CustomToast isDarkMode={isDarkMode} />
            {/* Bảng 1: Trạng Thái */}
            <div>
                <div className="flex justify-between items-center py-2 ">
                    <div className={`text-lg select-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Số Line đang hoạt động: {enabledCount}/{idCount}
                    </div>
                    <h2 className={`text-xl font-bold select-none text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Bảng Trạng Thái
                    </h2>
                    <div className="w-[250px]"></div>
                </div>
                <div className="overflow-x-auto mb-2 text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 border-white ${isDarkMode ? 'border-white' : 'border-black'}`}>
                        <thead>
                            <tr>
                                {machines.slice(0, 15).map((machine) => (
                                    <th key={machine.id} className={`border-2 text-white ${isDarkMode ? 'border-white' : 'border-black'} px-4 py-0 text-center ${machine.enable ? "bg-connect" : "bg-notConnect"}`}>
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
                                        className={`border-2 ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-gray-200'} px-4 py-1 cursor-pointer`}
                                        onClick={() => handleChange(machine.id, "enable", !(editedMachines[machine.id]?.enable ?? machine.enable))}
                                    >
                                        <div className="flex justify-center items-center h-full">
                                            <input
                                                type="checkbox"
                                                checked={editedMachines[machine.id]?.enable ?? machine.enable}
                                                onChange={(e) => handleChange(machine.id, "enable", e.target.checked)}
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
                <h2 className={`text-xl font-bold mb-2 select-none text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Bảng Cài Đặt
                </h2>
                <div className="overflow-x-auto text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                    <table className={`table-auto w-full border-collapse border-2 border-black ${isDarkMode ? 'border-white' : 'border-black'}`}>
                        <thead>
                            <tr className={`${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-gray-200'}`}>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>ID</th>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>Tên</th>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>Mục Tiêu Ngày</th>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>Thực Hiện</th>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>Ca Sáng</th>
                                <th className={`border-2 ${isDarkMode ? 'border-white' : 'border-black'} px-2 py-0.5 text-2xl`}>Ca Chiều</th>
                                <th className={`border-2 border-black py-0.5 text-2xl ${isDarkMode ? 'border-white' : 'border-black'}`}>Trạng Thái Kết Nối</th>
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
                                        <tr key={machine.id} className={` ${machine.isConnect ? isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black" : isDarkMode ? "bg-red-400 text-gray-300 blink" : "bg-red-300 text-black blink"}`}>
                                            <td className={`border-2 border-black px-2 py-0.5 text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
                                                {machine.id}
                                            </td>
                                            {/* Tên */}
                                            <td className={`border-2 border-black text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-center w-1/2">{machine.name}</span>
                                                    <input
                                                        type="text"
                                                        value={editedMachines[machine.id]?.name ?? ""}
                                                        onChange={(e) => handleChange(machine.id, "name", e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                        className={`w-1/2 px-1 py-0.5 mr-10 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-600`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            {/* Mục tiêu ngày */}
                                            <td className={`border-2 border-black text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
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
                                                        className={`w-1/2 px-1 py-0.5 mr-10 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            {/* Thực hiện */}
                                            <td className={`border-2 border-black text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
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
                                                        className={`w-1/2 px-1 py-0.5 mr-10 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500`}
                                                        disabled={!machine.isConnect}
                                                    />
                                                </div>
                                            </td>

                                            <td className={`border-2 border-black text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
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
                                                            className={`w-12 px-1 py-0.5 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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
                                                            className={`w-12 px-1 py-0.5 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className={`border-2 border-black text-center text-xl ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
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
                                                            className={`w-12 px-1 py-0.5 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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
                                                            className={`w-12 px-1 py-0.5 text-xl ${isDarkMode ? 'text-white' : 'text-black'} bg-transparent border-b border-white text-center focus:outline-none focus:border-b focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                            disabled={!machine.isConnect}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Trạng Thái Kết Nối */}
                                            <td className={`border-2 text-center w-[25vh] ${isDarkMode ? 'border-white bg-tableIn' : 'border-black bg-white'}`}>
                                                <div className="flex justify-center items-center h-full">
                                                    <span
                                                        className={`p-1.5 font-semibold text-white w-full h-full flex items-center justify-center ${machine.isConnect ? "bg-connect" : "bg-notConnect"
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
