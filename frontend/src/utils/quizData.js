export const QUESTION_BANK = {
  "web-dev": {
    easy: [
      {
        id: "wd-e1",
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink and Text Markup", "Home Tool Markup Language"],
        answer: "Hyper Text Markup Language"
      },
      {
        id: "wd-e2",
        question: "Which tag is used for the largest heading?",
        options: ["<h6>", "<h1>", "<heading>", "<head>"],
        answer: "<h1>"
      }
    ],
    medium: [
      {
        id: "wd-m1",
        question: "Which CSS property controls the text size?",
        options: ["font-style", "text-size", "font-size", "text-style"],
        answer: "font-size"
      },
      {
        id: "wd-m2",
        question: "How do you select an element with id 'demo' in CSS?",
        options: [".demo", "#demo", "demo", "*demo"],
        answer: "#demo"
      }
    ],
    hard: [
      {
        id: "wd-h1",
        question: "What is the output of: console.log(typeof NaN)?",
        options: ["'number'", "'NaN'", "'undefined'", "'object'"],
        answer: "'number'"
      },
      {
        id: "wd-h2",
        question: "Which hook is used for side effects in React?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        answer: "useEffect"
      }
    ]
  },
  "python": {
    easy: [
      { id: "py-e1", question: "How do you print 'Hello' in Python?", options: ["echo 'Hello'", "print('Hello')", "console.log('Hello')", "printf('Hello')"], answer: "print('Hello')" }
    ],
    medium: [
      { id: "py-m1", question: "Which collection is ordered and changeable?", options: ["Tuple", "Set", "Dictionary", "List"], answer: "List" }
    ],
    hard: [
      { id: "py-h1", question: "What is a decorator in Python?", options: ["A function that modifies another function", "A class attribute", "A styling tool", "A database connector"], answer: "A function that modifies another function" }
    ]
  },
  "java": {
    easy: [{ id: "j-e1", question: "Java is a _ language?", options: ["Procedural", "Object-Oriented", "Functional", "Scripting"], answer: "Object-Oriented" }],
    medium: [{ id: "j-m1", question: "Which keyword is used to inherit a class?", options: ["implements", "extends", "inherits", "super"], answer: "extends" }],
    hard: [{ id: "j-h1", question: "What is the size of an int in Java?", options: ["16 bit", "32 bit", "64 bit", "8 bit"], answer: "32 bit" }]
  },
  "data-science": {
    easy: [{ id: "ds-e1", question: "Which library is used for data manipulation?", options: ["Pandas", "React", "Flask", "Django"], answer: "Pandas" }],
    medium: [{ id: "ds-m1", question: "What does CSV stand for?", options: ["Comma Separated Values", "Computer Style Values", "Code Syntax Values", "None"], answer: "Comma Separated Values" }],
    hard: [{ id: "ds-h1", question: "Which algorithm is a supervised learning method?", options: ["K-Means", "Linear Regression", "Apriori", "DBSCAN"], answer: "Linear Regression" }]
  },
  // Fallback for other domains
  "default": {
    easy: [{ id: "def-e1", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" }],
    medium: [{ id: "def-m1", question: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: "12" }],
    hard: [{ id: "def-h1", question: "Solve for x: 2x + 5 = 15", options: ["2", "5", "10", "7.5"], answer: "5" }]
  }
};

export default QUESTION_BANK;