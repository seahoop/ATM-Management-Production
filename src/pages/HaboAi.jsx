// Behavior: AI chatbot component that provides banking assistance through DeepSeek API
// Exceptions:
// - Throws if user is not authenticated
// - Throws if API calls fail
// Return:
// - JSX: Chat interface with message history and AI responses
// Parameters:
// - None (React component, uses location state for user data)

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { authenticatedFetch } from "../utils/api";
import "../pagesCss/haboai.css";

function HaboAi() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [messages, setMessages] = useState([
    {
      text: `Hello ${
        user?.name || "customer"
      }! I'm Habo AI, your personal banking assistant. How can I help you today?`,
      sender: "ai",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!user) return null;

  const handleBack = () => {
    navigate("/dashboard", { state: { user } });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await authenticatedFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: inputValue }),
      });

      const aiMessage = {
        text: response.message,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="haboai-container">
      <div className="haboai-card">
        <div className="haboai-header">
          <div className="haboai-logo">
            <span className="logo-text">HABO</span>
            <span className="logo-dot"></span>
            <span className="logo-text-secondary">BERLIN</span>
          </div>
          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>

        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === "user" ? "user" : "ai"}`}
              >
                <div className="message-content">{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="message-input"
              rows="3"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HaboAi;
