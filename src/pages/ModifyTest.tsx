import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import type { Test, Question } from "../api/TestApi";

export default function ModifyTestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ lấy test từ state (truyền khi navigate)
  const stateTest = (location.state as { test?: Test })?.test;
  const [test, setTest] = useState<Test | null>(stateTest || null);
  const [loading, setLoading] = useState(false);

  if (!test) {
    return <div>Không có dữ liệu để chỉnh sửa (hãy upload file Excel trước).</div>;
  }

  // ---- Helpers ----
  const handleChange = (
    taskIndex: number,
    sectionIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    if (!test) return;
    const updated: Test = JSON.parse(JSON.stringify(test));
    const q = updated.tasks[taskIndex].sections[sectionIndex].questions[
      questionIndex
    ].question as Question;
    (q as any)[field] = value;
    setTest(updated);
  };

  const handleChoiceChange = (
    taskIndex: number,
    sectionIndex: number,
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    if (!test) return;
    const updated: Test = JSON.parse(JSON.stringify(test));
    const q = updated.tasks[taskIndex].sections[sectionIndex].questions[
      questionIndex
    ].question as Question;
    if (q.choices) q.choices[choiceIndex].text = value;
    setTest(updated);
  };

  const handleCorrectChoice = (
    taskIndex: number,
    sectionIndex: number,
    questionIndex: number,
    choiceIndex: number,
    checked: boolean
  ) => {
    if (!test) return;
    const updated: Test = JSON.parse(JSON.stringify(test));
    const q = updated.tasks[taskIndex].sections[sectionIndex].questions[
      questionIndex
    ].question as Question;
    if (!q.keys) q.keys = [];
    if (checked) {
      if (!q.keys.includes(choiceIndex)) q.keys.push(choiceIndex);
    } else {
      q.keys = q.keys.filter((k) => k !== choiceIndex);
    }
    setTest(updated);
  };

  // ✅ gửi POST một test (giống UpdateTestPage)
  const handleAccept = async () => {
    if (!test) return;
    try {
      setLoading(true);
      await axios.post("http://[::1]:8000/api/test", test);
      alert("Lưu thành công!");
      navigate(-1);
    } catch (err) {
      console.error("Lỗi lưu:", err);
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Modify Test
      </Typography>

      <TextField
        fullWidth
        label="Tên đề"
        sx={{ mb: 2 }}
        value={test.testName}
        onChange={(e) => setTest({ ...test, testName: e.target.value })}
      />

      <TextField
        fullWidth
        label="Loại đề"
        sx={{ mb: 3 }}
        value={test.type}
        disabled
      />

      <TextField
        select
        fullWidth
        label="Trạng thái"
        sx={{ mb: 3 }}
        value={test.active ? "active" : "inactive"}
        onChange={(e) =>
          setTest({ ...test, active: e.target.value === "active" })
        }
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>

      {test.tasks.map((task, taskIndex) => (
        <Card key={taskIndex} sx={{ mb: 3 }}>
          <CardContent>
            {test.type === "listening" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                File Audio
              </Typography>

              {/* Hiển thị audio hiện tại */}
              {task.audio && (
                <Box sx={{ mb: 2 }}>
                  <audio controls src={task.audio} style={{ width: "100%" }} />
                  <Typography variant="body2" color="text.secondary">
                    {task.audio}
                  </Typography>
                </Box>
              )}

              {/* Upload file mới */}
              <Button
                variant="contained"
                component="label"
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Chọn file audio mới"}
                <input
                  type="file"
                  hidden
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("audio", file);

                    try {
                      setLoading(true);
                      const res = await axios.post(
                        "http://[::1]:8000/api/test/audio",
                        formData,
                        {
                          headers: { "Content-Type": "multipart/form-data" },
                        }
                      );

                      const url = res.data.urls?.[0];
                      if (url) {
                        const updated = { ...test };
                        updated.tasks[taskIndex].audio = url;
                        setTest(updated);
                      } else {
                        alert("Không nhận được URL từ server!");
                      }
                    } catch (err) {
                      console.error("Lỗi upload audio:", err);
                      alert("Lỗi khi tải audio!");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </Button>
            </Box>
          )}



            {test.type === "reading" && (
              <TextField
                fullWidth
                label="Đoạn văn / Passage"
                multiline
                sx={{ mb: 3 }}
                value={task.passage || ""}
                onChange={(e) => {
                  const updated = { ...test };
                  updated.tasks[taskIndex].passage = e.target.value;
                  setTest(updated);
                }}
              />
            )}

            {task.sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {section.title}
                </Typography>

                {section.questions.map((q, qIndex) => {
                  const ques = q.question as Question;
                  return (
                    <Card key={qIndex} sx={{ mb: 2, p: 2 }}>
                      {/* Hiện question nếu có */}
                      {ques.type !== "fill" || (ques.type === "fill" && ques.question) ? (
                        <TextField
                          fullWidth
                          label={`Câu hỏi ${qIndex + 1}`}
                          multiline
                          sx={{ mb: 2 }}
                          value={ques.question}
                          onChange={(e) =>
                            handleChange(taskIndex, sectionIndex, qIndex, "question", e.target.value)
                          }
                        />
                      ) : null}

                      {/* Fill có đáp án */}
                      {ques.type === "fill" && (
                        <TextField
                          fullWidth
                          label="Đáp án"
                          sx={{ mb: 2 }}
                          value={ques.key || ""}
                          onChange={(e) =>
                            handleChange(taskIndex, sectionIndex, qIndex, "key", e.target.value)
                          }
                        />
                      )}

                      {/* Choice có nhiều đáp án */}
                      {ques.type === "choice" &&
                        ques.choices?.map((choice, cIndex) => (
                          <Box key={cIndex} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                            <TextField
                              fullWidth
                              label={`Đáp án ${cIndex + 1}`}
                              value={choice.text}
                              onChange={(e) =>
                                handleChoiceChange(taskIndex, sectionIndex, qIndex, cIndex, e.target.value)
                              }
                            />
                            <input
                              type="checkbox"
                              checked={ques.keys?.includes(cIndex) || false}
                              onChange={(e) =>
                                handleCorrectChoice(taskIndex, sectionIndex, qIndex, cIndex, e.target.checked)
                              }
                            />
                            <Typography variant="body2">Đúng</Typography>
                          </Box>
                        ))}
                    </Card>
                  );
                })}
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleAccept} disabled={loading}>
          {loading ? "Saving..." : "Save test"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    </Container>
  );
}
