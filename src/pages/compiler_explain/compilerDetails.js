export const COMPILER_STEP_DETAILS = [
  {
    title: "1. Lexical Analysis (Scanner)",
    phase: "Front-End",
    analogy: "Reading a paragraph and separating it into individual words, punctuation marks, and numbers.",
    summary: "The compiler reads the raw source code character by character and groups them into meaningful sequences called 'Tokens'. It also strips out whitespaces and comments.",
    technical: [
      "Mechanism: Uses Finite Automata and Regular Expressions to recognize patterns.",
      "Output: A stream of Tokens (Identifiers, Keywords, Operators, Literals).",
      "Error Handling: Throws 'Lexical Errors' for illegal characters (e.g., a stray '@' symbol in C++).",
      "Tools: Lex, Flex."
    ],
    code: `// Source Code:
int result = a + 5;

// Output Stream of Tokens:
[KEYWORD: "int"] 
[IDENTIFIER: "result"] 
[OPERATOR: "="] 
[IDENTIFIER: "a"] 
[OPERATOR: "+"] 
[LITERAL_INT: "5"] 
[PUNCTUATOR: ";"]`
  },
  {
    title: "2. Syntax Analysis (Parser)",
    phase: "Front-End",
    analogy: "Checking the grammatical structure to ensure the words form a valid sentence (Noun + Verb + Object).",
    summary: "The parser takes the stream of tokens and checks them against the grammatical rules (context-free grammar) of the programming language. It builds a hierarchical structure called an Abstract Syntax Tree (AST).",
    technical: [
      "Mechanism: Uses Context-Free Grammars (CFG) and pushdown automata.",
      "Output: Abstract Syntax Tree (AST).",
      "Error Handling: Throws 'Syntax Errors' (e.g., missing semicolons, unmatched parentheses).",
      "Tools: Yacc, Bison."
    ],
    code: `// Resulting Abstract Syntax Tree (AST):
      =
     / \\
result  +
       / \\
      a   5`
  },
  {
    title: "3. Semantic Analysis",
    phase: "Front-End",
    analogy: "Ensuring the grammatically correct sentence actually makes logical sense. (e.g., 'The rock ate a car' has good grammar, but bad semantics).",
    summary: "The compiler checks the AST for semantic consistency. It ensures variables are declared before use, types are compatible, and function calls match their definitions.",
    technical: [
      "Mechanism: Traverses the AST and populates the Symbol Table (tracking scopes, types, and variable names).",
      "Type Checking: Ensures you aren't trying to divide a String by a Boolean.",
      "Output: Annotated / Decorated AST.",
      "Error Handling: Throws 'Semantic Errors' (e.g., Type mismatch, undeclared variable)."
    ],
    code: `// Semantic check example:
int a = "hello"; 

// Semantic Analyzer Output:
// ERROR: Incompatible types. 
// Cannot assign 'String' to 'Integer'.`
  },
  {
    title: "4. Intermediate Code Generation",
    phase: "Middle-End",
    analogy: "Translating the sentence into an intermediary, universal language (like Esperanto) before translating it into the final local dialect.",
    summary: "The compiler translates the AST into a low-level, machine-independent representation. This makes it easier to optimize and allows the same front-end to target multiple CPU architectures.",
    technical: [
      "Format: Often represented as Three-Address Code (TAC), where instructions have at most three operands.",
      "Advantage: Decouples the programming language from the target machine architecture (e.g., LLVM IR).",
      "Platform agnostic: The exact same IR can be handed to x86, ARM, or WebAssembly back-ends."
    ],
    code: `// Source: result = a + b * c;

// Three-Address Code (TAC) Output:
t1 = b * c
t2 = a + t1
result = t2`
  },
  {
    title: "5. Code Optimization",
    phase: "Middle-End",
    analogy: "Editing the sentence to be as short and concise as possible without changing its original meaning.",
    summary: "The compiler analyzes the intermediate code and applies transformations to make it execute faster or consume less memory.",
    technical: [
      "Techniques: Dead code elimination, constant folding, loop unrolling, and inline expansion.",
      "Performance: This is what happens when you compile with the '-O3' flag.",
      "Output: Optimized Intermediate Code."
    ],
    code: `// Before Optimization (Constant Folding):
int x = 10 * 5;
int y = x + 1;

// After Optimization:
// The compiler does the math at compile-time!
int x = 50;
int y = 51;`
  },
  {
    title: "6. Target Code Generation",
    phase: "Back-End",
    analogy: "Translating the finalized, optimized sentence into the exact native dialect spoken by the specific listener.",
    summary: "The optimized intermediate code is translated into the specific machine code or assembly language of the target CPU architecture (like x86-64 or ARM).",
    technical: [
      "Register Allocation: Deciding which variables will live in the CPU's limited, ultra-fast hardware registers.",
      "Instruction Selection: Picking the most efficient CPU-specific instructions to accomplish tasks.",
      "Output: Assembly Code or Relocatable Object/Binary code (.o / .obj files), ready for the Linker."
    ],
    code: `; Translated to x86 Assembly
mov eax, DWORD PTR [a]    ; Load 'a' into register
add eax, 5                ; Add 5 to register
mov DWORD PTR [result], eax ; Store result`
  }
];