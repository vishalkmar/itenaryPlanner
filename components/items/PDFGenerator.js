"use client";

import React, { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

// Main Component with Rename Functionality
export default function PDFGenerator({ quote }) {
  // For rename modal
  const [showRenameBox, setShowRenameBox] = useState(false);
  const [filename, setFilename] = useState("");
  const inputRef = useRef(null);

  // Button click to open modal
  const handleBtnClick = () => {
    setFilename(""); // blank for every open
    setShowRenameBox(true);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 200);
  };

  // PDF Generation
  const generatePDF = (name) => {
    if (!quote) {
      alert("No quote data found");
      return;
    }

    // blank -> fallback name
    const finalName = (name && name.trim()) ? name.trim() : `booking-confirmation-${quote?._id || "quote"}.pdf`;

    const htmlContent = generatePDFHTML(quote);

    const options = {
      margin: 8,
      filename: finalName,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(options).from(htmlContent).save();
    setShowRenameBox(false);
  };

  return (
    <>
      <button
        onClick={handleBtnClick}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
      >
        📄 Generate PDF
      </button>

      {showRenameBox && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[320px] text-black animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Enter PDF filename</h3>
            <input
              ref={inputRef}
              className="mb-4 w-full border border-blue-400 px-3 py-2 rounded text-black bg-white"
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Enter PDF filename"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRenameBox(false)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => generatePDF(filename)}
                className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// PDF HTML Generator stays the same (your code)
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

  // Day-wise itinerary blocks - TABLE version
  const dayTableRows = days.length > 0
    ? days.map((day) => {
      const content = day.description || "—";
      const contentHtml = content.replace(/\n/g, "<br/>");
      return `
          <tr>
            <td style="font-weight:bold; font-size:12px; background:#f4f8fd; padding:8px; border:1px solid #cce; min-width:70px;">
              ${day.title || "Day"}
            </td>
            <td style="font-size:12px; color:#222; background:#fafbfe; border:1px solid #cce; padding:8px;">
              ${contentHtml}
            </td>
          </tr>
        `;
    }).join("")
    : `
      <tr>
        <td colspan="2" style="text-align:center; padding:16px; font-size:12px; color: #999;">
          No itinerary days added
        </td>
      </tr>
    `;

  // Hotel details - loop through all accommodations with pricing
  const hotelBlocks = accommodations
    .map((accommodation, idx) => {
      return `
    <div style="margin-bottom:12px; padding:10px; border:1px solid #ccc; background:#f9f9f9;">
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

  const mealsList = (meal.meals || [])
    .filter((m) => m.type && m.type.toLowerCase() !== "breakfast")
    .map((m) => `${m.type}`)
    .join(", ");

  const mealsLunchDinner = (meal.meals || [])
    .filter((m) => m.type && ["lunch", "dinner"].includes(m.type.toLowerCase()))
    .map((m) => m.type)
    .join(", ");

  // Build inclusions list: exclude any raw 'visa' strings and replace meals with a hardcoded Breakfast entry
  const inclusionsWithMeals = [
    ...( (inclusion.inclusions || []).filter(i => !String(i || "").toLowerCase().includes("visa")) ),
  ];

  // Hardcode Breakfast as included (do not list other meals here)
  inclusionsWithMeals.push("Meals: Breakfast");

  // Add conditional visa inclusion string based on customVisaCount
  if (typeof inclusion?.customVisaCount === 'number') {
    if (inclusion.customVisaCount === basic.pax) {
      inclusionsWithMeals.push("Visa included");
    } else if (inclusion.customVisaCount > 0) {
      inclusionsWithMeals.push(`Visa included for ${inclusion.customVisaCount} person(s)`);
    }
  }

  const inclusionsList = inclusionsWithMeals
    .map((inc) => `<div style="Margin:4px 0; font-size:11px;">• ${inc}</div>`)
    .join("");

  // Exclusions list (append visa-not-included line if some pax are without visa)
  const exclusionsArr = exclusion.exclusions || [];
  // Do not list lunch/dinner in exclusions if they are included in meals
  const mealTypes = (meal?.meals || []).map(m => String(m?.type || '').toLowerCase().trim());
  const exclusionsFiltered = exclusionsArr.filter((ex) => {
    const t = String(ex || '').toLowerCase();
    if (t.includes('lunch') && mealTypes.includes('lunch')) return false;
    if (t.includes('dinner') && mealTypes.includes('dinner')) return false;
    return true;
  });
  const visaExcludedCount = (inclusion?.customVisaCount !== undefined && basic?.pax !== undefined) ? (basic.pax - (inclusion.customVisaCount || 0)) : 0;
  const exclusionsWithVisa = [...exclusionsFiltered];
  if (visaExcludedCount > 0) {
    if (visaExcludedCount === basic.pax) {
      exclusionsWithVisa.push("Visa not included");
    } else {
      exclusionsWithVisa.push(`Visa not included for ${visaExcludedCount} person(s)`);
    }
  }
  const exclusionsList = exclusionsWithVisa
    .map((ex) => `<div style="Margin:4px 0; font-size:11px;">• ${ex}</div>`)
    .join("");

  // HTML template no changes from your provided code, keep as is.
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background: white;
          font-size: 12px;
          line-height: 1.5;
        }
        .container { padding: 20px; background: white; min-height: 100vh; border: 2px solid #000; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
        .header-left { flex: 1; }
        .logo { font-size: 24px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        .header-right { text-align: right; flex: 1; }
        .title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 3px; }
        .subtitle { font-size: 10px; color: #666; line-height: 1.3; }
        .section { margin-bottom: 15px; background: white; page-break-inside: avoid; }
        .section-header { background: #f0f4f8; border-left: 4px solid #0066cc; padding: 10px 12px; margin-bottom: 10px; font-weight: bold; font-size: 13px; color: #0066cc; }
        .section-content { padding: 0 10px; }
        .info-grid { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
        .info-item { flex: 1; min-width: 140px; }
        .info-label { font-weight: bold; font-size: 11px; color: #666; margin-bottom: 3px; }
        .info-value { color: #333; font-size: 11px; }
        .hotel-card { margin-bottom: 12px; padding: 12px; border: 1px solid #ddd; background: #fafafa; border-radius: 4px; }
        .hotel-number { font-weight: bold; font-size: 12px; color: #0066cc; margin-bottom: 8px; }
        .special-offers { margin-bottom: 15px; background: white; }
        .offer-section { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
        .offer-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .offer-title { font-weight: bold; font-size: 12px; color: #0066cc; margin-bottom: 6px; }
        .offer-content { font-size: 10px; color: #555; line-height: 1.5; }
        .offer-item { margin: 3px 0 3px 12px; }
        .total-box { background: #e8f2ff; border: 2px solid #0066cc; padding: 15px; text-align: right; margin: 15px 0; border-radius: 4px; }
        .total-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .total-value { color: #0066cc; font-size: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666; line-height: 1.6; }
        .company-info { margin-bottom: 10px; }
        /* Table styles for itinerary */
        .day-table { width: 100%; border-collapse: collapse; font-size:12px; }
        .day-table th, .day-table td { border: 1px solid #0066cc; padding: 8px; background: #fafbfe; vertical-align: top; }
        .day-table th { background: #f4f8fd; font-weight: bold; color: #0066cc; }
        .day-table td.day-title-col { background: #f0f4f8; font-weight: bold; color: #333; min-width:100px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <div class="logo">
                <img src="/logo.png" alt="Company Logo" style="height:28px; object-fit:contain;" />
            </div>
          </div>
          <div class="header-right">
            <div class="title" style="font-size: 2rem; color: #07d5f5;">
    Detailed Itinerary
  </div>
            <div class="subtitle">${formatDate(basic.startDate)} - ${formatDate(basic.endDate)} ${basic.nights || 0} Nights/ ${basic.nights + 1 || 0}Days   ${basic.pax || 0} PAX</div>
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
            <table class="day-table">
              <thead>
                <tr>
                  <th style="width:20%">Day</th>
                  <th style="width:80%">Description</th>
                </tr>
              </thead>
              <tbody>
                ${dayTableRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Special Offers -->
        <div class="section">
          <div class="section-header">PACKAGE DETAILS</div>
          <div class="section-content">
            <div class="special-offers">
              <div class="offer-section">
                <div class="offer-title">INCLUSIONS</div>
                <div class="offer-content">
                  ${inclusionsList || "<div class='offer-item'>No inclusions specified</div>"}
                </div>
              </div>
              <div class="offer-section">
                <div class="offer-title">EXCLUSIONS</div>
                <div class="offer-content">
                  ${exclusionsList || "<div class='offer-item'>No exclusions specified</div>"}
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <!-- Visa Breakdown (if custom visa count) -->
        ${inclusion.customVisaCount !== undefined ? `
        <div class="section">
        
          <div class="section-content">
            ${inclusion.customVisaCount > 0 && basic.pax > inclusion.customVisaCount ? `
            <div class="info-grid">
            
              
            </div>
            <div class="info-grid" style="margin-top: 8px; border-top: 1px solid #ddd; padding-top: 8px;">
              
            </div>
            ` : `
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">All ${basic.pax} Person(s) ${inclusion.customVisaCount === basic.pax ? "With Visa" : "Without Visa"}</div>
                <div class="info-value">₹${Number(inclusion.visaAmount || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
            `}
          </div>
        </div>
        ` : ""}

        <div class="section">
          <div class="total-box">
           
            <div class="total-label" style="font-size:1rem;" >PRICE PER PERSON</div>
             ${totals.applyGstTcs ? `
            <div class="total-label" style="padding: 8px; font-size:1rem; margin: -15px -15px 10px -15px; border-radius: 4px 4px 0 0; font-size: 11px;">
              ✓  GST @5% & TCS @5% as per applicable travel cost
            </div>
            ` : ""}
            <div class="total-value">₹ ${Number(totals.pricePerPerson || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>

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