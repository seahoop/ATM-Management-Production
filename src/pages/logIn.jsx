import "../pagesCss/logIn.css";

function Login() {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  console.log(API_BASE_URL, "apibase url");

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-text">HABO</span>
          <span className="logo-dot"></span>
          <span className="logo-text-secondary">BERLIN</span>
        </div>

        <h2 className="login-title">Welcome to the Future of Banking</h2>

        <div className="login-backdrop">
          <div className="berlin-skyline"></div>
        </div>

        <p className="login-message">Please authenticate to continue</p>

        <button onClick={handleLogin} className="login-button">
          <span className="button-text">Access Account</span>
          <span className="button-icon">→</span>
        </button>

        <div className="login-footer">
          <span className="security-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Secured Connection
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
