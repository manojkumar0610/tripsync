"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2, Save } from "lucide-react";

interface TripSettingsTabProps { trip: any; }

export function TripSettingsTab({ trip }: TripSettingsTabProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: trip.title,
    destination: trip.destination,
    budget: trip.budget?.toString() ?? "0",
    notes: trip.notes ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("trips").update({
      title: form.title,
      destination: form.destination,
      budget: parseFloat(form.budget) || 0,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", trip.id);
    if (error) toast.error("Failed to update trip");
    else { toast.success("Trip updated!"); router.refresh(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete the trip and all data.")) return;
    setDeleting(true);
    const { error } = await supabase.from("trips").delete().eq("id", trip.id);
    if (error) { toast.error("Failed to delete trip"); setDeleting(false); }
    else { toast.success("Trip deleted"); router.push("/dashboard/trips"); }
  };

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trip Settings</CardTitle>
          <CardDescription>Update trip details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Trip Name</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Destination</Label>
            <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Budget (USD)</Label>
            <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="resize-none" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900/30">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          <CardDescription>This action cannot be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Trip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
