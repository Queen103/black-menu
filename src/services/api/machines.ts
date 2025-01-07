import { DeviceStatus, CpuData } from './cpu';

export interface Machine {
    device_id: number;
    code: string;
    total_production: number;
    time_start: string;
    time_end: string;
    actual_production: number;
    worker: number;
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_GET_DEVICES_INFO}`, {
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
        const cpuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_GET_CPU_INFO}`, {
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
                    actual: machine.actual < 0 ? 0 : machine.actual,
                    target: machine.target < 0 ? 0 : machine.target,
                    mtg: machine.mtg < 0 ? 0 : machine.mtg,
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
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_ENABLE}?device_id=${device_id}&enable=${enable}`,
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
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_NAME}?device_id=${device_id}&name=${encodeURIComponent(name)}`,
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

export const setDeviceCode = async (device_id: number, code: string): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_CODE}?device_id=${device_id}&code=${encodeURIComponent(code)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật mật khóa thiết bị");
        }
    } catch (error) {
        console.error('Error setting device code:', error);
        throw error;
    }
};

export const setDeviceTotalProduction = async (device_id: number, total_production: number): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_TOTAL_PRODUCTION}?device_id=${device_id}&total_production=${total_production}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật số lần thiết bị");
        }
    } catch (error) {
        console.error('Error setting device total production:', error);
        throw error;
    }
};

export const setDeviceActualProduction = async (device_id: number, actual_production: number): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_ACTUAL_PRODUCTION}?device_id=${device_id}&actual_production=${actual_production}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật số lần thiết bị");
        }
    } catch (error) {
        console.error('Error setting device actual production:', error);
        throw error;
    }
};

export const setDeviceTimeStart = async (device_id: number, time_start: string): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_TIME_START}?device_id=${device_id}&time_start=${encodeURIComponent(time_start)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật thời gian bản đồ thiết bị");
        }
    } catch (error) {
        console.error('Error setting device time start:', error);
        throw error;
    }
};

export const setDeviceTimeEnd = async (device_id: number, time_end: string): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_TIME_END}?device_id=${device_id}&time_end=${encodeURIComponent(time_end)}`,
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
            throw new Error(errorData.error || "Lỗi khi cập nhật thời gian bản đồ thiết bị");
        }
    } catch (error) {
        console.error('Error setting device time end:', error);
        throw error;
    }
};



export const setDeviceTarget = async (device_id: number, target: number): Promise<void> => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_TARGET}`;
        console.log('API URL:', url); // Debug log
        const response = await fetch(
            url + `?device_id=${device_id}&target=${target}`,
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: ''
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Lỗi khi cập nhật target thiết bị");
        }
    } catch (error) {
        console.error('Error setting device target:', error);
        throw error;
    }
};

export const setDeviceStartShift1 = async (device_id: number, start_shift_1: string): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_1}?device_id=${device_id}&shift_1=${encodeURIComponent(start_shift_1)}`,
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
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_2}?device_id=${device_id}&shift_2=${encodeURIComponent(start_shift_2)}`,
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
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_ACTUAL}?device_id=${device_id}&actual=${actual}`,
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_DEVICE_TOTAL_MIN}?device_id=${device_id}&total_mins=${total_mins}`, {
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
