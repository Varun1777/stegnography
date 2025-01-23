import { useState, useCallback } from "react";
import { FileTypeSelector } from "./FileTypeSelector";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FileType = "image" | "audio" | "video";
type Mode = "encode" | "decode";

const ACCEPTED_TYPES = {
  image: "image/*",
  audio: "audio/*",
  video: "video/*",
};

// Mock secret key for demonstration
const MOCK_SECRET_KEY = "1234";

export const Steganography = () => {
  const [fileType, setFileType] = useState<FileType>("image");
  const [mode, setMode] = useState<Mode>("encode");
  const [file, setFile] = useState<File | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string>("");
  const [isKeyCorrect, setIsKeyCorrect] = useState(false);
  const { toast } = useToast();

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (mode === "decode") {
        if (secretKey === MOCK_SECRET_KEY) {
          setIsKeyCorrect(true);
          // Simulate decoded message (in real implementation, this would come from actual steganography decoding)
          setDecodedMessage("This is your decoded secret message!");
          toast({
            title: "Message decoded successfully!",
            description: "The secret message has been revealed.",
          });
        } else {
          setIsKeyCorrect(false);
          toast({
            title: "Incorrect secret key",
            description: "Please enter the correct secret key to decode the message.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "File encoded successfully!",
          description: "Your file is ready for download.",
        });

        // Auto-reset after successful operation
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file!);
        link.download = `encoded_${file!.name}`;
        link.click();
        
        // Reset form after encode
        setFile(null);
        setSecretMessage("");
        setSecretKey("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mode, file, secretKey, toast]);

  const isValid = file && secretKey && (mode === "decode" || secretMessage);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setDecodedMessage("");
    setFile(null);
    setSecretMessage("");
    setSecretKey("");
    setIsKeyCorrect(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => handleModeChange("encode")}
          className="gap-2"
        >
          <Lock className="w-4 h-4" />
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => handleModeChange("decode")}
          className="gap-2"
        >
          <Unlock className="w-4 h-4" />
          Decode
        </Button>
      </div>

      <FileTypeSelector selectedType={fileType} onTypeSelect={setFileType} />

      <FileUpload
        onFileSelect={setFile}
        acceptedTypes={ACCEPTED_TYPES[fileType]}
        selectedFile={file}
      />

      {mode === "encode" && (
        <div className="space-y-4">
          <Input
            placeholder="Enter your secret message"
            value={secretMessage}
            onChange={(e) => setSecretMessage(e.target.value)}
          />
        </div>
      )}

      <Input
        type="password"
        placeholder="Enter your secret key"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
      />

      {mode === "decode" && isKeyCorrect && decodedMessage && (
        <Alert>
          <AlertDescription className="font-medium">
            Decoded Message: {decodedMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleProcess}
          disabled={!isValid || isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            "Processing..."
          ) : mode === "encode" ? (
            <>
              <Download className="w-4 h-4" />
              Encode & Download
            </>
          ) : (
            "Decode Message"
          )}
        </Button>
      </div>
    </div>
  );
};