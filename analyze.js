const vscode = require('vscode');

const analyzeFile = async () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const fileName = editor.document.fileName.split('/').pop();
    const originalContent = editor.document.getText();

    // Modify the content by adding lines at the beginning and end
    const modifiedContent = `// Line one\n${originalContent}\n// Line lasT`;

    // Create unique URIs for the original and modified content
    const originalUri = vscode.Uri.parse(`diff-scheme:/${fileName}-original`);
    const modifiedUri = vscode.Uri.parse(`diff-scheme:/${fileName}-modified`);

    // Register content providers for both URIs
    const contentProvider = {
      provideTextDocumentContent: (uri) => {
        if (uri.toString() === originalUri.toString()) {
          return originalContent;
        } else if (uri.toString() === modifiedUri.toString()) {
          return modifiedContent;
        }
        return '';
      },
    };
    vscode.workspace.registerTextDocumentContentProvider('diff-scheme', contentProvider);

    // Open the diff editor between the original and modified content
    await vscode.commands.executeCommand(
      'vscode.diff',
      originalUri,
      modifiedUri,
      `Diff: Original ↔ Modified - ${fileName}`,
      { preview: false, viewColumn: vscode.ViewColumn.Beside }
    );

    vscode.window.showInformationMessage(`Showing diff for ${fileName}.`);
  } else {
    vscode.window.showInformationMessage('No active editor found.');
  }
};

module.exports = {
  analyzeFile,
};
