"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plane, Sparkles, Users, DollarSign, ArrowRight, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Plane,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    title: "Welcome to TripSync ✈️",
    desc: "Your AI-powered travel planning companion. Let's take a quick tour to get you started.",
  },
  {
    icon: Sparkles,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    title: "AI Itineraries",
    desc: "Generate a complete day-by-day travel plan in seconds. Just set your destination, budget, and interests — AI does the rest.",
  },
  {
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    title: "Invite Your Crew",
    desc: "Share a 6-letter code or link to bring friends and family into your trip. Everyone can collaborate in real time.",
  },
  {
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    title: "Split Expenses Fairly",
    desc: "Track every expense, split equally or custom amounts, and settle up with one click. No more awkward money conversations.",
  },
];

export function OnboardingDialog() {
  const { onboardingComplete, setOnboardingComplete } = useAppStore();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show on first visit after a brief delay
    if (!onboardingComplete) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [onboardingComplete]);

  const handleClose = () => {
    setOpen(false);
    setOnboardingComplete();
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Welcome to TripSync</DialogTitle>
        </DialogHeader>

        <div className="py-2 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className={cn("rounded-2xl p-5", current.bg)}>
            <current.icon size={36} className={current.color} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h2 className="font-syne text-xl font-bold">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === step
                    ? "h-2 w-6 bg-blue-600"
                    : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex w-full gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} className="flex-1 text-muted-foreground">
              Skip
            </Button>
            {isLast ? (
              <Button variant="gradient" size="sm" onClick={handleClose} className="flex-1 gap-2">
                <Check size={14} /> Get Started!
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setStep(step + 1)}
                className="flex-1 gap-2"
              >
                Next <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
