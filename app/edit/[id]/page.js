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
        useQuoteStore.setState({ quoteData: doc });
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
      const finalData = useQuoteStore.getState().quoteData;
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

      // update store with saved doc
      useQuoteStore.setState({ quoteData: json.data });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
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
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded">
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        {success && <div className="p-3 bg-green-600 rounded">Saved ✓</div>}

        {/* Render full form components with sync enabled */}
        <ItineraryPlanner syncWithStore={true} />
        <Accommodation syncWithStore={true} />
        <Meal syncWithStore={true} />
        <Inclusion syncWithStore={true} />
        <Exclusion syncWithStore={true} />
      </div>
    </div>
  );
}
