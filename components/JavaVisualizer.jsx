// "use client";

// import { useState, useEffect, useRef } from "react";
// import mermaid from "mermaid";

// export default function JavaVisualizer() {
//   const [javaCode, setJavaCode] = useState(
//     `void printMatrix(int[][] matrix) {
//     for (int i = 0; i < matrix.length; i++) {
//         for (int j = 0; j < matrix[0].length; j++) {
//             System.out.print(matrix[i][j]);
//         }
//     }
// }`
//   );
  
//   const [mermaidSyntax, setMermaidSyntax] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const mermaidRef = useRef(null);

//   useEffect(() => {
//     mermaid.initialize({ startOnLoad: false, theme: "default" });
//   }, []);

//   const generateDiagram = async () => {
//     setErrorMessage(""); // Clear old errors
//     try {
//       let graphDef = "graph TD\n";
//       let nodeId = 1;
      
//       // 1. ULTRA-SAFE TEXT SANITIZER (Fixes Mermaid Parse Errors)
//       const safeText = (text) => {
//         return text
//           .replace(/["\[\]]/g, "'") // replace quotes and array brackets with single quotes
//           .replace(/</g, "&lt;")    // escape less-than (prevents HTML tag errors)
//           .replace(/>/g, "&gt;")    // escape greater-than
//           .replace(/[{}]/g, "")     // remove curly braces inside text
//           .trim();
//       };
      
//       const createNode = (text, shape = "rect") => {
//         const id = `N${nodeId++}`;
//         const escaped = safeText(text);
        
//         if (shape === "diamond") graphDef += `${id}{"${escaped}"}\n`;
//         // Use stadium boundaries ([" "]) which is much safer in Mermaid than ( )
//         else if (shape === "round") graphDef += `${id}(["${escaped}"])\n`; 
//         else graphDef += `${id}["${escaped}"]\n`;
        
//         return id;
//       };

//       const connect = (from, to, label = "") => {
//         if (!from || !to) return;
//         if (label) {
//             // Strip out parentheses from labels to prevent the 'PS' Parse Error
//             const safeLabel = label.replace(/[()]/g, ""); 
//             graphDef += `${from} -->|${safeLabel}| ${to}\n`;
//         } else {
//             graphDef += `${from} --> ${to}\n`;
//         }
//       };

//       const cleanCode = javaCode
//         .split('\n')
//         .map(line => line.split('//')[0].trim()) 
//         .filter(line => line.length > 0);

//       let previousNode = null;
//       let stack = []; 
//       let currentMethodName = "";
//       let currentMethodStartNode = null;

//       for (let i = 0; i < cleanCode.length; i++) {
//         let line = cleanCode[i];

//         // Handle closing brackets
//         if (line.startsWith("}")) {
//           if (stack.length > 0) {
//             let block = stack.pop();
            
//             // Loop Backwards
//             if (block.type === "loop") {
//                 connect(previousNode, block.loopNode, "Next Iteration");
//                 let loopExit = createNode("Exit Loop", "round");
//                 connect(block.loopNode, loopExit, "Loop Finished");
//                 previousNode = loopExit;
//             } 
//           }
//           continue;
//         }

//         // Method Declaration
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//           let methodNode = createNode(line.replace("{", ""), "round");
//           previousNode = methodNode;
//           currentMethodStartNode = methodNode;
//           let beforeParens = line.split("(")[0].trim();
//           let words = beforeParens.split(/\s+/);
//           currentMethodName = words[words.length - 1]; 
//           continue;
//         }

//         // Detect LOOPS (For / While)
//         if (line.startsWith("for") || line.startsWith("while")) {
//             let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//             let loopNode = createNode(`Loop: ${condition}`, "diamond");
//             connect(previousNode, loopNode);
            
//             stack.push({ type: "loop", loopNode: loopNode });
            
//             let insideLoopStart = createNode("Enter Loop", "rect");
//             connect(loopNode, insideLoopStart, "Condition Met");
//             previousNode = insideLoopStart;
//             continue;
//         }

//         // Detect IF Statements
//         if (line.startsWith("if")) {
//           let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//           let ifNode = createNode(`if ${condition}`, "diamond");
//           connect(previousNode, ifNode);
          
//           let remainder = line.substring(line.lastIndexOf(")") + 1).trim();

//           if (remainder.startsWith("{") || remainder === "") {
//             stack.push({ type: "if", mergeNode: ifNode });
//             let trueNode = createNode("True Path", "round");
//             connect(ifNode, trueNode, "True");
//             previousNode = trueNode;
//           } else {
//             let inlineNode = createNode(remainder.replace(";", ""), "rect");
//             connect(ifNode, inlineNode, "True");
//             if (remainder.includes("return")) {
//                 let finalState = createNode("Final Answer", "round");
//                 connect(inlineNode, finalState, "End");
//             }
//             let falseNode = createNode("False Path", "round");
//             connect(ifNode, falseNode, "False");
//             previousNode = falseNode;
//           }
//           continue;
//         }

//         // Recursion
//         if (currentMethodName && line.includes(currentMethodName + "(")) {
//             let recursiveNode = createNode(line.replace("{", "").replace(";", ""));
//             connect(previousNode, recursiveNode);
//             connect(recursiveNode, currentMethodStartNode, "Recursive Call");
//             previousNode = recursiveNode;
//             continue;
//         }

//         // Standard Statements
//         let statementNode = createNode(line.replace("{", "").replace(";", ""));
//         connect(previousNode, statementNode);
//         previousNode = statementNode;
//       }

//       setMermaidSyntax(graphDef);

//       if (mermaidRef.current) {
//         mermaidRef.current.innerHTML = "";
//         const { svg } = await mermaid.render("mermaid-svg-chart", graphDef);
//         mermaidRef.current.innerHTML = svg;
//       }
//     } catch (error) {
//       console.error("Mermaid Render Error:", error);
//       setErrorMessage("Flowchart parsing failed. The code structure might be too complex for simple text parsing.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 p-6">
//       <h2 className="text-2xl font-bold">Algorithm Visualizer (Loops + Recursion)</h2>
      
//       {/* Error Banner */}
//       {errorMessage && (
//         <div className="p-4 bg-red-100 text-red-700 font-bold border border-red-400 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <div className="flex gap-4 min-h-[600px]">
//         <textarea
//           className="w-1/3 p-4 font-mono text-sm bg-gray-900 text-white rounded"
//           value={javaCode}
//           onChange={(e) => setJavaCode(e.target.value)}
//         />
//         <div 
//            className="w-2/3 p-4 border-2 rounded bg-white overflow-auto flex justify-center items-start"
//            ref={mermaidRef}
//         ></div>
//       </div>
//       <button 
//         onClick={generateDiagram}
//         className="px-6 py-2 bg-blue-600 text-white font-bold rounded w-max hover:bg-blue-700"
//       >
//         Generate Flowchart
//       </button>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect, useRef } from "react";
// import mermaid from "mermaid";

// export default function JavaVisualizer() {
//   const [javaCode, setJavaCode] = useState(
//     `// Insert an item at the bottom of the stack
// static void insertAtBottom(Stack<Integer> st, int item) {
//     if (st.empty()) {
//         st.push(item);
//         return;
//     }
//     int top = st.pop();
//     insertAtBottom(st, item);
//     st.push(top);
// }

// // Reverse the stack
// public static void reverseStack(Stack<Integer> st) {
//     if (st.empty()) return;

//     int top = st.pop();
//     reverseStack(st);           // reverse remaining stack
//     insertAtBottom(st, top);    // put popped element at the bottom
// }`
//   );
  
//   const [mermaidSyntax, setMermaidSyntax] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const mermaidRef = useRef(null);

//   useEffect(() => {
//     mermaid.initialize({ startOnLoad: false, theme: "default" });
//   }, []);

//   const generateDiagram = async () => {
//     setErrorMessage(""); 
//     try {
//       let graphDef = "graph TD\n";
//       let nodeId = 1;
      
//       // 1. ULTRA-SAFE TEXT SANITIZER
//       const safeText = (text) => {
//         return text
//           .replace(/[`"\[\]]/g, "'") // strips backticks (```), quotes, and brackets
//           .replace(/</g, "&lt;")    
//           .replace(/>/g, "&gt;")    
//           .replace(/[{}]/g, "")     
//           .trim();
//       };
      
//       const createNode = (text, shape = "rect") => {
//         const id = `N${nodeId++}`;
//         const escaped = safeText(text);
        
//         if (shape === "diamond") graphDef += `${id}{"${escaped}"}\n`;
//         else if (shape === "round") graphDef += `${id}(["${escaped}"])\n`; 
//         else graphDef += `${id}["${escaped}"]\n`;
        
//         return id;
//       };

//       const connect = (from, to, label = "") => {
//         if (!from || !to) return;
//         if (label) {
//             const safeLabel = label.replace(/[()]/g, ""); 
//             graphDef += `${from} -->|${safeLabel}| ${to}\n`;
//         } else {
//             graphDef += `${from} --> ${to}\n`;
//         }
//       };

//       // 2. CLEAN CODE: Remove markdown blocks and comments
//       const cleanCode = javaCode
//         .split('\n')
//         .map(line => line.split('//')[0].trim()) 
//         .filter(line => line.length > 0 && !line.startsWith('```') && !line.startsWith('**')); // Ignores markdown fences and bold text

//       let previousNode = null;
//       let stack = []; 
      
//       // 3. PASS 1: Identify all functions to support multi-function linking
//       let knownMethods = {};
//       cleanCode.forEach(line => {
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//             let beforeParens = line.split("(")[0].trim();
//             let words = beforeParens.split(/\s+/);
//             let methodName = words[words.length - 1]; 
//             knownMethods[methodName] = true; // Mark as known
//         }
//       });

//       // 4. PASS 2: Generate Flowchart
//       for (let i = 0; i < cleanCode.length; i++) {
//         let line = cleanCode[i];

//         // Handle closing brackets
//         if (line.startsWith("}")) {
//           if (stack.length > 0) {
//             let block = stack.pop();
//             if (block.type === "loop") {
//                 connect(previousNode, block.loopNode, "Next Iteration");
//                 let loopExit = createNode("Exit Loop", "round");
//                 connect(block.loopNode, loopExit, "Loop Finished");
//                 previousNode = loopExit;
//             } else if (block.type === "if") {
//                 previousNode = block.mergeNode; // Continue after IF
//             }
//           }
//           continue;
//         }

//         // Detect Method Declarations
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//           let beforeParens = line.split("(")[0].trim();
//           let words = beforeParens.split(/\s+/);
//           let methodName = words[words.length - 1]; 
          
//           let methodNode = createNode(`Function: ${methodName}`, "round");
//           knownMethods[methodName] = methodNode; // Save exact Node ID for linking later
//           previousNode = methodNode;
//           continue;
//         }

//         // Detect IF Statements
//         if (line.startsWith("if")) {
//           let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//           let ifNode = createNode(`if ${condition}`, "diamond");
//           connect(previousNode, ifNode);
          
//           let remainder = line.substring(line.lastIndexOf(")") + 1).trim();

//           if (remainder.startsWith("{") || remainder === "") {
//             stack.push({ type: "if", mergeNode: ifNode });
//             let trueNode = createNode("True Path", "rect");
//             connect(ifNode, trueNode, "True");
//             previousNode = trueNode;
//           } else {
//             let inlineNode = createNode(remainder.replace(";", ""), "rect");
//             connect(ifNode, inlineNode, "True");
//             if (remainder.includes("return")) {
//                 let finalState = createNode("Return", "round");
//                 connect(inlineNode, finalState, "End");
//             }
//             let falseNode = createNode("False Path", "rect");
//             connect(ifNode, falseNode, "False");
//             previousNode = falseNode;
//           }
//           continue;
//         }

//         // Detect Function Calls (Recursion AND Helper Functions)
//         let foundMethodCall = Object.keys(knownMethods).find(name => line.includes(name + "("));
//         if (foundMethodCall && knownMethods[foundMethodCall] !== true) { // Make sure node ID exists
//             let callNode = createNode(line.replace("{", "").replace(";", ""));
//             connect(previousNode, callNode);
            
//             // Draw link to the function it is calling
//             connect(callNode, knownMethods[foundMethodCall], `Calls ${foundMethodCall}`);
//             previousNode = callNode;
//             continue;
//         }

//         // Standard Statements
//         let statementNode = createNode(line.replace("{", "").replace(";", ""));
//         connect(previousNode, statementNode);
//         previousNode = statementNode;
//       }

//       setMermaidSyntax(graphDef);

//       if (mermaidRef.current) {
//         mermaidRef.current.innerHTML = "";
//         const { svg } = await mermaid.render("mermaid-svg-chart", graphDef);
//         mermaidRef.current.innerHTML = svg;
//       }
//     } catch (error) {
//       console.error("Mermaid Render Error:", error);
//       setErrorMessage("Flowchart parsing failed. Check for weird symbols or highly complex syntax.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 p-6">
//       <h2 className="text-2xl font-bold">Multi-Function Algorithm Visualizer</h2>
      
//       {errorMessage && (
//         <div className="p-4 bg-red-100 text-red-700 font-bold border border-red-400 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <div className="flex gap-4 min-h-[600px]">
//         <textarea
//           className="w-1/3 p-4 font-mono text-sm bg-gray-900 text-white rounded"
//           value={javaCode}
//           onChange={(e) => setJavaCode(e.target.value)}
//         />
//         <div 
//            className="w-2/3 p-4 border-2 rounded bg-white overflow-auto flex justify-center items-start"
//            ref={mermaidRef}
//         ></div>
//       </div>
//       <button 
//         onClick={generateDiagram}
//         className="px-6 py-2 bg-blue-600 text-white font-bold rounded w-max hover:bg-blue-700"
//       >
//         Generate Flowchart
//       </button>
//     </div>
//   );
// }












// nice one
// "use client";

// import { useState, useEffect, useRef } from "react";
// import mermaid from "mermaid";

// export default function JavaVisualizer() {
//   const [javaCode, setJavaCode] = useState(
//     `void printMatrix(int[][] matrix) {
//     for (int i = 0; i < matrix.length; i++) {
//         for (int j = 0; j < matrix[0].length; j++) {
//             System.out.print(matrix[i][j]);
//         }
//     }
// }`
//   );
  
//   const [mermaidSyntax, setMermaidSyntax] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const mermaidRef = useRef(null);

//   useEffect(() => {
//     mermaid.initialize({ startOnLoad: false, theme: "default" });
//   }, []);

//   const generateDiagram = async () => {
//     setErrorMessage(""); 
//     try {
//       let graphDef = "graph TD\n";
//       let nodeId = 1;
      
//       const safeText = (text) => {
//         return text
//           .replace(/[`"\[\]]/g, "'") 
//           .replace(/</g, "&lt;")    
//           .replace(/>/g, "&gt;")    
//           .replace(/[{}]/g, "")     
//           .trim();
//       };
      
//       const createNode = (text, shape = "rect") => {
//         const id = `N${nodeId++}`;
//         const escaped = safeText(text);
        
//         if (shape === "diamond") graphDef += `${id}{"${escaped}"}\n`;
//         else if (shape === "round") graphDef += `${id}(["${escaped}"])\n`; 
//         else graphDef += `${id}["${escaped}"]\n`;
        
//         return id;
//       };

//       const connect = (from, to, label = "") => {
//         if (!from || !to) return;
//         if (label) {
//             const safeLabel = label.replace(/[()]/g, ""); 
//             graphDef += `${from} -->|${safeLabel}| ${to}\n`;
//         } else {
//             graphDef += `${from} --> ${to}\n`;
//         }
//       };

//       const cleanCode = javaCode
//         .split('\n')
//         .map(line => line.split('//')[0].trim()) 
//         .filter(line => line.length > 0 && !line.startsWith('```') && !line.startsWith('**'));

//       let previousNode = null;
//       let stack = []; 
      
//       // PASS 1: Find all functions
//       let knownMethods = {};
//       cleanCode.forEach(line => {
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//             let beforeParens = line.split("(")[0].trim();
//             let words = beforeParens.split(/\s+/);
//             let methodName = words[words.length - 1]; 
//             knownMethods[methodName] = true; 
//         }
//       });

//       // PASS 2: Build the Flowchart
//       for (let i = 0; i < cleanCode.length; i++) {
//         let line = cleanCode[i];

//         // 1. Handle Closing Brackets (Stack Unwinding)
//         if (line.startsWith("}")) {
//           if (stack.length > 0) {
//             let block = stack.pop();
            
//             if (block.type === "loop") {
//                 // Loop Back to Diamond
//                 connect(previousNode, block.loopNode, "Next Iteration");
                
//                 // Exit Loop Path
//                 let loopExit = createNode("Exit Loop", "round");
//                 connect(block.loopNode, loopExit, "Loop Finished / False");
//                 previousNode = loopExit;
//             } else if (block.type === "if") {
//                 previousNode = block.mergeNode; 
//             }
//           }
//           continue;
//         }

//         // 2. Detect Method Declarations
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//           let beforeParens = line.split("(")[0].trim();
//           let words = beforeParens.split(/\s+/);
//           let methodName = words[words.length - 1]; 
          
//           let methodNode = createNode(`Function: ${methodName}`, "round");
//           knownMethods[methodName] = methodNode; 
//           previousNode = methodNode;
//           continue;
//         }

//         // 3. RESTORED: Detect LOOPS (For / While)
//         if (line.startsWith("for") || line.startsWith("while")) {
//             let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//             let loopNode = createNode(`Loop: ${condition}`, "diamond");
//             connect(previousNode, loopNode);
            
//             stack.push({ type: "loop", loopNode: loopNode });
            
//             let insideLoopStart = createNode("Enter Loop", "rect");
//             connect(loopNode, insideLoopStart, "Condition Met / True");
//             previousNode = insideLoopStart;
//             continue;
//         }

//         // 4. Detect IF Statements
//         if (line.startsWith("if")) {
//           let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//           let ifNode = createNode(`if ${condition}`, "diamond");
//           connect(previousNode, ifNode);
          
//           let remainder = line.substring(line.lastIndexOf(")") + 1).trim();

//           if (remainder.startsWith("{") || remainder === "") {
//             stack.push({ type: "if", mergeNode: ifNode });
//             let trueNode = createNode("True Path", "rect");
//             connect(ifNode, trueNode, "True");
//             previousNode = trueNode;
//           } else {
//             let inlineNode = createNode(remainder.replace(";", ""), "rect");
//             connect(ifNode, inlineNode, "True");
            
//             // Check for recursion inside inline IF
//             let foundInlineCall = Object.keys(knownMethods).find(name => remainder.includes(name + "("));
//             if (foundInlineCall && knownMethods[foundInlineCall] !== true) {
//                 connect(inlineNode, knownMethods[foundInlineCall], `Recursive Call`);
//             }

//             if (remainder.includes("return")) {
//                 let finalState = createNode("Final Answer", "round");
//                 connect(inlineNode, finalState, "End");
//             }
            
//             let falseNode = createNode("False Path", "rect");
//             connect(ifNode, falseNode, "False");
//             previousNode = falseNode;
//           }
//           continue;
//         }

//         // 5. Detect Function / Recursive Calls
//         let foundMethodCall = Object.keys(knownMethods).find(name => line.includes(name + "("));
//         if (foundMethodCall && knownMethods[foundMethodCall] !== true) { 
//             let callNode = createNode(line.replace("{", "").replace(";", ""));
//             connect(previousNode, callNode);
            
//             // Draw arrow pointing back to function definition
//             connect(callNode, knownMethods[foundMethodCall], `Calls ${foundMethodCall}`);
            
//             if (line.includes("return")) {
//                 let finalState = createNode("Final Answer (After Unwinding)", "round");
//                 connect(callNode, finalState, "End");
//                 previousNode = finalState;
//             } else {
//                 previousNode = callNode;
//             }
//             continue;
//         }

//         // 6. Detect Standalone Returns
//         if (line.startsWith("return")) {
//             let returnNode = createNode(line.replace(";", ""), "rect");
//             connect(previousNode, returnNode);
//             let finalState = createNode("Final Answer", "round");
//             connect(returnNode, finalState, "End");
//             previousNode = finalState;
//             continue;
//         }

//         // 7. Standard Statements
//         let statementNode = createNode(line.replace("{", "").replace(";", ""));
//         connect(previousNode, statementNode);
//         previousNode = statementNode;
//       }

//       setMermaidSyntax(graphDef);

//       if (mermaidRef.current) {
//         mermaidRef.current.innerHTML = "";
//         const { svg } = await mermaid.render("mermaid-svg-chart", graphDef);
//         mermaidRef.current.innerHTML = svg;
//       }
//     } catch (error) {
//       console.error("Mermaid Render Error:", error);
//       setErrorMessage("Flowchart parsing failed. Check for weird symbols or highly complex syntax.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 p-6">
//       <h2 className="text-2xl font-bold">Ultimate Algorithm Visualizer</h2>
      
//       {errorMessage && (
//         <div className="p-4 bg-red-100 text-red-700 font-bold border border-red-400 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <div className="flex gap-4 min-h-[600px]">
//         <textarea
//           className="w-1/3 p-4 font-mono text-sm bg-gray-900 text-white rounded"
//           value={javaCode}
//           onChange={(e) => setJavaCode(e.target.value)}
//         />
//         <div 
//            className="w-2/3 p-4 border-2 rounded bg-white overflow-auto flex justify-center items-start"
//            ref={mermaidRef}
//         ></div>
//       </div>
//       <button 
//         onClick={generateDiagram}
//         className="px-6 py-2 bg-blue-600 text-white font-bold rounded w-max hover:bg-blue-700"
//       >
//         Generate Flowchart
//       </button>
//     </div>
//   );
// }

























// "use client";

// import { useState, useCallback } from "react";
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   applyNodeChanges,
//   applyEdgeChanges,
//   Handle,
//   Position,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import dagre from "dagre";

// // ==========================================
// // 1. CUSTOM NODE: DIAMOND (For IFs / Loops)
// // ==========================================
// const DiamondNode = ({ data }) => {
//   return (
//     <div className="relative w-32 h-32 flex items-center justify-center">
//       <div className="absolute w-24 h-24 bg-yellow-100 border-2 border-yellow-500 transform rotate-45 rounded-sm"></div>
//       <div className="relative z-10 text-xs font-bold text-center px-2">
//         {data.label}
//       </div>
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//       <Handle type="source" position={Position.Left} id="left" />
//       <Handle type="source" position={Position.Right} id="right" />
//     </div>
//   );
// };

// const nodeTypes = { diamond: DiamondNode };

// // ==========================================
// // 2. AUTO-LAYOUT ENGINE (Dagre)
// // ==========================================
// const getLayoutedElements = (nodes, edges, direction = "TB") => {
//   const dagreGraph = new dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: 150, height: 80 });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   nodes.forEach((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.targetPosition = "top";
//     node.sourcePosition = "bottom";
//     // Shift slightly to center
//     node.position = {
//       x: nodeWithPosition.x - 75,
//       y: nodeWithPosition.y - 40,
//     };
//   });

//   return { nodes, edges };
// };

// // ==========================================
// // 3. MAIN COMPONENT
// // ==========================================
// export default function JavaVisualizer() {
//   const [javaCode, setJavaCode] = useState(
//     `void printMatrix(int[][] matrix) {
//     for (int i = 0; i < matrix.length; i++) {
//         for (int j = 0; j < matrix[0].length; j++) {
//             System.out.print(matrix[i][j]);
//         }
//     }
// }`
//   );

//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");

//   const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
//   const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

//   const generateDiagram = () => {
//     setErrorMessage("");
//     try {
//       let rfNodes = [];
//       let rfEdges = [];
//       let nodeId = 1;

//       // Clean text for React Flow
//       const safeText = (text) => text.replace(/[`"\[\]]/g, "'").replace(/[{}]/g, "").trim();

//       // Node Creator for React Flow
//       const createNode = (text, shape = "rect") => {
//         const id = `N${nodeId++}`;
//         const escaped = safeText(text);

//         let nodeObj = {
//           id: id,
//           data: { label: escaped },
//           position: { x: 0, y: 0 }, // Dagre will overwrite this
//         };

//         if (shape === "diamond") {
//           nodeObj.type = "diamond";
//         } else if (shape === "round") {
//           nodeObj.style = {
//             borderRadius: "30px",
//             background: "#eff6ff",
//             border: "2px solid #3b82f6",
//             fontWeight: "bold",
//             padding: "10px",
//           };
//         } else {
//           nodeObj.style = {
//             background: "#ffffff",
//             border: "1px solid #222",
//             padding: "10px",
//             borderRadius: "5px",
//           };
//         }

//         rfNodes.push(nodeObj);
//         return id;
//       };

//       // Edge Creator for React Flow
//       const connect = (from, to, label = "") => {
//         if (!from || !to) return;
        
//         // Make Loops and Recursions animated!
//         const isAnimated = label.includes("Call") || label.includes("Iteration") || label.includes("Loop");
//         const isFalse = label.includes("False");

//         rfEdges.push({
//           id: `e${from}-${to}-${rfEdges.length}`,
//           source: String(from),
//           target: String(to),
//           label: label,
//           animated: isAnimated,
//           style: { stroke: isFalse ? "#ef4444" : isAnimated ? "#3b82f6" : "#222", strokeWidth: 2 },
//           labelStyle: { fill: "#444", fontWeight: "bold", fontSize: 12 },
//           labelBgStyle: { fill: "#fff", fillOpacity: 0.8 },
//         });
//       };

//       const cleanCode = javaCode
//         .split("\n")
//         .map((line) => line.split("//")[0].trim())
//         .filter((line) => line.length > 0 && !line.startsWith("```") && !line.startsWith("**"));

//       let previousNode = null;
//       let stack = [];
//       let knownMethods = {};

//       // PASS 1: Identify Functions
//       cleanCode.forEach((line) => {
//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//           let beforeParens = line.split("(")[0].trim();
//           let words = beforeParens.split(/\s+/);
//           let methodName = words[words.length - 1];
//           knownMethods[methodName] = true;
//         }
//       });

//       // PASS 2: Parse and Build Nodes/Edges
//       for (let i = 0; i < cleanCode.length; i++) {
//         let line = cleanCode[i];

//         if (line.startsWith("}")) {
//           if (stack.length > 0) {
//             let block = stack.pop();
//             if (block.type === "loop") {
//               connect(previousNode, block.loopNode, "Next Iteration");
//               let loopExit = createNode("Exit Loop", "round");
//               connect(block.loopNode, loopExit, "Loop Finished (False)");
//               previousNode = loopExit;
//             } else if (block.type === "if") {
//               previousNode = block.mergeNode;
//             }
//           }
//           continue;
//         }

//         if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
//           let beforeParens = line.split("(")[0].trim();
//           let words = beforeParens.split(/\s+/);
//           let methodName = words[words.length - 1];
//           let methodNode = createNode(`Function: ${methodName}`, "round");
//           knownMethods[methodName] = methodNode;
//           previousNode = methodNode;
//           continue;
//         }

//         if (line.startsWith("for") || line.startsWith("while")) {
//           let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//           let loopNode = createNode(`Loop: ${condition}`, "diamond");
//           connect(previousNode, loopNode);
//           stack.push({ type: "loop", loopNode: loopNode });
//           let insideLoopStart = createNode("Enter Loop", "rect");
//           connect(loopNode, insideLoopStart, "Condition Met");
//           previousNode = insideLoopStart;
//           continue;
//         }

//         if (line.startsWith("if")) {
//           let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
//           let ifNode = createNode(`if ${condition}`, "diamond");
//           connect(previousNode, ifNode);
//           let remainder = line.substring(line.lastIndexOf(")") + 1).trim();

//           if (remainder.startsWith("{") || remainder === "") {
//             stack.push({ type: "if", mergeNode: ifNode });
//             let trueNode = createNode("True Path", "rect");
//             connect(ifNode, trueNode, "True");
//             previousNode = trueNode;
//           } else {
//             let inlineNode = createNode(remainder.replace(";", ""), "rect");
//             connect(ifNode, inlineNode, "True");
            
//             let foundInlineCall = Object.keys(knownMethods).find((name) => remainder.includes(name + "("));
//             if (foundInlineCall && knownMethods[foundInlineCall] !== true) {
//               connect(inlineNode, knownMethods[foundInlineCall], `Recursive Call`);
//             }

//             if (remainder.includes("return")) {
//               let finalState = createNode("Final Answer", "round");
//               connect(inlineNode, finalState, "End");
//             }
//             let falseNode = createNode("False Path", "rect");
//             connect(ifNode, falseNode, "False");
//             previousNode = falseNode;
//           }
//           continue;
//         }

//         let foundMethodCall = Object.keys(knownMethods).find((name) => line.includes(name + "("));
//         if (foundMethodCall && knownMethods[foundMethodCall] !== true) {
//           let callNode = createNode(line.replace("{", "").replace(";", ""));
//           connect(previousNode, callNode);
//           connect(callNode, knownMethods[foundMethodCall], `Calls ${foundMethodCall}`);
          
//           if (line.includes("return")) {
//             let finalState = createNode("Final Answer (Unwind)", "round");
//             connect(callNode, finalState, "End");
//             previousNode = finalState;
//           } else {
//             previousNode = callNode;
//           }
//           continue;
//         }

//         if (line.startsWith("return")) {
//           let returnNode = createNode(line.replace(";", ""), "rect");
//           connect(previousNode, returnNode);
//           let finalState = createNode("Final Answer", "round");
//           connect(returnNode, finalState, "End");
//           previousNode = finalState;
//           continue;
//         }

//         let statementNode = createNode(line.replace("{", "").replace(";", ""));
//         connect(previousNode, statementNode);
//         previousNode = statementNode;
//       }

//       // Apply Layout!
//       const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
//       setNodes(layoutedNodes);
//       setEdges(layoutedEdges);

//     } catch (error) {
//       console.error(error);
//       setErrorMessage("Flowchart generation failed. Ensure your code is formatted simply.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 p-6 h-screen w-full bg-gray-50">
//       <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Interactive React Flow Algorithm Visualizer</h2>
      
//       {errorMessage && (
//         <div className="p-4 bg-red-100 text-red-700 font-bold border border-red-400 rounded-lg shadow-sm">
//           {errorMessage}
//         </div>
//       )}

//       <div className="flex gap-4 h-[75vh] w-full">
//         <textarea
//           className="w-1/3 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
//           value={javaCode}
//           onChange={(e) => setJavaCode(e.target.value)}
//         />
//         <div className="w-2/3 h-full border-2 border-gray-200 rounded-xl bg-white overflow-hidden shadow-lg">
          
//           {/* REACT FLOW CANVAS */}
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             nodeTypes={nodeTypes}
//             onNodesChange={onNodesChange}
//             onEdgesChange={onEdgesChange}
//             fitView
//             attributionPosition="bottom-right"
//           >
//             <MiniMap 
//                 nodeStrokeColor={(n) => {
//                     if (n.type === 'diamond') return '#eab308';
//                     if (n.style?.borderRadius) return '#3b82f6';
//                     return '#222';
//                 }}
//                 nodeColor={(n) => {
//                     if (n.type === 'diamond') return '#fef08a';
//                     if (n.style?.borderRadius) return '#eff6ff';
//                     return '#fff';
//                 }}
//             />
//             <Controls />
//             <Background color="#ccc" gap={16} />
//           </ReactFlow>

//         </div>
//       </div>
//       <button 
//         onClick={generateDiagram}
//         className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold rounded-lg shadow-md w-max"
//       >
//         Render Interactive Graph
//       </button>
//     </div>
//   );
// }















"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// ==========================================
// 1. CUSTOM NODE: DIAMOND (For IFs / Loops)
// ==========================================
const DiamondNode = ({ data }) => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="absolute w-24 h-24 bg-yellow-100 border-2 border-yellow-500 transform rotate-45 rounded-sm shadow-sm"></div>
      <div className="relative z-10 text-xs font-bold text-center px-2">
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

const nodeTypes = { diamond: DiamondNode };

// ==========================================
// 2. AUTO-LAYOUT ENGINE (Dagre)
// ==========================================
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = "top";
    node.sourcePosition = "bottom";
    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 40,
    };
  });

  return { nodes, edges };
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function JavaVisualizer({code}) {
  const [javaCode, setJavaCode] = useState(code ||
    `void printMatrix(int[][] matrix) {
    for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[0].length; j++) {
            System.out.print(matrix[i][j]);
        }
    }
}`
  );

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const generateDiagram = () => {
    setErrorMessage("");
    try {
      let rfNodes = [];
      let rfEdges = [];
      let nodeId = 1;

      const safeText = (text) => text.replace(/[`"\[\]]/g, "'").replace(/[{}]/g, "").trim();

      const createNode = (text, shape = "rect") => {
        const id = `N${nodeId++}`;
        const escaped = safeText(text);

        let nodeObj = {
          id: id,
          data: { label: escaped },
          position: { x: 0, y: 0 },
        };

        if (shape === "diamond") {
          nodeObj.type = "diamond";
        } else if (shape === "round") {
          nodeObj.style = {
            borderRadius: "30px",
            background: "#eff6ff",
            border: "2px solid #3b82f6",
            fontWeight: "bold",
            padding: "10px",
            fontSize: "12px"
          };
        } else {
          nodeObj.style = {
            background: "#ffffff",
            border: "1px solid #222",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          };
        }

        rfNodes.push(nodeObj);
        return id;
      };

      const connect = (from, to, label = "") => {
        if (!from || !to) return;
        const isAnimated = label.includes("Call") || label.includes("Iteration") || label.includes("Loop");
        const isFalse = label.includes("False");

        rfEdges.push({
          id: `e${from}-${to}-${rfEdges.length}`,
          source: String(from),
          target: String(to),
          label: label,
          animated: isAnimated,
          style: { stroke: isFalse ? "#ef4444" : isAnimated ? "#3b82f6" : "#222", strokeWidth: 2 },
          labelStyle: { fill: "#444", fontWeight: "bold", fontSize: 11 },
          labelBgStyle: { fill: "#fff", fillOpacity: 0.9 },
        });
      };

      const cleanCode = javaCode
        .split("\n")
        .map((line) => line.split("//")[0].trim())
        .filter((line) => line.length > 0 && !line.startsWith("```") && !line.startsWith("**"));

      let previousNode = null;
      let stack = [];
      let knownMethods = {};

      cleanCode.forEach((line) => {
        if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
          let beforeParens = line.split("(")[0].trim();
          let words = beforeParens.split(/\s+/);
          let methodName = words[words.length - 1];
          knownMethods[methodName] = true;
        }
      });

      for (let i = 0; i < cleanCode.length; i++) {
        let line = cleanCode[i];

        if (line.startsWith("}")) {
          if (stack.length > 0) {
            let block = stack.pop();
            if (block.type === "loop") {
              connect(previousNode, block.loopNode, "Next Iteration");
              let loopExit = createNode("Exit Loop", "round");
              connect(block.loopNode, loopExit, "Loop Finished (False)");
              previousNode = loopExit;
            } else if (block.type === "if") {
              previousNode = block.mergeNode;
            }
          }
          continue;
        }

        if (line.includes("(") && line.includes("{") && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while") && !line.startsWith("}")) {
          let beforeParens = line.split("(")[0].trim();
          let words = beforeParens.split(/\s+/);
          let methodName = words[words.length - 1];
          let methodNode = createNode(`Function: ${methodName}`, "round");
          knownMethods[methodName] = methodNode;
          previousNode = methodNode;
          continue;
        }

        if (line.startsWith("for") || line.startsWith("while")) {
          let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
          let loopNode = createNode(`Loop: ${condition}`, "diamond");
          connect(previousNode, loopNode);
          stack.push({ type: "loop", loopNode: loopNode });
          let insideLoopStart = createNode("Enter Loop", "rect");
          connect(loopNode, insideLoopStart, "Condition Met");
          previousNode = insideLoopStart;
          continue;
        }

        if (line.startsWith("if")) {
          let condition = line.substring(line.indexOf("("), line.lastIndexOf(")") + 1);
          let ifNode = createNode(`if ${condition}`, "diamond");
          connect(previousNode, ifNode);
          let remainder = line.substring(line.lastIndexOf(")") + 1).trim();

          if (remainder.startsWith("{") || remainder === "") {
            stack.push({ type: "if", mergeNode: ifNode });
            let trueNode = createNode("True Path", "rect");
            connect(ifNode, trueNode, "True");
            previousNode = trueNode;
          } else {
            let inlineNode = createNode(remainder.replace(";", ""), "rect");
            connect(ifNode, inlineNode, "True");
            
            let foundInlineCall = Object.keys(knownMethods).find((name) => remainder.includes(name + "("));
            if (foundInlineCall && knownMethods[foundInlineCall] !== true) {
              connect(inlineNode, knownMethods[foundInlineCall], `Recursive Call`);
            }

            if (remainder.includes("return")) {
              let finalState = createNode("Final Answer", "round");
              connect(inlineNode, finalState, "End");
            }
            let falseNode = createNode("False Path", "rect");
            connect(ifNode, falseNode, "False");
            previousNode = falseNode;
          }
          continue;
        }

        let foundMethodCall = Object.keys(knownMethods).find((name) => line.includes(name + "("));
        if (foundMethodCall && knownMethods[foundMethodCall] !== true) {
          let callNode = createNode(line.replace("{", "").replace(";", ""));
          connect(previousNode, callNode);
          connect(callNode, knownMethods[foundMethodCall], `Calls ${foundMethodCall}`);
          
          if (line.includes("return")) {
            let finalState = createNode("Final Answer (Unwind)", "round");
            connect(callNode, finalState, "End");
            previousNode = finalState;
          } else {
            previousNode = callNode;
          }
          continue;
        }

        if (line.startsWith("return")) {
          let returnNode = createNode(line.replace(";", ""), "rect");
          connect(previousNode, returnNode);
          let finalState = createNode("Final Answer", "round");
          connect(returnNode, finalState, "End");
          previousNode = finalState;
          continue;
        }

        let statementNode = createNode(line.replace("{", "").replace(";", ""));
        connect(previousNode, statementNode);
        previousNode = statementNode;
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

    } catch (error) {
      console.error(error);
      setErrorMessage("Flowchart generation failed. Ensure your code is formatted simply.");
    }
  };
useEffect(() => {
  generateDiagram()
}, [javaCode])

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 min-h-full w-full bg-gray-50">
      {/* <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800 tracking-tight">Interactive Algorithm Visualizer</h2>
        <button 
          onClick={generateDiagram}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold rounded-lg shadow-md w-full lg:w-max"
        >
          Render Interactive Graph
        </button>
      </div> */}
      
      {errorMessage && (
        <div className="p-4 bg-red-100 text-red-700 font-bold border border-red-400 rounded-lg shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[75vh] w-full">
        
        {/* <textarea
          className="w-full lg:w-1/3 h-64 lg:h-full p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500 resize-none lg:resize"
          value={javaCode} readOnly
          onChange={(e) => setJavaCode(e.target.value)}
        /> */}
        
        <div className="w-full  h-[85vh] border-2 border-gray-200 rounded-xl bg-white overflow-hidden shadow-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
            
            /* ======== FIXED PROTECTIONS ======== */
            deleteKeyCode={null}      // Natively stops deletion
            nodesConnectable={false}  // Stops random arrow drawing
            panOnScroll={true}        
            zoomOnPinch={true}        
            /* =================================== */
          >
            <MiniMap 
                className="hidden md:block"
                nodeStrokeColor={(n) => {
                    if (n.type === 'diamond') return '#eab308';
                    if (n.style?.borderRadius) return '#3b82f6';
                    return '#222';
                }}
                nodeColor={(n) => {
                    if (n.type === 'diamond') return '#fef08a';
                    if (n.style?.borderRadius) return '#eff6ff';
                    return '#fff';
                }}
            />
            <Controls showInteractive={false} />
            <Background color="#ccc" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}