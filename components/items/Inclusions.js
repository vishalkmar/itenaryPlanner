"use client";
import React, { useState, useEffect } from "react";
import { Pencil, X, Plus } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

export default function Inclusion({ onNext, onBack, syncWithStore = false }) {
  const defaultInclusions = [
    "4 nights accommodation in 4★ hotel",
    "Visa",
    "All Transfers",
    "Half-day Muscat city tour – Qurum Beach, Opera House (outside), Mutrah Souq, Mutrah Fort",
    "Full-day Nizwa tour – Nizwa Fort, Nizwa Souq",
    "Coastal tour for Sur – Wadi Shab, Bimmah Sinkhole, Fins Beach",
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

  const { updateStepData } = useQuoteStore();

  // Load from store only once on component mount or when editing starts (only sync mode)
  useEffect(() => {
    if (syncWithStore && quoteData?.inclusion) {
      if (Array.isArray(quoteData.inclusion.inclusions)) {
        setInclusions(quoteData.inclusion.inclusions);
      }
      if (typeof quoteData.inclusion.visaAmount !== 'undefined') {
        setVisaAmount(quoteData.inclusion.visaAmount);
      }
    }
  }, [syncWithStore]);

  // sync to store when in edit mode and local state changes
  useEffect(() => {
    if (syncWithStore) {
      const hasVisa = inclusions.some((item) => item.toLowerCase().includes("visa"));
      // if Visa present: 0, if Visa NOT present: 1600 (will be subtracted from total)
      updateStepData("inclusion", { inclusions, visaAmount: hasVisa ? 0 : 1600 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inclusions, syncWithStore]);

  const handleNext = () => {
    const hasVisa = inclusions.some((item) =>
      item.toLowerCase().includes("visa")
    );

    // if Visa present: 0, if Visa NOT present: 1600 (will be subtracted from total)
    updateStepData("inclusion", {
      inclusions,
      visaAmount: hasVisa ? 0 : 1600,
    });

    console.log("Updated inclusion data:", {
      inclusions,
      visaAmount: hasVisa ? 0 : 1600,
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
        {inclusions.map((item, index) => (
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
      </div>

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

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-2 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}
