const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('tynkrDesktop', Object.freeze({
  openProject: () => ipcRenderer.invoke('project:open'),
  saveProject: (json, suggestedName) => ipcRenderer.invoke('project:save', { json, suggestedName }),
  exportSvg: (svg, suggestedName) => ipcRenderer.invoke('export:svg', { svg, suggestedName }),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close')
}));
