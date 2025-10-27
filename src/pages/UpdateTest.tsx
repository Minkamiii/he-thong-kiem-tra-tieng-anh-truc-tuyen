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

export default function UpdateTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);

  // Fetch test theo id
  useEffect(() => {
    axios.get(`http://[::1]:8000/api/test/${id}`).then((res) => {
      setTest(res.data);
    });
  }, [id]);

  // Cập nhật text field chung
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

  // Cập nhật đáp án choice
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

  // Chọn đáp án đúng (choice)
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

  // Gửi update
  const handleAccept = async () => {
    if (!test) return;
    try {
      // bỏ các field không cần
      const { createdAt, updatedAt, __v, ...cleaned } = test as any;
      console.log("Gửi test:", cleaned);
      await axios.put(`http://[::1]:8000/api/test/${id}`, cleaned);
      alert("Cập nhật thành công!");
      navigate(-1);
    } catch (err) {
      console.error("Lỗi update:", err);
      alert("Có lỗi xảy ra!");
    }
  };

  if (!test) return <div>Đang tải...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Update Test
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
            {/* Listening mới có audio */}
            {test.type === "listening" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Audio
                </Typography>

                {/* Hiển thị audio nếu có */}
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
                  Chọn file MP3
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("audio", file); // 👈 đúng tên theo Swagger

                      try {
                        const res = await axios.post(
                          "http://[::1]:8000/api/test/audio",
                          formData,
                          { headers: { "Content-Type": "multipart/form-data" } }
                        );

                        const url = res.data.urls?.[0];
                        if (url) {
                          const updated = { ...test };
                          updated.tasks[taskIndex].audio = url;
                          setTest(updated);
                          alert("Tải file audio thành công!");
                        } else {
                          alert("Không nhận được URL từ server!");
                        }
                      } catch (err) {
                        console.error("Lỗi upload audio:", err);
                        alert("Lỗi khi tải audio!");
                      }

                      // Reset input để lần sau chọn lại cùng file vẫn trigger onChange
                      e.target.value = "";
                    }}
                  />
                </Button>

                
              </Box>
            )}


      {/* Reading mới có passage */}
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

      {/* Writing: bỏ qua passage + audio, chỉ hiển thị sections */}
      {task.sections.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {section.title}
          </Typography>

          {section.questions.map((q, qIndex) => {
            const ques = q.question as Question;
            return (
              <Card key={qIndex} sx={{ mb: 2, p: 2 }}>
                {/* Luôn hiển thị câu hỏi cho tất cả type, trừ khi muốn ẩn rõ ràng */}
                {ques.type !== "fill" || (ques.type === "fill" && ques.question) ? (
                  <TextField
                    fullWidth
                    label={`Câu hỏi ${qIndex + 1}`}
                    multiline
                    sx={{ mb: 2 }}
                    value={ques.question}
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

                {/* Fill: có thêm ô đáp án */}
                {ques.type === "fill" && (
                  <TextField
                    fullWidth
                    label="Đáp án"
                    sx={{ mb: 2 }}
                    value={ques.key || ""}
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
                        label={`Đáp án ${cIndex + 1}`}
                        value={choice.text}
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
                            // thêm đáp án đúng
                            q.keys.push(cIndex);
                          } else {
                            // bỏ đáp án đúng
                            q.keys = q.keys.filter((k) => k !== cIndex);
                          }
                          setTest(updated);
                        }}
                      />
                      <Typography variant="body2">Đúng</Typography>
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
