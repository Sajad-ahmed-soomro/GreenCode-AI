export function calculateFunctionSize(method) {
    let size = 0;
    function traverse(node) {
        if (!node)
            return;
        const name = node.name?.toLowerCase?.() || "";
        const isStatement = [
            "expressionstatement",
            "returnstatement",
            "ifstatement",
            "forstatement",
            "whilestatement",
            "dostatement",
            "throwstatement",
            "switchstatement"
        ].includes(name);
        if (isStatement)
            size++;
        if (node.children) {
            for (const arr of Object.values(node.children)) {
                if (Array.isArray(arr))
                    arr.forEach(traverse);
                else if (arr && typeof arr === "object")
                    traverse(arr);
            }
        }
    }
    if (method.body)
        traverse(method.body);
    return size;
}
