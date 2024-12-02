interface DeviceStatus {
    device_id: number;
    name: string;
    enable: boolean;
    connection: boolean;
}

interface CpuData {
    devices: any;
    fps: number;
    port: string;
    connection: boolean;
    list_device_status: DeviceStatus[];
    ts: number;
    dt: string;
}

export const fetchCpuData = async (): Promise<CpuData> => {
    try {
        const response = await fetch("http://123.16.53.91:23456/api/nam_co_london/v1/api_get_cpu_info", {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: ''
        });
        if (!response.ok) {
            throw new Error("API response not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API CPU:", error);
        throw error;
    }
};

export type { CpuData, DeviceStatus };
