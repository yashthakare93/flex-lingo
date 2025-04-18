import React, { useState, useEffect } from 'react';

function Home() {
  const [prediction, setPrediction] = useState("Waiting...");
  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("Initializing...");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPost, setSelectedPost] = useState("com7"); // Default to "com7"

  const defaultImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9jrYR3x8qxk7lY9M_3Klu8kcohdUueG8HNQ&s";
  const hiImage = "https://images.squarespace-cdn.com/content/v1/579e10251b631bd12f08bf15/1516153745267-E7Q8SL6NHE8RLDYKEHC5/Early+language+parent+handouts+sign+language+hi.png";

  const startPrediction = async () => {
    setError("");
    setIsRunning(true);
    setPrediction("Waiting...");

    try {
      const res = await fetch(`http://localhost:5001/start?device=${selectedPost}`); // Pass the selected post/device
      const data = await res.json();

      if (data.status === "Prediction started" && data.result) {
        const result = data.result.trim().toLowerCase();
        setPrediction(result || "Unknown");
        setImage(result === "hi" ? hiImage : defaultImage);
      } else {
        setPrediction("Unknown");
        setImage(defaultImage);
        setError(data.error || "Device not connected or no result.");
      }
    } catch (err) {
      console.error(err);
      setError("Error starting prediction.");
      setPrediction("Error");
      setImage(defaultImage);
    } finally {
      setIsRunning(false);
    }
  };

  const checkDeviceConnection = async () => {
    try {
      const res = await fetch("http://localhost:5001/status");
      const data = await res.json();
      setDeviceStatus(data.connected ? "Device is ready to predict." : "Please connect the device.");
    } catch (err) {
      console.error(err);
      setError("Failed to communicate with backend");
      setDeviceStatus("Connection error");
    }
  };

  useEffect(() => {
    checkDeviceConnection();
    const interval = setInterval(checkDeviceConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 lg:p-4">

        {/* Left Panel */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 flex flex-col h-full">
          <div className="mb-2 lg:mb-4 flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Flex-Lingo
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Real-time Sign Language Detection</p>
          </div>

          <div className="relative group mb-2 lg:mb-4 flex-grow" style={{ maxHeight: '40vh' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative h-full w-full rounded-lg bg-gray-100 overflow-hidden border-4 border-white shadow-md">
              <img 
                src={image || defaultImage} 
                alt="Prediction display" 
                className="w-full h-full object-contain transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <span className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                  {prediction === "hi" ? "👋" : "..." }
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:space-y-3 flex-shrink-0">
            <div className="bg-indigo-50 p-2 lg:p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs lg:text-sm font-semibold text-indigo-800">System Status</h3>
                <div className={`w-2 h-2 rounded-full ${deviceStatus.includes("ready") ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
              </div>
              <p className="text-xs text-gray-600 font-medium truncate">{deviceStatus}</p>
            </div>

            <div className="bg-white border border-gray-200 p-2 lg:p-3 rounded-lg shadow-sm">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-800">Current Prediction</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg lg:text-xl font-bold text-indigo-600">
                  {prediction === "Waiting..." ? (
                    <span className="text-gray-400">Processing...</span>
                  ) : (
                    prediction.toUpperCase()
                  )}
                </span>
                {prediction === "Waiting..." && (
                  <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-2 rounded-md border border-red-200 flex items-center">
                <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <span className="text-xs lg:text-sm text-red-600 font-medium truncate">{error}</span>
              </div>
            )}

            <button
              onClick={startPrediction}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold w-full py-2 rounded-lg transition duration-300 disabled:opacity-50"
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Start Prediction"}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 flex flex-col h-full">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-3">How it Works</h2>
          <p className="text-sm text-gray-600">
            Click "Start Prediction" to begin real-time gesture recognition using your Arduino sensor setup. The system reads sensor values, processes them using a trained model, and displays the interpreted sign language result.
          </p>

          {/* Dropdown for selecting device */}
          <div className="mt-4">
            <select
              value={selectedPost}
              onChange={(e) => setSelectedPost(e.target.value)}
              className="border p-2 rounded-md w-full"
            >
              <option value="com7">COM 7</option>
              <option value="com8">COM 8</option>
              <option value="com9">COM 9</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
