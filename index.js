// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("node:path");

let duration = 0;
const SHOW_DURATION = 30*60;
const HIDE_DURATION = 5*60;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow();

  // and load the index.html of the app.
  mainWindow.loadURL("https://study4.com/tests/ielts/");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  setInterval(() => {
    console.log(duration);
    duration += 1;
    if (duration === HIDE_DURATION) {
      app.hide();
      console.log("focus");
    } else if (duration >= SHOW_DURATION) {
      app.show();
      app.focus({ steal: true });
      duration = 0;
      console.log("hide");
    }
  }, 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
