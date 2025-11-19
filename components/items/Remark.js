"use client";

import React, { useEffect, useState } from "react";
import useQuoteStore from "./ItenaryStore";

export default function Remark({ syncWithStore = false }) {
  const { updateStepData, quoteData } = useQuoteStore();
  const [remark, setRemark] = useState(() => quoteData?.remark || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (quoteData?.remark !== undefined) setRemark(quoteData.remark || "");
  }, [quoteData?.remark]);

  useEffect(() => {
    if (syncWithStore) {
      updateStepData("remark", remark || "");
    }
  }, [remark, syncWithStore, updateStepData]);

  const handleChange = (e) => {
    setRemark(e.target.value);
    if (e.target.value.length > 500) {
      setError("Remark should be under 500 characters.");
    } else {
      setError("");
    }
  };

  return (
    <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
      <label className="block text-base font-semibold text-yellow-200 mb-2">
        Remark (optional)
      </label>
      <textarea
        value={remark}
        onChange={handleChange}
        maxLength={500}
        placeholder="Add any special notes, requests, or remarks for this quote. This will appear on the preview and PDF if filled."
        className="w-full min-h-[100px] bg-black/20 border border-yellow-400/30 rounded-md p-3 text-yellow-100 resize-vertical placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      <div className="text-xs text-yellow-300 mt-1">Max 500 characters. Leave blank if not needed.</div>
    </div>
  );
}
