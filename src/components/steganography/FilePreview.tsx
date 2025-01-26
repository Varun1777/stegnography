interface FilePreviewProps {
  fileUrl: string;
  fileType: "image" | "audio" | "video";
}

export const FilePreview = ({ fileUrl, fileType }: FilePreviewProps) => {
  if (!fileUrl) return null;

  return (
    <div className="mt-4 animate-fade-in">
      <p className="text-sm text-stego-muted mb-2">Original File:</p>
      <div className="rounded-lg overflow-hidden border border-stego-accent/20 animate-scale-in">
        {fileType === "image" && (
          <img
            src={fileUrl}
            alt="Original content"
            className="w-full h-auto max-h-[300px] object-contain"
          />
        )}
        {fileType === "video" && (
          <video
            src={fileUrl}
            controls
            className="w-full h-auto max-h-[300px]"
          />
        )}
        {fileType === "audio" && (
          <audio
            src={fileUrl}
            controls
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};