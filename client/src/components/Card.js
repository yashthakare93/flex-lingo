import React from 'react';

const Card = ({ title, description }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-2xl transition">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default Card;
