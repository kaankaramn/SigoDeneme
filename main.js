import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nitro sunucusu için port ve IP tanımı
process.env.PORT = '3000';
process.env.HOST = '127.0.0.1';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'E-Plaka Kayıt Uygulaması',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://127.0.0.1:3000');
}

app.whenReady().then(async () => {
  try {
    // TanStack Start (Nitro) sunucusunu uygulama içinde başlatıyoruz
    const serverPath = path.join(__dirname, 'build_output', 'server', 'index.mjs');
    await import(pathToFileURL(serverPath).href);
  } catch (err) {
    console.error('Sunucu başlatma hatası:', err);
  }

  // Sunucunun ayağa kalkması için kısa bir bekleme
  setTimeout(createWindow, 800);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});