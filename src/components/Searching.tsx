import "./css/Searching.css";

import { useState } from "react";

export default function Searching({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="search-box">
      {/* <span className="search-icon">🔍</span> */}
      <input
        type="text"
        placeholder="Enter username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-btn" onClick={() => onSearch(query)}>
        Search
      </button>
    </div>
  );
}

