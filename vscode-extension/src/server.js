const { createConnection, ProposedFeatures, TextDocuments } = require('vscode-languageserver/node');
const { TextDocument } = require('vscode-languageserver-textdocument');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            hoverProvider: true,
            codeActionProvider: true
        }
    };
});

// Listen for document changes
documents.onDidChangeContent(change => {
    validateDocument(change.document);
});

async function validateDocument(textDocument) {
    const text = textDocument.getText();
    const issues = await analyzeText(text, textDocument.languageId);
    
    // Send diagnostics to VS Code
    connection.sendDiagnostics({
        uri: textDocument.uri,
        diagnostics: issues.map(issueToDiagnostic)
    });
}

connection.listen();