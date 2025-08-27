"use client";

// /app/page.tsx
// Next.js Secure Hash Demo using SHA-1

import React, { useMemo, useState } from "react";

function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const hex: string[] = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, "0");
    hex[i] = h;
  }
  return hex.join("");
}

function utf8ToBuf(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

async function sha1(data: ArrayBuffer) {
  return crypto.subtle.digest("SHA-1", data);
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"sender" | "receiver">("sender");

  // Sender state
  const [message, setMessage] = useState("");
  const [digest, setDigest] = useState("");
  const [copied, setCopied] = useState(false);

  // Receiver state
  const [recvMessage, setRecvMessage] = useState("");
  const [recvDigest, setRecvDigest] = useState("");
  const [verification, setVerification] = useState<null | boolean>(null);

  const haveWebCrypto = useMemo(
    () => typeof window !== "undefined" && !!window.crypto?.subtle,
    []
  );

  async function handleSender() {
    try {
      if (!haveWebCrypto) throw new Error("Web Crypto not available");
      const buf = utf8ToBuf(message);
      const result = await sha1(buf);
      setDigest(bufToHex(result));
      setCopied(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleFileInput(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await sha1(arrayBuffer);
      setDigest(bufToHex(result));
      setCopied(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReceiver() {
    try {
      if (!haveWebCrypto) throw new Error("Web Crypto not available");
      const buf = utf8ToBuf(recvMessage);
      const result = await sha1(buf);
      const newDigest = bufToHex(result);
      setVerification(newDigest === recvDigest.trim());
    } catch (e) {
      console.error(e);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(digest).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3); }
          }
          
          @keyframes blueGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .shimmer-text {
            background: linear-gradient(
              90deg,
              #10b981 0%,
              #34d399 25%,
              #6ee7b7 50%,
              #34d399 75%,
              #10b981 100%
            );
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s linear infinite;
          }
          
          .glow-border {
            position: relative;
            background: linear-gradient(145deg, #1f2937, #111827);
            border: 1px solid rgba(16, 185, 129, 0.3);
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 4px 32px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(16, 185, 129, 0.1);
          }
          
          .glow-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #10b981);
            background-size: 400% 400%;
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
            animation: shimmer 4s linear infinite;
          }
          
          .glow-border:hover::before {
            opacity: 1;
          }
          
          .blue-glow-border {
            background: linear-gradient(145deg, #1e3a8a, #1e40af);
            border: 1px solid rgba(59, 130, 246, 0.3);
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 4px 32px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(59, 130, 246, 0.1);
          }
          
          .glass-effect {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .neon-glow {
            text-shadow: 
              0 0 5px rgba(16, 185, 129, 0.8),
              0 0 10px rgba(16, 185, 129, 0.6),
              0 0 15px rgba(16, 185, 129, 0.4),
              0 0 20px rgba(16, 185, 129, 0.2);
          }
          
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }
          
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
          
          .enhanced-button {
            position: relative;
            overflow: hidden;
            background: linear-gradient(145deg, #10b981, #059669);
            box-shadow: 
              0 4px 15px rgba(16, 185, 129, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }
          
          .enhanced-button:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 25px rgba(16, 185, 129, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          
          .enhanced-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .enhanced-button:hover::before {
            left: 100%;
          }
          
          .blue-enhanced-button {
            background: linear-gradient(145deg, #3b82f6, #2563eb);
            box-shadow: 
              0 4px 15px rgba(59, 130, 246, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          
          .blue-enhanced-button:hover {
            box-shadow: 
              0 8px 25px rgba(59, 130, 246, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          
          .enhanced-input {
            background: linear-gradient(145deg, #374151, #1f2937);
            border: 1px solid rgba(75, 85, 99, 0.5);
            box-shadow: 
              inset 0 2px 4px rgba(0, 0, 0, 0.3),
              0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
          }
          
          .enhanced-input:focus {
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 
              inset 0 2px 4px rgba(0, 0, 0, 0.3),
              0 0 0 3px rgba(16, 185, 129, 0.1),
              0 0 20px rgba(16, 185, 129, 0.3);
            outline: none;
          }
          
          .digest-output {
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            background: linear-gradient(145deg, #111827, #1f2937);
            border: 1px solid rgba(16, 185, 129, 0.3);
            box-shadow: 
              inset 0 2px 8px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(16, 185, 129, 0.1);
            transition: all 0.3s ease;
          }
          
          .digest-copied {
            background: linear-gradient(145deg, #064e3b, #065f46);
            border-color: rgba(16, 185, 129, 0.8);
            box-shadow: 
              inset 0 2px 8px rgba(0, 0, 0, 0.4),
              0 0 30px rgba(16, 185, 129, 0.4);
            animation: glow 1s ease-in-out;
          }
          
          .verification-success {
            background: linear-gradient(90deg, #10b981, #34d399);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            animation: pulse 2s ease-in-out infinite;
          }
          
          .verification-error {
            background: linear-gradient(90deg, #ef4444, #f87171);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
            animation: pulse 2s ease-in-out infinite;
          }
          
          .cosmic-bg {
            background: 
              radial-gradient(ellipse at top, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, #0f172a, #020617);
            min-height: 100vh;
            position: relative;
          }
          
          .cosmic-bg::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.2), transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(16, 185, 129, 0.3), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(59, 130, 246, 0.3), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.2), transparent),
              radial-gradient(2px 2px at 160px 30px, rgba(139, 92, 246, 0.3), transparent);
            background-repeat: repeat;
            background-size: 200px 150px;
            animation: float 20s linear infinite;
            pointer-events: none;
            z-index: 0;
          }
          
          .content-wrapper {
            position: relative;
            z-index: 1;
          }
        `
      }} />
      
      <main className="cosmic-bg antialiased">
        <div className="content-wrapper mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
          <header className="float-animation flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/50 pb-6 gap-4 glass-effect rounded-2xl p-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight shimmer-text neon-glow text-center sm:text-left">
              SHA-1 Message Digest Algorithm
            </h1>
            <nav className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab("sender")}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 enhanced-button ${
                  activeTab === "sender"
                    ? "transform -translate-y-1"
                    : "bg-neutral-800/80 hover:bg-neutral-700/80 backdrop-blur-sm"
                }`}
              >
                Sender
              </button>
              <button
                onClick={() => setActiveTab("receiver")}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "receiver"
                    ? "blue-enhanced-button transform -translate-y-1"
                    : "bg-neutral-800/80 hover:bg-neutral-700/80 backdrop-blur-sm"
                }`}
              >
                Receiver
              </button>
            </nav>
          </header>

          {activeTab === "sender" && (
            <section className="slide-in space-y-6 glow-border rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-emerald-300 neon-glow">Sender</h2>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-emerald-200 tracking-wide">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-28 rounded-2xl enhanced-input p-4 text-neutral-200 placeholder-neutral-400 resize-none"
                  placeholder="Enter your message here..."
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-emerald-200 tracking-wide">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => e.target.files && handleFileInput(e.target.files[0])}
                  className="block w-full text-sm text-neutral-300 
                    file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 
                    file:text-sm file:font-semibold file:enhanced-button file:text-white 
                    hover:file:transform hover:file:-translate-y-1 file:transition-all file:duration-300
                    file:cursor-pointer cursor-pointer"
                />
              </div>
              
              <button
                onClick={handleSender}
                className="px-8 py-4 rounded-2xl font-bold enhanced-button text-white text-lg shadow-2xl"
              >
                ✨ Generate Digest
              </button>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-emerald-200 tracking-wide">Message Digest (SHA-1)</label>
                <textarea
                  readOnly
                  value={digest}
                  className={`w-full h-24 rounded-2xl p-4 text-sm transition-all duration-500 resize-none ${
                    copied
                      ? "digest-copied text-emerald-300"
                      : "digest-output text-neutral-300"
                  }`}
                  placeholder="Your SHA-1 digest will appear here..."
                />
                {digest && (
                  <button
                    onClick={handleCopy}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                      copied
                        ? "enhanced-button text-white transform scale-105"
                        : "bg-neutral-700/80 hover:bg-neutral-600/80 text-neutral-200 hover:transform hover:scale-105 backdrop-blur-sm"
                    }`}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy Digest"}
                  </button>
                )}
              </div>
            </section>
          )}

          {activeTab === "receiver" && (
            <section className="slide-in space-y-6 blue-glow-border rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-blue-300 neon-glow">Receiver</h2>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-blue-200 tracking-wide">Received Message</label>
                <textarea
                  value={recvMessage}
                  onChange={(e) => setRecvMessage(e.target.value)}
                  className="w-full h-28 rounded-2xl enhanced-input p-4 text-neutral-200 placeholder-neutral-400 resize-none"
                  placeholder="Paste the received message here..."
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-blue-200 tracking-wide">Received Digest</label>
                <textarea
                  value={recvDigest}
                  onChange={(e) => setRecvDigest(e.target.value)}
                  className="w-full h-24 rounded-2xl enhanced-input p-4 text-sm font-mono text-neutral-200 placeholder-neutral-400 resize-none"
                  placeholder="Paste the received SHA-1 digest here..."
                />
              </div>
              
              <button
                onClick={handleReceiver}
                className="px-8 py-4 rounded-2xl font-bold blue-enhanced-button text-white text-lg shadow-2xl"
              >
                🔍 Verify Integrity
              </button>
              
              {verification !== null && (
                <div className="p-6 rounded-2xl glass-effect border border-neutral-700/50 backdrop-blur-sm">
                  <p className={`text-lg font-bold text-center ${
                    verification ? "verification-success" : "verification-error"
                  }`}>
                    {verification ? "✅ Message is authentic and unchanged!" : "❌ Warning: Message has been altered!"}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}