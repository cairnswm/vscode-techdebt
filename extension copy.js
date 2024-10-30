const vscode = require('vscode');
const { analyzeFile } = require('./analyze'); // Importing analyzeFile from analyze.js
const { chatCommand } = require('./chat'); // Importing chatCommand from chat.js

function activate(context) {
  // Main command opens a quick pick for sub-commands
  const mainCommand = vscode.commands.registerCommand('extension.mainCommand', async () => {
    console.log('Main command triggered'); // Debug log
    const subCommands = [
      { label: "Add SCSS", command: "extension.addScss" },
      { label: "Analyze file", command: "extension.analyzeFile" },
      { label: "Open Config Panel", command: "extension.openConfigPanel" },
      { label: "Chat", command: "extension.chat" } // New chat command
    ];

    const selected = await vscode.window.showQuickPick(subCommands, {
      placeHolder: "Select a sub command"
    });

    if (selected) {
      console.log(`Subcommand selected: ${selected.label}`); // Debug log
      if (selected.command === 'extension.chat') {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const filePath = editor.document.uri.fsPath;
          const fileName = editor.document.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
          chatCommand(filePath, fileName); // Call chatCommand with file details
        } else {
          vscode.window.showInformationMessage('No active editor found.');
        }
      } else {
        vscode.commands.executeCommand(selected.command);
      }
    }
  });

  // Register the sub-commands
  const addScss = vscode.commands.registerCommand('extension.addScss', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const filePath = editor.document.uri.fsPath;
      const fileName = editor.document.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      const scssFilePath = fileName + ".scss";

      const newFileUri = vscode.Uri.file(scssFilePath);
      const content = ""; // Initial content for the SCSS file

      await vscode.workspace.fs.writeFile(newFileUri, Buffer.from(content));
      vscode.window.showInformationMessage(`SCSS file created: ${scssFilePath}`);
    } else {
      vscode.window.showInformationMessage('No active editor found.');
    }
  });

  // Register the analyzeFile command from analyze.js
  const analyzeFileCommand = vscode.commands.registerCommand('extension.analyzeFile', analyzeFile);

  // New command to open the configuration panel
  const openConfigPanel = vscode.commands.registerCommand('extension.openConfigPanel', async () => {
    const apiOptions = ["Open AI"];
    const selectedApi = await vscode.window.showQuickPick(apiOptions, {
      placeHolder: "Select AI API"
    });

    const apiKey = await vscode.window.showInputBox({
      placeHolder: "Enter your API Key"
    });

    if (selectedApi && apiKey) {
      const config = vscode.workspace.getConfiguration('yourExtensionName'); // Replace with your extension's name
      await config.update('aiApi', selectedApi, vscode.ConfigurationTarget.Global);
      await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Configuration saved successfully.');
    }
  });

  context.subscriptions.push(mainCommand, addScss, analyzeFileCommand, openConfigPanel);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
