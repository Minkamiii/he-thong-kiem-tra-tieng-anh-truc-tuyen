import { useState } from "react";
import { IconButton } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";

export default function Home() {
  const images = [image1, image2];
  const [index, setIndex] = useState(0);

  const next = () => setIndex((index + 1) % images.length);
  const prev = () => setIndex((index - 1 + images.length) % images.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        borderRadius: "16px",
      }}
    >
      <img
        src={images[index]}
        alt="Slide"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.6s ease-in-out",
        }}
      />

      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          top: "50%",
          left: 20,
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowBackIosNew />
      </IconButton>

      {/* Mũi tên phải */}
      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          top: "50%",
          right: 20,
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowForwardIos />
      </IconButton>
    </div>
  );
}
