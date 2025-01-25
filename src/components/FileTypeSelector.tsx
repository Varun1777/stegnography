import { AudioLines, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type FileType = "image" | "audio" | "video";

interface FileTypeSelectorProps {
  selectedType: FileType;
  onTypeSelect: (type: FileType) => void;
}

export const FileTypeSelector = ({
  selectedType,
  onTypeSelect,
}: FileTypeSelectorProps) => {
  const types = [
    { id: "image" as FileType, icon: Image, label: "Image" },
    { id: "audio" as FileType, icon: AudioLines, label: "Audio" },
    { id: "video" as FileType, icon: Video, label: "Video" },
  ];

  return (
    <div className="flex gap-6 justify-center">
      {types.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTypeSelect(id)}
          className={cn(
            "flex flex-col items-center p-6 rounded-xl transition-all duration-300",
            "hover:bg-stego-accent/10 hover:scale-105 transform",
            "border-2",
            selectedType === id
              ? "border-stego-accent bg-stego-accent/5 text-stego-accent scale-105"
              : "border-transparent text-stego-muted hover:border-stego-accent/20"
          )}
        >
          <Icon className="w-10 h-10 mb-3" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};