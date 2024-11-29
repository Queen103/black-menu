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
    status?: 'active' | 'inactive' | 'maintenance';
    lastUpdated?: string;
    description?: string;
}
