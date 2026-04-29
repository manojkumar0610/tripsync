import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#040714] px-6 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold">TripSync</h1>
        <p className="mb-8 text-lg text-white/75">AI travel planning and collaboration for groups.</p>
        <Link href="/dashboard">
          <Button className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8">Go to Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
