"use client";

import { formatCurrency, formatDate, getTripTypeLabel, getTripDuration } from "@/lib/utils";

interface TripPDFData {
  trip: any;
  members: any[];
  expenses: any[];
  itinerary?: any;
}

export async function generateTripPDF({ trip, members, expenses, itinerary }: TripPDFData) {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const colors = {
    primary: [37, 99, 235] as [number, number, number],    // blue-600
    violet:  [124, 58, 237] as [number, number, number],   // violet-600
    dark:    [15, 23, 42] as [number, number, number],     // slate-900
    muted:   [100, 116, 139] as [number, number, number],  // slate-500
    light:   [241, 245, 249] as [number, number, number],  // slate-100
    success: [5, 150, 105] as [number, number, number],    // emerald-600
    danger:  [220, 38, 38] as [number, number, number],    // red-600
  };

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageH - margin) addPage();
  };

  const drawRect = (x: number, yPos: number, w: number, h: number, r: [number, number, number], filled = true) => {
    doc.setFillColor(...r);
    doc.roundedRect(x, yPos, w, h, 3, 3, filled ? "F" : "S");
  };

  // ── HEADER BANNER ─────────────────────────────────────
  drawRect(0, 0, pageW, 50, colors.primary);
  // Gradient overlay (simulate with second rect)
  doc.setFillColor(124, 58, 237);
  doc.setGState(doc.GState({ opacity: 0.3 }));
  doc.rect(pageW / 2, 0, pageW / 2, 50, "F");
  doc.setGState(doc.GState({ opacity: 1.0 }));

  // Logo / Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("TripSync", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 240);
  doc.text("AI-Powered Travel Planning", margin, 25);

  // Trip title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(trip.title, margin, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 240);
  doc.text(
    `${trip.destination}  ·  ${formatDate(trip.start_date)} – ${formatDate(trip.end_date)}  ·  ${getTripTypeLabel(trip.trip_type)}`,
    margin,
    47
  );

  y = 62;

  // ── TRIP STATS ROW ────────────────────────────────────
  const stats = [
    { label: "Duration", value: `${getTripDuration(trip.start_date, trip.end_date)} days` },
    { label: "Members",  value: `${members.length}` },
    { label: "Budget",   value: trip.budget > 0 ? formatCurrency(trip.budget) : "Open" },
    { label: "Expenses", value: formatCurrency(expenses.reduce((s: number, e: any) => s + Number(e.amount), 0)) },
  ];
  const statW = contentW / 4;
  stats.forEach((stat, i) => {
    const sx = margin + i * statW;
    drawRect(sx, y, statW - 3, 18, colors.light);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text(stat.value, sx + (statW - 3) / 2, y + 8, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.muted);
    doc.text(stat.label.toUpperCase(), sx + (statW - 3) / 2, y + 14, { align: "center" });
  });
  y += 26;

  // ── MEMBERS ───────────────────────────────────────────
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.dark);
  doc.text("Team Members", margin, y);
  y += 6;

  // Horizontal pill list
  let px = margin;
  members.forEach((m: any) => {
    const name = m.user?.full_name ?? m.user?.email?.split("@")[0] ?? "?";
    const label = `${name} (${m.role})`;
    const tw = doc.getTextWidth(label) + 8;
    if (px + tw > pageW - margin) { px = margin; y += 9; }
    drawRect(px, y - 5, tw, 8, m.role === "owner" ? colors.primary : colors.light);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(m.role === "owner" ? 255 : colors.dark[0], m.role === "owner" ? 255 : colors.dark[1], m.role === "owner" ? 255 : colors.dark[2]);
    doc.text(label, px + 4, y);
    px += tw + 4;
  });
  y += 12;

  // ── EXPENSES ──────────────────────────────────────────
  if (expenses.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text("Expense Breakdown", margin, y);
    y += 6;

    // Table header
    drawRect(margin, y, contentW, 8, colors.primary);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Description", margin + 3, y + 5.5);
    doc.text("Category", margin + 80, y + 5.5);
    doc.text("Paid By", margin + 115, y + 5.5);
    doc.text("Amount", pageW - margin - 3, y + 5.5, { align: "right" });
    y += 9;

    expenses.slice(0, 20).forEach((expense: any, idx: number) => {
      checkPageBreak(8);
      if (idx % 2 === 0) {
        drawRect(margin, y - 1, contentW, 8, [248, 250, 252]);
      }
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      doc.text(expense.title.slice(0, 35), margin + 3, y + 4.5);
      doc.setTextColor(...colors.muted);
      doc.text(expense.category ?? "—", margin + 80, y + 4.5);
      doc.text(
        (expense.payer?.full_name ?? expense.payer?.email ?? "?").slice(0, 20),
        margin + 115,
        y + 4.5
      );
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primary);
      doc.text(formatCurrency(expense.amount), pageW - margin - 3, y + 4.5, { align: "right" });
      y += 8;
    });

    if (expenses.length > 20) {
      doc.setFontSize(7);
      doc.setTextColor(...colors.muted);
      doc.text(`+ ${expenses.length - 20} more expenses`, margin + 3, y + 4);
      y += 8;
    }

    // Total row
    checkPageBreak(10);
    const total = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
    drawRect(margin, y, contentW, 10, [239, 246, 255]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Total Spent", margin + 3, y + 7);
    doc.text(formatCurrency(total), pageW - margin - 3, y + 7, { align: "right" });
    y += 16;
  }

  // ── ITINERARY ─────────────────────────────────────────
  if (itinerary?.content?.days?.length) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text("AI-Generated Itinerary", margin, y);
    y += 4;

    if (itinerary.content.summary) {
      checkPageBreak(14);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...colors.muted);
      const lines = doc.splitTextToSize(itinerary.content.summary, contentW);
      doc.text(lines, margin, y + 4);
      y += lines.length * 4 + 6;
    }

    itinerary.content.days.forEach((day: any) => {
      checkPageBreak(24);

      // Day header band
      drawRect(margin, y, contentW, 10, colors.violet);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`Day ${day.day} — ${day.theme}`, margin + 3, y + 7);
      doc.setFontSize(8);
      doc.text(
        `~${formatCurrency(day.estimated_cost ?? 0)}`,
        pageW - margin - 3,
        y + 7,
        { align: "right" }
      );
      y += 12;

      const allActivities = [
        ...(day.morning ?? []).map((a: any) => ({ ...a, period: "Morning" })),
        ...(day.afternoon ?? []).map((a: any) => ({ ...a, period: "Afternoon" })),
        ...(day.evening ?? []).map((a: any) => ({ ...a, period: "Evening" })),
      ];

      allActivities.forEach((act) => {
        checkPageBreak(16);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.dark);
        doc.text(`${act.time}  ${act.title}`, margin + 4, y + 4);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.muted);
        doc.text(`📍 ${act.location}  ·  ⏱ ${act.duration}`, margin + 4, y + 9);
        if (act.cost > 0) {
          doc.setTextColor(...colors.success);
          doc.text(`~${formatCurrency(act.cost)}`, pageW - margin - 3, y + 4, { align: "right" });
        }
        y += 12;
      });

      if (day.meals?.length) {
        checkPageBreak(10);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.muted);
        doc.text("Meals:", margin + 4, y + 3);
        doc.setFont("helvetica", "normal");
        const mealsText = day.meals.map((m: any) => `${m.type}: ${m.name} (${m.price_range})`).join("  ·  ");
        const mLines = doc.splitTextToSize(mealsText, contentW - 16);
        doc.text(mLines, margin + 18, y + 3);
        y += mLines.length * 4 + 6;
      }

      y += 2;
    });

    if (itinerary.content.tips?.length) {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.dark);
      doc.text("Travel Tips", margin, y);
      y += 5;
      itinerary.content.tips.forEach((tip: string) => {
        checkPageBreak(8);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.muted);
        const lines = doc.splitTextToSize(`→  ${tip}`, contentW - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4 + 2;
      });
    }
  }

  // ── FOOTER ────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawRect(0, pageH - 12, pageW, 12, [248, 250, 252]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.muted);
    doc.text("Generated by TripSync  ·  tripsync.io", margin, pageH - 5);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: "right" });
    doc.text(new Date().toLocaleDateString(), pageW / 2, pageH - 5, { align: "center" });
  }

  doc.save(`${trip.title.replace(/\s+/g, "-").toLowerCase()}-tripsync.pdf`);
}
