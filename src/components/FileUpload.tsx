import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string;
  selectedFile: File | null;
}

export const FileUpload = ({
  onFileSelect,
  acceptedTypes,
  selectedFile,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.match(acceptedTypes)) {
        onFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a supported file format.",
          variant: "destructive",
        });
      }
    },
    [acceptedTypes, onFileSelect, toast]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300",
        "hover:border-stego-accent hover:bg-stego-accent/5",
        isDragging ? "border-stego-accent bg-stego-accent/5 scale-102" : "border-gray-300",
        "group"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-lg">
          <span className="text-stego-primary font-medium">{selectedFile.name}</span>
          <button
            onClick={() => onFileSelect(null as any)}
            className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-16 w-16 text-gray-400 group-hover:text-stego-accent transition-colors mb-4" />
          <p className="text-sm text-gray-600">
            Drag and drop your file here, or{" "}
            <label className="text-stego-accent cursor-pointer hover:text-stego-accent/80 transition-colors font-medium">
              browse
              <input
                type="file"
                className="hidden"
                accept={acceptedTypes}
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: {acceptedTypes.replace("/*", " files")}
          </p>
        </>
      )}
    </div>
  );
};