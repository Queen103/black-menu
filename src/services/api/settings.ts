export interface Settings {
    change_time: number;
    dark_mode: boolean;
    effect: boolean;
    is_vietnamese: boolean;
    is_english: boolean;
    mode: string;
    effect_mode: string;
    client_ip: string;
}

export const fetchSettings = async (): Promise<Settings> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_GET_CONFIG}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

export const updateSettings = async (settings: Settings): Promise<Settings> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_CONFIG}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};
