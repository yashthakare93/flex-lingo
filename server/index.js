const express = require('express');
const cors = require('cors');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');

// Promisified execFile
const execFile = util.promisify(require('child_process').execFile);
const PYTHON = process.env.PYTHON_PATH || 'python';
const app = express();
const PORT = 5001;

app.use(cors());

// Check file exists
const scriptExists = (p) => fs.existsSync(p);
// Safe normalize
const normalizePort = (info) => String(info.path ?? info.comName ?? '').toUpperCase();

app.get('/status', async (req, res) => {
  const device = String(req.query.device ?? '').toUpperCase() || 'COM7';
  try {
    const ports = await SerialPort.list();
    const connected = ports.some(p => normalizePort(p) === device);
    res.json({ connected });
  } catch (e) {
    console.error('Status error:', e);
    res.status(500).json({ error: 'Failed to check device status' });
  }
});

app.get('/start', async (req, res) => {
  const device = String(req.query.device ?? '').toUpperCase();
  const model = String(req.query.model ?? '').toLowerCase();
  if (!['rf', 'bilstm'].includes(model)) {
    return res.status(400).json({ error: "Model must be 'rf' or 'bilstm'" });
  }

  try {
    const ports = await SerialPort.list();
    if (!ports.some(p => normalizePort(p) === device)) {
      return res.status(400).json({ error: `Device ${device} not connected` });
    }

    const script = model === 'rf' ? 'predict_rf.py' : 'predict_sign.py';
    const scriptPath = path.join(__dirname, script);
    if (!scriptExists(scriptPath)) {
      return res.status(500).json({ error: `Script not found: ${scriptPath}` });
    }

    const { stdout, stderr } = await execFile(PYTHON, [scriptPath, device], { maxBuffer: 1024 * 1024 });
    if (stderr) console.error(`Python stderr:`, stderr);
    const lines = stdout.trim().split(/\r?\n/);
    const result = lines[lines.length - 1] || 'No output';
    console.log(`Prediction [${model}]:`, result);
    res.json({ result });
  } catch (e) {
    console.error('Prediction error:', e);
    res.status(500).json({ error: 'Failed to run prediction' });
  }
});

app.listen(PORT, () => console.log(`Server listening: http://localhost:${PORT}`));