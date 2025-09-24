import { useState } from "react";
import { fakeTests } from "../api/DataFake";
import Searching from "../components/Searching";
import TestCard from "../components/TopicCard";
import UploadFile from "../components/UploadFile";

export default function Reading() {
  const [filteredTests, setFilteredTests] = useState(fakeTests);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredTests(fakeTests); // nếu ô trống thì hiển thị tất cả
    } else {
      const lower = query.toLowerCase();
      setFilteredTests(
        fakeTests.filter((test) => test.testName.toLowerCase().includes(lower))
      );
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: "16px", color: "#004080" }}>Danh sách Test</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Searching onSearch={handleSearch} />
        <UploadFile onFileSelect={(file) => console.log("Chọn file:", file)} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        {filteredTests.map((test, index) => (
          <TestCard key={index} test={test} detailPath={"/reading/detail"} />
        ))}
      </div>
    </>
  );
}
