"use client";
import React, { useEffect } from "react";
import useQuoteStore from "./ItenaryStore";

export default function FinalConsole({ onBack,onsubmit }) {
  const { stepData } = useQuoteStore(); // 👈 assume tere store me sab step data store ho raha hai


  return (
    <div className="bg-black text-white border border-white/10 rounded-2xl p-6 shadow-lg w-full">
      <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
        ✅ Final Summary (Console Output)
      </h2>

      <p className="text-gray-300 mb-4">
        All step data has been logged in the console.
      </p>

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
