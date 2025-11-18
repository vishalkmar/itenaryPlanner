"use client";
import React, { useState, useEffect } from "react";
import { X, Check, Plus, Trash2 } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

export default function Meal({ onBack = () => {}, onNext = () => {}, syncWithStore = false, showNav = true }) {
  const { updateStepData, quoteData } = useQuoteStore();
  const basePax = Number(quoteData?.basic?.pax || 1);

  const [mealList, setMealList] = useState(() =>
    quoteData?.meal?.meals && Array.isArray(quoteData.meal.meals) && quoteData.meal.meals.length
      ? quoteData.meal.meals
      : []
  );
  const [adding, setAdding] = useState(null);
  const [tempDays, setTempDays] = useState("");
  const [tempCostumePax, setTempCostumePax] = useState("");

  useEffect(() => {
    if (quoteData?.meal?.meals && Array.isArray(quoteData.meal.meals)) {
      // strip any Breakfast entries so breakfast section is not shown
      const filtered = quoteData.meal.meals.filter((m) => String(m?.type || "").toLowerCase() !== "breakfast");
      setMealList(filtered);
    }
  }, [quoteData?.meal?.meals]);

  // sync to store on changes when editing
  useEffect(() => {
    if (syncWithStore) {
      // ensure breakfast entries are removed when syncing to store
      const mealsToSave = (Array.isArray(mealList) ? mealList : []).filter((m) => String(m?.type || "").toLowerCase() !== "breakfast");
      const totalPrice = mealsToSave.reduce((s, m) => s + (Number(m.price) || 0), 0);
      updateStepData("meal", { meals: mealsToSave, totalPrice });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealList, syncWithStore]);

  // ✅ Calculate price for a single meal: 1500 * costumePax * days
  const calculateMealPrice = (days, costumePax) => {
    const pricePerPerson = 1500;
    return pricePerPerson * (Number(costumePax) || 0) * (Number(days) || 0);
  };

  // ✅ Add new meal with days and costume pax
  const confirmAddMeal = () => {
    const days = Number(tempDays) || 0;
    const costumePax = Number(tempCostumePax) || basePax;
    const price = calculateMealPrice(days, costumePax);

    const newMeal = { type: adding, price, days, costumePax };
    setMealList((prev) => [...prev, newMeal]);
    setAdding(null);
    setTempDays("");
    setTempCostumePax("");
  };

  // ✅ Remove meal
  const handleRemove = (index) => {
    setMealList((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Update meal price when days or costume pax changes
  const updateMealField = (index, field, value) => {
    setMealList((prev) =>
      prev.map((meal, i) => {
        if (i === index) {
          const updatedMeal = { ...meal, [field]: Number(value) || 0 };
          // Recalculate price if either days or costumePax changed
          if (field === "days" || field === "costumePax") {
            updatedMeal.price = calculateMealPrice(updatedMeal.days, updatedMeal.costumePax);
          }
          return updatedMeal;
        }
        return meal;
      })
    );
  };

  // ✅ Calculate total
  const totalPrice = mealList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // ✅ Handle Next (instead of submit)
  const handleNextStep = () => {
    const mealData = {
      meals: mealList,
      totalPrice,
    };
    console.log("🍱 Meal Data Saved:", mealData);
    updateStepData("meal", mealData);
    onNext(); // go to next step
  };

  return (
    <div className="bg-black text-white border border-white/10 rounded-2xl p-6 shadow-lg w-full">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Step 3: Meals</h2>

      {/* Meal list with details */}
      <div className="space-y-4">
        {mealList.map((meal, index) => (
          <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-cyan-300">{meal.type}</h3>
              <button
                onClick={() => handleRemove(index)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Days Input */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Number of Days</label>
                <input
                  type="number"
                  min="0"
                  value={meal.days || ""}
                  onChange={(e) => updateMealField(index, "days", e.target.value)}
                  placeholder="Days"
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              {/* Costume Pax Input */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Costume Pax</label>
                <input
                  type="number"
                  min="1"
                  value={meal.costumePax || basePax}
                  onChange={(e) => updateMealField(index, "costumePax", e.target.value)}
                  placeholder={`Default: ${basePax}`}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              {/* Price Display */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Total Price</label>
                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-400 font-semibold">
                  ₹{meal.price?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Calculation Display */}
            <div className="text-xs text-gray-400 bg-black/50 rounded p-2">
              ₹1500 × {meal.costumePax || basePax} pax × {meal.days} days = ₹{meal.price?.toLocaleString() || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Add Meal Buttons */}
      <div className="mt-6 flex gap-3 flex-wrap">
        {!mealList.find((m) => m.type === "Lunch") && (
          <button
            onClick={() => setAdding("Lunch")}
            className="flex items-center gap-2 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Lunch
          </button>
        )}
        {!mealList.find((m) => m.type === "Dinner") && (
          <button
            onClick={() => setAdding("Dinner")}
            className="flex items-center gap-2 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Dinner
          </button>
        )}
      </div>

      {/* Input for adding new meal */}
      {adding && (
        <div className="mt-5 bg-white/10 p-4 rounded-lg border border-white/20">
          <h4 className="text-white font-semibold mb-3">{adding} Details</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Number of Days</label>
              <input
                type="number"
                min="0"
                value={tempDays}
                onChange={(e) => setTempDays(e.target.value)}
                placeholder="Enter days"
                className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Costume Pax</label>
              <input
                type="number"
                min="1"
                value={tempCostumePax}
                onChange={(e) => setTempCostumePax(e.target.value)}
                placeholder={`Default: ${basePax}`}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {tempDays && tempCostumePax && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 mb-3">
              <div className="text-emerald-300 text-sm mb-1">
                Total Price: ₹{calculateMealPrice(tempDays, tempCostumePax).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                ₹1500 × {tempCostumePax} pax × {tempDays} days
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={confirmAddMeal}
              className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <Check size={18} /> Confirm
            </button>
            <button
              onClick={() => {
                setAdding(null);
                setTempDays("");
                setTempCostumePax("");
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mt-6 text-right text-lg font-semibold text-emerald-400">
        Total Meal Cost: ₹{totalPrice.toLocaleString()}
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            Back
          </button>
          <button
            onClick={handleNextStep}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
