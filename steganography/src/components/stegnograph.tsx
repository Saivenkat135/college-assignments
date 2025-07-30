"use client";
import React, { useState, useRef } from "react";

const SteganographyTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [encodeMessage, setEncodeMessage] = useState("");
  const [decodeResult, setDecodeResult] = useState("");
  const [error, setError] = useState("");
  const [showEncodedImage, setShowEncodedImage] = useState(false);
  const [showDecodeResult, setShowDecodeResult] = useState(false);
  const [encodedBlobUrl, setEncodedBlobUrl] = useState("");
  const [encodeImagePreview, setEncodeImagePreview] = useState("");
  const [decodeImagePreview, setDecodeImagePreview] = useState("");

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const messageCanvasRef = useRef<HTMLCanvasElement>(null);
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null);

  const previewImage = (
    file: File,
    canvas: HTMLCanvasElement,
    callback: () => void
  ) => {
    const reader = new FileReader();
    const image = new Image();
    const context = canvas.getContext("2d");

    if (!file || !context) {
      setError("Invalid file or canvas");
      return;
    }

    reader.onload = (e) => {
      if (e.target?.result) {
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          callback();
        };
        image.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEncodeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && originalCanvasRef.current) {
      setShowEncodedImage(false);
      setError("");
      previewImage(file, originalCanvasRef.current, () => {
        console.log("Encode image preview ready");
      });
    }
  };

  const handleDecodeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && decodeCanvasRef.current) {
      setShowDecodeResult(false);
      setError("");
      previewImage(file, decodeCanvasRef.current, () => {
        console.log("Decode image preview ready");
      });
    }
  };

  const encodeMessageHandler = () => {
    console.log("Starting encode process...");
    setError("");
    setShowEncodedImage(false);
    setEncodedBlobUrl("");

    const text = encodeMessage.trim();
    const originalCanvas = originalCanvasRef.current;
    const messageCanvas = messageCanvasRef.current;

    if (!text) return setError("Please enter a message to encode");
    if (!originalCanvas || !messageCanvas)
      return setError("Image canvas not ready");

    const originalContext = originalCanvas.getContext("2d");
    const messageContext = messageCanvas.getContext("2d");

    if (!originalContext || !messageContext)
      return setError("Canvas context not available");

    const width = originalCanvas.width;
    const height = originalCanvas.height;
    const imageData = originalContext.getImageData(0, 0, width, height);
    const pixel = imageData.data;

    if (text.length * 8 > width * height * 3)
      return setError(
        `Text too long for selected image. Max characters: ${Math.floor(
          (width * height * 3) / 8
        )}`
      );

    // Reset all LSBs to 0
    for (let i = 0; i < pixel.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        pixel[i + j] &= 254;
      }
    }

    let binaryMessage = "";
    for (const ch of text) {
      let bin = ch.charCodeAt(0).toString(2).padStart(8, "0");
      binaryMessage += bin;
    }

    let counter = 0;
    for (let i = 0; i < pixel.length && counter < binaryMessage.length; i += 4) {
      for (let j = 0; j < 3 && counter < binaryMessage.length; j++) {
        pixel[i + j] |= parseInt(binaryMessage[counter]);
        counter++;
      }
    }

    messageCanvas.width = width;
    messageCanvas.height = height;
    messageContext.putImageData(imageData, 0, 0);
    setShowEncodedImage(true);

    // Export the image
    messageCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setEncodedBlobUrl(url);
      }
    });

    console.log("Encoding complete.");
  };

  const decodeMessageHandler = () => {
    console.log("Starting decode process...");
    setError("");
    setShowDecodeResult(false);

    const decodeCanvas = decodeCanvasRef.current;
    if (!decodeCanvas) return setError("Please select an image first");

    const ctx = decodeCanvas.getContext("2d");
    if (!ctx) return setError("Cannot get canvas context");

    const { width, height } = decodeCanvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixel = imageData.data;

    let binaryMessage = "";
    for (let i = 0; i < pixel.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        binaryMessage += pixel[i + j] % 2;
      }
    }

    let output = "";
    for (let i = 0; i + 8 <= binaryMessage.length; i += 8) {
      const byte = binaryMessage.slice(i, i + 8);
      const charCode = parseInt(byte, 2);
      if (charCode === 0 || charCode < 32) break;
      output += String.fromCharCode(charCode);
    }

    setDecodeResult(output);
    setShowDecodeResult(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl mb-6">
            <span className="text-3xl">🕵️‍♂️</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Steganography Tool
          </h1>
          <p className="text-gray-600 text-xl">Hide and reveal secret messages within images</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
            <button
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "encode"
                  ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("encode")}
            >
              🔒 Encode Message
            </button>
            <button
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "decode"
                  ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("decode")}
            >
              🔓 Decode Message
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {/* ENCODE SECTION */}
            {activeTab === "encode" && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-700 p-6">
                  <h2 className="text-2xl font-bold text-white text-center">
                    🔒 Encode Secret Message
                  </h2>
                </div>
                
                <div className="p-8 space-y-6">
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Select Cover Image
                    </label>
                    {!encodeImagePreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEncodeImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 transition-all duration-300">
                          <div className="text-4xl mb-3">📁</div>
                          <p className="text-gray-600 font-medium">Click to choose image file</p>
                          <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG supported</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg">
                          <img 
                            src={encodeImagePreview} 
                            alt="Selected cover image" 
                            className="w-full h-64 object-cover rounded-xl"
                          />
                          <div className="mt-3 text-center">
                            <p className="text-gray-600 font-medium">✅ Cover image selected</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEncodeImagePreview("");
                            setShowEncodedImage(false);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          ✕
                        </button>
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-2xl transition-all duration-300 cursor-pointer" onClick={() => document.querySelector('input[type="file"]')}>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg">
                              Change Image
                            </span>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEncodeImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Secret Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:border-gray-400 focus:ring-0 transition-colors duration-300 resize-none shadow-inner"
                      placeholder="Enter your secret message here..."
                      value={encodeMessage}
                      onChange={(e) => setEncodeMessage(e.target.value)}
                    />
                  </div>

                  {/* Encode Button */}
                  <button
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-gray-800 hover:to-gray-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
                    onClick={encodeMessageHandler}
                  >
                    🔐 Encode Message Into Image
                  </button>

                  {/* Hidden Canvases */}
                  <canvas ref={originalCanvasRef} className="hidden" />
                  <canvas ref={messageCanvasRef} className="hidden" />

                  {/* Encoded Result */}
                  {showEncodedImage && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <h3 className="text-lg font-bold text-green-800 mb-4 text-center">
                        ✅ Message Successfully Encoded!
                      </h3>
                      <div className="text-center space-y-4">
                        <img 
                          src={encodedBlobUrl} 
                          alt="Encoded Result" 
                          className="max-w-full h-auto rounded-xl shadow-lg border border-green-200 mx-auto"
                        />
                        <a
                          href={encodedBlobUrl}
                          download="encoded_image.png"
                          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors duration-300 shadow-lg"
                        >
                          💾 Download Encoded Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DECODE SECTION */}
            {activeTab === "decode" && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6">
                  <h2 className="text-2xl font-bold text-white text-center">
                    🔓 Decode Hidden Message
                  </h2>
                </div>
                
                <div className="p-8 space-y-6">
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Select Encoded Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDecodeImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 transition-all duration-300">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-gray-600 font-medium">Click to choose encoded image</p>
                        <p className="text-gray-400 text-sm mt-1">Upload image with hidden message</p>
                      </div>
                    </div>
                  </div>

                  {/* Decode Button */}
                  <button
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-gray-600 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-xl"
                    onClick={decodeMessageHandler}
                  >
                    🔍 Extract Hidden Message
                  </button>

                  {/* Hidden Canvas */}
                  <canvas ref={decodeCanvasRef} className="hidden" />

                  {/* Decode Result */}
                  {showDecodeResult && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">
                        🎉 Hidden Message Revealed!
                      </h3>
                      <textarea
                        className="w-full border-2 border-blue-200 rounded-2xl p-4 bg-white shadow-inner resize-none"
                        rows={4}
                        readOnly
                        value={decodeResult}
                        placeholder="No message found..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-lg border border-gray-200">
            <span className="text-2xl mr-3">💡</span>
            <span className="text-gray-600 font-medium">
              Secure • Private • No data stored on servers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteganographyTool;