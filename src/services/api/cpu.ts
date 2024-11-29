interface CpuData {
    fps: number;
    connection: boolean;
}

export const fetchCpuData = async (): Promise<CpuData> => {
    try {
        const response = await fetch("/api/cpu");
        if (!response.ok) {
            throw new Error("API response not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API CPU:", error);
        throw error;
    }
};

export type { CpuData };
