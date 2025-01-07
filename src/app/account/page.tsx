"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, getUserInfo, createUser, deleteUser, changeUserPassword } from "@/services/api/user";
import { useTheme } from "../context/ThemeContext";
import Loading from "../components/Loading";
import { CustomToast } from "../components/CustomToast";

interface AccountFormData {
    account: string;
    password: string;
    is_writer: boolean;
}

interface PasswordChangeState {
    [key: string]: string;
}

const AccountPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isDark } = useTheme();
    const [formData, setFormData] = useState<AccountFormData>({
        account: "",
        password: "",
        is_writer: false,
    });
    const [passwords, setPasswords] = useState<PasswordChangeState>({});
    const [oldPassword, setOldPassword] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await getUserInfo();
            setUsers(data);
            // Initialize password state for each user
            const initialPasswords: PasswordChangeState = {};
            data.forEach((user: User) => {
                initialPasswords[user.account] = "";
            });
            setPasswords(initialPasswords);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate empty fields
        if (!formData.account.trim()) {
            toast.error("Tài khoản không được để trống");
            return;
        }

        if (!formData.password.trim()) {
            toast.error("Mật khẩu không được để trống");
            return;
        }

        try {
            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            if (!currentUser) {
                toast.error("Không thể xác định người tạo tài khoản");
                return;
            }

            const userData = {
                ...formData,
                is_admin: false,
                is_valid: true,
                date_created: new Date().toISOString(),
                create_by: currentUser.account,
                info: ""
            };

            await createUser(userData);
            toast.success("Thêm tài khoản thành công");
            setFormData({
                account: "",
                password: "",
                is_writer: false,
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error("Lỗi khi tạo tài khoản");
        }
    };

    const handleDeleteUser = async (account: string) => {
        try {
            await deleteUser(account);
            toast.success("Xóa tài khoản thành công");
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error("Lỗi khi xóa tài khoản");
        }
    };

    const handlePasswordChange = async (account: string, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newPassword = passwords[account];
            if (!oldPassword.trim() || !newPassword.trim()) {
                toast.error("Mật khẩu cũ và mật khẩu mới không được để trống");
                return;
            }

            try {
                // Giả sử có một hàm verifyOldPassword để kiểm tra mật khẩu cũ
                const users = getUserInfo(); // Lấy toàn bộ danh sách user
                const user = (await users).find(u => u.account === account); // Tìm user theo account hiện tại
                const isOldPasswordCorrect = user && user.password === oldPassword; if (!isOldPasswordCorrect) {
                    toast.error("Mật khẩu cũ không đúng");
                    return;
                }

                await changeUserPassword(account, newPassword);
                toast.success("Đổi mật khẩu thành công");
                setPasswords(prev => ({ ...prev, [account]: "" }));
                setOldPassword(""); // Reset ô nhập mật khẩu cũ
            } catch (error) {
                console.error('Error changing password:', error);
                toast.error("Lỗi khi đổi mật khẩu");
            }
        }
    };


    if (isLoading) return <Loading />;
    if (!currentUser) return <div>Đang tải...</div>;

    return (
        <div className={`p-6 h-full ${isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
            <CustomToast isDarkMode={isDark} />

            {currentUser.is_admin ? (
                // Admin View
                <div className="space-y-6">
                    <div className={`flex justify-between items-center`}>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                            Quản lý tài khoản
                        </h1>
                    </div>

                    {/* Add User Form */}
                    <div className={`rounded-lg p-4 border-4 ${isDark
                        ? 'bg-secondary text-text-dark border-primary'
                        : 'bg-gray-300 text-text-light border-primary'
                        }`}>
                        <form onSubmit={handleAddUser} className="flex items-center gap-6">
                            <h1 className="flex">Tài khoản</h1>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Tài khoản"
                                    value={formData.account}
                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    className="w-full border rounded p-2 bg-bg-light text-text-light"
                                    required
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const form = e.currentTarget.form;
                                            const inputs = Array.from(form?.elements || []);
                                            const currentIndex = inputs.indexOf(e.currentTarget);
                                            const nextInput = inputs[currentIndex + 1] as HTMLElement;
                                            nextInput?.focus();
                                        }
                                    }}
                                />
                            </div>
                            <h1 className="flex">Mật khẩu</h1>
                            <div className="flex-1 justify-start">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border rounded p-2 bg-bg-light text-text-light"
                                    required
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddUser(e);
                                        }
                                    }}
                                />
                            </div>
                            <label className="flex text-lg items-center whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={formData.is_writer}
                                    onChange={(e) => setFormData({ ...formData, is_writer: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className={` ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                                    Quyền Writer
                                </span>
                            </label>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition-colors whitespace-nowrap"
                            >
                                Thêm
                            </button>
                        </form>
                    </div>

                    {/* User List */}
                    <div className={`rounded-lg border-4 ${isDark
                        ? 'bg-secondary text-text-dark border-primary'
                        : 'bg-gray-300 text-text-light border-primary'
                        }`}>
                        <div className="relative overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-400'} ${isDark ? 'bg-secondary' : 'bg-gray-300'
                                        }`}>
                                        <th className="px-4 py-2 text-center w-[15%]">Tài khoản</th>
                                        <th className="px-4 py-2 text-center w-[10%]">Quyền</th>
                                        <th className="px-4 py-2 text-center w-[20%]">Ngày tạo</th>
                                        <th className="px-4 py-2 text-center w-[15%]">Người tạo</th>
                                        <th className="px-4 py-2 text-center w-[25%]">Đổi mật khẩu</th>
                                        <th className="px-4 py-2 text-center w-[15%]">Xóa Tài Khoản</th>
                                    </tr>
                                </thead>
                                <tbody className="relative">
                                    {users.map((user) => (
                                        <tr
                                            key={user.account}
                                            className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-400'} hover:bg-opacity-50 hover:bg-primary`}
                                        >
                                            <td className="px-4 py-2 text-center">{user.account}</td>
                                            <td className="px-4 py-2 text-center">
                                                {user.is_admin ? "Admin" : user.is_writer ? "Writer" : "User"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {new Date(user.date_created).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-4 py-2 text-center">{user.create_by}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="password"
                                                    placeholder="Nhập mật khẩu mới"
                                                    value={passwords[user.account]}
                                                    onChange={(e) => setPasswords({ ...passwords, [user.account]: e.target.value })}
                                                    onKeyDown={(e) => handlePasswordChange(user.account, e)}
                                                    className="text-center w-full border rounded p-2 bg-bg-light text-text-light"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => handleDeleteUser(user.account)}
                                                    className="text-center w-full bg-error text-white px-3 py-1 rounded hover:bg-notConnect transition-colors"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                // User/Writer View
                <div className={`max-w-md mx-auto rounded-lg shadow-[0px_4px_6px_rgba(0,0,0,0.5)] p-6 border-4 ${isDark
                    ? 'bg-secondary text-text-dark border-primary'
                    : 'bg-gray-300 text-text-light border-primary'
                    }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                        Thông tin tài khoản
                    </h2>
                    <div className="space-y-4">
                        <p><span className="font-semibold">Tài khoản:</span> {currentUser.account}</p>
                        <p><span className="font-semibold">Vai trò:</span> {currentUser.is_writer ? "Writer" : "User"}</p>
                        <p><span className="font-semibold">Ngày tạo tài khoản:</span> {currentUser.date_created}</p>
                        <p><span className="font-semibold">Người tạo:</span> {currentUser.create_by}</p>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                                Đổi mật khẩu
                            </label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu cũ"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full border rounded p-2 bg-bg-light text-text-light mb-4"
                            />
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                value={passwords[currentUser.account] || ""}
                                onChange={(e) => setPasswords({ ...passwords, [currentUser.account]: e.target.value })}
                                onKeyDown={(e) => handlePasswordChange(currentUser.account, e)}
                                className="w-full border rounded p-2 bg-bg-light text-text-light mb-4"
                            />
                        </div>

                        <button
                            onClick={() => handleDeleteUser(currentUser.account)}
                            className="w-full bg-error text-white px-4 py-2 rounded hover:bg-notConnect transition-colors"
                        >
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPage;