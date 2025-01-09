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
const NEXT_PUBLIC_API_CREATE_ACCOUNT = process.env.NEXT_PUBLIC_API_CREATE_ACCOUNT;
const NEXT_PUBLIC_API_GET_USER_INFO = process.env.NEXT_PUBLIC_API_GET_USER_INFO;
const NEXT_PUBLIC_API_DELETE_ACCOUNT = process.env.NEXT_PUBLIC_API_DELETE_ACCOUNT;
const NEXT_PUBLIC_API_SET_USER_PASSWORD = process.env.NEXT_PUBLIC_API_SET_USER_PASSWORD;

export const getUserInfo = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}${NEXT_PUBLIC_API_GET_USER_INFO}`, {
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

export const validateLogin = async (email: string, password: string): Promise<User | string> => {
    try {
        const users = await getUserInfo();

        const user = users.find(u => u.account === email && u.password === password);
        console.log(user);
        if (user && user.is_valid) {
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        return "Invalid email or password";
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

export const createUser = async (userData: {
    account: string;
    password: string;
    is_admin: boolean;
    is_valid: boolean;
    is_writer: boolean;
    date_created: string;
    create_by: string;
    info: string;
}): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}${NEXT_PUBLIC_API_CREATE_ACCOUNT}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const deleteUser = async (account: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}${NEXT_PUBLIC_API_DELETE_ACCOUNT}?account=${account}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const changeUserPassword = async (account: string, password: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}${NEXT_PUBLIC_API_SET_USER_PASSWORD}?account=${account}&password=${password}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
