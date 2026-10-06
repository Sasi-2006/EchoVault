import { useState } from "react";
import { loginUser } from "../services/auth";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem(
        "echovault_token",
        data.access_token
      );

      localStorage.setItem(
        "echovault_user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          🔐
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to your private EchoVault.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a href="/register">
            Create one
          </a>
        </p>

      </div>
    </div>
  );
}

export default Login;