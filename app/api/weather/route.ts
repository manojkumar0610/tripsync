import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    // Return mock data if no API key
    return NextResponse.json({
      city,
      country: "XX",
      temperature: 25,
      feels_like: 23,
      description: "partly cloudy",
      humidity: 65,
      wind_speed: 3.5,
      forecast: [
        { date: new Date().toISOString(), min_temp: 20, max_temp: 28, description: "sunny", icon: "01d" },
        { date: new Date(Date.now() + 86400000).toISOString(), min_temp: 19, max_temp: 26, description: "cloudy", icon: "03d" },
        { date: new Date(Date.now() + 172800000).toISOString(), min_temp: 18, max_temp: 25, description: "rain", icon: "10d" },
      ],
    });
  }

  try {
    // Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 1800 } }
    );

    if (!currentRes.ok) {
      throw new Error("City not found");
    }

    const current = await currentRes.json();

    // 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 1800 } }
    );

    let forecast = [];
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      // Get one entry per day (noon)
      const seen = new Set<string>();
      forecast = forecastData.list
        .filter((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          if (!seen.has(date) && item.dt_txt.includes("12:00")) {
            seen.add(date);
            return true;
          }
          return false;
        })
        .slice(0, 5)
        .map((item: any) => ({
          date: item.dt_txt,
          min_temp: item.main.temp_min,
          max_temp: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        }));
    }

    return NextResponse.json({
      city: current.name,
      country: current.sys.country,
      temperature: current.main.temp,
      feels_like: current.main.feels_like,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      wind_speed: current.wind.speed,
      forecast,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Weather fetch failed" }, { status: 500 });
  }
}
