export const COMPILER_STEP_DETAILS = [
  {
    title: "1. Source Code",
    phase: "Phase 1: Frontend",
    summary:
      "You write code in a high-level language like JavaScript or C++. To you, it makes sense. To the computer, it's just a long string of text characters.",
    technical: [
      "Stored as bytes (UTF-8) on your hard drive.",
      "The compiler reads it one character at a time.",
      "It has no structure yet—just a sequence of letters, numbers, and symbols.",
    ],
    code: `// You write this:
let x = 10 + 5;

// The computer sees this:
"l", "e", "t", " ", "x", " ", "=", " ", "1", "0", " ", "+", " ", "5", ";"`,
  },
  {
    title: "2. Lexer (The Scanner)",
    phase: "Phase 1: Frontend",
    summary:
      "The Lexer reads the raw text and groups characters into words, known as 'Tokens'. It ignores whitespace and comments, focusing only on the meaningful parts.",
    technical: [
      "Scans the code left-to-right.",
      "Identifies keywords (let, if), identifiers (variable names), and operators (+, =).",
      "Throws an error if it finds a character it doesn't recognize.",
    ],
    code: `// Input: "let x = 10;"

// Lexer identifies:
// "let" -> Keyword
// "x"   -> Identifier
// "="   -> Operator
// "10"  -> Number
// ";"   -> Punctuation`,
  },
  {
    title: "3. Token Stream",
    phase: "Phase 1: Frontend",
    summary:
      "The result of the Lexer is a flat list of tokens. This is a clean version of your code—no spaces, no comments, just the meaningful atoms of the language.",
    technical: [
      "A linear stream of objects.",
      "Each token has a type (e.g., KEYWORD) and a value (e.g., 'let').",
      "This stream is what the Parser will analyze next.",
    ],
    code: `[
  { type: "KEYWORD", value: "let" },
  { type: "IDENTIFIER", value: "x" },
  { type: "OPERATOR", value: "=" },
  { type: "NUMBER", value: "10" },
  { type: "PUNCTUATION", value: ";" }
]`,
  },
  {
    title: "4. Parser (The Grammar Check)",
    phase: "Phase 1: Frontend",
    summary:
      "The Parser takes the tokens and organizes them into a structure based on the language's grammar. It checks if your code follows the rules (syntax).",
    technical: [
      "Builds a hierarchical tree structure.",
      "Ensures parentheses match and statements end correctly.",
      "Throws 'Syntax Error' if the code structure is invalid.",
    ],
    code: `// Input Tokens: "if", "(", "x", ")" ...

// Parser checks rules:
// Rule: IfStatement = "if" + "(" + Expression + ")" + Block

// If you wrote "if x )", the parser explodes here because "(" is missing.`,
  },
  {
    title: "5. Abstract Syntax Tree (AST)",
    phase: "Phase 1: Frontend",
    summary:
      "The AST is a tree representing the logic of your program. It removes syntax details (like parentheses) and keeps the hierarchy. Tools like Prettier or ESLint work on this tree.",
    technical: [
      "Root node represents the file.",
      "Child nodes represent functions, statements, and expressions.",
      "This is the core data structure used by the compiler.",
    ],
    code: `// Code: 5 + 3 * 2

// AST Tree Structure:
{
  type: "BinaryExpression",
  operator: "+",
  left: 5,
  right: {
    type: "BinaryExpression",
    operator: "*",
    left: 3,
    right: 2
  }
}
// Note: 3 * 2 is grouped together because * has higher precedence than +.`,
  },
  {
    title: "6. Semantic Analysis (Meaning)",
    phase: "Phase 2: Middle End",
    summary:
      "The compiler checks if the code makes sense. Is 'x' defined? Are you trying to add a string to a number? This is where type errors and scope errors are caught.",
    technical: [
      "Scope checking: Verifies variables are declared before use.",
      "Type checking: Ensures operations are valid for the data types.",
      "This step adds extra information (types) to the AST.",
    ],
    code: `// Syntax is fine, but Semantics are wrong:

const x = "hello";
let y = x * 10; 
// Error: Cannot multiply string by number.

console.log(z);
// Error: 'z' is not defined.`,
  },
  {
    title: "7. Intermediate Representation (IR)",
    phase: "Phase 2: Middle End",
    summary:
      "The compiler translates the AST into a simplified, generic language called IR. This allows the same compiler to support multiple languages (C++, Rust, Swift) and multiple CPUs (Intel, ARM).",
    technical: [
      "Generic code, not specific to any machine.",
      "LLVM IR is the most famous example.",
      "It looks like a simplified Assembly language.",
    ],
    code: `; LLVM IR Example
%temp1 = mul i32 3, 2       ; 3 * 2
%result = add i32 5, %temp1 ; 5 + result

; This same IR can be compiled to run on your laptop or your phone.`,
  },
  {
    title: "8. Optimizer",
    phase: "Phase 2: Middle End",
    summary:
      "The optimizer analyzes the IR to make it faster and smaller without changing what the program does. It removes useless code, pre-calculates math, and simplifies logic.",
    technical: [
      "Constant Folding: '5 + 3' becomes '8' at compile time.",
      "Dead Code Elimination: Removes code that never runs.",
      "Inlining: Replaces function calls with the function body to save time.",
    ],
    code: `// Before Optimization:
function test() {
  let a = 10 + 20;
  return a;
  console.log("Unreachable"); // Dead code
}

// After Optimization:
function test() {
  return 30; // Calculated 10+20 and removed dead code
}`,
  },
  {
    title: "9. Code Generation",
    phase: "Phase 3: Backend",
    summary:
      "The compiler translates the optimized IR into specific instructions for your target CPU (like x86 for PCs or ARM for phones).",
    technical: [
      "Maps generic operations to specific CPU instructions.",
      "Allocates CPU registers (fast memory) for variables.",
      "This is where the code becomes specific to your hardware.",
    ],
    code: `// IR: add 5, 3

// x86 (Intel) Generation:
ADD EAX, 3

// ARM (Apple Silicon) Generation:
ADD W0, W0, #3`,
  },
  {
    title: "10. Assembly",
    phase: "Phase 3: Backend",
    summary:
      "Assembly is the text representation of machine code. It's the last step where code is still readable by humans (barely). Each line corresponds to one CPU instruction.",
    technical: [
      "1-to-1 mapping with machine code.",
      "Uses mnemonics like MOV (move), ADD (add), RET (return).",
      "Specific to the architecture (x86 vs ARM).",
    ],
    code: `_main:
  mov eax, 5      ; Load 5 into register eax
  add eax, 3      ; Add 3 to eax
  ret             ; Return`,
  },
  {
    title: "11. Machine Code",
    phase: "Phase 3: Backend",
    summary:
      "The final output. Pure binary numbers that the CPU executes. This is your .exe or executable file. The CPU reads these bytes and performs the operations.",
    technical: [
      "Binary instructions (1s and 0s).",
      "Executed directly by hardware.",
      "Not human readable.",
    ],
    code: `// Hex representation of instructions:
B8 05 00 00 00  // MOV EAX, 5
83 C0 03        // ADD EAX, 3
C3              // RET

// The CPU sees:
// 10111000 00000101 ...`,
  },
];
