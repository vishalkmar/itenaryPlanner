import { create } from "zustand";
import { persist } from "zustand/middleware";

const useQuoteStore = create(
  persist(
    (set) => ({
      quoteData: {},
      // compute main total from known parts of quoteData
      _computeMainTotal: (qd) => {
        const itineraryTotal = qd?.itinerary?.totalActivityPrice || 0;
        // accommodation may be stored as an array of entries with totalPrice
        let accommodationTotal = 0;
        if (Array.isArray(qd?.accommodation)) {
          accommodationTotal = qd.accommodation.reduce(
            (s, a) => s + (Number(a?.totalPrice) || 0),
            0
          );
        }
        const mealTotal = qd?.meal?.totalPrice || 0;

        // visa logic: if inclusion contains 'visa' then visaAmount should be subtracted
        const visaRaw = Number(qd?.inclusion?.visaAmount || 0);
        const hasVisa = Array.isArray(qd?.inclusion?.inclusions)
          ? qd.inclusion.inclusions.some((it) =>
              String(it || "").toLowerCase().includes("visa")
            )
          : false;

        const visaAmount = hasVisa ? -Math.abs(visaRaw) : visaRaw; // negative when included

        const mainTotal =
          Number(itineraryTotal) +
          Number(accommodationTotal) +
          Number(mealTotal) -
          Number(visaAmount);

        return { mainTotal, itineraryTotal, accommodationTotal, mealTotal, visaAmount, hasVisa };
      },

      updateStepData: (step, data) =>
        set((state) => {
          const next = { ...state.quoteData, [step]: data };
          const totals = (state._computeMainTotal || ((qd) => ({ mainTotal: 0 })))(next);
          return { quoteData: { ...next, totals } };
        }),

      clearData: () => set({ quoteData: {} }),
    }),
    { name: "quote-form-storage" }
  )
);

export default useQuoteStore;
