"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ReportSetting {
    id: number;
    reportId: string;
    time: string;
}

const ReportSettingsPage = () => {
    const [settings, setSettings] = useState<ReportSetting[]>([]);
    const [newReportId, setNewReportId] = useState("1");
    const [newTime, setNewTime] = useState("08:00");
    const [editing, setEditing] = useState<ReportSetting | null>(null);
    const [searchId, setSearchId] = useState(""); // Trạng thái lưu ID tìm kiếm

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/report-settings");
            const data = await response.json();

            // Sắp xếp các cài đặt theo ID giảm dần (mới nhất ở trên)
            const sortedData = data.sort((a: ReportSetting, b: ReportSetting) => b.id - a.id);

            setSettings(sortedData);  // Cập nhật danh sách cài đặt với dữ liệu đã sắp xếp
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };


    const handleCreateSetting = async () => {
        try {
            const response = await fetch("/api/report-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: newReportId, time: newTime }),
            });

            if (!response.ok) throw new Error("Lỗi khi tạo mới cài đặt");

            const newSetting = await response.json();
            setNewReportId("1");
            setNewTime("08:00");
            toast.success("Thêm cài đặt thành công!");

            // Gọi lại fetchSettings sau khi thêm mới
            fetchSettings();
        } catch (error) {
            console.error("Lỗi khi tạo mới cài đặt:", error);
            toast.error("Thêm cài đặt thất bại!");
        }
    };

    const handleUpdateSetting = async (id: number, time: string) => {
        try {
            const response = await fetch(`/api/report-settings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ time }),
            });

            if (!response.ok) throw new Error("Lỗi khi cập nhật cài đặt");

            const updatedSetting = await response.json();
            setEditing(null);
            toast.success("Cập nhật thành công!");

            // Gọi lại fetchSettings sau khi cập nhật
            fetchSettings();
        } catch (error) {
            console.error("Lỗi khi cập nhật cài đặt:", error);
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleDeleteSetting = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa cài đặt này?")) return;

        try {
            const response = await fetch(`/api/report-settings?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Lỗi khi xóa cài đặt");

            toast.success("Xóa thành công!");

            // Gọi lại fetchSettings sau khi xóa
            fetchSettings();
        } catch (error) {
            console.error("Lỗi khi xóa cài đặt:", error);
            toast.error("Xóa thất bại!");
        }
    };

    // Hàm lọc cài đặt theo ID
    const filteredSettings = settings.filter((setting) =>
        setting.reportId.includes(searchId)
    );

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div className="mx-auto p-6 text-black">
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />

            <div className="flex justify-between space-x-8">
                {/* Phần Danh sách cài đặt nằm bên trái */}
                <div className="w-1/2 text-center ">
                    <div className="p-6 border-2 border-gray-300 rounded-xl shadow-lg bg-white">
                        <h2 className="text-2xl font-semibold text-blue-500 mb-4">Danh Sách Cài Đặt</h2>

                        {/* Phần tìm kiếm */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm theo ID"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {filteredSettings.length === 0 ? (
                            <p className="text-center text-gray-500">Không có cài đặt nào.</p>
                        ) : (
                            <div className="max-h-[66vh] overflow-y-auto"> {/* Giới hạn chiều cao tối đa */}
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 p-3 bg-gray-100">ID</th>
                                            <th className="border border-gray-300 p-3 bg-gray-100">Giờ</th>
                                            <th className="border border-gray-300 p-3 bg-gray-100">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSettings.map((setting) => (
                                            <tr key={setting.id}>
                                                <td className="border border-gray-300 p-3 text-center">{setting.reportId}</td>
                                                <td className="border border-gray-300 p-3 text-center">{setting.time}</td>
                                                <td className="border border-gray-300 p-3 text-center">
                                                    <button
                                                        onClick={() => setEditing(setting)}
                                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200 ease-in-out"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSetting(setting.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out ml-3"
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Phần Thêm cài đặt mới nằm bên phải */}
                <div className="w-1/2">
                    <div className="mb-6 p-6 border-2 border-gray-300 rounded-xl shadow-lg text-center space-y-6 bg-gray-50">
                        <h2 className="text-2xl font-semibold text-blue-500">Thêm Cài Đặt Mới</h2>
                        <div className="flex items-center justify-center space-x-10">
                            <div className="flex flex-col items-center">
                                <label className="block font-medium text-lg text-gray-700 mb-2">ID:</label>
                                <select
                                    value={newReportId}
                                    onChange={(e) => setNewReportId(e.target.value)}
                                    className="border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.from({ length: 15 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col items-center">
                                <label className="block font-medium text-lg text-gray-700 mb-2">Giờ (HH:mm):</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Nút Thêm nằm ở dưới */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleCreateSetting}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal sửa cài đặt */}
            {editing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                        <h3 className="text-2xl font-bold mb-6 text-blue-600">Sửa Cài Đặt</h3>
                        <div className="mb-6">
                            <label className="block font-medium text-lg text-gray-700 mb-2">Giờ:</label>
                            <input
                                type="time"
                                value={editing.time}
                                onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                                className="border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-between space-x-4">
                            <button
                                onClick={() => handleUpdateSetting(editing.id, editing.time)}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Cập Nhật
                            </button>
                            <button
                                onClick={() => setEditing(null)}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportSettingsPage;
