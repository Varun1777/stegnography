import { Lock } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-stego-primary">
      <Lock className="w-6 h-6" />
      <span className="text-xl font-semibold">GetStego</span>
    </div>
  );
};