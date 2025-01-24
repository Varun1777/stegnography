import { useState, useCallback } from "react";
import { FileTypeSelector } from "./FileTypeSelector";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

type FileType = "image" | "audio" | "video";
type Mode = "encode" | "decode";

const ACCEPTED_TYPES = {
  image: "image/*",
  audio: "audio/*",
  video: "video/*",
};

// For demonstration, we'll store the encoded message in memory
// In a real app, this would be handled by proper steganography algorithms
let encodedMessage = "";

export const Steganography = () => {
  const [fileType, setFileType] = useState<FileType>("image");
  const [mode, setMode] = useState<Mode>("encode");
  const [file, setFile] = useState<File | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string>("");
  const [decodedFileUrl, setDecodedFileUrl] = useState<string>("");
  const [isKeyCorrect, setIsKeyCorrect] = useState(false);
  const { toast } = useToast();

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (mode === "decode") {
        // In decode mode, verify the key and extract the message
        if (secretKey === "1234") { // In a real app, this would be properly hashed
          setIsKeyCorrect(true);
          // Set the decoded message to what was previously encoded
          setDecodedMessage(encodedMessage || "No message found in this file");
          
          // Create preview URL for the decoded file
          if (file) {
            const fileUrl = URL.createObjectURL(file);
            setDecodedFileUrl(fileUrl);
          }
          
          toast({
            title: "File decoded successfully!",
            description: "The hidden message has been extracted.",
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
        // In encode mode, store the message (in a real app, this would use steganography)
        encodedMessage = secretMessage;
        
        toast({
          title: "Message encoded successfully!",
          description: "Your message has been hidden in the file.",
        });

        // Simulate file download
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
  }, [mode, file, secretMessage, secretKey, toast]);

  const isValid = file && secretKey && (mode === "decode" || secretMessage);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setDecodedMessage("");
    setDecodedFileUrl("");
    setFile(null);
    setSecretMessage("");
    setSecretKey("");
    setIsKeyCorrect(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => handleModeChange("encode")}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
          <Lock className="w-4 h-4 mr-2" />
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => handleModeChange("decode")}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stego-accent to-stego-primary opacity-0 group-hover:opacity-10 transition-opacity" />
          <Unlock className="w-4 h-4 mr-2" />
          Decode
        </Button>
      </div>

      {/* File Type Selection */}
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

          {/* Decoded Content Display */}
          {mode === "decode" && isKeyCorrect && (decodedMessage || decodedFileUrl) && (
            <div className="space-y-4">
              {/* Decoded Message */}
              <Alert className="bg-stego-accent/10 border-stego-accent/20">
                <AlertDescription className="font-medium text-stego-primary">
                  <span className="block font-semibold mb-1">Extracted Message:</span>
                  {decodedMessage}
                </AlertDescription>
              </Alert>

              {/* File Preview */}
              {decodedFileUrl && (
                <div className="mt-4">
                  <p className="text-sm text-stego-muted mb-2">Original File:</p>
                  <div className="rounded-lg overflow-hidden border border-stego-accent/20">
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
            </div>
          )}

          {/* Process Button */}
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
