import mongoose from "mongoose";

// Sub-schemas (no separate _id for nested docs)
const ActivitySchema = new mongoose.Schema(
  {
    label: { type: String },
    value: { type: String },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const DaySchema = new mongoose.Schema(
  {
    id: { type: Number },
    title: { type: String },
    description: { type: String },
    activities: { type: [ActivitySchema], default: [] },
    open: { type: Boolean, default: false },
  },
  { _id: false }
);

const AccommodationSchema = new mongoose.Schema(
  {
    hotel: { type: String },
    otherHotel: { type: String },
    customRates: {
      Single: { type: Number, default: 0 },
      Double: { type: Number, default: 0 },
      Triple: { type: Number, default: 0 },
    },
    place: { type: String },
    otherPlace: { type: String },
    nights: { type: Number, default: 0 },
    adults: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    occupancy: { type: String },
    rooms: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const MealSchema = new mongoose.Schema(
  {
    type: { type: String },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuoteSchema = new mongoose.Schema(
  {
    itinerary: {
      selectedCategory: { type: String },
      days: { type: [DaySchema], default: [] },
      totalActivityPrice: { type: Number, default: 0 },
    },

    accommodation: { type: [AccommodationSchema], default: [] },

    meal: {
      meals: { type: [MealSchema], default: [] },
      totalPrice: { type: Number, default: 0 },
    },

    inclusion: {
      inclusions: { type: [String], default: [] },
      visaAmount: { type: Number, default: 0 },
    },

    exclusion: {
      exclusions: { type: [String], default: [] },
    },

    // Basic trip details: date range, nights and pax
    basic: {
      startDate: { type: String, default: "" },
      endDate: { type: String, default: "" },
      nights: { type: Number, default: 0 },
      pax: { type: Number, default: 1 },
    },

    // Optional totals/metadata
    totals: {
      // mainTotal: total before any markup
      mainTotal: { type: Number, default: 0 },
      itineraryTotal: { type: Number, default: 0 },
      accommodationTotal: { type: Number, default: 0 },
      mealTotal: { type: Number, default: 0 },
      visaAmount: { type: Number, default: 0 },
      hasVisa: { type: Boolean, default: false },
      // markup fields
      markupPercent: { type: Number, default: 0 },
      markupAmount: { type: Number, default: 0 },
      // grand total after applying markup
      grandTotal: { type: Number, default: 0 },
      // GST and TCS fields
      applyGstTcs: { type: Boolean, default: false },
      gstAmount: { type: Number, default: 0 },
      tcsAmount: { type: Number, default: 0 },
      // final total after GST and TCS
      finalTotal: { type: Number, default: 0 },
      // price per person (finalTotal / pax)
      pricePerPerson: { type: Number, default: 0 },
      // activity cost total stored as itineraryTotal * 238 (INR multiplier)
      activityCostTotal: { type: Number, default: 0 },
    },

    meta: {
      title: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

QuoteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Quote = mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);
export default Quote;
