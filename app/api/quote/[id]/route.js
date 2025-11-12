import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Quote from "@/models/Quote";

// GET /api/quote/:id
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    await dbConnect();

    const doc = await Quote.findById(id).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (err) {
    console.error("/api/quote/[id] GET error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// DELETE /api/quote/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    await dbConnect();

    const result = await Quote.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });

    return NextResponse.json(
      { success: true, message: "Quote deleted", id },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/quote/[id] DELETE error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// PATCH /api/quote/:id — update/edit quote
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const body = await request.json();
    await dbConnect();

    // Recompute totals server-side (same logic as POST)
    const q = body;
    const itineraryTotal = q?.itinerary?.totalActivityPrice || 0;
    let accommodationTotal = 0;
    if (Array.isArray(q?.accommodation)) {
      accommodationTotal = q.accommodation.reduce(
        (s, a) => s + (Number(a?.totalPrice) || 0),
        0
      );
    }
    const mealTotal = q?.meal?.totalPrice || 0;

    const visaRaw = Number(q?.inclusion?.visaAmount || 0);
    const hasVisa = Array.isArray(q?.inclusion?.inclusions)
      ? q.inclusion.inclusions.some((it) => String(it || "").toLowerCase().includes("visa"))
      : false;

    const visaAmount = hasVisa ? -Math.abs(visaRaw) : visaRaw;

    const mainTotal =
      Number(itineraryTotal) + Number(accommodationTotal) + Number(mealTotal) - Number(visaAmount);

    // compute markup (if provided)
    const markupPercent = Number(q?.totals?.markupPercent || 0);
    const markupAmount = Number(((mainTotal * markupPercent) / 100) || 0);
    const grandTotal = Number(mainTotal) + Number(markupAmount);

    // compute price per person (grandTotal / pax)
    const pax = Number(q?.basic?.pax || 1);
    const pricePerPerson = Number((grandTotal / pax) || 0);

  // compute activity cost total as itineraryTotal * 238 (required multiplier before persisting)
  const ACTIVITY_MULTIPLIER = 238;
  const activityCostTotal = Number((itineraryTotal * ACTIVITY_MULTIPLIER) || 0);

    // Update totals
    q.totals = {
      mainTotal,
      itineraryTotal,
      accommodationTotal,
      mealTotal,
      visaAmount,
      hasVisa,
      markupPercent,
      markupAmount,
      grandTotal,
      pricePerPerson,
      activityCostTotal,
    };

    if (!q.inclusion) q.inclusion = {};
    q.inclusion.visaAmount = visaAmount;

    const updated = await Quote.findByIdAndUpdate(id, q, { new: true });
    if (!updated) return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });

    return NextResponse.json(
      { success: true, message: "Quote updated", data: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/quote/[id] PATCH error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
