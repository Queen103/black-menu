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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const endpoint = process.env.NEXT_PUBLIC_API_GET_CPU_INFO || '/api/nam_co_london/v1/api_get_cpu_info';
        const url = baseUrl + endpoint;
        console.log('Calling API:', url);
        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
        console.log('API CPU Info Path:', process.env.NEXT_PUBLIC_API_GET_CPU_INFO);
        
        const response = await fetch(url, {
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
