export interface TimeSlot {
    index: number;
    time: string;
}

export const fetchReportSettings = async (): Promise<TimeSlot[]> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_GET_REPORTS_CONFIG}`,
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || "Không thể tải dữ liệu từ API");
        }

        const data = await response.json();
        console.log('Raw API Response:', data);
        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu không đúng định dạng");
        }
        return data;
    } catch (error) {
        console.error('Error fetching report settings:', error);
        throw error;
    }
};

export const updateReportTime = async (index: number, time: string): Promise<TimeSlot> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_REPORTS_CONFIG}?index=${index}&time=${encodeURIComponent(time)}`,
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                },
                body: ''
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi khi ${time ? "cập nhật" : "xóa"} thởi gian`);
        }

        const data = await response.json();
        return { index, time };
    } catch (error) {
        console.error('Error updating report time:', error);
        throw error;
    }
};
