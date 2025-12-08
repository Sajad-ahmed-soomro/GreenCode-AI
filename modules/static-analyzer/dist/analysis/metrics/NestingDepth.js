export function calculateNestingDepth(method) {
    let maxDepth = 0;
    function traverse(node, currentDepth) {
        if (!node)
            return;
        if (currentDepth > maxDepth)
            maxDepth = currentDepth;
        const nodeName = node.name?.toLowerCase() || "";
        const isNestingNode = [
            "ifstatement",
            "forstatement",
            "whilestatement",
            "dostatement",
            "switchstatement",
            "trystatement",
            "catchclause",
            "foreachstatement"
        ].some(n => nodeName.includes(n));
        const nextDepth = isNestingNode ? currentDepth + 1 : currentDepth;
        if (node.children) {
            for (const key in node.children) {
                const child = node.children[key];
                if (Array.isArray(child))
                    child.forEach(c => traverse(c, nextDepth));
                else if (child && typeof child === "object")
                    traverse(child, nextDepth);
            }
        }
        for (const key of Object.keys(node)) {
            if (!["children", "name", "value"].includes(key)) {
                const prop = node[key];
                if (prop && typeof prop === "object" && !Array.isArray(prop)) {
                    traverse(prop, nextDepth);
                }
            }
        }
    }
    if (method.body)
        traverse(method.body, 0);
    return maxDepth;
}
