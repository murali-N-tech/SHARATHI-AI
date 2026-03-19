import { motion } from "framer-motion";
import { useState } from "react";

const CodingQuestion = ({ question, currentTestCase, onTestCaseChange }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Description Section */}
      <motion.div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
          {question.description}
        </p>
      </motion.div>

      {/* Input Format */}
      <motion.div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Input Format</h3>
        <p className="text-sm text-blue-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-blue-100">
          {question.inputFormat}
        </p>
      </motion.div>

      {/* Output Format */}
      <motion.div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Output Format</h3>
        <p className="text-sm text-purple-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-purple-100">
          {question.outputFormat}
        </p>
      </motion.div>

      {/* Constraints */}
      <motion.div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <h3 className="text-sm font-semibold text-orange-900 mb-3">Constraints</h3>
        <ul className="space-y-2">
          {question.constraints.map((constraint, index) => (
            <li key={index} className="text-sm text-orange-800 flex gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>{constraint}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Test Cases */}
      <motion.div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="text-sm font-semibold text-green-900 mb-3">
          Test Cases ({question.testCases.length})
        </h3>
        <div className="space-y-3">
          {question.testCases.map((testCase, index) => (
            <motion.button
              key={index}
              onClick={() => onTestCaseChange(index)}
              whileHover={{ scale: 1.02 }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                currentTestCase === index
                  ? "border-brand-600 bg-white shadow-md"
                  : "border-green-200 bg-white hover:border-green-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Example {index + 1}
                </span>
                {currentTestCase === index && (
                  <span className="text-xs bg-brand-600 text-white px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600 font-medium mb-1">Input:</p>
                  <p className="text-gray-700 font-mono bg-gray-100 p-2 rounded border border-gray-300 whitespace-pre-wrap break-words">
                    {testCase.input.substring(0, 40)}
                    {testCase.input.length > 40 ? "..." : ""}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Output:</p>
                  <p className="text-gray-700 font-mono bg-gray-100 p-2 rounded border border-gray-300">
                    {testCase.output}
                  </p>
                </div>
              </div>
              {testCase.explanation && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  💡 {testCase.explanation}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CodingQuestion;
