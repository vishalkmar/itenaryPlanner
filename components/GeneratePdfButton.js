
"use client";
import { useState } from "react";
import { quoteToHtml } from "@/lib/pdf-template-client";
export default function GeneratePdfButton({ id }){
  function sanitizeFileName(name){
    if(!name) return "quote";
    const s = name.toString().trim().replace(/[\/:*?\"<>|]+/g, " ");
    return s.replace(/\s+/g, "_").slice(0,120);
  }
  const [loading,setLoading]=useState(false);
  async function generate(){
    try{
      setLoading(true);
      // fetch single quote document
      const res = await fetch(`/api/quote/${id}`);
      const json = await res.json();
      const q = json?.data || json; // support both shapes
      const html = quoteToHtml(q);
      const html2pdf = (await import("html2pdf.js")).default;
      const fname = sanitizeFileName(q.agentSubject || q.subject || `quote_${id}`) + ".pdf";
      const opt = { margin:10, filename: fname, image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2,useCORS:true}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} };
      await html2pdf().from(html).set(opt).save();
    } finally { setLoading(false); }
  }
  return (<button className="btn btn-ghost" type="button" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Download PDF"}</button>);
}


// ===== PDF ENHANCEMENTS PATCH =====
// Ensure bold black labels, skip 0 adults/children/guests, and show transferType.
function formatAccommodation(item) {
  let text = "";
  if (item.hotelProperty) text += `\n**Hotel:** ${item.hotelProperty}`;
  if (item.country) text += `\n**Country:** ${item.country}`;
  if (item.destination) text += `\n**Destination:** ${item.destination}`;
  if (item.adults && item.adults > 0) text += `\n**Adults:** ${item.adults}`;
  if (item.children && item.children > 0) text += `\n**Children:** ${item.children}`;
  if (item.guests && item.guests > 0) text += `\n**Guests:** ${item.guests}`;
  if (item.checkIn) text += `\n**Check-In:** ${item.checkIn}`;
  if (item.checkOut) text += `\n**Check-Out:** ${item.checkOut}`;
  return text;
}

function formatTransfer(item) {
  let text = "";
  if (item.from) text += `\n**From:** ${item.from}`;
  if (item.to) text += `\n**To:** ${item.to}`;
  if (item.transferType) text += `\n**Type:** ${item.transferType}`;
  return text;
}

function formatActivity(item) {
  let text = "";
  if (item.itemTitle) text += `\n**Activity:** ${item.itemTitle}`;
  if (item.destination) text += `\n**Destination:** ${item.destination}`;
  if (item.transferType) text += `\n**Transfer Type:** ${item.transferType}`;
  return text;
}
// ===== END PATCH =====
