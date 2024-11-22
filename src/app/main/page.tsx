// /app/page.tsx

const HomePage = () => {
    const cards = new Array(10).fill(null); // Mẫu dữ liệu cho 10 card

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Chào mừng đến với trang chính</h1>
            <p className="mb-6">Đây là trang chủ của bạn.</p>

            {/* Lưới 2 dòng, mỗi dòng 5 card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {cards.map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
                    >
                        <h3 className="text-xl font-semibold mb-3">Card {index + 1}</h3>
                        <p className="text-gray-600">Mô tả cho card {index + 1}.</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
