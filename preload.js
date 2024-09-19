// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer, contextBridge } = require('electron');

console.log("Preload script running");

let port;

ipcRenderer.on('port', (event) => {
  if (!port) {
    console.log("Received port in preload script");
    port = event.ports[0];
    port.onmessage = (event) => {
      console.log("Received message on port in preload:", event.data);
      if (event.data.action === 'update-url') {
        window.postMessage({ type: 'update-url', url: event.data.url }, '*');
      }
    };
  } else {
    console.log("Port already received, ignoring additional port message");
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => {
    console.log("Navigating to:", url);
    if (port) port.postMessage({ action: 'navigate', url });
  },
  goBack: () => {
    console.log("Going back");
    if (port) port.postMessage({ action: 'go-back' });
  },
  goForward: () => {
    console.log("Going forward");
    if (port) port.postMessage({ action: 'go-forward' });
  },
  reload: () => {
    console.log("Reloading");
    if (port) port.postMessage({ action: 'reload' });
  },
});

console.log("Preload script finished");
