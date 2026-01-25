import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

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
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered"| "answered">("all");

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
      console.log("answers", ansRes.data.data);
      setTest(testRes.data || null);
    } catch (err) {
      alert("Can the find the test because it is deleted");
      navigate(-1);
    }
  };

  useEffect(() => {
    if (id && idTest && tasks) loadData(id, idTest, tasks);
    console.log("Params:", idTest);
  }, [id, idTest]);

  console.log("answer state", answers);

  const getUserAnswer = (questionId: string) => {
    return answers.find((a) => a.id_question === questionId);
  };

  const isUnanswered = (userAns: any) => {
    if (!userAns) return true;
    const ans = userAns.answer;
    return String(ans).length === 0|| Object.keys(ans).length === 0;
  };

  const isCorrect = (question: any, userAns: any) => {
  if (!userAns || isUnanswered(userAns)) return false;

  // Trường hợp type = FILL → có trường correct
  if (userAns.type === "FILL") {
    return userAns.correct;
  }

  // Trường hợp type = CHOICE → đúng nếu có ít nhất 1 lựa chọn true
  if (userAns.type === "CHOICE" && typeof userAns.answer === "object") {
  const correctKeys = Array.isArray(question.keys) ? question.keys : [question.key];
  const selectedKeys = Object.entries(userAns.answer)
    .filter(([_, v]) => v === true)
    .map(([k]) => Number(k));

  // Kiểm tra: phải chọn đủ và không chọn sai
  const isExactlyCorrect =
    selectedKeys.length === correctKeys.length &&
    correctKeys.every((key: number) => selectedKeys.includes(key));

  return isExactlyCorrect;
}

  // Trường hợp khác (viết, essay...) mặc định là false hoặc tuỳ xử lý thêm
  return false;
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      > 
        {/* Bộ lọc */}
        {test.type === TestType.WRITING
          ? [
              { key: "all", label: "ALL" },
              { key: "answered", label: "ANSWERED" },
              { key: "unanswered", label: "UNANSWERED" },
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
                  fontWeight: "bold",
                  minWidth: "130px",
                }}
              >
                {label}
              </button>
            ))
          : [
              { key: "all", label: "ALL" },
              { key: "correct", label: "CORRECT" },
              { key: "incorrect", label: "INCORRECT" },
              { key: "unanswered", label: "UNANSWERED" },
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
                  fontWeight: "bold",
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

            if (test.type === TestType.WRITING) {
              if (filter === "all") return true;
              if (filter === "answered") return !isUnanswered(userAns);
              if (filter === "unanswered") return isUnanswered(userAns);
              return true;
            }

            if (filter === "all") return true;
            if (filter === "correct") return userAns && correct;
            if (filter === "incorrect") return userAns && !isUnanswered(userAns) && !correct;
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

            {task.image && <img src={task.image} style={{maxWidth: "80%", maxHeight:"80%"}}/>}

            {visibleSections.map((section: any, secIndex: number) => (
              <div key={secIndex} style={{ marginTop: "16px",display:"flex", flexDirection:"column" }}>
                <h4 style={{ color: "#1976d2", marginBottom: "10px" }}>
                  {section.title}
                </h4>

                {section.image && <img src={section.image} style={{maxWidth: "70%", maxHeight:"70%", alignSelf: "center"}}/>}

                {section.questions.map((q: any, i: number) => {
                  const userAns = getUserAnswer(q.question._id);
                  const correct = isCorrect(q.question, userAns);
                  const unanswered = isUnanswered(userAns);

                  const bgColor =q.question.type === "essay"
                    ? "#f5f5f5"
                    : unanswered
                    ? "#f5f5f5"
                    : correct
                    ? "#d4edda"
                    : "#f8d7da";


                  const userAnswerText =
                    typeof userAns?.answer === "object"
                      ? Object.entries(userAns.answer).map(([k, v]) => {
                          const label = String.fromCharCode(65 + Number(k));
                          return (
                            <span
                              key={k}
                              style={{
                                color: v ? "green" : "red",
                                fontWeight: "bold",
                                marginRight: "8px",
                              }}
                            >
                              {label}
                            </span>
                          );
                        })
                      : userAns?.answer;

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
                        display:"flex",
                        flexDirection: "column",
                      }}
                    >
                      <p>
                        <b>Q{q.index + 1}:</b>{" "}
                        {q.question.question || ``}
                      </p>

                      {q.question.image && <img src={q.question.image} style={{maxWidth: "70%", maxHeight:"70%", alignSelf:"center", marginBottom:"20px"}}/>}

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
 
                  { test.type === TestType.WRITING ? (
                    <div style={{ display: "flex", gap: "16px" }}>
                      {/* Your Answer */}
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "12px",
                          backgroundColor: "#f5f5f5",
                          height: "750px",       // chiều cao cố định
                          overflowY: "auto",     // scroll nếu nội dung dài
                        }}
                      >
                        <p style={{ fontWeight: "bold", marginBottom: "6px" }}>Your Answer:</p>
                        <Typography sx={{ whiteSpace: "pre-wrap", color: "#525151" }}>
                          {userAnswerText}
                        </Typography>
                      </div>

                      {/* AI Recommendation */}
                      {userAns?.ai_recommend && (
                        <div
                          style={{
                            flex: 1,
                            border: "1px solid #1976d2",
                            borderRadius: "8px",
                            padding: "12px",
                            backgroundColor: "#e3f2fd",
                            height: "750px",       // cùng chiều cao với Your Answer
                            overflowY: "auto",     // scroll nếu dài
                          }}
                        >
                          <p style={{ fontWeight: "bold", marginBottom: "6px", color: "#1976d2" }}>
                            AI Recommended:
                          </p>
                          <ReactMarkdown
                            children={userAns.ai_recommend}
                            components={{
                              a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" />
                              ),
                            }}
                          />
                        </div>
                      )}
                    </div>
                      ) : unanswered ? (
                        <>
                          <p style={{ color: "grey", fontWeight: "bold" }}>
                            Your Answer: Unanswered
                          </p>

                          <p style={{ color: "green", fontWeight: "bold" }}>
                            Correct answer: {correctAnswerText}
                          </p>
                          
                        </>
                      ) : correct ? (
                        <p style={{ color: "green", fontWeight: "bold" }}>
                          Your Answer: {userAnswerText}
                        </p>
                      ) : (
                        <>
                          <p style={{ color: "red", fontWeight: "bold" }}>
                            Your Answer: {userAnswerText}
                          </p>
                          <p style={{ color: "green", fontWeight: "bold" }}>
                            Correct Answer: {correctAnswerText}
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
        Back
      </div>
    </div>
  );
}
