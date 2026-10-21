const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1100,
    minHeight: 680,
    backgroundColor: '#101820',
    title: 'Tynkr2D Alpha',
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Tynkr2D project',
    properties: ['openFile'],
    filters: [{ name: 'Tynkr2D Project', extensions: ['json', 'tynkr'] }, { name: 'JSON', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const text = await fs.readFile(result.filePaths[0], 'utf8');
  return JSON.parse(text);
});

ipcMain.handle('project:save', async (_event, { json, suggestedName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save editable Tynkr2D project',
    defaultPath: suggestedName,
    filters: [{ name: 'Tynkr2D Project', extensions: ['tynkr.json', 'json'] }]
  });
  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, json, 'utf8');
  return result.filePath;
});

ipcMain.handle('export:svg', async (_event, { svg, suggestedName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export SVG frame',
    defaultPath: suggestedName,
    filters: [{ name: 'SVG image', extensions: ['svg'] }]
  });
  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, svg, 'utf8');
  return result.filePath;
});

ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:toggle-maximize', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  return mainWindow.isMaximized();
});
ipcMain.handle('window:close', () => mainWindow?.close());

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
