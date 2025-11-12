"use client";

import React from "react";
import html2pdf from "html2pdf.js";

export default function PDFGenerator({ quote }) {
  const generatePDF = () => {
    if (!quote) {
      alert("No quote data found");
      return;
    }

    // Create HTML content for PDF
    const htmlContent = generatePDFHTML(quote);

    // PDF generation options
    const options = {
      margin: 8,
      filename: `booking-confirmation-${quote._id || "quote"}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    // Generate and download PDF
    html2pdf().set(options).from(htmlContent).save();
  };

  return (
    <button
      onClick={generatePDF}
      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
    >
      📄 Generate PDF
    </button>
  );
}

// Helper: Generate HTML template for PDF
function generatePDFHTML(quote) {
  const basic = quote.basic || {};
  const itinerary = quote.itinerary || {};
  const accommodation = quote.accommodation?.[0] || {};
  const meal = quote.meal || {};
  const inclusion = quote.inclusion || {};
  const exclusion = quote.exclusion || {};
  const totals = quote.totals || {};
  const days = itinerary.days || [];

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Day-wise itinerary blocks - compact, each day as a small block
  const dayBlocks = days
    .map((day) => {
      let content = day.description || "";
      if (day.activities && day.activities.length > 0) {
        const activityLines = day.activities.map((a) => a.label || a.value).join("\n");
        content = content ? `${content}\n${activityLines}` : activityLines;
      }
      const contentHtml = (content || "—").replace(/\n/g, "<br/>");
      return `
      <div class="day-item" style="margin-bottom:8px;">
        <div style="font-weight:bold; font-size:11px; background:#f5f5f5; padding:6px; display:inline-block; min-width:70px;">${day.title || "Day"}</div>
        <div style="display:inline-block; vertical-align:top; margin-left:8px; font-size:11px; max-width:78%;">${contentHtml}</div>
      </div>
    `;
    })
    .join("");

  // Hotel details - simplified single-column rows (no table needed)
  const hotelSimple = `
    <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:11px;">
      <div style="min-width:120px; font-weight:bold;">Hotel:</div>
      <div style="flex:1">${accommodation.otherHotel || accommodation.hotel || "—"}</div>
      <div style="min-width:120px; font-weight:bold;">Place:</div>
      <div style="flex:1">${accommodation.otherPlace || accommodation.place || "—"}</div>
      <div style="min-width:120px; font-weight:bold;">Rooms:</div>
      <div style="flex:1">${accommodation.rooms || 0}</div>
      <div style="min-width:120px; font-weight:bold;">Adults:</div>
      <div style="flex:1">${accommodation.adults || 0}</div>
      <div style="min-width:120px; font-weight:bold;">Children:</div>
      <div style="flex:1">${accommodation.children || 0}</div>
      <div style="min-width:120px; font-weight:bold;">Nights:</div>
      <div style="flex:1">${basic.nights || 0}</div>
    </div>
  `;

  // Meals list for inclusions (show non-breakfast meals)
  const mealsList = (meal.meals || [])
    .filter((m) => m.type && m.type.toLowerCase() !== "breakfast")
    .map((m) => `${m.type}`)
    .join(", ");

  // Inclusions with meals (breakfast always listed in inclusions if present)
  const inclusionsWithMeals = [
    ...(inclusion.inclusions || []),
    ...(mealsList ? [`Meals: ${mealsList}`] : []),
  ];

  const inclusionsList = inclusionsWithMeals
    .map((inc) => `<div style="margin:4px 0; font-size:11px;">• ${inc}</div>`)
    .join("");

  // HTML template
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background: white;
          font-size: 12px;
        }
        .container {
          padding: 15px;
          background: white;
          min-height: 100vh;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        .title {
          text-align: right;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        .title-accent {
          color: #0099cc;
        }
        .subtitle {
          text-align: right;
          font-size: 10px;
          color: #666;
        }
        .section {
          margin-bottom: 12px;
          border: 1px solid #333;
          padding: 10px;
          background: white;
          page-break-inside: avoid;
        }
        .section-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 6px;
          color: #333;
          border-bottom: 1px solid #333;
          padding-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        table td {
          padding: 5px;
          border: 1px solid #ddd;
        }
        table td:first-child {
          font-weight: bold;
          width: 30%;
          background: #f5f5f5;
        }
        .day-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        .day-table td {
          border: 1px solid #333;
          padding: 6px;
          font-size: 10px;
        }
        .day-item { page-break-inside: avoid; }
        .special-offers {
          margin-bottom: 12px;
          border: 1px solid #333;
          padding: 0;
        }
        .offer-section {
          border-bottom: 1px solid #333;
          padding: 8px;
        }
        .offer-section:last-child {
          border-bottom: none;
        }
        .offer-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 4px;
          color: #333;
        }
        .offer-content {
          font-size: 10px;
          color: #333;
          line-height: 1.4;
        }
        .offer-content div {
          margin: 2px 0 2px 15px;
        }
        .grand-total {
          background: #f0f0f0;
          border: 2px solid #333;
          padding: 10px;
          text-align: right;
          font-size: 14px;
          font-weight: bold;
          margin: 12px 0;
        }
        .grand-total-value {
          color: #333;
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #333;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Traveon</div>
          <div>
            <div class="title">Booking <span class="title-accent">Confirmation</span></div>
            <div class="subtitle">Please present either an electronic or paper copy of your booking confirmation upon check-in.</div>
          </div>
        </div>

        <!-- Itinerary Details (compact) -->
        <div class="section">
          <div class="section-title">Itinerary Details</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:11px;">
            <div style="min-width:120px; font-weight:bold;">Arrival:</div>
            <div style="flex:1">${formatDate(basic.startDate)}</div>
            <div style="min-width:120px; font-weight:bold;">Departure:</div>
            <div style="flex:1">${formatDate(basic.endDate)}</div>
            <div style="min-width:120px; font-weight:bold;">Nights:</div>
            <div style="flex:1">${basic.nights || 0}</div>
            <div style="min-width:120px; font-weight:bold;">PAX (Persons):</div>
            <div style="flex:1">${basic.pax || 0}</div>
          </div>
        </div>

        <!-- Hotel Information (compact) -->
        <div class="section">
          <div class="section-title">Hotel Information</div>
          ${hotelSimple}
        </div>

        <!-- Day-wise Itinerary (compact blocks) -->
        <div class="section">
          <div class="section-title">Itinerary</div>
          <div style="margin-top:6px;">${dayBlocks}</div>
        </div>

        <!-- Traveon Special Offers -->
        <div class="special-offers">
          <!-- Inclusions -->
          <div class="offer-section">
            <div class="offer-title">Inclusions</div>
            <div class="offer-content">
              ${inclusionsList || "<div>No inclusions specified</div>"}
            </div>
          </div>

          <!-- Exclusions -->
          <div class="offer-section">
            <div class="offer-title">Exclusions</div>
            <div class="offer-content">
              ${
                (exclusion.exclusions || [])
                  .map((exc) => `<div>• ${exc}</div>`)
                  .join("") || "<div>No exclusions specified</div>"
              }
            </div>
          </div>
        </div>

        <!-- Booking / Payable information -->
        <div class="section">
          <div style="font-size:11px; line-height:1.4;">
            <strong>Booked and Payable By:</strong>
            <div>Traveon Venture LLP, 128A D-MAIL, New Delhi, India 110034</div>
          </div>
        </div>

        <!-- Grand Total -->
        <div class="grand-total">
          Grand Total: <span class="grand-total-value">₹ ${Number(totals.grandTotal || totals.mainTotal || 0).toLocaleString("en-IN")}</span>
        </div>

        <!-- Remarks -->
        <div class="section">
          <div class="section-title">Remarks</div>
          <div style="font-size: 10px; line-height: 1.4; margin-top: 4px;">
            Included: Taxes and fees<br/>
            All special requests are subject to availability upon arrival
          </div>
        </div>

        <!-- Notes -->
        <div class="section" style="background: white;">
          <div class="section-title">Important Notes</div>
          <div style="font-size: 10px; line-height: 1.4; margin-top: 4px;">
            <div style="margin: 2px 0;">• At check-in, you must present a valid photo ID with your address confirming the same name as the lead guest on the booking.</div>
            <div style="margin: 2px 0;">• All rooms are guaranteed on the day of arrival. In case of no-show, your room(s) will be released and you will be subject to the terms and conditions of the Cancellation/No-Show policy.</div>
            <div style="margin: 2px 0;">• The total price for this booking does not include mini-bar items, telephone usage, laundry service, etc.</div>
            <div style="margin: 2px 0;">• Upon arrival, if you have any questions, please verify with the property.</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <strong>Call our Customer Service Center 24/7:</strong><br/>
          Customer Support: +91 9540111207, +91 9540111307<br/>
          (Long distance charge may apply)
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
