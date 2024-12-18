export interface User {
    account: string;
    password: string;
    is_admin: boolean;
    is_valid: boolean;
    is_writer: boolean;
    date_created: string;
    create_by: string;
    info: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUserInfo = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/nam_co_london/v1/api_get_user_info`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // API yêu cầu body rỗng
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
};

export const validateLogin = async (email: string, password: string): Promise<User | null> => {
    try {
        const users = await getUserInfo();
        
        const user = users.find(u => u.account === email && u.password === password);
        console.log(user);
        if (user && user.is_valid) {
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.error('Error validating login:', error);
        throw error;
    }
};

export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export const logout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
};
