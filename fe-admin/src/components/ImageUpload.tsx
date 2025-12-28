import { Box, Button, Typography } from "@mui/material";

interface ImageManagerProps {
  label: string;
  image?: string;
  loading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function ImageManager({
  label,
  image,
  loading,
  onUpload,
  onDelete,
}: ImageManagerProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {/* Hiển thị ảnh nếu có */}
      {image && (
        <Box sx={{ mb: 2 }}>
          <img
            src={image}
            alt="uploaded"
            style={{
              width: "100%",
              maxHeight: "250px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />

          <Button
            variant="outlined"
            color="error"
            disabled={loading}
            sx={{ mt: 1 }}
            onClick={onDelete}
          >
            Delete Image
          </Button>
        </Box>
      )}

      {/* Upload ảnh */}
      <Button variant="contained" component="label" disabled={loading}>
        {loading ? "Loading..." : "Select new image"}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </Button>
    </Box>
  );
}
