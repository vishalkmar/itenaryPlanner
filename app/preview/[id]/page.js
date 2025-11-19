"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PDFGenerator from "@/components/items/PDFGenerator";


export default function QuotePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setQuote(json.data);
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p>Loading quote preview...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-lg font-bold text-red-400 mb-2">Error Loading Quote</h2>
          <p className="text-red-300">{error}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Go Back</button>
        </div>
      </div>
    </div>
  );

  if (!quote) return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
      <p className="text-gray-400">No quote data found</p>
    </div>
  );

  const totals = quote.totals || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Quote Preview</h1>
            <p className="text-gray-400 text-sm mt-1">Quote ID: <span className="font-mono text-gray-300">{quote._id?.slice(-8)}</span></p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {quote && <PDFGenerator quote={quote} />}
            <button onClick={() => router.back()} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">← Back</button>
          </div>
        </div>

        {/* Meta Info Card */}
        <div className="mb-8 p-5 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Created Date</p>
              <p className="text-white font-semibold">{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Created Time</p>
              <p className="text-white font-semibold">{quote.createdAt ? new Date(quote.createdAt).toLocaleTimeString() : '—'}</p>
            </div>
            {quote.meta?.title && (
              <div>
                <p className="text-gray-400 text-sm">Title</p>
                <p className="text-white font-semibold truncate">{quote.meta.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Details Card */}
        {quote.basic && (
          <div className="mb-8 p-5 bg-gradient-to-r from-white/6 to-white/3 border border-white/10 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-cyan-300 mb-3">Trip Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Start Date</p>
                <p className="text-white font-semibold">{quote.basic.startDate ? new Date(quote.basic.startDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">End Date</p>
                <p className="text-white font-semibold">{quote.basic.endDate ? new Date(quote.basic.endDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Nights</p>
                <p className="text-white font-semibold">{quote.basic.nights || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">PAX</p>
                <p className="text-white font-semibold">{quote.basic.pax || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        {/* Itinerary */}
        <section className="mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10 p-4">
            <h2 className="text-xl font-bold text-cyan-400">🗓️ Itinerary</h2>
          </div>
          <div className="p-6">
            {quote.itinerary?.days && quote.itinerary.days.length > 0 ? (
              <div className="space-y-4">
                {quote.itinerary.days.map((day) => (
                  <div key={day.id} className="p-4 bg-black/30 border border-white/10 rounded-lg hover:border-cyan-500/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-cyan-300">{day.title}</h3>
                      
                    </div>
                    {day.description && <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{day.description}</p>}
                    {day.activities && day.activities.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Activities:</p>
                        {day.activities.map((a, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm">
                            <span className="text-gray-200">{a.label}</span>
                            <span className="text-emerald-400 font-semibold">OMR {Number(a.price||0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No itinerary days added</div>
            )}
            <div className="mt-4 pt-4 border-t border-white/10 text-right">
              <p className="text-gray-400">Itinerary Total</p>
              <p className="text-2xl font-bold text-emerald-400">INR {Number(quote.itinerary?.totalActivityPrice*238||0).toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Accommodation */}
        <section className="mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-white/10 p-4">
            <h2 className="text-xl font-bold text-amber-400">🏨 Accommodation</h2>
          </div>
          <div className="p-6">
            {quote.accommodation && quote.accommodation.length > 0 ? (
              <div className="space-y-4">
                {quote.accommodation.map((acc, idx) => (
                  <div key={idx} className="p-4 bg-black/30 border border-white/10 rounded-lg hover:border-amber-500/50 transition">
                    <h3 className="text-lg font-bold text-amber-300 mb-2">{acc.otherHotel ||acc.hotel || '—'}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Place</p>
                        <p className="text-white font-semibold">{acc.otherPlace || acc.place || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Nights</p>
                        <p className="text-white font-semibold">{acc.nights || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rooms</p>
                        <p className="text-white font-semibold">{acc.rooms || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Adults</p>
                        <p className="text-white font-semibold">{acc.adults || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Children</p>
                        <p className="text-white font-semibold">{acc.children || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Occupancy</p>
                        <p className="text-white font-semibold">{acc.occupancy || '—'}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-gray-400 text-xs">Acomodation Price</p>
                      <p className="text-xl font-bold text-emerald-400">INR {Number(acc.totalPrice||0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No accommodation details added</div>
            )}
          </div>
        </section>

        {/* Meals */}
        <section className="mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-b border-white/10 p-4">
            <h2 className="text-xl font-bold text-pink-400">🍽️ Meals</h2>
          </div>
          <div className="p-6">
            {quote.meal?.meals && quote.meal.meals.length > 0 ? (
              <div className="space-y-3 mb-4">
                {quote.meal.meals.map((m, i) => (
                  <div key={i} className="bg-black/30 p-4 rounded border border-white/10 hover:border-pink-500/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-pink-300">{m.type}</h4>
                      <span className="font-semibold text-emerald-400">INR {Number(m.price||0).toLocaleString()}</span>
                    </div>
                    {(m.days || m.costumePax) && (
                      <div className="grid grid-cols-3 gap-2 text-xs bg-white/5 rounded p-2 mt-2">
                        <div>
                          <p className="text-gray-400">Days</p>
                          <p className="text-gray-200 font-semibold">{m.days || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Costume Pax</p>
                          <p className="text-gray-200 font-semibold">{m.costumePax || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Calculation</p>
                          <p className="text-cyan-300 font-semibold text-xs">₹1500 × {m.costumePax || 0} × {m.days || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">No meals configured</div>
            )}
            <div className="pt-3 border-t border-white/10">
              <p className="text-gray-400 text-xs">Meals Total</p>
              <p className="text-2xl font-bold text-emerald-400">INR {Number(quote.meal?.totalPrice||0).toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Inclusions & Exclusions */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-green-400">✅ Inclusions</h3>
            </div>
            <div className="p-6">
              {quote.inclusion?.inclusions && quote.inclusion.inclusions.length > 0 ? (
                <ul className="space-y-2">
                  {quote.inclusion.inclusions
                    .filter((inc) => !String(inc || "").toLowerCase().includes("visa"))
                    .map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-200">
                        <span className="text-green-400 font-bold mt-0.5">•</span>
                        <span>{inc}</span>
                      </li>
                  ))}

                  {/* If customVisaCount > 0, show an inclusion string describing the included visas */}
                  {quote.inclusion?.customVisaCount > 0 && (
                    <li className="flex items-start gap-2 text-gray-200">
                      <span className="text-green-400 font-bold mt-0.5">•</span>
                      <span>Visa included for {quote.inclusion.customVisaCount} person(s)</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-center text-gray-400 py-4">No inclusions added</p>
              )}
              {quote.inclusion?.visaAmount !== undefined && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {quote.inclusion?.customVisaCount > 0 && quote.basic?.pax > quote.inclusion.customVisaCount && (
                    <>
                      <p className="text-gray-400 text-xs mb-2">Visa Breakdown</p>
                      <div className="text-sm space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="text-green-300">✓ {quote.inclusion.customVisaCount} person(s) with visa:</span>
                          <span className="text-green-400 font-semibold">+INR {Number(2000 * quote.inclusion.customVisaCount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-300">✗ {quote.basic.pax - quote.inclusion.customVisaCount} person(s) without visa:</span>
                          <span className="text-red-400 font-semibold">-INR {Number(1500 * (quote.basic.pax - quote.inclusion.customVisaCount)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {quote.inclusion?.customVisaCount === 0 && (
                    <p className="text-gray-400 text-xs mb-2">Visa Amount (All without visa):</p>
                  )}
                  {quote.inclusion?.customVisaCount === quote.basic?.pax && (
                    <p className="text-gray-400 text-xs mb-2">Visa Amount (All with visa):</p>
                  )}
                  <p className="text-lg font-bold text-emerald-400">INR {Number(quote.inclusion.visaAmount||0).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Exclusions */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-red-400">❌ Exclusions</h3>
            </div>
            <div className="p-6">
              {
                (quote.exclusion?.exclusions && quote.exclusion.exclusions.length > 0) || (quote.inclusion?.customVisaCount < (quote.basic?.pax || 0)) ? (
                  <ul className="space-y-2">
                    {(quote.exclusion?.exclusions || []).map((ex, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-200">
                        <span className="text-red-400 font-bold mt-0.5">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}

                    {/* If some pax are without visa, show exclusion line */}
                    {quote.inclusion?.customVisaCount < (quote.basic?.pax || 0) && (
                      <li className="flex items-start gap-2 text-gray-200">
                        <span className="text-red-400 font-bold mt-0.5">•</span>
                        <span>Visa not included for {((quote.basic?.pax || 0) - (quote.inclusion?.customVisaCount || 0))} person(s)</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-center text-gray-400 py-4">No exclusions added</p>
                )
              }
            </div>
          </div>
        </section>

        {/* Totals & Summary */}
        <section className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4">
            <h2 className="text-xl font-bold text-white">💰 Summary & Totals</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Breakdown */}
              <div className="space-y-3 bg-black/30 p-4 rounded">
                <h4 className="font-semibold text-cyan-300 mb-3">Cost Breakdown</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Accommodation</span>
                  <span className="font-semibold">INR {Number(totals.accommodationTotal||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Activity Cost</span>
                  <span className="font-semibold">INR {Number(totals.activityCostTotal||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Meals</span>
                  <span className="font-semibold">INR {Number(totals.mealTotal||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-red-400">
                  <span className="text-gray-300">Visa Amount</span>
                  <span className="font-semibold">INR {Number(totals.visaAmount||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
              </div>

              {/* Markup & Grand Total */}
              <div className="space-y-3 bg-black/30 p-4 rounded">
                <h4 className="font-semibold text-cyan-300 mb-3">Markup & Taxes</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Markup ({Number(totals.markupPercent||0).toFixed(1)}%)</span>
                  <span className="font-semibold">INR {Number(totals.markupAmount||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2">
                  <span className="text-gray-300 font-semibold">Grand Total</span>
                  <span className="font-bold text-blue-400">INR {Number(totals.grandTotal||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
                {totals.applyGstTcs && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">GST (5%)</span>
                      <span className="font-semibold">INR {Number(totals.gstAmount||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">TCS (5%)</span>
                      <span className="font-semibold">INR {Number(totals.tcsAmount||0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-500/50 rounded p-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-300">FINAL TOTAL</span>
                        <span className="font-bold text-emerald-400">INR {Number(totals.finalTotal || totals.grandTotal || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between items-center bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded p-2">
                  <span className="font-bold text-gray-100 text-sm">Price Per Person</span>
                  <span className="font-bold text-pink-400">INR {Number(totals.pricePerPerson || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Remark (optional) */}
        {quote.remark && String(quote.remark).trim() && (
          <section className="my-8"> 
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 rounded-t px-4 py-2">
              <h3 className="text-lg font-bold text-yellow-700">📝 Remark</h3>
            </div>
            <div className=" bg-to-blue-500 border  rounded-b px-4 py-4">
              <p className="text-white-900 whitespace-pre-wrap text-base">{quote.remark}</p>
            </div>
          </section>
        )}
      </div>
    
    </div>
  );
}
