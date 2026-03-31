"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataStructureAgent {
    constructor() {
        // Will store source code & AST for each file
        this.sourceCode = null;
        this.ast = null;
        // Will store all suggestions for the current file
        this.suggestions = [];
    }
    // STEP 2.1 — Load Java + AST
    loadInput(sourceCode, astObject) {
        this.sourceCode = sourceCode;
        this.ast = astObject;
        this.suggestions = []; // reset suggestions for new file
        console.log("Loaded file. Source length:", sourceCode.length);
        console.log("AST keys:", Object.keys(astObject));
    }
    analyze() {
        this.suggestions.push(...this.checkBadLookups(), // A1
        ...this.checkManualSearch(), // A2
        ...this.checkNestedLoops(), // B1
        ...this.checkQueueMisuse(), // C1
        ...this.checkManualCounting(), // C2
        ...this.checkSortingInsideLoop(), // C3
        // D category
        ...this.checkBigListNeverIndexed(), // D1
        ...this.checkDuplicateDataStructures(), // D2
        // E category
        ...this.checkArraySearchedByKey(), // E1
        ...this.checkListUsedAsDictionary(), // E2
        // F category
        ...this.checkDictionaryOrderMisuse(), // F1
        // G category
        ...this.checkBigTemporaryList(), ...this.checkRepeatedListToSetConversion(), ...this.checkRepeatedListToMapConversion() // G1
        );
    }
    checkRepeatedListToSetConversion() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // Detect: new HashSet<>(list)
                if (line.match(/new\s+HashSet\s*\(\s*[a-zA-Z0-9_]+\s*\)/)) {
                    suggestions.push({
                        issueType: "RepeatedConversion",
                        subType: "ListToSet",
                        pattern: "new HashSet<>(list) inside loop",
                        recommendedDataStructure: "Move HashSet creation before loop",
                        why: "Converting list → set inside loop is O(n) per iteration → results in O(n²) total runtime.",
                        energyImpact: "Huge CPU & energy savings by converting only once.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkRepeatedListToMapConversion() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // Pattern 1: new HashMap<>(list)
                if (line.match(/new\s+HashMap\s*\(\s*[a-zA-Z0-9_]+\s*\)/)) {
                    suggestions.push({
                        issueType: "RepeatedConversion",
                        subType: "ListToMap",
                        pattern: "new HashMap<>(list) inside loop",
                        recommendedDataStructure: "Move HashMap creation before loop",
                        why: "Building a Map from list inside loop becomes O(n²).",
                        energyImpact: "Prevents repeated map reconstructions.",
                        lineNumber: i + 1
                    });
                }
                // Pattern 2: list.stream().collect(...)
                if (line.includes(".stream()") && line.includes("collect")) {
                    suggestions.push({
                        issueType: "RepeatedConversion",
                        subType: "StreamToMap",
                        pattern: "list.stream().collect(...) inside loop",
                        recommendedDataStructure: "Collect once before loop",
                        why: "Stream collect builds full map every iteration → massive waste.",
                        energyImpact: "Eliminates expensive repeated map construction.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkBadLookups() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let loopDepth = 0; // Track nesting level of braces
        let inLoop = false; // Are we inside a loop?
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            // 1. Detect loop start
            if (line.startsWith("for (") || line.startsWith("for(") ||
                line.startsWith("while (") || line.startsWith("while(")) {
                inLoop = true;
                loopDepth = 1; // we entered a loop
                continue;
            }
            // 2. Track nested braces ONLY if we are in a loop
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                // 3. If loopDepth reaches 0 → loop ended
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // 4. Check for .contains(
                if (line.includes(".contains(")) {
                    suggestions.push({
                        issueType: "BadLookup",
                        pattern: "List.contains() used inside loop",
                        recommendedDataStructure: "HashSet (Set)",
                        why: "List.contains() inside a loop is O(n²). Replace List with Set for O(1) lookup.",
                        energyImpact: "Reduces CPU cycles significantly by avoiding repeated scans.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkManualSearch() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let loopDepth = 0;
        let inLoop = false;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            // Detect loop start
            if (line.startsWith("for (") || line.startsWith("for(") ||
                line.startsWith("while (") || line.startsWith("while(")) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // RULE A2 — Manual List.get(i)
                if (line.match(/\.get\s*\(\s*[a-zA-Z0-9_]+\s*\)/)) {
                    suggestions.push({
                        issueType: "ManualSearch",
                        pattern: "Manual List.get(i) search inside loop",
                        recommendedDataStructure: "Use HashSet or HashMap",
                        why: "Manual index scan inside loop is O(n). Using Set/Map gives O(1) lookup.",
                        energyImpact: "Significantly reduces CPU cycles and energy consumption.",
                        lineNumber: i + 1
                    });
                }
                // RULE A2 — Manual array[i]
                if (line.match(/[a-zA-Z0-9_]+\s*\[\s*[a-zA-Z0-9_]+\s*\]/)) {
                    suggestions.push({
                        issueType: "ManualArraySearch",
                        pattern: "Manual arr[i] search inside loop",
                        recommendedDataStructure: "Use Set or Map depending on logic",
                        why: "Manual scanning inside loop is slow (O(n)). Hashed lookup is O(1).",
                        energyImpact: "Reduces unnecessary CPU usage and energy waste.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkNestedLoops() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let loopDepth = 0;
        let inOuterLoop = false;
        let outerLoopLine = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            // Detect loop start
            const isLoopLine = line.startsWith("for(") ||
                line.startsWith("for (") ||
                line.startsWith("while(") ||
                line.startsWith("while (");
            if (isLoopLine) {
                if (!inOuterLoop) {
                    // FIRST loop detected → outer loop
                    inOuterLoop = true;
                    loopDepth = 1;
                    outerLoopLine = i + 1;
                }
                else {
                    // ALREADY inside a loop → THIS IS A NESTED LOOP
                    suggestions.push({
                        issueType: "NestedLoops",
                        pattern: "Nested loops detected",
                        recommendedDataStructure: "Use HashMap/HashSet for matching instead of O(n²) nested scans.",
                        why: "Nested loops cause O(n²) complexity. Converting one list to a Map reduces time to O(n).",
                        energyImpact: "Massive CPU & energy reduction (up to 95%).",
                        lineNumber: i + 1,
                        outerLoopStartsAt: outerLoopLine
                    });
                }
                continue;
            }
            if (inOuterLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inOuterLoop = false;
                }
            }
        }
        return suggestions;
    }
    checkQueueMisuse() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Java version: remove(0)
            if (line.includes(".remove(0)")) {
                suggestions.push({
                    issueType: "QueueMisuse",
                    pattern: "Using List.remove(0) as a queue",
                    recommendedDataStructure: "Use LinkedList or ArrayDeque",
                    why: "Removing from index 0 shifts entire list → O(n). Proper queue is O(1).",
                    energyImpact: "Massive reduction in CPU wasted on shifting elements.",
                    lineNumber: i + 1
                });
            }
            // JS version (just in case): shift()
            if (line.includes(".shift()")) {
                suggestions.push({
                    issueType: "QueueMisuse",
                    pattern: "Using Array.shift() as a queue",
                    recommendedDataStructure: "Use deque instead",
                    why: "shift() forces array reindex → O(n). deque gives O(1).",
                    energyImpact: "Prevents repeated memory shifts and CPU overhead.",
                    lineNumber: i + 1
                });
            }
        }
        return suggestions;
    }
    checkManualCounting() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // count++
                if (line.match(/[a-zA-Z0-9_]+\s*\+\+\s*;/)) {
                    suggestions.push({
                        issueType: "ManualCounting",
                        pattern: "count++ pattern inside loop",
                        recommendedDataStructure: "Use HashMap<Key, Count> instead",
                        why: "Manual counting inside loops becomes expensive. HashMap aggregates in O(1).",
                        energyImpact: "Better CPU use by avoiding repeated conditional increments.",
                        lineNumber: i + 1
                    });
                }
                // count += 1
                if (line.match(/[a-zA-Z0-9_]+\s*\+=\s*1/)) {
                    suggestions.push({
                        issueType: "ManualCounting",
                        pattern: "counter += 1 inside loop",
                        recommendedDataStructure: "Use HashMap or frequency table",
                        why: "Manual counting in loops is inefficient for large data.",
                        energyImpact: "Improves runtime & lowers wasted CPU cycles.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkSortingInsideLoop() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // Java Collections.sort
                if (line.includes("Collections.sort(")) {
                    suggestions.push({
                        issueType: "SortingInsideLoop",
                        pattern: "Collections.sort() inside loop",
                        recommendedDataStructure: "Sort once before loop",
                        why: "Sorting is O(n log n) and repeating inside loop is extremely expensive.",
                        energyImpact: "Huge CPU and energy cost avoided by sorting only once.",
                        lineNumber: i + 1
                    });
                }
                // Arrays.sort()
                if (line.includes("Arrays.sort(")) {
                    suggestions.push({
                        issueType: "SortingInsideLoop",
                        pattern: "Arrays.sort() inside loop",
                        recommendedDataStructure: "Move sorting outside loop",
                        why: "Sorting on every iteration is unnecessary & wasteful.",
                        energyImpact: "Reduces repeated CPU-intensive sorting operations.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkBigListNeverIndexed() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        const listDeclared = new Map(); // varName → line number
        const listIndexed = new Set();
        const listForeachUsed = new Set();
        // 1. Detect REAL list declarations (avoid Arrays.asList)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Matches: List<String> users = new ArrayList<>();
            const match = line.match(/List<.*>\s+([a-zA-Z0-9_]+)\s*=\s*new\s+/);
            if (match) {
                listDeclared.set(match[1], i + 1);
            }
        }
        // 2. Detect usage inside foreach loop
        for (const line of lines) {
            const match = line.match(/for\s*\([^:]+:\s*([a-zA-Z0-9_]+)\)/);
            if (match)
                listForeachUsed.add(match[1]);
        }
        // 3. Detect indexing → .get(i) OR list[i]
        for (const line of lines) {
            const m1 = line.match(/([a-zA-Z0-9_]+)\.get\s*\(/);
            if (m1)
                listIndexed.add(m1[1]);
            const m2 = line.match(/([a-zA-Z0-9_]+)\s*\[/);
            if (m2)
                listIndexed.add(m2[1]);
        }
        // 4. Suggest only BIG LISTS never indexed
        for (const [listVar, declLine] of listDeclared) {
            if (listForeachUsed.has(listVar) && !listIndexed.has(listVar)) {
                suggestions.push({
                    issueType: "BigListNeverIndexed",
                    pattern: `${listVar} declared as List but only used in foreach`,
                    recommendedDataStructure: "Use HashSet instead of List",
                    why: "List indexing ability is wasted when never used; Set is faster & lighter.",
                    energyImpact: "Lower memory footprint and O(1) lookups.",
                    variable: listVar,
                    declaredAt: declLine
                });
            }
        }
        return suggestions;
    }
    checkDuplicateDataStructures() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            // Detect loop start
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                // Loop ends
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // Pattern 1 — Duplicate: new HashSet<>(list)
                if (line.match(/new\s+HashSet\s*<.*>\s*\(\s*[a-zA-Z0-9_]+\s*\)/)) {
                    suggestions.push({
                        issueType: "DuplicateDataStructure",
                        pattern: "HashSet constructed from List inside loop",
                        recommendedDataStructure: "Convert list → set BEFORE loop",
                        why: "Building a HashSet inside loop causes O(n) per iteration → O(n²) total.",
                        energyImpact: "High waste of CPU cycles on repeated conversions.",
                        lineNumber: i + 1
                    });
                }
                // Pattern 2 — Duplicate: new ArrayList<>(list)
                if (line.match(/new\s+ArrayList\s*<.*>\s*\(\s*[a-zA-Z0-9_]+\s*\)/)) {
                    suggestions.push({
                        issueType: "DuplicateDataStructure",
                        pattern: "ArrayList copy created inside loop",
                        recommendedDataStructure: "Avoid copying list inside loop",
                        why: "Copying list inside loop creates unnecessary allocations.",
                        energyImpact: "Wastes memory and increases GC pressure.",
                        lineNumber: i + 1
                    });
                }
                // Pattern 3 — manual duplication: set2.add(x) inside loop
                if (line.match(/\.\s*add\s*\(\s*[a-zA-Z0-9_]+\s*\)\s*;/)) {
                    suggestions.push({
                        issueType: "ManualDuplicate",
                        pattern: "Manual duplication via add() inside loop",
                        recommendedDataStructure: "Avoid building duplicate collections in loop",
                        why: "Manual duplication in loop is expensive & unnecessary.",
                        energyImpact: "Extra memory + CPU use every iteration.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    // RULE CATEGORY D/E — Memory issues & wrong data usage
    checkMemoryIssues() {
        // Empty for now
        return [];
    }
    // RULE CATEGORY H — Repeated conversions (list→set)
    checkRepeatedConversions() {
        // Empty for now
        return [];
    }
    checkArraySearchedByKey() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        let inLoop = false;
        let loopDepth = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();
            const isLoop = line.startsWith("for(") || line.startsWith("for (") ||
                line.startsWith("while(") || line.startsWith("while (");
            if (isLoop) {
                inLoop = true;
                loopDepth = 1;
                continue;
            }
            if (inLoop) {
                if (raw.includes("{"))
                    loopDepth++;
                if (raw.includes("}"))
                    loopDepth--;
                if (loopDepth === 0) {
                    inLoop = false;
                    continue;
                }
                // Detect key-based scan inside loop
                if (line.match(/\.id|\.Id|\.ID|\getId\s*\(\s*\)/)) {
                    suggestions.push({
                        issueType: "ArraySearchByKey",
                        pattern: "Searching object by ID inside loop (O(n))",
                        recommendedDataStructure: "HashMap<Key, Object>",
                        why: "Searching by ID inside a loop causes O(n²). Store items in a HashMap for O(1) lookup.",
                        energyImpact: "Huge reduction in repeated scanning.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    checkListUsedAsDictionary() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // list.get(key) or list[key] → dictionary misuse
            if (line.match(/[a-zA-Z0-9_]+\.get\(\s*[a-zA-Z_]+\s*\)/)) {
                suggestions.push({
                    issueType: "ListAsDictionary",
                    pattern: "List used as dictionary (list.get(key))",
                    recommendedDataStructure: "Use HashMap<Key, Value>",
                    why: "List.get(keyName) implies key-value usage, but lists have no keys. Use a Map instead.",
                    energyImpact: "Avoids scanning and wrong access patterns.",
                    lineNumber: i + 1
                });
            }
            // array[keyName]
            if (line.match(/[a-zA-Z_]+\[[a-zA-Z_]+\]/)) {
                suggestions.push({
                    issueType: "ListAsDictionary",
                    pattern: "Array used as dictionary with string key",
                    recommendedDataStructure: "HashMap or TreeMap",
                    why: "Arrays only support numeric indexing. Using them like maps is incorrect.",
                    energyImpact: "Using maps gives consistent O(1) lookup.",
                    lineNumber: i + 1
                });
            }
        }
        return suggestions;
    }
    checkDictionaryOrderMisuse() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Map sorted manually
            if (line.includes("new HashMap") && lines[i + 1]?.includes("keySet()")) {
                suggestions.push({
                    issueType: "DictionaryOrderMisuse",
                    pattern: "Using HashMap but requiring iteration order",
                    recommendedDataStructure: "Use LinkedHashMap",
                    why: "HashMap does not maintain order. LinkedHashMap preserves insertion order.",
                    energyImpact: "Reduces unnecessary sorting and stabilizes output.",
                    lineNumber: i + 1
                });
            }
            // Sorting HashMap keys
            if (line.includes("Collections.sort(") && line.includes("map.keySet")) {
                suggestions.push({
                    issueType: "DictionaryOrderMisuse",
                    pattern: "Sorting HashMap keys to preserve order",
                    recommendedDataStructure: "LinkedHashMap",
                    why: "Sorting keys manually wastes CPU; LinkedHashMap retains order without sorting.",
                    energyImpact: "Avoids repeated sorting operations.",
                    lineNumber: i + 1
                });
            }
        }
        return suggestions;
    }
    checkBigTemporaryList() {
        const suggestions = [];
        if (!this.sourceCode)
            return suggestions;
        const lines = this.sourceCode.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Detect huge list construction
            if (line.match(/new ArrayList|new LinkedList/)) {
                // look ahead few lines
                const next = lines[i + 1]?.trim() || "";
                const next2 = lines[i + 2]?.trim() || "";
                const onlyUsedOnce = next.startsWith("for") ||
                    next.startsWith("process(") ||
                    next.includes("return");
                if (onlyUsedOnce) {
                    suggestions.push({
                        issueType: "BigTemporaryList",
                        pattern: "Temporary list created and used once",
                        recommendedDataStructure: "Stream / direct processing",
                        why: "Creating large temporary lists wastes memory and CPU. Use streaming or process directly.",
                        energyImpact: "Avoids memory allocation + garbage collection overhead.",
                        lineNumber: i + 1
                    });
                }
            }
        }
        return suggestions;
    }
    // STEP 2.3 — Build final report
    buildReport() {
        // Empty for now
        return {
            fileName: null, // will be filled later
            suggestions: this.suggestions
        };
    }
}
exports.default = DataStructureAgent;
