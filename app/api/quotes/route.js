import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Quote from "@/models/Quote";

// GET /api/quotes — fetch all quotes
export async function GET(request) {
  try {
    await dbConnect();

    // Fetch all quotes, lean (read-only) for performance
    // Sort by `updatedAt` (most recently edited first). Fallback to createdAt order.
    const quotes = await Quote.find({}).lean().sort({ updatedAt: -1, createdAt: -1 });

    return NextResponse.json(
      { success: true, count: quotes.length, data: quotes },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/quotes GET error", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
