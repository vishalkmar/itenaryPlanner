import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Quote from "@/models/Quote";

// GET /api/quotes — fetch all quotes
export async function GET(request) {
  try {
    await dbConnect();

    // Fetch all quotes, lean (read-only) for performance
    const quotes = await Quote.find({}).lean().sort({ createdAt: -1 });

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
