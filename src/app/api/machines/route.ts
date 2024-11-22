import { NextResponse } from 'next/server';
import { Lines } from './db';  // Import dữ liệu từ db.ts

// API Handler
export async function GET() {
    return NextResponse.json(Lines);
}
