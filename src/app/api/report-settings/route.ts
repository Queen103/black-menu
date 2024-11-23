import { NextRequest, NextResponse } from "next/server";

interface ReportSetting {
    id: number; // Thứ tự
    time?: Date; // Thời gian là kiểu Date
}

// Bộ nhớ tạm thời lưu trữ các cài đặt (mock database)
let settings: ReportSetting[] = [
    { id: 1, time: new Date().setHours(8, 0, 0, 0) ? new Date(new Date().setHours(8, 0, 0, 0)) : undefined },
    { id: 2, time: new Date().setHours(10, 30, 0, 0) ? new Date(new Date().setHours(10, 30, 0, 0)) : undefined },
    { id: 3 },
    { id: 4, time: new Date().setHours(14, 30, 0, 0) ? new Date(new Date().setHours(14, 30, 0, 0)) : undefined },
    { id: 5, time: new Date().setHours(16, 0, 0, 0) ? new Date(new Date().setHours(16, 0, 0, 0)) : undefined },
    { id: 6 },
    { id: 7, time: new Date().setHours(9, 0, 0, 0) ? new Date(new Date().setHours(9, 0, 0, 0)) : undefined },
    { id: 8 },
    { id: 9, time: new Date().setHours(23, 30, 0, 0) ? new Date(new Date().setHours(23, 30, 0, 0)) : undefined },
    { id: 10 },
    { id: 11 },
    { id: 12, time: new Date().setHours(12, 30, 0, 0) ? new Date(new Date().setHours(12, 30, 0, 0)) : undefined },
    { id: 13, time: new Date().setHours(18, 0, 0, 0) ? new Date(new Date().setHours(18, 0, 0, 0)) : undefined },
    { id: 14 },
    { id: 15, time: new Date().setHours(20, 0, 0, 0) ? new Date(new Date().setHours(20, 0, 0, 0)) : undefined },
    { id: 16, time: new Date().setHours(21, 30, 0, 0) ? new Date(new Date().setHours(21, 30, 0, 0)) : undefined },
    { id: 17 },
    { id: 18 },
    { id: 19, time: new Date().setHours(6, 0, 0, 0) ? new Date(new Date().setHours(6, 0, 0, 0)) : undefined },
    { id: 20 },
    { id: 21, time: new Date().setHours(2, 30, 0, 0) ? new Date(new Date().setHours(2, 30, 0, 0)) : undefined },
    { id: 22 },
    { id: 23 },
    { id: 24, time: new Date().setHours(4, 30, 0, 0) ? new Date(new Date().setHours(4, 30, 0, 0)) : undefined },
];

// Xử lý phương thức GET
export async function GET() {
    // Trả về `time` dưới dạng chuỗi ISO để tránh lỗi JSON serialization
    const formattedSettings = settings.map((s) => ({
        ...s,
        time: s.time ? new Date(s.time).toISOString() : undefined,
    }));
    return NextResponse.json(formattedSettings);
}

// Xử lý phương thức POST
export async function POST(req: NextRequest) {
    const body = await req.json();

    const { reportId, time } = body;

    // Kiểm tra đầu vào
    if (!reportId || !time) {
        return NextResponse.json(
            { error: "Cần cung cấp cả 'reportId' và 'time'" },
            { status: 400 }
        );
    }

    const newSetting: ReportSetting = {
        id: reportId,
        time: new Date(time), // Chuyển chuỗi ISO sang Date
    };

    // Thêm cài đặt mới vào danh sách
    settings.push(newSetting);

    return NextResponse.json(newSetting, { status: 201 });
}

// Xử lý phương thức PATCH (cập nhật)
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, time } = body;

    // Kiểm tra đầu vào
    if (!id || !time) {
        return NextResponse.json(
            { error: "Cần cung cấp cả 'id' và 'time'" },
            { status: 400 }
        );
    }

    // Tìm cài đặt cần cập nhật
    const settingIndex = settings.findIndex((s) => s.id === id);

    if (settingIndex === -1) {
        return NextResponse.json(
            { error: "Không tìm thấy cài đặt với ID được cung cấp" },
            { status: 404 }
        );
    }

    // Cập nhật thời gian
    settings[settingIndex].time = new Date(time); // Chuyển chuỗi ISO sang Date

    return NextResponse.json(settings[settingIndex], { status: 200 });
}

// Xử lý phương thức DELETE
export async function DELETE(req: NextRequest) {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));

    if (!id) {
        return NextResponse.json(
            { error: "Cần cung cấp ID để xóa" },
            { status: 400 }
        );
    }

    const settingIndex = settings.findIndex((s) => s.id === id);

    if (settingIndex === -1) {
        return NextResponse.json(
            { error: "Không tìm thấy cài đặt với ID được cung cấp" },
            { status: 404 }
        );
    }

    // Xóa cài đặt
    settings.splice(settingIndex, 1);

    return NextResponse.json({ message: "Đã xóa thành công" }, { status: 200 });
}
