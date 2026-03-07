import { LogoDraw } from "@/components/brand/LogoDraw";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-[#0b0d10]">
      <LogoDraw className="w-[140px] md:w-[180px]" variant="gold" hideFrame />
    </div>
  );
}
