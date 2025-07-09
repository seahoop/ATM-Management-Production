import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("🌐 Callback page loaded");

    // Check for JWT token in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log("✅ JWT token received, storing in localStorage");
      localStorage.setItem('authToken', token);
      
      // Extract user info from token (basic parsing)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          sub: payload.sub,
          email: payload.email,
          username: payload.username,
          name: payload.username // Use username as name for display
        };
        console.log("✅ User info from JWT:", user);
        navigate("/dashboard", { state: { user } });
        return;
      } catch (error) {
        console.error("Error parsing JWT:", error);
      }
    }

    // Fallback to session-based auth
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
  }, [navigate, location]);

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
