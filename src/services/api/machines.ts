export interface Machine {
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
    status: boolean;
    runningTime?: string;
}

export const fetchMachines = async (): Promise<Machine[]> => {
    try {
        const response = await fetch("/api/machines");
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu máy từ API");
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching machines:', error);
        throw error;
    }
};

export const updateMachine = async (machineId: number, data: Partial<Machine>): Promise<Machine> => {
    try {
        const response = await fetch(`/api/machines/${machineId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Lỗi khi cập nhật thông tin máy");
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating machine:', error);
        throw error;
    }
};
