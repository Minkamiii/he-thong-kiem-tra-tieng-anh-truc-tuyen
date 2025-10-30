import { useState, useEffect } from "react";
import axios from "axios";
import TestCard from "../components/TopicCard";
import UploadFile from "../components/UploadFile";
import {
  Pagination,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import type { Test } from "../api/TestApi";
import { useNavigate } from "react-router-dom";
import SearchingTest from "../components/SearchingTest";

export default function Reading({ type }: { type: string }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // 🧩 Fetch tests
  const fetchTests = async (filters?: {
  testName?: string;
  active?: string;
  fromto?: string;
}) => {
  setFetching(true);
  try {
    let url = `http://localhost:8000/api/test?page=${currentPage}&type=${type}`;
    if (filters?.testName)
      url += `&testName=${encodeURIComponent(filters.testName)}`;
    if (filters?.active) url += `&active=${filters.active}`;
    if (filters?.fromto)
  url += `&fromto=${filters.fromto}`;

    const res = await axios.get(url);
    const data = res.data;

    setTests(data.data || []);
    setTotalPages(data.totalPages || 1);
  } catch (error) {
    console.error("Lỗi khi fetch tests:", error);
    setTests([]);
  } finally {
    setFetching(false);
  }
};

  useEffect(() => {
    fetchTests();
  }, [currentPage, type]);

  // 🧠 Upload file Excel
  const handleConfirm = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/test/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedTests: Test = res.data;
      if (uploadedTests) {
        navigate("/test/modify", { state: { test: uploadedTests } });
      } else {
        alert("File has no test!");
      }

      fetchTests();
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  // 🧹 Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
  };

  // 📥 Tải file mẫu
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/test/download/Ntemplate");

      console.log("File mẫu đã được tải:", response.data);
    } catch (error) {
      console.error("Lỗi khi tải file mẫu:", error);
      alert("Cannot download template file. Please try again!");
    }
  };

  return (
    <>
      <Typography
        variant="h5"
        sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
      >
        List {type} test
      </Typography>

      {/* 🔍 Thanh tìm kiếm + nút thêm */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <SearchingTest 
        key={type}
        onSearch={(filters) => {
          setCurrentPage(1);
          fetchTests(filters);
        }} />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#004080" }}
          onClick={() => setOpenDialog(true)}
        >
          Add test
        </Button>
      </Box>

      {/* 📃 Danh sách test */}
      {fetching ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : tests.length === 0 ? (
        <Typography align="center" sx={{ color: "text.secondary", py: 4 }}>
          No tests to display
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                detailPath={`/test/detail/${test._id}`}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          )}
        </>
      )}

      {/* 📤 Dialog upload file */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add test</DialogTitle>
        <DialogContent dividers>
          {/* Chọn file */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            {selectedFile ? (
              <Typography sx={{ fontStyle: "italic", color: "#333" }}>
                {selectedFile.name}
              </Typography>
            ) : (
              <UploadFile onFileSelect={(file) => setSelectedFile(file)} />
            )}
            {selectedFile && (
              <Button onClick={() => setSelectedFile(null)} color="error" variant="text">
                Delete file
              </Button>
            )}
          </Box>

          {/* Hướng dẫn */}
          <Box sx={{ borderTop: "1px solid #ddd", pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Instructions for using the spreadsheet
            </Typography>

            <Typography>
              1️⃣ <b>Use the sample spreadsheet as a template:</b>
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
              <Button variant="outlined" onClick={handleDownloadTemplate}>
                📥 Download template
              </Button>
              <Button
                variant="outlined"
                href="https://docs.google.com/spreadsheets/d/1s2D5DTY9kXgdVJ3l-5neZb2V1ZwxBqqu-KkIxmcWQeM/edit?gid=968405941#gid=968405941"
                target="_blank"
              >
                Open in Google Sheets
              </Button>
            </Stack>

            <Typography sx={{ mb: 1 }}>
              2️⃣ <b>Enter your question data into the spreadsheet.</b> <br />
              <i>Please do not change the format.</i>
            </Typography>

            <Typography>
              3️⃣ <b>Save your changes and upload the spreadsheet.</b>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!selectedFile || loading}
          >
            {loading ? "Loading..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
