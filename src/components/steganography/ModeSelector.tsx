import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface ModeSelectorProps {
  mode: "encode" | "decode";
  onModeChange: (mode: "encode" | "decode") => void;
}

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button
        variant={mode === "encode" ? "default" : "outline"}
        onClick={() => onModeChange("encode")}
        className="group relative overflow-hidden w-32"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
        <Lock className="w-4 h-4 mr-2" />
        Encode
      </Button>
      <Button
        variant={mode === "decode" ? "default" : "outline"}
        onClick={() => onModeChange("decode")}
        className="group relative overflow-hidden w-32"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
        <Unlock className="w-4 h-4 mr-2" />
        Decode
      </Button>
    </div>
  );
};