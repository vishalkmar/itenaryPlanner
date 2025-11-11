"use client";

import React, { useState, useEffect } from "react";
import useQuoteStore from "./ItenaryStore";
import Inclusion from "./Inclusions";
import Exclusion from "./Exclusion";
import Accommodation from "./Accommodation";
import Meal from "./Meal";
import ItineraryPlanner from "./ItenaryPlanner";
import FinalConsole from "./FinalConsole";


export default function MainForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const { quoteData } = useQuoteStore();

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  // ✅ Last step submit (Meal) — post full quoteData to /api/submit and handle response
  const handleSubmit = async () => {
    const finalData = useQuoteStore.getState().quoteData;
    console.log("✅ Final Combined Data (before submit):", finalData);

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("Submit failed:", json);
        setSubmitResult({ ok: false, error: json.error || json });
        return;
      }

      console.log("Submit success:", json);
      setSubmitResult({ ok: true, id: json.id, message: json.message });

      // move to final step (FinalConsole) to show result or next actions
      setStep(6);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitResult({ ok: false, error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };


  // ✅ Step management
const renderStep = () => {
  switch (step) {
    case 1:
      return <ItineraryPlanner onNext={handleNext} onBack={handleBack} />;
    case 2:
      return <Accommodation onNext={handleNext} onBack={handleBack} />;
    case 3:
      return <Meal onNext={handleNext} onBack={handleBack} />;
    case 4:
      return <Inclusion onNext={handleNext} onBack={handleBack} />;
    case 5:
      return <Exclusion onNext={handleNext} onBack={handleBack} />;
    case 6:
      return <FinalConsole onBack={handleBack} onsubmit={ handleSubmit} />;
    default:
      return null;
  }
};

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-5xl bg-black border border-white/10 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Step {step} of 5
        </h2>

        <div className="flex flex-wrap justify-between gap-4">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
