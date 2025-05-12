import React, { useState, useEffect } from 'react';

// Add your image mappings
const PREDICTION_IMAGES = {
  'HI': 'https://example.com/hi-image.jpg',
  'HELLO': 'https://example.com/hello-image.jpg',
};

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
            <div className="w-full  overflow-hidden transition-all duration-300 hover:border-blue-300">
              <img
                src={prediction ? PREDICTION_IMAGES[prediction.toUpperCase()] || DEFAULT_IMAGE : DEFAULT_IMAGE}
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
                className={`p-4 rounded-xl transition-all ${selectedModel === 'rf'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                <span className="block text-sm font-medium">Random Forest</span>
                <span className="block text-xs opacity-75 mt-1">Classic ML Model</span>
              </button>

              <button
                onClick={() => setSelectedModel('bilstm')}
                className={`p-4 rounded-xl transition-all ${selectedModel === 'bilstm'
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
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
              className="w-full py-3.5 px-6 bg-cyan-400 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPredicting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Start Real-time Prediction'
              )}
            </button>
          )}

          {/* Current Prediction */}
          {prediction && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Latest Prediction</p>
                  <p className="text-2xl font-bold text-gray-900">{prediction}</p>
                </div>
                <button
                  onClick={() => speakPrediction(prediction)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.343 9.657L14 2l1.414 1.414-7.657 7.657 7.657 7.657-1.414 1.414-7.657-7.657z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          {/* Tutorial Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <span className="text-2xl p-2">{step.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction History */}
          <div className="bg-white rounded-2xl shadow-xl p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Prediction History</h2>
              <button
                onClick={() => setPredictionHistory([])}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3">
              {predictionHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <span className="text-sm text-gray-500">
                    {new Date(history.timestamp).toLocaleString()}
                  </span>
                  <div>
                    <p className="font-medium">{history.result}</p>
                    <p className="text-xs text-gray-500">{history.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
