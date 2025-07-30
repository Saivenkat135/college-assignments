
"use client";
import React, { useState, type ChangeEvent, type JSX } from 'react';

// Google Fonts import
const GoogleFonts = () => (
  <link 
    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
);

interface ProcessResult {
  result: string;
  indices: IndexItem[];
}

interface IndexItem {
  original: string;
  originalIndex: number;
  key: string;
  keyIndex: number;
  result: string;
  resultIndex: number;
}

type InputMode = 'text' | 'file';

const VigenereCipher: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [indices, setIndices] = useState<IndexItem[]>([]);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<InputMode>('text');

  // Convert character to index (A=0, B=1, ..., Z=25)
  const charToIndex = (char: string): number => {
    return char.toUpperCase().charCodeAt(0) - 65;
  };

  // Convert index to character
  const indexToChar = (index: number): string => {
    return String.fromCharCode(index + 65);
  };

  // Process Vigenère cipher
  const processVigenere = (text: string, key: string, encrypt: boolean = true): ProcessResult => {
    if (!text || !key) return { result: '', indices: [] };

    const cleanText = text.replace(/[^A-Za-z]/g, '').toUpperCase();
    const cleanKey = key.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    if (cleanText.length === 0 || cleanKey.length === 0) {
      return { result: '', indices: [] };
    }

    let result = '';
    let keyIndex = 0;
    const resultIndices: IndexItem[] = [];

    for (let i = 0; i < cleanText.length; i++) {
      const textChar = cleanText[i];
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      
      const textIndex = charToIndex(textChar);
      const keyIndexValue = charToIndex(keyChar);
      
      let resultIndex: number;
      if (encrypt) {
        resultIndex = (textIndex + keyIndexValue) % 26;
      } else {
        resultIndex = (textIndex - keyIndexValue + 26) % 26;
      }
      
      const resultChar = indexToChar(resultIndex);
      result += resultChar;
      
      resultIndices.push({
        original: textChar,
        originalIndex: textIndex,
        key: keyChar,
        keyIndex: keyIndexValue,
        result: resultChar,
        resultIndex: resultIndex
      });
      
      keyIndex++;
    }

    return { result, indices: resultIndices };
  };

  const handleEncrypt = (): void => {
    const { result, indices } = processVigenere(inputText, key, true);
    setResult(result);
    setIndices(indices);
    setIsEncrypting(true);
  };

  const handleDecrypt = (): void => {
    const { result, indices } = processVigenere(inputText, key, false);
    setResult(result);
    setIndices(indices);
    setIsEncrypting(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setInputText(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderIndicesTable = (): JSX.Element | null => {
    if (indices.length === 0) return null;

    return (
      <div className="mt-12">
        <h3 className="text-white text-xl font-semibold mb-6 text-center relative font-mono">
          {isEncrypting ? 'Encryption' : 'Decryption'} Process Details
          <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-white opacity-50"></span>
        </h3>
        <div className="overflow-x-auto rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Position</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Original</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Original Index</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Key</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Key Index</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Result</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Result Index</th>
                <th className="bg-white/8 text-white p-4 text-center font-semibold border-b-2 border-white/15 tracking-wide sticky top-0">Operation</th>
              </tr>
            </thead>
            <tbody>
              {indices.map((item, index) => (
                <tr key={index} className="even:bg-white/2 hover:bg-white/5 transition-all duration-300">
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{index + 1}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.original}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.originalIndex}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.key}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.keyIndex}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.result}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">{item.resultIndex}</td>
                  <td className="p-3 text-center text-white/80 border-b border-white/8 hover:text-white transition-all duration-300">
                    {isEncrypting 
                      ? `(${item.originalIndex} + ${item.keyIndex}) % 26 = ${item.resultIndex}`
                      : `(${item.originalIndex} - ${item.keyIndex} + 26) % 26 = ${item.resultIndex}`
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <GoogleFonts />
      <div className="min-h-screen p-8 flex justify-center items-start relative overflow-x-hidden bg-gradient-to-br from-black via-gray-900 to-black font-inter text-white leading-relaxed antialiased">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-[70%] right-[20%] w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[50%] left-[40%] w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-12 max-w-5xl w-full shadow-2xl relative z-10 transition-all duration-300 hover:shadow-black/60 hover:-translate-y-0.5 animate-[slideIn_0.6s_ease-out_forwards]">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-10 font-mono relative pb-4 tracking-wide">
            Vigenère Cipher
            <span 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-30 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded opacity-80"
              style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}
            ></span>
          </h1>
          
          <div className="mb-8">
            <div className="flex gap-6 mb-10 justify-center flex-wrap">
              <label className="flex items-center gap-3 text-white font-medium cursor-pointer transition-all duration-300 px-6 py-3 border border-white/20 rounded-full bg-white/5 relative overflow-hidden hover:bg-white/12 hover:-translate-y-1 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-600 hover:translate-x-full"></div>
                <input
                  type="radio"
                  value="text"
                  checked={inputMode === 'text'}
                  onChange={(e) => setInputMode(e.target.value as InputMode)}
                  className="w-4.5 h-4.5 accent-white cursor-pointer"
                />
                Direct Text Input
              </label>
              <label className="flex items-center gap-3 text-white font-medium cursor-pointer transition-all duration-300 px-6 py-3 border border-white/20 rounded-full bg-white/5 relative overflow-hidden hover:bg-white/12 hover:-translate-y-1 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-600 hover:translate-x-full"></div>
                <input
                  type="radio"
                  value="file"
                  checked={inputMode === 'file'}
                  onChange={(e) => setInputMode(e.target.value as InputMode)}
                  className="w-4.5 h-4.5 accent-white cursor-pointer"
                />
                File Upload
              </label>
            </div>

            {inputMode === 'text' ? (
              <div className="mb-7">
                <label className="block text-white font-semibold mb-3 text-lg tracking-wide relative pl-2">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.75 h-3/5 bg-white rounded opacity-70"></span>
                  Enter Text:
                </label>
                <textarea
                  className="w-full p-4 bg-black/50 border-2 border-white/15 rounded-xl text-white font-mono transition-all duration-300 backdrop-blur-sm shadow-inner focus:outline-none focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] focus:-translate-y-0.5 focus:bg-black/70 placeholder-white/40"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here..."
                  rows={4}
                />
              </div>
            ) : (
              <div className="mb-7">
                <label className="block text-white font-semibold mb-3 text-lg tracking-wide relative pl-2">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.75 h-3/5 bg-white rounded opacity-70"></span>
                  Upload File:
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="w-full p-6 bg-black/30 border-2 border-dashed border-white/20 rounded-xl text-white cursor-pointer transition-all duration-300 hover:border-white hover:bg-white/5"
                />
                {inputText && (
                  <div className="mt-4 p-5 bg-black/25 rounded-lg border-l-4 border-white transition-all duration-300 hover:bg-black/35">
                    <p className="text-white mb-2 font-semibold">File Content Preview:</p>
                    <div className="text-white/80 font-mono text-sm leading-relaxed break-words">{inputText.substring(0, 200)}...</div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-7">
              <label className="block text-white font-semibold mb-3 text-lg tracking-wide relative pl-2">
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.75 h-3/5 bg-white rounded opacity-70"></span>
                Enter Key:
              </label>
              <input
                type="text"
                className="w-full p-4 bg-black/50 border-2 border-white/15 rounded-xl text-white font-mono transition-all duration-300 backdrop-blur-sm shadow-inner focus:outline-none focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] focus:-translate-y-0.5 focus:bg-black/70 placeholder-white/40"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter encryption key..."
              />
            </div>
          </div>

          <div className="flex gap-6 justify-center mb-10 flex-wrap">
            <button 
              className="px-10 py-4 text-lg font-semibold border-none rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden font-inter tracking-wide uppercase min-w-48 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 shadow-[0_8px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_35px_rgba(255,255,255,0.35)] hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white hover:to-gray-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none active:animate-pulse"
              onClick={handleEncrypt}
              disabled={!inputText || !key}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-600 hover:translate-x-full"></div>
              🔒 Encrypt
            </button>
            <button 
              className="px-10 py-4 text-lg font-semibold border-2 border-white/30 rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden font-inter tracking-wide uppercase min-w-48 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:border-white disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none active:animate-pulse"
              onClick={handleDecrypt}
              disabled={!inputText || !key}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-600 hover:translate-x-full"></div>
              🔓 Decrypt
            </button>
          </div>

          {result && (
            <div className="mb-10">
              <h3 className="text-white text-xl font-semibold mb-5 text-center flex items-center justify-center gap-3">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                Result:
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
              </h3>
              <div className="bg-black/50 border border-white/20 rounded-xl p-6 text-white font-mono text-lg leading-7 break-words text-left backdrop-blur-xl shadow-inner transition-all duration-300 hover:border-white/30 hover:shadow-[inset_0_2px_15px_rgba(0,0,0,0.4),0_5px_20px_rgba(0,0,0,0.3)]">
                {result}
              </div>
            </div>
          )}

          {renderIndicesTable()}
        </div>
        <style >{`
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>
    </>
  );
};

export default VigenereCipher;