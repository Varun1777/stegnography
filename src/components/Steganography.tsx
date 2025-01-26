import { useState, useCallback } from "react";
import { FileTypeSelector } from "./FileTypeSelector";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Download, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LSBSteganography } from "@/utils/lsbSteganography";

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
  const [decodedFileUrl, setDecodedFileUrl] = useState<string>("");
  const [showDecodedMessage, setShowDecodedMessage] = useState(false);
  const [encodedMessage, setEncodedMessage] = useState("");
  const { toast } = useToast();

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (mode === "decode") {
        if (secretKey === "1234" && file) {
          const fileUrl = URL.createObjectURL(file);
          setDecodedFileUrl(fileUrl);
          
          const message = await LSBSteganography.decode(file);
          // Convert binary message to readable text
          const decodedText = message
            .split(" ")
            .map(binary => String.fromCharCode(parseInt(binary, 2)))
            .join("");
          
          setEncodedMessage(decodedText);
          setShowDecodedMessage(true);
          
          toast({
            title: "File decoded successfully!",
            description: "The hidden message has been revealed.",
          });
        } else {
          toast({
            title: "Incorrect secret key",
            description: "Please enter the correct secret key to decode the message.",
            variant: "destructive",
          });
        }
      } else {
        if (file && secretMessage) {
          const encodedBlob = await LSBSteganography.encode(file, secretMessage);
          setEncodedMessage(secretMessage);
          
          const link = document.createElement("a");
          link.href = URL.createObjectURL(encodedBlob);
          link.download = `encoded_${file.name.replace(/\.[^/.]+$/, "")}.png`;
          link.click();
          
          toast({
            title: "Message encoded successfully!",
            description: "Your message has been hidden in the file using LSB steganography.",
          });
          
          setFile(null);
          setSecretMessage("");
          setSecretKey("");
        }
      }
    } catch (error) {
      console.error('Steganography error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mode, file, secretMessage, secretKey, toast]);

  const isValid = file && secretKey && (mode === "decode" || secretMessage);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setDecodedFileUrl("");
    setFile(null);
    setSecretMessage("");
    setSecretKey("");
    setShowDecodedMessage(false);
    setEncodedMessage("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => handleModeChange("encode")}
          className="group relative overflow-hidden w-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
          <Lock className="w-4 h-4 mr-2" />
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => handleModeChange("decode")}
          className="group relative overflow-hidden w-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
          <Unlock className="w-4 h-4 mr-2" />
          Decode
        </Button>
      </div>

      <FileTypeSelector selectedType={fileType} onTypeSelect={setFileType} />

      <Card className="overflow-hidden border-stego-accent/20">
        <CardContent className="p-6 space-y-6">
          <FileUpload
            onFileSelect={setFile}
            acceptedTypes={ACCEPTED_TYPES[fileType]}
            selectedFile={file}
          />

          {mode === "encode" && (
            <div className="space-y-4 animate-fade-in">
              <Input
                placeholder="Enter your secret message"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="border-stego-accent/20 focus:border-stego-accent"
              />
            </div>
          )}

          <Input
            type="password"
            placeholder="Enter your secret key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="border-stego-accent/20 focus:border-stego-accent"
          />

          {mode === "decode" && showDecodedMessage && encodedMessage && (
            <div className="animate-fade-in">
              <Alert className="bg-gradient-to-r from-stego-accent/10 to-stego-primary/10 border-stego-accent/20">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  <div className="font-medium text-lg text-stego-primary animate-fade-in">
                    Hidden Message:
                  </div>
                  <div className="mt-2 p-4 bg-white/50 rounded-lg shadow-inner animate-scale-in">
                    {encodedMessage}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {mode === "decode" && decodedFileUrl && (
            <div className="mt-4 animate-fade-in">
              <p className="text-sm text-stego-muted mb-2">Original File:</p>
              <div className="rounded-lg overflow-hidden border border-stego-accent/20 animate-scale-in">
                {fileType === "image" && (
                  <img
                    src={decodedFileUrl}
                    alt="Original content"
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                )}
                {fileType === "video" && (
                  <video
                    src={decodedFileUrl}
                    controls
                    className="w-full h-auto max-h-[300px]"
                  />
                )}
                {fileType === "audio" && (
                  <audio
                    src={decodedFileUrl}
                    controls
                    className="w-full"
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleProcess}
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
        </CardContent>
      </Card>
    </div>
  );
};