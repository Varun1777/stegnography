import { useState, useCallback } from "react";
import { FileTypeSelector } from "./FileTypeSelector";
import { FileUpload } from "./FileUpload";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LSBSteganography } from "@/utils/lsbSteganography";
import { ModeSelector } from "./steganography/ModeSelector";
import { MessageInputs } from "./steganography/MessageInputs";
import { DecodedMessage } from "./steganography/DecodedMessage";
import { FilePreview } from "./steganography/FilePreview";
import { ProcessButton } from "./steganography/ProcessButton";

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
        if (file && secretKey) {
          const fileUrl = URL.createObjectURL(file);
          setDecodedFileUrl(fileUrl);
          
          const message = await LSBSteganography.decode(file, secretKey);
          setEncodedMessage(message);
          setShowDecodedMessage(true);
          
          toast({
            title: "File decoded successfully!",
            description: "The hidden message has been revealed.",
          });
        }
      } else {
        if (file && secretMessage && secretKey) {
          const encodedBlob = await LSBSteganography.encode(file, secretMessage, secretKey);
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
      <ModeSelector mode={mode} onModeChange={handleModeChange} />
      <FileTypeSelector selectedType={fileType} onTypeSelect={setFileType} />

      <Card className="overflow-hidden border-stego-accent/20">
        <CardContent className="p-6 space-y-6">
          <FileUpload
            onFileSelect={setFile}
            acceptedTypes={ACCEPTED_TYPES[fileType]}
            selectedFile={file}
          />

          <MessageInputs
            mode={mode}
            secretMessage={secretMessage}
            secretKey={secretKey}
            onMessageChange={setSecretMessage}
            onKeyChange={setSecretKey}
          />

          <DecodedMessage
            showMessage={showDecodedMessage}
            message={encodedMessage}
          />

          <FilePreview
            fileUrl={decodedFileUrl}
            fileType={fileType}
          />

          <ProcessButton
            mode={mode}
            isValid={isValid}
            isProcessing={isProcessing}
            onProcess={handleProcess}
          />
        </CardContent>
      </Card>
    </div>
  );
};