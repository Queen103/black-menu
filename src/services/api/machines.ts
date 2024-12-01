import { DeviceStatus, CpuData } from './cpu';

export interface Machine {
    device_id: number;
    target: number;
    mtg: number;
    actual: number;
    wait_time: number;
    total_min: number;
    shift_1: string;
    shift_2: string;
    temp: number;
    actual_delta_seconds: number;
    device_total_seconds: number;
    connection: boolean;
    ts: number;
    dt: string;
    name?: string; // This will be populated from cpu.ts device list
    enable: boolean;
}

export const fetchMachines = async (): Promise<Machine[]> => {
    try {
        const response = await fetch("http://123.16.53.91:23456/api/nam_co_london/v1/api_get_devices_info", {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: ''
        });
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu máy từ API");
        }

        // Get the machine data
        const machineData: Machine[] = await response.json();

        // Fetch CPU data to get device names
        const cpuResponse = await fetch("http://123.16.53.91:23456/api/nam_co_london/v1/api_get_cpu_info", {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: ''
        });

        if (cpuResponse.ok) {
            const cpuData: CpuData = await cpuResponse.json();
            return machineData.map(machine => {
                const deviceStatus = cpuData.list_device_status.find(
                    (device: DeviceStatus) => device.device_id === machine.device_id
                );
                return {
                    ...machine,
                    name: deviceStatus?.name || `Device ${machine.device_id}`,
                    enable: deviceStatus?.enable || false
                };
            });
        }

        return machineData;
    } catch (error) {
        console.error('Error fetching machines:', error);
        throw error;
    }
};

export const setDeviceEnable = async (device_id: number, enable: boolean): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_enable?device_id=${device_id}&enable=${enable}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật trạng thái thiết bị");
        }
    } catch (error) {
        console.error('Error setting device enable:', error);
        throw error;
    }
};

export const updateMachine = async (machineId: number, data: Partial<Machine>): Promise<Machine> => {
    try {
        const response = await fetch(`http://123.16.53.91:23456/api/nam_co_london/v1/api_update_machine/${machineId}`, {
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

        const updatedMachine = await response.json();
        if (data.enable !== undefined) {
            await setDeviceEnable(machineId, data.enable);
        }
        return updatedMachine;
    } catch (error) {
        console.error('Error updating machine:', error);
        throw error;
    }
};
