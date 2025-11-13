"use client";
import React from "react";
import * as XLSX from "xlsx";

export default function ExcelGenerator({ quote }) {
  const generateExcel = () => {
    if (!quote) {
      alert("No quote data found");
      return;
    }

    // Create data arrays for sheets

    // Trip Details Sheet
    const tripDetails = [
      ["Start Date", quote.basic?.startDate || "—"],
      ["End Date", quote.basic?.endDate || "—"],
      ["Nights", quote.basic?.nights || 0],
      ["PAX", quote.basic?.pax || 0],
    ];

    // Itinerary Sheet
    const itinerary = [["Day", "Description", "Activities"]];
    if (quote.itinerary?.days) {
      quote.itinerary.days.forEach(day => {
        const activities = day.activities
          ? day.activities.map(a => `${a.label} (INR ${Number(a.price || 0).toLocaleString()})`).join(", ")
          : "";
        itinerary.push([
          day.title || "—",
          day.description || "—",
          activities || "—",
        ]);
      });
    }

    // Accommodation Sheet
    const accommodation = [["Hotel", "Place", "Nights", "Rooms", "Adults", "Children", "Occupancy", "Price"]];
    if (quote.accommodation) {
      quote.accommodation.forEach(acc => {
        accommodation.push([
          acc.otherHotel || acc.hotel || "—",
          acc.otherPlace || acc.place || "—",
          acc.nights || 0,
          acc.rooms || 0,
          acc.adults || 0,
          acc.children || 0,
          acc.occupancy || "—",
          Number(acc.totalPrice || 0),
        ]);
      });
    }

    // Meals Sheet
    const meals = quote.meal?.meals
      ? [["Type", "Price"]].concat(
          quote.meal.meals.map(m => [m.type, Number(m.price || 0)])
        )
      : [["No meals configured"]];

    // Inclusions/Exclusions Sheet
    const inclusions = [["Type", "Amount"]];
    if (quote.inclusion?.inclusions) {
      quote.inclusion.inclusions.forEach(inc => {
        inclusions.push(["Inclusion", inc]);
      });
    }
    if (quote.inclusion?.visaAmount !== undefined) {
      inclusions.push(["Visa Amount", Number(quote.inclusion?.visaAmount || 0)]);
    }

    const exclusions = [["Type"]];
    if (quote.exclusion?.exclusions) {
      quote.exclusion.exclusions.forEach(ex => {
        exclusions.push([ex]);
      });
    }

    // Totals Sheet
    const totals = [
      ["Markup %", Number(quote.totals?.markupPercent || 0)],
      ["Markup Amount", Number(quote.totals?.markupAmount || 0)],
      ["Price Per Person", Number(quote.totals?.pricePerPerson || 0)],
    ];

    // Create workbook with all sheets
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tripDetails), "Trip Details");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(itinerary), "Itinerary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(accommodation), "Accommodation");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meals), "Meals");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inclusions), "Inclusions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exclusions), "Exclusions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(totals), "Totals");

    // Download the excel file
    XLSX.writeFile(
      wb,
      `booking-confirmation-${quote._id || "quote"}.xlsx`
    );
  };

  return (
    <button
      onClick={generateExcel}
      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
    >
      🟩 Download Excel
    </button>
  );
}