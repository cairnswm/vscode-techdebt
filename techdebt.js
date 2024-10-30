const vscode = require('vscode');
const { getTechDebt } = require('./openai-chat.js'); // Adjust the path as needed

// Main command to open the file in a new column and display cleaned content
async function techDebtCommand() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const fileUri = editor.document.uri;
    const text = editor.document.getText();
    
    // Process the content to remove tech debt comments
    const newText = await getTechDebt(text);
    console.log("getTechDebt", newText);

    // Open the file in a new editor column beside the current one
    const newEditor = await vscode.window.showTextDocument(fileUri, { viewColumn: vscode.ViewColumn.Beside });

    if (newEditor) {
      // Replace the content in the new editor with the cleaned content
      const edit = new vscode.WorkspaceEdit();
      const entireRange = new vscode.Range(
        new vscode.Position(0, 0),
        newEditor.document.lineAt(newEditor.document.lineCount - 1).range.end
      );
      edit.replace(newEditor.document.uri, entireRange, newText);
      await vscode.workspace.applyEdit(edit);
      
      // Save the document after edit to reflect changes immediately (optional)
      await newEditor.document.save();
    }
  } else {
    vscode.window.showInformationMessage('No active editor found.');
  }
}

// Clean up when the extension deactivates
function deactivate() {}

module.exports = {
  techDebtCommand,
  deactivate
};
