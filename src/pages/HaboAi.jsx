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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInputValue("");
    setIsLoading(true);

    // Show typing indicator
    setMessages((prev) => [...prev, { isTyping: true, sender: "ai" }]);

    try {
      console.log('Sending message to AI:', userMessage);
      console.log('Current user:', user);
      
      // Use the authenticated API utility
      const data = await authenticatedFetch('/api/chat', {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('AI response received:', data);

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      setMessages((prev) => [...prev, { text: data.message, sender: "ai" }]);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });

      // Remove typing indicator if it exists
      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      // Show error message with details if available
      setMessages((prev) => [
        ...prev,
        {
          text: `I'm sorry, I encountered an error while processing your request: ${
            error.message || "Unknown error"
          }. Please try again later.`,
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="haboai-container">
      <div className="haboai-card">
        <div className="haboai-header">
          <div className="haboai-logo">
            <span className="logo-text">HABO</span>
            <span className="logo-dot"></span>
            <span className="logo-text-secondary">AI</span>
          </div>
          <button onClick={handleBack} className="back-button">
            <span>←</span> Dashboard
          </button>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user-message" : "ai-message"
                }`}
              >
                {message.isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <div className="message-text">{message.text}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HaboAi;
