import { NextRequest, NextResponse } from "next/server";

interface ReportSetting {
    id: number; // Thứ tự
    time?: string; // Thời gian là kiểu Date
}

// Bộ nhớ tạm thời lưu trữ các cài đặt (mock database)
let settings: ReportSetting[] = [
    { id: 1, time: "08:00" },
    { id: 2, time: "10:30" },
    { id: 3 },
    { id: 4, time: "14:30" },
    { id: 5, time: "16:00" },
    { id: 6 },
    { id: 7, time: "09:00" },
    { id: 8 },
    { id: 9, time: "23:30" },
    { id: 10 },
    { id: 11 },
    { id: 12, time: "12:30" },
    { id: 13, time: "18:00" },
    { id: 14 },
    { id: 15, time: "20:00" },
    { id: 16, time: "21:30" },
    { id: 17 },
    { id: 18 },
    { id: 19, time: "06:00" },
    { id: 20 },
    { id: 21, time: "02:30" },
    { id: 22 },
    { id: 23 },
    { id: 24, time: "04:30" },
];



// Xử lý phương thức GET
export async function GET() {
    // Chuyển `time` thành chuỗi `HH:mm` nếu tồn tại
    const formattedSettings = settings.map((s) => ({
        ...s,
        time: s.time ? s.time : undefined, // `time` đã lưu dạng `HH:mm`
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
        time: new time, // Chuyển chuỗi ISO sang Date
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
    if (!id) {
        return NextResponse.json(
            { error: "Cần cung cấp 'id'" },
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
    settings[settingIndex].time = time; // Giữ nguyên định dạng HH:mm

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
