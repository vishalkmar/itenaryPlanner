import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Quote from "@/models/Quote";
import { z } from "zod";

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
  totalPrice: z.number().optional().default(0),
});

const MealItemZ = z.object({ type: z.string().optional(), price: z.number().optional().default(0) });

const QuoteZ = z.object({
  itinerary: z.object({ selectedCategory: z.string().optional(), days: z.array(DayZ).optional(), totalActivityPrice: z.number().optional().default(0) }).optional(),
  accommodation: z.array(AccommodationZ).optional(),
  meal: z.object({ meals: z.array(MealItemZ).optional(), totalPrice: z.number().optional().default(0) }).optional(),
  inclusion: z.object({ inclusions: z.array(z.string()).optional(), visaAmount: z.number().optional().default(0) }).optional(),
  exclusion: z.object({ exclusions: z.array(z.string()).optional() }).optional(),
  totals: z.object({ grandTotal: z.number().optional().default(0) }).optional(),
  meta: z.object({ title: z.string().optional(), userId: z.string().optional() }).optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = QuoteZ.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    await dbConnect();

    // Recompute totals server-side (same logic as client store)
    const q = parsed.data;
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

    // attach computed totals and normalized inclusion visaAmount
    q.totals = {
      mainTotal,
      itineraryTotal,
      accommodationTotal,
      mealTotal,
      visaAmount,
      hasVisa,
      grandTotal: mainTotal,
    };

    if (!q.inclusion) q.inclusion = {};
    q.inclusion.visaAmount = visaAmount;

    const doc = await Quote.create(q);

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

