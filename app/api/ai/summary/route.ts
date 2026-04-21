import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trip_id } = await req.json();

    // Fetch trip with related data
    const { data: trip } = await supabase
      .from("trips")
      .select("*")
      .eq("id", trip_id)
      .single();

    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const { data: members } = await supabase
      .from("trip_members")
      .select("*, user:users(*)")
      .eq("trip_id", trip_id);

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", trip_id);

    const apiKey = process.env.OPENAI_API_KEY;

    const totalSpent = (expenses ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0);
    const memberNames = (members ?? [])
      .map((m: any) => m.user?.full_name ?? m.user?.email?.split("@")[0])
      .filter(Boolean)
      .join(", ");

    if (!apiKey) {
      // Return template summary without AI
      return NextResponse.json({
        summary: `${trip.title} — A fantastic ${trip.trip_type.replace("_", " ")} adventure to ${trip.destination}. The group of ${members?.length ?? 1} travelers explored this destination from ${trip.start_date} to ${trip.end_date}, spending ${totalSpent > 0 ? `a total of $${totalSpent.toFixed(0)}` : "time"} together creating unforgettable memories.`,
        hashtags: [`#${trip.destination.replace(/\s+/g, "")}`, "#TripSync", "#TravelTogether", "#GroupTravel"],
      });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You write engaging, concise travel summaries. Return only JSON.",
        },
        {
          role: "user",
          content: `Write a shareable travel summary for this trip.
Trip: ${trip.title}
Destination: ${trip.destination}
Dates: ${trip.start_date} to ${trip.end_date}
Group: ${memberNames}
Total spent: $${totalSpent.toFixed(0)}
Type: ${trip.trip_type.replace("_", " ")}
Notes: ${trip.notes ?? "None"}

Return JSON: { "summary": "2-3 engaging sentences for social sharing", "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"] }`,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to generate summary" }, { status: 500 });
  }
}
