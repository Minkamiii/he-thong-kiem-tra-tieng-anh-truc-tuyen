import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";

enum TestType {
  READING = "reading",
  LISTENING = "listening",
  WRITING = "writing",
}

export default function SubmitDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { idTest: stateIdTest, tasks: stateTasks} = location.state || {};
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<any[]>([]);
  const [test, setTest] = useState<any>(null);
  const [idTest, setIdTest] = useState<string | null>(stateIdTest || null);
  const [tasks, setTasks] = useState<number[] | null>(stateTasks || null);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");

  const loadData = async (submitId: string, testId: string, tasks: number[]) => {
    try {
      const [ansRes, testRes] = await Promise.all([
        axios.get(`${(import.meta as any).env.VITE_BASE_ANSWERS_SERVICE_LINK}/submit/${submitId}`),
        axios.get(`${(import.meta as any).env.VITE_BASE_TEST_SERVICE_LINK}/${testId}/questions`, {
          params: {
            tasks: tasks.join(","),
          }
        }),
      ]);
      setAnswers(ansRes.data.data || []);
      setTest(testRes.data || null);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    }
  };

  useEffect(() => {
    if (id && idTest && tasks) loadData(id, idTest, tasks);
  }, [id, idTest]);

  console.log(answers);

  const getUserAnswer = (questionId: string) => {
    return answers.find((a) => a.id_question === questionId);
  };

  const isUnanswered = (userAns: any) => {
    if (!userAns) return true;
    if (
      userAns.answer === "-" ||
      userAns.answer === null ||
      userAns.answer === "" ||
      (typeof userAns.answer === "object" &&
        Object.values(userAns.answer).every((v) => v === false))
    ) {
      return true;
    }
    return false;
  };

  const isCorrect = (question: any, userAns: any) => {
    if (!userAns || isUnanswered(userAns)) return false;
    const correct = question.keys || question.key;
    const answer = userAns.answer;

    if (Array.isArray(correct)) {
      const correctLabels = correct.map((k: number) =>
        String.fromCharCode(65 + k)
      );
      const chosenLabels = Object.entries(answer || {})
        .filter(([_, v]) => v)
        .map(([k]) => String.fromCharCode(65 + Number(k)));
      return (
        correctLabels.length === chosenLabels.length &&
        correctLabels.every((c) => chosenLabels.includes(c))
      );
    } else {
      return (
        String(answer).trim().toLowerCase() ===
        String(correct).trim().toLowerCase()
      );
    }
  };

  if (!test) return <p>Loading...</p>;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "24px 32px",
        border: "2px solid #ccc",
        borderRadius: "12px",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {test.testName}
      </h2>

      {/* 🧭 Bộ lọc */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          { key: "all", label: "TẤT CẢ" },
          { key: "correct", label: "ĐÚNG" },
          { key: "incorrect", label: "SAI" },
          { key: "unanswered", label: "CHƯA TRẢ LỜI" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: filter === key ? "2px solid #1976d2" : "1px solid #ccc",
              backgroundColor: filter === key ? "#1976d2" : "white",
              color: filter === key ? "white" : "#1976d2",
              cursor: "pointer",
              fontWeight: 600,
              minWidth: "130px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Danh sách Task */}
      {test.tasks.map((task: any, taskIndex: number) => {
        const filteredSections = task.sections.map((section: any) => {
          const filteredQuestions = section.questions.filter((q: any) => {
            const userAns = getUserAnswer(q.question._id);
            const correct = isCorrect(q.question, userAns);
            if (filter === "all") return true;
            if (filter === "correct") return userAns && correct;
            if (filter === "incorrect") return userAns && !correct && !isUnanswered(userAns);
            if (filter === "unanswered") return isUnanswered(userAns);
            return true;
          });
          return { ...section, questions: filteredQuestions };
        });

        const visibleSections = filteredSections.filter(
          (s: any) => s.questions.length > 0
        );

        if (visibleSections.length === 0) return null;

        return (
          <div key={taskIndex} style={{ marginBottom: "20px" }}>
            <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
              Task {taskIndex + 1}
            </h3>

            {test.type === "listening" && task.audio && (
              <div style={{ margin: "12px 0" }}>
                <audio controls src={task.audio} style={{ width: "100%" }} />
              </div>
            )}

            {test.type === "reading" && task.passage && (
              <div
                style={{
                  margin: "12px 0",
                  padding: "12px 16px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  whiteSpace: "pre-line",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {task.passage}
              </div>
            )}

            {visibleSections.map((section: any, secIndex: number) => (
              <div key={secIndex} style={{ marginTop: "16px" }}>
                <h4 style={{ color: "#1976d2", marginBottom: "10px" }}>
                  {section.title}
                </h4>

                {section.questions.map((q: any) => {
                  const userAns = getUserAnswer(q.question._id);
                  const correct = isCorrect(q.question, userAns);
                  const unanswered = isUnanswered(userAns);

                  const bgColor = unanswered || (test.type === TestType.WRITING)
                    ? "#f5f5f5"
                    : correct
                    ? "#d4edda"
                    : "#f8d7da";

                  const userAnswerText =
                    typeof userAns?.answer === "object"
                      ? Object.entries(userAns.answer)
                          .filter(([_, v]) => v)
                          .map(([k]) => String.fromCharCode(65 + Number(k)))
                          .join(", ") || "—"
                      : userAns?.answer || "—";

                  const correctAnswerText = Array.isArray(q.question.keys)
                    ? q.question.keys
                        .map((k: number) => String.fromCharCode(65 + k))
                        .join(", ")
                    : q.question.key;

                  return (
                    <div
                      key={q.question._id}
                      id={`q-${q.question._id}`}
                      style={{
                        marginBottom: "14px",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        backgroundColor: bgColor,
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      <p>
                        <b>Q{q.index + 1}:</b>{" "}
                        {q.question.question || `Index ${q.index + 1}`}
                      </p>

                      {q.question.type === "choice" && (
                        <ul>
                          {q.question.choices.map((c: any, i: number) => {
                            const label = String.fromCharCode(65 + i);
                            return (
                              <li key={i}>
                                {label}. {c.text}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* ✅ Logic hiển thị */}
                      { test.type === TestType.WRITING ? (
                        <>
                          <p style={{ color: "grey", fontWeight: "bold" }}>
                            📝 Your Answer: {userAnswerText}
                          </p>
                        </>
                      ) : unanswered ? (
                        <>
                          <p style={{ color: "grey", fontWeight: "bold" }}>
                            📝 Your Answer: Chưa trả lời
                          </p>
                          {
                            test.type !== TestType.WRITING && 
                            <p style={{ color: "green", fontWeight: "bold" }}>
                              🔑 Đáp án đúng: {correctAnswerText}
                            </p>
                          }
                        </>
                      ) : correct ? (
                        <p style={{ color: "green", fontWeight: "bold" }}>
                          📝 Your Answer: {userAnswerText}
                        </p>
                      ) : (
                        <>
                          <p style={{ color: "red", fontWeight: "bold" }}>
                            📝 Your Answer: {userAnswerText}
                          </p>
                          <p style={{ color: "green", fontWeight: "bold" }}>
                            🔑 Đáp án đúng: {correctAnswerText}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1976d2",
          color: "white",
          padding: "12px 20px",
          borderRadius: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 1000,
          textAlign: "center",
        }}
        onClick={() => navigate(-1)}
      >
        🔙 Back
      </div>
    </div>
  );
}
