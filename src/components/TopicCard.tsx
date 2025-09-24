import React from "react";
import "./css/TopicCard.css";
import { useNavigate } from "react-router-dom";
import type { Test } from "../api/QuestionApi";
interface TestCardProps {
  test: Test
  detailPath: "/reading/detail"
}

const TestCard: React.FC<TestCardProps> = ({ test, detailPath }) => {
  const navigate = useNavigate();
  return (
    <div className="test-card">
      {/* Tiêu đề */}
      <h2 className="test-card__title">{test.testName}</h2>

      {/* Thông tin */}
      <div className="test-card__details">
        <span>⏰ {test.type}</span> 
      </div>

      {/* Nút */}
      <button className="test-card__button" onClick={() => navigate(detailPath, {state:{test}})}>Chi tiết</button>
    </div>
  );
};

export default TestCard;

