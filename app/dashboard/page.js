"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Eye } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Fetch all quotes on mount
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/quotes");
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to fetch");
          setLoading(false);
          return;
        }

        setQuotes(json.data || []);
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  // Delete quote
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/quote/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        alert("Delete failed: " + (json.error || "Unknown error"));
        setDeleting(null);
        return;
      }

      // Remove from local state
      setQuotes((prev) => prev.filter((q) => q._id !== id));
      setDeleting(null);
    } catch (err) {
      alert("Delete error: " + String(err));
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Quotes Dashboard</h1>
          <Link
            href="/itenary/new"
            className="bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-2 rounded-lg text-white font-semibold"
          >
            + New Quote
          </Link>
        </div>

        {/* Loading & Error States */}
        {loading && <div className="text-center py-8">Loading quotes...</div>}
        {error && (
          <div className="text-center py-8 text-red-400">Error: {error}</div>
        )}

        {/* Responsive Table */}
        {!loading && !error && quotes.length > 0 && (
          <div className="overflow-x-auto border border-white/10 rounded-lg">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-white/10 border-b border-white/10">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Hotel</th>
                  <th className="p-3 text-left">Place</th>
                  <th className="p-3 text-left">Grand Total (₹)</th>
                  <th className="p-3 text-left hidden lg:table-cell">Created</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote._id}
                    className="border-b border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-3 font-mono text-sm">{quote._id}</td>
                    <td className="p-3 font-medium truncate max-w-xs">
                      {quote.accommodation && quote.accommodation.length
                        ? (quote.accommodation[0].hotel || quote.accommodation[0].otherHotel || "-")
                        : "-"}
                    </td>
                    <td className="p-3 truncate max-w-xs">{quote.accommodation && quote.accommodation.length ? (quote.accommodation[0].place || quote.accommodation[0].otherPlace || "-") : "-"}</td>
                    <td className="p-3 font-semibold text-emerald-400">{quote.totals?.mainTotal?.toLocaleString() ?? "—"}</td>
                    <td className="p-3 text-xs hidden lg:table-cell text-gray-400">{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      {/* View */}
                      <Link
                        href={`/preview/${quote._id}`}
                        title="View"
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                      >
                        <Eye size={16} />
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/edit/${quote._id}`}
                        title="Edit"
                        className="p-1.5 bg-amber-600 hover:bg-amber-700 rounded text-white"
                      >
                        <Edit2 size={16} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(quote._id)}
                        disabled={deleting === quote._id}
                        title="Delete"
                        className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && quotes.length === 0 && (
          <div className="text-center py-12 border border-white/10 rounded-lg">
            <p className="text-gray-400 mb-4">No quotes yet</p>
            <Link
              href="/itenary/new"
              className="inline-block bg-gradient-to-br from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-2 rounded-lg text-white font-semibold"
            >
              Create Your First Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}