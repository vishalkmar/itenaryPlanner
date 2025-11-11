"use client";

import { useEffect } from "react";
import useQuoteStore from "@/components/items/ItenaryStore";
import ItineraryPlanner from "@/components/items/ItenaryPlanner";
import Accommodation from "@/components/items/Accommodation";
import Meal from "@/components/items/Meal";
import Inclusion from "@/components/items/Inclusions";
import Exclusion from "@/components/items/exclusion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewItenary(){
     const router = useRouter();
     const [submitting, setSubmitting] = useState(false);
     const [success, setSuccess] = useState(false);

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

     const handleSubmit = async () => {
          setSubmitting(true);
          try {
               // flush any pending debounced updates in the store
               if (useQuoteStore.getState().flushPendingUpdate) {
                    useQuoteStore.getState().flushPendingUpdate();
               }

               const finalData = useQuoteStore.getState().quoteData;
               const res = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
               });
               const json = await res.json();
               if (!res.ok) {
                    alert('Save failed: ' + (json.error || 'Unknown'));
                    setSubmitting(false);
                    return;
               }
               setSuccess(true);
               if (typeof window !== 'undefined') alert('Quote created successfully ✅');
               // Optional: redirect to dashboard or preview
               router.push('/dashboard');
          } catch (err) {
               alert(String(err));
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <>
               <h1 className="text-center text-2xl font-bold text-white mb-6">New Quote</h1>

               {/* Single-page editor (all components visible) */}
               <div className="max-w-6xl mx-auto space-y-6">
                    <ItineraryPlanner syncWithStore={true} showNav={false} />
                    <Accommodation syncWithStore={true} showNav={false} />
                    <Meal syncWithStore={true} showNav={false} />
                    <Inclusion syncWithStore={true} showNav={false} />
                    <Exclusion syncWithStore={true} showNav={false} />

                    {/* Submit button at bottom */}
                    <div className="flex justify-end pt-4">
                         {success && <div className="p-3 bg-green-600 rounded mr-3">Saved ✓</div>}
                         <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded">
                              {submitting ? 'Saving...' : 'Submit Quote'}
                         </button>
                    </div>
               </div>
          </>
     );
}