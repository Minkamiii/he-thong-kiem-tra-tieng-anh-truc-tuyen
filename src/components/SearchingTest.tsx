import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";

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
        label="Testname"
        size="small"
        value={filters.testName}
        onChange={(e) => setFilters({ ...filters, testName: e.target.value })}
      />
      <TextField
        label="Status"
        select
        size="small"
        value={filters.active}
        onChange={(e) => setFilters({ ...filters, active: e.target.value })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="true">Active</MenuItem>
        <MenuItem value="false">Inactive</MenuItem>
      </TextField>
      <TextField
        label="From"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters.from}
        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters.to}
        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
      />
      <Button variant="contained" onClick={handleSearchClick}>
        Search
      </Button>
      <Button variant="outlined" color="inherit" onClick={handleReset}>
        Reset
      </Button>
    </Box>
  );
}
