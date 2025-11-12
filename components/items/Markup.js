"use client";

import React, { useEffect, useState } from "react";
import useQuoteStore from "./ItenaryStore";

export default function Markup({ syncWithStore = false, showNav = true }) {
  const { updateStepData, quoteData } = useQuoteStore();

  const initialPercent = Number(quoteData?.totals?.markupPercent || 0);
  const accommodationTotal = Number(quoteData?.totals?.accommodationTotal || 0);
  const activityCostTotal = Number(quoteData?.totals?.activityCostTotal || 0);
  const mealTotal = Number(quoteData?.totals?.mealTotal || 0);
  const visaAmount = Number(quoteData?.totals?.visaAmount || 0);

  const [percent, setPercent] = useState(initialPercent);

  // compute amounts locally for immediate UI feedback
  // mainTotal: accommodation + activityCostTotal + meal - visa
  const baseTotal = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) - Number(visaAmount);
  const localMarkupAmount = Number(((baseTotal * percent) / 100) || 0);
  // grandTotal: accommodation + activityCostTotal + meal + markupAmount - visa
  const localGrand = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(localMarkupAmount) - Number(visaAmount);

  useEffect(() => {
    // when quoteData changes externally (load/edit), sync percent
    const p = Number(quoteData?.totals?.markupPercent || 0);
    if (p !== percent) setPercent(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData]);

  useEffect(() => {
    if (!syncWithStore) return;
    // update totals step with markup percent (store will recompute totals)
    const existing = quoteData?.totals || {};
    updateStepData("totals", { ...existing, markupPercent: Number(percent) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, syncWithStore]);

  const handlePercentChange = (v) => {
    const n = Number(v || 0);
    if (Number.isNaN(n)) return;
    setPercent(n);
  };

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-xl relative z-10">
      <h2 className="text-2xl font-bold mb-4">Markup (percentage)</h2>

      <div className="flex items-center gap-3 mb-3">
        <input
          type="number"
          min="0"
          step="0.1"
          value={percent}
          onChange={(e) => handlePercentChange(e.target.value)}
          className="bg-white/10 text-white p-2 rounded w-32"
        />
        <span className="text-sm text-white/80">% of main total</span>
      </div>

      <div className="space-y-1 text-sm">
        <div>Markup Amount: <span className="font-semibold">₹ {localMarkupAmount.toFixed(2)}</span></div>
        <div>New Grand Total: <span className="font-bold text-emerald-400">₹ {localGrand.toFixed(2)}</span></div>
      </div>

      {showNav && (
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-white/20 rounded">Next</button>
        </div>
      )}
    </div>
  );
}
