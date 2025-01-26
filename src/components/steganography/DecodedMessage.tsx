import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare } from "lucide-react";

interface DecodedMessageProps {
  showMessage: boolean;
  message: string;
}

export const DecodedMessage = ({ showMessage, message }: DecodedMessageProps) => {
  if (!showMessage || !message) return null;

  return (
    <div className="animate-fade-in">
      <Alert className="bg-gradient-to-r from-stego-accent/10 to-stego-primary/10 border-stego-accent/20">
        <MessageSquare className="h-4 w-4" />
        <AlertDescription className="mt-2">
          <div className="font-medium text-lg text-stego-primary animate-fade-in">
            Hidden Message:
          </div>
          <div className="mt-2 p-4 bg-white/50 rounded-lg shadow-inner animate-scale-in">
            {message}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};