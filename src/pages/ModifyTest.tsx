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
import ImageManager from "../components/ImageUpload";

export default function ModifyTestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ lấy test từ state (truyền khi navigate)
  const stateTest = (location.state as { test?: Test })?.test;
  const [test, setTest] = useState<Test | null>(stateTest || null);
  const [loading, setLoading] = useState(false);
  const urls = import.meta.env.VITE_TEST_API_URL;
  const [errors, setErrors] = useState<any>({});

  const validateTest = () => {
  const newErrors: any = {};

  // Test name
  if (!test?.testName?.trim()) {
    newErrors.testName = "Test name không được để trống";
  }

  test?.tasks.forEach((task, taskIndex) => {

    // Reading → passage
    if (test.type === "reading" && !task.passage?.trim()) {
      newErrors[`task_${taskIndex}_passage`] = "Passage cannot be empty";
      console.log("a")
    }

    task.sections.forEach((section, sectionIndex) => {

      // Section title
      if (!section.title?.trim() && test.type !== "writing") {
        newErrors[`section_${taskIndex}_${sectionIndex}_title`] =
          "Section title cannot be empty";
          console.log("b")
      }

      // Questions
      section.questions.forEach((q, qIndex) => {
        const ques = q.question as Question;

        // Question text
        if (!ques.question?.trim()) {
          newErrors[`q_${taskIndex}_${sectionIndex}_${qIndex}_question`] =
            "Question cannot be empty";
            console.log("c")
        }

        if(test.type === "writing" ) {
        // Fill → answer required
        if (ques.type === "fill" ) {
          newErrors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`] =
            "Answer cannot be empty";
            console.log("d")
        }

        // Choice → text + at least 1 correct
        if (ques.type === "choice") {
          ques.choices?.forEach((choice, cIndex) => {
            if (!choice.text?.trim()) {
              newErrors[
                `choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`
              ] = "Choice cannot be empty";
              console.log("e")
            }
          });
        }
          if (ques.type === "choice") {
          if (!ques.keys || ques.keys.length === 0) {
            newErrors[
              `choice_key_${taskIndex}_${sectionIndex}_${qIndex}`
            ] = "Must choose at least one correct answer";
            console.log("f")
          }
        }
        }
      });
    });
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const uploadImage = async (file: File) => {
  const form = new FormData();
  form.append("image", file);
  const res = await axios.post(`${urls}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

const deleteImage = async (url: string) => {
  await axios.delete(`${urls}/image`, { params: { url } });
};


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
    if (!validateTest()) {
    alert("Please fill in all fields completely!");
    return;
  }
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
        error={!!errors.testName}
        helperText={errors.testName}
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
                error={!!errors[`task_${taskIndex}_passage`]}
                helperText={errors[`task_${taskIndex}_passage`]}
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
            {test.type !== "writing" && (
            <ImageManager
              label="Task Image"
              image={task.image}
              loading={loading}
              onUpload={async (file) => {
                setLoading(true);
                const url = await uploadImage(file);

                setTest(prev => {
                  if (!prev) return prev;
                  const updated = structuredClone(prev);
                  updated.tasks[taskIndex].image = url;
                  return updated;
                });

                setLoading(false);
              }}
              onDelete={async () => {
                if (!task.image) return;
                setLoading(true);

                await deleteImage(task.image);

                setTest(prev => {
                  if (!prev) return prev;
                  const updated = structuredClone(prev);
                  updated.tasks[taskIndex].image = undefined;
                  return updated;
                });

                setLoading(false);
              }}
            />
            )}

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
                        // console.log(res);
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
                {(test.type !== "writing") && (
                <TextField
                  fullWidth
                  label="Section Title"
                  sx={{ mb: 2 }}
                  value={section.title}
                  error={!!errors[`section_${taskIndex}_${sectionIndex}_title`]}
                  helperText={errors[`section_${taskIndex}_${sectionIndex}_title`]}
                  onChange={(e) => {
                    const updated = { ...test };
                    updated.tasks[taskIndex].sections[sectionIndex].title = e.target.value;
                    setTest(updated);
                  }}
                />
                )}

                {/* --- Upload và hiển thị ảnh cho SECTION --- */}
                <Box sx={{ mb: 3 }}>
                  {/* Hiển thị ảnh hiện tại nếu có */}
                  {(test.type !== "writing") && (
                  <ImageManager
                    label="Section Image"
                    image={section.image}
                    loading={loading}
                    onUpload={async (file) => {
                      setLoading(true);
                      const url = await uploadImage(file);

                      setTest(prev => {
                        if (!prev) return prev;
                        const updated = structuredClone(prev);
                        updated.tasks[taskIndex].sections[sectionIndex].image = url;
                        return updated;
                      });

                      setLoading(false);
                    }}
                    onDelete={async () => {
                      if (!section.image) return;
                      setLoading(true);

                      await deleteImage(section.image);

                      setTest(prev => {
                        if (!prev) return prev;
                        const updated = structuredClone(prev);
                        updated.tasks[taskIndex].sections[sectionIndex].image = undefined;
                        return updated;
                      });

                      setLoading(false);
                    }}
                  />
                  )}
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
                          error={!!errors[`q_${taskIndex}_${sectionIndex}_${qIndex}_question`]}
                          helperText={errors[`q_${taskIndex}_${sectionIndex}_${qIndex}_question`]}
                          onChange={(e) =>
                            handleChange(taskIndex, sectionIndex, qIndex, "question", e.target.value)
                          }
                        />
                      ) : null}

                      {/* Fill có đáp án */}
                      {test.type !== "writing" && (
                        <>
                      {ques.type === "fill" && (
                        <TextField
                          fullWidth
                          label="Answer"
                          sx={{ mb: 2 }}
                          value={ques.key || ""}
                          error={!!errors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`]}
                          helperText={errors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`]}
                          onChange={(e) =>
                            handleChange(taskIndex, sectionIndex, qIndex, "key", e.target.value)
                          }
                        />
                      )}
                      </>
                    )}
                      {/* 🖼️ Upload ảnh cho question dạng writing */}
                      {test.type === "writing" && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Image for Question
                          </Typography>

                          {/* Hiển thị ảnh hiện tại nếu có */}
                          <ImageManager
                            label="Question Image"
                            image={typeof ques === "object" ? (ques as Question).image : undefined}
                            loading={loading}
                            onDelete={async () => {
                              if (typeof ques !== "object") return;
                              setLoading(true);

                              await axios.delete(`${urls}/image`, { params: { url: ques.image } });

                              setTest((prev) => {
                                if (!prev) return prev;
                                const updated = { ...prev };

                                updated.tasks = [...prev.tasks];
                                updated.tasks[taskIndex].sections = [...prev.tasks[taskIndex].sections];
                                const qs = [...updated.tasks[taskIndex].sections[sectionIndex].questions];
                                (qs[qIndex].question as Question).image = undefined;
                                updated.tasks[taskIndex].sections[sectionIndex].questions = qs;

                                return updated;
                              });

                              setLoading(false);
                            }}
                            onUpload={async (file) => {
                              if (typeof ques !== "object") return;
                              setLoading(true);

                              const form = new FormData();
                              form.append("image", file);

                              const res = await axios.post(`${urls}/image`, form, {
                                headers: { "Content-Type": "multipart/form-data" },
                              });

                              const url = res.data.url;

                              setTest((prev) => {
                                if (!prev) return prev;
                                const updated = { ...prev };

                                updated.tasks = [...prev.tasks];
                                updated.tasks[taskIndex].sections = [...prev.tasks[taskIndex].sections];
                                const qs = [...updated.tasks[taskIndex].sections[sectionIndex].questions];
                                (qs[qIndex].question as Question).image = url;
                                updated.tasks[taskIndex].sections[sectionIndex].questions = qs;

                                return updated;
                              });

                              setLoading(false);
                            }}
                          />

                        </Box>
                      )}

                      {/* Choice có nhiều đáp án */}
                      {test.type !== "writing" && (
                        <>
                      {ques.type === "choice" &&
                        ques.choices?.map((choice, cIndex) => (
                          <Box key={cIndex} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                            <TextField
                              fullWidth
                              label={`Answer ${cIndex + 1}`}
                              value={choice.text}
                              error={!!errors[`choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`]}
                              helperText={errors[`choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`]}
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
                            {errors[`choice_key_${taskIndex}_${sectionIndex}_${qIndex}`] && (
                              <Typography color="red">
                                {errors[`choice_key_${taskIndex}_${sectionIndex}_${qIndex}`]}
                              </Typography>
                            )}
                          </Box>
                        ))}
                        </>
                      )}
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
