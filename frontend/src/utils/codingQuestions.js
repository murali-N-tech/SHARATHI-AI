export const codingQuestions = {
  questions: [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists."
      ],
      inputFormat: "First line contains n (array length)\nSecond line contains n space-separated integers\nThird line contains the target integer",
      outputFormat: "Two space-separated integers representing the indices of the two numbers",
      testCases: [
        {
          input: "4\n2 7 11 15\n9",
          output: "0 1",
          explanation: "nums[0] + nums[1] = 2 + 7 = 9"
        },
        {
          input: "3\n3 2 4\n6",
          output: "1 2",
          explanation: "nums[1] + nums[2] = 2 + 4 = 6"
        },
        {
          input: "2\n-3 4\n1",
          output: "0 1",
          explanation: "nums[0] + nums[1] = -3 + 4 = 1"
        }
      ],
      starterCode: {
        javascript: "function twoSum(n, nums, target) {\n  // Write your solution here\n  \n}\n\n// Read input\nconst n = parseInt(readline());\nconst nums = readline().split(' ').map(Number);\nconst target = parseInt(readline());\n\n// Solve and print output\nconst result = twoSum(n, nums, target);\nconsole.log(result[0] + ' ' + result[1]);",
        python: "def twoSum(n, nums, target):\n    # Write your solution here\n    pass\n\n# Read input\nn = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\n\n# Solve and print output\nresult = twoSum(n, nums, target)\nprint(result[0], result[1])",
        java: "public class Solution {\n    public int[] twoSum(int n, int[] nums, int target) {\n        // Write your solution here\n        return new int[2];\n    }\n\n    public static void main(String[] args) {\n        // Read input\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) {\n            nums[i] = sc.nextInt();\n        }\n        int target = sc.nextInt();\n\n        // Solve and print output\n        Solution sol = new Solution();\n        int[] result = sol.twoSum(n, nums, target);\n        System.out.println(result[0] + \" \" + result[1]);\n    }\n}",
        cpp: "#include<iostream>\n#include<vector>\nusing namespace std;\n\nvector<int> twoSum(int n, vector<int>& nums, int target) {\n    // Write your solution here\n    return vector<int>();\n}\n\nint main() {\n    // Read input\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int target;\n    cin >> target;\n\n    // Solve and print output\n    vector<int> result = twoSum(n, nums, target);\n    cout << result[0] << \" \" << result[1] << endl;\n    return 0;\n}"
      }
    },
    {
      id: 2,
      title: "Reverse String",
      difficulty: "Easy",
      description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
      constraints: [
        "1 <= s.length <= 10^5",
        "s[i] is a printable ascii character"
      ],
      inputFormat: "First line contains n (length of string)\nSecond line contains the string to reverse",
      outputFormat: "Single line with the reversed string",
      testCases: [
        {
          input: "5\nhello",
          output: "olleh",
          explanation: "String 'hello' reversed is 'olleh'"
        },
        {
          input: "7\nHancock",
          output: "kcocnaH",
          explanation: "String 'Hancock' reversed is 'kcocnaH'"
        },
        {
          input: "1\na",
          output: "a",
          explanation: "Single character string remains the same"
        }
      ],
      starterCode: {
        javascript: "function reverseString(n, s) {\n  // Write your solution here\n  \n}\n\n// Read input\nconst n = parseInt(readline());\nconst s = readline();\n\n// Solve and print output\nconst result = reverseString(n, s);\nconsole.log(result);",
        python: "def reverseString(n, s):\n    # Write your solution here\n    pass\n\n# Read input\nn = int(input())\ns = input()\n\n# Solve and print output\nresult = reverseString(n, s)\nprint(result)",
        java: "public class Solution {\n    public String reverseString(int n, String s) {\n        // Write your solution here\n        return \"\";\n    }\n\n    public static void main(String[] args) {\n        // Read input\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        int n = sc.nextInt();\n        String s = sc.next();\n\n        // Solve and print output\n        Solution sol = new Solution();\n        String result = sol.reverseString(n, s);\n        System.out.println(result);\n    }\n}",
        cpp: "#include<iostream>\n#include<string>\nusing namespace std;\n\nstring reverseString(int n, string s) {\n    // Write your solution here\n    return \"\";\n}\n\nint main() {\n    // Read input\n    int n;\n    cin >> n;\n    string s;\n    cin >> s;\n\n    // Solve and print output\n    string result = reverseString(n, s);\n    cout << result << endl;\n    return 0;\n}"
      }
    },
    {
      id: 3,
      title: "Palindrome Check",
      difficulty: "Easy",
      description: "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.\n\nA phrase is a palindrome if it reads the same backward as forward.",
      constraints: [
        "1 <= s.length <= 2 * 10^5",
        "s consists of printable ASCII characters"
      ],
      inputFormat: "Single line containing the string to check",
      outputFormat: "Output 'true' if the string is a palindrome, 'false' otherwise",
      testCases: [
        {
          input: "A man, a plan, a canal: Panama",
          output: "true",
          explanation: "After removing non-alphanumeric and ignoring case: 'amanaplanacanalpanama' is a palindrome"
        },
        {
          input: "race a car",
          output: "false",
          explanation: "After removing non-alphanumeric: 'raceacar' is not a palindrome"
        },
        {
          input: "0P",
          output: "false",
          explanation: "'0p' is not a palindrome"
        }
      ],
      starterCode: {
        javascript: "function isPalindrome(s) {\n  // Write your solution here\n  \n}\n\n// Read input\nconst s = readline();\n\n// Solve and print output\nconst result = isPalindrome(s);\nconsole.log(result ? 'true' : 'false');",
        python: "def isPalindrome(s):\n    # Write your solution here\n    pass\n\n# Read input\ns = input()\n\n# Solve and print output\nresult = isPalindrome(s)\nprint('true' if result else 'false')",
        java: "public class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        // Read input\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        String s = sc.nextLine();\n\n        // Solve and print output\n        Solution sol = new Solution();\n        boolean result = sol.isPalindrome(s);\n        System.out.println(result ? \"true\" : \"false\");\n    }\n}",
        cpp: "#include<iostream>\n#include<string>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    // Read input\n    string s;\n    getline(cin, s);\n\n    // Solve and print output\n    bool result = isPalindrome(s);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}"
      }
    },
    {
      id: 4,
      title: "Valid Parentheses",
      difficulty: "Easy",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets\n2. Open brackets must be closed in the correct order\n3. Every close bracket has a corresponding open bracket of the same type",
      constraints: [
        "1 <= s.length <= 10^4",
        "s consists of parentheses only '()[]{}'"
      ],
      inputFormat: "Single line containing a string of brackets",
      outputFormat: "Output 'true' if valid, 'false' if invalid",
      testCases: [
        {
          input: "()",
          output: "true",
          explanation: "Simple pair of parentheses is valid"
        },
        {
          input: "()[]{",
          output: "false",
          explanation: "Opening brace is not closed"
        },
        {
          input: "([{}])",
          output: "true",
          explanation: "All brackets properly nested and closed"
        }
      ],
      starterCode: {
        javascript: "function isValid(s) {\n  // Write your solution here\n  \n}\n\n// Read input\nconst s = readline();\n\n// Solve and print output\nconst result = isValid(s);\nconsole.log(result ? 'true' : 'false');",
        python: "def isValid(s):\n    # Write your solution here\n    pass\n\n# Read input\ns = input()\n\n# Solve and print output\nresult = isValid(s)\nprint('true' if result else 'false')",
        java: "public class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        // Read input\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        String s = sc.nextLine();\n\n        // Solve and print output\n        Solution sol = new Solution();\n        boolean result = sol.isValid(s);\n        System.out.println(result ? \"true\" : \"false\");\n    }\n}",
        cpp: "#include<iostream>\n#include<string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    // Read input\n    string s;\n    cin >> s;\n\n    // Solve and print output\n    bool result = isValid(s);\n    cout << (result ? \"true\" : \"false\") << endl;\n    return 0;\n}"
      }
    },
    {
      id: 5,
      title: "Fibonacci Number",
      difficulty: "Easy",
      description: "Given an integer n, return the nth Fibonacci number.\n\nThe Fibonacci sequence is defined as:\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2) for n > 1",
      constraints: [
        "0 <= n <= 30"
      ],
      inputFormat: "Single line containing an integer n",
      outputFormat: "Single line containing the nth Fibonacci number",
      testCases: [
        {
          input: "2",
          output: "1",
          explanation: "F(0) = 0, F(1) = 1, F(2) = F(1) + F(0) = 1"
        },
        {
          input: "3",
          output: "2",
          explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2"
        },
        {
          input: "4",
          output: "3",
          explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3"
        }
      ],
      starterCode: {
        javascript: "function fib(n) {\n  // Write your solution here\n  \n}\n\n// Read input\nconst n = parseInt(readline());\n\n// Solve and print output\nconst result = fib(n);\nconsole.log(result);",
        python: "def fib(n):\n    # Write your solution here\n    pass\n\n# Read input\nn = int(input())\n\n# Solve and print output\nresult = fib(n)\nprint(result)",
        java: "public class Solution {\n    public int fib(int n) {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        // Read input\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        int n = sc.nextInt();\n\n        // Solve and print output\n        Solution sol = new Solution();\n        int result = sol.fib(n);\n        System.out.println(result);\n    }\n}",
        cpp: "#include<iostream>\nusing namespace std;\n\nint fib(int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    // Read input\n    int n;\n    cin >> n;\n\n    // Solve and print output\n    int result = fib(n);\n    cout << result << endl;\n    return 0;\n}"
      }
    }
  ]
};

export default codingQuestions;
