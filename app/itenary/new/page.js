"use client";

import { useEffect } from "react";
import useQuoteStore from "@/components/items/ItenaryStore";
import MainForm from "@/components/items/MainForm";

export default function NewItenary(){
     useEffect(() => {
          // Reset store to fresh state when creating new itinerary
          useQuoteStore.setState({
               quoteData: {
                    itinerary: {
                         selectedCategory: "oneToSix",
                         days: [{ id: 1, title: "Day 1", description: "", activities: [], open: true }],
                         totalActivityPrice: 0,
                    },
                    accommodation: [
                         {
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
                         },
                    ],
                    meal: { meals: [{ type: "Breakfast", price: 0 }], totalPrice: 0 },
                    inclusion: { inclusions: ["4 nights accommodation in 4★ hotel", "Visa", "All Transfers", "Half-day Muscat city tour – Qurum Beach, Opera House (outside), Mutrah Souq, Mutrah Fort", "Full-day Nizwa tour – Nizwa Fort, Nizwa Souq", "Coastal tour for Sur – Wadi Shab, Bimmah Sinkhole, Fins Beach"], visaAmount: 0 },
                    exclusion: { exclusions: ["Airfare", "Lunch & Dinner", "Personal expense (Tips, Laundry, Beverage, etc.)", "Early check-in / Late checkout", "GST @5% & TCS @5% as per applicable travel cost"] },
                    totals: { mainTotal: 0 },
               },
          });
     }, []);

     return (
          <>
               <h1 className="text-center text-2xl font-bold text-white mb-6">New Quote</h1>
               <MainForm />
          </>
     );
}