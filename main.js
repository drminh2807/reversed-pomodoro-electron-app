// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, WebContentsView, ipcMain, MessageChannelMain } = require("electron");
const path = require("node:path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const mainView = new WebContentsView();
  win.contentView.addChildView(mainView);
  mainView.webContents.loadURL("https://study4.com/tests/ielts/");

  const controlsView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.contentView.addChildView(controlsView);
  controlsView.webContents.loadFile('index.html');

  const { port1, port2 } = new MessageChannelMain();

  mainView.webContents.postMessage("port", null, [port1]);
  controlsView.webContents.postMessage('port', null, [port2]);

  port1.on('message', (event) => {
    const { action, url } = event.data;
    switch (action) {
      case 'navigate':
        mainView.loadURL(url);
        break;
      case 'go-back':
        if (mainView.canGoBack()) mainView.goBack();
        break;
      case 'go-forward':
        if (mainView.canGoForward()) mainView.goForward();
        break;
      case 'reload':
        mainView.reload();
        break;
    }
  });

  mainView.on('did-navigate', (event, url) => {
    port2.postMessage({ action: 'update-url', url });
  });

  mainView.on('did-navigate-in-page', (event, url) => {
    port2.postMessage({ action: 'update-url', url });
  });

  const updateViewBounds = () => {
    const bounds = win.getContentBounds();
    controlsView.setBounds({ x: 0, y: 0, width: bounds.width, height: 40 });
    mainView.setBounds({ x: 0, y: 40, width: bounds.width, height: bounds.height - 40 });
  };

  updateViewBounds();
  win.on("resize", updateViewBounds);
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
