import { create } from "zustand";
import { persist } from "zustand/middleware";

const useQuoteStore = create(
  persist(
    (set) => {
      // closure variables for debounced updates
      let _pending = null;
      let _timer = null;
      const FLUSH_MS = 180; // debounce window

      const flushPending = () => {
        if (!_pending) return;
        const { step, data } = _pending;
        _pending = null;
        if (_timer) {
          clearTimeout(_timer);
          _timer = null;
        }
        set((state) => {
          const next = { ...state.quoteData, [step]: data };
          // Preserve existing totals fields, then merge computed totals
          const existingTotals = next.totals || {};
          const computed = (state._computeMainTotal || ((qd) => ({ mainTotal: 0 })))(next);
          const mergedTotals = { ...existingTotals, ...computed };
          return { quoteData: { ...next, totals: mergedTotals } };
        });
      };

      return ({
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

          // compute activity cost total: itineraryTotal * 238 (INR multiplier)
          const ACTIVITY_MULTIPLIER = 238;
          const activityCostTotal = Number((itineraryTotal * ACTIVITY_MULTIPLIER) || 0);

          // mainTotal: accommodation + activityCostTotal + meal - visa
          const mainTotal =
            Number(accommodationTotal) +
            Number(activityCostTotal) +
            Number(mealTotal) -
            Number(visaAmount);

          // markup: percentage applied on mainTotal
          const markupPercent = Number(qd?.totals?.markupPercent || 0);
          const markupAmount = Number(((mainTotal * markupPercent) / 100) || 0);

          // grandTotal: accommodation + activityCostTotal + meal + markupAmount - visa
          const grandTotal = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(markupAmount) - Number(visaAmount);

          // price per person: divide grandTotal by PAX
          const pax = Number(qd?.basic?.pax || 1);
          const pricePerPerson = Number((grandTotal / pax) || 0);

          return {
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
        },

        // debounced update: coalesce rapid updates into one set
        updateStepData: (step, data) => {
          _pending = { step, data };
          if (_timer) clearTimeout(_timer);
          _timer = setTimeout(() => {
            flushPending();
          }, FLUSH_MS);
        },

        // force flush pending updates (call before reads/submits)
        flushPendingUpdate: () => {
          flushPending();
        },

        clearData: () => set({ quoteData: {} }),
      });
    },
    { name: "quote-form-storage" }
  )
);

export default useQuoteStore;
