const vscode = require('vscode');

class CustomViewProvider {
  constructor() {
    this._view = null;
  }

  resolveCustomView(treeItem) {
    return treeItem;
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!element) {
      return [new vscode.TreeItem("Custom", vscode.TreeItemCollapsibleState.Collapsed)];
    }
    return [];
  }

  setView(view) {
    this._view = view;
  }

  updateView(fileName) {
    if (this._view) {
      this._view.title = "Custom";
      this._view.description = fileName;
      this._view.refresh();
    }
  }
}

function activate(context) {
  const customViewProvider = new CustomViewProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider('customView', customViewProvider));

  context.subscriptions.push(vscode.commands.registerCommand('extension.openCustomView', (fileName) => {
    customViewProvider.updateView(fileName);
  }));
}

module.exports = {
  activate,
  CustomViewProvider
};
