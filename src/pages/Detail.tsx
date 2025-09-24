import { useLocation, useParams } from "react-router-dom";
import { fakeTests } from "../api/DataFake";
import type { Test } from "../api/QuestionApi";
import "./css/Detail.css"; // import CSS riêng

export default function Detail() {
  const location = useLocation();
  const { id } = useParams(); // lấy id từ URL

  // nếu có location.state thì ưu tiên dùng, nếu không thì tìm từ fakeTests
  const test: Test | undefined =
    (location.state as any)?.test || fakeTests.find((_, idx) => String(idx + 1) === id);

  if (!test) {
    return <p className="detail-notfound">Không tìm thấy bài test</p>;
  }

  return (
    <div className="detail-container">
      <h1 className="detail-title">{test.testName}</h1>
      <p className="detail-type">Type: {test.type}</p>

      {test.tasks.map((task, tIndex) => (
        <div key={tIndex} className="task-container">
          <h2 className="task-heading">Passage:</h2>
          <p className="task-passage">{task.passage}</p>

          {task.sections.map((section, sIndex) => (
            <div key={sIndex} className="section-container">
              <h3 className="section-title">{section.title}</h3>

              {section.questions.map((q, qIndex) => (
                <div key={qIndex} className="question-box">
                  <p className="question-text">{q.question.question}</p>

                  {/* Trắc nghiệm */}
                  {q.question.type === "choice" && q.question.choices && (
                    <ul className="choice-list">
                      {q.question.choices.map((choice, cIndex) => {
                        const isCorrect = q.question.keys?.includes(cIndex);
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

                  {/* Điền từ */}
                  {q.question.type === "fill" && (
                    <p className="fill-answer">
                      Đáp án: <span>{q.question.key}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
