"use client";
import React, { useEffect } from "react";
import useQuoteStore from "./ItenaryStore";

export default function FinalConsole({ onBack,onsubmit }) {
  const { quoteData } = useQuoteStore();
  const totals = quoteData?.totals || {};

  return (
    <div className="bg-black text-white border border-white/10 rounded-2xl p-6 shadow-lg w-full">
      <h2 className="text-2xl font-semibold mb-6 text-emerald-400">
        ✅ Final Summary
      </h2>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="bg-white/10 rounded-lg p-4 space-y-2">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Cost Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span>Accommodation</span>
            <span className="font-semibold">₹ {Number(totals.accommodationTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Activity Cost</span>
            <span className="font-semibold">₹ {Number(totals.activityCostTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Meals</span>
            <span className="font-semibold">₹ {Number(totals.mealTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-sm text-red-400">
            <span>Visa Amount</span>
            <span className="font-semibold">₹ {Number(totals.visaAmount || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2 flex justify-between text-sm">
            <span className="font-semibold">Main Total</span>
            <span className="font-bold text-yellow-400">₹ {Number(totals.mainTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
        </div>

        {/* Right Column - Markup & Taxes */}
        <div className="bg-white/10 rounded-lg p-4 space-y-2">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Markup & Taxes</h3>
          <div className="flex justify-between text-sm">
            <span>Markup ({Number(totals.markupPercent || 0)}%)</span>
            <span className="font-semibold">₹ {Number(totals.markupAmount || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2 flex justify-between text-sm">
            <span className="font-semibold">Grand Total</span>
            <span className="font-bold text-blue-400">₹ {Number(totals.grandTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          
          {totals.applyGstTcs && (
            <>
              <div className="flex justify-between text-sm mt-2">
                <span>GST (5%)</span>
                <span className="font-semibold">₹ {Number(totals.gstAmount || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TCS (5%)</span>
                <span className="font-semibold">₹ {Number(totals.tcsAmount || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/50 rounded p-2 mt-2">
                <div className="flex justify-between text-sm font-bold text-emerald-400">
                  <span>FINAL TOTAL</span>
                  <span>₹ {Number(totals.finalTotal || totals.grandTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Price Per Person */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Price Per Person</span>
          <span className="text-2xl font-bold text-pink-400">₹ {Number(totals.pricePerPerson || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
        >
          Back
        </button>
        <button
          onClick={onsubmit}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
