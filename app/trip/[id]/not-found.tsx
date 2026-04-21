import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl">
        <Plane size={36} className="text-white rotate-45" />
      </div>
      <div>
        <h1 className="font-syne text-4xl font-bold mb-2">Trip not found</h1>
        <p className="text-muted-foreground">
          This trip doesn't exist or you don't have access to it.
        </p>
      </div>
      <Link href="/dashboard">
        <Button variant="gradient" size="lg">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
