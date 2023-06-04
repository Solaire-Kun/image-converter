const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const platform = process.platform;

let mainWindow

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        minWidth: 500,
        height: 600,
        minHeight: 400,
        roundedCorners: true,
        autoHideMenuBar: true,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.loadFile('index.html');
}

// create window and check for updates
app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
})

app.on('window-all-closed', () => {
    app.quit();
})

// restart when updates
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

// get app version
ipcMain.on('app_version', (e) => {
    e.sender.send('app_version', { version: app.getVersion() });
});

// handle update if is available
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

// handle images and convert them
ipcMain.on('image:sent', (e, data) => {
    const { images, name, convertTo } = data;

    // make sure the folder exists, if not create it
    const outputFolderPath = path.resolve('./converted-images/');
    fs.ensureDirSync(outputFolderPath);

    // remove the old file format example remove .png and rename to the desired convertTo string
    const extensionIndex = name.lastIndexOf('.');
    const newName = name.substring(0, extensionIndex);

    // create the file in a new folder and using the desired format
    const newFilePath = `${outputFolderPath}/${newName}.${convertTo}`;

    // convert the image
    sharp(images).toFile(newFilePath, (err, info) => {
        if (err) {
            console.error(err);
            return;
        } else if (info) {
            if (platform === 'win32') {
                exec(`start "" "${outputFolderPath}"`);
            }
        }
    });
});