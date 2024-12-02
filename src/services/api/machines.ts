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

export const setDeviceName = async (device_id: number, name: string): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_name?device_id=${device_id}&name=${encodeURIComponent(name)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật tên thiết bị");
        }
    } catch (error) {
        console.error('Error setting device name:', error);
        throw error;
    }
};

export const setDeviceTarget = async (device_id: number, target: number): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_target?device_id=${device_id}&target=${target}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật mục tiêu thiết bị");
        }
    } catch (error) {
        console.error('Error setting device target:', error);
        throw error;
    }
};

export const setDeviceStartShift1 = async (device_id: number, start_shift_1: string): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_start_shift_1?device_id=${device_id}&start_shift_1=${encodeURIComponent(start_shift_1)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật thời gian ca 1");
        }
    } catch (error) {
        console.error('Error setting device shift 1:', error);
        throw error;
    }
};

export const setDeviceStartShift2 = async (device_id: number, start_shift_2: string): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_start_shift_2?device_id=${device_id}&start_shift_2=${encodeURIComponent(start_shift_2)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật thời gian ca 2");
        }
    } catch (error) {
        console.error('Error setting device shift 2:', error);
        throw error;
    }
};

export const setDeviceActual = async (device_id: number, actual: number): Promise<void> => {
    try {
        const response = await fetch(
            `http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_actual?device_id=${device_id}&actual=${actual}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật thực hiện");
        }
    } catch (error) {
        console.error('Error setting device actual:', error);
        throw error;
    }
};

export const setDeviceTotalMin = async (device_id: number, total_mins: number): Promise<void> => {
    const response = await fetch(`http://123.16.53.91:23456/api/nam_co_london/v1/api_set_device_total_min?device_id=${device_id}&total_mins=${total_mins}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
        },
        body: ''
    });

    if (!response.ok) {
        throw new Error('Failed to update total minutes');
    }
};
