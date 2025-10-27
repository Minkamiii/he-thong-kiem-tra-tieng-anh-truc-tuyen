import React from "react";
import "./css/TopicCard.css";
import { useNavigate } from "react-router-dom";
import type { Test } from "../api/TestApi";
import { Chip, Stack } from "@mui/material";

interface TestCardProps {
  test: Test;
  detailPath: string; // ✅ sửa thành string
}

const TestCard: React.FC<TestCardProps> = ({ test, detailPath }) => {
  const navigate = useNavigate();

  // Hàm format ngày
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
      {/* Tiêu đề */}
      <h2 className="test-card__title">{test.testName}</h2>

      {/* Thông tin */}
      <div className="test-card__details">
        <span><strong>⏰ {test.type}</strong></span>
        <Chip
          label={test.active ? "ACTIVE" : "INACTIVE"}
          color={test.active ? "success" : "error"}
          variant="filled"
          size="small"
          sx={{ ml: 1 }}
        />
      </div>

      {/* Ngày tạo & cập nhật */}
      <div className="test-card__info">
        <p><strong>CreatAt:</strong> {formatDate(test.createdAt)}</p>
        <p><strong>UpdateAt:</strong> {formatDate(test.updatedAt)}</p>
      </div>

      {/* Nút */}
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
