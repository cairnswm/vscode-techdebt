const vscode = require('vscode');

// Define a decoration style for tech debt highlighting
const techDebtDecorationType = vscode.window.createTextEditorDecorationType({
  border: '1px solid red',
  borderRadius: '3px',
  backgroundColor: 'rgba(255, 0, 0, 0.1)', // light red background
});

// Function to find tech debt blocks in the current editor
function findTechDebtBlocks(text) {
  const regex = /\/\/\*\* Tech Debt \*\*[\s\S]*?\/\/\*\*\/\/\n([\s\S]*?)(?=^\s*$|\/\/|$)/gm;
  let match;
  const ranges = [];

  while ((match = regex.exec(text)) !== null) {
    const startLine = text.substr(0, match.index).split('\n').length - 1;
    const endLine = startLine + match[0].split('\n').length;

    ranges.push(new vscode.Range(startLine, 0, endLine, 0));
  }

  return ranges;
}

// Main command to open the file in a new column and highlight tech debt blocks
function techDebtCommand() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const fileUri = editor.document.uri;

    // Open the same file in a new editor column to the right
    vscode.commands.executeCommand('vscode.open', fileUri, {
      viewColumn: vscode.ViewColumn.Beside
    }).then(() => {
      // Locate tech debt blocks and apply highlighting in both editor instances
      const text = editor.document.getText();
      const techDebtRanges = findTechDebtBlocks(text);

      editor.setDecorations(techDebtDecorationType, techDebtRanges);

      // Apply decorations to the new editor instance as well
      vscode.window.visibleTextEditors.forEach((openedEditor) => {
        if (openedEditor.document.uri.toString() === fileUri.toString()) {
          openedEditor.setDecorations(techDebtDecorationType, techDebtRanges);
        }
      });
    });
  } else {
    vscode.window.showInformationMessage('No active editor found.');
  }
}

// Clean up decoration type when the extension deactivates
function deactivate() {
  techDebtDecorationType.dispose();
}

module.exports = {
  techDebtCommand,
  deactivate
};
