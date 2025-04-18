import React from 'react';

const Hero = () => {
  return (
    <section className="bg-blue-900 text-white py-16">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Flex Lingo</h1>
        <p className="text-lg md:text-xl mb-6">
          Learn American Sign Language with ease and practice your skills in a fun, interactive way.
        </p>
        <button className="bg-yellow-500 text-blue-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition">
          Start Learning
        </button>
      </div>
    </section>
  );
};

export default Hero;
