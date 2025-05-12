import React, { useState, useEffect } from 'react';

const DEFAULT_IMAGE = '/flex.jpeg';

export default function Home() {
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Checking...');
  const [selectedModel, setSelectedModel] = useState(''); // Default state for model selection
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Steps for the tutorial section
  const steps = [
    {
      icon: '👋',
      title: 'Step 1: Connect the device',
      text: 'Ensure that your device is connected and ready for use.',
    },
    {
      icon: '🔍',
      title: 'Step 2: Select a model',
      text: 'Choose between the Random Forest or BiLSTM model for predictions.',
    },
    {
      icon: '⚡',
      title: 'Step 3: Start Prediction',
      text: 'Click the "Start Real-time Prediction" button to begin.',
    },
  ];

  const speakPrediction = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
  };

  const checkDeviceConnection = async () => {
    try {
      const res = await fetch('https://flex-lingo-server.onrender.com/status?device=COM7');
      const { connected } = await res.json();
      setDeviceStatus(connected ? 'Device READY' : 'Please connect device');
    } catch (err) {
      console.error('Status check error:', err);
      setDeviceStatus('Connection error');
    }
  };

  useEffect(() => {
    checkDeviceConnection();
    const id = setInterval(checkDeviceConnection, 5000);
    return () => clearInterval(id);
  }, []);

  const startPrediction = async () => {
    if (!selectedModel) return;
    setError('');
    setIsPredicting(true);
    setPrediction('');

    try {
      const res = await fetch(`https://flex-lingo-server.onrender.com/start?device=COM7&model=${selectedModel}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      setPrediction(data.result);
      speakPrediction(data.result);
      setPredictionHistory(prev => [
        { model: selectedModel, result: data.result, timestamp: new Date() },
        ...prev,
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <header className="text-center space-y-2">
            <div className="inline-block relative">
              {/* Decorative shape */}
              <div className="absolute -inset-4 bg-blue-100/30 blur-xl rounded-full" />
              {/* Main title with gradient */}
              <h1 className="text-3xl md:text-3xl font-bold bg-clip-text text-black relative">
                FlexLingo : Sign Language Translation
              </h1>
            </div>
          </header>

          {/* Visualization Section */}
          <div className="relative group">
            <div className="w-full overflow-hidden transition-all duration-300 hover:border-blue-300">
              <img
                src={DEFAULT_IMAGE}
                alt="Sign Language Visualization"
                className="w-full h-full object-contain p-4"
              />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
              {prediction || 'Waiting for input...'}
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl transition-colors ${deviceStatus === 'Device READY' ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${deviceStatus === 'Device READY' ? 'bg-green-600' : 'bg-red-600'}`} />
                <div>
                  <p className="text-xs font-medium text-gray-500">Device Status</p>
                  <p className="text-sm font-semibold">{deviceStatus}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Active Model</p>
                  <p className="text-sm font-semibold">
                    {selectedModel ? selectedModel.toUpperCase() : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Model</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedModel('rf')}
                className={`p-4 rounded-xl transition-all ${selectedModel === 'rf' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <span className="block text-sm font-medium">Random Forest</span>
                <span className="block text-xs opacity-75 mt-1">Classic ML Model</span>
              </button>

              <button
                onClick={() => setSelectedModel('bilstm')}
                className={`p-4 rounded-xl transition-all ${selectedModel === 'bilstm' ? 'bg-purple-600 text-white ring-2 ring-purple-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <span className="block text-sm font-medium">BiLSTM</span>
                <span className="block text-xs opacity-75 mt-1">Deep Learning Model</span>
              </button>
            </div>
          </div>

          {/* Prediction Controls */}
          {selectedModel && (
            <button
              onClick={startPrediction}
              disabled={isPredicting}
              className="w-full py-3.5 px-6 bg-cyan-400 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500"
            >
              {isPredicting ? 'Predicting...' : 'Start Prediction'}
            </button>
          )}

          {/* Error/Loading Status */}
          {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
        </div>

        {/* Prediction History */}
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Prediction History</h2>
          <ul className="space-y-4">
            {predictionHistory.length ? (
              predictionHistory.map(({ model, result, timestamp }, idx) => (
                <li key={idx} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{model.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{result}</p>
                </li>
              ))
            ) : (
              <p>No predictions made yet</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
