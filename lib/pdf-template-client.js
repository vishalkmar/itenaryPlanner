import { AGENT_DEFAULT } from "@/lib/constants";
import { BRANDS } from "@/lib/constants";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");
const money = (v, cur = "INR") => `${cur} ${Number(v || 0).toFixed(2)}`;

function splitHotelAndLocation(hotelProperty) {
  if (!hotelProperty) return { name: "", location: "" };
  const m = hotelProperty.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (m) return { name: m[1].trim(), location: m[2].trim() };
  return { name: hotelProperty, location: "" };
}

function buildNotesHtml(quote) {
  const md = (quote.notesCustom || "").trim();
  if (!md) return "";
  const html = DOMPurify.sanitize(marked.parse(md));
  return `<div class="md">${html}</div>`;
}

export function quoteToHtml(quote) {
  const agent = {
    name: quote.agentName || AGENT_DEFAULT.name,
    phone: quote.agentPhone || AGENT_DEFAULT.phone,
    email: quote.agentEmail || AGENT_DEFAULT.email,
    subject: quote.agentSubject || AGENT_DEFAULT.subject,
  };

  const qcur = quote.currency || "INR";
  const subtotal = Number(quote.subtotal || 0);
  const discount = Number(quote.discount || 0);
 const visaPrice = Number(quote.visaPrice || 0);
const grand = Math.max(0, subtotal - discount + visaPrice);
const advanceAmount = Number(quote.advanceAmount || 0);
const finalAmount = Math.max(0, grand - advanceAmount);


  const brand = BRANDS[quote.footerBrand] || BRANDS.holidays_seychelle;
  const hidePricingColumn = !!quote.hidePricingColumn;
  const hideGrandTotal = !!quote.hideGrandTotal;

  const allItems = (quote.items || []).slice();

  function ts(v) {
    try {
      return v ? new Date(v).getTime() : 0;
    } catch {
      return 0;
    }
  }

  // ========================================
  // ACCOMMODATION SECTION
  // ========================================
  const acc = allItems
    .filter((it) => it.type === "accommodation")
    .map((it) => {
      const cur = it.currency || qcur;
      const total =
        it.totalPrice ??
        Number(it.basePrice || 0) * (1 + Number(it.markupPercent || 0) / 100);

      const { name: hotelName, location } = splitHotelAndLocation(
        it.hotelProperty || ""
      );

      const rn = it.roomCount ? `${it.roomCount} x` : "";

      // Hide 0 guests/adults/children
      const pax = [
        it.adults > 0 ? `${it.adults} Adults` : null,
        it.children > 0 ? `${it.children} Children` : null,
        it.guests > 0 ? `${it.guests} Guests` : null,
      ]
        .filter(Boolean)
        .join(", ");

      // Country + Destination chain
      const geoBits = [];
      if (it.country) {
        if (it.country === "other" && it.customCountry)
          geoBits.push(it.customCountry.trim());
        else
          geoBits.push(
            it.country.charAt(0).toUpperCase() + it.country.slice(1)
          );
      }
      if (it.country === "seychelles") {
        if (it.island === "other" && it.customIsland)
          geoBits.push(it.customIsland.trim());
        else if (it.island) geoBits.push(it.island.replaceAll("_", " "));
      } else {
        if (it.destination === "other" && it.customDestination)
          geoBits.push(it.customDestination.trim());
        else if (it.destination)
          geoBits.push(it.destination.replaceAll("_", " "));
      }
      const geoLine = geoBits.join(" — ");

      // ✅ Ensure serviceType prints even if empty string
      const serviceType = it.serviceType?.trim()
        ? `[${it.serviceType}]`
        : it.transferType?.trim()
        ? `[${it.transferType}]`
        : "";

      const details = [rn, it.roomDetails, pax, serviceType]
        .filter(Boolean)
        .join(" ");

      const date = `${fmt(it.checkIn)} - ${fmt(it.checkOut)}`;
      const cancellationNote = it.cancellationBefore
        ? `Free Cancellation before ${fmt(it.cancellationBefore)}`
        : "";

      return {
        _sort: ts(it.checkIn || it.startDate),
        name: escapeHtml(hotelName || "Hotel"),
        subline: escapeHtml([location, geoLine].filter(Boolean).join(" — ")),
        details: escapeHtml(details),
        cancel: escapeHtml(cancellationNote),
        date: escapeHtml(date),
        price: escapeHtml(money(total, cur)),
      };
    })
    .sort((a, b) => a._sort - b._sort);

  // ========================================
  // TRANSFERS SECTION
  // ========================================
  const trf = allItems
    .filter((it) => it.type === "transfer")
    .map((it) => {
      const cur = it.currency || qcur;
      const total =
        it.totalPrice ??
        Number(it.basePrice || 0) * (1 + Number(it.markupPercent || 0) / 100);
      const cancellationNote = it.cancellationBefore
        ? `Free cancellation before ${fmt(it.cancellationBefore)}`
        : "";

      let name = "",
        details = "",
        date = "",
        subline = "",
        sortTs = ts(it.startDate);

      const label =
        it.transferType === "ferry"
          ? "Ferry Transfer"
          : it.transferType === "intercity"
          ? "Intercity Transfer"
          : it.transferType === "salalah_muscat_bus"
          ? "Salalah → Muscat (Luxury Bus)"
          : it.transferType === "muscat_salalah_bus"
          ? "Muscat → Salalah (Luxury Bus)"
          : "Airport Transfer";

      name = `${label}${it.details ? " - " + it.details : ""}`.trim();
      date = fmt(it.startDate);

      // ✅ Always print Private/SIC etc.
      const serviceType = it.serviceType?.trim()
        ? `[${it.serviceType}]`
        : it.transferType?.trim()
        ? `[${it.transferType}]`
        : "";

      details = [
        `Pickup ${it.from || ""}${it.to ? " to " + it.to : ""}`,
        serviceType,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        _sort: sortTs,
        name: escapeHtml(name || "Transfer"),
        subline: subline || "",
        details: escapeHtml(details),
        cancel: cancellationNote ? escapeHtml(cancellationNote) : "",
        date: escapeHtml(date),
        price: escapeHtml(money(total, cur)),
      };
    })

    .sort((a, b) => a._sort - b._sort);

  // ========================================
  // ACTIVITIES SECTION
  // ========================================
  const act = allItems
    .filter((it) => it.type === "activity")
    .map((it) => {
      const cur = it.currency || quote.currency || "INR";
      const total =
        it.totalPrice ??
        Number(it.basePrice || 0) * (1 + Number(it.markupPercent || 0) / 100);

     const country =
  it.customCountry?.trim()
    ? it.customCountry.trim()
    : it.country
    ? it.country.charAt(0).toUpperCase() + it.country.slice(1)
    : "";

const destination =
  it.customDestination?.trim()
    ? it.customDestination.trim()
    : it.destination
    ? it.destination.charAt(0).toUpperCase() + it.destination.slice(1).replaceAll("_", " ")
    : "";

const locationInfo = [country, destination].filter(Boolean).join(" — ");


      const serviceType = it.serviceType?.trim()
        ? `[${it.serviceType}]`
        : it.transferType?.trim()
        ? `[${it.transferType}]`
        : "";

      const details = [locationInfo, it.description || "", serviceType]
        .filter(Boolean)
        .join(" • ");

      return {
        _sort: ts(it.startDate),
      name:
  (it.itemTitle && it.itemTitle.toLowerCase() !== "other"
    ? it.itemTitle
    : it.customActivity || it.otherActivity || "Activity"),

        details: escapeHtml(details),
        date: it.startDate ? new Date(it.startDate).toLocaleDateString() : "",
        price: money(total, cur),
      };
    })
    .sort((a, b) => a._sort - b._sort);

  // ========================================
  // EXCURSIONS SECTION
  // ========================================
  const exc = allItems
    .filter((it) => it.type === "excursion")
    .map((it) => {
      const cur = it.currency || qcur;
      const total =
        it.totalPrice ??
        Number(it.basePrice || 0) * (1 + Number(it.markupPercent || 0) / 100);
      const name =
        it.place?.trim() ||
        it.itemTitle?.trim() ||
        it.customActivity?.trim() ||
        "Excursion";
      const transferText = it.transfer
        ? `Transfer: ${it.transfer}`
        : it.serviceType
        ? `Service Type: ${it.serviceType}`
        : it.transferType
        ? `Transfer Type: ${it.transferType}`
        : "—";
      const date = fmt(it.date || it.startDate);

      return {
        _sort: ts(it.date || it.startDate),
        name: escapeHtml(name),
        details: escapeHtml(transferText),
        date: escapeHtml(date),
        price: escapeHtml(money(total, cur)),
      };
    })
    .sort((a, b) => a._sort - b._sort);

  // ========================================
  // FINAL HTML (same layout)
  // ========================================
  const notesHtml = buildNotesHtml(quote);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Travel Quotation</title>
  <style>
    :root {
      --text:#111827; --muted:#6b7280; --line:#e5e7eb; --accent:#0ea5e9; --bg:#ffffff; --bg-soft:#f8fafc;
    }
    * { box-sizing:border-box; }
    body {
      margin:0; padding:0;
      font:12px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color:var(--text); background:var(--bg);
    }
    .page { padding:18px 14px; } /* compact page padding */
    .header { padding:4px 0; border-bottom:1px solid var(--line); }
    .header h1 { margin:0; font-size:18px; color:var(--accent); letter-spacing:.2px; }
    .header .tag { margin-top:1px; font-size:11px; color:var(--muted); }

    .section { margin-top:8px; } /* compact section spacing */
    .title { font-weight:700; margin-bottom:3px; }
    .bookingTitle { font-size:13px; font-weight:700; margin:6px 0 4px; }

    .muted { color:var(--muted); }

    /* Agent details as compact table so each row stays together with minimal spacing */
    .kvtable { width:100%; border-collapse:collapse; }
    .kvtable td { padding:2px 0; vertical-align:top; }
    .kvtable td:first-child { color:var(--muted); width:160px; }

    .table {
      width:100%; border-collapse:separate; border-spacing:0;
      border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#fff;
    }
    .table thead th {
      text-align:left; color:#111827; font-weight:700;
      background:#f3f4f6; padding:7px 9px; font-size:12px; border-bottom:1px solid var(--line);
    }
    .table th:nth-child(1), .table td:nth-child(1) { width:36%; }
    .table th:nth-child(2), .table td:nth-child(2) { width:36%; }
    .table th:nth-child(3), .table td:nth-child(3) { width:14%; text-align:center; }
    .table th:nth-child(4), .table td:nth-child(4) { width:14%; text-align:right; }
    .table tbody td { padding:7px 9px; border-bottom:1px solid var(--line); vertical-align:top; }
    .table tbody tr:nth-child(odd) td { background:#fcfdff; }

    .subline { display:block; font-size:10px; color:var(--muted); margin-top:1px; }
    .cancel-note { margin-top:2px; font-size:10px; color:var(--muted); }

    .summary {
      width:100%; margin-top:12px; display:grid; grid-template-columns:1fr 170px; gap:3px;
    }
    .summary .label { color:var(--muted); }
    .summary .value { text-align:right; }

    .notes { border:1px dashed var(--line); background:#fff; border-radius:10px; padding:7px 9px; }
    .notes ul { margin:5px 0 0 18px; padding:0; }
    .notes li { margin:3px 0; }

    .footer {
      margin-top:8px; display:flex; align-items:center; justify-content:space-between; gap:8px; color:var(--muted);
    }
    .footer img { height:24px; width:auto; object-fit:contain; }

    /* --- Page & print tuning --- */
    @page { size: A4; margin: 12mm 10mm; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* IMPORTANT: allow sections to flow; don't force whole sections to next page */
    /* (Do NOT apply break-inside:avoid to .section or .table containers) */

    /* Keep *lines* together, not whole sections */
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }        /* don't split a row */
    .notes .md li { break-inside: avoid; }                       /* don't split a bullet item */
    p, li { widows: 2; orphans: 2; }                             /* avoid single orphan/widow lines */

    /* Markdown area styling (compact) */
    .notes .md { word-break: break-word; overflow-wrap: anywhere; }
    .notes .md h1, .notes .md h2, .notes .md h3 { margin:6px 0 4px; font-weight:700; color:#111827; }
    .notes .md h4, .notes .md h5, .notes .md h6 { margin:4px 0 2px; font-weight:600; color:#111827; }
    .notes .md p { margin:4px 0; }
    .notes .md ul, .notes .md ol { margin:4px 0 0 18px; padding:0; }
    .notes .md li { margin:3px 0; }
    .notes .md table { width:100%; border-collapse:collapse; margin:5px 0; page-break-inside:auto; }
    .notes .md th, .notes .md td { border:1px solid var(--line); padding:5px 6px; text-align:left; }
    .notes .md tr { break-inside: avoid; }
    .notes .md blockquote, .notes .md img { break-inside: avoid; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Tours and Travel Quotation</h1>
      <div class="tag">Quotation for your travel itinerary</div>
    </div>

    <!-- Agent Details (compact table; rows stay together) -->
    <div class="section">
      <div class="title">Agent Details</div>
      <table class="kvtable">
        <tbody>
          <tr><td>Contact Person</td><td>${escapeHtml(agent.name)}</td></tr>
          <tr><td>Mobile Number</td><td>${escapeHtml(agent.phone)}</td></tr>
          <tr><td>E&nbsp;Mail</td><td>${escapeHtml(agent.email)}</td></tr>
          <tr><td>Subject</td><td>${escapeHtml(agent.subject)}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- One-line intro, compact spacing -->
    <div class="section"><div class="muted">Please find below the details of the prices for the travel items as per your requirements.</div></div>

    <div class="section">
      <div class="bookingTitle">Booking Details</div>

      ${
        acc.length
          ? `<div class="title" style="margin-top:6px">Accommodation</div>
      <table class="table">
        ${
          !hidePricingColumn
            ? `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th><th class="price">Pricing</th></tr></thead>`
            : `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th></tr></thead>`
        }
        <tbody>
          ${acc
            .map(
              (r) => `<tr>
              <td>${r.name}${
                r.subline ? `<span class="subline">${r.subline}</span>` : ""
              }</td>
              <td>${r.details}${
                r.cancel ? `<div class="cancel-note">${r.cancel}</div>` : ""
              }</td>
              <td class="date">${r.date}</td>
              ${!hidePricingColumn ? `<td class="price">${r.price}</td>` : ``}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
          : ""
      }

      ${
        trf.length
          ? `<div class="title" style="margin-top:6px">Transfers</div>
      <table class="table">
        ${
          !hidePricingColumn
            ? `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th><th class="price">Pricing</th></tr></thead>`
            : `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th></tr></thead>`
        }
        <tbody>
          ${trf
            .map(
              (r) => `<tr>
              <td>${r.name}${
                r.subline ? `<span class="subline">${r.subline}</span>` : ""
              }</td>
              <td>${r.details}${
                r.cancel ? `<div class="cancel-note">${r.cancel}</div>` : ``
              }
              </td>
              <td class="date">${r.date}</td>
              ${!hidePricingColumn ? `<td class="price">${r.price}</td>` : ``}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
          : ""
      }

      ${
        act.length
          ? `<div class="title" style="margin-top:6px">Activities</div>
      <table class="table">
        ${
          !hidePricingColumn
            ? `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th><th class="price">Pricing</th></tr></thead>`
            : `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th></tr></thead>`
        }
        <tbody>
          ${act
            .map(
              (r) => `<tr>
              <td>${r.name}</td>
              <td>${r.details}</td>
              <td class="date">${r.date}</td>
              ${!hidePricingColumn ? `<td class="price">${r.price}</td>` : ``}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
          : ""
      }

      ${
        exc.length
          ? `<div class="title" style="margin-top:6px">Excursions</div>
<table class="table">
  ${
    !hidePricingColumn
      ? `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th><th class="price">Pricing</th></tr></thead>`
      : `<thead><tr><th>Name</th><th>Details</th><th class="date">Date</th></tr></thead>`
  }
  <tbody>
    ${exc
      .map(
        (r) => `<tr>
        <td>${r.name}</td>
        <td>${r.details}</td>
        <td class="date">${r.date}</td>
        ${!hidePricingColumn ? `<td class="price">${r.price}</td>` : ``}
      </tr>`
      )
      .join("")}
  </tbody>
</table>`
          : ""
      }


        ${!hideGrandTotal
  ? `<div class="summary">
      <div class="label">Subtotal</div>
      <div class="value">${money(subtotal, qcur)}</div>

      ${
        discount > 0
          ? `<div class="label">Total Discount</div>
             <div class="value">-${money(discount, qcur)}</div>`
          : ""
      }

      ${
        (quote.visaPrice || 0) > 0
          ? `<div class="label">Visa Charges</div>
             <div class="value">${money(quote.visaPrice || 0, qcur)}</div>`
          : ""
      }

      <div class="label" style="font-weight:700">Grand Total</div>
      <div class="value" style="font-weight:700">
        ${money(grand, qcur)}
      </div>

      ${
        advanceAmount > 0
          ? `<div class="label">Advance Paid</div>
             <div class="value">-${money(advanceAmount, qcur)}</div>`
          : ""
      }

      <div class="label" style="font-weight:700;color:#0ea5e9;">Final Payable</div>
      <div class="value" style="font-weight:700;color:#0ea5e9;">
        ${money(finalAmount, qcur)}
      </div>
    </div>`
  : `<!-- summary hidden -->`


        }
    </div>

    <div class="section notes">
      <div class="title">Important Notes</div>
      ${notesHtml}
    </div>

    <div class="footer">
      <div>
        <div>The booking is powered by ${escapeHtml(brand.name)}</div>
        <div>Emergency number - ${escapeHtml(brand.emergency)}</div>
      </div>
      ${
        brand.logo
          ? `<img src="${brand.logo}" alt="logo" />`
          : `<div>[logo]</div>`
      }
    </div>
  </div>
</body>
</html>`;
}
