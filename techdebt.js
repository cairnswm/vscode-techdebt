const vscode = require('vscode');
const { getTechDebt } = require('./openai-chat.js'); // Adjust the path as needed

// Main command to display the tech debt in a diff view
async function techDebtCommand() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const text = editor.document.getText();
    
    // Process the content to remove tech debt comments
    const newText = await getTechDebt(text);
    console.log("getTechDebt", newText);

    // Create a URI for the virtual document
    const originalUri = editor.document.uri;
    const techDebtUri = vscode.Uri.parse(`techdebt:${originalUri.path}.techdebt`);

    // Register a content provider for the tech debt virtual document
    const provider = new TechDebtContentProvider(newText);
    const providerRegistration = vscode.workspace.registerTextDocumentContentProvider('techdebt', provider);

    // Show a diff view between the original document (left) and the tech debt document (right)
    await vscode.commands.executeCommand(
      'vscode.diff',
      originalUri,  // (original file)
      techDebtUri,  // (tech debt version)
      'Tech Debt Diff',
      { preview: false }
    );

    // Create the "Accept Tech Debt Changes" button in the editor title bar
    const acceptButton = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: '$(check) Accept Changes',
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: '13px',
        margin: '0 10px',
      }
    });

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      activeEditor.setDecorations(acceptButton, [new vscode.Range(0, 0, 0, 0)]);
    }

    // Register a command to accept the tech debt changes
    vscode.commands.registerCommand('extension.acceptTechDebtChanges', async () => {
      const edit = new vscode.WorkspaceEdit();
      const range = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(text.length)
      );
      edit.replace(originalUri, range, newText);
      await vscode.workspace.applyEdit(edit);
      await editor.document.save();
      vscode.window.showInformationMessage('Tech debt changes accepted.');
      acceptButton.dispose(); // Remove the button after applying the changes
    });

    // Dispose the provider and accept button when done
    providerRegistration.dispose();
  } else {
    vscode.window.showInformationMessage('No active editor found.');
  }
}

// Content provider for the tech debt virtual document
class TechDebtContentProvider {
  constructor(newText) {
    this.newText = newText;
  }

  provideTextDocumentContent(uri) {
    return this.newText;
  }
}

// Clean up when the extension deactivates
function deactivate() {}

module.exports = {
  techDebtCommand,
  deactivate
};
