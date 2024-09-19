// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer, contextBridge } = require('electron');

let port;

ipcRenderer.on('port', (event) => {
  port = event.ports[0];
  port.onmessage = (event) => {
    if (event.data.action === 'update-url') {
      window.postMessage({ type: 'update-url', url: event.data.url }, '*');
    }
  };
});

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => port.postMessage({ action: 'navigate', url }),
  goBack: () => port.postMessage({ action: 'go-back' }),
  goForward: () => port.postMessage({ action: 'go-forward' }),
  reload: () => port.postMessage({ action: 'reload' }),
});
