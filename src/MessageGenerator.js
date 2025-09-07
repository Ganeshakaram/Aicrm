import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MessageGenerator.css"; // external stylesheet

export default function MessageGenerator({ onSendToBroadcast }) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [language, setLanguage] = useState("English");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("templates")) || [];
    setTemplates(saved);
  }, []);

  const saveTemplate = (text) => {
    if (!text.trim()) return;
    const updated = [...templates, text];
    setTemplates(updated);
    localStorage.setItem("templates", JSON.stringify(updated));
  };

  const generateMessage = async () => {
    try {
      setLoading(true);
      const question = `${prompt} [Tone: ${tone || "Neutral"}] [Language: ${
        language || "English"
      }] in simple 3 lines with suitable emojies`;

      const res = await axios.post(
        "https://hrushiai-backend.onrender.com/ask",
        { question }
      );

      let aiText =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      aiText = aiText
        .replace(/\{name\}/g, "Ganesh")
        .replace(/\{company\}/g, "TechCorp")
        .replace(/\{date\}/g, new Date().toLocaleDateString());

      setGeneratedMessage(aiText);
    } catch (err) {
      console.error("Error generating message", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    alert("Copied to clipboard!");
  };

  const handleTemplateAction = (text, target = "generator") => {
    if (target === "generator") {
      setGeneratedMessage(text);
    } else if (target === "broadcast") {
      alert(" Broadcasting intigration yet to be done");
    }
  };

  return (
    <div className="msg-card">
      <h2 className="msg-title">Message Generator</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt... (you can use {name}, {company}, {date})"
        className="msg-input"
      />

      <div className="msg-options">
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="msg-dropdown"
        >
          <option>Friendly</option>
          <option>Professional</option>
          <option>Festive</option>
          <option>Casual</option>
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="msg-dropdown"
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Telugu</option>
          <option>Tamil</option>
        </select>
      </div>

      <button onClick={generateMessage} className="msg-btn msg-generate">
        {loading ? "Generating..." : "Generate"}
      </button>

      {generatedMessage && (
        <div className="msg-output">
          <strong>Generated Message:</strong>
          <textarea
            value={generatedMessage}
            onChange={(e) => setGeneratedMessage(e.target.value)}
            className="msg-output-text"
          />

          <div className="msg-actions">
            <button
              onClick={() => saveTemplate(generatedMessage)}
              className="msg-btn msg-save"
            >
              💾 Save as Template
            </button>

            <button onClick={copyToClipboard} className="msg-btn msg-copy">
              📋 Copy
            </button>

            <button
              onClick={() => alert(" Broadcast intigration yet to be done ")}
              className="msg-btn msg-broadcast"
            >
              📤 Send to Broadcast
            </button>
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div className="msg-templates">
          <h3>Saved Templates</h3>
          <ul>
            {templates.map((t, i) => (
              <li key={i} className="msg-template-item">
                <span className="msg-template-text">{t}</span>
                <div className="msg-template-actions">
                  <button
                    onClick={() => handleTemplateAction(t, "generator")}
                    className="msg-btn msg-edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleTemplateAction(t, "broadcast")}
                    className="msg-btn msg-use"
                  >
                    📤 Use
                  </button >
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
