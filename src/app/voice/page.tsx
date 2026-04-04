import { VoiceConcierge } from "@/components/VoiceConcierge";
import Link from "next/link";

export default function VoicePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <VoiceConcierge />
      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link href="/" className="underline hover:text-zinc-800 dark:hover:text-zinc-300">
          Back to home
        </Link>
      </p>
    </div>
  );
}
