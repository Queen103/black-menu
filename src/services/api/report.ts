import { TimeSlot } from '@/api/report';

export const fetchReportSettings = async (): Promise<TimeSlot[]> => {
    try {
        const response = await fetch("/api/report-settings");
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu từ API");
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching report settings:', error);
        throw error;
    }
};

export const updateReportTime = async (id: number, time: string): Promise<TimeSlot> => {
    try {
        const response = await fetch("/api/report-settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, time }),
        });

        if (!response.ok) {
            throw new Error("Failed to update report time");
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating report time:', error);
        throw error;
    }
};
