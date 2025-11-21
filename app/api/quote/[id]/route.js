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

    // Debug: log remark to help trace missing remark issues
    console.log(`/api/quote/${id} GET fetched remark:`, doc.remark);
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

    // visa logic: 
    // if 'visa' in inclusions and customVisaCount > 0:
    //   visaAmount = 2000*customVisaCount + (-1500)*(pax-customVisaCount)
    // if 'visa' in inclusions and customVisaCount = 0 or not set:
    //   visaAmount = 2000*pax (all pax with visa)
    // if 'visa' NOT in inclusions:
    //   visaAmount = -1500*pax (all pax without visa)
    const hasVisa = Array.isArray(q?.inclusion?.inclusions)
      ? q.inclusion.inclusions.some((it) => String(it || "").toLowerCase().includes("visa"))
      : false;

    const pax = Number(q?.basic?.pax || 1);
      const customVisaCount = (typeof q?.inclusion?.customVisaCount === 'number') ? Number(q.inclusion.customVisaCount) : (hasVisa ? pax : 0);

    let visaAmount;
      if (customVisaCount > 0) {
        const visaPeople = Math.min(customVisaCount, pax);
        const nonVisaPeople = pax - visaPeople;
        visaAmount = (2000 * visaPeople) + (-1500 * nonVisaPeople);
      } else if (hasVisa) {
        visaAmount = 2000 * pax;
      } else {
        visaAmount = -1500 * pax;
    }

    // compute activity cost total: itineraryTotal * 238 (INR multiplier)
    const ACTIVITY_MULTIPLIER = 238;
    const activityCostTotal = Number((itineraryTotal * ACTIVITY_MULTIPLIER) || 0);

    // mainTotal: accommodation + activityCostTotal + meal + visaAmount
    // (if visa in inclusions, visaAmount is positive and gets added)
    // (if visa not in inclusions, visaAmount is negative and gets subtracted)
    const mainTotal =
      Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(visaAmount);

    // markup: percentage applied on mainTotal
    const markupPercent = Number(q?.totals?.markupPercent || 0);
    const markupAmount = Number(((mainTotal * markupPercent) / 100) || 0);

    // grandTotal: accommodation + activityCostTotal + meal + markupAmount + visaAmount
    // (visaAmount can be positive or negative based on whether visa is included)
    const grandTotal = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(markupAmount) + Number(visaAmount);

    // GST (5%) and TCS (5%) calculation (sequential)
    const applyGstTcs = q?.totals?.applyGstTcs || false;
    const gstAmount = applyGstTcs ? Number((grandTotal * 0.05) || 0) : 0;
    const tcsAmount = applyGstTcs ? Number(((grandTotal + gstAmount) * 0.05) || 0) : 0;
    const finalTotal = Number(grandTotal + gstAmount + tcsAmount || 0);

    // compute price per person (finalTotal / pax)
    const pricePerPerson = Number((finalTotal / pax) || 0);

    // Update totals
    q.totals = {
      mainTotal,
      itineraryTotal,
      accommodationTotal,
      mealTotal,
      visaAmount,
      hasVisa,
      customVisaCount,
      markupPercent,
      markupAmount,
      grandTotal,
      applyGstTcs,
      gstAmount,
      tcsAmount,
      finalTotal,
      pricePerPerson,
      activityCostTotal,
    };

    if (!q.inclusion) q.inclusion = {};
    q.inclusion.visaAmount = visaAmount;
    q.inclusion.customVisaCount = customVisaCount;

    // Ensure updatedAt reflects this edit so lists sorted by updatedAt are accurate
    q.updatedAt = new Date();

    const updated = await Quote.findByIdAndUpdate(id, q, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });

    // convert to plain object for consistent JSON shape and include remark
    const out = updated && updated.toObject ? updated.toObject() : updated;
    console.log("✅ Quote updated. remark:", out.remark);
    return NextResponse.json(
      { success: true, message: "Quote updated", data: out },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/quote/[id] PATCH error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
