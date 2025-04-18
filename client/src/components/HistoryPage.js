import React, { useState, useEffect } from 'react';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    // Fetch history from your backend or localStorage here
    setHistory([
      { time: '10:00 AM', result: 'Hello' },
      { time: '10:05 AM', result: 'Goodbye' }
    ]);
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Prediction History</h2>
      <ul className="list-unstyled">
        {history.map((item, index) => (
          <li key={index} className="h6">
            {item.time}: <strong>{item.result}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryPage;
