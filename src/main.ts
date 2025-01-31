import { app, BrowserWindow, ipcMain, net, shell } from "electron";
import { channels } from "./shared/constants";
import { exec, spawn } from 'child_process';
import { platform } from 'os';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;


const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1000,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.handle(channels.QUIT, () => {
  app.quit();
});

// Add these handlers after the existing ipcMain handlers
ipcMain.handle(channels.INSTALL_CLI, async () => {
  const isWindows = platform() === 'win32';
  const installCommand = isWindows
    ? 'powershell -Command "iwr get.screenpi.pe/cli.ps1 | iex"'
    : 'curl -fsSL get.screenpi.pe/cli | sh';

  return new Promise((resolve, reject) => {
    exec(installCommand, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
        return;
      }
      resolve({ success: true, stdout });
    });
  });
});

ipcMain.handle(channels.START_CLI, () => {


  const isWindows = platform() === 'win32';
  const cliCommand = isWindows ? 'screenpi.exe' : 'screenpipe';
  
  try {
    const cliProcess = spawn(cliCommand, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    cliProcess.on('error', (error: Error) => {
      console.error('CLI process error:', error);
    });

    return { success: true, message: 'CLI started successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle(channels.STOP_CLI, () => {

  try {
    const isWindows = platform() === 'win32';
    exec(`${isWindows ? 'taskkill /IM' : 'killall'} screenpipe`);
    return { success: true, message: 'CLI stopped successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle(channels.OPEN_EXTERNAL_LINK, (event, url: string) => {
  shell.openExternal(url);
});
