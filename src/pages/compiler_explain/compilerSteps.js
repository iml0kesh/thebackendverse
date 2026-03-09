export const COMPILER_STEPS = [
  { id: "source", icon: "📝", label: "Source Code", phase: "Frontend" },
  { id: "lexer", icon: "🔤", label: "Lexer", phase: "Frontend" },
  { id: "tokens", icon: "🪙", label: "Tokens", phase: "Frontend" },
  { id: "parser", icon: "🌳", label: "Parser", phase: "Frontend" },
  { id: "ast", icon: "🗂️", label: "AST", phase: "Frontend" },
  { id: "semantic", icon: "🔍", label: "Semantic Analysis", phase: "Middle" },
  { id: "ir", icon: "⚙️", label: "Intermediate Code", phase: "Middle" },
  { id: "optimizer", icon: "🚀", label: "Optimizer", phase: "Middle" },
  { id: "codegen", icon: "💻", label: "Code Generation", phase: "Backend" },
  { id: "assembly", icon: "🔧", label: "Assembly", phase: "Backend" },
  { id: "machine", icon: "⚡", label: "Machine Code", phase: "Backend" },
];

export const COMPILER_PHASE_COLORS = {
  Frontend: "#06d6a0",
  Middle: "#a29bfe",
  Backend: "#ff6b35",
};
