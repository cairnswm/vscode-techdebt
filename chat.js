const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const fetchOpenAIChat = require('./openai-chat'); // Import the fetchOpenAIChat function

function chatCommand(filePath, fileName) {
  const panel = vscode.window.createWebviewPanel(
    'chat',
    'Chat',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true
    }
  );

  panel.webview.html = getWebviewContent(filePath, fileName);

  panel.webview.onDidReceiveMessage(async message => {
    switch (message.command) {
      case 'addMessage':
        messages.push({ role: message.role, content: message.content });
        panel.webview.postMessage({ command: 'updateMessages', content: renderMessages() });
        
        try {
          const assistantResponse = await fetchOpenAIChat(messages);
          messages.push({ role: 'assistant', content: assistantResponse });
          panel.webview.postMessage({ command: 'updateMessages', content: renderMessages() });
        } catch (error) {
          vscode.window.showErrorMessage(`Error fetching OpenAI response: ${error.message}`);
        }
        break;
      
      case 'saveChat':
        saveChatToFile(message.filename);
        break;
    }
  });
}

let messages = [
  {
    "role": "system",
    "content": "You are a helpful assistant."
  },
  {
    "role": "user",
    "content": "Hello!"
  },
  {
    "role": "assistant",
    "content": "Hello User!"
  }
];

function getWebviewContent(filePath, fileName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
      .message { margin: 10px 0; }
      .system { color: blue; }
      .user { color: green; }
      .assistant { color: orange; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Chat</h1>
        <p>File Path: ${filePath}</p>
        <p>File Name: ${fileName}</p>
        <div class="chat-window">
            ${renderMessages()}
        </div>
        <div class="input-group mb-3">
            <input type="text" id="userInput" class="form-control" placeholder="Type your message here...">
            <div class="input-group-append">
                <button class="btn btn-primary" id="sendButton">Send</button>
            </div>
        </div>
        <div class="input-group mb-3">
            <input type="text" id="filenameInput" class="form-control" placeholder="Filename" value="chat.json">
            <div class="input-group-append">
                <button class="btn btn-secondary" id="saveButton">Save Chat</button>
            </div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('sendButton').addEventListener('click', () => {
            const input = document.getElementById('userInput');
            const newMessage = input.value;
            if (newMessage) {
                vscode.postMessage({ command: 'addMessage', role: 'user', content: newMessage });
                input.value = '';
            }
        });

        document.getElementById('saveButton').addEventListener('click', () => {
            const filename = document.getElementById('filenameInput').value || 'chat.json';
            vscode.postMessage({ command: 'saveChat', filename });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateMessages') {
                const chatWindow = document.querySelector('.chat-window');
                chatWindow.innerHTML = message.content;
            }
        });
    </script>
</body>
</html>`;
}

function renderMessages() {
  return messages.map(message => {
    return `<div class="message ${message.role}">
              <strong>${message.role.charAt(0).toUpperCase() + message.role.slice(1)}:</strong> ${message.content}
            </div>`;
  }).join('');
}

function saveChatToFile(filename) {
  const chatContent = JSON.stringify(messages, null, 2);
  const filePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filename);

  fs.writeFile(filePath, chatContent, 'utf8', (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error saving file: ${err.message}`);
    } else {
      vscode.window.showInformationMessage(`Chat saved to ${filename}`);
    }
  });
}

module.exports = {
  chatCommand
};
