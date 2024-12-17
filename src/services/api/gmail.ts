
export interface EmailSlot {
    index: number;
    email: string;
}

export const fetchGmailSettings = async (): Promise<EmailSlot[]> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_GET_GMAIL_CONFIG}`,
            {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || "Không thể tải dữ liệu từ API");
        }

        const data = await response.json();
        console.log('Raw API Response:', data);
        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu không đúng định dạng");
        }
        return data;
    } catch (error) {
        console.error('Error fetching gmail settings:', error);
        throw error;
    }
};

export const updateGmailSettings = async (index: number, email: string): Promise<EmailSlot> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_SET_GMAIL_CONFIG}?index=${index}&email=${encodeURIComponent(email)}`,
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
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || "Không thể cập nhật email");
        }

        const data = await response.json();
        console.log('Update Response:', data);
        return data;
    } catch (error) {
        console.error('Error updating gmail settings:', error);
        throw error;
    }
};
