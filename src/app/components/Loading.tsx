interface LoadingProps {
    isDarkMode?: boolean;
    message?: string;
}

const Loading = ({ isDarkMode = false, message = "Đang tải dữ liệu..." }: LoadingProps) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-50">
            {/* Lớp overlay mờ */}
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-black' : 'bg-white'} opacity-80`}></div>
            
            {/* Container cho loading spinner và message */}
            <div className="relative flex flex-col items-center">
                {/* Loading spinner */}
                <div className="flex items-center justify-center">
                    <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${
                        isDarkMode ? 'border-white' : 'border-blue-600'
                    }`}></div>
                </div>
                
                {/* Message */}
                <div className={`mt-4 text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                    {message}
                </div>
            </div>
        </div>
    );
};

export default Loading;
