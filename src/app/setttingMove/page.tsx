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

    const handleChange = (id: number, field: keyof Machine, value: any) => {
        setEditedMachines((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleUpdate = async (id: number) => {
        const updatedMachine = editedMachines[id];
        if (!updatedMachine) return;

        const { name, dailyTarget, enable } = updatedMachine;

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
            <div className="text-[#333333] text-2xl font-semibold flex items-center space-x-4 justify-between px-2 p-4">
                <div>
                    Số Line đang hoạt động: {enabledCount}/{idCount}
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto text-2xl shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                <table className="table-auto w-full border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-gray-200 ">
                            <th className="border-2 border-black px-4 py-3">ID</th>
                            <th className="border-2 border-black px-4 py-3">Tên</th>
                            <th className="border-2 border-black px-4 py-3">Mục Tiêu Ngày</th>
                            <th className="border-2 border-black px-4 py-3">Thực Hiện</th>
                            <th className="border-2 border-black px-4 py-3">Trạng Thái Kết Nối</th>
                            <th className="border-2 border-black px-4 py-3">Kích Hoạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4">Không có dữ liệu máy</td>
                            </tr>
                        ) : (
                            machines.map((machine) => (
                                <tr key={machine.id} className={`${machine.isConnect ? "bg-white" : "bg-red-200 blink"}`}>
                                    <td className="border-2 border-black px-4 py-0 text-center">
                                        {machine.id}
                                    </td>
                                    {/* Tên */}
                                    <td
                                        className={`border-2 border-black text-center ${isFullScreen ? "py-1" : "py-0"}`}
                                    >
                                        <div className="flex items-center justify-between space-x-0">
                                            {/* Tên máy */}
                                            <span className="text-2xl font-semibold text-center w-1/2">{machine.name}</span>

                                            {/* Ô input */}
                                            <input
                                                type="text"
                                                placeholder="Nhập tên mới" // Gợi ý
                                                value={editedMachines[machine.id]?.name ?? ""}
                                                onChange={(e) => handleChange(machine.id, "name", e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                className={`w-1/2 px-2 py-1.5 border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                disabled={!machine.isConnect}
                                            />
                                        </div>
                                    </td>

                                    {/* Mục Tiêu Hằng Ngày */}
                                    <td
                                        className={`border-2 border-black text-center ${isFullScreen ? "py-1" : "py-0"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Nhãn tiêu đề */}
                                            <span className="text-2xl font-semibold px-5 text-center text-center w-1/2">{machine.dailyTarget}</span>

                                            {/* Ô input */}
                                            <input
                                                type="number"
                                                value={editedMachines[machine.id]?.dailyTarget ?? ""}
                                                onChange={(e) => handleChange(machine.id, "dailyTarget", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                className={`w-1/2 px-2 py-1.5 border border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                placeholder="Nhập mục tiêu mới"
                                                disabled={!machine.isConnect}
                                            />
                                        </div>
                                    </td>

                                    {/* Thực Hiện */}
                                    <td className="border-2 border-black px-4 py-0.5 text-center">
                                        {machine.actual}
                                    </td>

                                    {/* Trạng Thái Kết Nối */}
                                    <td className="border-2 border-black px-4 py-0.5 text-center">
                                        <div className="flex justify-center items-center h-10">
                                            <span
                                                className={`p-2 rounded-lg w-2/3 h-full flex items-center justify-center ${machine.isConnect ? "bg-green-500" : "bg-red-500"
                                                    } shadow-[0px_0px_4px_rgba(0,0,0,0.4)]`}
                                            >
                                                {machine.isConnect ? "Kết Nối" : "Mất Kết Nối"}
                                            </span>
                                        </div>
                                    </td>



                                    {/* Kích Hoạt */}
                                    <td className="border-2 border-black items-center gap-2 px-4 py-1 text-center ">
                                        <label className={`relative inline-flex items-center ${!machine.isConnect ? "cursor-not-allowed opacity-50" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={editedMachines[machine.id]?.enable ?? machine.enable}
                                                onChange={(e) => handleChange(machine.id, "enable", e.target.checked)}
                                                onKeyDown={(e) => handleKeyDown(e, machine.id)}
                                                disabled={!machine.isConnect} // Vô hiệu hóa khi không kết nối
                                                className="sr-only peer "
                                            />
                                            <div
                                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}
                                            ></div>
                                        </label>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DetailPage;
