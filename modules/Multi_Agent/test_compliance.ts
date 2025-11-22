// Import Compliance Agent
const ComplianceAgentClass = require("./compliance/compliance_agent");

// RAW CODE
const sampleCode = `
function BadFunction(){
    let TempValue = 10    
    console.log(TempValue)
}

// commented-out-code;
class badclass {
}
`;


// MATCHING AST (function is NOT inside class)
const sampleAST = {
    file: "testfile.js",

    // 🔹 Top-level functions
    functions: [
        {
            name: "BadFunction",
            params: [],
            returnType: "void",
            modifiers: []
        }
    ],

    // 🔹 Class with NO methods
    classes: [
        {
            type: "Class",
            name: "badclass",
            methods: [],
            fields: []
        }
    ]
};


// Create Agent
const agent = new ComplianceAgentClass();

// Analyze using BOTH code + AST
const result = agent.analyze(sampleCode, sampleAST);

console.log("===== Compliance Agent Result ======");
console.log(JSON.stringify(result, null, 2));
