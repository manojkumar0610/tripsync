import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      trip_id, destination, start_date, end_date,
      budget, trip_type, interests, trip_style, num_people,
    } = body;

    const durationMs = new Date(end_date).getTime() - new Date(start_date).getTime();
    const duration = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)));
    const budgetPerDay = budget > 0 ? Math.round(budget / duration) : null;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return demo data when no API key set
      const demoContent = generateDemoItinerary(destination, duration, start_date);
      const { data: itinerary, error } = await supabase
        .from("itineraries")
        .insert({ trip_id, generated_by: user.id, content: demoContent })
        .select().single();
      if (error) throw error;
      return NextResponse.json(itinerary);
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an expert travel planner. Create a detailed ${duration}-day itinerary for a ${trip_style?.toLowerCase() ?? "comfortable"} ${trip_type?.replace("_", " ") ?? "group"} trip to ${destination}.

Trip Details:
- Dates: ${start_date} to ${end_date} (${duration} days)
- Total Budget: ${budget > 0 ? `$${budget} USD (~$${budgetPerDay}/day)` : "Flexible"}
- Group: ${num_people ?? 2} people
- Style: ${trip_style ?? "Comfort"}
- Interests: ${interests?.length > 0 ? interests.join(", ") : "general sightseeing"}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "summary": "2-3 sentence trip overview",
  "estimated_total_cost": 0,
  "days": [
    {
      "day": 1,
      "date": "${start_date}",
      "theme": "Theme for the day",
      "morning": [{"time":"09:00","title":"Activity","description":"Description","location":"Location","cost":0,"duration":"2 hours","tips":"tip"}],
      "afternoon": [],
      "evening": [],
      "meals": [{"type":"breakfast","name":"Restaurant","cuisine":"Cuisine","price_range":"$10-15","must_try":"dish"}],
      "estimated_cost": 0
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert travel planner. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const content = JSON.parse(cleaned);

    const { data: itinerary, error } = await supabase
      .from("itineraries")
      .insert({ trip_id, generated_by: user.id, content })
      .select().single();

    if (error) throw error;
    return NextResponse.json(itinerary);
  } catch (err: any) {
    console.error("Itinerary generation error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate itinerary" }, { status: 500 });
  }
}

function generateDemoItinerary(destination: string, duration: number, startDate: string) {
  const days = Array.from({ length: Math.min(duration, 5) }, (_, i) => ({
    day: i + 1,
    date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split("T")[0],
    theme: ["Arrival & Exploration", "Cultural Immersion", "Adventure Day", "Local Life", "Farewell Day"][i] ?? `Day ${i + 1}`,
    morning: [{ time: "09:00", title: `Morning in ${destination}`, description: `Explore the local ${["markets", "temples", "neighborhoods", "parks", "cafes"][i % 5]} and soak in the atmosphere.`, location: `${destination} city center`, cost: 15, duration: "2 hours", tips: "Go early to avoid crowds" }],
    afternoon: [{ time: "14:00", title: "Afternoon Activity", description: `Discover ${destination}'s highlights at your own pace.`, location: `${destination}`, cost: 25, duration: "3 hours", tips: "Wear comfortable shoes" }],
    evening: [{ time: "19:00", title: "Sunset & Dinner", description: `End the day with stunning views and local cuisine.`, location: `${destination} waterfront`, cost: 30, duration: "2.5 hours", tips: "Book ahead for popular spots" }],
    meals: [
      { type: "breakfast", name: "Local Cafe", cuisine: "Local", price_range: "$5-10", must_try: "Local specialty" },
      { type: "lunch", name: "Street Food Market", cuisine: "Street Food", price_range: "$8-12", must_try: "Regional dish" },
      { type: "dinner", name: "Rooftop Restaurant", cuisine: "International", price_range: "$20-35", must_try: "Chef's special" },
    ],
    estimated_cost: 120 + i * 10,
  }));

  return {
    summary: `A wonderful ${duration}-day journey through ${destination}, blending culture, cuisine, and adventure. This itinerary is crafted for comfort and memorable experiences.`,
    estimated_total_cost: days.reduce((s, d) => s + d.estimated_cost, 0),
    days,
    tips: [
      `Best time to visit ${destination} is during shoulder season for fewer crowds`,
      "Always carry local currency for small vendors and markets",
      "Download offline maps before exploring",
      "Try to learn a few basic phrases in the local language",
      "Keep copies of important documents in cloud storage",
    ],
  };
}
