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
          @keyframes blackShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes darkGlow {
            0%, 100% { 
              box-shadow: 
                0 0 20px rgba(0, 0, 0, 0.8),
                0 0 40px rgba(0, 0, 0, 0.6),
                inset 0 0 20px rgba(255, 255, 255, 0.1);
            }
            50% { 
              box-shadow: 
                0 0 40px rgba(0, 0, 0, 0.9),
                0 0 80px rgba(0, 0, 0, 0.7),
                0 0 120px rgba(0, 0, 0, 0.5),
                inset 0 0 30px rgba(255, 255, 255, 0.15);
            }
          }
          
          @keyframes whiteGlow {
            0%, 100% { 
              box-shadow: 
                0 0 20px rgba(255, 255, 255, 0.3),
                0 0 40px rgba(255, 255, 255, 0.2),
                inset 0 0 20px rgba(0, 0, 0, 0.3);
            }
            50% { 
              box-shadow: 
                0 0 40px rgba(255, 255, 255, 0.5),
                0 0 80px rgba(255, 255, 255, 0.3),
                0 0 120px rgba(255, 255, 255, 0.2),
                inset 0 0 30px rgba(0, 0, 0, 0.4);
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes shadowWave {
            0%, 100% {
              box-shadow: 
                0 5px 15px rgba(0, 0, 0, 0.3),
                0 10px 30px rgba(0, 0, 0, 0.2),
                0 15px 50px rgba(0, 0, 0, 0.1);
            }
            50% {
              box-shadow: 
                0 10px 25px rgba(0, 0, 0, 0.4),
                0 20px 50px rgba(0, 0, 0, 0.3),
                0 30px 80px rgba(0, 0, 0, 0.2);
            }
          }
          
          .black-shimmer-text {
            background: linear-gradient(
              90deg,
              #ffffff 0%,
              #e5e7eb 25%,
              #000000 50%,
              #e5e7eb 75%,
              #ffffff 100%
            );
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: blackShimmer 3s linear infinite;
          }
          
          .shadow-box {
            background: linear-gradient(145deg, #1a1a1a, #000000);
            border: 2px solid #333333;
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.7),
              0 20px 60px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.5);
            animation: shadowWave 4s ease-in-out infinite;
          }
          
          .white-shadow-box {
            background: linear-gradient(145deg, #f8f9fa, #ffffff);
            border: 2px solid #e5e7eb;
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.3),
              0 20px 60px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }
          
          .dramatic-shadow {
            box-shadow: 
              0 25px 50px rgba(0, 0, 0, 0.8),
              0 50px 100px rgba(0, 0, 0, 0.6),
              0 75px 150px rgba(0, 0, 0, 0.4),
              inset 0 2px 4px rgba(255, 255, 255, 0.1);
          }
          
          .enhanced-button-bw {
            position: relative;
            overflow: hidden;
            background: linear-gradient(145deg, #000000, #1a1a1a);
            border: 2px solid #ffffff;
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.6),
              0 15px 50px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            color: white;
          }
          
          .enhanced-button-bw:hover {
            transform: translateY(-3px);
            box-shadow: 
              0 15px 40px rgba(0, 0, 0, 0.8),
              0 25px 70px rgba(0, 0, 0, 0.6),
              0 35px 100px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            animation: darkGlow 2s ease-in-out infinite;
          }
          
          .enhanced-button-bw::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
          }
          
          .enhanced-button-bw:hover::before {
            left: 100%;
          }
          
          .white-button {
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border: 2px solid #000000;
            color: #000000;
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.3),
              0 15px 50px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
          }
          
          .white-button:hover {
            animation: whiteGlow 2s ease-in-out infinite;
          }
          
          .enhanced-input-bw {
            background: linear-gradient(145deg, #1a1a1a, #000000);
            border: 2px solid #333333;
            color: #ffffff;
            box-shadow: 
              inset 0 4px 8px rgba(0, 0, 0, 0.6),
              inset 0 -2px 4px rgba(255, 255, 255, 0.05),
              0 2px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }
          
          .enhanced-input-bw:focus {
            border-color: #ffffff;
            box-shadow: 
              inset 0 4px 8px rgba(0, 0, 0, 0.6),
              0 0 0 3px rgba(255, 255, 255, 0.2),
              0 0 20px rgba(255, 255, 255, 0.3),
              0 5px 15px rgba(0, 0, 0, 0.5);
            outline: none;
          }
          
          .digest-output-bw {
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            background: linear-gradient(145deg, #000000, #1a1a1a);
            border: 2px solid #333333;
            color: #ffffff;
            box-shadow: 
              inset 0 4px 12px rgba(0, 0, 0, 0.8),
              inset 0 -2px 6px rgba(255, 255, 255, 0.05),
              0 8px 25px rgba(0, 0, 0, 0.6);
            transition: all 0.3s ease;
          }
          
          .digest-copied-bw {
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border-color: #000000;
            color: #000000;
            box-shadow: 
              inset 0 4px 12px rgba(255, 255, 255, 0.8),
              inset 0 -2px 6px rgba(0, 0, 0, 0.1),
              0 8px 25px rgba(255, 255, 255, 0.6),
              0 15px 50px rgba(255, 255, 255, 0.4);
            animation: whiteGlow 1s ease-in-out;
          }
          
          .verification-success-bw {
            color: #ffffff;
            text-shadow: 
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(255, 255, 255, 0.6),
              0 0 30px rgba(255, 255, 255, 0.4);
            animation: pulse 2s ease-in-out infinite;
          }
          
          .verification-error-bw {
            color: #000000;
            text-shadow: 
              0 0 10px rgba(0, 0, 0, 0.8),
              0 0 20px rgba(0, 0, 0, 0.6),
              0 0 30px rgba(0, 0, 0, 0.4);
            animation: pulse 2s ease-in-out infinite;
          }
          
          .cosmic-bg-bw {
            background: 
              radial-gradient(ellipse at top, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(0, 0, 0, 0.8) 0%, transparent 50%),
              linear-gradient(180deg, #000000, #1a1a1a);
            min-height: 100vh;
            position: relative;
          }
          
          .cosmic-bg-bw::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
              radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(0, 0, 0, 0.5), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.25), transparent),
              radial-gradient(1px 1px at 160px 30px, rgba(0, 0, 0, 0.4), transparent);
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
          
          .glass-effect-bw {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .black-shine {
            position: relative;
            overflow: hidden;
          }
          
          .black-shine::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
              from 0deg,
              transparent,
              rgba(0, 0, 0, 0.8),
              transparent,
              rgba(0, 0, 0, 0.6),
              transparent
            );
            animation: blackShimmer 4s linear infinite;
            z-index: -1;
          }
          
          .deep-shadow {
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.9),
              0 40px 80px rgba(0, 0, 0, 0.7),
              0 60px 120px rgba(0, 0, 0, 0.5),
              inset 0 2px 4px rgba(255, 255, 255, 0.1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .layered-shadow {
            box-shadow: 
              0 1px 3px rgba(0, 0, 0, 0.9),
              0 4px 6px rgba(0, 0, 0, 0.8),
              0 10px 20px rgba(0, 0, 0, 0.7),
              0 20px 40px rgba(0, 0, 0, 0.6),
              0 40px 80px rgba(0, 0, 0, 0.4);
          }
        `
      }} />
      
      <main className="cosmic-bg-bw antialiased">
        <div className="content-wrapper mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
          <header className="float-animation flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/20 pb-6 gap-4 glass-effect-bw rounded-2xl p-6 mb-8 dramatic-shadow">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight black-shimmer-text text-center sm:text-left">
              SHA-1 Message Digest Algorithm
            </h1>
            <nav className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab("sender")}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "sender"
                    ? "enhanced-button-bw transform -translate-y-1"
                    : "bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white border border-white/30 layered-shadow"
                }`}
              >
                Sender
              </button>
              <button
                onClick={() => setActiveTab("receiver")}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === "receiver"
                    ? "white-button enhanced-button-bw transform -translate-y-1"
                    : "bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white border border-white/30 layered-shadow"
                }`}
              >
                Receiver
              </button>
            </nav>
          </header>

          {activeTab === "sender" && (
            <section className="slide-in space-y-6 shadow-box rounded-2xl p-8 backdrop-blur-sm black-shine">
              <h2 className="text-2xl font-bold text-white">Sender</h2>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 tracking-wide">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-28 rounded-2xl enhanced-input-bw p-4 placeholder-gray-500 resize-none"
                  placeholder="Enter your message here..."
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 tracking-wide">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => e.target.files && handleFileInput(e.target.files[0])}
                  className="block w-full text-sm text-gray-300 
                    file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 
                    file:text-sm file:font-semibold file:enhanced-button-bw
                    hover:file:transform hover:file:-translate-y-1 file:transition-all file:duration-300
                    file:cursor-pointer cursor-pointer"
                />
              </div>
              
              <button
                onClick={handleSender}
                className="px-8 py-4 rounded-2xl font-bold enhanced-button-bw text-lg deep-shadow"
              >
                ✨ Generate Digest
              </button>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 tracking-wide">Message Digest (SHA-1)</label>
                <textarea
                  readOnly
                  value={digest}
                  className={`w-full h-24 rounded-2xl p-4 text-sm transition-all duration-500 resize-none ${
                    copied
                      ? "digest-copied-bw"
                      : "digest-output-bw"
                  }`}
                  placeholder="Your SHA-1 digest will appear here..."
                />
                {digest && (
                  <button
                    onClick={handleCopy}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      copied
                        ? "white-button transform scale-105 deep-shadow"
                        : "bg-gray-700/80 hover:bg-gray-600/80 text-white hover:transform hover:scale-105 backdrop-blur-sm border border-white/30 layered-shadow"
                    }`}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy Digest"}
                  </button>
                )}
              </div>
            </section>
          )}

          {activeTab === "receiver" && (
            <section className="slide-in space-y-6 white-shadow-box rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-black">Receiver</h2>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 tracking-wide">Received Message</label>
                <textarea
                  value={recvMessage}
                  onChange={(e) => setRecvMessage(e.target.value)}
                  className="w-full h-28 rounded-2xl p-4 text-black placeholder-gray-500 resize-none bg-white border-2 border-gray-300 shadow-inner"
                  placeholder="Paste the received message here..."
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 tracking-wide">Received Digest</label>
                <textarea
                  value={recvDigest}
                  onChange={(e) => setRecvDigest(e.target.value)}
                  className="w-full h-24 rounded-2xl p-4 text-sm font-mono text-black placeholder-gray-500 resize-none bg-white border-2 border-gray-300 shadow-inner"
                  placeholder="Paste the received SHA-1 digest here..."
                />
              </div>
              
              <button
                onClick={handleReceiver}
                className="px-8 py-4 rounded-2xl font-bold white-button text-lg deep-shadow"
              >
                🔍 Verify Integrity
              </button>
              
              {verification !== null && (
                <div className="p-6 rounded-2xl glass-effect-bw border border-white/30 backdrop-blur-sm dramatic-shadow">
                  <p className={`text-lg font-bold text-center ${
                    verification ? "verification-success-bw" : "verification-error-bw"
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