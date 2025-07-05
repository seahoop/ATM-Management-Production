import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🌐 Callback page loaded");

    const API_BASE_URL = process.env.REACT_APP_API_URL;
    fetch(`${API_BASE_URL}/api/user`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not Logged In");
        return res.json();
      })
      .then((user) => {
        console.log("✅ Logged in user:", user);
        navigate("/dashboard", { state: { user } });
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#121212",
        color: "#00C2FF",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          animation: "pulse 1.5s infinite",
        }}
      >
        <h2>Logging in to Habo Banking...</h2>
        <div style={{ marginTop: "20px" }}>Please wait</div>
      </div>
    </div>
  );
}

export default Callback;
