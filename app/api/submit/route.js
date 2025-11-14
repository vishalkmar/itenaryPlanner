import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Quote from "@/models/Quote";
import { z } from "zod";
import { QuoteIcon } from "lucide-react";

// Zod schema: a light validation matching the UI shapes
const ActivityZ = z.object({ label: z.string().optional(), value: z.string().optional(), price: z.number().optional().default(0) });
const DayZ = z.object({ id: z.number().optional(), title: z.string().optional(), description: z.string().optional(), activities: z.array(ActivityZ).optional(), open: z.boolean().optional() });
const AccommodationZ = z.object({
  hotel: z.string().optional(),
  otherHotel: z.string().optional(),
  customRates: z.object({ Single: z.number().optional().default(0), Double: z.number().optional().default(0), Triple: z.number().optional().default(0) }).optional(),
  place: z.string().optional(),
  otherPlace: z.string().optional(),
  nights: z.number().optional().default(0),
  adults: z.number().optional().default(0),
  children: z.number().optional().default(0),
  occupancy: z.string().optional(),
  rooms: z.number().optional().default(0),
  totalPrice: z.number().optional().default(),
});

const MealItemZ = z.object({ type: z.string().optional(), price: z.number().optional().default(0) });

const BasicZ = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  nights: z.number().optional().default(0),
  pax: z.number().optional().default(1),
}).optional();

const QuoteZ = z.object({
  itinerary: z.object({ selectedCategory: z.string().optional(), days: z.array(DayZ).optional(), totalActivityPrice: z.number().optional().default(0) }).optional(),
  accommodation: z.array(AccommodationZ).optional(),
  meal: z.object({ meals: z.array(MealItemZ).optional(), totalPrice: z.number().optional().default(0) }).optional(),
  inclusion: z.object({ inclusions: z.array(z.string()).optional(), visaAmount: z.number().optional().default(0) }).optional(),
  exclusion: z.object({ exclusions: z.array(z.string()).optional() }).optional(),
  basic: BasicZ,
  totals: z.object({
    mainTotal: z.number().optional().default(0),
    itineraryTotal: z.number().optional().default(0),
    accommodationTotal: z.number().optional().default(0),
    mealTotal: z.number().optional().default(0),
    visaAmount: z.number().optional().default(0),
    hasVisa: z.boolean().optional().default(false),
    markupPercent: z.number().optional().default(0),
    markupAmount: z.number().optional().default(0),
    grandTotal: z.number().optional().default(0),
    applyGstTcs: z.boolean().optional().default(false),
    gstAmount: z.number().optional().default(0),
    tcsAmount: z.number().optional().default(0),
    finalTotal: z.number().optional().default(0),
    pricePerPerson: z.number().optional().default(0),
    activityCostTotal: z.number().optional().default(0),
  }).optional(),
  meta: z.object({ title: z.string().optional(), userId: z.string().optional() }).optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📥 /api/submit received body:", JSON.stringify(body, null, 2));
    
    const parsed = QuoteZ.safeParse(body);

    if (!parsed.success) {
      console.error("❌ Zod validation failed:", parsed.error.errors);
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    console.log("✅ Zod validation passed. Parsed data:", JSON.stringify(parsed.data, null, 2));

    await dbConnect();

    // Recompute totals server-side (same logic as client store)
    const q = parsed.data;
    console.log("📊 Processing quote. basic:", q.basic, "totals:", q.totals);
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
    // if 'visa' in inclusions -> visaAmount = 2000 * pax (ADDED to total)
    // if 'visa' NOT in inclusions -> visaAmount = -1500 * pax (SUBTRACTED from total)
    const hasVisa = Array.isArray(q?.inclusion?.inclusions)
      ? q.inclusion.inclusions.some((it) => String(it || "").toLowerCase().includes("visa"))
      : false;

    const pax = Number(q?.basic?.pax || 1);
    const visaAmount = hasVisa ? 2000 * pax : -1500 * pax;

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

    // GST (5%) and TCS (5%) calculation
    const applyGstTcs = q?.totals?.applyGstTcs || false;
    const gstAmount = applyGstTcs ? Number((grandTotal * 5) / 100) : 0;
    const tcsAmount = applyGstTcs ? Number((grandTotal * 5) / 100) : 0;
    const finalTotal = grandTotal + gstAmount + tcsAmount;

    // compute price per person (finalTotal / pax)
    const pricePerPerson = Number((finalTotal / pax) || 0);
 
   
    // attach computed totals and normalized inclusion visaAmount
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
      applyGstTcs,
      gstAmount,
      tcsAmount,
      finalTotal,
      pricePerPerson,
      activityCostTotal,
    };

    if (!q.inclusion) q.inclusion = {};
    q.inclusion.visaAmount = visaAmount;

    console.log("💾 About to save to DB. q.basic:", q.basic, "q.totals:", q.totals);

    const doc = await Quote.create(q);

    console.log("✅ Successfully saved to DB. Saved doc.basic:", doc.basic, "doc.totals:", doc.totals);

    // ✅ Return full saved document
    return NextResponse.json(
      {
        success: true,
        message: "Quote saved successfully",
        data: doc, // full mongoose document
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("/api/submit error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

