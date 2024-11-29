export interface TimeSlot {
    id: number;
    time: string;
}

export const fetchReportSettings = async (): Promise<TimeSlot[]> => {
    const response = await fetch("/api/report-settings");
    if (!response.ok) {
        throw new Error("Không thể tải dữ liệu từ API");
    }
    return response.json();
};

export const updateReportTime = async (id: number, time: string): Promise<TimeSlot> => {
    const response = await fetch("/api/report-settings", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, time }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Lỗi khi ${time ? "cập nhật" : "xóa"} thởi gian`);
    }

    return response.json();
};
