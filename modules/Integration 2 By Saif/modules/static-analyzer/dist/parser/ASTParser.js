#!/usr/bin/env ts-node
import { promises as fs } from "fs";
import * as path from "path";
import { parse } from "java-parser";
function gatherTokens(node, out) {
    if (!node)
        return;
    if (Array.isArray(node)) {
        for (const n of node)
            gatherTokens(n, out);
        return;
    }
    if (node.image !== undefined) {
        out.push(node);
        return;
    }
    if (node.children) {
        for (const childArr of Object.values(node.children)) {
            gatherTokens(childArr, out);
        }
    }
}
function findFirstNodeByName(node, name) {
    if (!node)
        return null;
    if (Array.isArray(node)) {
        for (const n of node) {
            const found = findFirstNodeByName(n, name);
            if (found)
                return found;
        }
        return null;
    }
    if (node.name === name)
        return node;
    if (node.children) {
        for (const childArr of Object.values(node.children)) {
            const found = findFirstNodeByName(childArr, name);
            if (found)
                return found;
        }
    }
    return null;
}
function tokensText(tokens) {
    let txt = tokens.map(t => t.image).join(" ").replace(/\s+/g, " ").trim();
    txt = txt.replace(/\[\s*\]/g, "[]");
    txt = txt.replace(/\.\s*\.\s*\./g, "...");
    txt = txt.replace(/<\s+/g, "<").replace(/\s+>/g, ">");
    txt = txt.replace(/,\s*/g, ", ");
    txt = txt.replace(/\s+([;()<>])/g, "$1");
    txt = txt.replace(/([(<])\s+/g, "$1");
    txt = txt.replace(/\s+/g, " ").trim();
    txt = txt.replace(/<([^<>]+)>/g, (_m, inner) => {
        let fixed = inner.trim().replace(/\s+/g, " ");
        fixed = fixed.replace(/([A-Za-z0-9_\]>]|extends|super)\s+([A-Z][A-Za-z0-9_<>\[\]]*)/g, (_, left, right) => {
            if (left === "extends" || left === "super") {
                return `${left} ${right}`;
            }
            return `${left}, ${right}`;
        });
        fixed = fixed
            .replace(/<\s*,\s*/g, "<")
            .replace(/,\s*>/g, ">")
            .replace(/\s+>/g, ">")
            .replace(/,\s*,+/g, ",")
            .replace(/,\s*$/g, "");
        return `<${fixed}>`;
    });
    txt = txt.replace(/\s+>/g, ">");
    return txt;
}
function extractIdentifierText(node) {
    const toks = [];
    gatherTokens(node, toks);
    const ids = toks.filter(t => t.tokenType && t.tokenType.name === "Identifier");
    if (ids.length)
        return ids[ids.length - 1].image;
    return toks.length ? toks[toks.length - 1].image : "";
}
function extractParamTypeAndName(paramNode) {
    const core = paramNode.children?.variableParaRegularParameter?.[0] ||
        paramNode.children?.variableArityParameter?.[0] ||
        paramNode;
    let typeNode = core.children?.unannType?.[0];
    let nameNode = core.children?.variableDeclaratorId?.[0];
    if (!typeNode)
        typeNode = findFirstNodeByName(paramNode, "unannType");
    if (!nameNode)
        nameNode = findFirstNodeByName(paramNode, "variableDeclaratorId");
    const typeTokens = [];
    gatherTokens(typeNode, typeTokens);
    let typeText = typeTokens.length ? tokensText(typeTokens) : "UnknownType";
    if (core.name === "variableArityParameter") {
        typeText = typeText + "...";
    }
    let nameText = "UnknownName";
    if (nameNode) {
        nameText = extractIdentifierText(nameNode);
    }
    else {
        const toks = [];
        gatherTokens(core, toks);
        const ids = toks.filter(t => t.tokenType && t.tokenType.name === "Identifier");
        if (ids.length) {
            nameText = ids[ids.length - 1].image;
        }
    }
    return { type: typeText || "UnknownType", name: nameText || "UnknownName" };
}
function findLoopsAndConditionals(node, methodObj, isNested = false) {
    if (!node)
        return;
    const addUnique = (list, item) => {
        if (!list.includes(item))
            list.push(item);
    };
    if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
        const ifTree = parseIfStatement(node);
        addUnique(methodObj.conditionals, "if");
        if (ifTree && !isNested) {
            if (!methodObj.conditionalsTree)
                methodObj.conditionalsTree = [];
            methodObj.conditionalsTree.push(ifTree);
        }
        if (node.children?.statement) {
            node.children.statement.forEach((stmt) => {
                findLoopsAndConditionals(stmt, methodObj, true);
            });
        }
        return;
    }
    if (node.name === "switchStatement") {
        addUnique(methodObj.conditionals, "switch");
        if (node.children?.switchBlock) {
            const block = node.children.switchBlock[0];
            const toks = [];
            gatherTokens(block, toks);
            toks.forEach(t => {
                if (t.image === "case")
                    addUnique(methodObj.conditionals, "case");
                if (t.image === "default")
                    addUnique(methodObj.conditionals, "default");
            });
        }
    }
    if (node.name === "whileStatement") {
        addUnique(methodObj.loops, "while");
    }
    if (node.name === "enhancedForStatement") {
        addUnique(methodObj.loops, "forEach");
    }
    else if (node.name === "basicForStatement") {
        addUnique(methodObj.loops, "for");
    }
    if (node.name === "doStatement") {
        addUnique(methodObj.loops, "doWhile");
    }
    if (node.name === "superMethodInvocation") {
        methodObj.conditionals.push("superCall");
    }
    if (node.name === "thisExpression") {
        methodObj.conditionals.push("thisRef");
    }
    if (node.name === "tryStatement") {
        addUnique(methodObj.conditionals, "try");
    }
    if (node.name === "catchClause") {
        addUnique(methodObj.conditionals, "catch");
    }
    if (node.name === "finally") {
        addUnique(methodObj.conditionals, "finally");
    }
    if (node.name === "throwStatement") {
        addUnique(methodObj.conditionals, "throw");
    }
    if (node.name === "returnStatement") {
        addUnique(methodObj.conditionals, "return");
    }
    if (node.name === "breakStatement") {
        addUnique(methodObj.conditionals, "break");
    }
    if (node.name === "continueStatement") {
        addUnique(methodObj.conditionals, "continue");
    }
    if (node.name === "synchronizedStatement") {
        addUnique(methodObj.conditionals, "synchronized");
    }
    if (node.children) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr)) {
                arr.forEach(child => findLoopsAndConditionals(child, methodObj, isNested));
            }
        }
    }
}
function parseIfStatement(node) {
    if (!node)
        return null;
    const ifNode = {
        type: "IfStatement",
        thenBlock: [],
        elseBlock: null,
    };
    if (node.children?.statement?.[0]) {
        ifNode.thenBlock = collectStatements(node.children.statement[0]);
    }
    if (node.children?.statement?.[1]) {
        const elseBranch = node.children.statement[1];
        if (elseBranch.name?.includes("if")) {
            ifNode.elseBlock = parseIfStatement(elseBranch);
        }
        else {
            ifNode.elseBlock = collectStatements(elseBranch);
        }
    }
    return ifNode;
}
function collectStatements(node) {
    if (!node)
        return [];
    const stmts = [];
    if (Array.isArray(node)) {
        node.forEach(n => stmts.push(...collectStatements(n)));
        return stmts;
    }
    if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
        const innerIf = parseIfStatement(node);
        if (innerIf)
            stmts.push(innerIf);
        return stmts;
    }
    if (["block", "blockStatements", "statement"].includes(node.name)) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr)) {
                arr.forEach(child => stmts.push(...collectStatements(child)));
            }
        }
        return stmts;
    }
    if (node.name === "expressionStatement" ||
        node.name === "statementExpression" ||
        node.name === "returnStatement" ||
        node.name === "throwStatement" ||
        node.name === "breakStatement" ||
        node.name === "continueStatement") {
        stmts.push({ type: "Statement" });
        return stmts;
    }
    if (node.children) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr)) {
                arr.forEach(child => stmts.push(...collectStatements(child)));
            }
        }
    }
    return stmts;
}
function buildLoopTree(node, currentLoops = [], depth = 0) {
    if (!node)
        return currentLoops;
    if (Array.isArray(node)) {
        for (const n of node)
            buildLoopTree(n, currentLoops, depth);
        return currentLoops;
    }
    let loopType = null;
    let loopBody = null;
    if (node.name === "whileStatement") {
        loopType = "while";
        loopBody = node.children?.statement?.[0];
    }
    else if (node.name === "basicForStatement") {
        loopType = "for";
        loopBody = node.children?.statement?.[0];
    }
    else if (node.name === "enhancedForStatement") {
        loopType = "forEach";
        loopBody = node.children?.statement?.[0];
    }
    else if (node.name === "doStatement") {
        loopType = "doWhile";
        loopBody = node.children?.statement?.[0];
    }
    if (loopType && loopBody) {
        const loopNode = {
            type: loopType,
            nested: [],
            depth
        };
        if (loopBody.name === "block" && loopBody.children?.blockStatements?.[0]) {
            buildLoopTree(loopBody.children.blockStatements[0], loopNode.nested, depth + 1);
        }
        else {
            buildLoopTree(loopBody, loopNode.nested, depth + 1);
        }
        currentLoops.push(loopNode);
        return currentLoops;
    }
    if (node.name === "blockStatements" && node.children?.blockStatement) {
        for (const stmt of node.children.blockStatement) {
            if (stmt.children?.statement?.[0]) {
                buildLoopTree(stmt.children.statement[0], currentLoops, depth);
            }
        }
        return currentLoops;
    }
    if (node.children) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr)) {
                for (const child of arr) {
                    buildLoopTree(child, currentLoops, depth);
                }
            }
        }
    }
    return currentLoops;
}
function calculateMaxDepth(loopTree) {
    if (!loopTree || loopTree.length === 0)
        return 0;
    let maxDepth = 0;
    for (const loop of loopTree) {
        let currentDepth = 1;
        if (loop.nested && loop.nested.length > 0) {
            currentDepth += calculateMaxDepth(loop.nested);
        }
        maxDepth = Math.max(maxDepth, currentDepth);
    }
    return maxDepth;
}
function countTotalLoops(loopTree) {
    if (!loopTree || loopTree.length === 0)
        return 0;
    let count = loopTree.length;
    for (const loop of loopTree) {
        if (loop.nested && loop.nested.length > 0) {
            count += countTotalLoops(loop.nested);
        }
    }
    return count;
}
function extractLocalVariables(node, foundVars = new Set()) {
    const variables = [];
    if (!node)
        return variables;
    if (Array.isArray(node)) {
        for (const n of node) {
            variables.push(...extractLocalVariables(n, foundVars));
        }
        return variables;
    }
    if (node.name === "localVariableDeclaration") {
        const varDecl = extractVariableDeclaration(node);
        if (varDecl && !foundVars.has(varDecl)) {
            foundVars.add(varDecl);
            variables.push(varDecl);
        }
    }
    if (node.name === "enhancedForStatement") {
        const forVarDecl = node.children?.localVariableDeclaration?.[0];
        if (forVarDecl) {
            const varDecl = extractVariableDeclaration(forVarDecl);
            if (varDecl && !foundVars.has(varDecl)) {
                foundVars.add(varDecl);
                variables.push(varDecl);
            }
        }
        return variables;
    }
    if (node.name === "basicForStatement") {
        const forInit = node.children?.forInit?.[0];
        if (forInit?.children?.localVariableDeclaration?.[0]) {
            const varDecl = extractVariableDeclaration(forInit.children.localVariableDeclaration[0]);
            if (varDecl && !foundVars.has(varDecl)) {
                foundVars.add(varDecl);
                variables.push(varDecl);
            }
        }
    }
    if (node.children) {
        for (const childArray of Object.values(node.children)) {
            if (Array.isArray(childArray)) {
                for (const child of childArray) {
                    variables.push(...extractLocalVariables(child, foundVars));
                }
            }
        }
    }
    return variables;
}
function extractVariableDeclaration(node) {
    if (!node)
        return null;
    const typeNode = node.children?.localVariableType?.[0];
    const typeTokens = [];
    gatherTokens(typeNode, typeTokens);
    const typeText = tokensText(typeTokens);
    const varList = node.children?.variableDeclaratorList?.[0];
    if (!varList)
        return null;
    const declarators = varList.children?.variableDeclarator || [];
    const names = [];
    declarators.forEach((decl) => {
        const varId = decl.children?.variableDeclaratorId?.[0];
        if (varId) {
            const name = extractIdentifierText(varId);
            names.push(name);
        }
    });
    if (names.length === 0)
        return null;
    return `${typeText} ${names.join(", ")}`;
}
function extractParams(decl) {
    const params = [];
    const formals = decl?.children?.formalParameterList?.[0];
    if (!formals)
        return params;
    const regulars = formals.children?.formalParameter || [];
    regulars.forEach((p) => {
        const { type, name } = extractParamTypeAndName(p);
        params.push({ type, name });
    });
    const last = formals.children?.lastFormalParameter?.[0];
    if (last) {
        const varArity = last.children?.variableArityParameter?.[0];
        const nestedFormal = last.children?.formalParameter?.[0];
        if (varArity) {
            const { type, name } = extractParamTypeAndName(varArity);
            params.push({ type, name });
        }
        else if (nestedFormal) {
            const { type, name } = extractParamTypeAndName(nestedFormal);
            params.push({ type, name });
        }
    }
    return params;
}
function extractMethods(node, className) {
    const methods = [];
    if (node.name === "methodDeclaration") {
        const decl = node.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0];
        const methodName = decl?.children?.Identifier?.[0]?.image || "UnknownMethod";
        const params = extractParams(decl);
        const methodObj = { name: methodName, params, loops: [], conditionals: [] };
        if (node.children.methodBody?.[0]) {
            findLoopsAndConditionals(node.children.methodBody[0], methodObj);
            const loopTree = buildLoopTree(node.children.methodBody[0], []);
            if (loopTree.length > 0) {
                methodObj.loopsTree = loopTree;
                methodObj.loopNestingDepth = calculateMaxDepth(loopTree);
                methodObj.totalLoopCount = countTotalLoops(loopTree);
            }
        }
        const localVars = extractLocalVariables(node.children.methodBody[0]);
        if (localVars.length > 0) {
            methodObj.localVariables = localVars;
        }
        const modifiers = node.children?.methodModifier || [];
        const toks = [];
        gatherTokens(modifiers, toks);
        if (toks.some(t => t.image === "synchronized")) {
            methodObj.conditionals.push("synchronized");
        }
        Object.assign(methodObj, extractExtraInfo?.(node, "method") || {});
        methods.push(methodObj);
    }
    if (node.name === "constructorDeclaration") {
        const ctorDecl = node.children?.constructorDeclarator?.[0];
        const ctorName = className;
        const params = extractParams(ctorDecl);
        const ctorObj = { name: ctorName, params, loops: [], conditionals: [] };
        if (node.children.constructorBody?.[0]) {
            findLoopsAndConditionals(node.children.constructorBody[0], ctorObj);
            const loopTree = buildLoopTree(node.children.constructorBody[0], []);
            if (loopTree.length > 0) {
                ctorObj.loopsTree = loopTree;
                ctorObj.loopNestingDepth = calculateMaxDepth(loopTree);
                ctorObj.totalLoopCount = countTotalLoops(loopTree);
            }
            const localVars = extractLocalVariables(node.children.constructorBody[0]);
            if (localVars.length > 0) {
                ctorObj.localVariables = localVars;
            }
        }
        Object.assign(ctorObj, extractExtraInfo?.(node, "constructor") || {});
        methods.push(ctorObj);
    }
    if (node.children) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr))
                arr.forEach(child => methods.push(...extractMethods(child, className)));
        }
    }
    return methods;
}
function extractClasses(node) {
    const classes = [];
    if (node.name === "normalClassDeclaration") {
        const className = node.children?.typeIdentifier?.[0]?.children?.Identifier?.[0]?.image || "UnknownClass";
        const bodyDecls = node.children?.classBody?.[0]?.children?.classBodyDeclaration || [];
        const methods = [];
        bodyDecls.forEach((decl) => {
            methods.push(...extractMethods(decl, className));
        });
        const extra = extractExtraInfo(node, "class");
        classes.push({
            type: "Class",
            name: className,
            methods,
            ...extra
        });
    }
    if (node.children) {
        for (const arr of Object.values(node.children)) {
            if (Array.isArray(arr)) {
                arr.forEach(child => classes.push(...extractClasses(child)));
            }
        }
    }
    return classes;
}
function extractExtraInfo(node, context) {
    const info = {};
    if (context === "class") {
        if (node.children?.superclass?.[0]) {
            const typeNode = node.children.superclass[0].children?.classType?.[0]
                || node.children.superclass[0];
            const toks = [];
            gatherTokens(typeNode, toks);
            info.extends = tokensText(toks);
        }
        if (node.children?.superinterfaces?.[0]) {
            const intfs = node.children.superinterfaces[0].children.interfaceTypeList?.[0]
                || node.children.superinterfaces[0];
            const toks = [];
            gatherTokens(intfs, toks);
            info.implements = tokensText(toks).split(",").map(s => s.trim());
        }
        if (node.children?.typeParameters?.[0]) {
            const toks = [];
            gatherTokens(node.children.typeParameters[0], toks);
            info.generics = tokensText(toks);
        }
        const fields = [];
        const bodyDecls = node.children?.classBody?.[0]?.children?.classBodyDeclaration || [];
        bodyDecls.forEach((decl) => {
            if (decl.children?.classMemberDeclaration?.[0]?.children?.fieldDeclaration) {
                const fieldDecl = decl.children.classMemberDeclaration[0].children.fieldDeclaration[0];
                const toks = [];
                gatherTokens(fieldDecl, toks);
                fields.push(tokensText(toks));
            }
        });
        info.fields = fields;
    }
    if (context === "method" || context === "constructor") {
        const mh = node.children?.methodHeader?.[0];
        if (mh?.children?.typeParameters?.[0]) {
            const toks = [];
            gatherTokens(mh.children.typeParameters[0], toks);
            info.methodGenerics = tokensText(toks);
        }
        if (node.children?.throws_?.[0]) {
            const exList = node.children.throws_[0].children?.exceptionTypeList?.[0];
            if (exList?.children?.exceptionType) {
                info.throws = exList.children.exceptionType.map((et) => {
                    const toks = [];
                    gatherTokens(et, toks);
                    return tokensText(toks);
                });
            }
        }
        if (context === "method" && node.children?.methodHeader?.[0]?.children?.result?.[0]) {
            const toks = [];
            gatherTokens(node.children.methodHeader[0].children.result[0], toks);
            info.returnType = tokensText(toks);
        }
        const modifiers = node.children?.methodModifier || node.children?.constructorModifier || [];
        const modToks = [];
        gatherTokens(modifiers, modToks);
        info.modifiers = modToks.map((t, i, arr) => {
            if (t.image === "@" && arr[i + 1]) {
                return "@" + arr[i + 1].image;
            }
            if (i > 0 && arr[i - 1].image === "@")
                return null;
            return t.image;
        }).filter(Boolean);
        if (node.children?.throws_?.[0]) {
            const toks = [];
            gatherTokens(node.children.throws_[0], toks);
            info.throws = tokensText(toks).split(",").map(s => s.trim());
        }
        if (node.children?.constructorBody?.[0]) {
            const body = node.children.constructorBody[0];
            const decls = body.children?.explicitConstructorInvocation || [];
            if (decls.length > 0) {
                const chains = [];
                decls.forEach((c) => {
                    const toks = [];
                    gatherTokens(c, toks);
                    const callText = tokensText(toks);
                    let chainType = "this";
                    if (callText.startsWith("super"))
                        chainType = "super";
                    const argMatch = callText.match(/\((.*)\)/);
                    const args = argMatch && argMatch[1].trim().length > 0
                        ? argMatch[1].split(",").map(a => a.trim())
                        : [];
                    chains.push({ type: chainType, args });
                });
                info.constructorChaining = chains;
            }
        }
    }
    return info;
}
export async function parseJavaFile(filePath) {
    const code = await fs.readFile(filePath, "utf8");
    const cst = parse(code);
    const classes = extractClasses(cst);
    return { file: filePath, classes };
}
export async function parseFolder(folderPath, outputPath) {
    const results = [];
    async function scanDirectory(dirPath) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            }
            else if (entry.isFile() && entry.name.endsWith('.java')) {
                try {
                    const result = await parseJavaFile(fullPath);
                    results.push(result);
                }
                catch (error) {
                    console.error(`Error parsing ${fullPath}:`, error);
                }
            }
        }
    }
    await scanDirectory(folderPath);
    try {
        const stats = await fs.stat(outputPath);
        if (stats.isDirectory()) {
            outputPath = path.join(outputPath, 'ast.json');
        }
    }
    catch (error) {
        if (!outputPath.endsWith('.json')) {
            await fs.mkdir(outputPath, { recursive: true });
            outputPath = path.join(outputPath, 'ast.json');
        }
        else {
            const dirPath = path.dirname(outputPath);
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf8');
    return results;
}
