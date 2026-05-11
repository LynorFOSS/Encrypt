import { app, BrowserWindow, Menu, ipcMain, shell, webContents } from "electron";
import path from "node:path";
import { promises as fs } from "node:fs";

const statePath = () => path.join(app.getPath("userData"), "encrypt-state.json");

let mainWindow: BrowserWindow | null = null;

async function loadStateFile(): Promise<string | null> {
  try {
    return await fs.readFile(statePath(), "utf8");
  } catch {
    return null;
  }
}

async function saveStateFile(state: string): Promise<void> {
  await fs.mkdir(path.dirname(statePath()), { recursive: true });
  await fs.writeFile(statePath(), state, "utf8");
}

function getRendererUrl() {
  if (process.env.VITE_DEV_SERVER_URL) {
    return process.env.VITE_DEV_SERVER_URL;
  }
  return `file://${path.join(__dirname, "renderer", "index.html")}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1680,
    height: 1080,
    minWidth: 1360,
    minHeight: 840,
    backgroundColor: "#020617",
    title: "Encrypt",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.loadURL(getRendererUrl());

  mainWindow.webContents.on("before-input-event", (_, input) => {
    const isAccelerator = input.control || input.meta;
    if (isAccelerator && input.key.toLowerCase() === "k") {
      mainWindow?.webContents.send("shell:shortcut", "command-palette");
    }
    if (isAccelerator && input.key.toLowerCase() === "l") {
      mainWindow?.webContents.send("shell:shortcut", "focus-omnibox");
    }
    if (isAccelerator && input.key.toLowerCase() === "t") {
      mainWindow?.webContents.send("shell:shortcut", "new-tab");
    }
    if (isAccelerator && input.shift && input.key.toLowerCase() === "p") {
      mainWindow?.webContents.send("shell:shortcut", "split-pane");
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.encrypt.browser");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (_, contents) => {
  if (contents.getType() !== "webview") {
    return;
  }

  contents.on("context-menu", (_event, params) => {
    const pageTitle = params.selectionText || contents.getTitle();
    const pageUrl = contents.getURL();
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: "Explain this page",
        click: () => mainWindow?.webContents.send("browser:action", { action: "explain", url: pageUrl, title: pageTitle }),
      },
      {
        label: "Summarize article",
        click: () => mainWindow?.webContents.send("browser:action", { action: "summarize", url: pageUrl, title: pageTitle }),
      },
      {
        label: "Extract tickers",
        click: () => mainWindow?.webContents.send("browser:action", { action: "extract-tickers", url: pageUrl, title: pageTitle }),
      },
      {
        label: "Create watchlist item",
        click: () => mainWindow?.webContents.send("browser:action", { action: "watchlist", url: pageUrl, title: pageTitle }),
      },
      {
        label: "Compare to similar companies",
        click: () => mainWindow?.webContents.send("browser:action", { action: "compare", url: pageUrl, title: pageTitle }),
      },
      {
        label: "Save to research workspace",
        click: () => mainWindow?.webContents.send("browser:action", { action: "save-research", url: pageUrl, title: pageTitle }),
      },
      { type: "separator" },
      {
        label: "Open externally",
        click: () => shell.openExternal(pageUrl),
      },
    ];

    Menu.buildFromTemplate(template).popup({ window: BrowserWindow.fromWebContents(contents) ?? undefined });
  });
});

ipcMain.handle("shell:load-state", async () => loadStateFile());
ipcMain.handle("shell:save-state", async (_event, state: string) => saveStateFile(state));
ipcMain.handle("shell:open-external", async (_event, url: string) => shell.openExternal(url));

ipcMain.handle("shell:focus-window", async () => {
  mainWindow?.focus();
});

ipcMain.handle("shell:active-contents", async (_event, contentsId: number) => webContents.fromId(contentsId)?.getURL() ?? null);