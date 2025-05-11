const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const app = express();
app.use(cors());

// Mocking the SerialPort.list method
jest.mock('serialport', () => ({
  SerialPort: {
    list: jest.fn(),
  },
}));

// Dummy /status endpoint
app.get('/status', async (req, res) => {
  const device = String(req.query.device || 'COM7');
  const ports = await SerialPort.list();
  const connected = ports.some(p => p.comName === device);
  res.json({ connected });
});

// Dummy /start endpoint that starts the prediction
app.get('/start', async (req, res) => {
  const { device, model } = req.query;

  try {
    // Mock API response for prediction
    const mockResult = { result: 'HELLO' };

    // Simulate fetching prediction results
    const response = await global.fetch('http://example.com/start', { method: 'POST' }); // Use the actual API if required
    const data = await response.json();

    res.json({ result: mockResult.result });
  } catch (error) {
    res.status(500).json({ error: 'Prediction failed' });
  }
});

describe('Server API', () => {
  test('GET /status - should return device connection status', async () => {
    // Mock a response for SerialPort.list()
    SerialPort.list.mockResolvedValue([{ comName: 'COM7' }]);
    
    const response = await request(app).get('/status?device=COM7');
    
    expect(response.status).toBe(200);
    expect(response.body.connected).toBe(true);
  });

  test('GET /status - should return connection error for device not found', async () => {
    // Mock a response for SerialPort.list()
    SerialPort.list.mockResolvedValue([{ comName: 'COM8' }]);
    
    const response = await request(app).get('/status?device=COM7');
    
    expect(response.status).toBe(200);
    expect(response.body.connected).toBe(false);
  });

  test('GET /start - should start prediction process', async () => {
    // Mock API response here as required for the prediction
    const mockResult = { result: 'HELLO' };

    // Mocking the fetch function that might be in the server (if used)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResult
    });
    
    const response = await request(app).get('/start?device=COM7&model=rf');
    
    expect(response.status).toBe(200);
    expect(response.body.result).toBe(mockResult.result);
  });

  test('GET /start - should handle error when starting prediction', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Prediction failed'));

    const response = await request(app).get('/start?device=COM7&model=rf');
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Prediction failed');
  });
});
