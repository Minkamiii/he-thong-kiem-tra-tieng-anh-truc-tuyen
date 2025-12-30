import React from "react";
import "./css/TopicCard.css";
import { useNavigate } from "react-router-dom";
import type { Test } from "../api/TestApi";
import { Chip } from "@mui/material";

interface TestCardProps {
  test: Test;
  detailPath: string;
}

const TestCard: React.FC<TestCardProps> = ({ test, detailPath }) => {
  const navigate = useNavigate();

  const formatDate = (iso?: string) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="test-card">
      <h2 className="test-card__title">{test.testName}</h2>

      <div className="test-card__details">
        <span><strong>{test.type}</strong></span>
        <Chip
          label={test.active ? "Active" : "Inactive"}
          color={test.active ? "success" : "error"}
          variant="filled"
          size="small"
          sx={{ ml: 1 }}
        />
      </div>

      <div className="test-card__info">
        <p><strong>CreatAt:</strong> {formatDate(test.createdAt)}</p>
        <p><strong>UpdateAt:</strong> {formatDate(test.updatedAt)}</p>
      </div>

      <button
        className="test-card__button"
        onClick={() => navigate(detailPath, { state: { test } })}
      >
        Details
      </button>
    </div>
  );
};

export default TestCard;
