"use client";

interface ReconnectModalProps {
  isOpen: boolean;
  onReconnect: () => void;
}

const ReconnectModal = ({ isOpen, onReconnect }: ReconnectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mất kết nối CPU
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Không thể kết nối đến CPU. Vui lòng kiểm tra kết nối và thử tải lại trang.
        </p>
        <button
          onClick={onReconnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
};

export default ReconnectModal;
