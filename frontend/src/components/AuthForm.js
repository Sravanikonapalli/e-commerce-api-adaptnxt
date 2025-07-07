import React, { useState } from "react";

export default function AuthForm({ setUser, setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("customer");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        // SIGNUP flow
        const res = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        alert("Signup successful. Please login.");
        setIsSignup(false);
        return;
      }

      // LOGIN flow
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      setUser(payload);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(payload));
    } catch (err) {
      alert(err.message || "Operation failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>{isSignup ? "Signup" : "Login"}</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {isSignup && (
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <button>{isSignup ? "Signup" : "Login"}</button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)} style={{ marginTop: "10px" }}>
        {isSignup ? "Have an account? Login" : "New here? Signup"}
      </button>
    </div>
  );
}
