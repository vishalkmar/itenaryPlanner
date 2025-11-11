"use client";
import React, { useState, useEffect } from "react";
import { Pencil, X, Plus } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

export default function Exclusion({ onNext = () => {}, onBack = () => {}, syncWithStore = false, showNav = true }) {
  const defaultExclusions = [
    "Airfare",
    "Lunch & Dinner",
    "Personal expense (Tips, Laundry, Beverage, etc.)",
    "Early check-in / Late checkout",
    "GST @5% & TCS @5% as per applicable travel cost",
  ];

  const { quoteData } = useQuoteStore();
  const [exclusions, setExclusions] = useState(() =>
    quoteData?.exclusion?.exclusions && Array.isArray(quoteData.exclusion.exclusions) && quoteData.exclusion.exclusions.length
      ? quoteData.exclusion.exclusions
      : defaultExclusions
  );
  const [editIndex, setEditIndex] = useState(null);
  const [newExclusion, setNewExclusion] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { updateStepData } = useQuoteStore();

  // sync to store when editing
  useEffect(() => {
    if (syncWithStore) {
      updateStepData("exclusion", { exclusions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exclusions, syncWithStore]);

  useEffect(() => {
    if (quoteData?.exclusion?.exclusions && Array.isArray(quoteData.exclusion.exclusions)) {
      setExclusions(quoteData.exclusion.exclusions);
    }
  }, [quoteData?.exclusion?.exclusions]);

  const handleNext = () => {
    updateStepData("exclusion", { exclusions });
    onNext();
  };

  const handleDelete = (index) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setNewExclusion(exclusions[index]);
  };

  const handleSaveEdit = () => {
    const updated = exclusions.map((item, i) =>
      i === editIndex ? newExclusion : item
    );
    setExclusions(updated);
    setEditIndex(null);
    setNewExclusion("");
  };

  const handleAdd = () => {
    if (!newExclusion.trim()) return;
    setExclusions([...exclusions, newExclusion]);
    setNewExclusion("");
    setIsAdding(false);
  };

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-lg border border-white/10">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
        Step 2: Exclusions
      </h2>

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exclusions.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white/10 rounded-xl p-3 hover:bg-white/20 transition"
          >
            {editIndex === index ? (
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
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

      {/* ➕ Add New Exclusion */}
      <div className="mt-6">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add New Exclusion
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              placeholder="Enter exclusion..."
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
                setNewExclusion("");
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
      {showNav && (
        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg">Back</button>
          <button onClick={handleNext} className="bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-2 rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
}
