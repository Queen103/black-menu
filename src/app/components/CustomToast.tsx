import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toast.css';

interface CustomToastProps {
    isDarkMode?: boolean;
}

export const CustomToast = ({ isDarkMode }: CustomToastProps) => {
    return (
        <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            draggable={true}
            draggableDirection="x"
            draggablePercent={60}
            pauseOnHover={false}
            theme={isDarkMode ? "dark" : "light"}
            limit={3}
        />
    );
};
