const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadFile(`${__dirname}/index.html`);

  // getFileFromUser();

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Markdown files", extensions: ["md", "markdown"] },
      { name: "Text files", extensions: ["txt, text"] },
    ],
  });
  if (!files) return null;

  const file = files[0];
  const content = fs.readFileSync(file).toString();
  console.log(content);
};
