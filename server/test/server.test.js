const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

// Mocking SerialPort list method to simulate a device being connected
jest.mock('serialport', () => {
  return {
    SerialPort: {
      list: jest.fn(() => [
        { comName: 'COM7', manufacturer: 'Arduino' },
      ]),
    },
  };
});

const app = express();

app.use(cors());

app.get('/status', async (req, res) => {
  const device = String(req.query.device ?? '').toUpperCase() || 'COM7';
  try {
    const ports = await SerialPort.list();
    const connected = ports.some(p => p.comName.toUpperCase() === device);
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
    if (!ports.some(p => p.comName.toUpperCase() === device)) {
      return res.status(400).json({ error: `Device ${device} not connected` });
    }

    // Simulating Python script response
    const result = `Prediction result for model ${model} with device ${device}`;
    res.json({ result });
  } catch (e) {
    console.error('Prediction error:', e);
    res.status(500).json({ error: 'Failed to run prediction' });
  }
});

describe('Express Server', () => {
  it('should return device connection status', async () => {
    const res = await request(app).get('/status?device=COM7');
    expect(res.status).toBe(200);
    expect(res.body.connected).toBe(true);
  });

  it('should return 400 if device is not connected', async () => {
    const res = await request(app).get('/status?device=COM8');
    expect(res.status).toBe(200);
    expect(res.body.connected).toBe(false);
  });

  it('should return prediction for valid model', async () => {
    const res = await request(app).get('/start?device=COM7&model=rf');
    expect(res.status).toBe(200);
    expect(res.body.result).toContain('Prediction result for model rf');
  });

  it('should return error for invalid model', async () => {
    const res = await request(app).get('/start?device=COM7&model=invalid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Model must be 'rf' or 'bilstm'");
  });

  it('should return error for device not connected', async () => {
    const res = await request(app).get('/start?device=COM8&model=rf');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Device COM8 not connected');
  });
});
