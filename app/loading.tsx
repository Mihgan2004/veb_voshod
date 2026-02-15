import { LogoDraw } from "@/components/brand/LogoDraw";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black">
      <div className="text-white">
        <LogoDraw className="w-[140px] md:w-[180px]" />
      </div>
    </div>
  );
}
