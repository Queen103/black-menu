import { NextRequest, NextResponse } from "next/server";

interface ReportSetting {
    id: number;
    reportId: string;
    time: string;
}

// Mock database
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

// Hàm xử lý PATCH
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const body = await req.json();

    const time = body.time;

    if (!time) {
        return NextResponse.json({ error: "Cần cung cấp 'time'" }, { status: 400 });
    }

    const setting = settings.find((s) => s.id === parseInt(id, 10));

    if (!setting) {
        return NextResponse.json({ error: "Không tìm thấy cài đặt" }, { status: 404 });
    }

    setting.time = time;

    return NextResponse.json(setting, { status: 200 });
}
