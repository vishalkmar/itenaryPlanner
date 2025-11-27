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

          // visa logic:
          // customVisaCount represents number of people WITHOUT visa (default 0 = all have visa)
          // Formula: visaAmount = (2000 * pax) - (1500 * customVisaCount)
          const pax = Number(qd?.basic?.pax || 1);
          const customVisaCount = (typeof qd?.inclusion?.customVisaCount === 'number') ? Number(qd.inclusion.customVisaCount) : 0;

          const nonVisaPeople = Math.min(Math.max(customVisaCount, 0), pax);
          const visaAmount = (2000 * pax) - (1500 * nonVisaPeople);
          // hasVisa flag indicates whether visa contributes positively
          const hasVisa = visaAmount > 0;

          // compute activity cost total: itineraryTotal * 238 (INR multiplier)
          const ACTIVITY_MULTIPLIER = 238;
          const activityCostTotal = Number((itineraryTotal * ACTIVITY_MULTIPLIER) || 0);

          // mainTotal: accommodation + activityCostTotal + meal + visaAmount
          // (if visa in inclusions, visaAmount is positive and gets added)
          // (if visa not in inclusions, visaAmount is negative and gets subtracted)
          const mainTotal =
            Number(accommodationTotal) +
            Number(activityCostTotal) +
            Number(mealTotal) +
            Number(visaAmount);

          // markup: percentage applied on mainTotal
          const markupPercent = Number(qd?.totals?.markupPercent || 0);
          const markupAmount = Number(((mainTotal * markupPercent) / 100) || 0);

          // grandTotal: accommodation + activityCostTotal + meal + markupAmount + visaAmount
          // (visaAmount can be positive or negative based on whether visa is included)
          const grandTotal = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(markupAmount) + Number(visaAmount);

          // GST (5%) and TCS (5%) calculation
          const applyGstTcs = qd?.totals?.applyGstTcs || false;
          // Sequential GST then TCS: GST on grandTotal, then TCS on (grandTotal + gst)
          const gstAmount = applyGstTcs ? Number((grandTotal * 0.05) || 0) : 0;
          const tcsAmount = applyGstTcs ? Number(((grandTotal + gstAmount) * 0.05) || 0) : 0;
          const finalTotal = Number(grandTotal + gstAmount + tcsAmount || 0);

          // price per person: divide finalTotal by PAX
          const pricePerPerson = Number((finalTotal / pax) || 0);

          return {
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
            gstAmount,
            tcsAmount,
            applyGstTcs,
            finalTotal,
            pricePerPerson,
            activityCostTotal,
            printFinalTotal: qd?.totals?.printFinalTotal || false,
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
