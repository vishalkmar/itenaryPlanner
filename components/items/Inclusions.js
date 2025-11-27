"use client";
import React, { useState, useEffect } from "react";
import { Pencil, X, Plus } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

export default function Inclusion({ onNext = () => {}, onBack = () => {}, syncWithStore = false, showNav = true }) {
  const defaultInclusions = [
    "Accommodation in 4★ hotel",
    "All Transfers",
    "Half-day Muscat city tour – Qurum Beach, Opera House (outside), Mutrah Souq, Mutrah Fort",
    "Full-day Nizwa tour – Nizwa Fort, Nizwa Souq",
    "Coastal tour for Sur – Wadi Shab, Bimmah Sinkhole, Widi Tiwi",
    "Breakfast"
  ];

 
  const { quoteData } = useQuoteStore();
  const [inclusions, setInclusions] = useState(() =>
    (quoteData?.inclusion?.inclusions && Array.isArray(quoteData.inclusion.inclusions))
      ? quoteData.inclusion.inclusions
      : defaultInclusions
  );
  const [editIndex, setEditIndex] = useState(null);
  const [newInclusion, setNewInclusion] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [visaAmount, setVisaAmount] = useState(0); // default 0 if Visa present
  const [customVisaCount, setCustomVisaCount] = useState(() => {
    if (quoteData?.inclusion?.customVisaCount !== undefined) return quoteData.inclusion.customVisaCount;
    if (quoteData?.totals?.customVisaCount !== undefined) return quoteData.totals.customVisaCount;
    return 0; // number of people WITHOUT visa (default to 0, meaning all have visa)
  }); // number of people WITHOUT visa (default to 0)
  // explicit list of passenger indexes (1-based) who have visa
  const [visaPassengers, setVisaPassengers] = useState(() => {
    if (Array.isArray(quoteData?.inclusion?.visaPassengers)) return quoteData.inclusion.visaPassengers;
    if (Array.isArray(quoteData?.totals?.visaPassengers)) return quoteData.totals.visaPassengers;
    return [];
  });

  const { updateStepData } = useQuoteStore();



  // Load from store only once on component mount or when editing starts (only sync mode)
  useEffect(() => {
    if (syncWithStore && quoteData) {
      if (Array.isArray(quoteData?.inclusion?.inclusions)) {
        setInclusions(quoteData.inclusion.inclusions);
      }
      // Prefer inclusion.visaAmount, fallback to totals.visaAmount
      if (typeof quoteData?.inclusion?.visaAmount === 'number') {
        setVisaAmount(quoteData.inclusion.visaAmount);
      } else if (typeof quoteData?.totals?.visaAmount === 'number') {
        setVisaAmount(quoteData.totals.visaAmount);
      }

      // Prefer inclusion.customVisaCount, then totals.customVisaCount, else default to pax
      if (typeof quoteData?.inclusion?.customVisaCount === 'number') {
        setCustomVisaCount(quoteData.inclusion.customVisaCount);
      } else if (typeof quoteData?.totals?.customVisaCount === 'number') {
        setCustomVisaCount(quoteData.totals.customVisaCount);
      } else {
        setCustomVisaCount(Number(quoteData?.basic?.pax || 0));
      }
    }
  }, [syncWithStore]);

  // Ensure component auto-populates when quoteData is fetched (edit mode/load)
  useEffect(() => {
    if (!quoteData) return;

    // populate inclusions if incoming data has them
    if (Array.isArray(quoteData?.inclusion?.inclusions)) {
      setInclusions(quoteData.inclusion.inclusions);
    }

    // populate visa amount: prefer inclusion.visaAmount then totals.visaAmount
    if (typeof quoteData?.inclusion?.visaAmount === 'number') {
      setVisaAmount(quoteData.inclusion.visaAmount);
    } else if (typeof quoteData?.totals?.visaAmount === 'number') {
      setVisaAmount(quoteData.totals.visaAmount);
    }

    // populate customVisaCount: prefer inclusion.customVisaCount, then totals.customVisaCount, else default to pax
    const incomingCount = (typeof quoteData?.inclusion?.customVisaCount === 'number')
      ? quoteData.inclusion.customVisaCount
      : (typeof quoteData?.totals?.customVisaCount === 'number' ? quoteData.totals.customVisaCount : Number(quoteData?.basic?.pax || 0));

    if (typeof incomingCount === 'number') {
      setCustomVisaCount(incomingCount);
    }
  }, [quoteData]);

  // sync to store when in edit mode and local state changes
  useEffect(() => {
    if (syncWithStore) {
      const pax = Number(quoteData?.basic?.pax || 1);

      // Visa calculation: customVisaCount now represents people WITHOUT visa
      // Formula: visaAmount = (2000 * pax) - (1500 * customVisaCount)
      const nonVisaPeople = Math.min(Math.max(customVisaCount, 0), pax);
      const calculatedVisaAmount = (2000 * pax) - (1500 * nonVisaPeople);

      // Persist inclusions without any raw 'visa' strings to avoid duplication — visa is represented by customVisaCount
      const normalizedInclusions = inclusions.filter((it) => !String(it || "").toLowerCase().includes("visa"));

      updateStepData("inclusion", { 
        inclusions: normalizedInclusions, 
        customVisaCount,
        visaAmount: calculatedVisaAmount,
        visaPassengers,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inclusions, customVisaCount, syncWithStore, quoteData?.basic?.pax]);

  // UI-only: derived visa inclusion/exclusion strings to show immediately when customVisaCount changes
  const pax = Number(quoteData?.basic?.pax || 1);
  let visaIncludeString = null;
  let visaExcludeString = null;
  if (typeof customVisaCount === 'number') {
    if (customVisaCount === 0) {
      // All people have visa
      visaIncludeString = "Visa included for all";
      visaExcludeString = null;
    } else if (customVisaCount === pax) {
      // No one has visa
      visaIncludeString = null;
      visaExcludeString = `Visa not included for ${pax} person(s)`;
    } else if (customVisaCount > 0 && customVisaCount < pax) {
      // Mix: some have visa, some don't
      visaIncludeString = `Visa included for ${pax - customVisaCount} person(s)`;
      visaExcludeString = `Visa not included for ${customVisaCount} person(s)`;
    }
  }

  const handleNext = () => {
    const pax = Number(quoteData?.basic?.pax || 1);
    
    // Visa calculation: customVisaCount now represents people WITHOUT visa
    // Formula: visaAmount = (2000 * pax) - (1500 * customVisaCount)
    const nonVisaPeople = Math.min(Math.max(customVisaCount, 0), pax);
    const calculatedVisaAmount = (2000 * pax) - (1500 * nonVisaPeople);

    const normalizedInclusions = inclusions.filter((it) => !String(it || "").toLowerCase().includes("visa"));

    updateStepData("inclusion", {
      inclusions: normalizedInclusions,
      customVisaCount,
      visaAmount: calculatedVisaAmount,
      visaPassengers,
    });  

    console.log("Updated inclusion data:", {
      inclusions: normalizedInclusions,
      customVisaCount,
      visaAmount: calculatedVisaAmount,
    });

    onNext();
  };


  const handleDelete = (index) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setNewInclusion(inclusions[index]);
  };

  const handleSaveEdit = () => {
    const updated = inclusions.map((item, i) =>
      i === editIndex ? newInclusion.trim() : item
    );
    setInclusions(updated);
    setEditIndex(null);
    setNewInclusion("");
  };

  const handleAdd = () => {
    if (!newInclusion.trim()) return;
    setInclusions([...inclusions, newInclusion.trim()]);
    setNewInclusion("");
    setIsAdding(false);
  };

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-lg border border-white/10">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
        Step 1: Inclusions
      </h2>

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inclusions.filter(it => !String(it || "").toLowerCase().includes("visa")).map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white/10 rounded-xl p-3 hover:bg-white/20 transition"
          >
            {editIndex === index ? (
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                className="flex-1 bg-transparent border-b border-cyan-400 focus:outline-none text-white mr-3"
              />
            ) : (
              <p>{item}</p>
            )}

            <div className="flex gap-2">
              {editIndex === index ? (
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  className="w-4 h-4 text-cyan-400 cursor-pointer hover:text-cyan-300"
                  onClick={() => handleEdit(index)}
                />
              )}
              <X
                className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-300"
                onClick={() => handleDelete(index)}
              />
            </div>
          </div>
        ))}

        {/* UI-only visa inclusion string (not persisted) */}
        {visaIncludeString && (
          <div className="flex justify-between items-center bg-white/6 rounded-xl p-3 opacity-95">
            <p className="text-cyan-200">{visaIncludeString}</p>
          </div>
        )}
      </div>

      {/* UI-only Exclusions display for visa if applicable (not persisted) */}
      {visaExcludeString && (
        <div className="mt-4 p-3 bg-amber-800/10 rounded-xl border border-amber-700/20">
          <h4 className="text-sm font-semibold text-amber-300 mb-2">Exclusions</h4>
          <div className="text-sm text-amber-200">• {visaExcludeString}</div>
        </div>
      )}

      {/* ➕ Add New Inclusion */}
      <div className="mt-6">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add New Inclusion
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              placeholder="Enter inclusion..."
              className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewInclusion("");
                setIsAdding(false);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Custom Visa Count UI */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-cyan-400/30">
          <h3 className="text-lg font-semibold mb-3 text-cyan-400">Visa Configuration</h3>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-300">
              How many people do NOT need visa? (Out of {quoteData?.basic?.pax || 1} pax)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={quoteData?.basic?.pax || 1}
                value={customVisaCount}
                onChange={(e) => setCustomVisaCount(Math.max(0, Math.min(Number(e.target.value) || 0, quoteData?.basic?.pax || 1)))}
                className="w-24 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-sm text-gray-400">people</span>
            </div>
            {customVisaCount > 0 && (
              <div className="text-sm text-cyan-300 mt-2 p-2 bg-cyan-400/10 rounded">
                ✓ {pax - customVisaCount} person(s) with visa: +₹{(2000 * (pax - customVisaCount)).toLocaleString('en-IN')}
                <br />
                ✓ {customVisaCount} person(s) without visa: -₹{(1500 * customVisaCount).toLocaleString('en-IN')}
              </div>
            )}
            {customVisaCount === 0 && (
              <div className="text-sm text-cyan-300 mt-2 p-2 bg-cyan-400/10 rounded">
                ✓ All {pax} person(s) with visa: +₹{(2000 * pax).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>
      

      {/* Navigation */}
      {showNav && (
        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg">Back</button>
          <button onClick={handleNext} className="bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-2 rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
}
