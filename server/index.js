const express = require('express');
const cors = require('cors');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { execFile } = require('child_process');  
const os = require('os');

// Promisified execFile
const execFilePromisified = util.promisify(execFile);  // Assign a different name if you need to promisify

const PYTHON = process.env.PYTHON_PATH || 'python'; // Use python3 if defined in .env
const PORT = process.env.PORT || 5001;  // Use 5001 if PORT is not set in .env
const app = express();

app.use(cors());

// Check if file exists
const scriptExists = (p) => fs.existsSync(p);

// Safe normalize port
const normalizePort = (info) => String(info.path ?? info.comName ?? '').toUpperCase();

// Status Route to check if device is connected
app.get('/status', async (req, res) => {
  const device = String(req.query.device || 'COM7').toUpperCase();
  
  try {
    const ports = await SerialPort.list();
    const connected = ports.some((port) => normalizePort(port) === device);

    // If you're on a non-Linux system, handle gracefully
    if (os.platform() !== 'linux') {
      console.warn('Non-Linux system detected. Skipping Linux-specific checks.');
    }

    res.json({ connected });
  } catch (err) {
    console.error('Error checking status:', err);
    res.status(500).json({ error: 'Failed to check device status' });
  }
});

// Start Route to run prediction
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

    const { stdout, stderr } = await execFilePromisified(PYTHON, [scriptPath, device], { maxBuffer: 1024 * 1024 });
    
    // Log output
    console.log('Python stdout:', stdout);
    console.error('Python stderr:', stderr);

    if (stderr) {
      console.error(`Python stderr:`, stderr);
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

// Start the server
app.listen(PORT, () => console.log(`Server listening on https://flex-lingo-server.onrender.com`));
