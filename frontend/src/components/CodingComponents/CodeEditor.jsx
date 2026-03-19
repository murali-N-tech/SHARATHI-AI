import { motion } from "framer-motion";
import { Copy, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";

const CodeEditor = ({
  selectedLanguage,
  code,
  onCodeChange,
  isRunning,
}) => {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onCodeChange("");
  };

  // Sync scroll between line numbers and textarea
  const handleScroll = (e) => {
    if (editorRef.current) {
      editorRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const lineCount = code.split("\n").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden h-full"
    >
      {/* Header with Editor Actions */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg">Code Editor</span>

        {/* Editor Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          {copied && (
            <span className="text-xs text-green-400 font-semibold">✓ Copied</span>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={editorRef}
          className="bg-gray-900 text-gray-600 px-3 py-4 font-mono text-sm select-none border-r border-gray-800 overflow-hidden"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="h-5 leading-5 text-xs">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <div className="flex-1 bg-gray-950 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            className="w-full h-full px-4 py-4 font-mono text-xs text-gray-100 bg-gray-950 border-none outline-none resize-none"
            spellCheck="false"
            placeholder="// Write your code here..."
            style={{
              lineHeight: "1.3rem",
              tabSize: 4,
              MozTabSize: 4,
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex gap-4">
          <span>Lines: {lineCount}</span>
          <span>Characters: {code.length}</span>
        </div>
        <div className="flex gap-2">
          {selectedLanguage !== "javascript" && (
            <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
              ⚠️ Execution disabled - Backend integration required
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CodeEditor;
