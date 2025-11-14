"use client";

import React, { useEffect, useState } from "react";
import useQuoteStore from "./ItenaryStore";

export default function Markup({ syncWithStore = false, showNav = true, onNext = () => {}, onBack = () => {} }) {
  const { updateStepData, quoteData } = useQuoteStore();

  const [percent, setPercent] = useState(0);
  const [applyGstTcs, setApplyGstTcs] = useState(false);

  // Load initial values when in edit mode (syncWithStore=true)
  useEffect(() => {
    if (syncWithStore && quoteData?.totals) {
      const initialPercent = Number(quoteData.totals.markupPercent || 0);
      const initialApplyGstTcs = Boolean(quoteData.totals.applyGstTcs);
      
      setPercent(initialPercent);
      setApplyGstTcs(initialApplyGstTcs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncWithStore, quoteData?.totals]);

  // compute amounts locally for immediate UI feedback
  // mainTotal: accommodation + activityCostTotal + meal + visaAmount
  // (if visa in inclusions, visaAmount is positive and gets added)
  // (if visa not in inclusions, visaAmount is negative and gets subtracted)
  const accommodationTotal = Number(quoteData?.totals?.accommodationTotal || 0);
  const activityCostTotal = Number(quoteData?.totals?.activityCostTotal || 0);
  const mealTotal = Number(quoteData?.totals?.mealTotal || 0);
  const visaAmount = Number(quoteData?.totals?.visaAmount || 0);

  const baseTotal = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(visaAmount);
  const localMarkupAmount = Number(((baseTotal * percent) / 100) || 0);
  // grandTotal: accommodation + activityCostTotal + meal + markupAmount + visaAmount
  const localGrand = Number(accommodationTotal) + Number(activityCostTotal) + Number(mealTotal) + Number(localMarkupAmount) + Number(visaAmount);

  // GST (5%) and TCS (5%) calculation
  const gstAmount = applyGstTcs ? Number((localGrand * 5) / 100) : 0;
  const tcsAmount = applyGstTcs ? Number((localGrand * 5) / 100) : 0;
  const totalWithGstTcs = localGrand + gstAmount + tcsAmount;

  useEffect(() => {
    if (!syncWithStore) return;
    // update totals step with markup percent and GST/TCS flags (store will recompute totals)
    const existing = quoteData?.totals || {};
    updateStepData("totals", { ...existing, markupPercent: Number(percent), applyGstTcs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, applyGstTcs, syncWithStore]);

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

      <div className="space-y-1 text-sm mb-4">
        <div>Markup Amount: <span className="font-semibold">₹ {localMarkupAmount.toFixed(2)}</span></div>
        <div>Grand Total (after Markup): <span className="font-bold text-emerald-400">₹ {localGrand.toFixed(2)}</span></div>
      </div>

      {/* GST & TCS Checkbox */}
      <div className="mb-4 p-3 bg-white/10 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={applyGstTcs}
            onChange={(e) => setApplyGstTcs(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-semibold">Apply 5% GST + 5% TCS</span>
        </label>
        {applyGstTcs && (
          <div className="mt-3 space-y-1 text-xs text-white/80">
            <div>5% GST: <span className="font-semibold text-white">₹ {gstAmount.toFixed(2)}</span></div>
            <div>5% TCS: <span className="font-semibold text-white">₹ {tcsAmount.toFixed(2)}</span></div>
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="text-emerald-400 font-bold">Final Total: ₹ {totalWithGstTcs.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {showNav && (
        <div className="flex justify-between mt-4">
          <button onClick={onBack} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Back</button>
          <button onClick={onNext} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded">Next</button>
        </div>
      )}
    </div>
  );
}
