"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, formatCurrency, getInitials } from "@/lib/utils";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  trip: any;
  members: any[];
  currentUser: any;
  onSuccess: () => void;
}

export function AddExpenseDialog({
  open, onClose, trip, members, currentUser, onSuccess
}: AddExpenseDialogProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "other",
    paid_by: currentUser?.id ?? "",
    split_type: "equal" as "equal" | "custom",
    notes: "",
  });
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const totalAmount = parseFloat(form.amount) || 0;
  const equalShare = members.length > 0 ? totalAmount / members.length : 0;

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.paid_by) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      // Insert expense
      const { data: expense, error: expError } = await supabase
        .from("expenses")
        .insert({
          trip_id: trip.id,
          title: form.title,
          amount: totalAmount,
          category: form.category,
          paid_by: form.paid_by,
          split_type: form.split_type,
          notes: form.notes || null,
        })
        .select()
        .single();

      if (expError) throw expError;

      // Insert splits
      const splits = members.map((m: any) => ({
        expense_id: expense.id,
        user_id: m.user_id,
        amount: form.split_type === "equal"
          ? equalShare
          : parseFloat(customSplits[m.user_id] || "0"),
        is_settled: m.user_id === form.paid_by,
      }));

      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitError) throw splitError;

      toast.success("Expense added!");
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      category: "other",
      paid_by: currentUser?.id ?? "",
      split_type: "equal",
      notes: "",
    });
    setCustomSplits({});
  };

  const customTotal = Object.values(customSplits).reduce(
    (sum, v) => sum + (parseFloat(v) || 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              placeholder="e.g. Dinner at Ku De Ta"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount (USD) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paid by */}
          <div className="space-y-1.5">
            <Label>Paid By *</Label>
            <Select value={form.paid_by} onValueChange={(v) => setForm({ ...form, paid_by: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.user?.full_name ?? m.user?.email ?? "Unknown"}
                    {m.user_id === currentUser?.id ? " (you)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Split type */}
          <div className="space-y-2">
            <Label>Split</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.split_type === "equal" ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, split_type: "equal" })}
              >
                Equal
              </Button>
              <Button
                type="button"
                variant={form.split_type === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, split_type: "custom" })}
              >
                Custom
              </Button>
            </div>
          </div>

          {/* Split breakdown */}
          <div className="space-y-2 rounded-xl border p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground">Split Breakdown</p>
            {members.map((m: any) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={m.user?.avatar_url ?? ""} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(m.user?.full_name ?? m.user?.email ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm">
                  {m.user?.full_name ?? m.user?.email ?? "Unknown"}
                  {m.user_id === currentUser?.id ? " (you)" : ""}
                </span>
                {form.split_type === "equal" ? (
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(equalShare)}
                  </span>
                ) : (
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={customSplits[m.user_id] ?? ""}
                    onChange={(e) =>
                      setCustomSplits((prev) => ({ ...prev, [m.user_id]: e.target.value }))
                    }
                    className="h-7 w-24 text-sm"
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
            ))}
            {form.split_type === "custom" && totalAmount > 0 && (
              <div className={`flex justify-between text-xs pt-1 border-t ${
                Math.abs(customTotal - totalAmount) > 0.01
                  ? "text-red-500"
                  : "text-emerald-600"
              }`}>
                <span>Total assigned</span>
                <span>
                  {formatCurrency(customTotal)} / {formatCurrency(totalAmount)}
                  {Math.abs(customTotal - totalAmount) > 0.01 && " ⚠️"}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="resize-none min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={loading || (form.split_type === "custom" && Math.abs(customTotal - totalAmount) > 0.01 && totalAmount > 0)}
            className="gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
