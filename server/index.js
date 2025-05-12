const express = require('express');
const cors = require('cors');
const util = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { SerialPort } = require('serialport');
const execFile = util.promisify(require('child_process').execFile);

const PYTHON = process.env.PYTHON_PATH || 'python';
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';
const app = express();

app.use(cors());

const scriptExists = (p) => fs.existsSync(p);
const normalizePort = (info) => String(info.path ?? info.comName ?? '').toUpperCase();

async function safeListPorts() {
  try {
    return await SerialPort.list();
  } catch (e) {
    // Handle missing udevadm on Linux
    if (e.code === 'ENOENT' && e.syscall.includes('udevadm')) {
      console.warn('udevadm not found; returning empty port list');
      return [];
    }
    throw e;
  }
}

app.get('/status', async (req, res) => {
  const device = String(req.query.device || 'COM7').toUpperCase();
  try {
    const ports = await safeListPorts();
    const connected = ports.some((p) => normalizePort(p) === device);
    res.json({ connected });
  } catch (err) {
    console.error('Error checking status:', err);
    res.status(500).json({ error: 'Failed to check device status' });
  }
});

app.get('/start', async (req, res) => {
  const device = String(req.query.device || '').toUpperCase();
  const model = String(req.query.model || '').toLowerCase();

  if (!device) {
    return res.status(400).json({ error: 'Device is required' });
  }
  if (!['rf', 'bilstm'].includes(model)) {
    return res.status(400).json({ error: "Model must be 'rf' or 'bilstm'" });
  }

  const scriptName = model === 'rf' ? 'predict_rf.py' : 'predict_sign.py';
  const scriptPath = path.join(__dirname, scriptName);
  if (!scriptExists(scriptPath)) {
    return res.status(500).json({ error: `Script not found: ${scriptPath}` });
  }

  try {
    const ports = await safeListPorts();
    const isConnected = ports.some((p) => normalizePort(p) === device);
    if (!isConnected) {
      return res.status(400).json({ error: `Device ${device} not connected` });
    }

    const { stdout, stderr } = await execFile(PYTHON, [scriptPath, device], { maxBuffer: 1024 * 1024 });
    console.log('Python stdout:', stdout);
    if (stderr) console.error('Python stderr:', stderr);

    const lines = stdout.trim().split(/\r?\n/);
    const result = lines[lines.length - 1] || 'No output';
    res.json({ result });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Failed to run prediction script' });
  }
});

app.listen(PORT, HOST, () => console.log(`Server listening on http://${HOST}:${PORT}`));
