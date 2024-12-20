import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toast.css';

interface CustomToastProps {
    isDarkMode?: boolean;
}

const toastConfig = {
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
};

export const showSuccessToast = (message: string) => {
    toast.success(message, toastConfig);
};

export const showErrorToast = (message: string) => {
    toast.error(message, toastConfig);
};

export const CustomToast = ({ isDarkMode }: CustomToastProps) => {
    return (
        <ToastContainer
            position="top-center"
            newestOnTop
            rtl={false}
            pauseOnFocusLoss={false}
            draggableDirection="x"
            draggablePercent={60}
            theme={isDarkMode ? "dark" : "light"}
            limit={3}
            autoClose={1000}
        />
    );
};
