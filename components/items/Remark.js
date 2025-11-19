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
    <div className="bg-white/5 rounded-xl border border-cyan-400/30 p-4 mb-4">
      <label className="block text-lg font-semibold mb-3 text-cyan-400 mb-2">
        Remark (optional)
      </label>
      <textarea
        value={remark}
        onChange={handleChange}
        maxLength={500}
        placeholder="Add  remarks for this quote."
        className="w-full min-h-[100px] bg-black/20 border border-cyan-400/30 rounded-md p-3 text-sm text-gray-300 resize-vertical placeholder-gray-300 focus:outline-none "
      />
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      <div className="text-xs text-sm text-gray-300 mt-1">Max 500 characters. Leave blank if not needed.</div>
    </div>
  );
}
