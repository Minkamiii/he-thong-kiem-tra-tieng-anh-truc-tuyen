import { useState, useEffect } from "react";
import axios from "axios";
import Searching from "../components/Searching";
import TestCard from "../components/TopicCard";
import UploadFile from "../components/UploadFile";
import { Pagination, Stack } from "@mui/material";
import type { Test } from "../api/TestApi";
import { useNavigate } from "react-router-dom";

export default function Reading({ type }: { type: String }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // ✅ phân trang
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(0);

  // Fetch dữ liệu theo page
  const fetchTests = async (page: number) => {
    setFetching(true);
    try {
      const url = `http://[::1]:8000/api/test/type/${type}?page=${page}`;
      const res = await axios.get(url);

      const data = res.data;
      setTests(data.data || []);
      setFilteredTests(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi fetch reading tests:", error);
      setTests([]);
      setFilteredTests([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTests(currentPage);
  }, [currentPage, type]);

  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  // Search test
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredTests(tests);
    } else {
      const lower = query.toLowerCase();
      setFilteredTests(
        tests.filter((t) => t.testName.toLowerCase().includes(lower))
      );
    }
  };

  // Upload file Excel
  const handleConfirm = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://[::1]:8000/api/test/excel",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedTests: Test = res.data;



    if (uploadedTests) {
      navigate("/test/modify", { state: { test: uploadedTests } });
    } else {
      alert("File không có test nào!");
    }
    } catch (error) {
      console.error(error);
      alert("Upload thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: "16px", color: "#004080" }}>List Test</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Searching onSearch={handleSearch} />

        {selectedFile ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              style={{
                backgroundColor: "#004080",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "UpLoading..." : "Confirm"}
            </button>
            <span style={{ fontStyle: "italic", color: "#333" }}>
              {selectedFile.name}
            </span>
          </div>
        ) : (
          <UploadFile onFileSelect={(file) => setSelectedFile(file)} />
        )}
      </div>

      {fetching ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredTests.map((test, index) => (
              <TestCard
                key={index}
                test={test}
                detailPath={`/test/detail/${test._id}`}
              />
            ))}
          </div>

          {totalPages >= 1 && (
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
    </>
  );
}
