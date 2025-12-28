import { useState } from "react";
import "./css/Login.css";
import { useNavigate } from "react-router-dom";
import authApi from "../api/AuthApi"; // import API login

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      // res: { token, authentication }

    if (res.authentication) {
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      // console.log("111");
      navigate("/home");
    } else {
      setError("Account or password is incorrect");
    }
    } catch (err: any) {
      console.error("Lỗi chi tiết:", err);
      setError(
        err.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="title">🔐 Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            className="input"
          />
        </div>

        <div className="formGroup">
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="input"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
