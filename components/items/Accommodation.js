"use client";

import React, { useState, useEffect } from "react";
import useQuoteStore from "./ItenaryStore";

export default function Accommodation({ onNext = () => {}, onBack = () => {}, syncWithStore = false, showNav = true }) {
  const { updateStepData, quoteData } = useQuoteStore();

  // 🔹 Hotel rate data
  const hotelRates = {
    "Best Western Premier or Similar (4★)": { Single: 6000, Double: 6000, Triple: 9000 },
    "The Plaza Hotel & Resort": { Single: 6000, Double: 6000, Triple: 9000 },
  };

  const emptyAcc = {
    hotel: "",
    otherHotel: "",
    customRates: { Single: 0, Double: 0, Triple: 0 },
    place: "",
    otherPlace: "",
    nights: 0,
    adults: 1,
    children: 0,
    occupancy: "",
    rooms: 0,
    totalPrice: 0,
  };

  const [accommodations, setAccommodations] = useState(() =>
    quoteData?.accommodation && Array.isArray(quoteData.accommodation) && quoteData.accommodation.length
      ? quoteData.accommodation
      : [emptyAcc]
  );

  // initialize from store when quoteData loads (edit mode)
  useEffect(() => {
    if (quoteData?.accommodation && Array.isArray(quoteData.accommodation)) {
      setAccommodations(quoteData.accommodation);
    }
  }, [quoteData?.accommodation]);

  // 🔹 Calculate rooms & total price for an accommodation object
  const calculate = (acc) => {
    const totalPeople = (Number(acc.adults) || 0) + (Number(acc.children) || 0);
    let rooms = 0;
    let occupancy = acc.occupancy || "";

    if (totalPeople <= 1) {
      occupancy = "Single";
      rooms = 1;
    } else if (occupancy === "Single") {
      rooms = totalPeople;
    } else if (occupancy === "Double") {
      rooms = Math.ceil(totalPeople / 2);
    } else if (occupancy === "Triple") {
      rooms = Math.ceil(totalPeople / 3);
    }

    // 🔹 Get correct rate (hotel-based or custom)
    const rates = acc.hotel === "Other" ? acc.customRates : hotelRates[acc.hotel] || { Single: 0, Double: 0, Triple: 0 };
    const pricePerNight = rates[occupancy] || 0;
    const totalPrice = rooms * (acc.nights || 0) * pricePerNight;

    return { ...acc, rooms, totalPrice, occupancy };
  };

  // 🔹 Field change handler
  const handleChange = (index, field, value) => {
    setAccommodations((prev) => {
      const updated = [...prev];
      updated[index] = calculate({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const handleAddMore = () => {
    setAccommodations((prev) => [...prev, { ...emptyAcc }]);
  };

  const handleRemove = (index) => {
    setAccommodations((prev) => prev.filter((_, i) => i !== index));
  };

  // Grand Total (recomputed when accommodations change)
  const [grandTotal, setGrandTotal] = useState(0);
  useEffect(() => {
    const total = accommodations.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);
    setGrandTotal(total);
  }, [accommodations]);

  // sync with store when requested (edit mode)
  useEffect(() => {
    if (syncWithStore) {
      updateStepData("accommodation", accommodations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accommodations, syncWithStore]);

  const handleSubmit = () => {
    updateStepData("accommodation", accommodations);
    console.log("🏨 Accommodation Data:", accommodations);
    onNext();
  };

  return (
    <div className="bg-black text-white border border-white/10 rounded-2xl p-6 shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-cyan-400">Step 3: Accommodation Details</h2>
        <button onClick={handleAddMore} className="bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 px-4 py-2 rounded-lg hover:opacity-90 text-sm">+ Add More</button>
      </div>

      {accommodations.map((acc, index) => (
        <div key={index} className="border border-white/10 p-4 rounded-xl mb-4 bg-white/5">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold text-emerald-400">Accommodation #{index + 1}</h3>
            {accommodations.length > 1 && (
              <button onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-300 text-sm">✕ Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 🏨 Hotel */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Hotel</label>
              <select value={acc.hotel} onChange={(e) => handleChange(index, "hotel", e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2">
                <option value="">Select</option>
                {Object.keys(hotelRates).map((hotel) => (
                  <option key={hotel} value={hotel}>{hotel}</option>
                ))}
                <option value="Other">Custom / Other</option>
              </select>

              {/* ✏️ Custom Hotel Name & Rates */}
              {acc.hotel === "Other" && (
                <div className="mt-3 space-y-2">
                  <input type="text" placeholder="Enter custom hotel name" value={acc.otherHotel} onChange={(e) => handleChange(index, "otherHotel", e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2" />
                  <div className="grid grid-cols-3 gap-2">
                    { ["Single", "Double", "Triple"].map((type) => (
                      <div key={type}>
                        <label className="text-xs text-gray-400">{type}</label>
                        <input type="number" min="0" value={acc.customRates[type]} onChange={(e) => {
                          const newRates = { ...acc.customRates, [type]: Number(e.target.value) };
                          handleChange(index, "customRates", newRates);
                        }} className="w-full bg-black border border-white/20 rounded-lg px-3 py-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 📍 Place */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Place</label>
              <select value={acc.place} onChange={(e) => handleChange(index, "place", e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option>Muscat</option>
                <option>Nizwa</option>
                <option>Sur</option>
                <option>Salalah</option>
                <option value="Other">Other</option>
              </select>

              {acc.place === "Other" && (
                <input type="text" placeholder="Enter place name" value={acc.otherPlace} onChange={(e) => handleChange(index, "otherPlace", e.target.value)} className="mt-2 w-full bg-black border border-white/20 rounded-lg px-3 py-2" />
              )}
            </div>

            {/* 🌙 Nights */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nights</label>
              <select value={acc.nights} onChange={(e) => handleChange(index, "nights", Number(e.target.value))} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2">
                <option value={0}>Select</option>
                {[...Array(10)].map((_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
              </select>
            </div>

            {/* 👨‍👩‍👧 Adults */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Adults</label>
              <input type="number" min="0" value={acc.adults} onChange={(e) => handleChange(index, "adults", Number(e.target.value))} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2" />
            </div>

            {/* 👶 Children */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Children</label>
              <input type="number" min="0" value={acc.children} onChange={(e) => handleChange(index, "children", Number(e.target.value))} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2" />
            </div>

            {/* 🏘 Occupancy */}
            {(Number(acc.adults) + Number(acc.children)) > 1 && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Occupancy Type</label>
                <select value={acc.occupancy} onChange={(e) => handleChange(index, "occupancy", e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2">
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Double</option>
                  <option>Triple</option>
                </select>
              </div>
            )}

            {/* 🏠 Rooms */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rooms (auto)</label>
              <input type="number" value={acc.rooms} readOnly className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2" />
            </div>

            {/* 💰 Total Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Total Price (auto)</label>
              <input type="number" value={acc.totalPrice} readOnly className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 font-semibold text-emerald-400" />
            </div>
          </div>
        </div>
      ))}

      {/* 💵 Grand Total */}
      <div className="flex justify-end items-center mt-6 border-t border-white/10 pt-4">
        <h3 className="text-lg font-semibold text-cyan-400">Grand Total: <span className="text-emerald-400 font-bold">₹ {grandTotal.toLocaleString()}</span></h3>
      </div>

      {/* 🔘 Navigation */}
      {showNav && (
        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Back</button>
          <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
}
