import { Input } from "@/components/ui/input";

interface MessageInputsProps {
  mode: "encode" | "decode";
  secretMessage: string;
  secretKey: string;
  onMessageChange: (message: string) => void;
  onKeyChange: (key: string) => void;
}

export const MessageInputs = ({
  mode,
  secretMessage,
  secretKey,
  onMessageChange,
  onKeyChange,
}: MessageInputsProps) => {
  return (
    <div className="space-y-4">
      {mode === "encode" && (
        <div className="animate-fade-in">
          <Input
            placeholder="Enter your secret message"
            value={secretMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="border-stego-accent/20 focus:border-stego-accent"
          />
        </div>
      )}
      <Input
        type="password"
        placeholder="Enter your secret key"
        value={secretKey}
        onChange={(e) => onKeyChange(e.target.value)}
        className="border-stego-accent/20 focus:border-stego-accent"
      />
    </div>
  );
};