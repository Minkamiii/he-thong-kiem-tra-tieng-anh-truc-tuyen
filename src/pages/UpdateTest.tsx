import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function UpdateTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const urls = import.meta.env.VITE_TEST_API_URL;
  const [errors, setErrors] = useState<any>({});

  const validateTest = () => {
    const newErrors: any = {};

    if (!test?.testName?.trim()) {
      newErrors.testName = "Test name can not be empty";
    }

    test?.tasks.forEach((task, taskIndex) => {
      if (test.type === "reading" && !task.passage?.trim()) {
        newErrors[`task_${taskIndex}_passage`] = "Passage can not be empty";
      }

      task.sections.forEach((section, sectionIndex) => {
        if (!section.title?.trim() && test.type !== "writing") {
          newErrors[`section_${taskIndex}_${sectionIndex}_title`] =
            "Section title can not be empty";
        }

        section.questions.forEach((q, qIndex) => {
          const ques = q.question;

          if (!ques.question?.trim() && ques.type !== "fill") {
            newErrors[`q_${taskIndex}_${sectionIndex}_${qIndex}_question`] =
              "Question can not be empty";
          }

          if (ques.type === "fill" && !ques.key?.trim()) {
            newErrors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`] =
              "Answer can not be empty";
          }

          if (ques.type === "choice") {
            ques.choices?.forEach((c, cIndex) => {
              if (!c.text?.trim()) {
                newErrors[
                  `choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`
                ] = "Choice can not be empty";
              }
            });

            if (!ques.keys || ques.keys.length === 0) {
              newErrors[
                `choice_key_${taskIndex}_${sectionIndex}_${qIndex}`
              ] = "Must choose at least one correct answer";
            }
          }
        });
      });
    });

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    axios.get(`${urls}/${id}`).then((res) => {
      setTest(res.data);
    });
  }, [id]);

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
    if (q.choices) {
      q.choices[choiceIndex].text = value;
    }
    setTest(updated);
  };

  const handleCorrectChoice = (
    taskIndex: number,
    sectionIndex: number,
    questionIndex: number,
    choiceIndex: number
  ) => {
    if (!test) return;
    const updated: Test = JSON.parse(JSON.stringify(test));
    const q = updated.tasks[taskIndex].sections[sectionIndex].questions[
      questionIndex
    ].question as Question;
    q.keys = [choiceIndex];
    setTest(updated);
  };

  const handleAccept = async () => {
    console.log("Validating test before update:", test);
    if (!test) return;
    if (!validateTest()) {
      alert("Please fill in all fields completely!");
      return;
    }
    try {
      const { createdAt, updatedAt, __v, ...cleaned } = test as any;
      // console.log("Gửi test:", cleaned);
      await axios.put(`${urls}/${id}`, cleaned);
      alert("Update successful!");
      navigate(-1);
    } catch (err) {
      console.error("Lỗi update:", err);
      alert("An error occurred!");
    }
  };

  if (!test) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" color="black" gutterBottom>
        Update Test
      </Typography>

      <TextField
        fullWidth
        label="Test Name"
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
                    maxHeight: "200px",
                    overflow: "auto",
                  },
                }}
              />
            )}

            {test.type !== "writing" && (
              <ImageManager
                label="Task Image"
                image={task.image}
                loading={loading}
                onDelete={async () => {
                  setLoading(true);
                  await axios.delete(`${urls}/image`, { params: { url: task.image } });

                  setTest((prev) => {
                    if (!prev) return prev;
                    const updated = { ...prev };
                    updated.tasks = [...prev.tasks];
                    updated.tasks[taskIndex].image = undefined;
                    return updated;
                  });

                  setLoading(false);
                }}
                onUpload={async (file) => {
                  setLoading(true);
                  const formData = new FormData();
                  formData.append("image", file);

                  const res = await axios.post(`${urls}/image`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });

                  const url = res.data.url;

                  setTest((prev) => {
                    if (!prev) return prev;
                    const updated = { ...prev };
                    updated.tasks = [...prev.tasks];
                    updated.tasks[taskIndex].image = url;
                    return updated;
                  });

                  setLoading(false);
                }}
              />
            )}

            {test.type === "listening" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Audio
                </Typography>
                {task.audio && (
                  <audio
                    controls
                    src={task.audio}
                    style={{ display: "block", marginBottom: "10px" }}
                  />
                )}

                {/* Input file để upload */}
                <Button
                  variant="contained"
                  component="label"
                  sx={{ textTransform: "none" }}
                >
                  Select file MP3
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("audio", file);

                      try {
                        const res = await axios.post(
                          `${urls}/audio`,
                          formData,
                          { headers: { "Content-Type": "multipart/form-data" } }
                        );

                        const url = res.data.urls?.[0];
                        if (url) {
                          const updated = { ...test };
                          updated.tasks[taskIndex].audio = url;
                          setTest(updated);
                          alert("Audio file uploaded successfully!");
                        } else {
                          alert("Could not get URL from server!");
                        }
                      } catch (err) {
                        console.error("Lỗi upload audio:", err);
                        alert("Error uploading audio!");
                      }

                      e.target.value = "";
                    }}
                  />
                </Button>
              </Box>
            )}

            {/* Writing: bỏ qua passage + audio, chỉ hiển thị sections */}
            {task.sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mb: 3 }}>
                {test.type !== "writing" && (
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


                {/* --- Thêm phần upload ảnh cho section --- */}
                {test.type !== "writing" && (
                  <ImageManager
                    label="Section Image"
                    image={section.image}
                    loading={loading}
                    onDelete={async () => {
                      setLoading(true);
                      await axios.delete(`${urls}/image`, {
                        params: { url: section.image },
                      });

                      setTest((prev) => {
                        if (!prev) return prev;
                        const updated = { ...prev };

                        updated.tasks = [...prev.tasks];
                        updated.tasks[taskIndex].sections = [...prev.tasks[taskIndex].sections];

                        updated.tasks[taskIndex].sections[sectionIndex].image = undefined;
                        return updated;
                      });

                      setLoading(false);
                    }}
                    onUpload={async (file) => {
                      setLoading(true);
                      const formData = new FormData();
                      formData.append("image", file);

                      const res = await axios.post(`${urls}/image`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });

                      const url = res.data.url;

                      setTest((prev) => {
                        if (!prev) return prev;
                        const updated = { ...prev };

                        updated.tasks = [...prev.tasks];
                        updated.tasks[taskIndex].sections = [...prev.tasks[taskIndex].sections];

                        updated.tasks[taskIndex].sections[sectionIndex].image = url;
                        return updated;
                      });

                      setLoading(false);
                    }}
                  />
                )}


                {section.questions.map((q, qIndex) => {
                  const ques = q.question as Question;
                  return (
                    <Card key={qIndex} sx={{ mb: 2, p: 2 }}>
                      {/* Luôn hiển thị câu hỏi cho tất cả type, trừ khi muốn ẩn rõ ràng */}
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
                            handleChange(
                              taskIndex,
                              sectionIndex,
                              qIndex,
                              "question",
                              e.target.value
                            )
                          }
                        />
                      ) : null}

                      {/* Writing: cho phép thêm ảnh cho từng câu hỏi */}
                      {test.type === "writing" && (
                        <ImageManager
                          label="Question Image"
                          image={typeof ques === "object" ? ques.image : undefined}
                          loading={loading}
                          onDelete={async () => {
                            if (typeof ques !== "object") return;

                            setLoading(true);
                            await axios.delete(`${urls}/image`, {
                              params: { url: ques.image },
                            });

                            setTest((prev) => {
                              if (!prev) return prev;
                              const updated = { ...prev };

                              const qCopy =
                                updated.tasks[taskIndex]
                                  .sections[sectionIndex]
                                  .questions[qIndex]
                                  .question as Question;

                              qCopy.image = undefined;

                              return updated;
                            });

                            setLoading(false);
                          }}
                          onUpload={async (file) => {
                            if (typeof ques !== "object") return;

                            setLoading(true);

                            const formData = new FormData();
                            formData.append("image", file);

                            const res = await axios.post(`${urls}/image`, formData, {
                              headers: { "Content-Type": "multipart/form-data" },
                            });

                            const url = res.data.url;

                            setTest((prev) => {
                              if (!prev) return prev;
                              const updated = { ...prev };

                              const qCopy =
                                updated.tasks[taskIndex]
                                  .sections[sectionIndex]
                                  .questions[qIndex]
                                  .question as Question;

                              qCopy.image = url;

                              return updated;
                            });

                            setLoading(false);
                          }}
                        />
                      )}


                      {/* Fill: có thêm ô đáp án */}
                      {ques.type === "fill" && (
                        <TextField
                          fullWidth
                          label="Answer"
                          sx={{ mb: 2 }}
                          value={ques.key || ""}
                          error={!!errors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`]}
                          helperText={errors[`fill_${taskIndex}_${sectionIndex}_${qIndex}_key`]}
                          onChange={(e) =>
                            handleChange(
                              taskIndex,
                              sectionIndex,
                              qIndex,
                              "key",
                              e.target.value
                            )
                          }
                        />
                      )}

                      {/* Choice: nhiều đáp án + cho phép chọn nhiều đúng */}
                      {ques.type === "choice" &&
                        ques.choices?.map((choice, cIndex) => (
                          <Box
                            key={cIndex}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 1,
                            }}
                          >
                            <TextField
                              fullWidth
                              label={`Answer ${cIndex + 1}`}
                              value={choice.text}
                              error={!!errors[`choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`]}
                              helperText={errors[`choice_${taskIndex}_${sectionIndex}_${qIndex}_${cIndex}`]}
                              onChange={(e) =>
                                handleChoiceChange(
                                  taskIndex,
                                  sectionIndex,
                                  qIndex,
                                  cIndex,
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="checkbox"
                              checked={ques.keys?.includes(cIndex) || false}
                              onChange={(e) => {
                                if (!test) return;
                                const updated: Test = JSON.parse(JSON.stringify(test));
                                const q = updated.tasks[taskIndex].sections[sectionIndex].questions[qIndex].question as Question;
                                if (!q.keys) q.keys = [];
                                if (e.target.checked) {

                                  q.keys.push(cIndex);
                                } else {

                                  q.keys = q.keys.filter((k) => k !== cIndex);
                                }
                                setTest(updated);
                              }}
                            />
                            <Typography variant="body2">Correct</Typography>
                            {errors[`choice_key_${taskIndex}_${sectionIndex}_${qIndex}`] && (
                              <Typography color="red">
                                {errors[`choice_key_${taskIndex}_${sectionIndex}_${qIndex}`]}
                              </Typography>
                            )}
                          </Box>
                        ))}

                      {/* Essay: chỉ cần sửa question (đã hiển thị ở trên rồi) */}
                    </Card>
                  );
                })}
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}


      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleAccept}>
          Accept
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    </Container>
  );
}
