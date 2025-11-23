"use client";

import React, { useEffect, useState } from "react";
import useQuoteStore from "./ItenaryStore";

function getNightsBetweenDates(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  return diff > 0 ? diff : 0;
}

export default function BasicDetails({ syncWithStore = false, showNav = true }) {
  const { updateStepData, quoteData } = useQuoteStore();

  const initial = quoteData?.basic || {};

  // Default pax is 0 (no value present)
  const [startDate, setStartDate] = useState(initial.startDate || "");
  const [endDate, setEndDate] = useState(initial.endDate || "");
  const [nights, setNights] = useState(Number(initial.nights || 0));
  const [pax, setPax] = useState(
    initial.pax !== undefined ? Number(initial.pax) : 0
  );
  const [contactPhone, setContactPhone] = useState(initial.contactPhone || "");
  const [nightsAuto, setNightsAuto] = useState(0);

  useEffect(() => {
    // when store loads an existing quote, sync local values
    const b = quoteData?.basic || {};

    if ((b.startDate || "") !== startDate) setStartDate(b.startDate || "");
    if ((b.endDate || "") !== endDate) setEndDate(b.endDate || "");
    if ((Number(b.nights) || 0) !== nights) setNights(Number(b.nights || 0));

    // For pax, allow zero as valid value
    if (
      (b.pax !== undefined ? Number(b.pax) : 0) !== pax
    )
      setPax(b.pax !== undefined ? Number(b.pax) : 0);
    if ((b.contactPhone || "") !== contactPhone) setContactPhone(b.contactPhone || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData]);

  useEffect(() => {
    // Whenever startDate or endDate changes, auto calc nights
    const calculatedNights = getNightsBetweenDates(startDate, endDate);
    setNightsAuto(calculatedNights);
    setNights(calculatedNights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    if (!syncWithStore) return;
    const payload = {
      startDate,
      endDate,
      nights: Number(nights || 0),
      pax: Number(pax || 0),
      contactPhone: contactPhone || "",
    };
    updateStepData("basic", payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, nights, pax, contactPhone, syncWithStore]);

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
            min={startDate || undefined}
            className="w-full p-2 rounded bg-white/5 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Nights</label>
          {startDate && endDate && nightsAuto > 0 ? (
            <input
              type="text"
              className="w-full p-2 rounded bg-white/5 text-white cursor-not-allowed"
              value={`${nightsAuto} night${nightsAuto > 1 ? "s" : ""} / ${
                nightsAuto + 1
              } day${nightsAuto + 1 > 1 ? "s" : ""}`}
              disabled
            />
          ) : (
            <select
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full p-2 rounded bg-white/5 text-white"
            >
              <option value={0}>Select nights</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} night{n > 1 ? "s" : ""} / {n + 1} day{n + 1 > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-400">PAX (persons)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={pax}
            onChange={(e) => {
              // Allow manual zero or any number
              const val = e.target.value;
              setPax(val === "" ? 0 : Number(val));
            }}
            className="w-full p-2 rounded bg-white/5 text-white"
            placeholder="0"
          />
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400">Contact Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full p-2 rounded bg-white/5 text-white"
              placeholder="Phone number used for PDF filename"
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