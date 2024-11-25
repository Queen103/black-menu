"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer và toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify

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
    const [editedMachines, setEditedMachines] = useState<{ [key: number]: Partial<Machine> }>({});
    const [isFullScreen, setIsFullScreen] = useState(false);

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
        fetchMachineData();
        const intervalId = setInterval(() => {
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
        // Cập nhật giá trị trong state local
        setEditedMachines((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
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

            // Hiển thị Toast khi cập nhật thành công
            toast.success(`Cập nhật thành công cho Line có ID: ${name || `#${id}`}!`);

            setEditedMachines((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            fetchMachineData();
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
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
        <div className="text-black px-2">
            {/* Toast Container */}
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} /> {/* Thêm ToastContainer */}

            {/* Header */}
            <div className="text-[#333333] text-md font-semibold flex items-center space-x-4 justify-between px-2 p-1">
                <div>
                    Số Line đang hoạt động: {enabledCount}/{idCount}
                </div>
            </div>
            {/* Bảng Kích Hoạt (dạng ngang với 2 hàng và 15 cột) */}
            <div className="overflow-x-auto mb-4 text-lg shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                <table className={`table-auto w-full border-collapse border-2 border-black `}>
                    <thead>
                        <tr className="bg-gray-200">
                            {machines.slice(0, 15).map((machine) => (
                                <th key={machine.id} className={`border-2 text-white border-black px-4 py-1 text-center ${machine.isConnect ? "bg-connect" : "bg-notConnect"}`}>
                                    {machine.id}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {machines.slice(0, 15).map((machine) => (
                                <td key={machine.id} className={`border-2 border-black px-4 py-1`}>
                                    <div className="flex justify-center items-center h-full">
                                        <input
                                            type="checkbox"
                                            checked={editedMachines[machine.id]?.enable ?? machine.enable}
                                            onChange={(e) => handleChange(machine.id, "enable", e.target.checked)}
                                            disabled={!machine.isConnect}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </td>

                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto text-2xl shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                <table className="table-auto w-full border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border-2 border-black px-4 py-1 text-xl">ID</th>
                            <th className="border-2 border-black px-4 py-1 text-xl">Tên</th>
                            <th className="border-2 border-black px-4 py-1 text-xl">Mục Tiêu Ngày</th>
                            <th className="border-2 border-black px-4 py-1 text-xl">Thực Hiện</th>
                            <th className="border-2 border-black px-4 py-1 text-xl">Ca Sáng</th>
                            <th className="border-2 border-black px-4 py-1 text-xl">Ca Chiều</th>
                            <th className="border-2 border-black py-1 text-xl">Trạng Thái Kết Nối</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4 text-2xl">Không có dữ liệu máy</td>
                            </tr>
                        ) : (
                            machines.map((machine) => {
                                // Nếu máy không được enable, trả về null để không hiển thị dòng
                                if (!machine.enable) {
                                    return null;
                                }

                                return (
                                    <tr key={machine.id} className={`${machine.isConnect ? "bg-white" : "bg-gray-300 blink"}`}>
                                        <td className="border-2 border-black px-4 text-center text-2xl">
                                            {machine.id}
                                        </td>
                                        {/* Tên */}
                                        <td className={`border-2 border-black text-center text-2xl`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-center w-1/2">{machine.name}</span>

                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.id]?.name ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "name", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 px-2  ${isFullScreen ? "py-3" : "py-1"} border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        {/* Mục Tiêu Hằng Ngày */}
                                        <td className={`border-2 border-black text-center`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-5 text-center w-1/2">{machine.dailyTarget}</span>

                                                <input
                                                    type="number"
                                                    value={editedMachines[machine.id]?.dailyTarget ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "dailyTarget", Number(e.target.value))}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 px-2 ${isFullScreen ? "py-3" : "py-1"} border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500`}

                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        {/* Thực Hiện */}
                                        <td className="border-2 border-black text-center">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-5 text-center w-1/2">{machine.actual}</span>

                                                <input
                                                    type="number"
                                                    value={editedMachines[machine.id]?.actual ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "actual", Number(e.target.value))}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 px-2 ${isFullScreen ? "py-3" : "py-1"} border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500`}

                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        <td className="border-2 border-black text-center">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-5 text-center w-1/2">{machine.morningTime}</span>

                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.id]?.morningTime ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "morningTime", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 px-2 ${isFullScreen ? "py-3" : "py-1"} border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500`}

                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>

                                        <td className="border-2 border-black text-center">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold px-5 text-center w-1/2">{machine.afternoonTime}</span>

                                                <input
                                                    type="text"
                                                    value={editedMachines[machine.id]?.afternoonTime ?? ""}
                                                    onChange={(e) => handleChange(machine.id, "afternoonTime", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                    className={`w-1/2 px-2 ${isFullScreen ? "py-3" : "py-1"} border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500`}

                                                    disabled={!machine.isConnect}
                                                />
                                            </div>
                                        </td>



                                        {/* Trạng Thái Kết Nối */}
                                        <td className="border-2 border-black py-0 text-center w-[25vh]">
                                            <div className="flex justify-center items-center h-full">
                                                <span
                                                    className={`p-2 font-semibold text-white w-full h-full flex items-center rounded-2xl justify-center ${machine.isConnect ? "bg-connect" : "bg-notConnect"
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
    );
};

export default DetailPage;
