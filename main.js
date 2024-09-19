// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, WebContentsView, ipcMain, MessageChannelMain } = require("electron");
const path = require("node:path");

const createWindow = () => {
  console.log("Creating window...");
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  console.log("Creating main view...");
  const mainView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.contentView.addChildView(mainView);
  mainView.webContents.loadURL("https://study4.com/tests/ielts/");

  console.log("Creating controls view...");
  const controlsView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.contentView.addChildView(controlsView);
  controlsView.webContents.loadFile('index.html');

  // Open DevTools for main view
  mainView.webContents.openDevTools({ mode: 'detach' });

  // Open DevTools for controls view
  controlsView.webContents.openDevTools({ mode: 'detach' });

  console.log("Setting up MessageChannel...");
  const { port1, port2 } = new MessageChannelMain();

  let mainViewReady = false;
  let controlsViewReady = false;

  mainView.webContents.on('did-finish-load', () => {
    console.log("Main view loaded");
    mainViewReady = true;
    if (!port1.neutered) {
      console.log("Sending port1 to main view...");
      mainView.webContents.postMessage('port', null, [port1]);
    }
  });

  controlsView.webContents.on('did-finish-load', () => {
    console.log("Controls view loaded");
    controlsViewReady = true;
    if (!port2.neutered) {
      console.log("Sending port2 to controls view...");
      controlsView.webContents.postMessage('port', null, [port2]);
    }
  });

  // Ensure ports are sent even if views are already loaded
  if (mainViewReady && !port1.neutered) {
    console.log("Sending port1 to main view (delayed)...");
    mainView.webContents.postMessage('port', null, [port1]);
  }

  if (controlsViewReady && !port2.neutered) {
    console.log("Sending port2 to controls view (delayed)...");
    controlsView.webContents.postMessage('port', null, [port2]);
  }

  port1.on('message', (event) => {
    console.log("Received message on port1:", event.data);
    const { action, url } = event.data;
    switch (action) {
      case 'navigate':
        console.log("Navigating to:", url);
        mainView.webContents.loadURL(url);
        break;
      case 'go-back':
        console.log("Going back");
        if (mainView.webContents.canGoBack()) mainView.webContents.goBack();
        break;
      case 'go-forward':
        console.log("Going forward");
        if (mainView.webContents.canGoForward()) mainView.webContents.goForward();
        break;
      case 'reload':
        console.log("Reloading");
        mainView.webContents.reload();
        break;
    }
  });

  mainView.webContents.on('did-navigate', (event, url) => {
    console.log("Main view navigated to:", url);
    port2.postMessage({ action: 'update-url', url });
  });

  mainView.webContents.on('did-navigate-in-page', (event, url) => {
    console.log("Main view navigated in page to:", url);
    port2.postMessage({ action: 'update-url', url });
  });

  const updateViewBounds = () => {
    console.log("Updating view bounds...");
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
  console.log("App is ready, creating window...");
  createWindow();

  app.on("activate", () => {
    console.log("App activated");
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  console.log("All windows closed");
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
