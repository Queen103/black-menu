import { NextRequest, NextResponse } from "next/server";

interface ReportSetting {
    id: number;
    reportId: string;
    time: string;
}

// Bộ nhớ tạm thời lưu trữ các cài đặt (mock database)
// Tạo sẵn hai dữ liệu mặc định
let settings: ReportSetting[] = [
    { id: 1, reportId: "1", time: "08:00" },
    { id: 2, reportId: "2", time: "09:00" },
    { id: 3, reportId: "3", time: "08:00" },
    { id: 4, reportId: "4", time: "09:00" },
    { id: 5, reportId: "5", time: "08:00" },
    { id: 6, reportId: "6", time: "09:00" },
    { id: 7, reportId: "7", time: "08:00" },
    { id: 8, reportId: "8", time: "09:00" },
    { id: 9, reportId: "9", time: "08:00" },
    { id: 10, reportId: "10", time: "09:00" },
    { id: 11, reportId: "11", time: "08:00" },
    { id: 12, reportId: "12", time: "09:00" },
];
let nextId = 13; // ID tự tăng bắt đầu từ 3

// Xử lý phương thức GET
export async function GET() {
    return NextResponse.json(settings);
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
        id: nextId++,
        reportId,
        time,
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
    settings[settingIndex].time = time;

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
