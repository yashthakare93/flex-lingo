const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { SerialPort } = require('serialport');
const { execFile } = require('child_process'); // for Python calls

const PYTHON = process.env.PYTHON_PATH || 'python3';
const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors());

// ——————————————
// Monkey-patch SerialPort.list to bypass udevadm ENOENT
// ——————————————
const originalList = SerialPort.list.bind(SerialPort);
SerialPort.list = async function patchedList() {
  try {
    // Attempt the normal port-enumeration (which may invoke udevadm on Linux)
    return await originalList();
  } catch (err) {
    // If the failure is exactly "spawn udevadm ENOENT", swallow it
    if (
      err.code === 'ENOENT' &&
      err.syscall === 'spawn udevadm'
    ) {
      console.warn(
        '[serialport] udevadm not found; skipping Linux device enumeration'
      );
      return [];
    }
    // Otherwise re-throw
    throw err;
  }
};

// Utility: check if a script file exists
const scriptExists = p => fs.existsSync(p);

// Normalize port identifiers for comparison
const normalizePort = info =>
  String(info.path ?? info.comName ?? '').toUpperCase();

// ——————————————
// Status endpoint: lists connected ports (won’t error on Linux)
// ——————————————
app.get('/status', async (req, res) => {
  const device = String(req.query.device || 'COM7').toUpperCase();
  try {
    // Even on Linux without udev, list() now returns [] instead of throwing
    const ports = await SerialPort.list();
    const connected = ports.some(p => normalizePort(p) === device);

    // Warn if non-Linux, but don’t error
    if (os.platform() !== 'linux') {
      console.warn('Non-Linux detected; skipping Linux-only checks');
    }

    res.json({ connected });
  } catch (err) {
    console.error('Error in /status:', err);
    res.status(500).json({ error: 'Failed to check device status' });
  }
});

// ——————————————
// Start endpoint: runs Python prediction if device is present
// ——————————————
app.get('/start', async (req, res) => {
  const device = String(req.query.device || '').toUpperCase();
  const model = String(req.query.model || '').toLowerCase();
  if (!device) {
    return res.status(400).json({ error: 'Device is required' });
  }
  if (!['rf', 'bilstm'].includes(model)) {
    return res
      .status(400)
      .json({ error: "Model must be 'rf' or 'bilstm'" });
  }

  const scriptName =
    model === 'rf' ? 'predict_rf.py' : 'predict_sign.py';
  const scriptPath = path.join(__dirname, scriptName);
  if (!scriptExists(scriptPath)) {
    return res
      .status(500)
      .json({ error: `Script not found: ${scriptPath}` });
  }

  try {
    const ports = await SerialPort.list();
    const isConnected = ports.some(
      p => normalizePort(p) === device
    );
    if (!isConnected) {
      return res
        .status(400)
        .json({ error: `Device ${device} not connected` });
    }

    const { stdout, stderr } = await execFile(
      PYTHON,
      [scriptPath, device],
      { shell: true, maxBuffer: 1024 * 1024 }
    );
    console.log('Python stdout:', stdout);
    console.error('Python stderr:', stderr);

    const lines = stdout.trim().split(/\r?\n/);
    const result = lines[lines.length - 1] || 'No output';
    res.json({ result });
  } catch (err) {
    console.error('Prediction error:', err);
    res
      .status(500)
      .json({ error: 'Failed to run prediction script' });
  }
});

// ——————————————
// Launch server
// ——————————————
app.listen(PORT, () =>
  console.log(
    `Server listening on https://flex-lingo-server.onrender.com`
  )
);
