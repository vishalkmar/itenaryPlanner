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
  const accommodations = quote.accommodation || [];
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

  // Hotel details - loop through all accommodations with pricing
  const hotelBlocks = accommodations
    .map((accommodation, idx) => {
      return `
    <div style="margin-bottom:12px; padding:10px; border:1px solid #ccc; background:#f9f9f9;">
      <div style="font-weight:bold; font-size:12px; margin-bottom:8px; color:#333;">Hotel ${idx + 1}</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:11px; line-height:1.6;">
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Hotel Name:</div>
          <div style="color:#555;">${accommodation.otherHotel || accommodation.hotel || "—"}</div>
        </div>
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Location:</div>
          <div style="color:#555;">${accommodation.otherPlace || accommodation.place || "—"}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:11px; line-height:1.6; margin-top:6px;">
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Rooms:</div>
          <div style="color:#555;">${accommodation.rooms || 0}</div>
        </div>
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Adults:</div>
          <div style="color:#555;">${accommodation.adults || 0}</div>
        </div>
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Children:</div>
          <div style="color:#555;">${accommodation.children || 0}</div>
        </div>
        <div style="flex:1; min-width:150px;">
          <div style="min-width:100px; font-weight:bold;">Nights:</div>
          <div style="color:#555;">${accommodation.nights || 0}</div>
        </div>
      </div>
     
    </div>
    `;
    })
    .join("");

  const hotelSimple = hotelBlocks || `<div style="font-size:11px; padding:10px; color:#666;">No hotels added</div>`;

  // Meals list for inclusions (show non-breakfast meals)
  const mealsList = (meal.meals || [])
    .filter((m) => m.type && m.type.toLowerCase() !== "breakfast")
    .map((m) => `${m.type}`)
    .join(", ");

  // Show Lunch/Dinner specifically (if present) in a dedicated meals section
  const mealsLunchDinner = (meal.meals || [])
    .filter((m) => m.type && ["lunch", "dinner"].includes(m.type.toLowerCase()))
    .map((m) => m.type)
    .join(", ");

  // Inclusions with meals (breakfast always listed in inclusions if present)
  const inclusionsWithMeals = [
    ...(inclusion.inclusions || []),
    ...(mealsList ? [`Meals: ${mealsList}`] : []),
  ];

  const inclusionsList = inclusionsWithMeals
    .map((inc) => `<div style="Margin:4px 0; font-size:11px;">• ${inc}</div>`)
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background: white;
          font-size: 12px;
          line-height: 1.5;
        }
        .container {
          padding: 20px;
          background: white;
          min-height: 100vh;
          border: 2px solid #000; /* outer black border as requested */
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 15px;
        }
        .header-left {
          flex: 1;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 5px;
        }
        .header-right {
          text-align: right;
          flex: 1;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        .subtitle {
          font-size: 10px;
          color: #666;
          line-height: 1.3;
        }
        .section {
          margin-bottom: 15px;
          background: white;
          page-break-inside: avoid;
        }
        .section-header {
          background: #f0f4f8;
          border-left: 4px solid #0066cc;
          padding: 10px 12px;
          margin-bottom: 10px;
          font-weight: bold;
          font-size: 13px;
          color: #0066cc;
        }
        .section-content {
          padding: 0 10px;
        }
        .info-grid {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .info-item {
          flex: 1;
          min-width: 140px;
        }
        .info-label {
          font-weight: bold;
          font-size: 11px;
          color: #666;
          margin-bottom: 3px;
        }
        .info-value {
          color: #333;
          font-size: 11px;
        }
        .hotel-card {
          margin-bottom: 12px;
          padding: 12px;
          border: 1px solid #ddd;
          background: #fafafa;
          border-radius: 4px;
        }
        .hotel-number {
          font-weight: bold;
          font-size: 12px;
          color: #0066cc;
          margin-bottom: 8px;
        }
        .day-block {
          margin-bottom: 10px;
          padding: 8px;
          background: #f9f9f9;
          border-left: 3px solid #0066cc;
        }
        .day-title {
          font-weight: bold;
          font-size: 11px;
          color: #0066cc;
          margin-bottom: 4px;
        }
        .day-content {
          font-size: 10px;
          color: #555;
          line-height: 1.4;
        }
        .special-offers {
          margin-bottom: 15px;
          background: white;
        }
        .offer-section {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        .offer-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .offer-title {
          font-weight: bold;
          font-size: 12px;
          color: #0066cc;
          margin-bottom: 6px;
        }
        .offer-content {
          font-size: 10px;
          color: #555;
          line-height: 1.5;
        }
        .offer-item {
          margin: 3px 0 3px 12px;
        }
        .total-box {
          background: #e8f2ff;
          border: 2px solid #0066cc;
          padding: 15px;
          text-align: right;
          margin: 15px 0;
          border-radius: 4px;
        }
        .total-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .total-value {
          color: #0066cc;
          font-size: 20px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
          line-height: 1.6;
        }
        .company-info {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <div class="logo">
                <!-- Use the public folder image: /logo.png -->
                <img src="/logo.png" alt="Company Logo" style="height:28px; object-fit:contain;" />
            </div>
          </div>
          <div class="header-right">
            <div class="title">Detailed Itinerary</div>
            <div class="subtitle">${formatDate(basic.startDate)} - ${formatDate(basic.endDate)} ${basic.nights || 0} ${basic.pax || 0}</div>
          </div>
        </div>

        <!-- Trip Details -->
        <div class="section">
          <div class="section-header">TRIP DETAILS</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Arrival Date</div>
                <div class="info-value">${formatDate(basic.startDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Departure Date</div>
                <div class="info-value">${formatDate(basic.endDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Number of Nights</div>
                <div class="info-value">${basic.nights || 0}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Persons (PAX)</div>
                <div class="info-value">${basic.pax || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hotels -->
        <div class="section">
          <div class="section-header">ACCOMMODATION DETAILS</div>
          <div class="section-content">
            ${hotelSimple}
          </div>
        </div>

        <!-- Itinerary -->
        <div class="section">
          <div class="section-header">DAILY ITINERARY</div>
          <div class="section-content">
            ${dayBlocks}
          </div>
        </div>

        <!-- Special Offers -->
        <div class="section">
          <div class="section-header">PACKAGE DETAILS</div>
          <div class="section-content">
            <div class="special-offers">
              <!-- Inclusions -->
              <div class="offer-section">
                <div class="offer-title">INCLUSIONS</div>
                <div class="offer-content">
                  ${inclusionsList || "<div class='offer-item'>No inclusions specified</div>"}
                </div>
              </div>

              <!-- Exclusions -->
              <div class="offer-section">
                <div class="offer-title">EXCLUSIONS</div>
                <div class="offer-content">
                  ${
                    (exclusion.exclusions || [])
                      .map((exc) => `<div class='offer-item'>• ${exc}</div>`)
                      .join("") || "<div class='offer-item'>No exclusions specified</div>"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Meals (only show if Lunch/Dinner present) -->
        ${mealsLunchDinner ? `
        <div class="section">
          <div class="section-header">MEALS</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Included Meals</div>
                <div class="info-value">${mealsLunchDinner}</div>
              </div>
            </div>
          </div>
        </div>
        ` : ""}

        <!-- Price Summary -->
        <div class="section">
          <div class="total-box">
            <div class="total-label">PRICE PER PERSON</div>
            <div class="total-value">₹ ${Number(totals.pricePerPerson || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <!-- Booking Information -->
        <div class="section">
          <div class="section-header">BOOKING INFORMATION</div>
          <div class="section-content">
            <div class="company-info">
              <strong>Booked and Payable By:</strong>
              <div style="margin-top:4px; color:#555; font-size:11px;">
                Traveon Venture LLP<br/>
                128A D-MAIL, New Delhi<br/>
                India 110034
              </div>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="section">
          <div class="section-header">IMPORTANT TERMS & CONDITIONS</div>
          <div class="section-content" style="font-size:10px; line-height:1.5; color:#555;">
            <div style="margin-bottom:6px;">• At check-in, you must present a valid photo ID with your address confirming the same name as the lead guest on the booking.</div>
            <div style="margin-bottom:6px;">• All rooms are guaranteed on the day of arrival. In case of no-show, your room(s) will be released and you will be subject to the terms and conditions of the Cancellation/No-Show policy.</div>
            <div style="margin-bottom:6px;">• The total price for this booking does not include mini-bar items, telephone usage, laundry service, etc.</div>
            <div style="margin-bottom:6px;">• Upon arrival, if you have any questions, please verify with the property.</div>
            <div>• Special requests are subject to availability upon arrival.</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="font-weight:bold; margin-bottom:5px;">CUSTOMER SERVICE</div>
          <div>Call us 24/7: +91 9540111207, +91 9540111307</div>
          <div style="margin-top:8px; font-size:9px; color:#999;">(Long distance charge may apply)</div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}