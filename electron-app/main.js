const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

//desktop size
const LOGIN_SIZE = { width: 1400, height: 750 };
const APP_SIZE = { width: 1400, height: 750 };
function createWindow() {
  win = new BrowserWindow({
    width: LOGIN_SIZE.width,
    height: LOGIN_SIZE.height,
    frame: false, //custom title
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setMenuBarVisibility(false);
  win.center();

  if (process.env.ELECTRON_DEV === "true") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../browser-app/dist/index.html"));
  }
}

//window title control
ipcMain.on("minimize-window", () => {
  win?.minimize();
});

ipcMain.on("maximize-window", () => {
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("close-window", () => {
  win?.close();
});

//login/logout
ipcMain.on("login-success", () => {
  if (!win) return;
  win.setResizable(true);
  win.setSize(APP_SIZE.width, APP_SIZE.height);
  win.center();
});

ipcMain.on("logout", () => {
  if (!win) return;
  win.setResizable(false);
  win.setSize(LOGIN_SIZE.width, LOGIN_SIZE.height);
  win.center();
});

app.whenReady().then(createWindow);
