"use client";

import React, { useEffect, useState } from "react";
import useQuoteStore from "./ItenaryStore";

export default function BasicDetails({ syncWithStore = false, showNav = true }) {
  const { updateStepData, quoteData } = useQuoteStore();

  const initial = quoteData?.basic || {};

  const [startDate, setStartDate] = useState(initial.startDate || "");
  const [endDate, setEndDate] = useState(initial.endDate || "");
  const [nights, setNights] = useState(Number(initial.nights || 0));
  const [pax, setPax] = useState(Number(initial.pax || 1));

  useEffect(() => {
    // when store loads an existing quote, sync local values
    const b = quoteData?.basic || {};
    if ((b.startDate || "") !== startDate) setStartDate(b.startDate || "");
    if ((b.endDate || "") !== endDate) setEndDate(b.endDate || "");
    if ((Number(b.nights) || 0) !== nights) setNights(Number(b.nights || 0));
    if ((Number(b.pax) || 1) !== pax) setPax(Number(b.pax || 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData]);

  useEffect(() => {
    if (!syncWithStore) return;
    const payload = { startDate, endDate, nights: Number(nights || 0), pax: Number(pax || 1) };
    updateStepData("basic", payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, nights, pax, syncWithStore]);

  const nightsOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-xl relative z-10">
      <h2 className="text-2xl font-bold mb-4">Basic Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-400">Start Date</label>
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 rounded bg-white/5 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">End Date</label>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 rounded bg-white/5 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Nights</label>
          <select
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="w-full p-2 rounded bg-white/5 text-white"
          >
            <option value={0}>Select nights</option>
            {nightsOptions.map((n) => (
              <option key={n} value={n}>
                {n} night{n > 1 ? "s" : ""} / {n + 1} day{n + 1 > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">PAX (persons)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={pax}
            onChange={(e) => setPax(Number(e.target.value || 0))}
            className="w-full p-2 rounded bg-white/5 text-white"
          />
        </div>
      </div>

      {showNav && (
        <div className="flex justify-end mt-2">
          <button className="px-4 py-2 bg-white/20 rounded">Next</button>
        </div>
      )}
    </div>
  );
}
