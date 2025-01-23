import { useState, useCallback } from "react";
import { FileTypeSelector } from "./FileTypeSelector";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Unlock, Download } from "lucide-react";

type FileType = "image" | "audio" | "video";
type Mode = "encode" | "decode";

const ACCEPTED_TYPES = {
  image: "image/*",
  audio: "audio/*",
  video: "video/*",
};

export const Steganography = () => {
  const [fileType, setFileType] = useState<FileType>("image");
  const [mode, setMode] = useState<Mode>("encode");
  const [file, setFile] = useState<File | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: mode === "encode" ? "File encoded successfully!" : "Message decoded successfully!",
        description: mode === "encode" 
          ? "Your file is ready for download." 
          : "The secret message has been revealed.",
      });

      // Auto-reset after successful operation
      if (mode === "encode") {
        // Trigger download (mock)
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file!);
        link.download = `encoded_${file!.name}`;
        link.click();
      }
      
      setFile(null);
      setSecretMessage("");
      setSecretKey("");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mode, file, toast]);

  const isValid = file && secretKey && (mode === "decode" || secretMessage);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => setMode("encode")}
          className="gap-2"
        >
          <Lock className="w-4 h-4" />
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => setMode("decode")}
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