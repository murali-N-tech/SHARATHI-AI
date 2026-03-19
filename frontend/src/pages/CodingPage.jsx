import { useState, useEffect } from "react";
import codingQuestions from "../utils/codingQuestions.js";
import CodingQuestion from "../components/CodingComponents/CodingQuestion";
import CodeEditor from "../components/CodingComponents/CodeEditor";
import OutputConsole from "../components/CodingComponents/OutputConsole";
import { motion } from "framer-motion";

const CodingPage = () => {
  // Load only the first question
  const currentQuestion = codingQuestions.questions[0];
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestCase, setCurrentTestCase] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Load starter code when language changes
  useEffect(() => {
    if (currentQuestion) {
      const starterCode =
        currentQuestion.starterCode[selectedLanguage] || "// Code not available";
      setCode(starterCode);
      setOutput("");
      setVerdict(null);
    }
  }, [selectedLanguage, currentQuestion]);

  // Load first question's code on mount
  useEffect(() => {
    if (currentQuestion) {
      const starterCode =
        currentQuestion.starterCode[selectedLanguage] || "// Code not available";
      setCode(starterCode);
      setTimerActive(true);
    }
  }, [currentQuestion, selectedLanguage]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setElapsedTime(0);
  };

  // Execute code for JavaScript only
  const handleRunCode = () => {
    if (selectedLanguage !== "javascript") {
      setOutput("Test case failed - only JavaScript is supported.");
      setVerdict("failed");
      return;
    }

    if (!currentQuestion) return;

    setIsRunning(true);
    setVerdict(null);

    try {
      const testCase = currentQuestion.testCases[currentTestCase];
      setExpectedOutput(testCase.output);

      // Execute JavaScript code with timeout
      setTimeout(() => {
        executeJavaScript(testCase);
      }, 100);
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
      setVerdict("failed");
      setIsRunning(false);
    }
  };

  const executeJavaScript = (testCase) => {
    try {
      const outputs = [];

      // Create custom console
      const customConsole = {
        log: (...args) => {
          outputs.push(args.map(String).join(" "));
        },
      };

      // Parse input
      const inputLines = testCase.input.split("\n").map((line) => line.trim());

      // Mock readline function
      const mockReadline = {
        createInterface: () => ({
          on: () => {},
          close: () => {},
        }),
      };

      // Execute the user's code
      const userFunction = new Function(
        "console",
        "inputLines",
        "process",
        "require",
        `
        const readline = {
          createInterface: (options) => ({
            on: (event, callback) => {
              if (event === 'line') {
                inputLines.forEach((line) => {
                  callback(line);
                });
              }
            },
            close: () => {}
          })
        };
        
        ${code}
        `
      );

      // Call the function with safe mock objects
      userFunction(
        customConsole,
        inputLines,
        { stdin: null, stdout: null },
        (module) => {
          if (module === "readline") return mockReadline;
          return {};
        }
      );

      const result = outputs.join("\n");
      const normalizedOutput = result.trim();
      const normalizedExpected = testCase.output.trim();

      if (normalizedOutput === normalizedExpected) {
        setOutput(result || "(no output)");
        setVerdict("passed");
      } else {
        setOutput(result || "(no output)");
        setVerdict("failed");
      }
    } catch (error) {
      setOutput(`❌ Runtime Error: ${error.message}`);
      setVerdict("failed");
    } finally {
      setIsRunning(false);
    }
  };

  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gray-50 p-6"
    >
      <div className="w-full max-w-full flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-md rounded-t-lg border-b border-gray-200 px-8 py-4 mb-0 flex-shrink-0">
          <div className="flex items-center justify-between gap-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentQuestion.title}
            </h1>

            {/* Language Selector and Run Button - Same Row */}
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-gray-700 font-semibold text-sm">⏱️ Time:</span>
                <span className="text-gray-900 font-mono font-bold text-lg">{formatTime(elapsedTime)}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  title="Reset timer"
                >
                  ↻
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-semibold text-sm whitespace-nowrap">Choose Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-brand-600 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="javascript">📜 JavaScript</option>
                  <option value="python">🐍 Python</option>
                  <option value="java">☕ Java</option>
                  <option value="cpp">⚙️ C++</option>
                </select>
              </div>
    
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(217, 70, 39, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-8 py-2 rounded-lg bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg h-fit"
              >
                {isRunning ? "⏳ Running..." : "▶️ Run Code"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content - Single Scrollable Container */}
        <div className="flex-1 overflow-y-auto bg-white rounded-b-lg shadow-md">
          <div className="flex gap-6 p-6 min-h-full">
            {/* Left Panel - Question Details (35% width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-[35%] border-r border-gray-200"
            >
              <CodingQuestion
                question={currentQuestion}
                currentTestCase={currentTestCase}
                onTestCaseChange={setCurrentTestCase}
              />
            </motion.div>

            {/* Right Panel - Code Editor and Console (65% width) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-[65%] flex flex-col gap-6"
            >
              {/* Code Editor - Increased Height */}
              <div className="min-h-[600px]">
                <CodeEditor
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  code={code}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  isRunning={isRunning}
                />
              </div>

              {/* Output Console */}
              <div className="min-h-[400px]">
                <OutputConsole
                  output={output}
                  expectedOutput={expectedOutput}
                  verdict={verdict}
                  currentTestCase={currentTestCase}
                  totalTestCases={currentQuestion?.testCases.length || 0}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CodingPage;
