"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useQuoteStore from "../../../components/items/ItenaryStore";
import ItineraryPlanner from "../../../components/items/ItenaryPlanner";
import Accommodation from "../../../components/items/Accommodation";
import Meal from "../../../components/items/Meal";
import Inclusion from "../../../components/items/Inclusions";
import Exclusion from "../../../components/items/exclusion";
import Markup from "../../../components/items/Markup";
import BasicDetails from "../../../components/items/BasicDetails";
import Remark from "../../../components/items/Remark";


export default function EditQuotePage() {

  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const store = useQuoteStore();

  // Fetch quote and load into store
  useEffect(() => {
    if (!id) return;

    const fetchQuote = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/quote/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to fetch quote");
          setLoading(false);
          return;
        }

  const doc = json.data;
  // load into zustand store
  useQuoteStore.setState({ quoteData: doc, originalQuote: doc });
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // flush pending debounced updates
      const store = useQuoteStore.getState();
      if (store.flushPendingUpdate) store.flushPendingUpdate();

      // compute authoritative totals (including markup) and attach before PATCH
      const finalData = store.quoteData || {};
      if (store._computeMainTotal) {
        const computed = store._computeMainTotal(finalData);
        finalData.totals = { ...(finalData.totals || {}), ...computed };
      }

         console.log("ye final data hai new edit  ka ",finalData)

      const res = await fetch(`/api/quote/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to save");
        setSaving(false);
        return;
      }
       console.log(json)
      // update store with saved doc
      useQuoteStore.setState({ quoteData: json.data });
      setSuccess(true);
      // user-visible alert
      if (typeof window !== "undefined") alert("Quote saved successfully ✅");
         router.push("/dashboard");
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = () => {
    const orig = useQuoteStore.getState().originalQuote;
    if (!orig) return alert("No original snapshot available to rollback.");
    if (!confirm("Are you sure you want to rollback to the original saved quote? This will overwrite current edits.")) return;
    useQuoteStore.setState({ quoteData: orig });
    if (typeof window !== "undefined") alert("Rolled back to original quote.");
  };

  if (loading) return <div className="p-6 text-white">Loading quote...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">Back</Link>
          </div>
        </div>

        {success && <div className="p-3 bg-green-600 rounded">Saved ✓</div>}

  {/* Render full form components with sync enabled and hide per-step navigation */}
  <ItineraryPlanner syncWithStore={true} showNav={false} />
  <BasicDetails syncWithStore={true} showNav={false} />
  <Accommodation syncWithStore={true} showNav={false} />
  <Meal syncWithStore={true} showNav={false} />
 
  <Inclusion syncWithStore={true} showNav={false} />
  <Exclusion syncWithStore={true} showNav={false} />
  <Markup syncWithStore={true} showNav={false} />
   <Remark syncWithStore={true} />

        {/* Save All (bottom) */}
        <div className="pt-4">
          {success && <div className="p-3 bg-green-600 rounded mb-3">Saved ✓</div>}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded">
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
