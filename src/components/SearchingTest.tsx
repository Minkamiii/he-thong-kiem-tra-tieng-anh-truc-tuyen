import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchFilters {
  testName: string;
  active: string;
  from: string;
  to: string;
}

export default function SearchingTest({
  onSearch,
  onReset,
}: {
  onSearch: (filters: { testName?: string; fromto?: string; active?: string }) => void;
  onReset?: () => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>({
    testName: "",
    active: "",
    from: "",
    to: "",
  });

  // 👉 hàm reset form
  const handleReset = () => {
    setFilters({ testName: "", active: "", from: "", to: "" });
    onReset?.(); // gọi callback nếu có
  };

  const handleSearchClick = () => {
    let fromto = "";
    if (filters.from && filters.to) {
      const from = filters.from.split("-").reverse().join("");
      const to = filters.to.split("-").reverse().join("");
      fromto = `${from}-${to}`;
    }

    onSearch({
      testName: filters.testName,
      fromto,
      active: filters.active,
    });
  };
  

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      <TextField
        label="Tên đề"
        size="small"
        value={filters.testName}
        onChange={(e) => setFilters({ ...filters, testName: e.target.value })}
      />
      <TextField
        label="Trạng thái"
        select
        size="small"
        value={filters.active}
        onChange={(e) => setFilters({ ...filters, active: e.target.value })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Tất cả</MenuItem>
        <MenuItem value="true">Đang hoạt động</MenuItem>
        <MenuItem value="false">Đã ẩn</MenuItem>
      </TextField>
      <TextField
        label="Từ ngày"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters.from}
        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
      />
      <TextField
        label="Đến ngày"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters.to}
        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
      />
      <Button variant="contained" onClick={handleSearchClick}>
        Tìm kiếm
      </Button>
      <Button variant="outlined" color="inherit" onClick={handleReset}>
        Reset
      </Button>
    </Box>
  );
}
