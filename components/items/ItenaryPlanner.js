"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Trash2, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import useQuoteStore from "./ItenaryStore";

const shouldShowQtyBox = (value) =>
  typeof value === "string" &&
  (value.toLowerCase().includes("dimaniyat") ||
    value.toLowerCase().includes("dolphin") ||
    value.toLowerCase().includes("dhow"));

const activitySets = {
  oneToSix: [
    { label: "Nizwa & Jabal Al Akhdar", value: "Nizwa & Jabal Al Akhdar", price: 130 },
    { label: "Jabal Shams & MisFat Al Abrigyeen", value: "Jabal Shams & MisFat Al Abrigyeen", price: 130 },
    { label: "Coastal tour for Sur – Wadi Shab, Bimmah Sinkhole, Fins Beach", value: "Coastal tour for Sur – Wadi Shab, Bimmah Sinkhole, Widi Tiwi", price: 130 },
    { label: "Desert & Wadi Bani Khalid", value: "Desert & Wadi Bani Khalid", price: 130 },
    { label: "Nakhal & AL Rustaq", value: "Nakhal & AL Rustaq", price: 130 },
    { label: "Full day Nizwa Tour - Nizwa Fort , Nizwa Souq", value: "Full day Nizwa Tour - Nizwa Fort , Nizwa Souq", price: 130 },
    { label: "Half day Muscat City Tour - Qurum Beach, Opera House from outside,Mutra Souq, Mutrah Fort", value: "Half day Muscat City Tour - Qurum Beach, Opera House from outside,Mutra Souq, Mutrah Fort", price: 65 },
    { label: "Dimaniyat Island & Snorkeling (with Transfer)", value: "Dimaniyat Island & Snorkeling (with Transfer)", price: 46 },
    { label: "Full Day East Salalah - Takah, Wadi Darbat, Samhram Ancient History", value: "Full Day East Salalah - Takah, Wadi Darbat, Samhram Ancient History", price: 130 },
    { label: "Full Day West Salalah- Almugshail Beach, Mountain , Alfazaih Beach", value: "Full day West Salalah- Almugshail Beach, Mountain , Alfazaih Beach", price: 130 },
    { label: "Half Day Salalah City Tour- coconut & banana Farms, Sultan Qaboos Mousq, Albalid", value: "Half Day Salalah City Tour- coconut & banana Farms, Sultan Qaboos Mousq, Albalid", price: 65 },
    { label: "Dhow Cruise With Sunset", value: "Dhow Cruise With Sunset", price: 25 },
    { label: "Dimaniyat Island (Without Transfer)", value: "Dimaniyat Island (Without Transfer)", price: 35 },
    { label: "Dolphin Watching & Snorkeling", value: "Dolphin Watching & Snorkeling", price: 25 },
    { label: "Jabal Al Akhdar", value: "Jabal Al Akhdar", price: 130 },
    { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 135, description: "Pick-Up (08:00 morning)\nWadi Bani Khalid\nDesert camp check-in\nSunset Dune Drive\nOvernight at camp" },
    { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 135, description: "Wadi Tiwi\nWadi Shab (optional 45-min Hike & Swim)\nBimah Sinkhole\nReturn to Muscat" },
    { label: "Transfer From Muscat Airport To Hotel", value: "Transfer From Muscat Airport To Hotel", price: 20 },
    { label: "Transfer From Muscat Hotel to Muscal Airport", value: "Transfer From Muscat Hotel to Muscal Airport", price: 20 },
    { label: "Transfer From Salalah Airport to Salalah Hotel", value: "Transfer From Salalah Airport to Salalah Hotel", price: 20 },
    { label: "Transfer From Salalah Hotel to Salalah Airport", value: "Transfer From Salalah Hotel to Salalah Airport", price: 20 },
    { label: "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", value: "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", price: 130 },
  ],
  sixToTen: [],
  tenToFifteen: [],
};
activitySets.sixToTen = [...activitySets.oneToSix];
activitySets.tenToFifteen = [...activitySets.oneToSix];

const descriptionOptions = [
  { value: "Other", label: "Other (Custom)" },
  { value: "Transfer from Muscat Airport to Muscat Hotel", label: "Transfer From Muscat Airport to Muscat Hotel" },
  { value: "Check-in to Hotel", label: "Check-in to Hotel" },
  { value: "Desert Camp Check-in", label: " Desert Camp Check-in" }, 

    { value: "Sunset Dune Drive ", label: "Sunset Dune Drive " },
      { value: "Overnight at Camp", label: " Overnight at Camp" },

{ value: "Widi Tiwi", label: " Widi Tiwi" },
{ value: "Wadi Shab (optional 45-min Hike & Swim) ", label: "Wadi Shab (optional 45-min Hike & Swim)" },
{ value: "Bimah SinKhole", label: " Bimah SinKhole" },
{ value: "Return to Muscat", label: "Return to Muscat" },

  { value: "Relex at Hotel", label: "Relex at Hotel" },

  { value: "Dolphine Watching", label: "Dolphine Watching" },
  { value: "Wahiba Sands", label: "Wahiba Sands" },
  { value: "Wadi Bani Khalid", label: "Wadi Bani Khalid" },


  { value: "Breakfast at Hotel", label: "Breakfast at Hotel" },
  { value: "Return to Hotel and overnight stay", label: "Return to Hotel and overnight stay" },
  { value: "Drop back to hotel and overnight stay", label: "Drop back to hotel and overnight stay" },
  { value: "Check-Out From Hotel", label: "Check-Out From Hotel" },
  { value: "Transfer from Hotel to Airport", label: "Transfer from Hotel to Airport" },
  { value: "Check-in to hotel (Best Western Premier Muscat)", label: "Check-in to hotel (Best Western Premier Muscat)" },
  { value: "leisure Day", label: "leisure Day" },
  ...activitySets.oneToSix.map(act => ({ value: act.label, label: act.label })),
];

export default function ItineraryPlanner({
  onNext = () => { },
  onBack = () => { },
  syncWithStore = false,
  showNav = true
}) {
  const { updateStepData, quoteData } = useQuoteStore();

  const [selectedCategory, setSelectedCategory] = useState(() =>
    quoteData?.itinerary?.selectedCategory || "oneToSix"
  );
  const [activityOptions, setActivityOptions] = useState(activitySets.oneToSix);

  const [days, setDays] = useState(() =>
    quoteData?.itinerary?.days && Array.isArray(quoteData.itinerary.days) && quoteData.itinerary.days.length
      ? quoteData.itinerary.days.map(day => {
        // Parse description string back into descriptionList array if needed
        let descriptionList = day.descriptionList || [];
        if (day.description && (!descriptionList || descriptionList.length === 0)) {
          descriptionList = day.description.split("\n").filter(d => d.trim());
        }
        // derive activity auto descriptions from activities if present
        const activityAutoDescriptions = (day.activities || []).map(a => a.label).filter(Boolean);
        // ensure descriptionList includes manual entries + auto ones (manual first)
        const manualDescriptions = (descriptionList || []).filter(d => !activityAutoDescriptions.includes(d));
        const mergedDescriptions = [...manualDescriptions, ...activityAutoDescriptions];

        return {
          ...day,
          descriptionList: mergedDescriptions,
          activityAutoDescriptions,
          showOtherInput: false,
          otherText: "",
          // --- NEW: set qty 0 if should show qty
          activities: (day.activities || []).map(a =>
            shouldShowQtyBox(a.value)
              ? { ...a, qty: a.qty !== undefined ? a.qty : 0 }
              : a
          ),
        };
      })
      : [{
        id: 1,
        title: "Day 1",
        description: "",
        descriptionList: [],
        activityAutoDescriptions: [],
        showOtherInput: false,
        otherText: "",
        activities: [],
        open: true,
      }]
  );
  const [totalActivityPrice, setTotalActivityPrice] = useState(0);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityPrice, setNewActivityPrice] = useState("");

  useEffect(() => {
    const total = days.reduce(
      (sum, day) =>
        sum + day.activities.reduce((acc, act) => acc + (act.price || 0), 0),
      0
    );
    setTotalActivityPrice(total);
  }, [days]);

  useEffect(() => {
    if (syncWithStore) {
      updateStepData("itinerary", { selectedCategory, days, totalActivityPrice });
    }
  }, [selectedCategory, days, totalActivityPrice, syncWithStore]);

  // --- Accordion tabs ---
  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setActivityOptions(activitySets[key]);
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        activities: [],
        descriptionList: [],
        showOtherInput: false,
        otherText: ""
      }))
    );
  };

  // Accordion
  const toggleDayOpen = (id) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, open: !day.open } : { ...day, open: false }
      )
    );
  };

  const handleAddDay = () => {
    setDays((prevDays) => [
      ...prevDays.map((d) => ({ ...d, open: false })),
      {
        id: prevDays.length + 1,
        title: `Day ${prevDays.length + 1}`,
        description: "",
          descriptionList: [],
          activityAutoDescriptions: [],
        showOtherInput: false,
        otherText: "",
        activities: [],
        open: true,
      },
    ]);
  };

  const handleRemoveDay = (index) => {
    // Remove day at specific index and renumber all
    const filtered = days.filter((_, i) => i !== index);
    // Renumber days sequentially
    const renumbered = filtered.map((day, newIndex) => ({
      ...day,
      id: newIndex + 1,
      title: `Day ${newIndex + 1}`
    }));
    setDays(renumbered);
  };

  // --- NEW LOGIC: Description SELECT instead of textarea ---
  const handleDescriptionSelect = (selectedOption, dayId) => {
    if (!selectedOption) return;
    setDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        if (selectedOption.value === "Other") {
          return { ...day, showOtherInput: true };
        }
        if (day.descriptionList.includes(selectedOption.value)) return day;
        const updatedList = [...day.descriptionList, selectedOption.value];
        const updatedAuto = day.activityAutoDescriptions || [];
        return {
          ...day,
          descriptionList: updatedList,
          activityAutoDescriptions: updatedAuto,
          description: updatedList.join("\n"),
          showOtherInput: false
        };
      })
    );
  };

  // Remove single desc item
  const handleRemoveDesc = (valToRemove, dayId) => {
    setDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const updated = day.descriptionList.filter(val => val !== valToRemove);
        return {
          ...day,
          descriptionList: updated,
          description: updated.join("\n")
        };
      })
    );
  };

  const handleOtherInput = (dayId, value) => {
    setDays(prev =>
      prev.map(day =>
        day.id === dayId ? { ...day, otherText: value } : day
      )
    );
  };

  const handleAddOtherDesc = (dayId) => {
    setDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        if (!day.otherText.trim()) return day;
        if (day.descriptionList.includes(day.otherText.trim())) return {
          ...day, otherText: ""
        };
        const updatedList = [...day.descriptionList, day.otherText.trim()];
        return {
          ...day,
          descriptionList: updatedList,
          description: updatedList.join("\n"),
          showOtherInput: false,
          otherText: ""
        };
      })
    );
  };

  // ----- Unchanged activities logic below -----
  const handleActivityChange = (selectedOptions, dayId) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        const prevActs = day.activities || [];
        const selectedActivities = selectedOptions
          ? selectedOptions.map((opt) => {
            const prevAct = prevActs.find((p) => p.value === opt.value);
            // -- fix: show qty box activities default qty = 0
            const qty = shouldShowQtyBox(opt.value)
              ? prevAct?.qty ?? 0
              : prevAct?.qty ?? 1;
            const basePrice = opt.price ?? opt.basePrice ?? 0;
            const price = basePrice * qty;
            return {
              label: opt.label,
              value: opt.value,
              basePrice,
              qty,
              price,
              description: opt.description || null,
            };
          })
          : [];
        // Build activity-auto descriptions (labels only, without price)
        const newAuto = selectedActivities.map(a => a.label).filter(Boolean);
        // Preserve manual descriptions (those not created by previous auto list)
        const prevAuto = day.activityAutoDescriptions || [];
        const manualDescriptions = (day.descriptionList || []).filter(d => !prevAuto.includes(d));
        const mergedDescriptions = [...manualDescriptions, ...newAuto];

        return { ...day, activities: selectedActivities, activityAutoDescriptions: newAuto, descriptionList: mergedDescriptions, description: mergedDescriptions.join("\n") };
      })
    );
  };

  const handleQtyChange = (dayId, activityValue, qtyRaw) => {
    // qty for qty-box activities now starts at 0!
    let qty = Math.floor(Number(qtyRaw));
    qty = isNaN(qty) ? 0 : qty;
    qty = Math.max(0, qty); // allow 0 too
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        const activities = (day.activities || []).map((act) => {
          if (act.value !== activityValue) return act;
          const base = act.basePrice ?? act.price ?? 0;
          return { ...act, qty, price: base * qty };
        });
        return { ...day, activities };
      })
    );
  };

  const handleAddNewActivity = () => {
    if (!newActivityName || !newActivityPrice) return;
    const price = parseFloat(newActivityPrice);
    const newAct = {
      label: newActivityName,
      value: newActivityName,
      price,
      basePrice: price,
    };
    setActivityOptions([...activityOptions, newAct]);
    setNewActivityName("");
    setNewActivityPrice("");
  };

  // ---------- Responsive classes helper ----------
  const mobileFlex = "flex flex-col md:flex-row gap-2";
  const mobInput = "w-full md:w-auto";

  // ------------------- RENDER -------------------
  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-xl relative z-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Itinerary Planner</h2>
      {/* Tabs */}
      <div className={`flex justify-center mb-6 gap-3 flex-wrap`}>
        {[
          { key: "oneToSix", label: "1 - 6 People" },
          { key: "sixToTen", label: "6 - 10 People" },
          { key: "tenToFifteen", label: "10 - 15 People" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={`px-4 py-2 rounded-lg font-semibold ${selectedCategory === tab.key
                ? "bg-white/40 text-black"
                : "bg-white/10 hover:bg-white/20"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Days Accordion */}
      {days.map((day, index) => (
        <div
          key={day.id}
          className="bg-white/10 border border-white/20 rounded-2xl mb-4"
        >
          {/* Header */}
          <div
            className={`
              flex justify-between items-center px-4 py-3 cursor-pointer bg-white/10 hover:bg-white/20 transition-all
              ${mobileFlex}
            `}
            onClick={() => toggleDayOpen(day.id)}
          >
            <h3 className="text-lg font-semibold">{day.title}</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveDay(index);
                }}
                className="hover:text-red-400"
              >
                <Trash2 size={18} />
              </button>
              {day.open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          {/* Body */}
          {day.open && (
            <div className="p-4 bg-black/40 relative z-20">
              {/* Description Select (responsive) */}
              <label className="block mb-2 text-sm font-semibold">Description (Select/Add Below)</label>
              <div className={`gap-2 items-center mb-2 ${mobileFlex}`}>
                <select
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 
             w-auto max-w-full md:w-60"
                  value=""
                  onChange={e => {
                    const val = e.target.value;
                    if (!val) return;
                    const found = descriptionOptions.find(opt => opt.value === val);
                    handleDescriptionSelect(found, day.id);
                  }}
                >
                  <option value="">Add Description</option>
                  {descriptionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {day.showOtherInput && (
                  <div className={mobileFlex}>
                    <input
                      type="text"
                      placeholder="Other description..."
                      className={`bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 flex-1 ${mobInput}`}
                      value={day.otherText}
                      onChange={e => handleOtherInput(day.id, e.target.value)}
                    />
                    <button
                      onClick={() => handleAddOtherDesc(day.id)}
                      className={`bg-green-500 text-white px-3 py-2 rounded-lg ${mobInput}`}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              {/* Description chips/cards */}
              <div className="flex flex-wrap gap-2 mb-4">
                {day.descriptionList.length === 0 && (
                  <span className="text-gray-400 text-sm">No description items added.</span>
                )}
                {day.descriptionList.map((desc, idx) => {
                  const isAuto = (day.activityAutoDescriptions || []).includes(desc);
                  return (
                    <div key={idx} className="bg-cyan-700/70 text-white py-1 px-3 rounded flex items-center gap-1">
                      <span>{desc}</span>
                      {!isAuto && (
                        <button
                          type="button"
                          className="ml-1 text-red-400 hover:text-red-200"
                          onClick={() => handleRemoveDesc(desc, day.id)}
                        ><X size={14} /></button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Activities */}
              <label className="block mb-2 text-sm font-semibold">
                Select Activities
              </label>
              <Select
                instanceId={`day-${day.id}-activities`}
                inputId={`day-${day.id}-activities-input`}
                isMulti
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                options={activityOptions}
                value={day.activities.map((a) => ({
                  label: a.label,
                  value: a.value,
                  price: a.basePrice ?? a.price,
                }))}
                onChange={(selected) => handleActivityChange(selected, day.id)}
                getOptionLabel={(e) => `${e.label} (INR ${e.price})`}
                className="text-black rounded-lg mb-3"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#fff",
                    color: "#000",
                  }),
                  option: (base, state) => ({
                    ...base,
                    color: "#000",
                    backgroundColor: state.isFocused ? "#e5e7eb" : "#fff",
                    cursor: "pointer",
                  }),
                }}
              />
              {/* Add Custom Activity */}
              <div className={`mb-3 ${mobileFlex}`}>
                <input
                  type="text"
                  placeholder="Activity name"
                  className={`bg-white/10 text-white p-2 rounded-lg flex-1 ${mobInput}`}
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  className={`bg-white/10 text-white p-2 rounded-lg md:w-24 ${mobInput}`}
                  value={newActivityPrice}
                  onChange={(e) => setNewActivityPrice(e.target.value)}
                />
                <button
                  onClick={handleAddNewActivity}
                  className={`bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-1 ${mobInput}`}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              {/* Selected Activities */}
              {day.activities.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {day.activities.map((a, i) => (
                    <li
                      key={i}
                      className={`flex flex-col md:flex-row md:items-center md:justify-between bg-white/10 px-3 py-2 rounded-lg text-sm gap-2`}
                    >
                      <div className={mobileFlex}>
                        <span className="font-medium">{a.label}</span>
                        {shouldShowQtyBox(a.value) && (
                          <span className="text-xs text-white/70">
                            (@ OMR {a.basePrice ?? a.price} per)
                          </span>
                        )}
                      </div>
                      <div className={mobileFlex}>
                        {shouldShowQtyBox(a.value) && (
                          <input
                            type="number"
                            min={0}
                            value={a.qty ?? 0}
                            onChange={(e) => handleQtyChange(day.id, a.value, e.target.value)}
                            className={`w-20 bg-white/10 text-white p-1 rounded-lg text-center ${mobInput}`}
                          />
                        )}
                        <span className="font-semibold">OMR {Number(a.price || 0).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
      {/* ➕ Add More Days */}
      <div className="text-center mb-6">
        <button
          onClick={handleAddDay}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold"
        >
          + Add More Day
        </button>
      </div>
      {/* 💰 Total (multiplied by INR 238 before persisting) */}
      <div className="text-center text-xl font-bold mb-6">
        {(() => {
          const ACTIVITY_MULTIPLIER = 238;
          const multiplied = Number(totalActivityPrice * ACTIVITY_MULTIPLIER || 0);
          return `Total Activity Cost: INR ${multiplied.toFixed(2)}`;
        })()}
      </div>
      {/* Navigation */}
      {showNav && (
        <div className={`flex flex-col md:flex-row gap-2 justify-between`}>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >Back</button>
          <button
            onClick={() => {
              updateStepData("itinerary", { selectedCategory, days, totalActivityPrice });
              onNext();
            }}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >Next</button>
        </div>
      )}
    </div>
  );
}