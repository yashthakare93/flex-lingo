import React from 'react';

const PredictionHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-center text-gray-500">No history available.</div>;
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">Prediction: {item.prediction}</p>
          <p className="text-sm text-gray-500">Date: {item.date}</p>
        </div>
      ))}
    </div>
  );
};

export default PredictionHistory;
