import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex flex-col items-center justify-center gap-8 p-4 text-center">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/30">
            <Plane size={42} className="text-white rotate-45" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white font-bold text-sm shadow-lg">
            !
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-blue-300/60 text-sm font-medium tracking-widest uppercase">404 Error</p>
          <h1 className="font-syne text-4xl sm:text-5xl font-bold text-white">
            Lost in transit
          </h1>
          <p className="text-blue-100/60 text-lg max-w-sm mx-auto leading-relaxed">
            Looks like this page took a different flight. Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-white/90 font-semibold gap-2 shadow-xl"
            >
              <Home size={18} /> Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              size="lg"
              className="text-blue-200/70 hover:text-white hover:bg-white/10 gap-2"
            >
              <ArrowLeft size={18} /> Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
