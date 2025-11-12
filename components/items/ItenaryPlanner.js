"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import useQuoteStore from "./ItenaryStore";


// ✅ Activity sets per group
const activitySets = {
  oneToSix: [
    { label: "Nizwa & Jabal Al Akhdar", value: "Nizwa & Jabal Al Akhdar", price: 130 },
    { label: "Jabal Shams & MisFat Al Abrigyeen", value: "Jabal Shams & MisFat Al Abrigyeen", price: 130 },
    { label: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", value: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", price: 130 },
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
    { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 170, description: "Pick-Up (08:00 morning)\nWadi Bani Khalid\nDesert camp check-in\nSunset Dune Drive\nOvernight at camp" },
     { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 170, description: "Wadi Tiwi\nWadi Shab (optional 45-min Hike & Swim)\nBimah Sinkhole\nReturn to Muscat" },
       
  { label: "Transfer From Muscat Airport To Hotel", value:  "Transfer From Muscat Airport To Hotel", price: 20 },
  { label: "Transfer From Muscat Hotel to Muscal Airport", value:  "Transfer From Muscat Hotel to Muscal Airport", price: 20 },
  
  { label: "Transfer From Salalah Airport to Salalah Hotel", value: "Transfer From Salalah Airport to Salalah Hotel", price: 20 },
  { label: "Transfer From Salalah Hotel to Salalah Airport", value:  "Transfer From Salalah Hotel to Salalah Airport", price: 20 },

   { label: "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", value:  "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", price: 130 },

  ],
  sixToTen: [
    { label: "Nizwa & Jabal Al Akhdar", value: "Nizwa & Jabal Al Akhdar", price: 130 },
    { label: "Jabal Shams & MisFat Al Abrigyeen", value: "Jabal Shams & MisFat Al Abrigyeen", price: 130 },
    { label: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", value: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", price: 130 },
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
    { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 330, description: "Day1\nPick-Up (08:00 morning)\nWadi Bani Khalid\nDesert camp check-in\nSunset Dune Drive\nOvernight at camp\nDay2\nBallon Tour (8:30 morning)\nWadi Tiwi\nWadi Shab (optional 45-min Hike & Swim)\nBimah Sinkhole\nReturn to Muscat" },
        
  { label: "Transfer From Muscat Airport To Hotel", value:  "Transfer From Muscat Airport To Hotel", price: 20 },
  { label: "Transfer From Muscat Hotel to Muscal Airport", value:  "Transfer From Muscat Hotel to Muscal Airport", price: 20 },
  
  { label: "Transfer From Salalah Airport to Salalah Hotel", value: "Transfer From Salalah Airport to Salalah Hotel", price: 20 },
  { label: "Transfer From Salalah Hotel to Salalah Airport", value:  "Transfer From Salalah Hotel to Salalah Airport", price: 20 },

   { label: "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", value:  "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", price: 130 },
  ],

  tenToFifteen: [
     { label: "Nizwa & Jabal Al Akhdar", value: "Nizwa & Jabal Al Akhdar", price: 130 },
    { label: "Jabal Shams & MisFat Al Abrigyeen", value: "Jabal Shams & MisFat Al Abrigyeen", price: 130 },
    { label: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", value: "The Coast Trip: Wadi Shah,Bimmah Sinkhole and Fins Beach", price: 130 },
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
  { label: "Overnight Desert Tour Wahiba Sands", value: "Overnight Desert Tour Wahiba Sands", price: 330, description: "Day1\nPick-Up (08:00 morning)\nWadi Bani Khalid\nDesert camp check-in\nSunset Dune Drive\nOvernight at camp\nDay2\nBallon Tour (8:30 morning)\nWadi Tiwi\nWadi Shab (optional 45-min Hike & Swim)\nBimah Sinkhole\nReturn to Muscat" },
        
  { label: "Transfer From Muscat Airport To Hotel", value:  "Transfer From Muscat Airport To Hotel", price: 20 },
  { label: "Transfer From Muscat Hotel to Muscal Airport", value:  "Transfer From Muscat Hotel to Muscal Airport", price: 20 },
  
  { label: "Transfer From Salalah Airport to Salalah Hotel", value: "Transfer From Salalah Airport to Salalah Hotel", price: 20 },
  { label: "Transfer From Salalah Hotel to Salalah Airport", value:  "Transfer From Salalah Hotel to Salalah Airport", price: 20 },

   { label: "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", value:  "Full Day Muscat City Tour - Qurum Beach, Royal Opera House, Mutrah Souq, Mutrah Fort, sultan Quboos Mosque", price: 130 },

],
};

export default function ItineraryPlanner({ onNext = () => { }, onBack = () => { }, syncWithStore = false, showNav = true }) {

  const { updateStepData, quoteData } = useQuoteStore();

  const [selectedCategory, setSelectedCategory] = useState(() =>
    quoteData?.itinerary?.selectedCategory || "oneToSix"
  );
  const [activityOptions, setActivityOptions] = useState(activitySets.oneToSix);

  const [days, setDays] = useState(() =>
    quoteData?.itinerary?.days && Array.isArray(quoteData.itinerary.days) && quoteData.itinerary.days.length
      ? quoteData.itinerary.days
      : [{ id: 1, title: "Day 1", description: "", activities: [], open: true }]
  );
  const [totalActivityPrice, setTotalActivityPrice] = useState(0);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityPrice, setNewActivityPrice] = useState("");

  // Load full itinerary data when in edit mode
  useEffect(() => {
    if (quoteData?.itinerary) {
      const incomingDays = Array.isArray(quoteData.itinerary.days) ? quoteData.itinerary.days : null;
      const incomingCategory = quoteData.itinerary.selectedCategory;

      // avoid unnecessary state updates (prevents infinite loops when store updates echo back)
      try {
        if (incomingDays) {
          const sameDays = JSON.stringify(incomingDays) === JSON.stringify(days);
          if (!sameDays) setDays(incomingDays);
        }
      } catch (e) {
        // fallback: if stringify fails, set directly
        if (incomingDays) setDays(incomingDays);
      }

      if (incomingCategory && incomingCategory !== selectedCategory) {
        setSelectedCategory(incomingCategory);
        setActivityOptions(activitySets[incomingCategory] || activitySets.oneToSix);
      }
    }
    // only run when quoteData changes
  }, [quoteData]);

  useEffect(() => {
    const total = days.reduce(
      (sum, day) =>
        sum + day.activities.reduce((acc, act) => acc + (act.price || 0), 0),
      0
    );
    setTotalActivityPrice(total);
  }, [days]);

  // when in edit mode, push itinerary to store
  useEffect(() => {
    if (syncWithStore) {
      updateStepData("itinerary", { selectedCategory, days, totalActivityPrice });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, days, totalActivityPrice, syncWithStore]);

  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setActivityOptions(activitySets[key]);
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        activities: [],
      }))
    );
  };

  const handleAddDay = () => {
    setDays([
      ...days.map((d) => ({ ...d, open: false })), // collapse previous
      {
        id: days.length + 1,
        title: `Day ${days.length + 1}`,
        description: "",
        activities: [],
        open: true,
      },
    ]);
  };

  const handleSaveDescription = (id, desc) => {
    setDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, description: desc } : day))
    );
  };

  const handleRemoveDay = (id) => {
    setDays(days.filter((d) => d.id !== id));
  };

  const handleActivityChange = (selectedOptions, dayId) => {
    const selectedActivities = selectedOptions
      ? selectedOptions.map((opt) => ({
          label: opt.label,
          value: opt.value,
          price: opt.price,
          description: opt.description || null,
        }))
      : [];

    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        // build new description by appending any activity descriptions that
        // aren't already present in the day's description
        let newDesc = day.description || "";
        for (const act of selectedActivities) {
          if (act.description) {
            if (!newDesc.includes(act.description)) {
              newDesc = newDesc.trim() ? newDesc + "\n" + act.description : act.description;
            }
          }
        }

        return { ...day, activities: selectedActivities, description: newDesc };
      })
    );
  };

  const handleAddNewActivity = () => {
    if (!newActivityName || !newActivityPrice) return;
    const newAct = {
      label: newActivityName,
      value: newActivityName,
      price: parseFloat(newActivityPrice),
    };
    setActivityOptions([...activityOptions, newAct]);
    setNewActivityName("");
    setNewActivityPrice("");
  };

  const toggleDayOpen = (id) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, open: !day.open } : { ...day, open: false }
      )
    );
  };

  return (
    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-xl relative z-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Itinerary Planner</h2>

      {/* 🧭 Category Tabs */}
      <div className="flex justify-center mb-6 gap-3 flex-wrap">
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

      {/* Accordion Days */}
      {days.map((day) => (
        <div
          key={day.id}
          className="bg-white/10 border border-white/20 rounded-2xl mb-4"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center px-4 py-3 cursor-pointer bg-white/10 hover:bg-white/20 transition-all"
            onClick={() => toggleDayOpen(day.id)}
          >
            <h3 className="text-lg font-semibold">{day.title}</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveDay(day.id);
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
              {/* Description */}
              <textarea
                className="w-full bg-white/10 text-white placeholder-white/60 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Write day description..."
                value={day.description}
                onChange={(e) => handleSaveDescription(day.id, e.target.value)}
              />

              {/* Activities */}
              <label className="block mb-2 text-sm font-semibold">
                Select Activities
              </label>
              <Select
                isMulti
                menuPortalTarget={typeof window !== "undefined" ? document.body : null} // ✅ safe SSR
                options={activityOptions}
                value={day.activities.map((a) => ({
                  label: a.label,
                  value: a.value,
                  price: a.price,
                }))}
                onChange={(selected) => handleActivityChange(selected, day.id)}
                getOptionLabel={(e) => `${e.label} (INR ${e.price})`}
                className="text-black rounded-lg mb-3"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#fff", // white background
                    color: "#000", // black text inside dropdown
                  }),
                  option: (base, state) => ({
                    ...base,
                    color: "#000", // black text for options
                    backgroundColor: state.isFocused ? "#e5e7eb" : "#fff", // light gray hover
                    cursor: "pointer",
                  }),
                }}
              />

              {/* Add Custom Activity */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Activity name"
                  className="bg-white/10 text-white p-2 rounded-lg flex-1"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="bg-white/10 text-white p-2 rounded-lg w-24"
                  value={newActivityPrice}
                  onChange={(e) => setNewActivityPrice(e.target.value)}
                />
                <button
                  onClick={handleAddNewActivity}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Selected Activities */}
              {day.activities.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {day.activities.map((a, i) => (
                    <li
                      key={i}
                      className="flex justify-between bg-white/10 px-3 py-2 rounded-lg text-sm"
                    >
                      <span>{a.label}</span>
                      <span>OMR {a.price}</span>
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
        {/* multiplier is fixed as per requirement */}
        {(() => {
          const ACTIVITY_MULTIPLIER = 238;
          const multiplied = Number(totalActivityPrice * ACTIVITY_MULTIPLIER || 0);
          return `Total Activity Cost: INR ${multiplied.toFixed(2)}`;
        })()}
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="flex justify-between">
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Back</button>
          <button onClick={() => { updateStepData("itinerary", { selectedCategory, days, totalActivityPrice }); onNext(); }} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
}
