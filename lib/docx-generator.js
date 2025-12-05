"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

const BRAND_BLUE = "0066CC";
const LIGHT_BAR = "F5F7FB";
const LIGHT_BOX = "F9FAFD";

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Small helpers
const p = (text, opts = {}) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Calibri",
      }),
    ],
    spacing: { after: 120 },
    ...opts,
  });

const run = (text, opts = {}) =>
  new TextRun({
    text,
    font: "Calibri",
    ...opts,
  });

const sectionBar = (title) =>
  new Paragraph({
    children: [run(title.toUpperCase(), { bold: true, color: BRAND_BLUE })],
    shading: {
      type: "clear",
      color: "auto",
      fill: LIGHT_BAR,
    },
    border: {
      left: {
        color: BRAND_BLUE,
        size: 24,
        style: BorderStyle.SINGLE,
      },
    },
    spacing: { before: 200, after: 100 },
  });

export async function generateDocx(quote, fileName) {
  try {
    const basic = quote.basic || {};
    const itinerary = quote.itinerary || {};
    const accommodations = quote.accommodation || [];
    const meal = quote.meal || {};
    const inclusion = quote.inclusion || {};
    const exclusion = quote.exclusion || {};
    const totals = quote.totals || {};
    const days = itinerary.days || [];

    const children = [];

    // =============== TOP HEADER (LOGO + TITLE) =================
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  new Paragraph({
                    children: [
                      run("Traveon", {
                        bold: true,
                        size: 36,
                        color: BRAND_BLUE,
                      }),
                    ],
                    spacing: { after: 0 },
                  }),
                ],
              }),
              new TableCell({
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      run("Detailed Itinerary", {
                        bold: true,
                        size: 32,
                        color: BRAND_BLUE,
                      }),
                    ],
                    spacing: { after: 40 },
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      run(
                        `${formatDate(basic.startDate)} - ${formatDate(
                          basic.endDate
                        )} | ${basic.nights || 0} Nights | ${
                          basic.pax || 0
                        } Pax`,
                        { size: 20, color: "777777" }
                      ),
                    ],
                    spacing: { after: 200 },
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // ================= TRIP DETAILS ==================
    children.push(sectionBar("TRIP DETAILS"));

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  type: "clear",
                  color: "auto",
                  fill: LIGHT_BOX,
                },
                children: [
                  new Paragraph({
                    children: [run("Arrival Date", { bold: true, size: 20 })],
                    spacing: { after: 40 },
                  }),
                ],
              }),
              new TableCell({
                shading: { type: "clear", color: "auto", fill: LIGHT_BOX },
                children: [
                  new Paragraph({
                    children: [run("Departure Date", { bold: true, size: 20 })],
                    spacing: { after: 40 },
                  }),
                ],
              }),
              new TableCell({
                shading: { type: "clear", color: "auto", fill: LIGHT_BOX },
                children: [
                  new Paragraph({
                    children: [
                      run("Number of Nights", { bold: true, size: 20 }),
                    ],
                    spacing: { after: 40 },
                  }),
                ],
              }),
              new TableCell({
                shading: { type: "clear", color: "auto", fill: LIGHT_BOX },
                children: [
                  new Paragraph({
                    children: [run("Persons (PAX)", { bold: true, size: 20 })],
                    spacing: { after: 40 },
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  p(formatDate(basic.startDate), {
                    spacing: { before: 40, after: 80 },
                  }),
                ],
              }),
              new TableCell({
                children: [
                  p(formatDate(basic.endDate), {
                    spacing: { before: 40, after: 80 },
                  }),
                ],
              }),
              new TableCell({
                children: [
                  p(String(basic.nights || 0), {
                    spacing: { before: 40, after: 80 },
                  }),
                ],
              }),
              new TableCell({
                children: [
                  p(String(basic.pax || 0), {
                    spacing: { before: 40, after: 80 },
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // ================= ACCOMMODATION DETAILS ==================
    children.push(sectionBar("ACCOMMODATION DETAILS"));

    if (accommodations.length > 0) {
      accommodations.forEach((acc) => {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: {
                      type: "clear",
                      color: "auto",
                      fill: "FDFDFD",
                    },
                    children: [
                      new Paragraph({
                        children: [
                          run("Hotel Name: ", {
                            bold: true,
                            size: 20,
                          }),
                          run(acc.otherHotel || acc.hotel || "—", {
                            size: 20,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: {
                      type: "clear",
                      color: "auto",
                      fill: "FDFDFD",
                    },
                    children: [
                      new Paragraph({
                        children: [
                          run("Location: ", { bold: true, size: 20 }),
                          run(acc.otherPlace || acc.place || "—", {
                            size: 20,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    children: [
                      new Paragraph({
                        children: [
                          run("Rooms: ", { bold: true, size: 20 }),
                          run(String(acc.rooms || 0), { size: 20 }),
                          run("    Adults: ", { bold: true, size: 20 }),
                          run(String(acc.adults || 0), { size: 20 }),
                          run("    Children: ", { bold: true, size: 20 }),
                          run(String(acc.children || 0), { size: 20 }),
                          run("    Nights: ", { bold: true, size: 20 }),
                          run(String(acc.nights || 0), { size: 20 }),
                        ],
                        spacing: { before: 40, after: 200 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      });
    } else {
      children.push(
        p("No hotels added", {
          children: [run("No hotels added", { italics: true })],
        })
      );
    }

    // ================= DAILY ITINERARY ==================
    // ================= DAILY ITINERARY ==================
children.push(sectionBar("DAILY ITINERARY"));

if (days.length > 0) {
  const rows = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: { type: "clear", color: "auto", fill: LIGHT_BAR },
          children: [
            new Paragraph({
              children: [run("Day", { bold: true, size: 20 })],
              spacing: { after: 80 },
            }),
          ],
        }),
        new TableCell({
          shading: { type: "clear", color: "auto", fill: LIGHT_BAR },
          children: [
            new Paragraph({
              children: [run("Description", { bold: true, size: 20 })],
              spacing: { after: 80 },
            }),
          ],
        }),
      ],
    })
  );

  days.forEach((day) => {
    const title = day.title || "Day";
    const description = String(day.description || "—");

    // yaha description ko line-break pe tod rahe hain
    const lines = description.split(/\r?\n/);

    const descRuns = lines.map((line, idx) => {
      if (idx === 0) {
        return run(line, { size: 20 });
      }
      // break:1 se next line pe chala jayega
      return new TextRun({
        text: line,
        font: "Calibri",
        break: 1,
        size: 20,
      });
    });

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  run(title, {
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: descRuns,
                spacing: { before: 60, after: 60 },
              }),
            ],
          }),
        ],
      })
    );
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    })
  );
} else {
  children.push(
    p("No itinerary days added", {
      children: [run("No itinerary days added", { italics: true })],
    })
  );
}


    // ================= PACKAGE DETAILS ==================
    children.push(sectionBar("PACKAGE DETAILS"));

    // INCLUSIONS
    children.push(
      new Paragraph({
        children: [run("INCLUSIONS", { bold: true, size: 24, color: BRAND_BLUE })],
        spacing: { before: 100, after: 40 },
      })
    );

    const inclusionsWithMeals = [
      ...(inclusion.inclusions || []).filter(
        (i) => !String(i || "").toLowerCase().includes("visa")
      ),
    ];

    if (typeof inclusion.customVisaCount === "number") {
      const withoutVisa = inclusion.customVisaCount || 0;
      const withVisa = (basic.pax || 0) - withoutVisa;
      if (withoutVisa === 0) {
        inclusionsWithMeals.push("Visa included");
      } else if (withVisa > 0) {
        inclusionsWithMeals.push(`Visa included for ${withVisa} person(s)`);
      }
    }

    if (inclusionsWithMeals.length > 0) {
      inclusionsWithMeals.forEach((inc) => {
        children.push(
          new Paragraph({
            children: [run(`• ${inc}`, { size: 20 })],
            spacing: { after: 40 },
          })
        );
      });
    } else {
      children.push(
        new Paragraph({
          children: [run("No inclusions specified", { italics: true })],
        })
      );
    }

    // EXCLUSIONS
    children.push(
      new Paragraph({
        children: [run("EXCLUSIONS", { bold: true, size: 24, color: BRAND_BLUE })],
        spacing: { before: 200, after: 40 },
      })
    );

    const exclusionsArr = exclusion.exclusions || [];
    const mealTypes = (meal.meals || []).map((m) =>
      String(m?.type || "").toLowerCase().trim()
    );
    const exclusionsFiltered = exclusionsArr.filter((ex) => {
      const t = String(ex || "").toLowerCase();
      if (t.includes("lunch") && mealTypes.includes("lunch")) return false;
      if (t.includes("dinner") && mealTypes.includes("dinner")) return false;
      return true;
    });

    const visaExcludedCount =
      inclusion && inclusion.customVisaCount !== undefined && basic && basic.pax !== undefined
        ? Number(inclusion.customVisaCount)
        : 0;

    const exclusionsWithVisa = [...exclusionsFiltered];
    if (visaExcludedCount > 0) {
      if (visaExcludedCount === basic.pax) {
        exclusionsWithVisa.push("Visa not included");
      } else {
        exclusionsWithVisa.push(
          `Visa not included for ${visaExcludedCount} person(s)`
        );
      }
    }

    if (exclusionsWithVisa.length > 0) {
      exclusionsWithVisa.forEach((ex) => {
        children.push(
          new Paragraph({
            children: [run(`• ${ex}`, { size: 20 })],
            spacing: { after: 40 },
          })
        );
      });
    } else {
      children.push(
        new Paragraph({
          children: [run("No exclusion specified", { italics: true })],
        })
      );
    }

    // ================= MEALS ==================
    children.push(sectionBar("MEALS"));

    const mealsLunchDinner = (meal.meals || [])
      .filter(
        (m) =>
          m.type && ["lunch", "dinner"].includes(m.type.toLowerCase())
      )
      .map((m) => m.type)
      .join(", ");

    children.push(
      new Paragraph({
        children: [
          run("Included Meals ", { bold: true, size: 20 }),
          run(mealsLunchDinner || "—", { size: 20 }),
        ],
        spacing: { after: 200 },
      })
    );

    // ================= PRICING BOX ==================
    children.push(
      new Paragraph({
        children: [run("PRICING", { bold: true, size: 24, color: BRAND_BLUE })],
        spacing: { before: 200, after: 80 },
      })
    );

    const paxCount = Number(basic.pax || 1);
    const grandTotal = Number(totals.grandTotal || 0);
    const finalTotal = Number(totals.finalTotal || totals.grandTotal || 0);
    const preTaxPerPerson = paxCount > 0 ? grandTotal / paxCount : grandTotal;
    const finalPerPerson = Number(
      totals.pricePerPerson || finalTotal / (paxCount || 1)
    );

    const preTaxDisplay =
      totals.printFinalTotal && totals.applyGstTcs
        ? grandTotal
        : preTaxPerPerson;
    const finalDisplay = totals.printFinalTotal
      ? finalTotal
      : finalPerPerson;

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      run("Package Without Taxes", {
                        bold: true,
                        size: 22,
                      }),
                    ],
                    spacing: { after: 40 },
                  }),
                  totals.applyGstTcs
                    ? new Paragraph({
                        children: [
                          run(
                            "GST @5% & TCS @5% as per applicable travel cost",
                            { italics: true, size: 20 }
                          ),
                        ],
                        spacing: { after: 40 },
                      })
                    : new Paragraph({ text: "" }),
                ],
              }),
              new TableCell({
                children: [
                  totals.applyGstTcs
                    ? new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          run(
                            `₹ ${Number(preTaxDisplay || 0).toLocaleString(
                              "en-IN",
                              { maximumFractionDigits: 2 }
                            )}`,
                            {
                              bold: true,
                              size: 24,
                              color: BRAND_BLUE,
                            }
                          ),
                        ],
                      })
                    : new Paragraph({ text: "" }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      run(
                        `${
                          totals.printFinalTotal
                            ? "Final Total"
                            : "Final Price per person"
                        }`,
                        {
                          bold: true,
                          size: 20,
                        }
                      ),
                    ],
                    spacing: { before: 120, after: 20 },
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      run(
                        `₹ ${Number(finalDisplay || 0).toLocaleString(
                          "en-IN",
                          { maximumFractionDigits: 2 }
                        )}`,
                        {
                          bold: true,
                          size: 28,
                          color: BRAND_BLUE,
                        }
                      ),
                    ],
                    spacing: { after: 40 },
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // ================= REMARK (if any) ==================
    if (quote.remark && String(quote.remark || "").trim()) {
      children.push(
        new Paragraph({
          children: [run("REMARK", { bold: true, size: 24, color: BRAND_BLUE })],
          spacing: { before: 300, after: 80 },
        })
      );
      children.push(
        new Paragraph({
          children: [run(quote.remark, { size: 20 })],
          spacing: { after: 200 },
        })
      );
    }

    // ================= BOOKING INFO ==================
    children.push(sectionBar("BOOKING INFORMATION"));

    children.push(
      new Paragraph({
        children: [run("Booked and Payable By:", { bold: true, size: 22 })],
        spacing: { after: 60 },
      })
    );
    children.push(
      new Paragraph({
        children: [run("Traveon Venture LLP", { size: 20 })],
        spacing: { after: 40 },
      })
    );
    children.push(
      new Paragraph({
        children: [run("128A D-MALL, New Delhi", { size: 20 })],
        spacing: { after: 40 },
      })
    );
    children.push(
      new Paragraph({
        children: [run("India 110034", { size: 20 })],
        spacing: { after: 200 },
      })
    );

    // ================= TERMS & CONDITIONS ==================
    children.push(sectionBar("IMPORTANT TERMS & CONDITIONS"));

    const terms = [
      "At check-in, you must present a valid photo ID with your address confirming the same name as the lead guest on the booking.",
      "All rooms are guaranteed on the day of arrival. In case of no-show, your room(s) will be released and you will be subject to the terms and conditions of the Cancellation/No-Show policy.",
      "The total price for this booking does not include mini-bar items, telephone usage, laundry service, etc.",
      "Upon arrival, if you have any questions, please verify with the property.",
      "Special requests are subject to availability upon arrival.",
    ];

    terms.forEach((term, idx) => {
      children.push(
        new Paragraph({
          children: [
            run(`${idx + 1}. `, { bold: true, size: 20 }),
            run(term, { size: 20 }),
          ],
          spacing: { after: 80 },
        })
      );
    });

    // ================= CUSTOMER SERVICE ==================
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run("CUSTOMER SERVICE", { bold: true, size: 20 })],
        spacing: { before: 300, after: 40 },
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          run("Call us 24/7: +91 9540111207, +91 9540111307", { size: 20 }),
        ],
        spacing: { after: 40 },
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          run("(Long distance charge may apply)", {
            size: 18,
            italics: true,
          }),
        ],
      })
    );

    // ================= CREATE & DOWNLOAD DOCX ==================
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error generating DOCX:", err);
    throw err;
  }
}
