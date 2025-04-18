const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const { SerialPort } = require("serialport");

const app = express();
const PORT = 5001;

app.use(cors());

// 1) Check status of a given port (default “COM7”)
app.get("/status", async (req, res) => {
  const device = (req.query.device || "COM7").toUpperCase();
  try {
    const ports = await SerialPort.list();
    const connected = ports.some(p => p.path.toUpperCase() === device);
    res.json({ connected });
  } catch (err) {
    console.error("COM list error:", err);
    res.status(500).json({ error: "Failed to list COM ports" });
  }
});

// 2) Start prediction, passing ?device=COM7
app.get("/start", (req, res) => {
  const device = (req.query.device || "COM7").toUpperCase();

  SerialPort.list()
    .then(ports => {
      if (!ports.some(p => p.path.toUpperCase() === device)) {
        return res.status(400).json({ status: "error", error: `${device} not connected` });
      }

      // Run our Python script with the port as an argument
      execFile(
        "python",
        ["server/predict_sign.py", device],
        { maxBuffer: 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) {
            console.error("Python error:", stderr || err.message);
            return res.status(500).json({ status: "error", error: stderr || err.message });
          }
          // Python prints exactly one line: “<word> HH:MM:SS”
          const result = stdout.trim().split("\n").pop();
          res.json({ status: "Prediction started", result });
        }
      );
    })
    .catch(err => {
      console.error("SerialPort.list fail:", err);
      res.status(500).json({ status: "error", error: "Cannot check COM ports" });
    });
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
