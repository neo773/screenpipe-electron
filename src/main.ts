import { app, BrowserWindow, ipcMain, shell } from "electron";
import { channels } from "./shared/constants";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { platform } from "os";

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
  const isWindows = platform() === "win32";
  const installCommand = isWindows
    ? 'powershell -Command "iwr get.screenpi.pe/cli.ps1 | iex"'
    : "curl -fsSL get.screenpi.pe/cli | sh";

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

let cliProcess: ChildProcessWithoutNullStreams | null = null;

ipcMain.handle(channels.START_CLI, () => {
  try {
    if (cliProcess) {
      return { success: true, message: "CLI already running" };
    }
    const isWindows = platform() === "win32";
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const cliPath = isWindows
      ? `${homeDir}\\screenpipe\\bin\\screenpipe.exe`
      : `${homeDir}/.local/bin/screenpipe`;

    console.log("Attempting to start CLI from:", cliPath);

    cliProcess = spawn(cliPath, [], {
      stdio: "pipe",
      env: process.env,
    });

    cliProcess.stdout?.on("data", (data) => {
      console.log("CLI stdout:", data.toString());
    });

    cliProcess.stderr?.on("data", (data) => {
      console.error("CLI stderr:", data.toString());
    });

    cliProcess.on("spawn", () => {
      console.log("CLI process spawned with PID:", cliProcess?.pid);
    });

    cliProcess.on("exit", (code) => {
      console.error("CLI process exited with code:", code);
      cliProcess = null;
    });

    cliProcess.on("error", (err) => {
      console.error("CLI process error:", err);
      cliProcess = null;
    });

    return { success: true, message: "CLI started successfully" };
  } catch (error) {
    console.error("Failed to start CLI:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle(channels.STOP_CLI, () => {
  try {
    if (cliProcess) {
      cliProcess.kill();
      return { success: true, message: "CLI stopped successfully" };
    }
    return { success: true, message: "CLI was not running" };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle(channels.OPEN_EXTERNAL_LINK, (event, url: string) => {
  shell.openExternal(url);
});
