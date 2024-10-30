const vscode = require('vscode');

function chatCommand(filePath, fileName) {
  const panel = vscode.window.createWebviewPanel(
    'chat', // Identifies the type of the webview. Used internally
    'Chat', // Title of the panel displayed to the user
    vscode.ViewColumn.Beside, // Editor column to show the new webview panel in
    {} // Webview options
  );

  // Set the webview's HTML content
  panel.webview.html = getWebviewContent(filePath, fileName);
}

function getWebviewContent(filePath, fileName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
</head>
<body>
    <h1>Chat</h1>
    <p>File Path: ${filePath}</p>
    <p>File Name: ${fileName}</p>
</body>
</html>`;
}

module.exports = {
  chatCommand
};
