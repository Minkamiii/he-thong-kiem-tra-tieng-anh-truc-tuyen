import React from "react";

type Props = {
  onFileSelect: (file: File) => void;
};

export default function UploadFile({ onFileSelect }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleChange}
      style={{
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    />
  );
}
