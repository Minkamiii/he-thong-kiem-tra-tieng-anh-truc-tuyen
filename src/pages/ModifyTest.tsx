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
  const urls = import.meta.env.VITE_TEST_API_URL;

  if (!test) {
    return <div>No data to edit (please upload Excel file first)!</div>;
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
      await axios.post(`${urls}`, test);
      alert("Save successful!");
      navigate(-1);
    } catch (err) {
      console.error("Lỗi lưu:", err);
      alert("An error occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" color="black" gutterBottom>
        Modify Test
      </Typography>

      <TextField
        fullWidth
        label="Testname"
        sx={{ mb: 2 }}
        value={test.testName}
        onChange={(e) => setTest({ ...test, testName: e.target.value })}
      />

      <TextField
        fullWidth
        label="Type"
        sx={{ mb: 3 }}
        value={test.type}
        disabled
      />

      <TextField
        select
        fullWidth
        label="Status"
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
            {test.type === "reading" && (
              <TextField
                fullWidth
                label="Passage"
                multiline
                value={task.passage || ""}
                onChange={(e) => {
                  const updated = { ...test };
                  updated.tasks[taskIndex].passage = e.target.value;
                  setTest(updated);
                }}
                sx={{
                  mb: 3,
                  "& .MuiInputBase-root": {
                    maxHeight: "200px", // 🔥 giới hạn chiều cao
                    overflow: "auto",   // 🔥 bật thanh cuộn khi quá dài
                  },
                }}
              />
            )}

            {/* Upload và hiển thị ảnh minh họa */}
          <Box sx={{ mb: 3 }}>


            {/* Hiển thị ảnh hiện tại */}
            {task.image && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={task.image}
                  alt="Task illustration"
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        // ✅ Gọi API delete qua query param
                        await axios.delete(`${urls}/image`, {
                          params: { url: task.image },
                        });

                        // ✅ Cập nhật lại state
                        setTest((prev) => {
                          if (!prev) return prev;
                          const updated = { ...prev };
                          updated.tasks = [...prev.tasks];
                          updated.tasks[taskIndex] = {
                            ...updated.tasks[taskIndex],
                            image: undefined,
                          };
                          return updated;
                        });

                        alert("🗑️ Image deleted successfully!");
                      } catch (err) {
                        console.error("Lỗi xóa ảnh:", err);
                        alert("❌ Error deleting image!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Delete image
                  </Button>
                </Box>

              </Box>
            )}

            {/* Upload ảnh mới */}
            <Button variant="contained" component="label" disabled={loading}>
              {loading ? "Loading..." : "Select new image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("image", file);

                  try {
                    setLoading(true);
                    const res = await axios.post(
                      `${urls}/image`, // ✅ dùng localhost thay vì [::1]
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    // ✅ backend trả về { url: "http://..." }
                    const url = res.data.url;
                    if (url) {
                      // ✅ cập nhật test theo cách an toàn (React nhận biết thay đổi)
                      setTest((prev) => {
                        if (!prev) return prev;
                        const updated = { ...prev };
                        updated.tasks = [...prev.tasks];
                        updated.tasks[taskIndex] = {
                          ...updated.tasks[taskIndex],
                          image: url,
                        };
                        return updated;
                      });
                    } else {
                      alert("Could not get URL from server!");
                    }
                  } catch (err) {
                    console.error("Lỗi upload ảnh:", err);
                    alert("Error uploading image!");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </Button>
          </Box>

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
                {loading ? "Loading..." : "Select new audio file"}
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
                        `${urls}/audio`,
                        formData,
                        {
                          headers: { "Content-Type": "multipart/form-data" },
                        }
                      );
                      console.log(res);
                      const url = res.data.urls?.[0];
                      if (url) {
                        const updated = { ...test };
                        updated.tasks[taskIndex].audio = url;
                        setTest(updated);
                      } else {
                        alert("Could not get URL from server!");
                      }
                    } catch (err) {
                      console.error("Lỗi upload audio:", err);
                      alert("Error uploading audio!");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </Button>
            </Box>
          )}

            {task.sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {section.title}
                </Typography>

                {/* --- Upload và hiển thị ảnh cho SECTION --- */}
                <Box sx={{ mb: 3 }}>
                  {/* Hiển thị ảnh hiện tại nếu có */}
                  {section.image && (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={section.image}
                        alt="Section illustration"
                        style={{
                          width: "100%",
                          maxHeight: "250px",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={loading}
                          onClick={async () => {
                            try {
                              setLoading(true);
                              await axios.delete(`${urls}/image`, {
                                params: { url: section.image },
                              });

                              setTest((prev) => {
                                if (!prev) return prev;
                                const updated = { ...prev };
                                updated.tasks = [...prev.tasks];
                                updated.tasks[taskIndex].sections = [
                                  ...updated.tasks[taskIndex].sections,
                                ];
                                updated.tasks[taskIndex].sections[sectionIndex] = {
                                  ...updated.tasks[taskIndex].sections[sectionIndex],
                                  image: undefined,
                                };
                                return updated;
                              });

                              alert("🗑️ Section image deleted successfully!");
                            } catch (err) {
                              console.error("Lỗi xóa ảnh section:", err);
                              alert("❌ Error deleting section image!");
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Delete image
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Nút upload ảnh mới */}
                  <Button variant="contained" component="label" disabled={loading}>
                    {loading ? "Loading..." : section.image ? "Replace section image" : "Select new image"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("image", file);

                        try {
                          setLoading(true);
                          const res = await axios.post(`${urls}/image`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          const url = res.data.url;

                          if (url) {
                            setTest((prev) => {
                              if (!prev) return prev;
                              const updated = { ...prev };
                              updated.tasks = [...prev.tasks];
                              updated.tasks[taskIndex].sections = [
                                ...updated.tasks[taskIndex].sections,
                              ];
                              updated.tasks[taskIndex].sections[sectionIndex] = {
                                ...updated.tasks[taskIndex].sections[sectionIndex],
                                image: url,
                              };
                              return updated;
                            });
                          } else {
                            alert("Could not get URL from server!");
                          }
                        } catch (err) {
                          console.error("Lỗi upload ảnh section:", err);
                          alert("Error uploading section image!");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  </Button>
                </Box>
    {/* --- Hết phần upload ảnh cho SECTION --- */}

                {section.questions.map((q, qIndex) => {
                  const ques = q.question as Question;
                  return (
                    <Card key={qIndex} sx={{ mb: 2, p: 2 }}>
                      {/* Hiện question nếu có */}
                      {ques.type !== "fill" || (ques.type === "fill" && ques.question) ? (
                        <TextField
                          fullWidth
                          label={`Question ${qIndex + 1}`}
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
                          label="Answer"
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
                              label={`Answer ${cIndex + 1}`}
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
                            <Typography variant="body2">Correct</Typography>
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
