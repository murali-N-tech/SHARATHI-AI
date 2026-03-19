import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";

const OutputConsole = ({
  output,
  expectedOutput,
  verdict,
  currentTestCase,
  totalTestCases,
}) => {
  const getVerdictStyle = () => {
    switch (verdict) {
      case "passed":
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          badge: "bg-green-100 text-green-800",
          icon: <Check className="w-5 h-5" />,
          text: "✓ PASSED",
        };
      case "failed":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          badge: "bg-red-100 text-red-800",
          icon: <X className="w-5 h-5" />,
          text: "✗ FAILED",
        };
      case "pending":
        return {
          bg: "bg-blue-50",
          border: "border-blue-300",
          badge: "bg-blue-100 text-blue-800",
          icon: <Clock className="w-5 h-5" />,
          text: "⏳ PENDING",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-300",
          badge: "bg-gray-100 text-gray-800",
          icon: null,
          text: "Not Run",
        };
    }
  };

  const verdictStyle = getVerdictStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Output Console</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${verdictStyle.badge}`}>
              {verdictStyle.icon}
              {verdictStyle.text}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Test Case {currentTestCase + 1} / {totalTestCases}
        </p>
      </div>

      {/* Output Area - Scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        {/* Program Output */}
        <div className="bg-gray-950 text-gray-100 p-4 font-mono text-sm rounded-lg border border-gray-800">
          {output ? (
            <div>
              <p className="text-gray-500 mb-2">Program Output:</p>
              <pre className="whitespace-pre-wrap break-words">{output}</pre>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Click "Run Code" to see output...
            </p>
          )}
        </div>

        {/* Expected Output */}
        {expectedOutput && verdict && (
          <div className={`p-6 font-mono rounded-lg shadow-md border-2 ${verdictStyle.bg} ${verdictStyle.border}`}>
            <p className="text-gray-800 mb-3 font-bold text-lg">Expected Output:</p>
            <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm leading-relaxed">
              {expectedOutput}
            </pre>
          </div>
        )}

        {/* Verdict Details */}
        {verdict && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`px-6 py-4 rounded-lg border-2 ${verdictStyle.border} ${verdictStyle.bg} mb-4`}
          >
            <div className="space-y-2">
              {verdict === "passed" && (
                <div className="text-green-800">
                  <p className="font-semibold text-lg">🎉 Correct Answer!</p>
                  <p className="text-sm mt-1">
                    Your output matches the expected output for this test case.
                  </p>
                </div>
              )}
              {verdict === "failed" && (
                <div className="text-red-800">
                  <p className="font-semibold text-lg">❌ Wrong Answer</p>
                  <p className="text-sm mt-1">
                    Your output does not match the expected output. Try again!
                  </p>
                </div>
              )}
              {verdict === "pending" && (
                <div className="text-blue-800">
                  <p className="font-semibold text-lg">⏳ Pending Execution</p>
                  <p className="text-sm mt-1">
                    This language will be available after backend integration.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 flex-shrink-0">
        <div className="flex gap-4">
          {verdict === "passed" && (
            <>
              <span>✓ Test Passed</span>
              <span className="text-green-700 font-semibold">Score +10 XP</span>
            </>
          )}
          {verdict === "failed" && (
            <>
              <span>✗ Test Failed</span>
              <span className="text-red-700">Try again to pass</span>
            </>
          )}
          {!verdict && <span>Run code to see results</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default OutputConsole;
