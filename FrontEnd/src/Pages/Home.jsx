import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "prismjs/themes/prism-tomorrow.css";

/* ─── Inline styles (no App.css dependency for theme) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #020b18;
    font-family: 'Syne', sans-serif;
    color: #c8e6ff;
    overflow: hidden;
    height: 100vh;
  }

  /* ── Liquid blobs ── */
  .blob-wrap {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    animation: floatBlob linear infinite;
  }
  .blob-1 { width: 600px; height: 600px; background: #0057ff; top: -200px; left: -150px; animation-duration: 18s; }
  .blob-2 { width: 500px; height: 500px; background: #00d4b4; bottom: -180px; right: -100px; animation-duration: 22s; animation-direction: reverse; }
  .blob-3 { width: 400px; height: 400px; background: #7000ff; top: 30%; left: 40%; animation-duration: 15s; }

  @keyframes floatBlob {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(40px, -30px) scale(1.08); }
    66%  { transform: translate(-20px, 40px) scale(0.95); }
    100% { transform: translate(0, 0) scale(1); }
  }

  /* ── Grid overlay ── */
  .grid-overlay {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── Main layout ── */
  .home-wrap {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    gap: 0;
  }

  /* ── Panels ── */
  .panel {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 14px;
    height: 100vh;
    overflow: hidden;
  }
  .panel-left  { border-right: 1px solid rgba(0,200,255,0.1); }
  .panel-right { background: rgba(2, 15, 30, 0.4); }

  /* ── Top bar ── */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .logo {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, #00d4b4, #0080ff, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }

  /* ── Select ── */
  .lang-select {
    background: rgba(0,180,220,0.08);
    border: 1px solid rgba(0,200,255,0.2);
    color: #7dd3fc;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300d4b4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .lang-select:hover { border-color: rgba(0,212,180,0.5); background-color: rgba(0,212,180,0.1); }
  .lang-select option { background: #071525; color: #c8e6ff; }

  /* ── File upload ── */
  .file-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 10px;
    border: 1px dashed rgba(0,200,255,0.25);
    background: rgba(0,100,200,0.06);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #7dd3fc;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .file-label:hover {
    border-color: rgba(0,212,180,0.5);
    background: rgba(0,212,180,0.08);
    color: #00d4b4;
  }
  .file-label input { display: none; }
  .file-name {
    font-size: 11px;
    color: #00d4b4;
    font-family: 'JetBrains Mono', monospace;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
  }

  /* ── Editor wrapper ── */
  .editor-shell {
    flex: 1;
    border-radius: 14px;
    border: 1px solid rgba(0,200,255,0.12);
    background: rgba(2, 10, 22, 0.7);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    backdrop-filter: blur(8px);
    box-shadow: inset 0 0 60px rgba(0,80,200,0.05), 0 0 0 1px rgba(0,200,255,0.05);
  }
  .editor-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(0,200,255,0.08);
    flex-shrink: 0;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #febc2e; }
  .dot-g { background: #28c840; }
  .editor-label {
    margin-left: 6px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: rgba(120,180,220,0.5);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .editor-inner {
    flex: 1;
    overflow: auto;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 13.5px !important;
    line-height: 1.7 !important;
  }
  .editor-inner::-webkit-scrollbar { width: 5px; }
  .editor-inner::-webkit-scrollbar-track { background: transparent; }
  .editor-inner::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 3px; }

  /* ── Analyze button ── */
  .analyze-btn {
    position: relative;
    padding: 14px 0;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #0057ff 0%, #00d4b4 50%, #7000ff 100%);
    background-size: 200% 200%;
    animation: gradShift 4s ease infinite;
    color: #fff;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 24px rgba(0,120,255,0.3);
  }
  .analyze-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,120,255,0.45); }
  .analyze-btn:hover::before { opacity: 1; }
  .analyze-btn:active { transform: translateY(0); }
  .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  @keyframes gradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ── Ripple on button ── */
  .analyze-btn .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: scale(0);
    animation: rippleAnim 0.6s linear;
    pointer-events: none;
  }
  @keyframes rippleAnim {
    to { transform: scale(4); opacity: 0; }
  }

  /* ── Right panel ── */
  .right-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(0,200,255,0.08);
  }
  .right-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(120,180,220,0.6);
  }
  .status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00d4b4;
    box-shadow: 0 0 8px #00d4b4;
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .review-shell {
    flex: 1;
    overflow-y: auto;
    border-radius: 14px;
    border: 1px solid rgba(0,200,255,0.1);
    background: rgba(2, 10, 22, 0.6);
    backdrop-filter: blur(8px);
    padding: 20px;
    font-size: 14px;
    line-height: 1.75;
    color: #b0d4f0;
  }
  .review-shell img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    display: block;
    margin: 12px auto;
    border: 1px solid rgba(0,200,255,0.15);
  }
  .review-shell::-webkit-scrollbar { width: 5px; }
  .review-shell::-webkit-scrollbar-track { background: transparent; }
  .review-shell::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 3px; }

  .review-shell h1,h2,h3 { color: #7dd3fc; margin: 16px 0 8px; }
  .review-shell code {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(0,200,255,0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12.5px;
    color: #00d4b4;
  }
  .review-shell pre code { background: transparent; padding: 0; }
  .review-shell pre {
    border-radius: 10px;
    border: 1px solid rgba(0,200,255,0.1);
    overflow: auto;
    margin: 12px 0;
  }

  /* ── Loader ── */
  .loader-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .loader-wrap.show { opacity: 1; pointer-events: all; }
  .liquid-loader {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: conic-gradient(#00d4b4, #0080ff, #7000ff, #00d4b4);
    animation: spin 1.2s linear infinite;
    position: relative;
  }
  .liquid-loader::after {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: #020b18;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-text {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(120,180,220,0.5);
    animation: blink 1.5s ease infinite;
  }
  @keyframes blink { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

  /* ── Empty state ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    opacity: 0.35;
    user-select: none;
  }
  .empty-icon { font-size: 48px; }
  .empty-text { font-size: 13px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
`;

function Home() {
  const [review, setReview]     = useState("");
  const [code, setCode]         = useState(`cout<<"WRITE YOUR CODE HERE";`);
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const btnRef = useRef(null);

  /* inject CSS once */
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  /* file handler */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    setCode(text);
    setFileName(file.name);
  };

  /* ripple */
  const handleRipple = (e) => {
    const btn = btnRef.current;
    const r = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    r.className = "ripple";
    r.style.cssText = `width:${rect.width}px;height:${rect.width}px;left:${e.clientX - rect.left - rect.width / 2}px;top:${e.clientY - rect.top - rect.width / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  };

  /* review */
  const reviewCode = async (e) => {
    handleRipple(e);
    setReview("");
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3000/ai/get-review", { code });
      setReview(data);
    } catch (err) {
      setReview("Error while analyzing code ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Background ── */}
      <div className="blob-wrap">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="grid-overlay" />

      <div className="home-wrap">

        {/* ════ LEFT ════ */}
        <div className="panel panel-left">

          {/* topbar */}
          <div className="topbar">
            <span className="logo">⬡ CodeFlow</span>

            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {["cpp","javascript","python","java","html","react","css","r","react-native","c","dotnet","flutter"]
                .map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>

            <label className="file-label">
              <span>📂</span>
              <span>{fileName || "Upload File"}</span>
              <input
                type="file"
                accept=".js,.jsx,.ts,.cpp,.c,.java,.py,.html,.css,.rb,.go,.rs"
                onChange={handleFile}
              />
            </label>
          </div>

          {/* editor */}
          <div className="editor-shell">
            <div className="editor-header">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
              <span className="editor-label">
                {fileName || "editor"}
              </span>
            </div>
            <div className="editor-inner">
              <Editor
                value={code}
                onValueChange={(c) => setCode(c)}
                highlight={(c) =>
                  Prism.languages[language]
                    ? Prism.highlight(c, Prism.languages[language], language)
                    : Prism.highlight(c, Prism.languages.javascript, "javascript")
                }
                padding={16}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  minHeight: "100%",
                  background: "transparent",
                  color: "#c8e6ff",
                }}
              />
            </div>
          </div>

          {/* button */}
          <button
            ref={btnRef}
            className="analyze-btn"
            onClick={reviewCode}
            disabled={isLoading}
          >
            {isLoading ? "⏳ Analyzing..." : "✦ Analyze Code"}
          </button>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="panel panel-right">
          <div className="right-header">
            <div className="status-dot" />
            <span className="right-title">AI Review</span>
          </div>

          <div className="review-shell">
            {/* loader */}
            <div className={`loader-wrap ${isLoading ? "show" : ""}`}
              style={{ display: isLoading ? "flex" : "none" }}>
              <div className="liquid-loader" />
              <span className="loader-text">Thinking...</span>
            </div>

            {/* empty */}
            {!isLoading && !review && (
              <div className="empty-state">
                <span className="empty-icon">🔬</span>
                <span className="empty-text">Paste or upload code, then analyze</span>
              </div>
            )}

            {/* review */}
            {!isLoading && review && (
              <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default Home;