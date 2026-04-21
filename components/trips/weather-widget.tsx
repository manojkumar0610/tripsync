"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  destination: string;
  compact?: boolean;
}

export function WeatherWidget({ destination, compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = destination.split(",")[0].trim();
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-white/70", compact ? "text-xs" : "text-sm")}>
        <Loader2 size={14} className="animate-spin" />
        <span>Loading weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur rounded-xl px-3 py-2">
        <span className="text-xl">{getWeatherEmoji(weather.description)}</span>
        <div>
          <p className="text-lg font-bold leading-none">{Math.round(weather.temperature)}°C</p>
          <p className="text-xs opacity-70 capitalize">{weather.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground">{weather.city}, {weather.country}</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="font-syne text-3xl font-bold">{Math.round(weather.temperature)}°C</span>
            <span className="text-muted-foreground text-sm mb-1">/ {Math.round(weather.feels_like)}° feels</span>
          </div>
          <p className="text-sm capitalize text-muted-foreground">{weather.description}</p>
        </div>
        <span className="text-4xl">{getWeatherEmoji(weather.description)}</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Droplets size={11} /> {weather.humidity}%</span>
        <span className="flex items-center gap-1"><Wind size={11} /> {weather.wind_speed} m/s</span>
      </div>
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-1 border-t pt-3">
          {weather.forecast.slice(0, 5).map((f: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-muted-foreground">{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</p>
              <p className="text-base">{getWeatherEmoji(f.description)}</p>
              <p className="text-[10px] font-medium">{Math.round(f.max_temp)}°</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getWeatherEmoji(desc: string): string {
  const d = desc?.toLowerCase() ?? "";
  if (d.includes("clear") || d.includes("sunny")) return "☀️";
  if (d.includes("partly")) return "⛅";
  if (d.includes("cloud") || d.includes("overcast")) return "☁️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
  if (d.includes("thunder") || d.includes("storm")) return "⛈️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("fog") || d.includes("mist")) return "🌫️";
  return "🌤️";
}
