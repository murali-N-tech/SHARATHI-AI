// Web Worker for safe JavaScript code execution
// This runs in a separate thread to prevent blocking the main UI

self.onmessage = function (event) {
  const { code, input } = event.data;

  try {
    // Capture console.log output
    const outputs = [];
    const customConsole = {
      log: (...args) => {
        outputs.push(args.map(String).join(" "));
      },
    };

    // Create a function that wraps the user code
    // This allows us to inject custom console and input handling
    const wrappedCode = `
      (function() {
        const console = self.customConsole;
        let inputLines = self.inputLines;
        let inputIndex = 0;
        
        // Mock input function for reading test case inputs
        function readLine() {
          if (inputIndex < inputLines.length) {
            return inputLines[inputIndex++];
          }
          return '';
        }
        
        // Execute user code
        ${code}
      })()
    `;

    // Prepare input lines
    const inputLines = input.split("\n").map((line) => line.trim());

    // Execute code with custom environment
    const func = new Function("customConsole", "inputLines", wrappedCode);
    func(customConsole, inputLines);

    // Return captured output
    const result = outputs.join("\n");
    self.postMessage({ result, error: null });
  } catch (error) {
    // Return error message
    self.postMessage({
      result: "",
      error: error.message || String(error),
    });
  }
};
