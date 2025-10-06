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
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchTest = async () => {
      try {
        const res = await axios.get(`http://[::1]:8000/api/test/${id}`);
        console.log(id);
        setTest(res.data);
      } catch (error) {
        console.error("Lỗi fetch chi tiết test:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài test này?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://[::1]:8000/api/test/${id}`);
      alert("Xóa thành công!");
      navigate(-1); // chuyển về trang danh sách hoặc home
    } catch (error) {
      console.error("Lỗi khi xóa test:", error);
      alert("Có lỗi xảy ra khi xóa!");
    }
  };

  const handleUpdate = () => {
    if (!id) return;
    navigate(`/test/update/${id}`); // điều hướng sang trang update
  };

  if (loading) return <p className="detail-notfound">Đang tải dữ liệu...</p>;
  if (!test) return <p className="detail-notfound">Không tìm thấy bài test</p>;

  return (
    <div className="detail-container">
      <h1 className="detail-title">{test.testName}</h1>
      <p className="detail-type">Type: {test.type}</p>

      {test.tasks.map((task, tIndex) => (
        <div key={tIndex} className="task-container">
          {task.passage && (
            <>
              <h2 className="task-heading">Passage:</h2>
              <p className="task-passage">{task.passage}</p>
            </>
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
                    {(section.title??"").replace(/\r\n/g, "\n")}
                  </ReactMarkdown>
              </h3>
              {section.questions.map((q, qIndex) => {
                const ques = q.question;
                return (
                  <div key={qIndex} className="question-box">
                    <p className="question-text">{ques.question}</p>

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
                    {ques.type === "essay" && (
                    <div className="essay-answer">
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* Thêm 2 nút ở cuối trang */}
      <div className="detail-actions">
        <button className="btn-update" onClick={handleUpdate}>Update</button>
        <button className="btn-delete" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
