import { NextResponse } from "next/server";
import { Lines } from "../db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const { newName, newDailyTarget, newEnable } = await req.json();  // Extract newName, newDailyTarget, and newEnable from the request body

    // Validation for name and dailyTarget
    if (newName && typeof newName !== 'string') {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (newDailyTarget && typeof newDailyTarget !== 'number') {
        return NextResponse.json({ error: 'Invalid dailyTarget' }, { status: 400 });
    }

    // Validation for enable field
    if (newEnable !== undefined && typeof newEnable !== 'boolean') {
        return NextResponse.json({ error: 'Invalid enable value, it must be a boolean' }, { status: 400 });
    }

    // Find the Line by ID
    const line = Lines.find((line) => line.id === parseInt(id, 10));
    if (!line) {
        return NextResponse.json({ error: 'Line not found' }, { status: 404 });
    }

    // Update the fields if they are provided
    if (newName) {
        line.name = newName;
    }

    if (newDailyTarget) {
        line.dailyTarget = newDailyTarget;
    }

    if (newEnable !== undefined) {
        line.enable = newEnable;  // Toggle enable based on the request
    }

    return NextResponse.json(line);  // Return the updated Line
}