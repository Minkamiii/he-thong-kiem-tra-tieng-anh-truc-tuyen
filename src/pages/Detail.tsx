import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import type { Test } from "../api/QuestionApi";
import "./css/Detail.css";

export default function Detail() {
  const { id } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>(null);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_TEST_API_URL;
  const progressUrl = "http://localhost:8080/api/submit/progressforadmin";

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        // Gọi song song 2 API
        const [testRes, progressRes] = await Promise.all([
          axios.get(`${url}/${id}`),
          axios
            .get(`${progressUrl}?test_id=${id}`)
            .catch((err) => {
              if (err.response && err.response.status === 404) {
                console.warn("Không có dữ liệu progress (404).");
                return null; // ✅ Không ném lỗi, chỉ trả về null
              }
              // throw err; // Các lỗi khác vẫn ném ra
            }),
        ]);

        setTest(testRes.data);
        console.log("Test Data:", testRes.data);

        if (progressRes && progressRes.data) {
          setProgressData(progressRes.data.data);
          // console.log("Progress Data:", progressRes.data);
        } else {
          setProgressData(null); // Không hiển thị phần Submit report
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);


  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this test?");
    if (!confirmDelete) return;
    console.log("Deleting test with ID:", id);
    console.log("DELETE URL:", `${url}/${id}`);   
    try {
      await axios.delete(`${url}/${id}`);
      alert("Delete successful!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi xóa test:", error);
      alert("An error occurred while deleting!");
    }
  };

  const handleUpdate = () => {
    if (!id) return;
    navigate(`/test/update/${id}`);
  };

  if (loading) return <p className="detail-notfound">Loading...</p>;
  if (!test) return <p className="detail-notfound">Test not found</p>;

  const wrongIds = progressData?.["100% answered wrong question"] || [];

  return (
    <div className="detail-container">
      {/* --- THÔNG TIN TEST --- */}
      <h1 className="detail-title">{test.testName}</h1>
      <p className="detail-type">Type: {test.type}</p>

      {/* --- THÔNG TIN TIẾN ĐỘ --- */}
      {progressData && test.type !== "writing" && (
        <div className="progress-info">
          <h2>Submit report</h2>
          {/* <p><strong>Total users done:</strong> {progressData.totalUsersDone}</p>
          <p><strong>Total questions:</strong> {progressData.total_questions}</p> */}
          <p><strong>The highest number of correct answers:</strong> {progressData.highest}</p>
          <p><strong>The lowest number of correct answers:</strong> {progressData.lowest}</p>
          <p>
            <strong>Number of 100% wrong questions:</strong>{" "}
            {progressData.total_questions}
          </p>
        </div>
      )}

      {test.tasks.map((task, tIndex) => (
        <div key={tIndex} className="task-container">
          {task.passage && (
            <>
              <h2 className="task-heading">Passage:</h2>
              <p className="task-passage">{task.passage}</p>
            </>
          )}
          {task.image && (
            <div className="task-image">
              <img src={task.image} alt="Task illustration" className="detail-image" />
            </div>
          )}
          {task.audio && (
            <>
              <h2 className="task-heading">Audio:</h2>
              <audio controls src={task.audio} />
            </>
          )}

          {task.sections.map((section, sIndex) => (
            <div key={sIndex} className="section-container">
              <h3 className="section-title">
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                  {(section.title ?? "").replace(/\r\n/g, "\n")}
                </ReactMarkdown>
              </h3>

              {section.image && (
                <div className="section-image">
                  <img
                    src={section.image}
                    alt="Section illustration"
                    className="detail-image"
                  />
                </div>
              )}

              {section.questions.map((q, qIndex) => {
                const ques = q.question;
                const isFullyWrong = wrongIds.includes(ques._id);
// console.log("" QID:", ques._id, "wrong?", isFullyWrong, "wrongIds:", wrongIds);
                return (
                  <div
                    key={qIndex}
                    className={`question-box ${isFullyWrong ? "warning" : ""}`}
                  >
                    <p className="question-text">
                      {isFullyWrong && (
                        <span className="warning-label">100% answered wrong</span>
                      )}
                      <br />
                      {ques.question}
                    </p>

                      {ques.image && (
                        <div className="question-image">
                          <img
                            src={ques.image}
                            alt="Question illustration"
                            className="detail-image"
                          />
                        </div>
                      )}


                    {ques.type === "choice" && ques.choices && (
                      <ul className="choice-list">
                        {ques.choices.map((choice, cIndex) => {
                          const isCorrect = ques.keys?.includes(cIndex);
                          return (
                            <li
                              key={cIndex}
                              className={`choice-item ${isCorrect ? "correct" : ""}`}
                            >
                              {choice.text}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {ques.type === "fill" && (
                      <p className="fill-answer">
                        Đáp án: <span>{ques.key}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* --- NÚT HÀNH ĐỘNG --- */}
      <div className="detail-actions">
        <button className="btn-update" onClick={handleUpdate}>
          Update
        </button>
        <button className="btn-delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
