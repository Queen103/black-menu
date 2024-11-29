import { Machine } from '@/api/machines';

export const fetchMachines = async (): Promise<Machine[]> => {
    try {
        const response = await fetch('/api/machines');
        if (!response.ok) {
            throw new Error('Failed to fetch machines');
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
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update machine');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating machine:', error);
        throw error;
    }
};
