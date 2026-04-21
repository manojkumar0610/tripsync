"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportPDFButtonProps {
  trip: any;
  members: any[];
  expenses: any[];
  itinerary?: any;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ExportPDFButton({
  trip,
  members,
  expenses,
  itinerary,
  variant = "outline",
  size = "sm",
}: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { generateTripPDF } = await import("@/lib/pdf-export");
      await generateTripPDF({ trip, members, expenses, itinerary });
      toast.success("PDF downloaded!");
    } catch (err: any) {
      toast.error(err.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={exporting}
      className="gap-2"
    >
      {exporting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileDown size={14} />
      )}
      {exporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
