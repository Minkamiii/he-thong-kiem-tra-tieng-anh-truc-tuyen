import { useState } from "react";

interface UploadFileProps {
  onFileSelect?: (file: File) => void; // callback khi chọn file
}

export default function UploadFile({ onFileSelect }: UploadFileProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <label
        htmlFor="file-upload"
        style={{
          background: "#ff6600",
          color: "white",
          padding: "8px 16px",
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        📂 Upload
      </label>
      <input
        id="file-upload"
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {fileName && <span>{fileName}</span>}
    </div>
  );
}
