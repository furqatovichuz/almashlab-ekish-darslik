const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const toc = require("./toc");

const pdfDir = app.isPackaged
  ? path.join(process.resourcesPath, "pdfs")
  : path.join(__dirname, "..", "pdfs");

const knownFiles = new Set(toc.flatMap((g) => g.items.map((i) => i.file)));

ipcMain.handle("toc", () => toc);

ipcMain.handle("pdf", async (_event, file) => {
  if (!knownFiles.has(file)) throw new Error("Noma’lum fayl");
  return fs.promises.readFile(path.join(pdfDir, file));
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0f2a1d",
    title: "Almashlab ekish darsligi",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, "index.html"));
};

Menu.setApplicationMenu(null);
app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
