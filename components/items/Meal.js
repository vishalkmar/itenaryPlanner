"use client";
import React, { useState, useEffect } from "react";
import { X, Check, Plus } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

export default function Meal({ onBack, onNext, syncWithStore = false }) {
  const { updateStepData, quoteData } = useQuoteStore();

  const [mealList, setMealList] = useState(() =>
    quoteData?.meal?.meals && Array.isArray(quoteData.meal.meals) && quoteData.meal.meals.length
      ? quoteData.meal.meals
      : [{ type: "Breakfast", price: 0 }]
  );
  const [adding, setAdding] = useState(null);
  const [tempPrice, setTempPrice] = useState("");

  useEffect(() => {
    if (quoteData?.meal?.meals && Array.isArray(quoteData.meal.meals)) {
      setMealList(quoteData.meal.meals);
    }
  }, [quoteData?.meal?.meals]);

  // sync to store on changes when editing
  useEffect(() => {
    if (syncWithStore) {
      const totalPrice = mealList.reduce((s, m) => s + (Number(m.price) || 0), 0);
      updateStepData("meal", { meals: mealList, totalPrice });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealList, syncWithStore]);

  // ✅ Add new meal
  const confirmAddMeal = () => {
    const price = Number(tempPrice) > 0 ? Number(tempPrice) : 2000;
    const newMeal = { type: adding, price };
    setMealList((prev) => [...prev, newMeal]);
    setAdding(null);
    setTempPrice("");
  };

  // ✅ Remove meal
  const handleRemove = (type) => {
    setMealList((prev) => prev.filter((m) => m.type !== type));
  };

  // ✅ Calculate total
  const totalPrice = mealList.reduce((sum, item) => sum + (item.price || 0), 0);

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

      {/* Meal list */}
      <ul className="space-y-3">
        {mealList.map((meal) => (
          <li key={meal.type} className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
            <span>
              {meal.type} {meal.price > 0 && <span className="text-sm text-gray-400">(₹{meal.price.toLocaleString()})</span>}
            </span>
            {meal.type !== "Breakfast" && (
              <button onClick={() => handleRemove(meal.type)} className="text-red-400 hover:text-red-300">
                <X size={18} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Add Meal Buttons */}
      <div className="mt-5 flex gap-3 flex-wrap">
        {!mealList.find((m) => m.type === "Lunch") && (
          <button onClick={() => setAdding("Lunch")} className="flex items-center gap-2 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90">
            <Plus size={18} /> Add Lunch
          </button>
        )}
        {!mealList.find((m) => m.type === "Dinner") && (
          <button onClick={() => setAdding("Dinner")} className="flex items-center gap-2 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90">
            <Plus size={18} /> Add Dinner
          </button>
        )}
      </div>

      {/* Input for meal price */}
      {adding && (
        <div className="mt-5 flex items-center gap-3 bg-white/10 p-3 rounded-lg">
          <span className="text-white">{adding} Price:</span>
          <input type="number" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} placeholder="Enter price or leave blank (₹2000)" className="bg-transparent border border-white/30 rounded-lg px-3 py-1 text-white placeholder-gray-400 w-48" />
          <button onClick={confirmAddMeal} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white">
            <Check size={18} />
          </button>
          <button onClick={() => { setAdding(null); setTempPrice(""); }} className="text-red-400 hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Total */}
      <div className="mt-6 text-right text-lg font-semibold text-emerald-400">Total Meal Cost: ₹{totalPrice.toLocaleString()}</div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Back</button>
        <button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">Next</button>
      </div>
    </div>
  );
}
