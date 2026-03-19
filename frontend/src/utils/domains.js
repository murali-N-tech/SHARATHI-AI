import { 
  Calculator, FlaskConical, Monitor, Code2, Network, BrainCircuit, 
  BarChart3, Globe, ShieldCheck, Cpu, Puzzle, Languages, Server, 
  Database, Leaf, Briefcase 
} from 'lucide-react';

export const DOMAINS = [
  { 
    id: 'mathematics', 
    title: 'Mathematics', 
    icon: Calculator, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50',
    programs: ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Probability & Statistics']
  },
  { 
    id: 'science', 
    title: 'Science', 
    icon: FlaskConical, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50',
    programs: ['Physics', 'Chemistry', 'Biology']
  },
  { 
    id: 'computer-fundamentals', 
    title: 'Computer Fundamentals', 
    icon: Monitor, 
    color: 'text-slate-500', 
    bg: 'bg-slate-50',
    programs: ['Basics', 'MS Office', 'Internet', 'Networking Basics']
  },
  { 
    id: 'programming', 
    title: 'Programming', 
    icon: Code2, 
    color: 'text-violet-500', 
    bg: 'bg-violet-50',
    programs: ['Python', 'Java', 'C', 'C++']
  },
  { 
    id: 'dsa', 
    title: 'Data Structures (DSA)', 
    icon: Network, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50',
    programs: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting']
  },
  { 
    id: 'ai', 
    title: 'Artificial Intelligence', 
    icon: BrainCircuit, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    programs: ['ML Basics', 'Neural Networks', 'NLP', 'Reinforcement Learning']
  },
  { 
    id: 'data-science', 
    title: 'Data Science', 
    icon: BarChart3, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-50',
    programs: ['Pandas', 'NumPy', 'Visualization', 'Statistics']
  },
  { 
    id: 'web-dev', 
    title: 'Web Development', 
    icon: Globe, 
    color: 'text-orange-500', 
    bg: 'bg-orange-50',
    programs: ['HTML/CSS', 'JavaScript', 'React', 'Node.js']
  },
  { 
    id: 'cyber-security', 
    title: 'Cyber Security', 
    icon: ShieldCheck, 
    color: 'text-red-500', 
    bg: 'bg-red-50',
    programs: ['Network Security', 'Cryptography', 'Ethical Hacking']
  },
  { 
    id: 'electronics', 
    title: 'Electronics', 
    icon: Cpu, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-50',
    programs: ['Digital Logic', 'Microcontrollers', 'IoT', 'Sensors']
  },
  { 
    id: 'aptitude', 
    title: 'Logical Reasoning', 
    icon: Puzzle, 
    color: 'text-teal-500', 
    bg: 'bg-teal-50',
    programs: ['Puzzles', 'Pattern Recognition', 'Quant', 'Analytical']
  },
  { 
    id: 'communication', 
    title: 'Communication', 
    icon: Languages, 
    color: 'text-pink-500', 
    bg: 'bg-pink-50',
    programs: ['Grammar', 'Vocabulary', 'Presentation', 'Writing']
  },
  { 
    id: 'os-networking', 
    title: 'OS & Networking', 
    icon: Server, 
    color: 'text-gray-600', 
    bg: 'bg-gray-100',
    programs: ['Process Mgmt', 'Memory', 'TCP/IP', 'Protocols']
  },
  { 
    id: 'database', 
    title: 'Database & SQL', 
    icon: Database, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    programs: ['SQL Queries', 'Relational DB', 'NoSQL', 'Normalization']
  },
  { 
    id: 'environmental', 
    title: 'Environment', 
    icon: Leaf, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    programs: ['Sustainability', 'Climate Change', 'Social Responsibility']
  },
  { 
    id: 'career', 
    title: 'Career Skills', 
    icon: Briefcase, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    programs: ['Resume Writing', 'Interviews', 'Time Mgmt', 'Teamwork']
  }
];