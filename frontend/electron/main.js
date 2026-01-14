const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;
const BACKEND_PORT = 8000;

// Check if backend is already running
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
}

// Start backend server
async function startBackend() {
  const isRunning = await isPortInUse(BACKEND_PORT);
  
  if (isRunning) {
    console.log('Backend already running on port', BACKEND_PORT);
    return;
  }

  const backendPath = path.join(__dirname, '../../backend');
  const pythonPath = isDev 
    ? path.join(backendPath, 'venv', 'bin', 'python') 
    : path.join(process.resourcesPath, 'backend', 'venv', 'bin', 'python');

  // For packaged app, use bundled Python or system Python
  const pythonCmd = process.platform === 'win32' 
    ? (pythonPath.replace('/bin/python', '/Scripts/python.exe') || 'python')
    : (pythonPath || 'python3');

  backendProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--port', BACKEND_PORT.toString()], {
    cwd: backendPath,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  // Wait for backend to be ready
  await new Promise((resolve) => {
    const checkBackend = setInterval(async () => {
      if (await isPortInUse(BACKEND_PORT)) {
        clearInterval(checkBackend);
        console.log('Backend is ready!');
        resolve();
      }
    }, 500);
    setTimeout(() => {
      clearInterval(checkBackend);
      resolve(); // Continue even if backend takes time
    }, 10000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/icon.png'), // Add icon later
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
