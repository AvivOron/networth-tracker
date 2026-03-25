import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs'

const DATA_FILE = join(app.getPath('userData'), 'networth-data.json')

function readData(): object {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to read data file:', e)
  }
  return { accounts: [], snapshots: [] }
}

function writeData(data: unknown): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to write data file:', e)
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#09090f',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.networth-tracker')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('getData', () => {
    return readData()
  })

  ipcMain.handle('saveData', (_event, data: unknown) => {
    writeData(data)
    return true
  })

  ipcMain.handle('authenticateWithGoogle', async () => {
    // TODO: Implement proper OAuth flow with Google
    // For now, this returns an error message with setup instructions
    throw new Error(
      'Google Drive authentication is not yet configured. ' +
      'To enable it, you need to:\n\n' +
      '1. Create a Google OAuth 2.0 credential at https://console.cloud.google.com\n' +
      '2. Set the redirect URI to: http://localhost:3000/oauth/callback\n' +
      '3. Add your Client ID and Secret to the app configuration\n\n' +
      'This feature will be available in a future update.'
    )
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
