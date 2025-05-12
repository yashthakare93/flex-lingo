const express = require('express');
const cors = require('cors');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;
const PYTHON = process.env.PYTHON_PATH || 'python';

// Promisify execFile for async/await usage
const execFileAsync = util.promisify(execFile);

app.use(cors());

// Utility: Check if a file exists
const scriptExists = (filePath) => fs.existsSync(filePath);

// Utility: Normalize serial port name to compare
const normalizePort = (portInfo) => String(portInfo.path || portInfo.comName || '').toUpperCase();

/**
 * GET /status?device=COM7
 * Checks if the device is connected
 */
app.get('/status', async (req, res) => {
  const device = String(req.query.device || 'COM7').toUpperCase();
  try {
    const ports = await SerialPort.list();
    const connected = ports.some((port) => normalizePort(port) === device);
    res.json({ connected });
  } catch (err) {
    console.error('Error checking status:', err);
    res.status(500).json({ error: 'Failed to check device status' });
  }
});

/**
 * GET /start?device=COM7&model=rf
 * Starts prediction using specified model
 */
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
    const ports = await SerialPort.list();
    const isConnected = ports.some((port) => normalizePort(port) === device);

    if (!isConnected) {
      return res.status(400).json({ error: `Device ${device} not connected` });
    }

    const { stdout, stderr } = await execFileAsync(PYTHON, [scriptPath, device], { maxBuffer: 1024 * 1024 });

    if (stderr) {
      console.warn('Python stderr:', stderr);
    }

    const lines = stdout.trim().split(/\r?\n/);
    const result = lines[lines.length - 1] || 'No output';

    console.log(`Prediction [${model}]: ${result}`);
    res.json({ result });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Failed to run prediction script' });
  }
});

// Serve static files from React build (production)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build')));

//   // Handle all other routes by returning the React app's index.html
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
