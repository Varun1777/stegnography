import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ProcessButtonProps {
  mode: "encode" | "decode";
  isValid: boolean;
  isProcessing: boolean;
  onProcess: () => void;
}

export const ProcessButton = ({
  mode,
  isValid,
  isProcessing,
  onProcess,
}: ProcessButtonProps) => {
  return (
    <div className="flex justify-center pt-4">
      <Button
        onClick={onProcess}
        disabled={!isValid || isProcessing}
        className="relative overflow-hidden group min-w-[200px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : mode === "encode" ? (
          <>
            <Download className="w-4 h-4 mr-2" />
            Encode & Download
          </>
        ) : (
          "Decode Message"
        )}
      </Button>
    </div>
  );
};